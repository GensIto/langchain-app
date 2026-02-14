import { createFileRoute } from "@tanstack/react-router";

import { CompanyList } from "@/components/companies/companyList";
import { getCompanies } from "@/serverFunction/company/company.functions";

export const Route = createFileRoute("/_authenticated/companies/")({
	component: Companies,
	loader: async () => {
		const companies = await getCompanies();
		return { companies };
	},
});

function Companies() {
	const { companies } = Route.useLoaderData();
	return <CompanyList companies={companies} />;
}
