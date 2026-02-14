import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

import { useDeleteLog } from "./hooks/useDeleteLog";

import type { LogWithTags } from "../types";

type LogCardProps = {
	log: LogWithTags;
	onPreview: (content: string) => void;
	onEdit: (log: LogWithTags) => void;
};

export function LogCard({ log, onPreview, onEdit }: LogCardProps) {
	const { handleDelete } = useDeleteLog();

	return (
		<Card className='hover:shadow-lg transition-shadow'>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div className='flex-1'>
						<CardDescription className='mb-2'>
							作成日: {new Date(log.createdAt).toLocaleString("ja-JP")}
						</CardDescription>
						<div className='flex flex-wrap gap-2 mb-2'>
							{log.tags.map((tag) => (
								<Badge key={tag.id} variant='secondary'>
									{tag.name}
								</Badge>
							))}
						</div>
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' size='sm' onClick={() => onPreview(log.content)}>
							プレビュー
						</Button>
						<Button variant='outline' size='sm' onClick={() => onEdit(log)}>
							編集
						</Button>
						<Button variant='destructive' size='sm' onClick={() => void handleDelete(log.id)}>
							削除
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className='prose prose-sm max-w-none dark:prose-invert line-clamp-3'>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{log.content}</ReactMarkdown>
				</div>
			</CardContent>
		</Card>
	);
}
