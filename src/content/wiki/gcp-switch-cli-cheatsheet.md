---
title: "gcloud CLI 初期セットアップ・環境切り替えチートシート"
description: "gcloud コマンドの初期化、プロジェクト・構成管理、サービスアカウント認証など、日常的に使う基本操作のまとめです。"
category: "GCP"
updatedDate: 2026-07-09
tags: ["GCP", "CLI", "備忘録"]
draft: false
---

Google Cloud CLI（gcloud）を使用したプロジェクト管理・環境切り替え・認証まわりのチートシートです。初期セットアップからサービスアカウントのなりすまし認証まで、実務でよく使うコマンドをまとめています。

------------------------------
## 1. 初期セットアップ（初回のみ）
ターミナルで gcloud コマンドを使用できるようにするための手順です。
### ① インストール
お使いの環境（OS）に合わせて、以下のコマンドを実行します。

* macOS (Homebrew)
```bash
brew install --cask google-cloud-sdk
```

* Windows (PowerShell)
[公式インストーラー](https://docs.cloud.google.com/sdk/docs/initialize?hl=ja)をダウンロードして実行します。
* Linux (Ubuntu/Debian)
```bash
sudo apt-get install google-cloud-cli
```


⚠️ 注意: インストール完了後、設定を反映させるためにターミナルを一度再起動（または新規タブを開く）してください。

### ② 初期化（認証とデフォルト設定）
ターミナルで以下のコマンドを実行し、画面の指示に従います。

```bash
gcloud init
```


   1. Google アカウントへのログイン: ブラウザが起動するので、使用するアカウントを選択して「許可」します。
   2. プロジェクトの選択: 既存のクラウドプロジェクト一覧が表示されるので、対象の番号を入力します。
   3. デフォルトリージョン/ゾーンの設定: 任意で asia-northeast1-a などの地域を設定します。

### ③ 設定確認コマンド

```bash
# ログイン中のアカウント一覧と現在アクティブなアカウントを確認
gcloud auth list
# 現在設定されているプロジェクトIDなどの詳細を確認
gcloud config list
```

------------------------------
## 2. プロジェクトの基本操作
現在の環境設定を維持したまま、操作対象のプロジェクト ID のみをピンポイントで書き換える場合に使用します。
### プロジェクトの切り替え（上書き）

```bash
gcloud config set project [プロジェクトID]
```

### プロジェクトの新規作成

```bash
# プロジェクトの作成
gcloud projects create [新規プロジェクトID] --name="[プロジェクト名]"
# 作成したプロジェクトへ切り替え
gcloud config set project [新規プロジェクトID]
```

------------------------------
## 3. 構成（Configuration）の管理
アカウント、プロジェクト、デフォルトのリージョン／ゾーンなどを「1つのセット（プロファイル）」として丸ごと保存・管理し、環境を丸ごと切り替える機能です。
「開発環境（dev）」「本番環境（prod）」の切り替えや、アカウント自体が変わる場合に最適です。
### 構成の一覧・現在のアクティブ確認

```bash
gcloud config configurations list
```

### 構成の新規作成・設定

```bash
# 1. 新しい構成を作成（作成と同時にその構成がアクティブになります）
gcloud config configurations create [構成名（例: prod-env）]
# 2. その構成に対してアカウントやプロジェクト、ゾーンを紐付ける
gcloud config set account [Googleアカウントのメールアドレス]
gcloud config set project [プロジェクトID]
gcloud config set compute/zone [デフォルトのゾーン（例: asia-northeast1-a）]
```

### 構成の切り替え（アクティベート）

```bash
gcloud config configurations activate [構成名]
```

### 構成の削除

```bash
# ※現在アクティブな構成は削除できないため、切り替えてから削除します
gcloud config configurations delete [削除したい構成名]
```

------------------------------
## 4. サービスアカウント（SA）へのなりすまし（Impersonation）
個人の Google アカウントの認証情報を使用しつつ、特定の SA の権限を一時的に借りて（なりすまして）コマンドを実行します。SA 鍵（JSON キー）を発行・管理する必要がないため、セキュアで推奨される手法です。

⚠️ 前提条件: 実行する個人の Google アカウントに、対象 SA に対する 「サービス アカウント トークン作成者（roles/iam.serviceAccountTokenCreator）」 権限が事前に付与されている必要があります。

### Aパターン：【推奨】頻繁に使う場合（「構成」として保存）
専用の構成を作っておくことで、コマンドの打ち間違い（誤操作）を防ぎ、安全に切り替えられます。

```bash
# 1. SA専用の構成を作成
gcloud config configurations create [SA用の構成名（例: sa-prod）]
# 2. なりすますSAのメールアドレスを設定
gcloud config set auth/impersonate_service_account [SAのメールアドレス]
# 3. 操作対象のプロジェクトを設定
gcloud config set project [プロジェクトID]
```


```bash
# SA環境へ切り替え
gcloud config configurations activate sa-prod
# 元の自分（個人）に戻る
gcloud config configurations activate default
```

### Bパターン：【単発】1回だけ実行したい場合（フラグを使用）
構成を切り替えるまでもなく、特定の 1 コマンドだけを SA 権限でテスト実行したい場合に使用します。

```bash
# コマンドの末尾（または途中）に --impersonate-service-account フラグを付与
gcloud compute instances list --impersonate-service-account=[SAのメールアドレス]
```

------------------------------
## 比較表：どっちを使うべき？

| 操作方法 | 変更される範囲 | 最適なユースケース |
|---|---|---|
| gcloud config set project | プロジェクトIDのみ | 同じアカウント内で、一時的に別プロジェクトに切り替え |
| 構成（Configuration） | アカウント・プロジェクト・地域など全て | 開発/本番環境の切り替え、複数アカウント管理、SA認証 |

