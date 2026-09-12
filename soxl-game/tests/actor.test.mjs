import test from 'node:test';
import assert from 'node:assert/strict';

const elements=new Map(), animationQueue=new Map();let counter=0;
const element=id=>{
  if(!elements.has(id)) elements.set(id,{ hidden:true,src:'',textContent:'',dataset:{},classList:{toggle(){}},setAttribute(key,value){this[key]=value;} });
  return elements.get(id);
};
globalThis.document={hidden:false,getElementById:element,addEventListener(){}};
globalThis.window={matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}};
globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.Image=class { set src(value){this.url=value;queueMicrotask(()=>this.onload());} };
globalThis.requestAnimationFrame=callback=>{animationQueue.set(++counter,callback);return counter;};
globalThis.cancelAnimationFrame=id=>animationQueue.delete(id);
const { NovelActor }=await import('../assets/js/actor.mjs');
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function tick(time){const callbacks=[...animationQueue.values()];animationQueue.clear();callbacks.forEach(callback=>callback(time));}

test('the actor animates only face layers, reveals choices at completion, and stops under a modal or hidden tab',async()=>{
  const actor=new NovelActor(message=>assert.fail(message));actor.active=true;
  actor.setScene(true,'calm');await settle();actor.say('page1','こんにちは、今日はいい天気だね。','SOXLちゃん');
  const body=element('standing-body').src;
  tick(0);tick(48);assert.equal(element('standing-mouth').hidden,false);assert.equal(element('standing-body').src,body);
  assert.equal(element('dialogue-choices').hidden,true);assert.equal(element('reveal-line').hidden,false);
  actor.paused=true;actor.refresh();assert.equal(animationQueue.size,0);assert.equal(element('standing-mouth').hidden,true);
  const count=actor.text.count;actor.paused=false;actor.refresh();tick(60000);assert.equal(actor.text.count,count);
  actor.complete();assert.equal(element('dialogue-choices').hidden,false);assert.equal(element('reveal-line').hidden,true);
  document.hidden=true;actor.refresh();assert.equal(animationQueue.size,0);document.hidden=false;
  actor.stop();
});

test('CGs and other speakers keep SOXL silent; returning to the current expression cannot leave a loading lock',async()=>{
  const actor=new NovelActor(message=>assert.fail(message));actor.active=true;
  actor.setScene(true,'calm');await settle();
  actor.setExpression('happy');actor.setExpression('calm');await settle();assert.equal(actor.loading,false);assert.equal(actor.expression,'calm');
  actor.say('narrator','これは俺の心の声。','俺');tick(0);tick(50);assert.equal(element('standing-mouth').hidden,true);
  actor.setScene(false,'calm');assert.equal(element('standing-character').hidden,true);
  actor.say('cg','嬉しいです！','SOXLちゃん');tick(100);assert.equal(element('standing-mouth').hidden,true);
  actor.complete();assert.equal(animationQueue.size,0);actor.stop();
});
