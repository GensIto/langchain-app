import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createCompany } from "@/serverFunction/company/company.functions";

export function useCreateCompany(onSuccess: () => void) {
	const router = useRouter();

	return useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "会社名を入力してください"),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await createCompany({ data: { name: value.name } });
				toast.success("会社を作成しました");
				onSuccess();
				void router.invalidate();
			} catch (error) {
				toast.error("会社の作成に失敗しました");
				console.error(error);
			}
		},
	});
}
