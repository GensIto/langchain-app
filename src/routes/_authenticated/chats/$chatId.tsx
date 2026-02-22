import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import {
	EditChatSessionDialog,
	type EditableChatSession,
} from "@/components/chats/EditChatSessionDialog";
import { useDeleteChatSession } from "@/components/chats/hooks/useDeleteChatSession";
import { Button } from "@/components/ui/button";
import { getChatSession } from "@/serverFunction/chat/chat.functions";

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

	return (
		<div>
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
			<EditChatSessionDialog
				key={editingSession?.id}
				session={editingSession}
				onClose={() => setEditingSession(null)}
			/>
		</div>
	);
}
