import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('results wait accepts a tap, keeps a scroll gesture open and removes listeners', async()=>{
 const s=fs.readFileSync(new URL('../../src/battle/Battle.js',import.meta.url),'utf8');
 const a=s.indexOf('  waitTap('),z=s.indexOf('\n  async defeat(',a);
 const events=new Map();let controller,finished=false;
 const win={addEventListener:(k,f)=>events.set(k,f),removeEventListener:(k,f)=>{if(events.get(k)===f)events.delete(k)}};
 const {waitTap}=Function('TIME','window','return ({'+s.slice(a,z)+'})')({scale:1},win);
 const promise=waitTap.call({ui:{push:c=>controller=c,pop:c=>assert.equal(c,controller)}},0).then(()=>finished=true);
 events.get('pointerdown')({pointerId:1,clientX:0,clientY:100});events.get('pointerup')({pointerId:1,clientX:0,clientY:0});
 await Promise.resolve();assert.equal(finished,false);
 events.get('pointerdown')({pointerId:2,clientX:10,clientY:10});events.get('pointerup')({pointerId:2,clientX:10,clientY:10});
 await promise;assert.equal(finished,true);assert.equal(events.size,0);
});
