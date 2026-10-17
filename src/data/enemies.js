// Inimigos: atributos, escudos (quebra), fraquezas, IA e recompensas.
import { Bitmap } from '../art/bitmap.js';
import { blob, selOutline } from '../art/sculpt.js';
import { customSheet } from '../game/assets.js';
import { enemyImages } from '../art/imageSprites.js';

const artMods = import.meta.glob('../art/enemies_*.js', { eager: true });
const ART = {};
for (const m of Object.values(artMods)) {
  for (const [k, v] of Object.entries(m)) if (k.startsWith('ENEMY_ART')) Object.assign(ART, v);
}

// Habilidades de inimigos
const S = {
  bater: { name: 'Ataque', kind: 'phys', power: 1, target: 'hero' },
  jato: { name: 'Jato d’Água', kind: 'mag', power: 13, element: 'gelo', target: 'hero', fx: 'ice' },
  esporos: { name: 'Esporos do Sono', kind: 'status', status: 'sono', chance: 0.45, target: 'heroes', fx: 'spores' },
  mordida: { name: 'Mordida Sombria', kind: 'phys', power: 1.35, target: 'hero', fx: 'bite' },
  uivo: { name: 'Uivo', kind: 'buff', buff: { atk: 0.3 }, turns: 3, target: 'self', fx: 'roar' },
  ferrao: { name: 'Ferrão', kind: 'phys', power: 1.0, status: 'veneno', chance: 0.35, target: 'hero', fx: 'pierce' },
  // Cão de Ferro
  mordida_ferro: { name: 'Mandíbula de Ferro', kind: 'phys', power: 1.3, target: 'hero', fx: 'bite' },
  carregar: { name: 'Fornalha Carregando…', kind: 'charge', next: 'rajada', target: 'self', fx: 'charge', msg: 'A fornalha do Cão de Ferro brilha intensamente!' },
  rajada: { name: 'Rajada de Vapor', kind: 'mag', power: 30, element: 'fogo', target: 'heroes', fx: 'steam' },
  // caverna
  rasante: { name: 'Rasante Cristalino', kind: 'phys', power: 1.1, target: 'hero', fx: 'slash' },
  teia: { name: 'Teia de Quartzo', kind: 'status', status: 'lento', chance: 0.6, target: 'hero', fx: 'web' },
  rolar: { name: 'Rolamento', kind: 'phys', power: 1.4, target: 'hero', fx: 'blunt' },
  encolher: { name: 'Carapaça', kind: 'buff', buff: { def: 0.6 }, turns: 2, target: 'self', fx: 'buff' },
  soco_cristal: { name: 'Punho de Ametista', kind: 'phys', power: 1.45, target: 'hero', fx: 'blunt' },
  estilhacos: { name: 'Chuva de Estilhaços', kind: 'mag', power: 26, element: 'terra', target: 'heroes', fx: 'quake' },
  nucleo: { name: 'Núcleo Pulsando…', kind: 'charge', next: 'ressonancia', target: 'self', fx: 'charge', msg: 'O núcleo do golem começa a vibrar!' },
  ressonancia: { name: 'Ressonância Prismática', kind: 'mag', power: 44, element: 'luz', target: 'heroes', fx: 'light' },
  // forte
  alabarda: { name: 'Golpe de Alabarda', kind: 'phys', power: 1.25, target: 'hero', fx: 'slash' },
  formacao: { name: 'Formação de Escudo', kind: 'buff', buff: { def: 0.4 }, turns: 3, target: 'allies', fx: 'buff' },
  laser: { name: 'Feixe Vigia', kind: 'mag', power: 26, element: 'fogo', target: 'hero', fx: 'beam' },
  alarme: { name: 'Alarme', kind: 'buff', buff: { spd: 0.4 }, turns: 3, target: 'allies', fx: 'roar' },
  canhao: { name: 'Canhão de Vapor', kind: 'mag', power: 30, element: 'fogo', target: 'heroes', fx: 'steam' },
  raio_arcano: { name: 'Raio Arcano', kind: 'mag', power: 30, element: 'raio', target: 'hero', fx: 'thunder' },
  curar_aliado: { name: 'Remendo Arcano', kind: 'heal', power: 80, target: 'ally_enemy', fx: 'heal' },
  // Varek
  estocada_varek: { name: 'Estocada Precisa', kind: 'phys', power: 1.4, target: 'hero', fx: 'pierce' },
  danca_laminas: { name: 'Dança das Lâminas', kind: 'phys', power: 0.7, hits: 3, target: 'hero', fx: 'slash2' },
  ordem: { name: 'Ordem do Capitão', kind: 'buff', buff: { atk: 0.35, spd: 0.25 }, turns: 3, target: 'self', fx: 'roar' },
  // Titã
  broca: { name: 'Lança-Broca', kind: 'phys', power: 1.6, target: 'hero', fx: 'pierce' },
  garra: { name: 'Garra Hidráulica', kind: 'phys', power: 1.1, target: 'heroes', fx: 'slash' },
  superaquecer: { name: 'Superaquecendo…', kind: 'charge', next: 'erupcao', target: 'self', fx: 'charge', msg: 'As fornalhas da Armadura Titã rugem em vermelho!' },
  erupcao: { name: 'Erupção de Caldeira', kind: 'mag', power: 58, element: 'fogo', target: 'heroes', fx: 'explosion' },
};

