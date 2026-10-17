// Partículas atmosféricas (vaga-lumes, poeira de luz, brasas, lanternas
// do festival, fumaça, folhas, faíscas de cristal, neve) via THREE.Points.
import * as THREE from 'three';

let dotTex = null;
function dotTexture() {
  if (dotTex) return dotTex;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 32, 32);
  dotTex = new THREE.CanvasTexture(c);
  return dotTex;
}

let squareTex = null;
function squareTexture() {
  // "pixel" quadrado para partículas de pixel art
  if (squareTex) return squareTex;
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(1, 1, 6, 6);
  squareTex = new THREE.CanvasTexture(c);
  squareTex.magFilter = THREE.NearestFilter;
  squareTex.minFilter = THREE.NearestFilter;
  return squareTex;
}

const KINDS = {
  fireflies: { count: 70, color: '#c8ff70', size: 0.22, additive: true, glow: 1.0 },
  motes: { count: 90, color: '#fff2c0', size: 0.12, additive: true, glow: 0.7 },
  embers: { count: 70, color: '#ff8a30', size: 0.14, additive: true, glow: 1.2 },
  lanterns: { count: 26, color: '#ffb050', size: 0.55, additive: true, glow: 1.4 },
  smoke: { count: 18, color: '#c8c0c8', size: 0.6, additive: false, glow: 0 },
  leaves: { count: 40, color: '#ffb040', size: 0.16, additive: false, glow: 0, square: true },
  sparkles: { count: 60, color: '#b8a0ff', size: 0.14, additive: true, glow: 1.2 },
  snow: { count: 160, color: '#ffffff', size: 0.12, additive: false, glow: 0 },
  starfall: { count: 30, color: '#a8f0ff', size: 0.2, additive: true, glow: 1.4 },
  spray: { count: 50, color: '#e8fbff', size: 0.12, additive: true, glow: 0.6 },
};

