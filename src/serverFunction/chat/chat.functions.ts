import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/middleware";

import {
	createNewChatMessage,
	createNewChatSession,
	getAllChatSessions,
	getChatSessionById,
	getMessageEpisodes,
	getMessagesBySession,
	linkMessageEpisode,
	removeChatSession,
	updateExistingChatSession,
} from "./chat.server";
import {
	createChatMessageSchema,
	createChatSessionSchema,
	deleteChatSessionSchema,
	getChatMessageEpisodesSchema,
	getChatMessagesSchema,
	getChatSessionSchema,
	getChatSessionsSchema,
	linkChatMessageEpisodeSchema,
	updateChatSessionSchema,
} from "./schemas";

// ── ChatSessions ──

export const getChatSessions = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getChatSessionsSchema)
	.handler(({ data, context }) => {
		return getAllChatSessions(data, context.session);
	});

export const getChatSession = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getChatSessionSchema)
	.handler(({ data, context }) => {
		return getChatSessionById(data, context.session);
	});

export const createChatSession = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(createChatSessionSchema)
	.handler(({ data, context }) => {
		return createNewChatSession(data, context.session);
	});

export const updateChatSession = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(updateChatSessionSchema)
	.handler(({ data, context }) => {
		return updateExistingChatSession(data, context.session);
	});

export const deleteChatSession = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(deleteChatSessionSchema)
	.handler(({ data, context }) => {
		return removeChatSession(data, context.session);
	});

// ── ChatMessages ──

export const getChatMessages = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getChatMessagesSchema)
	.handler(({ data, context }) => {
		return getMessagesBySession(data, context.session);
	});

export const createChatMessage = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(createChatMessageSchema)
	.handler(({ data, context }) => {
		return createNewChatMessage(data, context.session);
	});

// ── ChatMessageEpisodes ──

export const linkChatMessageEpisode = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(linkChatMessageEpisodeSchema)
	.handler(({ data, context }) => {
		return linkMessageEpisode(data, context.session);
	});

export const getChatMessageEpisodes = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getChatMessageEpisodesSchema)
	.handler(({ data, context }) => {
		return getMessageEpisodes(data, context.session);
	});