export const ENEMY_SKILLS = S;

export const ENEMIES = {
  // ---------------------------------------------------------------- Bosque
  goticula: {
    name: 'Gotícula', hp: 30, atk: 8, def: 5, mag: 6, res: 5, spd: 7, shield: 2,
    weak: ['fogo', 'raio', 'impacto'], exp: 8, gold: 6, drops: [['pocao', 0.25]],
    ai: [[S.bater, 4], [S.jato, 1]], fieldSpeed: 2.0, fieldScale: 0.8,
  },
  cogumelo: {
    name: 'Cogumelo Sonolento', hp: 42, atk: 9, def: 6, mag: 8, res: 6, spd: 6, shield: 2,
    weak: ['fogo', 'corte'], exp: 11, gold: 8, drops: [['antidoto', 0.3]],
    ai: [[S.bater, 3], [S.esporos, 1]], fieldSpeed: 1.6, fieldScale: 0.8,
  },
  lobo: {
    name: 'Lobo Sombrio', hp: 52, atk: 12, def: 7, mag: 4, res: 5, spd: 13, shield: 3,
    weak: ['luz', 'perfuracao', 'fogo'], exp: 15, gold: 10, drops: [['pocao', 0.3]],
    ai: [[S.bater, 3], [S.mordida, 2], [S.uivo, 1]], fieldSpeed: 3.2, fieldScale: 0.7,
  },
  vespa: {
    name: 'Vespa-Lanterna', hp: 38, atk: 10, def: 5, mag: 6, res: 7, spd: 16, shield: 2,
    weak: ['gelo', 'vento', 'corte'], exp: 12, gold: 9, drops: [['antidoto', 0.35]],
    ai: [[S.bater, 2], [S.ferrao, 2]], floats: true, fieldSpeed: 2.8, fieldScale: 0.75,
  },
  cao_ferro: {
    name: 'Cão de Ferro', boss: true, hp: 360, atk: 15, def: 11, mag: 11, res: 8, spd: 9, shield: 4,
    weak: ['raio', 'impacto', 'luz'], exp: 120, gold: 150, drops: [['hipocao', 1]],
    ai: [[S.bater, 2], [S.mordida_ferro, 2], [S.carregar, 1]], fieldScale: 0.7,
  },
  // ---------------------------------------------------------------- Caverna
  morcego: {
    name: 'Morcego de Cristal', hp: 74, atk: 17, def: 9, mag: 10, res: 9, spd: 17, shield: 2,
    weak: ['vento', 'impacto', 'raio'], exp: 22, gold: 14, drops: [['pocao', 0.3]],
    ai: [[S.bater, 2], [S.rasante, 2]], floats: true, fieldSpeed: 3.0, fieldScale: 0.75,
  },
  lodo: {
    name: 'Lodo Ametista', hp: 88, atk: 15, def: 10, mag: 16, res: 12, spd: 9, shield: 3,
    weak: ['fogo', 'raio'], exp: 24, gold: 15, drops: [['eter', 0.15]],
    ai: [[S.bater, 2], [S.jato, 2]], fieldSpeed: 2.0, fieldScale: 0.8,
  },
  aranha: {
    name: 'Aranha de Quartzo', hp: 96, atk: 18, def: 11, mag: 10, res: 9, spd: 13, shield: 3,
    weak: ['fogo', 'impacto', 'corte'], exp: 27, gold: 18, drops: [['tonico', 0.25]],
    ai: [[S.bater, 3], [S.teia, 1], [S.ferrao, 1]], fieldSpeed: 2.6, fieldScale: 0.7,
  },
  tatu: {
    name: 'Tatu-Rocha', hp: 120, atk: 19, def: 18, mag: 6, res: 8, spd: 8, shield: 4,
    weak: ['gelo', 'perfuracao'], exp: 30, gold: 20, drops: [['pocao', 0.4]],
    ai: [[S.bater, 2], [S.rolar, 2], [S.encolher, 1]], fieldSpeed: 1.8, fieldScale: 0.75,
  },
  golem: {
    name: 'Golem Ametista', boss: true, hp: 1150, atk: 24, def: 16, mag: 20, res: 14, spd: 9, shield: 7,
    weak: ['gelo', 'impacto', 'perfuracao'], exp: 420, gold: 400, drops: [['broche_estelar', 1]],
    ai: [[S.soco_cristal, 3], [S.estilhacos, 2], [S.nucleo, 1]], fieldScale: 0.55,
  },
  // ---------------------------------------------------------------- Ataque à vila
  recruta: {
    name: 'Recruta Imperial', art: 'soldado', hp: 70, atk: 13, def: 9, mag: 6, res: 7, spd: 9, shield: 2,
    weak: ['corte', 'raio', 'luz'], exp: 22, gold: 18, drops: [['pocao', 0.5]],
    ai: [[S.bater, 3], [S.alabarda, 1]], fieldScale: 0.75,
  },
  // ---------------------------------------------------------------- Forte
  soldado: {
    name: 'Soldado Imperial', hp: 150, atk: 25, def: 18, mag: 8, res: 10, spd: 11, shield: 3,
    weak: ['corte', 'raio', 'luz'], exp: 40, gold: 30, drops: [['pocao', 0.4], ['hipocao', 0.1]],
    ai: [[S.bater, 3], [S.alabarda, 2], [S.formacao, 1]], fieldSpeed: 2.6, fieldScale: 0.75,
  },
  drone: {
    name: 'Drone Vigia', hp: 110, atk: 18, def: 14, mag: 22, res: 12, spd: 15, shield: 3,
    weak: ['raio', 'perfuracao', 'vento'], exp: 38, gold: 28, drops: [['eter', 0.25]],
    ai: [[S.laser, 3], [S.alarme, 1]], floats: true, fieldSpeed: 2.9, fieldScale: 0.8,
  },
  cao_ferro2: {
    name: 'Cão de Ferro Mk II', hp: 260, atk: 27, def: 20, mag: 20, res: 12, spd: 12, shield: 5,
    weak: ['raio', 'gelo', 'impacto'], exp: 70, gold: 60, drops: [['hipocao', 0.4]],
    ai: [[S.mordida_ferro, 3], [S.canhao, 1]], fieldSpeed: 3.0, fieldScale: 0.6,
  },
  mago: {
    name: 'Arcanista Imperial', hp: 130, atk: 14, def: 12, mag: 28, res: 20, spd: 12, shield: 3,
    weak: ['corte', 'perfuracao', 'luz'], exp: 44, gold: 34, drops: [['eter', 0.35]],
    ai: [[S.raio_arcano, 3], [S.curar_aliado, 1]], fieldSpeed: 2.2, fieldScale: 0.75,
  },
  varek: {
    name: 'Capitão Varek', boss: true, hp: 1400, atk: 32, def: 20, mag: 20, res: 18, spd: 16, shield: 6,
    weak: ['luz', 'perfuracao', 'raio'], exp: 600, gold: 500, drops: [['hipocao', 1]],
    ai: [[S.estocada_varek, 3], [S.danca_laminas, 2], [S.ordem, 1]], fieldScale: 0.8,
  },
  tita: {
    name: 'Armadura Titã', boss: true, hp: 2400, atk: 32, def: 24, mag: 28, res: 18, spd: 10, shield: 8,
    weak: ['raio', 'gelo', 'luz'], exp: 0, gold: 0, drops: [],
    ai: [[S.broca, 3], [S.garra, 2], [S.superaquecer, 1]], fieldScale: 0.5,
  },
};

