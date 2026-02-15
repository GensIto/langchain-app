import { env } from "cloudflare:workers";

import { CloudflareVectorizeStore, CloudflareWorkersAIEmbeddings } from "@langchain/cloudflare";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { episodes } from "@/db/episodes";
import { logs } from "@/db/logs";
import { episodeTags, tags } from "@/db/tags";
import type { RequiredSession } from "@/lib/auth";
import { createChatLLM } from "@/serverFunction/utils/createLLM";

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

	const llm = createChatLLM("@cf/meta/llama-3.2-1b-instruct");
	const structuredLlm = llm.withStructuredOutput(generateStarResponseSchema);

	const prompt = ChatPromptTemplate.fromMessages([
		[
			"system",
			`あなたは、ログからSTAR形式のエピソードを生成するアシスタントです。
ユーザーが提供するログ内容を分析し、以下のSTAR形式でエピソードを生成してください:
- title: エピソードのタイトル
- impactLevel: プロジェクトに与えた影響レベル (low, medium, high) のいずれか
- situation: エピソードの状況
- task: エピソードのタスク
- action: エピソードのアクション
- result: エピソードの結果`,
		],
		["human", `${log.content}`],
	]);

	const chain = prompt.pipe(structuredLlm);
	const result = await chain.invoke({ logContent: log.content });

	if (!result) {
		throw new Error("Failed to generate episode");
	}

	const parsedResult = generateStarResponseSchema.safeParse(result);

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

	const episodeTagsResult = await getDb()
		.select({ id: tags.id, name: tags.name })
		.from(episodeTags)
		.innerJoin(tags, eq(episodeTags.tagId, tags.id))
		.where(eq(episodeTags.episodeId, episode.id))
		.all();

	await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId: episode.id });

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
