# Luenのホームページ

ルエンの活動紹介、SOXLちゃん漫画、代表ポストと、実際のSOXL日足で遊ぶノベル・トレードゲームのソースです。

- `index.html`：ホームページ
- `soxl-game/`：SOXLちゃんは今日も三倍
- `character/`：元のキャラクター画像と漫画サンプル
- `public/og.png`：共有用OGP画像

## 手元で開く

Python 3で静的ファイルをビルドし、ローカルサーバーから表示します。

```sh
python3 build.py
python3 -m http.server 8766 --bind 127.0.0.1 --directory dist
```

ブラウザで `http://127.0.0.1:8766/`、ゲームは `http://127.0.0.1:8766/soxl-game/` を開きます。ゲームはJSONデータを読むため、HTMLファイルの直接ダブルクリックでは動作しません。

## 確認と公開

```sh
node --test soxl-game/tests/*.test.mjs
python3 build.py --origin https://luen-tr.com
```

公開するファイルは `dist/` に生成されます。テスト・制作資料・インポート用スクリプトは公開物に含みません。`.openai/hosting.json` は既存のSitesプレビューの設定です。認証情報やAPIキーは含みません。

ゲームの条件とデータ出典は [ゲームの説明](soxl-game/README.md)、キャラクターの固定デザインと制作記録は [アート資料](soxl-game/ART-DIRECTION.md) を参照してください。
