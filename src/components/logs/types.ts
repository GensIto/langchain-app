export type LogWithTags = {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	tags: { id: string; name: string }[];
};

export type Tag = {
	id: string;
	name: string;
};
