import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TagSelector } from "@/components/logs/TagSelector/TagSelector";
import type { Tag } from "@/components/logs/types";
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
import { generateEpisodeFromLog } from "@/serverFunction/episode/episode.functions";
import type { generateStarResponseSchema } from "@/serverFunction/episode/schemas";

import { useCreateEpisode } from "./hooks/useCreateEpisode";

import type { z } from "zod";

type GeneratedData = z.infer<typeof generateStarResponseSchema>;

type CreateEpisodeDialogProps = {
	logId: string;
	tags: Tag[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateEpisodeDialog({ logId, tags, open, onOpenChange }: CreateEpisodeDialogProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);

	useEffect(() => {
		const asyncGenerateEpisode = async () => {
			setIsGenerating(true);
			try {
				const data = await generateEpisodeFromLog({ data: { logId } });
				setGeneratedData(data);
			} catch {
				toast.error("エピソードの生成に失敗しました");
				onOpenChange(false);
			} finally {
				setIsGenerating(false);
			}
		};
		if (open && !generatedData && !isGenerating) {
			void asyncGenerateEpisode();
		}
		if (!open) {
			setGeneratedData(null);
		}
	}, [open, generatedData, isGenerating, logId, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				{isGenerating ? (
					<div className='flex flex-col items-center justify-center py-12'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4' />
						<p className='text-gray-400'>AIがエピソードを生成中...</p>
					</div>
				) : generatedData ? (
					<CreateEpisodeForm
						logId={logId}
						tags={tags}
						generatedData={generatedData}
						onSuccess={() => onOpenChange(false)}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

function CreateEpisodeForm({
	logId,
	tags,
	generatedData,
	onSuccess,
}: {
	logId: string;
	tags: Tag[];
	generatedData: GeneratedData;
	onSuccess: () => void;
}) {
	const { form, handleCreateTag } = useCreateEpisode(logId, generatedData, onSuccess);

	return (
		<>
			<DialogHeader>
				<DialogTitle>エピソード作成</DialogTitle>
				<DialogDescription>AIが生成した内容を確認・編集してください</DialogDescription>
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
								<Label htmlFor='episode-title'>タイトル</Label>
								<Input
									id='episode-title'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={form.state.isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
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
									onValueChange={(v) => field.handleChange(v as "low" | "medium" | "high")}
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
								<Label htmlFor='episode-situation'>Situation</Label>
								<Textarea
									id='episode-situation'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={6}
									disabled={form.state.isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='task'>
						{(field) => (
							<div className='grid gap-2'>
								<Label htmlFor='episode-task'>Task</Label>
								<Textarea
									id='episode-task'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={6}
									disabled={form.state.isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='action'>
						{(field) => (
							<div className='grid gap-2'>
								<Label htmlFor='episode-action'>Action</Label>
								<Textarea
									id='episode-action'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={6}
									disabled={form.state.isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='result'>
						{(field) => (
							<div className='grid gap-2'>
								<Label htmlFor='episode-result'>Result</Label>
								<Textarea
									id='episode-result'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={6}
									disabled={form.state.isSubmitting}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
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
					<Button variant='outline' type='button' onClick={onSuccess}>
						キャンセル
					</Button>
					<Button type='submit' disabled={form.state.isSubmitting}>
						{form.state.isSubmitting ? "作成中..." : "作成"}
					</Button>
				</DialogFooter>
			</form>
		</>
	);
}
