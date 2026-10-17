// RETRATOS DE DIÁLOGO — bustos 48x48 no estilo SNES (FF6 / Chrono Trigger DS),
// cabeça em 3/4 virada para a direita da tela, luz vindo de cima-esquerda.
//
// Cada retrato = linhas ASCII da base (sem contorno externo) + "patches" de
// expressão (olhos, sobrancelhas, boca) aplicados com patch(). O contorno
// sel-out tingido é gerado no final, igual aos sprites de campo.
// Sem APIs de Node: roda no navegador e no Node.
import { fromAscii, patch, mix, rgbToHex } from './bitmap.js';
import { selOut } from './charkit.js';
import { LIO_PALETTE } from './sprites/lio.js';
import { SENA_PALETTE } from './sprites/sena.js';
import { ESTELA_PALETTE } from './sprites/estela.js';
import { BRANN_PALETTE } from './sprites/brann.js';

export const PORTRAIT_SIZE = 48;
export const PORTRAIT_IDS = ['lio', 'sena', 'estela', 'brann', 'odessa', 'varek', 'soldado'];

const FULL = ['neutral', 'happy', 'sad', 'angry', 'surprised'];

// tom intermediário entre duas cores da rampa
const mid = (a, b, t = 0.5) => rgbToHex(mix(a, b, t));

// ============================================================ LIO
// Cobre espetado, mecha branca caindo sobre a testa (lado esquerdo da tela),
// olhos azuis determinados, cachecol vermelho, jaqueta azul-marinho,
// camisa creme e o amuleto-lanterna de latão.
const LP = LIO_PALETTE;
const LIO_PAL = {
  // cabelo cobre (6 tons)
  a: '#ffd690', h: LP.h, g: mid(LP.h, LP.H), H: LP.H, J: LP.J, K: LP.K,
  // mecha branca
  w: LP.w, x: mid(LP.w, LP.v), v: LP.v, V: '#7e76a6',
  // pele
  1: '#fff2e0', s: LP.s, S: LP.S, T: LP.T, t: LP.t, u: '#6e3428',
  // olhos
  e: LP.e, E: '#5a3a4a', O: '#f6f4ff', q: '#c6c0dc', I: '#1f4f9c', i: LP.i, j: '#8cc8ff', W: LP.W,
  // boca
  m: '#9a4a40', M: '#6a2230', n: '#e0927a',
  // cachecol
  r: LP.r, R: LP.R, Q: LP.Q, P: '#5c1024',
  // jaqueta
  b: LP.b, B: LP.B, N: LP.N, D: '#141a40',
  // camisa, latão, couro, brilho
  c: LP.c, C: LP.C, y: LP.y, Y: LP.Y, l: LP.l, L: LP.L, '+': LP['+'], '*': LP['*'],
};
const LIO_BASE = [
  '.................gJ............hH...............',
  '.................gHJ..........hgHJ..............',
  '......gghh......hgHHJJJJJJJJhhggHJ..............',
  '......JHgghhhhhwwxvHJJJJJJJhhgggHHJJ............',
  '.......JHgggghwwwxvHHJhggHHHJggHHJhJJ...........',
  '........HHHgggwwwxvHHJJgggHHJJgHHHJgHJhh........',
  '........JHHHggwwwxvhHJJahhHHJJhhHHJJHHJggggggh..',
  '........JJHHHHwwwxvhHHJahhHHHJahhHHJgHJggHHH....',
  '........JJhahhwwxxvgHHJJhggHHJJggHHJJHHJHHJ.....',
  '........JJaahggwwxvgHHJJhggHHJJhggHHJhHJJJ......',
  '.....ghhJJJhggHwxxvgHHJJhggHHJJhggHJJgHHJ.......',
  '...KJJHHJJJhggHwxxvgHHJJhggHHJJhggHJhgHJJ.......',
  '......KJJJJhhgHwxxvgHHJThhgHHJTThgHJTgHJg.......',
  '........KJJJhgHHwxvggHJSThgHHJSShgHJShHJHHg.....',
  '.........JJJhgHHxxvhgHTSShgHJTSShgHTShHJJJJJg...',
  '.........KJJhgHHxxvhgJSSSTgHJSSSTgJSShHJ........',
  '.........KKJghggJxvTgTSSSSgHTSSSSgTSSTg.........',
  '........ggggHhggTJKSgSSSSShHSSSKKJSSSSg.........',
  '......ggHHHHHHgJTSSKKKJSSSTTJKKSSSSSSSg.........',
  '....gHHHHJJJJJhTTSSSSSSSSSSSSSSSSSSSSSg.........',
  '.....KKJJJJJSSTSSSeeeeeeSSSSeeeeeeSSSSg.........',
  '........KKKKSSSSSeeOIIIeSSSSeIIIeeSSSSg.........',
  '............SsSTSSSOWiiOSSSSOWiiSSSSST..........',
  '............STtSSSSqjijSSSSSqjijSSSSST..........',
  '...........gSTtSSSSSTTSSSSSSSsTSSSSSST..........',
  '..........gHSSTSSSSssSSSSSSSSTSSSSSSST..........',
  '.........gHJTSTSSSSSSSSSSSSStTSSSSSST...........',
  '........HJJK.TTTTSSSSSSSSSSSSSSSSSSST...........',
  '.........KK.....tTSSSSSSSSSSSSSSSSSST...........',
  '................ttTSSSSSSTmmmSSSSSST............',
  '.................tttTSSSSSTTSSSSSST.............',
  '.................TtttTSSSSSSSSSSST..............',
  '..................TttttTSSSSSSSTT...............',
  '...................rrRTttTSSSSTtRRQ.............',
  '...............rrRRRRRQttttttttQRRRQ............',
  '..............rRRRRRRRRRQQQQQQRRRRRRQ...........',
  '.............bBrrrRRRRRRRRRRRRRRRRRRQQ..........',
  '.........bbbBBrRRrrRRRRRRRRRRRRRRRRRQQNB........',
  '......bbbBBBBrRRQRRRrrRRRRRRRRRRRRQQQPNBBB......',
  '.....bbBBBBBBrRRQQRRRRRRRRRRRRRQQQQPPNNBBBB.....',
  '...bbBBBBBBBBrRRRQQQRRRRRRRQQQQPPPNNBBBBBBNN....',
  '..bBBBBBBBBBBrRRRRQPNcccccccCNBBBBBBBBBBBBBNN...',
  '.bBBBBBBBBBBBrRRRQPBNccccCcCCNBBBBBBBBBBBBBBNN..',
  '.bBBBBBBBBBBBrRRRQPBBNcccLcCNBBBBBBBBBBBBBBBBNN.',
  '.BBBBBBBBBBBBrRRRQPBBNcYyYCNBBBBBBBBBBBBBBBBBNN.',
  'BBBBBBBBBBBBrRRRQQPBBNcy*yCNBBBBBBBBBBBBBBBBBBNN',
  'BBBBBBBBBBBBrRRRQPPBBNCYyYCNBBBBBBBBBBBBBBBBBBNN',
  'BBBBBBBBBBBBrRRQQPBBBNCCYCCNBBBBBBBBBBBBBBBBBBNN',
];
const LIO_EXPR = {
  happy: [
    [17, 17, ['SJKKKJ?', 'SSSSSS?']],
    [28, 17, ['JKKKKJ', 'SSS???']],
    [17, 20, ['SSeeeeS', 'SeSSSSe', 'eSSSSSS', '??SSSSS', '???SS??']],
    [28, 20, ['SeeeeS?', 'eSSSSe?', 'SSSSSSe', 'SSSS???', '?sS????']],
    [24, 28, ['m?????m', 'SmOOOmS', 'SSmMmSS']],
  ],
  sad: [
    [17, 17, ['SSSKKJS', 'JKKSSSS']],
    [28, 17, ['JKKSSS', 'SSSKKJ']],
    [17, 20, ['SSSSSSS', 'Seeeeee', 'eeOIIIe', '??qiji?']],
    [28, 20, ['SSSSSS', 'eeeeee', 'eIIIee', 'qiji??']],
    [24, 29, ['SSmmmSS', 'SmSSSmS']],
  ],
  angry: [
    [17, 17, ['KKJ????', '?JKKKJS', '????KKK']],
    [28, 17, ['SSSSJKK', 'SJKKKS?', 'KK?????']],
    [17, 20, ['?eeeeee', 'eeOIIee']],
    [28, 20, ['eeeeee', 'eeIIee']],
    [24, 29, ['SmmmmmS', 'SmOOOmS', 'SSmmmSS']],
  ],
  surprised: [
    [17, 16, ['?JKKKJ?', 'SS?????', 'SSSSSS?']],
    [28, 16, ['?JKKKJ', '???SSS', 'SSS???']],
    [17, 20, ['?eeeeee', 'eOOIIOe', '?OOiWO?', '?qOjiO?']],
    [28, 20, ['eeeeee', 'eOIIOe', 'OOiWO?', 'qOjiO?']],
    [24, 29, ['SSmmSSS', 'SmMMmSS', 'SSmmSSS']],
  ],
};

