import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { updateCompany } from "@/serverFunction/company/company.functions";

import type { EditableCompany } from "../../types";

export function useEditCompany(company: EditableCompany | null, onClose: () => void) {
	const router = useRouter();

	return useForm({
		defaultValues: {
			name: company?.name ?? "",
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "会社名を入力してください"),
			}),
		},
		onSubmit: async ({ value }) => {
			if (!company) return;
			try {
				await updateCompany({
					data: { id: company.id, name: value.name },
				});
				toast.success("会社を更新しました");
				onClose();
				void router.invalidate();
			} catch (error) {
				toast.error("会社の更新に失敗しました");
				console.error(error);
			}
		},
	});
}
