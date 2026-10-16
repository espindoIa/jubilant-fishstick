// Exporta os retratos de diálogo (todas as expressões) para PNG ampliado.
// Uso: node tools/preview-portraits.mjs [filtro] [escala]
//   filtro: parte do id (ex.: "lio") — vazio = todos
//   escala: fator de ampliação dos PNGs individuais (padrão 6)
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { buildPortrait, portraitExpressions, PORTRAIT_IDS, PORTRAIT_SIZE } from '../src/art/portraits.js';

const filter = process.argv[2] || '';
const scale = Number(process.argv[3] || 6);
const outDir = path.resolve('shots/portraits');
fs.mkdirSync(outDir, { recursive: true });

const BG = [104, 106, 114]; // cinza médio neutro

// Desenha um Bitmap em um PNG (vizinho mais próximo) na posição (ox, oy).
function drawInto(png, bmp, ox, oy, s) {
  for (let y = 0; y < bmp.h * s; y++) {
    for (let x = 0; x < bmp.w * s; x++) {
      const c = bmp.get(Math.floor(x / s), Math.floor(y / s));
      const a = c[3] / 255;
      const px = ox + x, py = oy + y;
      if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue;
      const i = (py * png.width + px) * 4;
      png.data[i] = c[0] * a + png.data[i] * (1 - a);
      png.data[i + 1] = c[1] * a + png.data[i + 1] * (1 - a);
      png.data[i + 2] = c[2] * a + png.data[i + 2] * (1 - a);
      png.data[i + 3] = 255;
    }
  }
}

function blankPng(w, h, bg = BG) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    png.data[i * 4] = bg[0];
    png.data[i * 4 + 1] = bg[1];
    png.data[i * 4 + 2] = bg[2];
    png.data[i * 4 + 3] = 255;
  }
  return png;
}

const ids = PORTRAIT_IDS.filter((id) => !filter || id.includes(filter));
const S = PORTRAIT_SIZE;

for (const id of ids) {
  for (const ex of portraitExpressions(id)) {
    const bmp = buildPortrait(id, ex);
    const png = blankPng(S * scale, S * scale);
    drawInto(png, bmp, 0, 0, scale);
    const file = path.join(outDir, `${id}_${ex}.png`);
    fs.writeFileSync(file, PNG.sync.write(png));
    console.log('wrote', file);
  }
}

// Folha de contato: uma linha por personagem, uma coluna por expressão.
const cs = Math.max(1, Math.min(scale, 4));
const gap = 4 * cs;
const cols = Math.max(...ids.map((id) => portraitExpressions(id).length));
const sheet = blankPng(gap + cols * (S * cs + gap), gap + ids.length * (S * cs + gap), [72, 74, 84]);
ids.forEach((id, r) => {
  portraitExpressions(id).forEach((ex, c) => {
    const ox = gap + c * (S * cs + gap);
    const oy = gap + r * (S * cs + gap);
    // célula cinza média por trás de cada retrato
    for (let y = 0; y < S * cs; y++) {
      for (let x = 0; x < S * cs; x++) {
        const i = ((oy + y) * sheet.width + ox + x) * 4;
        sheet.data[i] = BG[0];
        sheet.data[i + 1] = BG[1];
        sheet.data[i + 2] = BG[2];
      }
    }
    drawInto(sheet, buildPortrait(id, ex), ox, oy, cs);
  });
});
const sheetFile = path.join(outDir, filter ? `contact_${filter}.png` : 'contact_sheet.png');
fs.writeFileSync(sheetFile, PNG.sync.write(sheet));
console.log('wrote', sheetFile, `@${cs}x`);
