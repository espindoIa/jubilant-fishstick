// Oclusão "vazada": objetos à frente do jogador (mais perto da câmera) são
// dissolvidos com dithering num círculo ao redor dele, para nunca escondê-lo.
import * as THREE from 'three';

export const OCC = {
  uPlayerScreen: { value: new THREE.Vector2(-9999, -9999) },
  uPlayerZ: { value: 0 },
  uPlayerY: { value: 0 },
  uOccRadius: { value: 0.0 },
  uOccEnable: { value: 0 },
};

export function occlude(material) {
  if (material.userData.occ) return material;
  material.userData.occ = true;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer);
    Object.assign(shader.uniforms, OCC);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOccW;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 occW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          occW = instanceMatrix * occW;
        #endif
        vOccW = (modelMatrix * occW).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vOccW;
        uniform vec2 uPlayerScreen;
        uniform float uPlayerZ;
        uniform float uPlayerY;
        uniform float uOccRadius;
        uniform float uOccEnable;
        float occBayer(vec2 p) {
          vec2 q = mod(floor(p), 4.0);
          float b = 0.0;
          int x = int(q.x), y = int(q.y);
          if (y == 0) b = x == 0 ? 0.0 : x == 1 ? 8.0 : x == 2 ? 2.0 : 10.0;
          else if (y == 1) b = x == 0 ? 12.0 : x == 1 ? 4.0 : x == 2 ? 14.0 : 6.0;
          else if (y == 2) b = x == 0 ? 3.0 : x == 1 ? 11.0 : x == 2 ? 1.0 : 9.0;
          else b = x == 0 ? 15.0 : x == 1 ? 7.0 : x == 2 ? 13.0 : 5.0;
          return (b + 0.5) / 16.0;
        }`
      )
      .replace(
        'void main() {',
        `void main() {
        if (uOccEnable > 0.5 && vOccW.z > uPlayerZ + 0.45 && vOccW.y > uPlayerY + 0.35) {
          vec2 d = (gl_FragCoord.xy - uPlayerScreen) / uOccRadius;
          d.y *= 0.8;
          float r = length(d);
          if (r < 1.0) {
            float keep = smoothstep(0.55, 1.0, r);
            if (occBayer(gl_FragCoord.xy * 0.5) > keep * 0.95 + 0.05) discard;
          }
        }`
      );
  };
  material.customProgramCacheKey = () => 'occ1';
  material.needsUpdate = true;
  return material;
}

// atualiza a posição do jogador na tela (em pixels do drawing buffer)
const v = new THREE.Vector3();
export function updateOcclusion(stage, worldPos, enabled = true) {
  if (!enabled) {
    OCC.uOccEnable.value = 0;
    return;
  }
  const r = stage.renderer;
  const size = r.getDrawingBufferSize(new THREE.Vector2());
  v.set(worldPos.x, worldPos.y + 1.0, worldPos.z).project(stage.camera);
  OCC.uPlayerScreen.value.set(((v.x + 1) / 2) * size.x, ((v.y + 1) / 2) * size.y);
  OCC.uPlayerZ.value = worldPos.z;
  OCC.uPlayerY.value = worldPos.y;
  OCC.uOccRadius.value = size.y * 0.25;
  OCC.uOccEnable.value = 1;
}
