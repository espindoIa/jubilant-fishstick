// Inimigos de batalha — lote A (Bosque Sussurrante + Caverna de Cristal).
// Todos voltados para a DIREITA (o grupo fica do lado direito do campo).
// Técnica: silhuetas por máscaras (formas + ASCII), sombreamento volumétrico
// quantizado em rampas com deslocamento de matiz (luz de cima-esquerda),
// linhas internas por sobreposição de camadas, detalhes pintados à mão em
// ASCII e contorno escuro tingido. Cada inimigo gera dois quadros de idle
// (idle/alt) e máscaras de brilho (glow/altGlow) com os pixels emissivos.
import { Bitmap, hexToRgb, mix, shade, hash2 } from './bitmap.js';
import { LIGHT } from './sculpt.js';
import { valueNoise, voronoi } from './noise.js';

const C = (c) => (typeof c === 'string' ? hexToRgb(c) : c);
const RAMP = (r) => r.map(C);

// ================================================================ máscaras
class Mask {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.a = new Uint8Array(w * h);
  }
  in(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }
  has(x, y) {
    return this.in(x, y) && this.a[y * this.w + x] > 0;
  }
  set(x, y, v = 1) {
    if (this.in(x, y)) this.a[y * this.w + x] = v;
    return this;
  }
  clone() {
    const m = new Mask(this.w, this.h);
    m.a.set(this.a);
    return m;
  }
  fn(f, v = 1) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (f(x + 0.5, y + 0.5, x, y)) this.a[y * this.w + x] = v;
    return this;
  }
  ell(cx, cy, rx, ry, v = 1) {
    return this.fn((px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1, v);
  }
  rell(cx, cy, rx, ry, ang, v = 1) {
    const c = Math.cos(ang), sn = Math.sin(ang);
    return this.fn((px, py) => {
      const dx = px - cx, dy = py - cy;
      const u = dx * c + dy * sn, w = -dx * sn + dy * c;
      return (u / rx) ** 2 + (w / ry) ** 2 <= 1;
    }, v);
  }
  // linha de 1px (Bresenham) por uma lista de pontos
  path(pts, v = 1) {
    for (let i = 0; i < pts.length - 1; i++) {
      let [x0, y0] = pts[i].map(Math.round);
      const [x1, y1] = pts[i + 1].map(Math.round);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.set(x0, y0, v);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
    return this;
  }
  rect(x0, y0, w, h, v = 1) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) this.set(x, y, v);
    return this;
  }
  poly(pts, v = 1) {
    return this.fn((px, py) => inPoly(pts, px, py), v);
  }
  // cápsula com raio interpolado (membros, caudas)
  capsule(x0, y0, x1, y1, r0, r1 = r0, v = 1) {
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    return this.fn((px, py) => {
      let t = ((px - x0) * dx + (py - y0) * dy) / L2;
      t = Math.max(0, Math.min(1, t));
      const r = r0 + (r1 - r0) * t;
      return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t)) <= r;
    }, v);
  }
  rows(rows, x0 = 0, y0 = 0, chars = null, v = 1) {
    for (let j = 0; j < rows.length; j++) {
      for (let i = 0; i < rows[j].length; i++) {
        const ch = rows[j][i];
        if (ch === '.' || ch === ' ') continue;
        if (chars && !chars.includes(ch)) continue;
        this.set(x0 + i, y0 + j, v);
      }
    }
    return this;
  }
  add(m) {
    for (let i = 0; i < this.a.length; i++) if (m.a[i]) this.a[i] = 1;
    return this;
  }
  sub(m) {
    for (let i = 0; i < this.a.length; i++) if (m.a[i]) this.a[i] = 0;
    return this;
  }
  and(m) {
    for (let i = 0; i < this.a.length; i++) if (!m.a[i]) this.a[i] = 0;
    return this;
  }
  clip(f) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (!f(x + 0.5, y + 0.5, x, y)) this.a[y * this.w + x] = 0;
    return this;
  }
  shift(dx, dy) {
    const m = new Mask(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.a[y * this.w + x]) m.set(x + dx, y + dy);
    return m;
  }
}

// Tufos de pelo: dentes de serra ao longo da borda superior (ou inferior)
// de uma faixa de colunas. lean<0 => pontas para trás (esquerda).
function tufts(m, x0, x1, { period = 3, depth = 2, phase = 0, bottom = false, minY = 0, maxY = 1e9 } = {}) {
  const add = [];
  for (let x = x0; x <= x1; x++) {
    let ey = -1;
    if (!bottom) { for (let y = minY; y < Math.min(m.h, maxY); y++) if (m.has(x, y)) { ey = y; break; } }
    else { for (let y = Math.min(m.h, maxY) - 1; y >= minY; y--) if (m.has(x, y)) { ey = y; break; } }
    if (ey < 0) continue;
    const t = (((x - x0 + phase) % period) + period) % period / period;
    const hgt = Math.round(depth * (1 - t));
    for (let k = 1; k <= hgt; k++) add.push([x, bottom ? ey + k : ey - k]);
  }
  for (const [x, y] of add) m.set(x, y);
  return m;
}

function inPoly(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

function norm3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// Distância (euclidiana) de cada pixel interno até o exterior da máscara.
function distField(m, R) {
  const d = new Float32Array(m.w * m.h);
  const r = Math.ceil(R) + 1;
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (!m.a[y * m.w + x]) continue;
      let best = r + 1;
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          if (!m.has(x + i, y + j)) {
            const dd = Math.hypot(i, j);
            if (dd < best) best = dd;
          }
        }
      }
      d[y * m.w + x] = best - 0.5;
    }
  }
  return d;
}

// Sombreamento volumétrico de uma máscara: "infla" a silhueta (bisel
// circular de raio R) e opcionalmente mistura uma normal elipsoidal (bulge).
// Retorna um Bitmap com a forma pintada na rampa (claro -> escuro).
function shadeMask(m, ramp, o = {}) {
  const cols = RAMP(ramp);
  const {
    R = 3, amb = 0.16, light = LIGHT, bulge = null, lift = 0, vgrad = 0, hgrad = 0,
    tex = null, curve = 1, flat = 0, adj = null,
  } = o;
  const L = norm3(light);
  const d = distField(m, R);
  const H = (x, y) => {
    if (!m.has(x, y)) return 0;
    const t = Math.min(d[y * m.w + x], R) / R;
    return R * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
  };
  let bx0 = m.w, by0 = m.h, bx1 = 0, by1 = 0;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.a[y * m.w + x]) {
    bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
  }
  const b = new Bitmap(m.w, m.h);
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (!m.a[y * m.w + x]) continue;
      const hx = (H(x + 1, y) - H(x - 1, y)) / 2;
      const hy = (H(x, y + 1) - H(x, y - 1)) / 2;
      let n = norm3([-hx, -hy, 1 + flat]);
      if (bulge) {
        const dx = (x + 0.5 - bulge.cx) / bulge.rx, dy = (y + 0.5 - bulge.cy) / bulge.ry;
        const nz = Math.sqrt(Math.max(0.02, 1 - Math.min(0.98, dx * dx + dy * dy)));
        const nb = norm3([dx, dy, nz]);
        const k = bulge.k ?? 0.6;
        n = norm3([n[0] * (1 - k) + nb[0] * k, n[1] * (1 - k) + nb[1] * k, n[2] * (1 - k) + nb[2] * k]);
      }
      let lum = amb + (1 - amb) * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
      lum = Math.pow(lum, curve);
      if (vgrad) lum += vgrad * (0.5 - (y - by0) / Math.max(1, by1 - by0));
      if (hgrad) lum += hgrad * (0.5 - (x - bx0) / Math.max(1, bx1 - bx0));
      if (tex) lum += tex(x, y);
      lum += lift;
      let idx = Math.round((1 - lum) * (cols.length - 1));
      if (adj) idx = adj(x, y, idx, lum);
      b.set(x, y, cols[Math.max(0, Math.min(cols.length - 1, idx))]);
    }
  }
  return b;
}

// Pinta pixels de borda (vizinho na direção dada está fora da máscara).
function edge(b, m, dx, dy, color, test = null) {
  const c = C(color);
  const pts = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (m.has(x, y) && !m.has(x + dx, y + dy) && (!test || test(x, y))) pts.push([x, y]);
  }
  for (const [x, y] of pts) b.set(x, y, c);
  return b;
}

// Remove pixels órfãos (cercados por uma mesma cor nos 4 lados).
function despeckle(b, passes = 1) {
  for (let p = 0; p < passes; p++) {
    const src = b.clone();
    for (let y = 1; y < b.h - 1; y++) for (let x = 1; x < b.w - 1; x++) {
      const c = src.get(x, y);
      if (!c[3]) continue;
      const ns = [src.get(x - 1, y), src.get(x + 1, y), src.get(x, y - 1), src.get(x, y + 1)];
      if (ns.some((n) => !n[3])) continue;
      const k = (n) => n[0] * 65536 + n[1] * 256 + n[2];
      const kc = k(c);
      const counts = {};
      for (const n of ns) counts[k(n)] = (counts[k(n)] || 0) + 1;
      const same = counts[kc] || 0;
      if (same > 0) continue;
      let best = null, bc = 0;
      for (const [kk, v] of Object.entries(counts)) if (v > bc) { bc = v; best = kk; }
      if (bc >= 3) {
        const n = ns.find((q) => k(q) === Number(best));
        b.set(x, y, n);
      }
    }
  }
  return b;
}

// Sobrepõe src em dst com linha interna: os pixels de dst logo fora de src
// escurecem (sombra de contato), separando as partes como em sprites de SNES.
function over(dst, src, o = {}) {
  const { line = 0.5, dark = '#140c24', shadow = 0, only = null } = o;
  const dk = C(dark);
  if (line > 0) {
    const marks = [];
    for (let y = 0; y < dst.h; y++) for (let x = 0; x < dst.w; x++) {
      if (src.alpha(x, y) || !dst.alpha(x, y)) continue;
      const up = src.alpha(x, y - 1), lf = src.alpha(x - 1, y), rt = src.alpha(x + 1, y), dn = src.alpha(x, y + 1);
      if (only === 'below' && !up && !lf) continue;
      if (up || lf || rt || dn) marks.push([x, y, line]);
      else if (shadow && (src.alpha(x - 1, y - 1) || src.alpha(x, y - 2) || src.alpha(x - 2, y))) marks.push([x, y, shadow]);
    }
    for (const [x, y, k] of marks) dst.set(x, y, mix(dst.get(x, y), dk, k));
  }
  dst.blit(src);
  return dst;
}

