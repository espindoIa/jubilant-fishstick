import fs from 'node:fs';import{spawnSync}from'node:child_process';
const out='/workspace/shared/downloads/aurora-polimento';
for(const[w,h]of[[844,390],[390,844]])for(const q of['low','high']){
 const name=`cave-trial-${w}x${h}-${q}`,steps=[{until:"window.__game?.mode==='title'",timeout:90000},{key:'Enter'},{key:'Enter'},{until:"__game.mode==='field'&&!__game.ui.busy",timeout:90000},{wait:600},{eval:'__game.paused=true;__game.stage.render(.016)'},{shot:`${name}-base`}];
 for(const ambient of[1.35,1.45])steps.push({eval:`__game.stage.setAtmosphere({...__game.field.atm,ambient:${ambient}});__game.stage.render(.016)`},{shot:`${name}-${ambient}`});
 const f=`${out}/${name}.json`;fs.writeFileSync(f,JSON.stringify({width:w,height:h,touch:true,url:`/?q=${q}&fast=1&start=caverna&party=lio,sena,estela,brann&flags=intro_feita,caverna_entrada,brann_juntou,golem_derrotado`,steps}));
 const p=spawnSync(process.execPath,['tools/play.mjs',f],{encoding:'utf8',timeout:150000,maxBuffer:4e6});fs.writeFileSync(`${out}/${name}.log`,(p.stdout||'')+(p.stderr||''));console.log(name,p.status);if(p.status!==0)process.exit(1);
 for(const f of fs.readdirSync('shots/play'))if(f.includes(name))fs.copyFileSync('shots/play/'+f,out+'/'+f);
}
