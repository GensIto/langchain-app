import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type PreviewDialogProps = {
	content: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function PreviewDialog({ content, open, onOpenChange }: PreviewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>プレビュー</DialogTitle>
					<DialogDescription>Markdownのレンダリング結果を確認できます</DialogDescription>
				</DialogHeader>
				<div className='py-4'>
					<div className='prose prose-sm max-w-none dark:prose-invert border rounded-md p-4 bg-white dark:bg-slate-800'>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>閉じる</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
