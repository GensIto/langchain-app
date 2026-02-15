import type { RequiredSession } from "@/lib/auth";

import type {
	DeleteEpisodeInput,
	GenerateEpisodeInput,
	GetEpisodeInput,
	GetEpisodesInput,
	UpdateEpisodeInput,
} from "./schemas";

export function getAllEpisodes(_data: GetEpisodesInput, _session: RequiredSession) {
	// TODO: logId でエピソード一覧を取得
	// - ログの所有権を検証 (logs.userId === session.user.id)
	// - episodes を logId で検索
	// - episodeTags を JOIN してタグも取得
	throw new Error("Not implemented");
}

export function getEpisodeById(_data: GetEpisodeInput, _session: RequiredSession) {
	// TODO: エピソード単体を取得
	// - episodes を id で検索
	// - ログ経由で所有権を検証
	// - episodeTags を JOIN してタグも取得
	throw new Error("Not implemented");
}

export function generateEpisode(_data: GenerateEpisodeInput, _session: RequiredSession) {
	// TODO: ログからSTAR形式のエピソードをAI生成
	// 1. logId でログを取得 (所有権検証)
	// 2. Workers AI でログ内容をSTAR形式に変換
	// 3. D1 に episode を保存
	// 4. チャンク化 + Embedding
	// 5. Vectorize に保存
	throw new Error("Not implemented");
}

export function updateExistingEpisode(_data: UpdateEpisodeInput, _session: RequiredSession) {
	// TODO: エピソードを更新
	// - ログ経由で所有権を検証
	// - episodes を更新
	// - 必要に応じて Vectorize も再生成
	throw new Error("Not implemented");
}

export function removeEpisode(_data: DeleteEpisodeInput, _session: RequiredSession) {
	// TODO: エピソードを削除
	// - ログ経由で所有権を検証
	// - episodes を削除 (episodeTags は cascade)
	// - Vectorize からも削除
	throw new Error("Not implemented");
}
