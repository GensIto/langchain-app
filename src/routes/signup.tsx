import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export const Route = createFileRoute("/signup")({
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email(),
				password: z.string().min(8),
				name: z.string().min(1),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				const result = await signUp.email({
					email: value.email,
					password: value.password,
					name: value.name,
				});

				if (result.error) {
					toast.error(result.error.message);
					return;
				}
				void navigate({ to: "/" });
				toast.success("ログインしました");
			} catch (_error) {
				toast.error("メールアドレスまたはパスワードが正しくありません。");
			}
		},
	});

	return (
		<div
			className='flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
			style={{
				backgroundImage:
					"radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
			}}
		>
			<div className='w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
				<h1 className='text-3xl font-bold text-white mb-6 text-center'>新規登録</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className='space-y-4'
				>
					<form.Field name='name'>
						{(field) => (
							<div>
								<Label htmlFor='name'>名前</Label>
								<Input
									type='text'
									id='name'
									name='name'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder='John Doe'
									disabled={form.state.isSubmitting}
									className='text-white'
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='mt-1 text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='email'>
						{(field) => (
							<div>
								<Label htmlFor='email'>メールアドレス</Label>
								<Input
									type='email'
									id='email'
									name='email'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder='example@email.com'
									disabled={form.state.isSubmitting}
									className='text-white'
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='mt-1 text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='password'>
						{(field) => (
							<div>
								<Label htmlFor='password'>パスワード</Label>
								<Input
									type='password'
									id='password'
									name='password'
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder='••••••••'
									disabled={form.state.isSubmitting}
									className='text-white'
								/>
								{field.state.meta.errors.length > 0 && (
									<p className='mt-1 text-sm text-red-400'>{String(field.state.meta.errors[0])}</p>
								)}
								<p className='mt-1 text-xs text-zinc-500'>
									8文字以上、大文字・小文字・数字を含める必要があります
								</p>
							</div>
						)}
					</form.Field>

					<Button type='submit' disabled={form.state.isSubmitting}>
						{form.state.isSubmitting ? "新規登録中..." : "新規登録"}
					</Button>
					<p className='text-sm text-zinc-500 text-center'>
						すでにアカウントをお持ちの方は<Link to='/signin'>こちら</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
