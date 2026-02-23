import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon, SendIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import {
	EditChatSessionDialog,
	type EditableChatSession,
} from "@/components/chats/EditChatSessionDialog";
import { useDeleteChatSession } from "@/components/chats/hooks/useDeleteChatSession";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	createChatMessage,
	getChatMessages,
	getChatSession,
} from "@/serverFunction/chat/chat.functions";

export const Route = createFileRoute("/_authenticated/chats/$chatId")({
	component: ChatDetail,
	loader: async ({ params }) => {
		const chatSession = await getChatSession({ data: { id: params.chatId } });
		return { chatSession };
	},
});

function ChatDetail() {
	const { chatSession } = Route.useLoaderData();
	const [editingSession, setEditingSession] = useState<EditableChatSession | null>(null);
	const { handleDelete } = useDeleteChatSession();

	const { data } = useQuery({
		queryKey: ["chatMessages", chatSession.id],
		queryFn: async () => {
			const messages = await getChatMessages({ data: { sessionId: chatSession.id } });
			const withoutSystemMessages = messages.filter((m) => m.role !== "system");
			return withoutSystemMessages;
		},
	});

	const form = useForm({
		defaultValues: {
			message: "",
		},
		validators: {
			onSubmit: z.object({
				message: z.string().min(1),
			}),
		},
		onSubmit: async ({ value }) => {
			try {
				await createChatMessage({
					data: {
						sessionId: chatSession.id,
						message: value.message,
						role: "user",
						tokenCount: 0,
					},
				});
			} catch (error) {
				console.error(error);
			}
		},
	});

	return (
		<div className='flex flex-col h-full'>
			<div className='flex items-center justify-between mb-4'>
				<h1 className='text-2xl font-bold text-white'>{chatSession.title}</h1>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='icon'
						onClick={() =>
							setEditingSession({
								id: chatSession.id,
								title: chatSession.title,
								status: chatSession.status,
							})
						}
					>
						<PencilIcon className='w-4 h-4' />
					</Button>
					<Button
						variant='destructive'
						size='icon'
						onClick={() => void handleDelete(chatSession.id)}
					>
						<Trash2Icon className='w-4 h-4' />
					</Button>
				</div>
			</div>

			<Card className='flex flex-col flex-1 overflow-hidden'>
				<CardHeader>{""}</CardHeader>
				<CardContent className='flex-1 overflow-y-auto space-y-4'>
					{data?.map((message) => (
						<div
							className={cn(
								"text-sm text-gray-500 text-left bg-gray-100 p-2 rounded-md self-start",
								message.role === "user"
									? "self-end bg-blue-500 text-white"
									: "self-start bg-gray-100 text-gray-500",
							)}
							key={message.id}
						>
							{message.message}
						</div>
					))}
				</CardContent>
				<CardFooter className='border-t p-4'>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
						className='space-y-4 w-full'
					>
						<form.Field name='message'>
							{(field) => (
								<Field>
									<ButtonGroup>
										<Input
											id='input-button-group'
											placeholder='Type to search...'
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										<Button
											size='icon'
											variant='outline'
											type='submit'
											disabled={form.state.isSubmitting}
										>
											<SendIcon className='w-4 h-4' />
										</Button>
									</ButtonGroup>
								</Field>
							)}
						</form.Field>
					</form>
				</CardFooter>
			</Card>

			<EditChatSessionDialog
				key={editingSession?.id}
				session={editingSession}
				onClose={() => setEditingSession(null)}
			/>
		</div>
	);
}
