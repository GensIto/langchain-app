import { createFileRoute } from "@tanstack/react-router";

import { ProjectList } from "@/components/companies/projects";
import { getCompany } from "@/serverFunction/company/company.functions";
import { getProjects } from "@/serverFunction/project/project.functions";

export const Route = createFileRoute("/_authenticated/companies/$companyId/projects")({
	component: Projects,
	loader: async ({ params }) => {
		const company = await getCompany({ data: { id: params.companyId } });
		const projects = await getProjects({
			data: { companyId: params.companyId },
		});
		return { company, projects };
	},
});

function Projects() {
	const { company, projects } = Route.useLoaderData();
	const { companyId } = Route.useParams();

	return <ProjectList projects={projects} company={company} companyId={companyId} />;
}
