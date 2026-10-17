// Exporta os sprites de campo dos NPCs para PNG ampliado (revisão visual).
// Uso: node tools/preview-npcs.mjs [filtro] [escala]
//   shots/npcs/npc_<id>.png  -> frente/costas/lado com ciclo de caminhada
//   shots/npcs/lineup.png    -> heróis + NPCs de frente (escala/estilo)
//   shots/npcs/lineup_side.png -> idem, de lado
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Bitmap } from '../src/art/bitmap.js';
import { buildFieldFrames } from '../src/art/characters.js';
import { HEROES } from '../src/art/sprites/index.js';
import { NPCS } from '../src/art/sprites/npcs.js';

const filter = process.argv[2] || '';
const scale = Number(process.argv[3] || 8);
const outDir = path.resolve('shots/npcs');
fs.mkdirSync(outDir, { recursive: true });

function strip(frames, gap = 4, bg = null) {
  const w = frames.reduce((a, f) => a + f.w + gap, gap);
  const h = Math.max(...frames.map((f) => f.h)) + gap * 2;
  const b = new Bitmap(w, h);
  if (bg) b.fill(bg);
  let x = gap;
  for (const f of frames) {
    b.blit(f, x, gap + (h - gap * 2 - f.h));
    x += f.w + gap;
  }
  return b;
}

function stack(bitmaps, gap = 2) {
  const w = Math.max(...bitmaps.map((b) => b.w));
  const h = bitmaps.reduce((a, b) => a + b.h + gap, 0);
  const out = new Bitmap(w, h);
  let y = 0;
  for (const b of bitmaps) {
    out.blit(b, 0, y);
    y += b.h + gap;
  }
  return out;
}

function writePng(bmp, file, s, bg = [58, 62, 74]) {
  const png = new PNG({ width: bmp.w * s, height: bmp.h * s });
  for (let y = 0; y < bmp.h * s; y++) {
    for (let x = 0; x < bmp.w * s; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = bmp.get(sx, sy);
      const i = (y * bmp.w * s + x) * 4;
      const chk = ((Math.floor(sx / 8) + Math.floor(sy / 8)) & 1) ? 6 : 0;
      const a = c[3] / 255;
      png.data[i] = c[0] * a + (bg[0] + chk) * (1 - a);
      png.data[i + 1] = c[1] * a + (bg[1] + chk) * (1 - a);
      png.data[i + 2] = c[2] * a + (bg[2] + chk) * (1 - a);
      png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}

function out(name, bmp, s = scale, bg) {
  const ss = bmp.w * s > 2400 ? Math.max(1, Math.floor(2400 / bmp.w)) : s;
  const file = path.join(outDir, `${name}.png`);
  writePng(bmp, file, ss, bg);
  console.log('wrote', file, `${bmp.w}x${bmp.h} @${ss}x`);
}

// Verificações: largura das linhas = localW, variantes com mesma altura,
// caracteres presentes na paleta, altura total por direção.
function lint(def) {
  const W = def.localW;
  const warn = (m) => console.warn(`  [${def.id}] ${m}`);
  const heights = [];
  for (const [d, part] of Object.entries(def.dir)) {
    const groups = { head: [part.head], torso: [...part.torso, part.torsoB].filter(Boolean), legs: [...part.legs, part.legsB].filter(Boolean) };
    for (const [g, list] of Object.entries(groups)) {
      list.forEach((rows, i) => {
        rows.forEach((r, y) => {
          if (r.length !== W) warn(`${d}.${g}[${i}] linha ${y} tem ${r.length} != ${W}: "${r}"`);
          for (const ch of r) if (ch !== '.' && !(ch in def.palette)) warn(`${d}.${g}[${i}] linha ${y}: cor '${ch}' fora da paleta`);
        });
        if (rows.length !== list[0].length) warn(`${d}.${g}[${i}] altura ${rows.length} != ${list[0].length}`);
      });
    }
    heights.push(`${d}=${part.head.length}+${part.torso[0].length}+${part.legs[0].length}=${part.head.length + part.torso[0].length + part.legs[0].length}`);
  }
  console.log(`${def.id}: ${heights.join('  ')}`);
}

for (const def of NPCS) {
  if (filter && filter !== 'lineup' && !def.id.includes(filter)) continue;
  lint(def);
  const f = buildFieldFrames(def);
  out(`npc_${def.id}`, stack([
    strip(['d0', 'd1', 'd0', 'd2'].map((k) => f[k])),
    strip(['u0', 'u1', 'u0', 'u2'].map((k) => f[k])),
    strip(['l0', 'l1', 'l0', 'l2', 'r0', 'r1'].map((k) => f[k])),
  ]));
}

if (!filter || filter === 'lineup') {
  const all = [...HEROES, ...NPCS];
  out('lineup', strip(all.map((d) => buildFieldFrames(d).d0), 0), 4);
  // duas fileiras ampliadas (heróis + NPCs) para comparar estilo de perto
  const half = Math.ceil(all.length / 2);
  out('lineup_zoom', stack([
    strip(all.slice(0, half).map((d) => buildFieldFrames(d).d0), 0),
    strip(all.slice(half).map((d) => buildFieldFrames(d).d0), 0),
  ], 0), 6);
  out('lineup_zoom_side', stack([
    strip(all.slice(0, half).map((d) => buildFieldFrames(d).l0), 0),
    strip(all.slice(half).map((d) => buildFieldFrames(d).l0), 0),
  ], 0), 6);
  out('lineup_side', strip(all.map((d) => buildFieldFrames(d).l0), 0), 4);
  out('lineup_back', strip(all.map((d) => buildFieldFrames(d).u0), 0), 4);
  // tamanho "real" (2x) sobre fundo de areia/grama para checar leitura
  out('lineup_ground', strip(all.map((d) => buildFieldFrames(d).d0), 0, [120, 150, 84, 255]), 2);
}
