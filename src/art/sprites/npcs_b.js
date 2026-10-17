// NPCs de Vila Maré (parte B) redesenhados no estilo FF6 (ver lio.js):
// grade de 16 colunas, contorno preto automático (ink), linhas internas '#',
// 3 tons por material com luz de cima-esquerda.
// Crianças 20 linhas (proporção Relm/Gau), ancião curvado 22 (+cajado acima da
// cabeça), mineiro 24, estalajadeira alta 26.
// Objetos assimétricos (espada, lanterna, cajado, picareta) ficam em camadas
// compostas com compose() e os passos B (torsoB/legsB) são explícitos para
// que nada seja espelhado para a mão errada.
import { compose } from '../charkit.js';

const C16 = (h, layers) => compose(16, h, layers);

// ============================================================ CRIANÇA
// Menino da vila. Baixinho, cabelo preto bagunçado, túnica verde grande
// demais (mangas compridas, barra no joelho), cinto de corda, sandálias e
// espada de brinquedo de madeira apoiada no ombro.
const CR_PAL = {
  '#': '#1a1020',
  // cabelo preto-azulado
  h: '#9294cc', H: '#50527e', J: '#2e2e4c', K: '#17172a',
  // pele
  s: '#ffe4c8', S: '#f6b890', T: '#c87a5a', t: '#94523e',
  // olhos
  i: '#7a4420',
  // túnica verde
  a: '#b8ea7c', A: '#66b04a', Z: '#2f7438', X: '#1a4826',
  // cinto de corda
  l: '#f0d48c', L: '#a8803c',
  // espada de madeira
  o: '#fbe0aa', O: '#cc9356', D: '#7a4826',
  // sandálias
  u: '#b8763e', U: '#6c3e20',
};

const CR_HD = [
  '...h..hH..h.....',
  '..hHJ.hHHhHh....',
  '.hHHHhHHHJHHJ...',
  'hHHJhHHJhHHHJK..',
  '.JhHHJhHHJhHJK..',
  '.JJJsJSSJSSJJK..',
  '.KJSS#SSS#SSJK..',
  '..JSSiSSSiSSJ...',
  '..TSSSSSSSSST...',
  '...TTSSSSSTT....',
];
const CR_SWORD_R = [ // de frente: lâmina ao lado da cabeça (lado direito da tela)
  '.o.',
  '.oO',
  '.oO',
  '.oO',
  '.oO',
  '.oO',
  '.oO',
  '.oO',
  'DOD',
];
const CR_TORSO_D = [
  '....A#TSS#A..SS.',
  '..aAZaAAAAZ.aZD.',
  '..aAZaAAAAZ.aZ..',
  '..aAZaAAAZZ.ZZ..',
  '..SSZlLlLlLZ....',
  '..aAAAAAAAAZ....',
];
const CR_TORSO_D_A = [ // braço livre recua
  '....A#TSS#A..SS.',
  '..aAZaAAAAZ.aZD.',
  '..aAZaAAAAZ.aZ..',
  '..SAZaAAAZZ.ZZ..',
  '..aAZlLlLlLZ....',
  '..aAAAAAAAAZ....',
];
const CR_TORSO_D_B = [ // braço livre avança
  '....A#TSS#A..SS.',
  '..aAZaAAAAZ.aZD.',
  '..aAZaAAAAZ.aZ..',
  '..aAZaAAAZZ.ZZ..',
  '..aAZlLlLlLZ....',
  '..SSAAAAAAAZ....',
];
const CR_LEGS_D = [
  '..aAAZAAAZAAZ...',
  '....SST.SST.....',
  '....SST.SST.....',
  '...uUUU.uUUU....',
];
const CR_LEGS_D_A = [
  '..aAAZAAAZAAZ...',
  '....SST.SST.....',
  '....SST.uUUU....',
  '...uUUU.........',
];
const CR_LEGS_D_B = [
  '..aAAZAAAZAAZ...',
  '....SST.SST.....',
  '...uUUU.SST.....',
  '........uUUU....',
];

const CR_HU = [
  '...h..hH..h.....',
  '..hHJ.hHHhHh....',
  '.hHHHhHHHJHHJ...',
  'hHHJJhHHJJhHJK..',
  '.JhHHJJhHHJJhK..',
  'hJJJhHHJJhHHJK..',
  '.JhHHJJhHHJJK...',
  '.SJJJJJJJJJJS...',
  '..KJJJJJJJJK....',
  '...TSSSSSST.....',
];
const CR_SWORD_L = [ // de costas: lâmina do lado esquerdo da tela
  'o..',
  'oO.',
  'oO.',
  'oO.',
  'oO.',
  'oO.',
  'oO.',
  'oO.',
  'DOD',
];
const CR_TORSO_U = [
  '.SS.aAAAAAZ.....',
  '.DaZXaAAAAZAZ...',
  '..aZXaAAAAZAZ...',
  '..ZZXaAAAZZAZ...',
  '....ZlLlLlLSS...',
  '..aAAAAAAAAZ....',
];
const CR_TORSO_U_A = [
  '.SS.aAAAAAZ.....',
  '.DaZXaAAAAZAZ...',
  '..aZXaAAAAZAZ...',
  '..ZZXaAAAZZAZ...',
  '....ZlLlLlLAZ...',
  '..aAAAAAAAASS...',
];
const CR_TORSO_U_B = [
  '.SS.aAAAAAZ.....',
  '.DaZXaAAAAZAZ...',
  '..aZXaAAAAZAZ...',
  '..ZZXaAAAZZSS...',
  '....ZlLlLlLZ....',
  '..aAAAAAAAAZ....',
];

