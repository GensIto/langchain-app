import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreateProjectDialog } from "../CreateProjectDialog";
import { EditProjectDialog } from "../EditProjectDialog";
import { EmptyState } from "../EmptyState";
import { ProjectCard } from "../ProjectCard";

import type { EditableProject } from "../types";
import type { ProjectListProps } from "./types";

export function ProjectList({ projects, company, companyId }: ProjectListProps) {
	const navigate = useNavigate();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<EditableProject | null>(null);

	const handleNavigateToLogs = (projectId: string) => {
		void navigate({
			to: "/projects/$projectId/logs",
			params: { projectId },
		});
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='mb-6'>
					<Button
						variant='outline'
						onClick={() => void navigate({ to: "/companies" })}
						className='mb-4'
					>
						← 会社一覧に戻る
					</Button>
					<h2 className='text-2xl font-semibold text-gray-300'>{company.name}</h2>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-white'>プロジェクト一覧</h1>
					<CreateProjectDialog
						companyId={companyId}
						open={isCreateOpen}
						onOpenChange={setIsCreateOpen}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onEdit={setEditingProject}
							onNavigateToLogs={handleNavigateToLogs}
						/>
					))}
				</div>

				{projects.length === 0 && <EmptyState onCreateClick={() => setIsCreateOpen(true)} />}

				<EditProjectDialog
					key={editingProject?.id}
					project={editingProject}
					onClose={() => setEditingProject(null)}
				/>
			</div>
		</div>
	);
}
