// Stability regression tests; source-method checks avoid browser/WebGL setup.
// Run: node --test tools/tests/stability.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { HERO_DATA } from '../../src/data/heroes.js';
import { GameState } from '../../src/game/state.js';
import { SCRIPTS } from '../../src/data/story.js';
import { ALL_SHARDS, shardFlag } from '../../src/data/shards.js';
import { MAPS } from '../../src/data/maps/index.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = p => fs.readFileSync(root + p, 'utf8');
function method(file, start, end, scope = {}) {
  const s = source(file), a = s.indexOf(start), b = s.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, 'method extraction anchors still match');
  return Function(...Object.keys(scope), `return ({ ${s.slice(a, b)} });`)(...Object.values(scope));
}
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return {promise, resolve}; };
function ctx(state) {
 return {state, sfx(){}, flash:async()=>{}, say:async()=>{}, set:(k,v=true)=>state.set(k,v), flag:k=>state.flag(k), give:(k,n)=>state.addItem(k,n), ui:{toast(){}}};
}
test('corrupt save with missing location must be rejected instead of accepted as resumable', () => {
 globalThis.localStorage = { getItem: () => JSON.stringify({v:1, party:['lio'], heroes:{}, mapId:'vila'}) };
 assert.equal(GameState.load(), null);
});
test('save must not replace the settings defaults with null', () => {
 const original = new GameState(); original.addHero('lio'); original.mapId='vila'; original.pos={x:10,y:10};
 const s = GameState.fromJSON({...original.toJSON(),settings:null});
 assert.equal(typeof s.settings?.music, 'number');
});
test('invalid debug hero id should not reject newGame', async () => {
 const {newGame} = method('src/game/Game.js', '  async newGame(', '\n  async continueGame(', {GameState,HERO_DATA,MAPS:{vila:{}}});
 const g = {params:new URLSearchParams('start=vila&party=unknown'),changeMap:async()=>{},runScript:async()=>{}};
 await assert.doesNotReject(() => newGame.call(g));
 assert(g.state.party.every(id => g.state.heroes[id]));
});
test('invalid debug level must yield finite healthy hero stats', async () => {
 const {newGame} = method('src/game/Game.js', '  async newGame(', '\n  async continueGame(', {GameState,HERO_DATA,MAPS:{vila:{}}});
 const g = {params:new URLSearchParams('start=vila&party=lio&lv=oops'),changeMap:async()=>{},runScript:async()=>{}};
 await newGame.call(g);
 assert(Number.isFinite(g.state.stats('lio').hp));
});
test('collecting third shard twice must give milestone reward once', async () => {
 const s = new GameState();
 for (const sh of ALL_SHARDS.slice(0,2)) s.set(shardFlag(sh.id));
 const run = SCRIPTS['shard_'+ALL_SHARDS[2].id];
 await run(ctx(s)); await run(ctx(s));
 assert.equal(s.inventory.hipocao, 2);
});
test('concurrent collections of sixth shard must give one necklace', async () => {
 const s = new GameState();
 for (const sh of ALL_SHARDS.slice(0,5)) s.set(shardFlag(sh.id));
 const run = SCRIPTS['shard_'+ALL_SHARDS[5].id];
 await Promise.all([run(ctx(s)),run(ctx(s))]);
 assert.equal(s.inventory.colar_aurora, 1);
});
test('finishing one overlapping script must not release script mode', async () => {
 class ScriptContext { constructor(g){this.game=g;} release(){} }
 const {runScript} = method('src/game/Game.js', '  async runScript(', '\n  // -------------------------------------------------------------- batalha', {ScriptContext,SCRIPTS:{}});
 const g = {mode:'field',field:{locked:0},touch:{show(){}}};
 const a=deferred(), b=deferred();
 const first=runScript.call(g,()=>a.promise), second=runScript.call(g,()=>b.promise);
 a.resolve(); await first;
 const modeBeforeSecondFinishes=g.mode;
 b.resolve(); await second;
 assert.equal(modeBeforeSecondFinishes,'script');
});
test('battle must preserve field resources until field is actually discarded', () => {
 const txt=source('src/render/Stage.js');
 const disposeTree=Function('return function disposeTree'+txt.split('export function disposeTree')[1])();
 const {setWorld}=method('src/render/Stage.js','  setWorld(', '\n  // luzes pontuais', {disposeTree});
 const field=new THREE.Group(), arena=new THREE.Group();
 const geometry=new THREE.PlaneGeometry(), material=new THREE.MeshBasicMaterial();
 field.add(new THREE.Mesh(geometry,material));
 let disposals=0; geometry.addEventListener('dispose',()=>disposals++); material.addEventListener('dispose',()=>disposals++);
 const stage={scene:new THREE.Scene(),world:field}; stage.scene.add(field);
 const call=source('src/battle/Battle.js').match(/this\.stage\.setWorld\(W\.group(?:, (\{[^}]+\}))?\);/);
 assert(call);
 const options=call[1] ? Function('return ('+call[1]+')')() : {};
 setWorld.call(stage,arena,options);
 assert.equal(disposals,0);
});
test('repeat group healing must include allies revived after previous cast', () => {
 const {repeatable}=method('src/battle/Battle.js','  repeatable(', '\n  finishCmd(', {ITEMS:{}});
 const caster={id:'sena',side:'hero',hp:100,mp:50}, revived={id:'lio',side:'hero',hp:20};
 const skill={name:'Cura total',mp:5,target:'allies'};
 const b={lastAction:{sena:{actor:caster,type:'skill',skill,targets:[caster]}},enemies:[{side:'enemy',hp:10}],heroes:[caster,revived]};
 assert.deepEqual(repeatable.call(b,caster).act().targets,[caster,revived]);
});
test('repeat revive item must not offer a living ally as its KO target', () => {
 const ITEMS={pena:{name:'Pena',target:'ally_ko',effect:{revive:0.3}}};
 const {repeatable}=method('src/battle/Battle.js','  repeatable(', '\n  finishCmd(', {ITEMS});
 const caster={id:'sena',side:'hero',hp:100,mp:50}, revived={id:'lio',side:'hero',hp:20};
 const b={lastAction:{sena:{actor:caster,type:'item',item:'pena',targets:[revived]}},enemies:[{side:'enemy',hp:10}],heroes:[caster,revived],state:{inventory:{pena:1}}};
 const rep=repeatable.call(b,caster);
 assert(rep===null || rep.act().targets.every(t=>t.hp<=0));
});
test('map interactables must receive the same margin shift as art and actors', () => {
 const txt=source('src/render/World.js');
 const a=txt.indexOf('export function normalizeMap'), b=txt.indexOf('\nfunction pickVariant',a);
 const normalizeMap=Function('hash2','pickVariant','return '+txt.slice(a,b).replace('export ',''))(()=>0.5,x=>x);
 for (const [id, original] of Object.entries(MAPS)) {
   const before = original.interactables.map(o=>({...o}));
   const normalized=normalizeMap(original);
   for (let i=0; i<before.length; i++) {
     assert.equal(normalized.interactables[i].x,before[i].x+normalized.margin,id+' interactable x');
     assert.equal(normalized.interactables[i].y,before[i].y+normalized.margin,id+' interactable y');
     assert.deepEqual(original.interactables[i],before[i],id+' source is unchanged');
   }
 }
});
test('field update must not start encounters or triggers after an interaction locks field', () => {
 const {update}=method('src/field/Field.js','  update(dt)', '\n  pushTrail(', {updateOcclusion(){}});
 const calls=[];
 const g={mode:'field',ui:{busy:false},input:{consume:k=>k==='confirm',move:()=>({x:0,y:0})}};
 const f={game:g,time:0,invuln:1,locked:0,player:{moving:false,position:{}},enemies:[],world:{updaters:[]},stage:{setCameraTarget(){}},focusPoint(){},updateHint(){},updateFollowers(){},updateNpcs(){},updateActors(){},
 interact(){this.locked++;g.mode='script';},updateEnemies(){calls.push('encounter');},checkExits(){calls.push('exit');},checkTriggers(){calls.push('trigger');}};
 update.call(f,0.016);
 assert.deepEqual(calls,[]);
});
