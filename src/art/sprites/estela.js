// ESTELA — Maga Estelar. Uma estrela que caiu do céu em forma de menina.
// Baixinha, cabelo dourado curto com mechas que brilham em ciano nas pontas,
// capa índigo com fecho de estrela, vestido branco com constelações douradas.
// Ela flutua em vez de andar e luta com um astrolábio flutuante.
//
// Estilo FF6 (criança, ~21 linhas como a Relm): cabeça ~10 linhas, contorno
// preto (ink) automático e '#' só para linhas internas. As pontas do cabelo,
// o tufo no topo e as pontas dos pés brilham em ciano (bloom); a capa é um
// céu noturno com estrelinhas. O "andar" é um balanço de capa e pés soltos.
import { compose } from '../charkit.js';

export const ESTELA_PALETTE = {
  '#': '#1a1020',
  // cabelo dourado
  h: '#fffbe2', H: '#f7d872', J: '#cf9d3e', K: '#8a6024',
  // brilho
  '+': '#8ff2ff', '*': '#ffffff', '%': '#4fc8ff',
  // pele clara
  s: '#fff6f0', S: '#f9dccb', T: '#dca592', t: '#ad7470', m: '#e07a8e',
  // olhos dourados
  e: '#3a2410', i: '#ffbf1f', W: '#ffffff',
  // capa índigo
  b: '#6b68d8', B: '#3a3486', N: '#1e1a4e',
  // ouro
  y: '#ffe98c', Y: '#c8962e',
  // vestido
  w: '#ffffff', c: '#dedcf8', C: '#9d9ad4', X: '#6a66a8',
  // astrolábio (latão + cristal)
  o: '#ffe9a0', O: '#c99a3c', D: '#7a5420', q: '#c8f6ff', Q: '#4fb8e8',
};

// ============================================================ FRENTE
const HEAD_D = [
  '........J+......',
  '....hhHHHHJ.....',
  '..hhHHHHHHHHJ...',
  '.hHHHHJhHHHJHJ..',
  '.HHHHJhHHHJhHJK.',
  '.HhHJhHHHJhHHJK.',
  '.HHJsSJHJsSJJJK.',
  '.HJSS#SJS#SSJK..',
  '%HJSSiSSSiSSJJ%.',
  '+%.TTSSSSSTT.%+.',
];
const TORSO_D = [
  '....#BbyBB#.....',
  '...bbBy*yBBN....',
  '..bbBBYBYBBBN...',
  '..bBBBYwYBBBN...',
  '..bBBYwcwYBBN...',
  '..bBSYwywYSBN...',
  '..NNYwcccCYNN...',
];
const TORSO_D_A = [
  '....#BbyBB#.....',
  '...bbBy*yBBN....',
  '..bbBBYBYBBBN...',
  '..bBBBYwYBBBN...',
  '.bbBBYwcwYBBN...',
  '.bBBSYwywYSBN...',
  '.NNNYwcccCYNN...',
];
const TORSO_D_B = [
  '....#BbyBB#.....',
  '...bbBy*yBBN....',
  '..bbBBYBYBBBN...',
  '..bBBBYwYBBBN...',
  '..bBBYwcwYBBNN..',
  '..bBSYwywYSBBN..',
  '..NNYwcccCYNNN..',
];
const LEGS_D = [
  '...XwcccwccCX...',
  '....XCcCcCCX....',
  '.....sS.Ss......',
  '.....+...+......',
];
const LEGS_D_A = [
  '..XwcccwccCX....',
  '...XCcCcCCX.....',
  '....sS..Ss......',
  '....+...........',
];
const LEGS_D_B = [
  '....XwcccwccCX..',
  '.....XCcCcCCX...',
  '......sS..Ss....',
  '..........+.....',
];

