// Objetos de cenário em pixel art (billboards): árvores, pedras, lampiões,
// baús, cristais, móveis... Cada prop tem bitmap + (opcional) máscara de brilho.
import { Bitmap, fromAscii, hexToRgb, hash2, mix } from './bitmap.js';
import { blob, canopy, cylinder, selOutline, rampIndex, LIGHT } from './sculpt.js';
import { valueNoise } from './noise.js';

const C = hexToRgb;

const LEAF = {
  oak: ['#c8f07a', '#8ed256', '#5aa844', '#3a7e3c', '#235432', '#163824'],
  dark: ['#8ed66e', '#5fae58', '#3e8a4c', '#2a6642', '#1a4634', '#102a22'],
  autumn: ['#ffe08a', '#ffb44e', '#e87a36', '#b04e2c', '#7a3024', '#4a1e1c'],
  pine: ['#a8e07a', '#6cbc5a', '#3f944e', '#2a6e48', '#1a4a38', '#0e2c24'],
  palm: ['#d8f480', '#9edc5a', '#62b048', '#3c843e', '#245a32'],
  spirit: ['#e6fff4', '#9ff0d6', '#5cc8b8', '#3a8e9a', '#28607a', '#1a3a56'],
};
const BARK = ['#c99a6a', '#9c6c44', '#74482c', '#4e2e1c', '#2e1a10'];

function out(b) {
  return selOutline(b);
}

// ---------------------------------------------------------------- árvores
function oak(seed, leaves = LEAF.oak, w = 48, h = 64) {
  const b = new Bitmap(w, h);
  // tronco com raízes
  cylinder(b, w / 2 - 4, h - 26, 8, 24, BARK, { taper: -0.3, bark: true, seed });
  for (const dx of [-5, 4]) cylinder(b, w / 2 + dx, h - 5, 3, 4, BARK, { bark: true, seed: seed + 1 });
  // galhos
  b.rect(w / 2 - 7, h - 30, 4, 2, C(BARK[2]));
  b.rect(w / 2 + 3, h - 33, 5, 2, C(BARK[1]));
  canopy(b, w / 2, h * 0.36, w - 6, h * 0.62, leaves, seed, { count: 11 });
  return out(b);
}

function pine(seed, w = 40, h = 64) {
  const b = new Bitmap(w, h);
  cylinder(b, w / 2 - 3, h - 14, 6, 13, BARK, { bark: true, seed });
  const cols = LEAF.pine.map(C);
  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const ty = 4 + t * ((h - 18) / tiers);
    const tw = 8 + (t + 1) * ((w - 10) / tiers);
    const th = (h - 14) / tiers + 6;
    for (let y = 0; y < th; y++) {
      const half = (tw / 2) * (y / th);
      for (let x = -Math.ceil(half); x <= Math.ceil(half); x++) {
        const edge = Math.abs(x) / Math.max(1, half);
        const jag = (hash2(x + t * 31, y, seed) > 0.75 && edge > 0.8);
        if (jag) continue;
        const u = x / Math.max(1, half);
        const nz = Math.sqrt(Math.max(0, 1 - u * u));
        let lum = 0.2 + 0.8 * Math.max(0, u * LIGHT[0] + nz * LIGHT[2] + 0.2 - (y / th) * 0.35);
        lum += (valueNoise((x + 40) / 1.6, (ty + y) / 1.3, seed) - 0.5) * 0.3;
        b.set(Math.round(w / 2 + x), Math.round(ty + y), cols[rampIndex(lum, cols.length)]);
      }
    }
  }
  return out(b);
}

function palm(seed, w = 48, h = 64) {
  const b = new Bitmap(w, h);
  // tronco curvo segmentado
  for (let y = 18; y < h - 1; y++) {
    const t = (y - 18) / (h - 19);
    const x = w / 2 + Math.sin(t * 2.2 + 0.4) * 4 - 2;
    const seg = y % 4 === 0;
    cylinder(b, Math.round(x), y, 6, 1, seg ? BARK.slice(1) : ['#e0b884', ...BARK.slice(1)], {});
  }
  // folhas em leque
  const cols = LEAF.palm.map(C);
  const cx = w / 2 - 1, cy = 18;
  for (let f = 0; f < 7; f++) {
    const ang = -Math.PI + (f / 6) * Math.PI + (hash2(f, seed, 1) - 0.5) * 0.3;
    const len = 18 + hash2(f, seed, 2) * 6;
    for (let s = 0; s < len; s++) {
      const t = s / len;
      const px = cx + Math.cos(ang) * s;
      const py = cy + Math.sin(ang) * s * 0.55 + t * t * 10;
      const thick = Math.max(1, 3.5 * (1 - t));
      for (let k = -thick; k <= thick; k++) {
        const lum = 0.75 - t * 0.35 - (k > 0 ? 0.25 : 0) + (f % 2) * 0.1;
        b.set(Math.round(px), Math.round(py + k), cols[rampIndex(lum, cols.length)]);
      }
    }
  }
  // cocos
  blob(b, cx - 2, cy + 3, 2.5, 2.5, ['#c08a50', '#8a5a30', '#5a3418']);
  blob(b, cx + 3, cy + 4, 2.5, 2.5, ['#c08a50', '#8a5a30', '#5a3418']);
  return out(b);
}

