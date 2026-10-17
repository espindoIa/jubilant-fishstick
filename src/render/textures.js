// Converte Bitmaps em texturas three.js com filtragem "nearest" (pixel art nítida).
import * as THREE from 'three';

export function bitmapToCanvas(bmp) {
  const c = document.createElement('canvas');
  c.width = bmp.w;
  c.height = bmp.h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(bmp.w, bmp.h);
  img.data.set(bmp.data);
  ctx.putImageData(img, 0, 0);
  return c;
}

export function bitmapToTexture(bmp, opts = {}) {
  const canvas = bitmapToCanvas(bmp);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = opts.mipmaps ? THREE.NearestMipmapLinearFilter : THREE.NearestFilter;
  tex.generateMipmaps = !!opts.mipmaps;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = opts.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = opts.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.anisotropy = 1;
  tex.needsUpdate = true;
  return tex;
}

export function bitmapToDataURL(bmp, scale = 1) {
  const src = bitmapToCanvas(bmp);
  if (scale === 1) return src.toDataURL();
  const c = document.createElement('canvas');
  c.width = bmp.w * scale;
  c.height = bmp.h * scale;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL();
}
