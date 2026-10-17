// Pintura procedural do chão de um mapa inteiro (16 px por tile), com
// transições orgânicas entre materiais, decoração e oclusão nas bordas.
import { Bitmap, hexToRgb, hash2, mix } from './bitmap.js';
import { fbm, valueNoise, voronoi } from './noise.js';

export const PPU = 16;

const C = (h) => hexToRgb(h);

// Paletas de materiais (claro → escuro)
export const MAT = {
  grass: ['#e5e4a6', '#b9d583', '#7e9e4c', '#293e35', '#172635'],
  forest: ['#e4dfa1', '#b8cd79', '#738c43', '#23382f', '#172637'],
  dirt: ['#e2bc84', '#c99c62', '#a97c4a', '#865e38', '#5e4028'],
  path: ['#eee4c7', '#d5c8a7', '#a89e8c', '#625b51', '#302d35'],
  plaza: ['#f4dfb2', '#dfc193', '#b49e7c', '#695640', '#352d33'],
  sand: ['#fbecc0', '#f0d9a0', '#dcc082', '#bea066', '#8e744c'],
  plank: ['#e0a868', '#c48848', '#a06a38', '#784c28', '#4c2e18'],
  cave: ['#d6cdea', '#aea4d2', '#8479b0', '#5f5690', '#3b3468'],
  crystal: ['#c8b0ff', '#9a80ee', '#7058cc', '#4e3aa0', '#2e2470'],
  metal: ['#e2e5e9', '#bdc6d7', '#7b87a2', '#444e6c', '#252a42'],
  rock: ['#ded5bd', '#b5a68f', '#8c8170', '#48434b', '#242535'],
  snow: ['#ffffff', '#e8eefc', '#ccd6f0', '#a8b4d8', '#7c88b0'],
};

// Caracteres do mapa → material
export const TILE_MAT = {
  g: 'grass', f: 'grass', G: 'forest', d: 'dirt', p: 'path', t: 'plaza', s: 'sand',
  b: 'plank', c: 'cave', k: 'crystal', m: 'metal', r: 'rock', w: 'water', W: 'water',
  x: 'void', S: 'path', o: 'dirt', n: 'snow', h: 'grass', X: 'walltop', R: 'cavetop', F: 'forttop',
};

function pick(pal, n) {
  const i = Math.max(0, Math.min(pal.length - 1, n));
  return C(pal[i]);
}

