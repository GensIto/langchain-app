export type Project = {
	id: string;
	userId: string;
	companyId: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type Company = {
	id: string;
	userId: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

export type EditableProject = Pick<Project, "id" | "name" | "description">;
