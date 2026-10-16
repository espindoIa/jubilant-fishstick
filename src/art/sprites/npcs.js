// NPCs de campo de Vila Maré e do Império de Ferro.
// Mesmo formato dos heróis (ver lio.js): linhas ASCII sem contorno — o
// contorno "sel-out" é gerado automaticamente por charkit.sprite().
// Personagens assimétricos (bengala, alabarda, picareta...) definem
// `torsoB`/`legsB` explicitamente para que o passo B não espelhe o objeto.

// ============================================================ ODESSA
// Avó de Lio, faroleira (70 e poucos). Coque branco com grampo de madeira,
// óculos redondos, xale verde-escuro de tricô sobre vestido marrom longo,
// bengala de madeira, levemente curvada.
const ODESSA_PALETTE = {
  // cabelo branco
  h: '#ffffff', H: '#e6e4f0', J: '#b2aecb', K: '#7c789e',
  // madeira (grampo, bengala)
  o: '#eab878', O: '#a86e3c', D: '#5e3720',
  // pele
  s: '#ffe8d6', S: '#f4c8a8', T: '#cf947a', t: '#9c6658', m: '#ec9890',
  // olhos / óculos
  e: '#3a2630', G: '#7e6260', g: '#f2fbff',
  // xale verde-escuro (k = ponto de tricô)
  a: '#72a26c', A: '#4a7852', Z: '#2e4e3a', k: '#5e8e62',
  // vestido marrom
  l: '#c8987a', n: '#a8785e', N: '#7c5446', M: '#563830',
  // gola / broche
  w: '#fffaf0', y: '#ffe08a', Y: '#c08a30',
  // sapatos
  u: '#6a4a48', U: '#3e2a2c',
};

const OD_D_HEAD = [
  '........hHHJ.o......',
  '.......hHhHHJO......',
  '......oOJHHJJ.......',
  '.....hhHHHHHHHJ.....',
  '...hHHhhHHHHHHHHJ...',
  '..hHhHHHHHHHHHHHHJ..',
  '..HhHHJHHHHHHJHHHJ..',
  '..JHHJSSSSSSSSJHHJ..',
  '..JHJSSSSSSSSSSJHJ..',
  '..JHSSGGSSSSGGSSHJ..',
  '..JJSGgeGSSGegGSJJ..',
  '...JSSGGSSSSGGSSJ...',
  '...JmSSSSTTSSSSmJ...',
  '....aTTSSSSSSTTZ....',
];
const OD_D_TORSO = [
  '...aAAAAAwwAAAAAZ...',
  '..aAAkAAAyYAAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.aAAkAAkAAAAkAAkAAZ.',
  'oSZAZAkAAAAAAkAZAZS.',
  'O..lnnnZAkkAZnnNN...',
  'O..lnnnnZAAZnnNNM...',
];
const OD_D_TORSO_A = [ // bengala erguida, braço livre à frente
  '...aAAAAAwwAAAAAZ...',
  '..aAAkAAAyYAAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  'oSAAkAAkAAAAkAAkAAZ.',
  'O.ZAZAkAAAAAAkAZAZN.',
  'O..lnnnZAkkAZnnNNNS.',
  'O..lnnnnZAAZnnNNMSS.',
];
const OD_D_TORSO_B = [ // bengala apoiada, braço livre atrás
  '...aAAAAAwwAAAAAZ...',
  '..aAAkAAAyYAAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.aAAkAAkAAAAkAAkASS.',
  'oSZAZAkAAAAAAkAZAZ..',
  'O..lnnnZAkkAZnnNN...',
  'O..lnnnnZAAZnnNNM...',
];
const OD_D_LEGS = [
  'O..lnnnnnNnnnnNNM...',
  'O..lnnnnnNnnnnNNM...',
  'O.lnnnnnNnnnnnNNNM..',
  'O.NNNNNNNNNNNNNNMM..',
  'D....uUU..uUU.......',
];
const OD_D_LEGS_A = [
  'O..lnnnnnNnnnnNNM...',
  'O..lnnnnnNnnnnNNM...',
  'O.lnnnnnNnnnnnNNNM..',
  '.NNNNNNNNNNNNNNMM...',
  '..uUU...............',
];
const OD_D_LEGS_B = [
  'O..lnnnnnNnnnnNNM...',
  'O..lnnnnnNnnnnNNM...',
  'O.lnnnnnNnnnnnNNNM..',
  'O.NNNNNNNNNNNNNNMMM.',
  'D............uUU....',
];

const OD_U_HEAD = [
  '........hHHJ.o......',
  '.......hHhHHJO......',
  '......oOJHHJJ.......',
  '.....hhHHHHHHHJ.....',
  '...hHHhhHHHHHHHHJ...',
  '..hHhHHHHHHHHHHHHJ..',
  '..HhHHHHHHHHHHHHHJ..',
  '..HHhHHHHHHHHHHHHJ..',
  '..JHHHHHHHHHHHHHJJ..',
  '..JHHHHHJHHJHHHHJJ..',
  '..JJHHHJHHHHJHHJJJ..',
  '...JJHJHHJJHHJHJJ...',
  '...JtJJHJJJJHJJtJ...',
  '....aTTSSSSSSTTZ....',
];
const OD_U_TORSO = [
  '...aAAAAAAAAAAAAZ...',
  '..aAAkAAkAAkAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.SZAZAkAAAAAAkAZAZSo',
  '...lnnnZAkkAZnnNN..O',
  '...lnnnnZAAZnnNNM..O',
];
const OD_U_TORSO_A = [
  '...aAAAAAAAAAAAAZ...',
  '..aAAkAAkAAkAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.aAAkAAkAAAAkAAkAASo',
  '.NZAZAkAAAAAAkAZAZ.O',
  '.S.lnnnZAkkAZnnNN..O',
  '.SSlnnnnZAAZnnNNM..O',
];
const OD_U_TORSO_B = [
  '...aAAAAAAAAAAAAZ...',
  '..aAAkAAkAAkAAkAAZ..',
  '..aAkAAkAAAAkAAkAZ..',
  '.aAAkAAkAAAAkAAkAAZ.',
  '.SSAkAAkAAAAkAAkAAZ.',
  '..ZAZAkAAAAAAkAZAZSo',
  '...lnnnZAkkAZnnNN..O',
  '...lnnnnZAAZnnNNM..O',
];
const OD_U_LEGS = [
  '...lnnnnnNnnnnNNM..O',
  '...lnnnnnNnnnnNNM..O',
  '..lnnnnnNnnnnnNNNM.O',
  '..NNNNNNNNNNNNNNMM.O',
  '.......uUU..uUU....D',
];
const OD_U_LEGS_A = [
  '...lnnnnnNnnnnNNM...',
  '...lnnnnnNnnnnNNM...',
  '..lnnnnnNnnnnnNNNM..',
  '.NNNNNNNNNNNNNNMM...',
  '..uUU...............',
];
const OD_U_LEGS_B = [
  '...lnnnnnNnnnnNNM..O',
  '...lnnnnnNnnnnNNM..O',
  '..lnnnnnNnnnnnNNNM.O',
  '..NNNNNNNNNNNNNNMMMO',
  '.............uUU...D',
];

const OD_L_HEAD = [
  '..........hHHJ.o....',
  '.........hHhHHJO....',
  '.......oOJHHHJJ.....',
  '....hhHHHHHHHHJ.....',
  '...hHhhHHHHHHHHJ....',
  '..hHhHHHHHHJHHHHJ...',
  '..HhHHJJHHHHJHHHJ...',
  '.JHHJSSSSJHHHJHHJ...',
  '.JHSSSSSSSJHHHHJJ...',
  '.SSGGSSSSSJHHHHJ....',
  'SSGgeGSStSSJHHJJ....',
  'SSSGGSSSSSJJJJaAZ...',
  '.TmSSSSSSTaAAAAAAZ..',
  '..TTSSSSTaAkAAkAAZ..',
];
const OD_L_TORSO = [
  '....aAAwAkAAkAAAAZ..',
  '...aAyAAkAAkAAkAAZ..',
  '...aAkAAkAAkAAkAAZ..',
  '...aAkAAkAAkAAkAZ...',
  '...aAkAAkAAkAAkAZ...',
  '..oSZAZAkAkAZAZAZ...',
  '..O.lnnnnnnNnNNM....',
  '..O.lnnnnnnNnNNM....',
];
const OD_L_TORSO_BACK = [ // bengala junto ao corpo
  '....aAAwAkAAkAAAAZ..',
  '...aAyAAkAAkAAkAAZ..',
  '...aAkAAkAAkAAkAAZ..',
  '...aAkAAkAAkAAkAZ...',
  '...aAkAAkAAkAAkAZ...',
  '...oSAZAkAkAZAZAZ...',
  '...OlnnnnnnNnNNM....',
  '...OlnnnnnnNnNNM....',
];
const OD_L_TORSO_FWD = [ // bengala lançada à frente
  '....aAAwAkAAkAAAAZ..',
  '...aAyAAkAAkAAkAAZ..',
  '...aAkAAkAAkAAkAAZ..',
  '..o.aAkAAkAAkAAkAZ..',
  '.SSSAkAAkAAkAAkAZ...',
  '.O.ZAZAZAkAkAZAZ....',
  'O...lnnnnnnNnNNM....',
  'O...lnnnnnnNnNNM....',
];
const OD_L_LEGS = [
  '..O.lnnnnnnNnNNM....',
  '..O.lnnnnnnNnNNM....',
  '..OlnnnnnnnNnNNNM...',
  '..ONNNNNNNNNNNNMM...',
  '..DuUU.....UU.......',
];
const OD_L_LEGS_A = [ // perna próxima à frente
  '...OlnnnnnnNnNNM....',
  '...OlnnnnnnNnNNM....',
  '..lOnnnnnnnNnNNNM...',
  '.NNONNNNNNNNNNNM....',
  'uUUD.......UU.......',
];
const OD_L_LEGS_B = [ // perna distante à frente
  '....lnnnnnnNnNNM....',
  '....lnnnnnnNnNNM....',
  '...lnnnnnnnNnNNNM...',
  '..NNNNNNNNNNNNNNMM..',
  '...UU......uUU......',
];

export const odessa = {
  id: 'odessa',
  name: 'Odessa',
  palette: ODESSA_PALETTE,
  localW: 20,
  dir: {
    down: { head: OD_D_HEAD, torso: [OD_D_TORSO, OD_D_TORSO_A], torsoB: OD_D_TORSO_B, legs: [OD_D_LEGS, OD_D_LEGS_A], legsB: OD_D_LEGS_B },
    up: { head: OD_U_HEAD, torso: [OD_U_TORSO, OD_U_TORSO_A], torsoB: OD_U_TORSO_B, legs: [OD_U_LEGS, OD_U_LEGS_A], legsB: OD_U_LEGS_B },
    left: { head: OD_L_HEAD, torso: [OD_L_TORSO, OD_L_TORSO_BACK, OD_L_TORSO_FWD], legs: [OD_L_LEGS, OD_L_LEGS_A, OD_L_LEGS_B] },
  },
};

// ============================================================ VAREK
// Capitão imperial (antagonista). Alto, cabelo branco-cinza penteado para
// trás, sobretudo militar preto e carmesim com dragonas douradas, sabre
// na cintura (mão apoiada no punho), botas pretas, luvas brancas.
const VAREK_PALETTE = {
  // cabelo branco-acinzentado
  h: '#f4f2fa', H: '#cdc8d8', J: '#948ea8', K: '#5c5672',
  // pele pálida
  s: '#fdeee6', S: '#eec8b6', T: '#c4948a', t: '#8c5c60',
  // olhos
  e: '#1c1020', i: '#e0404c', W: '#ffffff',
  // sobretudo preto
  b: '#5e5878', B: '#38344e', N: '#232036', X: '#141222',
  // carmesim
  r: '#ff6878', R: '#c8283c', Q: '#781428',
  // ouro
  y: '#ffe68a', Y: '#d4a040', D: '#8a6020',
  // aço do sabre
  g: '#eef3ff', G: '#a8b4cc', F: '#5c6a8c',
  // luvas
  w: '#ffffff', c: '#c8c8dc',
  // botas
  u: '#77728e', U: '#3a3648', V: '#1a1824',
};