function deadTree(seed, w = 40, h = 56) {
  const b = new Bitmap(w, h);
  const cols = ['#a89cb8', '#7c6e90', '#56486a', '#3a2e4a', '#241a32'];
  cylinder(b, w / 2 - 3, 16, 7, h - 17, cols, { bark: true, seed, taper: -0.4 });
  // galhos retorcidos
  const branch = (x, y, dx, dy, n) => {
    for (let i = 0; i < n; i++) {
      x += dx + (hash2(i, y, seed) - 0.5) * 0.8;
      y += dy;
      b.rect(Math.round(x), Math.round(y), 2, 2, C(cols[i % 2 ? 2 : 1]));
    }
  };
  branch(w / 2, 22, -1.2, -1, 10);
  branch(w / 2 + 2, 18, 1.1, -1.1, 9);
  branch(w / 2 - 1, 30, -1.5, -0.4, 7);
  branch(w / 2 + 2, 28, 1.4, -0.6, 8);
  return out(b);
}

function spiritTree(seed) {
  const b = oak(seed, LEAF.spirit, 48, 64);
  return b;
}

// ---------------------------------------------------------------- vegetação
function bush(seed, leaves = LEAF.oak, berries = false) {
  const b = new Bitmap(24, 18);
  canopy(b, 12, 10, 22, 14, leaves, seed, { count: 5 });
  if (berries) {
    for (let i = 0; i < 5; i++) {
      const x = 5 + Math.floor(hash2(i, seed, 3) * 14), y = 5 + Math.floor(hash2(i, seed, 4) * 8);
      b.set(x, y, C('#ff4a5a'));
      b.set(x, y - 1, C('#ffb0b0'));
    }
  }
  return out(b);
}

function grassTuft(seed) {
  const b = new Bitmap(14, 12);
  const cols = LEAF.oak.map(C);
  for (let i = 0; i < 7; i++) {
    const x = 2 + i * 1.6;
    const hh = 5 + Math.floor(hash2(i, seed, 1) * 6);
    const lean = (hash2(i, seed, 2) - 0.5) * 3;
    for (let y = 0; y < hh; y++) {
      const t = y / hh;
      b.set(Math.round(x + lean * t), 11 - y, cols[t > 0.7 ? 1 : t > 0.3 ? 2 : 3]);
    }
  }
  return out(b);
}

function reeds(seed) {
  const b = new Bitmap(14, 18);
  for (let i = 0; i < 5; i++) {
    const x = 2 + i * 2.4;
    const hh = 9 + Math.floor(hash2(i, seed, 1) * 7);
    for (let y = 0; y < hh; y++) b.set(Math.round(x + (y / hh) * (i - 2) * 0.6), 17 - y, C(y > hh - 4 ? '#8a5a30' : y > hh * 0.5 ? '#9ed05c' : '#5a9c44'));
  }
  return out(b);
}

function flowers(seed) {
  const b = new Bitmap(16, 10);
  const pals = [['#ffffff', '#ffe066'], ['#ff8ec0', '#fff0a0'], ['#ffd24a', '#ff8a3a'], ['#b0a0ff', '#ffffff']];
  for (let i = 0; i < 4; i++) {
    const x = 2 + Math.floor(hash2(i, seed, 1) * 11), y = 3 + Math.floor(hash2(i, seed, 2) * 4);
    const [p, m] = pals[Math.floor(hash2(i, seed, 3) * 4)];
    b.set(x, y + 1, C('#3f863e'));
    b.set(x, y + 2, C('#3f863e'));
    b.set(x - 1, y, C(p)); b.set(x + 1, y, C(p)); b.set(x, y - 1, C(p)); b.set(x, y + 1, C(p));
    b.set(x, y, C(m));
  }
  return out(b);
}