// Contorno externo tingido: mais claro no topo/esquerda, mais escuro embaixo.
function outline(b, dark = '#140c24', kTop = 0.72, kBot = 0.88) {
  const dk = C(dark);
  const out = b.clone();
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    if (b.alpha(x, y)) continue;
    let nb = null, k = kTop;
    if (b.alpha(x, y - 1)) { nb = b.get(x, y - 1); k = kBot; }
    else if (b.alpha(x - 1, y)) { nb = b.get(x - 1, y); k = (kTop + kBot) / 2; }
    else if (b.alpha(x + 1, y)) { nb = b.get(x + 1, y); k = kTop; }
    else if (b.alpha(x, y + 1)) { nb = b.get(x, y + 1); k = kTop; }
    if (nb) {
      // vizinhos muito claros pedem contorno mais escuro (silhueta legível)
      const lum = (nb[0] * 0.3 + nb[1] * 0.55 + nb[2] * 0.15) / 255;
      out.set(x, y, mix(nb, dk, Math.min(0.94, k + Math.max(0, lum - 0.55) * 0.35)));
    }
  }
  return out;
}

// Pinta linhas ASCII sobre o bitmap. '.' e ' ' mantêm; paleta null apaga.
function paint(b, x0, y0, rows, pal) {
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if (ch === '.' || ch === ' ') continue;
      const p = pal[ch];
      if (p === undefined) throw new Error(`cor indefinida '${ch}'`);
      if (p === null) b.clear(x0 + i, y0 + j);
      else b.set(x0 + i, y0 + j, C(p));
    }
  }
  return b;
}

function px(b, x, y, c) {
  b.set(x, y, C(c));
}

// Copia apenas os pixels de b marcados em m (máscara de emissão).
function glowOf(b, m, boost = 0) {
  const g = new Bitmap(b.w, b.h);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) {
    if (!m.has(x, y) || !b.alpha(x, y)) continue;
    const c = b.get(x, y);
    g.set(x, y, boost ? shade(c, boost) : c);
  }
  return g;
}

function maskOf(b) {
  const m = new Mask(b.w, b.h);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (b.alpha(x, y)) m.set(x, y);
  return m;
}

function pair(fn) {
  const a = fn(0), b = fn(1);
  return { idle: a.bmp, alt: b.bmp, glow: a.glow || null, altGlow: b.glow || null };
}

// ================================================================ 1. GOTÍCULA
const WATER = ['#f6ffff', '#b4f2ff', '#74d4fa', '#46a6ec', '#3274d2', '#2c4cac', '#28347e'];

function dropletMask(w, h, f, by, tipK = 1) {
  // corpo: domo largo; topo: ponta de gota (pescoço côncavo) curvada para trás
  const cx = w / 2 + 0.2;
  const rx = f ? 11.4 : 10.6;
  const ry = f ? 6.6 : 7.4;
  const cy = by + 1 - ry * 0.86;
  const tipY = by - (f ? 16 : 18.5) * tipK;
  const neckY = cy - ry * 0.35;
  const m = new Mask(w, h);
  m.fn((px, py) => {
    if (py > by + 1) return false;
    const dx = (px - cx) / rx;
    const dy = (py - cy) / (py > cy ? ry * 0.86 : ry);
    if (Math.abs(dx) ** 2.2 + Math.abs(dy) ** 2 <= 1) return true;
    if (py >= tipY && py <= neckY) {
      const t = (py - tipY) / (neckY - tipY);
      const half = 0.75 + rx * 0.6 * Math.pow(t, 1.8);
      const c = cx - 1.2 - Math.pow(1 - t, 2.2) * (f ? 2.2 : 3.6);
      return Math.abs(px - c) <= half;
    }
    return false;
  });
  return { m, cx, cy, rx, ry, tipY };
}

function drawDroplet(f, pal = WATER, w = 26, h = 22, face = {}, tipK = 1) {
  const { m, cx, cy, rx, ry } = dropletMask(w, h, f, h - 2, tipK);
  const b = shadeMask(m, pal, {
    R: 4, amb: 0.3, curve: 1.9, lift: -0.04,
    bulge: { cx: cx - 1.5, cy: cy - 1, rx: rx + 1.5, ry: ry + 4, k: 0.65 }, vgrad: 0.14,
  });
  const cP = RAMP(pal);
  // luz transmitida: faixa clara junto à base (água translúcida)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m.has(x, y) || y < cy + 1) continue;
    if (!m.has(x, y + 1) && x > cx - 5 && x < cx + rx - 3) b.set(x, y, cP[3]);
    else if (!m.has(x, y + 2) && x > cx - 2 && x < cx + rx - 5) b.set(x, y, cP[2]);
  }
  despeckle(b);
  // brilho especular grande (cima-esquerda) + reflexo menor
  const hx = Math.round(cx - rx * 0.62), hy = Math.round(cy - ry * 0.5) + (f ? 1 : 0);
  paint(b, hx, hy, [
    '.wWw.',
    'wWWw.',
    'wWw..',
    '.w...',
  ], { W: pal[0], w: pal[1] });
  px(b, hx + 1, hy + 5, pal[0]);
  px(b, hx + 4, hy - 1, pal[1]);
  // olhos (voltados para a direita) e boca
  const ex = Math.round(cx + 1), ey = Math.round(cy + 0.5);
  const E = { e: '#121634', s: '#ffffff', m: '#18205a', t: '#ff86a6', ...face };
  paint(b, ex, ey - 1, [
    'se..se',
    'ee..ee',
    'ee..ee',
  ], E);
  paint(b, ex + 1, ey + 3, ['mtm'], E);
  return { b, m, cx, cy, rx, ry };
}

function goticula(f) {
  const { b } = drawDroplet(f);
  return { bmp: outline(b, '#141a3c', 0.7, 0.86) };
}

// ================================================================ 2. COGUMELO SONOLENTO
const CAP = ['#ffe6c8', '#ffc29c', '#f4927c', '#d26674', '#9a4668', '#62305a'];
const SPOT = ['#f0dcff', '#c09cf6', '#8e66d6', '#5e40a6', '#3e2a78'];
const STEM = ['#fffaea', '#f6e2c0', '#dcb898', '#b48a7c', '#7e5a66'];
const GILL = ['#c8949a', '#9a6476', '#6e4060'];
const SPORE = ['#fffbe0', '#efffa8', '#c4f29a', '#8ad69a'];

function cogumelo(f) {
  const w = 28, h = 32, by = h - 2;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const sq = f ? 1 : 0; // respiração: chapéu desce e o tronco alarga
  const cx = 14, cy = 11.2 + sq, rx = 12.8, ry = 10;
  const capRim = (px) => {
    const dx = (px - cx) / rx;
    return cy + 0.6 + (dx > 0 ? 6.2 : 4.6) * Math.pow(Math.abs(dx), 2.6);
  };
  // --- lamelas (parte de baixo do chapéu, vista sob a aba caída)
  const gill = new Mask(w, h).ell(cx + 0.4, cy + 2.2, rx - 2.2, 3.4);
  const gb = shadeMask(gill, GILL, { R: 2, amb: 0.4, vgrad: 0.4 });
  for (let x = 4; x < w - 3; x += 2) for (let y = 0; y < h; y++) if (gill.has(x, y) && y > cy + 1) gb.set(x, y, C(GILL[2]));
  b.blit(gb);
  // --- pés (toquinhos arredondados)
  const feet = new Mask(w, h).ell(8.8, by - 0.4, 3.2, 2.1).ell(19.8, by - 0.4, 3.5, 2.1).clip((x, y) => y < by + 1);
  const fb = shadeMask(feet, ['#f0d2b0', '#cc9c80', '#9a6c66', '#6a4656'], { R: 2, amb: 0.25, bulge: { cx: 13, cy: by - 2, rx: 10, ry: 4, k: 0.6 } });
  // --- tronco (corpo-pera com rosto)
  const top = cy + 1;
  const stem = new Mask(w, h).fn((px, py) => {
    const bot = by - 0.8;
    if (py < top || py > bot) return false;
    const t = (py - top) / (bot - top);
    let half = 5.4 + 2.2 * Math.sin(Math.min(1, t * 1.05) * Math.PI * 0.7) + sq * 0.6;
    if (t > 0.85) half -= (t - 0.85) * 9;
    return Math.abs(px - 14.2) <= half;
  });
  const sb = shadeMask(stem, STEM, {
    R: 3, amb: 0.26, curve: 1, flat: 0.5, bulge: { cx: 11.6, cy: 14, rx: 9, ry: 40, k: 0.85 }, lift: 0.08, vgrad: 0.12,
    adj: (x, y, i) => i + (y < capRim(x + 0.5) + 2.2 ? 2 : y < capRim(x + 0.5) + 3.2 ? 1 : 0),
  });
  over(b, sb, { line: 0.5, dark: '#4a2a3a' });
  over(b, fb, { line: 0.6, dark: '#4a2a3a' });
  // --- chapéu caído
  const cap = new Mask(w, h).fn((px, py) => {
    const dx = (px - cx) / rx;
    if (Math.abs(dx) > 1) return false;
    if (py < cy) return dx * dx + ((py - cy) / ry) ** 2 <= 1;
    return py <= capRim(px);
  });
  const cb = shadeMask(cap, CAP, {
    R: 4, amb: 0.2, curve: 1.1, bulge: { cx: cx - 2, cy: cy + 1, rx: rx + 1, ry: ry + 2, k: 0.62 },
    adj: (x, y, i) => (!cap.has(x, y + 1) ? Math.max(i, 4) : !cap.has(x, y + 2) ? Math.max(i, 3) : i),
  });
  // pintas roxas (pequenas cúpulas)
  const spots = [[7.2, cy - 4.6, 2.7, 2.1], [15, cy - 6.8, 2.2, 1.6], [21, cy - 2.6, 2.5, 2.1], [12, cy - 1, 1.8, 1.4], [3.6, cy + 0.6, 1.4, 1.8], [24.8, cy + 3.4, 1.3, 1.7], [17.6, cy + 1.6, 1.3, 1.0]];
  for (const [sx, sy, srx, sry] of spots) {
    const sm = new Mask(w, h).ell(sx, sy, srx, sry).and(cap);
    cb.blit(shadeMask(sm, SPOT, { R: 1.6, amb: 0.3, lift: 0.1 - (sy > cy ? 0.18 : 0) }));
  }
  over(b, cb, { line: 0.6, dark: '#3a1c34', shadow: 0.25 });
  // --- rosto sonolento (olhos semicerrados, voltados à direita) + bolha de sono
  const ey = 15 + sq;
  const F = { k: '#4a2436', l: '#e2b49c', e: '#2a1428', p: '#ff8ca0', m: '#6a2a3a', b: '#ffb0b0', o: '#d4f6ff', O: '#8ad0ee', W: '#ffffff' };
  paint(b, 12, ey, [
    'lll..lll',
    'kkk..kkk',
    '.ee...ee',
  ], F);
  paint(b, 11, ey + 3, ['b........b'], F);
  paint(b, 15, ey + 4, ['mm'], F);
  // bolha de sono saindo do nariz/boca (cresce no quadro alt)
  paint(b, 19, ey + 4 - (f ? 1 : 0), f ? ['.oo.', 'oWoO', 'ooOO', '.OO.'] : ['.o.', 'oWO', '.O.'], F);
  // --- nuvenzinhas de esporos (emissivas)
  const SP = RAMP(SPORE);
  const PUFF = [
    ['.ab.', 'abbc', '.cc.'],
    ['.a.', 'abc', '.c.'],
    ['ab', 'bc'],
  ];
  const puffs = f
    ? [[0, 1, 0], [22, 0, 2], [1, 13, 2], [25, 5, 1]]
    : [[1, 4, 0], [21, 1, 1], [0, 15, 2], [25, 8, 2]];
  const pmask = new Mask(w, h);
  for (const [x, y, k] of puffs) {
    const rows = PUFF[k];
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const ch = rows[j][i];
      if (ch === '.' || b.alpha(x + i, y + j)) continue;
      b.set(x + i, y + j, SP['abc'.indexOf(ch) + (k === 2 ? 1 : 0)]);
      pmask.set(x + i, y + j);
    }
  }
  const o = outline(b, '#24122a', 0.7, 0.86);
  // esporos: sem contorno
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (b.alpha(x, y)) continue;
    const nearPuff = pmask.has(x - 1, y) || pmask.has(x + 1, y) || pmask.has(x, y - 1) || pmask.has(x, y + 1);
    const nearBody = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => b.alpha(x + dx, y + dy) && !pmask.has(x + dx, y + dy));
    if (nearPuff && !nearBody) o.clear(x, y);
  }
  em.add(pmask);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 3. LOBO SOMBRIO