const CR_HL = [
  '....h.hH.h......',
  '...hHJhHHhHh....',
  '..hHHHhHHJHHhJ..',
  '.hHJhHHJhHHHJK..',
  '.JHhHJhHHJhHJK..',
  '.JSsJJhHJhHJK...',
  '.SS#SSTsJHJJK...',
  'sSSiSSTTJJJK....',
  '.SSSSSTTJK......',
  '..TSSTT.........',
];
const CR_SWORD_BACK = [ // de lado: espada atrás da cabeça
  '.....o',
  '....oO',
  '....oO',
  '...oO.',
  '...oO.',
  '..oO..',
  '..oO..',
  '.DOD..',
  '..D...',
  '......',
];
const CR_TORSO_L = [
  '...#TSSAZ.......',
  '..aAAAaAAZ......',
  '..aAA#aAZZ......',
  '..aAA#aAZZ......',
  '..ZlL#SSLZ......',
  '..aAAAAAAZ......',
];
const CR_TORSO_L_BACK = [
  '...#TSSAZ.......',
  '..aAAAaAAZ......',
  '..aAAA#aAZ......',
  '..aAAAA#aAZ.....',
  '..ZlLlLLSSZ.....',
  '..aAAAAAAZ......',
];
const CR_TORSO_L_FWD = [
  '...#TSSAZ.......',
  '..aAAAaAAZ......',
  '..aAA#aAZZ......',
  '..aA#aAZZZ......',
  '..SSLlLLLZ......',
  '..aAAAAAAZ......',
];
const CR_LEGS_L = [
  '..aAAAAAAZ......',
  '....SST.........',
  '....SST.........',
  '...uUUU.........',
];
const CR_LEGS_L_A = [
  '..aAAAAAAAZ.....',
  '...SST..SST.....',
  '..SST....SST....',
  '.uUUU....uUUU...',
];
const CR_LEGS_L_B = [
  '..aAAAAAAAZ.....',
  '...TTt..SST.....',
  '..TTt....SST....',
  '.UUUU....uUUU...',
];

export const crianca = {
  id: 'crianca',
  name: 'Menino',
  palette: CR_PAL,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: {
      head: C16(10, [[CR_SWORD_R, 13, 1], [CR_HD, 0, 0]]),
      torso: [CR_TORSO_D, CR_TORSO_D_A], torsoB: CR_TORSO_D_B,
      legs: [CR_LEGS_D, CR_LEGS_D_A], legsB: CR_LEGS_D_B,
    },
    up: {
      head: C16(10, [[CR_HU, 0, 0], [CR_SWORD_L, 0, 1]]),
      torso: [CR_TORSO_U, CR_TORSO_U_A], torsoB: CR_TORSO_U_B,
      legs: [CR_LEGS_D, CR_LEGS_D_A], legsB: CR_LEGS_D_B,
    },
    left: {
      head: C16(10, [[CR_SWORD_BACK, 10, 0], [CR_HL, 0, 0]]),
      torso: [CR_TORSO_L, CR_TORSO_L_BACK, CR_TORSO_L_FWD],
      legs: [CR_LEGS_L, CR_LEGS_L_A, CR_LEGS_L_B],
    },
  },
};

// ============================================================ MENINA
// Menina da vila. Maria-chiquinhas castanhas com fitas cor-de-rosa, vestido
// rosa de gola branca, meias brancas, sapatinhos vermelhos e uma lanterna de
// papel em forma de estrela (festa!) que balança enquanto ela anda.
const MN_PAL = {
  '#': '#1a1020',
  // cabelo castanho
  h: '#e0a46a', H: '#a8683a', J: '#6e3e22', K: '#40200f',
  // fitas
  r: '#ff9ac6', R: '#e0508a',
  // pele
  s: '#fff0e2', S: '#fad0b4', T: '#e09c84', t: '#b06a5c', m: '#f08a98',
  // olhos
  i: '#3c8c52',
  // vestido rosa
  p: '#ffc8e0', P: '#f484b4', Q: '#c44c84', X: '#7c2a54',
  // gola / meias
  w: '#ffffff', c: '#dcd6ee',
  // lanterna de papel
  '*': '#fffbe0', y: '#ffe070', Y: '#f0a030', d: '#8a5a34',
  // sapatos
  u: '#e04a5a', U: '#8a2a3a',
};

const MN_HD = [
  '......hhHH......',
  '....hhHJhHHJ....',
  '...hHHHJhHHHJ...',
  'rRhHHHHHhHHJJrR.',
  'hHJHhHHhHHHHJHJ.',
  'HJJhHHhHHhHHJHJ.',
  'hJJSS#SSS#SSJhJ.',
  'HJ.SSiSSSiSS.HJ.',
  'JK.TmSSSSSmT.JK.',
  '....TTSSSTT.....',
];
// estrela de papel com contorno interno '#' onde cobre a saia
const MN_STAR_R = [
  '.##y..',
  '#yy*yy',
  '.#y*y.',
  '..Y.Y.',
];
const MN_STAR_L = [
  '..y##.',
  'yy*yy#',
  '.y*y#.',
  '.Y.Y..',
];
const MN_TORSO_D = [
  '....wwcTcww.....',
  '..pPQwwcwwQPQ...',
  '..pPQpPPPPQPQ...',
  '..SSQpPPPPQSS...',
  '..SS.RrRRR.SSd..',
];
const MN_TORSO_D_A = [
  '....wwcTcww.....',
  '..pPQwwcwwQPQ...',
  '..pPQpPPPPQPQ...',
  '..pPQpPPPPQSS...',
  '..SS.RrRRR.SS.d.',
];
const MN_TORSO_D_B = [
  '....wwcTcww.....',
  '..pPQwwcwwQPQ...',
  '..pPQpPPPPQPQ...',
  '..SSQpPPPPQSS...',
  '..SS.RrRRR.SSd..',
];
const MN_SKIRT = [
  '...pPPPPPPPQ....',
  '..pPPpPPPPPPQ...',
  '..wwwwwwwwwwc...',
];
const MN_LEGS_D = C16(5, [
  [MN_SKIRT, 0, 0],
  [['....ww..ww......', '...uUU..uUU.....'], 0, 3],
  [['d'], 13, 0],
  [MN_STAR_R, 10, 1],
]);
const MN_LEGS_D_A = C16(5, [
  [MN_SKIRT, 0, 0],
  [['....ww..uUU.....', '...uUU..........'], 0, 3],
  [['d'], 12, 0],
  [MN_STAR_R, 9, 1],
]);
const MN_LEGS_D_B = C16(5, [
  [MN_SKIRT, 0, 0],
  [['...uUU..ww......', '........uUU.....'], 0, 3],
  [['d'], 13, 0],
  [MN_STAR_R, 10, 1],
]);