function mushroom(seed, glow = true) {
  const b = new Bitmap(16, 14);
  const g = new Bitmap(16, 14);
  const caps = glow ? ['#e6fbff', '#8ef0ff', '#3ec0e8', '#2a7ab8', '#1c4a80'] : ['#ffd0c0', '#ff7a6a', '#d0403a', '#8a2228', '#5a1420'];
  for (const [cx, cy, r] of [[5, 8, 4], [11, 9, 3]]) {
    cylinder(b, cx - 1, cy, 3, 13 - cy, ['#fff4e0', '#e0ccb0', '#a8906c']);
    blob(b, cx, cy, r, r * 0.7, caps);
    if (glow) blob(g, cx, cy, r, r * 0.7, ['#ffffff', '#8ef0ff', '#3ec0e8']);
    b.set(cx - 1, cy - 1, C('#ffffff'));
  }
  return { bmp: out(b), glow: glow ? g : null };
}

// ---------------------------------------------------------------- rochas e cristais
function rock(seed, w = 20, h = 16, pal = ['#d8d0c4', '#b4aca0', '#8e867a', '#6a6258', '#48423c']) {
  const b = new Bitmap(w, h);
  blob(b, w / 2, h * 0.58, w * 0.44, h * 0.42, pal, { bumpy: 0.25, seed });
  blob(b, w * 0.35, h * 0.7, w * 0.22, h * 0.25, pal, { bumpy: 0.2, seed: seed + 3 });
  // musgo
  for (let x = 0; x < w; x++) for (let y = 0; y < h * 0.45; y++) {
    if (b.alpha(x, y) && hash2(x, y, seed) > 0.8 && b.alpha(x, y - 1) === 0) b.set(x, y, C('#7cc05a'));
  }
  return out(b);
}

function crystal(seed, w = 24, h = 32, pal = ['#ffffff', '#e0d0ff', '#b49aff', '#7c62e0', '#4e3ab0', '#2c2070']) {
  const b = new Bitmap(w, h);
  const g = new Bitmap(w, h);
  const cols = pal.map(C);
  const shards = [[w / 2, h - 2, 5, h - 6, 0], [w / 2 - 6, h - 2, 4, h * 0.55, -0.35], [w / 2 + 6, h - 2, 4, h * 0.5, 0.4], [w / 2 + 2, h - 2, 3, h * 0.35, 0.15]];
  for (const [bx, by, hw, len, lean] of shards) {
    for (let s = 0; s < len; s++) {
      const t = s / len;
      const half = hw * (t < 0.8 ? 1 : (1 - t) / 0.2);
      const cx = bx + lean * s;
      for (let x = -Math.ceil(half); x <= Math.ceil(half); x++) {
        const face = x < 0 ? 0.9 : x === 0 ? 1 : 0.45;
        const lum = face - t * 0.15 + (hash2(Math.round(cx + x), Math.round(by - s), seed) > 0.95 ? 0.3 : 0);
        b.set(Math.round(cx + x), Math.round(by - s), cols[rampIndex(lum, cols.length)]);
        if (lum > 0.6) g.set(Math.round(cx + x), Math.round(by - s), cols[1]);
      }
    }
  }
  return { bmp: out(b), glow: g };
}

function stalagmite(seed) {
  const b = new Bitmap(16, 32);
  const cols = ['#a49ec0', '#7a7498', '#5a5478', '#3e3a5a', '#2a2640'].map(C);
  for (let y = 0; y < 30; y++) {
    const t = y / 30;
    const half = 1 + t * 6;
    for (let x = -Math.ceil(half); x <= Math.ceil(half); x++) {
      const u = x / half;
      const lum = 0.2 + 0.8 * Math.max(0, -u * 0.6 + 0.5) + (valueNoise(x, y / 3, seed) - 0.5) * 0.3;
      b.set(8 + x, 1 + y, cols[rampIndex(lum, cols.length)]);
    }
  }
  return out(b);
}

// ---------------------------------------------------------------- objetos feitos à mão (ASCII)
const WOOD = { a: '#e8b878', b: '#c48848', c: '#8e5a30', d: '#5a3418', e: '#3a2010' };
const IRON = { i: '#d8e0f0', j: '#9aa6c0', k: '#5c6680', l: '#343a50' };
const GOLD = { y: '#fff0a0', Y: '#f0c040', z: '#b07a20' };

function ascii(rows, pal) {
  return out(fromAscii(rows, pal));
}

