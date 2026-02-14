import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDate } from "./functions/formatDate";
import { useDeleteProject } from "./hooks/useDeleteProject";

import type { ProjectCardProps } from "./types";

export function ProjectCard({ project, onEdit, onNavigateToLogs }: ProjectCardProps) {
	const { handleDelete } = useDeleteProject();

	return (
		<Card className='hover:shadow-lg transition-shadow'>
			<CardHeader>
				<CardTitle>{project.name}</CardTitle>
				<CardDescription>{project.description || "説明なし"}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='mb-4 text-sm text-gray-500'>作成日: {formatDate(project.createdAt)}</div>
				<div className='flex gap-2 mb-2'>
					<Button
						variant='default'
						size='sm'
						onClick={() => onNavigateToLogs(project.id)}
						className='w-full'
					>
						ログを見る
					</Button>
				</div>
				<div className='flex gap-2'>
					<Button variant='outline' size='sm' onClick={() => onEdit(project)}>
						編集
					</Button>
					<Button variant='destructive' size='sm' onClick={() => void handleDelete(project.id)}>
						削除
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
