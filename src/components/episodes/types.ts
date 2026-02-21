export type EpisodeWithTags = {
	id: string;
	logId: string;
	title: string;
	impactLevel: "low" | "medium" | "high";
	situation: string;
	task: string;
	action: string;
	result: string;
	createdAt: Date;
	updatedAt: Date;
	tags: { id: string; name: string }[];
	score?: number; // ベクトル検索の類似度スコア（検索時のみ）
};
