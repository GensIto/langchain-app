import { getDb } from "@/db";
import { companies } from "@/db/companies";
import { projects } from "@/db/projects";
import { eq, and } from "drizzle-orm";
import type { RequiredSession } from "@/lib/auth";
import type {
  getProjectsSchema,
  getProjectSchema,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
} from "./schemas";
import type z from "zod";

type GetProjectsInput = z.infer<typeof getProjectsSchema>;
type GetProjectInput = z.infer<typeof getProjectSchema>;
type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

async function verifyCompanyOwnership(companyId: string, userId: string) {
  const company = await getDb()
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.userId, userId)))
    .get();

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
}

export async function getAllProjects(
  data: GetProjectsInput,
  session: RequiredSession,
) {
  // Verify company ownership
  await verifyCompanyOwnership(data.companyId, session.user.id);

  const result = await getDb()
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.companyId, data.companyId),
        eq(projects.userId, session.user.id),
      ),
    )
    .all();

  return result;
}

export async function getProjectById(
  data: GetProjectInput,
  session: RequiredSession,
) {
  const project = await getDb()
    .select()
    .from(projects)
    .where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
    .get();

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function createNewProject(
  data: CreateProjectInput,
  session: RequiredSession,
) {
  // Verify company ownership
  await verifyCompanyOwnership(data.companyId, session.user.id);

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
}

export async function updateExistingProject(
  data: UpdateProjectInput,
  session: RequiredSession,
) {
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
}

export async function removeProject(
  data: DeleteProjectInput,
  session: RequiredSession,
) {
  const result = await getDb()
    .delete(projects)
    .where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
    .returning()
    .get();

  if (!result) {
    throw new Error("Project not found");
  }

  return { success: true };
}
