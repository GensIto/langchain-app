import { createServerFn } from "@tanstack/react-start";
import {
  getCompanySchema,
  createCompanySchema,
  updateCompanySchema,
  deleteCompanySchema,
} from "./schemas";
import {
  getAllCompanies,
  getCompanyById,
  createNewCompany,
  updateExistingCompany,
  removeCompany,
} from "./company.server";
import { authMiddleware } from "@/lib/middleware";

export const getCompanies = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return getAllCompanies(context.session);
  });

export const getCompany = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(getCompanySchema)
  .handler(async ({ data, context }) => {
    return getCompanyById(data, context.session);
  });

export const createCompany = createServerFn({
  method: "POST",
})
  .inputValidator(createCompanySchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    return createNewCompany(data, context.session);
  });

export const updateCompany = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(updateCompanySchema)
  .handler(async ({ data, context }) => {
    return updateExistingCompany(data, context.session);
  });

export const deleteCompany = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(deleteCompanySchema)
  .handler(async ({ data, context }) => {
    return removeCompany(data, context.session);
  });
