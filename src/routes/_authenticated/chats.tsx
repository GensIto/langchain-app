import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats")({
	component: ChatsLayout,
});

function ChatsLayout() {
	return (
		<div className='flex h-full'>
			<aside className='w-64 border-r'>
				<h2>Chats</h2>
			</aside>
			<main className='flex-1'>
				<Outlet />
			</main>
		</div>
	);
}