const FUR = ['#8a86d8', '#625cae', '#45408a', '#312c6a', '#221e4e', '#161236'];
const FUR_FAR = ['#4a4590', '#36317a', '#28245e', '#1c1844', '#130f30'];
const RIM = ['#f0dcff', '#c4a0ff', '#9a74f0'];
const SMOKE = ['#a094e8', '#7468c4', '#544aa0', '#3a327c', '#28225a'];

// Silhueta desenhada à mão por partes: B corpo, N pernas próximas, F pernas
// distantes. A cabeça é pintada à mão (WOLF_HEAD); a cauda de fumaça é feita
// por formas (varia entre os quadros).
const WOLF = [
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '............................................',
  '......................B.B.B.................',
  '.....................BBBBBBBB...............',
  '................BBBBBBBBBBBBBBB.............',
  '........BBBBBBBBBBBBBBBBBBBBBBBB............',
  '........BBBBBBBBBBBBBBBBBBBBBBBBB...........',
  '........BBBBBBBBBBBBBBBBBBBBBBBBB...........',
  '........NNNNNBBBBBBBBBBBBBBBBBBBB...........',
  '.......NNNNNNNBBBBBBBBBBBBBBBBBBB...........',
  '.......NNNNNNNNBBBBBBBBBBBBBBBBBB...........',
  '.......NNNNNNNNNBBBBBBBBBBBBBBBBB...........',
  '........NNNNNNNNFBBB..BBBBBBBBBBB...........',
  '.........NNNNNNNFF.....BBBBBBNNN............',
  '...........NNNNNFF.....FFBBBNNNN............',
  '..........NNNNN.FF.....FFF.NNNN.............',
  '.........NNNN..FF......FFF..NNN.............',
  '.........NN....FF.......FF..NN..............',
  '.........NNN...FF.......FF..NNN.............',
  '.........NNNN..FFF......FFF.NNNN............',
  '.........NNNNN.FFFF.....FFFF.NNNNNN.........',
  '............................................',
];
// cabeça baixa rosnando, pintada à mão (origem x=29, y=5)
const WOLF_HEAD = [
  '...1...........',
  '...12..........',
  '..2ad2.2.......',
  '..2aed2a.......',
  '.2aaedab.......',
  '2aaaaaaa22.....',
  'aaaaaakkaa22...',
  'baaaabYOkaaa22.',
  'bbabbbbbbaaaaa2',
  'bbbbbbbbbbbbbnn',
  'cbbbbbcrmmmmmn.',
  'ccbcccrtmtmtm..',
  'dccccccccccc...',
  '.dcccdddd......',
  '..ddd..........',
];
const WOLF_HEAD_PAL = {
  1: '#f2e4ff', 2: '#b896ff', a: '#6a64ba', b: '#4a4492', c: '#332e72', d: '#241f52', e: '#161236',
  k: '#0a0618', Y: '#fff8b0', O: '#ffc83a', n: '#0c0a1e', m: '#2a0c26', r: '#8a2a52', t: '#f4f0ff',
};

function lobo(f) {
  const w = 44, h = 30;
  const rows = WOLF;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#0a0618';
  const M = (ch) => new Mask(w, h).rows(rows, 0, 0, ch);
  const sw = f ? 1 : 0;
  // cauda de fumaça: base grossa que se abre em fios ondulados e cachos
  const strand = (m, pts, r0, r1) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const t0 = i / (pts.length - 1), t1 = (i + 1) / (pts.length - 1);
      m.capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1);
    }
    return m;
  };
  const tail = new Mask(w, h).capsule(10, 14.6, 6.4, 14.4, 2.5, 2.8);
  strand(tail, [[6.4, 14.4], [3.6, 13.4 - sw * 0.4], [1.8, 11.4 - sw * 0.8]], 2.6, 1.4);
  tufts(tail, 2, 9, { period: 2, depth: 1, bottom: true, minY: 12, phase: 1 });
  const puffs = new Mask(w, h);
  if (f) puffs.ell(4.4, 7, 1.3, 1.1).ell(7, 3.8, 1, 0.9).ell(2.4, 3.2, 0.8, 0.8);
  else puffs.ell(3.8, 7.8, 1.3, 1.1).ell(6.4, 4.8, 1, 0.9).ell(2, 4.2, 0.8, 0.8);
  tail.add(puffs);
  const body = M('B');
  const near = M('N'), far = M('F');
  const foreN = near.clone().clip((x) => x >= 26), hindN = near.clone().clip((x) => x < 26);
  const sh = (m, r, o) => shadeMask(m, r, { amb: 0.2, ...o });
  const tb = sh(tail, SMOKE, { R: 1.5, amb: 0.3, bulge: { cx: 4, cy: 9, rx: 7, ry: 8, k: 0.5 }, adj: (x, y, i) => i + (x > 7 ? 1 : 0) - (y < 10 ? 1 : 0) });
  const flb = sh(far, FUR_FAR, { R: 1.5 });
  const bb = sh(body, FUR, { R: 2.5, curve: 1.2, bulge: { cx: 21, cy: 12, rx: 15, ry: 8, k: 0.55 }, vgrad: 0.2 });
  const hb = sh(hindN, FUR, { R: 2, curve: 1.1, bulge: { cx: 10, cy: 16, rx: 5, ry: 7, k: 0.6 }, lift: 0.08 });
  const fb = sh(foreN, FUR, { R: 1.6, curve: 1.05, bulge: { cx: 29, cy: 20, rx: 4, ry: 9, k: 0.45 }, lift: 0.1 });
  // luz refletida violeta na frente das pernas próximas
  edge(hb, hindN, 1, 0, '#5a4cae', (x, y) => y > 20);
  edge(fb, foreN, 1, 0, '#5a4cae', (x, y) => y > 21);
  const hdb = paint(new Bitmap(w, h), 29, 7 + sw, WOLF_HEAD, WOLF_HEAD_PAL);
  b.blit(tb);
  over(b, flb, { line: 0.3, dark: DK });
  over(b, bb, { line: 0.5, dark: DK });
  over(b, hb, { line: 0.6, dark: DK });
  over(b, hdb, { line: 0.55, dark: DK });
  over(b, fb, { line: 0.6, dark: DK });
  // luz de contorno violeta no topo do dorso/cauda
  const rimM = new Mask(w, h).add(body).add(tail).add(hindN);
  const all = maskOf(b);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!rimM.has(x, y) || all.has(x, y - 1) || y > 17) continue;
    b.set(x, y, C(x >= 20 && x <= 30 ? RIM[0] : x > 6 ? RIM[1] : RIM[2]));
  }
  // garras
  for (const [x, y] of [[13, 28], [17, 28], [27, 28], [34, 28]]) px(b, x, y, '#b8b0e0');
  em.set(35, 14 + sw).set(36, 14 + sw);
  // tela final 46px: 1px de margem para o contorno do focinho e da cauda
  const big = new Bitmap(w + 2, h);
  big.blit(b, 1, 0);
  const o = outline(big, DK, 0.66, 0.84);
  return { bmp: o, glow: glowOf(o, em.shift(1, 0)) };
}

// ================================================================ 4. VESPA-LANTERNA
const CHITIN = ['#8a80a8', '#5c5278', '#3a3252', '#241e36', '#161222'];
const WASP_Y = ['#fff6b0', '#ffd640', '#dc9a2c', '#9a5c22'];
const LANTERN = ['#fffbe0', '#ffe68a', '#ffbc4a', '#ff8a34', '#e05a2a', '#a43a26', '#6a2622'];
const WING = ['#f6fcff', '#dcefff', '#b4d2f4', '#8aa8dc'];

