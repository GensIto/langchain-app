import { integer, text, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

import { logs } from "@/db/logs";

export const episodes = sqliteTable(
	"episodes",
	{
		id: text("id").primaryKey(),
		logId: text("logId")
			.notNull()
			.references(() => logs.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		impactLevel: text("impactLevel", { enum: ["low", "medium", "high"] }).notNull(),
		situation: text("situation").notNull(),
		task: text("task").notNull(),
		action: text("action").notNull(),
		result: text("result").notNull(),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => [uniqueIndex("episodes_userId_logId_idx").on(table.logId)],
);
