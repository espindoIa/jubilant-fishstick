// BRANN — Guardião. Ex-cavaleiro do Império de Ferro que desertou.
// Enorme, pele bronzeada escura, cabelo raspado com têmporas grisalhas,
// barba cheia, cicatriz no nariz. Armadura amassada com o brasão imperial
// raspado, capa verde esfarrapada. Luta com lança e escudo-torre.
//
// Estilo FF6: ~20x27 px (o "grandalhão" do grupo), contorno preto (ink)
// e linhas internas '#'.
import { compose } from '../charkit.js';

export const BRANN_PALETTE = {
  '#': '#1a1020',
  // cabelo raspado / barba (h/H/J/K) e grisalho (v/V)
  h: '#6e6e80', H: '#3c3c4c', J: '#24242e', K: '#14141a', v: '#c4c4d4', V: '#8a8a9e',
  // pele bronzeada (x = luz forte), cicatriz (k)
  s: '#e0a476', S: '#b4703f', T: '#80462a', t: '#56301c', x: '#f0bc94', k: '#f6cbb6',
  // olhos (e/W usados pelos retratos)
  e: '#120a06', W: '#ffffff', i: '#4a2a1c',
  // aço
  g: '#f2f6ff', G: '#aab6ce', F: '#6c7896', E: '#3e4662',
  // brasão raspado
  r: '#e0564a', R: '#8e2c2c',
  // capa verde
  a: '#74ac68', A: '#447442', Z: '#24402a',
  // couro
  l: '#b47c48', L: '#7c4c28', M: '#4c2c18',
  // ouro
  y: '#ffe68a', Y: '#c8962e',
  // madeira da lança / escudo
  o: '#c08850', O: '#8a5a30', D: '#553418',
  // calça acolchoada (sob a armadura)
  p: '#6c6488', P: '#463f60', q: '#2a2540',
  // brilho da proteção
  '*': '#fffbe6', '+': '#ffe27a', '%': '#9ee0ff',
};

// ============================================================ FRENTE
const HEAD_D = [
  '.......hhHHHH.......',
  '.....hhhhHHHHHJ.....',
  '....hhhHHHHHHHJJ....',
  '....vhxssSSSSTHV....',
  '....VSJJJSSJJJTV....',
  '...sTSS#SSkS#SSTt...',
  '...TVSSiSkTSiSTVt...',
  '....HSSSSTTSSSTJ....',
  '....HhSShhhhSSHJ....',
  '....JHhHH##HHhHJ....',
  '.....JHVHHHHVHJ.....',
];
const TORSO_D = [
  '..gggGA#HHHH#AGGGF..',
  '.ggGGGFEgGGFEGGGGFE.',
  'gGGGGFEGrRRgFEGGGGFE',
  'EFFFFEFGRRgRFFEFFFFE',
  'FGFAEGGGrgRRGGFEZFFE',
  'gGFaEGGGGgFGGGFEAGFE',
  'GGFAEFGGGFFGGFFEZFFE',
  'sSTAMlLLLyYLLLLMZSTt',
  'ST.ZFGGFEGGFEGGEZ.Tt',
  '...AEFGFE..EFGFEA...',
];
const TORSO_D_A = [
  '..gggGA#HHHH#AGGGF..',
  '.ggGGGFEgGGFEGGGGFE.',
  'gGGGGFEGrRRgFEGGGGFE',
  'EFFFFEFGRRgRFFEFFFFE',
  'FGFAEGGGrgRRGGFEZFFE',
  'gGFaEGGGGgFGGGFEAGFE',
  'sSTAEFGGGFFGGFFEZFFE',
  'ST.AMlLLLyYLLLLMZGFE',
  '...ZFGGFEGGFEGGEZSTt',
  '...AEFGFE..EFGFEA.Tt',
];
const TORSO_D_B = [
  '..gggGA#HHHH#AGGGF..',
  '.ggGGGFEgGGFEGGGGFE.',
  'gGGGGFEGrRRgFEGGGGFE',
  'EFFFFEFGRRgRFFEFFFFE',
  'FGFAEGGGrgRRGGFEZFFE',
  'gGFaEGGGGgFGGGFEAGFE',
  'GGFAEFGGGFFGGFFEZSTt',
  'GGFAMlLLLyYLLLLMZ.Tt',
  'sSTZFGGFEGGFEGGEZ...',
  'ST.AEFGFE..EFGFEA...',
];
const LEGS_D = [
  '...ZApPPqZZpPPqAZ...',
  '...A.gGGFZZgGFE.A...',
  '.....FGGFZ.FGFE.....',
  '.....FGGE..FGFE.....',
  '.....lLLM..lLLM.....',
  '....lLLLM..lLLLM....',
];
const LEGS_D_A = [
  '...ZApPPqZZpPPqAZ...',
  '...A.gGGFZZgGFE.A...',
  '.....FGGFZ.FGFE.....',
  '.....FGGE..lLLM.....',
  '.....lLLM..lLLLM....',
  '....lLLLM...........',
];
const LEGS_D_B = [
  '...ZApPPqZZpPPqAZ...',
  '...A.gGGFZZgGFE.A...',
  '.....FGGFZ.FGFE.....',
  '.....lLLM..FGFE.....',
  '....lLLLM..lLLM.....',
  '...........lLLLM....',
];

