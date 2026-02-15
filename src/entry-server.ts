import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

import { setupLogger } from "@/lib/logger";
import {
	handleEpisodeVectorizeQueue,
	type EpisodeVectorizeMessage,
} from "@/queue/episodeVectorize";

await setupLogger();

const fetch = createStartHandler(defaultStreamHandler);

export default {
	fetch,
	async queue(batch: MessageBatch<EpisodeVectorizeMessage>, _env: Env, _ctx: ExecutionContext) {
		await handleEpisodeVectorizeQueue(batch);
	},
};
