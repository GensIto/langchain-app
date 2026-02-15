import { env } from "cloudflare:workers";

import { ChatCloudflareWorkersAI, CloudflareWorkersAIEmbeddings } from "@langchain/cloudflare";

export const createChatLLM = (model: keyof AiModels) => {
	return new ChatCloudflareWorkersAI({
		model,
		cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
		cloudflareApiToken: env.CLOUDFLARE_AI_TOKEN,
	});
};

export const createEmbeddings = () => {
	return new CloudflareWorkersAIEmbeddings({
		binding: env.AI,
		model: "@cf/google/embeddinggemma-300m",
	});
};
