// BRANN — Guardião. Ex-cavaleiro do Império de Ferro que desertou.
// Enorme, pele bronzeada escura, cabelo raspado com têmporas grisalhas,
// barba cheia, cicatriz no nariz. Armadura amassada com o brasão imperial
// raspado, capa verde esfarrapada. Luta com lança e escudo-torre.

export const BRANN_PALETTE = {
  // cabelo/barba
  h: '#6e6e80', H: '#3c3c4c', J: '#24242e', K: '#14141a', v: '#c4c4d4', V: '#8a8a9e',
  // pele
  s: '#e0a476', S: '#b4703f', T: '#80462a', t: '#56301c', x: '#f0bc94',
  // olhos
  e: '#120a06', W: '#ffffff',
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
};

// ============================================================ FRENTE
const D_HEAD = [
  '.........hhHHHHh........',
  '.......vhHHHHHHHHv......',
  '......vvHHHHHHHHHHv.....',
  '......vJHHHHHHHHHHJv....',
  '......JSSSSSSSSSSSSJ....',
  '.....sSJJJSSSSSSJJJSs...',
  '.....SSSeWSSSSSSeWSSS...',
  '......SSSSSxSSSSSSSS....',
  '......TSSSSxSSSSSSST....',
  '......THHHSSTTSSHHHT....',
  '......HHJHHHTTHHJHHH....',
  '......JHHJHHHHHHJHHJ....',
  '.......JHVHHJJHHVHJ.....',
  '........JJHHHHHHJJ......',
];
const D_TORSO = [
  '...gGGg..FEJJJJEF.gGGg..',
  '.gGggGGF.FFEEEEFF.FGGggG',
  'GggGGGGFGGgGGGGGFGFGGGGF',
  'GgGGGGFGGgGrRRrGGGFFGGGF',
  'FGGGGFAGGgrRRrRGGGFAFGGF',
  'SFGGFAAGGGGRrRGGGFFAAFGS',
  'SSFFZAAFGGGGGGGGGFFAAZSS',
  'GSSZAAAFFGGGGGGGFFFAAZSG',
  '.GGAAAlLLLLLyYLLLLlAAGG.',
  '...AAAFGGFFEEFFGGFAAA...',
  '...ZAZFGGF....FGGFZAZ...',
];
const D_TORSO_A = [
  '...gGGg..FEJJJJEF.gGGg..',
  '.gGggGGF.FFEEEEFF.FGGggG',
  'GggGGGGFGGgGGGGGFGFGGGGF',
  'GgGGGGFGGgGrRRrGGGFFGGGF',
  'FGGGGFAGGgrRRrRGGGFAFGGF',
  'GFGGFAAGGGGRrRGGGFFAAFGS',
  'SSFFZAAFGGGGGGGGGFFAAZSS',
  'SSSZAAAFFGGGGGGGFFFAAZSG',
  '.GGAAAlLLLLLyYLLLLlAAGG.',
  '...AAAFGGFFEEFFGGFAAA...',
  '...ZAZFGGF....FGGFZAZ...',
];
const D_LEGS = [
  '......FGGF....FGGF......',
  '......EFGF....FGFE......',
  '.....FGGGFE..EFGGGF.....',
  '.....EEEEEE..EEEEEE.....',
];
const D_LEGS_A = [
  '......FGGF....FGGF......',
  '.....FGGGFE...FGFE......',
  '.....EEEEEE..EFGGGF.....',
  '.............EEEEEE.....',
];

