// BOSQUE SUSSURRANTE — floresta ao entardecer, cogumelos que brilham,
// vaga-lumes e a clareira onde a estrela caiu.
import { Grid, DEFAULT_LEGEND } from './mapkit.js';

function build() {
  const g = new Grid(34, 42, 'G', 2);
  // trilha principal sinuosa (sul -> norte)
  g.path([[16.5, 41], [16.5, 36], [12, 31], [11, 26], [15, 22], [21, 19], [22, 14], [17, 10]], 'd', 2);
  // clareiras
  g.disc(17, 6, 6.5, 'g', null, 0.5, 3);
  g.disc(17, 6, 3.2, 'd', null, 0.4, 4);
  g.disc(7, 30, 3.5, 'g', null, 0.5, 5);
  g.disc(26, 30, 3.5, 'g', null, 0.5, 6);
  g.disc(27, 10, 3, 'g', null, 0.4, 7);
  g.rect(14, 1, 7, 2, 'g');
  // ramal leste (para a caverna)
  g.path([[21, 19], [27, 20], [33.5, 20.5]], 'd', 2);
  // ramal oeste com tesouro
  g.path([[12, 31], [7, 30]], 'd', 2);
  g.path([[11, 26], [6, 22], [5, 16]], 'd', 2);
  // lago
  g.disc(26, 33, 2.4, 'w', null, 0.3, 8);
  // patamar elevado a oeste (com escada)
  g.rect(1, 10, 9, 9, 'G', 4);
  g.disc(5, 14, 3, 'g', 4, 0.4, 9);
  g.rect(5, 19, 1, 1, 'd', 3);
  g.rect(5, 18, 1, 1, 'd', 4);
  g.path([[5, 16], [5, 19]], 'd', 1, null);
  // flores
  g.disc(17, 6, 5.5, null);
  g.scatter('*', ['g'], 0.08, 21);
  // árvores densas fora dos caminhos
  g.scatter('D', ['G'], 0.17, 11);
  g.scatter('P', ['G'], 0.07, 12);
  g.scatter('T', ['G'], 0.04, 13);
  g.scatter('m', ['G', 'g', 'd'], 0.035, 14);
  g.scatter(',', ['G', 'g'], 0.08, 15);
  g.scatter('b', ['G'], 0.05, 16);
  g.scatter('M', ['G'], 0.015, 17);
  g.scatter('r', ['G', 'g'], 0.02, 18);
  // limpa caminho e entorno imediato
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.t[y][x] === 'd' || g.t[y][x] === 'w') g.p[y][x] = '.';
  }
  g.clearProps(11, 1, 13, 11);
  g.clearProps(14, 38, 5, 4);
  g.clearProps(30, 18, 4, 5);
  // árvore espiritual e cristais na clareira
  g.prop(17, 2, 'Y');
  g.prop(12, 4, 'm').prop(22, 4, 'm').prop(11, 8, 'm').prop(23, 8, 'm');
  g.prop(14, 9, '*').prop(20, 9, '*');
  return g.rows();
}

const rows = build();

export default {
  id: 'bosque',
  name: 'Bosque Sussurrante',
  region: 'Ao norte de Vila Maré',
  w: 34,
  h: 42,
  ...rows,
  propLegend: DEFAULT_LEGEND,
  border: 'forest',
  borderTrees: ['darkoak0', 'darkoak1', 'darkoak2', 'pine0', 'pine1', 'pine2'],
  music: 'forest',
  atmosphere: 'forest',
  particles: ['fireflies', 'motes'],
  battleBg: 'forest',
  objects: [],
  props: [],
  spawns: {
    south: { x: 16.5, y: 40, dir: 'up' },
    east: { x: 32.5, y: 20.5, dir: 'left' },
    clearing: { x: 17, y: 10, dir: 'up' },
  },
  exits: [
    { x: 16, y: 42, w: 2, h: 1, to: 'vila', spawn: 'north' },
    { x: 34, y: 20, w: 1, h: 2, to: 'caverna', spawn: 'west', cond: (s) => s.flag('cap2'), blockedScript: 'bosque_leste_bloqueado' },
  ],
  chests: [
    { id: 'c1', x: 6, y: 29, item: 'pocao', qty: 2 },
    { id: 'c2', x: 4, y: 13, item: 'amuleto_coral' },
    { id: 'c3', x: 27, y: 9, gold: 80 },
    { id: 'c4', x: 28, y: 29, item: 'eter' },
  ],
  enemies: [
    { id: 'e1', kind: 'goticula', x: 15, y: 33, group: ['goticula'], radius: 2 },
    { id: 'e2', kind: 'goticula', x: 10, y: 27, group: ['goticula', 'goticula'] },
    { id: 'e3', kind: 'cogumelo', x: 7, y: 31, group: ['cogumelo', 'goticula'] },
    { id: 'e4', kind: 'vespa', x: 16, y: 21, group: ['vespa', 'goticula'] },
    { id: 'e5', kind: 'lobo', x: 22, y: 16, group: ['lobo'] },
    { id: 'e6', kind: 'cogumelo', x: 5, y: 14, group: ['cogumelo', 'cogumelo'] },
    { id: 'e7', kind: 'vespa', x: 25, y: 29, group: ['vespa', 'vespa'] },
    { id: 'e8', kind: 'lobo', x: 27, y: 20, group: ['lobo', 'goticula'], cond: (s) => s.flag('cap2') },
  ],
  npcs: [],
  triggers: [
    { x: 14, y: 36, w: 5, h: 2, script: 'bosque_entrada', flag: 'bosque_entrada' },
    { x: 13, y: 10, w: 9, h: 2, script: 'clareira', flag: 'clareira_vista', cond: (s) => !s.flag('cao_derrotado') },
  ],
  interactables: [
    { x: 17, y: 2, script: 'arvore_espiritual', r: 1.4, oz: 0.6 },
  ],
};
