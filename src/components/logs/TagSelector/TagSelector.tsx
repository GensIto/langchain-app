import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Tag } from "../types";

type TagSelectorProps = {
	tags: Tag[];
	selectedTagIds: string[];
	onToggle: (tagId: string) => void;
	onCreateTag: (name: string) => Promise<void>;
};

export function TagSelector({ tags, selectedTagIds, onToggle, onCreateTag }: TagSelectorProps) {
	const [newTagName, setNewTagName] = useState("");

	const handleCreate = async () => {
		if (!newTagName.trim()) return;
		await onCreateTag(newTagName);
		setNewTagName("");
	};

	return (
		<div className='grid gap-2'>
			<div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]'>
				{tags.map((tag) => (
					<Badge
						key={tag.id}
						variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
						className='cursor-pointer'
						onClick={() => onToggle(tag.id)}
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
							void handleCreate();
						}
					}}
				/>
				<Button type='button' onClick={() => void handleCreate()} size='sm'>
					追加
				</Button>
			</div>
		</div>
	);
}