// --------------------------------------------------------------- pintores
// Cada pintor devolve a cor de um pixel (coordenadas globais em pixels).
const PAINT = {
  grass(x, y, seed) {
    const n = fbm(x / 9, y / 9, seed, 3);
    const n2 = valueNoise(x / 2.2, y / 2.2, seed + 3);
    let k = n > 0.6 ? 1 : n < 0.38 ? 3 : 2;
    if (n2 > 0.78) k -= 1;
    else if (n2 < 0.16) k += 1;
    return pick(MAT.grass, k);
  },
  forest(x, y, seed) {
    const n = fbm(x / 8, y / 8, seed + 9, 3);
    const n2 = valueNoise(x / 2, y / 2, seed + 4);
    let k = n > 0.62 ? 1 : n < 0.4 ? 3 : 2;
    if (n2 > 0.8) k -= 1;
    else if (n2 < 0.15) k += 1;
    let c = pick(MAT.forest, k);
    // manchas de luz filtrada (quentes) e de sombra funda (azul-petróleo)
    const big = fbm(x / 22, y / 22, seed + 13, 2);
    if (big > 0.6) c = mix(c, [222, 208, 110], 0.2 + (big - 0.6) * 0.8);
    else if (big < 0.36) c = mix(c, [34, 96, 112], 0.28);
    // folhas caídas e flores miúdas
    const r = hash2(x, y, seed + 14);
    if (r > 0.988) return C(r > 0.994 ? '#d98a3a' : '#a8552e');
    if (r < 0.004) return C('#f4f0c8');
    return c;
  },
  dirt(x, y, seed) {
    const n = fbm(x / 7, y / 7, seed + 21, 3);
    const n2 = hash2(x, y, seed + 2);
    let k = n > 0.62 ? 1 : n < 0.36 ? 3 : 2;
    if (n2 > 0.93) k = 1;
    else if (n2 < 0.05) k = 3;
    return pick(MAT.dirt, k);
  },
  path(x, y, seed) {
    // calçamento de pedras arredondadas, sombreadas pela luz de cima/esquerda
    const sx = x / 7.5, sy = y / 6.2;
    const v = voronoi(sx, sy, seed + 31);
    if (v.edge < 0.09) return pick(MAT.path, 4);
    if (v.edge < 0.17) {
      // borda da pedra: escura embaixo/direita, clara em cima/esquerda
      const a = voronoi(sx + 0.12, sy + 0.12, seed + 31);
      return pick(MAT.path, a.edge < v.edge ? 1 : 3);
    }
    let k = 1 + (v.id > 0.66 ? 1 : 0);
    if (hash2(x, y, seed) > 0.94) k += 1;
    return pick(MAT.path, k);
  },
  plaza(x, y, seed) {
    // lajotas retangulares
    const row = Math.floor(y / 8);
    const off = row % 2 ? 6 : 0;
    const lx = (x + off) % 12, ly = y % 8;
    if (lx === 0 || ly === 0) return pick(MAT.plaza, 4);
    if (lx === 11 || ly === 7) return pick(MAT.plaza, 3);
    const id = hash2(Math.floor((x + off) / 12), row, seed + 5);
    let k = 1 + (id > 0.7 ? 1 : 0);
    if (lx === 1 || ly === 1) k = 0;
    if (hash2(x, y, seed) > 0.95) k += 1;
    return pick(MAT.plaza, k);
  },
  sand(x, y, seed) {
    const n = fbm(x / 10, y / 6, seed + 41, 3);
    const r = hash2(x, y, seed + 9);
    let k = n > 0.58 ? 0 : n < 0.4 ? 2 : 1;
    if (r > 0.96) k = 2;
    if (r < 0.02) k = 0;
    // ondulações do vento
    if (((y + Math.floor(n * 6)) % 7) === 0 && r > 0.3) k = Math.min(3, k + 1);
    return pick(MAT.sand, k);
  },
  plank(x, y, seed) {
    // tábuas horizontais de 4px
    const row = Math.floor(y / 4);
    const off = Math.floor(hash2(row, 0, seed) * 16);
    const lx = (x + off) % 16;
    const ly = y % 4;
    if (ly === 3) return pick(MAT.plank, 4);
    if (lx === 0) return pick(MAT.plank, 4);
    if (lx === 3 && ly === 1) return pick(MAT.plank, 3); // prego
    const grain = valueNoise(x / 6, row * 3.1, seed + 3);
    let k = ly === 0 ? 0 : grain > 0.6 ? 1 : 2;
    if (hash2(x, y, seed) > 0.97) k = 3;
    return pick(MAT.plank, k);
  },
  cave(x, y, seed) {
    const v = voronoi(x / 9, y / 7, seed + 51);
    const n = fbm(x / 6, y / 6, seed + 52, 2);
    if (v.edge < 0.07) return C(n > 0.5 ? '#2a2450' : '#231e44');   // fendas azul-noite
    let k = n > 0.6 ? 1 : n < 0.4 ? 3 : 2;
    // luz de cima/esquerda: cada laje clareia no canto superior-esquerdo
    const a = voronoi(x / 9 + 0.1, y / 7 + 0.1, seed + 51);
    if (v.edge < 0.18) k = a.edge < v.edge ? Math.max(0, k - 1) : Math.min(4, k + 1);
    // lajes alternam o matiz: algumas puxam para o magenta, outras para o azul-petróleo
    const hueShift = v.id > 0.72 ? 1 : v.id < 0.2 ? 2 : 0;
    let c = pick(MAT.cave, k);
    if (hueShift === 1) c = mix(c, [140, 90, 170], 0.22);
    if (hueShift === 2) c = mix(c, [70, 120, 160], 0.24);
    // musgo luminescente nas fendas e faíscas de cristal
    const m = valueNoise(x / 3, y / 3, seed + 60);
    if (v.edge < 0.16 && m > 0.78) c = mix(c, [90, 190, 190], 0.3);
    const r = hash2(x, y, seed + 62);
    if (r > 0.9993) return C('#fff2c0');
    if (r > 0.998) return C('#9ee8ff');
    return c;
  },
  crystal(x, y, seed) {
    // lajes de cristal escuras com veios brilhantes ocasionais
    const v = voronoi(x / 9, y / 8, seed + 61);
    if (v.edge < 0.07) return pick(MAT.crystal, 4);
    let k = v.id > 0.8 ? 2 : 3;
    if (v.edge < 0.14) k = Math.max(1, k - 1);
    if (v.d < 0.12 && v.id > 0.6) k = 1;
    return pick(MAT.crystal, k);
  },
  metal(x, y, seed) {
    const lx = x % 16, ly = y % 16;
    const px = Math.floor(x / 16), py = Math.floor(y / 16);
    const id = hash2(px, py, seed + 11);
    if (lx === 0 || ly === 0) return pick(MAT.metal, 4);
    if (lx === 15 || ly === 15) return pick(MAT.metal, 3);
    if ((lx === 2 || lx === 13) && (ly === 2 || ly === 13)) return pick(MAT.metal, 0); // rebites
    if ((lx === 3 || lx === 14) && (ly === 3 || ly === 14)) return pick(MAT.metal, 3);  // sombra do rebite
    // chapa: luz em cima/esquerda, bisel
    let k = ly < 3 || lx < 3 ? 1 : ly > 12 || lx > 12 ? 3 : 2;
    const n = fbm(x / 7, y / 7, seed + 12, 3);
    if (k === 2 && n > 0.62) k = 1;
    if (k === 2 && n < 0.34) k = 3;
    let c = pick(MAT.metal, k);
    // oxidação: painéis alternam entre aço azulado e cobre queimado
    if (id > 0.62) c = mix(c, [176, 104, 60], 0.34 + (n - 0.5) * 0.3);
    else if (id < 0.18) c = mix(c, [90, 130, 150], 0.2);
    // riscos de uso e pontos de ferrugem
    if ((x * 3 + y * 5 + Math.floor(id * 9)) % 23 === 0 && hash2(x, y, seed) > 0.4) c = mix(c, [255, 255, 255], 0.22);
    if (hash2(x, y, seed + 3) > 0.985) c = mix(c, [150, 70, 40], 0.7);
    return c;
  },
  rock(x, y, seed) {
    const v = voronoi(x / 7, y / 6, seed + 71);
    const n = fbm(x / 5, y / 5, seed + 72, 2);
    if (v.edge < 0.08) return pick(MAT.rock, 4);
    let k = n > 0.6 ? 1 : n < 0.42 ? 3 : 2;
    if (v.edge < 0.18) k = Math.min(4, k + 1);
    return pick(MAT.rock, k);
  },
  snow(x, y, seed) {
    const n = fbm(x / 9, y / 9, seed + 81, 3);
    return pick(MAT.snow, n > 0.55 ? 0 : n < 0.4 ? 2 : 1);
  },
  water(x, y, seed) {
    return C('#2b7a8e');
  },
  void() {
    return C('#0c0a14');
  },
  cavetop(x, y, seed) {
    const v = voronoi(x / 8, y / 7, seed + 91);
    const n = fbm(x / 5, y / 5, seed + 92, 2);
    if (v.edge < 0.08) return C('#16102a');
    let c = C(n > 0.62 ? '#4a4070' : n < 0.4 ? '#2a2342' : '#372f58');
    const a = voronoi(x / 8 + 0.1, y / 7 + 0.1, seed + 91);
    if (v.edge < 0.18 && a.edge > v.edge) c = mix(c, [120, 100, 170], 0.3);
    if (hash2(x, y, seed + 93) > 0.99) c = C('#8fdcff');
    return c;
  },
  forttop(x, y, seed) {
    const lx = x % 16, ly = y % 16;
    if (lx === 0 || ly === 0) return C('#1a1c26');
    const n = valueNoise(x / 4, y / 4, seed + 7);
    let c = C(ly < 3 ? '#7a7f96' : n > 0.6 ? '#505568' : '#3c4053');
    if (lx === 1) c = mix(c, [255, 255, 255], 0.1);
    if (hash2(Math.floor(x / 16), Math.floor(y / 16), seed + 8) > 0.7) c = mix(c, [150, 100, 70], 0.25);
    return c;
  },
  walltop(x, y) {
    return C((x + y) % 7 === 0 ? '#3a2a2a' : '#2a1e20');
  },
};