const VA_D_HEAD = [
  '.......hhHHHJ.......',
  '.....hhHhHHHHHJ.....',
  '....hHhHHHHHHHHJ....',
  '...hHhHHHHHHHHHHJ...',
  '...HhHHJHHHHJHHHJ...',
  '...JHhJHHHHHHJHHJ...',
  '...JHJSSSHHSSSJHJ...',
  '...JJSSSSSSSSSSJJ...',
  '...JSKKSSSSSSKKSJ...',
  '..tSSSeeSSSSeeSSSt..',
  '..tSSSWiSSSSiWSSSt..',
  '...SSSSSSTTSSSSSS...',
  '....TSSSSttSSSST....',
  '.....TTSSSSSSTT.....',
];
const VA_D_TORSO = [
  '.....BBrQTTQrBB.....',
  '..yyYBBBrRRrBBBYyy..',
  '..YDYbBBBrrBBBBYDY..',
  '..BbbBByBBBByBBBNN..',
  '..BbbBBBBBBBBBBBNN..',
  '..BbbBByBBBBByBBNN..',
  '..BbbBBBBBBBBBBNNN..',
  '..wQRRRRRRyYRRRRwyy.',
  '..cBbBBBBQrBBBBNcYG.',
  '...BbBBBBQrBBBBBNGF.',
];
const VA_D_TORSO_A = [ // braço livre recua
  '.....BBrQTTQrBB.....',
  '..yyYBBBrRRrBBBYyy..',
  '..YDYbBBBrrBBBBYDY..',
  '..BbbBByBBBByBBBNN..',
  '..BbbBBBBBBBBBBBNN..',
  '..BbbBByBBBBByBBNN..',
  '..wcbBBBBBBBBBBNNN..',
  '..cQRRRRRRyYRRRRwyy.',
  '...BbBBBBQrBBBBNcYG.',
  '...BbBBBBQrBBBBBNGF.',
];
const VA_D_TORSO_B = [ // braço livre avança
  '.....BBrQTTQrBB.....',
  '..yyYBBBrRRrBBBYyy..',
  '..YDYbBBBrrBBBBYDY..',
  '..BbbBByBBBByBBBNN..',
  '..BbbBBBBBBBBBBBNN..',
  '..BbbBByBBBBByBBNN..',
  '..BbbBBBBBBBBBBNNN..',
  '..bQRRRRRRyYRRRRwyy.',
  '..BBbBBBBQrBBBBNcYG.',
  '..wcbBBBBQrBBBBBNGF.',
];
const VA_D_LEGS = [
  '...BbBBBBQrBBBBBN.GF',
  '..QRRRRRRQrRRRRRRQ.Y',
  '......uUU..uUU......',
  '......uUU..uUU......',
  '.....uUUU..uUUU.....',
  '.....UUUV..UUUV.....',
];
const VA_D_LEGS_A = [
  '...BbBBBBQrBBBBBN.GF',
  '.QRRRRRRRQrRRRRRQ..Y',
  '......uUU..uUU......',
  '.....uUUUV.uUU......',
  '.....UUUV..uUUU.....',
  '...........UUUV.....',
];
const VA_D_LEGS_B = [
  '...BbBBBBQrBBBBBN.GF',
  '...QRRRRRQrRRRRRRRQY',
  '......uUU..uUU......',
  '......uUU.uUUUV.....',
  '.....uUUU..UUUV.....',
  '.....UUUV...........',
];

const VA_U_HEAD = [
  '.......hhHHHJ.......',
  '.....hhHhHHHHHJ.....',
  '....hHhHHHHHHHHJ....',
  '...hHhHHHHHHHHHHJ...',
  '...HhHHHHHHHHHHHJ...',
  '...HhHHHHHHHHHHHJ...',
  '...JHHHHHHHHHHHJJ...',
  '...JHHHHHHHHHHHJJ...',
  '...JJHHHHHHHHHJJJ...',
  '..tJJHJHHHHJHHJJJt..',
  '..tJJJHJHHJHJJJJJt..',
  '...JKJJJJJJJJJJKJ...',
  '....TKKJJJJJJKKT....',
  '.....TTSSSSSSTT.....',
];
const VA_U_TORSO = [
  '.....BBBBBBBBBB.....',
  '..yyYBBBBBBBBBBYyy..',
  '..YDYbBBBByBBBBYDY..',
  '..BbbBBByDYyBBBBNN..',
  '..BbbBBBBYBBBBBBNN..',
  '..BbbBBBBNNBBBBBNN..',
  '..BbbBBBBNNBBBBBNN..',
  '.YywRRRRRyYRRRRRRQ..',
  '..FcBbBBBBNBBBBBcw..',
  '..GNBbBBBBNBBBBBN...',
];
const VA_U_TORSO_A = [
  '.....BBBBBBBBBB.....',
  '..yyYBBBBBBBBBBYyy..',
  '..YDYbBBBByBBBBYDY..',
  '..BbbBBByDYyBBBBNN..',
  '..BbbBBBBYBBBBBBNN..',
  '..BbbBBBBNNBBBBBNN..',
  '..BbbBBBBNNBBBBBcw..',
  '.YywRRRRRyYRRRRRRc..',
  '..FcBbBBBBNBBBBBN...',
  '..GNBbBBBBNBBBBBN...',
];
const VA_U_TORSO_B = [
  '.....BBBBBBBBBB.....',
  '..yyYBBBBBBBBBBYyy..',
  '..YDYbBBBByBBBBYDY..',
  '..BbbBBByDYyBBBBNN..',
  '..BbbBBBBYBBBBBBNN..',
  '..BbbBBBBNNBBBBBNN..',
  '..BbbBBBBNNBBBBBNN..',
  '.YywRRRRRyYRRRRRRN..',
  '..FcBbBBBBNBBBBBNN..',
  '..GNBbBBBBNBBBBBcw..',
];
const VA_U_LEGS = [
  '..GNBbBBBQrQBBBBN...',
  '.YQRRRRRRQ.QRRRRRQ..',
  '......UUU..UUU......',
  '......UUU..UUU......',
  '.....uUUU..uUUU.....',
  '.....UUUV..UUUV.....',
];
const VA_U_LEGS_A = [
  '..GNBbBBBQrQBBBBN...',
  '.YQRRRRRRQ.QRRRRRRQ.',
  '......UUU..UUU......',
  '.....uUUUV.UUU......',
  '.....UUUV..uUUU.....',
  '...........UUUV.....',
];
const VA_U_LEGS_B = [
  '..GNBbBBBQrQBBBBN...',
  '.YQRRRRRQ.QRRRRRQ...',
  '......UUU..UUU......',
  '......UUU.uUUUV.....',
  '.....uUUU..UUUV.....',
  '.....UUUV...........',
];

const VA_L_HEAD = [
  '.......hhHHHJ.......',
  '.....hhHhHHHHHJ.....',
  '....hHHHHHHHHHHJ....',
  '...hHhJJJHHHHHHHJ...',
  '...SHHHHHJJJHHHHJ...',
  '..SSShHHHHHHJJJHJJ..',
  '..SSSSSJJHHHHHHHJJ..',
  '..SSSSSSSJHHHHHHJJ..',
  '..SKKSSSSTtJHHHHJ...',
  '..SeeSSSSTtJHHHJJ...',
  '.SSWiSSSSSTJHJJK....',
  'SSSSSSSSSSJJJK......',
  '..tSSSSSSJ..........',
  '...TSSSTT...........',
];
const VA_L_TORSO = [
  '.....BrQQBB.........',
  '....yyYBBBBN........',
  '...QYDYBbBBBN.......',
  '...QRBbbBBBBNN......',
  '...QRBbbBBBBNN......',
  '...QRBbBBBBBNNN.....',
  '...QRBbwcBBBNNN.....',
  '...QRRyYwRRRQNN.....',
  '...BRBGFcBBBNNNN....',
  '...BRBBBGBBBBNNNN...',
];
const VA_L_TORSO_BACK = [
  '.....BrQQBB.........',
  '....yyYBBBBN........',
  '...QYDYBbBBBN.......',
  '...QRBbbBBBBNN......',
  '...QRBbbBBBBNN......',
  '...QRBbBBBBBNNN.....',
  '...QRBbwcBBBNNN.....',
  '...QRRyYwRRRQNNN....',
  '...BRBGFcBBBNNNNN...',
  '...BRBBBGBBBBNNNNN..',
];
const VA_L_TORSO_FWD = [
  '.....BrQQBB.........',
  '....yyYBBBBN........',
  '...QYDYBbBBBN.......',
  '...QRBbbBBBBNN......',
  '...QRBbbBBBBNN......',
  '...QRBbBBBBBNN......',
  '...QRBbwcBBBNN......',
  '...QRRyYwRRRQNN.....',
  '...BRBGFcBBBNNN.....',
  '...BRBBBGBBBBNN.....',
];
const VA_L_LEGS = [
  '...BRuUUBGBBBNNN....',
  '...BRuUUBBGBBNN.....',
  '....RuUU...G........',
  '.....uUU....Y.......',
  '....uUUU............',
  '...uUUUV............',
];
const VA_L_LEGS_A = [
  '...BRuUUBGBBBNNNN...',
  '..BRuUUUUBBGBBNNN...',
  '..RuUU..uUU.G.......',
  '.uUU....uUU..Y......',
  'uUUV.....uUU........',
  'UUV......UUUV.......',
];
const VA_L_LEGS_B = [
  '...BRuUUBGBBBNN.....',
  '...BRUUUuBGBBNN.....',
  '...UUU..uUU.G.......',
  '..UUU....uUU.Y......',
  '.UUV......uUU.......',
  'UUV.......uUUUV.....',
];

export const varek = {
  id: 'varek',
  name: 'Varek',
  palette: VAREK_PALETTE,
  localW: 20,
  dir: {
    down: { head: VA_D_HEAD, torso: [VA_D_TORSO, VA_D_TORSO_A], torsoB: VA_D_TORSO_B, legs: [VA_D_LEGS, VA_D_LEGS_A], legsB: VA_D_LEGS_B },
    up: { head: VA_U_HEAD, torso: [VA_U_TORSO, VA_U_TORSO_A], torsoB: VA_U_TORSO_B, legs: [VA_U_LEGS, VA_U_LEGS_A], legsB: VA_U_LEGS_B },
    left: { head: VA_L_HEAD, torso: [VA_L_TORSO, VA_L_TORSO_BACK, VA_L_TORSO_FWD], legs: [VA_L_LEGS, VA_L_LEGS_A, VA_L_LEGS_B] },
  },
};

// ============================================================ SOLDADO
// Soldado imperial. Elmo de aço com fenda de visor escura e penacho
// vermelho, peitoral de aço sobre farda carmesim, emblema de engrenagem
// dourada, alabarda em pé na mão direita.
const SOLDADO_PALETTE = {
  // aço
  g: '#eef3ff', G: '#a8b4cc', F: '#6c7896', E: '#3e4662', V: '#14121c',
  // carmesim (farda, penacho)
  r: '#ff6878', R: '#c8283c', Q: '#781428',
  // ouro
  y: '#ffe68a', Y: '#d4a040', D: '#8a6020',
  // madeira da alabarda
  o: '#c89058', O: '#8a5a30', P: '#553418',
  // luvas de couro
  l: '#a87048', L: '#6a4028',
  // botas
  u: '#5a5468', U: '#34303e', X: '#1c1a24',
};