const MN_HU = [
  '......hhHH......',
  '....hhHHHHHJ....',
  '...hHHHHHHHHJ...',
  'rRhHHhHHHHHJJrR.',
  'hHJHHhHHHHHJJHJ.',
  'HJJhHHhHHHJJJHJ.',
  'hJJHhHHHHJHJJhJ.',
  'HJ.JHHhHHJHJ.HJ.',
  'JK..JJHJJJJ..JK.',
  '....TSSSSST.....',
];
const MN_TORSO_U = [
  '....wwwwwwc.....',
  '..pPQPPPPPQPQ...',
  '..pPQPPPPPQPQ...',
  '..SSQPPPPPQSS...',
  '..SS.RrRrR.SS...',
];
const MN_TORSO_U_A = [
  '....wwwwwwc.....',
  '..pPQPPPPPQPQ...',
  '..pPQPPPPPQPQ...',
  '..SSQPPPPPQPQ...',
  '..SS.RrRrR.SS...',
];
const MN_TORSO_U_B = [
  '....wwwwwwc.....',
  '..pPQPPPPPQPQ...',
  '..pPQPPPPPQPQ...',
  '..SSQPPPPPQSS...',
  '..SS.RrRrR.SS...',
];
const MN_SKIRT_U = [
  '...pPPPRPRPQ....',
  '..pPPPPPPPPPQ...',
  '..wwwwwwwwwwc...',
];
const MN_LEGS_U = C16(5, [
  [MN_SKIRT_U, 0, 0],
  [['....ww..ww......', '...uUU..uUU.....'], 0, 3],
  [['d'], 2, 0],
  [MN_STAR_L, 0, 1],
]);
const MN_LEGS_U_A = C16(5, [
  [MN_SKIRT_U, 0, 0],
  [['....ww..uUU.....', '...uUU..........'], 0, 3],
  [['d'], 2, 0],
  [MN_STAR_L, 0, 1],
]);
const MN_LEGS_U_B = C16(5, [
  [MN_SKIRT_U, 0, 0],
  [['...uUU..ww......', '........uUU.....'], 0, 3],
  [['d'], 3, 0],
  [MN_STAR_L, 1, 1],
]);

const MN_HL = [
  '.....hhHHh......',
  '...hhHHHHHHJ....',
  '..hHHHHHHHHHJ...',
  '.hHHhHHHHHHJJrR.',
  '.JHHHJHHHHHJJhJ.',
  '.JJJhHHHHHJJ.HJ.',
  '.SS#SSSJHHJJ.hJ.',
  'sSSiSSTSJJJ..HJ.',
  '.SmSSSTTJJ...JK.',
  '..TTSTT.........',
];
const MN_TORSO_L = [
  '...cwwwc........',
  '...pPpPPQ.......',
  '...pP#pPQ.......',
  '...SS#PPQ.......',
  '..SSRrRRR.......',
];
const MN_TORSO_L_BACK = MN_TORSO_L;
const MN_TORSO_L_FWD = MN_TORSO_L;
const MN_SKIRT_L = [
  '..pPPPPPPQ......',
  '..pPPPPPPPQ.....',
  '..wwwwwwwwc.....',
];
const MN_LEGS_L = C16(5, [
  [MN_SKIRT_L, 0, 0],
  [['.....ww.........', '....uUU.........'], 0, 3],
  [['d'], 2, 0],
  [MN_STAR_L, 0, 1],
]);
const MN_LEGS_L_A = C16(5, [
  [MN_SKIRT_L, 0, 0],
  [['....ww..ww......', '...uUU..uUU.....'], 0, 3],
  [['d'], 3, 0],
  [MN_STAR_L, 1, 1],
]);
const MN_LEGS_L_B = C16(5, [
  [MN_SKIRT_L, 0, 0],
  [['....cc..ww......', '...UUU..uUU.....'], 0, 3],
  [['d'], 2, 0],
  [MN_STAR_L, 0, 1],
]);

export const menina = {
  id: 'menina',
  name: 'Menina',
  palette: MN_PAL,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: MN_HD, torso: [MN_TORSO_D, MN_TORSO_D_A], torsoB: MN_TORSO_D_B, legs: [MN_LEGS_D, MN_LEGS_D_A], legsB: MN_LEGS_D_B },
    up: { head: MN_HU, torso: [MN_TORSO_U, MN_TORSO_U_A], torsoB: MN_TORSO_U_B, legs: [MN_LEGS_U, MN_LEGS_U_A], legsB: MN_LEGS_U_B },
    left: { head: MN_HL, torso: [MN_TORSO_L, MN_TORSO_L_BACK, MN_TORSO_L_FWD], legs: [MN_LEGS_L, MN_LEGS_L_A, MN_LEGS_L_B] },
  },
};