// prioridade para decidir quem "invade" a borda do vizinho
const PRIORITY = { grass: 5, forest: 6, sand: 2, dirt: 3, path: 4, plaza: 4, plank: 1, water: 0, void: 0, cave: 3, rock: 3, crystal: 4, metal: 1, snow: 6 };
const NO_JITTER = new Set(['plank', 'metal', 'plaza', 'void', 'walltop', 'cavetop', 'forttop']);

// --------------------------------------------------------------- mapa
export function cellMat(map, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  const ch = map.tiles[y][x];
  return TILE_MAT[ch] || 'grass';
}

export function cellH(map, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  const row = map.heights ? map.heights[y] : null;
  const ch = row ? row[x] : '0';
  const v = parseInt(ch, 36);
  return (isNaN(v) ? 0 : v) * 0.5;
}

export function paintGround(map, seed = 7) {
  const W = map.w * PPU, H = map.h * PPU;
  const bmp = new Bitmap(W, H);
  const matMap = new Array(W * H);

  // 1) material por pixel com borda "tremida"
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const tx = Math.floor(px / PPU), ty = Math.floor(py / PPU);
      let m = cellMat(map, tx, ty);
      const h0 = cellH(map, tx, ty);
      if (!NO_JITTER.has(m)) {
        const jx = (fbm(px / 6, py / 6, seed + 1, 2) - 0.5) * 9;
        const jy = (fbm(px / 6, py / 6, seed + 2, 2) - 0.5) * 9;
        const sx = Math.floor((px + jx) / PPU), sy = Math.floor((py + jy) / PPU);
        if (sx !== tx || sy !== ty) {
          const m2 = cellMat(map, sx, sy);
          if (m2 && cellH(map, sx, sy) === h0 && !NO_JITTER.has(m2) && (PRIORITY[m2] || 0) > (PRIORITY[m] || 0)) m = m2;
        }
      }
      matMap[py * W + px] = m;
    }
  }

  // 2) pinta
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const m = matMap[py * W + px];
      const fn = PAINT[m] || PAINT.grass;
      bmp.set(px, py, fn(px, py, seed));
    }
  }

  const matAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : matMap[y * W + x]);

  // 3) bordas entre materiais (sombra e brilho direcionais)
  const out = bmp.clone();
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const m = matAt(px, py);
      const up = matAt(px, py - 1);
      const down = matAt(px, py + 1);
      const c = bmp.get(px, py);
      const grassy = (k) => k === 'grass' || k === 'forest' || k === 'snow';
      if (up && up !== m && grassy(up) && !grassy(m) && m !== 'water') {
        out.set(px, py, mix(c, [20, 30, 20], 0.45)); // sombra da grama sobre o caminho
      } else if (down && down !== m && grassy(m) && !grassy(down)) {
        out.set(px, py, mix(c, [255, 255, 200], 0.25)); // franja clara da grama
      } else if (up && up !== m && (m === 'path' || m === 'plaza') && !grassy(up)) {
        out.set(px, py, mix(c, [30, 20, 20], 0.3));
      }
    }
  }

  // 4) decoração: tufos, flores, pedrinhas
  decorate(out, map, matAt, seed);

  // 5) oclusão: base de paredes/penhascos (vizinho ao norte mais alto)
  for (let ty = 0; ty < map.h; ty++) {
    for (let tx = 0; tx < map.w; tx++) {
      const h = cellH(map, tx, ty);
      const hn = cellH(map, tx, ty - 1);
      const hw = cellH(map, tx - 1, ty);
      const he = cellH(map, tx + 1, ty);
      const hs = cellH(map, tx, ty + 1);
      for (let j = 0; j < PPU; j++) {
        for (let i = 0; i < PPU; i++) {
          const px = tx * PPU + i, py = ty * PPU + j;
          let a = 0;
          if (hn !== null && hn > h) a = Math.max(a, (1 - j / 6) * 0.5);
          if (hw !== null && hw > h) a = Math.max(a, (1 - i / 4) * 0.35);
          if (he !== null && he > h) a = Math.max(a, (1 - (PPU - 1 - i) / 4) * 0.35);
          // borda superior de um degrau: brilho
          if (hs !== null && hs < h && j >= PPU - 1) a = -0.35;
          if (hn !== null && hn < h && j === 0) a = Math.min(a, -0.15);
          if (a > 0) out.set(px, py, mix(out.get(px, py), [16, 12, 30], a));
          else if (a < 0) out.set(px, py, mix(out.get(px, py), [255, 250, 220], -a));
        }
      }
    }
  }

  // 6) fundo sob a água: gradiente de profundidade + espuma (distância em pixels)
  const dist = pixelDistance(matMap, W, H, (m) => m !== 'water');
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      if (matAt(px, py) !== 'water') continue;
      const d = dist[py * W + px] / PPU;
      const deep = Math.min(1, d / 3);
      const n = fbm(px / 7, py / 7, seed + 99, 2);
      let c = mix('#86dccc', '#123e66', Math.min(1, deep * 0.92 + (n - 0.5) * 0.18));
      const foam = 0.16 + (valueNoise(px / 5, py / 5, seed + 4) - 0.5) * 0.12;
      if (d < foam) c = mix(c, [255, 255, 255], 0.8);
      else if (d < foam + 0.1 && hash2(px, py, seed) > 0.55) c = mix(c, [255, 255, 255], 0.35);
      out.set(px, py, c);
    }
  }
  return out;
}

