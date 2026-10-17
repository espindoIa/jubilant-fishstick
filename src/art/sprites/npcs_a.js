// NPCs de campo (lote A) redesenhados no estilo FF6 — ver lio.js (referência).
// Odessa, Varek, Soldado Imperial, Pescador e Mercadora.
// Contorno de nanquim automático (ink); '#' só para linhas internas.
// Objetos assimétricos (bengala, sabre, alabarda, peixe, cesta) definem
// torsoB/legsB explícitos para que o passo B não troque o objeto de mão.

// ============================================================ ODESSA
// Avó de Lio, velha faroleira. Coque branco com grampo de madeira, óculos
// redondos, xale verde-escuro de tricô (franja) sobre vestido marrom longo,
// bengala de madeira, levemente curvada.
const ODESSA_PALETTE = {
  '#': '#1a1020',
  // cabelo branco
  h: '#ffffff', H: '#dcdaec', J: '#a6a2c4', K: '#6e6a94',
  // madeira (grampo, bengala)
  o: '#f0b868', O: '#b4703a', D: '#6a3c1c',
  // pele
  s: '#ffe8d6', S: '#f2c2a2', T: '#c88a72', t: '#94584c', m: '#ee9888',
  // óculos (aro dourado, reflexo)
  G: '#7a4e3c', g: '#f4fcff',
  // xale verde-escuro
  a: '#80b46c', A: '#4c8050', Z: '#2c5438',
  // vestido marrom-ameixa
  l: '#b6866c', n: '#8c5e4e', N: '#603c38', M: '#3e2628',
  // gola / broche
  w: '#fff8ec', y: '#ffe48a', Y: '#c8963c',
  // sapatos
  u: '#6a4a48', U: '#3a2628',
};

const OD_HEAD_D = [
  '......hhHJ.o....',
  '.....hHHHJO.....',
  '.....JHHJJK.....',
  '....hhHJJJHJ....',
  '...hhHHHHHHHJ...',
  '..hHHJHHHHJHHJ..',
  '..HHJSsSSSSJHJ..',
  '..HJSSSSSSSSJJ..',
  '..JSG#GSG#GSJ...',
  '...SGgGSGgGS....',
  '...TmSSTSSmT....',
];
const OD_TORSO_D = [
  '....#TSSST#.....',
  '..aAAAwyYwAAAZ..',
  '..aAAAAAAAAAAZ..',
  '.naAAAAAAAAAAZN.',
  'onlZAaAaAaAAZNN.',
  'OSSlnZAZZAZnNSS.',
  'O.lnnnnZZnnnNM..',
];
const OD_TORSO_D_A = [
  '....#TSSST#.....',
  '..aAAAwyYwAAAZ..',
  '..aAAAAAAAAAAZ..',
  'onaAAAAAAAAAAZN.',
  'OSSZAaAaAaAAZNN.',
  'O.nlnZAZZAZnNNN.',
  'O.lnnnnZZnnnNSS.',
];
const OD_TORSO_D_B = [
  '....#TSSST#.....',
  '..aAAAwyYwAAAZ..',
  '..aAAAAAAAAAAZ..',
  '.naAAAAAAAAAAZN.',
  'onlZAaAaAaAAZSS.',
  'OSSlnZAZZAZnN...',
  'O.lnnnnZZnnnNM..',
];
const OD_LEGS_D = [
  'O.lnnnnNnnnnNM..',
  'O.lnnnnNnnnnNM..',
  'O.NNNNNNNNNNMM..',
  'D...uUU..uUU....',
];
const OD_LEGS_D_A = [
  'O.lnnnnNnnnnNM..',
  'O.lnnnnNnnnnNM..',
  'D.NNNNNNNNNNMM..',
  '...uUU..........',
];
const OD_LEGS_D_B = [
  'O.lnnnnNnnnnNM..',
  'O.lnnnnNnnnnNM..',
  'O.NNNNNNNNNNMM..',
  'D.........uUU...',
];

const OD_HEAD_U = [
  '....o.hhHJ......',
  '.....OhHHJJ.....',
  '.....hJHHJJK....',
  '....hHJKJJKJ....',
  '...hHHHHHHHHJ...',
  '..hHHhHHHHJHHJ..',
  '..HHhHHHHHJHHJ..',
  '..HHHHHHHJHHJJ..',
  '..JHHHHHHJHJJK..',
  '...JJHHHJJJJK...',
  '....tTSSSSTt....',
];
const OD_TORSO_U = [
  '....aAAAAAZ.....',
  '..aAAAAAAAAAAZ..',
  '..aAAAAAAAAAAZ..',
  '.naAAAAAAAAAAZN.',
  '.nlZAaAaAaAAZNNo',
  '.SSlnZAZZAZnNSSO',
  '..lnnnnZZnnnNM.O',
];
const OD_TORSO_U_A = [
  '....aAAAAAZ.....',
  '..aAAAAAAAAAAZ..',
  '..aAAAAAAAAAAZ..',
  '.naAAAAAAAAAAZNo',
  '.nlZAaAaAaAAZSSO',
  '.nnlnZAZZAZnNN.O',
  '.SSnnnnZZnnnNM.O',
];
const OD_TORSO_U_B = [
  '....aAAAAAZ.....',
  '..aAAAAAAAAAAZ..',
  '..aAAAAAAAAAAZ..',
  '.naAAAAAAAAAAZN.',
  '.SSZAaAaAaAAZNNo',
  '..llnZAZZAZnNSSO',
  '..lnnnnZZnnnNM.O',
];
const OD_LEGS_U = [
  '..lnnnnNnnnnNM.O',
  '..lnnnnNnnnnNM.O',
  '..NNNNNNNNNNMM.O',
  '....UUU..UUU...D',
];
const OD_LEGS_U_A = [
  '..lnnnnNnnnnNM.O',
  '..lnnnnNnnnnNM.O',
  '..NNNNNNNNNNMM.D',
  '...UUU..........',
];
const OD_LEGS_U_B = [
  '..lnnnnNnnnnNM.O',
  '..lnnnnNnnnnNM.O',
  '..NNNNNNNNNNMM.O',
  '..........UUU..D',
];

