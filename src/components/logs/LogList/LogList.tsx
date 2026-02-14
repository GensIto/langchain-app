import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreateLogDialog } from "../CreateLogDialog";
import { EditLogDialog } from "../EditLogDialog";
import { EmptyState } from "../EmptyState";
import { LogCard } from "../LogCard";
import { PreviewDialog } from "../PreviewDialog";
import { TagManagementDialog } from "../TagManagementDialog";

import type { LogWithTags, Tag } from "../types";

type LogListProps = {
	projectName: string;
	projectId: string;
	logs: LogWithTags[];
	tags: Tag[];
};

export function LogList({ projectName, projectId, logs, tags }: LogListProps) {
	const navigate = useNavigate();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingLog, setEditingLog] = useState<LogWithTags | null>(null);
	const [isTagManageOpen, setIsTagManageOpen] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [previewContent, setPreviewContent] = useState("");

	const openPreview = (content: string) => {
		setPreviewContent(content);
		setIsPreviewOpen(true);
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
						← プロジェクト一覧に戻る
					</Button>
					<h2 className='text-2xl font-semibold text-gray-300'>{projectName}</h2>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-white'>ログ一覧</h1>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={() => setIsTagManageOpen(true)}>
							タグ管理
						</Button>
						<CreateLogDialog
							projectId={projectId}
							tags={tags}
							open={isCreateOpen}
							onOpenChange={setIsCreateOpen}
							onPreview={openPreview}
						/>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-6'>
					{logs.map((log) => (
						<LogCard key={log.id} log={log} onPreview={openPreview} onEdit={setEditingLog} />
					))}
				</div>

				{logs.length === 0 && <EmptyState onCreateClick={() => setIsCreateOpen(true)} />}

				<EditLogDialog
					key={editingLog?.id}
					log={editingLog}
					tags={tags}
					onClose={() => setEditingLog(null)}
					onPreview={openPreview}
				/>

				<TagManagementDialog tags={tags} open={isTagManageOpen} onOpenChange={setIsTagManageOpen} />

				<PreviewDialog
					content={previewContent}
					open={isPreviewOpen}
					onOpenChange={setIsPreviewOpen}
				/>
			</div>
		</div>
	);
}
