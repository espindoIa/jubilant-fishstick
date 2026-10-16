// Stage: renderer WebGL, câmera de diorama, iluminação e pós-processamento HD-2D
// (profundidade de campo, bloom, vinheta e correção de cor).
import * as THREE from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  DepthOfFieldEffect,
  VignetteEffect,
  HueSaturationEffect,
  BrightnessContrastEffect,
  TiltShiftEffect,
  KernelSize,
} from 'postprocessing';

export const QUALITY = {
  high: { pixelRatio: 2, shadows: 2048, dof: true, bloom: true, lights: 8 },
  medium: { pixelRatio: 1.5, shadows: 1024, dof: 'tilt', bloom: true, lights: 6 },
  low: { pixelRatio: 1, shadows: 0, dof: false, bloom: false, lights: 4 },
};

export function detectQuality() {
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints || 0) > 1;
  return mobile ? 'medium' : 'high';
}

export class Stage {
  constructor(canvas, qualityName = detectQuality()) {
    this.canvas = canvas;
    this.qualityName = qualityName;
    this.q = QUALITY[qualityName];
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.maxPR = Math.min(window.devicePixelRatio || 1, this.q.pixelRatio);
    this.pr = this.maxPR;
    renderer.setPixelRatio(this.pr);
    this.perf = { acc: 0, frames: 0, t: 0 };
    // parâmetro ?q= (testes) fixa a qualidade e desliga a adaptação
    this.noAdapt = new URLSearchParams(location.search).has('q');
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = this.q.shadows > 0;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#10101c');
    this.scene.fog = new THREE.Fog('#10101c', 30, 60);

    // câmera de diorama: inclinação fixa, sem rotação de guinada
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.5, 200);
    this.pitch = THREE.MathUtils.degToRad(38);
    this.distance = 21;
    this.camTarget = new THREE.Vector3();
    this.camGoal = new THREE.Vector3();
    this.shake = 0;

