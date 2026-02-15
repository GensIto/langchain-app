import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { TagSelector } from "../TagSelector";

import { useCreateLog } from "./hooks/useCreateLog";

import type { Tag } from "../types";

type CreateLogDialogProps = {
	projectId: string;
	tags: Tag[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateLogDialog({ projectId, tags, open, onOpenChange }: CreateLogDialogProps) {
	const { form, handleCreateTag } = useCreateLog({
		projectId,
		onSuccess: () => onOpenChange(false),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>新規作成</Button>
			</DialogTrigger>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>ログを作成</DialogTitle>
					<DialogDescription>新しいログをMarkdown形式で入力してください</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className='grid gap-4 py-4'>
						<form.Field name='content'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='content'>内容 (Markdown)</Label>
									<Textarea
										id='content'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder='# 見出し&#10;&#10;内容をMarkdownで記述してください...'
										rows={12}
										className='font-mono'
									/>
								</div>
							)}
						</form.Field>
						<form.Field name='tagIds'>
							{(field) => (
								<div className='grid gap-2'>
									<Label>タグ</Label>
									<TagSelector
										tags={tags}
										selectedTagIds={field.state.value}
										onToggle={(tagId) => {
											const current = field.state.value;
											field.handleChange(
												current.includes(tagId)
													? current.filter((id) => id !== tagId)
													: [...current, tagId],
											);
										}}
										onCreateTag={handleCreateTag}
									/>
								</div>
							)}
						</form.Field>
					</div>
					<DialogFooter>
						<Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
							キャンセル
						</Button>
						<Button type='submit' disabled={form.state.isSubmitting}>
							{form.state.isSubmitting ? "作成中..." : "作成"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
