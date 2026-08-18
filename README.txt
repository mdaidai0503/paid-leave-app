有給休暇管理 v4

【v4の主な追加】
・複数端末共有
・メールアドレス＋パスワードでログイン
・管理者／従業員の権限分け
・Supabaseクラウド同期
・従業員は自分の申請・残数を確認
・管理者は全従業員、承認待ち、年間管理を確認
・GitHub Pagesでアプリ本体を公開可能
・Supabase未設定時はローカルモードで試用可能

【GitHubへ置くファイル】
index.html
manifest.webmanifest
sw.js

【Supabase側】
supabase-setup.sql を Supabase Dashboard の SQL Editor で実行してください。

【最初の管理者】
1. GitHub Pagesでv4を開く
2. 接続設定に Supabase Project URL と anon key を入力
3. メールアドレスとパスワードで新規登録
4. Supabaseの profiles テーブルで、そのユーザーの role を admin に変更
5. 再ログイン

【重要】
Supabase Project URL と anon key はフロントエンドから使用する公開用キーです。
service_role key は絶対にこのアプリへ入力しないでください。

v3以前のデータは端末内保存です。
v4の設定画面に「旧データをクラウドへ取り込む」機能を用意しています。
