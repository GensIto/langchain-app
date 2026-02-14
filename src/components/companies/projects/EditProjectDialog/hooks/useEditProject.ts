import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { updateProject } from "@/serverFunction/project/project.functions";

import type { EditableProject } from "../../types";

export function useEditProject(project: EditableProject | null, onClose: () => void) {
	const router = useRouter();
	const [projectName, setProjectName] = useState(project?.name ?? "");
	const [projectDescription, setProjectDescription] = useState(project?.description ?? "");

	const handleEdit = async () => {
		if (!project) return;
		try {
			await updateProject({
				data: {
					id: project.id,
					name: projectName,
					description: projectDescription || undefined,
				},
			});
			toast.success("プロジェクトを更新しました");
			onClose();
			void router.invalidate();
		} catch (error) {
			toast.error("プロジェクトの更新に失敗しました");
			console.error(error);
		}
	};

	return {
		projectName,
		onProjectNameChange: setProjectName,
		projectDescription,
		onProjectDescriptionChange: setProjectDescription,
		onSubmit: handleEdit,
	};
}
