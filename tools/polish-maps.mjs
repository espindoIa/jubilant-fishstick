import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const label=process.argv[2],out='/workspace/shared/downloads/aurora-polimento';
for(const [w,h] of [[844,390],[390,844]])for(const q of ['low','high']){
 const name=`${label}-${w}x${h}-${q}`,steps=[{until:"window.__game?.mode==='title'",timeout:90000},{key:'Enter'},{key:'Enter'},{until:"__game.mode==='field'&&!__game.ui.busy",timeout:90000}];
 for(const id of ['vila','bosque','caverna','forte','casa'])steps.push({eval:`void __game.changeMap('${id}')`},{until:`__game.field.mapId==='${id}'&&__game.mode==='field'&&!__game.ui.busy`,timeout:90000},{wait:600},{shot:`${name}-${id}`},{eval:"({map:__game.field.mapId,quality:__game.stage.qualityName,textures:__game.stage.renderer.info.memory.textures,drawCalls:__game.stage.renderer.info.render.calls})"});
 const spec={width:w,height:h,touch:true,url:`/?q=${q}&fast=1&start=vila&party=lio,sena,estela,brann&flags=intro_feita,forte_entrada,caverna_entrada,bosque_entrada,estrela_caiu,cap2,ataque_fim,brann_juntou,golem_derrotado,odessa_resgatada,varek_derrotado`,steps};
 const f=`${out}/${name}.json`;fs.writeFileSync(f,JSON.stringify(spec));const p=spawnSync(process.execPath,['tools/play.mjs',f],{encoding:'utf8',timeout:300000,maxBuffer:4e6});fs.writeFileSync(`${out}/${name}.log`,(p.stdout||'')+(p.stderr||''));console.log(name,p.status);if(p.status!==0)process.exit(1);
 for(const f of fs.readdirSync('shots/play'))if(f.includes(name))fs.copyFileSync('shots/play/'+f,out+'/'+f);
}
