import { env } from "cloudflare:workers";

import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { Document } from "@langchain/core/documents";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { episodes } from "@/db/episodes";
import { createEmbeddings } from "@/serverFunction/utils/createLLM";

export type EpisodeVectorizeMessage = {
	episodeId: string;
};

function buildMarkdown(episode: {
	title: string;
	impactLevel: string;
	situation: string;
	task: string;
	action: string;
	result: string;
}) {
	return [
		`# ${episode.title}`,
		"",
		`**影響度**: ${episode.impactLevel}`,
		"",
		"## Situation",
		episode.situation,
		"",
		"## Task",
		episode.task,
		"",
		"## Action",
		episode.action,
		"",
		"## Result",
		episode.result,
	].join("\n");
}

export async function handleEpisodeVectorizeQueue(batch: MessageBatch<EpisodeVectorizeMessage>) {
	const embeddings = createEmbeddings();
	const vectorStore = new CloudflareVectorizeStore(embeddings, {
		index: env.VECTORIZE_INDEX,
	});
	const db = getDb();

	for (const message of batch.messages) {
		try {
			const episode = await db
				.select()
				.from(episodes)
				.where(eq(episodes.id, message.body.episodeId))
				.get();

			if (!episode) {
				message.ack();
				continue;
			}
			const markdown = buildMarkdown(episode);
			const docsPath = `episodes/${episode.userId}/${episode.id}.md`;
			await env.EPISODE_DOCS_BUCKET.put(docsPath, markdown, {
				httpMetadata: { contentType: "text/markdown" },
			});

			await db.update(episodes).set({ docsPath }).where(eq(episodes.id, episode.id)).run();

			const doc = new Document({
				pageContent: markdown,
				metadata: {
					userId: episode.userId,
					episodeId: episode.id,
					logId: episode.logId,
					impactLevel: episode.impactLevel,
					title: episode.title,
				},
			});
			await vectorStore.addDocuments([doc], { ids: [episode.id] });

			message.ack();
		} catch (error) {
			console.error(`Failed to process episode ${message.body.episodeId}:`, error);
			message.retry();
		}
	}
}
