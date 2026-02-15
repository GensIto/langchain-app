import z from "zod";

export const getEpisodesSchema = z.object({
	logId: z.string(),
});

export const getEpisodeSchema = z.object({
	id: z.string(),
});

export const generateEpisodeSchema = z.object({
	logId: z.string(),
});

export const updateEpisodeSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	impactLevel: z.enum(["low", "medium", "high"]),
	situation: z.string().min(1),
	task: z.string().min(1),
	action: z.string().min(1),
	result: z.string().min(1),
});

export const deleteEpisodeSchema = z.object({
	id: z.string(),
});

export type GetEpisodesInput = z.infer<typeof getEpisodesSchema>;
export type GetEpisodeInput = z.infer<typeof getEpisodeSchema>;
export type GenerateEpisodeInput = z.infer<typeof generateEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;
export type DeleteEpisodeInput = z.infer<typeof deleteEpisodeSchema>;
