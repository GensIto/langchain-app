import { useState } from "react";
import { toast } from "sonner";

import { createProject } from "@/serverFunction/project/project.functions";

import { TOAST_MESSAGES } from "../constants";

export function useCreateProject({ companyId }: { companyId: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");

	const resetForm = () => {
		setProjectName("");
		setProjectDescription("");
	};

	const handleCreate = async () => {
		try {
			await createProject({
				data: {
					name: projectName,
					companyId,
					description: projectDescription || undefined,
				},
			});
			toast.success(TOAST_MESSAGES.createSuccess);
			setIsOpen(false);
			resetForm();
			window.location.reload();
		} catch (error) {
			toast.error(TOAST_MESSAGES.createError);
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
		handleCreate,
	};
}
