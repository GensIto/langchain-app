import { getLogger } from "@logtape/logtape";
import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { logs } from "@/db/logs";
import { projects } from "@/db/projects";
import { logTags, tags } from "@/db/tags";
import type { RequiredSession } from "@/lib/auth";

import type {
	CreateLogInput,
	CreateTagInput,
	DeleteLogInput,
	DeleteTagInput,
	GetLogInput,
	GetLogsInput,
	GetTagsInput,
	UpdateLogInput,
	UpdateTagInput,
} from "./schemas";

const logger = getLogger(["app", "log"]);

async function verifyProjectOwnership(projectId: string, userId: string) {
	const project = await getDb()
		.select()
		.from(projects)
		.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
		.get();

	if (!project) {
		throw new Error("Project not found");
	}

	return project;
}

export async function getAllLogs(data: GetLogsInput, session: RequiredSession) {
	logger.info("Fetching all logs for project {projectId}", {
		projectId: data.projectId,
		userId: session.user.id,
	});

	await verifyProjectOwnership(data.projectId, session.user.id);

	const result = await getDb().query.logs.findMany({
		where: and(eq(logs.projectId, data.projectId), eq(logs.userId, session.user.id)),
		with: {
			logTags: {
				with: { tag: true },
			},
		},
	});

	logger.info("Fetched {count} logs", { count: result.length });

	return result.map(({ logTags, ...log }) => ({
		...log,
		tags: logTags.map((lt) => ({ id: lt.tag.id, name: lt.tag.name })),
	}));
}

export async function getLogById(data: GetLogInput, session: RequiredSession) {
	logger.info("Fetching log {logId}", { logId: data.id, userId: session.user.id });

	const result = await getDb().query.logs.findFirst({
		where: and(eq(logs.id, data.id), eq(logs.userId, session.user.id)),
		with: {
			logTags: {
				with: { tag: true },
			},
		},
	});

	if (!result) {
		logger.warn("Log not found: {logId}", { logId: data.id });
		throw new Error("Log not found");
	}

	const { logTags: logTagsData, ...log } = result;

	return {
		...log,
		tags: logTagsData.map((lt) => ({ id: lt.tag.id, name: lt.tag.name })),
	};
}

export async function createNewLog(data: CreateLogInput, session: RequiredSession) {
	logger.info("Creating log for project {projectId}", {
		projectId: data.projectId,
		userId: session.user.id,
	});

	await verifyProjectOwnership(data.projectId, session.user.id);

	let checkedTags: { id: string; name: string }[] = [];
	if (data.tagIds && data.tagIds.length > 0) {
		const tagsResult = await getDb()
			.select({ id: tags.id, name: tags.name })
			.from(tags)
			.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
			.all();
		if (tagsResult.length !== data.tagIds.length) {
			logger.warn("Some tags not found for log creation", { tagIds: data.tagIds });
			throw new Error("Tags not found");
		}
		checkedTags = tagsResult;
	}

	const logId = crypto.randomUUID();
	const now = new Date();

	const db = getDb();
	const batchQueries = [
		db.insert(logs)
			.values({
				id: logId,
				content: data.content,
				userId: session.user.id,
				projectId: data.projectId,
				createdAt: now,
				updatedAt: now,
			})
			.returning(),
		...(data.tagIds && data.tagIds.length > 0
			? [
					db.insert(logTags).values(
						data.tagIds.map((tagId) => ({
							id: crypto.randomUUID(),
							logId,
							tagId,
							createdAt: now,
						})),
					),
				]
			: []),
	] as const;

	const result = await db.batch(batchQueries);
	const log = result[0][0];

	logger.info("Log created: {logId}", { logId });

	return { ...log, tags: checkedTags };
}

