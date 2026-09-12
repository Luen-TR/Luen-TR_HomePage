// Text and facial timing are independent from the trading clock.
export const EXPRESSIONS = ['calm', 'happy', 'sad', 'panic', 'shy', 'angry'];
export const EXPRESSION_NAMES = { calm:'おだやか', happy:'うれしい', sad:'落ち込み', panic:'大あわて', shy:'照れ', angry:'むっとする' };
const pause = char => /[。！？!?]/u.test(char) ? 230 : /[、,，…\n]/u.test(char) ? 120 : 0;
export const isSpeech = char => !!char && !/[\s、。，,.!?！？…「」『』（）()・—―]/u.test(char);

export function expressionFor(state, mood, frame = null) {
  if (EXPRESSIONS.includes(frame?.expression)) return frame.expression;
  if (frame?.scene === 'promise') return 'shy';
  if (frame?.scene === 'winter') return 'sad';
  if (frame?.scene === 'room-rise') return 'happy';
  if (state.lastEventResult?.expression) return state.lastEventResult.expression;
  return { crash:'panic', whipsaw:'panic', down:'sad', up:'happy', soaring:'happy', calm:'calm' }[mood.type] || 'calm';
}

export class DialogueTiming {
  constructor() { this.id = null; this.characters = []; this.count = 0; this.elapsed = 0; this.speed = 32; this.speaker = ''; }
  start(id, text, speaker, speed = 32) {
    this.speed = speed;
    if (this.id === id && this.characters.join('') === text && this.speaker === speaker) return false;
    this.id = id; this.characters = Array.from(text); this.speaker = speaker;
    this.count = speed === 0 ? this.characters.length : Math.min(1, this.characters.length);
    this.elapsed = 0; return true;
  }
  get done() { return this.count >= this.characters.length; }
  get text() { return this.characters.slice(0, this.count).join(''); }
  get speaking() { return !this.done && this.speaker === 'SOXLちゃん' && isSpeech(this.characters[this.count - 1]); }
  step(milliseconds) {
    if (this.done) return false;
    const before = this.count;
    this.elapsed += milliseconds;
    while (!this.done) {
      const delay = this.speed + pause(this.characters[this.count - 1]);
      if (this.elapsed < delay) break;
      this.elapsed -= delay; this.count++;
    }
    return before !== this.count;
  }
  complete() {
    if (this.done) return false;
    this.count = this.characters.length; this.elapsed = 0; return true;
  }
}

export class FaceTiming {
  constructor(random = Math.random) { this.random = random; this.untilBlink = this.interval(); this.closed = 0; this.mouthTime = 0; }
  interval() { return 3800 + this.random() * 2400; }
  step(milliseconds, speaking, enabled = true) {
    if (!enabled) return { blink:false, mouth:false };
    if (this.closed > 0) this.closed = Math.max(0, this.closed - milliseconds);
    else {
      this.untilBlink -= milliseconds;
      if (this.untilBlink <= 0) { this.closed = 115; this.untilBlink = this.interval(); }
    }
    this.mouthTime = speaking ? this.mouthTime + milliseconds : 0;
    return { blink:this.closed > 0, mouth:speaking && this.mouthTime % 300 < 185 };
  }
}
