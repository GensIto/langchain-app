import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { EpisodeList } from "@/components/episodes/EpisodeList/EpisodeList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEpisodes, searchEpisodes } from "@/serverFunction/episode/episode.functions";

export const Route = createFileRoute("/_authenticated/episodes/")({
	component: Episodes,
	loader: async () => {
		const episodes = await getEpisodes();
		return { episodes };
	},
});

function Episodes() {
	const { episodes } = Route.useLoaderData();

	const {
		mutate,
		data: searchResults,
		reset,
	} = useMutation({
		mutationFn: ({ query }: { query: string }) => searchEpisodes({ data: { query } }),
		onSuccess: (data) => {
			toast.success("エピソードを検索しました", { description: data.length.toString() });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm({
		defaultValues: {
			query: "",
		},
		validators: {
			onSubmit: z.object({
				query: z.string().min(1),
			}),
		},
		onSubmit: ({ value }) => {
			mutate({ query: value.query });
		},
	});

	const displayEpisodes = searchResults ?? episodes;

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name='query'>
					{(field) => (
						<Input
							type='text'
							name='query'
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className='text-white'
							placeholder='エピソードを検索'
						/>
					)}
				</form.Field>
				<Button type='submit'>検索</Button>
				{searchResults && (
					<Button
						type='button'
						variant='outline'
						onClick={() => {
							form.reset();
							reset();
						}}
					>
						クリア
					</Button>
				)}
			</form>
			<EpisodeList episodes={displayEpisodes} />
		</div>
	);
}
