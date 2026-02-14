import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { deleteProject } from "@/serverFunction/project/project.functions";

export function useDeleteProject() {
	const router = useRouter();

	const handleDelete = async (id: string) => {
		if (!confirm("このプロジェクトを削除しますか?")) return;
		try {
			await deleteProject({ data: { id } });
			toast.success("プロジェクトを削除しました");
			void router.invalidate();
		} catch (error) {
			toast.error("プロジェクトの削除に失敗しました");
			console.error(error);
		}
	};

	return { handleDelete };
}
