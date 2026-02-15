import { useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

import type { LogWithTags } from "../types";

type LogCardProps = {
	log: LogWithTags;
	projectId: string;
};

export function LogCard({ log, projectId }: LogCardProps) {
	const navigate = useNavigate();

	const handleViewDetail = () => {
		void navigate({
			to: "/projects/$projectId/logs/$logId",
			params: { projectId, logId: log.id },
		});
	};

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
						<Button variant='outline' size='sm' onClick={handleViewDetail}>
							詳細を見る
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
