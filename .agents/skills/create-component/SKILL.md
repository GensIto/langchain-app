---
name: create-component
description: Reactコンポーネント作成スキル。プロジェクトのディレクトリ規約・hook配置・フォーム管理パターンに従ってコンポーネントを作成する。
---

# コンポーネント作成

**リファレンス実装**: `src/components/companies/projects/` — 特に `ProjectList/ProjectList.tsx` と各コンポーネントの `.tsx` ファイルを読むこと。

---

## ディレクトリ規約

```
src/components/<ドメイン>/<機能名>/
├── index.ts              # top-level barrel (コンポーネントのみexport)
├── types.ts              # 共有エンティティ型
├── <Component>/          # 各UIコンポーネントが独立ディレクトリ
│   ├── index.ts          # barrel (コンポーネントのみexport)
│   ├── <Component>.tsx   # UI + 内部でhookを呼ぶ
│   ├── hooks/            # (必要な場合のみ) use<Action>.ts
│   └── functions/        # (必要な場合のみ) <funcName>.ts
```

## ルール

### hook配置
- **hookは使うUIコンポーネント内部で呼ぶ**。親からpropsで注入しない
- hookはそのコンポーネントの `hooks/` に配置し、barrelからはexportしない
- hookはフォーム管理・API呼び出し・toastを担当。開閉状態は持たない

### フォーム
- **TanStack Form (`useForm`)** を使う。`useState` で個別フィールドを管理しない
- hookが `useForm()` の返り値をそのまま返し、コンポーネントが `form.Field` で描画
- バリデーションは `validators.onSubmit` に zod スキーマを渡す
- `form.state.isSubmitting` で送信中のUI制御 (disabled, ローディング文言)

### コンポーネント間の調整
- **兄弟間の調整state** (Dialog開閉、編集対象) は親のListコンポーネントに `useState` で持つ
- Dialog: `open`/`onOpenChange`を外部から受け取り、フォームロジックは内部hook
- Edit Dialog: `project`/`onClose`を受け取り、`key={project?.id}`でリマウントしてstate初期化

### その他
- **constants.ts は作らない**: i18n未導入なら文字列はインライン
- **データ再取得**: `useRouter().invalidate()` を使う (`window.location.reload()` 禁止)
- **functions/**: 関数名=ファイル名。Reactに依存しない純粋関数
- **小さいコンポーネント**: EmptyState等は型をファイル内に定義。hooks/やtypes.ts不要
- **ルートファイル**: Route定義 + loader + `useLoaderData()` → コンポーネントに渡すだけ

## 手順

1. トップレベル `types.ts` → 各サブディレクトリ (`functions` → `hooks` → `.tsx` → `index`) → List → トップ `index.ts` → ルート接続
2. `npx tsc --noEmit` と `npx eslint` で検証
