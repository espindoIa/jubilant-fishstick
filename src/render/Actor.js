// Actor: sprite 2D em billboard dentro do mundo 3D, com sombra projetada,
// sombra de contato (blob) e animação por frames da folha.
import * as THREE from 'three';
import { packSheet } from '../art/bitmap.js';
import { bitmapToTexture } from './textures.js';

export const PPU = 16;
export const SPRITE_SCALE_Y = 1.18; // compensa o encurtamento pela inclinação da câmera

let blobTex = null;
function getBlobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 31);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.6, 'rgba(0,0,0,0.32)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}

// Folha de sprites pronta para uso no three.js
export function makeSheet(frames, cols = 6) {
  const packed = packSheet(frames, cols);
  const texture = bitmapToTexture(packed.bitmap);
  return { texture, rects: packed.rects, fw: packed.fw, fh: packed.fh, W: packed.bitmap.w, H: packed.bitmap.h, bitmap: packed.bitmap };
}

const geoCache = new Map();
function spriteGeometry(fw, fh, scaleY, tilt) {
  const key = `${fw}x${fh}x${scaleY}x${tilt}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const w = fw / PPU, h = (fh / PPU) * scaleY;
  const g = new THREE.PlaneGeometry(w, h);
  g.translate(0, h / 2, 0);
  // normais apontando para cima/câmera: recebem a luz do céu como o cenário
  const n = g.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0.55, 0.83);
  geoCache.set(key, g);
  return g;
}

export class Actor {
  constructor(sheet, opts = {}) {
    this.sheet = sheet;
    this.group = new THREE.Group();
    const tex = sheet.texture.clone();
    tex.needsUpdate = true;
    tex.repeat.set(sheet.fw / sheet.W, sheet.fh / sheet.H);
    this.tex = tex;
    const geo = spriteGeometry(sheet.fw, sheet.fh, opts.scaleY ?? SPRITE_SCALE_Y, 0);
    this.material = new THREE.MeshLambertMaterial({
      map: tex,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      emissive: new THREE.Color('#000000'),
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.castShadow = opts.castShadow ?? true;
    this.mesh.receiveShadow = opts.receiveShadow ?? true;
    // inclina levemente o sprite em direção à câmera
    this.mesh.rotation.x = opts.tilt ?? -0.12;
    this.group.add(this.mesh);

    if (opts.blob !== false) {
      const bw = opts.blobSize || (sheet.fw / PPU) * 0.62;
      const blob = new THREE.Mesh(
        new THREE.PlaneGeometry(bw, bw * 0.55),
        new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, depthWrite: false, opacity: 0.9 })
      );
      blob.rotation.x = -Math.PI / 2;
      blob.position.y = 0.03;
      blob.renderOrder = 1;
      this.blob = blob;
      this.group.add(blob);
    }
    this.frame = null;
    this.facing = 'down';
    this.moving = false;
    this.animTime = 0;
    this.floats = !!opts.floats;
    this.floatPhase = Math.random() * 6;
    this.flash = 0;
    this.setFrame(Object.keys(sheet.rects)[0]);
  }

  setFrame(name) {
    if (this.frame === name) return;
    const r = this.sheet.rects[name];
    if (!r) return;
    this.frame = name;
    this.tex.offset.set(r.x / this.sheet.W, 1 - (r.y + this.sheet.fh) / this.sheet.H);
    if (this.glowTex) this.glowTex.offset.copy(this.tex.offset);
  }

  // máscara emissiva (olhos, cristais, fornalhas) com o mesmo layout da folha
  setGlow(sheet, intensity = 1.5) {
    if (!sheet) return;
    const t = sheet.texture.clone();
    t.needsUpdate = true;
    t.repeat.copy(this.tex.repeat);
    t.offset.copy(this.tex.offset);
    this.glowTex = t;
    this.glowIntensity = intensity;
    this.material.emissiveMap = t;
    this.material.emissive.setRGB(1, 1, 1);
    this.material.emissiveIntensity = intensity;
    this.material.needsUpdate = true;
  }

  // animação padrão de caminhada em 4 direções
  update(dt) {
    this.animTime += dt;
    const k = { down: 'd', up: 'u', left: 'l', right: 'r' }[this.facing] || 'd';
    if (!this.lockFrame) {
      if (this.moving) {
        const seq = [1, 0, 2, 0];
        const i = Math.floor(this.animTime * (this.walkFps || 8)) % 4;
        this.setFrame(k + seq[i]);
      } else {
        this.setFrame(k + '0');
      }
    }
    if (this.floats) {
      this.floatPhase += dt * 2.4;
      this.mesh.position.y = 0.25 + Math.sin(this.floatPhase) * 0.08;
      if (this.blob) this.blob.scale.setScalar(0.85 - Math.sin(this.floatPhase) * 0.08);
    }
    if (this.flash > 0) {
      this.flash = Math.max(0, this.flash - dt * 3);
      if (this.material.emissiveMap) {
        this.material.emissiveMap = null;
        this.material.needsUpdate = true;
      }
      this.material.emissiveIntensity = 1;
      this.material.emissive.setRGB(this.flash, this.flash, this.flash);
      if (this.flash === 0 && this.glowTex) {
        this.material.emissiveMap = this.glowTex;
        this.material.emissive.setRGB(1, 1, 1);
        this.material.emissiveIntensity = this.glowIntensity;
        this.material.needsUpdate = true;
      }
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  get position() {
    return this.group.position;
  }

  dispose() {
    this.tex.dispose();
    this.material.dispose();
  }
}