// ============================================================ COSTAS
const U_HEAD = [
  '.........hhHHHHh........',
  '.......vhHHHHHHHHv......',
  '......vvHHHHHHHHHHv.....',
  '......vHHHHHHHHHHHHv....',
  '......vHHHHHHHHHHHHv....',
  '.....sJHHHHHHHHHHHHJs...',
  '.....SJJHHHHHHHHHHJJS...',
  '......JJJHHHHHHHHJJJ....',
  '......TJJJJJJJJJJJJT....',
  '......TTSSSSSSSSSSTT....',
  '......TTTSSSSSSSSTTT....',
  '.......TTTTSSSSTTTT.....',
  '........KKTTTTTTKK......',
  '........JJKKKKKKJJ......',
];
const U_TORSO = [
  '...gGGgAAAAAAAAAAgGGg...',
  '.gGggGAaaAAAAAAaaAGGggG.',
  'GggGGGAaAAAAAAAAAAGGGGGF',
  'GgGGGGAaAAAAAAAAAAFGGGGF',
  'FGGGGFAAAAAZAAAAAAFFGGGF',
  'SFGGFAAAAAZAAAZAAAAAFFGS',
  'SSFFAAAAAAZAAAZAAAAAAFSS',
  'GSSAAAAAZAAAZAAAAZAAAZSG',
  '.GGAAAAZAAAZAAAAZAAAZGG.',
  '...AAZAAZAAZAAZAAZAZA...',
  '...ZA.ZA.ZA..AZ.AZ.AZ...',
];
const U_TORSO_A = [
  '...gGGgAAAAAAAAAAgGGg...',
  '.gGggGAaaAAAAAAaaAGGggG.',
  'GggGGGAaAAAAAAAAAAGGGGGF',
  'GgGGGGAaAAAAAAAAAAFGGGGF',
  'FGGGGFAAAAAZAAAAAAFFGGGF',
  'GFGGFAAAAAZAAAZAAAAAFFGS',
  'SSFFAAAAAAZAAAZAAAAAAFSS',
  'SSSAAAAAZAAAZAAAAZAAAZSG',
  '.GGAAAAZAAAZAAAAZAAAZGG.',
  '...AAZAAZAAZAAZAAZAZA...',
  '...ZA.ZA.ZA..AZ.AZ.AZ...',
];

// ============================================================ LADO (esquerda)
const L_HEAD = [
  '..........hhHHHh........',
  '........hhHHHHHHHv......',
  '.......hHHHHHHHHHHv.....',
  '.......JHHHHHHHHHHHv....',
  '......sSSSSHHHHHHHHv....',
  '.....SJJJSSJHHHHHHHJ....',
  '.....SSeWSSSJHHHHHJJ....',
  '....SSSSSSxSSTSSHHJ.....',
  '...SSSSSSSSSTTSSHJ......',
  '....THHHSSSSTTSHHJ......',
  '....HHHHHHSSSHHHJ.......',
  '.....JHHHHHHHHHJ........',
  '......JHVHHHHJJ.........',
  '.......JJHHHJJ..........',
];
const L_TORSO = [
  '........FEJJEF.gGGgAA...',
  '.......FFEEEEFgGgGGGAAa.',
  '......GGgGGGGgGGGGGGFAA.',
  '......GgGGrRGGGGGGGGFAAZ',
  '......GgGrRRGGGGGGGFFAAZ',
  '......GgGGRGGFGGGGFFAAZ.',
  '......GGGGGGFGGGGFFAAZ..',
  '......FGGGGGFSSGFFAAAZ..',
  '......lLLLLLLSSLLMAAZ...',
  '.......FGGFFEEFFAAAZ....',
  '.......FGGF..EFAAZ......',
];
const L_TORSO_FWD = [
  '........FEJJEF.gGGgAA...',
  '.......FFEEEEFgGgGGGAAa.',
  '......GGgGGGGgGGGGGGFAA.',
  '.....gGgGGrRGGGGGGGGFAAZ',
  '....gGGgGrRRGGGGGGGFFAAZ',
  '...GGGFGGGRGGGGGGGFFAAZ.',
  '..SSFFGGGGGGGGGGGFFAAZ..',
  '..SSGFGGGGGGGGGGFFAAAZ..',
  '......lLLLLLLLLLLMAAZ...',
  '.......FGGFFEEFFAAAZ....',
  '.......FGGF..EFAAZ......',
];
const L_TORSO_BACK = [
  '........FEJJEF.gGGgAA...',
  '.......FFEEEEFgGgGGGAAa.',
  '......GGgGGGGgGGGGGGFAA.',
  '......GgGGrRGGGgGGGGFAAZ',
  '......GgGrRRGGGGgGGGFAAZ',
  '......GgGGRGGGGGGgGGAAZ.',
  '......GGGGGGGGGGGFGSSZ..',
  '......FGGGGGGGGGFFGSSZ..',
  '......lLLLLLLLLLLMAAZ...',
  '.......FGGFFEEFFAAAZ....',
  '.......FGGF..EFAAZ......',
];
const L_LEGS = [
  '.......FGGGF............',
  '.......EFGGF............',
  '.....FGGGGFE............',
  '.....EEEEEEE............',
];
const L_LEGS_A = [
  '......FGGF.FGGF.........',
  '.....FGGF...FGGF........',
  '...FGGGFE...EFGGF.......',
  '...EEEEEE...EEEEEE......',
];
const L_LEGS_B = [
  '......FGEF.FGGF.........',
  '.....FGEF...FGGF........',
  '...EFGFEE...FGGGF.......',
  '...EEEEE....EEEEEE......',
];

