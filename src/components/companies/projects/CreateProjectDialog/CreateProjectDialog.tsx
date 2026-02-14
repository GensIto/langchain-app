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
	const {
		projectName,
		onProjectNameChange,
		projectDescription,
		onProjectDescriptionChange,
		onSubmit,
	} = useCreateProject({ companyId, onSuccess: () => onOpenChange(false) });

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
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='name'>プロジェクト名</Label>
						<Input
							id='name'
							value={projectName}
							onChange={(e) => onProjectNameChange(e.target.value)}
							placeholder='プロジェクト名を入力'
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='description'>説明</Label>
						<Textarea
							id='description'
							value={projectDescription}
							onChange={(e) => onProjectDescriptionChange(e.target.value)}
							placeholder='プロジェクトの説明を入力'
							rows={4}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						キャンセル
					</Button>
					<Button onClick={onSubmit}>作成</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
