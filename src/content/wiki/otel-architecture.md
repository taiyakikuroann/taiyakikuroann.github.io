---
title: "OpenTelemetry Gateway 構成メモ（GCP / Cloud Run 方式）"
description: "OpenTelemetry を Gateway 方式で, GCP の Cloud Run を使って構成するときの設定と手順のメモです。"
category: "Observability"
updatedDate: 2026-07-06
tags: ["OpenTelemetry", "GCP", "CloudRun", "Observability"]
draft: false
---

## 概要

OpenTelemetry (OTel) のコレクターを Cloud Run にゲートウェイ（中継器）として構築し、外部ネットワーク（別プロジェクトやオンプレミス等）から送信されるテレメトリーデータ（Trace、Metrics、Log）を Google Cloud の Operations Suite へ一元集約するための設定メモです。

## アーキテクチャ

インターネット（外部ネットワーク）からのアクセスを受け入れつつ、OTel Collector の `headers_auth` 拡張機能を用いて API キー（カスタムヘッダー）認証を行うシンプルな構成です。

```
[外部ネットワーク / 外部プロジェクト]
  │
  │ (インターネット経由 / gRPC または HTTP)
  │ ※リクエストヘッダーに「x-api-key: <秘密のキー>」を付与
  ▼
[Cloud Run (Gateway)]  ★ イングレス: すべてのトラフィックを許可
  │ 
  │ ① `headers` 認証器で API キーを検証
  │ ② 認証が通れば GCP バックエンドへ転送
  ▼ (IAM権限で書き込み)
Google Cloud Operations Suite (一元管理)
  ├─ Cloud Trace
  ├─ Cloud Monitoring
  └─ Cloud Logging
```

---

## 前提条件

### コンテナイメージ

運用の透明性と標準化のため、独自のカスタムイメージはビルドせず、OTel公式の共通イメージを使用します。

* イメージ名: `otel/opentelemetry-collector-contrib:latest`
* ※本番運用時は `latest` ではなく、特定のバージョン（例: `0.110.0` など）に固定することを推奨します。

### 必要となる IAM 権限

Cloud Run に紐付けるサービスアカウントに、以下の Google Cloud ロールを付与します。

| 対象サービス | ロール名 | 役割 |
|---|---|---|
| Cloud Trace | roles/cloudtrace.agent | トレースデータの書き込み |
| Cloud Monitoring | roles/monitoring.metricWriter | メトリクスデータの書き込み |
| Cloud Logging | roles/logging.logWriter | ログデータの書き込み |
| Secret Manager | roles/secretmanager.secretAccessor | 設定ファイルおよびAPIキーの読み込み |

---

## 設定ファイル (config.yaml)

公式の `headers_auth` 拡張機能を利用し、ヘッダー内の `x-api-key` と環境変数 `GATEWAY_API_KEY` の値を突合して認証を行います。

```yaml
extensions:
  # ヘッダー値を検証する認証器の定義
  headers_auth:
    headers:
      - action: uppercase
        key: x-api-key
        value: "${env:GATEWAY_API_KEY}" # 環境変数からAPIキーをロード
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: headers_auth # gRPC受信時に認証を強制
      http:
        endpoint: 0.0.0.0:4318
        auth:
          authenticator: headers_auth # HTTP受信時に認証を強制
processors:
  batch:
    send_batch_size: 8192
    timeout: 5s
  resourcedetection:
    detectors: [gcp]
    timeout: 2s
exporters:
  googlecloud:
    log:
      default_log_name: "opentelemetry-gateway-logs"
service:
  extensions: [headers_auth] # 拡張機能の有効化
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resourcedetection, batch]
      exporters: [googlecloud]
    metrics:
      receivers: [otlp]
      processors: [resourcedetection, batch]
      exporters: [googlecloud]
    logs:
      receivers: [otlp]
      processors: [resourcedetection, batch]
      exporters: [googlecloud]
```

---

## デプロイ手順

### 1. Secret Manager への登録

設定ファイルの保護やセキュリティのため、Secret Manager に以下の2つのシークレットを登録します。

1. **otel-collector-config**: 上記 `config.yaml` の中身をそのまま保存。
2. **otel-gateway-api-key**: 認証に使用する任意のAPIキー文字列（例: `SuperSecretApiKey2026`）を保存。

### 2. Cloud Run へのデプロイ

gcloud CLI を使用してデプロイを実行します。

```bash
gcloud run deploy otel-gateway \
  --image=otel/opentelemetry-collector-contrib:latest \
  --port=4317 \
  --use-http2 \
  --allow-unauthenticated \
  --ingress=all \
  --cpu-allocation=always \
  --update-secrets=/etc/otelcol/config.yaml=otel-collector-config:latest,GATEWAY_API_KEY=otel-gateway-api-key:latest \
  --args="--config=/etc/otelcol/config.yaml" \
  --region=asia-northeast1
```

#### 主なオプションの解説

* `--use-http2`: OTel の標準である gRPC 通信を効率よく受けるために必須です。
* `--allow-unauthenticated`: Google Cloud 独自の IAM 認証（OIDC）をバイパスしてインターネットに公開します（認証はコンテナ内の OTel が処理します）。
* `--ingress=all`: 外部ネットワークからの通信を受け付けます。
* `--cpu-allocation=always`: Collector がバックグラウンドで行う `batch` 処理や Google Cloud への送信処理を安定させるため、CPU を常に割り当てます。
* `--update-secrets`: `config.yaml` をファイルとしてマウントし、同時に API キーを環境変数 `GATEWAY_API_KEY` として注入します。

---

## 送信元（外部環境）の設定例

### パターンA: 外部環境に OTel Collector (Agent) を配置する場合

外部環境側の Collector の `config.yaml` で、出力先（Exporter）に Cloud Run のエンドポイントと API キーを設定します。

```yaml
exporters:
  otlp:
    endpoint: "otel-gateway-xxxxxx.run.app:4317" # Cloud Run の URL
    headers:
      x-api-key: "SuperSecretApiKey2026" # 払い出したAPIキー
```

### パターンB: アプリケーション (SDK) から直接送信する場合

各言語の OTel SDK に対し、環境変数を用いてエンドポイントとカスタムヘッダーを注入します。

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otel-gateway-xxxxxx.run.app"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=SuperSecretApiKey2026"
```

---

## 運用上の注意点（Tips）

* **最大インスタンス数の制限**: 不正アクセスや異常トラフィックによる急激な課金を防ぐため、Cloud Run の最大インスタンス数（`--max-instances`）をあらかじめ適切な値（例: 10〜20 など）に制限しておくことを強く推奨します。
* **APIキーのローテーション**: API キーを変更する場合は、Secret Manager の新しいバージョンを作成し、Cloud Run を再デプロイ（または自動反映）します。