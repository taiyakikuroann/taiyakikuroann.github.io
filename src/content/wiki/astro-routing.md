---
title: "Astro のルーティングとディレクトリ構成"
description: "Astroフレームワークにおけるファイルベースのルーティングの仕組みを解説します。"
category: "Astro"
updatedDate: 2026-06-30
tags: ["Astro", "Frontend", "JavaScript"]
draft: false
---

Astroは**ファイルシステムベースのルーティング**を採用しています。`src/pages/` ディレクトリ配下に置かれたファイル構造が、そのままWebサイトのURLパスに対応します。

## ルーティングの基本ルール

Astroは以下のファイル拡張子をルーティング対象としてサポートしています。
- `.astro`
- `.md` (Markdown)
- `.mdx` (MDX)
- `.js` / `.ts` (エンドポイント)

### 記述例

- `src/pages/index.astro` -> `/`
- `src/pages/about.astro` -> `/about`
- `src/pages/blog/index.astro` -> `/blog`

---

## 動的ルーティング (Dynamic Routes)

パラメータによって動的に変化するURLを処理するには、ファイル名にブラケット `[ ]` を使用します。

### 例: 記事詳細ページ
`src/pages/blog/[slug].astro` を作成すると、`/blog/first-post` などのURLに対して1つのテンプレートで対応できます。

静的ビルドを行う場合、Astroでは `getStaticPaths()` 関数をエクスポートする必要があります。

```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  return [
    { params: { slug: 'hello-world' } },
    { params: { slug: 'astro-routing' } },
  ];
}

const { slug } = Astro.params;
---
<h1>Post: {slug}</h1>
```
これで動的な個別ページを出力することができます。