const OD_HEAD_L = [
  '.........hhJ.o..',
  '........hHHHO...',
  '.....hhhJHHJK...',
  '...hhHHHHJJJ....',
  '..hHHHHhhHHHJ...',
  '.hHHhHHHHHJHJ...',
  '.HHSsHHHHJHHJ...',
  '.SSSSSJHHJHJJaZ.',
  '.SG#GGGTJJJJAAAZ',
  'sSGgSSTTKJaAAAAZ',
  '.TmSSTTaAAAAAAAZ',
];
const OD_TORSO_L = [
  '...wwyAAAAAAAAAZ',
  '...aAAAAAAAAAAZ.',
  '..nnAAAAAAAAAAZ.',
  '.nnSAAAAAAAAAZ..',
  'oSS.ZAaAaAaAZ...',
  'O..lnnnnnnnNNM..',
  'O..lnnnnnnnNNM..',
];
const OD_TORSO_L_BACK = [
  '...wwyAAAAAAAAAZ',
  '...aAAAAAAAAAAZ.',
  '...nnAAAAAAAAAZ.',
  '..nSSAAAAAAAAZ..',
  '..oSZAaAaAaAZ...',
  '..O.lnnnnnnNNM..',
  '..O.lnnnnnnNNM..',
];
const OD_TORSO_L_FWD = [
  '...wwyAAAAAAAAAZ',
  '...aAAAAAAAAAAZ.',
  '.nnnAAAAAAAAAAZ.',
  'oSS.AAAAAAAAAZ..',
  'O...ZAaAaAaAZ...',
  'O..lnnnnnnnNNM..',
  'O..lnnnnnnnNNM..',
];
const OD_LEGS_L = [
  'O..lnnnnnnnNNM..',
  'O..lnnnnnnnNNNM.',
  'O.lNNNNNNNNNNMM.',
  'D..uUU....UUU...',
];
const OD_LEGS_L_A = [
  '..OlnnnnnnnNNM..',
  '..OlnnnnnnnNNNM.',
  '.lONNNNNNNNNNMM.',
  'uUDU......UUU...',
];
const OD_LEGS_L_B = [
  'O..lnnnnnnnNNM..',
  'O..lnnnnnnnNNNM.',
  'O.lNNNNNNNNNNMM.',
  'D.....uUUUUU....',
];

export const odessa = {
  id: 'odessa',
  name: 'Odessa',
  palette: ODESSA_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: OD_HEAD_D, torso: [OD_TORSO_D, OD_TORSO_D_A], torsoB: OD_TORSO_D_B, legs: [OD_LEGS_D, OD_LEGS_D_A], legsB: OD_LEGS_D_B },
    up: { head: OD_HEAD_U, torso: [OD_TORSO_U, OD_TORSO_U_A], torsoB: OD_TORSO_U_B, legs: [OD_LEGS_U, OD_LEGS_U_A], legsB: OD_LEGS_U_B },
    left: { head: OD_HEAD_L, torso: [OD_TORSO_L, OD_TORSO_L_BACK, OD_TORSO_L_FWD], legs: [OD_LEGS_L, OD_LEGS_L_A, OD_LEGS_L_B] },
  },
};

// ============================================================ VAREK
// Capitão do Império de Ferro (antagonista). Alto e esguio, cabelo
// branco-acinzentado penteado para trás, olhos vermelhos, sobretudo militar
// preto com gola alta e forro carmesim, dragonas douradas com franja, faixa
// carmesim com fivela de ouro, luvas brancas, capa preta forrada de carmesim,
// sabre na cintura (mão esquerda no punho), botas pretas de cano alto.
const VAREK_PALETTE = {
  '#': '#1a1020',
  // cabelo branco-acinzentado
  h: '#f8f6fe', H: '#cfcadf', J: '#938cae', K: '#5a5476',
  // pele pálida
  s: '#fff2ea', S: '#f0cdbc', T: '#c49690', t: '#8c5c66',
  // olhos vermelhos
  i: '#ff3848',
  // sobretudo preto (frio)
  b: '#5e5a80', B: '#363252', N: '#211e36', X: '#120f1e',
  // carmesim
  r: '#ff6474', R: '#cc2840', Q: '#7c1428',
  // ouro
  y: '#ffe88c', Y: '#d8a03c', D: '#8a5c1c',
  // aço do sabre
  g: '#f2f6ff', G: '#a8b4d0', F: '#5c6a90',
  // luvas brancas
  w: '#ffffff', c: '#c4c4dc',
  // botas
  u: '#77729a', U: '#3c3852', V: '#1c1a2a',
};

