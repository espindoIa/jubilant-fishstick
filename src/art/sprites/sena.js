// SENA — Sacerdotisa. Guardiã do santuário de Vila Maré, amiga de infância de Lio.
// Cabelo prateado-lavanda com franja reta, trança sobre o ombro, laço turquesa,
// camélia branca, veste branca de mangas largas, faixa vermelha com sininho,
// saia-calça turquesa plissada. Luta com um cajado de lua crescente.
import { compose } from '../charkit.js';

export const SENA_PALETTE = {
  '#': '#1a1020',
  // cabelo prata-lavanda
  h: '#fbf8ff', H: '#cdc4ec', L: '#aea2dc', J: '#9086c2', K: '#5a4f8a',
  // pele
  s: '#fff0e2', S: '#f7cdb0', T: '#d39880', t: '#a46a5c', m: '#d97a86',
  // olhos
  e: '#1a2a32', i: '#2fb39c', W: '#ffffff',
  // veste branca
  w: '#ffffff', c: '#e4e8f4', C: '#aab0cc', X: '#6c7096',
  // turquesa
  a: '#6ae6cf', A: '#22a28f', Z: '#11605a',
  // faixa vermelha
  r: '#ff6a78', R: '#cc2a40', Q: '#7c1428',
  // ouro
  y: '#ffe68a', Y: '#c8962e', k: '#7e5418',
  // camélia
  f: '#ffffff', F: '#ff8fb2',
  // madeira do cajado
  o: '#d9a066', O: '#9a6236', D: '#5e3720',
  // prata
  g: '#f4f8ff', G: '#a9b6d4', E: '#66729a',
  // sandálias
  u: '#8a5a3a', U: '#5a3422',
  '*': '#e6fff8', '+': '#7dffe0',
};

// ============================================================ FRENTE
const HEAD_D = [
  '.....HhhHL......',
  '...HhhhhHHLJ.f..',
  '..HhHHHHhHHLfFf.',
  '.HhHHHHHHHHLJfJ.',
  '.HhHHJHHHJHHLJK.',
  '.HHHHJHHHJHHLJK.',
  '.HLHLJHLHJLHLJK.',
  '.HhJTSSSSSTJLJK.',
  '.HHLS#SSS#SJLJK.',
  '.HLLSiSSSiSJLJK.',
  '.LJJJTSSSTJJJK..',
];
const BRAID_D = [
  'JH.',
  'HJ.',
  'JK.',
  'HJ.',
  'aAZ',
  '.J.',
];
const ROBE_D = [
  '.....#STT#......',
  '...cwaSSSAcC....',
  '..cwwcaSAcwcC...',
  '.cwwc#cAcwc#CX..',
  '.cwwc#wwccC#CCX.',
  '.cwcC#RrRRQ#CCX.',
  '.wcCSRRyRRQSCCX.',
  '.cCC.aZAAZA.CXX.',
];
const ROBE_D_A = [
  '.....#STT#......',
  '...cwaSSSAcC....',
  '..cwwcaSAcwcC...',
  '.cwwc#cAcwc#CX..',
  '.cwwc#wwccC#CCX.',
  '.cwcC#RrRRQ#CCX.',
  '.wcC#RRyRRQ#CCX.',
  '..CC.aZAAZASCXX.',
];
const ROBE_D_B = [
  '.....#STT#......',
  '...cwaSSSAcC....',
  '..cwwcaSAcwcC...',
  '.cwwc#cAcwc#CX..',
  '.cwwc#wwccC#CCX.',
  '.cwcC#RrRRQ#CCX.',
  '.wcC#RRyRRQ#CCX.',
  '.cCCSaZAAZA.CX..',
];
const withBraidD = (rows) => compose(16, 8, [[rows, 0, 0], [BRAID_D, 3, 0]]);
const TORSO_D = withBraidD(ROBE_D);
const TORSO_D_A = withBraidD(ROBE_D_A);
const TORSO_D_B = withBraidD(ROBE_D_B);
const LEGS_D = [
  '....aAZAAZAZ....',
  '...aAAZAAZAZZ...',
  '...aAAZAAZAAZ...',
  '..aaAAZAAZAAZZ..',
  '....uU...uU.....',
];
const LEGS_D_A = [
  '....aAZAAZAZ....',
  '...aAAZAAZAZZ...',
  '..aAAZAAZAAZZ...',
  '..aAAZAAZAAZZ...',
  '...uUU..........',
];
const LEGS_D_B = [
  '....aAZAAZAZ....',
  '...aAAZAAZAZZ...',
  '...aAAZAAZAAZZ..',
  '...aAAZAAZAAZZ..',
  '..........uUU...',
];

