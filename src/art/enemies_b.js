// Inimigos do Império de Ferro — Forte Ferrugem (sprites de batalha).
// Todos olham para a DIREITA (o grupo fica à direita). Cada entrada devolve
// { idle, alt, glow, altGlow }: dois quadros de idle do mesmo tamanho e
// máscaras opcionais só com os pixels emissivos.
import { Bitmap, hexToRgb } from './bitmap.js';
import { selOut } from './charkit.js';

// ================================================================ kit de grade
// Grade de caracteres de paleta: formas grandes procedurais + detalhes à mão,
// sempre dentro da mesma paleta (sem cores soltas).
class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.c = Array.from({ length: h }, () => Array(w).fill('.'));
  }
  in(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }
  get(x, y) {
    return this.in(x, y) ? this.c[y][x] : '.';
  }
  set(x, y, ch) {
    x = Math.round(x); y = Math.round(y);
    if (this.in(x, y) && ch && ch !== '?') this.c[y][x] = ch;
  }
  // Cola linhas ASCII. '.'/' ' = mantém, '~' = apaga.
  paste(x0, y0, rows, { flip = false } = {}) {
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((r, j) => {
      for (let i = 0; i < r.length; i++) {
        const ch = r[i];
        if (ch === '.' || ch === ' ') continue;
        const x = flip ? x0 + w - 1 - i : x0 + i;
        if (ch === '~') { if (this.in(x, y0 + j)) this.c[y0 + j][x] = '.'; } else this.set(x, y0 + j, ch);
      }
    });
    return this;
  }
  rect(x, y, w, h, ch) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch);
    return this;
  }
  line(x0, y0, x1, y1, ch) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, ch);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  // Polígono preenchido (regra par-ímpar, amostrado no centro do pixel).
  poly(pts, ch) {
    const ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5;
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.set(x, y, ch);
      }
    }
    return this;
  }
  // Elipse/círculo chapado.
  oval(cx, cy, rx, ry, ch) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, ch);
      }
    }
    return this;
  }
  // Traço grosso (cápsula) de (x0,y0) a (x1,y1) com raio r.
  stroke(x0, y0, x1, y1, r, ch) {
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    for (let y = Math.floor(Math.min(y0, y1) - r - 1); y <= Math.max(y0, y1) + r + 1; y++) {
      for (let x = Math.floor(Math.min(x0, x1) - r - 1); x <= Math.max(x0, x1) + r + 1; x++) {
        const px = x + 0.5, py = y + 0.5;
        let t = ((px - x0) * (x1 - x0) + (py - y0) * (y1 - y0)) / (L * L);
        t = Math.max(0, Math.min(1, t));
        if (Math.hypot(px - (x0 + t * (x1 - x0)), py - (y0 + t * (y1 - y0))) <= r) this.set(x, y, ch);
      }
    }
    return this;
  }
  // Troca chars dentro de um retângulo.
  swap(map, x0 = 0, y0 = 0, x1 = this.w, y1 = this.h) {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const ch = this.get(x, y);
      if (map[ch] !== undefined) this.c[y][x] = map[ch];
    }
    return this;
  }
  rows() {
    return this.c.map((r) => r.join(''));
  }
}

// Sombreia "placas": cada char de região em `defs` vira uma placa com
// gradiente (topo/esquerda claros) e chanfro (borda sup./esq. clara, inf./dir.
// escura). Chars fora de `defs` passam direto. Devolve nova grade de paleta.
// def: { ramp: [claro..escuro], base: índice no topo, spread: degraus até a
//        base, h: 0..1 peso do gradiente horizontal, hi/lo: chanfro,
//        noSeam: não gera costura nas placas de trás }
// `order`: chars do fundo para a frente; placa de trás encostada numa da
// frente ganha costura escura (contorno interno).
function shadePlates(sil, defs, order = null) {
  const out = grid(sil.w, sil.h);
  const regionOf = (x, y) => sil.get(x, y);
  for (const [ch, d] of Object.entries(defs)) {
    const { ramp, base = 1, spread = 2, hi = 1, lo = 1, h = 0 } = d;
    // caixa da região (para o gradiente horizontal opcional `h`)
    let minX = sil.w, maxX = -1;
    for (let y = 0; y < sil.h; y++) for (let x = 0; x < sil.w; x++) if (regionOf(x, y) === ch) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
    // extensão vertical por coluna
    for (let x = 0; x < sil.w; x++) {
      let top = -1, bot = -1;
      for (let y = 0; y < sil.h; y++) if (regionOf(x, y) === ch) { if (top < 0) top = y; bot = y; }
      if (top < 0) continue;
      for (let y = top; y <= bot; y++) {
        if (regionOf(x, y) !== ch) continue;
        const tv = (y - top + 0.5) / (bot - top + 1);
        const th = (x - minX + 0.5) / (maxX - minX + 1);
        const t = tv * (1 - h) + th * h;
        let k = base + t * spread;
        const up = regionOf(x, y - 1) !== ch, lf = regionOf(x - 1, y) !== ch;
        const dn = regionOf(x, y + 1) !== ch, rt = regionOf(x + 1, y) !== ch;
        if (dn || rt) k += lo;
        else if (up || lf) k -= hi;
        k = Math.max(0, Math.min(ramp.length - 1, Math.round(k)));
        out.set(x, y, ramp[k]);
      }
    }
  }
  for (let y = 0; y < sil.h; y++) for (let x = 0; x < sil.w; x++) {
    const c = sil.get(x, y);
    if (c !== '.' && !defs[c]) out.set(x, y, c);
  }
  // costuras: pixel de uma placa de trás encostado numa placa da frente
  // vira o tom mais escuro da sua rampa.
  if (order) {
    const marks = [];
    for (let y = 0; y < sil.h; y++) for (let x = 0; x < sil.w; x++) {
      const c = sil.get(x, y);
      const oc = order.indexOf(c);
      if (oc < 0 || !defs[c]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = sil.get(x + dx, y + dy);
        const on = order.indexOf(n);
        if (on > oc && !(defs[n] && defs[n].noSeam)) { marks.push([x, y, defs[c].ramp[defs[c].ramp.length - 1]]); break; }
      }
    }
    for (const [x, y, ch] of marks) out.set(x, y, ch);
  }
  return out;
}

function grid(w, h) {
  return new Grid(w, h);
}

// Recorta/estende um par de quadros (idle/alt) para a caixa que une os dois,
// com 1px de margem para o contorno; mantém os dois do mesmo tamanho e a
// base (pés) alinhada.
function tightPair(a, b) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (const g of [a, b]) {
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      if (g.c[y][x] === '.') continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const crop = (g) => {
    const out = grid(x1 - x0 + 3, y1 - y0 + 3);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.c[y - y0 + 1][x - x0 + 1] = g.c[y][x];
    return out;
  };
  return [crop(a), crop(b)];
}

// Converte grade/linhas em Bitmap com contorno sel-out tingido.
function render(g, pal, { outline = '#140a1a', strength = 0.8 } = {}) {
  const rows = g instanceof Grid ? g.rows() : g;
  const w = Math.max(...rows.map((r) => r.length));
  const b = new Bitmap(w, rows.length);
  const cache = {};
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const ch = r[x];
      if (ch === '.' || ch === ' ') continue;
      if (!(ch in cache)) {
        if (pal[ch] === undefined) throw new Error(`enemies_b: cor indefinida '${ch}' (linha ${y}: "${r}")`);
        cache[ch] = typeof pal[ch] === 'string' ? hexToRgb(pal[ch]) : pal[ch];
      }
      b.set(x, y, cache[ch]);
    }
  });
  return outline ? selOut(b, outline, strength) : b;
}

