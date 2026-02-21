import { env } from "cloudflare:workers";

import { CloudflareVectorizeStore, CloudflareWorkersAIEmbeddings } from "@langchain/cloudflare";
import { getLogger } from "@logtape/logtape";
import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { episodes } from "@/db/episodes";
import { logs } from "@/db/logs";
import { episodeTags, tags } from "@/db/tags";
import type { RequiredSession } from "@/lib/auth";
import { createEmbeddings } from "@/serverFunction/utils/createLLM";

import {
	generateStarResponseSchema,
	type CreateEpisodeInput,
	type DeleteEpisodeInput,
	type EpisodeVectorMetadata,
	type GenerateEpisodeInput,
	type GetEpisodeInput,
	type SearchEpisodesInput,
	type UpdateEpisodeInput,
} from "./schemas";

import type { DocumentInterface } from "@langchain/core/documents";

const logger = getLogger(["app", "episode"]);

export async function retrieveEpisodes(data: SearchEpisodesInput, session: RequiredSession) {
	logger.info("Retrieving episodes for query: {query}", {
		query: data.query,
		userId: session.user.id,
	});

	const embeddings = createEmbeddings();
	const vectorStore = new CloudflareVectorizeStore(embeddings, {
		index: env.VECTORIZE_INDEX,
	});

	const results = await vectorStore.similaritySearchWithScore(data.query, 5);

	logger.info("vector search results with scores: {results}", {
		results: results.map(([doc, score]) => ({
			score,
			metadata: doc.metadata,
			content: doc.pageContent,
		})),
	});

	// その後の処理でスコアも含めて扱う場合
	const typedResults = results.map(([doc, score]) => ({
		doc: doc as DocumentInterface<EpisodeVectorMetadata>,
		score,
	}));

	const episodeIds = typedResults.map((r) => r.doc.metadata.episodeId).filter(Boolean);

	if (episodeIds.length === 0) {
		logger.info("No episodes found for query");
		return [];
	}
	logger.info("episodeIds: {episodeIds}", { episodeIds });

	const dbEpisodes = await getDb().query.episodes.findMany({
		where: and(inArray(episodes.id, episodeIds), eq(episodes.userId, session.user.id)),
		with: {
			episodeTags: {
				with: { tag: true },
			},
		},
	});

	// スコアマップを作成
	const scoreMap = new Map(typedResults.map((r) => [r.doc.metadata.episodeId, r.score]));

	// ベクトル検索のスコア順を維持
	const episodeMap = new Map(dbEpisodes.map((e) => [e.id, e]));
	const sortedEpisodes = episodeIds.flatMap((id) => {
		const e = episodeMap.get(id);
		const score = scoreMap.get(id);
		return e ? [{ ...e, score }] : [];
	});

	logger.info("Retrieved {count} episodes", { count: sortedEpisodes.length });

	return sortedEpisodes.map(({ episodeTags: eTags, score, ...episode }) => ({
		...episode,
		tags: eTags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
		score,
	}));
}

export async function getAllEpisodes(session: RequiredSession) {
	logger.info("Fetching all episodes for user {userId}", { userId: session.user.id });

	const result = await getDb().query.episodes.findMany({
		where: eq(episodes.userId, session.user.id),
		with: {
			episodeTags: {
				with: { tag: true },
			},
		},
	});

	logger.info("Fetched {count} episodes", { count: result.length });

	return result.map(({ episodeTags, ...episode }) => ({
		...episode,
		tags: episodeTags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
		score: undefined, // 検索結果ではないためundefined
	}));
}

export async function getEpisodeById(data: GetEpisodeInput, session: RequiredSession) {
	logger.info("Fetching episode {episodeId}", { episodeId: data.id, userId: session.user.id });

	const result = await getDb().query.episodes.findFirst({
		where: and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)),
		with: {
			episodeTags: {
				with: { tag: true },
			},
		},
	});

	if (!result) {
		logger.warn("Episode not found: {episodeId}", { episodeId: data.id });
		throw new Error("Episode not found");
	}

	const { episodeTags, ...episode } = result;

	return {
		...episode,
		tags: episodeTags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
	};
}

export async function generateEpisode(data: GenerateEpisodeInput, session: RequiredSession) {
	logger.info("Generating episode from log {logId}", {
		logId: data.logId,
		userId: session.user.id,
	});

	const log = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.logId), eq(logs.userId, session.user.id)))
		.get();

	if (!log) {
		logger.warn("Log not found for episode generation: {logId}", { logId: data.logId });
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
		logger.error("Failed to parse AI response for log {logId}: {error}", {
			logId: data.logId,
			error: parsedResult.error.message,
		});
		throw new Error("Failed to generate episode");
	}

	logger.info("Episode generated from log {logId}", { logId: data.logId });
	return parsedResult.data;
}

