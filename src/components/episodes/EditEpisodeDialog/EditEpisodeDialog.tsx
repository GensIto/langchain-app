import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { TagSelector } from "@/components/logs/TagSelector/TagSelector";

import { useEditEpisode } from "./hooks/useEditEpisode";

import type { Tag } from "@/components/logs/types";
import type { EpisodeWithTags } from "../types";

type EditEpisodeDialogProps = {
	episode: EpisodeWithTags | null;
	tags: Tag[];
	onClose: () => void;
};

export function EditEpisodeDialog({ episode, tags, onClose }: EditEpisodeDialogProps) {
	const { form, handleCreateTag } = useEditEpisode(episode, onClose);

	return (
		<Dialog open={episode !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>エピソードを編集</DialogTitle>
					<DialogDescription>エピソードの内容を変更してください</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className='grid gap-4 py-4'>
						<form.Field name='title'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-episode-title'>タイトル</Label>
									<Input
										id='edit-episode-title'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name='impactLevel'>
							{(field) => (
								<div className='grid gap-2'>
									<Label>影響度</Label>
									<Select
										value={field.state.value}
										onValueChange={(v) =>
											field.handleChange(v as "low" | "medium" | "high")
										}
										disabled={form.state.isSubmitting}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='low'>Low</SelectItem>
											<SelectItem value='medium'>Medium</SelectItem>
											<SelectItem value='high'>High</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name='situation'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-episode-situation'>Situation</Label>
									<Textarea
										id='edit-episode-situation'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={6}
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name='task'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-episode-task'>Task</Label>
									<Textarea
										id='edit-episode-task'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={6}
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name='action'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-episode-action'>Action</Label>
									<Textarea
										id='edit-episode-action'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={6}
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name='result'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-episode-result'>Result</Label>
									<Textarea
										id='edit-episode-result'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={6}
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
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
