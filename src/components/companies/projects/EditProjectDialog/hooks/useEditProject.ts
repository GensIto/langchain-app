import { useState } from "react";
import { toast } from "sonner";

import { updateProject } from "@/serverFunction/project/project.functions";

import { TOAST_MESSAGES } from "../constants";

import type { EditableProject } from "../../types";

export function useEditProject() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");

	const openEditDialog = (project: EditableProject) => {
		setEditingProject(project);
		setProjectName(project.name);
		setProjectDescription(project.description || "");
		setIsOpen(true);
	};

	const handleEdit = async () => {
		if (!editingProject) return;
		try {
			await updateProject({
				data: {
					id: editingProject.id,
					name: projectName,
					description: projectDescription || undefined,
				},
			});
			toast.success(TOAST_MESSAGES.updateSuccess);
			setIsOpen(false);
			setEditingProject(null);
			setProjectName("");
			setProjectDescription("");
			window.location.reload();
		} catch (error) {
			toast.error(TOAST_MESSAGES.updateError);
			console.error(error);
		}
	};

	return {
		isOpen,
		setIsOpen,
		projectName,
		setProjectName,
		projectDescription,
		setProjectDescription,
		openEditDialog,
		handleEdit,
	};
}
