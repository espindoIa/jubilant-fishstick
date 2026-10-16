// Efeitos visuais de batalha: cortes, raios, explosões, curas, estrelas...
// Tudo aditivo para alimentar o bloom.
import * as THREE from 'three';
import { Burst } from '../render/Particles.js';

function additive(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(2.2),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
}

export class Effects {
  constructor(scene, stage) {
    this.scene = scene;
    this.stage = stage;
    this.items = [];
    this.lights = [];
  }

  update(dt) {
    this.items = this.items.filter((it) => it.update(dt) !== false);
  }

  add(obj, life, onUpdate) {
    let t = 0;
    this.scene.add(obj);
    this.items.push({
      update: (dt) => {
        t += dt;
        const k = Math.min(1, t / life);
        onUpdate?.(k, dt);
        if (k >= 1) {
          this.scene.remove(obj);
          obj.traverse?.((o) => {
            o.geometry?.dispose();
            o.material?.dispose();
          });
          return false;
        }
        return true;
      },
    });
  }

  burst(opts) {
    const b = new Burst(this.scene, opts);
    this.items.push(b);
    return b;
  }

  light(pos, color, intensity = 6, life = 0.4, distance = 8) {
    const l = new THREE.PointLight(color, intensity, distance, 1.5);
    l.position.copy(pos);
    this.add(l, life, (k) => (l.intensity = intensity * (1 - k)));
  }

  // arco de corte voltado para a câmera
  slash(pos, { color = '#ffffff', angle = -0.6, size = 1.2, flip = false } = {}) {
    const geo = new THREE.RingGeometry(size * 0.75, size, 24, 1, 0.3, 2.4);
    const m = new THREE.Mesh(geo, additive(color, 1));
    m.position.copy(pos);
    m.rotation.z = angle + (flip ? Math.PI : 0);
    m.scale.setScalar(0.4);
    this.add(m, 0.28, (k) => {
      m.scale.setScalar(0.4 + k * 0.9);
      m.material.opacity = 1 - k;
      m.rotation.z += 0.12;
    });
  }

  line(from, to, color = '#ffffff', width = 0.08, life = 0.2) {
    const d = new THREE.Vector3().subVectors(to, from);
    const len = d.length();
    const geo = new THREE.PlaneGeometry(len, width);
    const m = new THREE.Mesh(geo, additive(color));
    m.position.copy(from).addScaledVector(d, 0.5);
    m.rotation.z = Math.atan2(d.y, d.x);
    this.add(m, life, (k) => (m.material.opacity = 1 - k));
  }

  bolt(pos, color = '#fff8a0') {
    const top = pos.clone().add(new THREE.Vector3(0.4, 7, 0));
    let prev = top;
    const segs = 9;
    for (let i = 1; i <= segs; i++) {
      const t = i / segs;
      const p = top.clone().lerp(pos, t);
      if (i < segs) {
        p.x += (Math.random() - 0.5) * 0.9;
        p.z += (Math.random() - 0.5) * 0.2;
      }
      this.line(prev, p, color, 0.14, 0.32);
      this.line(prev, p, '#ffffff', 0.05, 0.32);
      prev = p;
    }
    this.light(pos.clone().add(new THREE.Vector3(0, 1, 0.5)), '#fff6c0', 14, 0.35, 12);
  }

  pillar(pos, color = '#fff0a0', life = 0.9) {
    const geo = new THREE.CylinderGeometry(0.55, 0.75, 7, 16, 1, true);
    geo.translate(0, 3.5, 0);
    const m = new THREE.Mesh(geo, additive(color, 0.7));
    m.position.copy(pos);
    this.add(m, life, (k) => {
      m.scale.set(1 - k * 0.6, 1, 1 - k * 0.6);
      m.material.opacity = 0.7 * (1 - k);
    });
  }

