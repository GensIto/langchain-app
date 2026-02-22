import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats/")({
	component: ChatsIndex,
});

function ChatsIndex() {
	return (
		<div className='text-center text-2xl font-bold text-white'>チャットを選択してください</div>
	);
}
