import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateChatSessionDialog } from "@/components/chats/CreateChatSessionDialog";
import { Button } from "@/components/ui/button";
import { getChatSessions } from "@/serverFunction/chat/chat.functions";

export const Route = createFileRoute("/_authenticated/chats")({
	component: ChatsLayout,
	loader: async () => {
		const chatSessions = await getChatSessions();
		return { chatSessions };
	},
});

function ChatsLayout() {
	const { chatSessions } = Route.useLoaderData();
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	return (
		<div className='flex min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-8 py-4'>
			<aside className='w-64 border-r pr-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-bold text-white mb-4'>Chats</h2>
					<Button onClick={() => setIsCreateOpen(true)}>
						<PlusIcon className='w-4 h-4' />
					</Button>
				</div>
				<ul className='space-y-2'>
					{chatSessions.map((session) => (
						<li key={session.id}>
							<Link
								to='/chats/$chatId'
								params={{ chatId: session.id }}
								className='block p-2 rounded hover:bg-accent hover:text-black text-white'
								activeProps={{ className: "!bg-accent !text-black" }}
							>
								{session.title}
							</Link>
						</li>
					))}
				</ul>
			</aside>
			<main className='flex-1 p-4'>
				<Outlet />
			</main>
			<CreateChatSessionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
		</div>
	);
}
