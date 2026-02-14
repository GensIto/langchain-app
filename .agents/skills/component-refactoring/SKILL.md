---
name: component-refactoring
description: Reactコンポーネントのリファクタリングスキル。モノリシックなルートコンポーネントを関心ごとに分離し、再利用可能なコンポーネント構造に変換します。
---

# コンポーネントリファクタリング

モノリシックなルートコンポーネントを関心分離した構造に分解する。

**リファレンス実装**: `src/components/companies/projects/` を必ず読んでからパターンに従うこと。

---

## ディレクトリ規約

```
src/components/<ドメイン>/<機能名>/
├── index.ts              # top-level barrel
├── types.ts              # 共有エンティティ型
├── <Component>/          # 各UIコンポーネントが独立ディレクトリ
│   ├── index.ts          # barrel (コンポーネント + hook)
│   ├── <Component>.tsx   # UI (プレゼンテーショナル)
│   ├── types.ts          # Props型
│   ├── constants.ts      # TOAST_MESSAGES, LABELS 等 (as const)
│   ├── hooks/            # use<Action>.ts (状態+副作用)
│   └── functions/        # <funcName>.ts (純粋関数, 関数名=ファイル名)
```

## ルール

- **types.ts**: トップレベル=共有型、サブ=Props型。共有型は `../types` から `import type`
- **constants.ts**: そのコンポーネントが使う定数のみ。`as const`
- **hooks/**: CRUD操作ごとに分離。対応するコンポーネントのディレクトリに配置
- **functions/**: 関数名をファイル名にする。Reactに依存しない純粋関数
- **Dialog**: CreateはDialogTrigger内包、Editはトリガーなし
- **List**: オーケストレーション層。hookを呼び出し子にprops配布
- **ルートファイル**: Route定義 + loader + `useLoaderData()` → コンポーネントに渡すだけ

## 手順

1. トップレベル `types.ts` → 各サブディレクトリ (`types` → `constants` → `functions` → `hooks` → `.tsx` → `index`) → List → トップ `index.ts` → ルート簡素化
2. `npx tsc --noEmit` と `npx eslint` で検証
