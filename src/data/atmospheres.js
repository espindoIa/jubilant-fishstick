// Presets de iluminação/atmosfera (HD-2D): céu, névoa, sol, bloom, cor.
export const ATMOSPHERES = {
  day: {
    bg: '#9fd4ff', fog: '#bfe2ff', fogNear: 30, fogFar: 62,
    sky: '#e8f4ff', ground: '#6a7a5a', ambient: 1.05,
    sun: '#fff6e0', sunIntensity: 1.8, sunDir: [-0.5, 1, 0.55],
    bloom: 0.6, bloomThreshold: 0.85, vignette: 0.45, saturation: 0.12, contrast: 0.05,
    water: '#2a9ac0', waterLight: '#ffffff', night: false,
  },
  dusk: {
    bg: '#f0a070', fog: '#e89a78', fogNear: 24, fogFar: 56,
    sky: '#ffcf9e', ground: '#5a3e66', ambient: 0.82,
    sun: '#ffb070', sunIntensity: 1.55, sunDir: [-0.85, 0.55, 0.45],
    bloom: 1.25, bloomThreshold: 0.68, vignette: 0.6, saturation: 0.18, contrast: 0.08,
    water: '#3a7aa8', waterLight: '#ffd8a8', night: true,
  },
  night: {
    bg: '#0e1430', fog: '#141c3e', fogNear: 22, fogFar: 52,
    sky: '#7088e0', ground: '#221a34', ambient: 0.72,
    sun: '#a8c0ff', sunIntensity: 0.95, sunDir: [0.4, 1, 0.5],
    bloom: 1.6, bloomThreshold: 0.55, vignette: 0.7, saturation: 0.1, contrast: 0.1,
    water: '#1a3a70', waterLight: '#b8d0ff', waterAlpha: 0.5, night: true,
  },
  burning: {
    bg: '#2a0e18', fog: '#3a1420', fogNear: 20, fogFar: 48,
    sky: '#ff9a70', ground: '#3a1820', ambient: 0.78,
    sun: '#ffa070', sunIntensity: 1.1, sunDir: [0.3, 1, 0.6],
    bloom: 1.8, bloomThreshold: 0.5, vignette: 0.75, saturation: 0.15, contrast: 0.12,
    water: '#4a2030', waterLight: '#ffb080', night: true,
  },
  forest: {
    bg: '#2a4a3a', fog: '#3a5a48', fogNear: 18, fogFar: 46,
    sky: '#d8f0b0', ground: '#28362e', ambient: 0.72,
    sun: '#ffe0a0', sunIntensity: 1.35, sunDir: [-0.7, 0.8, 0.35],
    bloom: 1.3, bloomThreshold: 0.62, vignette: 0.68, saturation: 0.16, contrast: 0.08,
    water: '#2a6a6a', waterLight: '#e0ffd0', night: true,
  },
  cave: {
    bg: '#0c0a18', fog: '#160f2a', fogNear: 20, fogFar: 46,
    sky: '#9a8ae8', ground: '#2a1a3a', ambient: 0.85,
    sun: '#b0a0ff', sunIntensity: 0.8, sunDir: [-0.3, 1, 0.4],
    bloom: 1.8, bloomThreshold: 0.5, vignette: 0.75, saturation: 0.14, contrast: 0.1,
    water: '#3a4ab0', waterLight: '#c0b0ff', waterAlpha: 0.55, night: true,
  },
  fort: {
    bg: '#141624', fog: '#1c1e30', fogNear: 20, fogFar: 48,
    sky: '#90a0d0', ground: '#281e28', ambient: 0.72,
    sun: '#b0c0ff', sunIntensity: 0.9, sunDir: [0.5, 1, 0.5],
    bloom: 1.5, bloomThreshold: 0.55, vignette: 0.72, saturation: 0.05, contrast: 0.12,
    water: '#1a2a4a', waterLight: '#a0b0ff', night: true,
  },
  interior: {
    bg: '#0a0810', fog: '#0a0810', fogNear: 24, fogFar: 50,
    sky: '#ffe0b0', ground: '#3a2a2a', ambient: 0.85,
    sun: '#ffd8a0', sunIntensity: 0.6, sunDir: [-0.3, 1, 0.6],
    bloom: 1.2, bloomThreshold: 0.65, vignette: 0.7, saturation: 0.14, contrast: 0.06,
    night: true,
  },
};
