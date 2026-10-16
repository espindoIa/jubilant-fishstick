// Sombreamento automático de pixel art a partir de um "mapa de materiais".
//
// Em vez de pintar cada tom à mão, o sprite é desenhado em ASCII com um
// caractere por material (pele, cabelo, tecido, metal...). O renderizador
// deduz o volume (relevo pela distância às bordas), aplica luz direcional com
// rampas de cor com desvio de matiz (sombras puxando para azul/violeta, luzes
// para amarelo quente), oclusão nos encontros de materiais, brilho especular,
// luz de recorte (rim light) do lado oposto à luz, textura por material e
// contorno colorido (sel-out). Resultado: muitas cores e degradês, estilo
// SNES tardio / Octopath, mantendo pixels nítidos.
import { Bitmap, hexToRgb, rgbToHsl, hslToRgb, BAYER4, hash2, mix } from './bitmap.js';
import { valueNoise } from './noise.js';

const LIGHT = norm([-0.62, -0.72, 0.62]); // x direita, y para baixo, z para o observador
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

function norm(v) {
  const l = Math.hypot(...v) || 1;
  return v.map((x) => x / l);
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

function hueToward(h, target, k) {
  let d = target - h;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return (h + d * k + 1) % 1;
}

// Rampa do escuro (0) ao claro (n-1) com desvio de matiz e saturação.
export function hueRamp(base, n = 7, o = {}) {
  const [hd, s, l] = rgbToHsl(typeof base === 'string' ? hexToRgb(base) : base);
  const h = hd / 360; // rgbToHsl/hslToRgb usam graus
  const shadowHue = o.shadowHue ?? 0.7;
  const lightHue = o.lightHue ?? 0.13;
  const shift = o.hueShift ?? 0.09;
  const lMin = o.lMin ?? Math.max(0.05, l * 0.22);
  const lMax = o.lMax ?? Math.min(0.97, l + (1 - l) * 0.7);
  const mid = o.mid ?? 0.58; // posição do tom base na rampa
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? mid : i / (n - 1);
    let L, H, S;
    if (t <= mid) {
      const k = t / mid;
      L = lMin + (l - lMin) * Math.pow(k, 0.9);
      H = hueToward(h, shadowHue, shift * (1 - k) * (s < 0.08 ? 0.5 : 1));
      S = clamp(s * (1 + (o.satBoost ?? 0.18) * (1 - k)) + (s < 0.08 ? 0.06 * (1 - k) : 0));
    } else {
      const k = (t - mid) / (1 - mid);
      L = l + (lMax - l) * k;
      H = hueToward(h, lightHue, shift * 0.8 * k);
      S = clamp(s * (1 - 0.32 * k));
    }
    out.push(hslToRgb([H * 360, S, clamp(L)]));
  }
  return out;
}

// Distância (em px) até a borda do próprio material, propagando só dentro dele.
function distanceInside(ids, W, H, sameFn, cap) {
  const d = new Float32Array(W * H).fill(cap);
  const q = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (ids[i] < 0) {
        d[i] = 0;
        continue;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        const j = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !sameFn(ids[i], ids[j])) {
          d[i] = 1;
          q.push(i);
          break;
        }
      }
    }
  }
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    const x = i % W, y = (i / W) | 0;
    if (d[i] >= cap) continue;
    for (const [dx, dy, c] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [-1, 1, 1.41], [1, -1, 1.41], [-1, -1, 1.41]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (ids[j] < 0 || !sameFn(ids[i], ids[j])) continue;
      const nd = d[i] + c;
      if (nd < d[j]) {
        d[j] = nd;
        q.push(j);
      }
    }
  }
  return d;
}

