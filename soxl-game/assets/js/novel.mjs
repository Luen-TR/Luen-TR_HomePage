import { dayMood, account } from './engine.mjs';
import { historicalEvent } from './history.mjs';

export const SCENES = {
  'room-morning': { file:'room-morning.png', place:'自宅 · 朝', title:'三倍の朝', alt:'朝の光が差す部屋で、マグカップを持つSOXLちゃん' },
  'room-rise': { file:'room-rise.png', place:'自宅 · 夜', title:'三倍のうれしい', alt:'夜の部屋で、良い一日を喜ぶSOXLちゃん' },
  winter: { file:'winter.png', place:'自宅 · 雨の夜', title:'彼女の冬', alt:'雨の夜、ソファのSOXLちゃんに温かい飲み物を差し出すSOXSちゃん' },
  promise: { file:'promise.png', place:'自宅 · コーヒーの時間', title:'一倍で、嬉しい', alt:'エスピーさんが本を読む部屋で、頬を染めてコーヒーを飲むSOXLちゃん' },
  cafe: { file:'cafe.png', place:'街角のカフェ', title:'窓際の、ふたり', alt:'カフェの窓際で、ふたりぶんのカップを前に待つSOXLちゃん' },
  riverside: { file:'riverside.png', place:'川沿い · 夕暮れ', title:'帰り道を、少し遠く', alt:'夕暮れの川沿いで振り返るSOXLちゃん' },
  arcade: { file:'arcade.png', place:'ゲームセンター', title:'協力プレイ', alt:'ゲームセンターで一緒に遊ぶSOXLちゃん' },
};
export const BACKGROUNDS = {
  'room-morning':'room-morning.png', 'room-rise':'room-rise.png', winter:'winter.png',
  promise:'room-morning.png', cafe:'cafe.png', riverside:'riverside.png', arcade:'arcade.png',
};
export const FRIENDS = {
  NVDA: { name:'エヌちゃん', company:'NVIDIA', role:'新しいことに夢中になる友だち', color:'#b6d689' },
  AMD: { name:'エイミー', company:'AMD', role:'挑戦を続ける、負けず嫌いの友だち', color:'#ffc2b7' },
  INTC: { name:'インテル先輩', company:'Intel', role:'この街の昔をよく知る先輩', color:'#9ed2fa' },
  AVGO: { name:'ブロードさん', company:'Broadcom / 旧Avago', role:'人と人をつなぐのが得意な友人', color:'#ddb0d4' },
};
const pct = value => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;
const f = (speaker,text,scene='room-morning',source=null) => ({ speaker,text,scene,source });