// ============================================================ ANCIÃO
// Ancião da vila. Careca, barba branca longa, sobrancelhas fartas, manto
// roxo de mangas largas com faixa dourada, cajado alto de madeira retorcida
// com uma concha pendurada. Levemente curvado.
const AN_PAL = {
  '#': '#1a1020',
  // pele
  s: '#ffe6d0', S: '#f2bc98', T: '#c88468', t: '#94584a',
  // barba / cabelo branco
  b: '#ffffff', B: '#dcdaee', C: '#a6a4c4', E: '#6e6c92',
  // manto roxo
  v: '#c09ae8', V: '#8458be', X: '#56348a', Z: '#301c58',
  // faixa dourada
  y: '#ffe68a', Y: '#c8962e',
  // cajado
  o: '#d8a066', O: '#98643a', D: '#5a3820',
  // concha
  p: '#fff0e4', P: '#eaa490',
  // sandálias
  u: '#7a5444', U: '#4a2e28',
};

const AN_HD = [
  '................',
  '................',
  '.....ssSST......',
  '....sSSSSST.....',
  '...sSSSSSSST....',
  '..BSSSSSSSSTB...',
  '..BTbbSSSbbTC...',
  '..CTS#SSS#STC...',
  '...bSSSTSSSC....',
  '...bbbBBBBBC....',
  '...bbBBCBBCC....',
  '..vVbBBBBBCVX...',
];
const AN_STAFF_L = [ // ponta retorcida com a concha pendurada
  '.oO.',
  'oD.O',
  'O..p',
  'O..P',
];
const AN_TORSO_D = [
  'O.vVVbBBBBCVVVX.',
  'OvVVXbBBBCXVVVX.',
  'SSVVXVbBBCVVVVX.',
  'SSVXVVbBCVVVVVX.',
  'O.VVVVVbCVVVVXX.',
  'O.VVVVVVVVVVVSS.',
  'O.yYYYYYYYYYYSS.',
  'O.VVVVVYyVVVVX..',
];
const AN_TORSO_D_A = [
  'O.vVVbBBBBCVVVX.',
  'OvVVXbBBBCXVVVX.',
  'SSVVXVbBBCVVVVX.',
  'SSVXVVbBCVVVVVX.',
  'O.VVVVVbCVVVVXX.',
  'O.VVVVVVVVVVVXX.',
  'O.yYYYYYYYYYYSS.',
  'O.VVVVVYyVVVVSS.',
];
const AN_TORSO_D_B = [
  'O.vVVbBBBBCVVVX.',
  'OvVVXbBBBCXVVVX.',
  'SSVVXVbBBCVVVVX.',
  'SSVXVVbBCVVVVVX.',
  'O.VVVVVbCVVVVSS.',
  'O.VVVVVVVVVVVSS.',
  'O.yYYYYYYYYYYX..',
  'O.VVVVVYyVVVVX..',
];
const AN_LEGS_D = [
  'O.vVVVVVYVVVVX..',
  'O.vVVXVVVVXVVX..',
  'O.XZXXZXXZXXZX..',
  'D...uUU.uUU.....',
];
const AN_LEGS_D_A = [
  'O.vVVVVVYVVVVX..',
  'O.vVVXVVVVXVVX..',
  'O.XZXXZXXZXXZX..',
  'D..uUU..........',
];
const AN_LEGS_D_B = [
  'O.vVVVVVYVVVVX..',
  'O.vVVXVVVVXVVX..',
  'O.XZXXZXXZXXZX..',
  'D........uUU....',
];

const AN_HU = [
  '................',
  '................',
  '.....ssSST......',
  '....sSSSSST.....',
  '...sSSSSSSST....',
  '..BsSSSSSSSTB...',
  '..BSSSSSSSSTC...',
  '..CBbBBbBBbCC...',
  '...CBCBBCBCC....',
  '....TTSSSTT.....',
  '..vVVVVVVVVVX...',
  '.vVVVVVVVVVVVX..',
];
const AN_STAFF_R = [
  '.oO.',
  'O.Do',
  'p..O',
  'P..O',
];
const AN_TORSO_U = [
  '..vVVVVVVVVVVX.O',
  '..vVVVVVVVVVXVvO',
  '..vVVVVVVVVVXVSS',
  '..vVVVVVVVVVVXSS',
  '..SSVVVVVVVVVX.O',
  '..SSVVVVVVVVVX.O',
  '..YYYYYyYYYYYY.O',
  '..XVVVVVVVVVVX.O',
];
const AN_TORSO_U_A = [
  '..vVVVVVVVVVVX.O',
  '..vVVVVVVVVVXVvO',
  '..vVVVVVVVVVXVSS',
  '..vVVVVVVVVVVXSS',
  '..vVVVVVVVVVVX.O',
  '..SSVVVVVVVVVX.O',
  '..SSYYYyYYYYYY.O',
  '..XVVVVVVVVVVX.O',
];
const AN_TORSO_U_B = [
  '..vVVVVVVVVVVX.O',
  '..vVVVVVVVVVXVvO',
  '..vVVVVVVVVVXVSS',
  '..vVVVVVVVVVVXSS',
  '..vVVVVVVVVVVX.O',
  '..vVVVVVVVVVVX.O',
  '..YYYYYyYYYYYY.O',
  '..SSVVVVVVVVVX.O',
];
const AN_LEGS_U = [
  '..vVVVVVVVVVVX.O',
  '..vVVXVVVVXVVX.O',
  '..XZXXZXXZXXZX.O',
  '.....Uuu.Uuu...D',
];
const AN_LEGS_U_A = [
  '..vVVVVVVVVVVX.O',
  '..vVVXVVVVXVVX.O',
  '..XZXXZXXZXXZX.O',
  '....Uuu........D',
];
const AN_LEGS_U_B = [
  '..vVVVVVVVVVVX.O',
  '..vVVXVVVVXVVX.O',
  '..XZXXZXXZXXZX.O',
  '.........Uuu...D',
];

