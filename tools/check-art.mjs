// Verificação rápida (Node): gera toda a arte e valida mapas/dados do jogo.
import { buildFieldFrames, buildBattleFrames } from '../src/art/characters.js';
import { HEROES } from '../src/art/sprites/index.js';
import { NPCS } from '../src/art/sprites/npcs.js';
import { ENEMY_ART_A } from '../src/art/enemies_a.js';
import { ENEMY_ART_B } from '../src/art/enemies_b.js';
import { PORTRAIT_IDS, buildPortrait, portraitExpressions } from '../src/art/portraits.js';
import { buildProps } from '../src/art/props.js';
import { paintSideAtlas } from '../src/art/terrain.js';
import { SKILLS, DUAL_TECHS } from '../src/data/skills.js';
import { HERO_DATA } from '../src/data/heroes.js';
import { ITEMS } from '../src/data/items.js';

let errors = 0;
const fail = (m) => {
  errors++;
  console.error('✗', m);
};

for (const d of [...HEROES, ...NPCS]) {
  const f = buildFieldFrames(d);
  for (const k of ['d0', 'd1', 'd2', 'u0', 'u1', 'u2', 'l0', 'l1', 'l2', 'r0', 'r1', 'r2']) if (!f[k]) fail(`${d.id}: frame ${k} ausente`);
  if (!d.ink && !d.mats) fail(`${d.id}: sem contorno (ink ou mapa de materiais)`);
  // a cabeça não pode "pular" ao virar: mesma altura de cabeça em todas as direções
  const hh = Object.values(d.dir).map((p) => p.head.length);
  if (new Set(hh).size > 1) fail(`${d.id}: alturas de cabeça diferentes entre direções (${hh.join('/')})`);
  // alturas iguais dentro do ciclo de caminhada
  for (const [dir, p] of Object.entries(d.dir)) {
    const ts = [...p.torso, ...(p.torsoB ? [p.torsoB] : [])].filter(Boolean).map((t) => t.length);
    if (new Set(ts).size > 1) fail(`${d.id}/${dir}: torsos com alturas diferentes (${ts.join('/')})`);
  }
}
for (const d of HEROES) {
  const b = buildBattleFrames(d);
  for (const k of ['idle', 'windup', 'attack', 'cast', 'hurt', 'kneel', 'ko', 'win']) if (!b[k]) fail(`${d.id}: pose de batalha ${k} ausente`);
  const hd = HERO_DATA[d.id];
  for (const lv of Object.keys(hd.learn)) for (const s of hd.learn[lv]) if (!SKILLS[s]) fail(`${d.id}: técnica ${s} inexistente`);
  for (const slot of ['weapon', 'armor']) if (!ITEMS[hd.equip[slot]]) fail(`${d.id}: equipamento ${hd.equip[slot]} inexistente`);
}
for (const [k, d] of Object.entries(DUAL_TECHS)) for (const u of d.users) if (!HERO_DATA[u]) fail(`dupla ${k}: herói ${u}`);

const ART = { ...ENEMY_ART_A, ...ENEMY_ART_B };

for (const [k, fn] of Object.entries(ART)) {
  const r = fn();
  if (!r.idle || !r.alt) fail(`inimigo ${k}: frames ausentes`);
  if (r.alt && (r.alt.w !== r.idle.w || r.alt.h !== r.idle.h)) fail(`inimigo ${k}: tamanhos diferentes`);
}
for (const id of PORTRAIT_IDS) for (const e of portraitExpressions(id)) {
  const p = buildPortrait(id, e);
  if (p.w !== 48 || p.h !== 48) fail(`retrato ${id}/${e}: tamanho ${p.w}x${p.h}`);
}
const props = buildProps();
if (Object.keys(props).length < 30) fail('props insuficientes');
paintSideAtlas();
console.log(errors ? `${errors} erro(s)` : `ok — ${HEROES.length} heróis, ${NPCS.length} NPCs, ${Object.keys(ART).length} inimigos, ${PORTRAIT_IDS.length} retratos, ${Object.keys(props).length} props`);
process.exit(errors ? 1 : 0);