function vespa(f) {
  const w = 30, h = 28;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#140c1c';
  const wa = f ? 1 : 0; // batida de asa
  // ---------- asas (par distante mais escuro, par próximo claro/translúcido)
  const farW = new Mask(w, h).rell(13.6 + wa, 4.6 + wa * 1.6, 6, 1.9, f ? -0.25 : -0.62);
  const nearW = new Mask(w, h).rell(10.4 + wa * 0.5, 5.4 + wa * 1.8, 7.6, 2.4, f ? -0.14 : -0.4);
  const fwb = shadeMask(farW, WING, { R: 1.5, amb: 0.5, lift: -0.35 });
  const nwb = shadeMask(nearW, WING, { R: 1.5, amb: 0.5, lift: 0.05 });
  // ---------- abdômen-lanterna pendurado (oval vertical com costelas)
  const ax = 8.4, ay = 18.2, arx = 6.2, ary = 6.4;
  const abd = new Mask(w, h).ell(ax, ay, arx, ary);
  const L = RAMP(LANTERN);
  const ab = new Bitmap(w, h);
  const ribs = [Math.round(ay - 3.4), Math.round(ay - 0.2), Math.round(ay + 3)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!abd.has(x, y)) continue;
    const u = (x + 0.5 - ax) / arx, v = (y + 0.5 - ay) / ary;
    const rr = Math.hypot(u + 0.12, v * 0.9 + 0.1);
    let idx = Math.round(rr * rr * 4.6 + 0.2 - (f ? 0.5 : 0));
    const sag = Math.round(u * u * 1.2);
    const isRib = ribs.some((ry, k) => y === ry + (k === 2 ? sag : k === 0 ? -sag : 0));
    if (isRib) idx = Math.max(idx + 2, 4);
    idx = Math.max(0, Math.min(6, idx));
    ab.set(x, y, L[idx]);
    if (idx <= 4 && !isRib) em.set(x, y);
  }
  // tampas escuras da lanterna (topo e base) + argola
  const capT = new Mask(w, h).ell(ax, ay - ary + 0.6, 3.4, 1.4);
  const capB = new Mask(w, h).ell(ax, ay + ary - 0.4, 3, 1.3);
  const capBmp = shadeMask(new Mask(w, h).add(capT).add(capB), CHITIN, { R: 1.2, amb: 0.3, lift: 0.15 });
  paint(capBmp, Math.round(ax) - 2, Math.round(ay - ary), ['.yYy'], { y: WASP_Y[1], Y: WASP_Y[0] });
  // ferrão
  const sting = new Mask(w, h).capsule(ax - 0.2, ay + ary + 0.6, ax - 1.2, h - 1.6, 1.2, 0.4);
  const stb = shadeMask(sting, CHITIN, { R: 1, amb: 0.3, lift: 0.15 });
  // ---------- tórax + pecíolo
  const thorax = new Mask(w, h).ell(16.8, 11, 4.6, 4).capsule(12.6, 12.4, 9.6, 11.6, 1.2, 1);
  const thb = shadeMask(thorax, CHITIN, { R: 2.5, amb: 0.22, bulge: { cx: 15.5, cy: 9.8, rx: 5.5, ry: 4.5, k: 0.6 } });
  paint(thb, 14, 7, [
    '..yYY',
    '.yYYuu',
    '......',
    '......',
    '.....u',
    '..uuUU',
  ], { y: WASP_Y[0], Y: WASP_Y[1], u: WASP_Y[2], U: WASP_Y[3] });
  // ---------- cabeça pintada à mão: olho composto, rosto amarelo, mandíbulas
  const hb = paint(new Bitmap(w, h), 19, 6, [
    '..322.....',
    '.32112....',
    '3eee22y...',
    '3eWee2Yy..',
    '3eeeeoYYy.',
    '4eeeeoYYY.',
    '4eeeoYYYu.',
    '.4eoYYuumM',
    '..4uuummM.',
    '.....mM...',
  ], {
    1: CHITIN[0], 2: CHITIN[1], 3: CHITIN[2], 4: CHITIN[3], e: '#22122a', o: '#5a3456', W: '#f4e8ff',
    y: WASP_Y[0], Y: WASP_Y[1], u: WASP_Y[2], m: '#c0702c', M: '#7a3a1e',
  });
  // ---------- composição
  b.blit(fwb);
  over(b, ab, { line: 0.4, dark: DK });
  over(b, capBmp, { line: 0.5, dark: DK });
  over(b, stb, { line: 0.4, dark: DK });
  over(b, thb, { line: 0.55, dark: DK });
  over(b, hb, { line: 0.55, dark: DK });
  for (let i = 0; i < em.a.length; i++) if (capT.a[i] || capB.a[i]) em.a[i] = 0;
  // asa próxima translúcida: mistura com o que está atrás
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = nwb.get(x, y);
    if (!c[3]) continue;
    const under = b.get(x, y);
    b.set(x, y, under[3] ? mix(under, c, 0.62) : c);
    if (under[3]) em.set(x, y, 0);
  }
  const WV = C('#5a6ea8');
  const veins = new Mask(w, h)
    .path(f ? [[16, 7], [4, 6]] : [[16, 7], [5, 2]])
    .path(f ? [[11, 6], [7, 4]] : [[11, 5], [7, 6]])
    .and(nearW);
  // nervura principal (escura) + bordo de ataque claro
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (veins.has(x, y) && !thorax.has(x, y)) b.set(x, y, mix(b.get(x, y), WV, 0.85));
  edge(b, nearW, 0, -1, '#ffffff', (x, y) => !thorax.has(x, y));
  const o = outline(b, DK, 0.66, 0.84);
  // ---------- traços finos sem contorno: antenas e pernas
  const thin = (pts, col) => {
    const m = new Mask(w, h).path(pts);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.has(x, y) && !b.alpha(x, y)) o.set(x, y, C(col));
  };
  thin([[24, 6], [25, 4], [27, 2], [28, 2]], '#2a2238');
  thin([[22, 6], [22, 4], [23, 2], [24, 1]], '#3a3050');
  thin([[14, 15], [13, 18], [14, 21]], '#2a2238');
  thin([[17, 15], [17, 19], [18, 21]], '#2a2238');
  thin([[20, 15], [22, 18], [22, 21]], '#2a2238');
  for (const [x, y] of [[13, 18], [17, 18], [22, 18]]) o.set(x, y, C(WASP_Y[2]));
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 5. CÃO DE FERRO (chefe)
const IRON = ['#f0f4fc', '#bcc6dc', '#8c96b6', '#646c8e', '#464c6e', '#30324e', '#1e1e34'];
const IRON_FAR = ['#8a92b0', '#646a8a', '#484c6c', '#323450', '#22223a', '#16162a'];
const BRASS = ['#fff4b8', '#f4c860', '#cc8e38', '#8e5826', '#5a3418'];
const FIRE = ['#ffffff', '#fff4a8', '#ffc648', '#ff8030', '#e0401e', '#8a1e1e'];
const STEAM = ['#ffffff', '#e6eef8', '#c0cce0', '#94a2c2'];
const VISOR = ['#fff0ea', '#ff7a66', '#f0283a', '#9a0c24'];

function rivets(b, pts, light = IRON[0], dark = IRON[5]) {
  for (const [x, y] of pts) {
    b.set(x, y, C(light));
    b.set(x + 1, y + 1, C(dark));
  }
}

