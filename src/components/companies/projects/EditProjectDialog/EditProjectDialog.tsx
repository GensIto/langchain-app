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

import { FORM_CONFIG, LABELS, PLACEHOLDERS } from "./constants";

import type { EditProjectDialogProps } from "./types";

export function EditProjectDialog({
	isOpen,
	onOpenChange,
	projectName,
	onProjectNameChange,
	projectDescription,
	onProjectDescriptionChange,
	onSubmit,
	onCancel,
}: EditProjectDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{LABELS.dialogTitle}</DialogTitle>
					<DialogDescription>{LABELS.dialogDescription}</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='edit-name'>{LABELS.projectNameLabel}</Label>
						<Input
							id='edit-name'
							value={projectName}
							onChange={(e) => onProjectNameChange(e.target.value)}
							placeholder={PLACEHOLDERS.projectName}
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='edit-description'>{LABELS.descriptionLabel}</Label>
						<Textarea
							id='edit-description'
							value={projectDescription}
							onChange={(e) => onProjectDescriptionChange(e.target.value)}
							placeholder={PLACEHOLDERS.projectDescription}
							rows={FORM_CONFIG.descriptionRows}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={onCancel}>
						{LABELS.cancelButton}
					</Button>
					<Button onClick={onSubmit}>{LABELS.submitButton}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
