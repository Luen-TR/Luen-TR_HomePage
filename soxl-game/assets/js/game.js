import * as E from './engine.mjs';
import * as N from './novel.mjs';
import { historicalEvent } from './history.mjs';
import { CandleChart, visibleBars } from './chart.mjs';
import { conversation, dateScene, contextEvent, marketExplanation } from './story.mjs';
import { NovelActor } from './actor.mjs';
import { expressionFor } from './performance.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const dollars = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const price = n => `$${n.toFixed(n < 1 ? 4 : 2)}`;
const percent = n => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(2)}%`;
const signClass = n => n > 0 ? 'positive' : n < 0 ? 'negative' : '';
const signed = n => `${n > 0 ? '+' : ''}${dollars(n)}`;
const STORAGE = 'soxl-heartbeat-save-v1';
let bars = [], companions = new Map(), meta, state = null, fraction = .5, range = 60, saved = null, toastTimer;
const chart = new CandleChart($('price-chart'), $('chart-readout'));
const modal = $('modal');
const actor = new NovelActor(toast);

function syncPlayback() {
  actor.active = !!state && !$('game-screen').hidden;
  actor.paused = modal.open || $('trade-modal').open || $('character-stage').classList.contains('art-only');
  actor.refresh();
}

function toast(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4300);
}
function showModal(title, html) {
  $('modal-title').textContent = title; $('modal-content').innerHTML = html;
  if (!modal.open) modal.showModal();
  syncPlayback();
  modal.scrollTop = 0;
}
function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ dataset: meta.rawSha256, state }));
    saved = structuredClone(state);
    $('save-status').textContent = 'セーブ済み';
  } catch { $('save-status').textContent = '保存できません'; }
}
function readSave() {
  try {
    const entry = JSON.parse(localStorage.getItem(STORAGE));
    if (entry?.dataset === meta.rawSha256 && E.validateSave(entry.state, bars) && N.validateStory(entry.state.story, entry.state, bars)) saved = entry.state;
  } catch { /* Unavailable storage does not prevent playing. */ }
}
function refreshStart() {
  if (!bars.length) return;
  const selected = $('start-date').value;
  document.querySelectorAll('[data-start]').forEach(button => { const active = button.dataset.start === selected; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', active); });
  try {
    const sample = E.createGame(bars, selected, Number($('duration').value));
    $('period-note').textContent = `${bars[sample.start].date} → ${bars[sample.end].date} · ${sample.end - sample.start}営業日。開始日は引け後から。`;
    $('new-game').disabled = false;
  } catch (error) { $('period-note').textContent = error.message; $('new-game').disabled = true; }
  $('continue-button').hidden = !saved;
  if (saved) $('continue-button').textContent = `つづきから · ${bars[saved.index].date}${saved.ended ? '（クリア済み）' : ''}`;
}
function startGame() {
  try {
    state = E.createGame(bars, $('start-date').value, Number($('duration').value));
    fraction = .5; range = 60; showGame(); save();
  } catch (error) { toast(error.message); }
}
function showGame() {
  actor.text.id=null;
  document.body.classList.add('playing');
  modal.close(); $('start-screen').hidden = true; $('game-screen').hidden = false; $('menu-button').hidden = false;
  render(); syncPlayback(); window.scrollTo({ top: 0, behavior: 'instant' });
}
function titleScreen() {
  document.body.classList.remove('playing');
  modal.close(); $('start-screen').hidden = false; $('game-screen').hidden = true; $('menu-button').hidden = true;
  syncPlayback(); refreshStart(); window.scrollTo({ top: 0, behavior: 'instant' });
}
function sprite(name, animate = false) {
  const mood=E.dayMood(bars[state.index],bars[state.index-1]);
  if(name==='panic' && mood.type==='down') name='sad';
  actor.setExpression(name);
}
function render() {
  N.prepareDay(state, bars, companions);
  const bar = bars[state.index], account = E.account(state, bars), mood = E.dayMood(bar, bars[state.index - 1]);
  $('current-date').textContent = bar.date.replaceAll('-', '.'); $('current-date').dateTime = bar.date;
  $('day-counter').textContent = `DAY ${state.index - state.start} / ${state.end - state.start}`;
  $('session-progress').style.width = `${(state.index - state.start) / (state.end - state.start) * 100}%`;
  $('total-equity').textContent = dollars(account.total);
  $('total-return').textContent = `${signed(account.profit)} (${percent(account.return)})`;
  $('total-return').className = signClass(account.profit);
  $('cash').textContent = dollars(state.cash); $('holding-value').textContent = dollars(account.value);
  $('holding-shares').textContent = `${state.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })} 株`;
  $('close-price').textContent = price(bar.close); $('daily-change').textContent = percent(mood.change);
  $('daily-change').className = signClass(mood.change);
  $('market-explanation').textContent = marketExplanation(bar, bars[state.index - 1]);
  const context = contextEvent(bar.date);
  $('context-event').hidden = !context;
  $('context-event').innerHTML = context ? `<span>この頃の出来事</span><br>${escape(context.text)}<br><a href="${escape(context.url)}" target="_blank" rel="noopener noreferrer">${escape(context.label)} ↗</a><br><small>当時の背景です。この日の値動きの原因を断定するものではありません。</small>` : '';
  $('average-cost').textContent = state.shares ? price(account.average) : '—';
  $('unrealized').textContent = signed(account.unrealized); $('unrealized').className = signClass(account.unrealized);
  $('realized').textContent = signed(state.realized); $('realized').className = signClass(state.realized);
  $('fees').textContent = dollars(state.fees);
  const locked = state.ended || !!state.event;
  $('buy-button').disabled = locked || state.cash < .01; $('sell-button').disabled = locked || state.shares < 1e-10;
  $('cancel-order').hidden = !state.pending;
  $('trade-badge').textContent = state.pending ? '· 予約あり' : '';
  $('pending-order').textContent = state.pending ? `${state.pending.side === 'buy' ? '買い' : '売り'}予約：${state.pending.side === 'buy' ? '現金' : '保有株'}の${state.pending.fraction * 100}% · 次の始値で約定` : '予約なし · このままなら保有を継続';
  document.querySelectorAll('[data-fraction]').forEach(button => { const active = Number(button.dataset.fraction) === fraction; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', active); button.disabled = locked; });
  document.querySelectorAll('[data-range]').forEach(button => { const active = Number(button.dataset.range) === range; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', active); });
  $('affection-value').textContent = state.affection; $('affection-meter').value = state.affection;
  $('trust-value').textContent = state.trust; $('trust-meter').value = state.trust;
  $('mood-label').textContent = mood.label;
  $('relationship-label').textContent = state.affection >= 75 && state.trust >= 65 ? '特別なふたり' : state.affection >= 50 ? '気になる存在' : state.affection >= 30 ? '少しずつ、近く' : 'ここから、ふたり';
  $('date-button').disabled = locked || !!state.datePlan || state.end - state.index < 5;
  $('date-button').textContent = state.datePlan ? '♡ 約束あり' : '♡ デートに誘う';
  $('date-plan').hidden = !state.datePlan;
  if (state.datePlan) $('date-plan').textContent = `♡ ${bars[state.datePlan.due].date} · ${E.VENUES[state.datePlan.venue].name}${state.datePlan.due === state.index ? ' · 今日は約束の日' : ` · あと${state.datePlan.due - state.index}営業日`}`;
  $('advance-button').disabled = state.event?.kind === 'date';
  $('advance-button').innerHTML = state.ended ? '結末を見る <span>♡</span>' : state.event?.kind === 'final' ? 'ふたりの結末へ <span>♡</span>' : '次の営業日へ <span>→</span>';
  $('advance-label').textContent = state.event?.kind === 'date' ? '今日は、ふたりの約束の日。' : state.index === state.end ? 'この季節の、最後の日。' : '今日を終えて、明日へ。';
  $('advance-note').textContent = state.event?.kind === 'date' ? 'SOXLちゃんへの返事を選んでください。' : state.index === state.end ? '運用成績と、ふたりの関係を振り返ろう。' : '注文があれば、翌営業日の始値で約定します。';
  chart.update(bars, state, range); renderDialogue();
}
function buttons(options, action) {
  const container = $('dialogue-choices'); container.replaceChildren();
  options.forEach(option => { const button = document.createElement('button'); button.type = 'button'; button.textContent = option.text; button.addEventListener('click', () => action(option)); container.append(button); });
}
function applyScene(key, cg = null, character = true) {
  if (!N.SCENES[key]) key = 'room-morning';
  const scene = N.SCENES[key] || N.SCENES['room-morning'];
  const art = $('story-art');
  const src = cg ? `assets/scenes/${N.SCENES[cg].file}` : `assets/backgrounds/${N.BACKGROUNDS[key]}`;
  if (art.getAttribute('src') !== src) art.src = src;
  art.alt = cg ? N.SCENES[cg].alt : `${scene.place}の風景`; $('location-name').textContent = scene.place;
  $('character-stage').dataset.scene=key;
  $('character-stage').classList.toggle('event-cg',!!cg);
  $('view-art').textContent=cg ? '一枚絵を眺める' : 'ウィンドウを隠す';
  $('cg-caption').hidden=!cg;
  if(cg) { N.unlockCG(state,cg); $('cg-caption').textContent=`思い出の一枚 / ${N.SCENES[cg].title}`; }
  const mood=E.dayMood(bars[state.index],bars[state.index-1]);
  actor.setScene(character && !cg,expressionFor(state,mood,N.unread(state) ? N.currentFrame(state) : null));
}
function say(text, speaker='SOXLちゃん', kind='talk') {
  actor.say(`${state.start}:${state.index}:${kind}`,text,speaker);
}
function renderDialogue() {
  const packet = N.prepareDay(state, bars, companions);
  $('chapter-label').textContent = packet.chapter;
  $('story-source').hidden = true;
  if (N.unread(state)) {
    const frame = N.currentFrame(state);
    N.rememberFrame(state, bars);
    applyScene(frame.scene,frame.cg,frame.character!==false);
    $('dialogue-tag').textContent = frame.speaker;
    $('dialogue-counter').textContent = `${packet.cursor + 1} / ${packet.frames.length}`;
    $('scene-text').hidden = true; $('relationship-feedback').hidden = true;
    say(frame.text,frame.speaker,`frame:${packet.cursor}`); $('dialogue-choices').replaceChildren();
    if (frame.source) {
      $('story-source').hidden = false;
      const button = document.createElement('button'); button.className = 'text-button';
      button.textContent = frame.source.label; button.addEventListener('click', () => showSource(frame.source));
      $('story-source').replaceChildren(button);
    }
    $('advance-button').disabled = false;
    $('advance-button').innerHTML = packet.cursor < packet.frames.length - 1 ? '続きを読む <span>▸</span>' : '彼女の方を向く <span>▸</span>';
    $('advance-label').textContent = packet.chapter; $('advance-note').textContent = '物語を読んでも、営業日は進みません。';
    return;
  }
  applyScene(packet.kind === 'boundary' ? 'promise' : N.backdrop(state, bars),state.lastEventResult?.cg);
  $('scene-text').hidden = true; $('relationship-feedback').hidden = true; $('dialogue-choices').replaceChildren();
  $('dialogue-tag').textContent = 'SOXLちゃん'; $('dialogue-counter').textContent = '今日の会話';
  if (state.event?.kind === 'date') {
    const scene = dateScene(state, bars);
    $('dialogue-tag').textContent = 'SOXLちゃん';
    $('dialogue-counter').textContent = '約束の日'; $('scene-text').hidden = false;
    $('scene-text').textContent = `${scene.freeWalk ? '手元の現金が足りないため、今日は無料の散歩に変更。' : ''}${scene.scene}`;
    say(scene.line,'SOXLちゃん','date'); sprite(scene.sprite);
    buttons(scene.options, option => {
      E.settleDate(state, bars, option.affection, option.trust, option.reply);
      const cg=N.dateMoment(state,bars,option);
      recordReply(option);
      state.lastEventResult = { reply: option.reply, sprite: replyExpression(option), cg, feedback: `親密度 ${option.affection >= 0 ? '+' : ''}${option.affection} · 信頼 ${option.trust >= 0 ? '+' : ''}${option.trust} · 思い出に追加` };
      render(); save();
    });
    return;
  }
  if (state.lastEventResult) {
    say(state.lastEventResult.reply,'SOXLちゃん','reply'); sprite(state.lastEventResult.sprite);
    $('relationship-feedback').hidden = false; $('relationship-feedback').textContent = state.lastEventResult.feedback;
    $('dialogue-counter').textContent = 'また、明日も'; return;
  }
  if (state.event?.kind === 'final' || state.ended) {
    say('この季節も、今日でおしまい。ねえ、あなたにとって、私と過ごした時間はどうだった？','SOXLちゃん','final');
    $('dialogue-counter').textContent = '最後の日'; sprite(state.affection >= 50 ? 'shy' : 'calm'); return;
  }
  const talk = packet.kind === 'boundary' ? { line: '私と、どんなふうに付き合っていきたい？ あなたの言葉で、聞かせて。', sprite: 'shy', options: N.boundaryChoices() } : conversation(state, bars);
  say(talk.line); sprite(talk.sprite);
  if (state.lastTalk === state.index) { $('dialogue-counter').textContent = '今日は会話済み'; return; }
  buttons(talk.options, option => {
    try {
      E.talk(state, option.affection, option.trust);
      if (option.boundary) state.story.boundary = true;
      recordReply(option);
      state.lastEventResult = { reply: option.reply, sprite: replyExpression(option), feedback: `親密度 ${option.affection >= 0 ? '+' : ''}${option.affection} · 信頼 ${option.trust >= 0 ? '+' : ''}${option.trust}` };
      render(); save();
    } catch (error) { toast(error.message); }
  });
}
function finish() {
  N.unlockCG(state,state.affection>=50 ? 'promise' : 'room-morning');
  state.event = null; state.pending = null; state.ended = true; save(); render();
  const result = E.ending(state, bars), account = E.account(state, bars), hold = E.benchmark(state, bars);
  showModal('ふたりの結末', `<div class="ending-card"><img class="ending-art" src="assets/scenes/${state.affection >= 50 ? 'promise' : 'room-morning'}.png" alt="SOXLちゃん"><p class="eyebrow">${result.rank}</p><h3>${escape(result.title)}</h3><blockquote>「${escape(result.line)}」</blockquote><div class="result-grid"><div><span>最終資産</span><strong>${dollars(account.total)}</strong></div><div><span>運用リターン</span><strong class="${signClass(account.return)}">${percent(account.return)}</strong></div><div><span>親密度 / 信頼</span><strong>${state.affection} / ${state.trust}</strong></div><div><span>デートの思い出</span><strong>${state.dates} 回</strong></div></div><div class="prose source-line"><p>${bars[state.start].date}〜${bars[state.end].date} · ${state.end - state.start}営業日</p><p>期間中の最大ドローダウン ${(state.drawdown * 100).toFixed(2)}%<br>最初の翌営業日の始値で全額購入し保有した場合 ${dollars(hold)}（${percent(hold / E.INITIAL_CASH - 1)}）</p><p>資産は最終終値で評価。比較対象は買付手数料を含み、デート費用を含みません。株価だけで、ふたりの結末は決まりません。</p></div><div class="modal-actions"><button id="ending-title" class="primary">別の季節で会う →</button><button id="ending-records">思い出を振り返る</button></div></div>`);
  $('ending-title').addEventListener('click', titleScreen); $('ending-records').addEventListener('click', showRecords);
}
function trade(side) {
  try { E.queueOrder(state, side, fraction); render(); save(); toast(`${side === 'buy' ? '買い' : '売り'}を予約しました。次の営業日の始値で約定します。`); }
  catch (error) { toast(error.message); }
}
function nextDay() {
  if (actor.complete()) return;
  if (N.unread(state)) { N.turnPage(state); render(); save(); return; }
  if (state.ended || state.event?.kind === 'final') return finish();
  const result = E.advance(state, bars);
  if (!result) return;
  render(); save();
  if (result.fill) toast(`${result.fill.side === 'buy' ? '買付' : '売却'}完了 · ${price(result.fill.price)} × ${result.fill.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })}株`);
  if (state.event?.kind === 'date') {
    toast('今日はデートの約束の日。SOXLちゃんに返事をしよう。');
    $('character-stage').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    $('dialogue-choices').querySelector('button')?.focus({ preventScroll: true });
  }
}
function showDates() {
  if (state.datePlan || state.event || state.ended || state.end - state.index < 5) return;
  const due = bars[state.index + 5].date;
  showModal('次の約束をしよう', `<div class="prose"><p><b>${due}</b>、5営業日後に会う約束。当日の値動きで、彼女の機嫌が変わります。</p><p>費用は当日の会話後に現金から支払います。足りない場合は、無料の散歩に変更します。</p></div><div class="venue-list" style="margin-top:20px">${Object.entries(E.VENUES).map(([key, venue]) => `<button class="venue-option" data-venue="${key}"><span class="venue-icon" aria-hidden="true">${venue.icon}</span><span><strong>${venue.name}</strong><small>${venue.hint}</small></span><span class="cost">${venue.cost ? dollars(venue.cost) : '無料'}</span></button>`).join('')}</div>`);
  document.querySelectorAll('[data-venue]').forEach(button => button.addEventListener('click', () => {
    try { E.planDate(state, button.dataset.venue); modal.close(); render(); save(); toast(`${due}、${E.VENUES[button.dataset.venue].name}で待ち合わせ。`); }
    catch (error) { toast(error.message); }
  }));
}
function showRecords() {
  const a = E.account(state, bars);
  const trades = state.history.map(t => `<tr><td>${escape(t.date)}</td><td class="${t.side === 'buy' ? 'positive' : 'negative'}">${t.side === 'buy' ? '買い' : '売り'}</td><td>${price(t.price)}</td><td>${t.shares.toFixed(4)}</td><td>${dollars(t.fee)}</td><td>${t.side === 'sell' ? signed(t.realized) : '—'}</td></tr>`).join('');
  const gallery = state.story.unlocked.map(key => `<button class="cg-thumb" data-cg="${key}"><img src="assets/scenes/${N.SCENES[key].file}" alt="${N.SCENES[key].alt}" loading="lazy"><span>${N.SCENES[key].title}</span></button>`).join('');
  const memories = state.memories.map(m => `<article class="memory"><h3>♡ ${escape(m.date)} · ${E.VENUES[m.venue]?.name || 'デート'}${!m.paid ? ' → 散歩に変更' : ''}</h3><p>「${escape(m.text)}」</p><small>${m.good ? '心に残る約束になった。' : 'まだ、わかり合えないこともある。'}</small></article>`).join('');
  showModal('取引と、ふたりの思い出', `<div class="prose"><p>現在のリターン <b class="${signClass(a.return)}">${percent(a.return)}</b> · 最大ドローダウン ${(state.drawdown * 100).toFixed(2)}%</p><h3>アルバム · ${state.story.unlocked.length}枚</h3><div class="cg-gallery">${gallery || 'まだページを開いていません。'}</div><h3>デートの思い出 · ${state.dates}回</h3>${memories || '<p>まだ、ふたりだけの思い出はありません。次の約束をしてみよう。</p>'}<h3>売買の記録 · ${state.history.length}件</h3>${trades ? `<div class="table-wrap"><table><thead><tr><th>約定日</th><th>売買</th><th>始値</th><th>株数</th><th>手数料</th><th>確定損益</th></tr></thead><tbody>${trades}</tbody></table></div>` : '<p>まだ注文は約定していません。</p>'}<p class="source-line">売買は翌営業日の始値で約定。価格・株数は株式分割を調整した単位です。</p></div>`);
  document.querySelectorAll('[data-cg]').forEach(button => button.addEventListener('click', () => {
    const scene = N.SCENES[button.dataset.cg];
    showModal(scene.title, `<img class="cg-full" src="assets/scenes/${scene.file}" alt="${scene.alt}"><div class="modal-actions"><button id="album-back">アルバムに戻る</button></div>`);
    $('album-back').addEventListener('click', showRecords);
  }));
}
function showOhlc() {
  const rows = visibleBars(bars, state.index, range).slice().reverse();
  showModal('日足データ', `<p class="prose">ゲーム内の今日までの${rows.length}営業日。株式分割調整済み、USD。</p><div class="table-wrap"><table><thead><tr><th>日付</th><th>始値</th><th>高値</th><th>安値</th><th>終値</th><th>出来高</th></tr></thead><tbody>${rows.map(b => `<tr><td>${b.date}</td><td>${price(b.open)}</td><td>${price(b.high)}</td><td>${price(b.low)}</td><td>${price(b.close)}</td><td>${b.volume.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table></div>`);
}
function showHelp() {
  showModal('遊び方と、データについて', `<div class="prose"><p>小説「SOXLちゃんは今日も三倍」をもとにした、実際の相場と暮らすノベルゲームです。「続きを読む」で物語を読み、返事を選び、「次の営業日へ」で一日を進めます。チャートと注文は「相場と売買」から開けます。</p><h3>1日のおわりに、3つのこと</h3><ol><li><b>チャートを見る。</b> 表示されるのは、その日の引けまで。緑は陽線、ピンクは陰線、紫は20日移動平均です。スマホではチャートに触れると四本値を確認できます。</li><li><b>明日の注文を決める。</b> 現金または保有株の25・50・100%で買い／売りを予約。次の営業日の始値で約定します。予約しなければ、そのまま保有します。</li><li><b>彼女に話しかける。</b> 会話は1営業日1回。親密度と信頼は、相手の気持ちをどう受け止めるかで育ちます。会話をせず日を進めることもできます。</li></ol><h3>デートとエンディング</h3><p>デートは5営業日後に予約。当日の前日比と値幅で、同じ場所でも雰囲気が変わります。デート費用は現金から支払い、足りない時は無料の散歩へ。期間の最後には、運用成績・親密度・信頼・デートの思い出で結末が変わります。</p><h3>トレードの条件</h3><p>初期資金は仮想の10,000米ドル。現物の買いと売りのみで、1回ごとの手数料は約定代金の0.1%。端株に対応し、借入・空売り・追加レバレッジはありません。価格は株式分割調整済みで、株式数を再度分割しません。為替・税金・分配金・スリッページは計算しません。</p><p>SOXLは半導体指数の<b>1日の騰落率の3倍</b>を目指すETFです。長期間の騰落率が単純に3倍になるわけではありません。ゲームでは、実際のSOXL価格をそのまま使っています。</p><h3>小説と現実のつながり</h3><p>出会い、毎朝のリセット、彼女の冬、眠れる大きさ、雨のあと。小説の場面が、実際の値動きや日々の進行に応じて現れます。売買しても、保有ゼロでも、親密度が直接下がることはありません。</p><p>エスピーさんはS&amp;P500、妹はSOXSの擬人化です。エヌちゃん、エイミー、インテル先輩、ブロードさんは半導体企業を友人に見立てています。4社は物語上の代表で、歴代の全構成銘柄・組入比率・SOXLへの寄与を再現するものではありません。</p><p>友人の近況はその日の実際の株価前日比をもとにした創作で、企業業績や実際の発言を示しません。歴史的な出来事には公式発表へのリンクを付け、公表前には登場させません。原作中の資金額、固定の騰落率、必ず戻るといった表現はゲームに合わせて脚色しています。</p><h3>記録について</h3><p>このブラウザに自動セーブします。ブラウザの保存データを消すと記録も消え、別の端末には引き継がれません。画面右上のメニューから、タイトルに戻れます。</p><div class="source-line"><p>収録：${meta ? `${meta.start}〜${meta.end}、${meta.count.toLocaleString('ja-JP')}営業日` : '読み込み中'}。米国東部時間の確定日足（OHLC・出来高）。${meta ? `取得日：${meta.retrievedAt.slice(0, 10)}。` : ''}未到来・未確定の日足は収録していません。過去データの途中に補間した足はありません。</p><p><a href="https://finance.yahoo.com/quote/SOXL/history/" target="_blank" rel="noopener noreferrer">日足データ：Yahoo Finance ↗</a><br><a href="https://www.direxion.com/product/daily-semiconductor-bull-bear-3x-etfs" target="_blank" rel="noopener noreferrer">商品情報：Direxion公式 ↗</a></p><p>会話・恋愛イベントは創作です。相場メモは四本値の説明で、一部の日に当時の公式発表を添えています。実際の投資判断を勧めるものではありません。</p></div></div>`);
}

