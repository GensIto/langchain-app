import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats/$chatId")({
	component: Chat,
});

function Chat() {
	const { chatId } = Route.useParams();
	return <div>Chat {chatId} Detail</div>;
}