export async function updateExistingLog(data: UpdateLogInput, session: RequiredSession) {
	logger.info("Updating log {logId}", { logId: data.id, userId: session.user.id });

	const existing = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.id), eq(logs.userId, session.user.id)))
		.get();

	if (!existing) {
		logger.warn("Log not found for update: {logId}", { logId: data.id });
		throw new Error("Log not found");
	}

	let checkedTags: { id: string; name: string }[] = [];

	if (data.tagIds) {
		if (data.tagIds.length > 0) {
			const tagsResult = await getDb()
				.select({ id: tags.id, name: tags.name })
				.from(tags)
				.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
				.all();
			if (tagsResult.length !== data.tagIds.length) {
				logger.warn("Some tags not found for log update", { tagIds: data.tagIds });
				throw new Error("Tags not found");
			}
			checkedTags = tagsResult;
		}

		const db = getDb();
		const batchQueries = [
			db.update(logs)
				.set({
					content: data.content,
					updatedAt: new Date(),
				})
				.where(eq(logs.id, data.id))
				.returning(),
			db.delete(logTags).where(eq(logTags.logId, data.id)),
			...(data.tagIds.length > 0
				? [
						db.insert(logTags).values(
							data.tagIds.map((tagId) => ({
								id: crypto.randomUUID(),
								logId: data.id,
								tagId,
								createdAt: new Date(),
							})),
						),
					]
				: []),
		] as const;

		const result = await db.batch(batchQueries);
		const log = result[0][0];

		logger.info("Log updated with tags: {logId}", { logId: data.id });

		return { ...log, tags: checkedTags };
	}

	// tagIds が渡されなかった場合はタグ操作なし
	const log = await getDb()
		.update(logs)
		.set({
			content: data.content,
			updatedAt: new Date(),
		})
		.where(eq(logs.id, data.id))
		.returning()
		.get();

	checkedTags = await getDb()
		.select({ id: tags.id, name: tags.name })
		.from(logTags)
		.innerJoin(tags, eq(logTags.tagId, tags.id))
		.where(eq(logTags.logId, log.id))
		.all();

	logger.info("Log updated: {logId}", { logId: data.id });

	return { ...log, tags: checkedTags };
}

export async function removeLog(data: DeleteLogInput, session: RequiredSession) {
	logger.info("Removing log {logId}", { logId: data.id, userId: session.user.id });

	const result = await getDb()
		.delete(logs)
		.where(and(eq(logs.id, data.id), eq(logs.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Log not found for removal: {logId}", { logId: data.id });
		throw new Error("Log not found");
	}

	logger.info("Log removed: {logId}", { logId: data.id });

	return { success: true };
}

export async function getAllTags(
	_data: GetTagsInput,
	session: RequiredSession,
): Promise<{ id: string; name: string; userId: string; createdAt: Date }[]> {
	logger.info("Fetching all tags for user {userId}", { userId: session.user.id });

	const allTags = await getDb().select().from(tags).where(eq(tags.userId, session.user.id)).all();

	logger.info("Fetched {count} tags", { count: allTags.length });

	return allTags;
}

export async function createNewTag(data: CreateTagInput, session: RequiredSession) {
	logger.info("Creating tag {name}", { name: data.name, userId: session.user.id });

	// Check if tag already exists for this user
	const existingTag = await getDb()
		.select()
		.from(tags)
		.where(and(eq(tags.userId, session.user.id), eq(tags.name, data.name)))
		.get();

	if (existingTag) {
		logger.warn("Tag already exists: {name}", { name: data.name });
		throw new Error("Tag with this name already exists");
	}

	const tag = await getDb()
		.insert(tags)
		.values({
			id: crypto.randomUUID(),
			name: data.name,
			userId: session.user.id,
			createdAt: new Date(),
		})
		.returning()
		.get();

	logger.info("Tag created: {tagId}", { tagId: tag.id });

	return tag;
}

export async function updateExistingTag(data: UpdateTagInput, session: RequiredSession) {
	logger.info("Updating tag {tagId}", { tagId: data.id, userId: session.user.id });

	// Check if another tag with the same name exists
	const existingTag = await getDb()
		.select()
		.from(tags)
		.where(and(eq(tags.userId, session.user.id), eq(tags.name, data.name)))
		.get();

	if (existingTag && existingTag.id !== data.id) {
		logger.warn("Tag name conflict: {name}", { name: data.name });
		throw new Error("Tag with this name already exists");
	}

	const tag = await getDb()
		.update(tags)
		.set({
			name: data.name,
		})
		.where(and(eq(tags.id, data.id), eq(tags.userId, session.user.id)))
		.returning()
		.get();

	if (!tag) {
		logger.warn("Tag not found for update: {tagId}", { tagId: data.id });
		throw new Error("Tag not found");
	}

	logger.info("Tag updated: {tagId}", { tagId: tag.id });

	return tag;
}

export async function removeTag(data: DeleteTagInput, session: RequiredSession) {
	logger.info("Removing tag {tagId}", { tagId: data.id, userId: session.user.id });

	const result = await getDb()
		.delete(tags)
		.where(and(eq(tags.id, data.id), eq(tags.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Tag not found for removal: {tagId}", { tagId: data.id });
		throw new Error("Tag not found");
	}

	logger.info("Tag removed: {tagId}", { tagId: data.id });

	return { success: true };
}