const AN_HL = [
  '................',
  '................',
  '......ssSST.....',
  '....sSSSSSSST...',
  '...sSSSSSSSSST..',
  '...SSSSSSSSSST..',
  '...bbBSSSSBCST..',
  '....b#SSSTBCBT..',
  '..sSSSSSSTCBC...',
  '...bbbSSTCCvVX..',
  '...bBBBBTTvVVVX.',
  '...bBBBBBCvVVVX.',
];
const AN_TORSO_L = [
  '...bBBBCvVVVVX..',
  '...bBBCvVVVVVVX.',
  '..vVbBC#VVVVVVX.',
  'SSvVVV#VVVVVVVX.',
  '..XVV#VVVVVVVX..',
  '...XXVVVVVVVVX..',
  '...yYYYYYYYYYY..',
  '...VVVVVVVVVVX..',
];
const AN_TORSO_L_BACK = [
  '...bBBBCvVVVVX..',
  '...bBBCvVVVVVVX.',
  '..vVbBC#VVVVVVX.',
  'SSvVVVV#VVVVVVX.',
  '..XVVVV#VVVVVX..',
  '...XXVVVVVVVVX..',
  '...yYYYYYYYYYY..',
  '...VVVVVVVVVVX..',
];
const AN_LEGS_L = [
  '...vVVVVVVVVVX..',
  '...vVVXVVVVXVX..',
  '...XZXXZXXZXXX..',
  '....uUU.........',
];
const AN_LEGS_L_A = [
  '...vVVVVVVVVVX..',
  '..vVVXVVVVVXVX..',
  '..XZXXZXXZXXZX..',
  '..uUU.....UU....',
];
const AN_LEGS_L_B = [
  '...vVVVVVVVVVX..',
  '..vVVXVVVVVXVX..',
  '..XZXXZXXZXXZX..',
  '...UU...uUU.....',
];

const AN_STAFF_FULL = (h) => Array.from({ length: h }, () => 'O');

export const anciao = {
  id: 'anciao',
  name: 'Ancião',
  palette: AN_PAL,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: {
      head: C16(12, [[AN_HD, 0, 0], [AN_STAFF_FULL(12), 0, 0], [AN_STAFF_L, 0, 0]]),
      torso: [AN_TORSO_D, AN_TORSO_D_A], torsoB: AN_TORSO_D_B,
      legs: [AN_LEGS_D, AN_LEGS_D_A], legsB: AN_LEGS_D_B,
    },
    up: {
      head: C16(12, [[AN_HU, 0, 0], [AN_STAFF_FULL(12), 15, 0], [AN_STAFF_R, 12, 0]]),
      torso: [AN_TORSO_U, AN_TORSO_U_A], torsoB: AN_TORSO_U_B,
      legs: [AN_LEGS_U, AN_LEGS_U_A], legsB: AN_LEGS_U_B,
    },
    left: {
      head: C16(12, [[AN_HL, 0, 0], [AN_STAFF_FULL(12), 0, 0], [AN_STAFF_L, 0, 0]]),
      torso: [
        C16(8, [[AN_STAFF_FULL(8), 0, 0], [AN_TORSO_L, 0, 0]]),
        C16(8, [[AN_STAFF_FULL(8), 0, 0], [AN_TORSO_L_BACK, 0, 0]]),
        C16(8, [[AN_STAFF_FULL(8), 0, 0], [AN_TORSO_L, 0, 0]]),
      ],
      legs: [
        C16(4, [[AN_LEGS_L, 0, 0], [['O', 'O', 'O', 'D'], 0, 0]]),
        C16(4, [[AN_LEGS_L_A, 0, 0], [['O', 'O', 'O', 'D'], 0, 0]]),
        C16(4, [[AN_LEGS_L_B, 0, 0], [['O', 'O', 'O', 'D'], 0, 0]]),
      ],
    },
  },
};

// ============================================================ ESTALAJADEIRA
// Dona da estalagem. Alta, cabelo ruivo em rabo de cavalo alto, blusa
// branca de mangas arregaçadas, colete escuro amarrado, saia azul-petróleo,
// pano de prato xadrez preso no cinto, botas.
const ES_PAL = {
  '#': '#1a1020',
  // cabelo ruivo
  h: '#ffa070', H: '#e45a30', J: '#a8341e', K: '#6a1e14',
  // pele
  s: '#ffeadc', S: '#f6c6a8', T: '#d0907a', t: '#9c5e54', m: '#e0707a',
  // olhos
  i: '#3e9a62',
  // blusa branca
  w: '#ffffff', c: '#e4e4f0', C: '#aeb0c8',
  // colete escuro
  n: '#8a5e48', N: '#5a3a2c', M: '#34201a',
  // ilhoses
  y: '#ffe08a',
  // cinto
  l: '#b07a48', L: '#7a4e2c',
  // saia azul-petróleo
  a: '#62b2c4', A: '#36809a', Z: '#1e4e62', z: '#123444',
  // pano de prato
  q: '#6a8ae0', Q: '#3e5aa8',
  // botas
  u: '#8a5a3c', U: '#4e2e1e',
};

