// Retratos para diálogos/menus. Usa src/art/portraits.js quando disponível;
// caso contrário, recorta a cabeça do sprite de campo como alternativa.
import { Bitmap } from '../art/bitmap.js';
import { bitmapToDataURL } from '../render/textures.js';
import { buildFieldFrames } from '../art/characters.js';
import { charDef } from '../game/assets.js';

const portraitMods = import.meta.glob('../art/portraits.js', { eager: true });
const mod = Object.values(portraitMods)[0] || null;

const cache = new Map();

export function portraitURL(id, expr = 'neutral') {
  const key = id + ':' + expr;
  if (cache.has(key)) return cache.get(key);
  let url = null;
  try {
    if (mod && mod.PORTRAIT_IDS?.includes(id)) {
      const bmp = mod.buildPortrait(id, expr);
      url = bitmapToDataURL(bmp, 4);
    }
  } catch (e) {
    console.warn('retrato', id, e.message);
  }
  if (!url) {
    // alternativa: recorte da cabeça do sprite de campo
    try {
      const def = charDef(id);
      if (def) {
        const f = buildFieldFrames(def).d0;
        const b = new Bitmap(24, 24);
        b.blit(f, 0, 0, { sx: 4, sy: 0, sw: 24, sh: 24 });
        url = bitmapToDataURL(b, 6);
      }
    } catch (e) {
      /* sem retrato */
    }
  }
  cache.set(key, url);
  return url;
}

export function hasPortraits() {
  return !!mod;
}