// ============================================================ SENA
// Corte hime prata-lavanda (franja reta, mechas laterais), trança sobre o
// ombro com laço turquesa, camélia branca de centro rosa, olhos verde-água
// calmos, veste branca de santuário com gola turquesa em V (quimono).
const SP = SENA_PALETTE;
const SENA_PAL = {
  // cabelo prata-lavanda
  h: SP.h, g: mid(SP.h, SP.H), H: SP.H, J: SP.J, K: SP.K, L: '#3e3570',
  // pele, lábios, rubor
  1: '#fffaf2', s: SP.s, S: SP.S, T: SP.T, t: SP.t, u: '#7a4448', m: SP.m, M: '#a04454', n: '#f4a69c',
  // olhos verde-água
  e: SP.e, E: '#5a4a6a', O: '#f6f8ff', q: '#c4c8dc', I: '#16705f', i: SP.i, j: '#8ae8cf', W: SP.W,
  // veste branca
  w: SP.w, c: SP.c, C: SP.C, X: SP.X,
  // turquesa
  a: SP.a, A: SP.A, Z: SP.Z,
  // camélia + folha
  f: SP.f, F: SP.F, p: '#d8577e', G: '#5aa878', V: '#2f6a50',
};
const SENA_BASE = [
  '................................................',
  '.....................gHHHHH.....................',
  '...................HHHgHHHHgHH..................',
  '.................gHHHHgHHHHgHHHH................',
  '...............HHgHHHHgHHHHgHHHHHH..............',
  '..............HHHgHHHHgHHHHgHHHHHHJ.............',
  '.............HHHHgHHHHgHHHHgHHHHHHJJffc.........',
  '............ghhhhghhhhghhhhghhggHHJffffcf.......',
  '...........HggggghgggghgggghgggggHffcFFcfc......',
  '...........ghgggHJgHHHJgHHHJgHHgJHfcFppFcC......',
  '..........ghhHHHHJgHHHJgHHHJgHHHJHHfFFFcC.......',
  '..........gggHHHHJgHHHJgHHHJgHHHJHHcfcCC........',
  '..........HggHHHHJgHHHJgHHHJgHHHJHHJCGV.........',
  '..........HggHHHHJgHHHJgHHHJgHHHJHHJJJJJ........',
  '.........HHhgHHHHKgHHHKgHHHKgHHHKHHJJJJJ........',
  '.........HHhgHHHHKgHHHKgHHHKgHHHKHHJJJJJ........',
  '.........HHhggHHHHJKgHHHJKgHHHJKgHHHJKHJ........',
  '.........HHhHHHTJTTTTJJTTTTJJTTTTJJTTTHT........',
  '.........HHhHHHHJTJJJTTTTTTTTJJJTTTTgHHJ........',
  '.........HJhHHHHJSSSSSSSSSSSSSSSSSSSgHHJK.......',
  '........HHJgHHHHJSSeeeeSSSSSSeeeeSSSgHHJK.......',
  '........HJJggHHHJSeIIIeeSSSSeIIIeeSTgHHJK.......',
  '........HJJggHHHTeOiiWOSSSSSOiiWOeSTgHHJK.......',
  '........HJJggHHHTSSjijSSSSSSSjijSSSTgHHJK.......',
  '........HJJggHHHTSSSESSSSSSSSSESSSSTgHJJJ.......',
  '........HJJggHHJTSSSSSSSSSSSSsSSSSSTgHHJJK......',
  '........HJJggHHJJSnnSSSSSSSSSTSSSnSTgHHJJK......',
  '.......HHJJgHHJJJSSSSSSSSSSSSSSSSSSTgJHJJK......',
  '.......HHJJgHHJJJJJSSSSSTSSSTSSSSSSTgHJKJJ......',
  '.......HJJJgHJJJJJJJSSSSSmmmSSSSSSSJgHJJJJ......',
  '.......HJJJHHJJJJJJJJSSSSSSSSSSSSSSJgHJJKJ......',
  '.......HJJJHJJJJJJJJJTTSSSSSSSSSSJJJgHHJKJ......',
  '.......HJJJghHJJJJJJJTTTTSSSSSSSJJJJgHHJKJ......',
  '.......HJJghHJKJJJJJJTTTTTTTTTTJJJJJJHHJKJ......',
  '.......HJJJKJKJJJJZaAwTTTTTTTTwaAZJJJgHJJK......',
  '.......HJJJghHJJJJZaAwTTTTTTTTwaAZJJJgHJJK......',
  '.......HJJghHJKJwccZaAwTTTTTTwaAZcCCJgHJJK......',
  '.......HJJJKJKJJwwcZaAwSSSSSSwaAZccCCgHHJK......',
  '.......wwwccghHCccccZaAwSSSSwaAZccccCgHHJK......',
  '......wwwccghHJKCcccZaAwSSSwaAZcccccCgHHJJC.....',
  '....wwcccccCKJKCcCcccZaAwSSwaAZcccccCgHHJcCC....',
  '...wccccccccghHCccccCZaAwSwaAZccccccCgHHCccCC...',
  '..wccccccccghHJKCCcccCZaAwwaAZCcccccCgHJCcccCX..',
  '.wccccccccccKJKCcCccccZaAwaAZCccccccCgJCcccccCX.',
  '.wcccccccccZAaAZCcccccCZwaAZCcccccccCJCccccccCX.',
  '.ccccccccccCAaAZcccccccCwaAZCccccccccCccccccCCX.',
  'ccccccccccCChgHJcccccccwaAZCccccccccccccccccCCXX',
  'ccccccccCChgHHJCccccccwaAZCcccccccccccccccccCCXX',
];
const SENA_EXPR = {
  happy: [
    [17, 20, ['SSSSSSS', 'SSeeeeS', 'SeSSSSe', 'SSSSSSS', 'SSSSSSS']],
    [28, 20, ['SSSSSS', 'SeeeeS', 'eSSSSe', 'SSSSSS', 'SSSSSS']],
    [18, 26, ['nnn']],
    [24, 28, ['m???m', 'SmMmS']],
  ],
  sad: [
    [17, 18, ['?TJJ', 'JJSS']],
    [29, 18, ['JJT?', 'SSJJ']],
    [17, 20, ['SSSSSSS', 'SeeeeeS', 'eeIIIeS', 'SSjijSS', 'SSSESSS']],
    [28, 20, ['SSSSSS', 'SeeeeS', 'eIIIee', 'SjijSS', 'SSESSS']],
    [24, 28, ['SSSSS', 'SSmSS', 'SmSmS']],
  ],
  angry: [
    [17, 18, ['JKTT', 'SSKKK']],
    [28, 18, ['TTTKJ', 'KKKSS']],
    [17, 20, ['Seeeeee', 'SeIIeee']],
    [28, 20, ['eeeeee', 'eeIIee']],
    [24, 28, ['SSSSS', 'SmmmS', 'mSSSm']],
  ],
  surprised: [
    [17, 18, ['?TTT']],
    [29, 18, ['TTT']],
    [17, 20, ['SSeeeeS', 'SeOIIOe', 'eOOiWOS', 'SSOjiOS', 'SSSqqSS']],
    [28, 20, ['SeeeeS', 'eOIIOe', 'OOiWOe', 'SOjiOS', 'SSqqSS']],
    [24, 28, ['SSmSS', 'SmMmS', 'SSmSS']],
  ],
};