// ============================================================ COSTAS
const HEAD_U = [
  '.......hhHHHH.......',
  '.....hhhhHHHHHJ.....',
  '....hhhHHHHhHHJJ....',
  '....hhHHhHHHHHJJ....',
  '....hHHHHHHHHHJJ....',
  '...svHHHHHHHHHJVt...',
  '...TVHHHHHHHHJJVt...',
  '....HJHHHHHHHJJJ....',
  '....HJJHHHHHJJJJ....',
  '....JHHTSSSSTHHJ....',
  '.....JHTTSSTTHJ.....',
];
const TORSO_U = [
  '..gggGAAAAAAAAGGGF..',
  '.ggGGGFaAAAAAAGGGGF.',
  'gGGGGFaaAAAAAZGGGGFE',
  'EFFFFEaAAAAAAZEFFFFE',
  'FGFaAAAZAAAAZAAAZFFE',
  'gGFaAAAZAAAAZAAAZGFE',
  'GGFaAAZAAAAAZAAZZFFE',
  'sSTaAAZAAAAZAAAZZSTt',
  'ST.aAAZAAAAZAAAZZ.Tt',
  '...aAZAAAZAAAZAAZZ..',
];
const TORSO_U_A = [
  '..gggGAAAAAAAAGGGF..',
  '.ggGGGFaAAAAAAGGGGF.',
  'gGGGGFaaAAAAAZGGGGFE',
  'EFFFFEaAAAAAAZEFFFFE',
  'FGFaAAAZAAAAZAAAZFFE',
  'gGFaAAAZAAAAZAAAZGFE',
  'sSTaAAZAAAAAZAAZZFFE',
  'ST.aAAZAAAAZAAAZZGFE',
  '...aAAZAAAAZAAAZZSTt',
  '...aAZAAAZAAAZAAZZTt',
];
const TORSO_U_B = [
  '..gggGAAAAAAAAGGGF..',
  '.ggGGGFaAAAAAAGGGGF.',
  'gGGGGFaaAAAAAZGGGGFE',
  'EFFFFEaAAAAAAZEFFFFE',
  'FGFaAAAZAAAAZAAAZFFE',
  'gGFaAAAZAAAAZAAAZGFE',
  'GGFaAAZAAAAAZAAZZSTt',
  'GGFaAAZAAAAZAAAZZ.Tt',
  'sSTaAAZAAAAZAAAZZ...',
  'ST.aAZAAAZAAAZAAZZ..',
];
const LEGS_U = [
  '...aAZAZAAAZAAZAZ...',
  '...A.ZAGFZZZAZE.Z...',
  '.....FGGF..FGFE.....',
  '.....FGGE..FGFE.....',
  '.....lLLM..lLLM.....',
  '....lLLLM..lLLLM....',
];
const LEGS_U_A = [
  '...aAZAZAAAZAAZAZ...',
  '...A.ZAGFZZZAZE.Z...',
  '.....FGGF..FGFE.....',
  '.....FGGE..lLLM.....',
  '.....lLLM..lLLLM....',
  '....lLLLM...........',
];
const LEGS_U_B = [
  '...aAZAZAAAZAAZAZ...',
  '...A.ZAGFZZZAZE.Z...',
  '.....FGGF..FGFE.....',
  '.....lLLM..FGFE.....',
  '....lLLLM..lLLM.....',
  '...........lLLLM....',
];

