import { integer, text, sqliteTable, uniqueIndex, index } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { logs } from "@/db/logs";

export const episodes = sqliteTable(
	"episodes",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => user.id),
		logId: text("logId")
			.notNull()
			.references(() => logs.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		impactLevel: text("impactLevel", { enum: ["low", "medium", "high"] }).notNull(),
		situation: text("situation").notNull(),
		task: text("task").notNull(),
		action: text("action").notNull(),
		result: text("result").notNull(),
		docsPath: text("docsPath"),
		createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
	},
	(table) => [
		uniqueIndex("episodes_logId_idx").on(table.logId),
		index("episodes_userId_idx").on(table.userId),
	],
);
