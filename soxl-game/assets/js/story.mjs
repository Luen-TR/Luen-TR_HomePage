import { dayMood, VENUES } from './engine.mjs';

const moods = {
  crash: ['む、無理！ 心までロスカットされそうなんだけど……！', 'ねえ、画面を閉じても数字が頭から消えない。今日は、強がれないかも。', 'ギャーッ！ 私のチャート、床を突き抜けてない！？ ……ちょっと、そばにいて。'],
  whipsaw: ['上！ 下！ やっぱり上！？ 私の心、往復ビンタなんだけど！', '喜んでいいの？ 泣いていいの？ もう感情の注文が通らない！', 'ローソクのヒゲ長すぎ！ 今日だけで一週間ぶん疲れたよ……。'],
  soaring: ['見て見て！ 私、今日ちょっと最強かもしれない！', 'ふふん。こんな日は、なんでもできそう！ ……一緒に喜んでくれる？', 'きたきたきたーっ！ この勢いで、あなたの心にも高値更新！ ……今のナシ！'],
  down: ['今日はちょっと、肩が下がっちゃうな。隣、空いてる？', '私までダメになったみたいに感じるの、変だよね。数字と私は、違うのに。', 'はぁ……。せめて帰り道は、ゆっくり歩きたいな。'],
  up: ['今日は足取りまで軽い！ 帰りに寄り道しない？', 'いい感じ、いい感じ。ねえ、あなたの今日の調子はどう？', 'ちょっと上向き。こういう日を、あなたと分け合えるの、好きかも。'],
  calm: ['静かな相場の日って、あなたの声がよく聞こえる気がする。', 'ねえ、チャートを見てない時のあなたって、どんな人？', '急がない日も、あっていいよね。今日は、何を話そうか。'],
};

const choice = (text, affection, trust, reply, sprite = 'calm') => ({ text, affection, trust, reply, sprite });

export function conversation(state, bars) {
  const mood = dayMood(bars[state.index], bars[state.index - 1]);
  const variant = state.index % 3;
  let options;
  if (['crash', 'down'].includes(mood.type)) options = [
    choice('今日は無理しなくていい。隣にいるよ。', 3, 2, '……ありがと。上がってる時だけじゃなくて、こんな日も、いてくれるんだ。', 'shy'),
    choice('一緒に今日の値幅を見て、作戦を整理しよう。', 1, 3, 'うん。気持ちと注文、いったん分けて考えよう。そう言ってくれると、少し落ち着く。'),
    choice('絶対に明日は上がるって！', -2, -3, '……絶対、って言われると怖いよ。わからないことは、わからないまま一緒にいてほしい。', 'panic'),
  ];
  else if (mood.type === 'whipsaw') options = [
    choice('一回深呼吸。今すぐ結論を出さなくていい。', 3, 3, 'すー……はー……。よし。心のスプレッド、ちょっと狭くなった！'),
    choice('甘いものでも食べて、少し休憩しよう。', 3, 1, 'それ、採用！ チャートと違って、あなたは振り回さないでね？', 'shy'),
    choice('もっと騒いで！ 見てておもしろい。', -3, -2, 'こっちは本気でへとへとなの！ 笑うなら、一緒に笑える時にして。', 'panic'),
  ];
  else if (['up', 'soaring'].includes(mood.type)) options = [
    choice('うれしいね。一緒に喜ぼう！', 3, 1, 'やった！ あなたが笑ってると、うれしさまでレバレッジかかっちゃう！', 'happy'),
    choice('いい日だね。次の注文は落ち着いて考えよう。', 1, 3, '浮かれてたの、バレた？ うん、明日のことまで決まったわけじゃないもんね。', 'happy'),
    choice('このまま絶対に勝てる。全部いこう！', 0, -3, '気分はいいけど、私に「絶対」はないよ？ そこはちゃんと覚えてて。'),
  ];
  else {
    const quiet = [
      [choice('次の休み、ふたりでどこか歩こう。', 3, 1, 'それって……デートのお誘い？ 約束、ちゃんと予定に入れてよね。', 'shy'), choice('これまでの売買を振り返ってみよう。', 1, 3, 'いいね。勝った日だけじゃなく、迷った日も見返してみよ。'), choice('今日は自分の時間も大事にしよう。', 1, 2, 'うん。ずっと一緒じゃなくても、また話せるってわかるの、安心する。')],
      [choice('実は、君と話す時間が楽しみなんだ。', 3, 1, '……えっ。不意打ちは禁止！ 私も……ちょっと、楽しみにしてた。', 'shy'), choice('わからないことを考えるのが好き。', 2, 2, '相場も、私の気持ちも、わからないことだらけだね。でも、一緒に考えるのは好き。'), choice('数字を見るのが一番楽しい。', 0, 1, 'そっか。じゃあ、その画面の隣にいる私のことも、時々見てね。')],
      [choice('今日の小さなよかったことを話そう。', 3, 1, 'じゃあ私から。今日もあなたに会えたこと！ ……はい、次あなた！', 'happy'), choice('焦らず続けられる作戦がいいね。', 1, 3, 'うん。派手な一日より、明日もここに来られること、大事にしたい。'), choice('何も起きないと、つまらないな。', -1, 0, '私は、何も起きない日に一緒にいられるのも、結構好きだけどな。')],
    ];
    options = quiet[variant];
  }
  return { line: moods[mood.type][variant], options, sprite: mood.sprite };
}