const VA_HEAD_D = [
  '.....hhhHJ......',
  '...hhhHHHHJJ....',
  '..hhHHJHHHHJJ...',
  '..hHHJHHHJHJJK..',
  '..JHHSsHSSHJJK..',
  '..JHSsSSSSSHJK..',
  '..JJSSSSSSSSJK..',
  '..TSJJSSSJJST...',
  '..TS#iSSSi#ST...',
  '...SSSSTSSSS....',
  '....TSStSST.....',
];
const VA_TORSO_D = [
  '....#QrRrQ#.....',
  '.yyYbQRrRQBYyY..',
  'XYDYbBQRQBBYDYX.',
  'XbBNbBByBBBNBNX.',
  'XbBNbBBBBBNNBNXQ',
  'QbBNbBByBBNNcwXQ',
  'QwcNRRRyYRRNwcGQ',
  'Q.BNbBBQBBBNNYFQ',
  'Q.BbBBBQRBBBNNGX',
];
const VA_TORSO_D_A = [
  '....#QrRrQ#.....',
  '.yyYbQRrRQBYyY..',
  'XYDYbBQRQBBYDYX.',
  'XbBNbBByBBBNBNX.',
  'XbBNbBBBBBNNBNXQ',
  'QbBNbBByBBNNcwXQ',
  'QbBNRRRyYRRNwcGQ',
  'QwcNbBBQBBBNNYFQ',
  'Q.BbBBBQRBBBNNGX',
];
const VA_TORSO_D_B = [
  '....#QrRrQ#.....',
  '.yyYbQRrRQBYyY..',
  'XYDYbBQRQBBYDYX.',
  'XbBNbBByBBBNBNX.',
  'XbBNbBBBBBNNBNXQ',
  'QwcNbBByBBNNcwXQ',
  'Q.BNRRRyYRRNwcGQ',
  'Q.BNbBBQBBBNNYFQ',
  'Q.BbBBBQRBBBNNGX',
];
const VA_LEGS_D = [
  'QXbBBBBQRBBBNNFX',
  'QrRRRRRQQRRRRRQF',
  'QQ..uUV..uUV..QQ',
  '.Q..uUV..uUV..Q.',
  '....uUV..uUV....',
  '...uUUV..uUUV...',
];
const VA_LEGS_D_A = [
  'QXbBBBBQRBBBNNFX',
  'QrRRRRRQQRRRRRQF',
  'QQ..uUV..uUV..QQ',
  '.Q..uUV..uUV..Q.',
  '....uUV..uUUV...',
  '...uUUV.........',
];
const VA_LEGS_D_B = [
  'QXbBBBBQRBBBNNFX',
  'QrRRRRRQQRRRRRQF',
  'QQ..uUV..uUV..QQ',
  '.Q..uUV..uUV..Q.',
  '...uUUV..uUV....',
  '.........uUUV...',
];

const VA_HEAD_U = [
  '.....hhhHJ......',
  '...hhhHHHHJJ....',
  '..hhHHHHHHHJJ...',
  '..hHHhHHHHHJJK..',
  '..HHHhHHHHJHJK..',
  '..HHHHhHHHJJJK..',
  '..JHHHHhHJJJJK..',
  '...JHHHHJJJJK...',
  '..TKJJHHJJJKT...',
  '....KJJJJJK.....',
  '....TSSSSST.....',
];
const VA_TORSO_U = [
  '....QRRRRRQ.....',
  '.yyYbBBBBBBYyY..',
  '.YDYBBBBBBNYDY..',
  '.XBbBBBBBBNNNX..',
  '.XBbBBBBBBBNNX..',
  'XBbBBBBBBBNNNNX.',
  'XBbBBBBBBBBNNNX.',
  'XBbBBBBNBBBNNNX.',
  'XBbBBBNBBBBNNNNX',
];
const VA_TORSO_U_A = [
  '....QRRRRRQ.....',
  '.yyYbBBBBBBYyY..',
  '.YDYBBBBBBNYDY..',
  '.XBbBBBBBBNNNX..',
  '.XBbBBBBBBBNNX..',
  'XBbBBBBBBBNNNNX.',
  'XBbBBBBBBBBNNNX.',
  'XBbBBBBNBBBNNNX.',
  'XBbBBBNBBBBNNNNX',
];
const VA_TORSO_U_B = [
  '....QRRRRRQ.....',
  '.yyYbBBBBBBYyY..',
  '.YDYBBBBBBNYDY..',
  '.XBbBBBBBBNNNX..',
  '.XBbBBBBBBBNNX..',
  'XBbBBBBBBBNNNNX.',
  'XBbBBBBBBBBNNNX.',
  'XBbBBBBNBBBNNNX.',
  'XBbBBBNBBBBNNNNX',
];
const VA_LEGS_U = [
  'XBbBBBNBBBBBNNNX',
  'XBbBBNBBBBBBNNNX',
  'FrQRRRQRRRRRQRQ.',
  'F...UUV..UUV....',
  '....UUV..UUV....',
  '...UUUV..UUUV...',
];
const VA_LEGS_U_A = [
  'XBbBBBNBBBBBNNNX',
  'XBbBBNBBBBBBNNNX',
  'FrQRRRQRRRRRQRQ.',
  'F...UUV..UUV....',
  '....UUV..UUUV...',
  '...UUUV.........',
];
const VA_LEGS_U_B = [
  'XBbBBBNBBBBBNNNX',
  'XBbBBNBBBBBBNNNX',
  'FrQRRRQRRRRRQRQ.',
  'F...UUV..UUV....',
  '...UUUV..UUV....',
  '.........UUUV...',
];

const VA_HEAD_L = [
  '................',
  '...hhhhHHJJ.....',
  '.hhHHHHHHHHJJ...',
  '.HhhhHHHHHHHJK..',
  '.SHHHhhHHHHJJJK.',
  '.SSSHHHhhHHHJJK.',
  '.SSSSSJHHhhJJK..',
  '.SttSSTsJJHJK...',
  '.SS#SSTTJHJK....',
  'sSSiSSTTJJK.....',
  '.TSSSTT.........',
];
const VA_TORSO_L = [
  '...#QrRQ#.......',
  '..QRRRQBBN......',
  '..yYYDbBBNN.....',
  '..RbBBBBBNNX....',
  '..RbBBBBBNNXX...',
  '..RbBwcBBNNXX...',
  '.GgYRRRRRQNNXX..',
  '..RBBFBBBNNXXX..',
  '..RBBBFBBNNXXXX.',
];
const VA_TORSO_L_BACK = [
  '...#QrRQ#.......',
  '..QRRRQBBN......',
  '..yYYDbBBNN.....',
  '..RbBBBBBNN.....',
  '..RbBBBBBNNN....',
  '..RbBwcBBNNN....',
  '.GgYRRRRRQNNN...',
  '..RBBFBBBNNNNN..',
  '..RBBBFBBNNNNNN.',
];
const VA_TORSO_L_FWD = [
  '...#QrRQ#.......',
  '..QRRRQBBN......',
  '..yYYDbBBNN.....',
  '..RbBBBBBNN.....',
  '..RbBBBBBNNN....',
  '..RbBwcBBNNN....',
  '.GgYRRRRRQNN....',
  '..RBBFBBBNNN....',
  '..RBBBFBBNNNN...',
];
const VA_LEGS_L = [
  '..RBBBBFBBNNNNX.',
  '..rRRRRRFRRRQQX.',
  '....uUV..F..QX..',
  '....uUV...Y.....',
  '....uUV.........',
  '...uUUV.........',
];
const VA_LEGS_L_A = [
  '..RBBBBFBBNNNNNX',
  '.rRRRRRRFRRRRQQX',
  '...uUV...uUVFQX.',
  '..uUV.....uUVY..',
  '.uUV......uUV...',
  'uUUV......uUUV..',
];
const VA_LEGS_L_B = [
  '..RBBBBFBBNNNNX.',
  '.rRRRRRRFRRRRQX.',
  '...UUV...uUVFQ..',
  '..UUV.....uUVY..',
  '.UUV......uUV...',
  'UUUV......uUUUV.',
];