// ============================================================ COSTAS
const HEAD_U = [
  '......+J........',
  '....hhHHHHJ.....',
  '..hhHHHHHHHHJ...',
  '.hHHHHJhHHHHJJ..',
  '.HHhHJhHHHJHHJK.',
  '.HhHJhHHHJhHHJK.',
  '.HHJhHHHJhHHJJK.',
  '.HJhHHHJHHHJJJK.',
  '%HJJHJJJHJJJJJ%.',
  '+%.+%TSSST%+.%+.',
];
const TORSO_U = [
  '....BBBBBBB.....',
  '...bbBBBBBBN....',
  '..bbBBBBByBBN...',
  '..bBByBBBBBBN...',
  '..bBBBBB*BBBN...',
  '..bBBBBBBBBBN...',
  '..NNBByBBBBNN...',
];
const TORSO_U_A = [
  '....BBBBBBB.....',
  '...bbBBBBBBN....',
  '..bbBBBBByBBN...',
  '..bBByBBBBBBN...',
  '.bbBBBBB*BBBN...',
  '.bBBBBBBBBBBN...',
  '.NNNBByBBBBNN...',
];
const TORSO_U_B = [
  '....BBBBBBB.....',
  '...bbBBBBBBN....',
  '..bbBBBBByBBN...',
  '..bBByBBBBBBN...',
  '..bBBBBB*BBBNN..',
  '..bBBBBBBBBBBN..',
  '..NNBByBBBBNNN..',
];

// ============================================================ LADO (esquerda)
const HEAD_L = [
  '.......J+.......',
  '....hhHHHJ......',
  '..hhHHHHHHHJ....',
  '.hHHHHJhHHHJHJ..',
  'hHHHHJhHHHJhHJK.',
  'HJhHJhHHHJhHHJK.',
  '.SsJsHHJHJhHJJK.',
  '.SS#SSJHHJHHJK..',
  'sSSiSSTJHJJHJJ+.',
  '.TSSST+%TTJJJ%..',
];
const TORSO_L = [
  '...#yBbB#.......',
  '..y*ybbBBN......',
  '..wYbbBBBBN.....',
  '..wcYbBBBNBN....',
  '..cwYbBBBNBBN...',
  '..SScYbBBBNBBN..',
  '..wccYbBBBBNBN..',
];
const TORSO_L_BACK = [
  '...#yBbB#.......',
  '..y*ybbBBN......',
  '..wYbbBBBBNN....',
  '..wcYbBBBNBBN...',
  '..cwYbBBBNBBBN..',
  '..SScYbBBBBNBBN.',
  '..wccYbBBBBNBNN.',
];
const TORSO_L_FWD = [
  '...#yBbB#.......',
  '..y*ybbBBN......',
  '..wYbbBBBBN.....',
  '..wcYbBBBNBN....',
  '..cwYbBBBNBN....',
  '..SScYbBBBNBN...',
  '..wccYbBBBNBN...',
];
const LEGS_L = [
  '..wcccNBBBNBN...',
  '..XCCC.NNN.N....',
  '...sT...........',
  '...+............',
];
const LEGS_L_A = [
  '..wcccNBBBNBBN..',
  '..XCCC.NNN..NN..',
  '..sT.sT.........',
  '..+....+........',
];
const LEGS_L_B = [
  '..wcccNBBNBN....',
  '..XCCC.NN.N.....',
  '...sTsT.........',
  '....+.+.........',
];

// ============================================================ BATALHA (voltada à esquerda)
// troca caracteres (ex.: pontas do cabelo mais brilhantes ao conjurar)
const remap = (rows, map) => rows.map((r) => r.replace(/./g, (ch) => map[ch] || ch));
const GLOW_HAIR = { '%': '+', '+': '*' };

