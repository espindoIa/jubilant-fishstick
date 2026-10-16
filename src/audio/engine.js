// Motor de áudio: grafo de mixagem, eco estilo SNES, reverb por convolução
// (IR gerada de ruído), parser da notação das músicas e o sequenciador.
//
// Grafo:
//   voz -> canal(gain) -> pan -> song.mix -> song.out(fade) -> musicBus ─┐
//                              ├-> eco da música (delay+LP+HP c/ feedback) -> song.mix
//                              └-> song.revMix -> song.revOut(fade) -> musicRevBus -> reverb ─┤
//   sfx -> sfxBus / sfxRevBus / sfxEcho ────────────────────────────────────────────────────┤
//                                   master -> LP 11k (calor SNES) -> compressor -> limitador -> saída

import { PATCHES, playTone, playDrum, midiToFreq, noteToMidi } from './instruments.js';
import { SONGS } from './songs.js';
import { SFX, SfxCtx } from './sfx.js';

const EPS = 1e-6;
export const MAX_MUSIC_VOICES = 40;
export const MAX_SFX = 14;

// ---------------------------------------------------------------- notação
// Tokens separados por espaço:  NOTA[:dur][flags]   ex.: 'C4', 'Eb5:.5', 'F#3:1/3', 'C4+E4+G4:4'
//   r = pausa, ~ = prolonga a nota anterior, | = barra (o parser confere a duração do compasso)
//   dur em tempos (semínimas); se omitida, repete a última. Flags: ! acento, ^ fraco, ? 50% de chance
//   Bateria: letras (k s h o c b t m T x a), combináveis com '+': 'k+h:.5'
const TOKEN = /^(r|~|[A-G][#b]?\d(?:\+[A-G][#b]?\d)*|[a-zA-Z](?:\+[a-zA-Z])*)(?::([0-9./]+))?([!^?]*)$/;

function parseDur(s) {
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    return (a === '' ? 1 : parseFloat(a)) / parseFloat(b);
  }
  return parseFloat(s);
}

export function parseSeq(src, bpb, label, warn, isDrum = false) {
  const ev = [];
  let t = 0, dur = 1, barStart = 0, bar = 1;
  const endBar = () => {
    const len = t - barStart;
    if (Math.abs(len - bpb) > EPS) warn(`${label}: compasso ${bar} tem ${+len.toFixed(4)} tempos (esperado ${bpb})`);
    barStart = t;
    bar++;
  };
  for (const tok of String(src).split(/\s+/)) {
    if (!tok) continue;
    if (tok === '|') { endBar(); continue; }
    const m = TOKEN.exec(tok);
    if (!m) { warn(`${label}: token inválido "${tok}" (compasso ${bar})`); continue; }
    if (m[2]) {
      const d = parseDur(m[2]);
      if (!(d > 0)) { warn(`${label}: duração inválida "${tok}"`); continue; }
      dur = d;
    }
    const head = m[1], fl = m[3];
    if (head === 'r') { t += dur; continue; }
    if (head === '~') {
      const last = ev[ev.length - 1];
      if (last) last.dur += dur;
      t += dur;
      continue;
    }
    let notes;
    if (isDrum) notes = head.split('+');
    else {
      notes = head.split('+').map(noteToMidi);
      if (notes.some((n) => n == null)) { warn(`${label}: nota inválida "${tok}"`); t += dur; continue; }
    }
    ev.push({
      t, dur, notes,
      vel: fl.includes('!') ? 1 : fl.includes('^') ? 0.55 : 0.8,
      prob: fl.includes('?') ? 0.5 : 1,
    });
    t += dur;
  }
  if (t - barStart > EPS) endBar();
  return { ev, len: t };
}

const CACHE = new Map();
/** Compila (e guarda em cache) uma música de SONGS. */
export function compileSong(id) {
  if (CACHE.has(id)) return CACHE.get(id);
  const song = SONGS[id];
  if (!song) return null;
  const warnings = [];
  const warn = (m) => warnings.push(`${id}: ${m}`);
  const sig = song.sig || [4, 4];
  const bpb = (sig[0] * 4) / sig[1];
  const chans = [];
  for (const [name, c] of Object.entries(song.ch)) {
    const isDrum = c.inst === 'drums';
    if (!isDrum && !PATCHES[c.inst]) warn(`${name}: instrumento desconhecido "${c.inst}"`);
    const intro = c.intro ? parseSeq(c.intro, bpb, `${name}.intro`, warn, isDrum) : { ev: [], len: 0 };
    const loop = parseSeq(c.loop || '', bpb, `${name}.loop`, warn, isDrum);
    chans.push({ name, def: c, isDrum, intro, loop });
  }
  const introLen = Math.max(0, ...chans.map((c) => c.intro.len));
  const loopLen = Math.max(0, ...chans.map((c) => c.loop.len));
  for (const c of chans) {
    if (c.intro.len && Math.abs(c.intro.len - introLen) > EPS) warn(`${c.name}: intro com ${c.intro.len} tempos (música: ${introLen})`);
    const L = c.loop.len;
    if (L > EPS && L + EPS < loopLen) {
      const k = loopLen / L;
      if (Math.abs(k - Math.round(k)) < EPS) {
        const base = c.loop.ev;
        const ev = [];
        for (let i = 0; i < Math.round(k); i++) for (const e of base) ev.push({ ...e, t: e.t + i * L });
        c.loop = { ev, len: loopLen };
      } else warn(`${c.name}: loop de ${L} tempos não divide o loop da música (${loopLen})`);
    }
  }
  const out = { id, song, bpb, introLen, loopLen, chans, warnings };
  CACHE.set(id, out);
  if (warnings.length && typeof console !== 'undefined') for (const w of warnings) console.warn('[audio]', w);
  return out;
}

// ---------------------------------------------------------------- cursor por canal
class Cursor {
  constructor(intro, loop, introLen, loopLen) {
    this.intro = intro.ev;
    this.loop = loop.ev;
    this.introLen = introLen;
    this.loopLen = loopLen;
    this.seek(0);
  }
  seek(beat) {
    if (beat < this.introLen - EPS) {
      this.sec = 0;
      this.iter = 0;
      this.i = this.intro.findIndex((e) => e.t >= beat - EPS);
      if (this.i < 0) { this.sec = 1; this.i = 0; }
      return;
    }
    this.sec = 1;
    if (!this.loop.length || this.loopLen <= 0) { this.i = 0; this.iter = 0; return; }
    const lb = Math.max(0, beat - this.introLen);
    this.iter = Math.floor(lb / this.loopLen + EPS);
    const local = lb - this.iter * this.loopLen;
    this.i = this.loop.findIndex((e) => e.t >= local - EPS);
    if (this.i < 0) { this.i = 0; this.iter++; }
  }
  peek() {
    if (this.sec === 0) return this.intro[this.i].t;
    if (!this.loop.length || this.loopLen <= 0) return Infinity;
    return this.introLen + this.iter * this.loopLen + this.loop[this.i].t;
  }
  take() {
    const e = this.sec === 0 ? this.intro[this.i] : this.loop[this.i];
    this.i++;
    if (this.sec === 0 && this.i >= this.intro.length) { this.sec = 1; this.i = 0; this.iter = 0; }
    else if (this.sec === 1 && this.i >= this.loop.length) { this.i = 0; this.iter++; }
    return e;
  }
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

function rampTo(param, v, now, dur) {
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(v, now + Math.max(0.005, dur));
}

// ---------------------------------------------------------------- tocador de música
export class SongPlayer {
  /** opts.only / opts.mute: listas de canais (para análise offline). */
  constructor(engine, comp, opts = {}) {
    const ctx = (this.ctx = engine.ctx);
    this.e = engine;
    this.comp = comp;
    this.id = comp.id;
    const s = comp.song;
    this.spb = 60 / s.bpm;
    const gain = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };
    this.out = gain(0);
    this.revOut = gain(0);
    this.mix = gain(s.gain ?? 1);
    this.revMix = gain((s.gain ?? 1) * (s.reverb ?? 1));
    this.mix.connect(this.out);
    this.revMix.connect(this.revOut);
    this.out.connect(engine.musicBus);
    this.revOut.connect(engine.musicRevBus);
    this.nodes = [this.out, this.revOut, this.mix, this.revMix];
    this.lfos = [];

    // Eco SNES: delay com feedback filtrado (LP + HP no laço).
    this.dry = !!opts.dry; // sem eco/reverb (análise de altura nas ferramentas)
    this.mono = !!opts.mono; // força polifonia 1 (análise)
    const ec = this.dry ? null : s.echo;
    if (ec) {
      this.echoIn = gain(1);
      const dl = ctx.createDelay(1.0);
      dl.delayTime.value = Math.min(0.95, Math.max(0.04, ec.beats * this.spb));
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = ec.lp ?? 2600;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 180;
      const fb = gain(ec.fb ?? 0.35);
      const wet = gain(ec.wet ?? 0.35);
      this.echoIn.connect(dl);
      dl.connect(lp);
      lp.connect(hp);
      hp.connect(fb);
      fb.connect(dl);
      hp.connect(wet);
      wet.connect(this.mix);
      this.nodes.push(this.echoIn, dl, lp, hp, fb, wet);
    }

    const only = opts.only, mute = opts.mute || [];
    this.chans = comp.chans
      .filter((c) => (only ? only.includes(c.name) : !mute.includes(c.name)))
      .map((c) => this._chan(c, comp));
    this.rng = mulberry32(hashStr(comp.id));
    this.active = [];
    this.stopAt = Infinity;
    this.paused = false;
    this.disposed = false;
    this.t0 = 0;
  }

  _chan(c, comp) {
    const ctx = this.ctx, d = c.def;
    const g = ctx.createGain();
    g.gain.value = d.vol ?? 0.8;
    const nodes = [g];
    let post = g;
    if (ctx.createStereoPanner && d.pan) {
      const p = ctx.createStereoPanner();
      p.pan.value = d.pan;
      g.connect(p);
      post = p;
      nodes.push(p);
    }
    post.connect(this.mix);
    if (this.echoIn && d.echo) {
      const es = ctx.createGain();
      es.gain.value = d.echo;
      post.connect(es);
      es.connect(this.echoIn);
      nodes.push(es);
    }
    const revAmt = this.dry ? 0 : d.rev ?? 0.15;
    if (revAmt > 0) {
      const rs = ctx.createGain();
      rs.gain.value = revAmt;
      post.connect(rs);
      rs.connect(this.revMix);
      nodes.push(rs);
    }
    this.nodes.push(...nodes);
    const patch = c.isDrum ? null : PATCHES[d.inst];
    let lfo = null;
    if (patch && patch.vib) {
      lfo = ctx.createOscillator();
      lfo.frequency.value = patch.vib.rate;
      lfo.start();
      this.lfos.push(lfo);
    }
    return {
      name: c.name, def: d, isDrum: c.isDrum, patch, lfo, input: g, voices: [],
      poly: this.mono ? 1 : d.poly ?? (patch && patch.poly) ?? 1,
      cur: new Cursor(c.intro, c.loop, comp.introLen, comp.loopLen),
    };
  }

  /** Começa a tocar em `when` (tempo do contexto), a partir do tempo `beat`. */
  start(when, fade = 0, beat = 0) {
    this.t0 = when - beat * this.spb;
    for (const c of this.chans) c.cur.seek(beat);
    for (const p of [this.out.gain, this.revOut.gain]) {
      p.cancelScheduledValues(0);
      if (fade > 0.01) {
        p.setValueAtTime(0, when);
        p.linearRampToValueAtTime(1, when + fade);
      } else p.setValueAtTime(1, when);
    }
  }

  /** Agenda todos os eventos com início < horizon. `now` = tempo atual (poda de vozes). */
  scheduleUntil(now, horizon) {
    if (this.paused || this.disposed) return;
    const h = Math.min(horizon, this.stopAt);
    const nowBeat = (now - this.t0) / this.spb;
    for (const c of this.chans) {
      // muito atrasado (main thread travou por segundos): pula direto para o tempo atual
      if (c.cur.peek() < nowBeat - 4) c.cur.seek(nowBeat);
      for (let guard = 0; guard < 512; guard++) {
        const b = c.cur.peek();
        if (b === Infinity) break;
        const time = this.t0 + b * this.spb;
        if (time >= h) break;
        const ev = c.cur.take();
        if (time < now - 0.025) continue; // atrasado demais (aba travou): pula
        if (ev.prob < 1 && this.rng() >= ev.prob) continue;
        this._play(c, ev, Math.max(time, now, 0), now);
      }
    }
  }

  _play(c, ev, time, now) {
    const ctx = this.ctx;
    if (c.isDrum) {
      for (const k of ev.notes) playDrum(ctx, k, c.input, time, ev.vel);
      return;
    }
    const p = c.patch;
    if (!p) return;
    const dur = ev.dur * this.spb * (c.def.legato ?? p.legato ?? 0.92);
    const tr = c.def.transpose || 0;
    const strum = c.def.strum ?? 0;
    if (c.voices.length) c.voices = c.voices.filter((v) => v.end > now);
    const vs = c.voices;
    for (let i = 0; i < ev.notes.length; i++) {
      const t = time + i * strum;
      while (vs.length >= c.poly) vs.shift().cut(t);
      if (this.active.length >= MAX_MUSIC_VOICES) {
        this.active = this.active.filter((v) => v.end > now);
        while (this.active.length >= MAX_MUSIC_VOICES) this.active.shift().cut(t);
      }
      const v = playTone(ctx, p, c.input, midiToFreq(ev.notes[i] + tr), t, dur, ev.vel, c.lfo);
      vs.push(v);
      this.active.push(v);
    }
  }

  get beat() {
    return (this.ctx.currentTime - this.t0) / this.spb;
  }

  fadeOut(dur) {
    const now = this.ctx.currentTime;
    rampTo(this.out.gain, 0, now, dur);
    rampTo(this.revOut.gain, 0, now, dur);
    this.stopAt = now + Math.max(0.02, dur);
  }

  /** Terminou o fade e as caudas de eco/reverb? */
  isDone(now) {
    return now > this.stopAt + 2.5;
  }

  pause(fade = 0.12) {
    if (this.paused || this.disposed) return;
    const now = this.ctx.currentTime;
    this.pausedBeat = Math.max(0, (now - this.t0) / this.spb);
    rampTo(this.out.gain, 0, now, fade);
    rampTo(this.revOut.gain, 0, now, fade);
    for (const v of this.active) v.cut(now + fade);
    this.active = [];
    for (const c of this.chans) c.voices = [];
    this.paused = true;
  }

  resume(fade = 0.3) {
    if (!this.paused || this.disposed) return;
    const now = this.ctx.currentTime;
    const when = now + 0.05;
    this.t0 = when - this.pausedBeat * this.spb;
    for (const c of this.chans) c.cur.seek(this.pausedBeat);
    this.out.gain.cancelScheduledValues(now);
    this.revOut.gain.cancelScheduledValues(now);
    for (const p of [this.out.gain, this.revOut.gain]) {
      p.setValueAtTime(0, when);
      p.linearRampToValueAtTime(1, when + fade);
    }
    this.paused = false;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const now = this.ctx.currentTime;
    for (const v of this.active) v.cut(now);
    for (const l of this.lfos) {
      try { l.stop(); } catch (_) { /* ok */ }
      l.disconnect();
    }
    for (const n of this.nodes) n.disconnect();
    this.active = [];
  }
}

// ---------------------------------------------------------------- reverb (IR de ruído)
function makeIR(ctx, seconds = 1.5, decay = 3.0) {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const pre = Math.floor(sr * 0.012);
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let s = c ? 0x51ed270b : 0x1b873593;
    let lp = 0;
    for (let i = pre; i < len; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const n = s / 2147483648 - 1;
      const k = (i - pre) / (len - pre);
      const coef = 0.35 + 0.55 * k; // escurece ao longo da cauda
      lp += (n - lp) * (1 - coef);
      d[i] = lp * Math.pow(1 - k, decay) * Math.min(1, (i - pre) / (sr * 0.004));
    }
  }
  return buf;
}

