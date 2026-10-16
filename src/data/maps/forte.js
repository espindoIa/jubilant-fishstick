// FORTE FERRUGEM — fortaleza imperial de aço e vapor, à noite.
import { Grid, DEFAULT_LEGEND } from './mapkit.js';

function build() {
  const W = 36, H = 40;
  const g = new Grid(W, H, 'F', '6'); // muralhas
  // pátio externo
  g.rect(6, 27, 24, 12, 'r', 2);
  g.rect(15, 38, 6, 2, 'p', 2);
  g.disc(18, 33, 4, 'm', 2, 0.3, 2);
  g.rect(9, 29, 3, 3, 'p', 2);
  g.rect(24, 30, 3, 3, 'p', 2);
  // portão e corredor central
  g.rect(15, 16, 6, 11, 'm', 2);
  // ala das celas (oeste)
  g.rect(2, 17, 12, 8, 'm', 2);
  g.rect(13, 19, 2, 2, 'm', 2);
  // depósito (leste)
  g.rect(22, 18, 11, 7, 'p', 2);
  g.rect(21, 20, 1, 2, 'm', 2);
  // salão da fornalha (norte)
  g.rect(6, 2, 24, 13, 'm', 2);
  g.rect(15, 14, 6, 2, 'm', 2);
  g.disc(18, 5, 3.5, 'k', 2, 0.2, 3);
  g.rect(16, 1, 4, 2, 'k', 4);
  // celas: paredes internas
  for (const x of [5, 8, 11]) g.rect(x, 17, 1, 3, 'F', '6');
  // passarelas elevadas no pátio
  g.rect(6, 27, 3, 2, 'm', 4);
  g.rect(27, 27, 3, 2, 'm', 4);
  // props
  g.scatter('o', ['p'], 0.12, 5, [22, 18, 33, 25]);
  g.scatter('x', ['p'], 0.12, 6, [22, 18, 33, 25]);
  g.clearProps(21, 20, 3, 2);
  for (const [x, y] of [[7, 30], [28, 30], [7, 36], [28, 36], [15, 17], [20, 17], [7, 4], [28, 4], [7, 12], [28, 12], [3, 21], [12, 23]]) g.prop(x, y, 't');
  return g.rows();
}

const rows = build();

export default {
  id: 'forte',
  name: 'Forte Ferrugem',
  region: 'Bastião do Império de Ferro',
  w: 36,
  h: 40,
  ...rows,
  propLegend: DEFAULT_LEGEND,
  border: 'fort',
  music: 'fort',
  atmosphere: 'fort',
  particles: ['embers'],
  battleBg: 'fort',
  objects: [],
  props: [
    { prop: 'tent', x: 10.5, y: 30.6 },
    { prop: 'tent', x: 25.5, y: 31.6 },
    { prop: 'barricade', x: 14, y: 27.6 },
    { prop: 'barricade', x: 22, y: 27.6 },
    { prop: 'banner', x: 14.6, y: 15.6 },
    { prop: 'banner', x: 21.4, y: 15.6 },
    { prop: 'banner', x: 10, y: 2.6 },
    { prop: 'banner', x: 26, y: 2.6 },
    { prop: 'crystalblue', x: 18, y: 3.2, scale: 2.4, noCollide: true },
    { prop: 'save', x: 17, y: 35.6 },
    { prop: 'bed', x: 3.5, y: 18.6 },
    { prop: 'pot', x: 9.5, y: 18 },
  ],
  lights: [
    { x: 17.5, y: 3, color: '#80d0ff', intensity: 6, distance: 14, pulse: 2, z: 2.5 },
    { x: 18, y: 33, color: '#ff6040', intensity: 2.5, distance: 9, flicker: true, z: 2 },
  ],
  spawns: {
    south: { x: 18, y: 38.5, dir: 'up' },
    hall: { x: 18, y: 12, dir: 'up' },
  },
  exits: [{ x: 15, y: 40, w: 6, h: 1, to: 'caverna', spawn: 'north' }],
  chests: [
    { id: 'c1', x: 31, y: 19, item: 'lanca_guerra' },
    { id: 'c2', x: 23, y: 23, item: 'hipocao', qty: 3 },
    { id: 'c3', x: 2, y: 23, item: 'astrolabio_prata' },
    { id: 'c4', x: 31, y: 23, item: 'malha_aco' },
    { id: 'c5', x: 29, y: 37, item: 'eter', qty: 2 },
  ],
  enemies: [
    { id: 'e1', kind: 'soldado', x: 12, y: 33, group: ['soldado', 'soldado'] },
    { id: 'e2', kind: 'drone', x: 24, y: 34, group: ['drone', 'drone'] },
    { id: 'e3', kind: 'soldado', x: 18, y: 24, group: ['soldado', 'mago'] },
    { id: 'e4', kind: 'cao_ferro2', x: 26, y: 21, group: ['cao_ferro2'] },
    { id: 'e5', kind: 'mago', x: 7, y: 22, group: ['mago', 'drone'] },
    { id: 'e6', kind: 'drone', x: 18, y: 18, group: ['drone', 'soldado', 'drone'] },
  ],
  npcs: [
    { id: 'odessa', char: 'odessa', x: 3, y: 18, dir: 'down', talk: 'odessa_cela', cond: (s) => !s.flag('odessa_resgatada') },
  ],
  triggers: [
    { x: 15, y: 36, w: 6, h: 3, script: 'forte_entrada', flag: 'forte_entrada' },
    { x: 15, y: 13, w: 6, h: 2, script: 'varek_luta', cond: (s) => s.flag('odessa_resgatada') && !s.flag('varek_derrotado') },
    { x: 15, y: 13, w: 6, h: 2, script: 'salao_trancado', cond: (s) => !s.flag('odessa_resgatada') },
  ],
  interactables: [
    { x: 17, y: 35, script: 'cristal_save', r: 1.1 },
  ],
};
