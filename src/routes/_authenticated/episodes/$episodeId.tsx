import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EditEpisodeDialog } from "@/components/episodes/EditEpisodeDialog/EditEpisodeDialog";
import type { EpisodeWithTags } from "@/components/episodes/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteEpisode, getEpisode } from "@/serverFunction/episode/episode.functions";
import { getTags } from "@/serverFunction/log/log.functions";

const impactLevelVariant = {
	high: "destructive",
	medium: "default",
	low: "secondary",
} as const;

const impactLevelLabel = {
	high: "High",
	medium: "Medium",
	low: "Low",
} as const;

export const Route = createFileRoute("/_authenticated/episodes/$episodeId")({
	component: EpisodeDetail,
	loader: async ({ params }) => {
		const [episode, allTags] = await Promise.all([
			getEpisode({ data: { id: params.episodeId } }),
			getTags({ data: {} }),
		]);
		return { episode, allTags };
	},
});

function EpisodeDetail() {
	const { episode, allTags } = Route.useLoaderData();
	const navigate = useNavigate();
	const [editingEpisode, setEditingEpisode] = useState<EpisodeWithTags | null>(null);

	const handleDelete = async () => {
		if (!confirm("このエピソードを削除しますか？")) return;
		try {
			await deleteEpisode({ data: { id: episode.id } });
			toast.success("エピソードを削除しました");
			await navigate({ to: "/episodes" });
		} catch (error) {
			toast.error("エピソードの削除に失敗しました");
			console.error(error);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='mb-6'>
					<Button
						variant='outline'
						onClick={() => void navigate({ to: "/episodes" })}
						className='mb-4'
					>
						← エピソード一覧に戻る
					</Button>
				</div>

				<Card className='mb-6'>
					<CardHeader>
						<div className='flex justify-between items-start mb-4'>
							<div className='flex-1'>
								<CardTitle className='text-2xl mb-2'>{episode.title}</CardTitle>
								<p className='text-sm text-gray-400'>
									作成日: {new Date(episode.createdAt).toLocaleString("ja-JP")}
								</p>
							</div>
							<div className='flex gap-2'>
								<Button variant='outline' onClick={() => setEditingEpisode(episode)}>
									編集
								</Button>
								<Button variant='destructive' onClick={() => void handleDelete()}>
									削除
								</Button>
							</div>
						</div>
						<div className='flex flex-wrap gap-2'>
							<Badge variant={impactLevelVariant[episode.impactLevel]}>
								{impactLevelLabel[episode.impactLevel]}
							</Badge>
							{episode.tags.map((tag: { id: string; name: string }) => (
								<Badge key={tag.id} variant='outline'>
									{tag.name}
								</Badge>
							))}
						</div>
					</CardHeader>
					<CardContent>
						<div className='grid gap-6'>
							{[
								{
									name: "Situation",
									value: episode.situation,
								},
								{
									name: "Task",
									value: episode.task,
								},
								{
									name: "Action",
									value: episode.action,
								},
								{
									name: "Result",
									value: episode.result,
								},
							].map((section) => (
								<section key={section.name}>
									<h3 className='text-lg font-semibold mb-2'>{section.name}</h3>
									<p className='whitespace-pre-wrap'>{section.value}</p>
								</section>
							))}
						</div>
					</CardContent>
				</Card>

				<EditEpisodeDialog
					key={editingEpisode?.id}
					episode={editingEpisode}
					tags={allTags}
					onClose={() => setEditingEpisode(null)}
				/>
			</div>
		</div>
	);
}
