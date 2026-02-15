import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { projects } from "@/db/projects";

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
