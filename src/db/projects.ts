import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "@/db/auth";
import { companies } from "@/db/companies";

export const projects = sqliteTable("projects", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
	companyId: text("companyId")
		.notNull()
		.references(() => companies.id),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
