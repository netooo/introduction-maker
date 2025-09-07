# Introduction Maker API

Hono + Cloudflare Workers で構築された Introduction Maker のバックエンドAPI。

## 技術スタック

- **フレームワーク**: Hono
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **ストレージ**: Cloudflare R2
- **ORM**: Prisma with @prisma/adapter-d1
- **バリデーション**: Zod

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Cloudflare D1 データベースの作成

```bash
# D1データベースを作成
wrangler d1 create introduction-maker-db

# 出力されたdatabase_idをwrangler.tomlに設定
```

### 3. R2バケットの作成

```bash
# R2バケットを作成
wrangler r2 bucket create introduction-maker-images
```

### 4. データベースのセットアップ

```bash
# ローカルデータベースにテーブルを作成
npm run db:create-local

# テーブル作成の確認
npm run db:check

# （本番環境の場合）
# npm run db:migrate:prod
```

### 5. Prismaクライアントの生成

```bash
npm run db:generate
```

## 開発

### ローカル開発サーバーの起動

```bash
npm run dev
```

## API エンドポイント

### プロジェクト管理

- `GET /health` - ヘルスチェック
- `GET /api/templates` - テンプレート一覧取得
- `GET /api/templates/:id` - 特定テンプレート取得
- `POST /api/projects` - プロジェクト作成
- `GET /api/projects/:id` - プロジェクト取得
- `PUT /api/projects/:id` - プロジェクト更新
- `DELETE /api/projects/:id` - プロジェクト削除

### アイテム管理

- `POST /api/projects/:id/items` - アイテム作成
- `GET /api/projects/:id/items` - プロジェクトのアイテム一覧
- `PUT /api/projects/:projectId/items/:itemId` - アイテム更新
- `DELETE /api/projects/:projectId/items/:itemId` - アイテム削除

### 画像アップロード

- `POST /api/images/:projectId/items/:itemId` - 画像アップロード
- `DELETE /api/images/:projectId/items/:itemId` - 画像削除

## デプロイ

```bash
npm run deploy
```

## 環境変数

本番環境では以下がwranglerによって自動設定されます：

- `DB` - D1データベースバインディング
- `R2` - R2バケットバインディング
- `ENVIRONMENT` - 環境名

## データベーススキーマ

### projects テーブル
- `id` (TEXT, PRIMARY KEY)
- `templateId` (TEXT)
- `title` (TEXT, NULLABLE)
- `createdAt` (DATETIME)
- `lastAccessedAt` (DATETIME)

### items テーブル
- `id` (TEXT, PRIMARY KEY)  
- `projectId` (TEXT, FOREIGN KEY)
- `name` (TEXT)
- `imageUrl` (TEXT, NULLABLE)
- `description` (TEXT)
- `order` (INTEGER)

## セキュリティ

- ファイルタイプ検証（JPEG, PNG, WebP のみ）
- ファイルサイズ制限（最大5MB）
- UUIDによるランダムなID生成
- SQLインジェクション対策（Prisma使用）