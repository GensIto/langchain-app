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

import { useEditCompany } from "./hooks/useEditCompany";

import type { EditableCompany } from "../types";

type EditCompanyDialogProps = {
	company: EditableCompany | null;
	onClose: () => void;
};

export function EditCompanyDialog({ company, onClose }: EditCompanyDialogProps) {
	const form = useEditCompany(company, onClose);

	return (
		<Dialog open={company !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>会社を編集</DialogTitle>
					<DialogDescription>会社の情報を変更してください</DialogDescription>
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
									<Label htmlFor='edit-name'>会社名</Label>
									<Input
										id='edit-name'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='会社名を入力'
										disabled={form.state.isSubmitting}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
									)}
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
