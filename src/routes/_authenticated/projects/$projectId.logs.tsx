import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	createLog,
	createTag,
	deleteLog,
	deleteTag,
	getLogs,
	getTags,
	updateLog,
	updateTag,
} from "@/serverFunction/log/log.functions";
import { getProject } from "@/serverFunction/project/project.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId/logs")({
	component: Logs,
	loader: async ({ params }) => {
		const project = await getProject({ data: { id: params.projectId } });
		const logs = await getLogs({ data: { projectId: params.projectId } });
		const tags = await getTags({ data: {} });
		return { project, logs, tags };
	},
});

type LogWithTags = {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	tags: { id: string; name: string }[];
};

function Logs() {
	const { project, logs, tags } = Route.useLoaderData();
	const { projectId } = Route.useParams();
	const navigate = useNavigate();
	const router = useRouter();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isTagManageOpen, setIsTagManageOpen] = useState(false);
	const [editingLog, setEditingLog] = useState<LogWithTags | null>(null);
	const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
	const [logContent, setLogContent] = useState("");
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [editTagName, setEditTagName] = useState("");
	const [previewContent, setPreviewContent] = useState("");

	const handleCreate = async () => {
		try {
			await createLog({
				data: {
					projectId,
					content: logContent,
					tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
				},
			});
			toast.success("ログを作成しました");
			setIsCreateOpen(false);
			setLogContent("");
			setSelectedTagIds([]);
			void router.invalidate();
		} catch (error) {
			toast.error("ログの作成に失敗しました");
			console.error(error);
		}
	};

	const handleEdit = async () => {
		if (!editingLog) return;
		try {
			await updateLog({
				data: {
					id: editingLog.id,
					content: logContent,
					tagIds: selectedTagIds,
				},
			});
			toast.success("ログを更新しました");
			setIsEditOpen(false);
			setEditingLog(null);
			setLogContent("");
			setSelectedTagIds([]);
			void router.invalidate();
		} catch (error) {
			toast.error("ログの更新に失敗しました");
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("このログを削除しますか?")) return;
		try {
			await deleteLog({ data: { id } });
			toast.success("ログを削除しました");
			void router.invalidate();
		} catch (error) {
			toast.error("ログの削除に失敗しました");
			console.error(error);
		}
	};

	const handleCreateTag = async () => {
		if (!newTagName.trim()) return;
		try {
			await createTag({ data: { name: newTagName } });
			toast.success("タグを作成しました");
			setNewTagName("");
			void router.invalidate();
		} catch (error) {
			toast.error("タグの作成に失敗しました");
			console.error(error);
		}
	};

	const handleUpdateTag = async () => {
		if (!(editingTag && editTagName.trim())) return;
		try {
			await updateTag({ data: { id: editingTag.id, name: editTagName } });
			toast.success("タグを更新しました");
			setEditingTag(null);
			setEditTagName("");
			void router.invalidate();
		} catch (error) {
			toast.error("タグの更新に失敗しました");
			console.error(error);
		}
	};

	const handleDeleteTag = async (id: string) => {
		if (!confirm("このタグを削除しますか?")) return;
		try {
			await deleteTag({ data: { id } });
			toast.success("タグを削除しました");
			void router.invalidate();
		} catch (error) {
			toast.error("タグの削除に失敗しました");
			console.error(error);
		}
	};

	const openEditDialog = (log: LogWithTags) => {
		setEditingLog(log);
		setLogContent(log.content);
		setSelectedTagIds(log.tags.map((t) => t.id));
		setIsEditOpen(true);
	};

	const openPreviewDialog = (content: string) => {
		setPreviewContent(content);
		setIsPreviewOpen(true);
	};

	const toggleTag = (tagId: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
		);
	};

	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<div className='container mx-auto py-8 px-4'>
				<div className='mb-6'>
					<Button variant='outline' onClick={() => navigate({ to: "/companies" })} className='mb-4'>
						← プロジェクト一覧に戻る
					</Button>
					<h2 className='text-2xl font-semibold text-gray-300'>{project.name}</h2>
				</div>

				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold text-white'>ログ一覧</h1>
					<div className='flex gap-2'>
						<Dialog open={isTagManageOpen} onOpenChange={setIsTagManageOpen}>
							<DialogTrigger asChild>
								<Button variant='outline'>タグ管理</Button>
							</DialogTrigger>
							<DialogContent className='max-w-2xl'>
								<DialogHeader>
									<DialogTitle>タグ管理</DialogTitle>
									<DialogDescription>タグの編集・削除ができます</DialogDescription>
								</DialogHeader>
								<div className='py-4'>
									<div className='space-y-2'>
										{tags.map((tag) => (
											<div
												key={tag.id}
												className='flex items-center justify-between p-3 border rounded-md'
											>
												{editingTag?.id === tag.id ? (
													<div className='flex items-center gap-2 flex-1'>
														<Input
															value={editTagName}
															onChange={(e) => setEditTagName(e.target.value)}
															placeholder='タグ名'
															className='flex-1'
														/>
														<Button size='sm' onClick={handleUpdateTag}>
															保存
														</Button>
														<Button
															size='sm'
															variant='outline'
															onClick={() => {
																setEditingTag(null);
																setEditTagName("");
															}}
														>
															キャンセル
														</Button>
													</div>
												) : (
													<>
														<Badge variant='secondary'>{tag.name}</Badge>
														<div className='flex gap-2'>
															<Button
																size='sm'
																variant='outline'
																onClick={() => {
																	setEditingTag(tag);
																	setEditTagName(tag.name);
																}}
															>
																編集
															</Button>
															<Button
																size='sm'
																variant='destructive'
																onClick={() => handleDeleteTag(tag.id)}
															>
																削除
															</Button>
														</div>
													</>
												)}
											</div>
										))}
										{tags.length === 0 && (
											<p className='text-center text-gray-500 py-4'>タグがありません</p>
										)}
									</div>
								</div>
								<DialogFooter>
									<Button onClick={() => setIsTagManageOpen(false)}>閉じる</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
							<DialogTrigger asChild>
								<Button>新規作成</Button>
							</DialogTrigger>
							<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
								<DialogHeader>
									<DialogTitle>ログを作成</DialogTitle>
									<DialogDescription>新しいログをMarkdown形式で入力してください</DialogDescription>
								</DialogHeader>
								<div className='grid gap-4 py-4'>
									<div className='grid gap-2'>
										<div className='flex justify-between items-center'>
											<Label htmlFor='content'>内容 (Markdown)</Label>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={() => openPreviewDialog(logContent)}
											>
												プレビュー
											</Button>
										</div>
										<Textarea
											id='content'
											value={logContent}
											onChange={(e) => setLogContent(e.target.value)}
											placeholder='# 見出し&#10;&#10;内容をMarkdownで記述してください...'
											rows={12}
											className='font-mono'
										/>
									</div>
									<div className='grid gap-2'>
										<Label>タグ</Label>
										<div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]'>
											{tags.map((tag) => (
												<Badge
													key={tag.id}
													variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
													className='cursor-pointer'
													onClick={() => toggleTag(tag.id)}
												>
													{tag.name}
												</Badge>
											))}
										</div>
										<div className='flex gap-2 mt-2'>
											<Input
												placeholder='新しいタグ名'
												value={newTagName}
												onChange={(e) => setNewTagName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														void handleCreateTag();
													}
												}}
											/>
											<Button type='button' onClick={handleCreateTag} size='sm'>
												追加
											</Button>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button variant='outline' onClick={() => setIsCreateOpen(false)}>
										キャンセル
									</Button>
									<Button onClick={handleCreate}>作成</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-6'>
					{logs.map((log) => (
						<Card key={log.id} className='hover:shadow-lg transition-shadow'>
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
										<Button
											variant='outline'
											size='sm'
											onClick={() => openPreviewDialog(log.content)}
										>
											プレビュー
										</Button>
										<Button variant='outline' size='sm' onClick={() => openEditDialog(log)}>
											編集
										</Button>
										<Button variant='destructive' size='sm' onClick={() => handleDelete(log.id)}>
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
					))}
				</div>

				{logs.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-400 mb-4'>まだログが登録されていません</p>
						<Button onClick={() => setIsCreateOpen(true)}>最初のログを作成</Button>
					</div>
				)}

				{/* Edit Dialog */}
				<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>ログを編集</DialogTitle>
							<DialogDescription>ログの内容を変更してください</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<div className='flex justify-between items-center'>
									<Label htmlFor='edit-content'>内容 (Markdown)</Label>
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => openPreviewDialog(logContent)}
									>
										プレビュー
									</Button>
								</div>
								<Textarea
									id='edit-content'
									value={logContent}
									onChange={(e) => setLogContent(e.target.value)}
									placeholder='# 見出し&#10;&#10;内容をMarkdownで記述してください...'
									rows={12}
									className='font-mono'
								/>
							</div>
							<div className='grid gap-2'>
								<Label>タグ</Label>
								<div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]'>
									{tags.map((tag) => (
										<Badge
											key={tag.id}
											variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
											className='cursor-pointer'
											onClick={() => toggleTag(tag.id)}
										>
											{tag.name}
										</Badge>
									))}
								</div>
								<div className='flex gap-2 mt-2'>
									<Input
										placeholder='新しいタグ名'
										value={newTagName}
										onChange={(e) => setNewTagName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												void handleCreateTag();
											}
										}}
									/>
									<Button type='button' onClick={handleCreateTag} size='sm'>
										追加
									</Button>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant='outline' onClick={() => setIsEditOpen(false)}>
								キャンセル
							</Button>
							<Button onClick={handleEdit}>更新</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Preview Dialog */}
				<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>プレビュー</DialogTitle>
							<DialogDescription>Markdownのレンダリング結果を確認できます</DialogDescription>
						</DialogHeader>
						<div className='py-4'>
							<div className='prose prose-sm max-w-none dark:prose-invert border rounded-md p-4 bg-white dark:bg-slate-800'>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent}</ReactMarkdown>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => setIsPreviewOpen(false)}>閉じる</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