const SO_D_HEAD = [
  '...g.......rr...........',
  '..gG......rRRQ..........',
  '.gGGF.....rRRQ..........',
  'gGFGF....gGRRGF.........',
  'gGFO...gGgGRRGGGF.......',
  '.gFO..gGgGGRQGGGGF......',
  '..FO..GgGGGGGGGGGF......',
  '...O..GgGGGGGGGGGF......',
  '...O..GGGGGGGGGGGF......',
  '...O..FVVVVVVVVVVF......',
  '...O..GGGGGFFGGGGF......',
  '...O..FGGGFGGFGGFF......',
  '...O...FGGGGGGGGF.......',
  '...O....FFGGGGFF........',
];
const SO_D_TORSO = [
  '...O..gGGFRRRRFGGF......',
  '...O.gGgGGgGGGGgGGGF....',
  '...O.GGGFgGGGGGGFGGF....',
  '...O.RRRgGGyyGGFRRQ.....',
  '...O.RRRGGyEEyGFRRQ.....',
  '..lLlRRQFGGyyGGFRRQ.....',
  '..lLlRQEFGGGGGGFEQRl....',
  '...O..RRRRRYyRRRRQll....',
  '...O..RRQRRRRRRQRRQ.....',
];
const SO_D_TORSO_A = [ // braço livre à frente
  '...O..gGGFRRRRFGGF......',
  '...O.gGgGGgGGGGgGGGF....',
  '...O.GGGFgGGGGGGFGGF....',
  '...O.RRRgGGyyGGFRRQ.....',
  '...O.RRRGGyEEyGFRRQ.....',
  '..lLlRRQFGGyyGGFRRQ.....',
  '..lLlRQEFGGGGGGFEQRQ....',
  '...O..RRRRRYyRRRRQRQ....',
  '...O..RRQRRRRRRQRRQll...',
];
const SO_D_TORSO_B = [ // braço livre atrás
  '...O..gGGFRRRRFGGF......',
  '...O.gGgGGgGGGGgGGGF....',
  '...O.GGGFgGGGGGGFGGF....',
  '...O.RRRgGGyyGGFRRQ.....',
  '...O.RRRGGyEEyGFRRQ.....',
  '..lLlRRQFGGyyGGFRRl.....',
  '..lLlRQEFGGGGGGFEll.....',
  '...O..RRRRRYyRRRRQ......',
  '...O..RRQRRRRRRQRRQ.....',
];
const SO_D_LEGS = [
  '...O...uUUU..uUUU.......',
  '...O...GGFF..GGFF.......',
  '...P...uUUU..uUUU.......',
  '......uUUUX..uUUUX......',
  '......UUUUX..UUUUX......',
];
const SO_D_LEGS_A = [
  '...O...uUUU..uUUU.......',
  '...O...GGFF..GGFF.......',
  '...P..uUUUX..uUUU.......',
  '......UUUUX..uUUUX......',
  '.............UUUUX......',
];
const SO_D_LEGS_B = [
  '...O...uUUU..uUUU.......',
  '...O...GGFF..GGFF.......',
  '...P...uUUU.uUUUX.......',
  '......uUUUX.UUUUX.......',
  '......UUUUX.............',
];

const SO_U_HEAD = [
  '...........rr.......g...',
  '..........rRRQ......Gg..',
  '..........rRRQ.....FGGg.',
  '.........gGRRGF....FGFGg',
  '.......gGgGRQGGGF...OFGg',
  '......gGgGGRQGGGGF..OFg.',
  '......GgGGGRQGGGGF..OF..',
  '......GgGGGRQGGGGF..O...',
  '......GgGGGRQGGGFF..O...',
  '......GGGGGQQGGGFF..O...',
  '......FGGGGGGGGGFF..O...',
  '......FFGGGGGGGGFF..O...',
  '.......FFGGGGGGFF...O...',
  '........FFFFFFFF....O...',
];
const SO_U_TORSO = [
  '......gGGFRRRRFGGF..O...',
  '....gGGGGFRRRRFGGgGgO...',
  '....FGGFgGGGGGGFGFGGO...',
  '.....QRRFgGGGGGGFRRRO...',
  '.....QRRFGGGGGGGFRRRO...',
  '.....QRRFGGGGGGGFQRRlLl.',
  '....lRQEFGGGGGGFEQRRlLl.',
  '....llQRRRRRRRRRRR..O...',
  '.....QRRQRRRRRRQRR..O...',
];
const SO_U_TORSO_A = [
  '......gGGFRRRRFGGF..O...',
  '....gGGGGFRRRRFGGgGgO...',
  '....FGGFgGGGGGGFGFGGO...',
  '.....QRRFgGGGGGGFRRRO...',
  '.....QRRFGGGGGGGFRRRO...',
  '.....lRRFGGGGGGGFQRRlLl.',
  '....llQEFGGGGGGFEQRRlLl.',
  '......QRRRRRRRRRRR..O...',
  '.....QRRQRRRRRRQRR..O...',
];
const SO_U_TORSO_B = [
  '......gGGFRRRRFGGF..O...',
  '....gGGGGFRRRRFGGgGgO...',
  '....FGGFgGGGGGGFGFGGO...',
  '.....QRRFgGGGGGGFRRRO...',
  '.....QRRFGGGGGGGFRRRO...',
  '.....QRRFGGGGGGGFQRRlLl.',
  '....QRQEFGGGGGGFEQRRlLl.',
  '....QRQRRRRRRRRRRR..O...',
  '....llRRQRRRRRRQRR..O...',
];
const SO_U_LEGS = [
  '.......uUUU..uUUU...O...',
  '.......FFGG..FFGG...O...',
  '.......uUUU..uUUU...P...',
  '......uUUUX..uUUUX......',
  '......UUUUX..UUUUX......',
];
const SO_U_LEGS_A = [
  '.......uUUU..uUUU...O...',
  '.......FFGG..FFGG...O...',
  '......uUUUX..uUUU...P...',
  '......UUUUX..uUUUX......',
  '.............UUUUX......',
];
const SO_U_LEGS_B = [
  '.......uUUU..uUUU...O...',
  '.......FFGG..FFGG...O...',
  '.......uUUU.uUUUX...P...',
  '......uUUUX.UUUUX.......',
  '......UUUUX.............',
];

const SO_L_HEAD = [
  '...g....................',
  '..gG.........rrRR.......',
  '.gGGF.......rRRRRQQ.....',
  'gGFGF....gGGGGGRRQQQ....',
  'gGFO....gGgGGGGGGRQQQ...',
  '.gFO...gGgGGGGGGGGFRQQ..',
  '..FO..gGgGGGGGGGGGGFRQ..',
  '...O..GgGGGGGGGGGGGGFQ..',
  '...O..GGGGGGGGGGGGGGF...',
  '...O..VVVVVVVGGGGGGGF...',
  '...O..GGGGGFGGGGGGGFF...',
  '...O..FGGGFGGGGGGGFF....',
  '...O...FGGGGGGGGFFE.....',
  '...O.....FFGGGGFE.......',
];
const SO_L_TORSO = [
  '...O......FRRRRRF.......',
  '...O.....gGgGGGGGF......',
  '...O....gGGGGgGGGGF.....',
  '...O...FgGyyGGGGGGRR....',
  '...O...FGyEEyGGGGGRRQ...',
  '..lLlRRRRGyyGGGGGFRRQ...',
  '..lLlQRRFGGGGGGGFERRQ...',
  '...O...RRRRYyRRRRRRQ....',
  '...O...RRQRRRRRQRRRQ....',
];
const SO_L_TORSO_BACK = [
  '...O......FRRRRRF.......',
  '...O.....gGgGGGGGF......',
  '...O....gGGGGgGGGGF.....',
  '...O...FgGyyGGGGGGRR....',
  '...O...FGyEEyGGGGGRRQ...',
  '..lLlRRRRGyyGGGGGFRRQ...',
  '..lLlQRRFGGGGGGGFERRQQ..',
  '...O...RRRRYyRRRRRRQRQ..',
  '...O...RRQRRRRRQRRRQ.lL.',
];
const SO_L_TORSO_FWD = [
  '...O......FRRRRRF.......',
  '...O.....gGgGGGGGF......',
  '...O....gGGGGgGGGGF.....',
  '...O...FgGyyGGGGGGRR....',
  '...O...FGyEEyGGGGGRRQ...',
  '..lLlRRRRGyyGGGGGFRRQ...',
  '..lLlQRRFGGGGGGGFERRQ...',
  '...O...RRRRYyRRRRRRQ....',
  '...O...RRQRRRRRQRRRQ....',
];
const SO_L_LEGS = [
  '...O.....uUUUU..........',
  '...O.....GGFF...........',
  '...P.....uUUU...........',
  '........uUUUX...........',
  '.......uUUUUX...........',
];
const SO_L_LEGS_A = [ // perna próxima à frente
  '...O....uUUUUUU.........',
  '...O...GGFF..GGF........',
  '...P..uUUU....uUU.......',
  '.....uUUUX....uUUUX.....',
  '....uUUUUX....UUUUX.....',
];
const SO_L_LEGS_B = [ // perna distante à frente
  '...O....UUUUuUU.........',
  '...O...UFFE..GGF........',
  '...P..UUUX...uUUU.......',
  '.....UUUUX....uUUUX.....',
  '....UUUUX.....uUUUUX....',
];

export const soldado = {
  id: 'soldado',
  name: 'Soldado Imperial',
  palette: SOLDADO_PALETTE,
  localW: 24,
  dir: {
    down: { head: SO_D_HEAD, torso: [SO_D_TORSO, SO_D_TORSO_A], torsoB: SO_D_TORSO_B, legs: [SO_D_LEGS, SO_D_LEGS_A], legsB: SO_D_LEGS_B },
    up: { head: SO_U_HEAD, torso: [SO_U_TORSO, SO_U_TORSO_A], torsoB: SO_U_TORSO_B, legs: [SO_U_LEGS, SO_U_LEGS_A], legsB: SO_U_LEGS_B },
    left: { head: SO_L_HEAD, torso: [SO_L_TORSO, SO_L_TORSO_BACK, SO_L_TORSO_FWD], legs: [SO_L_LEGS, SO_L_LEGS_A, SO_L_LEGS_B] },
  },
};

// ============================================================ PESCADOR
// Pescador de Vila Maré. Pele bronzeada, chapéu de palha de aba larga,
// barba castanha, camisa listrada (mangas arregaçadas), calça azul
// dobrada até a canela, pés descalços.
const PESCADOR_PALETTE = {
  // palha
  h: '#fff4c0', H: '#ecc870', J: '#c49440', K: '#86622c',
  // fita do chapéu
  r: '#ec6a50', R: '#b03a30',
  // pele bronzeada
  s: '#f6c49a', S: '#d8945e', T: '#a86438', t: '#74401f',
  // olhos
  e: '#1e1410', W: '#ffffff', i: '#5a3a24',
  // barba
  k: '#7a4e34', q: '#4e2e1e',
  // camisa branca
  w: '#ffffff', c: '#e2e2ee', C: '#a8acc4',
  // listras azul-marinho
  n: '#4a6ab8', N: '#2a3c78',
  // calça azul
  a: '#9ccaf0', b: '#6aa4dc', B: '#3e74b4', D: '#244c80',
  // corda (cinto)
  l: '#e8d090', L: '#a88a48',
};

const PE_D_HEAD = [
  '.........hHHJ.........',
  '.......hhHHHHHJ.......',
  '......hHhHHHHHHJ......',
  '...hHHrrRRRRRRRRHHJ...',
  '.hhHHHHHHHHHHHHHHHHJJ.',
  'hHHHJHHHHJHHHHJHHHHJJK',
  '.JJJJJJJJJJJJJJJJJJJJ.',
  '....tTTTTTTTTTTTTt....',
  '....TSSeeSSSSeeSST....',
  '...tSSSWiSSSSWiSSSt...',
  '...tSSSSSSTTSSSSSSt...',
  '....kSSkkkkkkkkSSk....',
  '....kkkkkqTTqkkkkk....',
  '.....kkkkkkkkkkkk.....',
];
const PE_D_TORSO = [
  '......cwqkkkkqwc......',
  '....cwwwwwTTwwwwwC....',
  '...nNnnnnnnnnnnnnNn...',
  '...wCwwwwwwwwwwwwCw...',
  '...SSnnnnnnnnnnnnSS...',
  '...STwwwwwwwwwwwwTS...',
  '...SSnnnnnnnnnnnnSS...',
  '...TTcwwwwwwwwwwcTT...',
  '.....lLlLlLlLlLlL.....',
];
const PE_D_TORSO_A = [
  '......cwqkkkkqwc......',
  '....cwwwwwTTwwwwwC....',
  '...nNnnnnnnnnnnnnNn...',
  '...wCwwwwwwwwwwwwCw...',
  '...SSnnnnnnnnnnnnSS...',
  '...TTwwwwwwwwwwwwTS...',
  '....SnnnnnnnnnnnnSS...',
  '.....cwwwwwwwwwwcTT...',
  '.....lLlLlLlLlLlLSS...',
];
const PE_D_LEGS = [
  '.....bBBBBBBBBBBD.....',
  '.....bBBBD..bBBBD.....',
  '.....aabbb..aabbb.....',
  '......SST....SST......',
  '.....SSSST..SSSST.....',
];
const PE_D_LEGS_A = [
  '.....bBBBBBBBBBBD.....',
  '.....bBBBD..bBBBD.....',
  '.....aabbb..aabbb.....',
  '.....SSSST...SST......',
  '............SSSST.....',
];

