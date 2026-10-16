// Monta o diorama completo de um mapa: terreno, props instanciados,
// prédios, luzes e partículas. Também expõe dados de colisão.
import * as THREE from 'three';
import { paintGround, cellMat, cellH } from '../art/terrain.js';
import { hash2 } from '../art/bitmap.js';
import { bitmapToTexture } from './textures.js';
import { buildTerrain, groundHeight } from './TerrainMesh.js';
import { buildHouse, buildLighthouse } from './Buildings.js';
import { propTextures, sideAtlas } from '../game/assets.js';
import { SPRITE_SCALE_Y } from './Actor.js';
import { Particles } from './Particles.js';
import { occlude } from './occlusion.js';
import { shardProps } from '../data/shards.js';

const PPU = 16;

// Expande o mapa com uma borda decorativa e desloca todas as coordenadas.
export function normalizeMap(src) {
  if (src.__normalized) return src;
  const M = src.margin ?? 7;
  const border = src.border || 'forest';
  const W = src.w + M * 2, H = src.h + M * 2;
  const fill = { forest: 'G', sea: 'W', cave: 'R', fort: 'F', void: 'x', grass: 'g', sand: 's' }[border] || 'G';
  const fillH = { forest: null, sea: '0', cave: '6', fort: '6', void: '0', grass: null, sand: null }[border];
  const tiles = [], heights = [];
  for (let y = 0; y < H; y++) {
    let tr = '', hr = '';
    for (let x = 0; x < W; x++) {
      const sx = x - M, sy = y - M;
      const inside = sx >= 0 && sy >= 0 && sx < src.w && sy < src.h;
      if (inside) {
        tr += src.tiles[sy][sx];
        hr += src.heights ? src.heights[sy][sx] : '0';
      } else {
        // replica a altura da borda mais próxima para continuidade
        const cx = Math.max(0, Math.min(src.w - 1, sx)), cy = Math.max(0, Math.min(src.h - 1, sy));
        const edgeH = src.heights ? src.heights[cy][cx] : '0';
        const edgeT = src.tiles[cy][cx];
        if (border === 'sea') {
          tr += 'W';
          hr += edgeH;
        } else if (border === 'cave' || border === 'fort') {
          tr += fill;
          hr += fillH;
        } else {
          tr += edgeT === 'W' || edgeT === 'w' ? 'W' : fill;
          hr += edgeH;
        }
      }
    }
    tiles.push(tr);
    heights.push(hr);
  }
  const shift = (o) => (o ? { ...o, x: (o.x ?? 0) + M, y: (o.y ?? 0) + M } : o);
  const map = {
    ...src,
    __normalized: true,
    margin: M,
    w: W,
    h: H,
    tiles,
    heights,
    objects: (src.objects || []).map(shift),
    npcs: (src.npcs || []).map(shift),
    chests: (src.chests || []).map(shift),
    exits: (src.exits || []).map(shift),
    triggers: (src.triggers || []).map(shift),
    enemies: (src.enemies || []).map(shift),
    lights: (src.lights || []).map(shift),
    spawns: Object.fromEntries(Object.entries(src.spawns || {}).map(([k, v]) => [k, shift(v)])),
    inner: { x0: M, y0: M, x1: M + src.w, y1: M + src.h },
  };
  // camada de props ASCII
  const props = [];
  if (src.propLayer) {
    src.propLayer.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        const name = (src.propLegend || {})[ch];
        if (!name) continue;
        props.push({ prop: pickVariant(name, x, y), x: x + M + 0.5 + (hash2(x, y, 9) - 0.5) * 0.3, y: y + M + 0.6 + (hash2(x, y, 10) - 0.5) * 0.2 });
      }
    });
  }
  // borda: árvores densas / rochas
  if (border === 'forest' || border === 'grass') {
    const kinds = src.borderTrees || ['oak0', 'oak1', 'oak2', 'pine0', 'pine1', 'darkoak0'];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const inside = x >= M && y >= M && x < M + src.w && y < M + src.h;
        if (inside) continue;
        if (src.openSouth && y >= M + src.h - 1) continue;
        if (tiles[y][x] === 'W') continue;
        // perto da borda: mais denso
        const r = hash2(x, y, 33);
        const south = y >= M + src.h;
        const dens = border === 'grass' ? 0.25 : south ? 0.14 : 0.62;
        if (r < dens) {
          props.push({ prop: kinds[Math.floor(hash2(x, y, 34) * kinds.length)], x: x + 0.5 + (hash2(x, y, 35) - 0.5) * 0.6, y: y + 0.6 + (hash2(x, y, 36) - 0.5) * 0.4, border: true });
        }
      }
    }
  }
  map.props = [...props, ...(src.props || []).map(shift)];
  return map;
}