// ============================================================ LADO (esquerda)
const HEAD_L = [
  '.......hhHHHH.......',
  '.....hhhhHHHHHJ.....',
  '....hhhHHHHHHHJJ....',
  '....xshHHHHHHHJJ....',
  '...sJJSSvVHHHHHJ....',
  '...k#SSSSVsTHHHJ....',
  '..SSiSSSSVTTHHJ.....',
  '...TSSSSHHHJTt......',
  '...HhhSHHHHJTt......',
  '...JH#HHHVHJt.......',
  '....JHHVHHJ.........',
];
const HEAD_L_HURT = [
  '.......hhHHHH.......',
  '.....hhhhHHHHHJ.....',
  '....hhhHHHHHHHJJ....',
  '....xshHHHHHHHJJ....',
  '...sTTSSvVHHHHHJ....',
  '...kSSSSSVsTHHHJ....',
  '..S##SSSSVTTHHJ.....',
  '...TSSSSHHHJTt......',
  '...H##hHHHHJTt......',
  '...JHHHHHVHJt.......',
  '....JHHVHHJ.........',
];
const HEAD_L_DOWN = [
  '.......hhHHHH.......',
  '.....hhhhHHHHHJ.....',
  '....hhhHHHHHHHJJ....',
  '....hhhHHHHHHHJJ....',
  '....xshHHHHHHHJJ....',
  '...sJJSSvVHHHHHJ....',
  '...k#SSSSVsTHHHJ....',
  '..STSSSSSVTTHHJ.....',
  '...HhhSHHHHJTt......',
  '...JHHHHHVHJt.......',
  '....JHHVHHJ.........',
];
const TORSO_L = [
  '.....EF#ggGGFAa.....',
  '....gGFgggGGGGFAAa..',
  '....GGgGGGGGGGFFAAa.',
  '....GFEFFFFFFFEEAAZ.',
  '....GFF#gGGFEFEAAZ..',
  '....FrR#gGGFEEAAAZ..',
  '....FRF#gGGFEEAAZZ..',
  '....MlL#sSSTMMAAZ...',
  '....FGGFSTTTFEAZAZ..',
  '....EFGFE..EFEZ.Z...',
];
const TORSO_L_BACK = [
  '.....EF#ggGGFAa.....',
  '....gGFgggGGGGFAAa..',
  '....GGgGGGGGGGFFAAa.',
  '....GFEFFFFFFFEEAAZ.',
  '....GFFF#gGGFEEAAZ..',
  '....FrRFF#gGGFEAAZ..',
  '....FRFFFF#gGGFAAZ..',
  '....MlLLLLMM#sSSTAZ.',
  '....FGGFEGGFESTTTZ..',
  '....EFGFE..EFEZ.Z...',
];
const TORSO_L_FWD = [
  '.....EF#ggGGFAa.....',
  '....gGFgggGGGGFAAa..',
  '....GGgGGGGGGGFFAAa.',
  '....GFEFFFFFFFEEAAZ.',
  '....GF#gGGFEFFEAAZ..',
  '....F#gGGFEEFEAAAZ..',
  '...#gGGFRFFFFEAAZZ..',
  '..sSSTMLLLLMMMAAZ...',
  '..STTTFEGGFFEAZAZ...',
  '....EFGFE..EFEZ.Z...',
];
const LEGS_L = [
  '.....pPPPqZAZ.......',
  '.....gGGGF.Z........',
  '.....FGGF...........',
  '.....FGGE...........',
  '....lLLLM...........',
  '...lLLLLM...........',
];
const LEGS_L_A = [
  '....pPPPPPqZ.Z......',
  '...gGGF.EFFEZ.......',
  '...FGGF..EFFE.......',
  '..FGGE...EFFE.......',
  '.lLLLM...LLMM.......',
  'lLLLLM...LLLMM......',
];
const LEGS_L_B = [
  '....PPPpPPPqZ.Z.....',
  '...EFFE.gGGFZ.......',
  '...EFFE..FGGF.......',
  '..EFFE...FGGE.......',
  '.LLMM....lLLLM......',
  'LLLMM....lLLLLM.....',
];