// ---------------------------------------------------------------- engine
export class Engine {
  constructor(ctx, { musicVol = 0.8, sfxVol = 0.9 } = {}) {
    this.ctx = ctx;
    const gain = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };
    this.master = gain(0.85);
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass';
    warm.frequency.value = 11000;
    warm.Q.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -9;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    // Limitador final (ataque ~0 com o lookahead interno do compressor): segura picos de SFX + música.
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -2.5;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0;
    lim.release.value = 0.12;
    this.master.connect(warm);
    warm.connect(comp);
    comp.connect(lim);
    lim.connect(ctx.destination);
    this.compressor = comp;

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeIR(ctx);
    const revOut = gain(0.5);
    this.reverb.connect(revOut);
    revOut.connect(this.master);

    this.musicBus = gain(musicVol);
    this.musicRevBus = gain(musicVol);
    this.musicBus.connect(this.master);
    this.musicRevBus.connect(this.reverb);

    this.sfxBus = gain(sfxVol);
    this.sfxRevBus = gain(sfxVol);
    this.sfxBus.connect(this.master);
    this.sfxRevBus.connect(this.reverb);

    // Eco curto dos efeitos (magias, brilhos).
    this.sfxEcho = gain(1);
    const dl = ctx.createDelay(1);
    dl.delayTime.value = 0.16;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    const fb = gain(0.33);
    const wet = gain(0.55);
    this.sfxEcho.connect(dl);
    dl.connect(lp);
    lp.connect(fb);
    fb.connect(dl);
    lp.connect(wet);
    wet.connect(this.sfxBus);