// Máscara de brilho: só os pixels cujos chars estão em `chars`.
function glowOf(g, pal, chars) {
  const rows = g instanceof Grid ? g.rows() : g;
  const w = Math.max(...rows.map((r) => r.length));
  const b = new Bitmap(w, rows.length);
  let any = false;
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      if (chars.includes(r[x])) {
        b.set(x, y, hexToRgb(pal[r[x]]));
        any = true;
      }
    }
  });
  return any ? b : null;
}

// ================================================================ paletas base
// Aço imperial (igual ao de Brann), carmim, ouro, couro.
const STEEL = { w: '#f2f6ff', g: '#b8c2d8', G: '#7f8aa8', F: '#525b7a', E: '#323852' };
const CRIMSON = { r: '#f0705a', R: '#c03a40', S: '#84203a', T: '#4e1430' };
const GOLD = { Y: '#fff4b0', y: '#f4c650', o: '#b07a2a', O: '#6a401c' };
const LEATHER = { l: '#9c6a48', L: '#68402e', M: '#3e2422' };

// ================================================================ 1. SOLDADO
const SOLDADO_PAL = {
  ...STEEL, ...CRIMSON, ...GOLD, ...LEATHER,
  n: '#8a6450', N: '#563a34', // haste
  V: '#1a1024', v: '#3c2c4a', // fenda do visor
};

const SOLDADO_HALBERD = [
  '...w........',
  '...wg.......',
  '...gG.......',
  '...gG...g...',
  '..YyyO.gwg..',
  '..oggFgwwgw.',
  '.gyggFggggw.',
  'gGoyGFggggGw',
  'EEFoGFgggGGw',
  '...ygFggGGFw',
  '...oyOGGGFFw',
  '...nN.FFFFG.',
  '...nN...FG..',
  '...nN....F..',
];

const SOLDADO_PLUME = [
  '........SRRrr...',
  '......SRRrrrrr..',
  '....SSRRRRRRRRr.',
  '..SRRSRRSSRRR...',
  '.SRSSRSS.S......',
  'SRS.SS..........',
  'RS.SS...........',
  'RS.S............',
  'S..S............',
  'S...............',
];
const SOLDADO_PLUME_ALT = [
  '........SRRrr...',
  '.....SSRRrrrrr..',
  '...SRRRRRRRRRRr.',
  '.SRRSSRRSSRRR...',
  'SRSSRSS.S.......',
  'RS.SS...........',
  'RS.S............',
  'S..S............',
  'S..S............',
  '................',
];

const SOLDADO_HEAD = [
  '..........gwwgG......',
  '........gwwwwggGG....',
  '.......gwwggggGGGF...',
  '......gwggggggGGGGF..',
  '......wgggggGGGGGGGF.',
  '.....FggggGwwwwwwwgGF',
  '....FGgggGVVVVVVVVVVE',
  '...FGGgggGFFFFFFFGGGE',
  '..FGGGGGGGGGGGGGGGGFE',
  '..EFFGGGGGFEGEGEGGFE.',
  '...EEFFFFFE.EEEEEEE..',
];

const SOLDADO_TORSO = [
  '........EFGGFE............',
  '....gwwgEFGGFEgwwwgG......',
  '...gwgggFEFFEgwggggGF.....',
  '..RgggGGFgwwFgggggGGGF....',
  '..RRFFFFgwggwFFGGGGGFFE...',
  '..RRSEEgwgggggwEEFFFFEE...',
  '..RSS..EgggggggggGGGFRRS..',
  '..RSS..EgggggggggGGGFRRRS.',
  '..SST..EgggggggggGGFFSRRS.',
  '..SST..EFggggggggGGFESRRS.',
  '..lLM..EFggggggggGFFE.SRS.',
  '..LLM..EEFFggggGGGFEE.FwgG',
  '...M...EEEFFFFFFFFFEE.gwwgF',
  '.......MLLLLLLyYLLLLM.GgGGF',
  '.......SRRRRRRoRRRRRS..FFE.',
  '......SRrRRRRRSRRRRRRS.....',
  '.....TSRRRRRSSSRRRRRRS.....',
  '.....TTSSSST..TSSSSSST.....',
];

const GEAR7 = [
  '..Y.y..',
  '.Yyyyo.',
  'YyEEEoO',
  '.yEGEo.',
  'yoEEEOO',
  '.oooOO.',
  '..o.O..',
];

const SOLDADO_LEGS = [
  '....SRRS....SRRRS...',
  '...FGgGF.....FGggF..',
  '...FgwGF.....FGwgF..',
  '..EFgGF.......FGgGF.',
  '..EGgGF.......FGggF.',
  '.LLlLM.........LLlLM',
  'MLLlLLM........LlLLL',
  'MLLLLLLM......LLLLLL',
  'MMMMMMMM......MMMMMM',
];

function soldadoFrame(alt) {
  const g = grid(35, 40);
  const bob = alt ? 1 : 0;
  g.paste(4, 30, SOLDADO_LEGS);
  // tronco (sem o braço da frente), emblema, elmo e pluma
  g.paste(3, 14 + bob, SOLDADO_TORSO.map((r) => r.slice(0, 20)));
  g.paste(11, 19 + bob, GEAR7);
  g.paste(3, 4 + bob, SOLDADO_HEAD);
  g.paste(1, 1 + bob, alt ? SOLDADO_PLUME_ALT : SOLDADO_PLUME);
  // haste da alabarda: na frente do corpo, atrás da mão
  g.rect(25, 13, 1, 25, 'n');
  g.rect(26, 13, 1, 25, 'N');
  g.paste(25, 37, ['GF']);
  g.paste(22, 1, SOLDADO_HALBERD);
  // braço da frente e manopla por cima da haste
  g.paste(23, 14 + bob, SOLDADO_TORSO.map((r) => r.slice(20)));
  return g;
}

function soldado() {
  const [a, b] = tightPair(soldadoFrame(false), soldadoFrame(true));
  return { idle: render(a, SOLDADO_PAL), alt: render(b, SOLDADO_PAL), glow: null, altGlow: null };
}

// ================================================================ 2. DRONE VIGIA
const DRONE_PAL = {
  // ferro frio
  w: '#dfe6f6', i: '#9aa3bc', I: '#666f8e', J: '#424866', K: '#272b44',
  // latão
  Y: '#fff0b0', y: '#e8bc5a', o: '#b07c34', O: '#6e4626', Q: '#3e2622',
  // lente
  D: '#1c0e1e', '1': '#fff4ea', '2': '#ffb48e', '3': '#ff4c3c', '4': '#c81e32', '5': '#701026',
  W: '#ffffff',
  // ponta da antena apagada
  a: '#5a2030',
};
const DRONE_GLOW = '12345W';

