# サロン予約・顧客管理システム

Supabase + React + FullCalendar.js による美容院向け業務管理ツールです。

## セットアップ手順

1. `.env.local` を作成し、下記の環境変数を設定してください。

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. 依存パッケージをインストール。

```bash
npm install
```

3. 開発サーバーを起動。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くと、アプリが表示されます。

## データベーススキーマ（Supabase）

```
customers (
  id uuid primary key default uuid_generate_v4(),
  name text,
  phone text,
  birthday date,
  last_visit date,
  created_at timestamp with time zone default now()
)

staff (
  id uuid primary key default uuid_generate_v4(),
  name text,
  role text
)

menus (
  id uuid primary key default uuid_generate_v4(),
  name text,
  price numeric
)

reservations (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  staff_id uuid references staff(id),
  menu_id uuid references menus(id),
  start_time timestamptz,
  end_time timestamptz,
  status text,
  memo text
)
```

## 今後の拡張予定
- 売上集計モジュール
- Web予約連携
- スタッフ毎の当日予約件数をダッシュボード表示
