import type { Company, Project } from "../types";

export type ProjectListProps = {
	projects: Project[];
	company: Company;
	companyId: string;
};
