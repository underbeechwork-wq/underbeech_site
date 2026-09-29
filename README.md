# 植木屋 アンダービーチ 公開サイト（v26）

SEO・表示速度の最終点検版です。

- 施工・作業写真に 640px / 960px / 1200px の srcset を追加
- トップの人物画像を preload + fetchpriority=high
- OGP / Twitter Card メタデータを全インデックス対象ページで統一
- LocalBusiness 構造化データに画像・ロゴ情報を追加
- 空の lightbox 画像 src を削除
- sitemap.xml から Google が無視する priority / changefreq を削除
- 主要更新ページに lastmod を追加
- 下部セクションに content-visibility を追加
- CSS / JS のキャッシュキーを v26 に更新

正式URL: https://underbeech.com/

GitHub へ更新するときは、ZIPの中身をリポジトリ直下へ上書きしてください。`CNAME` は `underbeech.com` のまま残してください。


## v27 メール・お問い合わせフォーム
- サイト上の電話番号・電話ボタンを削除
- 連絡先メールを `underbeech0601@gmail.com` に変更
- トップページに実送信できるお問い合わせフォームを追加
- 写真1枚の添付に対応（FormSubmit経由、合計10MB以内）
- 送信完了ページ `thanks.html` を追加（noindex）
- 構造化データから telephone を削除し email を追加
- プライバシーポリシーに外部フォーム送信サービス利用を追記

### 初回のみ必要な作業
公開後、自分でフォームを1回送信すると `underbeech0601@gmail.com` にFormSubmitから確認メールが届きます。メール内の確認リンクを押してフォームを有効化してください。確認前は通常のお問い合わせメールとして転送されません。


## v28 Google Analytics 4
- GA4 測定ID `G-01GZ6811BX` を全HTMLページへ設置
- ページビューの自動計測を有効化
- メールリンククリック `contact_email_click` を計測
- 料金シミュレーター利用 `estimate_check` を計測
- 問い合わせフォーム開始 `form_start` と送信試行 `form_submit_attempt` を計測
- 送信完了ページで `generate_lead` を計測（フォーム送信から遷移した場合のみ）
- フォームの氏名・メールアドレス・相談内容などの入力値はGA4へ送信しない
- プライバシーポリシーへGoogle Analyticsの利用を追記


## v29 サイトアイコン
- ブラウザタブ・ブックマーク・ホーム画面用アイコンをアンダービーチの円形ロゴへ統一
- favicon.ico / 32px / 48px / 180px / 192px / 512px を追加
- Web App Manifest を追加