const PE_U_HEAD = [
  '.........hHHJ.........',
  '.......hhHHHHHJ.......',
  '......hHhHHHHHHJ......',
  '...hHHrrRRRRRRRRHHJ...',
  '.hhHHHHHHHHHHHHHHHHJJ.',
  'hHHHJHHHHJHHHHJHHHHJJK',
  '.JJJJJJJJJJJJJJJJJJJJ.',
  '....qkkkkkkkkkkkkq....',
  '...tqkkkkkkkkkkkkqt...',
  '...tqkkqkkkkkkqkkqt...',
  '....qkkkqkkkkqkkkq....',
  '.....qqkkqkkqkkqq.....',
  '......qTTTTTTTTq......',
  '......TTSSSSSSTT......',
];
const PE_U_TORSO = [
  '......cwwwwwwwwc......',
  '....cwwwwwwwwwwwwC....',
  '...nNnnnnnnnnnnnnNn...',
  '...wCwwwwwwwwwwwwCw...',
  '...SSnnnnnnnnnnnnSS...',
  '...STwwwwwwwwwwwwTS...',
  '...SSnnnnnnnnnnnnSS...',
  '...TTcwwwwwwwwwwcTT...',
  '.....lLlLlLlLlLlL.....',
];
const PE_U_TORSO_A = [
  '......cwwwwwwwwc......',
  '....cwwwwwwwwwwwwC....',
  '...nNnnnnnnnnnnnnNn...',
  '...wCwwwwwwwwwwwwCw...',
  '...SSnnnnnnnnnnnnSS...',
  '...TTwwwwwwwwwwwwTS...',
  '....SnnnnnnnnnnnnSS...',
  '.....cwwwwwwwwwwcTT...',
  '.....lLlLlLlLlLlLSS...',
];

const PE_L_HEAD = [
  '..........hHHJ........',
  '........hhHHHHHJ......',
  '.......hHhHHHHHHJ.....',
  '.....hHrrRRRRRRRRHJ...',
  '..hhHHHHHHHHHHHHHHHJJ.',
  'hHHHJHHHHJHHHHJHHHHJJK',
  '.JJJJJJJJJJJJJJJJJJJ..',
  '....TTTTTTTkkkkkq.....',
  '...TSeeSSStSkkkkq.....',
  '...SSWiSSStTkkkq......',
  '..SSSSSSSSSSkkkq......',
  '.SSSkkkkSSkkkkq.......',
  '...kkqTTkkkkkq........',
  '....kkkkkkkq..........',
];
const PE_L_TORSO = [
  '......cwkkkqwc........',
  '.....cwwwwwwwwC.......',
  '.....nnnnnnNnnN.......',
  '.....wwwwwwCwwC.......',
  '.....nnnSSTnnnN.......',
  '.....wwwSSTwwwC.......',
  '.....nnnSSTnnnN.......',
  '.....cwwSSTwwwC.......',
  '.....lLlTTTlLlL.......',
];
const PE_L_TORSO_BACK = [
  '......cwkkkqwc........',
  '.....cwwwwwwwwC.......',
  '.....nnnnnnNnnN.......',
  '.....wwwwwwwCwC.......',
  '.....nnnnnnnSTN.......',
  '.....wwwwwwwSSTC......',
  '.....nnnnnnnnSST......',
  '.....cwwwwwwwSST......',
  '.....lLlLlLlLlLl......',
];
const PE_L_TORSO_FWD = [
  '......cwkkkqwc........',
  '.....cwwwwwwwwC.......',
  '.....nnnnnnNnnN.......',
  '....wwwwwwCwwwC.......',
  '...SSTnnnnnnnnN.......',
  '..SSTwwwwwwwwwC.......',
  '.....nnnnnnnnnN.......',
  '.....cwwwwwwwwC.......',
  '.....lLlLlLlLlLl......',
];
const PE_L_LEGS = [
  '......bBBBBBBD........',
  '.......bBBBD..........',
  '.......aabbb..........',
  '........SST...........',
  '......SSSST...........',
];
const PE_L_LEGS_A = [
  '......bBBBBBBBD.......',
  '.....bBBD..bBBD.......',
  '....aabb....aabb......',
  '....SST......SST......',
  '..SSSST......SSSST....',
];
const PE_L_LEGS_B = [
  '......BBBBBbBBD.......',
  '.....DBBD..bBBD.......',
  '....BDDB....aabb......',
  '....TTS......SST......',
  '..TTTTS......SSSST....',
];

export const pescador = {
  id: 'pescador',
  name: 'Pescador',
  palette: PESCADOR_PALETTE,
  localW: 22,
  armW: 5,
  dir: {
    down: { head: PE_D_HEAD, torso: [PE_D_TORSO, PE_D_TORSO_A], legs: [PE_D_LEGS, PE_D_LEGS_A] },
    up: { head: PE_U_HEAD, torso: [PE_U_TORSO, PE_U_TORSO_A], legs: [PE_D_LEGS, PE_D_LEGS_A] },
    left: { head: PE_L_HEAD, torso: [PE_L_TORSO, PE_L_TORSO_BACK, PE_L_TORSO_FWD], legs: [PE_L_LEGS, PE_L_LEGS_A, PE_L_LEGS_B] },
  },
};

// ============================================================ MERCADORA
// Feirante do mercado. Corpulenta, cabelo escuro cacheado sob um lenço
// amarelo amarrado no alto, brincos de argola, avental sobre vestido laranja.
const MERCADORA_PALETTE = {
  // lenço amarelo
  y: '#fff2a0', Y: '#f6cc40', Z: '#c8902a', X: '#8a5c1c',
  // cabelo cacheado
  h: '#7a5040', H: '#4e2e26', J: '#2e1a18',
  // pele morena
  s: '#eab088', S: '#c8845a', T: '#9a5838', t: '#6a3a24', m: '#e07868',
  // olhos
  e: '#1a100c', W: '#ffffff', i: '#6a3a20',
  // vestido laranja
  o: '#ffb070', O: '#f07a30', P: '#b84c1c', Q: '#7c2c14',
  // avental
  w: '#fffaf0', c: '#ecdcc4', C: '#c0a888',
  // ouro (brincos)
  g: '#ffd860',
  // sapatos
  u: '#8a5434', U: '#4e2c1c',
};

const ME_D_HEAD = [
  '...........yY.yZ......',
  '.......yYYYYyYZYZ.....',
  '.....yYYYYYYYYYZZ.....',
  '....yYYZYYYYYYZYYZ....',
  '...yYYYYZYYYYZYYYYZ...',
  '..hHyYYYYYYYYYYYYZHJ..',
  '.hHJZZZZZZZZZZZZZZhHJ.',
  '.HhHHhSSSSSSSSSShHHhJ.',
  '.JhHSSSeeSSSSeeSSShHJ.',
  '.hHJSSSWiSSSSWiSSSJhH.',
  '..JHmSSSSSTTSSSSSmHJ..',
  '..JgSSSStSSSStSSSSgJ..',
  '...gTSSSSttttSSSSTg...',
  '.....TTSSSSSSSSTT.....',
];
const ME_D_TORSO = [
  '......OOwTTTTwOO......',
  '..oOOoOOwwwwwwOOoOOP..',
  '..oOOOOcwwwwwwcOOOOP..',
  '..OOPOOcwwwwwwcOOPOP..',
  '..SSOOOcwwwwwwcOOOSS..',
  '..SSOOwwwwwwwwwwOOSS..',
  '..SSPCCCCCCCCCCCCPSS..',
  '..TTOwwwwwwwwwwwcOTT..',
  '...OOwwwcCCCCcwwcOP...',
];
const ME_D_TORSO_A = [
  '......OOwTTTTwOO......',
  '..oOOoOOwwwwwwOOoOOP..',
  '..oOOOOcwwwwwwcOOOOP..',
  '..OOPOOcwwwwwwcOOPOP..',
  '..SSOOOcwwwwwwcOOOSS..',
  '..SSOOwwwwwwwwwwOOSS..',
  '..TTPCCCCCCCCCCCCPSS..',
  '....OwwwwwwwwwwwcOSS..',
  '...OOwwwcCCCCcwwcOTT..',
];
const ME_D_LEGS = [
  '...OOwwwcwwwwcwwcOP...',
  '...OOcwwwwwwwwwwcCOP..',
  '..oOPOOOOOOOOOOOOOPPQ.',
  '...QQQQQQQQQQQQQQQQ...',
  '......uUU....uUU......',
];
const ME_D_LEGS_A = [
  '...OOwwwcwwwwcwwcOP...',
  '..OOcwwwwwwwwwwcCOP...',
  '.oOPOOOOOOOOOOOOOPPQ..',
  '..QQQQQQQQQQQQQQQQ....',
  '...uUU................',
];

const ME_U_HEAD = [
  '...........yY.yZ......',
  '.......yYYYYyYZYZ.....',
  '.....yYYYYYYYYYZZ.....',
  '....yYYYYYYYYYYYYZ....',
  '...yYZYYYYYYYYYYYYZ...',
  '..hHYYZZYYYYYYYYYYHJ..',
  '.hHJYYYYZZYYYYYYYYhHJ.',
  '.HhHZYYYYYZZZYYYYZHhJ.',
  '.JhHHZYYYYYYYZZZZHhHJ.',
  '.hHJhHZZZZZZZZZZHJhHJ.',
  '..JHhHJhHhHJhHhJhHJJ..',
  '..JgHhJHhJHhJHhJHhgJ..',
  '...gJJHJJHJJHJJHJJg...',
  '.....TTSSSSSSSSTT.....',
];
const ME_U_TORSO = [
  '......OOOOOOOOOO......',
  '..oOOoOOwOOOOwOOoOOP..',
  '..oOOOOOOwOOwOOOOOOP..',
  '..OOPOOOOOwwOOOOOPOP..',
  '..SSOOOOOOOOOOOOOOSS..',
  '..SSOOOOOOOOOOOOOOSS..',
  '..SSPCCCCwCCwCCCCPSS..',
  '..TTOOOOOwwwwOOOOOTT..',
  '...OOOOOwcPPcwOOOOP...',
];
const ME_U_TORSO_A = [
  '......OOOOOOOOOO......',
  '..oOOoOOwOOOOwOOoOOP..',
  '..oOOOOOOwOOwOOOOOOP..',
  '..OOPOOOOOwwOOOOOPOP..',
  '..SSOOOOOOOOOOOOOOSS..',
  '..SSOOOOOOOOOOOOOOSS..',
  '..TTPCCCCwCCwCCCCPSS..',
  '....OOOOOwwwwOOOOOSS..',
  '...OOOOOwcPPcwOOOOTT..',
];
const ME_U_LEGS = [
  '...OOOOOOcPPcOOOOOOP..',
  '...OOOOOOOPPOOOOOOOP..',
  '..oOPOOOOOPOOOOOOOPPQ.',
  '...QQQQQQQQQQQQQQQQ...',
  '......uUU....uUU......',
];
const ME_U_LEGS_A = [
  '...OOOOOOcPPcOOOOOOP..',
  '..OOOOOOOOPPOOOOOOP...',
  '.oOPOOOOOPOOOOOOOPPQ..',
  '..QQQQQQQQQQQQQQQQ....',
  '...uUU................',
];

const ME_L_HEAD = [
  '..........yY.yZ.......',
  '......yYYYYyYZYZ......',
  '....yYYYYYYYYYZZ......',
  '...yYYZYYYYYYZYYZ.....',
  '..yYYYYZYYYYZYYYYZ....',
  '..YYYYYYYYYYYYYYYZh...',
  '..ZZZZZZZZZZZZZZZHhH..',
  '..SSSSSSSShHhHJhHhHJ..',
  '.SSSeeSSSSShHJhHhJHJ..',
  '.SSSWiSSSSSgHhHJhHJJ..',
  'SSSSSSSSSTSgJHhJHhJ...',
  '.SmSSStSSSTgJJHhJJ....',
  '..TSttSSSTT...JJ......',
  '...TTSSSTT............',
];
const ME_L_TORSO = [
  '.....OOwTTOOO.........',
  '....oOOwwwoOOOP.......',
  '...cwwwoOOOOOOOP......',
  '..cwwwwoOOPOOOOP......',
  '..cwwwwOOSSOOOOP......',
  '..cwwwwOOSSOOOOP......',
  '..CCCCCCCTTCCCCP......',
  '..cwwwwoOOOOOOOP......',
  '..cwwwwoOOOOOOOOP.....',
];
const ME_L_TORSO_BACK = [
  '.....OOwTTOOO.........',
  '....oOOwwwoOOOP.......',
  '...cwwwoOOoOOOOP......',
  '..cwwwwoOOOoOOOP......',
  '..cwwwwOOOOOSSOP......',
  '..cwwwwOOOOOSSOPP.....',
  '..CCCCCCCCCCTTCP......',
  '..cwwwwoOOOOOOOP......',
  '..cwwwwoOOOOOOOOP.....',
];
const ME_L_TORSO_FWD = [
  '.....OOwTTOOO.........',
  '....oOOwwwoOOOP.......',
  '...cwwwoOOOOOOOP......',
  '..cwwwoOOPOOOOOP......',
  '.SSwwoOOOOOOOOOP......',
  '.SSwwwwOOOOOOOOP......',
  '..CCCCCCCCCCCCCP......',
  '..cwwwwoOOOOOOOP......',
  '..cwwwwoOOOOOOOOP.....',
];
const ME_L_LEGS = [
  '..cwwwwoOOOOOOOOP.....',
  '..CcwwwoOOOOOOOOP.....',
  '..oOOOOOOOOOOOOPPQ....',
  '...QQQQQQQQQQQQQQ.....',
  '....uUU.....uUU.......',
];
const ME_L_LEGS_A = [
  '..cwwwwoOOOOOOOOP.....',
  '.CcwwwwoOOOOOOOOPP....',
  '.oOOOOOOOOOOOOOOPPQ...',
  '..QQQQQQQQQQQQQQQQ....',
  '.uUU...........uUU....',
];
const ME_L_LEGS_B = [
  '..cwwwwoOOOOOOOOP.....',
  '..CcwwwoOOOOOOOOP.....',
  '..oOOOOOOOOOOOOPPQ....',
  '...QQQQQQQQQQQQQQ.....',
  '.....UU....uUU........',
];

