import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as E from '../assets/js/engine.mjs';
import * as N from '../assets/js/novel.mjs';
import { HISTORY, historicalEvent } from '../assets/js/history.mjs';
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const data=read('../data/soxl-daily.json'), friends=read('../data/friends-daily.json');
const bars=data.bars.map(([date,open,high,low,close,volume])=>({date,open,high,low,close,volume}));
const companions=new Map(friends.bars.map(([date,...values])=>[date,Object.fromEntries(friends.meta.columns.slice(1).map((symbol,i)=>[symbol,values[i]]))]));
const fresh=(date='2020-02-03',days=60)=>E.createGame(bars,date,days);
function readDay(s) { N.prepareDay(s,bars,companions); while(N.unread(s)) {N.rememberFrame(s,bars);N.turnPage(s);} }

test('the first story pages preserve the novel voices and do not advance market time or place trades',()=>{
  const s=fresh(), index=s.index;
  const packet=N.prepareDay(s,bars,companions);
  assert.equal(packet.kind,'prologue'); assert.ok(packet.frames.some(f=>f.speaker==='エスピーさん'));
  readDay(s); assert.equal(s.index,index); assert.equal(s.cash,10000); assert.equal(s.pending,null);
  assert.equal(s.story.seen.filter(id=>id==='prologue').length,1);
  const count=s.story.log.length; N.rememberFrame(s,bars); N.turnPage(s); assert.equal(s.story.log.length,count);
});
test('mid-page save resumes exactly and rejects out-of-range cursors or unseen future log dates',()=>{
  let s=fresh();N.prepareDay(s,bars,companions);N.rememberFrame(s,bars);N.turnPage(s);N.rememberFrame(s,bars);
  const text=N.currentFrame(s).text; s=JSON.parse(JSON.stringify(s));
  assert.equal(N.validateStory(s.story,s,bars),true); assert.equal(N.prepareDay(s,bars,companions).cursor,1); assert.equal(N.currentFrame(s).text,text);
  const broken=structuredClone(s);broken.story.packet.cursor=999;assert.equal(N.validateStory(broken.story,broken,bars),false);
  const future=structuredClone(s);future.story.log[0].date='2099-01-01';assert.equal(N.validateStory(future.story,future,bars),false);
  assert.equal(N.validateStory(undefined,s,bars),true);
});
test('narrative and friends can only read prices through the current date',()=>{
  const s=fresh();s.story={version:1,seen:['prologue','reset'],winterAt:null,boundary:false,packet:null,log:[],unlocked:[]};
  const guarded=new Proxy(bars,{get(target,key){if(/^\d+$/.test(String(key))&&Number(key)>s.index)throw new Error('future access');return Reflect.get(target,key);}});
  const guardedFriends={get(date){assert.ok(date<=bars[s.index].date);return companions.get(date);}};
  N.prepareDay(s,guarded,guardedFriends); N.pastDrawdown(s,guarded);
});
test('a real market drawdown triggers the winter episode, never a calendar-only fictional crash',()=>{
  const s=fresh();readDay(s);
  let found=false;
  while(s.index<s.end){E.advance(s,bars);const p=N.prepareDay(s,bars,companions);
    if(p.kind==='winter'){const change=E.dayMood(bars[s.index],bars[s.index-1]).change;assert.ok(change<=-.08 || N.pastDrawdown(s,bars)>=.2);assert.ok(p.frames.some(f=>f.speaker==='SOXSちゃん'));found=true;}
    readDay(s);
  }
  assert.ok(found);assert.ok(s.story.seen.includes('boundary'));
});
test('all four friends have actual dated returns for the whole SOXL series, including distinct same-day moves',()=>{
  assert.equal(friends.meta.count,data.meta.count);assert.equal(friends.meta.start,data.meta.start);assert.equal(friends.meta.end,data.meta.end);
  for(const b of bars){const report=N.friendReport(b.date,companions);assert.equal(report.length,4);report.forEach(r=>assert.ok(Number.isFinite(r.change)&&r.change>-1));}
  const report=N.friendReport('2023-05-25',companions);assert.equal(report.find(r=>r.symbol==='NVDA').change,companions.get('2023-05-25').NVDA);
  assert.ok(new Set(report.map(r=>r.change)).size>1);
  assert.deepEqual(N.friendReport('2030-01-01',companions),[]);
});
test('earnings and their domestic adaptations never appear before the release is known',()=>{
  assert.equal(historicalEvent('2023-05-24'),undefined); assert.equal(historicalEvent('2023-05-25').id,'nvidia-2023');
  assert.equal(historicalEvent('2024-08-01'),undefined); assert.equal(historicalEvent('2024-08-02').id,'intel-2024');
  for(const e of HISTORY){assert.ok(e.date>=e.published);assert.ok(e.until>=e.date);assert.match(e.url,/^https:\/\//);assert.ok(e.lines.length>=3);}
  const s=fresh('2023-05-25');const p=N.prepareDay(s,bars,companions);assert.ok(p.ids.includes('nvidia-2023'));
  assert.ok(p.frames.some(f=>f.source?.url.includes('nvidia')));
});
test('date scenes keep the correct location and block market advance until choices are resolved',()=>{
  for(const venue of ['cafe','park','arcade']){
    const s=fresh();E.planDate(s,venue);readDay(s);
    for(let i=0;i<5;i++){E.advance(s,bars);if(i<4)readDay(s);}
    const p=N.prepareDay(s,bars,companions);assert.equal(p.kind,'date');
    assert.equal(N.backdrop(s,bars),{cafe:'cafe',park:'riverside',arcade:'arcade'}[venue]);
    assert.equal(E.advance(s,bars),false);readDay(s);assert.equal(E.advance(s,bars),false);
    E.settleDate(s,bars,8,6,'約束の時間');assert.ok(E.advance(s,bars));
  }
});
test('selling all shares never penalizes the relationship, and the boundary choice creates no order',()=>{
  const s=fresh();E.queueOrder(s,'buy',1);E.advance(s,bars);E.queueOrder(s,'sell',1);E.advance(s,bars);
  assert.equal(s.shares,0);assert.equal(s.affection,25);assert.equal(s.trust,25);
  const before=E.account(s,bars).total, option=N.boundaryChoices()[0];E.talk(s,option.affection,option.trust);s.story={boundary:true};
  assert.equal(E.account(s,bars).total,before);assert.equal(s.pending,null);
  s.affection=80;s.trust=80;s.goodDates=3;s.cash=8000;
  assert.equal(E.ending(s,bars).rank,'TRUE END');assert.match(E.ending(s,bars).line,/一倍/);
});
test('a novel campaign reads, trades, dates, resumes and finishes without duplicate chapters or future facts',()=>{
  let s=fresh(), days=0;
  while(true){
    readDay(s);
    assert.ok(N.validateStory(s.story,s,bars));
    if(s.event?.kind==='date') {
      E.settleDate(s,bars,8,6,'ふたりの帰り道');
      N.unlockCG(s,N.dateMoment(s,bars,{affection:8,trust:6}));
    }
    if(s.event?.kind==='final')break;
    if(s.lastTalk!==s.index)E.talk(s,2,2);
    if(!s.datePlan&&s.end-s.index>=5&&days%8===0)E.planDate(s,'cafe');
    if(days%7===0&&s.cash>.01)E.queueOrder(s,'buy',.25);
    if(days%11===0&&s.shares>0)E.queueOrder(s,'sell',.5);
    assert.ok(E.advance(s,bars));days++;
    N.prepareDay(s,bars,companions);
    if(days%5===0){s=JSON.parse(JSON.stringify(s));assert.ok(E.validateSave(s,bars));assert.ok(N.validateStory(s.story,s,bars));}
  }
  assert.equal(days,60);assert.equal(new Set(s.story.seen).size,s.story.seen.length);
  assert.equal(new Set(s.story.log.map(e=>e.id)).size,s.story.log.length);
  assert.ok(s.dates>=3);assert.ok(s.story.unlocked.includes('winter'));assert.ok(s.story.unlocked.includes('promise'));assert.ok(s.story.unlocked.includes('cafe'));
});
test('every scene and module referenced by the narrative exists in the distributable source',()=>{
  for(const scene of Object.values(N.SCENES)){
    const path=new URL(`../assets/scenes/${scene.file}`,import.meta.url);assert.ok(fs.statSync(path).size>10000);
    const png=fs.readFileSync(path);assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
  }
});

test('ordinary backgrounds do not unlock CGs; story milestones unlock only when reached',()=>{
  const s=fresh(),p=N.prepareDay(s,bars,companions);
  N.rememberFrame(s,bars);assert.deepEqual(s.story.unlocked,[]);assert.equal(p.frames[0].character,false);
  N.turnPage(s);N.rememberFrame(s,bars);assert.deepEqual(s.story.unlocked,[]);
  N.turnPage(s);N.rememberFrame(s,bars);assert.deepEqual(s.story.unlocked,['room-morning']);
  N.turnPage(s);assert.equal(N.currentFrame(s).cg,undefined);
  readDay(s);E.advance(s,bars);const ordinary=N.prepareDay(s,bars,companions);
  assert.equal(ordinary.kind,'daily');assert.ok(ordinary.frames.every(f=>!f.cg));readDay(s);
  assert.deepEqual(s.story.unlocked,['room-morning']);
});

test('a date CG celebrates a good response once, with free walks using the riverside',()=>{
  for(const [cash,expected] of [[10000,'cafe'],[0,'riverside']]) {
    const s=fresh();N.ensureStory(s);E.planDate(s,'cafe');
    for(let i=0;i<5;i++)E.advance(s,bars);
    s.cash=cash;E.settleDate(s,bars,8,6,'ゆっくり話そう');
    assert.equal(N.dateMoment(s,bars,{affection:1,trust:0}),null);
    const cg=N.dateMoment(s,bars,{affection:8,trust:6});assert.equal(cg,expected);
    N.unlockCG(s,cg);assert.equal(N.dateMoment(s,bars,{affection:8,trust:6}),null);
  }
});

test('previous story saves keep their place and existing album when presentation directions migrate',()=>{
  const s=fresh();const p=N.prepareDay(s,bars,companions);p.cursor=4;delete p.presentationVersion;
  p.frames.forEach(f=>{delete f.cg;delete f.character;});s.story.unlocked=['cafe'];
  const copy=JSON.parse(JSON.stringify(s));assert.ok(N.validateStory(copy.story,copy,bars));
  N.prepareDay(copy,bars,companions);assert.equal(copy.story.packet.cursor,4);assert.deepEqual(copy.story.unlocked,['cafe']);
  assert.equal(copy.story.packet.frames[2].cg,'room-morning');assert.ok(N.validateStory(copy.story,copy,bars));
});

test('all expression replies and a valid date CG survive save/restore; unknown CGs are rejected',()=>{
  for(const sprite of ['calm','happy','sad','panic','shy','angry']) {
    const s=fresh();readDay(s);s.lastEventResult={reply:'あなたの言葉、聞いたよ。',sprite,feedback:'親密度 +2',cg:'cafe'};
    const restored=JSON.parse(JSON.stringify(s));assert.ok(E.validateSave(restored,bars));assert.ok(N.validateStory(restored.story,restored,bars));
    restored.lastEventResult.cg='unknown';assert.equal(N.validateStory(restored.story,restored,bars),false);
  }
});

test('all six expressions have aligned RGBA base, blink, and mouth assets; every location has an empty plate',()=>{
  for(const expression of ['calm','happy','sad','panic','shy','angry']) {
    for(const part of ['rest','blink','talk']) {
      const png=fs.readFileSync(new URL(`../assets/standing/${expression}-${part}.png`,import.meta.url));
      assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1536);assert.equal(png[25],6);
    }
  }
  for(const file of new Set(Object.values(N.BACKGROUNDS))) {
    const png=fs.readFileSync(new URL(`../assets/backgrounds/${file}`,import.meta.url));
    assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
  }
});
