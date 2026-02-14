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
	const {
		projectName,
		onProjectNameChange,
		projectDescription,
		onProjectDescriptionChange,
		onSubmit,
	} = useEditProject(project, onClose);

	return (
		<Dialog open={project !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>プロジェクトを編集</DialogTitle>
					<DialogDescription>プロジェクトの情報を変更してください</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='edit-name'>プロジェクト名</Label>
						<Input
							id='edit-name'
							value={projectName}
							onChange={(e) => onProjectNameChange(e.target.value)}
							placeholder='プロジェクト名を入力'
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='edit-description'>説明</Label>
						<Textarea
							id='edit-description'
							value={projectDescription}
							onChange={(e) => onProjectDescriptionChange(e.target.value)}
							placeholder='プロジェクトの説明を入力'
							rows={4}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={onClose}>
						キャンセル
					</Button>
					<Button onClick={onSubmit}>更新</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
