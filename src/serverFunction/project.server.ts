import { getDb } from "@/db";
import { companies } from "@/db/companies";
import { projects } from "@/db/projects";
import { auth } from "@/lib/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq, and } from "drizzle-orm";
import z from "zod";

export const getProjects = createServerFn({
  method: "GET",
})
  .inputValidator(z.object({ companyId: z.string() }))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify company ownership
    const company = await getDb()
      .select()
      .from(companies)
      .where(and(eq(companies.id, data.companyId), eq(companies.userId, session.user.id)))
      .get();

    if (!company) {
      throw new Error("Company not found");
    }

    const result = await getDb()
      .select()
      .from(projects)
      .where(and(eq(projects.companyId, data.companyId), eq(projects.userId, session.user.id)))
      .all();

    return result;
  });

export const getProject = createServerFn({
  method: "GET",
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const project = await getDb()
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
      .get();

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  });

export const createProject = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      name: z.string().min(1).max(255),
      companyId: z.string(),
      description: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify company ownership
    const company = await getDb()
      .select()
      .from(companies)
      .where(and(eq(companies.id, data.companyId), eq(companies.userId, session.user.id)))
      .get();

    if (!company) {
      throw new Error("Company not found");
    }

    const project = await getDb()
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        userId: session.user.id,
        companyId: data.companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    return project;
  });

export const updateProject = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const project = await getDb()
      .update(projects)
      .set({
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
      .returning()
      .get();

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  });

export const deleteProject = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const result = await getDb()
      .delete(projects)
      .where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
      .returning()
      .get();

    if (!result) {
      throw new Error("Project not found");
    }

    return { success: true };
  });
