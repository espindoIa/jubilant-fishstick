// SENA — Sacerdotisa. Guardiã do santuário de Vila Maré, amiga de infância de Lio.
// Cabelo prateado-lavanda com franja reta, trança sobre o ombro, laço turquesa,
// camélia branca, veste branca de mangas largas, faixa vermelha com sininho,
// saia-calça turquesa plissada. Luta com um cajado de lua crescente.

export const SENA_PALETTE = {
  // cabelo prata-lavanda
  h: '#fbf8ff', H: '#cdc4ec', J: '#9086c2', K: '#5a4f8a',
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
  y: '#ffe68a', Y: '#c8962e',
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
const D_HEAD = [
  '.......hhHHHH.......',
  '.....hhHHHHHHHH.....',
  '....hHHHHHHHHHHHfF..',
  '...hHHhhHHHHHHHFfFf.',
  '..hHHhHHHHHHHHHHJf..',
  '..HHhHHHHHHHHHHHHJ..',
  '..HhHHHHHHHHHHHHHJ..',
  '..HhHHJHHHJJHHJHHJ..',
  '..HhSSeeSSSSeeSSHJ..',
  '..HhSSWiSSSSWiSSHJ..',
  '..HhSSSSSSSSSSSSHJ..',
  '..hHJSSSSmmSSSSJHJ..',
  '..HhHJTSSSSSSTJHHJ..',
  '..hHH.JTTSSTTJ.JHJ..',
];
const D_TORSO = [
  '..Hh...cTTTTc..HJ...',
  '..hH..cwwAAwwc.JJ...',
  '.cHhwwwwwAAwwwwc....',
  '.cwhHwwwwAAwwwwwC...',
  '.cwHhwCwSssSwCwwC...',
  '.cwhHwCRRSSRRCwwCX..',
  'cwwrRwCRRyYRRCwwCCX.',
  'cwCwhwCAAAAAACwwCCX.',
  '.cCC.aAAAAAAAAZ.CX..',
];
const D_TORSO_A = [
  '..Hh...cTTTTc..HJ...',
  '..hH..cwwAAwwc.JJ...',
  '.cHhwwwwwAAwwwwc....',
  '.cwhHwwwwAAwwwwwC...',
  '.cwHhwCwSssSwCwwC...',
  '.cwhHwCRRSSRRCwwC...',
  '.cwrRwCRRyYRRCwwCX..',
  'cwCwhwCAAAAAACwwCCX.',
  'cCC..aAAAAAAAAZ.CCX.',
];
const D_LEGS = [
  '.....aAAAAAAAAZ.....',
  '....aAAAAZAAAAAZ....',
  '....aAAAZAAAZAAZ....',
  '...aAAAAZAAAAZAAZ...',
  '...aAZAAAZAAAZAAZ...',
  '.....uUU....uUU.....',
];
const D_LEGS_A = [
  '.....aAAAAAAAAZ.....',
  '....aAAAAZAAAAAZ....',
  '...aAAAAZAAAZAAZ....',
  '...aAAAAZAAAAZAAZ...',
  '..aAZAAAZAAAZAAZ....',
  '...uUU..............',
];

// ============================================================ COSTAS
const U_HEAD = [
  '.......hhHHHH.......',
  '.....hhHHHHHHHH.....',
  '....hHHHHHHHHHHHH...',
  '...hHHhhHHHHHHHHHJ..',
  '..hHHhHHHHHHHHHHHJ..',
  '..HHhHHHHHHHHHHHHJ..',
  'f.HhHHHHHHHHHHHHHJ..',
  'FfHhHHHHHHHHHHHJHJ..',
  '.fHhHHHHHHHHHHHJHJ..',
  '..HhHHHHHHHHHHHJHJ..',
  '..HhHHHHHJHHHHHJHJ..',
  '..hHHHHHHJHHHHJHHJ..',
  '..HhHHHaAAAAZHHJHJ..',
  '..hHHHaAAZZAAZHJHJ..',
];
const U_TORSO = [
  '..HhHaAAZhHZAAZHJ...',
  '..hHHcAZ.HJ.ZAJJ....',
  '.cwwHhwwwHJwwwwc....',
  '.cwwHhwwwHJwwwwwC...',
  '.cwwwHhwwHJwwwwwC...',
  '.cwwwCCRRHJRRCCwCX..',
  'cwwwCCRRRKRRRCCwCCX.',
  'cwCwwCAAAAAAACwwCCX.',
  '.cCC.aAAAAAAAAZ.CX..',
];
const U_TORSO_A = [
  '..HhHaAAZhHZAAZHJ...',
  '..hHHcAZ.HJ.ZAJJ....',
  '.cwwHhwwwHJwwwwc....',
  '.cwwHhwwwHJwwwwwC...',
  '.cwwwHhwwHJwwwwwC...',
  '.cwwwCCRRHJRRCCwC...',
  '.cwwCCRRRKRRRCCwCX..',
  'cwCwwCAAAAAAACwwCCX.',
  'cCC..aAAAAAAAAZ.CCX.',
];

// ============================================================ LADO (esquerda)
const L_HEAD = [
  '........hhHHH.......',
  '......hhHHHHHHH.....',
  '.....hHHHHHHHHHH....',
  '....hHhHHHHHHHHHJ...',
  '...hHhHHHHHHHHHHHJ..',
  '...HhHHHHHHHHHHHHJ..',
  '..JHHHHHHHHHHHHHHJ..',
  '..JHHHJHHHHJHHHHHJ..',
  '...SSsSHJHHHHHHHHJ..',
  '..SSSSeSSJHHHHHHHJ..',
  '..SSSSiSSTJHHHHHHJf.',
  '.SSSSSSSSSJHHHHHJfFf',
  '..TmSSSSSTJHHHHHJ.f.',
  '...TTSSSTT.JHHHJJ...',
];
const L_TORSO = [
  '......cTTc..aAAZ....',
  '.....cwwAAwaAZAAZ...',
  '....cwwwwAwHHJ......',
  '....cwwwwwwHHJ......',
  '...cwwCwwwwcHJ......',
  '...cwCwSSwwwCJ......',
  '...cwCRSSRRRCX......',
  '...ccCAAAAAAAX......',
  '....CCAAAAAAAZ......',
];
const L_TORSO_FWD = [
  '......cTTc..aAAZ....',
  '.....cwwAAwaAZAAZ...',
  '....cwwwwAwHHJ......',
  '...ccwwwwwwHHJ......',
  '..cwwwCwwwwcHJ......',
  '.cwwCSSwwwwwCJ......',
  '.cwCCSSRRRRRCX......',
  '..cCCAAAAAAAAX......',
  '.....CAAAAAAAZ......',
];
const L_TORSO_BACK = [
  '......cTTc..aAAZ....',
  '.....cwwAAwaAZAAZ...',
  '....cwwwwAwHHJ......',
  '....cwwwwwccHJ......',
  '....cwwwwwwwcJ......',
  '....cwRRRwCwwC......',
  '....cCRRRRCSSCX.....',
  '....CCAAAAACSSX.....',
  '.....CAAAAAAAZ......',
];
const L_LEGS = [
  '.....aAAAAAAZ.......',
  '....aAAAZAAAZ.......',
  '....aAAZAAAAAZ......',
  '...aAAZAAAZAAZ......',
  '...aAZAAAZAAAZ......',
  '..uUU...............',
];
const L_LEGS_A = [
  '.....aAAAAAAZ.......',
  '....aAAAZAAAAZ......',
  '...aAAZAAAZAAAZ.....',
  '..aAAZAAAZAAAZAZ....',
  '..aAZAAAZAAAZAAZ....',
  '.uUU.........UU.....',
];
const L_LEGS_B = [
  '.....aAAAAAAZ.......',
  '....aAAAZAAAZ.......',
  '...aAAZAAAAAAZ......',
  '...aAZAAAZAAAAZ.....',
  '..aAZAAAZAAAZAZ.....',
  '..UU........uUU.....',
];

// ============================================================ BATALHA
const STAFF_TOP = [
  '..gGG...',
  '.g...G..',
  'g..y..E.',
  'G..Y..E.',
  '.G...E..',
  '..GoE...',
];

function withStaff(rows, x, y) {
  const out = rows.map((r) => r.split(''));
  STAFF_TOP.forEach((line, j) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== '.' && out[y + j]) out[y + j][x + i] = line[i];
    }
  });
  return out.map((r) => r.join(''));
}