// ============================================================ BATALHA
// Composto por camadas: corpo, escudo (à frente) e lança (atrás ou em estocada).
const BB_BODY = [
  '...........hhHHHh.............',
  '.........hhHHHHHHHv...........',
  '........hHHHHHHHHHHv..........',
  '........JHHHHHHHHHHHv.........',
  '.......sSSSSHHHHHHHHv.........',
  '......SJJJSSJHHHHHHHJ.........',
  '......SSeWSSSJHHHHHJJ.........',
  '.....SSSSSSxSSTSSHHJ..........',
  '....SSSSSSSSSTTSSHJ...........',
  '.....THHHSSSSTTSHHJ...........',
  '.....HHHHHHSSSHHHJ............',
  '......JHHHHHHHHHJ.............',
  '.......JHVHHHHJJ..AAa.........',
  '.......EFFJJJJFEaAAAAa........',
  '......FGGGGFEgggGFAAAAa.......',
  '.....FGgggGGFgGGGGFAAAAa......',
  '.....FGgrRgGFGGGGGFFAAAAa.....',
  '.....FGgRRrGFFGGGFFEFAAAAZ....',
  '.....FGGRgGGFFFFFEGFAAAAZ.....',
  '.....FGGGGGGFEEEGGFAAAZZ......',
  '......FGGGGGGGGGGGGFAAAZ......',
  '......lLLLLLLLLLLLMMAAAZ......',
  '......FGGFFFFFGGFAAAZZ........',
  '......FGGF.EFGGGFAAZZ.........',
  '......FGGF..EFGGGF.ZZ.........',
  '......FGGF...FGGGF............',
  '.....FGGGF...FGGGGF...........',
  '....FGGGGFE..EFGGGGF..........',
  '....EEEEEEE..EEEEEEE..........',
];
const BB_SHIELD = [
  '....oooo....',
  '..ooOOOOoo..',
  '.oOOOOOOOOo.',
  'oOOOOyyOOOOO',
  'oOOOyYYyOOOO',
  'oOOOOYYOOOOO',
  'oOOOOOOOOOOD',
  '.oOOOOOOOOD.',
  '.oOOOOOOOOD.',
  '..oOOOOOOD..',
  '...oOOOOD...',
  '....oDDD....',
];
const BB_SPEAR_UP = [
  '.g.', 'gGF', 'gGF', '.G.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.',
  'SOS', 'SOS', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.O.', '.D.',
];
const BB_SPEAR_THRUST = ['gG...........', 'gGGFOOOOOOOOOSS', 'gG.........SS'];

function layer(base, over, x0, y0, w) {
  const out = base.map((r) => r.padEnd(w, '.').split(''));
  over.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const y = y0 + j, x = x0 + i;
      if (row[i] === '.' || !out[y] || x < 0 || x >= w) continue;
      out[y][x] = row[i];
    }
  });
  return out.map((r) => r.join(''));
}