const ES_HD = [
  '.........hHJ....',
  '......hhHHKHJ...',
  '....hhHHHHHKHJ..',
  '...hHHhHHHHHJHJ.',
  '..hHhHHHHHHHJJHJ',
  '..JHhHHJsSSSJ.HJ',
  '..JJHJSSSSSSJ.HJ',
  '..JS##SSS##SJ.JK',
  '..JSSiSSSiSSJ...',
  '...TSSSSSSST....',
  '....TSSmSST.....',
];
const ES_TORSO_D = [
  '....w#SSS#w.....',
  '..cwwwSSSwwwC...',
  '.cwwNnSSSnNwwC..',
  '.cwCNnyNynNCwC..',
  '.SScNnNyNnNcSS..',
  '.SS.NnyNynN.SS..',
  '.SS.LlLyLlL.SS..',
  '....aAAAAAAqwq..',
];
const ES_TORSO_D_A = [
  '....w#SSS#w.....',
  '..cwwwSSSwwwC...',
  '.cwwNnSSSnNwwC..',
  '.cwCNnyNynNCwC..',
  '.cwcNnNyNnNcSS..',
  '.SS.NnyNynN.SS..',
  '.SS.LlLyLlL.SS..',
  '....aAAAAAAqSS..',
];
const ES_TORSO_D_B = [
  '....w#SSS#w.....',
  '..cwwwSSSwwwC...',
  '.cwwNnSSSnNwwC..',
  '.cwCNnyNynNCwC..',
  '.SScNnNyNnNcwC..',
  '.SS.NnyNynN.SS..',
  '.SS.LlLyLlL.SS..',
  '.SS.aAAAAAAqwq..',
];
const ES_LEGS_D = [
  '...aAAAAAAAqwq..',
  '...aAAZAAAAwqw..',
  '...aAZAAAZAqwq..',
  '..aAAZAAAZAAZ...',
  '..aAZAAAZAAAZ...',
  '..zZZzZZZzZZz...',
  '...uUU...uUU....',
];
const ES_LEGS_D_A = [
  '...aAAAAAAAqwq..',
  '...aAAZAAAAwqw..',
  '...aAZAAAZAqwq..',
  '..aAAZAAAZAAZ...',
  '..aAZAAAZAAAZ...',
  '..zZZzZZZzZZz...',
  '...uUU..........',
];
const ES_LEGS_D_B = [
  '...aAAAAAAAqwq..',
  '...aAAZAAAAwqw..',
  '...aAZAAAZAqwq..',
  '..aAAZAAAZAAZ...',
  '..aAZAAAZAAAZ...',
  '..zZZzZZZzZZz...',
  '.........uUU....',
];

const ES_HU = [
  '.........hHJ....',
  '......hhHHKHJ...',
  '....hhHHHKKHJ...',
  '...hHHhHKhHJKJ..',
  '..hHhHHHKhHJKHJ.',
  '..HhHHHHKhHJKHJ.',
  '..JHHhHHKhHJKJJ.',
  '..JHHHHJKhHJKJJ.',
  '..JJHHHJKhHJKJK.',
  '...KJJJJKhHJKK..',
  '....TSSSKhHJT...',
];
const ES_TORSO_U = [
  '....wSSSKhJKw...',
  '..cwwNNNKhJKwC..',
  '.cwwNNNNNKKNNwC.',
  '.cwCNNNNNNNNNwC.',
  '.SScNNNNNNNNNcSS',
  '.SS.NNNNNNNNN.SS',
  '.SS.LLLLLLLLL.SS',
  '..qwqAAAAAAAA...',
];
const ES_TORSO_U_A = [
  '....wSSSKhJKw...',
  '..cwwNNNKhJKwC..',
  '.cwwNNNNNKKNNwC.',
  '.cwCNNNNNNNNNwC.',
  '.SScNNNNNNNNNcwC',
  '.SS.NNNNNNNNN.SS',
  '.SS.LLLLLLLLL.SS',
  '..qwqAAAAAAAA.SS',
];
const ES_TORSO_U_B = [
  '....wSSSKhJKw...',
  '..cwwNNNKhJKwC..',
  '.cwwNNNNNKKNNwC.',
  '.cwCNNNNNNNNNwC.',
  '.cwcNNNNNNNNNcSS',
  '.SS.NNNNNNNNN.SS',
  '.SS.LLLLLLLLL.SS',
  '.SSqwqAAAAAAA...',
];
const ES_LEGS_U = [
  '..qwqAAAAAAAA...',
  '..wqwAAAAZAAA...',
  '..qwqAZAAAZAa...',
  '..ZAAAZAAAZAAa..',
  '..ZAAZAAAZAAAa..',
  '..zZZzZZZzZZzZ..',
  '...UUu....UUu...',
];
const ES_LEGS_U_A = [
  '..qwqAAAAAAAA...',
  '..wqwAAAAZAAA...',
  '..qwqAZAAAZAa...',
  '..ZAAAZAAAZAAa..',
  '..ZAAZAAAZAAAa..',
  '..zZZzZZZzZZzZ..',
  '...UUu..........',
];
const ES_LEGS_U_B = [
  '..qwqAAAAAAAA...',
  '..wqwAAAAZAAA...',
  '..qwqAZAAAZAa...',
  '..ZAAAZAAAZAAa..',
  '..ZAAZAAAZAAAa..',
  '..zZZzZZZzZZzZ..',
  '..........UUu...',
];