export function dateScene(state, bars) {
  const planned = state.datePlan.venue;
  const freeWalk = state.cash < VENUES[planned].cost;
  const venue = freeWalk ? 'park' : planned;
  const mood = dayMood(bars[state.index], bars[state.index - 1]);
  const low = ['crash', 'down'].includes(mood.type);
  const wild = mood.type === 'whipsaw';
  const high = ['up', 'soaring'].includes(mood.type);
  const scenes = {
    cafe: low ? 'カップを両手で包んだまま、SOXLちゃんは窓の外を見ている。' : wild ? 'メニューを開いては閉じて、彼女の指先まで落ち着かない。' : high ? '「今日はケーキも！」彼女は窓際の席で、うれしそうに笑った。' : '窓際の席。コーヒーの湯気の向こうで、彼女と目が合った。',
    park: low ? '川沿いの道。彼女の歩幅は、いつもより少し小さい。' : wild ? 'さっきまで早足だった彼女が、今度は急に立ち止まった。' : high ? '「こっち、景色いいよ！」彼女が少し先から手を振っている。' : '川面に光が揺れる。急がなくていい午後が、ふたりの前に続いている。',
    arcade: low ? 'いつものゲームの前で、彼女は今日は静かに立っている。' : wild ? '「勝った！ あ、負けた！」ゲームでも、彼女は忙しそうだ。' : high ? '「今日は負ける気しない！」彼女の目が、ゲームの光より輝いている。' : 'ふたりで遊べるゲームを探して、並んでフロアを歩く。',
  };
  const line = low ? 'ごめん、せっかくの約束なのに。今日の値動き、まだ引きずっちゃってる。' : wild ? '会えてうれしいのに、まだ心が上下してる！ 今日の私、変じゃない？' : high ? '今日ね、ずっと楽しみにしてたの！ チャートも上がったけど、あなたに会えた方が……ううん、なんでもない！' : '相場の話じゃない時間も、あなたと過ごしてみたかったんだ。';
  const options = low || wild ? [
    choice(venue === 'park' ? '君のペースで歩こう。話したくなったら聞くよ。' : '無理に元気を出さなくていいよ。', 8, 6, '……待っててくれるんだね。今、少しだけ、手をつないでもいい？', 'shy'),
    choice('今日は予定を短くして、ゆっくり休もう。', 5, 7, 'うん。でも、もうちょっとだけ一緒にいたい。気にかけてくれて、ありがとう。', 'shy'),
    choice('せっかく来たんだから、楽しそうにしてよ。', -5, -5, '……ごめん。でも、楽しいふりをするために、会いたかったわけじゃないよ。', 'panic'),
  ] : [
    choice(venue === 'arcade' ? '次は協力プレイしよう。ふたりで勝ちたい。' : '今日は、君のことをもっと聞かせて。', 8, 5, '私のこと？ ……じゃあ、秘密をひとつ。次の約束、もう考えちゃってる。', 'shy'),
    choice(venue === 'cafe' ? 'ケーキ、半分ずつにしよう。' : '今日のこと、ふたりの思い出にしよう。', 7, 4, 'いいね。次に落ち込んだ日、この時間のこと思い出せそう。', 'happy'),
    choice('ごめん、ずっとチャートを見ていたい。', -4, -2, 'そっか。せめて今だけは、私の方を向いていてほしかったな。'),
  ];
  return { scene: scenes[venue], line, options, sprite: mood.sprite, freeWalk, venue };
}

const events = [
  { date: '2020-03-16', until: '2020-03-20', text: '3月15日、FRBが政策金利の誘導目標を0〜0.25%へ引き下げ。緊急対応が続いていた時期。', label: 'FRB発表 · 2020/3/15', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20200315a.htm' },
  { date: '2022-03-16', until: '2022-03-22', text: 'FRBが政策金利の誘導目標を0.25〜0.50%へ引き上げ。金融政策の転換が進んでいた時期。', label: 'FRB発表 · 2022/3/16', url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20220316a.htm' },
  { date: '2023-05-25', until: '2023-06-01', text: '5月24日の引け後、NVIDIAが次四半期の売上高見通しを110億ドルと発表。AI需要への注目が集まった時期。', label: 'NVIDIA決算 · 2023/5/24', url: 'https://investor.nvidia.com/news/press-release-details/2023/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2024/' },
];

export function contextEvent(date) { return events.find(e => e.date <= date && date <= e.until); }

export function marketExplanation(bar, previous) {
  const mood = dayMood(bar, previous);
  const pct = v => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%`;
  const gap = previous ? `寄り付きは前日終値から${pct(bar.open / previous.close - 1)}。` : '';
  const body = bar.close >= bar.open ? '始値より上で引けた陽線' : '始値より下で引けた陰線';
  return `${gap}終値の${previous ? '前日比' : '始値比'}は${pct(mood.change)}、日中の高安差は${previous ? '前日終値' : '始値'}比で${(mood.range * 100).toFixed(2)}%。今日は${body}だよ。`;
}