  ring(pos, color = '#80ffb0', life = 0.7, size = 1.4) {
    const geo = new THREE.RingGeometry(0.2, 0.32, 32);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, additive(color, 0.9));
    m.position.copy(pos).add(new THREE.Vector3(0, 0.06, 0));
    this.add(m, life, (k) => {
      m.scale.setScalar(1 + k * size * 3);
      m.material.opacity = 0.9 * (1 - k);
    });
  }

  // --------------------------------------------------------- efeitos nomeados
  play(name, target, from) {
    const p = target.clone();
    const mid = p.clone().add(new THREE.Vector3(0, 0.9, 0.3));
    switch (name) {
      case 'slash':
      case 'bite':
        this.slash(mid, { color: name === 'bite' ? '#ff8080' : '#ffffff' });
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 14, speed: 3, life: 0.35, size: 0.12, square: true });
        break;
      case 'slash2':
        this.slash(mid, { angle: -0.6 });
        setTimeout(() => this.slash(mid, { angle: 0.8, flip: true }), 120);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 16, speed: 3, life: 0.35, size: 0.12, square: true });
        break;
      case 'xslash':
        this.slash(mid, { angle: -0.8, color: '#ffd0a0', size: 1.5 });
        this.slash(mid, { angle: 0.8, color: '#a0d0ff', size: 1.5, flip: true });
        this.light(mid, '#ffe0c0', 8, 0.3);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 30, speed: 4, life: 0.5, size: 0.14, square: true });
        break;
      case 'pierce':
        this.line(mid.clone().add(new THREE.Vector3(1.8, 0.2, 0)), mid.clone().add(new THREE.Vector3(-0.6, -0.1, 0)), '#e0f0ff', 0.12, 0.22);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#d0e8ff', count: 14, speed: 3.5, life: 0.35, size: 0.12, square: true });
        break;
      case 'blunt':
        this.ring(p, '#ffffff', 0.4, 0.6);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#fff0c0', count: 18, speed: 3, life: 0.4, size: 0.14, square: true });
        this.stage.shake = 0.15;
        break;
      case 'fireslash':
      case 'fire':
        if (name === 'fireslash') this.slash(mid, { color: '#ff9a40' });
        this.burst({ x: mid.x, y: mid.y - 0.4, z: mid.z, color: '#ff7a20', count: 46, speed: 2.4, life: 0.9, size: 0.3, gravity: 3, up: 1.4 });
        this.burst({ x: mid.x, y: mid.y - 0.2, z: mid.z, color: '#ffe080', count: 20, speed: 1.6, life: 0.6, size: 0.2, gravity: 2 });
        this.light(mid, '#ff8030', 9, 0.6);
        break;
      case 'ice':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#a0e8ff', count: 34, speed: 3.2, life: 0.8, size: 0.16, gravity: -3, square: true });
        this.burst({ x: mid.x, y: mid.y + 0.4, z: mid.z, color: '#ffffff', count: 16, speed: 1.4, life: 0.9, size: 0.12, gravity: -1, square: true });
        this.ring(p, '#a0e0ff', 0.6, 0.8);
        this.light(mid, '#80d0ff', 7, 0.5);
        break;
      case 'thunder':
        this.bolt(p);
        this.burst({ x: mid.x, y: mid.y - 0.3, z: mid.z, color: '#fff7a0', count: 26, speed: 4, life: 0.4, size: 0.12, square: true });
        this.stage.shake = 0.25;
        break;
      case 'light':
        this.pillar(p, '#fff4b0');
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#fff8d0', count: 30, speed: 1.8, life: 1.0, size: 0.16, gravity: 1.5 });
        this.light(mid, '#fff0c0', 8, 0.8);
        break;
      case 'wind':
        for (let i = 0; i < 3; i++) setTimeout(() => this.slash(mid.clone().add(new THREE.Vector3(0, i * 0.25 - 0.25, 0)), { color: '#a0ffc0', angle: i, size: 1 + i * 0.2 }), i * 70);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#b0ffd0', count: 28, speed: 3.5, life: 0.6, size: 0.12, gravity: 0, square: true });
        break;
      case 'quake':
        this.burst({ x: p.x, y: p.y + 0.1, z: p.z, color: '#c89a60', count: 40, speed: 3, life: 0.8, size: 0.2, gravity: -9, up: 3, square: true, additive: false });
        this.ring(p, '#ffd090', 0.6, 1.2);
        this.stage.shake = 0.5;
        break;
      case 'stars':
      case 'starfall': {
        const n = name === 'stars' ? 5 : 3;
        for (let i = 0; i < n; i++) {
          setTimeout(() => {
            const s = mid.clone().add(new THREE.Vector3(-1.5 + Math.random() * 0.5, 5, 0));
            const e = mid.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, 0));
            this.line(s, e, '#a8f0ff', 0.12, 0.25);
            this.burst({ x: e.x, y: e.y, z: e.z, color: i % 2 ? '#fff4b0' : '#a8f0ff', count: 22, speed: 3, life: 0.6, size: 0.18 });
            this.light(e, '#c0f0ff', 7, 0.3);
          }, i * 110);
        }
        break;
      }
      case 'gravity':
        this.ring(p, '#b080ff', 0.8, 0.5);
        this.burst({ x: mid.x, y: mid.y + 1.2, z: mid.z, color: '#9060ff', count: 30, speed: 2, life: 0.7, size: 0.2, gravity: -10 });
        this.stage.shake = 0.3;
        break;
      case 'supernova':
      case 'explosion':
      case 'meteor':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ff8030', count: 70, speed: 5, life: 1.0, size: 0.32, gravity: 1 });
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#fff0a0', count: 40, speed: 3, life: 0.8, size: 0.24, gravity: 1 });
        this.ring(p, '#ffb060', 0.8, 1.5);
        this.light(mid, '#ff9040', 16, 0.9, 14);
        this.stage.shake = 0.6;
        break;
      case 'heal':
      case 'revive':
        this.burst({ x: p.x, y: p.y + 0.2, z: p.z, color: '#90ffb0', count: 30, speed: 1.2, life: 1.1, size: 0.16, gravity: 2.5, up: 0.6 });
        this.ring(p, '#a0ffc0', 0.8, 0.6);
        this.light(mid, '#a0ffb0', 5, 0.7);
        break;
      case 'buff':
      case 'taunt':
      case 'roar':
        this.burst({ x: p.x, y: p.y + 0.2, z: p.z, color: name === 'taunt' ? '#ffb060' : name === 'roar' ? '#ff6060' : '#ffe080', count: 26, speed: 1.4, life: 0.9, size: 0.14, gravity: 3, up: 0.5, square: true });
        this.ring(p, '#ffe0a0', 0.6, 0.6);
        break;
      case 'aurora':
        this.pillar(p, '#a0ffd0', 1.2);
        this.pillar(p.clone().add(new THREE.Vector3(0.3, 0, 0)), '#ffd0f0', 1.2);
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#c0fff0', count: 40, speed: 2.4, life: 1.2, size: 0.18, gravity: 1 });
        break;
      case 'spores':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#d0a0ff', count: 30, speed: 1.2, life: 1.2, size: 0.22, gravity: -0.5, additive: false });
        break;
      case 'web':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#e0e0ff', count: 24, speed: 2, life: 0.8, size: 0.1, gravity: -2, square: true });
        break;
      case 'steam':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#f0f0f0', count: 40, speed: 2.5, life: 1.1, size: 0.4, gravity: 1.5, additive: false });
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ff9040', count: 20, speed: 2.5, life: 0.6, size: 0.2, gravity: 1 });
        this.light(mid, '#ff8040', 6, 0.5);
        break;
      case 'beam':
        if (from) {
          this.line(from.clone().add(new THREE.Vector3(0, 1, 0.3)), mid, '#ff5040', 0.14, 0.35);
          this.line(from.clone().add(new THREE.Vector3(0, 1, 0.3)), mid, '#ffffff', 0.05, 0.35);
        }
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ff6040', count: 22, speed: 3, life: 0.5, size: 0.16 });
        this.light(mid, '#ff5030', 7, 0.4);
        break;
      case 'charge':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ff7040', count: 30, speed: 1.5, life: 1.0, size: 0.2, gravity: 2, up: 0.4 });
        this.light(mid, '#ff6030', 8, 1.0);
        break;
      case 'cast':
        this.burst({ x: p.x, y: p.y + 0.1, z: p.z, color: from ? '#ffffff' : '#c0d0ff', count: 20, speed: 1.0, life: 0.7, size: 0.13, gravity: 3, up: 0.3 });
        this.ring(p, '#c0d8ff', 0.5, 0.5);
        break;
      case 'break':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#a0c8ff', count: 50, speed: 5, life: 0.9, size: 0.18, gravity: -8, up: 2, square: true });
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 24, speed: 3, life: 0.6, size: 0.12, square: true });
        this.light(mid, '#c0e0ff', 12, 0.5);
        this.stage.shake = 0.45;
        break;
      case 'death':
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 40, speed: 1.5, life: 1.0, size: 0.16, gravity: 2, square: true });
        break;
      default:
        this.burst({ x: mid.x, y: mid.y, z: mid.z, color: '#ffffff', count: 16, speed: 3, life: 0.4, size: 0.12, square: true });
    }
  }
}
