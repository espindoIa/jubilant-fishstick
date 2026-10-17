// CASA DO FAROL — interior aconchegante onde Lio mora com a avó Odessa.
import { Grid } from './mapkit.js';

function build() {
  const g = new Grid(12, 10, 'b', 0);
  g.rect(0, 0, 12, 2, 'X', 6); // parede do fundo
  g.rect(0, 0, 1, 10, 'X', 6);
  g.rect(11, 0, 1, 10, 'X', 6);
  return g.rows();
}

const rows = build();

export default {
  id: 'casa',
  name: 'Casa do Farol',
  region: 'Lar de Lio e Odessa',
  w: 12,
  h: 10,
  ...rows,
  propLegend: {},
  border: 'void',
  margin: 4,
  edgeFloor: -0.6,
  music: (s) => (s.flag('estela_acordou') && !s.flag('ataque') ? 'star' : 'village'),
  atmosphere: 'interior',
  particles: ['motes'],
  objects: [],
  props: [
    { prop: 'fireplace', x: 5.9, y: 2.25 },
    { prop: 'shelf', x: 2.2, y: 2.25 },
    { prop: 'shelf', x: 9.6, y: 2.25 },
    { prop: 'bed', x: 2.2, y: 6.2 },
    { prop: 'bed', x: 9.7, y: 6.2 },
    { prop: 'table', x: 6, y: 6.2 },
    { prop: 'rug', x: 6, y: 7.6 },
    { prop: 'pot', x: 1.5, y: 8.6 },
    { prop: 'barrel', x: 10.4, y: 8.7 },
  ],
  lights: [{ x: 5.4, y: 3, color: '#ffa050', intensity: 3.2, distance: 9, flicker: true, z: 1 }],
  spawns: {
    door: { x: 6, y: 8.5, dir: 'up' },
    bed: { x: 3.5, y: 6.5, dir: 'down' },
  },
  exits: [{ x: 5, y: 10, w: 2, h: 1, to: 'vila', spawn: 'casa_porta' }],
  chests: [{ id: 'c1', x: 10, y: 3, item: 'pocao', qty: 2 }],
  enemies: [],
  npcs: [
    { id: 'odessa', char: 'odessa', x: 7, y: 5, dir: 'down', talk: 'odessa_casa', cond: (s) => !s.flag('ataque') },
  ],
  triggers: [],
  interactables: [
    { x: 2, y: 2, script: 'estante_casa', r: 1.2 },
    { x: 9, y: 2, script: 'estante_casa2', r: 1.2 },
  ],
};
