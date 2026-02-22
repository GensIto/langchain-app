import z from "zod";

// ── ChatSessions ──

export const getChatSessionSchema = z.object({
	id: z.string().min(1),
});

export const createChatSessionSchema = z.object({
	interviewStyle: z.enum(["deep_dive", "broad", "technical"]),
	// TODO: 必要になれば maxTokens をユーザーが指定できるようにする
	// maxTokens: z.number().int().min(1),
	title: z.string().max(200).optional(),
	targetPosition: z.string().max(200).optional(),
	targetIndustry: z.string().max(200).optional(),
});

export const generateChatSessionTitleResponseSchema = z.object({
	title: z.string().describe("面接セッションのタイトル（日本語）"),
});

export const updateChatSessionSchema = z.object({
	id: z.string().min(1),
	title: z.string().max(200).optional(),
	status: z.enum(["active", "completed"]).optional(),
	summary: z.string().optional(),
});

export const deleteChatSessionSchema = z.object({
	id: z.string().min(1),
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

export type GetChatSessionInput = z.infer<typeof getChatSessionSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type UpdateChatSessionInput = z.infer<typeof updateChatSessionSchema>;
export type DeleteChatSessionInput = z.infer<typeof deleteChatSessionSchema>;
export type GetChatMessagesInput = z.infer<typeof getChatMessagesSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type LinkChatMessageEpisodeInput = z.infer<typeof linkChatMessageEpisodeSchema>;
export type GetChatMessageEpisodesInput = z.infer<typeof getChatMessageEpisodesSchema>;
