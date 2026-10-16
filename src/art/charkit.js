// Kit de personagens: transforma definições ASCII (sem contorno) em frames
// com contorno "sel-out" automático, no padrão de sprites de SNES.
import { Bitmap, fromAscii, hexToRgb, mix, shade } from './bitmap.js';

export const FRAME_W = 32;
export const FRAME_H = 32;

// Converte linhas locais (largura arbitrária) para o quadro final, centralizando
// horizontalmente e alinhando pela base (pés na linha FRAME_H - 2).
export function placeRows(rows, { w = FRAME_W, h = FRAME_H, offX = 0, offY = 0, localW = null } = {}) {
  const lw = localW || Math.max(...rows.map((r) => r.length));
  const padL = Math.floor((w - lw) / 2) + offX;
  const padT = h - 1 - rows.length + offY; // deixa 1px para o contorno inferior
  const out = [];
  for (let y = 0; y < h; y++) {
    const ry = y - padT;
    let r = ry >= 0 && ry < rows.length ? rows[ry] : '';
    r = r.padEnd(lw, '.');
    let line = '.'.repeat(Math.max(0, padL)) + (padL < 0 ? r.slice(-padL) : r);
    line = line.padEnd(w, '.').slice(0, w);
    out.push(line);
  }
  return out;
}

// Contorno sel-out: cada pixel de contorno pega a cor do vizinho e escurece
// fortemente; contornos inferiores ficam mais escuros que os superiores.
export function selOut(bmp, base = '#120a12', strength = 0.78) {
  const dark = hexToRgb(base);
  const out = bmp.clone();
  for (let y = 0; y < bmp.h; y++) {
    for (let x = 0; x < bmp.w; x++) {
      if (bmp.alpha(x, y) > 0) continue;
      const nb = [];
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
        if (bmp.alpha(x + dx, y + dy) > 0) nb.push([bmp.get(x + dx, y + dy), dy]);
      }
      if (!nb.length) continue;
      // prioriza o vizinho de cima (luz vem de cima)
      const [c, dy] = nb[0];
      const k = dy < 0 ? strength + 0.1 : strength; // borda de baixo do objeto => mais escura
      const t = mix(c, dark, Math.min(0.95, k));
      out.set(x, y, t);
    }
  }
  return out;
}

// Constrói um bitmap a partir de linhas + paleta, com contorno automático.
export function sprite(rows, palette, opts = {}) {
  const placed = opts.raw ? rows : placeRows(rows, opts);
  const bmp = fromAscii(placed, palette, opts.w || FRAME_W);
  return opts.noOutline ? bmp : selOut(bmp, opts.outline || '#120a12', opts.outlineStrength || 0.78);
}

// Gera paleta a partir de "materiais": { H: ['#luz','#base','#sombra','#escuro'] }
// mapeando chars definidos em keys: { H: 'hHJK' } => h=luz, H=base, J=sombra, K=escuro
export function paletteFrom(materials, keys) {
  const pal = {};
  for (const [mat, chars] of Object.entries(keys)) {
    const tones = materials[mat];
    if (!tones) throw new Error('material ausente: ' + mat);
    for (let i = 0; i < chars.length; i++) pal[chars[i]] = tones[Math.min(i, tones.length - 1)];
  }
  return pal;
}

// Pisca/flash branco (dano) e silhuetas.
export function tinted(bmp, color, t = 1) {
  const c = hexToRgb(color);
  return bmp.map((p) => mix(p, c, t));
}

export function darker(bmp, amt = 0.3) {
  return bmp.map((p) => shade(p, -amt));
}

export function emptyFrame(w = FRAME_W, h = FRAME_H) {
  return new Bitmap(w, h);
}
