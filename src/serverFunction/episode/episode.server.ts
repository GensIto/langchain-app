import { env } from "cloudflare:workers";

import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { episodes } from "@/db/episodes";
import { logs } from "@/db/logs";
import { episodeTags, tags } from "@/db/tags";
import type { RequiredSession } from "@/lib/auth";

import {
	generateStarResponseSchema,
	type CreateEpisodeInput,
	type DeleteEpisodeInput,
	type GenerateEpisodeInput,
	type GetEpisodeInput,
	type UpdateEpisodeInput,
} from "./schemas";

export async function getAllEpisodes(session: RequiredSession) {
	const result = await getDb().query.episodes.findMany({
		where: eq(episodes.userId, session.user.id),
		with: {
			episodeTags: {
				with: { tag: true },
			},
		},
	});

	return result.map(({ episodeTags, ...episode }) => ({
		...episode,
		tags: episodeTags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
	}));
}

export async function getEpisodeById(data: GetEpisodeInput, session: RequiredSession) {
	const result = await getDb().query.episodes.findFirst({
		where: and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)),
		with: {
			episodeTags: {
				with: { tag: true },
			},
		},
	});

	if (!result) {
		throw new Error("Episode not found");
	}

	const { episodeTags, ...episode } = result;

	return {
		...episode,
		tags: episodeTags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
	};
}

export async function generateEpisode(data: GenerateEpisodeInput, session: RequiredSession) {
	// TODO: ログからSTAR形式のエピソードをAI生成
	const log = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.logId), eq(logs.userId, session.user.id)))
		.get();

	if (!log) {
		throw new Error("Log not found");
	}

	//TODO 悪意のあるプロンプトで影響受けちゃう&langchainで実装する
	const res = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
		content: log.content,
		prompt: `
		あなたは、ログからSTAR形式のエピソードを生成する親切なアシスタントです。
		このログは、ユーザーとアシスタント間の会話です。
		ユーザーはログからSTAR形式のエピソード作成を依頼しています。
		アシスタントはログ内容からSTAR形式のエピソードを生成します。
		生成するエピソードは以下の形式で出力してください:
		- title: エピソードのタイトル
		- impactLevel: エピソードのプロジェクトに与えた影響レベル (low, medium, high) のいずれか
		- situation: エピソードの状況
		- task: エピソードのタスク
		- action: エピソードのアクション
		- result: エピソードの結果

		ログ内容:
		${log.content}
		`,
		response_format: {
			type: "json_schema",
			json_schema: {
				name: "STARFormatEpisode",
				schema: {
					type: "object",
					properties: {
						title: { type: "string" },
						impactLevel: { type: "string" },
						situation: { type: "string" },
						task: { type: "string" },
						action: { type: "string" },
						result: { type: "string" },
					},
				},
			},
		},
	});

	if (!res) {
		throw new Error("Failed to generate episode");
	}

	const response = generateStarResponseSchema.safeParse(res.response);

	if (!response.success) {
		throw new Error("Failed to generate episode");
	}

	return response.data;
}

export async function createEpisode(data: CreateEpisodeInput, session: RequiredSession) {
	const log = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.logId), eq(logs.userId, session.user.id)))
		.get();

	if (!log) {
		throw new Error("Log not found");
	}

	let checkedTags: { id: string; name: string }[] = [];
	if (data.tagIds && data.tagIds.length > 0) {
		const tagsResult = await getDb()
			.select({ id: tags.id, name: tags.name })
			.from(tags)
			.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
			.all();
		if (tagsResult.length !== data.tagIds.length) {
			throw new Error("Tags not found");
		}
		checkedTags = tagsResult;
	}

	const episode = await getDb()
		.insert(episodes)
		.values({
			id: crypto.randomUUID(),
			userId: session.user.id,
			logId: log.id,
			title: data.title,
			impactLevel: data.impactLevel,
			situation: data.situation,
			task: data.task,
			action: data.action,
			result: data.result,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();

	if (data.tagIds && data.tagIds.length > 0) {
		await getDb()
			.insert(episodeTags)
			.values(
				data.tagIds.map((tagId) => ({
					id: crypto.randomUUID(),
					episodeId: episode.id,
					tagId,
					createdAt: new Date(),
				})),
			)
			.run();
	}
	//TODO Qでchunk&ベクター化

	return { ...episode, tags: checkedTags };
}

export async function updateExistingEpisode(data: UpdateEpisodeInput, session: RequiredSession) {
	const existing = await getDb()
		.select()
		.from(episodes)
		.where(and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)))
		.get();

	if (!existing) {
		throw new Error("Episode not found");
	}

	const episode = await getDb()
		.update(episodes)
		.set({
			title: data.title,
			impactLevel: data.impactLevel,
			situation: data.situation,
			task: data.task,
			action: data.action,
			result: data.result,
			updatedAt: new Date(),
		})
		.where(eq(episodes.id, data.id))
		.returning()
		.get();

	const episodeTagsResult = await getDb()
		.select({ id: tags.id, name: tags.name })
		.from(episodeTags)
		.innerJoin(tags, eq(episodeTags.tagId, tags.id))
		.where(eq(episodeTags.episodeId, episode.id))
		.all();

	return { ...episode, tags: episodeTagsResult };
}

export async function removeEpisode(data: DeleteEpisodeInput, session: RequiredSession) {
	const existing = await getDb()
		.select()
		.from(episodes)
		.where(and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)))
		.get();

	if (!existing) {
		throw new Error("Episode not found");
	}

	await getDb().delete(episodes).where(eq(episodes.id, data.id)).run();
}