const CHEST_CLOSED = [
  '..cccccccccccccc..',
  '.cbaaaaaaaaaaaabc.',
  'cbaaaaaaaaaaaaaabc',
  'cbbbbbbbbbbbbbbbbc',
  'cYYccccYyYccccYYcc',
  'czzddddzYzddddzzdc',
  'cbbbbbbbYbbbbbbbbc',
  'cbaaaaaayaaaaaaabc',
  'cbbbbbbbbbbbbbbbbc',
  'cYbbbbbbbbbbbbbbYc',
  'czbbbbbbbbbbbbbbzc',
  'cccccccccccccccccc',
  '.dddddddddddddddd.',
];
const CHEST_OPEN = [
  '..cccccccccccccc..',
  '.cddddddddddddddc.',
  'cdeeeeeeeeeeeeeedc',
  'cYYccccccccccYYYcc',
  'cbeeeeeeeeeeeeeebc',
  'cbeeyYeeeeeeeeeebc',
  'cbbbbbbbbbbbbbbbbc',
  'cbaaaaaaaaaaaaaabc',
  'cbbbbbbbbbbbbbbbbc',
  'cYbbbbbbbbbbbbbbYc',
  'czbbbbbbbbbbbbbbzc',
  'cccccccccccccccccc',
  '.dddddddddddddddd.',
];

const BARREL = [
  '...cbbbbbbc...',
  '..cbaaaaaabc..',
  '.cbbbbbbbbbbc.',
  '.kjjjjjjjjjjk.',
  'cbaabbbbbbbbbc',
  'cbaabbbbbbbccc',
  'cbaabbbbbbbccc',
  'cbaabbbbbbbccc',
  '.kjjjjjjjjjjk.',
  'cbaabbbbbbbccc',
  'cbaabbbbbbbccc',
  'cbaabbbbbbbccc',
  '.kjjjjjjjjjjk.',
  '.cbbbbbbbbbbc.',
  '..ccccccccccc.',
];

const CRATE = [
  'aaaaaaaaaaaaaaaa',
  'abbbbbbbbbbbbbbc',
  'abaaaaaaaaaaaabc',
  'cccccccccccccccc',
  'abbcbbbbbbbbcbbc',
  'abbbcbbbbbbcbbbc',
  'abbbbcbbbbcbbbbc',
  'abbbbbcbbcbbbbbc',
  'abbbbbbccbbbbbbc',
  'abbbbbcbbcbbbbbc',
  'abbbbcbbbbcbbbbc',
  'abbbcbbbbbbcbbbc',
  'abbcbbbbbbbbcbbc',
  'cccccccccccccccc',
];

const SIGN = [
  'cccccccccccccc',
  'cabbbbbbbbbbbc',
  'cbddbdddbddbbc',
  'cbbbbbbbbbbbbc',
  'cbdddbbddddbbc',
  'cbbbbbbbbbbbbc',
  'cccccccccccccc',
  '......cc......',
  '......bc......',
  '......bc......',
  '......bc......',
  '.....dbcd.....',
];

const FENCE = [
  '.ab..........ab.',
  'abbc........abbc',
  'abbcaaaaaaaaabbc',
  'abbcbbbbbbbbabbc',
  'abbcccccccccabbc',
  'abbc........abbc',
  'abbcaaaaaaaaabbc',
  'abbcbbbbbbbbabbc',
  'abbcccccccccabbc',
  'abbc........abbc',
  'abbc........abbc',
  'dccd........dccd',
];

const LAMP = [
  '....kkkk....',
  '...kjjjjk...',
  '..kjjjjjjk..',
  '..kyYYYYyk..',
  '..kYwwwwYk..',
  '..kYwwwwYk..',
  '..kyYYYYyk..',
  '..kkjjjjkk..',
  '....kjjk....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '.....jk.....',
  '....kjjk....',
  '...kjjjjk...',
  '..kllllllk..',
];
const LAMP_GLOW = [
  '............',
  '............',
  '............',
  '...yYYYYy...',
  '...Ywwwwy...',
  '...Ywwwwy...',
  '...yYYYYy...',
];

const TORCH = [
  '...ww...',
  '..wyyw..',
  '..yYYy..',
  '.yYooYy.',
  '.yooooy.',
  '..oooo..',
  '.kjjjjk.',
  '..kjjk..',
  '...cb...',
  '...cb...',
  '...cb...',
  '...cb...',
  '...cb...',
  '...cb...',
  '..dccd..',
];
const TORCH_GLOW = [
  '...ww...',
  '..wyyw..',
  '..yYYy..',
  '.yYooYy.',
  '.yooooy.',
  '..oooo..',
];

