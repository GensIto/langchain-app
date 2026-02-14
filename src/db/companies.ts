import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";

export const companies = sqliteTable("companies", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
