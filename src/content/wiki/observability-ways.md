---
title: "OpenTelemetry アラート・障害検知設定パターン集"
description: "OpenTelemetry で収集したテレメトリーデータ（メトリクス・ログ・トレース）をもとに、Google Cloud Monitoring でアラートを設定・運用する際の定番パターン集・備忘録。"
category: "Observability"
updatedDate: 2026-07-08
tags: ["Alerting", "GCP", "Monitoring", "Observability"]
draft: false
---

OpenTelemetryで集約したメトリクス、ログ、トレースをトリガーとして、Cloud Monitoring のアラート機能で異常検知・通知を行うための実装パターンです。複数プロジェクトを管理する場合の考慮点も含めて整理しました。
------------------------------
## 1. 通知チャンネルの設定

アラート通知先（Slack、メール、Webhooks、PagerDutyなど）を事前に設定します。

   1. Google Cloud コンソール → [Monitoring] → [Alerting] → [Edit Notification Channels]
   2. Slack 連携、または共通メーリングリストを登録
   3. 登録後、チャンネルの「一意のID（例: `projects/YOUR_PROJECT/notificationChannels/12345`）」が発行される → アラートポリシーに紐付ける

------------------------------
## 2. 障害検知パターンと設定方法

### ① メトリクス - エラー率・レイテンシが閾値を超過

* 検知の仕組み:
MQL（Monitoring Query Language）やPromQLを使い、送信元のリソース属性 gcp.project.id でグルーピングまたはフィルタリングを行って監視する。
* MQLによるアラート条件例（HTTP 5xxエラー率が5%を超えたら検知）:
```
fetch gce_instance :: ://googleapis.com
| filter (attributes.["http.status_code"] >= 500)
| group_by [resource.attributes.["gcp.project.id"]], sliding(5m), count()
| condition count() > 500'count/s'
```
* 運用ルール: 各開発チームは、自身の gcp.project.id をベースにアラートポリシーを作成する。

### ② ログ - 重大エラーの検知

* 検知の仕組み:
「ログベースのメトリクス（Log-based Metrics）」 を作成し、それをCloud Monitoringで監視する。
* 設定手順:
1. [Logging] > [Log-based Metrics] で、特定のプロジェクトの致命的ログをカウントするメトリクスを作成。
   * フィルタ条件の例:
      ```
      jsonPayload.resource.attributes."gcp.project.id" = "pj-frontend-prod" AND (severity >= ERROR OR textPayload =~ "FATAL")
      ```
      2. このメトリクスの値が「1分間に1以上（または任意の回数）」になったらアラートを飛ばすよう、Cloud Monitoringのポリシーを作成する。

### ③ インフラ - Cloud Run Gateway 自体の障害検知

* 監視対象の標準メトリクス:
* ://googleapis.com（インスタンス数が上限に達していないか）
   * ://googleapis.com（ステータスコード 4xx や 5xx の急増。APIキーの間違いやCollector内部エラーを検知）
   * ://googleapis.com（CPU使用率の逼迫）
* アラートの推奨設定:
「Cloud Run Gatewayのレスポンス（5xx）が1分間に一定数以上発生した場合」に、統合監視共通のインフラ管理チーム（またはSREチーム）へ通知を飛ばすポリシーを設定しておく。

------------------------------
## 3. アラート通知テンプレート

通知が届いた際に対応者が素早く対応できるよう、以下の情報をアラートポリシーの Documentation に埋め込みます：

```
【概要】
テレメトリーデータの解析により、アプリケーションに異常が検知されました。

【発生元プロジェクト】
- プロジェクトID: ${resource.label.gcp_project_id}
- 環境: ${resource.label.environment}

【対応手順】
1. Google Cloud コンソール → ログエクスプローラ
2. 以下のクエリで対象プロジェクトのログを確認：
   jsonPayload.resource.attributes."gcp.project.id" = "${resource.label.gcp_project_id}"
3. Cloud Trace で分散トレースの詳細を確認
```

こうすることで、各開発チームが自律的に障害対応できる体制が実現します。

