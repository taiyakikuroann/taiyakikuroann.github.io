---
title: "Python & BigQuery データ抽出・前処理クイックスタート"
description: "Google Cloud の BigQuery からデータを取得し、pandas で簡易集計・整形する際の定型コードメモ。"
category: "Python / Data"
updatedDate: 2026-06-30
tags: ["Python", "BigQuery", "GCP", "pandas"]
draft: false
---

Pythonを用いて BigQuery からデータをロードし、分析や前処理を行うためのボイラープレート（定型コード）です。

## 事前準備

必要なライブラリのインストール：
```bash
pip install google-cloud-bigquery pandas pyarrow
```

---

## データの取得とDataFrame化

認証情報（サービスアカウントやADC）が解決されている前提で、以下のコードでデータを `pandas.DataFrame` としてロードできます。

```python
from google.cloud import bigquery
import pandas as pd

def fetch_bq_data(project_id: str, query: str) -> pd.DataFrame:
    # BigQueryクライアントの初期化
    client = bigquery.Client(project=project_id)
    
    # クエリの実行とDataFrameへの変換
    query_job = client.query(query)
    df = query_job.to_dataframe()
    
    return df

# 実行例
sql_query = """
SELECT 
  date, 
  device.category as device_type, 
  COUNT(DISTINCT fullVisitorId) as unique_users
FROM 
  `bigquery-public-data.google_analytics_sample.ga_sessions_*`
WHERE 
  _TABLE_SUFFIX BETWEEN '20170801' AND '20170831'
GROUP BY 
  1, 2
ORDER BY 
  1 ASC
"""

df_users = fetch_bq_data("your-gcp-project-id", sql_query)
print(df_users.head())
```

---

## pandas によるクイック前処理

### 欠損値の確認と補完
```python
# 欠損値のカウント
print(df_users.isnull().sum())

# 欠損値を0で置換
df_users['unique_users'] = df_users['unique_users'].fillna(0)
```

### 日付列のパースとインデックス設定
```python
# 文字列をdatetime型に変換
df_users['date'] = pd.to_datetime(df_users['date'], format='%Y%m%d')

# 日付をインデックスにして時系列操作をしやすくする
df_users.set_index('date', inplace=True)
```
