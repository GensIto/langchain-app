import { getLogger } from "@logtape/logtape";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { companies } from "@/db/companies";
import { projects } from "@/db/projects";
import type { RequiredSession } from "@/lib/auth";

import type {
	CreateProjectInput,
	DeleteProjectInput,
	GetProjectInput,
	GetProjectsInput,
	UpdateProjectInput,
} from "./schemas";

const logger = getLogger(["app", "project"]);

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

export async function getAllProjects(data: GetProjectsInput, session: RequiredSession) {
	logger.info("Fetching all projects for company {companyId}", {
		companyId: data.companyId,
		userId: session.user.id,
	});

	// Verify company ownership
	await verifyCompanyOwnership(data.companyId, session.user.id);

	const result = await getDb()
		.select()
		.from(projects)
		.where(and(eq(projects.companyId, data.companyId), eq(projects.userId, session.user.id)))
		.all();

	logger.info("Fetched {count} projects", { count: result.length });

	return result;
}

export async function getProjectById(data: GetProjectInput, session: RequiredSession) {
	logger.info("Fetching project {projectId}", { projectId: data.id, userId: session.user.id });

	const project = await getDb()
		.select()
		.from(projects)
		.where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
		.get();

	if (!project) {
		logger.warn("Project not found: {projectId}", { projectId: data.id });
		throw new Error("Project not found");
	}

	return project;
}

export async function createNewProject(data: CreateProjectInput, session: RequiredSession) {
	logger.info("Creating project {name} for company {companyId}", {
		name: data.name,
		companyId: data.companyId,
		userId: session.user.id,
	});

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

	logger.info("Project created: {projectId}", { projectId: project.id });

	return project;
}

export async function updateExistingProject(data: UpdateProjectInput, session: RequiredSession) {
	logger.info("Updating project {projectId}", { projectId: data.id, userId: session.user.id });

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
		logger.warn("Project not found for update: {projectId}", { projectId: data.id });
		throw new Error("Project not found");
	}

	logger.info("Project updated: {projectId}", { projectId: project.id });

	return project;
}

export async function removeProject(data: DeleteProjectInput, session: RequiredSession) {
	logger.info("Removing project {projectId}", { projectId: data.id, userId: session.user.id });

	const result = await getDb()
		.delete(projects)
		.where(and(eq(projects.id, data.id), eq(projects.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Project not found for removal: {projectId}", { projectId: data.id });
		throw new Error("Project not found");
	}

	logger.info("Project removed: {projectId}", { projectId: data.id });

	return { success: true };
}
