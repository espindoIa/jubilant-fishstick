import test from 'node:test';import assert from 'node:assert/strict';
import {buildHouse} from '../../src/render/Buildings.js';
globalThis.document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};
test('all rectangular house walls retain 16 texels per unit',()=>{
 for(const [w,d]of[[4,3],[3,5],[6,2]]){
 const house=buildHouse({x:0,y:0,w,d,h:2,windows:[],chimney:false},0);
 const walls=house.children.filter(o=>o.geometry?.type==='PlaneGeometry').slice(0,4);
 assert.equal(walls.length,4);
 for(const wall of walls){const p=wall.geometry.parameters;assert.equal(wall.material.map.image.width/p.width,16,`wall w=${w} d=${d} rotation=${wall.rotation.y}`);assert.equal(wall.material.map.image.height/p.height,16)}
 }
});
