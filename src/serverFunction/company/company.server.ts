import { getLogger } from "@logtape/logtape";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { companies } from "@/db/companies";
import type { RequiredSession } from "@/lib/auth";

import type {
	CreateCompanyInput,
	DeleteCompanyInput,
	GetCompanyInput,
	UpdateCompanyInput,
} from "./schemas";

const logger = getLogger(["app", "company"]);

export async function getAllCompanies(session: RequiredSession) {
	logger.info("Fetching all companies for user {userId}", { userId: session.user.id });

	const result = await getDb()
		.select()
		.from(companies)
		.where(eq(companies.userId, session.user.id))
		.all();

	logger.info("Fetched {count} companies", { count: result.length });

	return result;
}

export async function getCompanyById(data: GetCompanyInput, session: RequiredSession) {
	logger.info("Fetching company {companyId}", { companyId: data.id, userId: session.user.id });

	const company = await getDb()
		.select()
		.from(companies)
		.where(and(eq(companies.id, data.id), eq(companies.userId, session.user.id)))
		.get();

	if (!company) {
		logger.warn("Company not found: {companyId}", { companyId: data.id });
		throw new Error("Company not found");
	}

	return company;
}

export async function createNewCompany(data: CreateCompanyInput, session: RequiredSession) {
	logger.info("Creating company {name}", { name: data.name, userId: session.user.id });

	const company = await getDb()
		.insert(companies)
		.values({
			id: crypto.randomUUID(),
			name: data.name,
			userId: session.user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();

	logger.info("Company created: {companyId}", { companyId: company.id });

	return company;
}

export async function updateExistingCompany(data: UpdateCompanyInput, session: RequiredSession) {
	logger.info("Updating company {companyId}", { companyId: data.id, userId: session.user.id });

	const company = await getDb()
		.update(companies)
		.set({
			name: data.name,
			updatedAt: new Date(),
		})
		.where(and(eq(companies.id, data.id), eq(companies.userId, session.user.id)))
		.returning()
		.get();

	if (!company) {
		logger.warn("Company not found for update: {companyId}", { companyId: data.id });
		throw new Error("Company not found");
	}

	logger.info("Company updated: {companyId}", { companyId: company.id });

	return company;
}

export async function removeCompany(data: DeleteCompanyInput, session: RequiredSession) {
	logger.info("Removing company {companyId}", { companyId: data.id, userId: session.user.id });

	const result = await getDb()
		.delete(companies)
		.where(and(eq(companies.id, data.id), eq(companies.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Company not found for removal: {companyId}", { companyId: data.id });
		throw new Error("Company not found");
	}

	logger.info("Company removed: {companyId}", { companyId: data.id });

	return { success: true };
}
