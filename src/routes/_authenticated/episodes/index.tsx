import { createFileRoute } from "@tanstack/react-router";

import { EpisodeList } from "@/components/episodes/EpisodeList/EpisodeList";
import { getEpisodes } from "@/serverFunction/episode/episode.functions";

export const Route = createFileRoute("/_authenticated/episodes/")({
	component: Episodes,
	loader: async () => {
		const episodes = await getEpisodes();
		return { episodes };
	},
});

function Episodes() {
	const { episodes } = Route.useLoaderData();

	return <EpisodeList episodes={episodes} />;
}
