// Prédios 3D com texturas pixel-art pintadas proceduralmente: paredes com
// portas/janelas (janelas brilham à noite), telhados de telhas e o farol.
import * as THREE from 'three';
import { Bitmap, hexToRgb, hash2, mix } from '../art/bitmap.js';
import { valueNoise } from '../art/noise.js';
import { bitmapToTexture } from './textures.js';

const PPU = 16;
const C = hexToRgb;

const WALLS = {
  plaster: { base: ['#fbf0d8', '#eadcbe', '#cdbb98', '#a8946e'], beam: ['#8e5a30', '#6a3e20', '#4a2a14'] },
  stone: { base: ['#e0d8cc', '#bcb2a4', '#968c7e', '#6e665a'], beam: null },
  wood: { base: ['#e0a868', '#c48848', '#a06a38', '#784c28'], beam: ['#5a3418', '#3a2010', '#24140a'] },
  brick: { base: ['#e88a6a', '#c86a4e', '#a04e3a', '#743428'], beam: null },
  metal: { base: ['#b8c0d0', '#949eb2', '#727c92', '#545c72'], beam: ['#40465a', '#2c3042', '#1c2030'] },
  dark: { base: ['#7a7290', '#5c5672', '#443e58', '#2e2a40'], beam: ['#2a2238', '#1c1626', '#100c18'] },
};
const ROOFS = {
  red: ['#ff9a7a', '#e8644a', '#c04434', '#8a2a28', '#5a1a1e'],
  blue: ['#9ad0ff', '#5a96e0', '#3a68b8', '#284688', '#1a2c5a'],
  green: ['#b8e88a', '#78bc5a', '#4e9446', '#346a3a', '#20462a'],
  slate: ['#b0b4d0', '#8a8eae', '#666a8a', '#484a66', '#2e3044'],
  thatch: ['#fff0a0', '#e8c868', '#c09a44', '#8a6a2c', '#5a421c'],
  teal: ['#9af0e0', '#4ac8b4', '#2a9a8e', '#1c6a66', '#104440'],
};

// ------------------------------------------------------------------ pintura
function paintWall(w, h, kind, opts = {}) {
  const spec = WALLS[kind] || WALLS.plaster;
  const b = new Bitmap(w, h);
  const glow = new Bitmap(w, h);
  const seed = opts.seed || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let k = 1;
      if (kind === 'stone') {
        const row = Math.floor(y / 6);
        const off = (row % 2) * 5;
        const lx = (x + off) % 10, ly = y % 6;
        k = lx === 0 || ly === 5 ? 3 : ly === 0 ? 0 : hash2(Math.floor((x + off) / 10), row, seed) > 0.6 ? 2 : 1;
      } else if (kind === 'brick') {
        const row = Math.floor(y / 4);
        const off = (row % 2) * 4;
        const lx = (x + off) % 8, ly = y % 4;
        k = lx === 0 || ly === 3 ? 3 : ly === 0 ? 0 : hash2(Math.floor((x + off) / 8), row, seed) > 0.7 ? 2 : 1;
      } else if (kind === 'wood') {
        const ly = y % 5;
        k = ly === 4 ? 3 : ly === 0 ? 0 : valueNoise(x / 6, Math.floor(y / 5) * 3, seed) > 0.55 ? 1 : 2;
      } else if (kind === 'metal') {
        const lx = x % 16;
        k = lx === 0 ? 3 : lx === 1 ? 0 : y % 16 === 0 ? 3 : (lx % 5 === 0 ? 2 : 1);
      } else {
        const n = valueNoise(x / 5, y / 5, seed);
        k = n > 0.7 ? 0 : n < 0.25 ? 2 : 1;
      }
      b.set(x, y, C(spec.base[k]));
    }
  }
  // vigas de enxaimel
  if (spec.beam && (kind === 'plaster' || kind === 'dark')) {
    const beam = (x0, y0, x1, y1) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
        b.set(x, y, C(spec.beam[0]));
        b.set(x + 1, y, C(spec.beam[1]));
        b.set(x, y + 1, C(spec.beam[1]));
      }
    };
    for (let x = 0; x < w; x += 16) beam(x, 0, x, h - 1);
    beam(0, 0, w - 1, 0);
    beam(0, h - 7, w - 1, h - 7);
    if (h > 24) beam(0, Math.floor(h / 2) - 1, w - 1, Math.floor(h / 2) - 1);
  }
  // base de pedra
  for (let y = h - 5; y < h; y++) for (let x = 0; x < w; x++) {
    const lx = (x + ((y - h) % 2 ? 3 : 0)) % 7;
    b.set(x, y, C(['#b4aca0', '#8e867a', '#6a6258', '#48423c'][lx === 0 ? 3 : y === h - 5 ? 0 : y === h - 1 ? 2 : 1]));
  }
  // sombra sob o beiral
  for (let y = 0; y < 4; y++) for (let x = 0; x < w; x++) b.set(x, y, mix(b.get(x, y), [20, 14, 30], 0.5 - y * 0.12));

  // portas e janelas
  for (const wx of opts.windows || []) drawWindow(b, glow, Math.round(wx * PPU) + 2, Math.max(6, Math.floor(h / 2) - 8), opts.shutter || '#4a7ab8', opts.lit);
  if (opts.door !== undefined && opts.door !== null) drawDoor(b, glow, Math.round(opts.door * PPU) + 1, h, opts.doorColor || '#8e5a30', opts.lit);
  return { b, glow };
}