function decorate(bmp, map, matAt, seed) {
  const W = bmp.w, H = bmp.h;
  const stampIf = (x, y, m, pixels) => {
    for (const [dx, dy] of pixels) if (matAt(x + dx, y + dy) !== m) return false;
    return true;
  };
  for (let cy = 0; cy < H; cy += 6) {
    for (let cx = 0; cx < W; cx += 6) {
      const r = hash2(cx, cy, seed + 300);
      const x = cx + Math.floor(hash2(cx, cy, seed + 301) * 5);
      const y = cy + Math.floor(hash2(cx, cy, seed + 302) * 5);
      const m = matAt(x, y);
      const tch = map.tiles[Math.floor(y / PPU)]?.[Math.floor(x / PPU)];
      if (m === 'grass' || m === 'forest') {
        const pal = MAT[m];
        if (r < 0.33) {
          // tufo de grama em "v"
          const px = [[0, 0], [2, 0], [1, 1], [0, -1], [2, -1]];
          if (stampIf(x, y, m, px)) {
            bmp.set(x, y, C(pal[0]));
            bmp.set(x + 2, y, C(pal[0]));
            bmp.set(x + 1, y, C(pal[1]));
            bmp.set(x, y - 1, C(pal[0]));
            bmp.set(x + 2, y - 1, C(pal[1]));
            bmp.set(x + 1, y + 1, C(pal[4]));
          }
        } else if ((tch === 'f' && r < 0.75) || (m === 'grass' && r > 0.965)) {
          // flor: 4 pétalas + miolo
          const cols = [['#ffffff', '#ffe066'], ['#ff9ec4', '#fff2a0'], ['#ffd84a', '#ff8a3a'], ['#a8c8ff', '#ffffff']];
          const [pet, mid] = cols[Math.floor(hash2(cx, cy, seed + 5) * cols.length)];
          const px = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
          if (stampIf(x, y, m, px)) {
            bmp.set(x - 1, y, C(pet));
            bmp.set(x + 1, y, C(pet));
            bmp.set(x, y - 1, C(pet));
            bmp.set(x, y + 1, C(pet));
            bmp.set(x, y, C(mid));
            bmp.set(x + 1, y + 1, C(pal[4]));
          }
        }
      } else if ((m === 'dirt' || m === 'sand' || m === 'cave' || m === 'rock') && r < 0.12) {
        const pal = MAT[m];
        if (stampIf(x, y, m, [[0, 0], [1, 0], [0, 1], [1, 1]])) {
          bmp.set(x, y, C(pal[0]));
          bmp.set(x + 1, y, C(pal[1]));
          bmp.set(x, y + 1, C(pal[3]));
          bmp.set(x + 1, y + 1, C(pal[4]));
        }
      } else if (m === 'sand' && r > 0.97) {
        // conchinha
        if (stampIf(x, y, m, [[0, 0], [1, 0], [2, 0]])) {
          bmp.set(x, y, C('#ffd0c8'));
          bmp.set(x + 1, y, C('#ffffff'));
          bmp.set(x + 2, y, C('#e89a9a'));
        }
      }
    }
  }
}