// ============================================================ ESTELA
// Estrela caída em forma de menina: bob dourado-claro com pontas que brilham
// em ciano, olhos dourados enormes com brilho de estrela, pele clara,
// capa índigo com capuz caído, debrum dourado e fecho de estrela.
const EP = ESTELA_PALETTE;
const ESTELA_PAL = {
  // cabelo dourado pálido + pontas luminosas
  a: '#fffef4', h: EP.h, g: mid(EP.h, EP.H), H: EP.H, J: EP.J, K: EP.K,
  '~': '#c8fbff', '+': EP['+'], '%': EP['%'], '*': EP['*'],
  // pele
  1: '#fffcf8', s: EP.s, S: EP.S, T: EP.T, t: EP.t, m: EP.m, M: '#a8485e', n: '#fbb4b4',
  // olhos dourados
  e: EP.e, E: '#7a5030', O: '#fffdf6', q: '#e6d6c8', I: '#cc7a14', i: EP.i, j: '#ffe48a', W: EP.W,
  // capa índigo
  b: EP.b, B: EP.B, N: EP.N, D: '#120f34',
  // ouro
  y: EP.y, Y: EP.Y,
  // vestido
  w: EP.w, c: EP.c, C: EP.C, X: EP.X,
};
const ESTELA_BASE = [
  '...........................h~...................',
  '.........................hgJ....................',
  '....................hhhhhJggg...................',
  '.................hhhhhhhhggggggg................',
  '...............hhhhhhahhhhgggggggg..............',
  '.............haaaaJaaaaaaaahJgggJgg.............',
  '...........haaaaJJgHJJHHHHahhJhggJggg...........',
  '..........aaaggJgggJHHHJHHJHHHJhhhJggJ..........',
  '.........aagggJgggJHHHJHHHJHHHJHhhJhgHJ.........',
  '.........gggggJgggJHHHJHHHHJHHHJHHHJhHHJ........',
  '.........ghHHJgHHHJgHHHHHHHJgHHHHHHJgHHJJ.......',
  '........ghgHJgHHHHJHHHJgHHHJHHHJgHHJHHHJJ.......',
  '........ghgHJgHJgHJgHHJgHHHJgHHJgHHJhgHHJJ......',
  '........ghgHJgHJgHJgHHJgHHHJgHHJgHHJhgHHHJ......',
  '........ghgHJgHJHHJHHJJgHHJJHHJJHHHJJgHHJJ......',
  '........ghgHJgHJHJJHHJJHHHJJHHJJHHJJJgHHJJ......',
  '........ghgHJHHJg~JTHHJgHHHJTHHJTT+JJgHHJJ......',
  '........ghgHJHHJJ+TSTJTJHHJTSTJTSSTJJgHHJJ......',
  '........ghgHJHJJSTSSSTSTJ~JSSSTSSSSSJgHHJJ......',
  '........ggHHJHJSSSeeeeeSS+SSSeeeeSSHJgHJJK......',
  '........ggHHJHJSSeeIIIIeSSSSeIIIIeSHJgHJJK......',
  '........ggHHJHJSeOIIWIiOSSSSOIIWIeSHJgHJJK......',
  '........gHHHJHJSSOIWWWiOSSSSOIWWWiSHJgHJJK......',
  '.........HgHJHJSSOiiWijSSSSSOiiWjSSHJHHJJK......',
  '.........HgHJJJSSSjiijSSSSSSSjiijSSHJHHJK.......',
  '.........HgHHJJSSSSEEESSSSSSSSEESSSHJHJ~K.......',
  '..........HgHJ~JTSSSSSSSSSSSSTSSSSSHJH~+%.......',
  '..........JgH~+JTSnnSSSSSSSSSSSSSnTJH~+%........',
  '...........J~+%JTTSSSSSSSSSSSSSSSSSJ~+%.........',
  '............+%.....TSSSSSmmmSSSSSS..+%..........',
  '.............%......TSSSSSSSSSSSS...............',
  '.....................TTSSSSSSSSS................',
  '................yyyyNTTTTSSSSSTNyyyy............',
  '.............yybbbbBNTTTtttttTNBBByy............',
  '...........yybbbBBBNNTTTTTTTTtNBBBByy...........',
  '..........ybbbbBBBBNNTTTTTTTTtNNBBBByy..........',
  '.........bbbbbBBBBBBNNNBBByBBNNBBBBBBNN.........',
  '.......bbbbbBBBBBBBBNNBBByyyBNNBBBBBBBNNN.......',
  '......bbbbbBBBBBBBBNNBBByy*yYBNBBBBBBBBNNN......',
  '.....bbbbbBBBBBBBBNNBBBBByYyBNBBBBBBBBBNNNN.....',
  '....bbbbbBBBBBBBBNNBBBBByYwYyBBBBBBBBBBNNNNN....',
  '...bbbbbBBBBBBBBBBNBBBBywwcccyBBBBBBBBBNNNNNN...',
  '..bbbbbBBBBBBBBBBBNBBBywwcycccyBBBBBBBBNNNNNNN..',
  '..bbbbBBBBBBBBBBBNBBBBywccccCcCyBBBBBBNNNNNNNN..',
  '.bbbbBBBBBBBBBBBBNBBBywwcccycCCCyBBBBBNNNNNNNNN.',
  '.bbbBBBBBBBBBBBBNBBBBywccccccCCCCyBBBNNNNNNNNNN.',
  'bbbBBBBBBBBBBBBBNBBByyccycccCCCCCyBBBNNNNNNNNNNN',
  'bbBBBBBBBBBBBBBNBBByyccccccccCCCCCyBBNNNNNNNNNNN',
];
// brilhos flutuantes (desenhados depois do contorno, sem borda escura)
const ESTELA_GLOW = [
  [40, 2, ['?+?', '+*+', '?+?']],
  [5, 20, ['~']],
  [43, 22, ['+']],
  [7, 4, ['*']],
];
const ESTELA_EXPR = {
  happy: [
    [16, 19, ['SSSSSSSS', 'SSSSSSSS', 'SSeeeeSS', 'SeSSSSeS', 'eSSSSSSS', 'SSSSSSSS', 'SSSSSSSS']],
    [28, 19, ['SSSSSS?', 'SSSSSS?', 'SeeeeS?', 'eSSSSe?', 'SSSSSSe', 'SSSSSS?', 'SSSSSS?']],
    [18, 27, ['nnn']],
    [33, 27, ['nn']],
    [24, 28, ['m???m', 'SmMmS', 'SSmSS']],
  ],
  sad: [
    [18, 17, ['??J', 'JJ?']],
    [31, 17, ['J??', '?JJ']],
    [16, 19, ['SSSSSSSS', 'SSeeeeeS', 'SeeIIIIe', 'SOIIijiO', 'SOiijijS', 'SSjiijSS', 'SSSEEESS']],
    [28, 19, ['SSSSSS', 'SeeeeS', 'eIIIIe', 'OIijIe', 'OiijjS', 'SjiijS', 'SSEESS']],
    [24, 28, ['SSSSS', 'SmmmS', 'mSSSm']],
  ],
  angry: [
    [18, 17, ['J??', 'SJJJ']],
    [30, 17, ['??J', 'JJJ']],
    [16, 19, ['SSSSSSSS', 'SeeeeeeS', 'eOIIWIiO']],
    [28, 19, ['SSSSSS', 'eeeeee', 'OIIWIe']],
    [24, 28, ['SSSSS', 'SmmmS', 'SSMSS']],
  ],
  surprised: [
    [16, 19, ['SSeeeeeS', 'SeOOOOOe', 'eOOIIIOO', 'SOOIWIOO', 'SOOiiiOS', 'SSOOOOSS', 'SSSEEESS']],
    [28, 19, ['SeeeeS', 'eOOOOe', 'OOIIIO', 'OOIWIO', 'OOiiiS', 'SOOOOS', 'SSEESS']],
    [24, 28, ['SSmSS', 'SmMmS', 'SSmSS']],
  ],
};