function showSource(source) {
  let url;
  try { url = new URL(source.url); } catch { return; }
  if (url.protocol !== 'https:') return;
  showModal('この場面と、現実の出来事', `<div class="prose"><p>${escape(source.note || '')}</p><p class="source-line">台詞や人物関係は創作です。出来事と株価の因果関係を断定するものではありません。</p><p><a href="${escape(url.href)}" target="_blank" rel="noopener noreferrer">${escape(source.label)} ↗</a></p></div>`);
}
function recordReply(option) {
  const scene = N.backdrop(state, bars);
  const shared = { date:bars[state.index].date, chapter:state.story.packet.chapter, scene };
  state.story.log.push({ ...shared, id:`${state.index}:choice`, speaker:'俺', text:option.text });
  state.story.log.push({ ...shared, id:`${state.index}:reply`, speaker:'SOXLちゃん', text:option.reply });
}
function replyExpression(option) { return option.affection < 0 || option.trust < 0 ? 'angry' : option.sprite; }
function showFriends() {
  const date = bars[state.index].date;
  const friends = N.friendReport(date, companions);
  const event = historicalEvent(date);
  showModal('半導体の街から、今日の便り', `<p class="prose">${date}の米国市場が閉じたあと。彼女の友人たちから、メッセージが届いた。</p><div class="friend-letters">${friends.map(friend => `<article class="friend-letter"><span class="letter-role">${escape(friend.role)}</span><h3>${escape(friend.name)} <small>${escape(friend.company)}</small></h3><p>「${escape(friend.quote)}」</p><div class="letter-fact"><span>株価の終値前日比</span><b class="${signClass(friend.change)}">${percent(friend.change)}</b><a href="https://finance.yahoo.com/quote/${friend.symbol}/history/" target="_blank" rel="noopener noreferrer">日足の出典 ↗</a></div></article>`).join('')}</div>${event ? `<article class="historical-letter"><h3>この頃の出来事 / ${escape(event.title)}</h3><p>${escape(event.fact)}</p><a href="${escape(event.url)}" target="_blank" rel="noopener noreferrer">${escape(event.published)}の公式発表 ↗</a></article>` : ''}<div class="prose source-line"><p>手紙は実際の株価の前日比をもとにした創作です。業績や実際の発言を表しません。4社は物語上の代表で、歴代の全構成銘柄や組入比率を再現していません。</p><p>エスピーさんはS&amp;P500、SOXSちゃんは逆方向の1日3倍を目指すETFの擬人化。家族・友人という関係は、この物語の設定です。</p></div>`);
}
function showBacklog() {
  const entries = state.story.log.slice(-250).reverse();
  showModal('ふたりの会話ログ', `<p class="prose">読んだ場面と、選んだ言葉。新しい順に最大250件を表示しています。</p><div class="backlog">${entries.map(entry => `<article><small>${escape(entry.date)} · ${escape(entry.chapter)}</small><h3>${escape(entry.speaker)}</h3><p>${escape(entry.text)}</p></article>`).join('') || '<p class="prose">まだ、最初のページを開いたところです。</p>'}</div>`);
}

