// "Escultura" de pixel art: formas volumétricas (esferas, cilindros) sombreadas
// com luz direcional e quantizadas em rampas de cor, depois contornadas.
import { Bitmap, hexToRgb, hash2, mix, BAYER4 } from './bitmap.js';
import { valueNoise } from './noise.js';

export const LIGHT = norm([-0.55, -0.65, 0.55]); // x direita, y baixo, z para o observador

function norm(v) {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
}

// Escolhe índice da rampa a partir de intensidade 0..1 (rampa do claro ao escuro)
export function rampIndex(intensity, n, x = 0, y = 0, dither = 0) {
  let v = (1 - intensity) * (n - 1);
  if (dither) v += (BAYER4[y & 3][x & 3] - 0.5) * dither;
  return Math.max(0, Math.min(n - 1, Math.round(v)));
}

// Desenha um "blob" esférico (elipse) sombreado.
export function blob(bmp, cx, cy, rx, ry, ramp, opts = {}) {
  const cols = ramp.map((c) => (typeof c === 'string' ? hexToRgb(c) : c));
  const { bumpy = 0, seed = 1, ambient = 0.18, dither = 0, rim = 0 } = opts;
  for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) {
    for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      let r2 = dx * dx + dy * dy;
      if (bumpy) {
        const ang = Math.atan2(dy, dx);
        const b = valueNoise(Math.cos(ang) * 3 + seed, Math.sin(ang) * 3 + seed * 2, seed) - 0.5;
        r2 -= b * bumpy;
      }
      if (r2 > 1) continue;
      const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, dx * dx + dy * dy)));
      const n = norm([dx, dy, nz + 0.001]);
      let d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      let lum = ambient + (1 - ambient) * Math.max(0, d);
      if (rim && r2 > 0.82 && dy > 0.2) lum = Math.max(lum, rim);
      bmp.set(x, y, cols[rampIndex(lum, cols.length, x, y, dither)]);
    }
  }
}

// Copa de árvore: vários blobs empilhados com textura de folhas.
export function canopy(bmp, cx, cy, w, h, ramp, seed = 1, opts = {}) {
  const cols = ramp.map((c) => (typeof c === 'string' ? hexToRgb(c) : c));
  const count = opts.count || 9;
  const clusters = [];
  for (let i = 0; i < count; i++) {
    const a = hash2(i, seed, 11) * Math.PI * 2;
    const rr = Math.sqrt(hash2(i, seed, 12));
    const px = cx + Math.cos(a) * rr * w * 0.32;
    const py = cy + Math.sin(a) * rr * h * 0.3 - (1 - rr) * 2;
    const r = (Math.min(w, h) * (0.22 + hash2(i, seed, 13) * 0.12));
    clusters.push([px, py, r]);
  }
  clusters.push([cx, cy, Math.min(w, h) * 0.38]);
  // desenha de trás (cima) para frente (baixo)
  clusters.sort((a, b) => a[1] - b[1]);
  for (const [px, py, r] of clusters) {
    leafBall(bmp, px, py, r, r * 0.92, cols, seed + Math.floor(px * 7 + py * 13));
  }
}

function leafBall(bmp, cx, cy, rx, ry, cols, seed) {
  for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) {
    for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const ang = Math.atan2(dy, dx);
      // borda recortada em "folhas"
      const scallop = Math.sin(ang * 7 + seed) * 0.08 + (valueNoise(ang * 2 + seed, 0, seed) - 0.5) * 0.18;
      const r2 = dx * dx + dy * dy;
      if (r2 > 1 + scallop) continue;
      const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, r2)));
      const n = norm([dx, dy, nz + 0.05]);
      const d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      let lum = 0.12 + 0.88 * Math.max(0, d);
      // micro-textura de folhas (aglomerados de 2x2)
      const leaf = valueNoise(x / 1.7 + seed, y / 1.5, seed + 5);
      lum += (leaf - 0.5) * 0.32;
      bmp.set(x, y, cols[rampIndex(lum, cols.length)]);
    }
  }
}

// Cilindro vertical (troncos, postes, barris)
export function cylinder(bmp, x0, y0, w, h, ramp, opts = {}) {
  const cols = ramp.map((c) => (typeof c === 'string' ? hexToRgb(c) : c));
  const { taper = 0, bark = false, seed = 3 } = opts;
  for (let y = y0; y < y0 + h; y++) {
    const t = (y - y0) / Math.max(1, h - 1);
    const ww = Math.max(1, w * (1 - taper * (1 - t)));
    const xs = x0 + (w - ww) / 2;
    for (let x = Math.floor(xs); x < Math.ceil(xs + ww); x++) {
      const u = ((x + 0.5 - xs) / ww) * 2 - 1; // -1..1
      const nz = Math.sqrt(Math.max(0, 1 - u * u));
      let lum = 0.15 + 0.85 * Math.max(0, u * LIGHT[0] + nz * LIGHT[2] + 0.25);
      if (bark) lum += (valueNoise(x * 1.3, y / 3.5, seed) - 0.5) * 0.35;
      bmp.set(x, y, cols[rampIndex(lum, cols.length)]);
    }
  }
}

// Caixa simples com 3 faces visíveis (topo claro, frente média, lado escuro)
export function box(bmp, x, y, w, h, depth, ramp) {
  const cols = ramp.map((c) => (typeof c === 'string' ? hexToRgb(c) : c));
  bmp.rect(x, y, w, depth, cols[0]);
  bmp.rect(x, y + depth, w, h - depth, cols[1]);
  bmp.rect(x + w - 1, y + depth, 1, h - depth, cols[2]);
}

export function selOutline(bmp, dark = [18, 10, 22], k = 0.72) {
  const out = bmp.clone();
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      if (bmp.alpha(x, y) > 0) continue;
      let c = null;
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
        if (bmp.alpha(x + dx, y + dy) > 0) {
          c = bmp.get(x + dx, y + dy);
          break;
        }
      }
      if (c) out.set(x, y, mix(c, dark, k));
    }
  }
  return out;
}

export function newBmp(w, h) {
  return new Bitmap(w, h);
}
