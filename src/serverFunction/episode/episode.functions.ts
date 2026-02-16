import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/middleware";

import {
	createEpisode,
	generateEpisode,
	getAllEpisodes,
	getEpisodeById,
	removeEpisode,
	retrieveEpisodes,
	updateExistingEpisode,
} from "./episode.server";
import {
	createEpisodeSchema,
	deleteEpisodeSchema,
	generateEpisodeSchema,
	getEpisodeSchema,
	searchEpisodesSchema,
	updateEpisodeSchema,
} from "./schemas";

export const searchEpisodes = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(searchEpisodesSchema)
	.handler(async ({ data, context }) => {
		return retrieveEpisodes(data, context.session);
	});

export const getEpisodes = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.handler(({ context }) => {
		return getAllEpisodes(context.session);
	});

export const getEpisode = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getEpisodeSchema)
	.handler(({ data, context }) => {
		return getEpisodeById(data, context.session);
	});

export const generateEpisodeFromLog = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(generateEpisodeSchema)
	.handler(({ data, context }) => {
		return generateEpisode(data, context.session);
	});

export const createNewEpisode = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(createEpisodeSchema)
	.handler(async ({ data, context }) => {
		return await createEpisode(data, context.session);
	});

export const updateEpisode = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(updateEpisodeSchema)
	.handler(({ data, context }) => {
		return updateExistingEpisode(data, context.session);
	});

export const deleteEpisode = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator(deleteEpisodeSchema)
	.handler(({ data, context }) => {
		return removeEpisode(data, context.session);
	});
