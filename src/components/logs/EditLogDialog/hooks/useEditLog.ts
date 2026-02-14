import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createTag, updateLog } from "@/serverFunction/log/log.functions";

import type { LogWithTags } from "../../types";

export function useEditLog(log: LogWithTags | null, onClose: () => void) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			content: log?.content ?? "",
			tagIds: log?.tags.map((t) => t.id) ?? [],
		},
		validators: {
			onSubmit: z.object({
				content: z.string().min(1),
				tagIds: z.array(z.string()),
			}),
		},
		onSubmit: async ({ value }) => {
			if (!log) return;
			try {
				await updateLog({
					data: {
						id: log.id,
						content: value.content,
						tagIds: value.tagIds,
					},
				});
				toast.success("ログを更新しました");
				onClose();
				void router.invalidate();
			} catch (error) {
				toast.error("ログの更新に失敗しました");
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
