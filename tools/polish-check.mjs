import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const label=process.argv[2],out=process.env.POLISH_OUT||'/workspace/shared/downloads/aurora-polimento';
const results=[];
for(const [cmd,args] of [['node',['tools/check-art.mjs']],['npx',['vite','build']],['npm',['run','test:mobile']],['npm',['run','build:single']]]){
 const r=spawnSync(cmd,args,{encoding:'utf8',env:process.env,maxBuffer:8e6,timeout:240000});
 const id=args.join('-').replaceAll('/','-');fs.writeFileSync(`${out}/${label}-${id}.log`,(r.stdout||'')+(r.stderr||''));
 results.push({command:[cmd,...args].join(' '),exit:r.status});console.log(results.at(-1));
 if(r.status!==0){fs.writeFileSync(`${out}/${label}-checks.json`,JSON.stringify(results,null,2));process.exit(1);}
}
results.push({singleHtmlBytes:fs.statSync('dist-single/index.html').size});
fs.writeFileSync(`${out}/${label}-checks.json`,JSON.stringify(results,null,2));
