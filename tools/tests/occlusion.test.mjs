import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {updateOcclusion,OCC} from '../../src/render/occlusion.js';
test('occlusion follows projected actor size across zoom and orientations',()=>{
 for(const [w,h] of [[844,390],[390,844]]) {
 const ratios=[];
 for(const dist of [21,42]) {
 const camera=new THREE.PerspectiveCamera(26,w/h,.5,200);
 camera.position.set(0,dist*Math.sin(38*Math.PI/180),dist*Math.cos(38*Math.PI/180));camera.lookAt(0,0,0);camera.updateMatrixWorld();
 updateOcclusion({camera,renderer:{getDrawingBufferSize:v=>v.set(w,h)}},new THREE.Vector3());
 const a=new THREE.Vector3(0,0,0).project(camera),b=new THREE.Vector3(0,2,0).project(camera);
 ratios.push(OCC.uOccRadius.value/(Math.abs(a.y-b.y)*h/2));
 }
 assert.ok(ratios.every(x=>x>.5&&x<.8));assert.ok(Math.abs(ratios[0]-ratios[1])<.03);
 }
 updateOcclusion(null,null,false);assert.equal(OCC.uOccEnable.value,0);
});
