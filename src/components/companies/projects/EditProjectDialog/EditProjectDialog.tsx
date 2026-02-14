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
import { Textarea } from "@/components/ui/textarea";

import { useEditProject } from "./hooks/useEditProject";

import type { EditableProject } from "../types";

type EditProjectDialogProps = {
	project: EditableProject | null;
	onClose: () => void;
};

export function EditProjectDialog({ project, onClose }: EditProjectDialogProps) {
	const form = useEditProject(project, onClose);

	return (
		<Dialog open={project !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>プロジェクトを編集</DialogTitle>
					<DialogDescription>プロジェクトの情報を変更してください</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className='grid gap-4 py-4'>
						<form.Field name='name'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-name'>プロジェクト名</Label>
									<Input
										id='edit-name'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='プロジェクト名を入力'
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
									)}
								</div>
							)}
						</form.Field>
						<form.Field name='description'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='edit-description'>説明</Label>
									<Textarea
										id='edit-description'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='プロジェクトの説明を入力'
										rows={4}
										disabled={form.state.isSubmitting}
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
