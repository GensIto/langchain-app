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
	await verifyProjectOwnership(data.projectId, session.user.id);

	const result = await getDb().query.logs.findMany({
		where: and(eq(logs.projectId, data.projectId), eq(logs.userId, session.user.id)),
		with: {
			logTags: {
				with: { tag: true },
			},
		},
	});

	return result.map(({ logTags, ...log }) => ({
		...log,
		tags: logTags.map((lt) => ({ id: lt.tag.id, name: lt.tag.name })),
	}));
}

export async function getLogById(data: GetLogInput, session: RequiredSession) {
	const result = await getDb().query.logs.findFirst({
		where: and(eq(logs.id, data.id), eq(logs.userId, session.user.id)),
		with: {
			logTags: {
				with: { tag: true },
			},
		},
	});

	if (!result) {
		throw new Error("Log not found");
	}

	const { logTags: logTagsData, ...log } = result;

	return {
		...log,
		tags: logTagsData.map((lt) => ({ id: lt.tag.id, name: lt.tag.name })),
	};
}

export async function createNewLog(data: CreateLogInput, session: RequiredSession) {
	await verifyProjectOwnership(data.projectId, session.user.id);

	let checkedTags: { id: string; name: string }[] = [];
	if (data.tagIds && data.tagIds.length > 0) {
		const tagsResult = await getDb()
			.select({ id: tags.id, name: tags.name })
			.from(tags)
			.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
			.all();
		if (tagsResult.length !== data.tagIds.length) {
			throw new Error("Tags not found");
		}
		checkedTags = tagsResult;
	}

	const log = await getDb()
		.insert(logs)
		.values({
			id: crypto.randomUUID(),
			content: data.content,
			userId: session.user.id,
			projectId: data.projectId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();

	if (data.tagIds && data.tagIds.length > 0) {
		await getDb()
			.insert(logTags)
			.values(
				data.tagIds.map((tagId) => ({
					id: crypto.randomUUID(),
					logId: log.id,
					tagId,
					createdAt: new Date(),
				})),
			)
			.run();
	}

	return { ...log, tags: checkedTags };
}

export async function updateExistingLog(data: UpdateLogInput, session: RequiredSession) {
	const existing = await getDb()
		.select()
		.from(logs)
		.where(and(eq(logs.id, data.id), eq(logs.userId, session.user.id)))
		.get();

	if (!existing) {
		throw new Error("Log not found");
	}

	const log = await getDb()
		.update(logs)
		.set({
			content: data.content,
			updatedAt: new Date(),
		})
		.where(eq(logs.id, data.id))
		.returning()
		.get();

	let checkedTags: { id: string; name: string }[] = [];
	if (data.tagIds) {
		// 既存のタグ関連を削除
		await getDb().delete(logTags).where(eq(logTags.logId, log.id)).run();

		if (data.tagIds.length > 0) {
			// 新しいタグの存在・所有権を検証
			const tagsResult = await getDb()
				.select({ id: tags.id, name: tags.name })
				.from(tags)
				.where(and(eq(tags.userId, session.user.id), inArray(tags.id, data.tagIds)))
				.all();
			if (tagsResult.length !== data.tagIds.length) {
				throw new Error("Tags not found");
			}
			checkedTags = tagsResult;

			// 新しいタグ関連を挿入
			await getDb()
				.insert(logTags)
				.values(
					data.tagIds.map((tagId) => ({
						id: crypto.randomUUID(),
						logId: log.id,
						tagId,
						createdAt: new Date(),
					})),
				)
				.run();
		}
	} else {
		// tagIds が渡されなかった場合は既存のタグを返す
		checkedTags = await getDb()
			.select({ id: tags.id, name: tags.name })
			.from(logTags)
			.innerJoin(tags, eq(logTags.tagId, tags.id))
			.where(eq(logTags.logId, log.id))
			.all();
	}

	return { ...log, tags: checkedTags };
}

export async function removeLog(data: DeleteLogInput, session: RequiredSession) {
	const result = await getDb()
		.delete(logs)
		.where(and(eq(logs.id, data.id), eq(logs.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		throw new Error("Log not found");
	}

	return { success: true };
}

export async function getAllTags(
	_data: GetTagsInput,
	session: RequiredSession,
): Promise<{ id: string; name: string; userId: string; createdAt: Date }[]> {
	const allTags = await getDb().select().from(tags).where(eq(tags.userId, session.user.id)).all();

	return allTags;
}

export async function createNewTag(data: CreateTagInput, session: RequiredSession) {
	// Check if tag already exists for this user
	const existingTag = await getDb()
		.select()
		.from(tags)
		.where(and(eq(tags.userId, session.user.id), eq(tags.name, data.name)))
		.get();

	if (existingTag) {
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

	return tag;
}

export async function updateExistingTag(data: UpdateTagInput, session: RequiredSession) {
	// Check if another tag with the same name exists
	const existingTag = await getDb()
		.select()
		.from(tags)
		.where(and(eq(tags.userId, session.user.id), eq(tags.name, data.name)))
		.get();

	if (existingTag && existingTag.id !== data.id) {
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
		throw new Error("Tag not found");
	}

	return tag;
}

export async function removeTag(data: DeleteTagInput, session: RequiredSession) {
	const result = await getDb()
		.delete(tags)
		.where(and(eq(tags.id, data.id), eq(tags.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		throw new Error("Tag not found");
	}

	return { success: true };
}
