// API pública de áudio de "Ecos da Aurora" (Web Audio puro, zero dependências).
//
//   import { Audio } from './audio/audio.js';
//   Audio.init();                       // no primeiro toque/clique (gesto do usuário)
//   Audio.playMusic('village', { fade: 1.5 });
//   Audio.playSfx('confirm');
//
// Escalonador "lookahead": a cada ~25 ms agenda as notas que começam nos próximos ~100 ms
// usando audioContext.currentTime (timing exato, sem deriva). Ao esconder a aba o contexto
// é suspenso (economia de bateria) e retomado ao voltar.

import { Engine, SongPlayer, compileSong } from './engine.js';
import { SONGS, SONG_IDS } from './songs.js';
import { SFX } from './sfx.js';

const LOOKAHEAD = 0.1; // s agendados à frente
const TICK_MS = 25;

let ctx = null;
let engine = null;
let player = null; // música atual
let fading = []; // músicas em fade-out (caudas)
let timer = 0;
let lastTick = 0;
let current = null; // id da música atual (ou pendente, antes do init)
let musicPaused = false;
let musicVol = 0.8;
let sfxVol = 0.9;
let hiddenSuspended = false;
let gestureHooked = false;

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

function tick() {
  timer = 0;
  if (!engine) return;
  const now = ctx.currentTime;
  const wall = performance.now();
  // Se o timer atrasou (aba em segundo plano, jank), agenda mais à frente.
  const gap = lastTick ? (wall - lastTick) / 1000 : 0;
  lastTick = wall;
  const ahead = Math.min(1.5, Math.max(LOOKAHEAD, gap * 1.5 + 0.03));
  if (player) player.scheduleUntil(now, now + ahead);
  if (fading.length) {
    for (const p of fading) p.scheduleUntil(now, now + ahead);
    fading = fading.filter((p) => {
      if (p.isDone(now)) { p.dispose(); return false; }
      return true;
    });
  }
  if (player || fading.length) timer = setTimeout(tick, TICK_MS);
}

function kick() {
  if (!timer && engine) {
    lastTick = 0;
    tick();
  }
}

function startSong(id, fade) {
  const comp = compileSong(id);
  if (!comp) return;
  const now = ctx.currentTime;
  if (player) {
    player.fadeOut(fade > 0 ? fade : 0.04);
    fading.push(player);
    player = null;
  }
  musicPaused = false;
  const p = new SongPlayer(engine, comp);
  p.start(now + 0.06, fade > 0 ? fade : 0);
  player = p;
  kick();
}

function hookGestures() {
  if (gestureHooked || typeof window === 'undefined') return;
  gestureHooked = true;
  const h = () => {
    if (ctx && ctx.state !== 'running' && !hiddenSuspended) Audio.unlock();
  };
  for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, h, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) {
      if (ctx.state === 'running') {
        hiddenSuspended = true;
        ctx.suspend().catch(() => {});
      }
    } else if (hiddenSuspended) {
      hiddenSuspended = false;
      ctx.resume().catch(() => {});
      lastTick = 0;
    }
  });
}

