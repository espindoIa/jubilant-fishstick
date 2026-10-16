// LIO — Espadachim. Aprendiz de faroleiro de Vila Maré.
// Cabelo cobre espetado com uma mecha branca, cachecol vermelho,
// jaqueta azul-marinho curta, calça cinza-azulada e botas de couro.
//
// Estilo FF6: ~16x25 px, cabeça com ~40% da altura, contorno preto (ink)
// e linhas internas '#' separando braço/tronco e marcando o queixo.
import { compose } from '../charkit.js';

export const LIO_PALETTE = {
  '#': '#1a1020',
  // cabelo cobre
  h: '#ffb874', H: '#e07434', J: '#a83e1e', K: '#64201a',
  // mecha branca
  w: '#fffaf2', v: '#c4bcd8',
  // pele
  s: '#ffe2c4', S: '#f4b08a', T: '#c27458', t: '#9a5440',
  // olhos (e/W usados pelos retratos)
  e: '#201828', i: '#3c7cd4', W: '#ffffff',
  // cachecol
  r: '#ff6c5c', R: '#d23228', Q: '#861a22',
  // jaqueta
  b: '#6a92e2', B: '#3a5aaa', N: '#1e2a66',
  // camisa
  c: '#fbf2da', C: '#c8b490',
  // cinto
  l: '#cc9048', L: '#8a5828', M: '#58301a',
  // latão
  y: '#ffe484', Y: '#c49432',
  // calça
  p: '#8a92b2', P: '#5c6488', O: '#363a5a',
  // botas
  u: '#b47442', U: '#7a4222', V: '#4a2014',
  // aço
  g: '#f2f6ff', G: '#a2b2d2', F: '#5e6e90',
  // brilho do farol
  '*': '#fff8c8', '+': '#ffd860',
};

// ============================================================ FRENTE
const HEAD_D = [
  '......hH.hH.....',
  '....hhHHhHHHh...',
  '...hHHHHHHHHHJ..',
  '..hwwHHJJHHHJJ..',
  '..wwvJhHHHJhHJK.',
  '..wvJhHHJJhHHJK.',
  '..vJsJHJsSJHJJK.',
  '..JSsSSSSSSSJK..',
  '..JSS#SSS#SSJ...',
  '...SSiSSSiSS....',
  '...TTSSSSSTT....',
];
const TORSO_D = [
  '....#rRRRQ#.....',
  '..BbrRRRRRQBN...',
  '.bBcRRRRQRcNBN..',
  '.bBNccRRQccNBN..',
  '.bBNcCQRQCcNBN..',
  '.SBNcCCQCCcNBS..',
  '.SlLLLyYLLLLlS..',
  '..BBBBNNNBBBN...',
];
const TORSO_D_A = [
  '....#rRRRQ#.....',
  '..BbrRRRRRQBN...',
  '.bBcRRRRQRcNBN..',
  '.bBNccRRQccNBN..',
  '.bBNcCQRQCcNBN..',
  '.bBNcCCQCCcNBN..',
  '.SlLLLyYLLLLBN..',
  '..BBBBNNNBBBSS..',
];
const TORSO_D_B = [
  '....#rRRRQ#.....',
  '..BbrRRRRRQBN...',
  '.bBcRRRRQRcNBN..',
  '.bBNccRRQccNBN..',
  '.bBNcCQRQCcNBN..',
  '.bBNcCCQCCcNBN..',
  '.bBLLLyYLLLLlS..',
  '.SSBBBNNNBBBN...',
];
const LEGS_D = [
  '...pPPO.pPPO....',
  '...pPPO.pPPO....',
  '...pPPO.pPPO....',
  '...uUUV.uUUV....',
  '..uUUUV.uUUUV...',
];
const LEGS_D_A = [
  '...pPPO.pPPO....',
  '...pPPO.pPPO....',
  '...pPPO.uUUV....',
  '...uUUV.uUUV....',
  '..uUUUV.........',
];
const LEGS_D_B = [
  '...pPPO.pPPO....',
  '...pPPO.pPPO....',
  '...uUUV.pPPO....',
  '...uUUV.uUUV....',
  '........uUUUV...',
];

// ============================================================ COSTAS
const HEAD_U = [
  '......hH.hH.....',
  '....hhHHhHHHh...',
  '...hHHHHHHHHHJ..',
  '..hHHHJJHHHJwJ..',
  '..hHJJhHHHJJwvK.',
  '..HJhHHHJJhHHvK.',
  '..JhHHJJhHHHJJK.',
  '..JHHJhHHHJJJK..',
  '..JJhHHJJHHJJ...',
  '...KJJJJJJJK....',
  '....TSSSSST.....',
];
const TORSO_U = [
  '....RRRRRRQ.....',
  '..BRRRRRRRRQN...',
  '.bBBRRrRRRQBBN..',
  '.bBNBRRRQBNBBN..',
  '.bBNBBRRQBBNBN..',
  '.SBNBBRQQBBNBS..',
  '.SlLLLLRQLLLlS..',
  '..BBBBBQBBBBN...',
];
const TORSO_U_A = [
  '....RRRRRRQ.....',
  '..BRRRRRRRRQN...',
  '.bBBRRrRRRQBBN..',
  '.bBNBRRRQBNBBN..',
  '.bBNBBRRQBBNBN..',
  '.bBNBBRQQBBNBN..',
  '.SlLLLLRQLLLBN..',
  '..BBBBBQBBBBSS..',
];
const TORSO_U_B = [
  '....RRRRRRQ.....',
  '..BRRRRRRRRQN...',
  '.bBBRRrRRRQBBN..',
  '.bBNBRRRQBNBBN..',
  '.bBNBBRRQBBNBN..',
  '.bBNBBRQQBBNBN..',
  '.bBLLLLRQLLLlS..',
  '.SSBBBBQBBBBN...',
];

