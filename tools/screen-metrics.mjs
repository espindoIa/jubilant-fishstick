// Screenshot luminance statistics; 8-bit sRGB luma (not physical luminance).
import fs from 'node:fs';
import {PNG} from 'pngjs';
const rows=[];
for(const file of process.argv.slice(2)){
 const {width,height,data}=PNG.sync.read(fs.readFileSync(file));const bins=Array(16).fill(0);let sum=0,sq=0,dark=0,bright=0;
 for(let i=0;i<data.length;i+=4){const l=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];sum+=l;sq+=l*l;if(l<16)dark++;if(l>245)bright++;bins[Math.min(15,Math.floor(l/16))]++;}
 const n=width*height,mean=sum/n;rows.push({file,width,height,mean:+mean.toFixed(2),std:+Math.sqrt(sq/n-mean*mean).toFixed(2),darkPct:+(dark/n*100).toFixed(2),brightPct:+(bright/n*100).toFixed(2),histogram:bins});
}
console.log(JSON.stringify(rows,null,2));