    // luzes
    this.hemi = new THREE.HemisphereLight('#bcd8ff', '#40384a', 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff2d8', 1.6);
    this.sun.castShadow = this.q.shadows > 0;
    if (this.sun.castShadow) {
      this.sun.shadow.mapSize.set(this.q.shadows, this.q.shadows);
      const sc = this.sun.shadow.camera;
      sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18;
      sc.near = 1; sc.far = 80;
      this.sun.shadow.bias = -0.0008;
      this.sun.shadow.normalBias = 0.02;
      this.sun.shadow.radius = 3;
    }
    this.sunDir = new THREE.Vector3(-0.45, 1, 0.55).normalize();
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    // pool fixo de luzes pontuais (evita recompilar shaders)
    this.pointLights = [];
    for (let i = 0; i < this.q.lights; i++) {
      const l = new THREE.PointLight('#ffb060', 0, 6, 1.6);
      l.castShadow = false;
      this.scene.add(l);
      this.pointLights.push(l);
    }

    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.setupPost();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setupPost() {
    const r = this.renderer;
    this.composer = new EffectComposer(r, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.dofTarget = new THREE.Vector3();
    if (this.q.dof === true) {
      this.dof = new DepthOfFieldEffect(this.camera, {
        focusDistance: 20,
        focusRange: 7,
        bokehScale: 2.2,
        resolutionScale: 0.5,
      });
      this.dof.target = this.dofTarget;
      this.composer.addPass(new EffectPass(this.camera, this.dof));
    } else if (this.q.dof === 'tilt') {
      this.tilt = new TiltShiftEffect({ focusArea: 0.42, feather: 0.32, offset: 0.04, kernelSize: KernelSize.SMALL, resolutionScale: 0.5 });
      this.composer.addPass(new EffectPass(this.camera, this.tilt));
    }
    const effects = [];
    if (this.q.bloom) {
      this.bloom = new BloomEffect({ luminanceThreshold: 0.72, luminanceSmoothing: 0.25, intensity: 1.1, mipmapBlur: true, radius: 0.72 });
      effects.push(this.bloom);
    }
    this.vignette = new VignetteEffect({ offset: 0.28, darkness: 0.55 });
    this.hueSat = new HueSaturationEffect({ saturation: 0.12, hue: 0 });
    this.brightCon = new BrightnessContrastEffect({ brightness: 0, contrast: 0.06 });
    effects.push(this.hueSat, this.brightCon, this.vignette);
    this.finalPass = new EffectPass(this.camera, ...effects);
    this.composer.addPass(this.finalPass);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // em retrato, afasta a câmera para manter largura jogável
    const minVisibleW = 12;
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const visW = 2 * this.distance * Math.tan(fovRad / 2) * this.camera.aspect;
    this.distanceScale = visW < minVisibleW ? minVisibleW / visW : 1;
    this.camera.updateProjectionMatrix();
  }

  // Aplica preset de iluminação/atmosfera do mapa
  setAtmosphere(a) {
    const bg = new THREE.Color(a.bg || '#10101c');
    this.scene.background = bg;
    this.scene.fog.color.copy(new THREE.Color(a.fog || a.bg || '#10101c'));
    this.scene.fog.near = a.fogNear ?? 30;
    this.scene.fog.far = a.fogFar ?? 60;
    this.hemi.color.set(a.sky || '#bcd8ff');
    this.hemi.groundColor.set(a.ground || '#40384a');
    this.hemi.intensity = a.ambient ?? 0.9;
    this.sun.color.set(a.sun || '#fff2d8');
    this.sun.intensity = a.sunIntensity ?? 1.6;
    if (a.sunDir) this.sunDir.set(...a.sunDir).normalize();
    if (this.bloom) {
      this.bloom.intensity = a.bloom ?? 1.1;
      this.bloom.luminanceMaterial.threshold = a.bloomThreshold ?? 0.72;
    }
    this.vignette.darkness = a.vignette ?? 0.55;
    this.hueSat.saturation = a.saturation ?? 0.12;
    this.brightCon.brightness = a.brightness ?? 0;
    this.brightCon.contrast = a.contrast ?? 0.06;
    if (this.waterMeshes) for (const w of this.waterMeshes) this.applyWaterTint(w, a);
    this.atmosphere = a;
  }

  applyWaterTint(mesh, a) {
    const u = mesh.material.uniforms;
    if (!u) return;
    u.uTint.value.set(a.water || '#2a8fb0');
    u.uLight.value.set(a.waterLight || '#e8fbff');
    u.uAlpha.value = a.waterAlpha ?? 0.42;
  }

  setWorld(group) {
    this.scene.remove(this.world);
    disposeTree(this.world);
    this.world = group;
    this.scene.add(group);
    this.waterMeshes = [];
    group.traverse((o) => {
      if (o.name === 'water') this.waterMeshes.push(o);
    });
    if (this.atmosphere) for (const w of this.waterMeshes) this.applyWaterTint(w, this.atmosphere);
  }

  // luzes pontuais: lista {x,y,z,color,intensity,distance,flicker}
  setPointLights(list) {
    this.lightDefs = list || [];
  }

  updateLights(time, focus) {
    // escolhe as luzes mais próximas do foco
    const defs = (this.lightDefs || [])
      .map((d) => ({ d, dist: (d.x - focus.x) ** 2 + (d.z - focus.z) ** 2 }))
      .sort((a, b) => a.dist - b.dist);
    this.pointLights.forEach((l, i) => {
      const e = defs[i];
      if (!e || e.dist > 26 * 26) {
        l.intensity = 0;
        return;
      }
      const d = e.d;
      l.position.set(d.x, d.y, d.z);
      l.color.set(d.color || '#ffb060');
      l.distance = d.distance || 6;
      let k = d.intensity ?? 2.2;
      if (d.flicker) k *= 0.86 + Math.sin(time * 13 + d.x * 7) * 0.06 + Math.sin(time * 23.7 + d.z) * 0.08;
      if (d.pulse) k *= 0.75 + Math.sin(time * d.pulse) * 0.25;
      l.intensity = k;
    });
  }

  setCameraTarget(v, instant = false) {
    this.camGoal.copy(v);
    if (instant) this.camTarget.copy(v);
  }

  update(dt, time) {
    // câmera suave
    const k = 1 - Math.pow(0.0015, dt);
    this.camTarget.lerp(this.camGoal, k);
    const dist = this.distance * (this.distanceScale || 1) * (this.zoom || 1);
    const pitch = this.pitchOverride ?? this.pitch;
    const t = this.camTarget;
    let sx = 0, sy = 0;
    if (this.shake > 0) {
      sx = (Math.random() - 0.5) * this.shake;
      sy = (Math.random() - 0.5) * this.shake;
      this.shake = Math.max(0, this.shake - dt * 2.5);
    }
    this.camera.position.set(t.x + sx, t.y + Math.sin(pitch) * dist + sy, t.z + Math.cos(pitch) * dist);
    this.camera.lookAt(t.x + sx, t.y + sy, t.z);

    // sombra direcional segue o foco
    this.sun.position.copy(t).addScaledVector(this.sunDir, 30);
    this.sun.target.position.copy(t);

    if (this.dof) {
      this.dofTarget.copy(t);
      this.dofTarget.y += 0.8;
    }
    if (this.tilt) {
      // mantém a faixa de foco no centro (onde está o jogador)
      this.tilt.offset = 0.03;
    }
    this.updateLights(time, t);
    for (const w of this.waterMeshes || []) w.userData.update?.(time);
  }

  render(dt) {
    this.composer.render(dt);
    this.adaptResolution(dt);
  }

  // resolução dinâmica: mantém a fluidez em celulares mais fracos
  adaptResolution(dt) {
    const p = this.perf;
    p.acc += dt;
    p.frames++;
    p.t += dt;
    if (p.t < 2.5 || this.noAdapt) return;
    const avg = p.acc / p.frames;
    p.acc = p.frames = p.t = 0;
    if (document.hidden) return;
    let next = this.pr;
    if (avg > 1 / 42 && this.pr > 0.7) next = Math.max(0.7, this.pr - 0.15);
    else if (avg < 1 / 57 && this.pr < this.maxPR) next = Math.min(this.maxPR, this.pr + 0.1);
    if (Math.abs(next - this.pr) > 0.01) {
      this.pr = next;
      this.renderer.setPixelRatio(next);
      this.resize();
    }
  }
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (m.map && m.map.userData?.owned) m.map.dispose();
        m.dispose();
      }
    }
  });
}
