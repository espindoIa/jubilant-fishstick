// Pré-visualiza definições de personagem de um módulo qualquer (revisão visual).
// Uso: node tools/preview-defs.mjs src/art/sprites/sena.js [escala]
//   shots/defs/<id>_field.png  -> frente/costas/lado com ciclo de caminhada (+ extras)
//   shots/defs/<id>_battle.png -> poses de batalha (se houver)
//   shots/defs/<id>_compare.png -> ao lado do Lio (referência FF6), frente e lado, em escala real 3x
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import { Bitmap } from '../src/art/bitmap.js';
import { buildFieldFrames, buildBattleFrames } from '../src/art/characters.js';
import { strip, stack } from '../src/art/preview.js';
import { lio } from '../src/art/sprites/lio.js';

const modPath = process.argv[2];
const scale = Number(process.argv[3] || 8);
if (!modPath) throw new Error('uso: node tools/preview-defs.mjs <modulo.js> [escala]');
const mod = await import(pathToFileURL(path.resolve(modPath)).href + '?t=' + Date.now());
const outDir = path.resolve('shots/defs');
fs.mkdirSync(outDir, { recursive: true });

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
  console.log('wrote', file);
}

const defs = Object.values(mod).filter((d) => d && typeof d === 'object' && d.id && d.dir);
for (const def of defs) {
  const f = buildFieldFrames(def);
  const rows = [
    strip(['d0', 'd1', 'd0', 'd2'].map((k) => f[k]).filter(Boolean)),
    strip(['u0', 'u1', 'u0', 'u2'].map((k) => f[k]).filter(Boolean)),
    strip(['l0', 'l1', 'l0', 'l2', 'r0', 'r1'].map((k) => f[k]).filter(Boolean)),
  ];
  const extras = Object.keys(def.extra || {}).map((k) => f[k]);
  if (extras.length) rows.push(strip(extras));
  writePng(stack(rows), path.join(outDir, `${def.id}_field.png`), scale);
  if (def.battle) {
    const b = buildBattleFrames(def);
    writePng(strip(Object.values(b)), path.join(outDir, `${def.id}_battle.png`), Math.max(3, scale - 3));
  }
  const L = buildFieldFrames(lio);
  writePng(strip([L.d0, f.d0, L.l0, f.l0].filter(Boolean), 2), path.join(outDir, `${def.id}_compare.png`), 3, [90, 120, 96]);
}
if (!defs.length) console.log('nenhuma definição (objeto com id e dir) exportada por', modPath);
