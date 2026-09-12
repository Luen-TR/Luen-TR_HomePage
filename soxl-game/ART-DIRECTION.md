# SOXLちゃんの固定デザイン

参照元：`../character/SOXLchan.png`。ルエン本人のキャラクターとは別人。

維持する要素：長い紺色〜青の髪、鮮やかなシアンの毛束、両目とも青、SOXLの青いヘアリボン・髪飾り、アホ毛、青白のスポーティーなジャケット、SOXLロゴ入りクロップトップ、黒いショートパンツ・ベルト類、黒のチョーカー・青いペンダント、青の小物。脚が写る場合は3XソックスとSOXLシューズも参照する。

ロゴと衣装を別物に置き換えない。ルエンのオッドアイ・二色髪を混ぜない。

初版はImageGenで参照画像を編集し、同じ衣装の4表情を生成。以下の濃紺背景の画像は初版の保管素材で、現在の会話画面には使用しない。

| 画像 | 演技 | 主な用途 |
|---|---|---|
| `assets/images/calm.png` | おだやか・自然な笑顔 | タイトル、平穏な日 |
| `assets/images/happy.png` | 元気・喜び・ガッツポーズ | 上昇日、うれしい返事 |
| `assets/images/panic.png` | 慌てる・両手を上げる | 暴落・乱高下・落ち込み |
| `assets/images/shy.png` | 照れ・赤面 | 親密な返事、恋愛エンディング |

4枚とも1024×1536。元の衣装ロゴ、髪、目を基準に目視確認。透過を装う市松模様は使用せず、手の数も修正して最終画像を採用。今後のイベント絵も、必ず元画像を参照して作成する。

## ノベルゲーム用CG（2026-09-09）

原作の生活感と、従来のSOXLchan.pngのキャラクターデザインを組み合わせた7枚。**内蔵ImageGen**を使用。元画像を人物参照とし、最初の朝の部屋を以後の空間・画風の参照にも使用。

すべて1536×1024 PNG。SOXL / 3Xロゴ、紺〜青の髪・シアンの毛束、青い両目、青いヘアリボン、アクセサリーを目視確認。SOXSは赤系の髪・黒の衣装・-3Xで姉妹の差を表現。エスピーさんは成人女性・紺のスーツ・茶髪のまとめ髪・本。

| 一枚絵 | 用途 |
|---|---|
| [三倍の朝](assets/scenes/room-morning.png) | 朝の自宅、出会い、平穏な日 |
| [三倍のうれしい](assets/scenes/room-rise.png) | 夜の自宅、上昇した日 |
| [彼女の冬](assets/scenes/winter.png) | 雨の夜、SOXSが姉に飲み物を届ける場面 |
| [一倍で、嬉しい](assets/scenes/promise.png) | コーヒーと約束、奥ではエスピーさんが読書 |
| [窓際のふたり](assets/scenes/cafe.png) | カフェのデート |
| [帰り道を少し遠く](assets/scenes/riverside.png) | 川沿いのデート |
| [協力プレイ](assets/scenes/arcade.png) | ゲームセンターのデート |

制作用の画像コピーと正確な最終プロンプト一式：
[プロンプト・参照画像・生成記録](/Users/luen_tr/Documents/Codex/soxl-novel-art/prompts-manifest.json)

プロンプトの共通仕様：キャラクターデザインを元画像から固定、生活感のある小さな日本の住居、人物を画面中央〜右、下部に会話を重ねられる余白、ゲームUIや字幕を画像に入れない。朝／夜／雨／コーヒー／カフェ／夕暮れの川沿い／ゲームセンターを個別の情景として指定。

頭上のアホ毛を切らないように配置。全体鑑賞はcontain表示。

## 立ち絵・目ぱち・口パク版（2026-09-10）