const DRONE_BODY = [
  '......iiiIIIJJ......',
  '....iiiiiiiIIIJJ....',
  '...iiiwwiiiiIIIIJ...',
  '..iiiwwiiiiiIIIIJJ..',
  '.iiiiiiiiiiIIIIIJJJ.',
  '.iiiiiiiiiIIIIIJJJJ.',
  'IiiiiiiiiIIIIIJJJJJK',
  'JJJJJJJJJIIIIIJJJJJK',
  'IiwiIwiIwIIIIJJJJJJK',
  'YyyIIIIIIIIIJJJJJJJK',
  'yyyYYYyyyyyyyooooOOO',
  'oOoyOyyOyyOyyooOoOOO',
  'JIIooooooooooOOOOQQK',
  'JIIIIIIIIIJJJJJJJJKK',
  '.JIKKKKKIJJJJJJJJKK.',
  '.JJIIIIIJJJJJJJJKKI.',
  '..KKKKKKJJJJJJJKKI..',
  '...KIIIJJJJJJJKKI...',
  '....KKJJJJJJKKII....',
  '......KKKKKKII......',
];
// lente grande com sobrancelha de ferro inclinada (olhar fixo para a frente)
const DRONE_LENS = [
  '.....iiIJ.....',
  '...iiiiIIJJ...',
  '..KKKIIJJJJJ..',
  '.YyDDKKKKKJJK.',
  '.YyD555544KKO.',
  'yYD5W322345DoO',
  'yyD43211234DoO',
  'oyD43211234DOO',
  'oyD54322345DOO',
  '.oyD554455DOO.',
  '.ooDDDDDDDDOQ.',
  '..oooOOOOOQQ..',
  '...ooOOOOQQ...',
  '.....OOQQ.....',
];

function droneFrame(alt) {
  const g = grid(30, 30);
  const u = alt ? -1 : 0; // flutua 1px para cima no quadro alternativo
  // pernas-garra articuladas (atrás do corpo)
  const legL = alt ? ['...JI', '..JK.', '.JI..', '.K...', '.....'] : ['...JI', '..JK.', '.JI..', 'JK...', 'K....'];
  g.paste(6, 24 + u, legL);
  g.paste(21, 24 + u, legL, { flip: true });
  // antena: fio + lâmpada piscante
  g.line(11, 9 + u, 5, 3 + u, 'J');
  g.line(12, 9 + u, 6, 3 + u, 'I');
  g.paste(3, 1 + u, alt ? ['.aa.', 'aaa.', '.aJ.'] : ['.32.', '343.', '.4J.']);
  // mastro e hélice superior
  g.paste(15, 6 + u, ['JI', 'JI']);
  g.paste(14, 4 + u, ['.oyyo.', 'oyYyoO', '.OooO.']);
  if (!alt) g.paste(5, 4, ['iiwwiiI..........IJiiiJJK.', '.JIIIJ............JIIJ...']);
  else g.paste(9, 3, ['.wwiI........IiiJ.', 'JIIJ..........JIJK']);
  // hélice traseira
  g.paste(2, 17 + u, ['.oJIJ', 'oYyJK', '.oOK.']);
  if (!alt) g.paste(1, 12 + u, ['i.', 'iJ', 'iJ', 'IJ', 'IJ', '..', '..', '..', 'IJ', 'JK', 'JK', 'K.']);
  else g.paste(1, 15 + u, ['w.', 'iJ', '..', '..', '..', 'JK', 'K.']);
  // corpo e lente
  g.paste(6, 8 + u, DRONE_BODY);
  g.paste(14, 9 + u, DRONE_LENS);
  // bocal inferior
  g.paste(14, 27 + u, ['JIIJ']);
  return g;
}

function drone() {
  const [a, b] = tightPair(droneFrame(false), droneFrame(true));
  return {
    idle: render(a, DRONE_PAL), alt: render(b, DRONE_PAL),
    glow: glowOf(a, DRONE_PAL, DRONE_GLOW), altGlow: glowOf(b, DRONE_PAL, DRONE_GLOW),
  };
}

// ================================================================ 3. CÃO DE FERRO MK II
const HOUND_PAL = {
  // aço-canhão azul-escuro
  w: '#b4c6ea', g: '#7083b0', G: '#4b5784', F: '#323a60', E: '#212641', D: '#13152a',
  // aço cromado (pistões, espinhos)
  s: '#eef4ff', t: '#a6b4d2',
  // latão (rebites, coleira)
  y: '#e8bc5a', o: '#a8742c', O: '#5e3a20',
  // carmim imperial
  R: '#b83440', S: '#6e1c34',
  // mangueira
  h: '#4a3a52', H: '#2c2236',
  // brilho azul
  '1': '#ffffff', '2': '#c8f6ff', '3': '#6ad8ff', '4': '#2a90e8', '5': '#1a4cb0',
  // vapor
  v: '#dfe6f2', V: '#a8b2c8',
};
const HOUND_GLOW = '12345';

const PLATE = ['w', 'g', 'G', 'F', 'E', 'D'];
const FAR = ['G', 'F', 'E', 'D', 'D'];
const HOUND_PLATES = {
  P: { ramp: PLATE, base: 0.8, spread: 2.6 },      // pélvis
  Q: { ramp: PLATE, base: 2, spread: 2 },          // cintura (recuada)
  I: { ramp: PLATE, base: 0.8, spread: 3 },        // caixa torácica
  N: { ramp: PLATE, base: 1.2, spread: 2.5 },      // pescoço
  A: { ramp: PLATE, base: 0.4, spread: 2.6 },      // coxa
  K: { ramp: PLATE, base: 0.4, spread: 2.6 },      // ombro
  B: { ramp: PLATE, base: 1, spread: 1.5 },        // canela
  C: { ramp: PLATE, base: 1, spread: 1.5 },        // pata traseira
  J: { ramp: PLATE, base: 1.5, spread: 1.5 },      // braço
  L: { ramp: PLATE, base: 1, spread: 1.2 },        // antebraço
  M: { ramp: PLATE, base: 1, spread: 1.5 },        // pata dianteira
  X: { ramp: PLATE, base: 0.3, spread: 2.8 },      // crânio
  Z: { ramp: PLATE, base: 1.5, spread: 2 },        // mandíbula
  e: { ramp: PLATE, base: 0.2, spread: 2.5 },      // orelha
  T: { ramp: PLATE, base: 1, spread: 2.5 },        // cauda-escape
  W: { ramp: PLATE, base: 0.5, spread: 3 },        // torre do canhão
  U: { ramp: PLATE, base: 0, spread: 3.5, hi: 0 },  // cano
  u: { ramp: PLATE, base: 1, spread: 3 },          // freio de boca / bocal
  j: { ramp: ['s', 't', 'G', 'F'], base: 0, spread: 2, noSeam: true }, // juntas
  q: { ramp: ['s', 't', 'G', 'F'], base: 0, spread: 2, noSeam: true },
  c: { ramp: ['y', 'y', 'o', 'O'], base: 0.5, spread: 1.5 }, // coleira
  b: { ramp: FAR, base: 0, spread: 1.5 },          // pernas do lado de lá
  k: { ramp: ['t', 'G', 'F', 'E'], base: 0.5, spread: 1.5 },
  m: { ramp: FAR, base: 0, spread: 1.5 },
};
const HOUND_ORDER = 'mbkTuQPINWUABCjKJLqMcZXe';