export async function createEpisode(data: CreateEpisodeInput, session: RequiredSession) {
	logger.info("Creating episode for log {logId}", { logId: data.logId, userId: session.user.id });

	const log = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.logId), eq(logs.userId, session.user.id)))
		.get();

	if (!log) {
		logger.warn("Log not found: {logId}", { logId: data.logId });
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
			logger.warn("Some tags not found for episode creation", { tagIds: data.tagIds });
			throw new Error("Tags not found");
		}
		checkedTags = tagsResult;
	}

	const episodeId = crypto.randomUUID();
	const now = new Date();

	const db = getDb();
	const batchQueries = [
		db
			.insert(episodes)
			.values({
				id: episodeId,
				userId: session.user.id,
				logId: log.id,
				title: data.title,
				impactLevel: data.impactLevel,
				situation: data.situation,
				task: data.task,
				action: data.action,
				result: data.result,
				createdAt: now,
				updatedAt: now,
			})
			.returning(),
		...(data.tagIds && data.tagIds.length > 0
			? [
					db.insert(episodeTags).values(
						data.tagIds.map((tagId) => ({
							id: crypto.randomUUID(),
							episodeId,
							tagId,
							createdAt: now,
						})),
					),
				]
			: []),
	] as const;

	const result = await db.batch(batchQueries);
	const episode = result[0][0];

	await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId });

	logger.info("Episode created: {episodeId}", { episodeId });

	return { ...episode, tags: checkedTags };
}

export async function updateExistingEpisode(data: UpdateEpisodeInput, session: RequiredSession) {
	logger.info("Updating episode {episodeId}", { episodeId: data.id, userId: session.user.id });

	const existing = await getDb()
		.select()
		.from(episodes)
		.where(and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)))
		.get();

	if (!existing) {
		logger.warn("Episode not found for update: {episodeId}", { episodeId: data.id });
		throw new Error("Episode not found");
	}

	let checkedTags: { id: string; name: string }[] = [];

	if (data.tagIds) {
		if (data.tagIds.length > 0) {
			const tagsResult = await getDb()
				.select({ id: tags.id, name: tags.name })
				.from(tags)
				.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
				.all();
			if (tagsResult.length !== data.tagIds.length) {
				logger.warn("Some tags not found for episode update", { tagIds: data.tagIds });
				throw new Error("Tags not found");
			}
			checkedTags = tagsResult;
		}

		const db = getDb();
		const batchQueries = [
			db
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
				.returning(),
			db.delete(episodeTags).where(eq(episodeTags.episodeId, data.id)),
			...(data.tagIds.length > 0
				? [
						db.insert(episodeTags).values(
							data.tagIds.map((tagId) => ({
								id: crypto.randomUUID(),
								episodeId: data.id,
								tagId,
								createdAt: new Date(),
							})),
						),
					]
				: []),
		] as const;

		const result = await db.batch(batchQueries);
		const episode = result[0][0];

		await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId: data.id });

		logger.info("Episode updated with tags: {episodeId}", { episodeId: data.id });

		return { ...episode, tags: checkedTags };
	}

	// tagIds が渡されなかった場合はタグ操作なし
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

	checkedTags = await getDb()
		.select({ id: tags.id, name: tags.name })
		.from(episodeTags)
		.innerJoin(tags, eq(episodeTags.tagId, tags.id))
		.where(eq(episodeTags.episodeId, episode.id))
		.all();

	await env.EPISODE_VECTORIZE_QUEUE.send({ episodeId: data.id });

	logger.info("Episode updated: {episodeId}", { episodeId: data.id });

	return { ...episode, tags: checkedTags };
}

export async function removeEpisode(data: DeleteEpisodeInput, session: RequiredSession) {
	logger.info("Removing episode {episodeId}", { episodeId: data.id, userId: session.user.id });

	const existing = await getDb()
		.select()
		.from(episodes)
		.where(and(eq(episodes.id, data.id), eq(episodes.userId, session.user.id)))
		.get();

	if (!existing) {
		logger.warn("Episode not found for removal: {episodeId}", { episodeId: data.id });
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

	logger.info("Episode removed: {episodeId}", { episodeId: data.id });
}