// ============================================================ BATALHA (voltado à esquerda)
// Grade de 36 colunas; corpo ancorado em AX. Lança atrás do corpo, escudo à frente.
const B_TORSO = [
  '.....EF#ggGGFAa.....',
  '....gGFgggGGGGFAAa..',
  '....GGgGGGGGGGFFAAa.',
  '....GFEFFFFFFFEEAAZa',
  '...sSgGGGGFFEEAAZA..',
  '...STFFFFFFEEEAAAZA.',
  '....FGGGGGGFEEAAZZAZ',
  '....MlLLLLLLMMAAZ.ZA',
  '....FGGFEGGFFEAZA..Z',
  '....EFGFE..EFEZ.Z...',
];
const B_TORSO_HURT = [
  '......EF#ggGGFAa....',
  '.....gGFgggGGGGFAAa.',
  '.....GGgGGGGGGGFFAAa',
  '....GGFEFFFFFFFEEAAZ',
  '...sSgGGGGFFEEAAZA..',
  '...STFFFFFFEEEAAAZA.',
  '....FGGGGGGFEEAAZZAZ',
  '....MlLLLLLLMMAAZ.ZA',
  '....FGGFEGGFFEAZA..Z',
  '....EFGFE..EFEZ.Z...',
];
const K_TORSO = [
  '.....EF#ggGGFAa.....',
  '....gGFgggGGGGFAAa..',
  '....GGgGGGGGGGFFAAa.',
  '...sSFEFFFFFFEEAAZa.',
  '...STgGGGGFFEEAAZZAZ',
  '....MlLLLLLLMMAAZ.ZA',
  '....FGGFEGGFFEAZA..Z',
];
const K_LEGS = [
  '...gGGGGGpPPPqZ.......',
  '..gGGGF...EFFFE.......',
  '..FGGF.....EFFFE......',
  '..FGGE......EFFFFFLLM.',
  '.lLLLM.......EEEEEMMM.',
];
const ARM_UP = [
  'sS..',
  'STF.',
  '.GF.',
  '.GF.',
  '.gGF',
  '.GGF',
  '.GGF',
  '.FGF',
  '.FGF',
  '.FFE',
  '.FE.',
  '..E.',
];
const ARM_THRUST = [
  'sSgGGGF',
  'STFFFFE',
];
const B_LEGS = [
  '.....pPPPPPqZ.......',
  '....gGGF..EFFEZ.....',
  '...FGGF....EFFE.....',
  '...FGGE....EFFE.....',
  '..lLLLM....LLLMM....',
  '.lLLLLM....LLLLMM...',
];
const B_LEGS_LUNGE = [
  '......pPPPPPPqZ.......',
  '....gGGGF....EFFEZ....',
  '...gGGF........EFFE...',
  '..FGGF..........EFFE..',
  '.lLLLM..........LLLMM.',
  'lLLLLM..........LLLLMM',
];
const SHIELD = [
  '.gGGGGF.',
  'gGoooOGF',
  'GooOOODF',
  'GoOOOODF',
  'GoOyYODF',
  'GoOYYODF',
  'GoOOOODF',
  'GoOOOODF',
  'GoOOODDF',
  'GoOOODDF',
  'GOOODDDF',
  'FODDDDDE',
  '.FEEEEE.',
];
const SPEAR_V = [
  '.g.', 'gGF', 'gGF', 'gGF', '.F.', 'YYY', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.',
  '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.o.', '.O.', '.O.', '.O.', '.D.',
];
const SPEAR_H = [
  '..g..........................',
  'ggGGFYooooooooooooooooooooOOD',
  '..F..........................',
];
const HAND = ['sS', 'ST'];

const BARRIER = [
  '....%..',
  '..%*...',
  '.%*....',
  '%*.....',
  '%*.....',
  '%+.....',
  '%*.....',
  '%*.....',
  '.%*....',
  '..%*...',
  '....%..',
];
const SPARK = ['.*.', '*+*', '.*.'];

// inclina uma peça vertical: o topo desloca 1 coluna para a direita a cada `every` linhas
const tilt = (rows, every) => rows.map((r, y) => '.'.repeat(Math.floor((rows.length - 1 - y) / every)) + r);
const SPEAR_TILT = tilt(SPEAR_V, 7);

const AX = 12; // âncora do corpo na grade de batalha (36 colunas)
const B = (h, layers) => compose(36, h, layers);

// caído de costas (cabeça à direita)
const KO_BODY = [
  '...........ggGGF...',
  'lL.......FgGGGGGF..',
  'lLL.FGGGFMGgrRgGGFE',
  'LLLgGGGGFlGGRRgGGFF',
  'MLLFGGGGFLFGGGGGFFE',
  '.MMEFFFFEMEEFFFFFEE',
  '...ZZAZZAAZAAZAAZZZ',
];
const KO_HEAD = [
  '..sk.hhHH...',
  '.sSSShHHHHJ.',
  'S##SSvHHHHHJ',
  'HhSSTVJHHHHJ',
  'HHhHTTJHHJJ.',
  '.JHHHJJJJJ..',
];
const KO = compose(30, 7, [[KO_BODY, 0, 0], [KO_HEAD, 18, 1]]);