// ---------------------------------------------------------------- arte
function placeholder(kind) {
  const b = new Bitmap(28, 26);
  const hue = { lobo: ['#b0a8ff', '#6a60c8', '#3a3080', '#1c1840'], vespa: ['#fff0a0', '#ffb040', '#c06020', '#602010'] }[kind] || ['#c8f0ff', '#6ab8ff', '#3a6ad0', '#1c3080'];
  blob(b, 14, 15, 11, 9, hue);
  b.set(10, 14, [20, 20, 40, 255]);
  b.set(17, 14, [20, 20, 40, 255]);
  b.set(11, 12, [255, 255, 255, 255]);
  return selOutline(b);
}

export function enemyFrames(kind) {
  const fn = ART[ENEMIES[kind]?.art || kind];
  let r = null;
  try {
    r = fn ? fn() : null;
  } catch (e) {
    console.warn('arte do inimigo falhou', kind, e);
  }
  if (!r) {
    const p = placeholder(kind);
    r = { idle: p, alt: p, glow: null, altGlow: null };
  }
  return r;
}

// Inimigos em PNG (SpriteCook) substituem a arte em código quando existem.
const framesCache = {};
function framesFor(kind) {
  if (!framesCache[kind]) {
    const r = enemyFrames(kind);
    // arte em código pode vir em resolução maior com r.scale < 1 (mesmo tamanho no mundo)
    framesCache[kind] = enemyImages(ENEMIES[kind]?.art || kind, r.idle, r.scale || 1) || { ...r, scale: r.scale || 1 };
  }
  return framesCache[kind];
}

export function enemySheet(kind) {
  const sheet = customSheet('enemy:' + kind, () => {
    const r = framesFor(kind);
    return { idle: r.idle, alt: r.alt || r.idle };
  }, 2);
  sheet.scale = framesFor(kind).scale;
  return sheet;
}

const glowCache = {};
export function enemyGlowSheet(kind) {
  if (glowCache[kind] === undefined) glowCache[kind] = !!framesFor(kind).glow;
  if (!glowCache[kind]) return null;
  return customSheet('enemyglow:' + kind, () => {
    const r = framesFor(kind);
    const blank = new Bitmap(r.idle.w, r.idle.h);
    return { idle: r.glow || blank, alt: r.altGlow || r.glow || blank };
  }, 2);
}
