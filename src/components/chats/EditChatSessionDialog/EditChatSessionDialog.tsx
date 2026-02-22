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

import { useEditChatSession } from "./hooks/useEditChatSession";

import type { EditableChatSession } from "./types";

type EditChatSessionDialogProps = {
	session: EditableChatSession | null;
	onClose: () => void;
};

export function EditChatSessionDialog({ session, onClose }: EditChatSessionDialogProps) {
	const form = useEditChatSession(session, onClose);

	return (
		<Dialog open={session !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>セッションを編集</DialogTitle>
					<DialogDescription>セッションの情報を変更してください</DialogDescription>
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
									<Label htmlFor='edit-title'>タイトル</Label>
									<Input
										id='edit-title'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='セッションのタイトルを入力'
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
						<form.Field name='status'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-status'>ステータス</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "active" | "completed")
										}
										disabled={form.state.isSubmitting}
									>
										<SelectTrigger id='edit-status'>
											<SelectValue placeholder='ステータスを選択' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='active'>アクティブ</SelectItem>
											<SelectItem value='completed'>完了</SelectItem>
										</SelectContent>
									</Select>
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