const SAVE_CRYSTAL = [
  '.......w.......',
  '......wqw......',
  '.....wqqQw.....',
  '.....qqqQQ.....',
  '....wqqqQQR....',
  '....qqqqQQR....',
  '...wqqqqQQRR...',
  '...qqqqqQQRR...',
  '...qqqqqQQRR...',
  '...qqqqqQQRR...',
  '...wqqqqQQRR...',
  '....qqqqQQR....',
  '....wqqqQQR....',
  '.....qqqQR.....',
  '.....wqQQR.....',
  '......wQR......',
  '.......R.......',
];

const POT = [
  '..cccccc..',
  '.caaaaaac.',
  '..cbbbbc..',
  '.cbaabbbc.',
  'cbaabbbbcc',
  'cbaabbbbcc',
  'cbbbbbbbcc',
  '.cbbbbbcc.',
  '..ccccccc.',
];

function well() {
  const b = new Bitmap(32, 34);
  // telhadinho
  const roof = { r: '#e85a4a', R: '#b03838', Q: '#701e28', ...WOOD };
  const top = fromAscii([
    '..........cccccccccccc..........',
    '........ccRRRRRRRRRRRRcc........',
    '......ccRRrrRRRRRRrrRRRRcc......',
    '....ccRRRRRRRRRRRRRRRRRRRRcc....',
    '..ccQQQQQQQQQQQQQQQQQQQQQQQQcc..',
    '...dd......................dd...',
  ], roof);
  b.blit(top, 0, 0);
  for (const x of [3, 27]) cylinder(b, x, 6, 2, 16, ['#c48848', '#8e5a30', '#5a3418']);
  b.rect(4, 9, 24, 1, C('#5a3418'));
  b.rect(15, 9, 1, 8, C('#8e8e8e'));
  b.rect(14, 16, 3, 3, C('#8e5a30'));
  // base de pedra
  for (let y = 20; y < 34; y++) {
    for (let x = 2; x < 30; x++) {
      const row = Math.floor((y - 20) / 4);
      const lx = (x + (row % 2) * 3) % 6;
      const ly = (y - 20) % 4;
      const shade = x < 6 ? 0 : x > 25 ? 3 : 1;
      let c = ['#d8d0c4', '#b4aca0', '#8e867a', '#6a6258', '#48423c'][lx === 0 || ly === 3 ? 4 : shade + (y > 30 ? 1 : 0)];
      if (y === 20) c = '#e8e0d4';
      b.set(x, y, C(c));
    }
  }
  b.rect(4, 21, 24, 2, C('#2a2a3a'));
  return out(b);
}

function stall(color = ['#ff8a80', '#e04848', '#902838']) {
  const b = new Bitmap(44, 40);
  // toldo listrado
  for (let y = 0; y < 12; y++) {
    for (let x = 2; x < 42; x++) {
      const stripe = Math.floor((x - 2) / 5) % 2;
      const k = y < 2 ? 0 : y > 9 ? 2 : 1;
      b.set(x, y, C(stripe ? ['#ffffff', '#f0ece4', '#c8c0b4'][k] : color[k]));
    }
  }
  for (let x = 2; x < 42; x += 5) for (let y = 12; y < 14; y++) b.set(x + 2, y, C(color[2]));
  for (const x of [4, 38]) cylinder(b, x, 12, 2, 20, ['#c48848', '#8e5a30', '#5a3418']);
  // balcão
  for (let y = 24; y < 40; y++) for (let x = 1; x < 43; x++) {
    const k = y === 24 ? 0 : y < 27 ? 1 : (x % 8 === 0 ? 3 : 2);
    b.set(x, y, C(['#e8b878', '#c48848', '#8e5a30', '#5a3418'][k]));
  }
  // mercadorias
  const goods = [['#ff4a4a', '#ffd0d0'], ['#ffd24a', '#fff2b0'], ['#7ad24a', '#d0ffb0'], ['#ff9a3a', '#ffe0b0']];
  for (let i = 0; i < 8; i++) {
    const [c1, c2] = goods[i % 4];
    const x = 4 + i * 4.8, y = 20 + (i % 2);
    blob(b, x, y, 2.4, 2.2, [c2, c1, mix(c1, '#000000', 0.4)]);
  }
  return out(b);
}

function boat() {
  const b = new Bitmap(48, 24);
  for (let y = 6; y < 22; y++) {
    const t = (y - 6) / 16;
    const half = 22 - t * t * 10;
    for (let x = -Math.floor(half); x <= Math.floor(half); x++) {
      const k = y === 6 ? 0 : y < 9 ? 1 : (x + 30) % 7 === 0 ? 3 : 2;
      b.set(24 + x, y, C(['#e8b878', '#c48848', '#8e5a30', '#5a3418'][k]));
    }
  }
  b.rect(5, 9, 38, 2, C('#4a7ab8'));
  b.rect(8, 6, 32, 3, C('#3a2010'));
  return out(b);
}

