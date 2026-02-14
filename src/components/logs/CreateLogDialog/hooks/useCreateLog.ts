import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createLog, createTag } from "@/serverFunction/log/log.functions";

export function useCreateLog({
	projectId,
	onSuccess,
}: {
	projectId: string;
	onSuccess: () => void;
}) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			content: "",
			tagIds: [] as string[],
		},
		validators: {
			onSubmit: z.object({
				content: z.string().min(1),
				tagIds: z.array(z.string()),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await createLog({
					data: {
						projectId,
						content: value.content,
						tagIds: value.tagIds.length > 0 ? value.tagIds : undefined,
					},
				});
				toast.success("ログを作成しました");
				onSuccess();
				void router.invalidate();
			} catch (error) {
				toast.error("ログの作成に失敗しました");
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