export function ensureStory(state) {
  if (!state.story) state.story = { version:1, seen:state.index > state.start ? ['prologue'] : [], winterAt:null, boundary:false, packet:null, log:[], unlocked:[] };
  return state.story;
}
export function validateStory(story, state, bars) {
  if (state.lastEventResult?.cg && !SCENES[state.lastEventResult.cg]) return false;
  if (story === undefined) return true; // First edition saves migrate in place.
  if (!story || story.version !== 1 || !Array.isArray(story.seen) || !story.seen.every(s => typeof s === 'string') || !Array.isArray(story.log) || !Array.isArray(story.unlocked) || !story.unlocked.every(s => SCENES[s])) return false;
  if (story.winterAt !== null && (!Number.isInteger(story.winterAt) || story.winterAt < state.start || story.winterAt > state.index)) return false;
  if (story.packet) {
    const p=story.packet;
    if (p.index !== state.index || !Number.isInteger(p.cursor) || !Array.isArray(p.frames) || !p.frames.length || p.cursor < 0 || p.cursor >= p.frames.length || typeof p.done !== 'boolean') return false;
    if (!p.frames.every(frame => frame && SCENES[frame.scene] && (!frame.cg || SCENES[frame.cg]) && typeof frame.speaker === 'string' && typeof frame.text === 'string')) return false;
    if (!Array.isArray(p.ids) || !p.ids.every(id => typeof id === 'string') || typeof p.chapter !== 'string' || typeof p.kind !== 'string') return false;
  }
  return story.log.every(entry => entry && typeof entry.id === 'string' && typeof entry.date === 'string' && entry.date >= bars[state.start].date && entry.date <= bars[state.index].date && typeof entry.speaker === 'string' && typeof entry.text === 'string' && SCENES[entry.scene]);
}
export function friendReport(date, companion) {
  const returns=companion?.get(date);
  if (!returns) return [];
  return Object.entries(FRIENDS).flatMap(([symbol,friend]) => Number.isFinite(returns[symbol]) ? [{ ...friend,symbol,date,change:returns[symbol],quote:returns[symbol] >= .03 ? '今日は、ちょっと胸を張って帰れそう。' : returns[symbol] <= -.03 ? '今日はうまく笑えないかも。返事、少し待ってて。' : '大きなことはなくても、今日も一日を過ごしたよ。' }] : []);
}
export function backdrop(state,bars) {
  if (state.event?.kind === 'date' && state.datePlan) {
    const venue=state.datePlan.venue;
    if ((venue === 'cafe' && state.cash < 35) || (venue === 'arcade' && state.cash < 50)) return 'riverside';
    return {cafe:'cafe',park:'riverside',arcade:'arcade'}[venue];
  }
  if (state.lastDateIndex === state.index && state.memories[0]) return state.memories[0].paid ? {cafe:'cafe',park:'riverside',arcade:'arcade'}[state.memories[0].venue] : 'riverside';
  const mood=dayMood(bars[state.index],bars[state.index-1]);
  return ['crash','down','whipsaw'].includes(mood.type) ? 'winter' : ['up','soaring'].includes(mood.type) ? 'room-rise' : 'room-morning';
}
export function pastDrawdown(state,bars) {
  const peak=Math.max(...bars.slice(state.start,state.index+1).map(b=>b.close));
  return 1-bars[state.index].close/peak;
}

