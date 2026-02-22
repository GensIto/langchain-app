import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { deleteChatSession } from "@/serverFunction/chat/chat.functions";

export function useDeleteChatSession() {
	const router = useRouter();
	const navigate = useNavigate();

	const handleDelete = async (id: string) => {
		if (!confirm("このセッションを削除しますか？")) return;
		try {
			await deleteChatSession({ data: { id } });
			toast.success("セッションを削除しました");
			void router.invalidate();
			void navigate({ to: "/chats" });
		} catch (error) {
			toast.error("セッションの削除に失敗しました");
			console.error(error);
		}
	};

	return { handleDelete };
}