// Transformada de distância (chanfro 3-4) até pixels que satisfazem isTarget.
export function pixelDistance(matMap, W, H, isTarget) {
  const INF = 1e9;
  const d = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) d[i] = isTarget(matMap[i]) ? 0 : INF;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - W] + 1);
        if (x > 0) v = Math.min(v, d[i - W - 1] + 1.414);
        if (x < W - 1) v = Math.min(v, d[i - W + 1] + 1.414);
      }
      d[i] = v;
    }
  }
  for (let y = H - 1; y >= 0; y--) {
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      let v = d[i];
      if (x < W - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < H - 1) {
        v = Math.min(v, d[i + W] + 1);
        if (x < W - 1) v = Math.min(v, d[i + W + 1] + 1.414);
        if (x > 0) v = Math.min(v, d[i + W - 1] + 1.414);
      }
      d[i] = v;
    }
  }
  // borda do mapa: água que continua para fora não deve ficar rasa
  for (let i = 0; i < W * H; i++) if (d[i] >= INF) d[i] = 9999;
  return d;
}

// --------------------------------------------------------------- laterais
// Atlas de laterais (penhascos, muros) — 16x16 por tile, 4 variações por linha.
export const SIDE_ROWS = ['cliff_grass', 'cliff', 'sand', 'wall', 'cave', 'metal', 'wood', 'stairs', 'crystal', 'snow', 'int_top', 'int_mid', 'int_bot'];

