import z from "zod";

export const getProjectsSchema = z.object({
	companyId: z.string(),
});

export const getProjectSchema = z.object({
	id: z.string(),
});

export const createProjectSchema = z.object({
	name: z.string().min(1).max(255),
	companyId: z.string(),
	description: z.string().optional(),
});

export const updateProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(255),
	description: z.string().optional(),
});

export const deleteProjectSchema = z.object({
	id: z.string(),
});

export type GetProjectsInput = z.infer<typeof getProjectsSchema>;
export type GetProjectInput = z.infer<typeof getProjectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
