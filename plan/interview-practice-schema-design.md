# 面接練習機能のデータモデル設計

## 現状のスキーマ

現在の `src/db/chat.ts` は最小限の構造で、面接練習に必要なメタデータが不足している。

```mermaid
erDiagram
    chatSessions {
        int id PK
        text userId FK
        int createdAt
        int updatedAt
    }
    chatMessages {
        int id PK
        int sessionId FK
        text message
        text role "system | user"
        int createdAt
        int updatedAt
    }
    chatSessions ||--o{ chatMessages : has
```

## 提案するスキーマ

```mermaid
erDiagram
    chatSessions {
        text id PK
        text userId FK
        text title "nullable: 自動生成 or ユーザー設定"
        text status "active | completed"
        text interviewStyle "deep_dive | broad | technical"
        text targetPosition "nullable: 志望ポジション"
        text targetIndustry "nullable: 志望業界"
        text summary "nullable: AI生成のセッション総括"
        int maxTokens "コンテキスト上限値"
        int createdAt
        int updatedAt
    }
    chatMessages {
        text id PK
        text sessionId FK
        text message
        text role "system | user | assistant"
        int tokenCount "このメッセージのトークン数"
        int createdAt
        int updatedAt
    }
    chatMessageEpisodes {
        text id PK
        text messageId FK
        text episodeId FK
        text relevanceNote "nullable: AIがなぜ紐付けたかの理由"
        int createdAt
    }
    episodes {
        text id PK
        text title
        text situation
        text task
        text action
        text result
    }
    chatSessions ||--o{ chatMessages : has
    chatMessages ||--o{ chatMessageEpisodes : references
    episodes ||--o{ chatMessageEpisodes : referenced_by
```

## 各テーブルの変更点と理由

### 1. chatSessions の拡張

セッション作成画面（1画面フォーム）でユーザーが事前にすべて設定してから面接練習を開始する。

- **`id`**: `integer` (auto-increment) -> **`text`** (UUID) に変更。他テーブル（episodes, tags等）と統一
- **`title`** (nullable text): セッション一覧で何の練習だったか一目でわかる。ユーザーが任意で設定、未設定なら最初の質問からAIが自動生成
- **`status`** (enum: `active` / `completed`): 進行中と完了済みの区別
- **`interviewStyle`** (enum: `deep_dive` / `broad` / `technical`): 面接官の質問スタイル
  - `deep_dive`: 1つのエピソードを深く掘り下げる
  - `broad`: 幅広いテーマを浅く聞く
  - `technical`: 技術的な詳細に踏み込む
- **`targetPosition`** (nullable text): 志望ポジション
- **`targetIndustry`** (nullable text): 志望業界
- **`summary`** (nullable text): セッション完了後のAI生成フィードバック。ユーザー終了・コンテキスト上限終了の両方で生成
- **`maxTokens`** (integer): コンテキストウィンドウ上限

### 2. chatMessages の修正

- **`id`**: `integer` -> **`text`** に変更（他テーブルとの統一）
- **`role`**: `["system", "user"]` -> **`["system", "user", "assistant"]`** に拡張
- **`tokenCount`** (integer): メッセージごとのトークン数

### 3. chatMessageEpisodes（新規テーブル）

エピソード紐付けをメッセージ単位で行う中間テーブル。

### 4. Relations の追加

- `chatSessionsRelations`: user(one), chatMessages(many)
- `chatMessagesRelations`: chatSession(one), chatMessageEpisodes(many)
- `chatMessageEpisodesRelations`: chatMessage(one), episode(one)

## UX上のデータフロー

```mermaid
flowchart TD
    Start["セッション作成\n(1画面フォーム)"] --> Config["interviewStyle / targetPosition\ntargetIndustry を設定"]
    Config --> CreateSession["chatSession をDBに保存\n(status=active)"]
    CreateSession --> AIQuestion["AI: 質問を生成"]
    AIQuestion --> UserAnswer["ユーザー: 回答"]
    UserAnswer --> AIAnalysis["AI: 回答を分析"]
    AIAnalysis --> SuggestEpisodes["AI: 関連エピソードを自動提案\n(chatMessageEpisodes に保存)"]
    SuggestEpisodes --> Feedback["AI: フィードバック + 深掘り質問"]
    Feedback --> TokenCheck{"累積トークン\nが閾値超過?"}
    TokenCheck -->|No| Continue{"続ける?"}
    Continue -->|Yes| AIQuestion
    Continue -->|No| UserEnd["AI: まとめ・フィードバック生成\n(status=completed)\nsummary に保存"]
    TokenCheck -->|Yes| ContextLimit["AI: まとめ・フィードバック生成\n(status=completed)\nsummary に保存\n入力フォーム非活性化"]
```
