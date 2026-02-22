import type { RequiredSession } from "@/lib/auth";

import type {
	CreateChatMessageInput,
	CreateChatSessionInput,
	DeleteChatSessionInput,
	GetChatMessageEpisodesInput,
	GetChatMessagesInput,
	GetChatSessionInput,
	GetChatSessionsInput,
	LinkChatMessageEpisodeInput,
	UpdateChatSessionInput,
} from "./schemas";

// ── ChatSessions ──

export function getAllChatSessions(_data: GetChatSessionsInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function getChatSessionById(_data: GetChatSessionInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function createNewChatSession(_data: CreateChatSessionInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function updateExistingChatSession(
	_data: UpdateChatSessionInput,
	_session: RequiredSession,
) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function removeChatSession(_data: DeleteChatSessionInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

// ── ChatMessages ──

export function getMessagesBySession(_data: GetChatMessagesInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function createNewChatMessage(_data: CreateChatMessageInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

// ── ChatMessageEpisodes ──

export function linkMessageEpisode(_data: LinkChatMessageEpisodeInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function getMessageEpisodes(_data: GetChatMessageEpisodesInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}