const B_IDLE_BASE = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '..........hhHHH.........',
  '........hhHHHHHHH.......',
  '.......hHHHHHHHHHH......',
  '......hHhHHHHHHHHHJ.....',
  '.....hHhHHHHHHHHHHHJ....',
  '.....HhHHHHHHHHHHHHJ....',
  '....JHHHHHHHHHHHHHHJ....',
  '....JHHHJHHHHJHHHHHJ....',
  '.....SSsSHJHHHHHHHHJ....',
  '....SSSSeSSJHHHHHHHJ....',
  '..o.SSSSiSSTJHHHHHHJf...',
  '..O.SSSSSSSSJHHHHHJfFf..',
  '..O.TmSSSSSTJHHHHHJ.f...',
  '..O..TTSSSTT.JHHHJJ.....',
  '..O.....cTTc..aAAZ......',
  '..O....cwwAAwaAZAAZ.....',
  '..O...cwwwwAwHHJ........',
  '.cO..cwwwwwwHHJ.........',
  'cwSScwwCwwwwcHJ.........',
  'cwSSwwCwwwwwwCJ.........',
  '.cOCRRRRRRRRRCX.........',
  '..OCAAAAAAAAAX..........',
  '..O.CAAAAAAAAZ..........',
  '..O.aAAZAAAAAAZ.........',
  '..OaAAZAAAZAAAZ.........',
  '..aAAZAAAZAAAAAZ........',
  '..aAZAAAZAAAZAAZ........',
  '.uUU........uUU.........',
];
const B_IDLE = withStaff(B_IDLE_BASE, 0, 9);

