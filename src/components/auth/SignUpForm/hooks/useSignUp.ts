import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { signUp } from "@/lib/auth-client";

export function useSignUp() {
	const navigate = useNavigate();

	return useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email(),
				password: z.string().min(8),
				name: z.string().min(1),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await signUp.email({
					email: value.email,
					password: value.password,
					name: value.name,
				});

				if (result.error) {
					toast.error(result.error.message);
					return;
				}
				void navigate({ to: "/" });
				toast.success("ログインしました");
			} catch (_error) {
				toast.error("メールアドレスまたはパスワードが正しくありません。");
			}
		},
	});
}
