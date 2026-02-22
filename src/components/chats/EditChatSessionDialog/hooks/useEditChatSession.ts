import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { updateChatSession } from "@/serverFunction/chat/chat.functions";

import type { EditableChatSession } from "../types";

export function useEditChatSession(session: EditableChatSession | null, onClose: () => void) {
	const router = useRouter();

	return useForm({
		defaultValues: {
			title: session?.title ?? "",
			status: (session?.status ?? "active") as "active" | "completed",
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1, "タイトルを入力してください").max(200),
				status: z.enum(["active", "completed"]),
			}),
		},
		onSubmit: async ({ value }) => {
			if (!session) return;
			try {
				await updateChatSession({
					data: {
						id: session.id,
						title: value.title,
						status: value.status,
					},
				});
				toast.success("セッションを更新しました");
				onClose();
				void router.invalidate();
			} catch (error) {
				toast.error("セッションの更新に失敗しました");
				console.error(error);
			}
		},
	});
}
