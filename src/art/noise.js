// Ruído de valor suave + fbm, determinístico, para texturas procedurais.
import { hash2 } from './bitmap.js';

function smooth(t) {
  return t * t * (3 - 2 * t);
}

export function valueNoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  const u = smooth(xf), v = smooth(yf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

export function fbm(x, y, seed = 0, oct = 3) {
  let amp = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += valueNoise(x * f, y * f, seed + i * 17) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}

// Voronoi (distância ao ponto mais próximo e id da célula) — útil para pedras.
export function voronoi(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let best = 9, second = 9, id = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = xi + i, cy = yi + j;
      const px = cx + hash2(cx, cy, seed) * 0.8 + 0.1;
      const py = cy + hash2(cx, cy, seed + 7) * 0.8 + 0.1;
      const d = Math.hypot(px - x, py - y);
      if (d < best) {
        second = best;
        best = d;
        id = hash2(cx, cy, seed + 13);
      } else if (d < second) second = d;
    }
  }
  return { d: best, edge: second - best, id };
}
