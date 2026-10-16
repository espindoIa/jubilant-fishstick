// Efeitos sonoros procedurais (curtos, retrô). Cada efeito é uma função que recebe
// um SfxCtx `s` e combina primitivas: s.tone(), s.noise(), s.bell().
// Tempos em segundos relativos ao disparo; frequências em Hz ou nome de nota.

import { setOscWave, resources, hz } from './instruments.js';

export class SfxCtx {
  constructor(engine, t, opts = {}) {
    const ctx = (this.ctx = engine.ctx);
    this.e = engine;
    this.t = t;
    this.pitch = opts.pitch ?? 1;
    this.out = ctx.createGain();
    this.out.gain.value = opts.volume ?? opts.vol ?? 1;
    this.nodes = [this.out];
    this.post = this.out;
    if (opts.pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, opts.pan));
      this.out.connect(p);
      this.post = p;
      this.nodes.push(p);
    }
    this.post.connect(engine.sfxBus);
    this.live = 0;
    this.end = t;
    this.closed = false;
    this.rnd = Math.random;
  }

  /** Envia parte do sinal para reverb/eco. */
  send(rev = 0, echo = 0) {
    const ctx = this.ctx;
    if (rev > 0) {
      const g = ctx.createGain();
      g.gain.value = rev;
      this.post.connect(g);
      g.connect(this.e.sfxRevBus);
      this.nodes.push(g);
    }
    if (echo > 0) {
      const g = ctx.createGain();
      g.gain.value = echo;
      this.post.connect(g);
      g.connect(this.e.sfxEcho);
      this.nodes.push(g);
    }
    return this;
  }

  finish() {
    if (this.live === 0) this._close();
    return this.end;
  }

  _close() {
    if (this.closed) return;
    this.closed = true;
    for (const n of this.nodes) n.disconnect();
  }

  _track(src, nodes, stopAt) {
    this.live++;
    this.end = Math.max(this.end, stopAt);
    src.onended = () => {
      for (const n of nodes) n.disconnect();
      if (--this.live === 0) this._close();
    };
  }

  _dest(o, nodes) {
    if (o.pan != null && this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = o.pan;
      p.connect(this.out);
      nodes.push(p);
      return p;
    }
    return this.out;
  }

  // envelope: ataque a, sustenta `dur` (opcional decaimento d->s), solta em r
  _env(g, t, peak, o) {
    const a = o.a ?? 0.002, hold = o.dur ?? 0, r = o.r ?? 0.1;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (o.d && hold > 0) g.gain.setTargetAtTime(peak * (o.s ?? 0), t + a, o.d / 4);
    const off = t + a + hold;
    g.gain.setTargetAtTime(0, off, r / 4.5);
    return off + r * 1.2;
  }

  // filtros com varredura (lp→lp2, hp→hp2, bp→bp2 em `fst` segundos)
  _filters(o, t, total) {
    const out = [];
    const st = t + (o.fst ?? total * 0.8);
    for (const type of ['lp', 'hp', 'bp']) {
      if (o[type] == null) continue;
      const f = this.ctx.createBiquadFilter();
      f.type = type === 'lp' ? 'lowpass' : type === 'hp' ? 'highpass' : 'bandpass';
      f.Q.value = o.q ?? (type === 'bp' ? 1.5 : 0.7);
      f.frequency.setValueAtTime(o[type], t);
      if (o[type + '2'] != null) f.frequency.exponentialRampToValueAtTime(Math.max(20, o[type + '2']), st);
      out.push(f);
    }
    return out;
  }

  _trem(o, t, end, nodes, extraSrc) {
    if (!o.trem) return null;
    const ctx = this.ctx;
    const tg = ctx.createGain();
    tg.gain.value = 1 - o.trem[1] / 2;
    const l = ctx.createOscillator();
    l.frequency.value = o.trem[0];
    const lg = ctx.createGain();
    lg.gain.value = o.trem[1] / 2;
    l.connect(lg);
    lg.connect(tg.gain);
    l.start(t);
    l.stop(end);
    nodes.push(tg, l, lg);
    extraSrc.push(l);
    return tg;
  }

  _crackle(o, t, end, nodes) {
    if (!o.crackle) return null;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(1, t);
    for (let x = t; x < end; x += 0.012 + this.rnd() * 0.03) {
      g.gain.setValueAtTime(this.rnd() < o.crackle ? 1 : 0.15, x);
    }
    nodes.push(g);
    return g;
  }

  _wire(src, chain, dest) {
    let n = src;
    for (const x of chain) if (x) n = n.connect(x);
    n.connect(dest);
  }

  /** Oscilador: w (onda), f→f2 (varredura em st s), steps [[dt, f]], vib [Hz, cents], trem, filtros. */
  tone(o) {
    const ctx = this.ctx;
    const t = this.t + (o.t || 0);
    const osc = ctx.createOscillator();
    setOscWave(ctx, osc, o.w || 'square');
    const nyq = ctx.sampleRate * 0.45;
    const f = Math.min(hz(o.f) * this.pitch, nyq);
    osc.frequency.setValueAtTime(f, t);
    const total = (o.a ?? 0.002) + (o.dur ?? 0) + (o.r ?? 0.1);
    if (o.f2 != null) {
      const f2 = Math.min(hz(o.f2) * this.pitch, nyq);
      const st = t + (o.st ?? total * 0.8);
      if (o.lin) osc.frequency.linearRampToValueAtTime(f2, st);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), st);
    }
    if (o.steps) for (const [dt, ff] of o.steps) osc.frequency.setValueAtTime(hz(ff) * this.pitch, t + dt);
    if (o.dt) osc.detune.value = o.dt;
    const nodes = [osc], srcs = [osc];
    const env = ctx.createGain();
    nodes.push(env);
    const end = this._env(env, t, o.g ?? 0.2, o);
    if (o.vib) {
      const l = ctx.createOscillator();
      l.frequency.value = o.vib[0];
      const lg = ctx.createGain();
      lg.gain.value = o.vib[1];
      l.connect(lg);
      lg.connect(osc.detune);
      l.start(t);
      l.stop(end);
      nodes.push(l, lg);
      srcs.push(l);
    }
    const fl = this._filters(o, t, total);
    nodes.push(...fl);
    const tr = this._trem(o, t, end, nodes, srcs);
    this._wire(osc, [...fl, env, tr], this._dest(o, nodes));
    osc.start(t);
    osc.stop(end);
    this._track(osc, nodes, end);
  }

  /** Ruído branco filtrado: lp/hp/bp com varreduras, crackle (estalos), trem, rate. */
  noise(o) {
    const ctx = this.ctx;
    const t = this.t + (o.t || 0);
    const src = ctx.createBufferSource();
    src.buffer = resources(ctx).noise;
    src.loop = true;
    if (o.rate) src.playbackRate.value = o.rate;
    const total = (o.a ?? 0.002) + (o.dur ?? 0) + (o.r ?? 0.1);
    const nodes = [src], srcs = [src];
    const env = ctx.createGain();
    nodes.push(env);
    const end = this._env(env, t, o.g ?? 0.2, o);
    const fl = this._filters(o, t, total);
    nodes.push(...fl);
    const cr = this._crackle(o, t, end, nodes);
    const tr = this._trem(o, t, end, nodes, srcs);
    this._wire(src, [...fl, cr, env, tr], this._dest(o, nodes));
    src.start(t, this.rnd() * 1.2);
    src.stop(end);
    this._track(src, nodes, end);
  }

  /** Sino FM: portadora f, moduladora f*ratio com índice que decai (metal/vidro). */
  bell(o) {
    const ctx = this.ctx;
    const t = this.t + (o.t || 0);
    const f = Math.min(hz(o.f) * this.pitch, ctx.sampleRate * 0.45);
    const d = o.d ?? 0.6;
    const car = ctx.createOscillator();
    car.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.frequency.value = Math.min(f * (o.ratio ?? 3.5), ctx.sampleRate * 0.45);
    const mg = ctx.createGain();
    const idx = (o.idx ?? 2.2) * f;
    mg.gain.setValueAtTime(idx, t);
    mg.gain.setTargetAtTime(idx * 0.08, t, d / 5);
    mod.connect(mg);
    mg.connect(car.frequency);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(o.g ?? 0.1, t + (o.a ?? 0.001));
    env.gain.setTargetAtTime(0, t + (o.a ?? 0.001), d / 4.5);
    const end = t + d * 1.2 + 0.01;
    const nodes = [car, mod, mg, env];
    car.connect(env);
    env.connect(this._dest(o, nodes));
    car.start(t);
    mod.start(t);
    car.stop(end);
    mod.stop(end);
    this._track(car, nodes, end);
  }
}