const B_CAST_BASE = [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '.....O....................',
  '.....O....hhHHH...........',
  '....cSS.hhHHHHHHH.........',
  '....cSShHHHHHHHHHH........',
  '....cwhHhHHHHHHHHHJ.......',
  '....cwHhHHHHHHHHHHHJ......',
  '....cwHHHHHHHHHHHHHJ......',
  '....cwHHJHHHHJHHHHHJ......',
  '....cwSsSHJHHHHHHHHJ......',
  '....SSSSeSSJHHHHHHHJ......',
  '....SSSSiSSTJHHHHHHJf.....',
  '...SSSSSSSSSJHHHHHJfFf....',
  '....TmSSSSSTJHHHHHJ.f.....',
  '.....TTSSSTT.JHHHJJ.......',
  '........cTTc..aAAZ........',
  '.......cwwAAwaAZAAZ.......',
  '......cwwwwAwHHJ..........',
  '......cwwwwwwHHJ..........',
  '.....cwwCwwwwcHJ..........',
  '.....cwCwwwwwwCJ..........',
  '.....cCRRRRRRRCX..........',
  '.....CCAAAAAAAX...........',
  '......CAAAAAAAZ...........',
  '.....aAAZAAAAAAZ..........',
  '....aAAZAAAZAAAZ..........',
  '....aAAZAAAZAAAAAZ........',
  '...aAZAAAZAAAZAAZ.........',
  '...uUU........uUU.........',
];
const B_CAST = withStaff(B_CAST_BASE, 2, 0).map((r, y) => (y === 0 ? r.replace(/^(.{1})../, '$1*+') : r));

const B_ATK_BASE = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '.............hhHHH............',
  '...........hhHHHHHHH..........',
  '..........hHHHHHHHHHH.........',
  '.........hHhHHHHHHHHHJ........',
  '........hHhHHHHHHHHHHHJ.......',
  '........HhHHHHHHHHHHHHJ.......',
  '.......JHHHHHHHHHHHHHHJ.......',
  '.......JHHHJHHHHJHHHHHJ.......',
  '........SSsSHJHHHHHHHHJ.......',
  '.......SSSSeSSJHHHHHHHJ.......',
  '.......SSSSiSSTJHHHHHHJf......',
  '......SSSSSSSSSJHHHHHJfFf.....',
  '.......TmSSSSSTJHHHHHJ.f......',
  '........TTSSSTT.JHHHJJ........',
  '...........cTTc..aAAZ.........',
  'ODDDDDDDDOOSSwwAwaAZAAZ.......',
  'ooooooooooSSwwwAwHHJ..........',
  '........cwwwwwwwwHHJ..........',
  '........cwwCwwwwcHJ...........',
  '........cwCwwwwwwCJ...........',
  '........cCRRRRRRRCX...........',
  '........CCAAAAAAAX............',
  '.........CAAAAAAAZ............',
  '.......aAAZAAAAAAZ............',
  '......aAAZAAAZAAAZ............',
  '.....aAAZAAAZAAAAAZ...........',
  '....aAZAAAZAAAZAAZ............',
  '...uUU..........uUU...........',
];
const B_ATTACK = B_ATK_BASE;