function caoFerro(f) {
  const w = 68, h = 52, by = h - 2;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#0e0c1c';
  const d = f ? 1 : 0; // pistões comprimem: corpo desce 1px no alt
  const P = (pts) => pts.map(([x, y]) => [x, y + d]);
  const metal = (m, ramp = IRON, o = {}) => shadeMask(m, ramp, { R: 2.2, amb: 0.18, curve: 1.2, flat: 0.2, vgrad: 0.22, ...o });
  const layer = (bmp, line = 0.55) => over(b, bmp, { line, dark: DK });
  const joint = (jx, jy, r = 1.9) => {
    const jm = new Mask(w, h).ell(jx, jy, r, r);
    layer(shadeMask(jm, BRASS, { R: 1, amb: 0.3, bulge: { cx: jx - 0.6, cy: jy - 0.6, rx: r, ry: r, k: 0.85 } }), 0.6);
  };

  // ---------- vapor (atrás de tudo, saindo das chaminés)
  const steam = new Mask(w, h);
  const puffs = f
    ? [[26.6, 7.6, 2.5, 2.1], [22.4, 5.2, 2.1, 1.8], [18.8, 3.2, 1.5, 1.3], [33.4, 7.8, 1.8, 1.6], [31, 4.4, 1.3, 1.2]]
    : [[27.2, 8, 2.3, 2], [23.6, 6, 2.2, 1.9], [20, 4, 1.6, 1.4], [33.6, 8.2, 1.7, 1.5], [31.6, 5.2, 1.4, 1.2]];
  const stb = new Bitmap(w, h);
  for (const [x, y, rx, ry] of puffs) {
    const pm = new Mask(w, h).ell(x, y, rx, ry);
    steam.add(pm);
    over(stb, shadeMask(pm, STEAM, { R: 1.4, amb: 0.4, bulge: { cx: x - 0.6, cy: y - 0.6, rx: rx + 0.5, ry: ry + 0.5, k: 0.7 } }), { line: 0.25, dark: '#6c7aa0' });
  }
  b.blit(stb);

  // ---------- pernas distantes (atrás do corpo, tom escuro)
  const farHind = new Mask(w, h)
    .poly(P([[24, 27], [31, 27], [31.5, 33], [28.5, 37], [25, 35]]))
    .capsule(28.5, 36 + d, 25.5, 43, 1.7, 1.4).capsule(25.5, 43, 26.5, by - 2.5, 1.4, 1.3)
    .poly([[24.4, by - 2.6], [29.6, by - 2.8], [30.8, by + 0.6], [23.6, by + 0.6]]);
  const farFore = new Mask(w, h)
    .poly(P([[36.5, 29], [42, 29], [41.5, 36], [39, 37.6], [36.5, 35.5]]))
    .capsule(39, 37 + d, 38.6, by - 3, 1.6, 1.4)
    .poly([[36, by - 2.8], [41.6, by - 2.8], [43, by + 0.6], [35.6, by + 0.6]]);
  layer(metal(new Mask(w, h).add(farHind).add(farFore), IRON_FAR, { lift: -0.02 }), 0.4);
  joint(28.5, 36.5 + d, 1.5);
  joint(39, 37 + d, 1.5);

  // ---------- cauda segmentada (ferro) com ponta de exaustão
  const tail = new Mask(w, h)
    .rell(13.6, 20.5 + d, 3, 2.2, -0.75)
    .rell(10.6, 17 + d, 2.6, 2, -1.0)
    .rell(8.6, 13.4 + d, 2.2, 1.8, -1.25);
  layer(metal(tail, IRON, { R: 1.5, lift: 0.04, vgrad: 0 }), 0.5);
  const tip = new Mask(w, h).poly(P([[6.4, 11.4], [7.2, 7.6], [9.6, 8], [9.6, 11.4]]));
  layer(metal(tip, BRASS, { R: 1.2, vgrad: 0 }), 0.5);

  // ---------- chaminés de vapor nas costas (inclinadas p/ trás)
  const pipeA = new Mask(w, h).poly(P([[26.2, 11], [29, 11], [29.8, 19], [27, 19]]));
  const pipeB = new Mask(w, h).poly(P([[32.6, 12], [34.8, 12], [35.4, 19], [33.2, 19]]));
  const stacks = new Mask(w, h).add(pipeA).add(pipeB);
  layer(shadeMask(pipeA, IRON, { R: 1.2, amb: 0.2, bulge: { cx: 27, cy: 12, rx: 3, ry: 30, k: 0.85 } }), 0.5);
  layer(shadeMask(pipeB, IRON, { R: 1.2, amb: 0.2, bulge: { cx: 33.4, cy: 12, rx: 3, ry: 30, k: 0.85 } }), 0.5);
  const rims = new Mask(w, h).rect(25, 10 + d, 5, 2).rect(32, 11 + d, 4, 2);
  layer(shadeMask(rims, BRASS, { R: 1, amb: 0.35, lift: 0.1 }), 0.45);
  paint(b, 26, 10 + d, ['eee', '', '', '', '', '', ''], { e: '#1a1424' });
  paint(b, 33, 11 + d, ['ee'], { e: '#1a1424' });

  // ---------- corpo: placas sobrepostas (garupa, lombo, peito profundo)
  const rear = new Mask(w, h).poly(P([[12.6, 22], [15.6, 18.4], [24, 17.2], [29, 17.6], [29.5, 30.6], [24, 31.6], [17, 31.4], [13, 27.5]]));
  const mid = new Mask(w, h).poly(P([[26, 17.4], [37, 16.4], [39, 17], [39.5, 31], [33, 29.8], [27, 30.6]]));
  const chest = new Mask(w, h).poly(P([[36.5, 16.2], [44, 14], [48.5, 15], [52, 20.4], [53.4, 28], [51.5, 34], [46, 36.4], [40, 36], [36.8, 32]]));
  const belly = new Mask(w, h).poly(P([[22, 29], [41, 29], [40, 33.4], [26, 33.6]]));
  layer(metal(belly, IRON_FAR, { lift: -0.12, vgrad: 0 }), 0.4);
  // tubos sob a barriga
  paint(b, 26, 31 + d, ['bbbbbbbbbbbbb', 'ccccccccccccc'], { b: BRASS[2], c: BRASS[3] });
  layer(metal(rear, IRON, { bulge: { cx: 19, cy: 20, rx: 11, ry: 14, k: 0.45 } }));
  layer(metal(mid, IRON, { bulge: { cx: 32, cy: 20, rx: 10, ry: 16, k: 0.4 } }));
  layer(metal(chest, IRON, { bulge: { cx: 43, cy: 21, rx: 12, ry: 16, k: 0.5 } }));
  for (const m of [rear, mid, chest]) edge(b, m, 0, -1, BRASS[1], (x, y) => y < 20 + d);
  rivets(b, [[15, 22 + d], [27, 20 + d], [27, 26 + d], [37, 20 + d], [37, 26 + d], [46, 17 + d]]);

  // ---------- emblema de engrenagem no ombro
  const gx = 43, gy = 22.5 + d;
  const disc = new Mask(w, h).ell(gx, gy, 6, 6);
  layer(shadeMask(disc, ['#ff9a8a', '#e04a4a', '#b02838', '#7a1a30', '#4e1228'], { R: 1.5, amb: 0.3, bulge: { cx: gx - 1.5, cy: gy - 1.5, rx: 7, ry: 7, k: 0.6 } }), 0.6);
  const gear = new Mask(w, h).fn((px, py) => {
    const dx = px - gx, dy = py - gy;
    const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    return r <= (Math.cos(a * 6) > 0.2 ? 4.6 : 3.4) && r > 1.2;
  });
  layer(shadeMask(gear, BRASS, { R: 1.2, amb: 0.3, bulge: { cx: gx - 1.2, cy: gy - 1.2, rx: 5, ry: 5, k: 0.7 } }), 0.6);

  // ---------- pescoço segmentado (anéis)
  const neck = new Mask(w, h).rell(49, 17.5 + d, 3.8, 5.2, -0.7).rell(52, 15.5 + d, 3.4, 4.8, -0.6);
  layer(metal(neck, IRON, { R: 1.5, lift: -0.06, vgrad: 0 }), 0.6);

  // ---------- fornalha no peito (vigia redonda com grelha)
  const fx = 49.2, fy = 27.4 + d;
  const ring = new Mask(w, h).ell(fx, fy, 4.6, 4.6);
  layer(shadeMask(ring, BRASS, { R: 1.6, amb: 0.25, bulge: { cx: fx - 1, cy: fy - 1, rx: 5, ry: 5, k: 0.5 } }), 0.5);
  const fire = new Mask(w, h).ell(fx, fy, 3.2, 3.2);
  const FI = RAMP(FIRE);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!fire.has(x, y)) continue;
    const r = Math.hypot(x + 0.5 - fx, (y + 0.5 - fy) + 0.7);
    const fl = hash2(x, y, f ? 9 : 4) * 0.7;
    let i = Math.round(r * 1.05 + fl - 0.45);
    const bar = x === Math.floor(fx) - 2 || x === Math.floor(fx) + 1;
    if (bar) i = 5;
    b.set(x, y, FI[Math.max(0, Math.min(5, i))]);
    if (!bar || i < 5) em.set(x, y);
  }

  // ---------- cabeça: elmo angular, orelha cortada, focinho longo, boca aberta
  const hd = P;
  const farEar = new Mask(w, h).poly(hd([[55, 8.6], [57.6, 2], [59.4, 8.4]]));
  layer(metal(farEar, IRON_FAR, { R: 1, vgrad: 0 }), 0.4);
  const ear = new Mask(w, h).poly(hd([[50.6, 10], [51.4, 0.8], [56.6, 8]]));
  layer(metal(ear, IRON, { R: 1.2, vgrad: 0 }), 0.5);
  paint(b, 52, 4 + d, ['d', 'dd', 'dd'], { d: IRON[5] });
  const mouth = new Mask(w, h).poly(hd([[53.5, 19], [65, 19.4], [64.5, 22.4], [55, 23]]));
  const mb = new Bitmap(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mouth.has(x, y)) mb.set(x, y, C(y < 20 + d ? '#3a0c1e' : '#6a1a2a'));
  layer(mb, 0.3);
  const jaw = new Mask(w, h).poly(hd([[53.6, 21.4], [64, 22.2], [63, 25.4], [55.4, 26.4], [52.6, 24]]));
  layer(metal(jaw, IRON, { R: 1.5, lift: -0.08, vgrad: 0.1 }), 0.55);
  const skull = new Mask(w, h).poly(hd([[50, 10], [55.6, 6.4], [60.4, 7.2], [63, 10.4], [66.8, 12.6], [66.8, 18.6], [60, 19.6], [53, 19.6], [49.4, 14.6]]));
  layer(metal(skull, IRON, { R: 2.4, vgrad: 0.12, bulge: { cx: 55, cy: 11, rx: 10, ry: 8, k: 0.5 } }), 0.6);
  // placa de latão na testa e faixa no focinho
  paint(b, 52, 8 + d, ['..yybb', '.yb..', 'yb'], { y: BRASS[0], b: BRASS[1] });
  // junta do elmo (placa da nuca) e bochecha
  const seam = new Mask(w, h).path(hd([[53.4, 11.6], [54.6, 15], [54.2, 19]])).and(skull);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (seam.has(x, y)) { b.set(x, y, C(IRON[5])); if (skull.has(x + 1, y)) b.set(x + 1, y, C(IRON[1])); }
  paint(b, 60, 17 + d, ['bbbbbbb', 'ccccccc'], { b: BRASS[2], c: BRASS[3] });
  // viseira (fenda) brilhando
  const V = { k: '#14081a', r: VISOR[2], R: VISOR[1], W: VISOR[0], d: VISOR[3] };
  paint(b, 55, 11 + d, [
    'kkkkkkkk.',
    'kdrRWWRrk',
    '.kkkkkkk',
  ], V);
  for (let x = 56; x <= 63; x++) em.set(x, 12 + d);
  // dentes (superiores e inferiores) e narina
  paint(b, 56, 19 + d, ['t.t.t.t.t'], { t: '#eef2fa' });
  paint(b, 57, 21 + d, ['t.t.t.t'], { t: '#c0c8dc' });
  paint(b, 66, 14 + d, ['n'], { n: '#1a1424' });
  rivets(b, [[51, 13 + d], [52, 17 + d], [56, 24 + d]]);

  // ---------- pernas próximas: traseira (coxa blindada + pistão) e dianteira
  const hindThigh = new Mask(w, h).poly(P([[13.4, 23.6], [24.5, 23.4], [26.5, 31], [23.4, 36.6], [16.5, 35.4], [13, 29.6]]));
  const foreUp = new Mask(w, h).poly(P([[40.5, 26.6], [46.6, 27.8], [46.4, 35], [44, 37.4], [40.6, 35.8]]));
  const hindLow = new Mask(w, h).capsule(22.6, 36.6 + d, 17.6, 43.4, 2, 1.6).capsule(17.6, 43.4, 19.6, by - 2.6, 1.6, 1.4);
  const foreLow = new Mask(w, h).capsule(43.6, 37.4 + d, 44.2, by - 3, 1.9, 1.6);
  layer(shadeMask(hindLow, IRON, { R: 1.5, amb: 0.2, bulge: { cx: 18, cy: 44, rx: 4, ry: 10, k: 0.75 } }));
  layer(shadeMask(foreLow, IRON, { R: 1.5, amb: 0.2, bulge: { cx: 43, cy: 46, rx: 3, ry: 10, k: 0.75 } }));
  // hastes de pistão (cromadas) ao lado das canelas
  paint(b, 20, 39 + d, ['g', '.g', '..'], { g: IRON[0] });
  paint(b, 46, 39 + d, ['g', 'g', 'g', 'G'], { g: IRON[0], G: IRON[2] });
  const paws = new Mask(w, h)
    .poly([[16.4, by - 2.6], [22.6, by - 3], [24.8, by + 0.6], [15.6, by + 0.6]])
    .poly([[41, by - 3], [46.6, by - 3], [49, by + 0.6], [40.4, by + 0.6]]);
  layer(metal(paws, IRON, { R: 1.4, lift: 0.04, vgrad: 0 }));
  for (const [x, y] of [[25, by], [49, by], [23, by], [47, by]]) paint(b, x, y - 1, ['c', 'C'], { c: '#eef2fa', C: '#8c96b6' });
  paint(b, 19, by - 1, ['k..k', 'k..k'], { k: IRON[5] });
  paint(b, 43, by - 1, ['k..k', 'k..k'], { k: IRON[5] });
  layer(metal(hindThigh, IRON, { bulge: { cx: 18, cy: 28, rx: 9, ry: 10, k: 0.5 } }));
  layer(metal(foreUp, IRON, { bulge: { cx: 42, cy: 31, rx: 6, ry: 9, k: 0.5 } }));
  edge(b, hindThigh, 0, -1, BRASS[1]);
  edge(b, foreUp, 0, -1, BRASS[1]);
  for (const [jx, jy, r] of [[22.8, 36.2 + d, 2.1], [43.6, 37.2 + d, 2.1], [17.6, 43.4, 1.6]]) joint(jx, jy, r);
  rivets(b, [[16, 27 + d], [23, 26 + d], [42, 30 + d], [44, 34 + d]]);

  const o = outline(b, DK, 0.7, 0.86);
  // vapor: contorno suave
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (b.alpha(x, y)) continue;
    const nb = [[0, -1], [-1, 0], [1, 0], [0, 1]];
    const nbSteam = nb.some(([dx, dy]) => steam.has(x + dx, y + dy) && !stacks.has(x + dx, y + dy) && !rims.has(x + dx, y + dy));
    const nbOther = nb.some(([dx, dy]) => b.alpha(x + dx, y + dy) && !steam.has(x + dx, y + dy));
    if (nbSteam && !nbOther) o.set(x, y, C('#7684aa'));
  }
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 6. MORCEGO DE CRISTAL
const AMETHYST = ['#fff2ff', '#e8ccff', '#c8a0f8', '#a074e6', '#7a4ec8', '#56329c', '#38206c'];
const BAT_FUR = ['#a294b4', '#76668c', '#544468', '#3a2e4c', '#261e34'];

