// Constrói a geometria do diorama a partir do grid do mapa: topo dos tiles,
// laterais (penhascos/muros/escadas) e a superfície animada da água.
import * as THREE from 'three';
import { PPU, cellH, cellMat, sideKind, SIDE_ROWS } from '../art/terrain.js';
import { hash2 } from '../art/bitmap.js';
import { occlude } from './occlusion.js';

const WATER_DROP = 0.3; // fundo da água abaixo do nível do tile
const WATER_SURFACE = 0.1; // superfície abaixo do nível do tile

export function groundHeight(map, x, y) {
  const h = cellH(map, x, y);
  if (h === null) return null;
  return cellMat(map, x, y) === 'water' ? h - WATER_DROP : h;
}

export function buildTerrain(map, groundTex, sideTex, sideAtlasSize) {
  const group = new THREE.Group();
  const W = map.w, H = map.h;

  // ---------------------------------------------------------------- topo
  const pos = [], uv = [], nor = [], idx = [];
  let vi = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (cellMat(map, x, y) === 'void') continue;
      const h = groundHeight(map, x, y);
      // quad no plano XZ (z cresce para o sul)
      pos.push(x, h, y, x + 1, h, y, x + 1, h, y + 1, x, h, y + 1);
      const u0 = x / W, u1 = (x + 1) / W;
      const v0 = 1 - y / H, v1 = 1 - (y + 1) / H;
      uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
      nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
      idx.push(vi, vi + 2, vi + 1, vi, vi + 3, vi + 2);
      vi += 4;
    }
  }
  const topGeo = new THREE.BufferGeometry();
  topGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  topGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  topGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  topGeo.setIndex(idx);
  const topMat = occlude(new THREE.MeshLambertMaterial({ map: groundTex }));
  const top = new THREE.Mesh(topGeo, topMat);
  top.receiveShadow = true;
  top.name = 'terrain-top';
  group.add(top);

  // ---------------------------------------------------------------- laterais
  const sp = [], su = [], sn = [], si = [];
  let sv = 0;
  const [AW, AH] = sideAtlasSize;
  const tileUV = (kind, variant, vTop, vBot) => {
    const row = Math.max(0, SIDE_ROWS.indexOf(kind));
    const u0 = (variant * PPU) / AW, u1 = ((variant + 1) * PPU) / AW;
    // vTop/vBot em [0,1] dentro do tile (0 = topo)
    const y0 = row * PPU + vTop * PPU, y1 = row * PPU + vBot * PPU;
    return [u0, u1, 1 - y0 / AH, 1 - y1 / AH];
  };
  const pushSide = (ax, az, bx, bz, yTop, yBot, nx, nz, kind, variant, vTop, vBot) => {
    sp.push(ax, yTop, az, bx, yTop, bz, bx, yBot, bz, ax, yBot, az);
    const [u0, u1, v0, v1] = tileUV(kind, variant, vTop, vBot);
    su.push(u0, v0, u1, v0, u1, v1, u0, v1);
    for (let k = 0; k < 4; k++) sn.push(nx, 0, nz);
    si.push(sv, sv + 2, sv + 1, sv, sv + 3, sv + 2);
    sv += 4;
  };

  const EDGE_FLOOR = map.edgeFloor ?? -4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const m = cellMat(map, x, y);
      if (m === 'void') continue;
      const h = groundHeight(map, x, y);
      const isStairs = map.tiles[y][x] === 'S';
      // sul (+z), leste (+x), oeste (-x), norte (-z)
      const dirs = [
        [0, 1, x, y + 1, x + 1, y + 1, 0, 1],
        [1, 0, x + 1, y + 1, x + 1, y, 1, 0],
        [-1, 0, x, y, x, y + 1, -1, 0],
        [0, -1, x + 1, y, x, y, 0, -1],
      ];
      for (const [dx, dy, ax, az, bx, bz, nx, nz] of dirs) {
        let hn = groundHeight(map, x + dx, y + dy);
        if (hn === null) hn = EDGE_FLOOR;
        if (cellMat(map, x + dx, y + dy) === 'void') hn = EDGE_FLOOR;
        if (hn >= h - 0.001) continue;
        // segmentos de até 1 unidade
        let yTop = h;
        let seg = 0;
        while (yTop > hn + 0.001) {
          const yBot = Math.max(hn, yTop - 1);
          const span = yTop - yBot;
          let kind = m === 'water' ? 'sand' : sideKind(m, seg === 0, isStairs && seg === 0);
          if (m === 'walltop') kind = seg === 0 ? 'int_top' : yBot <= hn + 0.001 ? 'int_bot' : 'int_mid';
          const variant = Math.floor(hash2(x * 3 + dx, y * 5 + dy + seg, 77) * 4);
          // topo do segmento alinhado ao topo do tile da textura
          pushSide(ax, az, bx, bz, yTop, yBot, nx, nz, kind, variant, 0, span);
          yTop = yBot;
          seg++;
          if (seg > 12) break;
        }
      }
    }
  }
  const sideGeo = new THREE.BufferGeometry();
  sideGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sideGeo.setAttribute('uv', new THREE.Float32BufferAttribute(su, 2));
  sideGeo.setAttribute('normal', new THREE.Float32BufferAttribute(sn, 3));
  sideGeo.setIndex(si);
  const sideMat = occlude(new THREE.MeshLambertMaterial({ map: sideTex }));
  const sides = new THREE.Mesh(sideGeo, sideMat);
  sides.receiveShadow = true;
  sides.castShadow = true;
  sides.name = 'terrain-sides';
  group.add(sides);

  // ---------------------------------------------------------------- água
  const water = buildWater(map);
  if (water) group.add(water);

  return group;
}

// ------------------------------------------------------------------ água
const waterVert = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const waterFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uTint;
  uniform vec3 uLight;
  uniform float uAlpha;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    // coordenadas quantizadas: 16 pixels por unidade (água em pixel art)
    vec2 px = floor(vWorld.xz * 16.0);
    float t = uTime;
    float w1 = sin(px.x * 0.35 + t * 1.6 + sin(px.y * 0.21 + t * 0.7) * 2.2);
    float w2 = sin(px.y * 0.5 - t * 1.1 + px.x * 0.08);
    float crest = step(0.93, w1 * 0.6 + w2 * 0.4);
    float band = step(0.55, w1) * 0.12;
    float sp = step(0.996, h21(px + floor(t * 3.0)));
    vec3 col = uTint * (0.9 + band);
    col = mix(col, uLight, crest * 0.75 + sp);
    float a = uAlpha + crest * 0.3 + sp;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    #include <fog_fragment>
  }
`;

function buildWater(map) {
  const pos = [], idx = [];
  let vi = 0;
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      if (cellMat(map, x, y) !== 'water') continue;
      const h = cellH(map, x, y) - WATER_SURFACE;
      pos.push(x, h, y, x + 1, h, y, x + 1, h, y + 1, x, h, y + 1);
      idx.push(vi, vi + 2, vi + 1, vi, vi + 3, vi + 2);
      vi += 4;
    }
  }
  if (!vi) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uTint: { value: new THREE.Color('#2a8fb0') },
        uLight: { value: new THREE.Color('#e8fbff') },
        uAlpha: { value: 0.42 },
      },
    ]),
    vertexShader: waterVert,
    fragmentShader: waterFrag,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'water';
  mesh.renderOrder = 2;
  mesh.userData.update = (t) => (mat.uniforms.uTime.value = t);
  return mesh;
}