function drawWindow(b, glow, x, y, shutter, lit) {
  const frame = C('#5a3418');
  const pane = lit ? C('#ffd890') : C('#3a4a70');
  const paneHi = lit ? C('#fff4c8') : C('#7a9ad0');
  for (let j = 0; j < 12; j++) {
    for (let i = 0; i < 12; i++) {
      const border = i === 0 || i === 11 || j === 0 || j === 11;
      const cross = i === 6 || j === 6;
      let c = border || cross ? frame : j < 3 && i < 5 ? paneHi : pane;
      b.set(x + i, y + j, c);
      if (lit && !border && !cross) glow.set(x + i, y + j, c);
    }
  }
  // venezianas
  const s = C(shutter), sd = mix(shutter, '#000000', 0.35);
  for (let j = 0; j < 12; j++) {
    for (const sx of [x - 4, x + 12]) for (let i = 0; i < 4; i++) b.set(sx + i, y + j, j % 3 === 2 ? sd : s);
  }
  // floreira
  for (let i = -1; i < 13; i++) b.set(x + i, y + 12, C('#8e5a30')), b.set(x + i, y + 13, C('#5a3418'));
  for (let i = 0; i < 12; i += 2) b.set(x + i, y + 11, C(i % 4 ? '#ff7aa0' : '#ffd24a'));
}

function drawDoor(b, glow, x, h, color, lit) {
  const dh = 22, dw = 14;
  const y0 = h - dh;
  const c1 = C(color), c2 = mix(color, '#000000', 0.3), c3 = mix(color, '#ffffff', 0.2);
  for (let j = 0; j < dh; j++) {
    for (let i = 0; i < dw; i++) {
      const arch = j < 3 && (i < 3 - j || i > dw - 4 + j);
      if (arch) continue;
      let c = i === 0 || i === dw - 1 || j === 0 ? C('#3a2010') : i % 4 === 0 ? c2 : i % 4 === 1 ? c3 : c1;
      b.set(x + i, y0 + j, c);
    }
  }
  b.set(x + dw - 4, y0 + 12, C('#ffe080'));
  b.set(x + dw - 4, y0 + 13, C('#b08030'));
  // degrau
  for (let i = -2; i < dw + 2; i++) b.set(x + i, h - 1, C('#d8d0c4'));
  // lanterna ao lado da porta
  if (lit) {
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
      b.set(x + dw + 2 + i, y0 + 4 + j, C('#ffe8a0'));
      glow.set(x + dw + 2 + i, y0 + 4 + j, C('#ffe8a0'));
    }
  }
}

function paintRoof(w, h, kind, seed = 1) {
  const pal = (ROOFS[kind] || ROOFS.red).map(C);
  const b = new Bitmap(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let k;
      if (kind === 'thatch') {
        const n = valueNoise(x / 1.5, y / 4, seed);
        k = (y % 6 === 5 ? 3 : n > 0.6 ? 1 : n < 0.3 ? 3 : 2);
      } else {
        // telhas em escama
        const row = Math.floor(y / 5);
        const off = (row % 2) * 3;
        const lx = (x + off) % 6, ly = y % 5;
        const curve = Math.abs(lx - 2.5) / 2.5;
        k = ly === 4 || (ly === 3 && curve > 0.7) ? 4 : ly === 0 ? 1 : lx === 0 ? 3 : curve < 0.4 ? 1 : 2;
        if (hash2(Math.floor((x + off) / 6), row, seed) > 0.9 && k < 3) k = Math.min(3, k + 1);
      }
      // luz: topo mais claro
      if (y < 2) k = Math.max(0, k - 1);
      b.set(x, y, pal[k]);
    }
  }
  return b;
}

