export function visibleBars(bars, index, count) { return bars.slice(Math.max(0, index - count + 1), index + 1); }
export function averageAt(bars, index, period = 20) {
  if (index < period - 1) return null;
  return bars.slice(index - period + 1, index + 1).reduce((a, b) => a + b.close, 0) / period;
}

export class CandleChart {
  constructor(canvas, readout) {
    this.canvas = canvas; this.readout = readout; this.count = 60; this.hover = null;
    this.ctx = canvas.getContext('2d');
    this.observer = new ResizeObserver(() => this.draw());
    this.observer.observe(canvas.parentElement);
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      if (!this.points?.length) return;
      this.hover = Math.max(0, Math.min(this.points.length - 1, Math.floor((e.clientX - rect.left - 10) / this.step)));
      this.draw();
    });
    canvas.addEventListener('pointerleave', () => { this.hover = null; this.draw(); });
    canvas.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const last = this.points.length - 1;
      this.hover = e.key === 'Home' ? 0 : e.key === 'End' ? last : Math.max(0, Math.min(last, (this.hover ?? last) + (e.key === 'ArrowLeft' ? -1 : 1)));
      this.draw();
    });
  }
  update(bars, state, count) { this.bars = bars; this.state = state; this.count = count; this.hover = null; this.draw(); }
  draw() {
    if (!this.bars || !this.state || !this.ctx) return;
    const width = this.canvas.parentElement.clientWidth;
    if (!width) return;
    const height = width < 600 ? 292 : 340;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * dpr); this.canvas.height = height * dpr;
    this.canvas.style.height = `${height}px`;
    const c = this.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, width, height);
    const points = this.points = visibleBars(this.bars, this.state.index, this.count);
    const start = this.state.index - points.length + 1;
    const avgs = points.map((_, i) => averageAt(this.bars, start + i));
    const values = [...points.flatMap(b => [b.low, b.high]), ...avgs.filter(v => v !== null)];
    let lo = Math.min(...values), hi = Math.max(...values);
    const pad = Math.max((hi - lo) * .12, hi * .01); lo = Math.max(0, lo - pad); hi += pad;
    const left = 10, right = width - 67, top = 20, bottom = height - 78;
    const y = price => top + (hi - price) / (hi - lo) * (bottom - top);
    const step = this.step = (right - left) / points.length;
    const x = i => left + (i + .5) * step;
    const fmt = n => n < 1 ? n.toFixed(3) : n.toFixed(2);
    c.font = '11px ui-monospace, monospace'; c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const price = lo + (hi - lo) * i / 4, py = y(price);
      c.strokeStyle = '#202b42'; c.beginPath(); c.moveTo(left, py); c.lineTo(right, py); c.stroke();
      c.fillStyle = '#92a2bf'; c.fillText(fmt(price), right + 9, py + 4);
    }
    const maxVolume = Math.max(...points.map(b => b.volume), 1);
    const candleWidth = Math.max(1, Math.min(13, step * .65));
    points.forEach((b, i) => {
      const color = b.close >= b.open ? '#52dfbb' : '#ff7896';
      c.strokeStyle = color; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x(i), y(b.high)); c.lineTo(x(i), y(b.low)); c.stroke();
      c.fillStyle = color; c.fillRect(x(i) - candleWidth / 2, Math.min(y(b.open), y(b.close)), candleWidth, Math.max(1.5, Math.abs(y(b.open) - y(b.close))));
      c.globalAlpha = .28; c.fillRect(x(i) - candleWidth / 2, height - 29 - b.volume / maxVolume * 32, candleWidth, b.volume / maxVolume * 32); c.globalAlpha = 1;
    });
    c.strokeStyle = '#b799ff'; c.lineWidth = 1.6; c.beginPath();
    let begun = false;
    avgs.forEach((value, i) => { if (value === null) return; if (!begun) { c.moveTo(x(i), y(value)); begun = true; } else c.lineTo(x(i), y(value)); }); c.stroke();
    const tradeByDate = new Map(this.state.history.map(t => [t.date, t]));
    points.forEach((b, i) => {
      const trade = tradeByDate.get(b.date); if (!trade) return;
      const buy = trade.side === 'buy', py = buy ? Math.min(bottom + 6, y(b.low) + 12) : Math.max(9, y(b.high) - 10);
      c.fillStyle = buy ? '#70dcff' : '#ffc885'; c.beginPath();
      c.moveTo(x(i), py + (buy ? -5 : 5)); c.lineTo(x(i) - 4, py + (buy ? 3 : -3)); c.lineTo(x(i) + 4, py + (buy ? 3 : -3)); c.closePath(); c.fill();
    });
    c.fillStyle = '#92a2bf'; c.textAlign = 'left';
    for (const i of [...new Set([0, Math.floor(points.length / 2), points.length - 1])]) {
      c.textAlign = i === 0 ? 'left' : i === points.length - 1 ? 'right' : 'center';
      c.fillText(points[i].date.slice(2).replaceAll('-', '/'), i === 0 ? left : i === points.length - 1 ? right : x(i), height - 8);
    }
    c.textAlign = 'left';
    const current = points.at(-1), py = y(current.close);
    c.setLineDash([3, 4]); c.strokeStyle = '#6caecc'; c.beginPath(); c.moveTo(left, py); c.lineTo(right, py); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#163d52'; c.fillRect(right + 3, py - 9, 63, 19); c.fillStyle = '#9ee7ff'; c.fillText(fmt(current.close), right + 8, py + 4);
    const selected = this.hover === null ? points.length - 1 : Math.min(this.hover, points.length - 1);
    if (this.hover !== null) { c.strokeStyle = '#9dabbe'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x(selected), top); c.lineTo(x(selected), height - 26); c.stroke(); c.setLineDash([]); }
    const b = points[selected];
    this.readout.textContent = `${b.date}　始 ${fmt(b.open)}　高 ${fmt(b.high)}　安 ${fmt(b.low)}　終 ${fmt(b.close)}　出来高 ${(b.volume / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 0 })}万`;
  }
}
