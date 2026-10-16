// Instrumentos do sintetizador procedural com sabor SNES (SPC700), sem samples.
// Cada "patch" descreve osciladores (formas de onda próprias via PeriodicWave),
// envelope ADSR, filtro (com envelope/keytracking) e vibrato. Percussão em playDrum().
//
// Economia de CPU: formas de onda e buffer de ruído são criados uma vez por contexto;
// cada nota usa 2–5 nós, que são desconectados em `onended`.

const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'C#4' → 61 (MIDI). Retorna null se o nome for inválido. */
export function noteToMidi(name) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(name);
  if (!m) return null;
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return NOTE_INDEX[m[1]] + acc + (Number(m[3]) + 1) * 12;
}
export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
/** Aceita Hz (número) ou nome de nota. */
export const hz = (x) => (typeof x === 'number' ? x : midiToFreq(noteToMidi(x)));

// ---------------------------------------------------------------- recursos por contexto
const RES = new WeakMap();
export function resources(ctx) {
  let r = RES.get(ctx);
  if (!r) {
    r = { waves: new Map(), noise: makeNoise(ctx) };
    RES.set(ctx, r);
  }
  return r;
}

function makeNoise(ctx) {
  const len = Math.floor(ctx.sampleRate * 1.5);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let s = 0x2f6b9a1d;
  for (let i = 0; i < len; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    d[i] = s / 2147483648 - 1;
  }
  return buf;
}

// ---------------------------------------------------------------- formas de onda
const BUILTIN = new Set(['sine', 'square', 'sawtooth', 'triangle']);
const harm = (amps) => {
  const imag = new Float32Array(amps.length + 1);
  amps.forEach((a, i) => (imag[i + 1] = a));
  return { real: new Float32Array(amps.length + 1), imag };
};
// Pulso com ciclo de trabalho `duty` (12.5% / 25% = timbres clássicos de 8/16 bits).
const pulse = (duty, n = 48) => {
  const real = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return { real, imag: new Float32Array(n + 1) };
};
const WAVES = {
  pulse12: () => pulse(0.125),
  pulse25: () => pulse(0.25),
  flute: () => harm([1, 0.16, 0.07, 0.025, 0.012]),
  harp: () => harm([1, 0.48, 0.26, 0.14, 0.08, 0.05, 0.03, 0.02]),
  piano: () => harm([1, 0.6, 0.34, 0.26, 0.15, 0.1, 0.07, 0.05, 0.03, 0.02]),
  organ: () => harm([1, 0.85, 0.55, 0.5, 0.1, 0.32, 0, 0.24, 0, 0.1, 0, 0.06]),
  reed: () => harm([1, 0.75, 0.62, 0.5, 0.42, 0.34, 0.26, 0.2, 0.15, 0.1, 0.07, 0.05]),
  bass: () => harm([1, 0.5, 0.26, 0.14, 0.07, 0.04]),
  choir: () => harm([1, 0.35, 0.5, 0.22, 0.1, 0.05]),
  horn: () => harm(Array.from({ length: 16 }, (_, i) => 1 / Math.pow(i + 1, 1.25))),
};

export function setOscWave(ctx, osc, name) {
  if (BUILTIN.has(name)) {
    osc.type = name;
    return;
  }
  const r = resources(ctx);
  let w = r.waves.get(name);
  if (!w) {
    const def = (WAVES[name] || WAVES.flute)();
    w = ctx.createPeriodicWave(def.real, def.imag);
    r.waves.set(name, w);
  }
  osc.setPeriodicWave(w);
}

