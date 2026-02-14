import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { deleteCompany } from "@/serverFunction/company/company.functions";

export function useDeleteCompany() {
	const router = useRouter();

	const handleDelete = async (id: string) => {
		if (!confirm("この会社を削除しますか?")) return;
		try {
			await deleteCompany({ data: { id } });
			toast.success("会社を削除しました");
			void router.invalidate();
		} catch (error) {
			toast.error("会社の削除に失敗しました");
			console.error(error);
		}
	};

	return { handleDelete };
}
