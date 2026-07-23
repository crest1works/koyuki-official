# KOYUKI Official Site 運用ガイド

このサイトはビルドツール（Node.js等）を使わない、プレーンなHTML/CSS/JSで作られています。
`crestw-site`（Crest W Men's Academy）と同じく、ファイルを直接編集してFTP（FileZilla）で
アップロードするだけで更新できます。

## 1. ディレクトリ構成

```
koyuki-site/
├── index.html                 … トップページ（Hero/About/Works/Gallery/News抜粋/SNS/Contact/Footer）
├── news.html                   … NEWS一覧ページ
├── news/
│   ├── _template.html          … 新規記事作成用テンプレート（非公開・削除しないこと）
│   └── 2026-xx-xxxxx.html      … 記事詳細ページ（1記事＝1ファイル）
├── css/style.css                … 全ページ共通スタイル（色・余白の変更はここ）
├── js/
│   ├── main.js                  … メニュー開閉・スクロールアニメーション
│   ├── gallery.js                … ギャラリーの拡大表示（ライトボックス）
│   └── contact.js                … お問い合わせフォームの送信処理
├── assets/
│   ├── images/hero, about, gallery, news … 各写真（現在はプレースホルダー）
│   ├── ogp-default.jpg            … SNSシェア時のデフォルト画像
│   └── favicon-*.png / apple-touch-icon.png
└── README-運用ガイド.md（このファイル）
```

## 2. 写真を差し替える

1. 差し替えたい写真を用意する（顔・体型の加工はせず、トリミングのみ推奨）
2. 対応するファイル（例：`assets/images/hero/hero-main.svg` → `hero-main.jpg`）と同名・同じ場所に置く
   - 拡張子を変える場合は、該当するHTML内の `<img src="...">` のパスも書き換える
3. 推奨サイズの目安（プレースホルダー画像に記載しています）
   - Hero写真：1000×1250px前後（縦長）
   - About写真：800×1000px前後（縦長）
   - ギャラリー写真：900×1125px前後（縦長・正方形に近くてもOK）
   - NEWSサムネイル：1200×800px前後（横長）
4. ファイルサイズの目安：1枚あたり300KB以下になるように書き出すと表示が軽くなります
   （Mac標準の「プレビュー.app」や「サイズを調整」機能で書き出し可能）

## 3. NEWS記事を追加する

**一番かんたんな方法：Claude Code（このAIアシスタント）にお願いする**
「NEWSに記事を追加したい。日付は◯月◯日、タイトルは『〜』、タグはEvent、
本文は『〜』、写真はこれを使って」と伝えるだけで、記事ページの作成〜
トップページ・一覧ページへの反映まで代行できます。

**自分で追加する場合の手順：**

1. `news/_template.html` をコピーし、`news/` フォルダの中に
   `2026-08-01-event-name.html` のような分かりやすいファイル名で保存
2. ファイルを開き、【】で囲まれた部分（タイトル・日付・タグ・本文・画像パス）を書き換える
   - タグ（カテゴリ）は `Model` `Live` `Event` `Media` `Other` のいずれかを使い、
     `class="tag tag-model"` の部分も `tag-live` / `tag-event` / `tag-media` / `tag-other` に対応させる
3. `index.html` のHero内NEWS（`.hero-news-list`）に新しい記事の `<li>` を先頭に追加する
   （横スクロールのカルーセルなので、件数が増えてもHeroの高さは変わりません。件数が多くなってきたら
   古いものから`<li>`を間引いてもOKです）
4. `news.html` の一覧（`#news-index-list`）にも、新しい記事を一番上に追加し、
   `data-category="model"` のように上記カテゴリのいずれかを指定する
   （NEWS一覧ページにはカテゴリ絞り込みタブがあり、この`data-category`で判定しています）
5. FileZillaで3つのファイル（新規記事・index.html・news.html、画像を追加した場合は画像も）をアップロード

※ タグの色は `css/style.css` 内「タグ（カテゴリ）カラー」の1箇所で管理しているので、
　新しいタグの色を追加したい場合はそこに `.tag-新しい名前 { --tag-bg: ...; --tag-fg: ...; }` を
　1行足すだけで使えるようになります。

## 4. About文・活動経歴を編集する