// ============================================================ COSTAS
const HEAD_U = [
  '.....HhhHL......',
  '..fHhhhhHHLJ....',
  '.fFfHHHHhHHLJ...',
  '.HfHHHHHHHHLJJ..',
  '.HhHHLHHHHLHLJK.',
  '.HHHHLHHHHLLLJK.',
  '.HHHHHLHHHLHJJK.',
  '.LHHHHLHHLLJJK..',
  '.LJHHHHLHLJJK...',
  '..JLHHHHLJJK....',
  '....JLHLJK......',
];
const TORSO_U = [
  '.....cTaZc......',
  '...cwwwwcLJC....',
  '..cwwwwcccLJK...',
  '.cwwc#wccc#CJX..',
  '.cwwc#wwcC#CCX..',
  '.cwcC#RrRRQ#CCX.',
  '.wcCSRQRrRQSCCX.',
  '.cCC.aZAAZA.CXX.',
];
const TORSO_U_A = [
  '.....cTaZc......',
  '...cwwwwcLJC....',
  '..cwwwwcccLJK...',
  '.cwwc#wccc#CJX..',
  '.cwwc#wwcC#CCX..',
  '.cwcC#RrRRQ#CCX.',
  '.wcC#RQRrRQ#CCX.',
  '..CC.aZAAZASCXX.',
];
const TORSO_U_B = [
  '.....cTaZc......',
  '...cwwwwcLJC....',
  '..cwwwwcccLJK...',
  '.cwwc#wccc#CJX..',
  '.cwwc#wwcC#CCX..',
  '.cwcC#RrRRQ#CCX.',
  '.wcC#RQRrRQ#CCX.',
  '.cCCSaZAAZA.CX..',
];

// ============================================================ LADO (esquerda)
const HEAD_L = [
  '.....HhhHL......',
  '...HhhhhHHLf....',
  '..HhHHHHhHHfFf..',
  '.HhHHHHHHHLLfJ..',
  '.HHHJHHHLHHLLJ..',
  '.HHHJHHJLHHLJJ..',
  'HLHJHLHJLHLJJJ..',
  '.sSSSTHJLHLJJK..',
  '.SS#SSHJLLJJK...',
  'sSSiSSTHJLJK....',
  '.TSSSTTHJJK.....',
];
const BRAID_L = [
  '.HJ',
  '.hJ',
  '.JH',
  '.hJ',
  '.HJ',
  'aAZ',
  '.HJ',
];
const ROBE_L = [
  '...#TTS#HJ......',
  '..cawSwwwcC.....',
  '..cwaw#wwwcC....',
  '..cwwc#wwccC....',
  '..cwwc#wwcCC....',
  '..RrRR#wwcCX....',
  '..RyRQSwcCCX....',
  '..aAZASCCCXX....',
];
const ROBE_L_BACK = [
  '...#TTS#HJ......',
  '..cawSwwwcC.....',
  '..cwawc#wwwC....',
  '..cwwcc#wwcCC...',
  '..cwwcc#wwcCCX..',
  '..RrRRRQ#wcCCX..',
  '..RyRQRQ#cCCXX..',
  '..aAZAZAZ#CXSS..',
];
const ROBE_L_FWD = [
  '...#TTS#HJ......',
  '..cawSwwwcC.....',
  '..cwacwwwcC.....',
  '..cwwCwwccC.....',
  '..cwCwwccCCX....',
  '..RCwwwcCCX.....',
  '.SSwwccCCXX.....',
  '.SSCCCXXZ.......',
];
const withBraidL = (rows) => compose(16, 8, [[rows, 0, 0], [BRAID_L, 0, 0]]);
const TORSO_L = withBraidL(ROBE_L);
const TORSO_L_BACK = withBraidL(ROBE_L_BACK);
const TORSO_L_FWD = withBraidL(ROBE_L_FWD);
const LEGS_L = [
  '...aAAAAZZ......',
  '...aAAZAAAZ.....',
  '..aAAZAAAZZ.....',
  '..aAZAAZAAZZ....',
  '.uUU............',
];
const LEGS_L_A = [
  '...aAAAAZZ......',
  '..aAAZAAAZZ.....',
  '.aAAZAAAAZZZ....',
  'aAAZAAZAAAZZ....',
  'uUU.......UU....',
];
const LEGS_L_B = [
  '...aAAAAZZ......',
  '..aAAZAAAZZ.....',
  '.aAZAAAZAZZ.....',
  '.aAZAAZAAZZZ....',
  '.UU.....uUU.....',
];

