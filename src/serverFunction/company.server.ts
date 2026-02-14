import { getDb } from "@/db";
import { companies } from "@/db/companies";
import { auth } from "@/lib/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq, and } from "drizzle-orm";
import z from "zod";

export const getCompanies = createServerFn({
  method: "GET",
}).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const result = await getDb()
    .select()
    .from(companies)
    .where(eq(companies.userId, session.user.id))
    .all();

  return result;
});

export const getCompany = createServerFn({
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

    const company = await getDb()
      .select()
      .from(companies)
      .where(
        and(eq(companies.id, data.id), eq(companies.userId, session.user.id)),
      )
      .get();

    if (!company) {
      throw new Error("Company not found");
    }

    return company;
  });

export const createCompany = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ name: z.string().min(1).max(255) }))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

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
  });

export const updateCompany = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(255),
    }),
  )
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    });
    if (!session) {
      throw new Error("Unauthorized");
    }

    const company = await getDb()
      .update(companies)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(
        and(eq(companies.id, data.id), eq(companies.userId, session.user.id)),
      )
      .returning()
      .get();

    if (!company) {
      throw new Error("Company not found");
    }

    return company;
  });

export const deleteCompany = createServerFn({
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
      .delete(companies)
      .where(
        and(eq(companies.id, data.id), eq(companies.userId, session.user.id)),
      )
      .returning()
      .get();

    if (!result) {
      throw new Error("Company not found");
    }

    return { success: true };
  });
