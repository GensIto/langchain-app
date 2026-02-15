---
name: create-api
description: サーバー関数(API)作成スキル。プロジェクトのディレクトリ規約・認証・バリデーションパターンに従ってAPIを作成する。
---

# API作成

**リファレンス実装**: `src/serverFunction/log/` — `schemas.ts`, `log.server.ts`, `log.functions.ts` の3ファイル構成を読むこと。

---

## ディレクトリ規約

```
src/serverFunction/<ドメイン>/
├── schemas.ts              # zod スキーマ + 型定義
├── <domain>.server.ts      # ビジネスロジック (DB操作・外部API呼び出し)
└── <domain>.functions.ts   # createServerFn 定義 (薄いラッパー)
```

## ルール

### 3ファイル構成

- **schemas.ts**: zod スキーマ + `z.infer` で型を export。バリデーションルールはここに集約
- **\*.server.ts**: ビジネスロジック。`(data: XxxInput, session: RequiredSession)` のシグネチャ。DB操作・外部API呼び出し・エラーハンドリングを担当
- **\*.functions.ts**: `createServerFn` の定義のみ。ロジックを持たない薄いラッパー

### 認証

- 全エンドポイントに `authMiddleware` を適用: `.middleware([authMiddleware])`
- `authMiddleware` は `context.session` を注入する (`src/lib/middleware.ts`)
- server.ts 側で `session.user.id` を使って所有権を検証

### バリデーション

- `.inputValidator(xxxSchema)` で zod スキーマをバリデータとして渡す
- スキーマ名: `getXxxSchema`, `createXxxSchema`, `updateXxxSchema`, `deleteXxxSchema`
- 型名: `GetXxxInput`, `CreateXxxInput`, `UpdateXxxInput`, `DeleteXxxInput`

### createServerFn パターン

```typescript
export const getXxx = createServerFn({
    method: "GET",      // 読み取り
})
    .middleware([authMiddleware])
    .inputValidator(getXxxSchema)
    .handler(({ data, context }) => {
        return getAllXxx(data, context.session);
    });

export const createXxx = createServerFn({
    method: "POST",     // 書き込み
})
    .middleware([authMiddleware])
    .inputValidator(createXxxSchema)
    .handler(({ data, context }) => {
        return createNewXxx(data, context.session);
    });
```

- 読み取り: `method: "GET"`
- 書き込み (作成・更新・削除): `method: "POST"`
- handler は server.ts の関数を呼ぶだけ。`async` は server.ts が非同期の場合のみ付ける

### DB操作 (server.ts)

- `getDb()` でDBインスタンスを取得 (`src/db/index.ts`)
- ID生成: `crypto.randomUUID()`
- タイムスタンプ: `new Date()` で `createdAt` / `updatedAt` を設定
- 所有権検証: `eq(table.userId, session.user.id)` を WHERE 条件に含める
- `returning().get()` で挿入・更新結果を取得
- 存在しない場合: `throw new Error("Xxx not found")`

### その他

- **constants は作らない**: エラーメッセージはインライン
- **functions.ts からのみ export**: server.ts はルートやコンポーネントから直接 import しない

## 手順

1. `schemas.ts` — zod スキーマ + 型定義
2. `<domain>.server.ts` — ビジネスロジック
3. `<domain>.functions.ts` — createServerFn ラッパー
4. `npx tsc --noEmit` と `npx eslint` で検証
