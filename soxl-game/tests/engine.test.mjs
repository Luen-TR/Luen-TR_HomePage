import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as E from '../assets/js/engine.mjs';
import { visibleBars, averageAt } from '../assets/js/chart.mjs';
import { conversation, dateScene, contextEvent } from '../assets/js/story.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../data/soxl-daily.json', import.meta.url)));
const bars = data.bars.map(([date, open, high, low, close, volume]) => ({ date, open, high, low, close, volume }));
const closeTo = (a, b) => assert.ok(Math.abs(a - b) < Math.max(1e-7, Math.abs(b) * 1e-10), `${a} != ${b}`);
const fresh = (days = 60) => E.createGame(bars, '2020-02-03', days);

test('full real daily series has unique sorted dates and valid OHLC, including September 2026', () => {
  assert.equal(bars.length, data.meta.count); assert.equal(bars[0].date, '2010-03-11');
  assert.ok(bars.at(-1).date >= '2026-09-04' && bars.at(-1).date <= '2026-09-09');
  assert.equal(new Set(bars.map(b => b.date)).size, bars.length);
  bars.forEach((b, i) => {
    assert.ok(b.low > 0 && b.low <= Math.min(b.open, b.close) && Math.max(b.open, b.close) <= b.high);
    assert.ok([b.open, b.high, b.low, b.close, b.volume].every(Number.isFinite));
    assert.ok(b.volume >= 0); if (i) assert.ok(b.date > bars[i - 1].date);
  });
  assert.deepEqual(data.meta.splits.map(s => s.ratio), ['4:1', '15:1']);
});
test('weekends resolve to the next session; invalid/last dates cannot start a campaign', () => {
  const s = E.createGame(bars, '2020-02-01', 30); assert.equal(bars[s.index].date, '2020-02-03');
  assert.equal(s.end - s.start, 30);
  assert.throws(() => E.createGame(bars, bars.at(-1).date)); assert.throws(() => E.createGame(bars, '', 60));
  assert.throws(() => E.createGame(bars, '2020-01-01', -1));
});
test('a queued buy has no immediate fill, then executes at the next open including a price gap', () => {
  const s = fresh(), next = bars[s.index + 1]; E.queueOrder(s, 'buy', 1);
  assert.equal(s.cash, 10000); assert.equal(s.shares, 0);
  const out = E.advance(s, bars); assert.equal(out.fill.price, next.open);
  closeTo(s.shares, 10000 / 1.001 / next.open); closeTo(s.fees, 10000 - 10000 / 1.001);
  assert.equal(s.cash, 0); closeTo(E.account(s, bars).total, s.shares * next.close);
});
test('partial sale allocates cost basis and selling all leaves no phantom shares or cash deficit', () => {
  const s = fresh(); E.queueOrder(s, 'buy', .5); E.advance(s, bars);
  const shares = s.shares; E.queueOrder(s, 'sell', .5); const out = E.advance(s, bars);
  closeTo(s.basis, 2500); closeTo(s.shares, shares / 2);
  closeTo(s.realized, out.fill.shares * out.fill.price * .999 - 2500);
  E.queueOrder(s, 'sell', 1); E.advance(s, bars); assert.equal(s.shares, 0); assert.equal(s.basis, 0); assert.ok(s.cash >= 0);
  assert.throws(() => E.queueOrder(s, 'sell', 1));
});
test('replacing or canceling a pending order does not create extra transactions', () => {
  const s = fresh(); E.queueOrder(s, 'buy', 1); E.queueOrder(s, 'buy', .25); E.advance(s, bars);
  assert.equal(s.history.length, 1); closeTo(s.cash, 7500);
  E.queueOrder(s, 'sell', 1); s.pending = null; E.advance(s, bars); assert.equal(s.history.length, 1);
});
test('the chart, 20-day mean, current account and benchmark never read future price bars', () => {
  const s = fresh();
  const guarded = new Proxy(bars, { get(target, key) { if (/^\d+$/.test(String(key)) && Number(key) > s.index) throw new Error('future price read'); return Reflect.get(target, key); } });
  assert.equal(E.benchmark(s, guarded), 10000); E.account(s, guarded);
  assert.equal(visibleBars(guarded, s.index, 60).at(-1).date, bars[s.index].date);
  closeTo(averageAt(guarded, s.index), bars.slice(s.index - 19, s.index + 1).reduce((n, b) => n + b.close, 0) / 20);
  assert.equal(averageAt(bars, 18), null);
  conversation(s, guarded);
});
test('same date venue has different scenes and replies when the real daily move changes', () => {
  const s = fresh(); E.planDate(s, 'cafe'); for (let i = 0; i < 5; i++) E.advance(s, bars);
  assert.equal(s.event.kind, 'date'); const previous = bars[s.index - 1].close;
  const down = structuredClone(bars), up = structuredClone(bars);
  down[s.index] = { ...down[s.index], open: previous, high: previous * 1.01, low: previous * .69, close: previous * .7 };
  up[s.index] = { ...up[s.index], open: previous, high: previous * 1.31, low: previous * .99, close: previous * 1.3 };
  const lowScene = dateScene(s, down), highScene = dateScene(s, up);
  assert.notEqual(lowScene.line, highScene.line); assert.notEqual(lowScene.options[0].text, highScene.options[0].text);
  assert.equal(lowScene.sprite, 'panic'); assert.equal(highScene.sprite, 'happy');
});
test('date events stop time, charge once, and resume after a response', () => {
  const s = fresh(); E.planDate(s, 'cafe'); const due = s.datePlan.due;
  for (let i = 0; i < 5; i++) E.advance(s, bars);
  assert.equal(s.index, due); assert.equal(E.advance(s, bars), false); assert.throws(() => E.queueOrder(s, 'buy', 1));
  E.settleDate(s, bars, 8, 6, '一緒に過ごした。'); assert.equal(s.cash, 9965); assert.equal(s.dates, 1);
  assert.equal(s.goodDates, 1); assert.equal(s.memories.length, 1); assert.equal(s.affection, 33);
  assert.throws(() => E.settleDate(s, bars, 8, 6, '重複')); assert.equal(s.cash, 9965);
  assert.throws(() => E.talk(s, 3, 2)); assert.ok(E.advance(s, bars));
});
test('a fully invested player still gets a free walk without negative cash', () => {
  const s = fresh(); E.planDate(s, 'arcade'); E.queueOrder(s, 'buy', 1);
  for (let i = 0; i < 5; i++) E.advance(s, bars);
  const scene = dateScene(s, bars); assert.equal(scene.freeWalk, true); assert.equal(scene.venue, 'park');
  E.settleDate(s, bars, 8, 6, '歩こう'); assert.equal(s.cash, 0); assert.equal(s.memories[0].paid, false);
});
test('last-day dates finish before the ending; no new promise can extend beyond the campaign', () => {
  const s = fresh(5); E.planDate(s, 'park'); for (let i = 0; i < 5; i++) E.advance(s, bars);
  assert.equal(s.event.kind, 'date'); E.settleDate(s, bars, 8, 6, '最後の約束'); assert.equal(s.event.kind, 'final');
  assert.equal(E.advance(s, bars), false); assert.throws(() => E.planDate(s, 'park'));
  const short = fresh(4); assert.throws(() => E.planDate(short, 'park'));
});
test('talking changes the relationship once per day, separately from assets', () => {
  const s = fresh(); E.talk(s, 3, 2); assert.equal(s.affection, 28); assert.equal(s.trust, 27);
  assert.equal(E.account(s, bars).total, 10000); assert.throws(() => E.talk(s, 3, 2));
  E.advance(s, bars); E.talk(s, -3, -2); assert.equal(s.affection, 25);
});
test('all ending branches distinguish romance from financial performance', () => {
  const s = fresh(); assert.equal(E.ending(s, bars).rank, 'ANOTHER START');
  s.cash = 12000; assert.equal(E.ending(s, bars).rank, 'TRADER END');
  s.affection = 60; s.dates = 1; assert.equal(E.ending(s, bars).rank, 'NEXT DATE');
  s.affection = 80; s.trust = 70; s.goodDates = 3; assert.equal(E.ending(s, bars).rank, 'TRUE END');
  s.cash = 9000; assert.equal(E.ending(s, bars).rank, 'HEART END');
});
test('save/restore preserves pending orders and active dates; malformed saves are rejected', () => {
  const s = fresh(); E.queueOrder(s, 'buy', .5); E.planDate(s, 'cafe');
  let copy = JSON.parse(JSON.stringify(s)); assert.equal(E.validateSave(copy, bars), true);
  E.advance(copy, bars); assert.equal(copy.history.length, 1);
  for (let i = 1; i < 5; i++) E.advance(copy, bars);
  copy = JSON.parse(JSON.stringify(copy)); assert.equal(E.validateSave(copy, bars), true); assert.equal(copy.event.kind, 'date');
  const corrupt = structuredClone(copy); corrupt.history[0].price = 'bad'; assert.equal(E.validateSave(corrupt, bars), false);
  copy.cash = -1; assert.equal(E.validateSave(copy, bars), false);
});
test('historical context only appears after its public release, including after-hours earnings', () => {
  assert.equal(contextEvent('2023-05-24'), undefined); assert.ok(contextEvent('2023-05-25'));
  assert.equal(contextEvent('2020-03-13'), undefined); assert.ok(contextEvent('2020-03-16'));
});
test('a complete 2010–2026 campaign can trade, date, save, restore and reach a valid ending', () => {
  let s = E.createGame(bars, bars[0].date, 0), count = 0;
  while (s.index < s.end) {
    if (s.event?.kind === 'date') E.settleDate(s, bars, 8, 6, 'また会おう');
    if (!s.datePlan && s.end - s.index >= 5 && count % 20 === 0) E.planDate(s, 'cafe');
    if (s.lastTalk !== s.index) E.talk(s, 1, 1);
    if (count % 9 === 0 && s.cash > .01) E.queueOrder(s, 'buy', .5);
    if (count % 13 === 0 && s.shares > 0) E.queueOrder(s, 'sell', .5);
    assert.ok(E.advance(s, bars)); count++;
    if (count % 100 === 0) { s = JSON.parse(JSON.stringify(s)); assert.equal(E.validateSave(s, bars), true); }
    assert.ok(s.cash >= 0 && s.shares >= 0 && Number.isFinite(E.account(s, bars).total));
  }
  if (s.event.kind === 'date') E.settleDate(s, bars, 8, 6, '最後の約束');
  assert.equal(s.event.kind, 'final'); assert.equal(count, bars.length - 1); assert.ok(s.dates > 100);
  assert.equal(E.validateSave(s, bars), true); assert.ok(E.ending(s, bars).title);
});
