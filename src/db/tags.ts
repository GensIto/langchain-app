import { integer, uniqueIndex, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { episodes } from "@/db/episodes";
import { logs } from "@/db/logs";

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
	(table) => [uniqueIndex("tags_userId_name_idx").on(table.userId, table.name)],
);

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

export const episodeTags = sqliteTable("episodeTags", {
	id: text("id").primaryKey(),
	episodeId: text("episodeId")
		.notNull()
		.references(() => episodes.id, { onDelete: "cascade" }),
	tagId: text("tagId")
		.notNull()
		.references(() => tags.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