const B_HURT = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............hhHHH...........',
  '............hhHHHHHHH.........',
  '...........hHHHHHHHHHH........',
  '..........hHhHHHHHHHHHJ.......',
  '.........hHhHHHHHHHHHHHJ......',
  '.........HhHHHHHHHHHHHHJ......',
  '........JHHHHHHHHHHHHHHJ......',
  '........JHHHJHHHHJHHHHHJ......',
  '.........SSsSHJHHHHHHHHJ......',
  '........SSSSTSSJHHHHHHHJ......',
  '........SSSTTSSTJHHHHHHJf.....',
  '.......SSSSSSSSSJHHHHHJfFf....',
  '........TmSSSSSTJHHHHHJ.f.....',
  '.........TTSSSTT.JHHHJJ.......',
  '............cTTc..aAAZ........',
  '...........cwwAAwaAZAAZ.......',
  '..........cwwwwAwHHJ..........',
  '.........cwwwwwwSSJ...........',
  '.........cwwCwwwSSJ...........',
  '.........cwCwwwwwwCJ..........',
  '.........cCRRRRRRRCX..........',
  '.........CCAAAAAAAX...........',
  '..........CAAAAAAAZ...........',
  '........aAAZAAAAAAZ...........',
  '.......aAAZAAAZAAAZ...........',
  '......aAAZAAAZAAAAAZ..........',
  '.....aAZAAAZAAAZAAZ...........',
  '....uUU..........uUU..........',
];

const B_KO = [
  '................................',
  '................................',
  '................................',
  '.................f..hhHHHHH.....',
  '................fFfhHHHHHHHHH...',
  '.......cwwwwc...JfHHHhHHHHHHHJ..',
  'aAAAZAAcwwwwwccAAJHHHHHHHHHHHJ..',
  'aAZAAZRRwwwwwwwSSJHHJSSSTJHHJ...',
  'aAAZAARRCwwwwwwSSSSSSSSSTJHJ....',
  '.uUAAZRRCCCCCCCCTTTTTTTTJJ......',
];

const B_WIN = [
  '........hhHHHH..............',
  '......hhHHHHHHHH............',
  '.....hHHHHHHHHHHHfF.........',
  '....hHHhhHHHHHHHFfFf........',
  '...hHHhHHHHHHHHHHJf.........',
  '...HHhHHHHHHHHHHHHJ.........',
  '...HhHHHHHHHHHHHHHJ.........',
  '...HhHHJHHHJJHHJHHJ.........',
  '...HhSSTTSSSSTTSSHJ.........',
  '...HhSSSSSSSSSSSSHJ.........',
  '...HhSSSSSSSSSSSSHJ.........',
  '...hHJSSSSmmSSSSJHJ.........',
  '...HhHJTSSSSSSTJHHJ.........',
  '...hHH.JTTSSTTJ.JHJ.........',
  '...Hh...cTTTTc..HJ..........',
  '...hH..cwwAAwwc.JJ..........',
  '..cHhwwwwwAAwwwwc...........',
  '..cwhHwwwwAAwwwwwC..........',
  '..cwHhwCwSssSwCwwC..........',
  '..cwhHwCRRSSRRCwwCX.........',
  '.cwwrRwCRRyYRRCwwCCX........',
  '.cwCwhwCAAAAAACwwCCX........',
  '..cCC.aAAAAAAAAZ.CX.........',
  '......aAAAAAAAAZ............',
  '.....aAAAAZAAAAAZ...........',
  '.....aAAAZAAAZAAZ...........',
  '....aAAAAZAAAAZAAZ..........',
  '....aAZAAAZAAAZAAZ..........',
  '......uUU....uUU............',
];

export const sena = {
  id: 'sena',
  name: 'Sena',
  palette: SENA_PALETTE,
  localW: 20,
  armW: 3,
  dir: {
    down: { head: D_HEAD, torso: [D_TORSO, D_TORSO_A], legs: [D_LEGS, D_LEGS_A] },
    up: { head: U_HEAD, torso: [U_TORSO, U_TORSO_A], legs: [D_LEGS, D_LEGS_A] },
    left: { head: L_HEAD, torso: [L_TORSO, L_TORSO_BACK, L_TORSO_FWD], legs: [L_LEGS, L_LEGS_A, L_LEGS_B] },
  },
  extra: { ko: B_KO },
  battle: {
    idle: B_IDLE,
    windup: B_CAST,
    attack: B_ATTACK,
    cast: B_CAST,
    hurt: B_HURT,
    ko: B_KO,
    win: B_WIN,
  },
};
