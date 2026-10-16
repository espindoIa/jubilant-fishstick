// CAVERNA DE CRISTAL — túneis de ametista, lago subterrâneo, o acampamento
// dos mineiros refugiados e o salão do Golem.
import { Grid, DEFAULT_LEGEND } from './mapkit.js';

function build() {
  const W = 40, H = 36;
  const g = new Grid(W, H, 'R', '6'); // tudo rocha
  const floor = (fn) => fn();
  floor(() => {
    // entrada oeste e túnel
    g.rect(0, 18, 6, 3, 'c', 2);
    g.path([[3, 19.5], [10, 19.5], [13, 17]], 'c', 3, 2);
    // caverna central com lago
    g.disc(18, 18, 7.5, 'c', 2, 0.6, 2);
    g.disc(19, 18, 3.6, 'w', 2, 0.5, 3);
    g.rect(15, 18, 9, 2, 'b', 3); // ponte
    g.disc(13, 13, 3, 'k', 2, 0.5, 4);
    // passagem norte até o salão de cristal
    g.path([[20, 11], [22, 7]], 'c', 3, 2);
    g.disc(24, 5, 5.5, 'k', 2, 0.5, 5);
    g.disc(24, 5, 3.4, 'c', 2, 0.4, 6);
    g.rect(23, 0, 3, 2, 'c', 2);
    // ramal sudeste: acampamento
    g.path([[22, 23], [27, 27]], 'c', 3, 2);
    g.disc(31, 28, 5, 'c', 2, 0.5, 7);
    g.disc(31, 28, 2, 'd', 2, 0.4, 8);
    // salinha oeste com tesouro
    g.path([[13, 22], [8, 27]], 'c', 2, 2);
    g.disc(6, 29, 3, 'k', 2, 0.5, 9);
    // salinha nordeste
    g.path([[25, 14], [32, 12]], 'c', 2, 2);
    g.disc(34, 11, 2.6, 'c', 2, 0.5, 10);
    g.rect(33, 12, 1, 1, 'c', 3);
    g.disc(35, 9, 1.5, 'k', 4, 0.4, 11);
  });
  // cristais e estalagmites junto às paredes
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g.hg[y][x] !== '2' || g.t[y][x] === 'w' || g.t[y][x] === 'b') continue;
    let wallN = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (g.hg[y + dy]?.[x + dx] === '6') wallN++;
    const r = ((x * 73856093) ^ (y * 19349663)) % 100;
    if (wallN && r < 14) g.p[y][x] = r < 6 ? 'c' : r < 9 ? 'C' : 'i';
  }
  g.clearProps(22, 0, 5, 3);
  g.clearProps(0, 17, 4, 5);
  g.clearProps(14, 17, 11, 4);
  g.clearProps(28, 25, 7, 7);
  g.clearProps(20, 2, 8, 7);
  return g.rows();
}

const rows = build();

export default {
  id: 'caverna',
  name: 'Caverna de Cristal',
  region: 'Sob as Montanhas Cinzentas',
  w: 40,
  h: 36,
  ...rows,
  propLegend: DEFAULT_LEGEND,
  border: 'cave',
  music: 'cave',
  atmosphere: 'cave',
  particles: ['sparkles'],
  battleBg: 'cave',
  objects: [],
  props: [
    { prop: 'tent', x: 33.5, y: 26.6 },
    { prop: 'crate', x: 28.6, y: 25.5 },
    { prop: 'barrel', x: 29.4, y: 25.4 },
    { prop: 'torch', x: 30, y: 30.6 },
    { prop: 'torch', x: 33, y: 30.6 },
    { prop: 'pot', x: 31.5, y: 28.3 },
    { prop: 'save', x: 27.5, y: 29.6 },
    { prop: 'crystalblue', x: 24.5, y: 3.4, scale: 1.4 },
    { prop: 'crystal', x: 21, y: 3.6, scale: 1.2 },
    { prop: 'crystal', x: 28, y: 3.6, scale: 1.2 },
  ],
  lights: [{ x: 31, y: 28, color: '#ff9040', intensity: 3.5, distance: 8, flicker: true, z: 0.8 }],
  spawns: {
    west: { x: 1.5, y: 19.5, dir: 'right' },
    north: { x: 24, y: 1.5, dir: 'down' },
    camp: { x: 30, y: 29, dir: 'up' },
  },
  exits: [
    { x: -1, y: 18, w: 1, h: 3, to: 'bosque', spawn: 'east' },
    { x: 23, y: -1, w: 3, h: 1, to: 'forte', spawn: 'south', cond: (s) => s.flag('golem_derrotado') },
  ],
  chests: [
    { id: 'c1', x: 5, y: 29, item: 'hipocao', qty: 2 },
    { id: 'c2', x: 34, y: 10, item: 'cajado_lunar' },
    { id: 'c3', x: 12, y: 12, item: 'eter', qty: 2 },
    { id: 'c4', x: 7, y: 30, gold: 220 },
  ],
  enemies: [
    { id: 'e1', kind: 'morcego', x: 10, y: 19, group: ['morcego', 'morcego'] },
    { id: 'e2', kind: 'lodo', x: 14, y: 22, group: ['lodo', 'morcego'] },
    { id: 'e3', kind: 'aranha', x: 22, y: 13, group: ['aranha'] },
    { id: 'e4', kind: 'tatu', x: 23, y: 22, group: ['tatu', 'lodo'] },
    { id: 'e5', kind: 'morcego', x: 8, y: 26, group: ['morcego', 'aranha'] },
    { id: 'e6', kind: 'aranha', x: 30, y: 12, group: ['aranha', 'aranha'] },
    { id: 'e7', kind: 'tatu', x: 21, y: 9, group: ['tatu', 'morcego'], cond: (s) => s.flag('brann_juntou') },
  ],
  npcs: [
    { id: 'brann', char: 'brann', x: 30, y: 27, dir: 'left', talk: 'brann_encontro', cond: (s) => !s.flag('brann_juntou') },
    { id: 'mineiro1', char: 'mineiro', x: 32, y: 29, dir: 'left', talk: 'mineiro1' },
    { id: 'mineiro2', char: 'mineiro', x: 34, y: 28, dir: 'down', talk: 'mineiro2', wander: 1 },
    { id: 'menina2', char: 'menina', x: 33, y: 30, dir: 'up', talk: 'menina_caverna' },
  ],
  triggers: [
    { x: 2, y: 18, w: 3, h: 3, script: 'caverna_entrada', flag: 'caverna_entrada' },
    { x: 26, y: 24, w: 3, h: 3, script: 'brann_encontro', flag: 'brann_visto', cond: (s) => !s.flag('brann_juntou') },
    { x: 21, y: 7, w: 6, h: 2, script: 'golem_luta', cond: (s) => !s.flag('golem_derrotado') },
  ],
  interactables: [
    { x: 27, y: 29, script: 'cristal_save', r: 1.1 },
  ],
};
