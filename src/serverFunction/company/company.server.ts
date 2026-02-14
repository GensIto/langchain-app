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

export async function getAllCompanies(session: RequiredSession) {
	const result = await getDb()
		.select()
		.from(companies)
		.where(eq(companies.userId, session.user.id))
		.all();

	return result;
}

export async function getCompanyById(data: GetCompanyInput, session: RequiredSession) {
	const company = await getDb()
		.select()
		.from(companies)
		.where(and(eq(companies.id, data.id), eq(companies.userId, session.user.id)))
		.get();

	if (!company) {
		throw new Error("Company not found");
	}

	return company;
}

export async function createNewCompany(data: CreateCompanyInput, session: RequiredSession) {
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

	return company;
}

export async function updateExistingCompany(data: UpdateCompanyInput, session: RequiredSession) {
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
		throw new Error("Company not found");
	}

	return company;
}

export async function removeCompany(data: DeleteCompanyInput, session: RequiredSession) {
	const result = await getDb()
		.delete(companies)
		.where(and(eq(companies.id, data.id), eq(companies.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		throw new Error("Company not found");
	}

	return { success: true };
}