export const Audio = {
  /** Cria o AudioContext (idempotente). Chamar dentro de um gesto do usuário. */
  init() {
    if (engine) {
      this.unlock();
      return true;
    }
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return false;
    try {
      ctx = new AC();
      engine = new Engine(ctx, { musicVol, sfxVol });
    } catch (e) {
      console.warn('[audio] init falhou:', e);
      ctx = engine = null;
      return false;
    }
    hookGestures();
    this.unlock();
    if (current) startSong(current, 0.5); // playMusic chamado antes do init
    return true;
  },

  /** Retoma o contexto (políticas de autoplay iOS/Android). */
  unlock() {
    if (!ctx) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    try {
      // buffer silencioso: "destrava" o áudio em iOS antigos
      const b = ctx.createBuffer(1, 1, ctx.sampleRate);
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(ctx.destination);
      s.start(0);
      s.onended = () => s.disconnect();
    } catch (_) { /* ok */ }
  },

  /** Troca para a música `id` com crossfade (s). Não faz nada se ela já estiver tocando. */
  playMusic(id, { fade = 1.0 } = {}) {
    if (!SONGS[id]) {
      console.warn('[audio] música desconhecida:', id);
      return;
    }
    if (current === id && (player || !engine)) {
      if (musicPaused) this.resumeMusic();
      return;
    }
    current = id;
    if (!engine) return; // tocará quando init() for chamado
    startSong(id, fade);
  },

  stopMusic(fade = 1.0) {
    current = null;
    musicPaused = false;
    if (!player) return;
    player.fadeOut(Math.max(0.02, fade));
    fading.push(player);
    player = null;
    kick();
  },

  pauseMusic() {
    if (!player || musicPaused) return;
    player.pause();
    musicPaused = true;
  },

  resumeMusic() {
    if (!player || !musicPaused) return;
    musicPaused = false;
    player.resume();
    kick();
  },

  /** Dispara um efeito. opts: { volume=1, pitch=1 (multiplicador), pan=0, delay=0 (s) }. */
  playSfx(id, opts = {}) {
    if (!SFX[id]) {
      console.warn('[audio] efeito desconhecido:', id);
      return false;
    }
    if (!engine || hiddenSuspended) return false;
    if (ctx.state !== 'running') this.unlock();
    try {
      return engine.playSfx(id, opts);
    } catch (e) {
      console.warn('[audio] sfx', id, e);
      return false;
    }
  },

  setMusicVolume(v) {
    musicVol = clamp01(v);
    if (engine) engine.setMusicVolume(musicVol);
  },

  setSfxVolume(v) {
    sfxVol = clamp01(v);
    if (engine) engine.setSfxVolume(sfxVol);
  },

  get currentSong() {
    return current;
  },

  get musicVolume() {
    return musicVol;
  },

  get sfxVolume() {
    return sfxVol;
  },

  /** Listas para menus de debug / sound test. */
  songs: SONG_IDS,
  sfxList: Object.keys(SFX),

  /** Estado interno (debug/testes). */
  _debug() {
    return {
      state: ctx ? ctx.state : 'none',
      time: ctx ? ctx.currentTime : 0,
      current,
      paused: musicPaused,
      voices: player ? player.active.filter((v) => v.end > ctx.currentTime).length : 0,
      fading: fading.length,
      beat: player ? player.beat : 0,
    };
  },
};

/**
 * Renderiza offline (OfflineAudioContext) uma música ou efeito — usado por tools/render-audio.mjs.
 * kind: 'music' | 'sfx'. opts: { seconds, sampleRate, startAt (s), only, mute, dry, mono, sfxAt: [[s, id]], sfxOpts }.
 */
export async function renderOffline(kind, id, opts = {}) {
  const seconds = opts.seconds ?? 10;
  const sr = opts.sampleRate ?? 44100;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const octx = new OAC(2, Math.ceil(seconds * sr), sr);
  const eng = new Engine(octx, { musicVol, sfxVol });
  if (kind === 'music') {
    const comp = compileSong(id);
    if (!comp) throw new Error('música desconhecida: ' + id);
    const p = new SongPlayer(eng, comp, { only: opts.only, mute: opts.mute, dry: opts.dry, mono: opts.mono });
    const startBeat = (opts.startAt ?? 0) / p.spb;
    p.start(0, 0, startBeat);
    for (let t = 0; t < seconds; t += 0.05) p.scheduleUntil(t, t + LOOKAHEAD); // simula o timer
    for (const [at, sid] of opts.sfxAt || []) eng.playSfx(sid, { force: true }, at);
  } else {
    if (!eng.playSfx(id, opts.sfxOpts || {}, 0.02)) throw new Error('efeito desconhecido: ' + id);
  }
  return octx.startRendering();
}

export { SONGS, SFX, compileSong };
export default Audio;
