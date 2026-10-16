import { shardInteractables } from '../shards.js';
// VILA MARÉ — vila costeira de Lio, na noite do Festival das Estrelas.
import { Grid, DEFAULT_LEGEND } from './mapkit.js';

function build() {
  const g = new Grid(36, 30, 'g', 3);
  // floresta ao norte
  g.rect(0, 0, 36, 3, 'G');
  g.disc(4, 2, 3, 'G');
  g.disc(30, 2, 4, 'G');
  // trilha para o Bosque Sussurrante
  g.path([[17.5, 0], [17.5, 9]], 'd', 2);
  // praça do festival
  g.rect(12, 9, 12, 7, 't');
  // caminhos de pedra
  g.path([[6, 12.5], [12, 12.5]], 'p', 2);
  g.path([[23, 11.5], [28, 11.5]], 'p', 2);
  g.path([[17.5, 16], [17.5, 21]], 'p', 2);
  g.path([[6, 12.5], [6, 19]], 'p', 2);
  g.path([[11, 19.5], [17, 19.5]], 'p', 2);
  // colina do santuário (noroeste)
  g.rect(1, 3, 10, 6, 'g', 5);
  g.rect(3, 6, 6, 3, 't', 5);
  g.rect(5, 9, 2, 1, 'S', 4);
  g.rect(5, 10, 2, 1, 'p', 3);
  // penhasco do farol (leste)
  g.rect(28, 7, 8, 9, 'g', 5);
  g.rect(27, 12, 1, 2, 'S', 4);
  g.rect(28, 12, 7, 2, 'p', 5);
  g.rect(32, 10, 3, 2, 'p', 5);
  // praia e mar
  g.rect(0, 22, 36, 3, 's', 1);
  g.disc(4, 21.5, 2.5, 's', 1);
  g.disc(30, 21.5, 3, 's', 1);
  g.rect(17, 21, 2, 1, 'S', 2);
  g.rect(0, 25, 36, 5, 'w', 1);
  g.disc(9, 24.6, 1.6, 'w', 1);
  g.disc(25, 24.5, 2, 'w', 1);
  // cais
  g.rect(16, 24, 4, 6, 'b', 2);
  g.rect(20, 27, 4, 2, 'b', 2);
  // canteiros de flores
  g.rect(13, 16, 3, 2, 'f');
  g.rect(20, 16, 3, 2, 'f');
  g.disc(9, 16, 1.6, 'f');
  g.disc(26, 18, 1.6, 'f');

  // ---------- props
  // árvores ao redor
  g.scatter('T', ['g', 'G'], 0.32, 3, [0, 0, 36, 3]);
  g.scatter('P', ['G'], 0.2, 5, [0, 0, 36, 3]);
  for (const [x, y] of [[1, 10], [1, 14], [2, 17], [10, 4], [11, 7], [24, 5], [26, 4], [22, 4], [9, 20], [26, 20], [1, 20], [34, 17], [35, 19]]) g.prop(x, y, 'T');
  for (const [x, y] of [[3, 23], [7, 22], [27, 23], [33, 22], [12, 22]]) g.prop(x, y, 'L');
  for (const [x, y] of [[11, 10], [24, 14], [3, 15], [10, 18], [28, 19], [23, 8], [12, 8]]) g.prop(x, y, 'b');
  g.scatter(',', ['g'], 0.05, 9);
  g.scatter('*', ['g'], 0.04, 11);
  // lampiões do festival
  for (const [x, y] of [[12, 9], [23, 9], [12, 15], [23, 15], [16, 20], [19, 20], [8, 12], [26, 11], [5, 8], [28, 14], [16, 3], [19, 3]]) g.prop(x, y, 'l');
  // cerca no penhasco
  for (let x = 29; x < 36; x++) g.prop(x, 15, 'f');
  // cais: barris e caixas
  g.prop(16, 25, 'o').prop(19, 26, 'x').prop(20, 27, 'o').prop(23, 28, 'x');
  g.prop(14, 21, 's');
  g.prop(18, 1, 's');
  return g.rows();
}

const rows = build();

