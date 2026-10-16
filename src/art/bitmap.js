// Bitmap: imagem RGBA independente de DOM. Toda a arte do jogo é gerada
// como Bitmaps (no navegador e no Node), depois convertida em texturas.

export class Bitmap {
  constructor(w, h) {
    this.w = w | 0;
    this.h = h | 0;
    this.data = new Uint8ClampedArray(this.w * this.h * 4);
  }

  clone() {
    const b = new Bitmap(this.w, this.h);
    b.data.set(this.data);
    return b;
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  get(x, y) {
    if (!this.inside(x, y)) return null;
    const i = (y * this.w + x) * 4;
    const d = this.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]];
  }

  alpha(x, y) {
    if (!this.inside(x, y)) return 0;
    return this.data[(y * this.w + x) * 4 + 3];
  }

  set(x, y, c) {
    if (!c || !this.inside(x, y)) return;
    const i = (y * this.w + x) * 4;
    const d = this.data;
    const a = c[3] === undefined ? 255 : c[3];
    if (a >= 255 || d[i + 3] === 0) {
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = a;
    } else if (a > 0) {
      // composição "over" simples
      const t = a / 255;
      d[i] = d[i] * (1 - t) + c[0] * t;
      d[i + 1] = d[i + 1] * (1 - t) + c[1] * t;
      d[i + 2] = d[i + 2] * (1 - t) + c[2] * t;
      d[i + 3] = Math.max(d[i + 3], a);
    }
  }

  clear(x, y) {
    if (!this.inside(x, y)) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = this.data[i + 1] = this.data[i + 2] = this.data[i + 3] = 0;
  }

  fill(c) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.set(x, y, c);
    return this;
  }

  rect(x0, y0, w, h, c) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, c);
    return this;
  }

  // Copia src para (dx, dy). Pixels transparentes de src são ignorados.
  blit(src, dx = 0, dy = 0, opts = {}) {
    const { flipX = false, flipY = false, sx = 0, sy = 0, sw = src.w, sh = src.h, tint = null } = opts;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const px = flipX ? sx + sw - 1 - x : sx + x;
        const py = flipY ? sy + sh - 1 - y : sy + y;
        const c = src.get(px, py);
        if (!c || c[3] === 0) continue;
        this.set(dx + x, dy + y, tint ? tint(c) : c);
      }
    }
    return this;
  }

  flippedX() {
    const b = new Bitmap(this.w, this.h);
    b.blit(this, 0, 0, { flipX: true });
    return b;
  }

  // Mapeia cada pixel opaco por uma função (para recolorir / palette swap).
  map(fn) {
    const b = this.clone();
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const c = b.get(x, y);
        if (c[3] === 0) continue;
        const n = fn(c, x, y);
        if (n) {
          const i = (y * b.w + x) * 4;
          b.data[i] = n[0];
          b.data[i + 1] = n[1];
          b.data[i + 2] = n[2];
          b.data[i + 3] = n[3] === undefined ? c[3] : n[3];
        }
      }
    }
    return b;
  }

  // Contorno externo. colorFn(vizinhoOpaco) permite "sel-out" (contorno tingido).
  outline(colorFn, { diagonal = false } = {}) {
    const out = this.clone();
    const dirs = diagonal
      ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
      : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y) > 0) continue;
        let src = null;
        for (const [dx, dy] of dirs) {
          if (this.alpha(x + dx, y + dy) > 0) {
            src = this.get(x + dx, y + dy);
            break;
          }
        }
        if (src) out.set(x, y, typeof colorFn === 'function' ? colorFn(src, x, y) : colorFn);
      }
    }
    return out;
  }

  // Recorta para o retângulo dado.
  crop(x0, y0, w, h) {
    const b = new Bitmap(w, h);
    b.blit(this, 0, 0, { sx: x0, sy: y0, sw: w, sh: h });
    return b;
  }

  // Bounding box dos pixels opacos.
  bounds() {
    let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.alpha(x, y) > 0) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
}

// ---------------------------------------------------------------- ASCII

// Converte linhas ASCII + paleta {char: cor} em Bitmap.
// '.' e ' ' são transparentes. Cores podem ser '#rrggbb' ou [r,g,b(,a)].
export function fromAscii(rows, palette, w = null) {
  const width = w || Math.max(...rows.map((r) => r.length));
  const b = new Bitmap(width, rows.length);
  const cache = {};
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      let c = cache[ch];
      if (c === undefined) {
        const p = palette[ch];
        if (p === undefined) throw new Error(`Cor indefinida para '${ch}' (linha ${y}: "${row}")`);
        c = cache[ch] = typeof p === 'string' ? hexToRgb(p) : p;
      }
      if (c) b.set(x, y, c);
    }
  }
  return b;
}

