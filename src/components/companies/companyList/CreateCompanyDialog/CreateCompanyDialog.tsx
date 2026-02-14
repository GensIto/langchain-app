import { Button } from "@/components/ui/button";
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

import { useCreateCompany } from "./hooks/useCreateCompany";

type CreateCompanyDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
	const form = useCreateCompany(() => onOpenChange(false));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>新規作成</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>会社を作成</DialogTitle>
					<DialogDescription>新しい会社の情報を入力してください</DialogDescription>
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
									<Label htmlFor='name'>会社名</Label>
									<Input
										id='name'
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
						<Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
							キャンセル
						</Button>
						<Button type='submit' disabled={form.state.isSubmitting}>
							{form.state.isSubmitting ? "作成中..." : "作成"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
