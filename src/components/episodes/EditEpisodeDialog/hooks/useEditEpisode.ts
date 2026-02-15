import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createTag } from "@/serverFunction/log/log.functions";
import { updateEpisode } from "@/serverFunction/episode/episode.functions";

import type { EpisodeWithTags } from "../../types";

export function useEditEpisode(episode: EpisodeWithTags | null, onClose: () => void) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			title: episode?.title ?? "",
			impactLevel: episode?.impactLevel ?? ("medium" as const),
			situation: episode?.situation ?? "",
			task: episode?.task ?? "",
			action: episode?.action ?? "",
			result: episode?.result ?? "",
			tagIds: episode?.tags.map((t) => t.id) ?? ([] as string[]),
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1),
				impactLevel: z.enum(["low", "medium", "high"]),
				situation: z.string().min(1),
				task: z.string().min(1),
				action: z.string().min(1),
				result: z.string().min(1),
				tagIds: z.array(z.string()),
			}),
		},
		onSubmit: async ({ value }) => {
			if (!episode) return;
			try {
				await updateEpisode({
					data: { id: episode.id, ...value },
				});
				toast.success("エピソードを更新しました");
				onClose();
				void router.invalidate();
			} catch (error) {
				toast.error("エピソードの更新に失敗しました");
				console.error(error);
			}
		},
	});

	const handleCreateTag = async (name: string) => {
		try {
			await createTag({ data: { name } });
			toast.success("タグを作成しました");
			void router.invalidate();
		} catch (error) {
			toast.error("タグの作成に失敗しました");
			console.error(error);
		}
	};

	return { form, handleCreateTag };
}
