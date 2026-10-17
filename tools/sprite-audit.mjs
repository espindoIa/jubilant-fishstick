import fs from 'node:fs';
import {PNG} from 'pngjs';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const rows=[];
for(const file of walk('src/assets/sprites').filter(f=>/field_[dul][012]\.png$|battle_idle\.png$|npcs\/.*\/idle\.png$/.test(f))){
 const p=PNG.sync.read(fs.readFileSync(file));let x0=p.width,y0=p.height,x1=-1,y1=-1,partial=0;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){let a=p.data[(y*p.width+x)*4+3];if(a>0&&a<255)partial++;if(a>=128){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}}
 rows.push({file,width:p.width,height:p.height,opaqueWidth:x1-x0+1,opaqueHeight:y1-y0+1,feetMargin:p.height-1-y1,partialAlpha:partial});
}
console.log(JSON.stringify(rows,null,2));
