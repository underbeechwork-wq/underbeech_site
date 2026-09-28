# 施工事例追加ガイド

施工事例を追加するときは `works/template.html` を複製して使います。

## 公開前に確認すること

1. 実際の施工写真だけを使用する
2. 施工地域・樹種・高さ・料金・作業時間は、確認できた項目だけ記載する
3. お客様の住所・表札・車のナンバーなど個人を特定できる情報が写っていないか確認する
4. 写真は WebP に変換し、必要以上に大きな解像度にしない
5. `title`、`description`、`canonical`、OG情報を施工内容に合わせる
6. 公開準備ができるまでは `noindex,nofollow` のままにする
7. 公開時に `index,follow,max-image-preview:large` へ変更する
8. `works/index.html` に施工事例カードを追加する
9. `sitemap.xml` に新しい施工事例URLを追加する
10. 関連するサービスページから施工事例へ内部リンクを張る

## ファイル名の例

- `works/kawagoe-sentei-shimatoneriko.html`
- `images/kawagoe-sentei-before.webp`
- `images/kawagoe-sentei-after.webp`

SEO目的だけで地名を入れず、実際に施工した地域だけを使ってください。