// ============================================================ BATALHA (voltado à esquerda)
const HEAD_L_HURT = [
  '.....HhhHL......',
  '...HhhhhHHLf....',
  '..HhHHHHhHHfFf..',
  '.HhHHHHHHHLLfJ..',
  '.HHHJHHHLHHLLJ..',
  '.HHHJHHJLHHLJJ..',
  'HLHJHLHJLHLJJJ..',
  '.sSSSTHJLHLJJK..',
  '.SSTSSHJLLJJK...',
  'sS##SSTHJLJK....',
  '.TSTTTTHJJK.....',
];
const HEAD_L_DOWN = [ // cabeça baixa, exausta
  '.....HhhHL......',
  '...HhhhhHHLf....',
  '..HhHHHHhHHfFf..',
  '.HhHHHHHHHLLfJ..',
  '.HHHJHHHLHHLLJ..',
  '.HHHJHHJLHHLJJ..',
  '.HLHJHLHJLHLJJK.',
  '.LJHLJHHJLLJJK..',
  '.sSSSTHJLLJJK...',
  '.S##STTHJLJK....',
  '..TSTTHJJK......',
];
// corpo de lado sem o braço próximo (trança e laço à frente do peito)
const B_BODY = [
  '.HJ#TTS#HJ......',
  '.hJawSwwwcC.....',
  '.JHcawwwwcC.....',
  '.hJcwwwwccC.....',
  '.HJcwwwccCC.....',
  'aAZRrRRRQQ......',
  '.HJyRRRRQQ......',
  '..aAZAAZZZ......',
];
const B_LEGS = [
  '...aAAAAZZ......',
  '..aAAZAAAZZ.....',
  '.aAAZAAAZAZZ....',
  'aAAZAAAZAAZZ....',
  'uUU......UUU....',
];
const B_LEGS_LUNGE = [
  '....aAAAAZZ.........',
  '...aAAZAAAZZZ.......',
  '..aAAZAAAZAAZZZ.....',
  '.aAAZAAZAAAZAAZZ....',
  'uUU..........UUU....',
];
// braço próximo: segura o cajado à frente (origem = torso x-3, linha 1)
const ARM_HOLD = [
  '..........wwcC',
  '........wwwwcC',
  '.SSwwwwwwwwccC',
  '.SScwwwwwccCCX',
  '....cCwwccCCX.',
  '.....CCcCCXX..',
  '......CXXX....',
];
// braço puxado para trás (preparo)
const ARM_WIND = [
  '.wwcC..',
  '..wwcC.',
  '..cwcSS',
  '..cCCSS',
  '..CCCX.',
  '...CXX.',
];
// braço estendido no golpe (origem = torso x-4, linha 1)
const ARM_STRIKE = [
  '.......wwwwcC',
  '...wwwwwwwccC',
  'SScwwwwwwccCX',
  'SS.cCcwwcCCX.',
  '....CCCccCX..',
  '......CXX....',
];
// braço erguido à frente (magia)
const ARM_RAISE = [
  '.SS...........',
  '.SSw..........',
  '..wwc.........',
  '...wwcwwwcC...',
  '....cCwwwcC...',
  '.....CCwcCC...',
  '......CXXX....',
];
// cajado de lua crescente (haste na coluna 3)
const CRES = [
  '..yy.',
  '.yY..',
  'yY...',
  'yY.+.',
  'yY...',
  '.yY..',
  '..yYY',
];
const CRES_GLOW = [
  '..**.',
  '.*+..',
  '*+...',
  '*+.*.',
  '*+...',
  '.*+..',
  '..*yY',
];
const staffV = (len, top = CRES) => [...top, '...Or', '...OR', ...Array(len).fill('...O.'), '...k.'];
const SPARK = [
  '.*.',
  '*+*',
  '.*.',
];
const STAFF_BACK = [
  '.........yy..',
  '..........Yy.',
  '........+..Yy',
  '...........Yy',
  '.......y..Yy.',
  '.......kYYy..',
  '......oO.....',
  '.....oO......',
  '....oO.......',
  '...oO........',
  '..oO.........',
  '.oO..........',
  'kk...........',
];
const STAFF_TILT = [
  '..yy...',
  '.yY....',
  'yY.....',
  'yY.+...',
  'yY.....',
  '.yY....',
  '..yYY..',
  '...Or..',
  '...OR..',
  '....O..',
  '....O..',
  '....O..',
  '.....O.',
  '.....O.',
  '.....O.',
  '......O',
  '......k',
];
const STAFF_L = [
  '...y..........',
  '..yY..........',
  '.yY...........',
  'yY.+..........',
  'yY............',
  '.yYOOOOOOOOOOk',
  '..yY..........',
];
// vitória: de frente, sorrindo (olhos fechados)
const HEAD_D_WIN = [
  '.....HhhHL......',
  '...HhhhhHHLJ.f..',
  '..HhHHHHhHHLfFf.',
  '.HhHHHHHHHHLJfJ.',
  '.HhHHJHHHJHHLJK.',
  '.HHHHJHHHJHHLJK.',
  '.HLHLJHLHJLHLJK.',
  '.HhJTSSSSSTJLJK.',
  '.HHLSSSSSSSJLJK.',
  '.HLLT#SSS#TJLJK.',
  '.LJJJTStSTJJJK..',
];
// ajoelhada
const K_BODY = [
  '.hJawSwwwcC.....',
  '.JHcawwwwcC.....',
  '.hJcwwwccCC.....',
  'aAZRrRRRQQ......',
  '.HJyRRRRQQ......',
];
const K_LEGS = [
  '..aAAAAAZZ......',
  '.aAAAZAAAAZ.....',
  'aAAZ.aAZAAZZ....',
  'aAZZ.aAAZAAZZZ..',
  'uUU..aAZZZZZZUU.',
];
// caída de costas (pés à esquerda)
const KO_BODY = [
  '...............cwwwc',
  '.u.aaaaaaaaaRRcwwwwc',
  '.uUAAAAAAAAARycHJwwc',
  'UUaZZZAZZZZZRRaAZcCC',
  '.UAAAAAAAAAAQQCCCCXX',
  '..ZZZZZZZZZZQQ.CXXX.',
];
const KO_HEAD = [
  '...s......',
  '.TSSSHhh..',
  'TS#SHHHHf.',
  'TSSJHHHfFf',
  '.JHHLLJJf.',
  '.JLLJJJK..',
  '.KJJJK....',
];
// vitória: de frente, cajado erguido
const W_ROBE = [
  '.....#STT#......',
  '...cwaSSSAcC....',
  '..cwwcaSAcwcC...',
  '.ccwc#cAcwc#CX..',
  '..cw#wwwccC#CCX.',
  '..cC#RrRRQ#CCCX.',
  '..CC#RRyRRQSCCX.',
  '..CX.aZAAZA.CXX.',
];
const W_ARM = [
  'SSc.',
  'SScw',
];

