// WCAG relative luminance; panel endpoint composites conservatively over white.
import fs from 'node:fs';
const css=fs.readFileSync(process.argv[2] || 'src/ui/ui.css','utf8');
const hex=s=>s.match(/\w\w/g).map(v=>parseInt(v,16));
const lum=c=>c.map(x=>x/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const lastVar=(key)=>[...css.matchAll(new RegExp('--'+key+':\\s*([^;]+);','g'))].at(-1)[1].trim();
const color=s=>{if(s.startsWith('#'))return hex(s.slice(1));const v=s.match(/[\d.]+/g).map(Number);return v.slice(0,3).map(x=>x*(v[3]??1)+255*(1-(v[3]??1)))};
const bg=color(lastVar('win-top'));
const pairs=[['disabled',color(css.includes('--disabled:') ? lastVar('disabled') : '#6c7096')],['white',hex('ffffff')],['muted',color(lastVar('muted'))],['gold',color(lastVar('gold'))],['danger',color(lastVar('danger'))]];
console.log(JSON.stringify({background:bg,ratios:pairs.map(([label,c])=>({label,ratio:+ratio(c,bg).toFixed(2),pass:ratio(c,bg)>=4.5}))},null,2));