// ---------------------------------------------------------------- patches
// Campos: wave | osc:[{w, m (razão de freq), dt (cents), g (ganho), d (decaimento próprio)}]
//  gain (pico), a/d/s/r (s), ring (percussivo: ignora note-off), legato, poly
//  lp|bp|hp (Hz), q, kt (keytracking), fenv (multiplicador inicial do filtro), fa, fd
//  vib {rate, depth (cents), delay}, slide (multiplicador inicial de pitch), slideT
export const PATCHES = {
  // Flauta doce: seno quase puro + vibrato atrasado.
  flute: { wave: 'flute', gain: 0.4, a: 0.05, d: 0.5, s: 0.82, r: 0.14, lp: 3800, vib: { rate: 5.2, depth: 16, delay: 0.22 }, legato: 0.95 },
  // Lead de pulso suave (estilo square SNES), um pouco filtrado.
  lead: { wave: 'pulse25', gain: 0.22, a: 0.01, d: 0.35, s: 0.6, r: 0.09, lp: 2800, kt: 0.3, vib: { rate: 5.6, depth: 11, delay: 0.24 }, legato: 0.9 },
  // Fife/píccolo militar (pulso estreito, agudo).
  fife: { wave: 'pulse12', gain: 0.13, a: 0.006, d: 0.2, s: 0.55, r: 0.05, lp: 4200, vib: { rate: 6.5, depth: 9, delay: 0.12 }, legato: 0.85 },
  // Acordeão: duas palhetas levemente desafinadas (efeito musette).
  accordion: { osc: [{ w: 'reed' }, { w: 'reed', dt: 13, g: 0.75 }], gain: 0.17, a: 0.035, d: 0.3, s: 0.8, r: 0.08, lp: 2400, kt: 0.35, legato: 0.9 },
  // Violino/cordas solo com vibrato.
  strings: { osc: [{ w: 'sawtooth', dt: -6 }, { w: 'sawtooth', dt: 6, g: 0.8 }], gain: 0.13, a: 0.14, d: 0.6, s: 0.85, r: 0.35, lp: 2100, kt: 0.5, vib: { rate: 5.2, depth: 13, delay: 0.25 }, legato: 0.98 },
  // Pad de cordas quente (acordes).
  pad: { osc: [{ w: 'sawtooth', dt: -9 }, { w: 'sawtooth', dt: 9, g: 0.8 }], gain: 0.05, a: 0.55, d: 1.2, s: 0.9, r: 0.9, lp: 1250, legato: 1, poly: 6 },
  // Coral etéreo ("aah") de ataque lento.
  choir: { osc: [{ w: 'choir', dt: -8 }, { w: 'choir', dt: 8, g: 0.8 }], gain: 0.075, a: 1.0, d: 1.5, s: 0.95, r: 1.4, lp: 2000, vib: { rate: 4.4, depth: 7, delay: 0.6 }, legato: 1, poly: 6 },
  // Harpa dedilhada.
  harp: { wave: 'harp', gain: 0.24, a: 0.003, ring: true, d: 1.7, lp: 1700, fenv: 2.6, fd: 0.3, kt: 0.6, poly: 4 },
  // Violão (corda de nylon): dente-de-serra com filtro que fecha rápido.
  guitar: { wave: 'sawtooth', gain: 0.11, a: 0.003, ring: true, d: 0.7, lp: 950, fenv: 3.2, fd: 0.1, q: 1.4, kt: 0.4, poly: 6 },
  // Piano simples (pluck harmônico longo).
  piano: { wave: 'piano', gain: 0.2, a: 0.004, ring: true, d: 2.4, lp: 2300, fenv: 2, fd: 0.45, kt: 0.5, poly: 5 },
  // Celesta / caixinha de música: fundamental + parcial 4x que some rápido.
  celesta: { osc: [{ w: 'sine' }, { w: 'sine', m: 4, g: 0.3, d: 0.22 }, { w: 'sine', m: 2, g: 0.14, d: 0.7 }], gain: 0.2, a: 0.002, ring: true, d: 1.6, poly: 3 },
  // Glockenspiel: parciais inarmônicos (2.76x, 5.4x).
  glock: { osc: [{ w: 'sine' }, { w: 'sine', m: 2.76, g: 0.32, d: 0.35 }, { w: 'sine', m: 5.4, g: 0.12, d: 0.12 }], gain: 0.17, a: 0.001, ring: true, d: 2.0, poly: 3 },
  // Gota d'água (caverna): seno com pitch subindo.
  drop: { wave: 'sine', gain: 0.1, a: 0.002, ring: true, d: 0.22, slide: 0.55, slideT: 0.045, poly: 2 },
  // Baixo arredondado (harmônicos p/ ser audível em alto-falante de celular).
  bass: { wave: 'bass', gain: 0.34, a: 0.006, d: 0.5, s: 0.62, r: 0.07, lp: 850, legato: 0.88 },
  // Baixo macio sustentado (temas calmos).
  softbass: { osc: [{ w: 'triangle' }, { w: 'sine', m: 2, g: 0.25 }], gain: 0.3, a: 0.03, d: 1.0, s: 0.7, r: 0.25, lp: 700, legato: 0.95 },
  // Baixo sintetizado de batalha (serra + ressonância).
  synbass: { wave: 'sawtooth', gain: 0.17, a: 0.003, d: 0.16, s: 0.55, r: 0.05, lp: 420, fenv: 5, fd: 0.12, q: 4.5, legato: 0.8 },
  // Metais (trompa/trombone) com filtro que abre no ataque.
  brass: { osc: [{ w: 'horn', dt: -5 }, { w: 'horn', dt: 5, g: 0.85 }], gain: 0.15, a: 0.035, d: 0.35, s: 0.75, r: 0.12, lp: 850, fa: 0.05, fenv: 2.8, fs: 1.5, fd: 0.35, q: 1.1, kt: 0.6, vib: { rate: 5.4, depth: 8, delay: 0.3 }, legato: 0.9 },
  // Fanfarra (metais brilhantes).
  fanfare: { osc: [{ w: 'sawtooth', dt: -6 }, { w: 'pulse25', dt: 6, g: 0.7 }], gain: 0.12, a: 0.02, d: 0.3, s: 0.7, r: 0.12, lp: 1500, fa: 0.03, fenv: 2.4, fs: 1.3, fd: 0.3, kt: 0.5, vib: { rate: 5.8, depth: 10, delay: 0.25 }, legato: 0.92 },
  // Ataques curtos de metais (acompanhamento de marcha).
  stab: { osc: [{ w: 'horn', dt: -7 }, { w: 'horn', dt: 7 }], gain: 0.07, a: 0.01, d: 0.18, s: 0.4, r: 0.08, lp: 700, fenv: 3, fd: 0.12, q: 1.5, kt: 0.5, legato: 0.7, poly: 6 },
  // Órgão (drawbars).
  organ: { wave: 'organ', gain: 0.09, a: 0.006, d: 0.25, s: 0.85, r: 0.06, lp: 3800, legato: 0.85, poly: 8 },
  // Comp de pulso curto (batalha).
  comp: { wave: 'pulse12', gain: 0.07, a: 0.003, d: 0.12, s: 0.25, r: 0.04, lp: 2600, legato: 0.6, poly: 6 },
  // Tímpano afinado.
  timp: { osc: [{ w: 'sine' }, { w: 'sine', m: 1.5, g: 0.35, d: 0.18 }, { w: 'triangle', m: 2.02, g: 0.12, d: 0.08 }], gain: 0.42, a: 0.004, ring: true, d: 1.2, slide: 1.1, slideT: 0.07, poly: 3 },
};

