// ESTELA — Maga Estelar. Uma estrela que caiu do céu em forma de menina.
// Baixinha, cabelo dourado curto com mechas que brilham em ciano nas pontas,
// capa índigo com fecho de estrela, vestido branco com constelações douradas.
// Ela flutua em vez de andar e luta com um astrolábio flutuante.

export const ESTELA_PALETTE = {
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
const D_HEAD = [
  '......hHHHHHh.......',
  '....hhHHHHHHHHh.....',
  '...hHHHhhhHHHHHJ....',
  '..+HHhhHHHHHHHHHJ+..',
  '..JHhHHHHHHHHHHHHJ..',
  '..JHHHJHHHHHJHHHHJ..',
  '.+JHJHHJHHHJHHJHHJ+.',
  '..JHSSJHSSHJSSHSHJ..',
  '..JJSSeeSSSSeeSSJJ..',
  '..+JSSiWSSSSiWSSJ+..',
  '...JSSSSSSSSSSSSJ...',
  '...+JSSSSmmSSSSJ+...',
  '.....TSSSSSSSST.....',
  '......TTSSSSTT......',
];
const D_TORSO = [
  '......BbyYyBB.......',
  '....bbBByYBBBBN.....',
  '...bbBBwwccwwBBNN...',
  '...bBBNwcyccwNBBN...',
  '...bBBNwccccwNBBN...',
  '...SBBNwcyccwNBBS...',
  '....BBNcccccCNBN....',
  '....NNwcccyccCNN....',
];
const D_TORSO_A = [
  '......BbyYyBB.......',
  '....bbBByYBBBBN.....',
  '...bbBBwwccwwBBNN...',
  '...bBBNwcyccwNBBN...',
  '..bbBBNwccccwNBBNN..',
  '..SbBBNwcyccwNBBN...',
  '...NBBNcccccCNBNS...',
  '....NNwcccyccCNN....',
];
const D_LEGS = [
  '.....wccccccccC.....',
  '.....cccCcccCcC.....',
  '......CC....CC......',
  '.......S....S.......',
];
const D_LEGS_A = [
  '.....wcccccccccC....',
  '.....cccCcccCcC.....',
  '......CC....CC......',
  '.......S.....S......',
];

// ============================================================ COSTAS
const U_HEAD = [
  '......hHHHHHh.......',
  '....hhHHHHHHHHh.....',
  '...hHHHhhhHHHHHJ....',
  '..+HHhhHHHHHHHHHJ+..',
  '..JHhHHHHHHHHHHHHJ..',
  '..JHHHHHHHHHHHHHHJ..',
  '.+JHHHHHHHHHHHHHHJ+.',
  '..JHHHHHJHHJHHHHHJ..',
  '..JJHHHJHHHHJHHHJJ..',
  '..+JJHJHHHHHHJHJJ+..',
  '...JJJHHJHHJHHJJJ...',
  '...+.JJJJJJJJJJ.+...',
  '.....NBBBBBBBBN.....',
  '....NBbbBBBBbbBN....',
];
const U_TORSO = [
  '....BbbBBBBBBbbB....',
  '...bbBBBByBBBBBBN...',
  '...bBBBByyyBBBBBN...',
  '...bBBByyyyyBBBBN...',
  '...bBBBByyyBBBBBN...',
  '...SBBBByBYBBBBBS...',
  '....BBBBBBBBBBBN....',
  '....NNBBBBBBBBNN....',
];
const U_TORSO_A = [
  '....BbbBBBBBBbbB....',
  '...bbBBBByBBBBBBN...',
  '...bBBBByyyBBBBBN...',
  '..bbBBByyyyyBBBBNN..',
  '..bbBBBByyyBBBBBNN..',
  '..SBBBBByBYBBBBBN...',
  '...NBBBBBBBBBBBNS...',
  '....NNBBBBBBBBNN....',
];

// ============================================================ LADO (esquerda)
const L_HEAD = [
  '.......hHHHHh.......',
  '.....hhHHHHHHHh.....',
  '....hHHhhhHHHHHJ....',
  '...hHhhHHHHHHHHHJ...',
  '..JHhHHHHHHHHHHHHJ+.',
  '..JHHJHHHHHHHHHHHHJ*',
  '..JHJHHJHHHHHHHHHHJ+',
  '..JSSJHSHHJHHHHHHHJ.',
  '..SSSSSJHHHHHHHHHJJ+',
  '..SSSSeSSJHHHHHHJJ+.',
  '..SSSSiWSJHHHHHJJ+..',
  '.SSSSSSSSTJHHHJJ+...',
  '..TmSSSSSTJJJJ......',
  '...TTSSSTT..........',
];
const L_TORSO = [
  '......BbyYBB........',
  '.....bBByYBBBN......',
  '....bBwwcBBBBBN.....',
  '....bBwcyBBBBBNN....',
  '....bBwccSSBBBBN....',
  '....bBwcySSBBBBBN...',
  '.....NcccccBBBBBN...',
  '.....wcccycCNBBN....',
];
const L_TORSO_FWD = [
  '......BbyYBB........',
  '.....bBByYBBBN......',
  '....bBwwcBBBBBN.....',
  '....bBwcyBBBBBNN....',
  '...SSBccBBBBBBBN....',
  '...SSwcyBBBBBBBBN...',
  '.....NcccccBBBBBN...',
  '.....wcccycCNBBN....',
];
const L_TORSO_BACK = [
  '......BbyYBB........',
  '.....bBByYBBBN......',
  '....bBwwcBBBBBN.....',
  '....bBwcyBBBBBBN....',
  '....bBwccBBBBBBBN...',
  '....bBwcyBBBBBBBSS..',
  '.....NcccccBBBBBSS..',
  '.....wcccycCNBBN....',
];
const L_LEGS = [
  '.....wccccccC.......',
  '.....cccCcccC.......',
  '......CC..CC........',
  '......S...S.........',
];
const L_LEGS_A = [
  '....wcccccccC.......',
  '....cccCcccCcC......',
  '.....CC...CC........',
  '.....S.....S........',
];
const L_LEGS_B = [
  '.....wcccccccC......',
  '.....cccCccccC......',
  '......CC...CC.......',
  '......S.....S.......',
];

// ============================================================ BATALHA
const ORB = [
  '..*..',
  '.qOq.',
  '*OqO*',
  '.qOq.',
  '..*..',
];
function withOrb(rows, x, y) {
  const out = rows.map((r) => r.split(''));
  ORB.forEach((line, j) => {
    for (let i = 0; i < line.length; i++) if (line[i] !== '.' && out[y + j]) out[y + j][x + i] = line[i];
  });
  return out.map((r) => r.join(''));
}

const B_BODY = [
  '...........hHHHHh.......',
  '.........hhHHHHHHHh.....',
  '........hHHhhhHHHHHJ....',
  '.......hHhhHHHHHHHHHJ...',
  '......JHhHHHHHHHHHHHHJ+.',
  '......JHHJHHHHHHHHHHHHJ*',
  '......JHJHHJHHHHHHHHHHJ+',
  '......JSSJHSHHJHHHHHHHJ.',
  '......SSSSSJHHHHHHHHHJJ+',
  '......SSSSeSSJHHHHHHJJ+.',
  '......SSSSiWSJHHHHHJJ+..',
  '.....SSSSSSSSTJHHHJJ+...',
  '......TmSSSSSTJJJJ......',
  '.......TTSSSTT..........',
  '..........BbyYBB........',
  '.........bBByYBBBN......',
  '........bBwwcBBBBBN.....',
  '........bBwcyBBBBBNN....',
  '......SSbBccBBBBBBBN....',
  '......SSBwcyBBBBBBBBN...',
  '.........NcccccBBBBBN...',
  '.........wcccycCNBBN....',
  '........wccccccC........',
  '........cccCcccC........',
  '.........CC..CC.........',
  '.........S...S..........',
];
const B_IDLE = withOrb(B_BODY, 1, 16);

const B_CAST_BODY = [
  '..*.....................',
  '.*+*.......hHHHHh.......',
  '..*.....hhHHHHHHHh......',
  '...SS..hHHhhhHHHHHJ.....',
  '...SS.hHhhHHHHHHHHHJ....',
  '...bBJHhHHHHHHHHHHHHJ+..',
  '...bBJHHJHHHHHHHHHHHHJ*.',
  '...bBJHJHHJHHHHHHHHHHJ+.',
  '...bBJSSJHSHHJHHHHHHHJ..',
  '....BSSSSSJHHHHHHHHHJJ+.',
  '....SSSSeSSJHHHHHHJJ+...',
  '....SSSSiWSJHHHHHJJ+....',
  '...SSSSSSSSTJHHHJJ+.....',
  '....TmSSSSSTJJJJ........',
  '.....TTSSSTT............',
  '........BbyYBB..........',
  '.......bBByYBBBN........',
  '......bBwwcBBBBBN.......',
  '......bBwcyBBBBBNN......',
  '......bBwccBBBBBBBN.....',
  '......bBwcyBBBBBBBBN....',
  '.......NcccccBBBBBN.....',
  '.......wcccycCNBBN......',
  '......wccccccC..........',
  '......cccCcccC..........',
  '.......CC..CC...........',
  '.......S...S............',
];
const B_CAST = withOrb(B_CAST_BODY, 9, 0).map((r, y) => (y < 0 ? r : r));

const B_ATTACK = withOrb(B_BODY.map((r, y) => {
  // estende as mãos para a frente
  if (y === 18) return '....SSSSbBccBBBBBBBN....';
  if (y === 19) return '....SSSSBwcyBBBBBBBBN...';
  return r;
}), 0, 15).map((r, y) => (y === 17 ? r.replace(/^\.\./, '%*') : r));

const B_HURT = B_BODY.map((r, y) => {
  if (y === 9) return '......SSSSTSSJHHHHHHJJ+.';
  if (y === 10) return '......SSSTTSSJHHHHHJJ+..';
  if (y === 18) return '........bBccBBBBBBSSN...';
  if (y === 19) return '........BwcyBBBBBBSSBN..';
  return r;
});

const B_KO = [
  '................................',
  '................................',
  '................................',
  '................................',
  '...................+hHHHHh+.....',
  '.................+hHHHHHHHHHJ...',
  '.....wcccBBbyBBBJHHJHHHHHHHHJ+..',
  'SccCcwcyccBBBBBBSSJHHHJSSTJHJ...',
  '.SCcccccyBBBBBBBSSSSSSSSTJJ.+...',
  '...CCCCCCNNNNNNNTTTTTTTTJ.......',
];

const B_WIN = [
  '...*..........*.....',
  '..*+*..hHHHHh..*+*..',
  '...*.hhHHHHHHHh.*...',
  '....hHHHhhhHHHHHJ...',
  '...+HHhhHHHHHHHHHJ+.',
  '...JHhHHHHHHHHHHHHJ.',
  '...JHHHJHHHHHJHHHHJ.',
  '..+JHJHHJHHHJHHJHHJ+',
  '...JHSSJHSSHJSSHSHJ.',
  '...JJSSTTSSSSTTSSJJ.',
  '...+JSSSSSSSSSSSSJ+.',
  '....JSSSSSSSSSSSSJ..',
  '....+JSSSmmmSSSSJ+..',
  '......TSSSSSSSST....',
  '...SS..TTSSSSTT.SS..',
  '...SSbBBbyYyBBbBSS..',
  '....bbBByYBBBBNN....',
  '....bBBwwccwwBBN....',
  '....bBNwcyccwNBN....',
  '.....BNwccccwNB.....',
  '.....BNwcyccwNB.....',
  '.....BNcccccCNB.....',
  '.....NNwcccyccCN....',
  '......wccccccccC....',
  '......cccCcccCcC....',
  '.......CC....CC.....',
  '........S....S......',
];

export const estela = {
  id: 'estela',
  name: 'Estela',
  palette: ESTELA_PALETTE,
  localW: 20,
  armW: 4,
  floats: true,
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
