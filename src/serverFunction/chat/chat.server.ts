import { env } from "cloudflare:workers";

import { getLogger } from "@logtape/logtape";
import { eq, and } from "drizzle-orm";

import { getDb } from "@/db";
import { chatMessages, chatSessions } from "@/db/chat";
import type { RequiredSession } from "@/lib/auth";

import {
	generateChatSessionTitleResponseSchema,
	type CreateChatMessageInput,
	type CreateChatSessionInput,
	type DeleteChatSessionInput,
	type GetChatMessageEpisodesInput,
	type GetChatMessagesInput,
	type LinkChatMessageEpisodeInput,
	type UpdateChatSessionInput,
	type SendChatMessageInput,
} from "./schemas";

const logger = getLogger(["app", "chat"]);

// ── ChatSessions ──

export async function getAllChatSessions(session: RequiredSession) {
	logger.info("Getting all chat sessions: {session}", { session });

	const result = await getDb()
		.select()
		.from(chatSessions)
		.where(eq(chatSessions.userId, session.user.id));

	logger.info("Fetched {count} chat sessions", { count: result.length });

	return result;
}

export async function getChatSessionById(id: string, session: RequiredSession) {
	logger.info("Getting chat session by id: {id}", { id });
	const result = await getDb()
		.select()
		.from(chatSessions)
		.where(and(eq(chatSessions.id, id), eq(chatSessions.userId, session.user.id)))
		.get();

	if (!result) {
		logger.warn("Chat session not found: {id}", { id });
		throw new Error("Chat session not found");
	}

	logger.info("Fetched chat session: {result}", { result });

	return result;
}

export async function createNewChatSession(data: CreateChatSessionInput, session: RequiredSession) {
	logger.info("Creating new chat session: {data}", { data });

	let title = data.title || "新規面接セッション";

	if (!data.title) {
		try {
			// ChatCloudflareWorkersAI (LangChain) は bindTools() 未実装のため withStructuredOutput() が使えない
			// https://docs.langchain.com/oss/javascript/integrations/chat/cloudflare_workersai
			const response = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
				messages: [
					{
						role: "system",
						content: `
						あなたは、面接セッションのタイトルを作成するアシスタントです。
						ユーザーの志望ポジションと志望業界を考慮して、面接スタイルに応じて、面接セッションのタイトルを作成してください。
						すべてのフィールドの値は必ず日本語で記述してください。英語は使わないでください。
						`,
					},
					{
						role: "user",
						content: `
						以下は、ユーザーが提供するデータです。
						- 面接スタイル: ${data.interviewStyle}
						- 志望ポジション: ${data.targetPosition}
						- 志望業界: ${data.targetIndustry}
						`,
					},
				],
				response_format: {
					type: "json_schema",
					json_schema: {
						type: "object",
						properties: generateChatSessionTitleResponseSchema.shape,
						required: Object.keys(generateChatSessionTitleResponseSchema.shape),
					},
				},
			});

			const parsedResult = generateChatSessionTitleResponseSchema.safeParse(response.response);

			if (parsedResult.success && parsedResult.data.title) {
				title = parsedResult.data.title;
			} else if (!parsedResult.success) {
				logger.warn("Failed to parse AI-generated title, using fallback: {error}", {
					error: parsedResult.error.message,
				});
			}
		} catch (e) {
			logger.warn("AI title generation failed, using fallback: {error}", { error: e });
		}
	}

	const now = new Date();
	const result = await getDb()
		.insert(chatSessions)
		.values({
			id: crypto.randomUUID(),
			userId: session.user.id,
			title,
			interviewStyle: data.interviewStyle,
			targetPosition: data.targetPosition,
			targetIndustry: data.targetIndustry,
			// TODO: 必要になれば maxTokens をユーザーが指定できるようにする
			// @cf/deepseek-ai/deepseek-r1-distill-qwen-32b の最大コンテキストウィンドウ数は 80,000
			// https://developers.cloudflare.com/workers-ai/models/deepseek-ai/deepseek-r1-distill-qwen-32b/
			// トークンを残しておくことで、余裕を持って面接終了できるようにしておく
			maxTokens: 50000,
			createdAt: now,
			updatedAt: now,
		})
		.returning()
		.get();

	const systemMessage = [
		"あなたはプロフェッショナルな面接官です。以下の前提条件に基づいて面接を進行してください。",
		"",
		"## 面接の前提条件",
		`- 面接スタイル: ${data.interviewStyle}`,
		`- 候補者の志望ポジション: ${data.targetPosition}`,
		`- 候補者の志望業界: ${data.targetIndustry}`,
		"",
		"## あなたの役割",
		"- 上記の志望ポジション・業界に精通した面接官として振る舞ってください。",
		"- 面接スタイルに応じて、質問のトーンや難易度を調整してください。",
		"- 一度に複数の質問をせず、1つずつ質問してください。",
		"- 候補者の回答に対して、適切な深掘り質問やフォローアップを行ってください。",
		"",
		"## 面接の進め方",
		"1. まず候補者の経歴を確認してください。",
		"2. 志望動機・業界理解に関する質問を行ってください。",
		"3. ポジションに関連する専門的な質問を行ってください。",
		"4. 行動面接（過去の経験に基づく質問）を適宜取り入れてください。",
		"5. 候補者からの逆質問に対応してください。",
		"",
		"## 注意事項",
		"- 回答は必ず日本語で行ってください。",
		"- 候補者の回答が曖昧な場合は、具体例を求めるなど深掘りしてください。",
		"- 面接官としてのリアリティを保ち、適度な緊張感を維持してください。",
		"- 候補者の良い点は適宜認めつつ、改善点があれば建設的にフィードバックしてください。",
	].join("\n");

	await Promise.all([
		// システムメッセージを作成
		getDb().insert(chatMessages).values({
			id: crypto.randomUUID(),
			sessionId: result.id,
			message: systemMessage,
			role: "system",
			tokenCount: 0,
			createdAt: now,
			updatedAt: now,
		}),
		// 最初のメッセージを作成
		getDb().insert(chatMessages).values({
			id: crypto.randomUUID(),
			sessionId: result.id,
			message: "ようこそ！面接練習を始めましょう！まずは簡単な経歴を教えてください。",
			role: "assistant",
			tokenCount: 0,
			createdAt: now,
			updatedAt: now,
		}),
	]);

	return result;
}