// ============================================================ BRANN
// Gigante desertor: pele bronze escura, cabelo raspado com têmporas
// grisalhas, barba cheia com fios grisalhos, cicatriz no nariz, olhos
// fundos e calorosos, armadura pesada com o brasão imperial raspado.
const BP = BRANN_PALETTE;
const BRANN_PAL = {
  // cabelo/barba + grisalho
  h: BP.h, H: BP.H, J: BP.J, K: BP.K, v: BP.v, V: BP.V,
  // pele bronze (x = luz), cicatriz (k), boca (m/u)
  x: BP.x, s: BP.s, S: BP.S, T: BP.T, t: BP.t, u: '#3a1e14', k: '#f2c2ae', m: '#6a2a1e',
  // olhos
  e: BP.e, W: BP.W, O: '#efe4d8', i: '#5a3418', I: '#2e1a0e',
  // aço
  g: BP.g, G: BP.G, F: BP.F, E: BP.E, D: '#262c40',
  // brasão raspado, capa verde
  r: BP.r, R: BP.R, a: BP.a, A: BP.A, Z: BP.Z,
};
const BRANN_BASE = [
  '................................................',
  '................................................',
  '................................................',
  '.....................hhHHHHHHJ..................',
  '...................hhhhHHHHHHHHJJ...............',
  '.................hhhhHHHHHHHHHHHJJ..............',
  '...............hhhhHHHHHHHHHHHHHHJJ.............',
  '..............VhhhHHHHHHHHHHHHHHHHJJ............',
  '.............vVhHHHHHHHHHHHHHHHHHHHJJ...........',
  '.............vVHHHHHHHHHHHHHHHHHHHHVJ...........',
  '.............vVHJsxxssssSSSSSSSSSSSTVv..........',
  '.............vVVHsxxssssSSSSSSSSSSSTTV..........',
  '.............vVVHsssssssSSSSSSSSSSSSTV..........',
  '.............vVVHsssssSSSSSSSSSSSSSSTV..........',
  '.............vVVHJHhHsssSSSSSSSSHhHJTV..........',
  '.............vVVHTJHHhHJSSSSSJHhHJSSTV..........',
  '.............VVHHTTTTJJHJsxSJHJTTTTSTT..........',
  '...........SSTVHHTeeeeeTSsxSTeeeeeTSST..........',
  '...........STSVHHTOWIOeTSsxSTOWIOeTSST..........',
  '...........STSVHHtTiiTTSSsxSkTiiTTtSST..........',
  '...........STSVHHSTTTSSSskkkTSTTTSSSTT..........',
  '...........SSTJhHSSSssSkkttTTSSSSSSTHJ..........',
  '...........TSTJhHJSsssSSSsxsTSSSSSTJHJ..........',
  '............TTJhHJhSsSSTsxxsSTSSSTJJHJ..........',
  '.............HJhHJhHSSTTtTTTtTSSTHJJHJ..........',
  '.............HJhHJhHhhhhhHHHHHJJJHJJHJ..........',
  '.............HJhHJhHhVHHHHHHHHJVJJJJHJ..........',
  '.............HJhHJhHJVHummmmmuHVJHJJHJ..........',
  '.............HJhHJhHJvVHTSSTHJVJJHJJH...........',
  '..............JhHJhHJHVHHJJHHJVJJHJJ............',
  '..............JhHJhHJHVHHHJHHJJJJJJ.............',
  '...............HJHHJHHHVHHHJHHKJJJ..............',
  '...........ZAAFGJHHJHHHHJHJJHJKJJGGFAAZ.........',
  '.........ZaAAFGgGHHJHHHHJVJJHJKJGGGFFAAZ........',
  '.....ggggGGGZAFGgGJHHJHJJVHJJHJGGFFAAZ..........',
  '..ggGGGGGGGGFFEZFGGHHJJJVJJJKFGGGFFAZ.ggGGGGFF..',
  '.gGGGGGGGGGGGFFEEFgGFJJJKJJFGGgGFFEZgGGGGGGFFEE.',
  'gGGGGgGGGGGgGFFEEEFFFFEKJEFFFFFFEEEgGGGGGGFFFEEE',
  'GGGGGFGGGGGFGGFFEEggGGGGGGGGGGGFFEEGGGGgGFFFFEEE',
  'FFGGGGGGGGGGGFFFEEgGGGGGGGGGGGGFFEEGGGGFGFFFFEEE',
  'FFFFFFFEEEEEEEEEEEgGGGGrRRRRrGGFFEEFFFFFFEEEEEEE',
  'gggggggGGGGGGGGFFEgGGGrRRgRRRrGFFEEgGGGGGGFFFFEE',
  'GGGGgGGGGGgGGGGFFEgGGGRRRRgRRRGFFEEGGGGGGGgFFFEE',
  'GGGGFGGGGGFGGGFFEEgGGGrRgRRgRrGFFEEGGGGGGFFFFEEE',
  'FGGGGGGGGGGGGGFFEEgGGGGgRRRRgGGFFEEGGGGGGFFFFEEE',
  'FFFFFFFEEEEEEEEEEEgGGGGGrRRrGGGFFEEFFFFFFEEEEEEE',
  'gggggggGGGGGGGGFFEgGGGGGGGGGGGGFFEEgGGGGGGFFFFEE',
  'GGGGGGGGGGGGGGGFFEgGGGGGGGGGGGGFFEEGGGGGGGFFFFEE',
];
const BRANN_EXPR = {
  happy: [
    [21, 16, ['TTTs']],
    [28, 16, ['sTT']],
    [17, 17, ['TTeeeTT', 'TeSSSeT', 'tTSSSTS']],
    [28, 17, ['TTeeeTT', 'TeSSSeT', 'kSSSTTt']],
    [23, 27, ['uOOOOOu', '?mmmmm?', '??JJJ??']],
  ],
  sad: [
    [17, 14, ['SSsssJHJs', 'TSJHHHJs', 'JHJTTTTS']],
    [28, 14, ['JHJSSSSS', 'SSHHHJSS', 'STTTTJHJ']],
    [18, 17, ['TTTTT', 'eeeee', 'TiiTT']],
    [29, 17, ['TTTTT', 'eeeee', 'TiiTT']],
    [23, 27, ['HummmuH', 'uHTTTHu']],
  ],
  angry: [
    [17, 14, ['SSss', 'JHHHTTTs', 'TTTJHHHJ', '?????JJ']],
    [28, 14, ['????SSSS', 'STTTHHHJ', 'JHHHJ', 'JJ']],
    [18, 18, ['OIIee', 'TTTTT']],
    [29, 18, ['eeIIe', 'TTTTT']],
    [23, 27, ['uOOOOOu', 'uuuuuuu']],
  ],
  surprised: [
    [17, 13, ['JHhHHJ', 'SSssss', 'TSSSSSSs', 'TTTTTTTs']],
    [28, 13, ['?JHhHHJ', '????SSSS', 'SSSSSSSS', 'sTT']],
    [18, 18, ['OWIOe', 'OiiOT', 'TTTTS']],
    [29, 18, ['OWIOe', 'OiiOT', 'TTTTS']],
    [24, 27, ['ummmu', 'ummmu', '?uuu?']],
  ],
};