function houndFrame(alt) {
  const S = grid(64, 48);
  const b = alt ? 1 : 0; // respiração: tronco, cabeça e canhão descem 1px
  const P = (pts) => pts.map(([x, y]) => [x, y + b]);
  // ---- pernas do lado de lá
  S.poly([[25, 27], [29, 28], [23, 39], [20, 37]], 'b');
  S.poly([[20, 38], [24, 38], [25, 43], [21, 43]], 'b');
  S.oval(22, 38.5, 1.7, 1.7, 'k');
  S.poly([[19, 43], [26, 42], [29, 44], [30, 47], [19, 47]], 'm');
  S.poly([[46, 29], [50, 29], [51, 42], [47, 42]], 'b');
  S.poly([[46, 42], [52, 41], [56, 43], [57, 47], [46, 47]], 'm');
  // ---- cauda-escape
  S.stroke(9, 19 + b, 5, 14 + b, 1.8, 'T');
  S.stroke(5, 14 + b, 3.5, 10 + b, 1.5, 'T');
  S.poly(P([[1, 6], [5, 5], [6, 9], [2, 10]]), 'u');
  // ---- tronco
  S.poly(P([[20, 15], [33, 13], [34, 24], [30, 26], [22, 25]]), 'Q');
  S.poly(P([[6, 17], [12, 13], [22, 14], [24, 22], [19, 27], [10, 27], [6, 23]]), 'P');
  S.poly(P([[31, 12], [44, 10], [50, 15], [50, 26], [46, 32], [39, 33], [33, 28], [31, 20]]), 'I');
  S.poly(P([[43, 11], [48, 10], [53, 14], [55, 23], [51, 28], [46, 26]]), 'N');
  // ---- canhão
  S.poly(P([[23, 12], [25, 6], [33, 4], [37, 5], [38, 11], [24, 13]]), 'W');
  S.rect(37, 4 + b, 14, 3, 'U');
  S.poly(P([[50, 3], [56, 2], [57, 8], [50, 7]]), 'u');
  // ---- perna traseira de cá
  S.poly(P([[9, 15], [19, 13], [24, 19], [23, 27], [20, 31], [14, 30], [8, 23]]), 'A');
  S.poly([[17, 29], [23, 31], [14, 41], [10, 39]], 'B');
  S.poly([[10, 39], [14, 39], [15, 44], [11, 44]], 'C');
  S.poly([[8, 43], [16, 42], [20, 44], [21, 47], [8, 47]], 'C');
  S.oval(20, 31, 2.3, 2.3, 'j');
  S.oval(12, 39.5, 1.9, 1.9, 'j');
  // ---- perna dianteira de cá
  S.poly(P([[34, 12], [44, 11], [47, 18], [45, 26], [40, 30], [35, 27], [33, 20]]), 'K');
  S.poly([[34, 25], [40, 27], [41, 33], [35, 33]], 'J');
  S.poly([[36, 32], [41, 32], [41, 42], [37, 42]], 'L');
  S.oval(37, 32, 2.2, 2.2, 'q');
  S.poly([[35, 42], [42, 41], [46, 43], [47, 47], [35, 47]], 'M');
  // ---- coleira, cabeça
  S.stroke(46.5, 11.5 + b, 44.5, 27 + b, 2.3, 'c');
  S.poly(P([[48, 24], [56, 25], [61, 27], [60, 29], [54, 30], [48, 28]]), 'Z');
  S.poly(P([[45, 18], [48, 13], [53, 11], [57, 14], [61, 17], [62, 20], [61, 22], [53, 23], [48, 23]]), 'X');
  S.poly(P([[54, 13], [50, 10], [40, 7], [43, 10], [49, 15]]), 'e');
  const g = shadePlates(S, HOUND_PLATES, HOUND_ORDER);
  // ---- detalhes à mão
  // boca aberta: interior escuro, brilho da fornalha no fundo, dentes
  g.poly(P([[51, 23], [61, 22.5], [61, 27], [56, 25], [49, 24]]), 'D');
  g.paste(51, 23 + b, ['5s.s.s.s.s', '45D......s', '.5D.......']);
  g.paste(54, 26 + b, ['s.s.s']);
  // visor azul inclinado
  g.paste(50, 15 + b, alt ? ['EE3333E...', '.E3444443E', '..EEE445E.'] : ['EE2223E...', '.E3122223E', '..EEE334E.']);
  // espinhos da coleira
  g.paste(44, 7 + b, ['.s', 'st', 'tE']);
  g.paste(41, 10 + b, ['s.', 'tt', '.E']);
  g.paste(43, 15 + b, ['s', 'E']);
  g.paste(42, 20 + b, ['s', 'E']);
  g.paste(42, 25 + b, ['s', 'E']);
  g.paste(42, 29 + b, ['tE', 's.']);
  // espinhos dorsais
  g.paste(12, 10 + b, ['s...', 'tt..', 'tGE.']);
  g.paste(17, 10 + b, ['s..', 'ts.', 'GtE']);
  // fornalha na cintura: moldura de latão, grade, brilho azul
  g.paste(23, 15 + b, alt ? HOUND_FURNACE_B : HOUND_FURNACE_A);
  // pistões cromados
  g.line(21, 32, 15, 39, 't');
  g.paste(21, 32, ['s']);
  g.paste(41, 33, ['s', 't', 's', 't', 't', 'F']);
  // garras
  g.paste(18, 45, ['ts', 'tt']);
  g.paste(20, 46, ['s']);
  g.paste(45, 45, ['ts', 'tt']);
  g.paste(47, 46, ['s']);
  g.paste(29, 46, ['t']);
  g.paste(56, 46, ['t']);
  // emblema imperial (engrenagem carmim) na coxa
  g.paste(12, 18 + b, ['.R.R.', 'RRSRS', '.SES.', 'RSSSS', '.S.S.']);
  // faixas do cano e freio de boca
  g.paste(41, 4 + b, ['y', 'o', 'O']);
  g.paste(46, 4 + b, ['y', 'o', 'O']);
  g.paste(52, 3 + b, ['D.D', '...', 'D.D', '...']);
  // rebites e costura do ombro
  g.line(35, 22 + b, 44, 21 + b, 'E');
  g.line(35, 23 + b, 44, 22 + b, 'g');
  for (const [x, y] of [[36, 15], [39, 14], [42, 14], [37, 25], [40, 25]]) { g.set(x, y + b, 'F'); g.set(x - 1, y - 1 + b, 'w'); }
  // dedos das patas
  for (const [x, y0] of [[11, 44], [15, 44], [39, 44], [43, 44], [23, 45], [50, 45]]) for (let y = y0; y <= 46; y++) if (g.get(x, y) !== '.') g.set(x, y, 'E');
  // anéis de latão na cauda
  g.paste(6, 15 + b, ['oO']);
  g.paste(3, 11 + b, ['yoO']);
  // mangueira da torre até a fornalha
  g.paste(21, 12 + b, ['.hH', 'h..', 'hH.']);
  // vapor da cauda
  if (alt) g.paste(1, 1, ['.vv..', 'vVvv.', '.vV..']);
  else g.paste(2, 3, ['.v.', 'vV.']);
  return g;
}

const HOUND_FURNACE_A = [
  '.yyyyyyyo.',
  'yoEEEEEEOO',
  'yE4E3E4EEO',
  'yE3E2E3E4O',
  'yE2E1E2E3O',
  'yE3E2E3E4O',
  'oE4E4E4E5O',
  '.OOOOOOOO.',
];
const HOUND_FURNACE_B = [
  '.yyyyyyyo.',
  'yoEEEEEEOO',
  'yE5E4E5EEO',
  'yE4E3E4E5O',
  'yE3E2E3E4O',
  'yE2E1E2E3O',
  'oE3E3E3E4O',
  '.OOOOOOOO.',
];

function cao_ferro2() {
  const [a, b] = tightPair(houndFrame(false), houndFrame(true));
  return {
    idle: render(a, HOUND_PAL), alt: render(b, HOUND_PAL),
    glow: glowOf(a, HOUND_PAL, HOUND_GLOW), altGlow: glowOf(b, HOUND_PAL, HOUND_GLOW),
  };
}