function tent() {
  const b = new Bitmap(48, 40);
  const cols = ['#c8b8a0', '#a8987c', '#857560', '#5e5040'].map(C);
  for (let y = 2; y < 38; y++) {
    const half = (y - 2) * 0.62 + 2;
    for (let x = -Math.floor(half); x <= Math.floor(half); x++) {
      const k = x < -2 ? 0 : x < 6 ? 1 : 2;
      b.set(24 + x, y, cols[y > 34 ? 3 : k]);
    }
  }
  for (let y = 18; y < 38; y++) {
    const half = (y - 18) * 0.35 + 1;
    for (let x = -Math.floor(half); x <= Math.floor(half); x++) b.set(24 + x, y, C('#2a2028'));
  }
  // listra imperial
  for (let y = 10; y < 38; y++) b.set(24 - Math.floor((y - 2) * 0.62) + 3, y, C('#b03030'));
  return out(b);
}

function banner() {
  const b = new Bitmap(16, 44);
  cylinder(b, 7, 0, 2, 44, ['#d8e0f0', '#9aa6c0', '#5c6680']);
  for (let y = 4; y < 30; y++) for (let x = 1; x < 15; x++) {
    if (y > 26 && Math.abs(x - 8) < (y - 26) * 2) continue;
    const k = x < 3 ? 0 : x > 12 ? 2 : 1;
    b.set(x, y, C(['#ff5a4a', '#c02a30', '#7a1424'][k]));
  }
  // engrenagem imperial
  blob(b, 8, 14, 4, 4, ['#f0d070', '#c8962e', '#7a5a1a']);
  b.set(8, 14, C('#7a1424'));
  return out(b);
}

function barricade() {
  const b = new Bitmap(32, 20);
  const p = ['#b8c0d0', '#949eb2', '#727c92', '#545c72', '#363c50'].map(C);
  for (let y = 4; y < 18; y++) for (let x = 0; x < 32; x++) {
    const stripe = Math.floor((x + y) / 4) % 2;
    b.set(x, y, stripe ? C(y < 6 ? '#ffe070' : '#e8b030') : p[y < 6 ? 1 : 2]);
  }
  for (const x of [2, 28]) for (let y = 0; y < 20; y++) b.set(x, y, p[3]), b.set(x + 1, y, p[2]);
  return out(b);
}

// ---------------------------------------------------------------- móveis de interior
function bed() {
  const b = new Bitmap(24, 34);
  const pal = { ...WOOD, w: '#ffffff', W: '#dcdcf0', V: '#a8a8cc', r: '#ff8a8a', R: '#d84a5a', Q: '#902a40' };
  const rows = [
    '.cccccccccccccccccccccc.',
    'cbaaaaaaaaaaaaaaaaaaaabc',
    'cbbbbbbbbbbbbbbbbbbbbbbc',
    'cb..wwwwwwwwwwwwwwww..bc',
    'cb.wWWWWWWWWWWWWWWWWw.bc',
    'cb.wWWWWWWWWWWWWWWWVV.bc',
    'cb.WVVVVVVVVVVVVVVVVV.bc',
    'cbrrrrrrrrrrrrrrrrrrrrbc',
    'cbRrrrrrrrrrrrrrrrrrrRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRrRRRRRRRRRRRRRRRRRbc',
    'cbRRRRRRRRRRRRRRRRRRRRbc',
    'cbQQQQQQQQQQQQQQQQQQQQbc',
    'cbbbbbbbbbbbbbbbbbbbbbbc',
    'caaaaaaaaaaaaaaaaaaaaaac',
    'cbbbbbbbbbbbbbbbbbbbbbbc',
    'cccccccccccccccccccccccc',
    'dd....................dd',
  ];
  return ascii(rows, pal);
}

function table() {
  return ascii([
    '.aaaaaaaaaaaaaaaaaaaaaaaaaaaaa.',
    'abbbbbbbbbbbbbbbbbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbbbbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbbbbbbbbbbbbbbbbc',
    'abbbbbbbbbbbbbbbbbbbbbbbbbbbbbc',
    'ccccccccccccccccccccccccccccccc',
    '.dbc.....................dbc..',
    '.dbc.....................dbc..',
    '.dbc.....................dbc..',
    '.dbc.....................dbc..',
    '.dcc.....................dcc..',
  ], WOOD);
}

