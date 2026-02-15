import { createFileRoute } from "@tanstack/react-router";

import { LogList } from "@/components/logs";
import { getLogs, getTags } from "@/serverFunction/log/log.functions";
import { getProject } from "@/serverFunction/project/project.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId/logs/")({
	component: Logs,
	loader: async ({ params }) => {
		const project = await getProject({ data: { id: params.projectId } });
		const logs = await getLogs({ data: { projectId: params.projectId } });
		const tags = await getTags({ data: {} });
		return { project, logs, tags };
	},
});

function Logs() {
	const { project, logs, tags } = Route.useLoaderData();
	const { projectId } = Route.useParams();
	return <LogList projectName={project.name} projectId={projectId} logs={logs} tags={tags} />;
}
