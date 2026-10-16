// Sprites em PNG — contrato em docs/SPRITES.md.
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

const store = { heroes: {}, enemies: {}, npcs: {}, props: {}, portraits: {} };
let propMeta = {};

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
  const m = path.match(/assets\/sprites\/(heroes|enemies|npcs)\/([^/]+)\/([^/]+)\.(png|json)$/);
  return m ? { group: m[1], id: m[2], name: m[3] } : null;
}

// Carrega todas as imagens antes do jogo começar.
export async function loadImageSprites() {
  for (const [path, meta] of Object.entries(METAS)) {
    if (/sprites\/props\/meta\.json$/.test(path)) propMeta = meta;
    const p = parse(path);
    if (p) (store[p.group][p.id] ||= { frames: {} }).meta = meta;
  }
  await Promise.allSettled(
    Object.entries(PNGS).map(async ([path, url]) => {
      const pr = path.match(/sprites\/portraits\/([^/]+)\/([^/]+)\.png$/);
      if (pr) {
        (store.portraits[pr[1]] ||= {})[pr[2]] = url;
        return;
      }
      const pp = path.match(/sprites\/props\/([^/]+)\.png$/);
      if (pp) {
        store.props[pp[1]] = toBitmap(await loadImage(url));
        return;
      }
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

const GLOWS = /^(lobo|lodo|golem|aranha|cao_ferro|cao_ferro2|mago|drone|tita|crystal|crystalblue|mushglow|save|lamp|torch|fire0|fire1)$/;

// Máscara emissiva (só as partes que brilham) para sprites sem quadro "glow".
function makeGlow(src, id) {
  if (!GLOWS.test(id)) return null;
  const out = new Bitmap(src.w, src.h);
  const violet = /lobo|lodo|golem|aranha|crystal$/.test(id);
  const cyan = /crystalblue|mushglow|save|cao_ferro2/.test(id);
  const strength = /^(lobo|lodo|golem|aranha|cao_ferro|cao_ferro2|mago|drone|tita)$/.test(id) ? 0.38 : 0.9;
  let lit = 0;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (!c || !c[3]) continue;
      const [r, g, b] = c;
      const on = violet ? b > 140 && b > g * 1.25 && r > 85
        : cyan ? b > 170 && g > 140 && r < b * 0.85
        : /mago/.test(id) ? g > 150 && g > r * 1.4
        : r > 200 && g > 90 && b < g * 0.8;
      if (on && (!/lodo/.test(id) || y < src.h * 0.45) && (id !== 'tita' || (x > src.w * 0.35 && x < src.w * 0.78 && y > src.h * 0.25 && y < src.h * 0.6))) {
        out.set(x, y, [Math.round(r * strength), Math.round(g * strength), Math.round(b * strength), 255]);
        lit++;
      } else out.set(x, y, [0, 0, 0, 255]);
    }
  }
  return lit ? out : null;
}

// "Respiração": a metade de cima sobe 1 pixel.
function breathe(src, id) {
  const out = new Bitmap(src.w, src.h);
  const pivot = /goticula|lodo/.test(id) ? 0.6 : 0.72;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, Math.min(src.h - 1, y + (y < src.h * pivot ? 1 : 0)));
      if (c && c[3]) out.set(x, y, c);
    }
  }
  return out;
}

function pad(b, w, h) {
  const out = new Bitmap(w, h);
  out.blit(b, Math.floor((w - b.w) / 2), h - b.h - 2);
  return out;
}

export function enemyImages(kind, codeIdle, codeScale = 1) {
  const s = store.enemies[kind];
  if (!s || !s.frames.idle) return null;
  const f = s.frames;
  const h = s.meta?.heightPx || heightOf(f.idle);  // aura/chamas contam na altura
  const scale = (heightOf(codeIdle) * codeScale) / h;
  if (f.alt) {
    return { idle: f.idle, alt: f.alt, glow: f.glow || null, altGlow: f.altGlow || f.glow || null, scale };
  }
  // quadro único: gera respiração e brilho
  const idle = pad(f.idle, f.idle.w + 8, f.idle.h + 8);
  const alt = pad(breathe(f.idle, kind), idle.w, idle.h);
  return { idle, alt, glow: f.glow || makeGlow(idle, kind), altGlow: makeGlow(alt, kind), scale };
}

// Passo de caminhada sintético: as pernas deslocam-se em contrafase.
function walkFrame(src, phase, dir) {
  const out = new Bitmap(src.w, src.h);
  const cut = Math.floor(src.h * 0.72);
  const mid = src.w / 2;
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const prog = Math.max(0, (y - cut) / Math.max(1, src.h - cut));
      const leg = Math.abs(x - mid) < src.w * 0.28;
      const off = leg ? Math.round(prog * phase * (x < mid ? 1.6 : -1.6)) : 0;
      const sx = dir === 'left' && leg ? x - Math.round(prog * phase) : x;
      const c = src.get(sx, y - off);
      if (c && c[3]) out.set(x, y, c);
    }
  }
  return out;
}

// NPC: três poses (frente, costas, lado) viram o ciclo de campo completo.
export function npcFieldImages(id, codeFrames, codeScale = 1) {
  const s = store.npcs[id];
  if (!s || !['down', 'up', 'left'].every((d) => s.frames[d])) return null;
  const W = 72, H = 84;
  const frames = {};
  for (const [dir, p] of [['down', 'd'], ['up', 'u'], ['left', 'l']]) {
    const b = s.frames[dir];
    frames[p + '0'] = pad(b, W, H);
    frames[p + '1'] = pad(walkFrame(b, 1, dir), W, H);
    frames[p + '2'] = pad(walkFrame(b, -1, dir), W, H);
  }
  for (let i = 0; i < 3; i++) frames['r' + i] = frames['l' + i].flippedX();
  return { frames, scale: (heightOf(codeFrames.d0) * codeScale) / heightOf(frames.d0) };
}

// Props em PNG (3x a densidade lógica): { bmp, glow, w, h } com tamanho lógico em px.
export function propImage(id) {
  const bmp = store.props[id];
  if (!bmp) return null;
  const m = propMeta[id] || {};
  return { bmp, glow: makeGlow(bmp, id), w: m.logicalW || bmp.w, h: m.logicalH || bmp.h };
}

export function portraitImage(id, expr = 'neutral') {
  const p = store.portraits[id];
  return p ? p[expr] || p.neutral || null : null;
}

export function imageSpriteSummary() {
  return {
    heroes: Object.fromEntries(Object.entries(store.heroes).map(([k, v]) => [k, Object.keys(v.frames).length])),
    enemies: Object.fromEntries(Object.entries(store.enemies).map(([k, v]) => [k, Object.keys(v.frames).length])),
  };
}
