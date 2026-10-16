// Prévia dos inimigos (lote A): cada inimigo em idle/alt/glow ampliado,
// mais uma linha de comparação com um herói para escala.
// Uso: node tools/preview-enemies-a.mjs [filtro] [escala]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Bitmap } from '../src/art/bitmap.js';
import { ENEMY_ART_A } from '../src/art/enemies_a.js';
import { buildFieldFrames, buildBattleFrames } from '../src/art/characters.js';
import { lio } from '../src/art/sprites/lio.js';

// modo zoom: node tools/preview-enemies-a.mjs zoom <nome> [idle|alt|glow|altGlow] [escala]
if (process.argv[2] === 'zoom') {
  const [, , , name, frame = 'idle', sc = '16'] = process.argv;
  const bmp = ENEMY_ART_A[name]()[frame];
  const s = Number(sc);
  const png = new PNG({ width: bmp.w * s, height: bmp.h * s });
  for (let y = 0; y < bmp.h * s; y++) for (let x = 0; x < bmp.w * s; x++) {
    const sx = Math.floor(x / s), sy = Math.floor(y / s);
    const c = bmp.get(sx, sy);
    const i = (y * bmp.w * s + x) * 4;
    const grid = x % s === 0 || y % s === 0 ? 12 : 0;
    const chk = (sx + sy) & 1 ? 66 : 58;
    const a = c[3] / 255;
    png.data[i] = c[0] * a + (chk + grid) * (1 - a);
    png.data[i + 1] = c[1] * a + (chk + grid) * (1 - a);
    png.data[i + 2] = c[2] * a + (chk + 12 + grid) * (1 - a);
    png.data[i + 3] = 255;
  }
  fs.mkdirSync('shots/enemies_a', { recursive: true });
  const out = path.resolve(`shots/enemies_a/_zoom_${name}_${frame}.png`);
  fs.writeFileSync(out, PNG.sync.write(png));
  console.log(out);
  process.exit(0);
}

const filter = process.argv[2] || '';
const scale = Number(process.argv[3] || 6);
const outDir = path.resolve('shots/enemies_a');
fs.mkdirSync(outDir, { recursive: true });

function writePng(bmp, file, s, bg = [58, 62, 74], checker = true) {
  const png = new PNG({ width: bmp.w * s, height: bmp.h * s });
  for (let y = 0; y < bmp.h * s; y++) {
    for (let x = 0; x < bmp.w * s; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = bmp.get(sx, sy);
      const i = (y * bmp.w * s + x) * 4;
      const chk = checker && ((Math.floor(sx / 8) + Math.floor(sy / 8)) & 1) ? 6 : 0;
      const a = c[3] / 255;
      png.data[i] = c[0] * a + (bg[0] + chk) * (1 - a);
      png.data[i + 1] = c[1] * a + (bg[1] + chk) * (1 - a);
      png.data[i + 2] = c[2] * a + (bg[2] + chk) * (1 - a);
      png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}

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

// glow sobre fundo escuro (para ver a máscara)
function onDark(bmp, bg = [16, 14, 24, 255]) {
  const b = new Bitmap(bmp.w, bmp.h).fill(bg);
  b.blit(bmp);
  return b;
}

// composição idle + brilho aditivo aproximado (como o bloom deixaria)
function withBloom(bmp, glow) {
  const b = bmp.clone();
  if (!glow) return b;
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const g = glow.get(x, y);
      if (!g || !g[3]) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const d = Math.abs(dx) + Math.abs(dy);
          if (d === 0) continue;
          const t = 0.16 / d;
          const c = b.get(x + dx, y + dy);
          if (!c) continue;
          const k = c[3] ? 1 : 0;
          b.set(x + dx, y + dy, [
            Math.min(255, c[0] * k + g[0] * t),
            Math.min(255, c[1] * k + g[1] * t),
            Math.min(255, c[2] * k + g[2] * t),
            c[3] ? 255 : Math.round(255 * t * 1.6),
          ]);
        }
      }
    }
  }
  return b;
}

const made = {};
for (const [name, fn] of Object.entries(ENEMY_ART_A)) {
  const art = fn();
  made[name] = art;
  if (filter && !name.includes(filter)) continue;
  const { idle, alt, glow, altGlow } = art;
  if (idle.w !== alt.w || idle.h !== alt.h) console.warn('!! tamanho diferente entre idle/alt', name);
  const frames = [idle, alt];
  if (glow) frames.push(onDark(glow));
  if (altGlow) frames.push(onDark(altGlow));
  if (glow) frames.push(onDark(withBloom(idle, glow)));
  const sheet = strip(frames, 3);
  const s = sheet.w * scale > 2000 ? Math.max(2, Math.floor(2000 / sheet.w)) : scale;
  const file = path.join(outDir, `${name}.png`);
  writePng(sheet, file, s);
  console.log('wrote', file, `${idle.w}x${idle.h}`, glow ? '(glow)' : '');
}

// Lineups com o herói para escala (fundos de bioma)
const hero = buildBattleFrames(lio).idle;
const heroField = buildFieldFrames(lio).l0;
const FOREST = ['goticula', 'cogumelo', 'lobo', 'vespa', 'cao_ferro'];
const CAVE = ['morcego', 'lodo', 'aranha', 'tatu', 'golem'];
function lineup(names, bg) {
  const fr = names.filter((n) => made[n]).map((n) => made[n].idle);
  const fr2 = names.filter((n) => made[n]).map((n) => made[n].alt);
  const top = strip([...fr, heroField, hero], 4, bg);
  const bot = strip([...fr2, heroField, hero], 4, bg);
  const b = new Bitmap(top.w, top.h + bot.h).fill(bg);
  b.blit(top, 0, 0);
  b.blit(bot, 0, top.h);
  return b;
}
const lf = lineup(FOREST, [44, 58, 62, 255]);
writePng(lf, path.join(outDir, '_lineup_forest.png'), 4, [0, 0, 0], false);
writePng(lf, path.join(outDir, '_lineup_forest_1x.png'), 1, [0, 0, 0], false);
const lc = lineup(CAVE, [40, 30, 56, 255]);
writePng(lc, path.join(outDir, '_lineup_cave.png'), 4, [0, 0, 0], false);
writePng(lc, path.join(outDir, '_lineup_cave_1x.png'), 1, [0, 0, 0], false);
console.log('lineups ok');