// ================================================================ 4. ARCANISTA IMPERIAL
const MAGO_PAL = {
  // casaco carmim-escuro
  r: '#c64452', R: '#902a3c', S: '#5c1832', T: '#360c24',
  // latão
  Y: '#fff2b4', y: '#e8bc5a', o: '#a8742c', O: '#5e3a20',
  // couro preto (luvas, botas, alça dos óculos, sombra do capuz)
  l: '#6a5a6e', L: '#40324a', M: '#241a2c',
  // calça
  p: '#4a4c66', P: '#2c2c44',
  // verde arcano (brilho)
  '1': '#f4ffe6', '2': '#b8ff9a', '3': '#4ee06e', '4': '#1e9a56', '5': '#0e5a3e',
};
const MAGO_GLOW = '12345';

// corpo (sem o cajado); o cajado e a mão da frente são colados depois
const MAGO_BODY = [
  '...........................',
  '............SRRS...........',
  '..........SRrrRRS..........',
  '.........SRrrRRRRS.........',
  '........SRrRRRRRRRS........',
  '........SRrRRRRRRRRS.......',
  '.......SRrRRRSyyyyyyyo.....',
  '.......SRRRRyMMMMMMMMO.....',
  '......SRRRRyMOoOMOooOM.....',
  '......SRRRRoLo3oLo22oM.....',
  '.....SRRRRRoMO4OMO33O......',
  '.....SRRRRRRSyyyyyyyyyy....',
  '......SRrRRRRRRRRRRRRRS....',
  '.....SRrrRRRRRRRRRRRRS.....',
  '....SRrrRRRRRRRRRRRRRRS....',
  '...SRrrRRRRRRRSRRRRRRSS....',
  '..SRrRRRRRRRRRSRRRRRSSSS...',
  '..SRRRRRRRRRRSRRRRRSSSSS...',
  '..yRRRRRRRRRRSRRRRSSSSoO...',
  '..oyyyRRRRRRSRRRRSSSooOO...',
  '...lLOooyyyyyyyyyyooOOS....',
  '...LMTSSSSSSSSSyoSSST......',
  '....TSRSSSSSSSSSSSSST......',
  '....TSRSSSSSSSSSyoSST......',
  '...TMLLLLLLLLLLoYoLLM......',
  '...TSRSSSSSSSSSTyoSST......',
  '..TSSRSSSSSSSSSTSSSSST.....',
  '..TSRSSSSSSSSSTTyoSSST.....',
  '.TSSRSSSSSSSSTTpTSSSSST....',
  '.TSRSSSSSSSSTTpPTSSSSST....',
  'TSSRSSSSSSSTTpPTpTSSSSST...',
  'TSRSSSSSSSTTpPPTpPTSSSST...',
  'TSRSSSSSSTTTpPP.pPP.TSSST..',
  'TTTTTTTTTTT.pPP.pPP..TTTT..',
  '.TTTTTTTT...pPP..pPP.......',
  '...........lLLM..lLLM......',
  '..........lLLLLM.lLLLLM....',
  '.........MLLLLLM.MLLLLLM...',
  '.........MMMMMMM.MMMMMMM...',
  '...........................',
];
// quadro alternativo: abas do casaco balançam para trás
const MAGO_ALT_ROWS = {
  28: 'TSSRSSSSSSSSS',
  29: 'TSRSSSSSSSSTT',
  30: 'TSSRSSSSSSSTT',
  31: 'TSRSSSSSSSTTp',
  32: 'TSRSSSSSSTTTp',
  33: 'TTTTTTTTTTT.p',
  34: 'TTTTTTTT...pp',
};
const MAGO_STAFF_TOP = [
  '....y.....',
  '.y.yYy.y..',
  '..yy..oo..',
  '.yy.12.oO.',
  'Yy.1223.O.',
  '.y.2234.OO',
  'yo.344.OO.',
  '.oO.4.OO..',
  '..o.oOO...',
  '...OOO....',
];
const MAGO_HAND = [
  '.LlllL.',
  'LlllllL',
  '.LLLlM.',
];

function magoFrame(alt) {
  const g = grid(36, 40);
  const X = 4; // margem à esquerda para o braço que conjura
  let body = MAGO_BODY;
  if (alt) body = body.map((r, y) => (MAGO_ALT_ROWS[y] ? MAGO_ALT_ROWS[y] + r.slice(MAGO_ALT_ROWS[y].length) : r));
  g.paste(X, 0, body);
  // braço de trás saindo da capa, palma aberta com orbe arcano
  g.paste(X - 3, 19, ['lllLl..', '.LLLMTS', '....TS.']);
  g.paste(X - 3, 15, alt ? ['.334.', '32123', '42213', '.343.'] : ['.234.', '32113', '32123', '.343.']);
  g.paste(X - 3, 12, alt ? ['3....', '.....', '....4'] : ['.....', '4...3', '.....']);
  g.paste(X + 22, 1, MAGO_STAFF_TOP);
  g.rect(X + 25, 11, 1, 27, 'y');
  g.rect(X + 26, 11, 1, 27, 'o');
  g.paste(X + 25, 37, ['Oo', '.O']);
  g.paste(X + 21, 18, MAGO_HAND);
  if (alt) g.swap({ '1': '2', '2': '3', '3': '4' }, X + 22, 0, 36, 11); // cristal pulsa
  if (alt) g.swap({ '2': '3' }, X, 0, X + 22, 12);
  return g;
}

function mago() {
  const [a, b] = tightPair(magoFrame(false), magoFrame(true));
  return {
    idle: render(a, MAGO_PAL), alt: render(b, MAGO_PAL),
    glow: glowOf(a, MAGO_PAL, MAGO_GLOW), altGlow: glowOf(b, MAGO_PAL, MAGO_GLOW),
  };
}

// ================================================================ 5. CAPITÃO VAREK (chefe)
const VAREK_PAL = {
  // casaco preto (azulado)
  b: '#6a6a8a', B: '#3e3e58', N: '#26263a', Z: '#161624',
  // carmim (forro, gola, faixa)
  r: '#e0505a', R: '#a82c3c', S: '#6a1830', T: '#3e0e22',
  // ouro
  Y: '#fff4b0', y: '#f0c450', o: '#b07a2a', O: '#6a401c',
  // cabelo branco-acinzentado
  w: '#f6f6fc', v: '#c8c8da', V: '#9090a8', u: '#5e5e78',
  // pele pálida
  k: '#f4dccb', K: '#d2a892', q: '#a07476', Q: '#6a4652',
  // olhos cinza-claro, cicatriz
  e: '#dfe4f0', E: '#2a2a3c', x: '#c86c74',
  // lâmina
  g: '#f2f6ff', G: '#aab6ce', F: '#6c7896',
  // luvas brancas
  l: '#ffffff', L: '#c8cce0',
};

const VAREK_HEAD = [
  '.....uvwwwwv...',
  '...uvwwVwwwwvv.',
  '..uvwVvvvVvvvVk',
  '.uvwvvVVVVVuKkk',
  'uvvVVVuuuuKkkkk',
  'uuVVuuuQKQQQkk.',
  '.uVuuuQKkeEkkkk',
  'u.uVuuQKxkkkkkk',
  '...uuuQKkxkkqK.',
  '....uuQKkkkKK..',
  '......KKKkkK...',
];

