import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { TagSelector } from "../TagSelector";

import { useEditLog } from "./hooks/useEditLog";

import type { LogWithTags, Tag } from "../types";

type EditLogDialogProps = {
	log: LogWithTags | null;
	tags: Tag[];
	onClose: () => void;
	onPreview: (content: string) => void;
};

export function EditLogDialog({ log, tags, onClose, onPreview }: EditLogDialogProps) {
	const { form, handleCreateTag } = useEditLog(log, onClose);

	return (
		<Dialog open={log !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>ログを編集</DialogTitle>
					<DialogDescription>ログの内容を変更してください</DialogDescription>
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
									<div className='flex justify-between items-center'>
										<Label htmlFor='edit-content'>内容 (Markdown)</Label>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => onPreview(field.state.value)}
										>
											プレビュー
										</Button>
									</div>
									<Textarea
										id='edit-content'
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
						<Button variant='outline' type='button' onClick={onClose}>
							キャンセル
						</Button>
						<Button type='submit' disabled={form.state.isSubmitting}>
							{form.state.isSubmitting ? "更新中..." : "更新"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
