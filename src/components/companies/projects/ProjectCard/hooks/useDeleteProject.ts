import { toast } from "sonner";

import { deleteProject } from "@/serverFunction/project/project.functions";

import { CONFIRM_MESSAGES, TOAST_MESSAGES } from "../constants";

export function useDeleteProject() {
	const handleDelete = async (id: string) => {
		if (!confirm(CONFIRM_MESSAGES.deleteProject)) return;
		try {
			await deleteProject({ data: { id } });
			toast.success(TOAST_MESSAGES.deleteSuccess);
			window.location.reload();
		} catch (error) {
			toast.error(TOAST_MESSAGES.deleteError);
			console.error(error);
		}
	};

	return { handleDelete };
}