    this.sfxEnds = [];
    this.sfxLast = Object.create(null);
  }

  setMusicVolume(v) {
    const now = this.ctx.currentTime;
    rampTo(this.musicBus.gain, v, now, 0.05);
    rampTo(this.musicRevBus.gain, v, now, 0.05);
  }

  setSfxVolume(v) {
    const now = this.ctx.currentTime;
    rampTo(this.sfxBus.gain, v, now, 0.05);
    rampTo(this.sfxRevBus.gain, v, now, 0.05);
  }

  /** Dispara um efeito. opts: volume, pitch (multiplicador), pan, delay (s). */
  playSfx(id, opts = {}, when = this.ctx.currentTime) {
    const def = SFX[id];
    if (!def) return false;
    const now = this.ctx.currentTime;
    if (this.sfxEnds.length >= MAX_SFX) this.sfxEnds = this.sfxEnds.filter((e) => e > now);
    if (this.sfxEnds.length >= MAX_SFX) return false;
    const last = this.sfxLast[id];
    if (last !== undefined && now - last < 0.03 && now >= last && !opts.force) return false;
    this.sfxLast[id] = now;
    const s = new SfxCtx(this, when + (opts.delay || 0), opts);
    def(s, opts);
    this.sfxEnds.push(s.finish());
    return true;
  }
}