const ES_HL = [
  '..........hHJ...',
  '.......hhHHKHJ..',
  '.....hhHHHHHKHJ.',
  '...hhHHHHHHHJ.HJ',
  '..hHHhHHHHHHJ.HJ',
  '..hHHHJHHHHHJ.JK',
  '..JHJSJHHHHJJ...',
  '..SSSSJHHHHJ....',
  '..S#SSSTHHJJ....',
  '.sSiSSSTJJJ.....',
  '..SmSSTT........',
];
const ES_TORSO_L = [
  '...#SSSS#.......',
  '..nSSwwwwwN.....',
  '..ynNcwwwCN.....',
  '..nNNcwwCNN.....',
  '..yNN#SSNNN.....',
  '..nNN#SSNNN.....',
  '..LlL#SSLLL.....',
  '...aAAAAAAqwq...',
];
const ES_TORSO_L_BACK = [
  '...#SSSS#.......',
  '..nSSwwwwwN.....',
  '..ynNNcwwCN.....',
  '..nNNNcwwCN.....',
  '..yNNNN#SSN.....',
  '..nNNNNN#SS.....',
  '..LlLLLLLSS.....',
  '...aAAAAAAqwq...',
];
const ES_TORSO_L_FWD = [
  '...#SSSS#.......',
  '..nSSwwwwwN.....',
  '..ycwwwCNNN.....',
  '..nNcwwCNNN.....',
  '..y#SSNNNNN.....',
  '..SSNNNNNNN.....',
  '..SSLLLLLLL.....',
  '...aAAAAAAqwq...',
];
const ES_LEGS_L = [
  '...aAAAAAAqwq...',
  '...aAZAAAAwqw...',
  '...aAZAAAZqwq...',
  '..aAZAAAZAAZ....',
  '..aAZAAAZAAAZ...',
  '..zZzZZzZZzZz...',
  '..uUUU..........',
];
const ES_LEGS_L_A = [
  '...aAAAAAAqwq...',
  '...aAZAAAAwqw...',
  '..aAAZAAAZqwq...',
  '.aAAZAAAZAAAZ...',
  '.aAZAAAZAAAAZ...',
  '.zZzZZzZZzZZz...',
  '.uUU......UUU...',
];
const ES_LEGS_L_B = [
  '...aAAAAAAqwq...',
  '...aAZAAAAwqw...',
  '..aAZAAAZAqwq...',
  '.aAZAAAZAAAZ....',
  '.aAZAAAZAAAZZ...',
  '.zZzZZzZZzZzz...',
  '..UUU...uUUU....',
];

export const estalajadeira = {
  id: 'estalajadeira',
  name: 'Estalajadeira',
  palette: ES_PAL,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: { head: ES_HD, torso: [ES_TORSO_D, ES_TORSO_D_A], torsoB: ES_TORSO_D_B, legs: [ES_LEGS_D, ES_LEGS_D_A], legsB: ES_LEGS_D_B },
    up: { head: ES_HU, torso: [ES_TORSO_U, ES_TORSO_U_A], torsoB: ES_TORSO_U_B, legs: [ES_LEGS_U, ES_LEGS_U_A], legsB: ES_LEGS_U_B },
    left: { head: ES_HL, torso: [ES_TORSO_L, ES_TORSO_L_BACK, ES_TORSO_L_FWD], legs: [ES_LEGS_L, ES_LEGS_L_A, ES_LEGS_L_B] },
  },
};

// ============================================================ MINEIRO
// Mineiro (refugiado da caverna de cristal). Gorro de couro duro com uma
// lamparina de vela, rosto sujo de fuligem, bigode cerrado, macacão jeans
// gasto sobre camisa mostarda desbotada, picareta apoiada no ombro, botas.
const MI_PAL = {
  '#': '#1a1020',
  // couro do gorro
  l: '#d49a64', L: '#9a6438', D: '#5e3a20', E: '#3a2414',
  // vela / chama / latão
  '*': '#fffbe0', f: '#ffb040', F: '#f06a20', w: '#f8f0e0', y: '#ffe08a', Y: '#b08a38',
  // cabelo / bigode
  h: '#7a5848', H: '#4a3230', k: '#2e1e1e',
  // pele + fuligem
  s: '#fbd6b6', S: '#e4aa82', T: '#b47a5a', t: '#7e4c3a', x: '#a08884',
  // olhos
  i: '#3a5a8a',
  // camisa mostarda
  r: '#eccb74', R: '#bc903e', Q: '#7a5a26',
  // macacão jeans
  b: '#8ea8cc', B: '#5a7098', N: '#3a4868', n: '#262e48',
  // ferro da picareta / cabo
  g: '#eef2fa', G: '#9aa4bc', j: '#5a6280', o: '#d8a064', O: '#965e34',
  // botas
  u: '#8a6248', U: '#56382a', V: '#30201a',
};

const MI_HD = [
  '.......f........',
  '......fFf.......',
  '.......w........',
  '.....lLyYLD.....',
  '....lLlLLLLD....',
  '...lLlLLLLLLD...',
  '..DDDDDDDDDDDD..',
  '..HhSSSSSSSShH..',
  '..HSS#SSS#SSH...',
  '..TxSiSSSiSxT...',
  '...SHHhHHHHT....',
];
const MI_PICK_L = [ // picareta à esquerda da tela (cabo em x2)
  '.gGG.',
  'gGOGj',
  'G.O.j',
  '..O..',
  '..O..',
  '..O..',
  '..O..',
  '..O..',
];
const MI_TORSO_D = [
  '..O.rR#SS#Rr....',
  '.SSrRbBRRRBbRQ..',
  '.SSRRbBBBBBbRRQ.',
  '..ORRbByyBBbRRQ.',
  '..O.RbBBBBBNRSS.',
  '..D.RbBBBBBNRSS.',
  '....bBBBBBBBN...',
  '....bBBBnBBBN...',
];
const MI_TORSO_D_A = [
  '..O.rR#SS#Rr....',
  '.SSrRbBRRRBbRQ..',
  '.SSRRbBBBBBbRRQ.',
  '..ORRbByyBBbRRQ.',
  '..O.RbBBBBBNRRQ.',
  '..D.RbBBBBBNRSS.',
  '....bBBBBBBBNSS.',
  '....bBBBnBBBN...',
];
const MI_TORSO_D_B = [
  '..O.rR#SS#Rr....',
  '.SSrRbBRRRBbRQ..',
  '.SSRRbBBBBBbRRQ.',
  '..ORRbByyBBbRSS.',
  '..O.RbBBBBBNRSS.',
  '..D.RbBBBBBNR...',
  '....bBBBBBBBN...',
  '....bBBBnBBBN...',
];
const MI_LEGS_D = [
  '....bBBN.bBBN...',
  '....bBBN.bBBN...',
  '....bBBN.bBBN...',
  '....uUUV.uUUV...',
  '...uUUUV.uUUUV..',
];
const MI_LEGS_D_A = [
  '....bBBN.bBBN...',
  '....bBBN.bBBN...',
  '....bBBN.uUUV...',
  '....uUUV.uUUV...',
  '...uUUUV........',
];
const MI_LEGS_D_B = [
  '....bBBN.bBBN...',
  '....bBBN.bBBN...',
  '....uUUV.bBBN...',
  '....uUUV.uUUV...',
  '.........uUUUV..',
];

