import { createServerFn } from "@tanstack/react-start";
import {
  getProjectsSchema,
  getProjectSchema,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
} from "./schemas";
import {
  getAllProjects,
  getProjectById,
  createNewProject,
  updateExistingProject,
  removeProject,
} from "./project.server";
import { authMiddleware } from "@/lib/middleware";

export const getProjects = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(getProjectsSchema)
  .handler(async ({ data, context }) => {
    return getAllProjects(data, context.session);
  });

export const getProject = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(getProjectSchema)
  .handler(async ({ data, context }) => {
    return getProjectById(data, context.session);
  });

export const createProject = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(createProjectSchema)
  .handler(async ({ data, context }) => {
    return createNewProject(data, context.session);
  });

export const updateProject = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(updateProjectSchema)
  .handler(async ({ data, context }) => {
    return updateExistingProject(data, context.session);
  });

export const deleteProject = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(deleteProjectSchema)
  .handler(async ({ data, context }) => {
    return removeProject(data, context.session);
  });