// corpo: casaco preto com gola alta carmim, dragonas de ouro, faixa carmim,
// braço de trás às costas, braço da espada à frente.
const VAREK_BODY = [
  '..................TRRRRT................',
  '.................TRrRRRRT...............',
  '.............OyyyyBBTSTBBNyyyyO.........',
  '............OyYYyyBbBBBBNNyYyyyO........',
  '............OoyyooBbBBBBNNoyyooO........',
  '............o.o.o.BbBBBBNNNo.o.o........',
  '...........bBBN..BbBByyBBNNN.BBNN.......',
  '..........bBBNN..BbByYOyBNNN..BBNN......',
  '.........bBBNN...BbBByoBBNNN...BNNN.....',
  '........bBBNN....BbBBBBBBNNN...NNNl.....',
  '.......bBBNNZ....BbBByBBBNNN....LlL.....',
  '.......BBNNZRSN..BbBBBBBBNNN....LLL.....',
  '........NZZSSNZ..BbBByBBBNNN............',
  '................TRRRRrRRRRST............',
  '................TSSSSSSSSSST............',
  '...............BbBBByBBBBSNN............',
  '..............BbBBBBBBBBBSRNN...........',
  '..............BbBBBNBBBBBSRNNN..........',
  '.............BbBBBBNBBBBSRRBNNN.........',
  '.............BbBBBNBBBBBSRSBNNN.........',
  '............BbBBBBNBBBBSRRSBNNNN........',
  '............BbBBBNBBBBBSRRSBNNNN........',
  '...........BbBBBBNBBBBSRR.SBNNNNN.......',
  '...........BbBBBNBBBBSRRS.SBNNNNN.......',
  '..........BbBBBBNBBBBSRR...SBNNNN.......',
  '..........BbBBBNBBBBSRRS...SBNNNNN......',
  '.........BbBBBBNBBBBSRR.....SBNNNN......',
  '.........BbBBBNBBBBSRRS.....SBNNNN......',
  '........rRbBBBNBBBSRRS.......SBNNN......',
  '.......rRRRSBBNBBSRRS........SBNNN......',
  '......TSRRRRSSSSSRRT.........TNNNZ......',
];
const VAREK_LEGS = [
  '...............BbN........bBN...........',
  '..............BbBN........bBN...........',
  '..............bBN.........bBBN..........',
  '.............bBBN.........bbBN..........',
  '.............bBN...........bBN..........',
  '............bbBN...........bBNN.........',
  '...........bbBNN...........bbBNN........',
  '..........NbbBNN...........NbbBNNN......',
  '..........NNNNNN...........NNNNNNNN.....',
];

// quadro alternativo: aba de trás do casaco balança 1px para trás
const VAREK_HEM_ALT = {
  28: '.......rRbBBBNBBBSRRS.......SBNNN......',
  29: '......rRRRSBBNBBSRRS........SBNNN......',
  30: '.....TSRRRRSSSSSRRT.........TNNNZ......',
};

function varekFrame(alt) {
  const g = grid(40, 52);
  const up = alt ? 1 : 0; // respiração: tronco, cabeça e sabre descem 1px
  let skirt = VAREK_BODY.slice(15);
  if (alt) skirt = skirt.map((r, i) => VAREK_HEM_ALT[i + 15] || r);
  g.paste(0, 42, VAREK_LEGS);
  g.paste(0, 27, skirt);
  g.paste(0, 12 + up, VAREK_BODY.slice(0, 15));
  g.paste(14, 2 + up, VAREK_HEAD);
  // sabre: lâmina fina e levemente curva, da mão (33,21) à ponta (37,2)
  const SABER = [[33, 21], [34, 19], [34, 17], [35, 15], [35, 13], [36, 11], [36, 9], [37, 7], [37, 5], [37, 3]];
  for (let i = 0; i < SABER.length - 1; i++) {
    const [x0, y0] = SABER[i], [x1, y1] = SABER[i + 1];
    g.line(x0, y0 + up, x1, y1 + up, 'g');
    g.line(x0 + 1, y0 + up, x1 + 1, y1 + up, 'G');
  }
  g.set(37, 2 + up, 'g');
  g.set(38, 3 + up, 'F');
  g.paste(31, 20 + up, ['.yYy', 'yo.o', 'oOO.']);
  return g;
}

function varek() {
  const [a, b] = tightPair(varekFrame(false), varekFrame(true));
  return { idle: render(a, VAREK_PAL), alt: render(b, VAREK_PAL), glow: null, altGlow: null };
}

// ================================================================ 6. ARMADURA TITÃ (chefe final)
const TITA_PAL = {
  // placas carmim
  r: '#f2735e', R: '#c83a40', S: '#8c2238', T: '#581432', U: '#320c22',
  // ferro
  w: '#d8deee', i: '#9ca2ba', I: '#686e8a', J: '#43475f', K: '#2a2b3e', D: '#17161f',
  // latão
  Y: '#fff0b0', y: '#e8bc5a', o: '#a8742c', O: '#5e3a20',
  // cromo dos pistões
  s: '#f4f8ff', t: '#b2bdd6',
  // brilho da fornalha (laranja)
  '1': '#fffbe6', '2': '#ffe08a', '3': '#ffa040', '4': '#e85a20', '5': '#9a2a1a',
  // vidro da cabine: reflexo frio
  c: '#d8f6ff', C: '#86c8dc',
  // silhueta de Varek dentro da cabine (cabelo claro iluminado)
  v: '#3a1e30', h: '#fff4e8',
  // fumaça
  m: '#e0dce4', M: '#a8a2b2', n: '#6e6880',
};
const TITA_GLOW = '12345ch';
const CR = ['r', 'R', 'S', 'T', 'U'];
const IR = ['w', 'i', 'I', 'J', 'K', 'D'];
const TITA_PLATES = {
  P: { ramp: IR, base: 1, spread: 1.5 },                               // chaminés
  b: { ramp: ['I', 'J', 'K', 'D'], base: 0, spread: 1.5 },             // perna de lá
  l: { ramp: ['S', 'T', 'U', 'U'], base: 0, spread: 1.5 },             // joelheira de lá
  d: { ramp: ['I', 'J', 'K', 'D'], base: 0, spread: 1.5 },             // pé de lá
  e: { ramp: ['t', 'I', 'J', 'K'], base: 0.3, spread: 1.5 },           // pistão do braço de lá
  f: { ramp: ['R', 'S', 'T', 'U'], base: 0, spread: 2 },               // antebraço de lá
  p: { ramp: ['i', 'I', 'J', 'K', 'D'], base: 0.3, spread: 2 },        // garra
  G: { ramp: ['R', 'S', 'T', 'U'], base: 0, spread: 2.2, h: 0.4 },     // ombreira de lá
  Q: { ramp: IR, base: 1.6, spread: 2 },                               // saia/pélvis
  A: { ramp: CR, base: 0.6, spread: 2.2 },                             // tassets
  L: { ramp: IR, base: 1, spread: 2 },                                 // coxa de cá
  N: { ramp: CR, base: 0.5, spread: 2.4, h: 0.4 },                     // canela de cá
  k: { ramp: CR, base: 0.2, spread: 2.5, h: 0.4 },                     // joelheira de cá
  V: { ramp: IR, base: 0.8, spread: 2.2 },                             // pé de cá
  E: { ramp: CR, base: 0.5, spread: 2.6, h: 0.4 },                     // peito
  a: { ramp: IR, base: 1.4, spread: 2.2 },                             // abdômen de ferro
  q: { ramp: ['Y', 'y', 'o', 'O'], base: 0.3, spread: 2.2, noSeam: true }, // aro da cabine
  H: { ramp: IR, base: 0.4, spread: 2.8, h: 0.4 },                     // cabeça
  c: { ramp: CR, base: 0.2, spread: 2.5 },                             // crista
  j: { ramp: ['s', 't', 'I', 'J'], base: 0, spread: 2 },               // pistão do braço de cá
  B: { ramp: CR, base: 0.4, spread: 2.4, h: 0.4 },                     // braço de cá (manga)
  z: { ramp: IR, base: 0.6, spread: 2.5 },                             // cotovelo
  X: { ramp: CR, base: 0.3, spread: 2.6, h: 0.4 },                     // manopla de cá
  Z: { ramp: IR, base: 0.2, spread: 3, h: 0.4 },                       // broca
  F: { ramp: CR, base: 0.1, spread: 2.4, h: 0.4 },                     // ombreira de cá (placa)
  W: { ramp: CR, base: 0.6, spread: 2.2, h: 0.4 },                     // ombreira de cá (lâmina)
};
const TITA_ORDER = 'PbldefpGQALkNVEaqHcjBzXZWF';