function brannPose({ shieldX = 0, shieldY = 15, spear = 'up', bodyDX = 0, eyes = null, w = 32 } = {}) {
  let base = Array(2).fill('').concat(BB_BODY).map((r) => '.'.repeat(Math.max(0, 2 + bodyDX)) + r);
  if (eyes) base = base.map((r, y) => (y === 8 ? r.replace('SSeWSSS', eyes) : r));
  if (spear === 'up') base = layer(Array(base.length).fill(''), BB_SPEAR_UP, 23 + bodyDX, 0, w).map((r, y) => {
    // lança atrás do corpo: só aparece onde o corpo é transparente
    const b = (base[y] || '').padEnd(w, '.');
    return b.split('').map((c, x) => (c === '.' ? r[x] : c)).join('');
  });
  if (spear === 'thrust') base = layer(base, BB_SPEAR_THRUST, 0, 17, w);
  base = layer(base, BB_SHIELD, 2 + shieldX + bodyDX, shieldY, w);
  return base;
}

const B_IDLE = brannPose({});
const B_ATTACK = brannPose({ spear: 'thrust', shieldX: 3, shieldY: 18, bodyDX: 2, w: 36 });
const B_CAST = brannPose({ shieldX: -1, shieldY: 10 });
const B_HURT = brannPose({ shieldX: 2, shieldY: 17, bodyDX: 2, eyes: 'SSTTSSS' });

const B_KO = [
  '......................................',
  '......................................',
  '......................................',
  '......................................',
  '..................AAaAAA...hhHHHHh....',
  '..............AAAAAAAAAAAAhHHHHHHHHv..',
  '..FGGF.FGGGGGGGgGGGGGGGGJSSSSHHHHHHv..',
  'EFGGGFEFGGGGrRGGGGGGGGGGSJJSSSJHHHHJ..',
  'EEGGFFEFGGGGGGGGGGLLLLGGSSSxSSTTJHHJ..',
  '.EEEE.EEFFFFFFFFFFFFFFFFTHHHHSSTTHJ...',
  '.....oooo..............HHHHHHHHHHJ....',
  '...ooOOOOoo...........................',
  '..oOOOyYOOOo..........................',
];

const B_WIN = [
  '..g.....................',
  '..G.....................',
  '..o......hhHHHHh........',
  '..o....vhHHHHHHHHv......',
  '..O...vvHHHHHHHHHHv.....',
  '..O...vJHHHHHHHHHHJv....',
  '..O...JSSSSSSSSSSSSJ....',
  '..O..sSJJJSSSSSSJJJSs...',
  '..O..SSSTTSSSSSSTTSSS...',
  '..O...SSSSSxSSSSSSSS....',
  '..O...TSSSSxSSSSSSST....',
  '..O...THHHSTTTTSHHHT....',
  '..O...HHJHHHTTHHJHHH....',
  '..O...JHHJHHHHHHJHHJ....',
  '..O....JHVHHJJHHVHJ.....',
  '..O.....JJHHHHHHJJ......',
  '.SSOGg...FEJJJJEF.gGGg..',
  '.SSOGGF..FFEEEEFF.FGGggG',
  '..OGGGGFGGgGGGGGFGFGGGGF',
  '..OGGGFGGgGrRRrGGGFFGGGF',
  '..OGGFAGGgrRRrRGGGFAFGGF',
  '..OGFAAGGGGRrRGGGFFAAFGS',
  '..OFZAAFGGGGGGGGGFFAAZSS',
  '..OZAAAFFGGGGGGGFFFAAZSG',
  '..OAAAlLLLLLyYLLLLlAAGG.',
  '..OAAAFGGFFEEFFGGFAAA...',
  '..OZAZFGGF....FGGFZAZ...',
  '..O...FGGF....FGGF......',
  '..O...EFGF....FGFE......',
  '..O..FGGGFE..EFGGGF.....',
  '..D..EEEEEE..EEEEEE.....',
];

export const brann = {
  id: 'brann',
  name: 'Brann',
  palette: BRANN_PALETTE,
  localW: 24,
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