// ============================================================ ODESSA
// Avó de Lio, faroleira: coque branco com grampo de madeira, óculos redondos
// de latão, rosto enrugado e caloroso, xale verde de tricô sobre vestido
// marrom e a chavezinha de latão do farol num cordão.
const ODESSA_PAL = {
  // cabelo branco (sombras frias)
  h: '#ffffff', g: '#f2f0f8', H: '#dcd8e8', J: '#aea8c4', K: '#78719a', L: '#4e4868',
  // pele idosa, lábios, rubor
  1: '#fff4ea', s: '#ffe2cc', S: '#eebc9c', T: '#c88c70', t: '#9a6050', u: '#6a3a30', m: '#b25a58', n: '#f0a090',
  // olhos castanhos
  e: '#2a1a1a', i: '#6a4a2a', I: '#3a2618', W: '#ffffff', O: '#f6f0e8',
  // óculos de latão + reflexo da lente
  y: '#ffe68a', Y: '#c8962e', Q: '#8a6420', q: '#e8f4ff',
  // grampo de madeira
  o: '#d09a5a', D: '#8a5a30', d: '#553418',
  // xale verde de tricô
  a: '#6aa874', A: '#3e7250', Z: '#244832', z: '#142a1e',
  // vestido marrom
  l: '#a8744a', L: '#7a4e30', M: '#4e2e1c',
};
const ODESSA_BASE = [
  '..................oD............................',
  '.................oD.............................',
  '................od..............................',
  '..........hhgHJD.....ggggHHHJ...................',
  '........hhggHHJJJJhhgggHHHHHHHJJ................',
  '.......hhgJJgHJJKJhhhhggggHHHHHJJ...............',
  '.......hgJhhgHJKJhhhggggHHHHHHHHJJJ.............',
  '.......hgJhgHHJKJggJJggHHHHHHHHHHJJJ............',
  '.......gHJgHHJKJHgHHHJJgHHHHHHHHHHJJ............',
  '.......gHHJJJJKJHHHHJJHHgHHHHHHHHHHJJ...........',
  '.......HHHHHJKJHHHHHHHJJHHHJJHHHHHHHJJ..........',
  '.......JHHHJJKKJHHHHHHHHJJJJHHHHHHHJJ...........',
  '......D.JJJKK.KJJHHHJTTTTTTJJHHHHJHHJJ..........',
  '.....d........KJJHHTsssssssSSSSSTJHHJJ..........',
  '..............KJJHTs1sssssssSSSSSTJHHJ..........',
  '..............KJJHSs1ssssssSSSSSSSTJHJ..........',
  '..............KJHJsssssssssSSSSSSSSTJJ..........',
  '..............KJHJsssssssSSSSSSSSSSSTJ..........',
  '..............KJJHSsJJJJssSSSJJJJSSSTJ..........',
  '.............KJTSSYyyyYYSSSSYyyyYSSST...........',
  '............KJSSTYqWSSSQYSSSYqWSSYSST...........',
  '............KSsTYYWSeeeSQYYYYSeeeSYST...........',
  '............JSTtYYSeIiOeQSSSYeIiOeQST...........',
  '.............STtSQSSiiSSQSSsQSSiiSQST...........',
  '.............TSTSTQSTTSQYSSsSQSTTQTSST..........',
  '..............TTSTTQQQQYSSSsSQQQQTTSST..........',
  '...............SSTSSSSSSSSTsSTSSSSTST...........',
  '...............STSSnnSSSSTtTTtTSSnST............',
  '................TSSnnSSTSSSSSSTSSST.............',
  '.................TSSSSTSTSSSSSTSSST.............',
  '..................TSSSSTmmmmmmTSST..............',
  '...................TSSSSSnnnnSSST...............',
  '....................TSSSSSSSSSST................',
  '.....................TTSSSSSSST.................',
  '.....................tTTTTTTTt..................',
  '................aAAMlltTTTTTlLMZAA..............',
  '...........AaaaAaAMlllLtTTLllLMAZAZZ............',
  '........aaaAaaaZaaMllllLMMLlllMAZAZZAAZ.........',
  '......AZaaAZaaAZZaaMlllLMYLllMAZAAZZAAZZz.......',
  '.....aAZaaAZaaAZaZaaMllLyYlLMAZZAAZZAAZZAz......',
  '....aaAZaaAZaaAZaAZaaMlLYQLMAZAZAAZZAAZZAZz.....',
  '...ZaaAZaaAZaaAZaAAZaaMLyYMZAZAZAAZZAAZZAZZz....',
  '..AZaaAZaaAZaaAZaAAZZaaMyQYAZAAZAAZZAAZZAZZz....',
  '..AZaaAZaaAZaaAZaAAZaZaaYyYAZAAZAAZZAAZZAZz.....',
  '.AAZaAAZaAAZaAAZaAAZaZaaQYQAZAAZAAZZAAZZAZz.....',
  '.AAZaAAZaAAZaAAZaAAZaZaaaYAAZAAZAAZZAAZZAzz.....',
  'aAAZaAAZaAAZaAAZaAAZaZaaaQAAZAAZAAZZAAZZAZzz....',
  'aAAZaAAZaAAZaAAZaAAZaZaaaAAAZAAZAAZZAAZZAzzz....',
];
const ODESSA_EXPR = {
  happy: [
    [19, 21, ['SeeeS', 'eSSSe', 'SSSSS']],
    [29, 21, ['SeeeS', 'eSSSe', 'SSSSS']],
    [24, 29, ['mSSSSSm', 'SmuuumS', 'SSnnnSS']],
  ],
  sad: [
    [20, 17, ['??JJ', 'JJSS']],
    [29, 17, ['JJ??', 'SSJJ']],
    [19, 21, ['SSSSS', 'eeeee', 'SIiSS']],
    [29, 21, ['SSSSS', 'eeeee', 'SSIiS']],
    [24, 29, ['SSSSSSS', 'SmmmmmS', 'mSnnnSm']],
  ],
  angry: [
    [20, 17, ['JJSS', 'SSJJ']],
    [29, 17, ['SSJJ', 'JJSS']],
    [19, 21, ['eeeee', 'SIiee', 'SSSSS']],
    [29, 21, ['eeeee', 'eeIiS', 'SSSSS']],
    [24, 29, ['SSSSSSS', 'SmmmmmS', 'SSSSSSS']],
  ],
  surprised: [
    [20, 16, ['JJJJ', 'SSSS', 'SSSS']],
    [29, 16, ['JJJJ', 'SSSS', 'SSSS']],
    [19, 21, ['SeeeS', 'eOIOe', 'SSiSS']],
    [29, 21, ['SeeeS', 'eOIOe', 'SSiSS']],
    [24, 29, ['SSSmSSS', 'SSmumSS', 'SSSmSSS']],
  ],
};

