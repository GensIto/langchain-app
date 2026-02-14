import { Badge } from "@/components/ui/badge";
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

import { useTagManagement } from "./hooks/useTagManagement";

import type { Tag } from "../types";

type TagManagementDialogProps = {
	tags: Tag[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function TagManagementDialog({ tags, open, onOpenChange }: TagManagementDialogProps) {
	const {
		editingTag,
		editTagName,
		setEditTagName,
		newTagName,
		setNewTagName,
		handleCreateTag,
		handleUpdateTag,
		handleDeleteTag,
		startEditing,
		cancelEditing,
	} = useTagManagement();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>タグ管理</DialogTitle>
					<DialogDescription>タグの作成・編集・削除ができます</DialogDescription>
				</DialogHeader>
				<div className='py-4'>
					<div className='flex gap-2 mb-4'>
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
						<Button onClick={() => void handleCreateTag()} size='sm'>
							追加
						</Button>
					</div>
					<div className='space-y-2'>
						{tags.map((tag) => (
							<div key={tag.id} className='flex items-center justify-between p-3 border rounded-md'>
								{editingTag?.id === tag.id ? (
									<div className='flex items-center gap-2 flex-1'>
										<Input
											value={editTagName}
											onChange={(e) => setEditTagName(e.target.value)}
											placeholder='タグ名'
											className='flex-1'
										/>
										<Button size='sm' onClick={() => void handleUpdateTag()}>
											保存
										</Button>
										<Button size='sm' variant='outline' onClick={cancelEditing}>
											キャンセル
										</Button>
									</div>
								) : (
									<>
										<Badge variant='secondary'>{tag.name}</Badge>
										<div className='flex gap-2'>
											<Button size='sm' variant='outline' onClick={() => startEditing(tag)}>
												編集
											</Button>
											<Button
												size='sm'
												variant='destructive'
												onClick={() => void handleDeleteTag(tag.id)}
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
					<Button onClick={() => onOpenChange(false)}>閉じる</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
