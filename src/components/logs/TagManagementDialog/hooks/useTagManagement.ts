import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { createTag, deleteTag, updateTag } from "@/serverFunction/log/log.functions";

export function useTagManagement() {
	const router = useRouter();
	const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
	const [editTagName, setEditTagName] = useState("");
	const [newTagName, setNewTagName] = useState("");

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

	const startEditing = (tag: { id: string; name: string }) => {
		setEditingTag(tag);
		setEditTagName(tag.name);
	};

	const cancelEditing = () => {
		setEditingTag(null);
		setEditTagName("");
	};

	return {
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
	};
}