$('modal-close').addEventListener('click', () => modal.close());
for (const dialog of [modal,$('trade-modal')]) {
  dialog.addEventListener('close',syncPlayback);
  dialog.addEventListener('toggle',syncPlayback);
}
modal.addEventListener('click', e => { if (e.target === modal) { const r = modal.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close(); } });
$('help-button').addEventListener('click', showHelp);
$('trade-button').addEventListener('click', () => { $('trade-modal').showModal(); syncPlayback(); chart.update(bars, state, range); });
$('trade-close').addEventListener('click', () => $('trade-modal').close());
$('return-to-story').addEventListener('click', () => $('trade-modal').close());
$('view-art').addEventListener('click', () => { $('character-stage').classList.add('art-only'); $('restore-ui').hidden = false; $('restore-ui').focus(); syncPlayback(); });
$('restore-ui').addEventListener('click', () => { $('character-stage').classList.remove('art-only'); $('restore-ui').hidden = true; $('view-art').focus(); syncPlayback(); });
$('reveal-line').addEventListener('click',()=>actor.complete());
$('dialogue-text').addEventListener('click',()=>{ if(!actor.complete() && N.unread(state)) nextDay(); });
$('start-date').addEventListener('change', refreshStart); $('duration').addEventListener('change', refreshStart);
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => { $('start-date').value = button.dataset.start; refreshStart(); }));
$('start-form').addEventListener('submit', e => {
  e.preventDefault(); if (!bars.length) return;
  if (!saved) return startGame();
  showModal('新しい季節を始める', '<div class="prose"><p>今あるセーブを、新しいプレイで上書きします。</p></div><div class="modal-actions"><button id="confirm-new" class="primary">新しく始める</button><button id="keep-save">今の記録を残す</button></div>');
  $('confirm-new').addEventListener('click', startGame); $('keep-save').addEventListener('click', () => modal.close());
});
$('continue-button').addEventListener('click', () => { if (saved) { state = structuredClone(saved); showGame(); } });
$('buy-button').addEventListener('click', () => trade('buy')); $('sell-button').addEventListener('click', () => trade('sell'));
$('cancel-order').addEventListener('click', () => { state.pending = null; render(); save(); toast('予約を取り消しました。'); });
$('advance-button').addEventListener('click', nextDay); $('date-button').addEventListener('click', showDates);
$('record-button').addEventListener('click', showRecords);
$('family-button').addEventListener('click', showFriends);
$('backlog-button').addEventListener('click', showBacklog); $('ohlc-button').addEventListener('click', showOhlc);
document.querySelectorAll('[data-fraction]').forEach(button => button.addEventListener('click', () => { fraction = Number(button.dataset.fraction); render(); }));
document.querySelectorAll('[data-range]').forEach(button => button.addEventListener('click', () => { range = Number(button.dataset.range); render(); }));
$('menu-button').addEventListener('click', () => {
  showModal('ひと休み', `<div class="prose"><p>進行状況は自動保存されます。タイトルに戻っても「つづきから」で再開できます。</p></div><div class="reading-settings"><label for="text-speed">文字の速さ</label><select id="text-speed"><option value="50">ゆっくり</option><option value="32">ふつう</option><option value="18">はやい</option><option value="0">一度に表示</option></select><label class="motion-setting"><input id="face-motion" type="checkbox"> 目ぱち・口のアニメーション</label><p>口は台詞の表示に合わせて動きます。音声はありません。端末で動きを減らす設定をしている場合は、静止して全文を表示します。</p></div><div class="modal-actions"><button id="resume-game" class="primary">ゲームを続ける</button><button id="back-to-title">タイトルへ</button></div>`);
  $('text-speed').value=String(actor.settings.speed); $('face-motion').checked=actor.settings.motion;
  $('text-speed').addEventListener('change',()=>actor.configure({speed:Number($('text-speed').value)}));
  $('face-motion').addEventListener('change',()=>actor.configure({motion:$('face-motion').checked}));
  $('resume-game').addEventListener('click', () => modal.close()); $('back-to-title').addEventListener('click', titleScreen);
});