export const mercadora = {
  id: 'mercadora',
  name: 'Mercadora',
  palette: MERCADORA_PALETTE,
  localW: 22,
  armW: 4,
  dir: {
    down: { head: ME_D_HEAD, torso: [ME_D_TORSO, ME_D_TORSO_A], legs: [ME_D_LEGS, ME_D_LEGS_A] },
    up: { head: ME_U_HEAD, torso: [ME_U_TORSO, ME_U_TORSO_A], legs: [ME_U_LEGS, ME_U_LEGS_A] },
    left: { head: ME_L_HEAD, torso: [ME_L_TORSO, ME_L_TORSO_BACK, ME_L_TORSO_FWD], legs: [ME_L_LEGS, ME_L_LEGS_A, ME_L_LEGS_B] },
  },
};

// ============================================================ CRIANÇA
// Menino da vila. Baixinho, cabelo preto bagunçado, túnica verde grande
// demais (mangas compridas, barra no joelho), espada de brinquedo de
// madeira apoiada no ombro.
const CRIANCA_PALETTE = {
  // cabelo preto
  h: '#5c5c7c', H: '#36364e', J: '#1e1e30', K: '#10101c',
  // pele
  s: '#ffe0c4', S: '#f2b890', T: '#c88464', t: '#985a44', m: '#ee8c84',
  // olhos
  e: '#1a1420', i: '#6a4428', W: '#ffffff',
  // túnica verde
  a: '#a6dc84', A: '#5aa44c', Z: '#2e6a34', X: '#1c4424',
  // cinto de corda
  l: '#e8c884', L: '#a08040',
  // espada de madeira
  o: '#f4d49c', O: '#c08a50', D: '#6a4424',
  // sandálias
  u: '#a06a40', U: '#6a4024',
};

const CR_D_HEAD = [
  '.....H..hH..H.......',
  '....HhHHhHHHHhH..o..',
  '...hHHhhHHHHHHHJ.oO.',
  '...JHhHHHHHHHHHHJoO.',
  '..JHHHHJHHHJHHHHJoO.',
  '..JHJHHSJHHSJHHJJoO.',
  '...JSSSSSSSSSSSSJoO.',
  '...JSSeeSSSSeeSSJoO.',
  '...SSSWiSSSSWiSSSoO.',
  '...tmSTSSSSSSTSmtoO.',
  '....TSSSSttSSSST.oO.',
  '.....TTSSSSSSTT..oO.',
];
const CR_D_TORSO = [
  '....aAAAAAAAAAZ.DDDD',
  '...aAAAAAAAAAAAZSSD.',
  '..aAAaAAAAAAAAAAZZ..',
  '..aAAaAAAAAAAAAAZ...',
  '..SAAlLlLlLlLlLLZ...',
  '..SSAAAAAAAAAAAAZ...',
];
const CR_D_TORSO_A = [ // braço livre à frente
  '....aAAAAAAAAAZ.DDDD',
  '...aAAAAAAAAAAAZSSD.',
  '..aAAaAAAAAAAAAAZZ..',
  '..aAAaAAAAAAAAAAZ...',
  '..aAAlLlLlLlLlLLZ...',
  '..aAAAAAAAAAAAAAZ...',
];
const CR_D_TORSO_B = [ // braço livre atrás
  '....aAAAAAAAAAZ.DDDD',
  '...aAAAAAAAAAAAZSSD.',
  '..aAAaAAAAAAAAAAZZ..',
  '..SAAaAAAAAAAAAAZ...',
  '..SSAlLlLlLlLlLLZ...',
  '...AAAAAAAAAAAAAZ...',
];
const CR_D_LEGS = [
  '..aAAAAAAAAAAAAAAZ..',
  '......SST..SST......',
  '......SST..SST......',
  '.....uUUU..uUUU.....',
];
const CR_D_LEGS_A = [
  '..SSAAAAAAAAAAAAAZ..',
  '..SS.uSST..SST......',
  '.....uUUU..SST......',
  '...........uUUU.....',
];
const CR_D_LEGS_B = [
  '..aAAAAAAAAAAAAAAZ..',
  '......SST..SSTU.....',
  '......SST..uUUU.....',
  '.....uUUU...........',
];

const CR_U_HEAD = [
  '.......H..Hh..H.....',
  '..o..hHhHHHHhHHhH...',
  '.oO.hHHHHHHHHhhHHJ..',
  '.oOJHHHHHHHHHHHHHJ..',
  '.oOJHHHJHHHJHHHHHHJ.',
  '.oOJJHHHJHHHJHHHJHJ.',
  '.oO.JHHJHHHHJHHJHJ..',
  '.oO.JJHHJHHJHHJJJ...',
  '.oO.tJJHJHHJHJJJt...',
  '.oO.tTJJJJJJJJJTt...',
  '.oO..TTSSSSSSSTT....',
  '.oO...TTSSSSSTT.....',
];
const CR_U_TORSO = [
  'DDDD.ZAAAAAAAAAa....',
  '.DSSZAAAAAAAAAAAa...',
  '..ZZAAAAAAAAAAaAAa..',
  '...ZAAAAAAAAAAaAAa..',
  '...ZLLlLlLlLlLlAAS..',
  '...ZAAAAAAAAAAAASS..',
];
const CR_U_TORSO_A = [
  'DDDD.ZAAAAAAAAAa....',
  '.DSSZAAAAAAAAAAAa...',
  '..ZZAAAAAAAAAAaAAa..',
  '...ZAAAAAAAAAAaAAS..',
  '...ZLLlLlLlLlLlASS..',
  '...ZAAAAAAAAAAAAA...',
];
const CR_U_TORSO_B = [
  'DDDD.ZAAAAAAAAAa....',
  '.DSSZAAAAAAAAAAAa...',
  '..ZZAAAAAAAAAAaAAa..',
  '...ZAAAAAAAAAAaAAa..',
  '...ZLLlLlLlLlLlAAa..',
  '...ZAAAAAAAAAAAAASS.',
];
const CR_U_LEGS = [
  '..ZAAAAAAAAAAAAAAa..',
  '......TSS..TSS......',
  '......TSS..TSS......',
  '.....UUUu..UUUu.....',
];
const CR_U_LEGS_A = [
  '..ZAAAAAAAAAAAAAAa..',
  '......TSSu.TSS......',
  '......UUUu.TSS......',
  '...........UUUu.....',
];
const CR_U_LEGS_B = [
  '..ZAAAAAAAAAAAAAASS.',
  '......TSS..TSS......',
  '......TSS.UUUu......',
  '.....UUUu...........',
];

const CR_L_HEAD = [
  '.......H..hH.H.....o',
  '.....HhHHhHHHHhH..oO',
  '....hHHhhHHHHHHHHoO.',
  '...hHhHHHHHHHHHHHHJ.',
  '...HhHHHJHHHHJHHHHJ.',
  '..JHHJHHHJHHHHHHHJ..',
  '..JHJSJHHHHHHHHHJ...',
  '...SSSSJHHHHHHHJJ...',
  '..SSSeSSTJHHHHJ.....',
  '..SSSiSStJJoO.......',
  '.SmSSSSSSToO........',
  '..TTSSSSToO.........',
];
const CR_L_TORSO = [
  '.....aAAADDZ........',
  '....aAAAASSZZ.......',
  '...aAAAAAAAAZZ......',
  '...aAAAAAAAAAZ......',
  '...aAlLlLlLLLZ......',
  '...aAAAAAAAAAZ......',
];
const CR_L_TORSO_BACK = [
  '.....aAAADDZ........',
  '....aAAAASSZZ.......',
  '...aAAAAAAAAZZ......',
  '...aAAAAAaAAAZ......',
  '...aAlLlLlLaAZ......',
  '...aAAAAAAASSZ......',
];
const CR_L_TORSO_FWD = [
  '.....aAAADDZ........',
  '....aAAAASSZZ.......',
  '...aAAAAAAAAZZ......',
  '..aaAAAAAAAAAZ......',
  '.SSalLlLlLLLLZ......',
  '.SSAAAAAAAAAAZ......',
];
const CR_L_LEGS = [
  '...aAAAAAAAAAZ......',
  '......SST...........',
  '......SST...........',
  '.....uUUU...........',
];
const CR_L_LEGS_A = [
  '...aAAAAAAAAAAZ.....',
  '....SST...SST.......',
  '...SST.....SST......',
  '..uUU......uUUU.....',
];
const CR_L_LEGS_B = [
  '...aAAAAAAAAAAZ.....',
  '....TST...SST.......',
  '...TST.....SST......',
  '..UUU......uUUU.....',
];

export const crianca = {
  id: 'crianca',
  name: 'Menino',
  palette: CRIANCA_PALETTE,
  localW: 20,
  dir: {
    down: { head: CR_D_HEAD, torso: [CR_D_TORSO, CR_D_TORSO_A], torsoB: CR_D_TORSO_B, legs: [CR_D_LEGS, CR_D_LEGS_A], legsB: CR_D_LEGS_B },
    up: { head: CR_U_HEAD, torso: [CR_U_TORSO, CR_U_TORSO_A], torsoB: CR_U_TORSO_B, legs: [CR_U_LEGS, CR_U_LEGS_A], legsB: CR_U_LEGS_B },
    left: { head: CR_L_HEAD, torso: [CR_L_TORSO, CR_L_TORSO_BACK, CR_L_TORSO_FWD], legs: [CR_L_LEGS, CR_L_LEGS_A, CR_L_LEGS_B] },
  },
};

// ============================================================ MENINA
// Menina da vila. Maria-chiquinhas castanhas com fitas, vestido rosa de
// gola branca, carrega uma lanterna de papel em forma de estrela (festa!)
// que balança enquanto ela anda.
const MENINA_PALETTE = {
  // cabelo castanho
  h: '#d09a64', H: '#9a643c', J: '#663e26', K: '#3e2216',
  // fitas
  r: '#ff9ac0', R: '#e05a8a',
  // pele
  s: '#fff0e2', S: '#fad0b4', T: '#e09c84', t: '#b06a5c', m: '#f08a98',
  // olhos
  e: '#2a1a20', i: '#a0603a', W: '#ffffff',
  // vestido rosa
  p: '#ffc4dc', P: '#f480b0', Q: '#c04c80', X: '#7a2a50',
  // gola / meias
  w: '#ffffff', c: '#e8e0f0',
  // lanterna de papel (estrela)
  '*': '#fffbe0', y: '#ffe070', Y: '#f0a030', d: '#8a5a34',
  // sapatos
  u: '#d04a5a', U: '#8a2a3a',
};