export default {
  id: 'vila',
  name: 'Vila Maré',
  w: 36,
  h: 30,
  ...rows,
  propLegend: DEFAULT_LEGEND,
  border: 'forest',
  borderTrees: ['oak0', 'oak1', 'oak2', 'pine0', 'pine2', 'darkoak1'],
  music: (s) => (s.flag('ataque') && !s.flag('ataque_fim') ? 'fort' : 'village'),
  atmosphere: (s) => (s.flag('final') ? 'night' : s.flag('ataque') && !s.flag('ataque_fim') ? 'burning' : s.flag('ataque_fim') ? 'day' : s.flag('cao_derrotado') ? 'night' : 'dusk'),
  objects: [
    { type: 'house', x: 2, y: 3, w: 6, d: 3, wall: 'wood', roof: 'red', door: 2.5, windows: [0.6, 4.4], h: 2, shutter: '#c84a4a', name: 'santuario' },
    { type: 'house', x: 2, y: 11, w: 4, d: 3, wall: 'plaster', roof: 'red', door: 1.5, windows: [0.2, 2.8], name: 'pousada' },
    { type: 'house', x: 25, y: 8, w: 4, d: 3, wall: 'wood', roof: 'blue', door: 0.5, windows: [2.3], name: 'loja' },
    { type: 'house', x: 2, y: 17, w: 4, d: 3, wall: 'stone', roof: 'green', door: 1.5, windows: [0.1, 2.9] },
    { type: 'house', x: 12, y: 4, w: 4, d: 3, wall: 'brick', roof: 'slate', door: 1.5, windows: [0.1, 2.9] },
    { type: 'house', x: 20, y: 4, w: 4, d: 3, wall: 'plaster', roof: 'thatch', door: 0.5, windows: [2.4] },
    { type: 'house', x: 29, y: 9, w: 3, d: 3, wall: 'plaster', roof: 'teal', door: 1, windows: [], name: 'casa-lio', doorScript: 'entrar_casa' },
    { type: 'lighthouse', x: 33, y: 9, h: 7 },
  ],
  props: [
    { prop: 'well', x: 18, y: 12.4 },
    { prop: 'stall', x: 14.5, y: 10.6 },
    { prop: 'stall2', x: 21.5, y: 10.6 },
    { prop: 'boat', x: 13, y: 27.5 },
    { prop: 'boat', x: 25.5, y: 26.5, flip: true },
    { prop: 'save', x: 9.5, y: 13.5 },
  ],
  spawns: {
    start: { x: 30.5, y: 13.5, dir: 'down' },
    casa_porta: { x: 30.5, y: 12.6, dir: 'down' },
    north: { x: 18, y: 1.5, dir: 'down' },
    plaza: { x: 18, y: 14, dir: 'up' },
  },
  exits: [{ x: 17, y: -1, w: 2, h: 1, to: 'bosque', spawn: 'south', cond: (s) => s.flag('estrela_caiu') && !s.flag('ataque') || s.flag('cap2'), blockedScript: 'norte_bloqueado' }],
  battleBg: 'village',
  npcs: [
    { id: 'odessa', char: 'odessa', x: 32, y: 13, dir: 'left', talk: 'odessa_vila', cond: (s) => !s.flag('estrela_caiu') },
    { id: 'sena', char: 'sena', x: 5, y: 7, dir: 'down', talk: 'sena_santuario', cond: (s) => !s.flag('estrela_caiu') },
    { id: 'bento', char: 'anciao', x: 16, y: 13, dir: 'down', talk: 'bento', cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'mercadora', char: 'mercadora', x: 14, y: 11, dir: 'down', talk: 'loja_vila', fixedDir: false, cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'rosa', char: 'estalajadeira', x: 3, y: 15, dir: 'down', talk: 'pousada', cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'pescador', char: 'pescador', x: 18, y: 25, dir: 'down', talk: 'pescador', cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'tito', char: 'crianca', x: 20, y: 13, dir: 'left', talk: 'tito', wander: 2.5, cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'lina', char: 'menina', x: 21, y: 17, dir: 'down', talk: 'lina', cond: (s) => !s.flag('ataque') || s.flag('ataque_fim') },
    { id: 'pescador2', char: 'pescador', x: 25, y: 21, dir: 'down', talk: 'pescador2', wander: 1.5, cond: (s) => !s.flag('ataque') },
    { id: 'sold1', char: 'soldado', x: 17, y: 12, dir: 'up', talk: ['Saia da frente, pirralho!'], cond: (s) => s.flag('ataque') && !s.flag('ataque_fim') },
    { id: 'sold2', char: 'soldado', x: 20, y: 12, dir: 'up', talk: ['Ordens do capitão. Ninguém passa.'], cond: (s) => s.flag('ataque') && !s.flag('ataque_fim') },
  ],
  interactables: [
    { x: 9, y: 13, script: 'cristal_save', r: 1.1 },
    { x: 14, y: 21, script: 'placa_praia', r: 0.9 },
    { x: 18, y: 1, script: 'placa_norte', r: 0.9 },
    { x: 17, y: 12, script: 'poco', r: 1.2, ox: 0.5 },
    ...shardInteractables('vila'),
  ],
  triggers: [
    { x: 3, y: 6, w: 6, h: 3, script: 'santuario_cena', flag: 'estrela_caiu', cond: (s) => s.flag('intro_feita') },
    { x: 26, y: 11, w: 2, h: 4, script: 'ataque_inicio', flag: 'ataque_iniciado', cond: (s) => s.flag('ataque') },
  ],
  dynamic: (s) => {
    if (s.flag('ataque') && !s.flag('ataque_fim')) {
      return {
        particles: ['embers'],
        props: [[13.5, 7.4], [21, 7.4], [4, 14.4], [26.5, 11.4], [3.5, 20.4], [14.5, 12], [22.5, 12]].flatMap(([x, y]) => [
          { prop: 'fire0', x, y, noCollide: true },
          { prop: 'fire1', x, y, noCollide: true },
        ]),
        lights: [
          { x: 13, y: 5, color: '#ff6020', intensity: 4, distance: 9, flicker: true, z: 2.5 },
          { x: 21, y: 5, color: '#ff6020', intensity: 4, distance: 9, flicker: true, z: 2.5 },
          { x: 4, y: 12, color: '#ff5020', intensity: 4, distance: 9, flicker: true, z: 2.5 },
          { x: 26, y: 9, color: '#ff6020', intensity: 4, distance: 9, flicker: true, z: 2.5 },
        ],
      };
    }
    if (s.flag('final')) return { particles: ['fireflies', 'starfall'] };
    if (s.flag('ataque_fim')) return { particles: ['motes', 'leaves'] };
    if (s.flag('cao_derrotado')) return { particles: ['fireflies'] };
    return { particles: ['lanterns', 'motes'] };
  },
};