async function loadData() {
  try {
    const [response, friendResponse] = await Promise.all([fetch('data/soxl-daily.json'), fetch('data/friends-daily.json')]);
    if (!friendResponse.ok) throw new Error('friend history unavailable');
    const friendData = await friendResponse.json();
    companions = new Map(friendData.bars.map(([date, ...values]) => [date, Object.fromEntries(friendData.meta.columns.slice(1).map((symbol, i) => [symbol, values[i]]))]));
    if (!response.ok) throw new Error('history unavailable');
    const data = await response.json(); meta = data.meta;
    bars = data.bars.map(([date, open, high, low, close, volume]) => ({ date, open, high, low, close, volume }));
    if (bars.length !== meta.count || bars.length < 4000 || bars[0].date !== '2010-03-11' || bars.at(-1).date !== meta.end) throw new Error('invalid history');
    $('start-date').max = bars.at(-2).date;
    $('data-status').textContent = `${meta.count.toLocaleString('ja-JP')}営業日の実際の日足`;
    $('coverage').textContent = `${meta.start} — ${meta.end} / Yahoo Finance`;
    readSave(); refreshStart();
    actor.preload('calm').catch(()=>{});
    const firstBackground=new Image(); firstBackground.src='assets/backgrounds/room-rise.png';
  } catch {
    $('data-status').textContent = '日足データを読み込めませんでした';
    $('period-note').textContent = '通信を確認して、ページを再読み込みしてください。';
    $('new-game').textContent = '再読み込み'; $('new-game').disabled = false;
    $('new-game').addEventListener('click', e => { e.preventDefault(); window.location.reload(); }, { once: true });
  }
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('character-stage').classList.contains('art-only')) { $('restore-ui').click(); return; }
  if (!state || $('game-screen').hidden || modal.open || $('trade-modal').open || $('character-stage').classList.contains('art-only') || event.repeat) return;
  if (!['Enter', ' '].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest('button,input,select,textarea,a,canvas')) return;
  if (!actor.text.done || N.unread(state)) { event.preventDefault(); nextDay(); }
});
loadData();