通常は場所の背景と立ち絵を別々に表示。会話枠の小さな顔アイコンは廃止し、正面にいるSOXLちゃんの表情で演技する。原画生成・表情編集は**内蔵ImageGen**。透明背景の生成が市松模様として出力されたため、確認後のユーザーの続行指示を受け、ローカルで背景を透明化した。元の生成画像は保管し、ロゴ・衣装・髪・顔を描き直す処理は行わない。

| 立ち絵 | 会話での使い方 |
|---|---|
| [calm-rest.png](assets/standing/calm-rest.png) | 平常・聞き役 |
| [happy-rest.png](assets/standing/happy-rest.png) | 上昇日・喜び |
| [sad-rest.png](assets/standing/sad-rest.png) | 下落日・不安・冬の会話 |
| [panic-rest.png](assets/standing/panic-rest.png) | 暴落・乱高下 |
| [shy-rest.png](assets/standing/shy-rest.png) | 親密な返事・約束 |
| [angry-rest.png](assets/standing/angry-rest.png) | 気持ちを無視された返事への反応 |

各表情は同一の1024×1536キャンバスに、通常・閉眼・発話の3画像をそろえる。通常画像を固定し、閉眼画像の目元と発話画像の口元だけを重ねる。体や服は瞬き・口パク中に切り替えない。差分レイヤーは生成画像から必要な領域を切り出し、残りを透明化したPNG。イラストとして目や口をCSSで描かない。

瞬きは3.8〜6.2秒の不規則な間隔で115ms閉眼。口はSOXLちゃんの台詞が表示されている間に開閉し、句読点、表示完了、他の人物の発話、CG、別画面を開いている間は止まる。文字の速さは4段階、表情アニメーションは設定でオフにできる。端末の「動きを減らす」設定も尊重する。音声はないため、ボイス連動ではなくテキスト連動。

背景は6枚、すべて1536×1024：`assets/backgrounds/{room-morning,room-rise,winter,cafe,riverside,arcade}.png`。既存CGを参照し、人物だけを除いた生活空間として生成。約束の場面には朝の自宅を使用する。

CGの表示条件：序章での出会い、冬に妹が飲み物を届ける場面、「これは、一倍で、嬉しい」、冬の後の実際の上昇日、各デート先で最初に心が通った返事、エンディング。通常の背景を訪れただけではアルバムを解放しない。旧版で解放済みのアルバムは保存互換のため保持する。

元画像・正確な生成プロンプト・参照元：

- [立ち絵の生成記録](/Users/luen_tr/Documents/Codex/soxl-standing-art/manifest.json)
- [ゲームに組み込んだ透明PNGの記録](/Users/luen_tr/Documents/Codex/soxl-standing-art/processed-manifest.json)
- [背景の生成記録](/Users/luen_tr/Documents/Codex/soxl-background-art/manifest.json)
- [背景のプロンプト全文](/Users/luen_tr/Documents/Codex/soxl-background-art/prompts.json)

制作上の参照（他作品の画像・台詞・コードは転用していない）：

- [Summer Pocketsの公式システム紹介](https://www.prot.co.jp/switch/summerpockets/system.html)：会話・選択肢を中心に別の遊びを挟む構成、会話ログなど。
- [Summer Pockets REFLECTION BLUEの公式ギャラリー](https://key.visualarts.gr.jp/summer_rb/gallery.html)：イベントCGを通常の会話演出とは別の見せ場として考える参照。
- [ティラノスクリプトの目ぱち・口パク解説](https://tyrano.jp/usage/tech/pachi)：同じ解像度のベース・目・口の差分、ランダムな瞬き、話者に連動する口パク。
- [Ren’PyのLayered Images](https://www.renpy.org/doc/html/layeredimage.html)：体・表情などを層に分ける設計。
- [Argent Gamesの制作解説](https://blog.argentgames.co/post/2021-03-08-renpy-animation-while-talking/)：本人が話している間だけ口を動かす考え方。コードの転載なし。