const HEAD_L_HURT = [
  '.......J+.......',
  '....hhHHHJ......',
  '..hhHHHHHHHJ....',
  '.hHHHHJhHHHJHJ..',
  'hHHHHJhHHHJhHJK.',
  'HJhHJhHHHJhHHJK.',
  '.SsJsHHJHJhHJJK.',
  '.SSSSSJHHJHHJK..',
  'sS##SSTJHJJHJJ+.',
  '.tSSST+%TTJJJ%..',
];
const HEAD_L_DOWN = [ // cabeça baixa, olhos fechados
  '.......J+.......',
  '....hhHHHJ......',
  '..hhHHHHHHHJ....',
  '.hHHHHJhHHHJHJ..',
  'hHHHHJhHHHJhHJK.',
  'HJhHJhHHHJhHHJK.',
  'HJsJJHHJHJhHJJK.',
  '.SSSSSJHHJHHJK..',
  '.S##SSTJHJJHJJ+.',
  '..TSTT+%TTJJJ%..',
];

// astrolábio: aro de latão, placa índigo, cristal-estrela no centro
const ASTRO = [
  '....o....',
  '..ooOOO..',
  '.oNNqNNO.',
  '.oNQ+QNO.',
  'ooq+*+qDD',
  '.ONQ+QND.',
  '.ONNqNND.',
  '..ODDDD..',
  '....D....',
];
const ASTRO_GLOW = [
  '....o....',
  '..ooOOO..',
  '.oq++qqO.',
  '.oq+*+qO.',
  'oo+*W*+DD',
  '.Oq+*+qD.',
  '.Oqq+qqD.',
  '..ODDDD..',
  '....D....',
];
const ASTRO_DIM = [
  '....o....',
  '..ooOOO..',
  '.ONNBNNO.',
  '.ONBQBNO.',
  'OOBQqQBDD',
  '.ONBQBND.',
  '.ONNBNND.',
  '..ODDDD..',
  '....D....',
];
const ASTRO_SPIN = [ // girando de lado (lançado)
  '....o...',
  '..oOOO..',
  '.oq++qO.',
  'o+*W*+DD',
  '.Oq++qD.',
  '..DDDD..',
  '....D...',
];
const SPARK = [
  '.+.',
  '+*+',
  '.+.',
];
const DOT = ['*'];

const B_TORSO_NOARM = [
  '...#yBbB#.......',
  '..y*ybbBBN......',
  '..wYbbBBBBN.....',
  '..wcYbBBBNBN....',
  '..cwYbBBBNBBN...',
  '..wcwYbBBBNBBN..',
  '..wccYbBBBBNBN..',
];
const ARM_FWD = [ // braço sob a capa, estendido para a frente
  '...bbBB',
  'SSbbBBN',
  '...NNN.',
];
const ARM_CAST = [ // braço erguido para a frente
  'SS......',
  'SbbB....',
  '..bBBN..',
  '....bBBN',
];
const ARM_BACK = [ // braço puxado para trás (a capa escorrega, manga branca)
  'cwwc..',
  '.CccSS',
  '....SS',
];
const B_LEGS = [
  '..wcccNBBBNBN...',
  '..XCCC.NNN.N....',
  '...sT...........',
  '...+............',
];
const B_LEGS_BACK = [ // pernas soltas para trás (avanço)
  '..wcccNBBBNBN...',
  '...XCCCNNN.N....',
  '.....sTT........',
  '.......++.......',
];
const B_LEGS_FWD = [ // pernas jogadas à frente (recuo)
  '..wcccNBBBNBN...',
  '.XCCC.NNN.N.....',
  'sTT.............',
  '+...............',
];
// ajoelhada (sentada sobre os calcanhares, flutuando baixo)
const K_TORSO = [
  '..y*ybbBBN......',
  '..wYbbBBBBN.....',
  '..wcYbBBBNBN....',
  '.SScYbBBBNBBN...',
  '..cwwYbBBBNBBN..',
];
const K_LEGS = [
  '.wwcccccNBBBNBN.',
  'XCCCCCCsT+NNNN..',
];
// vitória: de frente, astrolábio erguido
const W_TORSO = [
  '....#BbyBB#.....',
  '...bbBy*yBBN....',
  '..bbBBYBYBBBN...',
  '..bBBBYwYBBBN...',
  '..bBBYwcwYBBN...',
  '..bBBYwywYSBN...',
  '..NNYwcccCYNN...',
];
const W_ARM = [
  '.SS.',
  '.bB.',
  '.bB.',
  '.bBN',
  'bBN.',
  'bBN.',
  'bN..',
];
// caída de costas (campo e batalha)
const KO_BODY = [
  '................',
  '.........cSSc...',
  '....wwcwcwSSwy*y',
  '+sSwcccyccwcwYBB',
  '+TTCCcCCcCCcYbBB',
  '..bBBBByBBBBBBBN',
  '...NNNNNNNNNNNNN',
];
const KO_HEAD = [
  '...s.hhHHJ...',
  '.SsSSJhHHHHJ.',
  'TS##SJHhHHHHJ',
  'TSSSSJHHJHHJK',
  '.TTJ%JHJJHJK+',
  'BB+%JJHJJJ%+.',
  'NN.+%%JJ%+...',
];
const KO = compose(29, 7, [[KO_BODY, 0, 0], [KO_HEAD, 16, 0]]);

