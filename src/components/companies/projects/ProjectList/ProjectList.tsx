import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { CreateProjectDialog, useCreateProject } from "../CreateProjectDialog";
import { EditProjectDialog, useEditProject } from "../EditProjectDialog";
import { EmptyState } from "../EmptyState";
import { ProjectCard, useDeleteProject } from "../ProjectCard";

import { LABELS } from "./constants";

import type { ProjectListProps } from "./types";

export function ProjectList({ projects, company, companyId }: ProjectListProps) {
	const navigate = useNavigate();
	const createProject = useCreateProject({ companyId });
	const editProject = useEditProject();
	const { handleDelete } = useDeleteProject();

	const handleNavigateToLogs = (projectId: string) => {
		void navigate({
			to: "/projects/$projectId/logs",
			params: { projectId },
		});
	};

	const handleNavigateBack = () => {
		void navigate({ to: "/companies" });
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='mb-6'>
					<Button variant='outline' onClick={handleNavigateBack} className='mb-4'>
						{LABELS.backToCompanies}
					</Button>
					<h2 className='text-2xl font-semibold text-gray-300'>{company.name}</h2>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-white'>{LABELS.pageTitle}</h1>
					<CreateProjectDialog
						isOpen={createProject.isOpen}
						onOpenChange={createProject.setIsOpen}
						projectName={createProject.projectName}
						onProjectNameChange={createProject.setProjectName}
						projectDescription={createProject.projectDescription}
						onProjectDescriptionChange={createProject.setProjectDescription}
						onSubmit={createProject.handleCreate}
						onCancel={() => createProject.setIsOpen(false)}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onEdit={editProject.openEditDialog}
							onDelete={handleDelete}
							onNavigateToLogs={handleNavigateToLogs}
						/>
					))}
				</div>

				{projects.length === 0 && (
					<EmptyState onCreateClick={() => createProject.setIsOpen(true)} />
				)}

				<EditProjectDialog
					isOpen={editProject.isOpen}
					onOpenChange={editProject.setIsOpen}
					projectName={editProject.projectName}
					onProjectNameChange={editProject.setProjectName}
					projectDescription={editProject.projectDescription}
					onProjectDescriptionChange={editProject.setProjectDescription}
					onSubmit={editProject.handleEdit}
					onCancel={() => editProject.setIsOpen(false)}
				/>
			</div>
		</div>
	);
}