export const varek = {
  id: 'varek',
  name: 'Varek',
  palette: VAREK_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: VA_HEAD_D, torso: [VA_TORSO_D, VA_TORSO_D_A], torsoB: VA_TORSO_D_B, legs: [VA_LEGS_D, VA_LEGS_D_A], legsB: VA_LEGS_D_B },
    up: { head: VA_HEAD_U, torso: [VA_TORSO_U, VA_TORSO_U_A], torsoB: VA_TORSO_U_B, legs: [VA_LEGS_U, VA_LEGS_U_A], legsB: VA_LEGS_U_B },
    left: { head: VA_HEAD_L, torso: [VA_TORSO_L, VA_TORSO_L_BACK, VA_TORSO_L_FWD], legs: [VA_LEGS_L, VA_LEGS_L_A, VA_LEGS_L_B] },
  },
};

// ============================================================ SOLDADO
// Soldado do Império de Ferro. Elmo de aço fechado com fenda de visor e
// crista vermelha, ombreiras e peitoral de aço sobre farda carmesim,
// emblema de engrenagem dourada, cinto de couro, grevas e botas escuras.
// Alabarda em pé na mão direita (grade de 18 colunas para caber a haste).
const SOLDADO_PALETTE = {
  '#': '#1a1020',
  // aço
  g: '#f4f8ff', G: '#b2bed6', F: '#6e7a9a', E: '#40486a', V: '#120f1c',
  // carmesim (farda, crista)
  r: '#ff6a78', R: '#cc2a40', Q: '#7c1628',
  // ouro
  y: '#ffe88c', Y: '#d8a03c', D: '#8a5c1c',
  // madeira da alabarda
  o: '#d29a5c', O: '#94602e', P: '#5a3418',
  // couro (luvas, cinto)
  l: '#b07a4c', L: '#6e4228',
  // botas
  u: '#6a6480', U: '#3a3648', X: '#1e1a28',
};

const SO_HEAD_D = [
  'g.................',
  'G......rrR........',
  'Ggg...rRRRQ.......',
  'GGGF.gGrRQGF......',
  'OGF.gGgGrQGGF.....',
  'OF.gGgGGRQGGGF....',
  'O.gGgGGGGGGGGGF...',
  'O.GgGGGGGGGGGGF...',
  'O.FVVVVVVVVVVVF...',
  'O.GGGGGGVGGGGGF...',
  'O.FGGGGGVGGGGFF...',
  'O..FGGGGGGGGGF....',
  'O...FFGGGGGFF.....',
];
const SO_TORSO_D = [
  'O....#EGGGE#......',
  'O.gGFRgGGGFRgGF...',
  'O.RRQgGYyYGFQRQ...',
  'O.RRQGGyDyGFQRQ...',
  'llLRQGGYyYGFQRQ...',
  'lLRQEFGGGGGFEQll..',
  'O..LLLLyYLLLLLl...',
  'O..RQRRRRRRRRQR...',
];
const SO_TORSO_D_A = [
  'O....#EGGGE#......',
  'O.gGFRgGGGFRgGF...',
  'O.RRQgGYyYGFQRQ...',
  'O.RRQGGyDyGFQRQ...',
  'llLRQGGYyYGFQRQ...',
  'lLRQEFGGGGGFEQRQ..',
  'O..LLLLyYLLLLLRQ..',
  'O..RQRRRRRRRRQll..',
];
const SO_TORSO_D_B = [
  'O....#EGGGE#......',
  'O.gGFRgGGGFRgGF...',
  'O.RRQgGYyYGFQRQ...',
  'O.RRQGGyDyGFQRQ...',
  'llLRQGGYyYGFQll...',
  'lLRQEFGGGGGFEll...',
  'O..LLLLyYLLLLL....',
  'O..RQRRRRRRRRQR...',
];
const SO_LEGS_D = [
  'O...RRRQ.RRRQ.....',
  'O...GGGF.GGGF.....',
  'O...gGGF.gGGF.....',
  'O...UUUX.UUUX.....',
  'P..uUUUX.uUUUX....',
];
const SO_LEGS_D_A = [
  'O...RRRQ.RRRQ.....',
  'O...GGGF.gGGF.....',
  'O...gGGF.UUUX.....',
  'P...UUUX.UUUX.....',
  '...uUUUX..........',
];
const SO_LEGS_D_B = [
  'O...RRRQ.RRRQ.....',
  'O...gGGF.GGGF.....',
  'O...UUUX.gGGF.....',
  'P...UUUX.UUUX.....',
  '.........uUUUX....',
];

