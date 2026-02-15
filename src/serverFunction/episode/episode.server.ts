import { env } from "cloudflare:workers";

import { CloudflareVectorizeStore, CloudflareWorkersAIEmbeddings } from "@langchain/cloudflare";
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
	const log = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.logId), eq(logs.userId, session.user.id)))
		.get();

	if (!log) {
		throw new Error("Log not found");
	}

	// ChatCloudflareWorkersAI (LangChain) は bindTools() 未実装のため withStructuredOutput() が使えない
	// https://docs.langchain.com/oss/javascript/integrations/chat/cloudflare_workersai
	const response = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
		messages: [
			{
				role: "system",
				content: `あなたは、ログからSTAR形式のエピソードを生成するアシスタントです。
ユーザーが提供するログ内容を分析し、STAR形式でエピソードを生成してください。
すべてのフィールドの値は必ず日本語で記述してください。英語は使わないでください。`,
			},
			{
				role: "user",
				content: log.content,
			},
		],
		response_format: {
			type: "json_schema",
			json_schema: {
				type: "object",
				properties: {
					title: { type: "string", description: "エピソードのタイトル（日本語）" },
					impactLevel: { type: "string", enum: ["low", "medium", "high"], description: "影響度" },
					situation: { type: "string", description: "状況の説明（日本語）" },
					task: { type: "string", description: "課題・目標の説明（日本語）" },
					action: { type: "string", description: "取った行動の説明（日本語）" },
					result: { type: "string", description: "結果・成果の説明（日本語）" },
				},
				required: ["title", "impactLevel", "situation", "task", "action", "result"],
			},
		},
	});

	const parsedResult = generateStarResponseSchema.safeParse(response.response);

	if (!parsedResult.success) {
		throw new Error("Failed to generate episode");
	}

	return parsedResult.data;
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
	await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId: episode.id });

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

	let checkedTags: { id: string; name: string }[] = [];
	if (data.tagIds) {
		// 既存のタグ関連を削除
		await getDb().delete(episodeTags).where(eq(episodeTags.episodeId, episode.id)).run();

		if (data.tagIds.length > 0) {
			// 新しいタグの存在・所有権を検証
			const tagsResult = await getDb()
				.select({ id: tags.id, name: tags.name })
				.from(tags)
				.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
				.all();
			if (tagsResult.length !== data.tagIds.length) {
				throw new Error("Tags not found");
			}
			checkedTags = tagsResult;

			// 新しいタグ関連を挿入
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
	} else {
		// tagIds が渡されなかった場合は既存のタグを返す
		checkedTags = await getDb()
			.select({ id: tags.id, name: tags.name })
			.from(episodeTags)
			.innerJoin(tags, eq(episodeTags.tagId, tags.id))
			.where(eq(episodeTags.episodeId, episode.id))
			.all();
	}

	await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId: episode.id });

	return { ...episode, tags: checkedTags };
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

	// R2 + Vectorize からも削除
	if (existing.docsPath) {
		await env.EPISODE_DOCS_BUCKET.delete(existing.docsPath);
	}
	const embeddings = new CloudflareWorkersAIEmbeddings({
		binding: env.AI,
		model: "@cf/google/embeddinggemma-300m",
	});
	const vectorStore = new CloudflareVectorizeStore(embeddings, {
		index: env.VECTORIZE_INDEX,
	});
	await vectorStore.delete({ ids: [data.id] });
}