// ============================================================ LADO (esquerda)
const HEAD_L = [
  '.....hH..h......',
  '...hhHHHhHH.h...',
  '..hHHHHHHHJhHJ..',
  '..hwwHHJJJhHHJ..',
  '.hwwvJJhhHHHJJK.',
  '.wwvJhHHHHJJhJK.',
  '.wvSsJHHJJJhHJK.',
  '.vSsSSJJhHHHJK..',
  '.SS#SSTsJHJJK...',
  'sSSiSSTTJJK.....',
  '.TSSSTTT........',
];
const HEAD_L_HURT = [
  '.....hH..h......',
  '...hhHHHhHH.h...',
  '..hHHHHHHHJhHJ..',
  '..hwwHHJJJhHHJ..',
  '.hwwvJJhhHHHJJK.',
  '.wwvJhHHHHJJhJK.',
  '.wvSsJHHJJJhHJK.',
  '.vSsSSJJhHHHJK..',
  '.SSSTSTsJHJJK...',
  's##SSTTTJJK.....',
  '.TSTTTTT........',
];
const HEAD_L_DOWN = [ // cabeça baixa, exausto
  '.....hH..h......',
  '...hhHHHhHH.h...',
  '..hHHHHHHHJhHJ..',
  '..hwwHHJJJhHHJ..',
  '.hwwvJJhhHHHJJK.',
  '.wwvJhHHHHJJhJK.',
  '.wvJHHHHJJJhHJK.',
  '.vSsJJJJhHHHJK..',
  '.SSSSSTsJHJJK...',
  '.S#SSTTTJJK.....',
  '..TSTTT.........',
];
const TORSO_L = [
  '...#rRRRQ#......',
  '..BrRRRRQRRQ....',
  '..bBcRRQBNRRQ...',
  '..bBBc#bBNNRQ...',
  '..bBBB#bBNNQ....',
  '..bBBB#bBNN.....',
  '..lLLy#bBLM.....',
  '..BBBBNSSNN.....',
];
const TORSO_L_BACK = [
  '...#rRRRQ#......',
  '..BrRRRRQRRQ....',
  '..bBcRRQBNRRQ...',
  '..bBBcQB#bNRQ...',
  '..bBBBBB#bBQ....',
  '..bBBBBBB#bB....',
  '..lLLyLLLMSS....',
  '..BBBBNNNNSS....',
];
const TORSO_L_FWD = [
  '...#rRRRQ#......',
  '..BrRRRRQRRQ....',
  '..bBcRRQBNRRQ...',
  '..bBBc#bBNNRQ...',
  '..bBB#bBNNNQ....',
  '..bB#bBBNN......',
  '..lSSBLLLM......',
  '..BSSBNNNN......',
];
const LEGS_L = [
  '...pPPPO........',
  '...pPPPO........',
  '...pPPO.........',
  '..uUUUV.........',
  '.uUUUUV.........',
];
const LEGS_L_A = [
  '...pPPPPO.......',
  '..pPPOPPPO......',
  '.pPO...PPO......',
  '.uUV...OUUV.....',
  'uUUV...UUUV.....',
];
const LEGS_L_B = [
  '...PPpPPO.......',
  '..OPO.pPPO......',
  '.OPO...pPPO.....',
  '.UUV...uUUV.....',
  'UUUV...uUUUV....',
];