// textura procedural por material: retorna deslocamento de valor (-1..1)
function texture(kind, x, y, seed) {
  switch (kind) {
    case 'hair': {
      // mechas: listras alongadas na vertical com pontas claras
      const n = valueNoise(x * 0.9 + seed, y * 0.18, seed + 3) - 0.5;
      const s = Math.sin(x * 1.7 + valueNoise(x * 0.3, y * 0.3, seed) * 4) * 0.5;
      return n * 0.9 + s * 0.45;
    }
    case 'cloth':
      return (valueNoise(x * 0.5 + seed, y * 0.5, seed + 5) - 0.5) * 0.7 + ((x + y) % 2 ? 0.06 : -0.06);
    case 'wool':
      return (hash2(x >> 1, y >> 1, seed) - 0.5) * 0.9;
    case 'wood':
      return (valueNoise(x * 0.25 + seed, y * 1.4, seed + 7) - 0.5) * 1.1 + Math.sin(y * 0.9 + valueNoise(x * 0.2, y * 0.2, seed) * 5) * 0.25;
    case 'metal': {
      const band = Math.sin((x * 0.55 - y * 0.25) + seed) * 0.5;
      return band * 0.8 + (hash2(x, y, seed) - 0.5) * 0.15;
    }
    case 'stone':
      return (valueNoise(x * 0.35 + seed, y * 0.35, seed) - 0.5) * 1.2 + (hash2(x, y, seed + 1) > 0.93 ? -0.8 : 0);
    case 'fur':
      return (valueNoise(x * 0.8 + seed, y * 0.35, seed + 9) - 0.5) * 1.1 + (hash2(x, y >> 1, seed) - 0.5) * 0.4;
    case 'scale':
      return ((x + ((y >> 1) & 1) * 2) % 4 === 0 || y % 2 === 0 ? -0.35 : 0.2) + (hash2(x, y, seed) - 0.5) * 0.2;
    case 'leaf':
      return (valueNoise(x * 0.6 + seed, y * 0.6, seed + 2) - 0.5) * 1.3;
    case 'skin':
      return (valueNoise(x * 0.4 + seed, y * 0.4, seed + 4) - 0.5) * 0.25;
    case 'noise':
      return (hash2(x, y, seed) - 0.5) * 0.8;
    default:
      return 0;
  }
}

const DEFAULTS = {
  tones: 7,
  bevel: 3, // arredondamento local do material (px)
  volume: 7, // arredondamento do corpo inteiro (px)
  ambient: 0.26,
  wrap: 0.35,
  relief: 2.4, // força do relevo nas normais
  dither: 0.32,
  rim: '#cfe6ff', // luz de recorte (lado oposto à luz)
  rimAmount: 0.4,
  ao: 0.5,
  topLight: 0.1, // degradê vertical (topo mais claro)
  outline: 'sel', // 'sel' (colorido), 'none' ou '#hex'
  seed: 1,
};