const AX = 12; // âncora do corpo na grade de batalha (32 colunas)
const B = (h, layers) => compose(32, h, layers);
const KO = compose(30, 7, [[KO_BODY, 0, 1], [KO_HEAD, 19, 0]]);

export const sena = {
  id: 'sena',
  name: 'Sena',
  palette: SENA_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  battleW: 32,
  battleOffX: -3,
  dir: {
    down: { head: HEAD_D, torso: [TORSO_D, TORSO_D_A], torsoB: TORSO_D_B, legs: [LEGS_D, LEGS_D_A], legsB: LEGS_D_B },
    up: { head: HEAD_U, torso: [TORSO_U, TORSO_U_A], torsoB: TORSO_U_B, legs: [LEGS_D, LEGS_D_A], legsB: LEGS_D_B },
    left: { head: HEAD_L, torso: [TORSO_L, TORSO_L_BACK, TORSO_L_FWD], legs: [LEGS_L, LEGS_L_A, LEGS_L_B] },
  },
  extra: { ko: KO },
  battle: {
    idle: B(27, [[staffV(17), AX - 6, 0], [HEAD_L, AX, 3], [B_BODY, AX, 14], [ARM_HOLD, AX - 4, 15], [B_LEGS, AX, 22]]),
    windup: B(27, [[STAFF_BACK, AX + 7, 8], [HEAD_L, AX + 1, 3], [B_BODY, AX, 14], [ARM_WIND, AX + 5, 15], [B_LEGS, AX, 22]]),
    attack: B(27, [[HEAD_L, AX - 2, 4], [B_BODY, AX - 1, 15], [STAFF_L, AX - 12, 13], [ARM_STRIKE, AX - 5, 16], [B_LEGS_LUNGE, AX - 3, 22]]),
    cast: B(30, [[SPARK, AX - 10, 0], [SPARK, AX - 2, 3], [SPARK, AX - 9, 7], [staffV(13, CRES_GLOW), AX - 6, 1], [HEAD_L, AX, 6], [B_BODY, AX, 17], [ARM_RAISE, AX - 4, 15], [B_LEGS, AX, 25]]),
    hurt: B(27, [[STAFF_TILT, AX - 6, 5], [HEAD_L_HURT, AX + 3, 3], [B_BODY, AX + 2, 14], [ARM_HOLD, AX - 2, 15], [B_LEGS, AX, 22]]),
    kneel: B(24, [[staffV(14), AX - 6, 0], [HEAD_L_DOWN, AX - 1, 3], [K_BODY, AX, 14], [ARM_HOLD.slice(0, 4), AX - 4, 14], [K_LEGS, AX, 19]]),
    ko: B(7, [[KO, AX - 10, 0]]),
    win: B(30, [[SPARK, AX - 9, 3], [SPARK, AX + 1, 0], [staffV(20, CRES_GLOW), AX - 4, 0], [HEAD_D_WIN, AX, 6], [withBraidD(W_ROBE), AX, 17], [W_ARM, AX - 1, 20], [LEGS_D, AX, 25]]),
  },
};