- About文：`index.html` 内 `<p class="lead">` の中身をそのまま書き換えるだけです（改行もそのまま反映されます）
- 活動経歴：`index.html` 内 `id="works"` セクションは、年タブをクリックするとその年の経歴だけが
  表示される形式です。既存の年に追加する場合は、対応する `<ol class="year-panel timeline" id="year-panel-20XX">`
  の中に `<li class="timeline-item glass">` を1ブロックコピーして、日付・タイトル・説明・タグを書き換えれば追加できます
  新しい年が始まったら、`.year-tabs` 内にタブ（`<button class="year-tab" role="tab" ...>`）と、
  対応する `.year-panel`（`id`とタブの`aria-controls`を同じ年で対応させる）をセットで追加してください

## 5. お問い合わせフォームについて（Netlify Forms）

お問い合わせフォームは [Netlify Forms](https://docs.netlify.com/forms/setup/) を利用しています。
Netlify以外のホスティング（Xserverなどのレンタルサーバー）で公開する場合は動作しませんので、
その場合はClaude Codeに伝えてください（PHPメール送信スクリプト等への切り替えを行います）。

**Netlifyへデプロイすれば、追加のコード変更なしにそのまま使えます。** 手順は以下の3点のみです。

1. `koyuki-site` フォルダ（このサイト一式）をNetlifyにデプロイする
   （Netlifyはビルド時にHTML内の `data-netlify="true"` が付いた `<form>` を自動検出し、
   フォーム送信の受け皿を作成します。特別な設定は不要です）
2. デプロイ後、Netlifyの管理画面で **Site configuration → Forms → Form notifications** を開き、
   「Email notification」を追加して、送信内容を受け取りたいメールアドレスを設定する
3. 実際にフォームから送信してみて、設定したメールアドレスに届くか確認する
   （Netlifyの管理画面の **Forms** タブでも送信内容の一覧を確認できます）

送信が完了すると `thanks.html`（送信完了ページ）に移動します。文面を変えたい場合は
`thanks.html`内の文章を直接書き換えてください。

**スパム対策として実装済みのもの：**
- ハニーポット欄（`name="bot-field"`）：人には見えないが、Botは自動入力してしまう欄。
  `<form>` タグの `netlify-honeypot="bot-field"` と組み合わせて、Netlifyが自動的にスパム扱いにします
- 上記に加え、Netlifyの管理画面でreCAPTCHA連携（Forms → Form detection）も追加可能です

**入力項目を増やしたい場合：** `index.html` 内のContactフォーム（`<form ... name="contact">`）に
`.form-row` を1ブロック追記し、`<input>` に `name` 属性を付けるだけで、Netlify側でも
自動的に受信項目に追加されます（Netlify側の追加設定は不要です）。

## 6. 公開方法（FTPアップロード）

※ お問い合わせフォーム（Netlify Forms）を動かすには、このサイトを **Netlifyでホスティングする必要があります**。
　 Xserverなど一般的なレンタルサーバーにFTPでアップロードした場合、フォームは送信できません
　（その場合は5章の案内のとおりClaude Codeにご相談ください）。Netlifyを使う場合は、この章のFTP手順は不要です
　（Netlifyの管理画面からフォルダをドラッグ＆ドロップするだけで公開できます）。

1. FileZillaでレンタルサーバーに接続する
2. `koyuki-site` フォルダの中身一式（`index.html` 以下すべて）を、
   サーバーの公開フォルダ（`public_html` や `www` など）にアップロードする
3. `news/_template.html` は公開しても実害はありませんが、検索エンジンに
   拾われないよう `robots.txt` で `Disallow: /news/_template.html` を指定しておくと安心です
4. 独自ドメインでの公開後は、各HTMLファイル内の
   `https://www.example.com/` の部分を実際のドメインに置換してください
   （OGP・canonicalタグの設定に使われています）

## 7. SEO / OGPについて

- 各ページの `<title>` と `<meta name="description">` は、そのページ内容に合わせて
  個別に設定されています。記事を追加する際も必ず埋めてください
- NEWS記事は1記事＝1ファイルにしているため、X（旧Twitter）やLINEでシェアされた際にも
  正しいタイトル・画像でカードが表示されます
- サイト全体の説明文・OGP画像は `assets/ogp-default.jpg` を使っています。
  ロゴやKOYUKIさんの写真に差し替えると、より魅力的なシェア表示になります

## 8. アクセシビリティ / パフォーマンスについて

- すべての画像に `alt` 属性を設定しています（差し替え時も必ず内容に合わせて書き換えてください）
- 色のコントラスト、キーボード操作、フォーカス表示に配慮した設計にしています
- 画像は `loading="lazy"` で遅延読み込みし、初期表示速度に配慮しています
- Webフォント（Noto Serif JP / Noto Sans JP）はGoogle Fonts CDN経由で読み込んでいます
