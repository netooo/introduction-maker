# CLAUDE.md - スポーツ選手紹介風Webアプリ

## プロジェクト概要

スポーツの試合開始前に流れる「選手紹介」の映像を、任意のテーマで作成できるWebアプリケーション。例えば、サッカー選手11人の紹介を「好きなスイーツ11選」のような形で、紹介演出はそのままに内容だけを差し替えて楽しむことができる。

## 主要機能

- 画像のアップロード機能
- テキスト（名前や説明）の編集機能  
- テンプレートの選択機能
- 作成した紹介映像の共有機能（URL共有）

## プロジェクト構造

```
introduction-maker/
├── apps/
│   ├── web/                    # Next.js フロントエンド
│   │   ├── app/
│   │   │   ├── (routes)/
│   │   │   │   ├── page.tsx              # トップページ
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx          # 作成画面
│   │   │   │   ├── edit/[id]/
│   │   │   │   │   └── page.tsx          # 編集画面
│   │   │   │   └── view/[id]/
│   │   │   │       └── page.tsx          # 閲覧画面
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                       # 基本UIコンポーネント
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── templates/                # テンプレートコンポーネント
│   │   │   │   ├── SoccerTemplate.tsx
│   │   │   │   ├── BaseballTemplate.tsx
│   │   │   │   └── TemplateBase.tsx
│   │   │   ├── editor/                   # エディター関連
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   ├── TextEditor.tsx
│   │   │   │   └── ItemList.tsx
│   │   │   └── player/                   # プレイヤー関連
│   │   │       ├── VideoPlayer.tsx
│   │   │       └── FullscreenView.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                    # API通信
│   │   │   ├── storage.ts                # ローカルストレージ管理
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useProject.ts
│   │   │   ├── useAnimation.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                     # Hono バックエンド
│       ├── src/
│       │   ├── index.ts         # エントリーポイント
│       │   ├── routes/
│       │   │   ├── projects.ts
│       │   │   ├── images.ts
│       │   │   └── templates.ts
│       │   ├── services/
│       │   │   ├── project.service.ts
│       │   │   ├── image.service.ts
│       │   │   └── storage.service.ts
│       │   ├── middleware/
│       │   │   ├── cors.ts
│       │   │   ├── validation.ts
│       │   │   └── error.ts
│       │   ├── db/
│       │   │   ├── schema.prisma
│       │   │   └── migrations/
│       │   ├── validators/
│       │   │   └── schemas.ts  # Zod schemas
│       │   └── utils/
│       │       └── r2.ts        # R2 utilities
│       ├── wrangler.toml
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                 # 共有パッケージ
│   │   ├── src/
│   │   │   ├── types/          # 共通型定義
│   │   │   │   ├── project.ts
│   │   │   │   ├── template.ts
│   │   │   │   └── item.ts
│   │   │   └── constants/      # 共通定数
│   │   │       └── templates.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── eslint-config/          # ESLint設定
│       ├── index.js
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CD設定
│       └── deploy.yml
│
├── scripts/
│   ├── cleanup.ts              # 30日間アクセスなしデータ削除
│   └── migrate.ts              # DB migration
│
├── .gitignore
├── .eslintrc.js
├── pnpm-workspace.yaml         # pnpm workspace設定
├── package.json                # ルートpackage.json
├── tsconfig.base.json          # 共通TypeScript設定
└── README.md

```

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion または GSAP
- **プラットフォーム**: Web

### バックエンド
- **フレームワーク**: Hono
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **ストレージ**: Cloudflare R2
- **ORM**: Prisma with @prisma/adapter-d1
- **バリデーション**: Zod
- **デプロイ**: Wrangler

### 開発環境
- **パッケージマネージャー**: pnpm
- **テストフレームワーク**: Vitest
- **リンター**: ESLint + TypeScript ESLint
- **CI/CD**: GitHub Actions

## データモデル

