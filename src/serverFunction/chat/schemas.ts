import z from "zod";

// ── ChatSessions ──

export const getChatSessionsSchema = z.object({});

export const getChatSessionSchema = z.object({
	id: z.string(),
});

export const createChatSessionSchema = z.object({
	interviewStyle: z.enum(["deep_dive", "broad", "technical"]),
	maxTokens: z.number(),
	title: z.string().optional(),
	targetPosition: z.string().optional(),
	targetIndustry: z.string().optional(),
});

export const updateChatSessionSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	status: z.enum(["active", "completed"]).optional(),
	summary: z.string().optional(),
});

export const deleteChatSessionSchema = z.object({
	id: z.string(),
});

// ── ChatMessages ──

export const getChatMessagesSchema = z.object({
	sessionId: z.string(),
});

export const createChatMessageSchema = z.object({
	sessionId: z.string(),
	message: z.string().min(1),
	role: z.enum(["system", "user", "assistant"]),
	tokenCount: z.number(),
});

// ── ChatMessageEpisodes ──

export const linkChatMessageEpisodeSchema = z.object({
	messageId: z.string(),
	episodeId: z.string(),
	relevanceNote: z.string().optional(),
});

export const getChatMessageEpisodesSchema = z.object({
	messageId: z.string(),
});

// ── Types ──

export type GetChatSessionsInput = z.infer<typeof getChatSessionsSchema>;
export type GetChatSessionInput = z.infer<typeof getChatSessionSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type UpdateChatSessionInput = z.infer<typeof updateChatSessionSchema>;
export type DeleteChatSessionInput = z.infer<typeof deleteChatSessionSchema>;
export type GetChatMessagesInput = z.infer<typeof getChatMessagesSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type LinkChatMessageEpisodeInput = z.infer<typeof linkChatMessageEpisodeSchema>;
export type GetChatMessageEpisodesInput = z.infer<typeof getChatMessageEpisodesSchema>;
