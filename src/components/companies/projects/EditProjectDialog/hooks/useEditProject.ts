import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { updateProject } from "@/serverFunction/project/project.functions";

import type { EditableProject } from "../../types";

export function useEditProject(project: EditableProject | null, onClose: () => void) {
	const router = useRouter();

	return useForm({
		defaultValues: {
			name: project?.name ?? "",
			description: project?.description ?? "",
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "プロジェクト名を入力してください"),
				description: z.string(),
			}),
		},
		onSubmit: async ({ value }) => {
			if (!project) return;
			try {
				await updateProject({
					data: {
						id: project.id,
						name: value.name,
						description: value.description || undefined,
					},
				});
				toast.success("プロジェクトを更新しました");
				onClose();
				void router.invalidate();
			} catch (error) {
				toast.error("プロジェクトの更新に失敗しました");
				console.error(error);
			}
		},
	});
}