function shelf() {
  const b = fromAscii([
    'cccccccccccccccccccccccccccc',
    'caaaaaaaaaaaaaaaaaaaaaaaaaac',
    'cbeeeeeeeeeeeeeeeeeeeeeeeebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbaaaaaaaaaaaaaaaaaaaaaaaabc',
    'cbeeeeeeeeeeeeeeeeeeeeeeeebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbaaaaaaaaaaaaaaaaaaaaaaaabc',
    'cbeeeeeeeeeeeeeeeeeeeeeeeebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbe......................ebc',
    'cbaaaaaaaaaaaaaaaaaaaaaaaabc',
    'cccccccccccccccccccccccccccc',
  ], { ...WOOD, '.': '#2a1810' });
  // livros e potes
  const books = ['#c84a4a', '#4a7ac8', '#4ab06a', '#d8b040', '#8a5ac8', '#e08040'];
  for (const sy of [3, 9, 15]) {
    let x = 3;
    while (x < 24) {
      const w = 1 + Math.floor(hash2(x, sy, 3) * 2);
      const h = 3 + Math.floor(hash2(x, sy, 4) * 2);
      const c = books[Math.floor(hash2(x, sy, 5) * books.length)];
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) b.set(x + i, sy + 4 - j, i === 0 ? mix(c, '#ffffff', 0.25) : C(c));
      x += w + (hash2(x, sy, 6) > 0.8 ? 2 : 0);
    }
  }
  return out(b);
}

function fireplace() {
  const b = new Bitmap(32, 34);
  const g = new Bitmap(32, 34);
  for (let y = 0; y < 34; y++) for (let x = 0; x < 32; x++) {
    const row = Math.floor(y / 4);
    const lx = (x + (row % 2) * 3) % 7, ly = y % 4;
    let c = ['#d8d0c4', '#b4aca0', '#8e867a', '#6a6258', '#48423c'][lx === 0 || ly === 3 ? 4 : x < 4 ? 0 : x > 27 ? 3 : 1];
    b.set(x, y, C(c));
  }
  b.rect(0, 8, 32, 3, C('#8e5a30'));
  b.rect(0, 8, 32, 1, C('#c48848'));
  b.rect(7, 16, 18, 18, C('#1a1218'));
  // fogo
  for (let y = 0; y < 12; y++) for (let x = 0; x < 14; x++) {
    const d = Math.abs(x - 7) / 7 + (11 - y) / 12;
    const n = valueNoise(x / 2, y / 2, 4);
    if (d + n * 0.5 > 1.25) continue;
    const c = d < 0.55 ? '#fff4b0' : d < 0.85 ? '#ffc040' : '#f06020';
    b.set(9 + x, 21 + y, C(c));
    g.set(9 + x, 21 + y, C(c));
  }
  return { bmp: out(b), glow: g };
}

function rug() {
  const b = new Bitmap(40, 26);
  for (let y = 0; y < 26; y++) for (let x = 0; x < 40; x++) {
    const border = x < 3 || x > 36 || y < 3 || y > 22;
    const inner = Math.abs(x - 20) / 18 + Math.abs(y - 13) / 10;
    let c = border ? '#e8c060' : inner < 0.5 ? '#3a6ab0' : (Math.floor(inner * 8) % 2 ? '#b03a3a' : '#8a2a30');
    if (border && (x + y) % 4 === 0) c = '#b08030';
    b.set(x, y, C(c));
  }
  return b;
}