const SO_HEAD_U = [
  '.................g',
  '.......rrR.......G',
  '......rRRRQ.....gG',
  '.....gGrRQGF...gGG',
  '....gGgGrQGGF...FO',
  '...gGgGGRQGGGF...O',
  '..gGgGGGRQGGGGF..O',
  '..GgGGGGRQGGGGF..O',
  '..GGGGGGQQGGGGF..O',
  '..FGGGGGGGGGGGF..O',
  '..FFGGGGGGGGGFF..O',
  '...FFGGGGGGGFF...O',
  '....EFFFFFFFE....O',
];
const SO_TORSO_U = [
  '.....EFFFFFE.....O',
  '..gGFgGGGGGGgGF..O',
  '..QRFgGGGGGGFRR..O',
  '..QRFGGGGGGGFRR..O',
  '..QRFGGGGGGFFRQLll',
  '..llQFGGGGGFQRQlLl',
  '...LLLLLLLLLLL...O',
  '...RRRRRQRRRRQ...O',
];
const SO_TORSO_U_A = [
  '.....EFFFFFE.....O',
  '..gGFgGGGGGGgGF..O',
  '..QRFgGGGGGGFRR..O',
  '..QRFGGGGGGGFRR..O',
  '..QRFGGGGGGFFRQLll',
  '..QRQFGGGGGFQRQlLl',
  '..llLLLLLLLLLL...O',
  '...RRRRRQRRRRQ...O',
];
const SO_TORSO_U_B = [
  '.....EFFFFFE.....O',
  '..gGFgGGGGGGgGF..O',
  '..QRFgGGGGGGFRR..O',
  '..QRFGGGGGGGFRR..O',
  '..llFGGGGGGFFRQLll',
  '..QRQFGGGGGFQRQlLl',
  '...LLLLLLLLLLL...O',
  '...RRRRRQRRRRQ...O',
];
const SO_LEGS_U = [
  '....QRRR.QRRR....O',
  '....FGGG.FGGG....O',
  '....FGGg.FGGg....O',
  '....UUUU.UUUU....O',
  '...XUUUu.XUUUu...P',
];
const SO_LEGS_U_A = [
  '....QRRR.QRRR....O',
  '....FGGG.FGGG....O',
  '....FGGg.UUUU....O',
  '....UUUU.UUUU....P',
  '...XUUUu..........',
];
const SO_LEGS_U_B = [
  '....QRRR.QRRR....O',
  '....FGGG.FGGG....O',
  '....UUUU.FGGg....O',
  '....UUUU.UUUU....P',
  '.........XUUUu....',
];

const SO_HEAD_L = [
  '.g................',
  '.Gg...............',
  '.GgF....rrRRQ.....',
  '.OGF..rRRRRRRQ....',
  '.OF..gGgGGGGGGF...',
  '.O..gGgGGGGGGGGF..',
  '.O..gGGGGGGGGGGF..',
  '.O..VVVVVGGGGGGFF.',
  '.O.gGGGGFGGGGGGFE.',
  '.O..FGGGFGGGGGGGFE',
  '.O...FFGGGGGGGFFFE',
  '.O....FFGGGGGFE...',
  '.O......EFFFE.....',
];
const SO_TORSO_L = [
  '.O......#EGGE.....',
  '.O....gGgggGGF....',
  '.O...YgGRRRGGGF...',
  '.O...GGRRRQFGGF...',
  'lLlRRRRRQGGGGGF...',
  'lLlQQQQGGGGGGFE...',
  '.O...LLyLLLLLLL...',
  '.O...RRRQRRRRQR...',
];
const SO_TORSO_L_BACK = [
  '.O......#EGGE.....',
  '.O....gGgggGGF....',
  '.O...YgGRRRGGGF...',
  '.O...GGRRRQFGGFQ..',
  'lLlRRRRRQGGGGGFRQ.',
  'lLlQQQQGGGGGGFEll.',
  '.O...LLyLLLLLLL...',
  '.O...RRRQRRRRQR...',
];
const SO_TORSO_L_FWD = [
  '.O......#EGGE.....',
  '.O....gGgggGGF....',
  '.O...YgGRRRGGGF...',
  '.O...GGRRRQFGGF...',
  'lLlRRRRRQGGGGGF...',
  'lLlQQQQGGGGGGFE...',
  '.O...LLyLLLLLLL...',
  '.O...RRRQRRRRQR...',
];
const SO_LEGS_L = [
  '.O....RRRRQ.......',
  '.O....GGGGF.......',
  '.O....gGGGF.......',
  '.O....UUUUX.......',
  '.P...uUUUUX.......',
];
const SO_LEGS_L_A = [
  '.O...RRRRRRRQ.....',
  '.O..GGGF..QRRQ....',
  '.O.gGGF....FGGF...',
  '.PUUUX.....UUUX...',
  '.uUUUX....UUUUX...',
];
const SO_LEGS_L_B = [
  '.O...RRRRRRRQ.....',
  '.O..QRRQ..GGGF....',
  '.O.FGGE....gGGF...',
  '.PXUUX.....UUUX...',
  '.XUUUX....uUUUUX..',
];

export const soldado = {
  id: 'soldado',
  name: 'Soldado Imperial',
  palette: SOLDADO_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 18,
  dir: {
    down: { head: SO_HEAD_D, torso: [SO_TORSO_D, SO_TORSO_D_A], torsoB: SO_TORSO_D_B, legs: [SO_LEGS_D, SO_LEGS_D_A], legsB: SO_LEGS_D_B },
    up: { head: SO_HEAD_U, torso: [SO_TORSO_U, SO_TORSO_U_A], torsoB: SO_TORSO_U_B, legs: [SO_LEGS_U, SO_LEGS_U_A], legsB: SO_LEGS_U_B },
    left: { head: SO_HEAD_L, torso: [SO_TORSO_L, SO_TORSO_L_BACK, SO_TORSO_L_FWD], legs: [SO_LEGS_L, SO_LEGS_L_A, SO_LEGS_L_B] },
  },
};

