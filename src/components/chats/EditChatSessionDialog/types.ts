export type EditableChatSession = {
	id: string;
	title: string | null;
	status: "active" | "completed";
};
