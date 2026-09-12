import test from 'node:test';
import assert from 'node:assert/strict';
import { DialogueTiming, FaceTiming, expressionFor } from '../assets/js/performance.mjs';

test('text reveals Japanese characters intact and pauses at punctuation',()=>{
  const text=new DialogueTiming();text.start('one','あ。い♡','SOXLちゃん',32);
  assert.equal(text.text,'あ');assert.equal(text.speaking,true);
  text.step(32);assert.equal(text.text,'あ。');assert.equal(text.speaking,false);
  text.step(230);assert.equal(text.text,'あ。');text.step(32);assert.equal(text.text,'あ。い');
  text.step(32);assert.equal(text.text,'あ。い♡');assert.equal(text.done,true);assert.equal(text.speaking,false);
});
test('the first advance completes the line, only a second advance may turn the page',()=>{
  const text=new DialogueTiming();text.start('one','おはようございます！','SOXLちゃん');let page=0;
  const advance=()=>{if(!text.complete())page++;};
  advance();assert.equal(page,0);assert.equal(text.done,true);advance();assert.equal(page,1);
});
test('rerendering an unchanged line preserves its progress while a new speaker or page resets it',()=>{
  const text=new DialogueTiming();text.start('one','嬉しいね','SOXLちゃん');text.step(32);const count=text.count;
  assert.equal(text.start('one','嬉しいね','SOXLちゃん'),false);assert.equal(text.count,count);
  text.start('two','嬉しいね','俺');assert.equal(text.count,1);assert.equal(text.speaking,false);
  text.start('three','聞いているよ','エスピーさん');assert.equal(text.speaking,false);
});
test('instant display and completed text never lip flap; hidden or paused clocks need no steps',()=>{
  const text=new DialogueTiming();text.start('instant','こんにちは','SOXLちゃん',0);assert.equal(text.done,true);assert.equal(text.speaking,false);
  text.start('regular','こんにちは','SOXLちゃん');const face=new FaceTiming(()=>0);
  assert.equal(face.step(30,text.speaking).mouth,true);text.complete();assert.equal(face.step(30,text.speaking).mouth,false);
  const count=text.count;assert.equal(text.count,count);
  assert.deepEqual(face.step(9999,true,false),{blink:false,mouth:false});
});
test('idle eye blinks have randomized intervals and a short closed frame independent from the mouth',()=>{
  const face=new FaceTiming(()=>0);
  assert.deepEqual(face.step(3799,false),{blink:false,mouth:false});
  assert.deepEqual(face.step(1,true),{blink:true,mouth:true});
  assert.equal(face.step(114,false).blink,true);assert.equal(face.step(1,false).blink,false);
  const later=new FaceTiming(()=>1);assert.equal(later.step(4000,false).blink,false);
});
test('all six expression directions have concrete narrative or interaction uses',()=>{
  const empty={};assert.equal(expressionFor(empty,{type:'down'}),'sad');assert.equal(expressionFor(empty,{type:'crash'}),'panic');
  assert.equal(expressionFor(empty,{type:'up'}),'happy');assert.equal(expressionFor(empty,{type:'calm'}),'calm');
  assert.equal(expressionFor(empty,{type:'calm'},{scene:'promise'}),'shy');
  assert.equal(expressionFor(empty,{type:'calm'},{expression:'angry'}),'angry');
});