// ============================================================ PESCADOR
// Pescador de Vila Maré. Pele bronzeada, chapéu de palha de aba larga com
// fita vermelha, barba castanha, camisa listrada de mangas arregaçadas, corda
// como cinto, calça azul dobrada até a canela, pés descalços. Carrega um peixe
// pelo rabo na mão direita.
const PESCADOR_PALETTE = {
  '#': '#1a1020',
  // palha
  h: '#fff2b4', H: '#eec466', J: '#c08c3a', K: '#7e5626',
  // fita do chapéu
  r: '#ff7058', R: '#c0382c',
  // pele bronzeada
  s: '#f8c89a', S: '#da9460', T: '#a8623a', t: '#743e22',
  // olhos
  i: '#4a2c18',
  // barba
  z: '#8a5434', Z: '#583020',
  // camisa branca + listras
  w: '#ffffff', c: '#dcdcee', C: '#a2a6c4', n: '#4a6cc0', N: '#2a3c7c',
  // calça azul
  a: '#a8d0f4', b: '#6aa2dc', B: '#3e70b0', D: '#244878',
  // corda (cinto)
  l: '#ecd496', L: '#a88a48',
  // peixe (pargo vermelho)
  f: '#ffc4a4', F: '#f05a44', E: '#a42838',
};

const PE_HEAD_D = [
  '.....hhHHJ......',
  '....hHHHHHJ.....',
  '....rrRRRRR.....',
  '.hhHHHHHHHHHJJ..',
  'hHHJHHHJHHHJJJK.',
  '..KTTTTTTTTTK...',
  '..ZSSsSSSSSSZ...',
  '..ZSS#SSS#SSZ...',
  '..zSSiSSSiSSz...',
  '...zzSSTSSzz....',
  '...zzzZZZzzz....',
];
const PE_TORSO_D = [
  '....#zzZzz#.....',
  '..wwwwzZzwwwC...',
  '.nNnnnnTnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnSS..',
  '.STwwwwwwwwwTS..',
  '.SSlLlLlLlLlSS..',
  'fF.BBBBBBBBBD...',
];
const PE_TORSO_D_A = [
  '....#zzZzz#.....',
  '..wwwwzZzwwwC...',
  '.nNnnnnTnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnSS..',
  '.SSwwwwwwwwwTS..',
  'fF.lLlLlLlLlTS..',
  'fFEBBBBBBBBBSS..',
];
const PE_TORSO_D_B = [
  '....#zzZzz#.....',
  '..wwwwzZzwwwC...',
  '.nNnnnnTnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnSS..',
  '.STwwwwwwwwwSS..',
  '.TSlLlLlLlLlS...',
  '.SSBBBBBBBBBD...',
];
const PE_LEGS_D = [
  'fFEbBBD.bBBD....',
  'fFEbBBD.bBBD....',
  '.F.aabb.aabb....',
  'F.EsSST.sSST....',
  '..sSSST.sSSST...',
];
const PE_LEGS_D_A = [
  'fFEbBBD.bBBD....',
  '.F.bBBD.aabb....',
  'F.Eaabb.sSST....',
  '...sSST.sSST....',
  '..sSSST.........',
];
const PE_LEGS_D_B = [
  'fF.bBBD.bBBD....',
  'fFEaabb.bBBD....',
  'fFEsSST.aabb....',
  '.F.sSST.sSST....',
  'F.E.....sSSST...',
];

const PE_HEAD_U = [
  '.....hhHHJ......',
  '....hHHHHHJ.....',
  '....rrRRRRR.....',
  '.hhHHHHHHHHHJJ..',
  'hHHJHHHJHHHJJJK.',
  '..KZZZZZZZZZK...',
  '..ZzzZzzZzzzZ...',
  '..ZzZzzZzzZzZ...',
  '..TZzzZzzZzZT...',
  '...ZZZzZZZZZ....',
  '....TSSSSST.....',
];
const PE_TORSO_U = [
  '....wwwwwww.....',
  '..wwwwwwwwwwC...',
  '.nNnnnnnnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnST..',
  '.STwwwwwwwwwTS..',
  '.SSlLlLlLlLlLSS.',
  '...BBBBBBBBBD.Ff',
];
const PE_TORSO_U_A = [
  '....wwwwwww.....',
  '..wwwwwwwwwwC...',
  '.nNnnnnnnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnST..',
  '.SSwwwwwwwwwTS..',
  '.TSlLlLlLlLlLT..',
  '...BBBBBBBBBDSS.',
];
const PE_TORSO_U_B = [
  '....wwwwwww.....',
  '..wwwwwwwwwwC...',
  '.nNnnnnnnnnnNN..',
  '.wCwwwwwwwwwCC..',
  '.SSnnnnnnnnnSS..',
  '.STwwwwwwwwwTSS.',
  '.TSlLlLlLlLlL.Ff',
  '.SSBBBBBBBBBDEFf',
];
const PE_LEGS_U = [
  '...bBBD.bBBD.EFf',
  '...bBBD.bBBD.EFf',
  '...bbaa.bbaa..F.',
  '...TSSS.TSSS.E.F',
  '..TTSSS.TTSSS...',
];
const PE_LEGS_U_A = [
  '...bBBD.bBBD..Ff',
  '...bBBD.bbaa.EFf',
  '...bbaa.TSSS.EFf',
  '...TSSS.TSSS..F.',
  '..TTSSS......E.F',
];
const PE_LEGS_U_B = [
  '...bBBD.bBBD.EFf',
  '...bbaa.bBBD..F.',
  '...TSSS.bbaa.E.F',
  '...TSSS.TSSS....',
  '........TTSSS...',
];

