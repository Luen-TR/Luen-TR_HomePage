export const INITIAL_CASH = 10000;
export const FEE_RATE = 0.001;
export const SAVE_VERSION = 1;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function dayMood(bar, previous) {
  const base = previous ? previous.close : bar.open;
  const change = bar.close / base - 1;
  const range = (bar.high - bar.low) / base;
  const reversal = range >= 0.14 && Math.abs(change) < range * 0.5;
  const type = change <= -0.08 ? 'crash' : reversal ? 'whipsaw' : change >= 0.08 ? 'soaring' : change <= -0.025 ? 'down' : change >= 0.025 ? 'up' : 'calm';
  const labels = { crash: '暴落で涙目', whipsaw: '情緒ジェットコースター', soaring: 'テンション天井知らず', down: 'ちょっとしょんぼり', up: 'ごきげん上昇中', calm: '今日はおだやか' };
  return { type, label: labels[type], change, range, score: Math.round(clamp(50 + change * 350, 0, 100)), sprite: ['crash', 'whipsaw', 'down'].includes(type) ? 'panic' : ['soaring', 'up'].includes(type) ? 'happy' : 'calm' };
}

export function createGame(bars, startDate, days = 60) {
  if (!Number.isInteger(days) || days < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new Error('開始日と期間を選んでください。');
  const start = bars.findIndex(b => b.date >= startDate);
  if (start < 0 || start >= bars.length - 1) throw new Error('この開始日には、翌営業日以降のデータがありません。');
  const end = days === 0 ? bars.length - 1 : Math.min(bars.length - 1, start + days);
  return {
    version: SAVE_VERSION, start, index: start, end, initialCash: INITIAL_CASH,
    cash: INITIAL_CASH, shares: 0, basis: 0, realized: 0, fees: 0, pending: null,
    affection: 25, trust: 25, talks: 0, lastTalk: -1, dates: 0, goodDates: 0,
    datePlan: null, event: null, lastEventResult: null, lastDateIndex: -1,
    history: [], memories: [], peak: INITIAL_CASH, drawdown: 0,
    equity: [{ index: start, value: INITIAL_CASH }], ended: false,
  };
}

export function account(state, bars) {
  const value = state.shares * bars[state.index].close;
  const total = state.cash + value;
  return { total, value, profit: total - state.initialCash, return: total / state.initialCash - 1,
    average: state.shares > 0 ? state.basis / state.shares : 0,
    unrealized: value - state.basis, exposure: total > 0 ? value / total : 0 };
}

export function queueOrder(state, side, fraction) {
  if (state.ended || state.event) throw new Error('まず会話を終えてください。');
  if (!['buy', 'sell'].includes(side) || ![0.25, 0.5, 1].includes(fraction)) throw new Error('注文内容を確認してください。');
  if (side === 'buy' && state.cash < 0.01) throw new Error('買付に使える現金がありません。');
  if (side === 'sell' && state.shares < 1e-10) throw new Error('売却できる保有株がありません。');
  state.pending = { side, fraction, placedAt: state.index };
}

export function executePending(state, bar) {
  const order = state.pending;
  if (!order) return null;
  let amount, shares, fee, realized = 0;
  if (order.side === 'buy') {
    const budget = state.cash * order.fraction;
    amount = budget / (1 + FEE_RATE);
    fee = budget - amount;
    shares = amount / bar.open;
    state.cash -= budget;
    state.shares += shares;
    state.basis += budget;
  } else {
    shares = state.shares * order.fraction;
    amount = shares * bar.open;
    fee = amount * FEE_RATE;
    const cost = state.basis * order.fraction;
    state.cash += amount - fee;
    state.shares -= shares;
    state.basis -= cost;
    realized = amount - fee - cost;
    state.realized += realized;
    if (state.shares < 1e-10) { state.shares = 0; state.basis = 0; }
  }
  state.fees += fee;
  state.cash = Math.max(0, state.cash);
  state.pending = null;
  const fill = { date: bar.date, side: order.side, shares, price: bar.open, fee, realized };
  state.history.unshift(fill);
  return fill;
}

export function markEquity(state, bars) {
  const total = account(state, bars).total;
  state.peak = Math.max(state.peak, total);
  state.drawdown = Math.max(state.drawdown, 1 - total / state.peak);
  const last = state.equity[state.equity.length - 1];
  if (last.index === state.index) last.value = total;
  else state.equity.push({ index: state.index, value: total });
}

export function advance(state, bars) {
  if (state.ended || state.event || state.index >= state.end) return false;
  state.index++;
  const fill = executePending(state, bars[state.index]);
  state.lastEventResult = null;
  markEquity(state, bars);
  if (state.datePlan && state.index >= state.datePlan.due) {
    state.event = { kind: 'date', venue: state.datePlan.venue, mood: dayMood(bars[state.index], bars[state.index - 1]).type };
  } else if (state.index === state.end) {
    state.event = { kind: 'final' };
  }
  return { fill, final: state.index === state.end };
}

export const VENUES = {
  cafe: { name: 'カフェ', icon: '☕', cost: 35, hint: 'ゆっくり話せる、窓際の席。' },
  park: { name: '川沿いの散歩', icon: '🌿', cost: 0, hint: '歩幅を合わせて、少し遠回り。' },
  arcade: { name: 'ゲームセンター', icon: '🎮', cost: 50, hint: 'ふたりで遊ぶ、もうひとつの勝負。' },
};

export function planDate(state, venue) {
  if (!VENUES[venue] || state.datePlan || state.event || state.ended) throw new Error('今は約束を入れられません。');
  if (state.end - state.index < 5) throw new Error('約束の日までに、この期間が終わってしまいます。');
  state.datePlan = { venue, due: state.index + 5 };
}

export function settleDate(state, bars, affection, trust, text) {
  if (state.event?.kind !== 'date' || !state.datePlan) throw new Error('今はデート中ではありません。');
  const venue = state.datePlan.venue;
  const cost = VENUES[venue].cost;
  const paid = state.cash >= cost;
  if (paid) state.cash -= cost;
  state.affection = clamp(state.affection + affection, 0, 100);
  state.trust = clamp(state.trust + trust, 0, 100);
  state.dates++;
  if (affection >= 5) state.goodDates++;
  state.lastDateIndex = state.index;
  state.lastTalk = state.index;
  state.memories.unshift({ date: bars[state.index].date, venue, mood: state.event.mood, text, good: affection >= 5, paid });
  state.datePlan = null;
  state.event = null;
  markEquity(state, bars);
  if (state.index === state.end) state.event = { kind: 'final' };
}

export function talk(state, affection, trust) {
  if (state.ended || state.event || state.lastTalk === state.index) throw new Error('今日の会話は、もう楽しみました。');
  state.affection = clamp(state.affection + affection, 0, 100);
  state.trust = clamp(state.trust + trust, 0, 100);
  state.lastTalk = state.index;
  state.talks++;
}

export function benchmark(state, bars) {
  if (state.index === state.start) return state.initialCash;
  const entry = bars[state.start + 1].open;
  return state.initialCash / (1 + FEE_RATE) / entry * bars[state.index].close;
}

export function ending(state, bars) {
  const a = account(state, bars);
  if (state.affection >= 75 && state.trust >= 65 && state.goodDates >= 3) {
    if (state.story?.boundary) return { title: '三倍の彼女と、一倍の暮らし。', rank: 'TRUE END', sprite: 'shy', line: '笑っていられる大きさで、私と付き合ってくれてありがとう。上がる朝も、下がる夜も、あなたの暮らしを大切にしてね。……これは、一倍で、嬉しい。' };
    return a.return >= 0
      ? { title: 'ふたりで、次の高値へ。', rank: 'TRUE END', sprite: 'shy', line: '上がった日も、下がった日も、あなたが見てくれたのは私だったね。次の相場も、その次の約束も……一緒に。' }
      : { title: '雨上がりの、約束。', rank: 'HEART END', sprite: 'shy', line: '結果は悔しいね。でも、苦しい日に隣にいてくれたこと、忘れない。次は作戦も、ふたりで考えよう？' };
  }
  if (state.affection >= 50 && state.dates >= 1) return { title: 'まだ、言いかけの言葉。', rank: 'NEXT DATE', sprite: 'calm', line: 'もう少し、あなたのこと知りたくなっちゃった。相場が休みの日も……連絡していい？' };
  if (a.return > 0.1) return { title: 'チャートの外に、いた私。', rank: 'TRADER END', sprite: 'calm', line: 'トレード、すごかったね。次に会うときは、画面の隣にいる私にも、もう少し話しかけてほしいな。' };
  return { title: 'はじまりは、ここから。', rank: 'ANOTHER START', sprite: 'calm', line: '相場も、恋も、一回じゃわからないよ。別の季節の私にも、会いに来てね。' };
}

export function validateSave(state, bars) {
  if (!state || state.version !== SAVE_VERSION) return false;
  if (![state.start, state.index, state.end].every(Number.isInteger) || state.start < 0 || state.start > state.index || state.index > state.end || state.end >= bars.length) return false;
  if (!['cash', 'shares', 'basis', 'realized', 'fees', 'affection', 'trust', 'peak', 'drawdown'].every(k => Number.isFinite(state[k]))) return false;
  if (state.cash < 0 || state.shares < 0 || state.basis < 0 || state.affection < 0 || state.affection > 100 || state.trust < 0 || state.trust > 100 || state.initialCash !== INITIAL_CASH) return false;
  if (!['talks', 'dates', 'goodDates'].every(k => Number.isInteger(state[k]) && state[k] >= 0) || typeof state.ended !== 'boolean' || !Number.isInteger(state.lastTalk)) return false;
  if (state.start === state.end || state.peak <= 0 || state.fees < 0 || state.drawdown < 0 || state.drawdown > 1) return false;
  if (!Array.isArray(state.history) || !Array.isArray(state.memories) || !Array.isArray(state.equity) || !state.equity.length) return false;
  const validDate = date => typeof date === 'string' && date >= bars[state.start].date && date <= bars[state.index].date;
  if (!state.history.every(t => t && validDate(t.date) && ['buy', 'sell'].includes(t.side) && ['shares', 'price', 'fee', 'realized'].every(k => Number.isFinite(t[k])) && t.shares >= 0 && t.price > 0 && t.fee >= 0)) return false;
  if (!state.memories.every(m => m && validDate(m.date) && VENUES[m.venue] && typeof m.text === 'string' && typeof m.paid === 'boolean')) return false;
  if (!state.equity.every(e => e && Number.isInteger(e.index) && e.index >= state.start && e.index <= state.index && Number.isFinite(e.value) && e.value >= 0)) return false;
  if (state.lastEventResult && (!['reply', 'sprite', 'feedback'].every(k => typeof state.lastEventResult[k] === 'string') || !['calm', 'happy', 'sad', 'panic', 'shy', 'angry'].includes(state.lastEventResult.sprite))) return false;
  if (state.pending && (!['buy', 'sell'].includes(state.pending.side) || ![0.25, 0.5, 1].includes(state.pending.fraction))) return false;
  if (state.datePlan && (!VENUES[state.datePlan.venue] || !Number.isInteger(state.datePlan.due) || state.datePlan.due < state.index || state.datePlan.due > state.end)) return false;
  if (state.event && !['date', 'final'].includes(state.event.kind)) return false;
  if (state.event?.kind === 'date' && !state.datePlan) return false;
  return true;
}
