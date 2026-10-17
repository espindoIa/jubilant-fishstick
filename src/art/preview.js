// Folhas para revisão visual (usadas por tools/preview-art.mjs).
import { Bitmap } from './bitmap.js';
import { buildFieldFrames, buildBattleFrames } from './characters.js';
import { HEROES } from './sprites/index.js';
import { paintGround, paintSideAtlas } from './terrain.js';
import testMap from '../data/maps/test.js';
import { buildProps } from './props.js';

export function strip(frames, gap = 4, bg = null) {
  const w = frames.reduce((a, f) => a + f.w + gap, gap);
  const h = Math.max(...frames.map((f) => f.h)) + gap * 2;
  const b = new Bitmap(w, h);
  if (bg) b.fill(bg);
  let x = gap;
  for (const f of frames) {
    b.blit(f, x, gap + (h - gap * 2 - f.h));
    x += f.w + gap;
  }
  return b;
}

export function stack(bitmaps, gap = 2) {
  const w = Math.max(...bitmaps.map((b) => b.w));
  const h = bitmaps.reduce((a, b) => a + b.h + gap, 0);
  const out = new Bitmap(w, h);
  let y = 0;
  for (const b of bitmaps) {
    out.blit(b, 0, y);
    y += b.h + gap;
  }
  return out;
}

export async function buildPreviewSheets() {
  const out = {};
  for (const def of HEROES) {
    const f = buildFieldFrames(def);
    const b = buildBattleFrames(def);
    out[`hero_${def.id}_field`] = stack([
      strip(['d0', 'd1', 'd0', 'd2'].map((k) => f[k])),
      strip(['u0', 'u1', 'u0', 'u2'].map((k) => f[k])),
      strip(['l0', 'l1', 'l0', 'l2', 'r0', 'r1'].map((k) => f[k])),
    ]);
    out[`hero_${def.id}_battle`] = strip(Object.values(b));
  }
  // linha com todos os heróis de frente (comparar proporções)
  out.heroes_lineup = strip(HEROES.map((d) => buildFieldFrames(d).d0), 2);
  out.ground_test = paintGround(testMap);
  out.side_atlas = paintSideAtlas();
  const props = buildProps();
  const names = Object.keys(props);
  out.props_a = strip(names.slice(0, 16).map((n) => props[n].bmp));
  out.props_b = strip(names.slice(16, 34).map((n) => props[n].bmp));
  out.props_c = strip(names.slice(34).map((n) => props[n].bmp));
  return out;
}
