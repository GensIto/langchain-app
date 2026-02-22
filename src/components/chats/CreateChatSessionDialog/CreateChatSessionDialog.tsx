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

import { useCreateChatSession } from "./hooks/useCreateChatSession";

type CreateChatSessionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateChatSessionDialog({ open, onOpenChange }: CreateChatSessionDialogProps) {
	const form = useCreateChatSession({ onSuccess: () => onOpenChange(false) });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>新規セッションを作成</DialogTitle>
					<DialogDescription>面接セッションの情報を入力してください</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className='grid gap-4 py-4'>
						<form.Field name='interviewStyle'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='interviewStyle'>面接スタイル</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "deep_dive" | "broad" | "technical")
										}
										disabled={form.state.isSubmitting}
									>
										<SelectTrigger id='interviewStyle'>
											<SelectValue placeholder='面接スタイルを選択' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='broad'>幅広い質問</SelectItem>
											<SelectItem value='deep_dive'>深掘り</SelectItem>
											<SelectItem value='technical'>技術面接</SelectItem>
										</SelectContent>
									</Select>
									{field.state.meta.errors.length > 0 && (
										<p className='text-sm text-red-400'>
											{String(field.state.meta.errors[0])}
										</p>
									)}
								</div>
							)}
						</form.Field>
						<form.Field name='targetPosition'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='targetPosition'>志望ポジション</Label>
									<Input
										id='targetPosition'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='例: フロントエンドエンジニア'
										disabled={form.state.isSubmitting}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name='targetIndustry'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='targetIndustry'>志望業界</Label>
									<Input
										id='targetIndustry'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='例: IT・Web業界'
										disabled={form.state.isSubmitting}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name='title'>
							{(field) => (
								<div className='grid gap-2'>
									<Label htmlFor='title'>タイトル（任意）</Label>
									<Input
										id='title'
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder='未入力の場合は自動生成されます'
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