const MI_HU = [
  '.......f........',
  '......fFf.......',
  '.......Y........',
  '.....lLLLLD.....',
  '....lLlLLLLD....',
  '...lLlLLLLLLD...',
  '..DDDDDDDDDDDD..',
  '..HhHHhHHhHHk...',
  '..hHHhHHhHHkk...',
  '..tkHHHHHHkkt...',
  '...TSSSSSSST....',
];
const MI_TORSO_U = [
  '....rRRRRRRQ.O..',
  '..rRRbBRRBbRQSS.',
  '.rRRRbBRRBbRRSS.',
  '.rRRRbBBBBbRRO..',
  '.SSRbBBBBBBNRO..',
  '.SSRbBBBBBBNRD..',
  '...bBBBBBBBBN...',
  '...bBBBBBBBBN...',
];
const MI_TORSO_U_A = [
  '....rRRRRRRQ.O..',
  '..rRRbBRRBbRQSS.',
  '.rRRRbBRRBbRRSS.',
  '.rRRRbBBBBbRRO..',
  '.SSRbBBBBBBNRO..',
  '.rRRbBBBBBBNRD..',
  '.SSbBBBBBBBBN...',
  '...bBBBBBBBBN...',
];
const MI_TORSO_U_B = [
  '....rRRRRRRQ.O..',
  '..rRRbBRRBbRQSS.',
  '.rRRRbBRRBbRRSS.',
  '.SSRRbBBBBbRRO..',
  '.SSRbBBBBBBNRO..',
  '...RbBBBBBBNRD..',
  '...bBBBBBBBBN...',
  '...bBBBBBBBBN...',
];
const MI_LEGS_U = [
  '....NBBb.NBBb...',
  '....NBBb.NBBb...',
  '....NBBb.NBBb...',
  '....VUUu.VUUu...',
  '...VUUUu.VUUUu..',
];
const MI_LEGS_U_A = [
  '....NBBb.NBBb...',
  '....NBBb.NBBb...',
  '....NBBb.VUUu...',
  '....VUUu.VUUu...',
  '...VUUUu........',
];
const MI_LEGS_U_B = [
  '....NBBb.NBBb...',
  '....NBBb.NBBb...',
  '....VUUu.NBBb...',
  '....VUUu.VUUu...',
  '.........VUUUu..',
];

const MI_HL = [
  '..f.............',
  '.fFf............',
  '..w.............',
  '.YyylLLLD.......',
  '..YlLlLLLLLD....',
  '...lLLLLLLLLD...',
  'DDDDDDDDDDDDDE..',
  '..sSSSShHHHHk...',
  '..S#SSTsHHHk....',
  'sSSiSSTTHHk.....',
  '.hHHxSTT........',
];
const MI_PICK_BACK = [ // de lado: ferro da picareta atrás das costas
  '.g',
  'gG',
  'Gj',
];
const MI_TORSO_L = [
  '...#SSS#Rr...Gj.',
  '.oSSoooooooooGj.',
  '.OSSOOOOOOOOOGj.',
  '..rRRbBRRRRN..j.',
  '..QRRbBBBBBN....',
  '..bBByYBBBBN....',
  '..bBBBBBBBBN....',
  '..bBBBBBBBN.....',
];
const MI_LEGS_L = [
  '..bBBBBBN.......',
  '..bBBBBN........',
  '...bBBBN........',
  '..uUUUUV........',
  '.uUUUUUV........',
];
const MI_LEGS_L_A = [
  '..bBBBBBBN......',
  '.bBBBNbBBBN.....',
  'bBBN...bBBN.....',
  'uUUV...NUUUV....',
  'uUUV...UUUUV....',
];
const MI_LEGS_L_B = [
  '..BBBbBBBN......',
  '.NBBN.bBBBN.....',
  'NBBN...bBBBN....',
  'UUUV...uUUUV....',
  'UUUV...uUUUUV...',
];

export const mineiro = {
  id: 'mineiro',
  name: 'Mineiro',
  palette: MI_PAL,
  ink: '#120a14',
  scale: 1.2,
  localW: 16,
  dir: {
    down: {
      head: C16(11, [[MI_HD, 0, 0], [MI_PICK_L, 0, 3]]),
      torso: [MI_TORSO_D, MI_TORSO_D_A], torsoB: MI_TORSO_D_B,
      legs: [MI_LEGS_D, MI_LEGS_D_A], legsB: MI_LEGS_D_B,
    },
    up: {
      head: C16(11, [[MI_HU, 0, 0], [MI_PICK_L, 11, 3]]),
      torso: [MI_TORSO_U, MI_TORSO_U_A], torsoB: MI_TORSO_U_B,
      legs: [MI_LEGS_U, MI_LEGS_U_A], legsB: MI_LEGS_U_B,
    },
    left: {
      head: C16(11, [[MI_PICK_BACK, 13, 8], [MI_HL, 0, 0]]),
      torso: [MI_TORSO_L, MI_TORSO_L, MI_TORSO_L],
      legs: [MI_LEGS_L, MI_LEGS_L_A, MI_LEGS_L_B],
    },
  },
};
