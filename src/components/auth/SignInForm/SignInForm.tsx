import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSignIn } from "./hooks/useSignIn";

export function SignInForm() {
	const form = useSignIn();

	return (
		<div
			className='flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
			style={{
				backgroundImage:
					"radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
			}}
		>
			<div className='w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
				<h1 className='text-3xl font-bold text-white mb-6 text-center'>ログイン</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className='space-y-4'
				>
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
						{form.state.isSubmitting ? "ログイン中..." : "ログイン"}
					</Button>
				</form>
			</div>
		</div>
	);
}
