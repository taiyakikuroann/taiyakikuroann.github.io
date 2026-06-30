---
title: "GitHub CLI (gh) コマンドチートシート"
description: "日常開発でよく利用するGitHub CLI (ghコマンド) の主要機能と使い方まとめです。"
category: "Git"
updatedDate: 2026-06-30
tags: ["Git", "GitHub", "CLI", "gh", "チートシート"]
draft: false
---

コマンドラインからGitHubの操作を完結させるためのツール **GitHub CLI (gh)** のよく使うコマンドをまとめました。

## 認証と初期設定

### ログインと認証設定
```bash
gh auth login
```
※対話式でGitHubアカウントとの紐付け、認証を行います。

### 認証ステータスの確認
```bash
gh auth status
```

---

## リポジトリ操作 (gh repo)

### リポジトリのクローン
```bash
gh repo clone <owner>/<repo>
```
※ `git clone` の代わりに使え、リポジトリURLのコピペが不要になります。

### リポジトリの新規作成
```bash
# カレントディレクトリの内容でリモートリポジトリを新規作成してプッシュする
gh repo create --public --source=. --remote=origin --push
```

### ブラウザでリポジトリを開く
```bash
gh repo view --web
```
※現在のディレクトリのリポジトリをデフォルトブラウザで直接開きます。

---

## プルリクエスト操作 (gh pr)

### プルリクエストの作成
```bash
# 対話式で作成
gh pr create

# タイトルと本文、下書き(draft)指定をして作成
gh pr create --title "feat: 新機能の実装" --body "詳細は..." --draft
```

### プルリクエストの一覧表示
```bash
gh pr list
```

### プルリクエストの確認とチェックアウト
```bash
# 特定のPR（例: PR #12）をローカルにチェックアウトする
gh pr checkout 12
```

### プルリクエストのブラウザ表示
```bash
# 特定のPRをブラウザで開く
gh pr view 12 --web

# 現在のブランチのPRをブラウザで開く
gh pr view --web
```

### プルリクエストのマージ
```bash
gh pr merge
```
※マージ方法（Merge commit, Squash, Rebase）や、マージ後のローカル/リモートブランチ削除も対話式またはオプションで指定可能です。

---

## イシュー操作 (gh issue)

### イシューの一覧表示
```bash
gh issue list
```

### イシューの作成
```bash
gh issue create --title "バグ報告: ○○の不具合" --body "再現手順..."
```

### イシューをブラウザで開く
```bash
gh issue view <issue-number> --web
```

---

## ワークフロー実行と確認 (gh run)

### GitHub Actionsの実行状況確認
```bash
# 実行中のワークフローの一覧・ステータスを表示
gh run list

# 実行中のワークフローのログをリアルタイムで追跡する
gh run watch
```

---

## その他の便利コマンド

### エイリアスの設定
頻繁に使うコマンドを短縮できます。
```bash
# 例: "gh pr view --web" を "gh pv" にエイリアス設定
gh alias set pv "pr view --web"
```