function prologue() {
  return [
    f('俺','昨夜、深夜二時。スマホの四文字が、頭から離れなかった。\nSOXL。半導体株ブル三倍ETF。'),
    f('俺','二十七歳。地方支店の営業事務。積立を続ける毎日に、派手な不満はなかった。\nそれなのに「三倍」という言葉が、心のどこかを叩いていた。'),
    f('SOXLちゃん','おはようございます！ わたし、SOXLです！\n……あっ、そんなにびっくりしなくても。やっと、気づいてくれたんだね！'),
    f('俺','目の前に、青い髪の女の子。台所には、ずっと前からいる紺のスーツの女性。\nどうやら俺には、金融商品が「見える」らしい。'),
    f('エスピーさん','おはよう。ずっといたわよ。あなたが気にしなかっただけ。\n……SOXLさん。この人のこと、あまり驚かせないであげて。'),
    f('SOXLちゃん','この中にも入ってるんだよ。半導体。パソコンにも、スマホにも。\nこの部屋、半導体でいっぱい。……いい部屋だね。'),
    f('俺','彼女は新品の家電を見つけたみたいに笑った。\n買うか、待つか、どのくらい付き合うか。その答えまで、彼女が決めてくれるわけではない。'),
    f('SOXLちゃん','嬉しいも、不安も、三倍くらい大きくなっちゃう私だけど。\n何株持っているかだけで、話しかけるかどうかを決めないでね。'),
  ];
}
function resetChapter() {
  return [
    f('俺','同じマグカップ。同じ朝。けれど、彼女は昨日と少しだけ違った。\n「毎朝、リセットするって、どういうことなんだ？」'),
    f('SOXLちゃん','昨日のことは覚えてるよ。でも、私が目指す三倍は、一日ごと。\n長い期間の結果まで、きれいに三倍にはならないんだ。'),
    f('エスピーさん','たとえば指数が100から110、次に100へ戻るとするでしょう。\n日々ちょうど三倍なら、100が130、その次は約94.55。往復しても同じ場所ではないの。'),
    f('SOXLちゃん','上がったり下がったりで、少し削れることがあるの。\nでも「動かずにいるだけで必ず痩せる」ってことでもないよ。進む方向と、道順が大事なんだ。'),
    f('俺','三倍の魔法だと思っていたものには、一日ごとの足跡があった。\n彼女はカップの底を指でなぞり、それから、俺の方を見た。'),
  ];
}
function winterChapter(state,bars) {
  const mood=dayMood(bars[state.index],bars[state.index-1]), dd=pastDrawdown(state,bars);
  return [
    f('俺',`雨は、カレンダーとは関係なく降った。\n今日のSOXLは${pct(mood.change)}。一緒に過ごし始めてからの高値より、${(dd*100).toFixed(1)}%下にいた。`,'winter'),
    f('SOXLちゃん','……ごめんね。こんな顔で帰ってきたくなかったんだけど。\n上がる時だけが、三倍じゃないから。','winter'),
    f('SOXSちゃん','SOXS、です。姉が、お世話になっています。\n私は、同じ指数の反対向きの一日を受け持つ妹。……今日は飲み物を持ってきただけ。','winter'),
    f('俺','黒い服の少女は、勝ち誇らなかった。\n姉の前にカップを置き、濡れた窓の方を向いた。','winter'),
    f('SOXLちゃん','もし、あなたが眠れないなら。減らしても、全部手放してもいいよ。\n私の値段のことで、あなたの暮らしが壊れる方が、嫌だから。','winter'),
    f('SOXLちゃん','半導体が世界を作っていくって、私は思ってる。\nでも、それと「この値段に必ず戻れる」は、同じ約束じゃないんだ。','winter'),
    f('エスピーさん','あの子は、悪い子じゃない。ただ、三倍なだけ。\nあなたが笑っていられる大きさを、あなた自身で決めなさい。','winter'),
  ];
}
function boundaryChapter(state,bars) {
  const reduced=state.history.some(t=>t.side==='sell');
  return [
    f('俺',reduced ? '売却の記録を、もう一度見た。\n少し離れることと、嫌いになることは、同じじゃなかった。' : 'コーヒーが冷めるまで、スマホを伏せてみた。\n「もっと増やしたい」と「なくなっても眠れる」は、違う言葉だった。','promise'),
    f('エスピーさん','あなたの生活の大きさは、チャートの中には載っていないわ。\n私と過ごす時間も、SOXLさんと過ごす時間も、比べ方を決めるのはあなたよ。','promise'),
    f('SOXLちゃん','わたしを「全部」にしなくてもいい。ゼロにした日も、話せるよ。\n無理して一緒にいるより、ちゃんと笑って会いたい。','promise'),
    f('俺','半導体が文明に必要なこと。明日、彼女の値段が上がること。\nそのふたつを、同じ意味で使わないようにしようと思った。','promise'),
    f('SOXLちゃん','三倍で嬉しい。……ううん。\nこれは、一倍で、嬉しい。','promise'),
  ];
}
function ordinaryFrames(state,bars,companions) {
  const mood=dayMood(bars[state.index],bars[state.index-1]), scene=backdrop(state,bars), day=state.index-state.start;
  const everyday=[
    'トースターが鳴った。彼女は、こんな小さな家電にも仲間がいるんだと、いつものように教えてくれた。',
    '洗濯物を取り込むと、青い袖がいちばん先に目に入った。今日は、どんな声で「おかえり」と言うだろう。',
    '冷蔵庫のメモが一枚増えていた。「コーヒー、あと少し」。チャートには載らない、小さな予定だった。',
    '机の上のケーブルを片づけていたら、彼女に止められた。「それ、まだ使ってる！」。半導体のある暮らしは、少し散らかる。',
    'エスピーさんが本を一冊読み終えた。SOXLちゃんは三ページで飽きたらしい。ふたりの時間の流れ方は、少し違う。',
    '今日の夕飯を何にするか、まだ決まっていない。彼女は「三人ぶん？」と聞いた。妹の席も、もう自然に数えている。',
    'いつもより長く、窓を開けた。街の音が入ってくる。世界は、口座の数字よりずっと広かった。',
  ];
  const messages=friendReport(bars[state.index].date,companions), friend=messages[day%Math.max(1,messages.length)];
  const frames=[f('地の文',everyday[day%everyday.length],scene)];
  if(friend) frames.push(f('SOXLちゃん',`${friend.name}から連絡が来たよ。「${friend.quote}」\n今日の${friend.company}株は${pct(friend.change)}。みんな同じ日に、同じ気分にはならないんだね。`,scene,{label:`${friend.company} · ${friend.date}の終値前日比`,url:`https://finance.yahoo.com/quote/${friend.symbol}/history/`,note:'台詞は株価の前日比から作った創作です。企業の業績や実際の発言を表すものではありません。'}));
  frames.push(f('俺',`今日のSOXLは${pct(mood.change)}。\n数字を確かめてから、画面の向こうではなく、同じ部屋にいる彼女を見た。`,scene));
  return frames;
}