### 紹介項目（Item）
```typescript
interface Item {
  id: string;
  name: string;           // 名前/タイトル
  imageUrl: string;       // 画像URL（R2に保存）
  description: string;    // 説明文
  order: number;         // 表示順序
}
```

### テンプレート（Template）
```typescript
interface Template {
  id: string;
  name: string;          // テンプレート名
  type: 'soccer' | 'baseball';
  itemCount: number;     // 項目数（サッカー:11、野球:9）
  animationType: string; // アニメーションの種類
}
```

### プロジェクト（Project）
```typescript
interface Project {
  id: string;           // UUID形式
  templateId: string;
  items: Item[];
  createdAt: Date;
  lastAccessedAt: Date;
}
```

## UI/UXフロー

### メイン画面の構成
1. **テンプレート選択** → 2. **項目編集** → 3. **プレビュー** → 4. **共有**

### 紹介映像の仕様
- フルスクリーン表示
- 自動再生のアニメーション
- 1項目あたり3-5秒の表示時間
- スポーツ中継のようなダイナミックな演出

## 演出仕様

### アニメーション
- テンプレートごとに異なるトランジション効果
- サッカー風と野球風で異なる演出
- 同じスポーツでも年代によって異なる演出パターンを用意
- BGM/効果音は使用しない

## 画像処理

### アップロード仕様
- **保存先**: Cloudflare R2
- **最大サイズ**: 5MB/枚
- **対応フォーマット**: JPEG、PNG、WebP
- **処理機能**: 自動リサイズ/クロップ機能
- **推奨アスペクト比**: テンプレートごとに設定

## 共有機能

### URL仕様
- **形式**: UUID形式 (`app.com/view/550e8400-e29b-41d4-a716-446655440000`)
- **閲覧権限**: URLを知っていれば誰でも閲覧可能
- **編集権限**: 閲覧者は再生のみ（編集不可）
- **有効期限**: 無期限（ただし30日間アクセスがない場合は自動削除）

## ユーザー管理

### 認証
- ログイン機能なし
- ローカルストレージで作成履歴を管理
- 匿名での作成・共有が可能

### データ管理
- 作成者は編集・削除が可能（ローカルストレージベース）
- 30日間アクセスがないデータは自動削除

## パフォーマンス要件

### 制限事項
- 画像アップロード: 最大5MB/枚
- 同時作成数: 制限なし

### 対応環境
- **デバイス**: 
  - PC/デスクトップ（優先）
  - スマートフォン対応
  - タブレット対応
- **ブラウザ**: モダンブラウザのみ
  - Chrome（最新版）
  - Firefox（最新版）
  - Safari（最新版）
  - Edge（最新版）

## 開発優先順位

1. **アニメーションの滑らかさ・演出のクオリティ** - 最重要
2. **ページの読み込み速度**
3. **使いやすさ（UI/UX）**
4. **コードの保守性**

## 今後の拡張方針

- 新しいテンプレートはサーバー管理者が追加
- ユーザーによるカスタマイズ機能は実装しない
- 動画エクスポート、SNS連携、コラボレーション機能などは予定なし
- シンプルで完成度の高い体験を重視

## 開発上の注意点

### アニメーション実装
- Framer MotionまたはGSAPを使用して滑らかな演出を実現
- 各テンプレートの演出は独立したコンポーネントとして実装
- パフォーマンスを考慮し、GPU加速を活用

### レスポンシブ対応
- デスクトップファーストで設計
- モバイルでも基本機能は問題なく使用できるように実装
- フルスクリーン表示時の各デバイス対応

### データ永続化
- Cloudflare R2での画像管理
- D1でのメタデータ管理
- 自動削除バッチの実装（30日間アクセスなし）

### セキュリティ
- 画像アップロード時のファイルタイプ検証
- ファイルサイズ制限の実装
- XSS対策（ユーザー入力のサニタイズ）