// vitória: de frente, lança erguida, escudo apoiado ao lado
const HEAD_D_WIN = HEAD_D.map((r, y) => (y === 9 ? '....JHhH#WW#HhHJ....' : r));
const W_TORSO = [
  '..gggGA#HHHH#AGGGF..',
  '.ggGGGFEgGGFEGGGGFE.',
  'gGGGGFEGrRRgFEGGGGFE',
  'EFFFFEFGRRgRFFEFFFFE',
  '..FAEGGGrgRRGGFEZFFE',
  '...aEGGGGgFGGGFEAGFE',
  '...AEFGGGFFGGFFEZFFE',
  '...AMlLLLyYLLLLMZSTt',
  '...ZFGGFEGGFEGGEZ.Tt',
  '...AEFGFE..EFGFEA...',
];
const W_ARM = [
  '.sS.',
  'sSST',
  '.GF.',
  'gGF.',
  'GGF.',
  'GGF.',
  'FGFE',
  'FGFE',
];
const W_SHIELD = [
  '.gGGGGGF.',
  'gGoooOOGF',
  'GooOOOODF',
  'GoOOOOODF',
  'GoOOyYODF',
  'GoOyYYODF',
  'GoOOYOODF',
  'GoOOOOODF',
  'GoOOOODDF',
  'GoOOOODDF',
  'GOOOODDDF',
  'FOODDDDDE',
  '.FEEEEEE.',
];

export const brann = {
  id: 'brann',
  name: 'Brann',
  palette: BRANN_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 20,
  battleW: 36,
  battleOffX: -4,
  dir: {
    down: { head: HEAD_D, torso: [TORSO_D, TORSO_D_A], torsoB: TORSO_D_B, legs: [LEGS_D, LEGS_D_A], legsB: LEGS_D_B },
    up: { head: HEAD_U, torso: [TORSO_U, TORSO_U_A], torsoB: TORSO_U_B, legs: [LEGS_U, LEGS_U_A], legsB: LEGS_U_B },
    left: { head: HEAD_L, torso: [TORSO_L, TORSO_L_BACK, TORSO_L_FWD], legs: [LEGS_L, LEGS_L_A, LEGS_L_B] },
  },
  extra: { ko: KO },
  battle: {
    idle: B(31, [[SPEAR_V, AX + 17, 0], [HEAD_L, AX, 4], [B_TORSO, AX, 15], [B_LEGS, AX, 25], [HAND, AX + 17, 20], [SHIELD, AX, 16]]),
    windup: B(31, [[SPEAR_H, AX - 6, 2], [ARM_UP, AX + 15, 2], [HEAD_L, AX + 1, 4], [B_TORSO, AX + 1, 15], [B_LEGS, AX, 25], [SHIELD, AX + 1, 16]]),
    attack: B(31, [[SPEAR_H, AX - 12, 17], [HEAD_L, AX - 3, 4], [B_TORSO, AX - 2, 15], [B_LEGS_LUNGE, AX - 4, 25], [ARM_THRUST, AX - 4, 18], [SHIELD, AX + 3, 18]]),
    cast: B(31, [[SPEAR_V, AX + 17, 0], [HEAD_L, AX, 4], [B_TORSO, AX, 15], [B_LEGS, AX, 25], [HAND, AX + 17, 20], [SHIELD, AX - 2, 12], [BARRIER, AX - 8, 9], [SPARK, AX - 9, 6], [SPARK, AX - 11, 17], [SPARK, AX + 4, 25]]),
    hurt: B(31, [[SPEAR_TILT, AX + 18, 1], [HEAD_L_HURT, AX + 4, 5], [B_TORSO_HURT, AX + 2, 15], [B_LEGS, AX + 1, 25], [HAND, AX + 20, 20], [SHIELD, AX + 4, 19]]),
    kneel: B(27, [[SPEAR_V, AX + 15, 0], [HEAD_L_DOWN, AX - 1, 5], [K_TORSO, AX, 15], [K_LEGS, AX, 22], [HAND, AX + 15, 17], [SHIELD, AX - 3, 14]]),
    ko: B(7, [[KO, AX - 10, 0]]),
    win: B(33, [[SPEAR_V, AX + 1, 0], [HEAD_D_WIN, AX, 6], [W_ARM, AX, 8], [W_TORSO, AX, 17], [LEGS_D, AX, 27], [W_SHIELD, AX + 13, 20]]),
  },
};
