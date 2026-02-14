import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { projects } from "@/db/projects";

export const tags = sqliteTable(
	"tags",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		name: text("name").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userIdNameIdx: uniqueIndex("tags_userId_name_idx").on(table.userId, table.name),
	}),
);

export const logs = sqliteTable("logs", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	projectId: text("projectId")
		.notNull()
		.references(() => projects.id),
	content: text("content").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const logTags = sqliteTable("logTags", {
	id: text("id").primaryKey(),
	logId: text("logId")
		.notNull()
		.references(() => logs.id, { onDelete: "cascade" }),
	tagId: text("tagId")
		.notNull()
		.references(() => tags.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
