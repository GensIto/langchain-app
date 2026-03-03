import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircleIcon, PencilIcon, SendIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
	getChatMessages,
	getChatSession,
	streamChatResponse,
} from "@/serverFunction/chat/chat.functions";

export const Route = createFileRoute("/_authenticated/chats/$chatId")({
	component: ChatDetail,
	loader: async ({ params }) => {
		const chatSession = await getChatSession({ data: { id: params.chatId } });
		return { chatSession };
	},
});

type DisplayMessage = {
	id: string;
	role: "user" | "assistant";
	message: string;
};

function ChatDetail() {
	const { chatSession } = Route.useLoaderData();
	const queryClient = useQueryClient();
	const [editingSession, setEditingSession] = useState<EditableChatSession | null>(null);
	const { handleDelete } = useDeleteChatSession();
	const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	const { data } = useQuery({
		queryKey: ["chatMessages", chatSession.id],
		queryFn: async () => {
			const messages = await getChatMessages({ data: { sessionId: chatSession.id } });
			return messages.filter((m) => m.role !== "system");
		},
	});

	const displayMessages: DisplayMessage[] = [
		...(data?.map((m) => ({
			id: m.id,
			role: m.role as "user" | "assistant",
			message: m.message,
		})) ?? []),
		...(streamingMessage !== null
			? [{ id: "streaming", role: "assistant" as const, message: streamingMessage }]
			: []),
	];

	const scrollToBottom = useCallback(() => {
		contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [displayMessages.length, streamingMessage, scrollToBottom]);

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
			const userMessage = value.message;
			form.reset();

			queryClient.setQueryData(["chatMessages", chatSession.id], (old: typeof data) => [
				...(old ?? []),
				{
					id: `optimistic-${Date.now()}`,
					sessionId: chatSession.id,
					role: "user" as const,
					message: userMessage,
					tokenCount: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			setIsStreaming(true);
			setStreamingMessage("");

			try {
				const stream = await streamChatResponse({
					data: {
						sessionId: chatSession.id,
						message: userMessage,
					},
				});

				if (stream instanceof ReadableStream) {
					const reader = stream.getReader();
					const decoder = new TextDecoder();
					let accumulated = "";
					let done = false;

					while (!done) {
						const result = await reader.read();
						done = result.done;
						if (done) break;
						const text =
							typeof result.value === "string"
								? result.value
								: decoder.decode(result.value, { stream: true });
						accumulated += text;
						setStreamingMessage(accumulated);
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				setStreamingMessage(null);
				setIsStreaming(false);
				await queryClient.invalidateQueries({ queryKey: ["chatMessages", chatSession.id] });
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
				<CardContent ref={contentRef} className='flex-1 overflow-y-auto space-y-4'>
					{displayMessages.map((message) => (
						<div
							className={cn(
								"text-sm p-2 rounded-md whitespace-pre-wrap",
								message.role === "user"
									? "self-end bg-blue-500 text-white"
									: "self-start bg-gray-100 text-gray-500",
							)}
							key={message.id}
						>
							{message.message}
						</div>
					))}
					{isStreaming && streamingMessage === "" && (
						<div className='self-start flex items-center gap-2 text-sm text-gray-400 p-2'>
							<LoaderCircleIcon className='w-4 h-4 animate-spin' />
						</div>
					)}
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
											placeholder='メッセージを入力...'
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											disabled={isStreaming}
										/>
										<Button
											size='icon'
											variant='outline'
											type='submit'
											disabled={isStreaming || form.state.isSubmitting}
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
