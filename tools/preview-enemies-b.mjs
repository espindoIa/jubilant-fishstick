// Prévia visual dos inimigos do Forte Ferrugem (src/art/enemies_b.js).
// Uso: node tools/preview-enemies-b.mjs [filtro] [escala]
// Gera em shots/enemies_b/: <id>.png (idle | alt | glow | altGlow | idle+glow)
// e lineup.png (todos lado a lado + Brann de campo para escala).
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Bitmap } from '../src/art/bitmap.js';
import { ENEMY_ART_B } from '../src/art/enemies_b.js';
import { buildFieldFrames } from '../src/art/characters.js';
import { brann } from '../src/art/sprites/brann.js';

const filter = process.argv[2] || '';
const scale = Number(process.argv[3] || 5);
const outDir = path.resolve('shots/enemies_b');
fs.mkdirSync(outDir, { recursive: true });

function writePng(bmp, file, s, bg = [44, 40, 58]) {
  const W = bmp.w * s, H = bmp.h * s;
  const png = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = bmp.get(sx, sy);
      const i = (y * W + x) * 4;
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

// Faixa horizontal alinhada pela base; fundo opcional por quadro.
function strip(frames, gap = 4, bgs = []) {
  const w = frames.reduce((a, f) => a + f.w + gap, gap);
  const h = Math.max(...frames.map((f) => f.h)) + gap * 2;
  const b = new Bitmap(w, h);
  let x = gap;
  frames.forEach((f, i) => {
    const y = gap + (h - gap * 2 - f.h);
    if (bgs[i]) b.rect(x, y, f.w, f.h, bgs[i]);
    b.blit(f, x, y);
    x += f.w + gap;
  });
  return b;
}

// Composição aditiva do brilho (como ficaria em jogo com bloom simples).
function lit(base, glow) {
  const out = base.clone();
  if (!glow) return out;
  for (let y = 0; y < base.h; y++) {
    for (let x = 0; x < base.w; x++) {
      const g = glow.get(x, y);
      if (!g || !g[3]) continue;
      for (const [dx, dy, k] of [[0, 0, 0.5], [1, 0, 0.12], [-1, 0, 0.12], [0, 1, 0.12], [0, -1, 0.12]]) {
        const c = out.get(x + dx, y + dy);
        if (!c || !c[3]) continue;
        out.set(x + dx, y + dy, [Math.min(255, c[0] + g[0] * k), Math.min(255, c[1] + g[1] * k), Math.min(255, c[2] + g[2] * k), 255]);
      }
    }
  }
  return out;
}

function sizeCheck(id, a) {
  const issues = [];
  for (const k of ['alt', 'glow', 'altGlow']) {
    if (a[k] && (a[k].w !== a.idle.w || a[k].h !== a.idle.h)) issues.push(`${k} size mismatch`);
  }
  for (const k of ['idle', 'alt']) {
    const bd = a[k].bounds();
    if (bd.y + bd.h !== a.idle.h && !/drone/.test(id)) issues.push(`${k} bottom gap ${a.idle.h - bd.y - bd.h}`);
    // pixel claro na borda = conteúdo cortado (contorno escuro na borda é ok)
    const B = a[k];
    for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) {
      if (x > 0 && y > 0 && x < B.w - 1 && y < B.h - 1) continue;
      const c = B.get(x, y);
      if (c[3] && c[0] + c[1] + c[2] > 200) { issues.push(`${k} clipped at ${x},${y}`); y = B.h; break; }
    }
  }
  // diferença entre idle e alt
  let diff = 0;
  for (let i = 0; i < a.idle.data.length; i += 4) if (a.idle.data[i + 3] !== a.alt.data[i + 3] || a.idle.data[i] !== a.alt.data[i]) diff++;
  return `${issues.join(', ') || 'ok'}; idle/alt differ in ${diff} px`;
}

const NIGHT = [30, 26, 44, 255];
const all = [];
for (const [id, fn] of Object.entries(ENEMY_ART_B)) {
  const a = fn();
  all.push(a.idle);
  if (filter && !id.includes(filter)) continue;
  const frames = [a.idle, a.alt];
  const bgs = [null, null];
  if (a.glow) { frames.push(a.glow); bgs.push(NIGHT); }
  if (a.altGlow) { frames.push(a.altGlow); bgs.push(NIGHT); }
  frames.push(lit(a.idle, a.glow));
  bgs.push(NIGHT);
  frames.push(lit(a.alt, a.altGlow || a.glow));
  bgs.push(NIGHT);
  const sheet = strip(frames, 4, bgs);
  const s = sheet.w * scale > 2600 ? Math.max(2, Math.floor(2600 / sheet.w)) : scale;
  const file = path.join(outDir, `${id}.png`);
  writePng(sheet, file, s);
  // zoom grande dos dois quadros para inspeção de detalhe
  const zoom = strip([a.idle, a.alt], 2);
  writePng(zoom, path.join(outDir, `${id}_zoom.png`), Math.max(4, Math.floor(1400 / zoom.w)));
  console.log(id.padEnd(12), `${a.idle.w}x${a.idle.h}`, '@' + s + 'x', sizeCheck(id, a));
}

const hero = buildFieldFrames(brann).l0;
const line = strip([...all, hero], 3);
writePng(line, path.join(outDir, 'lineup.png'), Math.max(2, Math.min(4, Math.floor(2600 / line.w))));
console.log('wrote lineup.png', `${line.w}x${line.h}`);