// Notas úteis
const N = {
  C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, B6: 1975.53,
  C7: 2093, E7: 2637.02, G7: 3135.96,
};

const arpeggio = (s, notes, step, o) => notes.forEach((f, i) => s.tone({ ...o, f, t: (o.t || 0) + i * step }));

export const SFX = {
  // ---------------------------------------------------------------- interface
  cursor(s) {
    s.tone({ w: 'pulse25', f: 1760, dur: 0.012, r: 0.03, g: 0.13, lp: 6000 });
    s.tone({ w: 'pulse25', f: 2637, t: 0.02, r: 0.035, g: 0.06, lp: 6000 });
  },
  confirm(s) {
    s.send(0, 0.12);
    s.tone({ w: 'pulse25', f: N.E6, dur: 0.035, r: 0.05, g: 0.16, lp: 6000 });
    s.tone({ w: 'pulse25', f: N.B6, t: 0.055, dur: 0.05, r: 0.14, g: 0.16, lp: 6000 });
  },
  cancel(s) {
    s.tone({ w: 'pulse25', f: N.A5, dur: 0.03, r: 0.05, g: 0.15, lp: 4000 });
    s.tone({ w: 'pulse25', f: N.E5, t: 0.05, dur: 0.04, r: 0.1, g: 0.14, lp: 3000 });
  },
  error(s) {
    for (const t of [0, 0.11]) {
      s.tone({ w: 'square', f: 110, t, dur: 0.07, r: 0.03, g: 0.13, lp: 1600 });
      s.tone({ w: 'square', f: 117, t, dur: 0.07, r: 0.03, g: 0.1, lp: 1600 });
    }
  },
  menu_open(s) {
    s.tone({ w: 'triangle', f: 380, f2: 1400, st: 0.11, dur: 0.09, r: 0.08, g: 0.24 });
    s.tone({ w: 'pulse12', f: N.G6, t: 0.08, r: 0.14, g: 0.06, lp: 7000 });
  },
  step(s) {
    const k = 0.8 + s.rnd() * 0.4;
    s.noise({ lp: 650 * k, hp: 120, r: 0.05, g: 0.16 });
    s.tone({ w: 'sine', f: 95 * k, f2: 60, r: 0.04, g: 0.09 });
  },
  text(s) {
    s.tone({ w: 'pulse25', f: 1150 + s.rnd() * 160, dur: 0.01, r: 0.02, g: 0.075, lp: 3500 });
  },
  door(s) {
    s.tone({ w: 'sawtooth', f: 170, f2: 250, st: 0.25, dur: 0.22, r: 0.05, g: 0.06, lp: 1100, trem: [34, 0.7] });
    s.tone({ w: 'sine', f: 120, f2: 55, t: 0.26, r: 0.22, g: 0.5 });
    s.noise({ t: 0.26, lp: 700, r: 0.12, g: 0.3 });
  },

  // ---------------------------------------------------------------- recompensas
  chest(s) {
    s.send(0.2, 0.15);
    s.tone({ w: 'sawtooth', f: 140, f2: 230, st: 0.22, dur: 0.18, r: 0.05, g: 0.07, lp: 900, trem: [28, 0.6] });
    arpeggio(s, [N.G5, N.C6, N.E6, N.G6, N.C7], 0.05, { t: 0.24, w: 'pulse25', r: 0.22, g: 0.12, lp: 6000 });
    s.bell({ f: N.C7, t: 0.5, d: 0.9, g: 0.07, ratio: 2 });
  },
  item(s) {
    s.send(0.15, 0.15);
    arpeggio(s, [N.C6, N.E6, N.G6, N.C7], 0.06, { w: 'pulse25', dur: 0.03, r: 0.18, g: 0.12, lp: 7000 });
    s.bell({ f: N.C7, t: 0.24, d: 0.7, g: 0.06, ratio: 2 });
  },
  save(s) {
    s.send(0.4, 0.25);
    [N.C6, N.G6, N.B6, N.E7].forEach((f, i) => s.bell({ f, t: i * 0.09, d: 1.3, g: 0.07, ratio: 2, idx: 1.2 }));
    for (const f of [N.C5, N.E5, N.G5]) s.tone({ w: 'sine', f, a: 0.12, dur: 0.35, r: 0.7, g: 0.05 });
  },
  levelup(s) {
    s.send(0.2, 0.2);
    arpeggio(s, [N.G5, N.C6, N.E6, N.G6], 0.07, { w: 'pulse25', dur: 0.04, r: 0.1, g: 0.11, lp: 6000 });
    arpeggio(s, [N.A5, N.D6, 1479.98, N.A6], 0.07, { t: 0.3, w: 'pulse25', dur: 0.04, r: 0.1, g: 0.11, lp: 6000 });
    for (const f of [N.C6, N.E6, N.G6, N.C7]) s.tone({ w: 'pulse25', f, t: 0.6, a: 0.01, dur: 0.35, r: 0.4, g: 0.065, lp: 5000, vib: [6, 12] });
    s.bell({ f: N.C7, t: 0.6, d: 1.2, g: 0.07, ratio: 2 });
  },
  heal(s) {
    s.send(0.35, 0.25);
    arpeggio(s, [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6], 0.06, { w: 'sine', a: 0.01, r: 0.45, g: 0.1, vib: [7, 15] });
    s.noise({ hp: 6000, a: 0.2, dur: 0.25, r: 0.4, g: 0.035 });
  },
  star(s) {
    s.send(0.4, 0.35);
    const notes = [N.E6, N.G6, N.A6, N.C7, N.E7, N.G7];
    for (let i = 0; i < 5; i++) {
      s.bell({ f: notes[Math.floor(s.rnd() * notes.length)], t: i * 0.055, d: 0.5, g: 0.055, ratio: 3.01, idx: 1.4, pan: s.rnd() * 1.2 - 0.6 });
    }
    s.tone({ w: 'sine', f: 3136, f2: 4186, st: 0.25, r: 0.3, g: 0.035, vib: [9, 20] });
  },

  // ---------------------------------------------------------------- batalha: físico
  slash(s) {
    s.noise({ bp: 3200, bp2: 700, q: 1.2, a: 0.004, dur: 0.06, r: 0.08, g: 0.6, fst: 0.12 });
    s.tone({ w: 'sawtooth', f: 2400, f2: 500, st: 0.1, r: 0.09, g: 0.05, hp: 900 });
    s.bell({ f: 2800, t: 0.02, d: 0.22, g: 0.04, ratio: 1.41 });
  },
  hit(s) {
    s.tone({ w: 'sine', f: 210, f2: 55, st: 0.1, dur: 0.02, r: 0.16, g: 0.7 });
    s.noise({ lp: 2600, lp2: 400, dur: 0.02, r: 0.09, g: 0.5 });
  },
  crit(s) {
    s.send(0.2, 0.15);
    s.tone({ w: 'sine', f: 240, f2: 45, st: 0.14, dur: 0.03, r: 0.22, g: 0.8 });
    s.noise({ lp: 4000, lp2: 300, dur: 0.03, r: 0.14, g: 0.55 });
    s.noise({ hp: 3000, r: 0.05, g: 0.35 });
    s.bell({ f: 1800, t: 0.01, d: 0.45, g: 0.08, ratio: 2.7 });
    s.tone({ w: 'pulse12', f: 2200, f2: 2600, t: 0.03, r: 0.3, g: 0.05, vib: [14, 30], lp: 7000 });
  },
  pierce(s) {
    s.tone({ w: 'sine', f: 900, f2: 2600, st: 0.06, r: 0.06, g: 0.22 });
    s.noise({ bp: 5000, q: 1, r: 0.06, g: 0.3 });
    s.noise({ t: 0.07, lp: 1500, r: 0.05, g: 0.35 });
    s.tone({ w: 'sine', f: 300, f2: 90, t: 0.07, r: 0.08, g: 0.35 });
  },
  blunt(s) {
    s.tone({ w: 'sine', f: 150, f2: 38, st: 0.18, dur: 0.03, r: 0.26, g: 0.85 });
    s.noise({ lp: 900, lp2: 180, dur: 0.02, r: 0.2, g: 0.55 });
    s.tone({ w: 'square', f: 70, r: 0.1, g: 0.1, lp: 400 });
  },

  // ---------------------------------------------------------------- batalha: magia
  magic(s) {
    s.send(0.3, 0.25);
    arpeggio(s, ['A5', 'C#6', 'E6', 'A6'], 0.045, { w: 'sine', a: 0.005, r: 0.3, g: 0.08, vib: [10, 25] });
    s.tone({ w: 'triangle', f: 400, f2: 1600, st: 0.35, a: 0.05, dur: 0.2, r: 0.2, g: 0.1, vib: [12, 20] });
    s.noise({ hp: 6000, a: 0.15, dur: 0.1, r: 0.25, g: 0.04 });
  },
  fire(s) {
    s.send(0.15, 0);
    s.noise({ lp: 1000, lp2: 3800, a: 0.05, dur: 0.25, r: 0.35, g: 0.5, fst: 0.3, crackle: 0.6 });
    s.tone({ w: 'sawtooth', f: 80, f2: 170, st: 0.4, a: 0.03, dur: 0.25, r: 0.3, g: 0.14, lp: 600 });
    s.noise({ hp: 2500, a: 0.08, dur: 0.3, r: 0.25, g: 0.18, crackle: 0.25 });
  },
  ice(s) {
    s.send(0.35, 0.3);
    const fs = [2637, 3136, 3951, 4699, 3520];
    fs.forEach((f, i) => s.bell({ f, t: i * 0.05 + s.rnd() * 0.02, d: 0.35, g: 0.06, ratio: 2.76, idx: 1.5, pan: (i % 2 ? 0.4 : -0.4) }));
    s.noise({ hp: 5000, a: 0.02, dur: 0.15, r: 0.3, g: 0.13 });
    s.tone({ w: 'sine', f: 2000, f2: 1200, st: 0.3, a: 0.01, dur: 0.1, r: 0.2, g: 0.05, vib: [16, 30] });
  },
  thunder(s) {
    s.send(0.3, 0);
    s.noise({ hp: 700, dur: 0.03, r: 0.08, g: 0.7 });
    s.noise({ t: 0.05, hp: 1500, r: 0.06, g: 0.45 });
    s.noise({ t: 0.02, lp: 420, lp2: 110, a: 0.02, dur: 0.3, r: 1.0, g: 0.75, fst: 0.9 });
    s.tone({ w: 'sine', f: 60, f2: 34, st: 0.8, a: 0.02, dur: 0.2, r: 0.8, g: 0.35 });
  },
  light(s) {
    s.send(0.5, 0.25);
    for (const [i, f] of [N.C6, N.E6, N.G6, N.C7].entries()) s.bell({ f, t: i * 0.02, d: 1.2, g: 0.055, ratio: 2, idx: 1.1 });
    s.tone({ w: 'sine', f: 600, f2: 2400, st: 0.5, a: 0.05, dur: 0.3, r: 0.3, g: 0.08, vib: [8, 15] });
    s.noise({ hp: 7000, a: 0.15, dur: 0.3, r: 0.5, g: 0.04 });
  },
  wind(s) {
    s.noise({ bp: 500, bp2: 2400, q: 3, a: 0.15, dur: 0.4, r: 0.35, g: 0.55, fst: 0.55 });
    s.noise({ t: 0.1, bp: 1600, bp2: 3600, q: 4, a: 0.1, dur: 0.25, r: 0.3, g: 0.3, fst: 0.4 });
    s.noise({ t: 0.3, bp: 3000, bp2: 700, q: 2, a: 0.05, dur: 0.15, r: 0.3, g: 0.25, fst: 0.4 });
  },
  quake(s) {
    s.noise({ lp: 230, a: 0.05, dur: 0.9, r: 0.5, g: 0.8, trem: [9, 0.6] });
    s.tone({ w: 'sine', f: 48, f2: 34, st: 1.3, a: 0.05, dur: 0.9, r: 0.5, g: 0.45, trem: [7, 0.5] });
    s.tone({ w: 'square', f: 58, a: 0.05, dur: 0.6, r: 0.4, g: 0.08, lp: 220 });
  },
  buff(s) {
    s.send(0.3, 0.2);
    s.tone({ w: 'triangle', f: 440, f2: 880, st: 0.14, dur: 0.12, r: 0.05, g: 0.17 });
    s.tone({ w: 'triangle', f: 660, f2: 1320, st: 0.14, t: 0.15, dur: 0.12, r: 0.12, g: 0.17 });
    s.bell({ f: N.E7, t: 0.3, d: 0.5, g: 0.05, ratio: 2 });
  },

  // Quebra do escudo (Break): transiente de vidro + estilhaços cintilantes + cauda.
  break(s) {
    s.send(0.35, 0.15);
    s.noise({ hp: 2000, dur: 0.01, r: 0.05, g: 0.6 });
    s.tone({ w: 'sine', f: 160, f2: 48, st: 0.12, r: 0.18, g: 0.55 });
    s.noise({ bp: 3600, bp2: 1300, q: 0.8, dur: 0.02, r: 0.28, g: 0.42, fst: 0.25 });
    s.bell({ f: 1568, d: 0.7, g: 0.08, ratio: 3.5, idx: 1.8 });
    s.bell({ f: 2349, d: 0.6, g: 0.06, ratio: 3.5, idx: 1.6 });
    const ratios = [2.76, 1.47, 3.9, 2.2];
    for (let i = 0; i < 12; i++) {
      const t = 0.012 + i * 0.026 + s.rnd() * 0.02;
      s.bell({
        f: 2200 + s.rnd() * 4300, t, d: 0.14 + s.rnd() * 0.26, g: 0.1 * (1 - i / 16),
        ratio: ratios[i % 4], idx: 1.2 + s.rnd(), pan: s.rnd() * 1.4 - 0.7,
      });
    }
    s.noise({ t: 0.05, hp: 6000, a: 0.04, dur: 0.12, r: 0.4, g: 0.08, crackle: 0.35 });
  },
  weak(s) {
    s.send(0.2, 0.2);
    s.tone({ w: 'pulse25', f: N.B6, dur: 0.02, r: 0.12, g: 0.13, lp: 8000 });
    s.tone({ w: 'pulse25', f: N.E7, t: 0.06, dur: 0.02, r: 0.25, g: 0.13, lp: 8000 });
    s.bell({ f: N.E7, t: 0.06, d: 0.5, g: 0.06, ratio: 3.5 });
  },
  enemy_die(s) {
    s.send(0.25, 0.2);
    s.noise({ bp: 2200, bp2: 300, q: 2, a: 0.02, dur: 0.5, r: 0.3, g: 0.45, fst: 0.75, trem: [32, 0.85] });
    s.tone({ w: 'sawtooth', f: 900, f2: 110, st: 0.75, a: 0.01, dur: 0.55, r: 0.2, g: 0.09, lp: 2500, lp2: 400, trem: [24, 0.7] });
    s.bell({ f: N.E6, t: 0.55, d: 0.4, g: 0.04, ratio: 2.76 });
  },
  ko(s) {
    s.send(0.2, 0);
    s.tone({ w: 'square', f: 440, f2: 110, st: 0.45, dur: 0.38, r: 0.1, g: 0.13, lp: 1500, vib: [8, 30] });
    s.tone({ w: 'sine', f: 120, f2: 40, t: 0.45, st: 0.2, r: 0.22, g: 0.5 });
    s.noise({ t: 0.45, lp: 500, r: 0.12, g: 0.25 });
  },
  encounter(s) {
    s.send(0.25, 0.15);
    s.noise({ bp: 300, bp2: 6000, q: 2.5, a: 0.3, dur: 0.04, r: 0.2, g: 0.4, fst: 0.34 });
    s.tone({ w: 'sawtooth', f: 100, f2: 1600, st: 0.34, a: 0.25, dur: 0.06, r: 0.15, g: 0.08, lp: 3000 });
    s.tone({ w: 'sine', f: 95, f2: 38, t: 0.35, st: 0.3, r: 0.4, g: 0.5 });
    s.noise({ t: 0.35, hp: 4500, r: 0.6, g: 0.22 });
    for (let i = 0; i < 6; i++) s.bell({ f: 1800 + i * 420, t: 0.36 + i * 0.035, d: 0.35, g: 0.045, ratio: 2.76, pan: i % 2 ? 0.5 : -0.5 });
  },
  flee(s) {
    [0, 0.09, 0.16, 0.22].forEach((t) => s.noise({ t, lp: 1200, r: 0.04, g: 0.25 }));
    s.noise({ t: 0.25, bp: 2500, bp2: 600, q: 1.5, a: 0.03, dur: 0.1, r: 0.2, g: 0.32 });
    s.tone({ w: 'triangle', f: 1200, f2: 300, t: 0.25, st: 0.25, r: 0.2, g: 0.1 });
  },

  // ---------------------------------------------------------------- ambiente
  explosion(s) {
    s.send(0.3, 0);
    s.tone({ w: 'sine', f: 120, f2: 30, st: 0.5, dur: 0.05, r: 0.9, g: 0.7 });
    s.noise({ lp: 3000, lp2: 150, dur: 0.1, r: 1.0, g: 0.7, fst: 0.8 });
    s.noise({ hp: 2000, dur: 0.05, r: 0.4, g: 0.15, crackle: 0.4 });
  },
  steam(s) {
    s.noise({ hp: 2500, a: 0.04, dur: 0.45, r: 0.35, g: 0.28 });
    s.noise({ bp: 6000, q: 1, a: 0.06, dur: 0.35, r: 0.3, g: 0.14 });
  },
};
