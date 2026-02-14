import { createServerFn } from "@tanstack/react-start";
import {
  getLogsSchema,
  getLogSchema,
  createLogSchema,
  updateLogSchema,
  deleteLogSchema,
  getTagsSchema,
  createTagSchema,
} from "./schemas";
import {
  getAllLogs,
  getLogById,
  createNewLog,
  updateExistingLog,
  removeLog,
  getAllTags,
  createNewTag,
} from "./log.server";
import { authMiddleware } from "@/lib/middleware";

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
