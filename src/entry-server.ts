import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

import {
	handleEpisodeVectorizeQueue,
	type EpisodeVectorizeMessage,
} from "@/queue/episodeVectorize";

const fetch = createStartHandler(defaultStreamHandler);

export default {
	fetch,
	async queue(batch: MessageBatch<EpisodeVectorizeMessage>, _env: Env, _ctx: ExecutionContext) {
		await handleEpisodeVectorizeQueue(batch);
	},
};
