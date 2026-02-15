import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/middleware";

import {
	generateEpisode,
	getAllEpisodes,
	getEpisodeById,
	removeEpisode,
	updateExistingEpisode,
} from "./episode.server";
import {
	deleteEpisodeSchema,
	generateEpisodeSchema,
	getEpisodeSchema,
	getEpisodesSchema,
	updateEpisodeSchema,
} from "./schemas";

export const getEpisodes = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(getEpisodesSchema)
	.handler(({ data, context }) => {
		return getAllEpisodes(data, context.session);
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