// Prisma de cristal alongado (base -> ponta): face superior clara, inferior
// escura, aresta central brilhante e ponta emissiva.
function shard(b, x0, y0, x1, y1, wid, ramp, em, glowTip = true) {
  const A = RAMP(ramp);
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  // lado "de cima" (voltado para a luz cima-esquerda) é o de normal com
  // componente (-0.55,-0.65) positiva
  const litSign = nx * -0.55 + ny * -0.65 >= 0 ? 1 : -1;
  const pts = [];
  for (let y = Math.floor(Math.min(y0, y1) - wid - 1); y <= Math.ceil(Math.max(y0, y1) + wid + 1); y++) {
    for (let x = Math.floor(Math.min(x0, x1) - wid - 1); x <= Math.ceil(Math.max(x0, x1) + wid + 1); x++) {
      const px = x + 0.5 - x0, py = y + 0.5 - y0;
      const t = (px * ux + py * uy) / L;
      if (t < 0 || t > 1) continue;
      const half = wid * (t < 0.7 ? 0.55 + 0.45 * (t / 0.7) : (1 - t) / 0.3);
      const sd = px * nx + py * ny;
      if (Math.abs(sd) > half) continue;
      let i;
      if (Math.abs(sd) < 0.5) i = t > 0.75 ? 0 : 1;
      else i = sd * litSign > 0 ? (t > 0.55 ? 2 : 3) : (t > 0.7 ? 4 : 5);
      pts.push([x, y, i, t]);
    }
  }
  for (const [x, y, i, t] of pts) {
    b.set(x, y, A[Math.min(A.length - 1, i)]);
    if (glowTip && em && (t > 0.82 || (i === 0))) em.set(x, y);
  }
}

function batWing(b, sh, wr, tips, root, em) {
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  // membrana escura (silhueta da asa) com borda de fuga recortada
  const poly = [sh, wr];
  const seq = [...tips, root];
  for (let i = 0; i < seq.length - 1; i++) {
    poly.push(seq[i]);
    poly.push(lerp(lerp(seq[i], seq[i + 1], 0.5), wr, 0.32));
  }
  poly.push(root);
  const mem = new Mask(b.w, b.h).poly(poly);
  b.blit(shadeMask(mem, ['#6a5288', '#4e3a6c', '#3a2a54', '#2a1e3e'], { R: 1.5, amb: 0.3, lift: -0.05 }));
  // braço (ombro -> pulso)
  const arm = new Mask(b.w, b.h).capsule(sh[0], sh[1], wr[0], wr[1], 1.3, 0.9);
  over(b, shadeMask(arm, BAT_FUR, { R: 1, amb: 0.3 }), { line: 0.4, dark: '#140a22' });
  // prismas de cristal saindo do braço em leque
  tips.forEach((t, i) => {
    const base = lerp(wr, sh, i * 0.26);
    shard(b, base[0], base[1], t[0], t[1], i === 0 ? 1.5 : 1.8, AMETHYST, em);
  });
}

function morcego(f) {
  const w = 34, h = 24;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#140a22';
  const cx = 17.5, cy = 13.5;
  // ---------- asas (abertas para cima no idle, para baixo no alt)
  const L = f
    ? { sh: [14, 11.5], wr: [7, 12], tips: [[1, 9], [1.6, 16.6], [6, 21]], root: [13.6, 16] }
    : { sh: [14, 11], wr: [8, 5], tips: [[1, 1.6], [1, 10], [4.6, 15]], root: [14, 15.4] };
  const R = f
    ? { sh: [21, 11.5], wr: [27, 12], tips: [[32.6, 9.4], [31.6, 16.4], [27.4, 20.4]], root: [21.4, 16] }
    : { sh: [21, 11], wr: [26, 5.4], tips: [[32.6, 2.4], [32.4, 9.8], [29, 14.4]], root: [21, 15.4] };
  const wl = new Bitmap(w, h), wrb = new Bitmap(w, h);
  batWing(wl, L.sh, L.wr, L.tips, L.root, em);
  batWing(wrb, R.sh, R.wr, R.tips, R.root, em);
  b.blit(wl);
  over(b, wrb, { line: 0.3, dark: DK });
  // ---------- corpo peludo, orelhas, pés
  const body = new Mask(w, h).ell(cx, cy + 0.6, 4.2, 4.8).ell(cx + 0.4, cy - 3.4, 3.4, 3);
  const ears = new Mask(w, h).poly([[15, cy - 4], [14.6, cy - 9], [17.6, cy - 5]]).poly([[18.6, cy - 5], [21.6, cy - 9.4], [21, cy - 4]]);
  const fb = shadeMask(new Mask(w, h).add(body).add(ears), BAT_FUR, { R: 2, amb: 0.22, bulge: { cx: cx - 1, cy: cy - 2, rx: 5, ry: 7, k: 0.55 } });
  over(b, fb, { line: 0.55, dark: DK });
  // interior das orelhas, olhos, nariz e presas (rosto virado à direita)
  const F = { i: '#c06a9a', I: '#7a3a6a', e: '#ff5a8a', E: '#fff0f6', k: '#1a0e22', t: '#ffffff', n: '#2a1a34' };
  paint(b, 15, Math.round(cy - 8), ['.', 'i', 'iI', ''], F);
  paint(b, 20, Math.round(cy - 8), ['.i', 'iI', 'I'], F);
  paint(b, 17, Math.round(cy - 4), [
    'kE.kE',
    '.e..e',
    '..nn.',
    '..t.t',
  ], F);
  // pezinhos com garras
  paint(b, 16, Math.round(cy + 5), ['k..k', 'kk.kk'], { k: BAT_FUR[4] });
  // tufo de pelo claro no peito
  paint(b, 17, Math.round(cy) + 1, ['.l', 'lLl', '.L'], { l: BAT_FUR[1], L: BAT_FUR[2] });
  const o = outline(b, DK, 0.68, 0.86);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 7. LODO AMETISTA (variação da Gotícula)
const AMETHYST_SLIME = ['#f4d8ff', '#cc9cf4', '#a670dc', '#8650c4', '#6634a4', '#4a2280', '#301656'];
const QUARTZ_SHARD = ['#ffffff', '#fff0fc', '#ffd0f0', '#e8a0e0', '#b06ac0', '#6e3a8e'];

function lodo(f) {
  const w = 26, h = 26;
  const em = new Mask(w, h);
  // mesmo desenho da gotícula, recolorido em ametista
  const { b, m, cx, cy, rx } = drawDroplet(f, AMETHYST_SLIME, w, h, { e: '#1c0a30', m: '#2a0c40', t: '#ff7ab8' }, 0.62);
  // cristal cravado no topo (a base aparece através da geleia)
  const sh = new Bitmap(w, h);
  const sy = f ? 1.5 : 0;
  shard(sh, 11, cy + 1, 8.2, 1.4 + sy, 3.2, QUARTZ_SHARD, em);
  shard(sh, 14.2, cy, 16.6, 7.6 + sy, 1.8, QUARTZ_SHARD, em);
  shard(sh, 8.4, cy + 1, 4.6, 8 + sy, 1.5, QUARTZ_SHARD, em);
  const inside = new Bitmap(w, h), outside = new Bitmap(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = sh.get(x, y);
    if (!c[3]) continue;
    if (m.has(x, y) && m.has(x, y - 1)) {
      // só a parte logo abaixo da superfície aparece através da geleia
      if (!m.has(x, y - 3)) inside.set(x, y, mix(b.get(x, y), c, m.has(x, y - 2) ? 0.35 : 0.6));
    } else outside.set(x, y, c);
    if (m.has(x, y) && m.has(x, y - 1)) em.set(x, y, 0);
  }
  b.blit(inside);
  over(b, outside, { line: 0.45, dark: '#1a0a2e' });
  // facetas de cristal pontilhando a geleia
  paint(b, Math.round(cx + rx - 5), Math.round(cy - 2), ['a', 'A'], { a: QUARTZ_SHARD[1], A: QUARTZ_SHARD[4] });
  paint(b, Math.round(cx - 7), Math.round(cy + 3), ['a'], { a: QUARTZ_SHARD[3] });
  const o = outline(b, '#22103a', 0.7, 0.86);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 8. ARANHA DE QUARTZO
const SPIDER = ['#a49cc8', '#726a9c', '#4e4676', '#363056', '#24203c', '#16132a'];
const SPIDER_FAR = ['#403a60', '#2e2a4a', '#221e38', '#18152a', '#100e1e'];
const QUARTZ = ['#ffffff', '#e6e4ff', '#c0baf2', '#968cd8', '#6e62b4', '#4a3e86'];

function aranha(f) {
  const w = 42, h = 28, by = h - 2;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#0e0a18';
  const bob = f ? 1 : 0;
  const k = (i) => (f ? (i % 2 ? -1 : 1) : 0);
  // pernas: [ombro, joelho, ponta] — arcos claros, abertos em leque
  const NEAR = [
    [[30.4, 18.2 + bob], [37.6, 12.6 + k(0)], [40.6, by]],
    [[28.4, 18.8 + bob], [33.6, 15.8 + k(1)], [34.4, by]],
    [[25.6, 18.6 + bob], [20.6, 11.6 + k(2)], [17.6, by]],
    [[24.4, 17.8 + bob], [13.6, 10.6 + k(3)], [6.2, by - 0.2]],
  ];
  const FAR = [
    [[30, 15 + bob], [33.8, 8.8 - k(0)], [37.2, by - 2.2]],
    [[28.4, 15 + bob], [26.8, 9 - k(1)], [25.2, by - 2]],
    [[26.4, 15 + bob], [19.4, 8.4 - k(2)], [12.4, by - 2]],
    [[25.4, 15 + bob], [10.6, 7.6 - k(3)], [1.6, by - 2.6]],
  ];
  const legLayer = (legs, ramp, r0 = 1.05, lift = 0.04) => {
    const m = new Mask(w, h);
    for (const [a, kn, t] of legs) {
      const bend = [kn[0] + (t[0] - kn[0]) * 0.68, kn[1] + (t[1] - kn[1]) * 0.68 + 0.4];
      m.capsule(a[0], a[1], kn[0], kn[1], r0, r0 * 0.9).capsule(kn[0], kn[1], bend[0], bend[1], r0 * 0.9, r0 * 0.75).capsule(bend[0], bend[1], t[0], t[1], r0 * 0.7, 0.5);
    }
    const lb = shadeMask(m, ramp, { R: 1, amb: 0.3, lift });
    // juntas mais claras
    for (const [, kn] of legs) lb.set(Math.round(kn[0] - 0.5), Math.round(kn[1] - 1), C(ramp[0]));
    return lb;
  };
  b.blit(legLayer(FAR, SPIDER_FAR, 0.95));
  // ---------- abdômen rochoso com drusa de quartzo
  const ab = new Mask(w, h).ell(13.6, 15.4 + bob, 8.8, 6.6);
  over(b, shadeMask(ab, SPIDER, { R: 3, amb: 0.2, curve: 1.15, bulge: { cx: 11.5, cy: 13, rx: 10, ry: 8, k: 0.6 } }), { line: 0.45, dark: DK });
  for (const [x0, y0, x1, y1] of [[6, 18, 10, 20], [12, 21, 17, 21], [19, 19, 21, 17]]) {
    const m = new Mask(w, h).path([[x0, y0 + bob], [x1, y1 + bob]]).and(ab);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.has(x, y)) b.set(x, y, C(SPIDER[4]));
  }
  const qb = new Bitmap(w, h);
  const crystals = [
    [11, 13, 8.6, 1.4, 2.8], [14.6, 12.6, 17, 3.6, 2.3], [7.4, 14.6, 3.4, 7.2, 2],
    [18.4, 13.6, 21.6, 8.2, 1.6], [12.6, 13.6, 12.8, 7, 1.4],
  ];
  for (const [x0, y0, x1, y1, wd] of crystals) shard(qb, x0, y0 + bob, x1, y1 + bob, wd, QUARTZ, em);
  over(b, qb, { line: 0.55, dark: DK });
  // ---------- cefalotórax
  const ce = new Mask(w, h).ell(26.6, 16 + bob, 5, 3.8).ell(30.8, 15.6 + bob, 3, 2.8);
  over(b, shadeMask(ce, SPIDER, { R: 2, amb: 0.22, bulge: { cx: 26, cy: 14, rx: 6, ry: 5, k: 0.6 } }), { line: 0.55, dark: DK });
  // ---------- pernas próximas (na frente de tudo)
  over(b, legLayer(NEAR, SPIDER, 1.1, 0.12), { line: 0.5, dark: DK });
  // ---------- rosto: 4 olhos vermelhos + quelíceras de quartzo
  const E = { r: '#ff2a44', R: '#ffd2da', o: '#b01030', k: '#120c1c', q: QUARTZ[1], Q: QUARTZ[4] };
  paint(b, 29, Math.round(12 + bob), [
    '.kkk',
    'kRrkk',
    'kokRr',
    '.kRro',
  ], E);
  paint(b, 32, Math.round(17 + bob), ['qk', 'Qq', '.Q'], E);
  for (const [x, y] of [[30, 13], [31, 13], [32, 14], [33, 14], [31, 15], [32, 15]]) em.set(x, y + bob);
  // brilho de cristal no dorso do cefalotórax
  paint(b, 25, Math.round(13 + bob), ['.ab', 'aA'], { a: QUARTZ[2], b: QUARTZ[0], A: QUARTZ[4] });
  em.set(27, 13 + bob);
  const o = outline(b, DK, 0.68, 0.86);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 9. TATU-ROCHA
const ROCK = ['#ddd0c4', '#b0a0a0', '#867888', '#62566e', '#463c56', '#30283e', '#201a2c'];
const GEM_EYE = ['#eaffff', '#7af0ff', '#2ab4e0', '#1a6aa0'];

function tatu(f) {
  const w = 38, h = 28, by = h - 2;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#120e1c';
  const br = f ? 0.7 : 0; // respiração: casco infla
  const cx = 16.6, rx = 14.4 + br * 0.5, ry = 11.6 + br, cy = by - ry + 0.6;
  const RK = RAMP(ROCK);
  const L = [-0.55, -0.65, 0.55];
  const Ln = Math.hypot(...L);
  // ---------- casco: esfera achatada na base, faixas verticais (meridianos)
  const shell = new Mask(w, h).fn((px, py) => {
    const dx = (px - cx) / rx, dy = (py - cy) / ry;
    const bump = (valueNoise(Math.atan2(dy, dx) * 2.4 + 9, 1.5, 13) - 0.5) * 0.14;
    return dx * dx + dy * dy <= 1 + bump && py <= by + 1;
  });
  const NB = 7;
  const sb = new Bitmap(w, h);
  const bandOf = (x, y) => {
    const v = (y + 0.5 - cy) / ry;
    const rr = Math.sqrt(Math.max(0.0001, 1 - v * v));
    const u = Math.max(-1, Math.min(1, (x + 0.5 - cx) / (rx * rr)));
    const tb = (Math.asin(u) + Math.PI / 2) / Math.PI * NB + (valueNoise(x / 1.8, y / 2.4, 21) - 0.5) * 0.45;
    return [Math.max(0, Math.min(NB - 1, Math.floor(tb))), tb - Math.floor(tb), v, rr];
  };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!shell.has(x, y)) continue;
    const [band, fr, v, rr] = bandOf(x, y);
    const thc = ((band + 0.5) / NB) * Math.PI - Math.PI / 2 + (fr - 0.5) * 0.7;
    const n = [Math.sin(thc) * rr, v, Math.cos(thc) * rr];
    let lum = 0.14 + 0.86 * Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / Ln);
    lum += (hash2(band, 3, 5) - 0.5) * 0.12 + (valueNoise(x / 3, y / 3, 7) - 0.5) * 0.08;
    let i = Math.round((1 - lum) * (RK.length - 1));
    const [bl] = bandOf(x - 1, y);
    const [br2] = bandOf(x + 1, y);
    if (bl !== band && shell.has(x - 1, y)) i = Math.max(0, i - 2); // aresta da placa que se sobrepõe
    if (br2 !== band && shell.has(x + 1, y)) i = RK.length - 2; // sulco
    sb.set(x, y, RK[Math.max(0, Math.min(RK.length - 1, i))]);
  }
  // luz refletida (roxa) na borda inferior direita
  edge(sb, shell, 1, 1, '#6e5a90', (x, y) => y > cy + 3 && x > cx);
  edge(sb, shell, 0, 1, '#5a4a7a', (x, y) => x > cx - 4 && x < cx + 8);
  b.blit(sb);
  // rachaduras desenhadas à mão
  paint(b, 6, Math.round(cy - 3), ['k', 'k', '.k'], { k: RK[4] });
  paint(b, 18, Math.round(cy + 4), ['.k', 'k'], { k: RK[5] });
  // gemas incrustadas no casco
  for (const [gx, gy] of [[11, cy - 6], [20, cy - 8], [7, cy + 2]]) {
    paint(b, Math.round(gx), Math.round(gy), ['ab', 'bc'], { a: AMETHYST[0], b: AMETHYST[2], c: AMETHYST[4] });
    em.set(Math.round(gx), Math.round(gy));
  }
  // ---------- pés com garras (embaixo)
  const feet = new Mask(w, h).ell(9.6, by - 0.2, 3, 1.6).ell(22.4, by - 0.2, 3.2, 1.6).clip((x, y) => y < by + 1);
  over(b, shadeMask(feet, ROCK, { R: 1, amb: 0.2, lift: -0.25 }), { line: 0.5, dark: DK });
  paint(b, 11, by, ['c.c'], { c: ROCK[1] });
  paint(b, 24, by, ['c.c'], { c: ROCK[1] });
  // ---------- cauda blindada enrolada na frente
  const tail = new Mask(w, h).capsule(27.4, by - 1.6, 31.2, by - 3.8, 1.6, 1.0);
  over(b, shadeMask(tail, ROCK, { R: 1, amb: 0.22, lift: -0.05 }), { line: 0.55, dark: DK });
  // ---------- cabeça espiando à direita (escudo + focinho)
  const hx = 29.6 + (f ? 0.6 : 0), hy = by - 9.4;
  const head = new Mask(w, h)
    .ell(hx, hy, 4.2, 3.6)
    .poly([[hx + 1, hy - 2.6], [hx + 7.2, hy + 1.6], [hx + 6.6, hy + 3], [hx + 1, hy + 3.4]]);
  const ear = new Mask(w, h).poly([[hx - 2.6, hy - 2.4], [hx - 3.4, hy - 6.4], [hx + 0.2, hy - 3.2]]);
  over(b, shadeMask(ear, ROCK, { R: 1, amb: 0.25, lift: 0.05 }), { line: 0.5, dark: DK });
  over(b, shadeMask(head, ROCK, { R: 2, amb: 0.22, bulge: { cx: hx, cy: hy - 1, rx: 6, ry: 5, k: 0.5 }, lift: 0.04 }), { line: 0.6, dark: DK });
  // escudo da cabeça (placa) e olho de gema
  const ix = Math.round(hx), iy = Math.round(hy);
  paint(b, ix - 3, iy - 3, ['.lll', 'lLLLl', '.....'], { l: ROCK[0], L: ROCK[1] });
  paint(b, ix + 1, iy - 1, ['kab', '.cd'], { k: DK, a: GEM_EYE[0], b: GEM_EYE[1], c: GEM_EYE[2], d: GEM_EYE[3] });
  em.set(ix + 2, iy - 1).set(ix + 3, iy - 1).set(ix + 2, iy);
  paint(b, ix + 7, iy + 1, ['n'], { n: '#2a1e2a' });
  paint(b, ix + 2, iy + 3, ['mmm'], { m: ROCK[5] });
  const o = outline(b, DK, 0.7, 0.86);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ 10. GOLEM AMETISTA (chefe)
