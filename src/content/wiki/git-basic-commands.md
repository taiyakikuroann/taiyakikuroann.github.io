---
title: "Git 基本コマンドチートシート"
description: "日常的によく使用するGitの基本コマンドのまとめと備忘録です。"
category: "Git"
updatedDate: 2026-07-01
tags: ["Git", "CLI", "備忘録"]
draft: false
---

プロジェクト開発で頻出するGitの基本操作コマンドをまとめておきます。

## リポジトリの初期化と状態確認

### 新規リポジトリの初期化
```bash
git init
```

### 現在の状態を確認する
```bash
git status
```

---

## 変更の記録

### 変更をステージングエリアに追加
```bash
# 特定のファイルをステージング
git add <filename>

# すべての変更（新規、編集、削除）をステージング
git add .
```

### コミットの作成
```bash
git commit -m "feat: 新機能の追加"
```

### 空コミットの作成
```bash
git commit --allow-empty  -m "空コミット"
```

---

## ブランチ操作

### ブランチ一覧を表示
```bash
git branch
```

### 新規ブランチの作成と切り替え
```bash
# 作成のみ
git branch <branch-name>

# 切り替え
git checkout <branch-name>

# 作成と切り替えを同時に行う（推奨）
git checkout -b <branch-name>
```

---

## リモートとの同期

### リモートリポジトリの追加
```bash
git remote add origin https://github.com/taiyakikuroann/taiyakikuroann.github.io.git
```

### 変更をリモートにプッシュ
```bash
git push -u origin main
```
