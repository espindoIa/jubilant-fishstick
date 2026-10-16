// Pequena DSL para desenhar mapas por regiões em vez de digitar o grid inteiro.
import { hash2 } from '../../art/bitmap.js';

export class Grid {
  constructor(w, h, tile = 'g', height = '0') {
    this.w = w;
    this.h = h;
    this.t = Array.from({ length: h }, () => Array(w).fill(tile));
    this.hg = Array.from({ length: h }, () => Array(w).fill(String(height)));
    this.p = Array.from({ length: h }, () => Array(w).fill('.'));
  }
  in(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }
  set(x, y, tile, height, prop) {
    if (!this.in(x, y)) return this;
    if (tile) this.t[y][x] = tile;
    if (height !== undefined && height !== null) this.hg[y][x] = String(height);
    if (prop !== undefined) this.p[y][x] = prop;
    return this;
  }
  rect(x, y, w, h, tile, height) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, tile, height);
    return this;
  }
  heightRect(x, y, w, h, height) {
    return this.rect(x, y, w, h, null, height);
  }
  disc(cx, cy, r, tile, height, jitter = 0.25, seed = 1) {
    for (let j = Math.floor(cy - r - 1); j <= cy + r + 1; j++) {
      for (let i = Math.floor(cx - r - 1); i <= cx + r + 1; i++) {
        const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) + (hash2(i, j, seed) - 0.5) * jitter * 2;
        if (d <= r) this.set(i, j, tile, height);
      }
    }
    return this;
  }
  // caminho entre pontos (linha grossa)
  path(points, tile, width = 2, height) {
    for (let k = 0; k < points.length - 1; k++) {
      const [x0, y0] = points[k], [x1, y1] = points[k + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
      for (let s = 0; s <= n; s++) {
        const x = x0 + ((x1 - x0) * s) / n, y = y0 + ((y1 - y0) * s) / n;
        for (let j = 0; j < width; j++) for (let i = 0; i < width; i++) this.set(Math.floor(x + i - (width - 1) / 2), Math.floor(y + j - (width - 1) / 2), tile, height);
      }
    }
    return this;
  }
  prop(x, y, ch) {
    if (this.in(x, y)) this.p[y][x] = ch;
    return this;
  }
  // espalha props sobre tiles de um tipo
  scatter(ch, onTiles, density, seed = 1, area = null) {
    const [x0, y0, x1, y1] = area || [0, 0, this.w, this.h];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!this.in(x, y)) continue;
      if (!onTiles.includes(this.t[y][x])) continue;
      if (this.p[y][x] !== '.') continue;
      if (hash2(x, y, seed) < density) this.p[y][x] = ch;
    }
    return this;
  }
  clearProps(x, y, w, h) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.in(i, j)) this.p[j][i] = '.';
    return this;
  }
  rows() {
    return {
      tiles: this.t.map((r) => r.join('')),
      heights: this.hg.map((r) => r.join('')),
      propLayer: this.p.map((r) => r.join('')),
    };
  }
}

export const DEFAULT_LEGEND = {
  T: 'oak*',
  P: 'pine*',
  D: 'darkoak*',
  A: 'autumn0',
  L: 'palm*',
  X: 'dead*',
  Y: 'spirit0',
  b: 'bush*',
  B: 'berry',
  r: 'rock*',
  O: 'boulder',
  ',': 'tuft*',
  '"': 'reeds',
  '*': 'flowers*',
  m: 'mushglow',
  M: 'mushred',
  c: 'crystal',
  C: 'crystalblue',
  k: 'caverock',
  i: 'stalagmite',
  l: 'lamp',
  t: 'torch',
  f: 'fence',
  o: 'barrel',
  x: 'crate',
  s: 'sign',
  p: 'pot',
};