const MN_D_HEAD = [
  '.......hHHHHHHh.......',
  '.....hhHHHhJHHHh......',
  '....hHHhHHhJHHHHHJ....',
  '...hHHhHHHhJHHHHHHJ...',
  '.rRrHHHHJHHHHJHHHHrRr.',
  'hHJJHJSSJSSSSJSSJHJhHJ',
  'HHJ.JSSeeSSSSeeSSJ.HHJ',
  'hHJ.JSSWiSSSSWiSSJ.hHJ',
  'HJJ..SmSSSSSSSSmS..HJJ',
  '.HJ...TSSSmmSSST...HJ.',
  '.JJ....TTSSSSTT....JJ.',
  '..........TT..........',
];
const MN_D_TORSO = [
  '........cwTTwc........',
  '.......pwwwwwwp.......',
  '.....pPPPpPPPPPPQ.....',
  '.....SpPPpPPPPPQS.....',
  '.....SScwwwwwwcQ.SS...',
  '......pPPPPPPPPQ..d...',
];
const MN_D_TORSO_A = [ // braço livre à frente, lanterna balança
  '........cwTTwc........',
  '.......pwwwwwwp.......',
  '.....pPPPpPPPPPPQ.....',
  '.....pPPPpPPPPPQS.....',
  '.....SPcwwwwwwcQ.SS...',
  '.....SSPPPPPPPPQ.d....',
];
const MN_D_TORSO_B = [ // braço livre atrás
  '........cwTTwc........',
  '.......pwwwwwwp.......',
  '.....SPPPpPPPPPPQ.....',
  '.....SSPPpPPPPPQS.....',
  '......PcwwwwwwcQ.SS...',
  '......pPPPPPPPPQ...d..',
];
const MN_D_LEGS = [
  '.....pPPPPPPPPPPQ.y...',
  '....QQPQQPQQPQQPQyy*yy',
  '.......ww....ww...y*y.',
  '......uUU....uUU..Y.Y.',
];
const MN_D_LEGS_A = [
  '.....pPPPPPPPPPPQy....',
  '...QQPQQPQQPQQPQyy*yy.',
  '.....uUU.....ww..y*y..',
  '.............uUU.Y.Y..',
];
const MN_D_LEGS_B = [
  '.....pPPPPPPPPPPQ..y..',
  '.....QPQQPQQPQQPQQyy*y',
  '.......ww...uUU....y*y',
  '......uUU..........Y.Y',
];

const MN_U_HEAD = [
  '.......hHHHHHHh.......',
  '.....hhHHHhJHHHh......',
  '....hHHhHHhJHHHHHJ....',
  '...hHHhHHHhJHHHHHHJ...',
  '.rRrHHhHHHhJHHHHHHrRr.',
  'hHJJHHhHHHhJHHHHHJJhHJ',
  'HHJ.JHHhHHhJHHHHHJ.HHJ',
  'hHJ.JHHHHHhJHHHHJJ.hHJ',
  'HJJ..JHHHHhJHHHHJ..HJJ',
  '.HJ...JJHHhJHHJJ...HJ.',
  '.JJ....TJJJJJJT....JJ.',
  '..........TT..........',
];
const MN_U_TORSO = [
  '........cwwwwc........',
  '.......pPPPPPPp.......',
  '.....pPPPpPPPPPPQ.....',
  '.....SpPPpPPPPPQS.....',
  '...SS.cwrRRrwwcQSS....',
  '...d..pPPPRRPPPQ......',
];
const MN_U_TORSO_A = [
  '........cwwwwc........',
  '.......pPPPPPPp.......',
  '.....pPPPpPPPPPPQ.....',
  '.....SpPPpPPPPPQQ.....',
  '...SS.cwrRRrwwcQS.....',
  '....d.pPPPRRPPPQSS....',
];
const MN_U_TORSO_B = [
  '........cwwwwc........',
  '.......pPPPPPPp.......',
  '.....pPPPpPPPPPPS.....',
  '.....SpPPpPPPPPQSS....',
  '...SS.cwrRRrwwcQ......',
  '..d...pPPPRRPPPQ......',
];
const MN_U_LEGS = [
  '...y.pPPPPPRPPPPQ.....',
  'yy*yyQPQQPQRPQQPQQ....',
  '.y*y...ww....ww.......',
  '.Y.Y..uUU....uUU......',
];
const MN_U_LEGS_A = [
  '....ypPPPPPRPPPPQ.....',
  '.yy*yyPQQPQRPQQPQQQ...',
  '..y*y..ww....uUU......',
  '..Y.Y.uUU.............',
];
const MN_U_LEGS_B = [
  '..y..pPPPPPRPPPPQ.....',
  'y*yyQQPQQPQRPQQPQ.....',
  'y*y....uUU...ww.......',
  'Y.Y.........uUU.......',
];

const MN_L_HEAD = [
  '........hHHHHHh.......',
  '......hhHHHHHHHh......',
  '.....hHHhHHHHHHHJ.....',
  '....hHhHHHHHHJHHHJ....',
  '...hHHHHJHHHHHJHHJrRr.',
  '...JHJSSJHHHHHHHJJhHJ.',
  '...SSSSSJHHHHHHHJ.hHHJ',
  '..SSSeeSSJHHHHHJJ.HHJJ',
  '..SSSWiSSTJHHHJJ..hHJ.',
  '.SSSSSSSSSJJJJ....HJJ.',
  '..TmSSSSST........JJ..',
  '...TTSSSTT............',
];
const MN_L_TORSO = [
  '........cwwc..........',
  '.......cwwwwp.........',
  '.......pPPPPPQ........',
  '.......pPSPPPQ........',
  '......SSScwwwc........',
  '.....d.pPPPPPPQ.......',
];
const MN_L_TORSO_BACK = [
  '........cwwc..........',
  '.......cwwwwp.........',
  '.......pPPPPPQ........',
  '.......pPPPPSQ........',
  '.......cwwwwSSc.......',
  '......dpPPPPSSQ.......',
];
const MN_L_TORSO_FWD = [
  '........cwwc..........',
  '.......cwwwwp.........',
  '.......pPPPPPQ........',
  '.....SSPPPPPQ.........',
  '...SSScwwwwwcQ........',
  '...d...pPPPPPPQ.......',
];
const MN_L_LEGS = [
  '.....y.pPPPPPPPQ......',
  '...yy*yyQQPQQPQQ......',
  '....y*y..ww...........',
  '....Y.Y.uUU...........',
];
const MN_L_LEGS_A = [
  '......ypPPPPPPPQ......',
  '....yy*yyQPQQPQQQ.....',
  '.....y*yww...ww.......',
  '.....YuYU....uUU......',
];
const MN_L_LEGS_B = [
  '...y...pPPPPPPPQ......',
  '.yy*yyQQPQQPQQQ.......',
  '..y*y.ww...ww.........',
  '..Y.YuUU....UU........',
];

export const menina = {
  id: 'menina',
  name: 'Menina',
  palette: MENINA_PALETTE,
  localW: 22,
  dir: {
    down: { head: MN_D_HEAD, torso: [MN_D_TORSO, MN_D_TORSO_A], torsoB: MN_D_TORSO_B, legs: [MN_D_LEGS, MN_D_LEGS_A], legsB: MN_D_LEGS_B },
    up: { head: MN_U_HEAD, torso: [MN_U_TORSO, MN_U_TORSO_A], torsoB: MN_U_TORSO_B, legs: [MN_U_LEGS, MN_U_LEGS_A], legsB: MN_U_LEGS_B },
    left: { head: MN_L_HEAD, torso: [MN_L_TORSO, MN_L_TORSO_BACK, MN_L_TORSO_FWD], legs: [MN_L_LEGS, MN_L_LEGS_A, MN_L_LEGS_B] },
  },
};

// ============================================================ ANCIÃO
// Ancião da vila. Careca, barba branca longa, sobrancelhas fartas, manto
// roxo de mangas largas com faixa dourada, cajado alto de madeira retorcida
// com uma concha pendurada.
const ANCIAO_PALETTE = {
  // pele
  s: '#ffe6d0', S: '#f2bc98', T: '#c88468', t: '#94584a', m: '#ea9a8a',
  // barba / cabelo branco
  b: '#ffffff', B: '#dedcec', C: '#aaa8c6',
  // olhos
  e: '#3a2630',
  // manto roxo
  v: '#b890e4', V: '#7e56b8', X: '#523284', Z: '#2e1c54',
  // faixa dourada
  y: '#ffe68a', Y: '#c8962e',
  // cajado
  o: '#d29a62', O: '#94603a', D: '#583820',
  // concha
  p: '#fff0e4', P: '#eaa490',
  // sandálias
  u: '#7a5444', U: '#4a2e28',
};

const AN_D_HEAD = [
  '.oO...................',
  'oDOo..................',
  'O.DO....sSSSST........',
  '.oO...ssSSSSSSST......',
  '.pO..sSsSSSSSSSST.....',
  '.PO.sSsSSSSSSSSSST....',
  '..O.SSSSSSSSSSSSST....',
  '..OBSSbbBSSSSBbbSSB...',
  '..OBtSSeeSSSSeeSStB...',
  '..O.tSmSSSTTSSSmSt....',
  '..O..bBBBBBBBBBBC.....',
  '..O..bBBBTttTBBBC.....',
  '..O..bBBBBBBBBBBC.....',
  '..O...bBBBBBBBBC......',
];
const AN_D_TORSO = [
  '..O.vVVbBBBBBBCVVX....',
  '..OvVVVbBBBBBBCVVVX...',
  '.vSSVVVVbBBBBCVVVVXX..',
  '.vSSVVVVVbBBCVVVVVXX..',
  '..OVVVVVVVbCVVVVVVSSX.',
  '..OXVVVVVVVVVVVVVVSSZ.',
  '..O.yYYYYYYyYYYYYY....',
  '..O.VVVVVVVYyVVVVX....',
  '..O.VVVVVVYVVYVVVX....',
];
const AN_D_TORSO_A = [ // braço livre à frente
  '..O.vVVbBBBBBBCVVX....',
  '..OvVVVbBBBBBBCVVVX...',
  '.vSSVVVVbBBBBCVVVVXX..',
  '.vSSVVVVVbBBCVVVVVXX..',
  '..OVVVVVVVbCVVVVVVVXX.',
  '..OXVVVVVVVVVVVVVVVXZ.',
  '..O.yYYYYYYyYYYYYYSS..',
  '..O.VVVVVVVYyVVVVXSS..',
  '..O.VVVVVVYVVYVVVX....',
];
const AN_D_TORSO_B = [ // braço livre atrás
  '..O.vVVbBBBBBBCVVX....',
  '..OvVVVbBBBBBBCVVVX...',
  '.vSSVVVVbBBBBCVVVVXX..',
  '.vSSVVVVVbBBCVVVVVSSX.',
  '..OVVVVVVVbCVVVVVVSSX.',
  '..OXVVVVVVVVVVVVVVXZ..',
  '..O.yYYYYYYyYYYYYY....',
  '..O.VVVVVVVYyVVVVX....',
  '..O.VVVVVVYVVYVVVX....',
];
const AN_D_LEGS = [
  '..O.VVvVVVVVVVVVVX....',
  '..OvVVvVVVVVVXVVVXX...',
  '..OvVVvVVVXVVVXVVVX...',
  '..OXZXXZXXXZXXXZXXZ...',
  '..D....uUU..uUU.......',
];
const AN_D_LEGS_A = [
  '..O.VVvVVVVVVVVVVX....',
  '..OvVVvVVVVVVXVVVXX...',
  '..OvVVvVVVXVVVXVVVX...',
  '..XXZXXZXXXZXXXZXZ....',
  '..DuUU................',
];
const AN_D_LEGS_B = [
  '..O.VVvVVVVVVVVVVX....',
  '..OvVVvVVVVVVXVVVXX...',
  '..OvVVvVVVXVVVXVVVXX..',
  '..OXZXXZXXXZXXXZXXZZ..',
  '..D..........uUU......',
];

