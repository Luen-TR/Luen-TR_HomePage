import { DialogueTiming, FaceTiming, EXPRESSIONS, EXPRESSION_NAMES } from './performance.mjs';

const $ = id => document.getElementById(id);
const SETTINGS_KEY = 'soxl-heartbeat-reading-v1';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve(src); image.onerror = reject; image.src = src;
});

export class NovelActor {
  constructor(onError) {
    this.text = new DialogueTiming(); this.face = new FaceTiming();
    this.frames = new Map(); this.expression = null; this.wantedExpression = 'calm';
    this.visible = false; this.active = false; this.paused = false; this.loading = false;
    this.frameRequest = null; this.lastTime = null; this.onError = onError;
    this.settings = { speed:reduced.matches ? 0 : 32, motion:!reduced.matches };
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if ([0,18,32,50].includes(saved?.speed)) this.settings.speed=saved.speed;
      if (typeof saved?.motion==='boolean') this.settings.motion=saved.motion;
    } catch { /* Reading works without browser storage. */ }
    reduced.addEventListener('change', () => { if (reduced.matches) this.complete(); this.refresh(); });
    document.addEventListener('visibilitychange', () => this.refresh());
    window.addEventListener('pagehide', () => this.stop());
  }
  get animated() { return this.settings.motion && !reduced.matches; }
  preload(expression) {
    if (!EXPRESSIONS.includes(expression)) expression='calm';
    if (!this.frames.has(expression)) {
      const root=`assets/standing/${expression}`;
      const task=Promise.all(['rest','blink','talk'].map(part=>loadImage(`${root}-${part}.png`)));
      this.frames.set(expression,task);
      task.catch(()=>this.frames.delete(expression));
    }
    return this.frames.get(expression);
  }
  async setExpression(expression) {
    if (!EXPRESSIONS.includes(expression)) expression='calm';
    this.wantedExpression=expression;
    if (this.expression===expression) { this.loading=false; this.refresh(); return; }
    this.loading=true; this.refresh();
    try {
      const [rest,blink,talk]=await this.preload(expression);
      if(this.wantedExpression!==expression) return;
      $('standing-body').src=rest; $('standing-eyes').src=blink; $('standing-mouth').src=talk;
      $('standing-character').setAttribute('aria-label',`${EXPRESSION_NAMES[expression]}表情のSOXLちゃん`);
      $('standing-character').dataset.expression=expression;
      this.expression=expression; this.loading=false;
      $('standing-character').hidden=!this.visible;
      this.resetFace(); this.refresh();
    } catch {
      if(this.wantedExpression!==expression) return;
      this.loading=false; this.onError('立ち絵を読み込めませんでした。通信を確認して再読み込みしてください。'); this.refresh();
    }
  }
  setScene(visible, expression) {
    this.visible=visible;
    $('standing-character').hidden=!visible || !this.expression;
    if(visible) this.setExpression(expression);
    this.refresh();
  }
  say(id, text, speaker='SOXLちゃん') {
    const speed=reduced.matches ? 0 : this.settings.speed;
    const changed=this.text.start(id,text,speaker,speed);
    if(changed) $('dialogue-accessible').textContent=`${speaker}。${text}`;
    this.drawText(); this.refresh();
  }
  drawText() {
    $('dialogue-text').textContent=this.text.text;
    $('reveal-line').hidden=this.text.done;
    $('dialogue-choices').hidden=!this.text.done;
    $('dialogue-text').classList.toggle('is-revealing',!this.text.done);
  }
  complete() {
    const consumed=this.text.complete(); this.drawText(); this.resetFace(); this.refresh(); return consumed;
  }
  configure(changes) {
    Object.assign(this.settings,changes);
    this.text.speed=this.settings.speed;
    if(this.settings.speed===0) this.complete();
    try { localStorage.setItem(SETTINGS_KEY,JSON.stringify(this.settings)); } catch { /* Optional preference persistence. */ }
    this.refresh();
  }
  resetFace() { $('standing-eyes').hidden=true; $('standing-mouth').hidden=true; }
  stop() {
    if(this.frameRequest!==null) cancelAnimationFrame(this.frameRequest);
    this.frameRequest=null; this.lastTime=null; this.resetFace();
  }
  refresh() {
    if(!this.active || this.paused || document.hidden || (this.visible && this.loading)) { this.stop(); return; }
    if(!this.animated) this.resetFace();
    if(this.text.done && (!this.visible || !this.animated)) { this.stop(); return; }
    if(this.frameRequest===null) this.frameRequest=requestAnimationFrame(time=>this.tick(time));
  }
  tick(time) {
    this.frameRequest=null;
    const elapsed=this.lastTime===null ? 0 : Math.min(100,time-this.lastTime); this.lastTime=time;
    if(this.text.step(elapsed)) this.drawText();
    const pose=this.face.step(elapsed,this.text.speaking,this.animated && this.visible);
    $('standing-eyes').hidden=!pose.blink; $('standing-mouth').hidden=!pose.mouth;
    this.refresh();
  }
}