export class Particles {
  constructor(kind, area = {}) {
    const spec = KINDS[kind] || KINDS.motes;
    this.kind = kind;
    this.spec = spec;
    const n = area.count || spec.count;
    this.n = n;
    this.area = { x: area.x || 0, y: area.y || 0, z: area.z || 0, w: area.w || 20, d: area.d || 20 };
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    this.seed = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      this.seed[i * 4] = Math.random();
      this.seed[i * 4 + 1] = Math.random();
      this.seed[i * 4 + 2] = Math.random();
      this.seed[i * 4 + 3] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const base = new THREE.Color(spec.color);
    for (let i = 0; i < n; i++) {
      const c = base.clone().offsetHSL((this.seed[i * 4 + 2] - 0.5) * 0.06, 0, (this.seed[i * 4 + 3] - 0.5) * 0.15);
      // valores > 1 para alimentar o bloom
      const k = 1 + spec.glow;
      col[i * 3] = c.r * k;
      col[i * 3 + 1] = c.g * k;
      col[i * 3 + 2] = c.b * k;
    }
    const mat = new THREE.PointsMaterial({
      size: spec.size,
      map: spec.square ? squareTexture() : dotTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: spec.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      sizeAttenuation: true,
      opacity: kind === 'smoke' ? 0.35 : 1,
      fog: true,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
    this.update(0, 0);
  }

  update(dt, t) {
    const pos = this.points.geometry.attributes.position.array;
    const col = this.points.geometry.attributes.color;
    const { x, y, z, w, d } = this.area;
    const s = this.seed;
    for (let i = 0; i < this.n; i++) {
      const a = s[i * 4], b = s[i * 4 + 1], c = s[i * 4 + 2], e = s[i * 4 + 3];
      let px, py, pz;
      switch (this.kind) {
        case 'fireflies': {
          px = x + (a - 0.5) * w + Math.sin(t * (0.3 + c * 0.4) + e * 9) * 1.2;
          pz = z + (b - 0.5) * d + Math.cos(t * (0.25 + e * 0.4) + c * 7) * 1.2;
          py = y + 0.4 + c * 2.2 + Math.sin(t * 1.3 + a * 20) * 0.3;
          break;
        }
        case 'motes': {
          px = x + (a - 0.5) * w + Math.sin(t * 0.2 + e * 9) * 0.8;
          pz = z + (b - 0.5) * d;
          py = y + ((c * 5 + t * 0.15 * (0.5 + e)) % 5);
          break;
        }
        case 'embers': {
          const life = (t * (0.25 + e * 0.3) + c) % 1;
          px = x + (a - 0.5) * w + Math.sin(t * 2 + e * 10) * 0.4;
          pz = z + (b - 0.5) * d;
          py = y + life * 6;
          break;
        }
        case 'lanterns': {
          const life = (t * (0.012 + e * 0.01) + c) % 1;
          px = x + (a - 0.5) * w + Math.sin(t * 0.3 + e * 10) * 0.6;
          pz = z + (b - 0.5) * d - life * 4;
          py = y + 1.5 + life * 14;
          break;
        }
        case 'smoke': {
          const life = (t * (0.18 + e * 0.1) + a) % 1;
          px = x + Math.sin(t * 0.7 + i) * 0.2 + life * 0.8;
          pz = z - life * 0.3;
          py = y + life * 3;
          break;
        }
        case 'leaves': {
          const life = (t * (0.05 + e * 0.04) + c) % 1;
          px = x + (a - 0.5) * w + Math.sin(t * 1.5 + e * 10) * 1.2 + life * 3;
          pz = z + (b - 0.5) * d;
          py = y + 6 - life * 6;
          break;
        }
        case 'sparkles': {
          px = x + (a - 0.5) * w;
          pz = z + (b - 0.5) * d;
          py = y + 0.3 + ((c * 3 + t * 0.2) % 3);
          const tw = Math.max(0, Math.sin(t * 3 + e * 30));
          col.array[i * 3 + 0] = 0.7 * tw * 2.2;
          col.array[i * 3 + 1] = 0.63 * tw * 2.2;
          col.array[i * 3 + 2] = 1.0 * tw * 2.2;
          break;
        }
        case 'snow': {
          const life = (t * (0.06 + e * 0.04) + c) % 1;
          px = x + (a - 0.5) * w + Math.sin(t + e * 10) * 0.5;
          pz = z + (b - 0.5) * d;
          py = y + 8 - life * 8;
          break;
        }
        case 'starfall': {
          const life = (t * (0.08 + e * 0.05) + c) % 1;
          px = x + (a - 0.5) * w - life * 6;
          pz = z + (b - 0.5) * d - 6;
          py = y + 16 - life * 12;
          break;
        }
        case 'spray':
        default: {
          px = x + (a - 0.5) * w;
          pz = z + (b - 0.5) * d;
          py = y + Math.abs(Math.sin(t * 2 + e * 10)) * 0.8;
        }
      }
      pos[i * 3] = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = pz;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    if (this.kind === 'sparkles') col.needsUpdate = true;
  }
}

// Explosões curtas de partículas (efeitos de batalha/campo)
export class Burst {
  constructor(scene, { x, y, z, color = '#ffffff', count = 30, speed = 3, life = 0.8, size = 0.18, gravity = -4, spread = 1, up = 1.5, additive = true, square = false }) {
    this.scene = scene;
    this.life = life;
    this.t = 0;
    this.n = count;
    const pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.vel[i * 3] = Math.cos(a) * s * spread;
      this.vel[i * 3 + 1] = up * (0.4 + Math.random()) * s * 0.6;
      this.vel[i * 3 + 2] = Math.sin(a) * s * spread * 0.5;
    }
    this.gravity = gravity;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = new THREE.Color(color).multiplyScalar(additive ? 2.2 : 1);
    this.mat = new THREE.PointsMaterial({
      size,
      color: c,
      map: square ? squareTexture() : dotTexture(),
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    scene.add(this.points);
  }

  update(dt) {
    this.t += dt;
    const p = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.n; i++) {
      this.vel[i * 3 + 1] += this.gravity * dt;
      p[i * 3] += this.vel[i * 3] * dt;
      p[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      p[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.mat.opacity = Math.max(0, 1 - this.t / this.life);
    if (this.t >= this.life) {
      this.scene.remove(this.points);
      this.points.geometry.dispose();
      this.mat.dispose();
      return false;
    }
    return true;
  }
}