export function prepareDay(state,bars,companions) {
  const story=ensureStory(state);
  if(story.packet?.index===state.index) {
    if (story.packet.presentationVersion !== 2) directScenes(story.packet);
    return story.packet;
  }
  const day=state.index-state.start, mood=dayMood(bars[state.index],bars[state.index-1]);
  let frames=[],ids=[],chapter='ふたりの暮らし',kind='daily';
  if(state.event?.kind==='date') {
    kind='date';chapter='番外編 / ふたりの約束';
    const scene=backdrop(state,bars);
    frames=[f('地の文','五営業日前の約束の日が来た。\n同じ場所でも、彼女がどんな顔をして来るのかは、今日までわからなかった。',scene),f('俺',`今日のSOXLは${pct(mood.change)}。\nその値動きごと、目の前の彼女を迎えよう。`,scene)];
  } else if(!story.seen.includes('prologue')) {
    ids=['prologue'];chapter='序章 / 深夜二時の、その後';kind='prologue';frames=prologue();
  } else if(day>=2 && !story.seen.includes('reset')) {
    ids=['reset'];chapter='第一話 / 毎朝、三倍';kind='reset';frames=resetChapter();
  } else if(!story.seen.includes('winter') && day>=1 && (mood.change<=-.08 || pastDrawdown(state,bars)>=.2)) {
    ids=['winter'];chapter='第二話 / 彼女の冬';kind='winter';frames=winterChapter(state,bars);
  } else if(day>=8 && !story.seen.includes('boundary') && (story.seen.includes('winter') || state.history.some(t=>t.side==='sell') || day>=15)) {
    ids=['boundary'];chapter='第三話 / 眠れる大きさ';kind='boundary';frames=boundaryChapter(state,bars);
  } else if(story.seen.includes('winter') && !story.seen.includes('sunlight') && story.winterAt < state.index && mood.change>=.08) {
    ids=['sunlight'];chapter='第四話 / 雨のあとに';kind='sunlight';
    frames=[f('SOXLちゃん',`上がりました！ 今日は${pct(mood.change)}です！\n……あ、ごめん。声、大きかった？`,'room-rise'),f('俺','久しぶりに部屋の中で、彼女の声が跳ねた。\n一日上がっただけで、すべてが戻ったことにはならない。それでも、今日は笑っていい。','room-rise'),f('SOXSちゃん','……姉がうるさくて、ごめんなさい。\n別に。元気なら、それでいいけど。','winter'),f('俺','俺は、妹の分にもコーヒーを淹れた。\nこの家では、誰かがうつむく日に、その人のカップをなくさない。','promise')];
  }
  const history=historicalEvent(bars[state.index].date);
  if(history && !story.seen.includes(history.id) && kind!=='date') {
    ids.push(history.id);
    if(!frames.length) {kind='history';chapter=`街の便り / ${history.title}`;}
    frames.push(...history.lines.map(([speaker,text])=>f(speaker,text,history.scene,{label:`現実の出来事 · ${history.published}`,url:history.url,note:history.fact})));
  }
  if(!frames.length) frames=ordinaryFrames(state,bars,companions);
  if(state.event?.kind==='final') {chapter='最終話 / 一倍の世界';kind='final';frames.push(f('俺','この季節の、最後の日。\n三倍の彼女と、一倍の暮らし。その両方を抱えて、俺たちはここまで来た。',state.affection>=50?'promise':backdrop(state,bars)));}
  story.packet={index:state.index,cursor:0,done:state.ended,frames,ids,chapter,kind};
  directScenes(story.packet);
  return story.packet;
}