const GROCK = ['#cec4dc', '#a094b8', '#786c94', '#584e74', '#3e3656', '#2a243c', '#1a1628'];
const GROCK_FAR = ['#7a7096', '#5e5678', '#46405e', '#322c46', '#221e32', '#161322'];
const CORE = ['#ffffff', '#ffe0fa', '#ff9ee8', '#f05cd0', '#b832a8', '#6e1a74'];

// textura de rocha: células de voronoi com fendas escuras e variação por bloco
function rockTex(seed, scale = 9, crack = 0.05) {
  return (x, y) => {
    const v = voronoi(x / scale, y / scale, seed);
    let t = (v.id - 0.5) * 0.12;
    if (v.edge < crack) t -= 0.38;
    else if (v.edge < crack * 2.4) t += 0.07; // aresta clara junto à fenda
    return t;
  };
}

// caminho irregular (fenda) de p0 a p1
function jag(p0, p1, n, amp, seed) {
  const pts = [p0];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0];
    const l = Math.hypot(nx, ny) || 1;
    const o = (hash2(i, seed, 77) - 0.5) * 2 * amp;
    pts.push([p0[0] + (p1[0] - p0[0]) * t + (nx / l) * o, p0[1] + (p1[1] - p0[1]) * t + (ny / l) * o]);
  }
  pts.push(p1);
  return pts;
}

