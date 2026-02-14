import z from "zod";

export const getCompanySchema = z.object({
  id: z.string()
});

export const createCompanySchema = z.object({
  name: z.string().min(1).max(255)
});

export const updateCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
});

export const deleteCompanySchema = z.object({
  id: z.string()
});