// ============================================================ VAREK
// Capitão imperial: cabelo branco-cinza penteado para trás, olhos cinza
// frios, rosto anguloso com cicatriz fina na bochecha, casaco militar preto
// e carmesim de gola alta, dragonas douradas e a insígnia da engrenagem.
const VAREK_PAL = {
  // cabelo cinza de cinzas
  h: '#f6f6f2', g: '#dedfe0', H: '#c2c5ca', J: '#8f949c', K: '#5e636e', L: '#3c4050',
  // pele pálida fria, cicatriz (k), boca
  1: '#fff2ea', s: '#f6dccb', S: '#e2bba5', T: '#b08474', t: '#84585a', u: '#563440', k: '#f6d2c6', m: '#9a5a60',
  // olhos cinza-claros
  e: '#16121a', E: '#4a3a48', O: '#f2f2f6', i: '#aebccc', I: '#5e6c80', j: '#e2eaf4', W: '#ffffff',
  // casaco preto
  b: '#55566a', B: '#2e2e3c', N: '#1c1c26', D: '#0e0e16',
  // carmesim
  r: '#e8485a', R: '#a81e34', Q: '#62101f',
  // ouro (dragonas, insígnia)
  y: '#fff0a0', Y: '#e0b040', Z: '#a0701c', z: '#5e3e10',
};
const VAREK_BASE = [
  '................................................',
  '................................................',
  '....................ghhhhhhhJJ..................',
  '................ghhhJJJJJJJJgHHJ................',
  '..............ghJJJJhhhhhgggHHHHJ...............',
  '.............gJJhhgggggHHHHHHHHHHJJ.............',
  '.............JhgggHHHHHHHHHJJJJJJJHJ............',
  '............JhgHHHHHJJJJJJJhhhhggHHJJ...........',
  '............JgHHJJJJhhhgggggHHHHHHHJJJ..........',
  '...........JgHJJhgggHHHHHHHJJJJJJJHHJ...........',
  '...........JHJggHHHJJJJJJsssssssSSSSJJ..........',
  '..........HgJhgHJJss11ssssssSSSSSSSTJJ..........',
  '..........HgJggHHHs11sssssssSSSSSSSTHJ..........',
  '..........HgJgHHJJsssssssssSSSSSSSSTSJ..........',
  '..........JHgJgHJJssssssssSSSSSSSSSTSH..........',
  '..........JHgJgHJJTssssssSSSSSSSSSSTSH..........',
  '..........JHHJHHJTJKKSSSsssSSSSKKKJTSH..........',
  '..........JJHJHJJTSSSKKJTssTJKKSSSSTSH..........',
  '..........KJHJJJeeeeeeeesssSeeeeeeeTS...........',
  '..........KJJSSSSTOIeIOeTsSTOIeIOeTSS...........',
  '..........KJJSsSTSTijiTETsSTSijiTESTS...........',
  '..........KKJSTtSSSSTTSSSsSTSSTTSSSTS...........',
  '...........KKSTtSssssSSSssSTSSSSSSTTS...........',
  '............SSSTSskssSSSsSSTSSSSSSSTT...........',
  '.............TSTTSTksSSSSsSTTSSSTSSTT...........',
  '.............STT.TSTkSSSSssTTSSTTSST............',
  '.................TSSTkSSSTtTSSSTSSST............',
  '..................TSSTSSSSTTSSSSTST.............',
  '..................TTSSSSSSSSSSSTSST.............',
  '...................TSSSSmmmmmSSTSSSN............',
  '.................RRTTSSSSTTSSSSTSSNN............',
  '................YRRtTSSSSSSSTSSTRRYN............',
  '................NYRRtTSSSSSSSTTRRYNNN...........',
  '................NNYRRttTSSSSTTRRYNNNN...........',
  '................NNNYRRttTTTtRRYNNNNNN...........',
  '.........YYyyYZBNNNYRRRRRRRRYNNNBbNNN.YYYZ......',
  '....YyyyyyyyYYZBNNNNNYRRRRRRYNNNNNBBZYYYYZZ.....',
  '..YyyyyyyyyYYZBbBNNNNYRRRRYNNNNBBBZYYYYYZZz.....',
  '.YyYYYYYYYYYZbBBBBNNNYRRYNNNBBBBBZYYYYYZZzzB....',
  '.ZYZYZYZYZYZBbBBBBBBNNRrRNNBBBBBBBZYZYZYZzBBB...',
  '.ZzZzZzZzZzBbBBBBBBBNRyRNBBBBBBBYyYBBZzZzZzBBB..',
  '.ZBZBZBZBZBbbBBBBBBBNRRRNBBBBBBYyRyYBBzBzBzBBBB.',
  '.zBzBzBzBBbBBBBBBBBBNRyRNBBBBBYyRrRyYBNBzBzBBBB.',
  'bbBbBBbBBBBBBBBBBBBBNRRRNBBBBBBYyRyYBBNNNNNNBBB.',
  'bBBBBBBBBBBBBBBBBBBBNRyRNBBBBBBBYyYBBBNNNNNNBBBB',
  'BBBBBBBBBBBBBBBBBBBBNRRRNBBBBBBBBBBBBBNNNNNNBBBB',
  'BBBBBBBBBBBBBBBBBBBBNRyRNBBBBBBBBBBBBNNNNNNDBBBB',
  'BBBBBBBBBBBBBBBBBBBBNRRRNBBBBBBBBBBBBNNNNNDDBBBB',
];
const VAREK_EXPR = {
  smirk: [
    [28, 15, ['???KKKJ', '???SSSS', 'SJK']],
    [17, 19, ['TEIeIEe']],
    [28, 19, ['EIeIEe']],
    [24, 27, ['?????T', '????mT', 'mmmmSS']],
  ],
  sad: [
    [18, 16, ['SSSKKJ', 'JKKSSS']],
    [28, 16, ['JKKSSSS', 'SSSKKKJ']],
    [17, 19, ['TOOOOOe', 'STIeITE']],
    [28, 19, ['OOOOOe', 'SIeITE']],
    [24, 29, ['SmmmS', 'mSSSm']],
  ],
  angry: [
    [18, 16, ['JSSSSS', 'SKKKKJ']],
    [28, 16, ['SSSSKKJ', 'JKKKSSS']],
    [17, 19, ['TeIeIee']],
    [28, 19, ['eeIeIe']],
    [24, 29, ['mOOOm', 'SmmmS']],
  ],
  surprised: [
    [18, 15, ['JKKKKJ', 'SSSSSS', 'SSSSSS']],
    [28, 15, ['JKKKKKJ', 'SSSSSSS', 'SSSSSSS']],
    [17, 19, ['OOIeIOe', 'SOijiOE', 'STTTTTS']],
    [28, 19, ['OIeIOe', 'OijiOE', 'TTTTTS']],
    [24, 29, ['SmmmS', 'SmumS']],
  ],
};

