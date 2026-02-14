import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { deleteLog } from "@/serverFunction/log/log.functions";

export function useDeleteLog() {
	const router = useRouter();

	const handleDelete = async (id: string) => {
		if (!confirm("このログを削除しますか?")) return;
		try {
			await deleteLog({ data: { id } });
			toast.success("ログを削除しました");
			void router.invalidate();
		} catch (error) {
			toast.error("ログの削除に失敗しました");
			console.error(error);
		}
	};

	return { handleDelete };
}
