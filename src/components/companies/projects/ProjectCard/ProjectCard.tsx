import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LABELS } from "./constants";
import { formatDate } from "./functions/formatDate";

import type { ProjectCardProps } from "./types";

export function ProjectCard({ project, onEdit, onDelete, onNavigateToLogs }: ProjectCardProps) {
	return (
		<Card className='hover:shadow-lg transition-shadow'>
			<CardHeader>
				<CardTitle>{project.name}</CardTitle>
				<CardDescription>{project.description || LABELS.noDescription}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='mb-4 text-sm text-gray-500'>
					{LABELS.createdDate} {formatDate(project.createdAt)}
				</div>
				<div className='flex gap-2 mb-2'>
					<Button
						variant='default'
						size='sm'
						onClick={() => onNavigateToLogs(project.id)}
						className='w-full'
					>
						{LABELS.viewLogs}
					</Button>
				</div>
				<div className='flex gap-2'>
					<Button variant='outline' size='sm' onClick={() => onEdit(project)}>
						{LABELS.editButton}
					</Button>
					<Button variant='destructive' size='sm' onClick={() => onDelete(project.id)}>
						{LABELS.deleteButton}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