const PE_HEAD_L = [
  '....hhHHJ.......',
  '...hHHHHHJ......',
  '...rrRRRRR......',
  '.hhHHHHHHHHHJJ..',
  'hHHJHHHJHHHJJJJK',
  '..KTTTTTZZZZK...',
  '.SSsSSSTZzzZK...',
  '.SS#SSTsZzZZ....',
  'sSSiSSTTzZZ.....',
  '.zzSSzzzZZ......',
  '..zzzzzZ........',
];
const PE_TORSO_L = [
  '..zzZZwwC.......',
  '..wwwwwwwwC.....',
  '..nnnnn#nnnN....',
  '..wwwww#cwwC....',
  '..nnnnn#SSnN....',
  '..wwwww#STwC....',
  '..lLlLl#SSlL....',
  '..BBBBBBf#BD....',
];
const PE_TORSO_L_BACK = [
  '..zzZZwwC.......',
  '..wwwwwwwwC.....',
  '..nnnnnn#nnN....',
  '..wwwwww#cwC....',
  '..nnnnnnn#SS....',
  '..wwwwwwwwSTC...',
  '..lLlLlLlLSSL...',
  '..BBBBBBBBf#D...',
];
const PE_TORSO_L_FWD = [
  '..zzZZwwC.......',
  '..wwwwwwwwC.....',
  '..nnnnn#nnnN....',
  '..wwww#cwwwC....',
  '..nnn#SSnnnN....',
  '..ww#STwwwwC....',
  '..lL#SSlLlLL....',
  '..BBBf#BBBBD....',
];
const PE_LEGS_L = [
  '...bBBBDfF......',
  '...bBBBDfE......',
  '...aabbb.F......',
  '...sSST.F.E.....',
  '..sSSST.........',
];
const PE_LEGS_L_A = [
  '...bBBBBBBfF....',
  '..bBBDBBDBfE....',
  '.aab...bba.F....',
  '.sST...TTTF.E...',
  'sSST...TTTt.....',
];
const PE_LEGS_L_B = [
  '...BBfFBbBD.....',
  '..DBBfEbbBBD....',
  '.Dbb..F..aab....',
  '.TTtF.E...sST...',
  'TTTt......sSSST.',
];

export const pescador = {
  id: 'pescador',
  name: 'Pescador',
  palette: PESCADOR_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: PE_HEAD_D, torso: [PE_TORSO_D, PE_TORSO_D_A], torsoB: PE_TORSO_D_B, legs: [PE_LEGS_D, PE_LEGS_D_A], legsB: PE_LEGS_D_B },
    up: { head: PE_HEAD_U, torso: [PE_TORSO_U, PE_TORSO_U_A], torsoB: PE_TORSO_U_B, legs: [PE_LEGS_U, PE_LEGS_U_A], legsB: PE_LEGS_U_B },
    left: { head: PE_HEAD_L, torso: [PE_TORSO_L, PE_TORSO_L_BACK, PE_TORSO_L_FWD], legs: [PE_LEGS_L, PE_LEGS_L_A, PE_LEGS_L_B] },
  },
};

// ============================================================ MERCADORA
// Feirante do mercado. Corpulenta e sorridente, cabelo escuro cacheado sob um
// lenço amarelo com nó no alto, argolas douradas, vestido laranja, avental
// branco. Carrega à frente, com as duas mãos, uma cesta de vime com maçãs.
const MERCADORA_PALETTE = {
  '#': '#1a1020',
  // lenço amarelo
  y: '#fff4a4', Y: '#f8cc40', Z: '#cc8c24', X: '#8a5418',
  // cabelo cacheado
  h: '#8a5a44', H: '#56322a', J: '#321c1c',
  // pele morena
  s: '#f2b88e', S: '#cc8858', T: '#9a5636', t: '#6a3622', m: '#e8786a',
  // olhos
  i: '#5a2c18',
  // vestido laranja
  o: '#ffb070', O: '#f07a30', P: '#b8481c', Q: '#7a2a14',
  // avental
  w: '#fffaf0', c: '#e6d6be', C: '#b49c80',
  // ouro (argolas)
  g: '#ffe070',
  // cesta de vime, maçãs, folhas
  k: '#f0c886', K: '#c08a4a', L: '#7a4e24', a: '#ff5848', A: '#b42430', v: '#7cd060',
  // sapatos
  u: '#8a5434', U: '#4e2c1c',
};

const ME_HEAD_D = [
  '.....yyYYZ......',
  '...yyYwYYYZZ....',
  '..yYYYYYYwYYZ...',
  '..ywYYZyXyZYZX..',
  '..yYYYYXZXYYZX..',
  '.hHZZZZZZZZZZXH.',
  '.HhHSsSSSSSShJH.',
  '.hHJSSSSSSSSJhJ.',
  '..HSS#SSS#SSHJ..',
  '..gSSiSSSiSSg...',
  '..g.TmSTSmT.g...',
];
const ME_TORSO_D = [
  '....#TSSST#.....',
  '..oOOcwwwwcOOP..',
  '.oOOPcwwwwcPOOP.',
  '.SSPOcaAvacOPSS.',
  '..SSkkkkkkkkSS..',
  '..PKkKkKkKkKKP..',
  '..OOLKkKkKkLOO..',
  '..OOcLLLLLLcOO..',
];
const ME_TORSO_D_A = [
  '....#TSSST#.....',
  '..oOOcwwwwcOOP..',
  '.oOOPcwwwwcPOOP.',
  '.SSPOcvaAacOPSS.',
  '..SSkkkkkkkkSS..',
  '..PKkKkKkKkKKP..',
  '..OOLKkKkKkLOO..',
  '..OOcLLLLLLcOO..',
];
const ME_TORSO_D_B = [
  '....#TSSST#.....',
  '..oOOcwwwwcOOP..',
  '.oOOPcwwwwcPOOP.',
  '.SSPOcaAavcOPSS.',
  '..SSkkkkkkkkSS..',
  '..PKkKkKkKkKKP..',
  '..OOLKkKkKkLOO..',
  '..OOcLLLLLLcOO..',
];
const ME_LEGS_D = [
  '.oOOcwwwwwwcOOP.',
  'oOOPCcwwwwcCPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '...uUU...uUU....',
];
const ME_LEGS_D_A = [
  '.oOOcwwwwwwcOOP.',
  'oOOPCcwwwwcCPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '..uUU...........',
];
const ME_LEGS_D_B = [
  '.oOOcwwwwwwcOOP.',
  'oOOPCcwwwwcCPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '..........uUU...',
];