const AX = 12; // âncora do corpo na grade de batalha (32 colunas)
const B = (h, layers) => compose(32, h, layers);

export const estela = {
  id: 'estela',
  name: 'Estela',
  palette: ESTELA_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  floats: true,
  battleW: 32,
  battleOffX: -3,
  dir: {
    down: { head: HEAD_D, torso: [TORSO_D, TORSO_D_A], torsoB: TORSO_D_B, legs: [LEGS_D, LEGS_D_A], legsB: LEGS_D_B },
    up: { head: HEAD_U, torso: [TORSO_U, TORSO_U_A], torsoB: TORSO_U_B, legs: [LEGS_D, LEGS_D_A], legsB: LEGS_D_B },
    left: { head: HEAD_L, torso: [TORSO_L, TORSO_L_BACK, TORSO_L_FWD], legs: [LEGS_L, LEGS_L_A, LEGS_L_B] },
  },
  extra: { ko: KO },
  battle: {
    idle: B(21, [[ASTRO, AX - 11, 3], [HEAD_L, AX, 0], [B_TORSO_NOARM, AX, 10], [ARM_FWD, AX - 4, 12], [B_LEGS, AX, 17]]),
    windup: B(21, [[HEAD_L, AX + 1, 0], [B_TORSO_NOARM, AX + 1, 10], [ARM_BACK, AX + 6, 12], [ASTRO_GLOW, AX + 11, 9], [SPARK, AX + 17, 5], [B_LEGS, AX + 1, 17]]),
    attack: B(22, [[ASTRO_SPIN, AX - 12, 4], [SPARK, AX - 4, 1], [DOT, AX - 3, 6], [DOT, AX - 1, 0], [HEAD_L, AX - 1, 1], [B_TORSO_NOARM, AX - 1, 11], [ARM_FWD, AX - 5, 12], [B_LEGS_BACK, AX - 1, 18]]),
    cast: B(24, [[SPARK, AX - 13, 1], [DOT, AX - 2, 2], [DOT, AX - 14, 10], [ASTRO_GLOW, AX - 11, 2], [remap(HEAD_L, GLOW_HAIR), AX, 3], [B_TORSO_NOARM, AX, 13], [ARM_CAST, AX - 4, 13], [B_LEGS, AX, 20]]),
    hurt: B(21, [[ASTRO_DIM, AX - 11, 8], [HEAD_L_HURT, AX + 2, 0], [B_TORSO_NOARM, AX + 1, 10], [B_LEGS_FWD, AX + 1, 17]]),
    kneel: B(17, [[ASTRO_DIM, AX - 10, 8], [HEAD_L_DOWN, AX - 1, 0], [K_TORSO, AX, 10], [K_LEGS, AX - 1, 15]]),
    ko: B(7, [[KO, AX - 9, 0]]),
    win: B(29, [[SPARK, AX - 6, 0], [ASTRO_GLOW, AX - 4, 0], [W_ARM, AX - 2, 9], [HEAD_D, AX, 9], [W_TORSO, AX, 19], [LEGS_D, AX, 25], [DOT, AX + 15, 7]]),
  },
};
