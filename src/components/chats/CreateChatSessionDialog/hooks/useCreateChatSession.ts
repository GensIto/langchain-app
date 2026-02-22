import { useForm } from "@tanstack/react-form";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { createChatSession } from "@/serverFunction/chat/chat.functions";

export function useCreateChatSession({ onSuccess }: { onSuccess: () => void }) {
	const router = useRouter();
	const navigate = useNavigate();

	return useForm({
		defaultValues: {
			interviewStyle: "broad" as "deep_dive" | "broad" | "technical",
			title: "",
			targetPosition: "",
			targetIndustry: "",
		},
		validators: {
			onSubmit: z.object({
				interviewStyle: z.enum(["deep_dive", "broad", "technical"]),
				title: z.string().max(200),
				targetPosition: z.string().max(200),
				targetIndustry: z.string().max(200),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				const session = await createChatSession({
					data: {
						interviewStyle: value.interviewStyle,
						title: value.title || undefined,
						targetPosition: value.targetPosition || undefined,
						targetIndustry: value.targetIndustry || undefined,
					},
				});
				toast.success("セッションを作成しました");
				onSuccess();
				void router.invalidate();
				void navigate({ to: "/chats/$chatId", params: { chatId: session.id } });
			} catch (error) {
				toast.error("セッションの作成に失敗しました");
				console.error(error);
			}
		},
	});
}
