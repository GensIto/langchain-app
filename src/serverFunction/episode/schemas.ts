import { z } from "zod";

export const searchEpisodesSchema = z.object({
	query: z.string(),
});

export const getEpisodeSchema = z.object({
	id: z.string(),
});

export const generateEpisodeSchema = z.object({
	logId: z.string(),
});

export const generateStarResponseSchema = z.object({
	title: z.string(),
	impactLevel: z.enum(["low", "medium", "high"]),
	situation: z.string(),
	task: z.string(),
	action: z.string(),
	result: z.string(),
});

export const createEpisodeSchema = z.object({
	logId: z.string(),
	title: z.string(),
	impactLevel: z.enum(["low", "medium", "high"]),
	situation: z.string(),
	task: z.string(),
	action: z.string(),
	result: z.string(),
	tagIds: z.array(z.string()).optional(),
});

export const updateEpisodeSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	impactLevel: z.enum(["low", "medium", "high"]),
	situation: z.string().min(1),
	task: z.string().min(1),
	action: z.string().min(1),
	result: z.string().min(1),
	tagIds: z.array(z.string()).optional(),
});

export const deleteEpisodeSchema = z.object({
	id: z.string(),
});

export type SearchEpisodesInput = z.infer<typeof searchEpisodesSchema>;
export type GetEpisodeInput = z.infer<typeof getEpisodeSchema>;
export type GenerateEpisodeInput = z.infer<typeof generateEpisodeSchema>;
export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;
export type DeleteEpisodeInput = z.infer<typeof deleteEpisodeSchema>;