function titaFrame(alt) {
  const S = grid(96, 96);
  const u = alt ? 1 : 0; // pistões comprimem: corpo de cima desce 1px
  const U = (pts) => pts.map(([x, y]) => [x, y + u]);
  // chaminés nas costas (inclinadas para trás)
  S.poly(U([[11, 9], [17, 9], [20, 32], [14, 32]]), 'P');
  S.poly(U([[9, 6], [19, 6], [18, 10], [10, 10]]), 'P');
  S.poly(U([[20, 13], [25, 13], [27, 30], [22, 30]]), 'P');
  S.poly(U([[18, 10], [27, 10], [26, 14], [19, 14]]), 'P');
  S.poly(U([[28, 15], [32, 15], [33, 26], [29, 26]]), 'P');
  // perna de lá
  S.poly([[30, 62], [40, 62], [40, 74], [33, 80], [27, 73]], 'b');
  S.poly([[27, 80], [39, 80], [38, 89], [28, 89]], 'b');
  S.poly([[27, 76], [33, 73], [39, 76], [38, 83], [28, 83]], 'l');
  S.poly([[18, 88], [41, 87], [46, 91], [46, 95], [18, 95]], 'd');
  // braço de lá com garra
  S.stroke(24, 34 + u, 15, 50 + u, 3.2, 'e');
  S.poly(U([[6, 48], [21, 47], [22, 62], [18, 68], [9, 68], [5, 58]]), 'f');
  S.poly(U([[6, 67], [11, 67], [8, 79], [4, 86], [3, 78]]), 'p');
  S.poly(U([[12, 68], [16, 68], [16, 81], [13, 89], [11, 80]]), 'p');
  S.poly(U([[17, 67], [21, 66], [25, 75], [24, 82], [20, 76]]), 'p');
  // ombreira de lá
  S.poly(U([[12, 30], [16, 21], [28, 16], [40, 20], [40, 30], [30, 38], [16, 38]]), 'G');
  // pélvis, tassets e perna de cá
  S.poly([[29, 58], [63, 58], [66, 67], [58, 73], [36, 73], [28, 66]], 'Q');
  S.poly([[30, 62], [40, 62], [39, 72], [31, 70]], 'A');
  S.poly([[48, 62], [62, 62], [64, 70], [52, 74]], 'A');
  S.poly([[47, 66], [62, 66], [63, 77], [55, 82], [46, 76]], 'L');
  S.poly([[48, 78], [55, 75], [62, 78], [62, 85], [49, 85]], 'k');
  S.poly([[47, 84], [64, 84], [63, 90], [49, 90]], 'N');
  S.poly([[40, 89], [66, 88], [75, 92], [75, 95], [40, 95]], 'V');
  // tronco: peito carmim (trapézio invertido) + abdômen de ferro
  S.poly(U([[36, 50], [64, 50], [62, 61], [38, 61]]), 'a');
  S.poly(U([[24, 26], [33, 18], [62, 16], [72, 22], [74, 38], [68, 51], [56, 54], [40, 54], [30, 50], [24, 40]]), 'E');
  S.oval(53, 36 + u, 9, 9, 'q');
  // cabeça baixa entre os ombros, com crista
  S.poly(U([[46, 20], [49, 13], [58, 11], [65, 15], [67, 21], [63, 26], [49, 26]]), 'H');
  S.poly(U([[49, 13], [51, 6], [55, 5], [58, 11]]), 'c');
  // braço de cá: manga, pistão, cotovelo, manopla e broca para baixo/frente
  S.poly(U([[66, 34], [78, 34], [80, 46], [72, 50], [66, 44]]), 'B');
  S.stroke(74, 46 + u, 77, 56 + u, 2.6, 'j');
  S.oval(77, 57 + u, 5, 4.5, 'z');
  S.poly(U([[70, 56], [84, 54], [88, 62], [86, 70], [74, 70], [70, 63]]), 'X');
  S.poly(U([[76, 69], [88, 67], [94, 93], [92, 94]]), 'Z');
  // ombreira de cá: placa superior + lâmina inferior
  S.poly(U([[66, 38], [84, 34], [88, 42], [80, 46], [68, 45]]), 'W');
  S.poly(U([[58, 24], [66, 15], [80, 15], [88, 22], [88, 32], [78, 38], [62, 36]]), 'F');
  const g = shadePlates(S, TITA_PLATES, TITA_ORDER);
  titaDetails(g, S, alt, u);
  return g;
}

// rebite: ponto claro + sombra embaixo (só sobre a região indicada)
function rivet(g, S, x, y, regions, hi = 'y', lo = 'O') {
  if (!regions.includes(S.get(x, y)) || !regions.includes(S.get(x, y + 1))) return;
  g.set(x, y, hi);
  g.set(x, y + 1, lo);
}
// borda inferior de uma região: devolve [x, yMax] por coluna
function lowerEdge(S, ch) {
  const out = [];
  for (let x = 0; x < S.w; x++) {
    let yy = -1;
    for (let y = 0; y < S.h; y++) if (S.get(x, y) === ch) yy = y;
    if (yy >= 0) out.push([x, yy]);
  }
  return out;
}
function upperEdge(S, ch) {
  const out = [];
  for (let x = 0; x < S.w; x++) {
    for (let y = 0; y < S.h; y++) if (S.get(x, y) === ch) { out.push([x, y]); break; }
  }
  return out;
}

