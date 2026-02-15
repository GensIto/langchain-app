import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createTag } from "@/serverFunction/log/log.functions";
import { createNewEpisode } from "@/serverFunction/episode/episode.functions";

import type { z as zod } from "zod";
import type { generateStarResponseSchema } from "@/serverFunction/episode/schemas";

type GeneratedData = zod.infer<typeof generateStarResponseSchema>;

export function useCreateEpisode(logId: string, generatedData: GeneratedData, onSuccess: () => void) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			title: generatedData.title,
			impactLevel: generatedData.impactLevel,
			situation: generatedData.situation,
			task: generatedData.task,
			action: generatedData.action,
			result: generatedData.result,
			tagIds: [] as string[],
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
			try {
				await createNewEpisode({ data: { ...value, logId } });
				toast.success("エピソードを作成しました");
				onSuccess();
				void router.invalidate();
			} catch (error) {
				toast.error("エピソードの作成に失敗しました");
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
