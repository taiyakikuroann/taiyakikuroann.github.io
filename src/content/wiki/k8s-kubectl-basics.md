---
title: "Kubernetes (k8s) kubectl 頻出コマンド備忘録"
description: "GKEなどのKubernetesクラスター運用で頻出する、kubectlの基本的なデバッグ・確認コマンドのまとめです。"
category: "Kubernetes"
updatedDate: 2026-06-30
tags: ["k8s", "Docker", "SRE", "備忘録"]
draft: false
---

Kubernetesクラスターでの調査・デバッグによく使う `kubectl` コマンドのメモです。

## クラスター・ノード情報の確認

### クラスター情報の取得
```bash
kubectl cluster-info
```

### ノード一覧とステータス表示
```bash
kubectl get nodes -o wide
```

---

## リソースの確認とデバッグ

### 全ネームスペースのPod一覧を取得
```bash
kubectl get pods -A
```

### Podの詳細情報の取得 (記述・イベントの確認)
Podの起動失敗時やクラッシュの調査で最初に使用します。
```bash
kubectl describe pod <pod-name> -n <namespace>
```

### コンテナのログ確認
```bash
# 標準出力の確認
kubectl logs <pod-name> -n <namespace>

# リアルタイムでログを追跡 (tail -f 相当)
kubectl logs -f <pod-name> -n <namespace>

# 複数コンテナが含まれるPodの場合の指定
kubectl logs <pod-name> -c <container-name> -n <namespace>
```

---

## トラブルシューティング

### 起動中のコンテナにシェルで入る
```bash
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash
```

### ローカルポートフォワード
リモートのPodやServiceにローカルホストから一時的にアクセスしたい場合。
```bash
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>
```
これで `http://localhost:8080` からServiceにアクセス可能になります。