const AN_U_HEAD = [
  '...................Oo.',
  '..................oODo',
  '........TSSSSs....OD.O',
  '......TSSSSSSSs....Oo.',
  '.....TSSSSSSSsSs...Op.',
  '....TSSSSSSSSSsSs..OP.',
  '....TSSSSSSSSSSSS..O..',
  '...BCBSSSSSSSSSBCB.O..',
  '...BtCBBSSSSSBBCtB.O..',
  '....tCBbBBBBBbBCt..O..',
  '.....TCBBBBBBBCT...O..',
  '.....CTTSSSSSSTC...O..',
  '.....CBTSSSSSTBC...O..',
  '......CBTTTTTBC....O..',
];
const AN_U_TORSO = [
  '....XVVVVVVVVVVVVv.O..',
  '...XXVVVVVVVVVVVVvvO..',
  '..XXVVVVVVVVVVVVVVVSSv',
  '..XXVVVVVVVVVVVVVVVSSv',
  '.XSSVVVVVVVVVVVVVVVVO.',
  '.ZSSVVVVVVVVVVVVVVVXO.',
  '....YYYYYYyYYYYYYy.O..',
  '....XVVVVVYyYVVVVV.O..',
  '....XVVVVVYVYVVVVV.O..',
];
const AN_U_TORSO_A = [
  '....XVVVVVVVVVVVVv.O..',
  '...XXVVVVVVVVVVVVvvO..',
  '..XXVVVVVVVVVVVVVVVSSv',
  '..XXVVVVVVVVVVVVVVVSSv',
  '.XXVVVVVVVVVVVVVVVVVO.',
  '.ZXVVVVVVVVVVVVVVVVXO.',
  '..SSYYYYYYyYYYYYYy.O..',
  '..SSXVVVVVYyYVVVVV.O..',
  '....XVVVVVYVYVVVVV.O..',
];
const AN_U_TORSO_B = [
  '....XVVVVVVVVVVVVv.O..',
  '...XXVVVVVVVVVVVVvvO..',
  '..XXVVVVVVVVVVVVVVVSSv',
  '.XSSVVVVVVVVVVVVVVVSSv',
  '.XSSVVVVVVVVVVVVVVVVO.',
  '..ZXVVVVVVVVVVVVVVVXO.',
  '....YYYYYYyYYYYYYy.O..',
  '....XVVVVVYyYVVVVV.O..',
  '....XVVVVVYVYVVVVV.O..',
];
const AN_U_LEGS = [
  '....XVVVVVVVVVVVVvV.O.',
  '...XXVVVVXVVVVVvVVv.O.',
  '...XVVVVXVVVXVVVvVv.O.',
  '...ZXXXZXXXZXXXZXXZ.O.',
  '.......UUu..UUu.....D.',
];
const AN_U_LEGS_A = [
  '....XVVVVVVVVVVVVvV..O',
  '...XXVVVVXVVVVVvVVv..O',
  '...XVVVVXVVVXVVVvVv..O',
  '....ZXXXZXXXZXXXZXZ..O',
  '.......UUu.........uUD',
];
const AN_U_LEGS_B = [
  '....XVVVVVVVVVVVVvV.O.',
  '...XXVVVVXVVVVVvVVv.O.',
  '..XXVVVVXVVVXVVVvVv.O.',
  '..ZZXXXZXXXZXXXZXXZ.O.',
  '............UUu.....D.',
];

const AN_L_HEAD = [
  '.oO...................',
  'oDOo..................',
  'O.DO.......sSSSST.....',
  '.oO......ssSSSSSSST...',
  '.pO.....sSsSSSSSSSST..',
  '.PO....sSsSSSSSSSSSST.',
  '..O....SSSSSSSSSSSSST.',
  '..O...bBSSSSSSSSSSSST.',
  '..O...SeTSSSSSStBbSST.',
  '..O..SSSSSSSSSStCBST..',
  '..O.SSSSSSSSSSSTCBT...',
  '..O..bBBBmSSSSTCC.....',
  '..O.bBBBBBBBBBC.......',
  '..O..bBTtBBBBC........',
];
const AN_L_TORSO = [
  '..O..bBBBBBBBCVVVX....',
  '..O.vbBBBBBBCVVVVVX...',
  '..O.vVbBBBBCVVVVVVXX..',
  '..SSSVVbBBCVVVVVVVXX..',
  '..SSSVVVbCVVVVVVVVXX..',
  '..O.vVVVVVVVVVVVVVXX..',
  '..O..YYYYYYYYYYYYYY...',
  '..O..VVVVVVVVVVVVVX...',
  '..O..VVVVVVVVVVVVVX...',
];
const AN_L_TORSO_BACK = [ // cajado junto ao corpo
  '...O.bBBBBBBBCVVVX....',
  '...OvbBBBBBBCVVVVVX...',
  '...OvVbBBBBCVVVVVVXX..',
  '...SSSVbBBCVVVVVVVXX..',
  '...SSSVVbCVVVVVVVVXX..',
  '...OvVVVVVVVVVVVVVXX..',
  '...O.YYYYYYYYYYYYYY...',
  '...O.VVVVVVVVVVVVVX...',
  '...O.VVVVVVVVVVVVVX...',
];
const AN_L_TORSO_FWD = [ // cajado lançado à frente
  '.O...bBBBBBBBCVVVX....',
  '.O..vbBBBBBBCVVVVVX...',
  '.O.vVVbBBBBCVVVVVVXX..',
  'SSSVVVVbBBCVVVVVVVXX..',
  'SSSvVVVVbCVVVVVVVVXX..',
  '.O..vVVVVVVVVVVVVVXX..',
  '.O...YYYYYYYYYYYYYY...',
  '.O...VVVVVVVVVVVVVX...',
  '.O...VVVVVVVVVVVVVX...',
];
const AN_L_LEGS = [
  '..O..VVVVVVVVVVVVVX...',
  '..O.vVVVXVVVVXVVVVX...',
  '..O.vVVXVVVVXVVVVVXX..',
  '..O.XZXXZXXXZXXXZXZ...',
  '..D..uUU.....UU.......',
];
const AN_L_LEGS_A = [ // perna próxima à frente
  '...O.VVVVVVVVVVVVVX...',
  '...OvVVVXVVVVXVVVVXX..',
  '..vOVVVXVVVVXVVVVVXX..',
  '.XZOXZXXZXXXZXXXZXZ...',
  'uUUD.........UU.......',
];
const AN_L_LEGS_B = [ // perna distante à frente
  '.O...VVVVVVVVVVVVVX...',
  'O...vVVVXVVVVXVVVVX...',
  '...vVVVXVVVVXVVVVVXX..',
  '..XXZXXZXXXZXXXZXZ....',
  '...UU....uUU..........',
];

export const anciao = {
  id: 'anciao',
  name: 'Ancião',
  palette: ANCIAO_PALETTE,
  localW: 22,
  dir: {
    down: { head: AN_D_HEAD, torso: [AN_D_TORSO, AN_D_TORSO_A], torsoB: AN_D_TORSO_B, legs: [AN_D_LEGS, AN_D_LEGS_A], legsB: AN_D_LEGS_B },
    up: { head: AN_U_HEAD, torso: [AN_U_TORSO, AN_U_TORSO_A], torsoB: AN_U_TORSO_B, legs: [AN_U_LEGS, AN_U_LEGS_A], legsB: AN_U_LEGS_B },
    left: { head: AN_L_HEAD, torso: [AN_L_TORSO, AN_L_TORSO_BACK, AN_L_TORSO_FWD], legs: [AN_L_LEGS, AN_L_LEGS_A, AN_L_LEGS_B] },
  },
};

// ============================================================ ESTALAJADEIRA
// Dona da estalagem. Alta, cabelo ruivo em rabo de cavalo alto, blusa
// branca de mangas arregaçadas, colete escuro amarrado, saia azul-petróleo,
// pano de prato preso no cinto.
const ESTALAJADEIRA_PALETTE = {
  // cabelo ruivo
  h: '#ffa070', H: '#e45a30', J: '#a8341e', K: '#6a1e14',
  // pele
  s: '#ffeadc', S: '#f6c6a8', T: '#d0907a', t: '#9c5e54', m: '#ec8a86',
  // olhos
  e: '#2a1a1a', i: '#3e9a62', W: '#ffffff',
  // blusa branca
  w: '#ffffff', c: '#e4e4f0', C: '#aeb0c8',
  // colete escuro
  n: '#7a5444', N: '#4e3228', M: '#2e1c18',
  // cinto / ilhoses
  l: '#b07a48', L: '#7a4e2c', y: '#ffe08a',
  // saia azul-petróleo
  a: '#5aa2b6', A: '#36728c', Z: '#1e4658',
  // botas
  u: '#7a4a34', U: '#4a2a1c',
};

const ES_D_HEAD = [
  '..........hhHJ......',
  '.........hHHHHHJ....',
  '.........hHJ.JHHJ...',
  '.......hhMNh..JHJ...',
  '.....hhHHHHHHJJHJ...',
  '....hHhHHHHHHHHJHJ..',
  '...hHhHHHHHHHHHHJHJ.',
  '...HhHHHHHJJHHHHJHJ.',
  '...JHHHJHHHHJJHHJHJ.',
  '...JHJSSSSSSSSJHJHJ.',
  '...JSSeeSSSSeeSSJ.JJ',
  '...JSSWiSSSSWiSSJ...',
  '....STSSSSSSSSTS....',
  '.....TSSSttSSST.....',
];
const ES_D_TORSO = [
  '.......cwSSwc.......',
  '...cwwwNwwwwNwwwc...',
  '...wwwwNNwwNNwwwwC..',
  '...cwCNNnyNnNNCwcC..',
  '...SSnNNnNNnNNNnSS..',
  '...SSnNNNyNNNNNnSS..',
  '...SS.NnNNNNNnN.SS..',
  '......LlLLyLLwcL....',
  '.....aAAAAAAAwcZ....',
];
const ES_D_TORSO_A = [
  '.......cwSSwc.......',
  '...cwwwNwwwwNwwwc...',
  '...wwwwNNwwNNwwwwC..',
  '...cwCNNnyNnNNCwcC..',
  '...SSnNNnNNnNNNnSS..',
  '...SSnNNNyNNNNNnSS..',
  '....SnNnNNNNNnN.SS..',
  '......LlLLyLLwcLSS..',
  '.....aAAAAAAAwcZ....',
];
const ES_D_LEGS = [
  '.....aAAAAAAAAAZ....',
  '.....aAAAZAAAAAZ....',
  '....aAAAZAAAZAAAZ...',
  '....aAAZAAAAZAAAZ...',
  '....ZAZZZAZZZAZZZ...',
  '......uUU..uUU......',
];
const ES_D_LEGS_A = [
  '.....aAAAAAAAAAZ....',
  '.....aAAAZAAAAAZ....',
  '....aAAAZAAAZAAAZ...',
  '...aAAZAAAAZAAAZ....',
  '...ZAZZZAZZZAZZZ....',
  '.....uUU............',
];

const ES_U_HEAD = [
  '...........hH.......',
  '..........hHHJ......',
  '.........hHJJ.......',
  '.......hhMNhHJ......',
  '.....hhHHHMNHHJ.....',
  '....hHhHHHhHJHHJ....',
  '...hHhHHHHhHJHHHJ...',
  '...HhHHHHHhHJHHHJ...',
  '...JHHHJHHhHJHJHJ...',
  '...JHHJHHHhHJHHJJ...',
  '...JJHHHHhHHJHHJJ...',
  '....JJHHHhHJJHJJ....',
  '.....TJJJhHJJJT.....',
  '.....TTSShHJSTT.....',
];
const ES_U_TORSO = [
  '.......cwhHJc.......',
  '...cwwwNNhJNNwwwc...',
  '...wwwwNNNJNNNwwwC..',
  '...cwCNNNNNNNNCwcC..',
  '...SSnNNNNNNNNNnSS..',
  '...SSnNNNNNNNNNnSS..',
  '...SS.NNNNNNNNN.SS..',
  '......LLLLLLLLLL....',
  '.....aAAAAAAAAAZ....',
];
const ES_U_TORSO_A = [
  '.......cwhHJc.......',
  '...cwwwNNhJNNwwwc...',
  '...wwwwNNNJNNNwwwC..',
  '...cwCNNNNNNNNCwcC..',
  '...SSnNNNNNNNNNnSS..',
  '...SSnNNNNNNNNNnSS..',
  '....SnNNNNNNNNN.SS..',
  '......LLLLLLLLLLSS..',
  '.....aAAAAAAAAAZ....',
];

