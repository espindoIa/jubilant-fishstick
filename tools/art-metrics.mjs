// Métricas de arte: cores únicas, matizes e luminância por textura/sprite.
// Compara a arte de referência (PNGs do SpriteCook/pacote) com texturas geradas em código.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { paintSideAtlas, paintGround } from '../src/art/terrain.js';
import { MAPS } from '../src/data/maps/index.js';
import { normalizeMap } from '../src/render/World.js';

// decodificador PNG mínimo (RGBA 8 bits, sem entrelaçamento)
function readPng(file) {
  const b = fs.readFileSync(file);
  let o = 8, w = 0, h = 0, ct = 6, idat = [], plte = null;
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    if (type === 'PLTE') plte = d;
    if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1;
  const stride = w * bpp, out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, up = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      line[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      if (ct === 6) for (let k = 0; k < 4; k++) out[(y * w + x) * 4 + k] = line[x * 4 + k];
      else if (ct === 2) { for (let k = 0; k < 3; k++) out[(y * w + x) * 4 + k] = line[x * 3 + k]; out[(y * w + x) * 4 + 3] = 255; }
      else { const i = line[x]; out[(y * w + x) * 4] = plte[i * 3]; out[(y * w + x) * 4 + 1] = plte[i * 3 + 1]; out[(y * w + x) * 4 + 2] = plte[i * 3 + 2]; out[(y * w + x) * 4 + 3] = 255; }
    }
    prev = line;
  }
  return { w, h, data: out };
}

function stats(w, h, data) {
  const cols = new Set();
  let lumSum = 0, lumSq = 0, n = 0, dark = 0, edge = 0;
  const hueBins = new Array(12).fill(0);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    if (a < 128) continue;
    cols.add((r << 16) | (g << 8) | b);
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lumSum += l; lumSq += l * l; n++;
    if (l < 40) dark++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn > 18) {
      let hh = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
      hh = ((hh * 60) + 360) % 360;
      hueBins[Math.floor(hh / 30)]++;
    }
  }
  const mean = lumSum / n;
  return { colors: cols.size, lumMean: +mean.toFixed(1), lumStd: +Math.sqrt(lumSq / n - mean * mean).toFixed(1), darkPct: +((100 * dark) / n).toFixed(1), hues: hueBins.filter((x) => x > n * 0.01).length };
}

const rows = [];
const add = (label, s) => rows.push({ label, ...s });
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

// referência: PNGs
const ref = { heroes: 'src/assets/sprites/heroes/lio/field_d0.png', 'heroi-batalha': 'src/assets/sprites/heroes/lio/battle_idle.png', npc: 'src/assets/sprites/npcs/odessa/down.png', 'inimigo-comum': 'src/assets/sprites/enemies/aranha/idle.png', chefe: 'src/assets/sprites/enemies/golem/idle.png', 'prop-arvore': 'src/assets/sprites/props/oak0.png', 'prop-lampiao': 'src/assets/sprites/props/lamp.png' };
for (const [k, f] of Object.entries(ref)) { const p = readPng(f); add('REF  ' + k, stats(p.w, p.h, p.data)); }

// geradas em código
const side = paintSideAtlas();
add('CODE atlas de laterais (penhascos/paredes)', stats(side.w, side.h, side.data));
for (const id of ['vila', 'bosque', 'caverna', 'forte']) {
  const g = paintGround(normalizeMap(MAPS[id]), 7);
  add(`CODE chão ${id}`, stats(g.w, g.h, g.data));
}
console.log('rótulo'.padEnd(46), 'cores  lumMed lumDesv  %escuro  matizes');
for (const r of rows) console.log(r.label.padEnd(46), String(r.colors).padStart(5), String(r.lumMean).padStart(7), String(r.lumStd).padStart(7), String(r.darkPct).padStart(8), String(r.hues).padStart(8));