// ---------------------------------------------------------------- catálogo
// size: largura/altura do sprite em px; solid: raio de colisão (em tiles)
export function buildProps() {
  const P = {};
  const add = (name, bmp, extra = {}) => {
    let main = bmp && bmp.bmp ? bmp.bmp : bmp;
    let glow = bmp && bmp.bmp ? bmp.glow || null : null;
    // máscara de brilho precisa ter o mesmo tamanho do sprite
    if (glow && (glow.w !== main.w || glow.h !== main.h)) {
      const g = new Bitmap(main.w, main.h);
      g.blit(glow, 0, 0);
      glow = g;
    }
    P[name] = { bmp: main, glow, ...extra };
  };
  for (let i = 0; i < 3; i++) {
    add('oak' + i, oak(11 + i * 7), { solid: 0.45, tall: true });
    add('pine' + i, pine(5 + i * 13), { solid: 0.4, tall: true });
    add('darkoak' + i, oak(31 + i * 5, LEAF.dark), { solid: 0.45, tall: true });
  }
  add('palm0', palm(3), { solid: 0.35, tall: true });
  add('palm1', palm(8), { solid: 0.35, tall: true });
  add('autumn0', oak(77, LEAF.autumn), { solid: 0.45, tall: true });
  add('dead0', deadTree(4), { solid: 0.35, tall: true });
  add('dead1', deadTree(9), { solid: 0.35, tall: true });
  add('spirit0', spiritTree(21), { solid: 0.45, tall: true, glowAll: 0.35 });
  add('bush0', bush(3), { solid: 0.4 });
  add('bush1', bush(6, LEAF.dark), { solid: 0.4 });
  add('berry', bush(9, LEAF.oak, true), { solid: 0.4 });
  add('tuft0', grassTuft(1));
  add('tuft1', grassTuft(5));
  add('reeds', reeds(2));
  add('flowers0', flowers(1));
  add('flowers1', flowers(7));
  add('mushglow', mushroom(1, true));
  add('mushred', mushroom(2, false));
  add('rock0', rock(1), { solid: 0.4 });
  add('rock1', rock(5, 24, 18), { solid: 0.45 });
  add('boulder', rock(9, 34, 28), { solid: 0.8 });
  add('caverock', rock(3, 26, 20, ['#a49ec0', '#7a7498', '#5a5478', '#3e3a5a', '#2a2640']), { solid: 0.5 });
  add('crystal', crystal(2), { solid: 0.5, glowIntensity: 0.55, light: { color: '#a080ff', intensity: 1.6, distance: 5, pulse: 1.5 } });
  add('crystalblue', crystal(5, 24, 32, ['#ffffff', '#d0f4ff', '#8ad8ff', '#4a9ae0', '#2a5ab0', '#1a3070']), { solid: 0.5, glowIntensity: 0.6, light: { color: '#60c0ff', intensity: 1.6, distance: 5, pulse: 1.2 } });
  add('stalagmite', stalagmite(3), { solid: 0.35 });
  add('chest', ascii(CHEST_CLOSED, { ...WOOD, ...GOLD }), { solid: 0.42 });
  add('chest_open', ascii(CHEST_OPEN, { ...WOOD, ...GOLD }), { solid: 0.42 });
  add('barrel', ascii(BARREL, { ...WOOD, ...IRON }), { solid: 0.35 });
  add('crate', ascii(CRATE, WOOD), { solid: 0.45 });
  add('sign', ascii(SIGN, WOOD), { solid: 0.3 });
  add('fence', ascii(FENCE, WOOD), { solid: 0.5 });
  add('pot', ascii(POT, { a: '#f0b080', b: '#c87850', c: '#7a4028' }), { solid: 0.3 });
  add('lamp', { bmp: ascii(LAMP, { ...IRON, ...GOLD, w: '#ffffff' }), glow: fromAscii(LAMP_GLOW, { ...GOLD, w: '#ffffff' }) }, { solid: 0.25, light: { color: '#ffb860', intensity: 2.4, distance: 7, flicker: true, y: 2.2 } });
  add('torch', { bmp: ascii(TORCH, { ...IRON, ...WOOD, w: '#ffffff', y: '#fff080', Y: '#ffc040', o: '#ff7020' }), glow: fromAscii(TORCH_GLOW, { w: '#ffffff', y: '#fff080', Y: '#ffc040', o: '#ff7020' }) }, { solid: 0.2, light: { color: '#ff9a40', intensity: 2.6, distance: 6.5, flicker: true, y: 1.3 } });
  const sc = fromAscii(SAVE_CRYSTAL, { w: '#ffffff', q: '#a0f0ff', Q: '#50b8f0', R: '#2a6ad0' });
  add('save', { bmp: out(sc), glow: sc }, { solid: 0.4, light: { color: '#70d8ff', intensity: 2, distance: 5, pulse: 2 } });
  add('well', well(), { solid: 0.9 });
  add('stall', stall(), { solid: 1.0 });
  add('stall2', stall(['#90d0ff', '#4a8ad8', '#2a4a90']), { solid: 1.0 });
  add('boat', boat(), { solid: 1.2 });
  add('tent', tent(), { solid: 1.2 });
  add('banner', banner(), { solid: 0.2 });
  add('barricade', barricade(), { solid: 0.8 });
  add('bed', bed(), { solid: 0.7 });
  add('table', table(), { solid: 0.9 });
  add('shelf', shelf(), { solid: 0.8 });
  add('fireplace', fireplace(), { solid: 0.9, light: { color: '#ff8a40', intensity: 2.8, distance: 7, flicker: true, y: 0.6 } });
  add('rug', rug(), { flat: true });
  return P;
}
