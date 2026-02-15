import { env } from "cloudflare:workers";

import { drizzle } from "drizzle-orm/d1";

import {
	account,
	accountRelations,
	companies,
	companiesRelations,
	episodes,
	episodesRelations,
	episodeTags,
	episodeTagsRelations,
	logTags,
	logTagsRelations,
	logs,
	logsRelations,
	projects,
	projectsRelations,
	session,
	sessionRelations,
	tags,
	tagsRelations,
	user,
	userRelations,
	verification,
} from "./schema";

const schema = {
	account,
	accountRelations,
	companies,
	companiesRelations,
	episodes,
	episodesRelations,
	episodeTags,
	episodeTagsRelations,
	logTags,
	logTagsRelations,
	logs,
	logsRelations,
	projects,
	projectsRelations,
	session,
	sessionRelations,
	tags,
	tagsRelations,
	user,
	userRelations,
	verification,
};

export function getDb() {
	return drizzle(env.DB, { schema });
}
