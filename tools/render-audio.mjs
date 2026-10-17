// Validação estrutural do motor de áudio (não dá para "ouvir" no CI):
// renderiza cada música e cada efeito com OfflineAudioContext dentro do Chromium headless
// e imprime pico, RMS, clipping, silêncio/onsets, equilíbrio lead × acompanhamento e a
// emenda do loop. Também testa a API em tempo real (init/playMusic/crossfade/pause/sfx).
//
// Uso: node tools/render-audio.mjs [--seconds 10] [--only title,battle] [--no-sfx] [--no-rt] [--quick]
// Usa o Vite em http://localhost:5173 se estiver rodando; senão sobe um na porta 5199.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const SECONDS = Number(arg('--seconds', 10));
const ONLY = arg('--only', '')?.split(',').filter(Boolean);
const NO_SFX = args.includes('--no-sfx');
const NO_RT = args.includes('--no-rt');
const FULL = !args.includes('--quick'); // --quick: só os 10 s iniciais

async function reachable(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

let vite = null;
let base = process.env.BASE_URL || 'http://localhost:5173';
if (!(await reachable(base + '/src/audio/audio.js'))) {
  base = 'http://localhost:5199';
  vite = spawn('npx', ['vite', '--port', '5199', '--strictPort'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 60 && !(await reachable(base + '/src/audio/audio.js')); i++) await new Promise((r) => setTimeout(r, 500));
}
const cleanup = () => {
  if (vite) {
    try { process.kill(-vite.pid); } catch { /* ok */ }
    vite = null;
  }
};
process.on('exit', cleanup);

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.route(base + '/__audio_test.html', (r) =>
  r.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>audio test</title><body></body>' }));
await page.goto(base + '/__audio_test.html');

// --------------------------------------------------------------- funções no navegador
await page.evaluate(() => {
  // Estatísticas por janela. `weighted`: passa-altas de 1ª ordem (~150 Hz) antes da energia,
  // aproximando a percepção de volume (graves pesam menos) — usado no equilíbrio lead × acomp.
  window.__stats = (buf, win = 0.05, weighted = false) => {
    const L = buf.getChannelData(0), R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
    const n = L.length, sr = buf.sampleRate, w = Math.max(1, Math.round(sr * win));
    const ow = Math.round(sr * 0.02); // janelas de 20 ms p/ onsets
    const k = Math.exp((-2 * Math.PI * 150) / sr);
    let peak = 0, sum = 0, clip = 0, near = 0, nan = 0;
    const wins = [], flux = [];
    let ws = 0, wc = 0, fs = 0, fc = 0, pa = 0, pb = 0, ha = 0, hb = 0, da = 0;
    for (let i = 0; i < n; i++) {
      let a = L[i], b = R[i];
      if (!Number.isFinite(a) || !Number.isFinite(b)) { nan++; continue; }
      const m = Math.max(Math.abs(a), Math.abs(b));
      if (m > peak) peak = m;
      if (m >= 1) clip++;
      if (m >= 0.95) near++;
      const e = (a * a + b * b) / 2;
      sum += e;
      // diferença (pré-ênfase) realça ataques p/ detectar notas mesmo sob pads
      const d = (a + b) / 2 - da; da = (a + b) / 2;
      fs += d * d; fc++;
      if (fc === ow) { flux.push(Math.sqrt(fs / fc)); fs = 0; fc = 0; }
      if (weighted) {
        ha = k * (ha + a - pa); hb = k * (hb + b - pb); pa = a; pb = b;
        a = ha; b = hb;
      }
      ws += (a * a + b * b) / 2; wc++;
      if (wc === w) { wins.push(Math.sqrt(ws / wc)); ws = 0; wc = 0; }
    }
    const rms = Math.sqrt(sum / n);
    const silent = wins.filter((x) => x < 0.003).length / Math.max(1, wins.length);
    let onsets = 0;
    for (let i = 2; i < flux.length; i++) if (flux[i] > 0.002 && flux[i] > 1.3 * Math.max(flux[i - 1], flux[i - 2])) onsets++;
    let lastLoud = 0;
    wins.forEach((x, i) => { if (x > 0.002) lastLoud = i; });
    return { peak, rms, clip, near, nan, silent, onsets, wins, tail: (lastLoud + 1) * win };
  };
  // Altura por YIN (simplificado) numa janela centrada em `t` (s).
  window.__pitch = (buf, t, fmin = 70, fmax = 2600) => {
    const sr = buf.sampleRate, L = buf.getChannelData(0), R = buf.getChannelData(1);
    const W = 2048, start = Math.max(0, Math.round(t * sr) - W);
    const x = new Float32Array(W * 2);
    for (let i = 0; i < x.length; i++) x[i] = ((L[start + i] || 0) + (R[start + i] || 0)) / 2;
    const tmin = Math.floor(sr / fmax), tmax = Math.min(W - 1, Math.ceil(sr / fmin));
    const d = new Float32Array(tmax + 1);
    for (let tau = 1; tau <= tmax; tau++) {
      let s = 0;
      for (let i = 0; i < W; i++) { const v = x[i] - x[i + tau]; s += v * v; }
      d[tau] = s;
    }
    let run = 0, best = -1;
    const cm = new Float32Array(tmax + 1);
    for (let tau = 1; tau <= tmax; tau++) { run += d[tau]; cm[tau] = (d[tau] * tau) / (run || 1); }
    for (let tau = tmin; tau <= tmax; tau++) {
      if (cm[tau] < 0.15) { while (tau + 1 <= tmax && cm[tau + 1] < cm[tau]) tau++; best = tau; break; }
    }
    if (best < 0) { let mv = Infinity; for (let tau = tmin; tau <= tmax; tau++) if (cm[tau] < mv) { mv = cm[tau]; best = tau; } }
    const a = cm[best - 1] ?? cm[best], b = cm[best], c = cm[best + 1] ?? cm[best];
    const den = a - 2 * b + c;
    const shift = den ? (0.5 * (a - c)) / den : 0;
    return sr / (best + shift);
  };
});

const results = await page.evaluate(async ({ SECONDS, ONLY, NO_SFX, FULL }) => {
  const mod = await import('/src/audio/audio.js');
  const { renderOffline, SONGS, SFX, compileSong } = mod;
  const out = { songs: [], sfx: [], warnings: [] };
  const ids = Object.keys(SONGS).filter((id) => !ONLY.length || ONLY.includes(id));
  for (const id of ids) {
    const comp = compileSong(id);
    out.warnings.push(...comp.warnings);
    const s = SONGS[id];
    const spb = 60 / s.bpm;
    const introS = comp.introLen * spb, loopS = comp.loopLen * spb;
    const full = window.__stats(await renderOffline('music', id, { seconds: SECONDS }));
    // equilíbrio: só o lead × resto, numa janela depois da intro
    const at = introS + 0.01;
    const leadName = s.ch.lead ? 'lead' : Object.keys(s.ch)[0];
    const ls = window.__stats(await renderOffline('music', id, { seconds: SECONDS, startAt: at, only: [leadName] }), 0.05, true);
    const as = window.__stats(await renderOffline('music', id, { seconds: SECONDS, startAt: at, mute: [leadName] }), 0.05, true);
    // altura: as primeiras notas do lead (após a intro), renderizadas a seco, conferidas por YIN
    const leadCh = comp.chans.find((c) => c.name === leadName);
    const notes = leadCh.loop.ev.filter((e) => e.notes.length === 1 && e.dur * spb >= 0.18).slice(0, 8);
    const dry = await renderOffline('music', id, { seconds: Math.min(20, (notes.at(-1)?.t ?? 0) * spb + 2), startAt: introS, only: [leadName], dry: true, mono: true });
    let pitchOk = 0;
    const pitchBad = [];
    for (const e of notes) {
      const want = 440 * 2 ** ((e.notes[0] + (s.ch[leadName].transpose || 0) - 69) / 12);
      const got = window.__pitch(dry, e.t * spb + Math.min(0.12, e.dur * spb * 0.5));
      const cents = 1200 * Math.log2(got / want);
      if (Math.abs(cents) < 35) pitchOk++;
      else pitchBad.push(`${e.notes[0]}:${Math.round(cents)}c`);
    }
    let le = 0, ae = 0, k = 0;
    ls.wins.forEach((x, i) => { if (x > 0.01) { le += x * x; ae += (as.wins[i] || 0) ** 2; k++; } });
    const balance = k ? 10 * Math.log10(le / Math.max(1e-9, ae)) : -99;
    // emenda do loop: começa 3 s antes do fim do loop e passa da emenda
    const seamAt = introS + loopS - 3;
    const seam = window.__stats(await renderOffline('music', id, { seconds: 6, startAt: seamAt }));
    const around = seam.wins.slice(50, 70); // 2.5 s..3.5 s (emenda em 3 s)
    const seamMin = Math.min(...around);
    const seamMed = seam.wins.slice().sort((a, b) => a - b)[Math.floor(seam.wins.length / 2)];
    // música inteira (intro + loop completo): pico/clip/RMS e equilíbrio por trecho de ~8 s
    let whole = null, balMin = null, balWorstAt = 0;
    if (FULL) {
      const secs = introS + loopS + 1;
      whole = window.__stats(await renderOffline('music', id, { seconds: secs }));
      const lw = window.__stats(await renderOffline('music', id, { seconds: secs, only: [leadName] }), 0.05, true).wins;
      const aw = window.__stats(await renderOffline('music', id, { seconds: secs, mute: [leadName] }), 0.05, true).wins;
      const CH = 160; // 8 s em janelas de 50 ms
      for (let c0 = 0; c0 + CH / 2 < lw.length; c0 += CH) {
        let a = 0, b = 0, n = 0;
        for (let i = c0; i < Math.min(lw.length, c0 + CH); i++) if (lw[i] > 0.01) { a += lw[i] ** 2; b += (aw[i] || 0) ** 2; n++; }
        if (n < CH * 0.25) continue; // lead quase calado neste trecho (ex.: ponte com outro solista)
        const db = 10 * Math.log10(a / Math.max(1e-9, b));
        if (balMin === null || db < balMin) { balMin = db; balWorstAt = c0 * 0.05; }
      }
    }
    const chans = Object.keys(s.ch).length;
    out.songs.push({
      id, key: s.key, bpm: s.bpm, sig: (s.sig || [4, 4]).join('/'), prog: s.prog, chans,
      intro: introS, loop: loopS, peak: full.peak, rms: full.rms, clip: full.clip, near: full.near, nan: full.nan,
      silent: full.silent, onsets: full.onsets, balance, seamMin, seamMed, seamPeak: seam.peak,
      pitchOk, pitchN: notes.length, pitchBad,
      whole: whole && { peak: whole.peak, rms: whole.rms, clip: whole.clip, nan: whole.nan, silent: whole.silent }, balMin, balWorstAt,
    });
  }
  if (!NO_SFX) {
    for (const id of Object.keys(SFX)) {
      const st = window.__stats(await renderOffline('sfx', id, { seconds: 2.5 }), 0.01);
      out.sfx.push({ id, peak: st.peak, rms: st.rms, clip: st.clip, nan: st.nan, tail: st.tail });
    }
    // headroom: efeitos pesados por cima das músicas de batalha (mix real do jogo)
    const hits = [[0.5, 'hit'], [1.0, 'crit'], [1.6, 'break'], [2.2, 'explosion'], [3.0, 'thunder'], [3.6, 'encounter'], [4.5, 'fire'], [5.2, 'quake'], [6.0, 'blunt'], [6.4, 'levelup']];
    out.mix = [];
    for (const id of ['battle', 'boss', 'fort']) {
      const st = window.__stats(await renderOffline('music', id, { seconds: 8, startAt: 4, sfxAt: hits }));
      out.mix.push({ id, peak: st.peak, clip: st.clip, rms: st.rms });
    }
  }
  return out;
}, { SECONDS, ONLY: ONLY || [], NO_SFX, FULL });

// --------------------------------------------------------------- teste em tempo real
let rt = null;
if (!NO_RT) {
  rt = await page.evaluate(async () => {
    const { Audio } = await import('/src/audio/audio.js');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const log = [];
    Audio.playMusic('title'); // antes do init: deve ficar pendente
    log.push(['pending', Audio.currentSong]);
    Audio.init();
    Audio.init(); // idempotente
    await wait(1200);
    log.push(['title', Audio._debug()]);
    Audio.playMusic('title'); // no-op
    Audio.playMusic('battle', { fade: 0.3 });
    await wait(900);
    log.push(['battle', Audio._debug()]);
    Audio.pauseMusic();
    await wait(300);
    log.push(['paused', Audio._debug()]);
    Audio.resumeMusic();
    await wait(600);
    log.push(['resumed', Audio._debug()]);
    for (const id of Audio.sfxList) { Audio.playSfx(id, { volume: 0.5 }); await wait(15); }
    Audio.setMusicVolume(0.5);
    Audio.setSfxVolume(0.7);
    for (const id of Audio.songs) { Audio.playMusic(id, { fade: 0.1 }); await wait(250); }
    log.push(['cycled', Audio._debug()]);
    Audio.stopMusic(0.2);
    await wait(3200);
    log.push(['stopped', Audio._debug()]);
    return log;
  });
}

await browser.close();
cleanup();

// --------------------------------------------------------------- relatório
const f = (x, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
let fail = 0;
console.log(`\n=== MÚSICAS (render offline ${SECONDS}s, 44.1 kHz) ===`);
for (const s of results.songs) {
  const issues = [];
  if (s.peak >= 0.95) issues.push('PICO>=0.95');
  if (s.clip) issues.push(`CLIP x${s.clip}`);
  if (s.nan) issues.push(`NaN x${s.nan}`);
  if (s.rms < 0.05 || s.rms > 0.25) issues.push('RMS fora de 0.05–0.25');
  if (s.silent > 0.25) issues.push(`silêncio ${(s.silent * 100).toFixed(0)}%`);
  if (s.onsets < 5) issues.push('poucas notas');
  if (s.balance < 0) issues.push('lead baixo');
  if (s.pitchOk < s.pitchN) issues.push(`altura errada (${s.pitchBad.join(' ')})`);
  if (s.seamMin < Math.min(0.01, s.seamMed * 0.2)) issues.push('buraco na emenda do loop');
  if (s.seamPeak >= 0.95) issues.push('pico na emenda');
  if (s.whole) {
    if (s.whole.peak >= 0.95 || s.whole.clip) issues.push(`loop inteiro: pico ${f(s.whole.peak)} clip ${s.whole.clip}`);
    if (s.whole.nan) issues.push('loop inteiro: NaN');
    if (s.whole.rms < 0.05 || s.whole.rms > 0.25) issues.push('loop inteiro: RMS fora de 0.05–0.25');
    if (s.balMin !== null && s.balMin < -1.5) issues.push(`lead baixo no trecho ${f(s.balWorstAt, 0)}s (${f(s.balMin, 1)} dB)`);
  }
  if (issues.length) fail++;
  console.log(`\n${s.id.padEnd(8)} ${s.key} · ${s.bpm} BPM · ${s.sig} · ${s.chans} canais · intro ${f(s.intro, 1)}s · loop ${f(s.loop, 1)}s`);
  console.log(`  progressão: ${s.prog}`);
  console.log(`  pico ${f(s.peak)}  RMS ${f(s.rms)}  clip ${s.clip}  ≥0.95: ${s.near}  silêncio ${(s.silent * 100).toFixed(1)}%  onsets ${s.onsets}  lead/acomp ${f(s.balance, 1)} dB(pond.)  altura ${s.pitchOk}/${s.pitchN}  emenda min/med ${f(s.seamMin)}/${f(s.seamMed)}`);
  if (s.whole) console.log(`  loop inteiro: pico ${f(s.whole.peak)}  RMS ${f(s.whole.rms)}  clip ${s.whole.clip}  silêncio ${(s.whole.silent * 100).toFixed(1)}%  pior trecho lead/acomp ${f(s.balMin, 1)} dB @${f(s.balWorstAt, 0)}s`);
  console.log(`  ${issues.length ? '✗ ' + issues.join(', ') : '✓ ok'}`);
}
if (results.sfx.length) {
  console.log('\n=== EFEITOS (render offline 2.5s) ===');
  for (const s of results.sfx) {
    const issues = [];
    if (s.peak >= 0.95) issues.push('PICO>=0.95');
    if (s.clip) issues.push('CLIP');
    if (s.nan) issues.push('NaN');
    if (s.peak < 0.01) issues.push('SILENCIOSO'); // step/text são propositalmente bem baixos
    if (issues.length) fail++;
    console.log(`  ${s.id.padEnd(10)} pico ${f(s.peak)}  RMS ${f(s.rms)}  dur ${f(s.tail, 2)}s  ${issues.length ? '✗ ' + issues.join(', ') : '✓'}`);
  }
}
if (results.mix) {
  console.log('\n=== HEADROOM: efeitos pesados sobre música de batalha ===');
  for (const m of results.mix) {
    const bad = m.peak >= 0.99 || m.clip;
    if (bad) fail++;
    console.log(`  ${m.id.padEnd(8)} pico ${f(m.peak)}  clip ${m.clip}  RMS ${f(m.rms)}  ${bad ? '✗' : '✓'}`);
  }
}
if (results.warnings.length) {
  fail++;
  console.log('\n=== AVISOS DO PARSER ===');
  for (const w of results.warnings) console.log('  ' + w);
} else console.log('\nParser: todas as músicas com compassos corretos (0 avisos).');
if (rt) {
  console.log('\n=== TEMPO REAL ===');
  for (const [k, v] of rt) console.log(`  ${k.padEnd(8)} ${JSON.stringify(v)}`);
}
if (logs.length) {
  fail++;
  console.log('\n=== CONSOLE DO NAVEGADOR ===');
  for (const l of logs) console.log('  ' + l);
} else console.log('\nConsole do navegador: sem erros/avisos.');
console.log(fail ? `\n${fail} item(ns) com problema.` : '\nTudo ok.');
process.exit(fail ? 1 : 0);
