import { relations } from "drizzle-orm";

import { account, session, user } from "./auth";
import { chatMessageEpisodes, chatMessages, chatSessions } from "./chat";
import { companies } from "./companies";
import { episodes } from "./episodes";
import { logs } from "./logs";
import { projects } from "./projects";
import { episodeTags, logTags, tags } from "./tags";

// --- Auth ---

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	companies: many(companies),
	projects: many(projects),
	logs: many(logs),
	episodes: many(episodes),
	tags: many(tags),
	chatSessions: many(chatSessions),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// --- Business ---

export const companiesRelations = relations(companies, ({ one, many }) => ({
	user: one(user, { fields: [companies.userId], references: [user.id] }),
	projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	user: one(user, { fields: [projects.userId], references: [user.id] }),
	company: one(companies, { fields: [projects.companyId], references: [companies.id] }),
	logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one, many }) => ({
	user: one(user, { fields: [logs.userId], references: [user.id] }),
	project: one(projects, { fields: [logs.projectId], references: [projects.id] }),
	logTags: many(logTags),
	episodes: many(episodes),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
	user: one(user, { fields: [episodes.userId], references: [user.id] }),
	log: one(logs, { fields: [episodes.logId], references: [logs.id] }),
	episodeTags: many(episodeTags),
	chatMessageEpisodes: many(chatMessageEpisodes),
}));

// --- Tags ---

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(user, { fields: [tags.userId], references: [user.id] }),
	logTags: many(logTags),
	episodeTags: many(episodeTags),
}));

export const logTagsRelations = relations(logTags, ({ one }) => ({
	log: one(logs, { fields: [logTags.logId], references: [logs.id] }),
	tag: one(tags, { fields: [logTags.tagId], references: [tags.id] }),
}));

export const episodeTagsRelations = relations(episodeTags, ({ one }) => ({
	episode: one(episodes, { fields: [episodeTags.episodeId], references: [episodes.id] }),
	tag: one(tags, { fields: [episodeTags.tagId], references: [tags.id] }),
}));

// --- Chat ---

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
	user: one(user, { fields: [chatSessions.userId], references: [user.id] }),
	chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
	chatSession: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id],
	}),
	chatMessageEpisodes: many(chatMessageEpisodes),
}));

export const chatMessageEpisodesRelations = relations(chatMessageEpisodes, ({ one }) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessageEpisodes.messageId],
		references: [chatMessages.id],
	}),
	episode: one(episodes, { fields: [chatMessageEpisodes.episodeId], references: [episodes.id] }),
}));