// ------------------------------------------------------------------ malhas
function mat(bmp, glowBmp, glowIntensity = 0) {
  const m = new THREE.MeshLambertMaterial({ map: bitmapToTexture(bmp) });
  m.map.userData.owned = true;
  if (glowBmp) {
    m.emissiveMap = bitmapToTexture(glowBmp);
    m.emissive = new THREE.Color('#ffffff');
    m.emissiveIntensity = glowIntensity;
  }
  return m;
}

function quad(w, h) {
  return new THREE.PlaneGeometry(w, h);
}

// Casa: footprint (x,y,w,d) em tiles; base = altura do chão
export function buildHouse(spec, base) {
  const g = new THREE.Group();
  const { x, y, w, d } = spec;
  const wallH = spec.h || 2;
  const seed = spec.seed || x * 7 + y * 13;
  const lit = !!spec.lit;
  const glowI = lit ? 1.6 : 0;
  const wallKind = spec.wall || 'plaster';

  // frente (sul)
  const front = paintWall(w * PPU, wallH * PPU, wallKind, { door: spec.door, windows: spec.windows || [], seed, lit, shutter: spec.shutter, doorColor: spec.doorColor });
  const fm = new THREE.Mesh(quad(w, wallH), mat(front.b, front.glow, glowI));
  fm.position.set(x + w / 2, base + wallH / 2, y + d);
  g.add(fm);
  // laterais
  const side = paintWall(d * PPU, wallH * PPU, wallKind, { windows: spec.sideWindows || (d >= 3 ? [Math.floor(d / 2) - 0.4] : []), seed: seed + 3, lit, shutter: spec.shutter });
  const sideMat = mat(side.b, side.glow, glowI);
  const east = new THREE.Mesh(quad(d, wallH), sideMat);
  east.rotation.y = Math.PI / 2;
  east.position.set(x + w, base + wallH / 2, y + d / 2);
  g.add(east);
  const west = new THREE.Mesh(quad(d, wallH), sideMat);
  west.rotation.y = -Math.PI / 2;
  west.position.set(x, base + wallH / 2, y + d / 2);
  g.add(west);
  // fundo (para sombras)
  const back = new THREE.Mesh(quad(w, wallH), sideMat);
  back.rotation.y = Math.PI;
  back.position.set(x + w / 2, base + wallH / 2, y);
  g.add(back);

  // telhado de duas águas (cumeeira leste-oeste)
  const over = 0.35;
  const rise = spec.roofRise || Math.min(2.2, d * 0.6);
  const half = d / 2 + over;
  const slope = Math.hypot(half, rise);
  const roofW = w + over * 2;
  const roofKind = spec.roof || 'red';
  const roofBmp = paintRoof(Math.round(roofW * PPU), Math.round(slope * PPU), roofKind, seed);
  const roofMat = mat(roofBmp);
  const ang = Math.atan2(rise, half);
  const topY = base + wallH + rise;
  const southRoof = new THREE.Mesh(quad(roofW, slope), roofMat);
  southRoof.position.set(x + w / 2, topY - rise / 2 - 0.0, y + d / 2 + half / 2);
  southRoof.rotation.x = -Math.PI / 2 + ang;
  g.add(southRoof);
  const northRoof = new THREE.Mesh(quad(roofW, slope), roofMat);
  northRoof.position.set(x + w / 2, topY - rise / 2, y + d / 2 - half / 2);
  northRoof.rotation.x = -Math.PI / 2 - ang;
  g.add(northRoof);
  // cumeeira
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(roofW + 0.05, 0.16, 0.22), new THREE.MeshLambertMaterial({ color: new THREE.Color((ROOFS[roofKind] || ROOFS.red)[4]) }));
  ridge.position.set(x + w / 2, topY + 0.02, y + d / 2);
  g.add(ridge);
  // oitões (triângulos)
  const gable = gableGeometry(d, rise);
  for (const gx of [x, x + w]) {
    const gm = new THREE.Mesh(gable, sideMat);
    gm.position.set(gx, base + wallH, y + d / 2);
    gm.rotation.y = gx === x ? -Math.PI / 2 : Math.PI / 2;
    g.add(gm);
  }
  // chaminé
  if (spec.chimney !== false) {
    const cm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: '#8e867a' }));
    cm.position.set(x + w - 0.8, topY - 0.1, y + d / 2 - 0.4);
    g.add(cm);
    g.userData.chimney = new THREE.Vector3(x + w - 0.8, topY + 0.6, y + d / 2 - 0.4);
  }
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.userData.windowMats = [fm.material, sideMat];
  return g;
}

