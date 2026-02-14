import z from "zod";

export const getLogsSchema = z.object({
	projectId: z.string(),
});

export const getLogSchema = z.object({
	id: z.string(),
});

export const createLogSchema = z.object({
	projectId: z.string(),
	content: z.string().min(1),
	tagIds: z.array(z.string()).optional(),
});

export const updateLogSchema = z.object({
	id: z.string(),
	content: z.string().min(1),
	tagIds: z.array(z.string()).optional(),
});

export const deleteLogSchema = z.object({
	id: z.string(),
});

export const getTagsSchema = z.object({});

export const createTagSchema = z.object({
	name: z.string().min(1).max(50),
});

export const updateTagSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(50),
});

export const deleteTagSchema = z.object({
	id: z.string(),
});

export type GetLogsInput = z.infer<typeof getLogsSchema>;
export type GetLogInput = z.infer<typeof getLogSchema>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
export type UpdateLogInput = z.infer<typeof updateLogSchema>;
export type DeleteLogInput = z.infer<typeof deleteLogSchema>;
export type GetTagsInput = z.infer<typeof getTagsSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type DeleteTagInput = z.infer<typeof deleteTagSchema>;
