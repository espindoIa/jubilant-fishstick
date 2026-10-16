// Monta todos os frames de um personagem a partir da definição por partes.
import { mirrorRows } from './bitmap.js';
import { sprite } from './charkit.js';

export const FIELD_FRAME = { w: 32, h: 32 };
export const BATTLE_FRAME = { w: 48, h: 40 };

// Gera torso do passo B: corpo do "stand", braços espelhados do passo A.
function mirrorArms(stand, stepA, w, armW = 4) {
  const m = mirrorRows(stepA.map((r) => r.padEnd(w, '.')));
  return stand.map((r, y) => {
    const s = r.padEnd(w, '.').split('');
    const mr = m[y] || '.'.repeat(w);
    for (let x = 0; x < w; x++) {
      if (x < armW || x >= w - armW) s[x] = mr[x];
    }
    return s.join('');
  });
}

function pad(rows, w) {
  return rows.map((r) => r.padEnd(w, '.'));
}

export function buildFieldFrames(def) {
  const W = def.localW;
  const P = def.palette;
  const opts = { w: FIELD_FRAME.w, h: FIELD_FRAME.h, localW: W, ...(def.fieldOpts || {}) };
  const frames = {};
  const mk = (rows) => sprite(pad(rows, W), P, opts);

  for (const d of ['down', 'up']) {
    const part = def.dir[d];
    if (!part) continue;
    const [tS, tA] = part.torso;
    const [lS, lA] = part.legs;
    const tB = part.torsoB || (tA ? mirrorArms(tS, tA, W, def.armW || 4) : tS);
    const lB = part.legsB || (lA ? mirrorRows(pad(lA, W)) : lS);
    const k = d === 'down' ? 'd' : 'u';
    frames[k + '0'] = mk([...part.head, ...tS, ...lS]);
    frames[k + '1'] = mk([...part.head, ...(tA || tS), ...(lA || lS)]);
    frames[k + '2'] = mk([...part.head, ...tB, ...lB]);
  }
  const L = def.dir.left;
  if (L) {
    const [tS, tBk, tF] = L.torso;
    const [lS, lA, lB] = L.legs;
    frames.l0 = mk([...L.head, ...tS, ...lS]);
    frames.l1 = mk([...L.head, ...(tBk || tS), ...(lA || lS)]);
    frames.l2 = mk([...L.head, ...(tF || tS), ...(lB || lA || lS)]);
    frames.r0 = frames.l0.flippedX();
    frames.r1 = frames.l1.flippedX();
    frames.r2 = frames.l2.flippedX();
  }
  // poses extras de campo (ex.: surpreso, sentado) definidas como linhas completas
  for (const [name, rows] of Object.entries(def.extra || {})) {
    const lw = Math.max(W, ...rows.map((r) => r.length));
    frames[name] = sprite(pad(rows, lw), P, { ...opts, localW: lw });
  }
  return frames;
}

export function buildBattleFrames(def) {
  const P = def.palette;
  const frames = {};
  for (const [name, rows] of Object.entries(def.battle || {})) {
    const lw = Math.max(...rows.map((r) => r.length));
    frames[name] = sprite(pad(rows, lw), P, {
      w: BATTLE_FRAME.w,
      h: BATTLE_FRAME.h,
      localW: lw,
      offX: def.battleOffX?.[name] || 0,
    });
  }
  return frames;
}