function titaDetails(g, S, alt, u) {
  // ---- cabine de vidro com Varek dentro
  const cx = 53, cy = 36 + u;
  for (let y = cy - 8; y <= cy + 8; y++) {
    for (let x = cx - 8; x <= cx + 8; x++) {
      const d = Math.hypot(x + 0.5 - (cx + 0.5), y + 0.5 - (cy + 0.5));
      if (d > 7.2) continue;
      const lv = (y - (cy - 7)) / 14; // luz interna mais forte no alto
      g.set(x, y, d > 6.3 ? '5' : d > 5.2 ? '4' : lv < 0.45 ? '2' : lv < 0.8 ? '3' : '4');
    }
  }
  // silhueta de Varek (cabeça + ombros, olhando para a direita)
  g.paste(cx - 4, cy - 5, [
    '...hhhh....',
    '..hhhhvv...',
    '..hvvvvvv..',
    '..vvvvvhv..',
    '...vvvvvv..',
    '....vvvv...',
    '.....vv....',
    '..vvvvvvvv.',
    '.vvvvvvvvvv',
    'vvvvvvvvvvv',
    'vvvvvvvvvvv',
  ]);
  // reflexo frio no vidro
  g.paste(cx - 6, cy - 6, ['...cc', '.cC..', '.c...', 'cC...', 'c....']);
  // rebites do aro de latão
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * 8.2), y = Math.round(cy + Math.sin(a) * 8.2);
    if (S.get(x, y) === 'q') g.set(x, y, k < 5 ? 'O' : 'o');
  }
  // ---- viseira com luzes-olho
  g.paste(55, 17 + u, [
    '..KKKKKKKKKK',
    'KDD34DDD34DD',
    'DD3123DD3123',
    'KDD34DDD34D.',
    '..KKKKKKKK..',
  ]);
  if (alt) g.swap({ '1': '2', '2': '3' }, 55, 17 + u, 67, 22 + u);
  // grade da boca
  g.paste(59, 23 + u, ['KiKiKiK', 'KIKIKI.']);
  // ---- costuras e rebites do peito
  for (let y = 22; y <= 49; y++) {
    if (S.get(37, y + u) === 'E') { g.set(37, y + u, 'T'); if (S.get(38, y + u) === 'E') g.set(38, y + u, 'r'); }
  }
  for (let x = 25; x <= 37; x++) if (S.get(x, 31 + u) === 'E') { g.set(x, 31 + u, 'T'); g.set(x, 32 + u, 'R'); }
  for (let x = 28; x <= 44; x += 3) rivet(g, S, x, 21 + u, 'E');
  for (let y = 24; y <= 48; y += 4) rivet(g, S, 35, y + u, 'E');
  for (let x = 40; x <= 66; x += 3) rivet(g, S, x, 50 + u, 'E');
  // ---- abdômen: grelhas da fornalha
  const slats = [52, 55, 58];
  slats.forEach((yy, i) => {
    for (let x = 39; x <= 61; x++) {
      if (S.get(x, yy + u) !== 'a') continue;
      g.set(x, yy + u, 'D');
      const t = Math.abs(x - 50) / 11;
      let ch = t < 0.35 ? '2' : t < 0.7 ? '3' : '4';
      if (alt && i !== 1) ch = ch === '2' ? '3' : ch === '3' ? '4' : '5';
      if (alt && i === 1) ch = ch === '3' ? '2' : ch;
      g.set(x, yy + 1 + u, ch);
    }
  });
  // ---- ombreiras: frisos de latão, rebites, emblema
  for (const [x, y] of lowerEdge(S, 'F')) { if (S.get(x, y - 1) === 'F') { g.set(x, y, 'o'); g.set(x, y - 1, 'y'); } }
  for (const [x, y] of lowerEdge(S, 'W')) { if (S.get(x, y - 1) === 'W') { g.set(x, y, 'o'); g.set(x, y - 1, 'y'); } }
  for (const [x, y] of lowerEdge(S, 'G')) { if (S.get(x, y - 1) === 'G') { g.set(x, y, 'O'); g.set(x, y - 1, 'o'); } }
  for (const [x, y] of upperEdge(S, 'F')) if (x % 3 === 0) rivet(g, S, x, y + 2, 'F');
  for (const [x, y] of upperEdge(S, 'G')) if (x % 3 === 1) rivet(g, S, x, y + 2, 'G', 'o', 'O');
  g.paste(70, 21 + u, ['..Y.y..', '.Yyyyo.', 'YyKKKoO', '.yKJKo.', 'yoKKKOO', '.oooOO.', '..o.O..']);
  // grelha pequena na ombreira de lá
  g.paste(20, 30 + u, ['DDDDD', '43334', 'DDDDD'].map((r) => (alt ? r.replace(/3/g, '4') : r)));
  // ---- broca: sulcos em espiral
  const bx = 82, by = 68 + u, tx = 93, ty = 93 + u;
  const L = Math.hypot(tx - bx, ty - by);
  const ax = (tx - bx) / L, ay = (ty - by) / L;
  const off = alt ? 2 : 0; // sulcos "giram" no quadro alternativo
  for (let t = 3 + off; t < L - 2; t += 4.5) {
    for (let k = -8; k <= 8; k += 0.5) {
      const x = Math.round(bx + ax * t + ay * k + ax * k * 0.45);
      const y = Math.round(by + ay * t - ax * k + ay * k * 0.45);
      if (S.get(x, y) !== 'Z') continue;
      g.set(x, y, 'K');
      const x2 = Math.round(x + ax), y2 = Math.round(y + ay);
      if (S.get(x2, y2) === 'Z' && g.get(x2, y2) !== 'K') g.set(x2, y2, k < 0 ? 'w' : 'i');
    }
  }
  // colar de latão na base da broca
  g.line(76, 68 + u, 88, 66 + u, 'y');
  g.line(76, 69 + u, 88, 67 + u, 'o');
  // ---- manopla de cá: faixa de latão, costura, rebites, pistão
  g.line(72, 58 + u, 87, 56 + u, 'y');
  g.line(72, 59 + u, 87, 57 + u, 'o');
  for (let y = 60; y <= 68; y++) if (S.get(79, y + u) === 'X') { g.set(79, y + u, 'T'); if (S.get(80, y + u) === 'X') g.set(80, y + u, 'r'); }
  for (let y = 61; y <= 68; y += 3) { rivet(g, S, 74, y + u, 'X'); rivet(g, S, 84, y + u, 'X'); }
  // antebraço de lá: faixas e rebites
  g.line(6, 54 + u, 21, 53 + u, 'o');
  g.line(6, 55 + u, 21, 54 + u, 'O');
  g.line(7, 63 + u, 21, 62 + u, 'o');
  for (let x = 8; x <= 20; x += 3) rivet(g, S, x, 50 + u, 'f', 'o', 'O');
  // ---- garra: juntas e pontas
  for (const [x, y] of [[7, 73], [14, 75], [21, 72]]) { g.set(x, y + u, 'K'); g.set(x + 1, y + u, 'K'); g.set(x - 1, y + u, 'K'); g.set(x, y + 1 + u, 'i'); }
  g.paste(3, 84 + u, ['w']);
  g.paste(13, 87 + u, ['w']);
  g.paste(24, 81 + u, ['w']);
  // ---- chaminés: bocas com brasa, faixas de latão, fumaça
  g.paste(10, 6 + u, ['DD4554DD']);
  g.paste(19, 10 + u, ['DD545DD']);
  g.paste(12, 14 + u, ['yyyyyy', 'oooooo']);
  g.paste(21, 17 + u, ['yyyy', 'oooo']);
  g.paste(13, 24 + u, ['yyyyyy', 'oooooo']);
  if (!alt) {
    g.paste(9, 1, ['..mmM...', '.mmmmMn.', 'mMmMnn..']);
    g.paste(20, 6, ['.mM.', 'mMn.']);
  } else {
    g.paste(7, 1, ['.mmmM....', 'mmMmmMn..', '.MnnMnn..']);
    g.paste(21, 4, ['.mmM', 'mMMn', '.n..']);
  }
  // ---- pernas: grelha na canela, dedos dos pés, rebites
  g.paste(50, 86, alt ? ['DDDDDDDDDD', '4433443344'] : ['DDDDDDDDDD', '4332332334']);
  for (const x of [58, 66]) for (let y = 91; y <= 94; y++) if (S.get(x, y) === 'V') g.set(x, y, 'K');
  for (const x of [26, 34]) for (let y = 91; y <= 94; y++) if (S.get(x, y) === 'd') g.set(x, y, 'D');
  for (let x = 50; x <= 60; x += 3) rivet(g, S, x, 79, 'k');
  for (let x = 31; x <= 38; x += 3) rivet(g, S, x, 64, 'A');
  for (let x = 50; x <= 61; x += 3) rivet(g, S, x, 64, 'A');
}

function tita() {
  const [a, b] = tightPair(titaFrame(false), titaFrame(true));
  return {
    idle: render(a, TITA_PAL), alt: render(b, TITA_PAL),
    glow: glowOf(a, TITA_PAL, TITA_GLOW), altGlow: glowOf(b, TITA_PAL, TITA_GLOW),
  };
}

// ================================================================ exporta
export const ENEMY_ART_B = {
  soldado,
  drone,
  cao_ferro2,
  mago,
  varek,
  tita,
};