// ---------------------------------------------------------------- voz tonal
const hasHold = typeof AudioParam !== 'undefined' && 'cancelAndHoldAtTime' in AudioParam.prototype;

function freeze(param, t) {
  if (hasHold) param.cancelAndHoldAtTime(t);
  else param.cancelScheduledValues(t);
}

/**
 * Toca uma nota. `dur` = segundos até o note-off. `lfo` (opcional) é um oscilador
 * compartilhado do canal para vibrato. Retorna { end, cut(t) }.
 */
export function playTone(ctx, p, dest, freq, t, dur, vel = 0.8, lfo = null) {
  const env = ctx.createGain();
  env.gain.value = 0;
  const nodes = [env];
  let input = env;

  // Filtro (com keytracking e envelope)
  const fType = p.lp ? 'lowpass' : p.bp ? 'bandpass' : p.hp ? 'highpass' : null;
  if (fType) {
    const f = ctx.createBiquadFilter();
    f.type = fType;
    f.Q.value = p.q ?? 0.7;
    const base = Math.min(16000, (p.lp || p.bp || p.hp) * (p.kt ? Math.pow(freq / 261.63, p.kt) : 1));
    if (p.fenv) {
      const peak = Math.min(18000, base * p.fenv);
      if (p.fa) {
        f.frequency.setValueAtTime(base, t);
        f.frequency.linearRampToValueAtTime(peak, t + p.fa);
        f.frequency.setTargetAtTime(base * (p.fs ?? 1), t + p.fa, (p.fd ?? 0.2) / 3);
      } else {
        f.frequency.setValueAtTime(peak, t);
        f.frequency.setTargetAtTime(base, t, (p.fd ?? 0.2) / 3);
      }
    } else f.frequency.value = base;
    f.connect(env);
    input = f;
    nodes.push(f);
  }

  // Vibrato: LFO do canal -> ganho por voz (entra devagar) -> detune
  let vib = null;
  if (p.vib && lfo) {
    vib = ctx.createGain();
    vib.gain.setValueAtTime(0, t);
    vib.gain.setTargetAtTime(p.vib.depth, t + (p.vib.delay ?? 0.2), 0.12);
    lfo.connect(vib);
    nodes.push(vib);
  }

  const parts = p.osc || [{ w: p.wave || 'sine' }];
  const oscs = [];
  const nyq = ctx.sampleRate * 0.45;
  for (const part of parts) {
    const f0 = freq * (part.m || 1);
    if (f0 >= nyq && oscs.length) continue; // parcial acima de Nyquist: descarta
    const o = ctx.createOscillator();
    setOscWave(ctx, o, part.w);
    if (p.slide) {
      o.frequency.setValueAtTime(f0 * p.slide, t);
      o.frequency.exponentialRampToValueAtTime(f0, t + (p.slideT ?? 0.05));
    } else o.frequency.value = f0;
    if (part.dt) o.detune.value = part.dt;
    if (vib) vib.connect(o.detune);
    let out = o;
    const g = part.g ?? 1;
    if (part.d || g !== 1) {
      const pg = ctx.createGain();
      if (part.d) {
        pg.gain.setValueAtTime(g, t);
        pg.gain.setTargetAtTime(0, t, part.d / 3);
      } else pg.gain.value = g;
      o.connect(pg);
      out = pg;
      nodes.push(pg);
    }
    out.connect(input);
    o.start(t);
    oscs.push(o);
  }

  // Envelope de amplitude
  const peak = (p.gain ?? 0.3) * vel;
  const a = p.a ?? 0.005;
  const gp = env.gain;
  gp.setValueAtTime(0, t);
  gp.linearRampToValueAtTime(peak, t + a);
  let end;
  if (p.ring) {
    gp.setTargetAtTime(0, t + a, (p.d ?? 1) / 4.5);
    end = t + a + (p.d ?? 1) * 1.15;
  } else {
    const s = p.s ?? 0.7;
    if (p.d && s < 1) gp.setTargetAtTime(peak * s, t + a, p.d / 3);
    const off = t + Math.max(dur, a + 0.02);
    const r = p.r ?? 0.08;
    gp.setTargetAtTime(0, off, r / 4.5);
    end = off + r * 1.2;
  }
  env.connect(dest);
  for (const o of oscs) o.stop(end);

  const voice = {
    start: t,
    end,
    cut(tc) {
      if (tc >= voice.end) return;
      tc = Math.max(tc, t);
      freeze(gp, tc);
      gp.setTargetAtTime(0, tc, 0.01);
      const ne = tc + 0.06;
      for (const o of oscs) {
        try { o.stop(ne); } catch (_) { /* já parado */ }
      }
      voice.end = ne;
    },
  };
  oscs[0].onended = () => {
    for (const o of oscs) o.disconnect();
    for (const n of nodes) n.disconnect();
    if (vib && lfo) {
      try { lfo.disconnect(vib); } catch (_) { /* ok */ }
    }
  };
  return voice;
}