const ES_L_HEAD = [
  '..........hhHJ......',
  '.........hHHHHHJ....',
  '.......hhNMHJJHHJ...',
  '.....hhHHHHHJ..JHJ..',
  '....hHhHHHHHHJ..JHJ.',
  '...hHhHHHHHHHHJ.JHJ.',
  '...HhHHHHHHHHHJ.JHJ.',
  '..JHHHJHHHHHHHJ..JJ.',
  '..JHSSJHHHHHHHJ.....',
  '...SSSSSJHHHHJJ.....',
  '..SSSeSSStJHJJ......',
  '..SSSiSSSTJJJ.......',
  '.SSSSSSSST..........',
  '..TStSSSTT..........',
];
const ES_L_TORSO = [
  '......cSSwc.........',
  '.....cwwwwwN........',
  '....NNcwwwwCN.......',
  '....yNNcwwCNN.......',
  '....NNNNSSNNN.......',
  '....nNNNSSNNN.......',
  '....nNNNSSNNN.......',
  '....LLLLTTLLL.......',
  '....aAAAAAAAZ.......',
];
const ES_L_TORSO_BACK = [
  '......cSSwc.........',
  '.....cwwwwwN........',
  '....NNcwwwwCN.......',
  '....yNNNcwwCN.......',
  '....NNNNNNSSN.......',
  '....nNNNNNNSS.......',
  '....nNNNNNNSS.......',
  '....LLLLLLLLL.......',
  '....aAAAAAAAZ.......',
];
const ES_L_TORSO_FWD = [
  '......cSSwc.........',
  '.....cwwwwwN........',
  '....NcwwwwCNN.......',
  '...cwwwwCNNNN.......',
  '..SSNNNNNNNNN.......',
  '..SSnNNNNNNNN.......',
  '....nNNNNNNNN.......',
  '....LLLLLLLLL.......',
  '....aAAAAAAAZ.......',
];
const ES_L_LEGS = [
  '....aAAAAAAAZ.......',
  '....aAAZAAAAZ.......',
  '...aAAZAAAZAAZ......',
  '...aAZAAAZAAAZ......',
  '...ZZAZZZAZZZZ......',
  '....uUU.............',
];
const ES_L_LEGS_A = [
  '....aAAAAAAAZ.......',
  '...aAAAZAAAAAZ......',
  '..aAAZAAAZAAAAZ.....',
  '..aAZAAAZAAAZAAZ....',
  '..ZZAZZZAZZZZAZZ....',
  '.uUU.........UU.....',
];
const ES_L_LEGS_B = [
  '....aAAAAAAAZ.......',
  '....aAAZAAAAAZ......',
  '...aAAZAAAZAAAZ.....',
  '...aAZAAAZAAAZAZ....',
  '...ZZAZZZAZZZZZZ....',
  '...UU.....uUU.......',
];

export const estalajadeira = {
  id: 'estalajadeira',
  name: 'Estalajadeira',
  palette: ESTALAJADEIRA_PALETTE,
  localW: 20,
  armW: 5,
  dir: {
    down: { head: ES_D_HEAD, torso: [ES_D_TORSO, ES_D_TORSO_A], legs: [ES_D_LEGS, ES_D_LEGS_A] },
    up: { head: ES_U_HEAD, torso: [ES_U_TORSO, ES_U_TORSO_A], legs: [ES_D_LEGS, ES_D_LEGS_A] },
    left: { head: ES_L_HEAD, torso: [ES_L_TORSO, ES_L_TORSO_BACK, ES_L_TORSO_FWD], legs: [ES_L_LEGS, ES_L_LEGS_A, ES_L_LEGS_B] },
  },
};

// ============================================================ MINEIRO
// Mineiro (refugiado da caverna de cristal). Gorro de couro duro com uma
// lamparina de vela, rosto sujo de fuligem, macacão jeans gasto sobre
// camisa mostarda desbotada, picareta apoiada no ombro.
const MINEIRO_PALETTE = {
  // couro do gorro
  l: '#c89060', L: '#8e5c34', D: '#5a3820',
  // vela / chama / latão
  '*': '#fffbe0', f: '#ffb040', w: '#f8f0e0', c: '#d8ccb4', y: '#ffe08a', Y: '#b08a38',
  // cabelo
  h: '#5a4038', H: '#38262a',
  // pele + fuligem
  s: '#fbd6b6', S: '#e4aa82', T: '#b47a5a', t: '#7e4c3a', x: '#9a7e78', X: '#5e4a4a',
  // olhos
  e: '#1a1414', i: '#4a3a30', W: '#ffffff',
  // camisa mostarda desbotada
  r: '#e8c470', R: '#b88c3e', Q: '#7a5a26',
  // macacão
  b: '#8ea2c0', B: '#5a6d8e', N: '#3a4662',
  // ferro da picareta / cabo
  g: '#e2e6f0', G: '#9aa2b8', F: '#5a6078', o: '#d29a5e', O: '#8e5e34',
  // botas
  u: '#7a5844', U: '#46322a',
};

const MI_D_HEAD = [
  '..........f...........',
  '.........f*f..........',
  '.gGG......w...........',
  'gGOGF..lLLwcLLD.......',
  'G.O.FlLlLyYYyLLLD.....',
  '..O.lLlLLLyYLLLLLD....',
  '..O.lLLLLLLLLLLLLD....',
  '..ODDDDDDDDDDDDDDDD...',
  '..O..hSSSSSSSSSSh.....',
  '..O.hSSeeSSSSeeSSh....',
  '..O.tSSWixSSSWiSSt....',
  '..O..SxSSSTTSSSSxS....',
  '..O..TXSStttSSXST.....',
  '..O...TTSSSSSSTT......',
];
const MI_D_TORSO = [
  '..O....rRRSSRRQ.......',
  '..O.rRbBRRRRRRBbRQ....',
  '.SSSrRbBRRRRRRBbRRQ...',
  '.SSrRRbBBBBBBBBbRRQ...',
  '...rRRbByyBBBBBbRRQ...',
  '....RRbBBBBBBBBNRRQ...',
  '....RbBBBBBBBBBBNSS...',
  '....bBBBBBNNBBBBNSS...',
  '....bBBBBBNNBBBBN.....',
];
const MI_D_TORSO_A = [
  '..O....rRRSSRRQ.......',
  '..O.rRbBRRRRRRBbRQ....',
  '.SSSrRbBRRRRRRBbRRQ...',
  '.SSrRRbBBBBBBBBbRRQ...',
  '...rRRbByyBBBBBbRRQ...',
  '....RRbBBBBBBBBNRRQ...',
  '....RbBBBBBBBBBBNRQ...',
  '....bBBBBBNNBBBBNSS...',
  '....bBBBBBNNBBBBNSS...',
];
const MI_D_TORSO_B = [
  '..O....rRRSSRRQ.......',
  '..O.rRbBRRRRRRBbRQ....',
  '.SSSrRbBRRRRRRBbRRQ...',
  '.SSrRRbBBBBBBBBbRRQ...',
  '...rRRbByyBBBBBbRSS...',
  '....RRbBBBBBBBBNSS....',
  '....RbBBBBBBBBBBN.....',
  '....bBBBBBNNBBBBN.....',
  '....bBBBBBNNBBBBN.....',
];
const MI_D_LEGS = [
  '.....bBBBN..bBBBN.....',
  '.....bBBBN..bBBBN.....',
  '.....NNNNN..NNNNN.....',
  '.....uUUUU..uUUUU.....',
  '....uUUUUU..uUUUUU....',
];
const MI_D_LEGS_A = [
  '.....bBBBN..bBBBN.....',
  '.....NNNNN..bBBBN.....',
  '.....uUUUU..NNNNN.....',
  '....uUUUUU..uUUUU.....',
  '............uUUUUU....',
];
const MI_D_LEGS_B = [
  '.....bBBBN..bBBBN.....',
  '.....bBBBN..NNNNN.....',
  '.....NNNNN..uUUUU.....',
  '.....uUUUU.uUUUUU.....',
  '....uUUUUU............',
];

const MI_U_HEAD = [
  '..........f...........',
  '.........f*f..........',
  '..........w.......GGg.',
  '.......lLLLLLLD..FGOGg',
  '.....lLlLLLLLLLLDF.O.G',
  '....lLlLLLLLLLLLLD.O..',
  '....lLLLLLLLLLLLLD.O..',
  '...DDDDDDDDDDDDDDDDO..',
  '.....hhhHhhHhhhH...O..',
  '....hhHhhHhhHhhHH..O..',
  '....thHhhhHhhhHHt..O..',
  '.....HhhHhhhHhHH...O..',
  '......TSSSSSSSST...O..',
  '......TTSSSSSSTT...O..',
];
const MI_U_TORSO = [
  '.......QRRRRRRr....O..',
  '....QRbBRRRRRRBbRr.O..',
  '...QRRbBRRRRRRBbRrSSS.',
  '...QRRbBRRRRRRBbRRrSS.',
  '...QRRbBBBBBBBBbRRr...',
  '...QRRNBBBBBBBBbRR....',
  '...SSNBBBBBBBBBBbR....',
  '...SSNBBBBNNBBBBb.....',
  '.....NBBBBNNBBBBb.....',
];
const MI_U_TORSO_A = [
  '.......QRRRRRRr....O..',
  '....QRbBRRRRRRBbRr.O..',
  '...QRRbBRRRRRRBbRrSSS.',
  '...QRRbBRRRRRRBbRRrSS.',
  '...QRRbBBBBBBBBbRRr...',
  '...QRRNBBBBBBBBbRR....',
  '...QRNBBBBBBBBBBbR....',
  '...SSNBBBBNNBBBBb.....',
  '...SSNBBBBNNBBBBb.....',
];
const MI_U_TORSO_B = [
  '.......QRRRRRRr....O..',
  '....QRbBRRRRRRBbRr.O..',
  '...QRRbBRRRRRRBbRrSSS.',
  '...QRRbBRRRRRRBbRRrSS.',
  '...SSRbBBBBBBBBbRRr...',
  '....SSNBBBBBBBBbRR....',
  '.....NBBBBBBBBBBbR....',
  '.....NBBBBNNBBBBb.....',
  '.....NBBBBNNBBBBb.....',
];
const MI_U_LEGS = [
  '.....NBBBb..NBBBb.....',
  '.....NBBBb..NBBBb.....',
  '.....NNNNN..NNNNN.....',
  '.....UUUUu..UUUUu.....',
  '....UUUUUu..UUUUUu....',
];
const MI_U_LEGS_A = [
  '.....NBBBb..NBBBb.....',
  '.....NNNNN..NBBBb.....',
  '.....UUUUu..NNNNN.....',
  '....UUUUUu..UUUUu.....',
  '............UUUUUu....',
];
const MI_U_LEGS_B = [
  '.....NBBBb..NBBBb.....',
  '.....NBBBb..NNNNN.....',
  '.....NNNNN..UUUUu.....',
  '.....UUUUu.UUUUUu.....',
  '....UUUUUu............',
];

const MI_L_HEAD = [
  '......f...............',
  '.....f*f..............',
  '......w...............',
  '.....wcLLLLLLD........',
  '...YyyLLlLLLLLLD......',
  '...YYlLlLLLLLLLLD.....',
  '....lLLLLLLLLLLLD.....',
  '.DDDDDDDDDDDLLLLDg....',
  '...hSSSSSShHHHHhFGg...',
  '..SSSSSSSSHHHHHhOFG...',
  '..SSeSSSStHHHHhO..g...',
  '..xSiSxSStTHHhO.......',
  '.SSSSSSSSXThhO........',
  '..TXttSSSTTO..........',
];
const MI_L_TORSO = [
  '.....rRRSSQO..........',
  '....rRRbBRO...........',
  '....rRbBSSSQ..........',
  '....rRbBSSSQ..........',
  '....bBByyBBBN.........',
  '....bBBBBBBBN.........',
  '....bBBBBBBBN.........',
  '....bBBBBBBBN.........',
  '....bBBBBBBBN.........',
];
const MI_L_LEGS = [
  '.....bBBBBN...........',
  '.....bBBBBN...........',
  '.....NNNNNN...........',
  '....uUUUUU............',
  '...uUUUUUU............',
];
const MI_L_LEGS_A = [
  '.....bBBBBBBN.........',
  '....bBBN..bBBN........',
  '...NNNN....NNNN.......',
  '..uUUUU....uUUUU......',
  '.uUUUUU....uUUUUU.....',
];
const MI_L_LEGS_B = [
  '.....BBBBbBBN.........',
  '....NBBN..bBBN........',
  '...NNNN....NNNN.......',
  '..UUUUU....uUUUU......',
  '.UUUUUU....uUUUUU.....',
];

export const mineiro = {
  id: 'mineiro',
  name: 'Mineiro',
  palette: MINEIRO_PALETTE,
  localW: 22,
  dir: {
    down: { head: MI_D_HEAD, torso: [MI_D_TORSO, MI_D_TORSO_A], torsoB: MI_D_TORSO_B, legs: [MI_D_LEGS, MI_D_LEGS_A], legsB: MI_D_LEGS_B },
    up: { head: MI_U_HEAD, torso: [MI_U_TORSO, MI_U_TORSO_A], torsoB: MI_U_TORSO_B, legs: [MI_U_LEGS, MI_U_LEGS_A], legsB: MI_U_LEGS_B },
    left: { head: MI_L_HEAD, torso: [MI_L_TORSO, MI_L_TORSO, MI_L_TORSO], legs: [MI_L_LEGS, MI_L_LEGS_A, MI_L_LEGS_B] },
  },
};

export const NPCS = [odessa, varek, soldado, pescador, mercadora, crianca, menina, anciao, estalajadeira, mineiro];