// ============================================================ BATALHA (voltado à esquerda)
const B_TORSO = [
  '...#rRRRQ#......',
  '..BrRRRRRQRQ....',
  '.bBcrRRQcNRRQ...',
  '.bBBcQRcNB#bRQ..',
  '.bBBBccNB#bBNQ..',
  '.SbBBBBNB#bBN...',
  '.SSlLyLL#bBN....',
  '..BBBBNN#SS.....',
];
const B_TORSO_NOARM = [
  '...#rRRRQ#......',
  '..BrRRRRRQRQ....',
  '.bBcrRRQcNRRQ...',
  '.bBBcQRcNBNRQ...',
  '.bBBBccNBNNQ....',
  '.SbBBBBNBNN.....',
  '.SSlLyLLLMN.....',
  '..BBBBNNNN......',
];
const B_LEGS = [
  '..pPPO.pPO......',
  '.pPPO..pPPO.....',
  '.pPO...pPPO.....',
  'uUUV...uUUV.....',
  'UUUUV..UUUUV....',
];
const B_LEGS_LUNGE = [
  '...pPPPO.pPPO.......',
  '..pPPO.....pPPO.....',
  '.pPPO.......pPPO....',
  'uUUV.........OUUV...',
  'UUUUV........UUUUV..',
];
const ARM_BACK = [
  '#bBBN..',
  '#BBNSS.',
];
const ARM_FWD = [
  '.bbBBBBN',
  'SSBBBBN.',
];
const SWORD_UR = [
  '.........gg',
  '........gGF',
  '.......gGF.',
  '......gGF..',
  '.....gGF...',
  '....gGF....',
  '...gGF.....',
  '.yYGF......',
  '..YY.......',
  '.L..Y......',
  'L..........',
];
const SWORD_L = [
  'gggggggggGy.',
  'GGGGGGGGFFYL',
];
const ORB = [
  '..*..',
  '.*+*.',
  '*+*+*',
  '.*+*.',
  '..*..',
];
const K_TORSO = [
  '..BrRRRRRQRQ....',
  '.bBcrRRQcNRRQ...',
  '.bBBcQRcNB#bRQ..',
  '.SbBBBNB#bBNQ...',
  '.SSlLyL#bBN.....',
];
const K_LEGS = [
  '..pPPPPOpPPSS...',
  '.pPPO..pPPPO....',
  '.pPO...pPPO.....',
  '.pPO...OPPPPPUUV',
  'uUUV...OOPPPPUUV',
];
// vitória: de frente, espada erguida
const W_TORSO = [
  '....#rRRRQ#.....',
  '..BbrRRRRRQBN...',
  '..BcRRRRQRcNBN..',
  '..BNccRRQccNBN..',
  '..BNcCQRQCcNBN..',
  '..BNcCCQCCcNBS..',
  '..lLLLyYLLLLlS..',
  '..BBBBNNNBBBN...',
];
const W_ARM = [
  '.SS.',
  'SSSS',
  '.bB.',
  '.bB.',
  '.bBN',
  'bBBN',
  'bBN.',
  'bBN.',
];
const W_SWORD = [
  '.g.',
  'gG.',
  'gGF',
  'gGF',
  'gGF',
  'gGF',
  'gGF',
  'gGF',
  'gGF',
  'yYY',
  '.L.',
];
const W_LEGS = [
  '...pPPO.pPPO....',
  '...pPPO..pPPO...',
  '..pPPO...pPPO...',
  '..uUUV....uUUV..',
  '.uUUUV....uUUUV.',
];
// caído de costas
const KO_BODY = [
  '.................',
  'uU.......bBBBrRRQ',
  'uUU.pPPPlbBcccRRQ',
  'UUUpPPPPlBBBcRRQ.',
  'VUUPPPPPLBBBBNQ..',
  '.VVOOOOOMNNNNN...',
];
const KO_HEAD = [
  '...s.hH.h....',
  '.SsSShHHHhH..',
  'TS##SwwHHHHh.',
  'TSSSSvJHHHHHJ',
  '.TTTJJHHHHJJK',
  '...KJJJJJJK..',
];

const AX = 12; // âncora do corpo na grade de batalha (32 colunas)
const B = (h, layers) => compose(32, h, layers);
const KO = compose(30, 6, [[KO_BODY, 0, 0], [KO_HEAD, 16, 0]]);

export const lio = {
  id: 'lio',
  name: 'Lio',
  palette: LIO_PALETTE,
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
    idle: B(24, [[HEAD_L, AX, 0], [B_TORSO, AX, 11], [B_LEGS, AX, 19]]),
    windup: B(24, [[SWORD_UR, AX + 13, 3], [HEAD_L, AX + 1, 0], [B_TORSO_NOARM, AX, 11], [ARM_BACK, AX + 9, 13], [B_LEGS, AX, 19]]),
    attack: B(24, [[HEAD_L, AX - 2, 1], [B_TORSO_NOARM, AX - 1, 12], [ARM_FWD, AX - 1, 14], [SWORD_L, AX - 12, 14], [B_LEGS_LUNGE, AX - 3, 19]]),
    cast: B(24, [[HEAD_L, AX, 0], [B_TORSO_NOARM, AX, 11], [ARM_FWD, AX - 1, 13], [ORB, AX - 5, 11], [B_LEGS, AX, 19]]),
    hurt: B(24, [[HEAD_L_HURT, AX + 2, 0], [B_TORSO, AX + 1, 11], [B_LEGS, AX, 19]]),
    kneel: B(21, [[HEAD_L_DOWN, AX - 1, 0], [K_TORSO, AX, 11], [K_LEGS, AX, 16]]),
    ko: B(6, [[KO, AX - 10, 0]]),
    win: B(30, [[W_SWORD, AX, 0], [W_ARM, AX - 1, 10], [HEAD_D, AX, 6], [W_TORSO, AX, 17], [W_LEGS, AX, 25]]),
  },
};
