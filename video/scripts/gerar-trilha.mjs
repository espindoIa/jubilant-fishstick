// Trilha original gerada por código: drone grave + percussão suave (tambor de moldura).
// Uso: node scripts/gerar-trilha.mjs public/audio/trilha.wav [segundos]
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "public/audio/trilha.wav";
const DUR = Number(process.argv[3] ?? 120);
const SR = 48000;
const N = Math.round(DUR * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

// PRNG determinístico (mulberry32) para o ruído
let seed = 0x5e3a1b;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
const fadeIn = 3 * SR;
const fadeOut = 4 * SR;

// 1) Drone: Lá grave (55 Hz) + quinta (82.4 Hz) + oitava, com batimento lento entre canais.
// A tônica muda de cor por seção (Lá → Fá → Ré → Lá) com crossfade lento.
const sections = [
  { t: 0, f: 55.0 },
  { t: 38, f: 49.0 }, // Sol
  { t: 70, f: 43.65 }, // Fá
  { t: 96, f: 55.0 },
];
function rootAt(sec) {
  let f = sections[0].f;
  for (let i = 1; i < sections.length; i++) {
    const s = sections[i];
    const k = Math.min(1, Math.max(0, (sec - s.t) / 4)); // glissando de 4 s
    f = f + (s.f - f) * k;
  }
  return f;
}
let ph = [0, 0, 0, 0, 0, 0];
for (let i = 0; i < N; i++) {
  const sec = i / SR;
  const f0 = rootAt(sec);
  const lfo = 0.5 + 0.5 * Math.sin(TAU * 0.05 * sec);
  const lfo2 = 0.5 + 0.5 * Math.sin(TAU * 0.031 * sec + 1.3);
  const freqs = [f0, f0 * 1.003, f0 * 1.5, f0 * 1.497, f0 * 2, f0 * 3.01];
  const amps = [0.32, 0.32, 0.14 * lfo, 0.14 * lfo2, 0.08, 0.03 * lfo];
  let l = 0,
    r = 0;
  for (let k = 0; k < freqs.length; k++) {
    ph[k] += (TAU * freqs[k]) / SR;
    const s = Math.sin(ph[k]) * amps[k];
    if (k % 2 === 0) {
      l += s * 0.75;
      r += s * 0.25;
    } else {
      l += s * 0.25;
      r += s * 0.75;
    }
  }
  L[i] += l;
  R[i] += r;
}

// 2) Vento/poeira: ruído filtrado passa-baixa (1 polo) muito discreto
let lpL = 0,
  lpR = 0;
for (let i = 0; i < N; i++) {
  const sec = i / SR;
  const a = 0.012 + 0.008 * Math.sin(TAU * 0.07 * sec);
  lpL += 0.02 * ((rand() * 2 - 1) - lpL);
  lpR += 0.02 * ((rand() * 2 - 1) - lpR);
  L[i] += lpL * a * 6;
  R[i] += lpR * a * 6;
}

// 3) Percussão suave: tambor de moldura a 72 BPM (grave no 1, toque leve no 3, contratempo ocasional)
const BPM = 72;
const beat = 60 / BPM;
function drum(at, gain, pitch, decay, pan) {
  const start = Math.round(at * SR);
  const len = Math.round(decay * 6 * SR);
  let p = 0;
  let n = 0;
  for (let j = 0; j < len && start + j < N; j++) {
    const t = j / SR;
    const f = pitch * (1 + 0.6 * Math.exp(-t * 30)); // queda de afinação
    p += (TAU * f) / SR;
    const env = Math.exp(-t / decay);
    n += 0.15 * ((rand() * 2 - 1) - n);
    const s = (Math.sin(p) * 0.9 + n * 0.5 * Math.exp(-t * 60)) * env * gain;
    L[start + j] += s * (1 - pan);
    R[start + j] += s * pan;
  }
}
const percStart = 5.0; // entra depois do gancho
const percEnd = DUR - 3.5;
for (let t = percStart, b = 0; t < percEnd; t += beat, b++) {
  const bar = b % 4;
  const sec = t;
  // respira menos na seção do cuneiforme / mais rarefeita no fim
  const density = sec > 96 ? 0.6 : 1;
  if (bar === 0) drum(t, 0.55 * density, 62, 0.22, 0.5);
  if (bar === 2) drum(t, 0.25 * density, 140, 0.09, 0.35);
  if (bar === 3 && b % 8 === 7) drum(t + beat / 2, 0.16 * density, 180, 0.06, 0.65);
}
// impacto suave no gancho e no fim
drum(0.05, 0.7, 50, 0.5, 0.5);
drum(DUR - 3.2, 0.6, 48, 0.6, 0.5);

// Envelopes globais e normalização de pico (o mix final ajusta loudness)
let peak = 0;
for (let i = 0; i < N; i++) {
  let g = 1;
  if (i < fadeIn) g = i / fadeIn;
  if (i > N - fadeOut) g = Math.max(0, (N - i) / fadeOut);
  L[i] *= g;
  R[i] *= g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.7 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log(`trilha: ${out} (${DUR}s, pico normalizado 0.7)`);
