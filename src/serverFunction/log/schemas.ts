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