// rows: linhas ASCII ('.' ou ' ' transparente; '#' vinco escuro; demais = materiais)
// mats: { char: { color|ramp, tones, bevel, tex, texAmt, gloss, shine, flat, emissive, rim, outline } }
// Retorna { bmp, glow } (glow = pixels emissivos, para máscara de brilho).
export function shadeMap(rows, mats, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const H = rows.length;
  const W = options.w || Math.max(...rows.map((r) => r.length));
  const chars = Object.keys(mats);
  const idOf = Object.fromEntries(chars.map((c, i) => [c, i]));
  const CREASE = -2;
  const ids = new Int16Array(W * H).fill(-1);
  for (let y = 0; y < H; y++) {
    const r = rows[y];
    for (let x = 0; x < W; x++) {
      const ch = r[x];
      if (ch === undefined || ch === '.' || ch === ' ') continue;
      if (ch === '#' && !mats['#']) {
        ids[y * W + x] = CREASE;
        continue;
      }
      if (idOf[ch] === undefined) throw new Error(`material indefinido '${ch}' (linha ${y}: "${r}")`);
      ids[y * W + x] = idOf[ch];
    }
  }
  // vincos herdam o material vizinho mais comum (para cor), mas contam como borda
  const base = Int16Array.from(ids);
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] !== CREASE) continue;
    const x = i % W, y = (i / W) | 0;
    const cnt = {};
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const v = ids[ny * W + nx];
      if (v >= 0) cnt[v] = (cnt[v] || 0) + 1;
    }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    base[i] = best ? +best[0] : 0;
  }
  const M = chars.map((c) => {
    const m = { tones: o.tones, bevel: o.bevel, tex: 'none', texAmt: 0.5, gloss: 0, shine: 18, rim: true, ...mats[c] };
    m.ramp = m.ramp ? m.ramp.map((v) => (typeof v === 'string' ? hexToRgb(v) : v)) : hueRamp(m.color, m.tones, m);
    m.flatColor = m.color ? hexToRgb(m.color) : m.ramp[Math.floor(m.ramp.length * 0.6)];
    return m;
  });
  const solid = (v) => v !== -1;
  const sameMat = (a, b) => a === b;
  const opaque = new Int16Array(W * H);
  for (let i = 0; i < ids.length; i++) opaque[i] = ids[i] === -1 ? -1 : 0;
  // relevo: material (vinco conta como borda) + silhueta
  const matIds = Int16Array.from(ids, (v, i) => (v === CREASE ? 30000 + i : v));
  const dMat = distanceInside(matIds, W, H, sameMat, 8);
  const dSil = distanceInside(opaque, W, H, () => true, o.volume);
  // perfil esférico (calota) em vez de cone: formas arredondadas, sem facetas
  const cap = (t) => Math.sqrt(Math.max(0, 1 - (1 - clamp(t)) ** 2));
  let hgt = new Float32Array(W * H);
  for (let i = 0; i < ids.length; i++) {
    if (!solid(ids[i])) continue;
    const m = M[base[i]];
    hgt[i] = 0.5 * cap(dMat[i] / Math.max(1, m.bevel)) + 0.5 * cap(dSil[i] / o.volume);
  }
  // suaviza o relevo (2 passadas 3x3 só dentro do sprite)
  for (let pass = 0; pass < (o.smooth ?? 2); pass++) {
    const nh = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!solid(ids[i])) continue;
        let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          sum += hgt[yy * W + xx];
          n++;
        }
        nh[i] = sum / n;
      }
    }
    hgt = nh;
  }
  const hAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : hgt[y * W + x]);
  const bmp = new Bitmap(W, H);
  const glow = new Bitmap(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!solid(ids[i])) continue;
      const m = M[base[i]];
      if (m.flat || m.emissive) {
        const c = m.emissive && m.ramp ? m.ramp[m.ramp.length - 1] : m.flatColor;
        bmp.set(x, y, c);
        if (m.emissive) glow.set(x, y, c);
        continue;
      }
      const nx = -(hAt(x + 1, y) - hAt(x - 1, y)) * o.relief;
      const ny = -(hAt(x, y + 1) - hAt(x, y - 1)) * o.relief;
      const n = norm([nx, ny, 1]);
      const ndl = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
      let v = clamp((ndl + o.wrap) / (1 + o.wrap));
      v = o.ambient + (1 - o.ambient) * v;
      v += (0.5 - y / H) * o.topLight * 2;
      // oclusão: vizinhos de outros materiais / vazio escurecem um pouco
      let occ = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy;
        const j = yy * W + xx;
        const other = xx < 0 || yy < 0 || xx >= W || yy >= H ? true : ids[j] === CREASE || (ids[j] >= 0 && base[j] !== base[i] && dy <= 0);
        if (other) occ += 1 / (dx * dx + dy * dy);
      }
      v -= Math.min(0.22, occ * 0.035) * o.ao;
      if (ids[i] === CREASE) v -= 0.42;
      v += texture(m.tex, x, y, o.seed + base[i] * 13) * m.texAmt * 0.22;
      // especular
      if (m.gloss) {
        const sp = Math.pow(Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]), m.shine) * m.gloss;
        v += sp * 0.9;
      }
      const R = m.ramp;
      let k = clamp(v) * (R.length - 1) + (BAYER4[y & 3][x & 3] / 16 - 0.47) * o.dither;
      k = Math.max(0, Math.min(R.length - 1, Math.round(k)));
      let c = R[k];
      // luz de recorte: borda da silhueta do lado de baixo/direita
      if (m.rim !== false && o.rimAmount > 0 && dSil[i] <= 1.01 && n[0] * 0.8 + n[1] * 0.5 > 0.08) {
        c = mix(c, hexToRgb(o.rim), o.rimAmount * (0.6 + 0.4 * clamp(n[0])));
      }
      bmp.set(x, y, c);
    }
  }
  // contorno colorido (sel-out): o tom mais escuro do vizinho; mais claro onde bate luz
  if (o.outline !== 'none') {
    const fixed = typeof o.outline === 'string' && o.outline.startsWith('#') ? hexToRgb(o.outline) : null;
    const out = bmp.clone();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (solid(ids[y * W + x])) continue;
        let best = null, lit = false;
        for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (!solid(ids[j])) continue;
          best = base[j];
          if (dx === 1 || dy === 1) lit = true; // pixel vizinho fica à direita/abaixo => contorno do lado iluminado
        }
        if (best === null) continue;
        const m = M[best];
        if (fixed) out.set(x, y, fixed);
        else if (m.outline) out.set(x, y, hexToRgb(m.outline));
        else out.set(x, y, mix(m.ramp[0], [12, 8, 24], lit ? 0.35 : 0.6));
      }
    }
    return { bmp: out, glow };
  }
  return { bmp, glow };
}

// Atalho: só o bitmap.
export function shaded(rows, mats, options) {
  return shadeMap(rows, mats, options).bmp;
}
