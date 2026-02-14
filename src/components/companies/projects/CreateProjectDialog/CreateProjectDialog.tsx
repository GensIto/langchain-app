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
import { Textarea } from "@/components/ui/textarea";

import { useCreateProject } from "./hooks/useCreateProject";

type CreateProjectDialogProps = {
	companyId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({ companyId, open, onOpenChange }: CreateProjectDialogProps) {
	const form = useCreateProject({ companyId, onSuccess: () => onOpenChange(false) });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>新規作成</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>プロジェクトを作成</DialogTitle>
					<DialogDescription>新しいプロジェクトの情報を入力してください</DialogDescription>
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
									<Label htmlFor='name'>プロジェクト名</Label>
									<Input
										id='name'
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
									<Label htmlFor='description'>説明</Label>
									<Textarea
										id='description'
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
