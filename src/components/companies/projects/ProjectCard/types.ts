import type { EditableProject, Project } from "../types";

export type ProjectCardProps = {
	project: Project;
	onEdit: (project: EditableProject) => void;
	onNavigateToLogs: (projectId: string) => void;
};
