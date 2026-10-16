// Registro central de arte gerada (texturas criadas uma única vez).
import * as THREE from 'three';
import { buildProps } from '../art/props.js';
import { paintSideAtlas } from '../art/terrain.js';
import { buildFieldFrames, buildBattleFrames } from '../art/characters.js';
import { bitmapToTexture } from '../render/textures.js';
import { makeSheet } from '../render/Actor.js';
import { heroFieldImages, heroBattleImages } from '../art/imageSprites.js';

const cache = {
  props: null,
  propTex: {},
  side: null,
  fieldSheets: {},
  battleSheets: {},
  charDefs: {},
};

export function registerCharacters(defs) {
  for (const d of defs) cache.charDefs[d.id] = d;
}

export function charDef(id) {
  return cache.charDefs[id];
}

export function props() {
  if (!cache.props) cache.props = buildProps();
  return cache.props;
}

export function propTextures(name) {
  if (cache.propTex[name]) return cache.propTex[name];
  const p = props()[name];
  if (!p) throw new Error('prop desconhecido: ' + name);
  const t = { map: bitmapToTexture(p.bmp), glow: p.glow ? bitmapToTexture(p.glow) : null, w: p.bmp.w, h: p.bmp.h, def: p };
  cache.propTex[name] = t;
  return t;
}

export function sideAtlas() {
  if (!cache.side) {
    const bmp = paintSideAtlas();
    cache.side = { tex: bitmapToTexture(bmp), size: [bmp.w, bmp.h] };
  }
  return cache.side;
}

export function fieldSheet(id) {
  if (!cache.fieldSheets[id]) {
    const def = cache.charDefs[id];
    if (!def) throw new Error('personagem desconhecido: ' + id);
    const code = buildFieldFrames(def);
    // sprites em PNG (SpriteCook) têm prioridade quando o ciclo está completo
    const img = heroFieldImages(id, code, def.scale || 1);
    cache.fieldSheets[id] = makeSheet(img ? img.frames : code);
    cache.fieldSheets[id].floats = !!def.floats;
    cache.fieldSheets[id].scale = img ? img.scale : def.scale || 1;
    // sombra de contato do tamanho do corpo (sprites FF6 são mais estreitos)
    if (def.ink) cache.fieldSheets[id].blobSize = ((def.localW || 16) / 16) * (def.scale || 1);
  }
  return cache.fieldSheets[id];
}

export function battleSheet(id) {
  if (!cache.battleSheets[id]) {
    const def = cache.charDefs[id];
    const code = buildBattleFrames(def);
    const img = heroBattleImages(id, code, def.scale || 1);
    cache.battleSheets[id] = makeSheet(img ? img.frames : code, 4);
    cache.battleSheets[id].scale = img ? img.scale : def.scale || 1;
    if (def.ink) cache.battleSheets[id].blobSize = ((def.localW || 16) / 16) * (def.scale || 1) * 1.1;
  }
  return cache.battleSheets[id];
}

// Folha arbitrária (ex.: inimigos) a partir de {nome: Bitmap}
const custom = {};
export function customSheet(key, framesFn, cols = 4) {
  if (!custom[key]) custom[key] = makeSheet(framesFn(), cols);
  return custom[key];
}

export const tmpVec = new THREE.Vector3();
