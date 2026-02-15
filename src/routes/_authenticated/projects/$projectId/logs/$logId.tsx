import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { EditLogDialog } from "@/components/logs/EditLogDialog";
import type { LogWithTags } from "@/components/logs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteLog, getLog } from "@/serverFunction/log/log.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId/logs/$logId")({
	component: LogDetail,
	loader: async ({ params }) => {
		const log = await getLog({ data: { id: params.logId } });
		return { log, tags: log.tags };
	},
});

function LogDetail() {
	const { log, tags } = Route.useLoaderData();
	const { projectId } = Route.useParams();
	const navigate = useNavigate();
	const [editingLog, setEditingLog] = useState<LogWithTags | null>(null);

	const handleDelete = async () => {
		if (!confirm("このログを削除しますか？")) return;
		try {
			await deleteLog({ data: { id: log.id } });
			toast.success("ログを削除しました");
			await navigate({ to: "/projects/$projectId/logs", params: { projectId } });
		} catch (error) {
			toast.error("ログの削除に失敗しました");
			console.error(error);
		}
	};

	const handleCreateEpisode = () => {
		// TODO: Implement episode creation
		toast.info("エピソード作成機能は現在未実装です");
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='mb-6'>
					<Button
						variant='outline'
						onClick={() =>
							void navigate({ to: "/projects/$projectId/logs", params: { projectId } })
						}
						className='mb-4'
					>
						← ログ一覧に戻る
					</Button>
				</div>

				<Card className='mb-6'>
					<CardHeader>
						<div className='flex justify-between items-start mb-4'>
							<div className='flex-1'>
								<CardTitle className='text-2xl mb-2'>ログ詳細</CardTitle>
								<CardDescription>
									作成日: {new Date(log.createdAt).toLocaleString("ja-JP")}
								</CardDescription>
							</div>
							<div className='flex gap-2'>
								<Button variant='outline' onClick={handleCreateEpisode}>
									エピソード作成
								</Button>
								<Button variant='outline' onClick={() => setEditingLog(log)}>
									編集
								</Button>
								<Button variant='destructive' onClick={() => void handleDelete()}>
									削除
								</Button>
							</div>
						</div>
						<div className='flex flex-wrap gap-2'>
							{log.tags.map((tag) => (
								<Badge key={tag.id} variant='secondary'>
									{tag.name}
								</Badge>
							))}
						</div>
					</CardHeader>
					<CardContent>
						<div className='prose prose-lg max-w-none dark:prose-invert border rounded-md p-6 bg-white dark:bg-slate-800'>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{log.content}</ReactMarkdown>
						</div>
					</CardContent>
				</Card>

				<EditLogDialog
					key={editingLog?.id}
					log={editingLog}
					tags={tags}
					onClose={() => setEditingLog(null)}
				/>
			</div>
		</div>
	);
}