// ---------------------------------------------------------------- bateria
function noiseSrc(ctx, t, dur) {
  const s = ctx.createBufferSource();
  s.buffer = resources(ctx).noise;
  s.loop = true;
  s.start(t, Math.random() * 1.2);
  s.stop(t + dur);
  return s;
}
function envGain(ctx, t, peak, a, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(0, t + a, decay / 4.5);
  return g;
}
function filt(ctx, type, freq, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}
function chain(src, nodes, dest) {
  let n = src;
  for (const x of nodes) n = n.connect(x);
  n.connect(dest);
  src.onended = () => {
    src.disconnect();
    for (const x of nodes) x.disconnect();
  };
}
function noiseHit(ctx, dest, t, peak, decay, filters, a = 0.001) {
  const dur = a + decay * 1.15;
  const s = noiseSrc(ctx, t, dur);
  chain(s, [...filters, envGain(ctx, t, peak, a, decay)], dest);
  return t + dur;
}
function toneHit(ctx, dest, t, type, f0, f1, sweep, peak, decay, a = 0.002) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
  const dur = a + decay * 1.15;
  o.start(t);
  o.stop(t + dur);
  chain(o, [envGain(ctx, t, peak, a, decay)], dest);
  return t + dur;
}

/** Peças: k bumbo, s caixa, h chimbal, o chimbal aberto, c prato, b shaker,
 *  t/m/T tons (grave/médio/agudo), x aro/palma, a bigorna metálica. */
