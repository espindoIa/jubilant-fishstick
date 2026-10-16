// Arenas de batalha: pequenos dioramas temáticos gerados a partir do bioma.
import { Grid, DEFAULT_LEGEND } from '../data/maps/mapkit.js';

export const ARENA_W = 18;
export const ARENA_H = 11;

const THEMES = {
  forest: {
    base: 'G', patches: [['g', 3], ['d', 2.2], ['f', 1.4]], border: 'forest', borderTrees: ['darkoak0', 'darkoak1', 'pine0', 'pine1', 'oak1'],
    props: [['D', 0.5, [0, 0, 18, 2]], ['P', 0.25, [0, 0, 18, 2]], ['m', 0.06, null], [',', 0.06, null], ['b', 0.04, [0, 0, 18, 3]]],
    particles: ['fireflies'], atmosphere: 'forest',
  },
  village: {
    base: 'g', patches: [['p', 2.5], ['f', 1.5], ['d', 1.5]], border: 'forest', borderTrees: ['oak0', 'oak1', 'oak2'],
    props: [['T', 0.45, [0, 0, 18, 2]], [',', 0.05, null], ['*', 0.04, null], ['l', 0.0, null]],
    particles: ['motes', 'lanterns'], atmosphere: 'dusk',
  },
  night: {
    base: 'g', patches: [['p', 2.5], ['d', 1.5]], border: 'forest', borderTrees: ['oak0', 'oak1', 'darkoak2'],
    props: [['T', 0.45, [0, 0, 18, 2]], [',', 0.05, null]],
    particles: ['embers'], atmosphere: 'burning',
  },
  cave: {
    base: 'c', patches: [['k', 2], ['r', 2]], border: 'cave',
    props: [['c', 0.08, [0, 0, 18, 3]], ['C', 0.05, [0, 0, 18, 3]], ['i', 0.12, [0, 0, 18, 2]], ['k', 0.05, null]],
    particles: ['sparkles'], atmosphere: 'cave',
  },
  fort: {
    base: 'm', patches: [['r', 2.5], ['p', 2]], border: 'fort',
    props: [['o', 0.05, [0, 0, 18, 3]], ['x', 0.05, [0, 0, 18, 3]], ['t', 0.05, [0, 0, 18, 1]]],
    particles: ['embers'], atmosphere: 'fort',
  },
  beach: {
    base: 's', patches: [['g', 2], ['s', 2]], border: 'sea',
    props: [['L', 0.2, [0, 0, 18, 2]], [',', 0.04, null]],
    particles: ['spray'], atmosphere: 'day',
  },
};

export function arenaMap(themeName = 'forest', seed = 1) {
  const th = THEMES[themeName] || THEMES.forest;
  const g = new Grid(ARENA_W, ARENA_H, th.base, '2');
  let s = seed;
  for (const [tile, r] of th.patches) {
    const x = 2 + ((s * 37) % 14), y = 1 + ((s * 23) % 8);
    g.disc(x, y, r, tile, null, 0.4, s);
    s++;
  }
  // área central limpa para combate
  for (const [ch, dens, area] of th.props) g.scatter(ch, [th.base, ...th.patches.map((p) => p[0])], dens, seed + ch.charCodeAt(0), area || [0, 0, ARENA_W, ARENA_H]);
  g.clearProps(2, 3, 14, 8);
  if (themeName === 'cave') {
    g.rect(0, 0, ARENA_W, 1, 'R', '8');
  }
  if (themeName === 'fort') {
    g.rect(0, 0, ARENA_W, 1, 'F', '8');
    g.prop(4, 1, 't').prop(13, 1, 't');
  }
  if (themeName === 'village' || themeName === 'night') {
    g.prop(3, 2, 'l').prop(14, 2, 'l');
  }
  const rows = g.rows();
  return {
    id: 'arena-' + themeName,
    name: '',
    w: ARENA_W,
    h: ARENA_H,
    ...rows,
    propLegend: DEFAULT_LEGEND,
    border: th.border,
    borderTrees: th.borderTrees,
    particles: th.particles,
    margin: 8,
    openSouth: true,
    atmosphere: th.atmosphere,
    seed: seed + 3,
  };
}

export function themeAtmosphere(themeName) {
  return (THEMES[themeName] || THEMES.forest).atmosphere;
}