export function paintSideAtlas(seed = 3) {
  const VAR = 4;
  const bmp = new Bitmap(PPU * VAR, PPU * SIDE_ROWS.length);
  SIDE_ROWS.forEach((kind, row) => {
    for (let v = 0; v < VAR; v++) {
      const ox = v * PPU, oy = row * PPU;
      for (let y = 0; y < PPU; y++) {
        for (let x = 0; x < PPU; x++) {
          const gx = ox + x, gy = oy + y;
          let c;
          switch (kind) {
            case 'cliff_grass':
            case 'cliff': {
              const vv = voronoi(gx / 6, y / 5 + v * 3, seed + 11);
              const n = fbm(gx / 4, y / 4, seed + 12, 2);
              let k = vv.edge < 0.1 ? 4 : n > 0.6 ? 1 : n < 0.4 ? 3 : 2;
              if (vv.edge >= 0.1 && vv.edge < 0.2) k = Math.min(4, k + 1);
              c = pick(MAT.rock, k);
              if (kind === 'cliff_grass') {
                const fringe = 2 + Math.floor(valueNoise(gx / 2.5, v * 7, seed) * 4);
                if (y < fringe) c = pick(MAT.grass, y === 0 ? 1 : y === fringe - 1 ? 3 : 2);
                else if (y === fringe) c = pick(MAT.rock, 4);
              }
              break;
            }
            case 'sand': {
              const n = fbm(gx / 5, y / 3, seed + 21, 2);
              c = pick(MAT.sand, n > 0.6 ? 1 : n < 0.4 ? 3 : 2);
              if ((y + Math.floor(n * 4)) % 5 === 0) c = pick(MAT.sand, 3);
              break;
            }
            case 'wall': {
              const row = Math.floor(y / 5);
              const off = row % 2 ? 4 : 0;
              const lx = (gx + off) % 8, ly = y % 5;
              if (lx === 0 || ly === 4) c = pick(MAT.path, 4);
              else c = pick(MAT.path, ly === 0 ? 1 : hash2(Math.floor((gx + off) / 8), row + v, seed) > 0.6 ? 2 : 3);
              break;
            }
            case 'cave': {
              const vv = voronoi(gx / 5, y / 6 + v, seed + 31);
              const n = fbm(gx / 4, y / 4, seed + 32, 2);
              let k = vv.edge < 0.1 ? 4 : n > 0.6 ? 1 : n < 0.4 ? 3 : 2;
              c = pick(MAT.cave, k);
              break;
            }
            case 'metal': {
              const lx = gx % 16;
              if (y === 0 || y === 15 || lx === 0) c = pick(MAT.metal, 4);
              else if ((y === 3 || y === 12) && (lx === 3 || lx === 12)) c = pick(MAT.metal, 0);
              else c = pick(MAT.metal, y < 2 ? 1 : (lx % 4 === 0 ? 3 : 2));
              break;
            }
            case 'wood': {
              const lx = gx % 5;
              c = pick(MAT.plank, lx === 0 ? 4 : lx === 1 ? 1 : valueNoise(gx, y / 5, seed) > 0.5 ? 2 : 3);
              break;
            }
            case 'stairs': {
              const ly = y % 8;
              c = ly < 2 ? pick(MAT.path, 1) : ly < 3 ? pick(MAT.path, 2) : ly < 7 ? pick(MAT.path, 3) : pick(MAT.path, 4);
              if (x === 0 || x === 15) c = pick(MAT.path, 4);
              break;
            }
            case 'crystal': {
              const vv = voronoi(gx / 4, y / 7, seed + 41);
              c = vv.edge < 0.1 ? pick(MAT.crystal, 4) : pick(MAT.crystal, 1 + Math.floor(vv.id * 3));
              break;
            }
            case 'snow': {
              c = y < 4 ? pick(MAT.snow, y === 0 ? 0 : 1) : pick(MAT.rock, fbm(gx / 4, y / 4, seed, 2) > 0.5 ? 2 : 3);
              break;
            }
            case 'int_top': {
              // cornija de madeira + reboco
              if (y < 3) c = pick(MAT.plank, y === 0 ? 3 : y === 1 ? 1 : 2);
              else if (y === 3) c = pick(MAT.plank, 4);
              else c = C(valueNoise(gx / 5, y / 5, seed) > 0.6 ? '#f2e2c2' : '#e4d0aa');
              break;
            }
            case 'int_mid': {
              const beam = gx % 16 === 0 || gx % 16 === 1;
              c = beam ? pick(MAT.plank, gx % 16 === 0 ? 2 : 3) : C(valueNoise(gx / 5, (y + v * 16) / 5, seed) > 0.6 ? '#f2e2c2' : '#e4d0aa');
              break;
            }
            case 'int_bot': {
              // lambri de madeira
              if (y < 5) c = C(valueNoise(gx / 5, y / 5, seed) > 0.6 ? '#f2e2c2' : '#e4d0aa');
              else if (y === 5) c = pick(MAT.plank, 0);
              else if (y === 6) c = pick(MAT.plank, 4);
              else c = pick(MAT.plank, gx % 6 === 0 ? 4 : gx % 6 === 1 ? 1 : 2);
              break;
            }
            default:
              c = [255, 0, 255, 255];
          }
          bmp.set(gx, gy, c);
        }
      }
    }
  });
  return bmp;
}

// qual linha do atlas usar para a lateral de uma célula
export function sideKind(mat, isTopSegment, isStairs) {
  if (isStairs) return 'stairs';
  switch (mat) {
    case 'grass':
    case 'forest':
      return isTopSegment ? 'cliff_grass' : 'cliff';
    case 'sand':
      return 'sand';
    case 'path':
    case 'plaza':
      return 'wall';
    case 'cave':
    case 'cavetop':
      return 'cave';
    case 'forttop':
      return 'wall';
    case 'crystal':
      return 'crystal';
    case 'metal':
      return 'metal';
    case 'plank':
      return 'wood';
    case 'snow':
      return isTopSegment ? 'snow' : 'cliff';
    default:
      return 'cliff';
  }
}