export function playDrum(ctx, kind, dest, t, vel = 0.8) {
  const v = vel;
  switch (kind) {
    case 'k':
      toneHit(ctx, dest, t, 'sine', 150, 44, 0.11, 0.85 * v, 0.3);
      return noiseHit(ctx, dest, t, 0.12 * v, 0.02, [filt(ctx, 'lowpass', 1800)]);
    case 's':
      toneHit(ctx, dest, t, 'triangle', 210, 165, 0.06, 0.32 * v, 0.09);
      return noiseHit(ctx, dest, t, 0.42 * v, 0.17, [filt(ctx, 'highpass', 900), filt(ctx, 'lowpass', 7000)]);
    case 'h':
      return noiseHit(ctx, dest, t, 0.16 * v, 0.045, [filt(ctx, 'highpass', 7000)]);
    case 'o':
      return noiseHit(ctx, dest, t, 0.13 * v, 0.3, [filt(ctx, 'highpass', 6000)], 0.003);
    case 'c':
      return noiseHit(ctx, dest, t, 0.2 * v, 1.5, [filt(ctx, 'highpass', 3500), filt(ctx, 'lowpass', 10000)], 0.003);
    case 'b':
      return noiseHit(ctx, dest, t, 0.09 * v, 0.06, [filt(ctx, 'bandpass', 6500, 1.1)], 0.012);
    case 't':
      return toneHit(ctx, dest, t, 'sine', 125, 82, 0.18, 0.55 * v, 0.32);
    case 'm':
      return toneHit(ctx, dest, t, 'sine', 170, 115, 0.16, 0.5 * v, 0.28);
    case 'T':
      return toneHit(ctx, dest, t, 'sine', 230, 160, 0.14, 0.45 * v, 0.24);
    case 'x':
      toneHit(ctx, dest, t, 'triangle', 820, 780, 0.02, 0.12 * v, 0.03);
      return noiseHit(ctx, dest, t, 0.28 * v, 0.06, [filt(ctx, 'bandpass', 2000, 2.5)]);
    case 'a':
      toneHit(ctx, dest, t, 'sine', 1180, 1180, 0, 0.09 * v, 0.4);
      toneHit(ctx, dest, t, 'sine', 1652, 1652, 0, 0.06 * v, 0.3);
      return toneHit(ctx, dest, t, 'square', 2490, 2490, 0, 0.02 * v, 0.12);
    default:
      return t;
  }
}