const ME_HEAD_U = [
  '.....yyYYZ......',
  '...yyYwYYYZZ....',
  '..yYYYYYYwYYZ...',
  '..ywYYYYYYYwZX..',
  '..yYYYwYYYYYZX..',
  '.hHYYYYYYwYYZXH.',
  '.HhZZYYYYYYZXhJ.',
  '.hHhZZZZZZZZXhJ.',
  '..HhHhHJhHhHJJ..',
  '..gJhHJhHJhJg...',
  '..g.JTSSSTJ.g...',
];
const ME_TORSO_U = [
  '....OOOOOOO.....',
  '..oOwOOOOOwOOP..',
  '.oOOPwOOOwOPOOP.',
  '.SSPOOwOwOOOPSS.',
  '..SSOOOwOOOOSS..',
  '..OOcCCwwCCcOO..',
  '..OOOOwCCwOOOO..',
  '..OOOOPOOPOOOO..',
];
const ME_TORSO_U_A = [
  '....OOOOOOO.....',
  '..oOwOOOOOwOOP..',
  '.oOOPwOOOwOPOOP.',
  '.SSPOOwOwOOOPSS.',
  '..SSOOOwOOOOSS..',
  '..OOcCCwwCCcOO..',
  '..OOOwCCwOOOOO..',
  '..OOOwPOOPOOOO..',
];
const ME_TORSO_U_B = [
  '....OOOOOOO.....',
  '..oOwOOOOOwOOP..',
  '.oOOPwOOOwOPOOP.',
  '.SSPOOwOwOOOPSS.',
  '..SSOOOwOOOOSS..',
  '..OOcCCwwCCcOO..',
  '..OOOOOwCCwOOO..',
  '..OOOOPOOPwOOO..',
];
const ME_LEGS_U = [
  '.oOOOOOOOOOOOOP.',
  'oOOPOOOOOOOOPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '...UUU...UUU....',
];
const ME_LEGS_U_A = [
  '.oOOOOOOOOOOOOP.',
  'oOOPOOOOOOOOPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '..UUU...........',
];
const ME_LEGS_U_B = [
  '.oOOOOOOOOOOOOP.',
  'oOOPOOOOOOOOPOPQ',
  '.QPQQQQQQQQQQPQ.',
  '..........UUU...',
];

const ME_HEAD_L = [
  '......yyYYZ.....',
  '....yyYwYYYZZ...',
  '...yYYYYYYwYZZ..',
  '.ZyXYwYYYYYYYZX.',
  '.XZXYYYYwYYYYZX.',
  '..ZZZZZZZZZZZXhH',
  '.SSsSSSSHhHJhHhJ',
  '.SSSSSSSgHhHhJHJ',
  '.SS#SSSTgJHhHJJ.',
  'sSSiSSSTJHJJhJ..',
  '.SmSSStST..JJ...',
];
const ME_TORSO_L = [
  '...#TSSST#......',
  '...cwwoOOOOP....',
  '..cwwwoOOOOOP...',
  '.aAvaSoOOOOOP...',
  'kkkkkSSOOOOOOP..',
  'KkKkLcOOOOOOOP..',
  '.KkKLcwOOOOOOOP.',
  '.LLLcwwOOOOOOOP.',
];
const ME_TORSO_L_BACK = [
  '...#TSSST#......',
  '...cwwoOOOOP....',
  '..cwwwoOOOOOP...',
  '..aAvaSOOOOOP...',
  '.kkkkkSSOOOOOP..',
  '.KkKkLcOOOOOOP..',
  '..KkKLcwOOOOOOP.',
  '..LLLcwwOOOOOOP.',
];
const ME_TORSO_L_FWD = [
  '...#TSSST#......',
  '...cwwoOOOOP....',
  '..cwwwoOOOOOP...',
  'aAva.SoOOOOOP...',
  'kkkkSSOOOOOOOP..',
  'KkKLccOOOOOOOP..',
  'KkKLcwwOOOOOOOP.',
  'LLLcwwwOOOOOOOP.',
];
const ME_LEGS_L = [
  '.cwwwoOOOOOOOOP.',
  '.CcwwoOOOOOOOPP.',
  'oOOOOOOOOOOOPPQ.',
  '...uUU....UUU...',
];
const ME_LEGS_L_A = [
  '.cwwwoOOOOOOOOP.',
  'CcwwwoOOOOOOOPP.',
  'oOOOOOOOOOOOOPPQ',
  'uUU.........UU..',
];
const ME_LEGS_L_B = [
  '.cwwwoOOOOOOOOP.',
  '.CcwwoOOOOOOOPP.',
  '.oOOOOOOOOOOPPQ.',
  '...UU..uUU......',
];

export const mercadora = {
  id: 'mercadora',
  name: 'Mercadora',
  palette: MERCADORA_PALETTE,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: ME_HEAD_D, torso: [ME_TORSO_D, ME_TORSO_D_A], torsoB: ME_TORSO_D_B, legs: [ME_LEGS_D, ME_LEGS_D_A], legsB: ME_LEGS_D_B },
    up: { head: ME_HEAD_U, torso: [ME_TORSO_U, ME_TORSO_U_A], torsoB: ME_TORSO_U_B, legs: [ME_LEGS_U, ME_LEGS_U_A], legsB: ME_LEGS_U_B },
    left: { head: ME_HEAD_L, torso: [ME_TORSO_L, ME_TORSO_L_BACK, ME_TORSO_L_FWD], legs: [ME_LEGS_L, ME_LEGS_L_A, ME_LEGS_L_B] },
  },
};
