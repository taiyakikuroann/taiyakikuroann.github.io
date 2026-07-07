---
title: "gcloud logging 基本コマンドチートシート"
description: "日常的によく使用する `gcloud logging` の基本コマンドのまとめと備忘録です。"
category: "GCP"
updatedDate: 2026-07-02
tags: ["GCP", "CLI", "備忘録"]
draft: false
---

プロジェクト運用で頻出するGCPのエラーログ確認の基本操作コマンドをまとめておきます。  トラブルシュートに役立つはず。

## 直近のエラーログ一覧(サービス指定)

### Cloud Run の場合
```bash
gcloud logging read '
  resource.type="cloud_run_revision" AND
  resource.labels.service_name="[API_SERVICE_NAME]" AND
  severity>=ERROR AND
  timestamp>="2026-07-02T00:00:00+09:00"
' \
  --project=[PROJECT_ID] \
  --limit=50 \
  --order=desc \
  --format='table(timestamp, severity, textPayload)'
```

### GKE の場合
```bash
gcloud logging read '
  resource.type="k8s_container" AND
  resource.labels.container_name="[API_SERVICE_NAME]" AND
  severity>=ERROR AND
  timestamp>="2026-07-02T00:00:00+09:00"
' \
  --project=[PROJECT_ID] \
  --limit=50 \
  --order=desc \
  --format='table(timestamp, severity, textPayload)'
```

---

## 検索日時を指定して検索

### 何かのID A_id / B_id で横断検索(サービスをまたいで追う)
```bash
gcloud logging read '
  ("{A_id}" OR "{B_id}") AND
  timestamp>="2026-07-02T00:00:00+09:00" AND
  timestamp<="2026-07-02T23:59:59+09:00"
' \
  --project=[PROJECT_ID] \
  --limit=100 \
  --order=asc \
  --format='table(timestamp, resource.type, severity, textPayload)'
```
> --order=asc にすると時系列で処理の流れが追えるので、
> 「どのサービスのどの段階で失敗したか」の切り分けに使う。
> ※ 横断検索時は `resource.labels.service_name` が取れないリソースもあるため、`resource.type` を表示させておくと便利です。

---

## 詳細をJSONで保存

### A_id で検索
```bash
gcloud logging read '"{A_id}"' \
  --project=[PROJECT_ID] \
  --limit=100 \
  --format=json > task_{A_id}_logs.json
```

---

## 番外

### Logs Explorer(GUI)

コマンドより GUI の方が安全で速い。

1. https://console.cloud.google.com/logs/query?project=[PROJECT_ID] を開く
2. 期間をエラー発生時刻の前後30分に設定
3. 下記クエリを貼り付けて実行

```sql
-- 特定サービスに絞る場合(Cloud Run の例)
resource.type="cloud_run_revision"
resource.labels.service_name="[API_SERVICE_NAME]"
severity>=ERROR
```
