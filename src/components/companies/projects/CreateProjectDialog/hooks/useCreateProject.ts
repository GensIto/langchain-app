import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { createProject } from "@/serverFunction/project/project.functions";

export function useCreateProject({
	companyId,
	onSuccess,
}: {
	companyId: string;
	onSuccess: () => void;
}) {
	const router = useRouter();
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");

	const handleCreate = async () => {
		try {
			await createProject({
				data: {
					name: projectName,
					companyId,
					description: projectDescription || undefined,
				},
			});
			toast.success("プロジェクトを作成しました");
			onSuccess();
			setProjectName("");
			setProjectDescription("");
			void router.invalidate();
		} catch (error) {
			toast.error("プロジェクトの作成に失敗しました");
			console.error(error);
		}
	};

	return {
		projectName,
		onProjectNameChange: setProjectName,
		projectDescription,
		onProjectDescriptionChange: setProjectDescription,
		onSubmit: handleCreate,
	};
}
