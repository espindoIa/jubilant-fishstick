// Capture the same entry state through tools/play.mjs at both mobile orientations.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const label=process.argv[2]||'capture', out=process.env.POLISH_OUT||'/workspace/shared/downloads/aurora-polimento';
fs.mkdirSync(out,{recursive:true});
for(const [w,h] of [[844,390],[390,844]])for(const q of ['low','high']){
 const name=`${label}-${w}x${h}-${q}`;
 const steps=[
 {until:"window.__game?.mode==='title'",timeout:90000},{key:'Enter'},{wait:400},{key:'Enter'},
 {until:"__game.mode==='field'&&!__game.ui.busy",timeout:90000},{wait:600},
 {eval:"({navigationMs:performance.getEntriesByType('navigation')[0].duration,quality:__game.stage.qualityName,sceneMeshes:(()=>{let n=0;__game.stage.world.traverse(x=>{if(x.isMesh)n++});return n})(),geometries:__game.stage.renderer.info.memory.geometries,textures:__game.stage.renderer.info.memory.textures})"},
 {eval:"new Promise(r=>{let n=0,t=performance.now();function f(now){n++;if(now-t>=3000)r({fps:n*1000/(now-t),frames:n,elapsed:now-t});else requestAnimationFrame(f)}requestAnimationFrame(f)})"},
 {eval:"[...document.querySelectorAll('button,.stick-zone,.obj-chip')].map(e=>{let b=e.getBoundingClientRect();return {label:e.textContent,cls:e.className,x:b.x,y:b.y,w:b.width,h:b.height}})"},
 {shot:name+'-field'},{key:'m'},{wait:300},{shot:name+'-menu'},
 {eval:"[...document.querySelectorAll('.opt,.menu-close')].map(e=>{let b=e.getBoundingClientRect();return{label:e.textContent,x:b.x,y:b.y,w:b.width,h:b.height}})"},
 {key:'Escape'},{eval:"void __game.ui.say({name:'Lio',portrait:'lio'},'A luz da aurora ilumina o caminho. Vamos explorar o mundo juntos.')"},{wait:300},{shot:name+'-dialogue'},
 {key:'Enter'},{key:'Enter'},{eval:"__game.state.set('eco_despertou');void __game.debug.battle(['goticula','cogumelo'],{canRun:true})"},
 {until:"__game.mode==='battle'&&!__game.battleScene.busy",timeout:90000},{wait:300},{shot:name+'-battle'}];
 if(label==='batch4') {
   steps.splice(1,0,{shot:name+'-title'});
   const menuShot = steps.findIndex(s=>s.shot===name+'-menu');
   steps.splice(menuShot+1,0,
     {tapSelector:'.menu-tabs .opt:has-text("Crônica")'},{wait:200},{shot:name+'-chronicle'},{tapSelector:'.menu-close'},
     {tapSelector:'.menu-tabs .opt:has-text("Opções")'},{wait:200},{shot:name+'-options'},{tapSelector:'.menu-main .opt:has-text("Voltar")'},
     {tapSelector:'.menu-tabs .opt:has-text("Status")'},{tapSelector:'.menu-main .opt:has(.nm:text-is("Lio"))'},{wait:200},{shot:name+'-status'},{tapSelector:'.menu-close'}
   );
   steps.push(
     {eval:"const b=__game.battleScene;b.enemies.forEach(e=>e.hp=0);b.checkEnd()"},
     {until:"document.querySelector('.results')",timeout:60000},{shot:name+'-results'},
     {key:'Enter'},{until:"__game.mode==='field'",timeout:60000},
     {eval:"void __game.runScript('loja_vila')"},
     {until:"document.querySelector('.menu-tabs .opt')",tapAt:[w/2,h/2],every:200,timeout:60000},
     {tapSelector:'.menu-tabs .opt:has-text("Comprar")'},{shot:name+'-shop'}
   );
 }
 const spec={url:`/?q=${q}&fast=1&start=vila&party=lio,sena,estela,brann&flags=intro_feita`,width:w,height:h,touch:true,steps};
 const f=`${out}/${name}.json`;fs.writeFileSync(f,JSON.stringify(spec));
 const p=spawnSync(process.execPath,['tools/play.mjs',f],{encoding:'utf8',env:process.env,timeout:240000,maxBuffer:4e6});
 fs.writeFileSync(`${out}/${name}.log`,(p.stdout||'')+(p.stderr||''));
 console.log(name,'exit',p.status);
 if(p.status!==0) process.exit(1);
 for(const f of fs.readdirSync('shots/play'))if(f.includes(name))fs.copyFileSync('shots/play/'+f,out+'/'+f);
}