function directScenes(packet) {
  const { frames, kind } = packet;
  // Event illustrations are deliberate beats, never the everyday background.
  if (kind === 'prologue') {
    frames.slice(0,2).forEach(frame => { frame.character=false; frame.scene='room-rise'; });
    if (frames[2]) { frames[2].cg='room-morning'; frames[2].expression='happy'; }
    if (frames[5]) frames[5].expression='happy';
  }
  if (kind === 'winter') {
    [2,3].forEach(i => { if(frames[i]) frames[i].cg='winter'; });
    if(frames[1]) frames[1].expression='sad';
  }
  if (kind === 'boundary' && frames[4]) { frames[4].cg='promise'; frames[4].expression='shy'; }
  if (kind === 'sunlight') {
    frames.slice(0,4).forEach(frame => { frame.scene='room-rise'; });
    if(frames[0]) { frames[0].cg='room-rise'; frames[0].expression='happy'; }
  }
  packet.presentationVersion=2;
}

export function unlockCG(state, key) {
  if (!SCENES[key]) return false;
  const story=ensureStory(state);
  if(story.unlocked.includes(key)) return false;
  story.unlocked.push(key); return true;
}

export function dateMoment(state, bars, option) {
  const key=backdrop(state,bars);
  return ['cafe','riverside','arcade'].includes(key) && option.affection>=5 && option.trust>=0 && !state.story.unlocked.includes(key) ? key : null;
}
export function unread(state) { return !!state.story?.packet && !state.story.packet.done; }
export function currentFrame(state) { return state.story?.packet?.frames[state.story.packet.cursor]; }
export function rememberFrame(state,bars) {
  const story=ensureStory(state),p=story.packet,frame=currentFrame(state);
  if(!frame || p.done) return;
  const id=`${p.index}:${p.cursor}`;
  if(story.log.at(-1)?.id!==id) story.log.push({id,date:bars[state.index].date,chapter:p.chapter,...frame});
  if(frame.cg) unlockCG(state,frame.cg);
}
export function turnPage(state) {
  const story=ensureStory(state),p=story.packet;
  if(!p || p.done) return false;
  if(p.cursor<p.frames.length-1) {p.cursor++;return true;}
  p.done=true;
  for(const id of p.ids) if(!story.seen.includes(id)) story.seen.push(id);
  if(p.ids.includes('winter') && story.winterAt===null) story.winterAt=state.index;
  return true;
}
export function boundaryChoices() {
  return [
    {text:'眠れる大きさを、自分で決めるよ。',affection:3,trust:3,reply:'うん。売っても、待っても、それを決めたあなたと、ちゃんと話したい。',sprite:'shy',boundary:true},
    {text:'まだ迷ってる。一緒に考えてくれる？',affection:3,trust:2,reply:'もちろん。今日、答えを急がなくてもいいよ。コーヒーが冷めたら、もう一杯淹れよう。',sprite:'shy',boundary:true},
    {text:'この先は必ず戻るから、大丈夫。',affection:0,trust:-2,reply:'……「必ず」だけは、私も約束できないの。あなたが眠れる理由を、未来の値段だけにしないでほしい。',sprite:'calm'},
  ];
}
