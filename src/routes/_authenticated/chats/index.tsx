import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats/")({
	component: ChatsIndex,
});

function ChatsIndex() {
	return <div>チャットを選択してください</div>;
}