function pickVariant(name, x, y) {
  if (!name.endsWith('*')) return name;
  const base = name.slice(0, -1);
  const variants = { oak: 3, pine: 3, darkoak: 3, palm: 2, dead: 2, bush: 2, tuft: 2, flowers: 2, rock: 2 }[base] || 1;
  return base + Math.floor(hash2(x, y, 51) * variants);
}

const geoCache = new Map();
function propGeometry(w, h, flat) {
  const key = `${w}x${h}x${flat}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const gw = w / PPU, gh = (h / PPU) * (flat ? 1 : SPRITE_SCALE_Y);
  const g = new THREE.PlaneGeometry(gw, gh);
  if (flat) {
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0.02, 0);
  } else {
    g.translate(0, gh / 2, 0);
    const n = g.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0.55, 0.83);
  }
  geoCache.set(key, g);
  return g;
}

export function buildWorld(srcMap, opts = {}) {
  const map = normalizeMap(srcMap);
  // conteúdo que depende do estado da história (partículas, luzes, props)
  const dyn = srcMap.dynamic && opts.state ? srcMap.dynamic(opts.state) || {} : srcMap.dynamic ? srcMap.dynamic({ flag: () => false }) || {} : {};
  const M = map.margin;
  const particlesList = dyn.particles || (typeof map.particles === 'function' ? [] : map.particles);
  const extraLights = (dyn.lights || []).map((l) => ({ ...l, x: l.x + M, y: l.y + M }));
  const extraProps = [...(dyn.props || []), ...shardProps(srcMap.id, opts.state)].map((p) => ({ ...p, x: p.x + M, y: p.y + M }));
  const root = new THREE.Group();
  root.name = 'world-' + map.id;

  // terreno
  const ground = paintGround(map, map.seed || 7);
  const gtex = bitmapToTexture(ground);
  gtex.userData.owned = true;
  const side = sideAtlas();
  const terrain = buildTerrain(map, gtex, side.tex, side.size);
  root.add(terrain);

  const updaters = [];
  const lights = [];
  const colliders = []; // círculos {x, z, r}
  const blocked = new Set(); // células bloqueadas (prédios)
  const night = !!opts.night;

  // prédios e objetos especiais
  for (const o of map.objects) {
    const base = groundHeight(map, Math.floor(o.x), Math.floor(o.y)) ?? 0;
    if (o.type === 'house') {
      const g = buildHouse({ ...o, lit: o.lit ?? night }, base);
      g.traverse((m) => m.isMesh && occlude(m.material));
      root.add(g);
      for (let yy = o.y; yy < o.y + o.d; yy++) for (let xx = o.x; xx < o.x + o.w; xx++) blocked.add(`${xx},${yy}`);
      if ((o.lit ?? night) && o.door !== undefined && o.door !== null) {
        lights.push({ x: o.x + o.door + 1.4, y: base + 1.2, z: o.y + o.d + 0.6, color: '#ffb060', intensity: 1.6, distance: 4.5, flicker: true });
      }
      if (g.userData.chimney && o.smoke !== false) {
        const c = g.userData.chimney;
        const smoke = new Particles('smoke', { x: c.x, y: c.y, z: c.z, count: 18 });
        root.add(smoke.points);
        updaters.push((dt, t) => smoke.update(dt, t));
      }
    } else if (o.type === 'lighthouse') {
      const g = buildLighthouse({ ...o, lit: o.lit ?? night }, base);
      root.add(g);
      blocked.add(`${o.x},${o.y}`);
      blocked.add(`${o.x + 1},${o.y}`);
      blocked.add(`${o.x},${o.y + 1}`);
      blocked.add(`${o.x - 1},${o.y}`);
      blocked.add(`${o.x},${o.y - 1}`);
      if (g.userData.update) updaters.push((dt, t) => g.userData.update(t));
      if (o.lit ?? night) lights.push({ ...g.userData.lightPos, x: g.userData.lightPos.x, y: g.userData.lightPos.y, z: g.userData.lightPos.z, color: '#ffe0a0', intensity: 3, distance: 14, pulse: 0 });
    } else if (o.type === 'block') {
      // bloqueio invisível
      for (let yy = o.y; yy < o.y + (o.d || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) blocked.add(`${xx},${yy}`);
    }
  }

  // props instanciados por tipo
  const byType = new Map();
  for (const p of [...map.props, ...extraProps]) {
    if (!byType.has(p.prop)) byType.set(p.prop, []);
    byType.get(p.prop).push(p);
  }
  const dummy = new THREE.Object3D();
  const propMeshes = {};
  for (const [name, list] of byType) {
    const t = propTextures(name);
    const def = t.def;
    const geo = propGeometry(t.w, t.h, !!def.flat);
    const mat = new THREE.MeshLambertMaterial({
      map: t.map,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      transparent: false,
    });
    if (t.glow || def.glowAll) {
      mat.emissiveMap = t.glow || t.map;
      mat.emissive = new THREE.Color('#ffffff');
      mat.emissiveIntensity = def.glowAll || def.glowIntensity || 1.3;
    }
    if (!def.flat) occlude(mat);
    const inst = new THREE.InstancedMesh(geo, mat, list.length);
    inst.castShadow = !def.flat;
    inst.receiveShadow = true;
    list.forEach((p, i) => {
      const h = groundHeight(map, Math.floor(p.x), Math.floor(p.y)) ?? 0;
      dummy.position.set(p.x, h, p.y);
      dummy.rotation.set(def.flat ? 0 : -0.12, 0, 0);
      const s = p.scale || 1;
      dummy.scale.set(p.flip ? -s : s, s, s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      if (def.solid && !p.noCollide) colliders.push({ x: p.x, z: p.y, r: def.solid * s, prop: name, ref: p });
      if (def.light) lights.push({ x: p.x, y: h + (def.light.y ?? 1), z: p.y + 0.2, ...def.light });
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.name = 'props-' + name;
    root.add(inst);
    propMeshes[name] = inst;
  }
  // animação de 2 frames para fogo (fire0/fire1 nas mesmas posições)
  if (propMeshes.fire0 && propMeshes.fire1) {
    updaters.push((dt, t) => {
      const k = Math.floor(t * 7) % 2;
      propMeshes.fire0.visible = k === 0;
      propMeshes.fire1.visible = k === 1;
    });
  }

  // luzes extras do mapa
  for (const l of [...map.lights, ...extraLights]) lights.push({ ...l, x: l.x + 0.5, z: l.y + 0.5, y: (groundHeight(map, Math.floor(l.x), Math.floor(l.y)) ?? 0) + (l.z ?? 1.5) });

  // partículas atmosféricas
  for (const kind of [].concat(particlesList || [])) {
    const inner = map.inner;
    const p = new Particles(kind, {
      x: (inner.x0 + inner.x1) / 2,
      z: (inner.y0 + inner.y1) / 2,
      w: inner.x1 - inner.x0 + 6,
      d: inner.y1 - inner.y0 + 6,
      y: 0,
    });
    root.add(p.points);
    updaters.push((dt, t) => p.update(dt, t));
  }

  terrain.traverse((o) => {
    if (o.name === 'water') o.renderOrder = 2;
  });

  // feixes de luz (god rays) atravessando a copa das árvores
  const nShafts = dyn.shafts ?? map.shafts ?? 0;
  if (nShafts) {
    const tex = shaftTexture();
    const inner = map.inner;
    for (let i = 0; i < nShafts; i++) {
      const x = inner.x0 + 2 + hash2(i, 7, 91) * (inner.x1 - inner.x0 - 4);
      const z = inner.y0 + 2 + hash2(i, 8, 92) * (inner.y1 - inner.y0 - 4);
      const h = groundHeight(map, Math.floor(x), Math.floor(z)) ?? 0;
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(map.shaftColor || '#fff2c0'), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const w = 1 + hash2(i, 9, 93) * 1.4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 10), mat);
      m.position.set(x, h + 5, z);
      m.rotation.z = 0.38;
      m.renderOrder = 4;
      root.add(m);
      const ph = hash2(i, 10, 94) * 6;
      updaters.push((dt, t) => (mat.opacity = 0.09 + Math.sin(t * 0.4 + ph) * 0.06));
    }
  }

  return {
    map,
    group: root,
    updaters,
    lights,
    colliders,
    blocked,
    propMeshes,
    groundHeight: (x, z) => groundHeight(map, Math.floor(x), Math.floor(z)),
  };
}

// altura interpolada (suaviza degraus)
export function smoothHeight(map, x, z) {
  const h = groundHeight(map, Math.floor(x), Math.floor(z));
  return h ?? 0;
}

export { cellMat, cellH };

let _shaft = null;
function shaftTexture() {
  if (_shaft) return _shaft;
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.7, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 32, 128);
  // bordas suaves
  const img = g.getImageData(0, 0, 32, 128);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 32; x++) {
    const k = Math.sin((x / 31) * Math.PI);
    img.data[(y * 32 + x) * 4 + 3] *= k;
  }
  g.putImageData(img, 0, 0);
  _shaft = new THREE.CanvasTexture(c);
  return _shaft;
}
