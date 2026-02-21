import { integer, text, sqliteTable, index } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { episodes } from "@/db/episodes";

export const chatSessions = sqliteTable(
	"chatSessions",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		title: text("title"),
		status: text("status", { enum: ["active", "completed"] })
			.notNull()
			.default("active"),
		interviewStyle: text("interviewStyle", {
			enum: ["deep_dive", "broad", "technical"],
		}).notNull(),
		targetPosition: text("targetPosition"),
		targetIndustry: text("targetIndustry"),
		summary: text("summary"),
		maxTokens: integer("maxTokens").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("chatSessions_userId_idx").on(table.userId)],
);

export const chatMessages = sqliteTable(
	"chatMessages",
	{
		id: text("id").primaryKey(),
		sessionId: text("sessionId")
			.notNull()
			.references(() => chatSessions.id),
		message: text("message").notNull(),
		role: text("role", { enum: ["system", "user", "assistant"] }).notNull(),
		tokenCount: integer("tokenCount").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("chatMessages_sessionId_idx").on(table.sessionId)],
);

export const chatMessageEpisodes = sqliteTable(
	"chatMessageEpisodes",
	{
		id: text("id").primaryKey(),
		messageId: text("messageId")
			.notNull()
			.references(() => chatMessages.id, { onDelete: "cascade" }),
		episodeId: text("episodeId")
			.notNull()
			.references(() => episodes.id, { onDelete: "cascade" }),
		relevanceNote: text("relevanceNote"),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("chatMessageEpisodes_messageId_idx").on(table.messageId)],
);