function golem(f) {
  const w = 76, h = 84, by = h - 2;
  const b = new Bitmap(w, h);
  const em = new Mask(w, h);
  const DK = '#0c0a14';
  const RIMC = '#9a7ad8';
  const d = f ? 1 : 0; // respiração: tronco sobe no alt (punhos e pernas fixos)
  const U = (pts) => pts.map(([x, y]) => [x, y - d]);
  const rock = (m, ramp, o = {}) => shadeMask(m, ramp, { R: 5, amb: 0.2, curve: 0.95, vgrad: 0.14, tex: rockTex(o.seed || 3, o.scale || 8), ...o });
  const lay = (bmp, line = 0.55, shadow = 0) => over(b, bmp, { line, dark: DK, shadow });
  const rimR = (m, test = null) => edge(b, m, 1, 0, RIMC, test);
  const crystalCluster = (list) => {
    const cb = new Bitmap(w, h);
    for (const [x0, y0, x1, y1, wd] of list) shard(cb, x0, y0 - d, x1, y1 - d, wd, AMETHYST, em);
    lay(cb, 0.5);
  };

  // ---------- braço distante (direita da imagem, atrás do tronco)
  const farArm = new Mask(w, h)
    .capsule(59, 30 - d, 64.6, 45 - d, 6, 5.2)
    .capsule(64.6, 45 - d, 65.6, 60, 5.4, 6.2);
  lay(rock(farArm, GROCK_FAR, { seed: 11, bulge: { cx: 59, cy: 42, rx: 8, ry: 20, k: 0.55 } }), 0.4);
  rimR(farArm);
  const farFist = new Mask(w, h).ell(64.4, 73.4, 8.6, 8.4).ell(70.4, 68.4, 3.2, 3).ell(71.6, 73.6, 3.2, 3).ell(70.8, 78.4, 3, 2.8).clip((x, y) => y < by + 1);
  lay(rock(farFist, GROCK_FAR, { seed: 12, R: 5, bulge: { cx: 62, cy: 64, rx: 12, ry: 14, k: 0.55 } }), 0.45);
  rimR(farFist);
  for (const fy of [71, 76]) {
    const m = new Mask(w, h).path([[67.6, fy], [73, fy]]).and(farFist);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.has(x, y)) b.set(x, y, C(GROCK_FAR[4]));
  }
  // ---------- perna distante
  const farLeg = new Mask(w, h).poly([[42, 62], [52, 62], [52.4, 74], [54.6, 77], [55, by + 0.6], [41, by + 0.6], [41.4, 76]]).ell(47, 69, 5.4, 4);
  lay(rock(farLeg, GROCK_FAR, { seed: 13, bulge: { cx: 46, cy: 68, rx: 10, ry: 16, k: 0.45 } }), 0.4);
  rimR(farLeg);
  // ---------- ombro distante + cristais
  const farSh = new Mask(w, h).ell(57, 26.6 - d, 9, 8.4);
  lay(rock(farSh, GROCK_FAR, { seed: 14, bulge: { cx: 54, cy: 23, rx: 10, ry: 10, k: 0.65 }, lift: 0.1 }), 0.45);
  crystalCluster([[56, 21, 61, 5, 3.2], [59.6, 23, 68, 12.4, 2.6], [53, 22, 51.6, 10.6, 2.4], [62, 26, 71, 21.6, 2]]);
  // ---------- tronco em V (peito voltado à direita)
  const torso = new Mask(w, h).poly(U([[15, 27], [25, 18], [44, 15.6], [57, 21], [60, 33], [54, 48], [47, 58], [30, 58], [22, 48], [14.6, 37]]));
  lay(rock(torso, GROCK, { seed: 3, R: 7, scale: 10, bulge: { cx: 36, cy: 30, rx: 26, ry: 28, k: 0.55 } }));
  // placa do peitoral
  const pec = new Mask(w, h).poly(U([[33, 27], [48, 23.6], [56, 30], [54, 41], [42, 45], [33, 39]]));
  lay(rock(pec, GROCK, { seed: 5, R: 4, scale: 12, bulge: { cx: 42, cy: 31, rx: 14, ry: 12, k: 0.6 }, lift: 0.06 }), 0.6, 0.25);
  // abdômen em blocos
  const abs1 = new Mask(w, h).poly(U([[32, 44], [44, 44], [44, 50.6], [33, 51]]));
  const abs2 = new Mask(w, h).poly(U([[33, 51.6], [45, 51], [44, 57], [34, 57]]));
  lay(rock(abs1, GROCK, { seed: 21, R: 2.5, scale: 20, lift: -0.08, vgrad: 0 }), 0.4);
  lay(rock(abs2, GROCK, { seed: 22, R: 2.5, scale: 20, lift: -0.14, vgrad: 0 }), 0.4);
  // ---------- cintura e perna próxima
  const belt = new Mask(w, h).ell(38, 60 - d, 14.4, 4.6);
  lay(rock(belt, GROCK, { seed: 6, R: 2.5, lift: -0.1, scale: 6, vgrad: 0 }), 0.55);
  const thigh = new Mask(w, h).ell(30.6, 66, 7.4, 6);
  const shin = new Mask(w, h).poly([[25, 68], [36.4, 68], [37, 77], [24.4, 77]]);
  const foot = new Mask(w, h).ell(30.4, by - 2.4, 9.4, 3.8).clip((x, y) => y < by + 1);
  lay(rock(shin, GROCK, { seed: 7, R: 3, bulge: { cx: 29, cy: 72, rx: 8, ry: 10, k: 0.5 }, lift: -0.06 }), 0.6, 0.2);
  lay(rock(foot, GROCK, { seed: 23, R: 3, scale: 7, bulge: { cx: 28, cy: by - 4, rx: 10, ry: 5, k: 0.6 }, vgrad: 0 }), 0.6);
  lay(rock(thigh, GROCK, { seed: 17, R: 4, scale: 10, bulge: { cx: 29, cy: 64, rx: 8, ry: 7, k: 0.65 }, lift: 0.04 }), 0.6, 0.25);
  // pé: separação dos dedos
  paint(b, 33, by - 2, ['k...k', 'k...k'], { k: GROCK[5] });
  // ---------- cabeça afundada entre os ombros, virada à direita
  const head = new Mask(w, h).poly(U([[32, 16], [36, 9], [45, 7.6], [51.6, 11], [53, 17.6], [51, 23.6], [41, 26], [34, 23]]));
  lay(rock(head, GROCK, { seed: 8, R: 3.5, scale: 9, bulge: { cx: 41, cy: 13, rx: 11, ry: 10, k: 0.6 }, lift: 0.06 }), 0.65);
  crystalCluster([[40, 10, 38.4, 3, 2], [43.6, 9.4, 45.6, 4.4, 1.5]]);
  const hy = 14 - d;
  paint(b, 38, hy - 2, [
    '..lllllllll...',
    '.kkkkkkkkkkkk.',
    '..kpPWWPk.kPWk',
    '...kkkkk...kk',
  ], { l: GROCK[1], k: '#120c1a', p: CORE[3], P: CORE[2], W: CORE[0] });
  for (const x of [41, 42, 43, 44, 45, 50, 51]) em.set(x, hy);
  paint(b, 44, hy + 6, ['kkkkkk', '.mmmm'], { k: '#1a1424', m: GROCK[2] });
  rimR(head);
  // ---------- braço próximo + punho enorme apoiado no chão
  const arm = new Mask(w, h)
    .capsule(13.4, 35 - d, 9.4, 49 - d, 7, 6.2)
    .capsule(9.4, 49 - d, 9, 61, 6.6, 7.2);
  lay(rock(arm, GROCK, { seed: 15, R: 6, bulge: { cx: 9, cy: 44, rx: 9, ry: 20, k: 0.6 } }), 0.6, 0.2);
  // ---------- ombro próximo + cristais grandes
  const sh = new Mask(w, h).ell(19.6, 27.6 - d, 11.6, 10.6);
  lay(rock(sh, GROCK, { seed: 9, R: 6, scale: 9, bulge: { cx: 16, cy: 22.6, rx: 13, ry: 12, k: 0.7 }, lift: 0.12, vgrad: 0.1 }), 0.65, 0.35);
  crystalCluster([[18, 21, 14, 1.6, 3.8], [22.6, 22, 27.6, 6.6, 3.2], [13.2, 24, 5.2, 10.4, 3], [26.6, 23.6, 33.6, 15, 2.4], [9.6, 28, 2.4, 21.6, 2.3]]);
  const fist = new Mask(w, h).ell(9.6, 73.2, 9, 8.6).ell(16.8, 67.6, 3.6, 3.4).ell(18, 73.2, 3.6, 3.4).ell(17.2, 78.4, 3.4, 3.2).clip((x, y) => y < by + 1);
  lay(rock(fist, GROCK, { seed: 16, R: 5, scale: 9, bulge: { cx: 9, cy: 66, rx: 14, ry: 14, k: 0.6 } }), 0.65, 0.2);
  // dedos (sulcos entre os nós) + polegar por cima
  for (const fy of [70.4, 75.8]) {
    const m = new Mask(w, h).path([[13.6, fy], [19.6, fy]]).and(fist);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m.has(x, y)) b.set(x, y, C(GROCK[5]));
  }
  const thumb = new Mask(w, h).capsule(9, 66.4, 15.4, 66.4, 2.4, 2.2);
  lay(rock(thumb, GROCK, { seed: 18, R: 2, scale: 20, lift: 0.04 }), 0.6);
  crystalCluster([[4, 66, 1.6, 59.6, 1.8], [6.6, 65.4, 6.4, 59.4, 1.5]]);
  // ---------- núcleo brilhante no peito + veios de luz irregulares
  const cx = 45, cy = 35 - d;
  const CR = RAMP(CORE);
  const veins = [
    jag([cx, cy], [36, 22 - d], 4, 1.6, 1), jag([cx, cy], [55, 26 - d], 4, 1.4, 2),
    jag([cx, cy], [31, 54 - d], 6, 1.8, 3), jag([cx, cy], [53, 46 - d], 4, 1.4, 4),
    jag([cx, cy], [27, 35 - d], 5, 1.6, 5),
  ];
  const veinM = new Mask(w, h);
  for (const v of veins) veinM.path(v);
  const glowM = new Mask(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (veinM.has(x, y)) for (const [dx, dy] of [[1, 0], [0, 1]]) glowM.set(x + dx, y + dy);
  glowM.sub(veinM);
  const body = new Mask(w, h).add(torso).add(pec);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!body.has(x, y)) continue;
    const dd = Math.hypot(x - cx, y - cy);
    if (veinM.has(x, y)) { b.set(x, y, CR[dd < 9 ? 1 : dd < 15 ? 2 : 3]); em.set(x, y); }
    else if (glowM.has(x, y) && dd < 16) { b.set(x, y, mix(b.get(x, y), CR[4], 0.6)); }
  }
  const rim = new Mask(w, h).ell(cx + 0.5, cy + 0.5, 6.4, 6.6);
  lay(rock(rim, GROCK, { seed: 4, R: 2, lift: -0.14, scale: 30 }), 0.5);
  const core = new Mask(w, h).ell(cx + 0.5, cy + 0.5, 4.8, 5);
  const pulse = f ? 0.4 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!core.has(x, y)) continue;
    const r = Math.hypot((x - cx) / 4.8, (y - cy) / 5);
    const a = Math.atan2(y - cy, x - cx);
    const fac = Math.cos(a * 3 + 0.6) > 0 ? 0 : 1;
    const i = Math.round(r * 3.4 + fac * 0.7 - pulse - 0.3);
    b.set(x, y, CR[Math.max(0, Math.min(5, i))]);
    em.set(x, y);
  }
  const o = outline(b, DK, 0.7, 0.86);
  return { bmp: o, glow: glowOf(o, em) };
}

// ================================================================ export
export const ENEMY_ART_A = {
  goticula: () => pair(goticula),
  cogumelo: () => pair(cogumelo),
  lobo: () => pair(lobo),
  vespa: () => pair(vespa),
  cao_ferro: () => pair(caoFerro),
  morcego: () => pair(morcego),
  lodo: () => pair(lodo),
  aranha: () => pair(aranha),
  tatu: () => pair(tatu),
  golem: () => pair(golem),
};
