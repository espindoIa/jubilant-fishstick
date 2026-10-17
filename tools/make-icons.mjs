// Gera os ícones do app (PWA) a partir do retrato do Lio.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { buildPortrait } from '../src/art/portraits.js';

function icon(size, file, pad = 0.12) {
  const p = buildPortrait('lio', 'happy');
  const png = new PNG({ width: size, height: size });
  const inner = Math.floor(size * (1 - pad * 2));
  const scale = inner / p.w;
  const off = Math.floor(size * pad);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // fundo: céu do entardecer com gradiente radial
      const dx = x / size - 0.5, dy = y / size - 0.42;
      const r = Math.min(1, Math.hypot(dx, dy) * 1.6);
      let c = [Math.round(255 - r * 150), Math.round(168 - r * 120), Math.round(110 - r * 40), 255];
      const sx = Math.floor((x - off) / scale), sy = Math.floor((y - off) / scale);
      if (sx >= 0 && sy >= 0 && sx < p.w && sy < p.h) {
        const q = p.get(sx, sy);
        if (q[3] > 0) c = q;
      }
      png.data.set(c, i);
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}
fs.mkdirSync('public', { recursive: true });
icon(192, 'public/icon-192.png');
icon(512, 'public/icon-512.png');
icon(180, 'public/apple-touch-icon.png');
icon(512, 'public/icon-maskable.png', 0.2);
console.log('ícones gerados');
