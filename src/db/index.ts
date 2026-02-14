import { env } from "cloudflare:workers";

import { drizzle } from "drizzle-orm/d1";

import {
	account,
	companies,
	logs,
	logTags,
	projects,
	session,
	tags,
	user,
	verification,
} from "./schema";

const schema = {
	account,
	companies,
	logTags,
	logs,
	projects,
	session,
	tags,
	user,
	verification,
};

export function getDb() {
	return drizzle(env.DB, { schema });
}
