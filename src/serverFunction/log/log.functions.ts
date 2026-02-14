import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/middleware";

import {
	createNewLog,
	createNewTag,
	getAllLogs,
	getAllTags,
	getLogById,
	removeLog,
	removeTag,
	updateExistingLog,
	updateExistingTag,
} from "./log.server";
import {
	createLogSchema,
	createTagSchema,
	deleteLogSchema,
	deleteTagSchema,
	getLogSchema,
	getLogsSchema,
	getTagsSchema,
	updateLogSchema,
	updateTagSchema,
} from "./schemas";

export const getLogs = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getLogsSchema)
	.handler(async ({ data, context }) => {
		return getAllLogs(data, context.session);
	});

export const getLog = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getLogSchema)
	.handler(async ({ data, context }) => {
		return getLogById(data, context.session);
	});

export const createLog = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(createLogSchema)
	.handler(async ({ data, context }) => {
		return createNewLog(data, context.session);
	});

export const updateLog = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(updateLogSchema)
	.handler(async ({ data, context }) => {
		return updateExistingLog(data, context.session);
	});

export const deleteLog = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(deleteLogSchema)
	.handler(async ({ data, context }) => {
		return removeLog(data, context.session);
	});

export const getTags = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getTagsSchema)
	.handler(async ({ data, context }) => {
		return getAllTags(data, context.session);
	});

export const createTag = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(createTagSchema)
	.handler(async ({ data, context }) => {
		return createNewTag(data, context.session);
	});

export const updateTag = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(updateTagSchema)
	.handler(async ({ data, context }) => {
		return updateExistingTag(data, context.session);
	});

export const deleteTag = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(deleteTagSchema)
	.handler(async ({ data, context }) => {
		return removeTag(data, context.session);
	});