export async function updateExistingChatSession(
	data: UpdateChatSessionInput,
	session: RequiredSession,
) {
	const updates: Partial<typeof chatSessions.$inferInsert> = { updatedAt: new Date() };
	if (data.title != null) {
		updates.title = data.title;
	}
	if (data.status != null) {
		updates.status = data.status;
	}
	if (data.summary != null) {
		updates.summary = data.summary;
	}

	const result = await getDb()
		.update(chatSessions)
		.set(updates)
		.where(and(eq(chatSessions.id, data.id), eq(chatSessions.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Chat session not found for update: {id}", { id: data.id });
		throw new Error("Chat session not found");
	}

	return result;
}

export async function removeChatSession(data: DeleteChatSessionInput, session: RequiredSession) {
	const result = await getDb()
		.delete(chatSessions)
		.where(and(eq(chatSessions.id, data.id), eq(chatSessions.userId, session.user.id)))
		.returning()
		.get();

	if (!result) {
		logger.warn("Chat session not found for deletion: {id}", { id: data.id });
		throw new Error("Chat session not found");
	}

	return result;
}

// ── ChatMessages ──

export async function getMessagesBySession(data: GetChatMessagesInput, _session: RequiredSession) {
	const result = await getDb()
		.select()
		.from(chatMessages)
		.where(eq(chatMessages.sessionId, data.sessionId));

	if (!result) {
		logger.warn("Chat messages not found: {sessionId}", { sessionId: data.sessionId });
		throw new Error("Chat messages not found");
	}

	logger.info("Fetched {count} chat messages", { count: result.length });

	return result;
}

export async function streamChat(data: SendChatMessageInput, _session: RequiredSession) {
	logger.info("Streaming chat: {sessionId}", { sessionId: data.sessionId });

	const createdMsg = await getDb().insert(chatMessages).values({
		id: crypto.randomUUID(),
		sessionId: data.sessionId,
		message: data.message,
		role: "user",
		tokenCount: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	if (!createdMsg) {
		throw new Error("Failed to create chat message");
	}

	const chatHistory = await getDb()
		.select()
		.from(chatMessages)
		.where(eq(chatMessages.sessionId, data.sessionId))
		.orderBy(chatMessages.createdAt);

	logger.info("Chat history count: {count}", { count: chatHistory.length });
	logger.info("Chat history roles: {roles}", {
		roles: chatHistory.map((m) => `${m.role}(${m.message.length})`).join(", "),
	});

	if (chatHistory.length === 0) {
		throw new Error("Chat history not found");
	}

	const formattedMessages = chatHistory
		.filter((m) => m.message)
		.map((m) => ({
			role: m.role,
			content: m.message,
		}));

	logger.info("[streamChat] Calling env.AI.run (stream: true) with {count} messages", {
		count: formattedMessages.length,
	});

	let aiStream: ReadableStream<Uint8Array>;
	try {
		const result = await env.AI.run("@cf/qwen/qwen3-30b-a3b-fp8", {
			messages: formattedMessages,
			stream: true,
		});
		aiStream = result as ReadableStream<Uint8Array>;
		logger.info("[streamChat] AI stream created successfully");
	} catch (error) {
		logger.error("[streamChat] env.AI.run FAILED: {error}", {
			error: error instanceof Error ? error.message : JSON.stringify(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}

	let fullResponse = "";

	return new ReadableStream<string>({
		async start(controller) {
			try {
				logger.info("[streamChat] ReadableStream start() called");
				const reader = aiStream.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let chunkIndex = 0;

				let readResult = await reader.read();
				while (!readResult.done) {
					buffer += decoder.decode(readResult.value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed || !trimmed.startsWith("data: ")) continue;
						const jsonStr = trimmed.slice(6);
						if (jsonStr === "[DONE]") {
							logger.info("[streamChat] Received [DONE]");
							continue;
						}

						try {
							const parsed = JSON.parse(jsonStr) as {
								response?: string;
								choices?: { delta?: { content?: string; reasoning_content?: string } }[];
							};

							const delta = parsed.choices?.[0]?.delta;
							const text = delta?.content ?? parsed.response ?? "";

							if (chunkIndex < 5 || text) {
								logger.info("[streamChat] chunk[{index}] raw: {raw}", {
									index: chunkIndex,
									raw: jsonStr.substring(0, 500),
								});
							}

							if (text) {
								fullResponse += text;
								controller.enqueue(text);
							}
						} catch {
							logger.warn("[streamChat] Failed to parse SSE data: {data}", {
								data: jsonStr.substring(0, 200),
							});
						}
						chunkIndex++;
					}
					readResult = await reader.read();
				}

				logger.info("[streamChat] Stream completed - totalChunks: {count}, responseLength: {len}", {
					count: chunkIndex,
					len: fullResponse.length,
				});

				if (fullResponse) {
					await getDb()
						.insert(chatMessages)
						.values({
							id: crypto.randomUUID(),
							sessionId: data.sessionId,
							message: fullResponse,
							role: "assistant",
							tokenCount: 0,
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.run();
					logger.info("[streamChat] Assistant message inserted - length: {len}", {
						len: fullResponse.length,
					});
				} else {
					logger.warn("[streamChat] Empty response - skipping DB insert");
				}

				controller.close();
			} catch (error) {
				logger.error("[streamChat] Error in ReadableStream: {error}", {
					error: error instanceof Error ? error.message : JSON.stringify(error),
					stack: error instanceof Error ? error.stack : undefined,
				});
				controller.error(error);
			}
		},
	});
}

export function createNewChatMessage(data: CreateChatMessageInput, _session: RequiredSession) {
	return getDb()
		.insert(chatMessages)
		.values({
			id: crypto.randomUUID(),
			sessionId: data.sessionId,
			message: data.message,
			role: data.role,
			tokenCount: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()
		.get();
}

// ── ChatMessageEpisodes ──

export function linkMessageEpisode(_data: LinkChatMessageEpisodeInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}

export function getMessageEpisodes(_data: GetChatMessageEpisodesInput, _session: RequiredSession) {
	// TODO: implement
	throw new Error("Not implemented");
}