// ============================================================ SOLDADO
// Soldado imperial genérico: elmo fechado com fenda escura e penacho
// vermelho, uniforme cinza com tabardo vermelho e a engrenagem dourada.
const SOLDADO_PAL = {
  // aço do elmo
  g: '#eef3fc', G: '#a4aec4', F: '#6a748e', E: '#3c4458', D: '#161a26', d: '#2a3042',
  // penacho / tabardo vermelho
  r: '#ff6e5c', R: '#d23034', Q: '#8c1626', P: '#500c18',
  // uniforme cinza
  w: '#c4c0c8', c: '#93909c', C: '#686572', X: '#403e4a',
  // ouro, couro, brilho dos olhos na fenda
  y: '#ffe68a', Y: '#c8962e', Z: '#7a5418', L: '#6a4628', M: '#3e2818', '+': '#ff8a6a',
};
const SOLDADO_BASE = [
  '.....................rrrR.......................',
  '................rrrrrrRRRRQ.....................',
  '............rrrrRRRRRRRRQQ......................',
  '.........rrrRRRRQRRRQQQ.........................',
  '.......rrRRRQRRRQQPP..GGGGGFE...................',
  '.....rrRRQRRRQQPPP.gggGGGGgFFE..................',
  '....rRRQRRRQQPPPgggggGGGGGgFFFE.................',
  '...rRQRRRQQPPP.gggggGGGGGGGgFFFE................',
  '..rRQRRQRQPPP.ggggGGGGGGGGGgFFFFE...............',
  '..RRQRRQRQPP.gggGGGGGGGGGGGgFFFFE...............',
  '..RQRRQRQPP..ggGGGGGGGGGGGGgFFFFFE..............',
  '..RQRQRQQP...gGGGGGGGGGGGGGgFFFFFEE.............',
  '..QRRQRQP....gGGGGGGGGGGGGGgFFFFFFE.............',
  '..QRQQRQP....GGGGGGGGGGGGGGgFFFFFFE.............',
  '..RQQ.QP.....GGGGGGGGGGGGGGgFFFFFFEE............',
  '..QRQ.QP.....FGGGGGGGGGGGGGgGFFFFFFE............',
  '...QP..P.....FGGGGGGGGGGGGGgGFFFFFFE............',
  '...P.........FFGGGgggggggggggggggggFE...........',
  '.............EFGgFEEEEEEEEEEEEEEEEEEE...........',
  '.............EFGFEDDDDDDD+DDDDDD+DDDDD..........',
  '.............EFGFEDDDDDDDDDDDDDDDDDDDD..........',
  '.............EFGGFgggggggggggggggggggE..........',
  '.............EFGGFEGGGGGGGGGGGGgFFFFFE..........',
  '.............EFGGFEGGGGGGGGGGGGgFFFFFE..........',
  '.............EFGGFEGGGGGGGGGGGEgFEFEFE..........',
  '..............EFGFEGGGGGGGGGGGGgFFFFFE..........',
  '..............EFGFEGGGGGGGGGGGEgFEFEFE..........',
  '..............EFGFEGGGGGGGGGGGGgFFFFFE..........',
  '...............EFFEGGGGGGGGGGGEgFEFEFE..........',
  '...............EFFEFGGGGGGGGGGGgFFFFE...........',
  '................EEEFGGGGGGGGGGGgFFFEE...........',
  '.................EEFFGGGGGGGGGFFFEEE............',
  '..................EEEFFFFFFFFFFEEE..............',
  '...............EgGGFEEEEEEEEEEEFGGFE............',
  '.............EggGGGFFFFFFFFFFFFGGGFFE...........',
  '...........EgGGGGGGGGGGGGGGGGGGGGGFFFE..........',
  '......cccccEFFFFFFFFFFFFFFFFFFFFFFFFFEccccc.....',
  '...wwccccccRRrRRRRRRRRRRRRRRRRRRRRQQRcccccCC....',
  '..wcccccccRrRRRRRRRRRRRRRRRRRRRQQRRQRccccCCCX...',
  '.gGGGgcccCRRQrrRRRRRRRRRRRRRRRRQQRQRcccCCFFFE...',
  'gGGGGGFcccCQRrrRRRRRRYYRRRRRRRRQQQQCccCGGGGFFE..',
  'GGGGGGFcccCQRrrRRRQRYyyYRRRRQRRQQRQCccCGGGGFFE..',
  'GGGGGFFcccCQRrrRRRQYyRRyYRRRQRRQQRQCccCFGGGFFE..',
  'FGGGFFEcccCQRrrRRRQrYyyYRRRRQrRQQRQCccCFFFFFEE..',
  'EFFFFEEcccCQRrrRRRQrRYYRRRRRQrRQQRQCccCEEEEEEE..',
  'cccccccccCCQRrrRRRQrRRRRRRRRQrRQQRQCccCCCCCXXX..',
  'cccccccccCCQRrrRRRQrRRRRRRRRQrRQQRQCccCCCCCXXX..',
  'ccccccccCCCQRrrRRRQrRRRRRRRRQrRQQRQCcCCCCCXXXX..',
];

