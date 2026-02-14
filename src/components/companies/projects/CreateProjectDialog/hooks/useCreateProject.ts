import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createProject } from "@/serverFunction/project/project.functions";

export function useCreateProject({
	companyId,
	onSuccess,
}: {
	companyId: string;
	onSuccess: () => void;
}) {
	const router = useRouter();

	return useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "プロジェクト名を入力してください"),
				description: z.string(),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await createProject({
					data: {
						name: value.name,
						companyId,
						description: value.description || undefined,
					},
				});
				toast.success("プロジェクトを作成しました");
				onSuccess();
				void router.invalidate();
			} catch (error) {
				toast.error("プロジェクトの作成に失敗しました");
				console.error(error);
			}
		},
	});
}
