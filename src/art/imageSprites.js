// Sprites em PNG (ex.: gerados no SpriteCook) — contrato em docs/SPRITECOOK.md.
// Quando existem, substituem a arte desenhada em código; quadros ausentes
// continuam vindo do código.
import { Bitmap } from './bitmap.js';

// import.meta.glob é resolvido pelo Vite; no Node (ferramentas) não existe.
let PNGS = {};
let METAS = {};
try {
  PNGS = import.meta.glob('../assets/sprites/**/*.png', { eager: true, query: '?url', import: 'default' });
  METAS = import.meta.glob('../assets/sprites/**/meta.json', { eager: true, import: 'default' });
} catch {
  /* fora do Vite: sem sprites em PNG */
}

const store = { heroes: {}, enemies: {} };

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function toBitmap(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const b = new Bitmap(c.width, c.height);
  b.data.set(g.getImageData(0, 0, c.width, c.height).data);
  // alfa binário: pixel art não tem meio-termo
  for (let i = 3; i < b.data.length; i += 4) b.data[i] = b.data[i] >= 128 ? 255 : 0;
  return b;
}

function parse(path) {
  const m = path.match(/assets\/sprites\/(heroes|enemies)\/([^/]+)\/([^/]+)\.(png|json)$/);
  return m ? { group: m[1], id: m[2], name: m[3] } : null;
}

// Carrega todas as imagens antes do jogo começar.
export async function loadImageSprites() {
  for (const [path, meta] of Object.entries(METAS)) {
    const p = parse(path);
    if (p) (store[p.group][p.id] ||= { frames: {} }).meta = meta;
  }
  await Promise.allSettled(
    Object.entries(PNGS).map(async ([path, url]) => {
      const p = parse(path);
      if (!p) return;
      const bmp = toBitmap(await loadImage(url));
      (store[p.group][p.id] ||= { frames: {} }).frames[p.name] = bmp;
    })
  );
}

const FIELD = ['d0', 'd1', 'd2', 'u0', 'u1', 'u2', 'l0', 'l1', 'l2'];

function heightOf(bmp) {
  return bmp?.bounds()?.h || 0;
}

// Quadros de campo de um herói: só usa as imagens se o ciclo estiver completo.
// Retorna { frames, scale } com escala que preserva a altura da arte em código.
export function heroFieldImages(id, codeFrames, codeScale = 1) {
  const s = store.heroes[id];
  if (!s || !FIELD.every((k) => s.frames['field_' + k])) return null;
  const frames = {};
  for (const k of FIELD) frames[k] = s.frames['field_' + k];
  frames.r0 = frames.l0.flippedX();
  frames.r1 = frames.l1.flippedX();
  frames.r2 = frames.l2.flippedX();
  if (s.frames.field_ko) frames.ko = s.frames.field_ko;
  else if (codeFrames.ko) frames.ko = codeFrames.ko;
  // altura medida no próprio quadro parado (mais confiável que o meta)
  const h = heightOf(frames.d0) || s.meta?.heightPx;
  return { frames, scale: (heightOf(codeFrames.d0) * codeScale) / h };
}

// Poses de batalha: cada pose ausente cai para a do código (redimensionada pela escala).
export function heroBattleImages(id, codeFrames, codeScale = 1) {
  const s = store.heroes[id];
  if (!s || !s.frames.battle_idle) return null;
  const frames = {};
  for (const k of Object.keys(codeFrames)) frames[k] = s.frames['battle_' + k] || null;
  const missing = Object.keys(frames).filter((k) => !frames[k]);
  const fallback = frames.hurt || frames.idle;
  for (const k of missing) frames[k] = k === 'kneel' ? fallback : frames.idle;
  const h = heightOf(frames.idle) || s.meta?.battleHeightPx;
  return { frames, scale: (heightOf(codeFrames.idle) * codeScale) / h };
}

export function enemyImages(kind, codeIdle) {
  const s = store.enemies[kind];
  if (!s || !s.frames.idle) return null;
  const f = s.frames;
  const h = s.meta?.heightPx || heightOf(f.idle);  // aura/chamas contam na altura
  return {
    idle: f.idle,
    alt: f.alt || f.idle,
    glow: f.glow || null,
    altGlow: f.altGlow || f.glow || null,
    scale: heightOf(codeIdle) / h,
  };
}

export function imageSpriteSummary() {
  return {
    heroes: Object.fromEntries(Object.entries(store.heroes).map(([k, v]) => [k, Object.keys(v.frames).length])),
    enemies: Object.fromEntries(Object.entries(store.enemies).map(([k, v]) => [k, Object.keys(v.frames).length])),
  };
}