// ============================================================ tabela
const DEFS = {
  lio: { pal: LIO_PAL, base: LIO_BASE, expr: LIO_EXPR, exprs: FULL, outline: '#1a0a12' },
  sena: { pal: SENA_PAL, base: SENA_BASE, expr: SENA_EXPR, exprs: FULL, outline: '#1c1630' },
  estela: { pal: ESTELA_PAL, base: ESTELA_BASE, expr: ESTELA_EXPR, exprs: FULL, outline: '#1a1430', glow: ESTELA_GLOW },
  brann: { pal: BRANN_PAL, base: BRANN_BASE, expr: BRANN_EXPR, exprs: FULL, outline: '#100c10' },
  odessa: { pal: ODESSA_PAL, base: ODESSA_BASE, expr: ODESSA_EXPR, exprs: FULL, outline: '#161214' },
  varek: {
    pal: VAREK_PAL, base: VAREK_BASE, expr: VAREK_EXPR, outline: '#0c0a10',
    exprs: ['neutral', 'smirk', 'sad', 'angry', 'surprised'], alias: { happy: 'smirk' },
  },
  soldado: { pal: SOLDADO_PAL, base: SOLDADO_BASE, expr: {}, exprs: ['neutral'], outline: '#0e0e14' },
};

function resolve(id, expression) {
  const d = DEFS[id];
  if (!d) throw new Error(`Retrato desconhecido: ${id}`);
  let ex = (d.alias && d.alias[expression]) || expression;
  if (!d.exprs.includes(ex)) ex = 'neutral';
  return [d, ex];
}

// Lista de expressões suportadas por um retrato.
export function portraitExpressions(id) {
  const d = DEFS[id];
  return d ? d.exprs.slice() : [];
}

// Linhas ASCII finais (base + patches) — útil para depuração/ferramentas.
export function portraitRows(id, expression = 'neutral') {
  const [d, ex] = resolve(id, expression);
  let rows = d.base;
  for (const [x, y, p] of d.expr[ex] || []) rows = patch(rows, x, y, p);
  return rows;
}

const cache = new Map();

// Bitmap 48x48 com fundo transparente e contorno sel-out tingido.
export function buildPortrait(id, expression = 'neutral') {
  const [d, ex] = resolve(id, expression);
  const key = id + ':' + ex;
  let bmp = cache.get(key);
  if (!bmp) {
    bmp = selOut(fromAscii(portraitRows(id, ex), d.pal, PORTRAIT_SIZE), d.outline, 0.74);
    if (d.glow) {
      // camada de brilho por cima do contorno (pixels soltos, sem sel-out)
      let layer = Array.from({ length: PORTRAIT_SIZE }, () => '.'.repeat(PORTRAIT_SIZE));
      for (const [x, y, p] of d.glow) layer = patch(layer, x, y, p);
      bmp.blit(fromAscii(layer, d.pal, PORTRAIT_SIZE));
    }
    cache.set(key, bmp);
  }
  return bmp.clone();
}
