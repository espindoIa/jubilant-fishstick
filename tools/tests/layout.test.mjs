import test from 'node:test';
import assert from 'node:assert/strict';
import {placeFloating,intersects} from '../../src/ui/layout.js';
for(const [width,height] of [[844,390],[390,844]])test(`four tags stay within safe bounds and outside panels ${width}x${height}`,()=>{
 const bounds={left:44,right:width-12,top:24,bottom:height-20};
 const obstacles=[{x:44,y:24,w:150,h:24},{x:width-200,y:height-130,w:188,h:110}];
 for(let i=0;i<4;i++){
  const r=placeFloating({x:-100,y:-100},{w:145,h:54},bounds,obstacles);
  assert(r.x>=bounds.left&&r.x+r.w<=bounds.right&&r.y>=bounds.top&&r.y+r.h<=bounds.bottom);
  assert(!obstacles.some(o=>intersects(o,r)));
  obstacles.push(r);
 }
});