// Sobrepõe um "patch" ASCII em linhas base. '?' mantém o pixel original,
// '.' apaga, demais caracteres substituem.
export function patch(baseRows, x0, y0, patchRows) {
  const rows = baseRows.slice();
  for (let j = 0; j < patchRows.length; j++) {
    const y = y0 + j;
    if (y < 0 || y >= rows.length) continue;
    const arr = rows[y].split('');
    const pr = patchRows[j];
    for (let i = 0; i < pr.length; i++) {
      const x = x0 + i;
      if (x < 0) continue;
      while (arr.length <= x) arr.push('.');
      if (pr[i] !== '?') arr[x] = pr[i];
    }
    rows[y] = arr.join('');
  }
  return rows;
}

// Substitui linhas inteiras a partir de startRow.
export function replaceRows(baseRows, startRow, newRows) {
  const rows = baseRows.slice();
  for (let j = 0; j < newRows.length; j++) rows[startRow + j] = newRows[j];
  return rows;
}

// Desloca o conteúdo (linhas) verticalmente, preenchendo com '.'.
export function shiftRows(rows, dy, dx = 0) {
  const w = Math.max(...rows.map((r) => r.length));
  const empty = '.'.repeat(w);
  const out = rows.map(() => empty);
  for (let y = 0; y < rows.length; y++) {
    const ny = y + dy;
    if (ny < 0 || ny >= rows.length) continue;
    let r = rows[y].padEnd(w, '.');
    if (dx > 0) r = '.'.repeat(dx) + r.slice(0, w - dx);
    else if (dx < 0) r = r.slice(-dx) + '.'.repeat(-dx);
    out[ny] = r;
  }
  return out;
}

// Espelha linhas horizontalmente.
export function mirrorRows(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => r.padEnd(w, '.').split('').reverse().join(''));
}

// ---------------------------------------------------------------- cor

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

export function rgbToHex(c) {
  return '#' + [c[0], c[1], c[2]].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v, 255];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255), 255];
}

// Escurece/clareia com deslocamento de matiz (sombras frias, luzes quentes).
export function shade(color, amount) {
  const c = typeof color === 'string' ? hexToRgb(color) : color;
  const [h, s, l] = rgbToHsl(c);
  // amount < 0 => sombra: matiz puxa para ~240 (azul/roxo); > 0 => luz: puxa para ~50 (amarelo)
  const target = amount < 0 ? 245 : 50;
  let dh = ((target - h + 540) % 360) - 180;
  const k = Math.min(1, Math.abs(amount)) * 0.35;
  const nh = h + dh * k;
  const ns = Math.max(0, Math.min(1, s * (amount < 0 ? 1 + Math.abs(amount) * 0.15 : 1 - amount * 0.35)));
  const nl = Math.max(0, Math.min(1, l + amount * (amount < 0 ? l * 0.9 : (1 - l) * 0.9)));
  const out = hslToRgb([nh, ns, nl]);
  out[3] = c[3] === undefined ? 255 : c[3];
  return out;
}

export function mix(a, b, t) {
  const A = typeof a === 'string' ? hexToRgb(a) : a;
  const B = typeof b === 'string' ? hexToRgb(b) : b;
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, 255].map(Math.round);
}

// Rampa de n tons a partir de uma cor base (índice central = base).
export function ramp(base, n = 4, spread = 0.55) {
  const out = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = (i - mid) / Math.max(1, mid);
    out.push(rgbToHex(shade(base, -t * spread)));
  }
  return out; // do mais claro ao mais escuro
}

// ---------------------------------------------------------------- folhas

// Empacota frames (Bitmaps de mesmo tamanho) em uma folha em grade.
export function packSheet(frames, cols = 8) {
  const names = Object.keys(frames);
  const fw = Math.max(...names.map((n) => frames[n].w));
  const fh = Math.max(...names.map((n) => frames[n].h));
  const rows = Math.ceil(names.length / cols);
  const sheet = new Bitmap(fw * Math.min(cols, names.length), fh * rows);
  const rects = {};
  names.forEach((n, i) => {
    const x = (i % cols) * fw;
    const y = Math.floor(i / cols) * fh;
    const f = frames[n];
    sheet.blit(f, x + Math.floor((fw - f.w) / 2), y + (fh - f.h));
    rects[n] = { x, y, w: fw, h: fh };
  });
  return { bitmap: sheet, rects, fw, fh };
}

// Ruído determinístico simples (para texturas procedurais).
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16));