function gableGeometry(d, rise) {
  const geo = new THREE.BufferGeometry();
  const hw = d / 2;
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-hw, 0, 0, hw, 0, 0, 0, rise, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0.0, 1, 0.0, 0.5, Math.min(1, rise / 2)], 2));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  geo.setIndex([0, 1, 2]);
  return geo;
}

// ------------------------------------------------------------------ farol
export function buildLighthouse(spec, base) {
  const g = new THREE.Group();
  const H = spec.h || 7;
  const R = 1.25;
  const segs = 10;
  const tw = Math.round(2 * Math.PI * R * PPU), th = H * PPU;
  const tb = new Bitmap(tw, th);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const band = Math.floor(y / 20) % 2;
    const n = valueNoise(x / 4, y / 4, 3);
    const k = n > 0.7 ? 0 : n < 0.25 ? 2 : 1;
    const c = band ? ['#ff8070', '#d84a40', '#a83030'][k] : ['#ffffff', '#ece6dc', '#c8c0b4'][k];
    tb.set(x, y, C(c));
  }
  // janelinhas
  for (let wy = 30; wy < th - 20; wy += 34) for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) tb.set(Math.floor(tw * 0.25) + i, wy + j, C(i === 0 || j === 0 ? '#5a3418' : '#3a4a70'));
  const towerGeo = new THREE.CylinderGeometry(R * 0.82, R, H, segs, 1, true);
  const tower = new THREE.Mesh(towerGeo, mat(tb));
  tower.position.set(spec.x + 0.5, base + H / 2, spec.y + 0.5);
  g.add(tower);
  // galeria
  const gal = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.12, R * 1.0, 0.25, segs), new THREE.MeshLambertMaterial({ color: '#3a3a4a' }));
  gal.position.set(spec.x + 0.5, base + H + 0.12, spec.y + 0.5);
  g.add(gal);
  // sala da lâmpada (vidro emissivo)
  const lampMat = new THREE.MeshLambertMaterial({ color: '#fff4c0', emissive: new THREE.Color('#ffd070'), emissiveIntensity: spec.lit ? 2.2 : 0.4 });
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 1.0, segs), lampMat);
  lamp.position.set(spec.x + 0.5, base + H + 0.75, spec.y + 0.5);
  g.add(lamp);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(R * 0.85, 0.9, segs), new THREE.MeshLambertMaterial({ color: '#c03a34' }));
  cap.position.set(spec.x + 0.5, base + H + 1.7, spec.y + 0.5);
  g.add(cap);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  // feixe de luz giratório
  if (spec.lit) {
    // feixe: cone estreito com opacidade decrescente ao longo do comprimento
    const beamGeo = new THREE.ConeGeometry(1.1, 16, 12, 6, true);
    beamGeo.translate(0, -8, 0);
    const cols = [];
    const pa = beamGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const t = Math.min(1, Math.max(0, -pa.getY(i) / 16));
      const k = (1 - t) * (1 - t);
      cols.push(k, k * 0.92, k * 0.7);
    }
    beamGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const beamMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    const pivot = new THREE.Group();
    pivot.position.set(spec.x + 0.5, base + H + 0.75, spec.y + 0.5);
    pivot.add(beam);
    const beam2 = beam.clone();
    beam2.rotation.z = -Math.PI / 2;
    pivot.add(beam2);
    g.add(pivot);
    g.userData.update = (t) => {
      pivot.rotation.y = t * 0.6;
    };
  }
  g.userData.lightPos = new THREE.Vector3(spec.x + 0.5, base + H + 0.8, spec.y + 0.5);
  return g;
}

export function setBuildingsLit(group, lit) {
  group.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissiveMap) o.material.emissiveIntensity = lit ? 1.6 : 0;
  });
}
