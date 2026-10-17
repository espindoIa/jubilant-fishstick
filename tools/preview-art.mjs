// Exporta folhas de arte do jogo para PNG ampliado (revisão visual).
// Uso: node tools/preview-art.mjs [filtro] [escala]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Bitmap } from '../src/art/bitmap.js';
import { buildPreviewSheets } from '../src/art/preview.js';

const filter = process.argv[2] || '';
const scale = Number(process.argv[3] || 6);
const outDir = path.resolve('shots/art');
fs.mkdirSync(outDir, { recursive: true });

function writePng(bmp, file, s, bg = [58, 62, 74]) {
  const png = new PNG({ width: bmp.w * s, height: bmp.h * s });
  for (let y = 0; y < bmp.h * s; y++) {
    for (let x = 0; x < bmp.w * s; x++) {
      const sx = Math.floor(x / s), sy = Math.floor(y / s);
      const c = bmp.get(sx, sy);
      const i = (y * bmp.w * s + x) * 4;
      // fundo xadrez suave para enxergar transparência
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

const sheets = await buildPreviewSheets();
for (const [name, bmp] of Object.entries(sheets)) {
  if (filter && !name.includes(filter)) continue;
  if (!(bmp instanceof Bitmap)) continue;
  const s = bmp.w * scale > 2400 ? Math.max(1, Math.floor(2400 / bmp.w)) : scale;
  const file = path.join(outDir, `${name}.png`);
  writePng(bmp, file, s);
  console.log('wrote', file, `${bmp.w}x${bmp.h} @${s}x`);
}
