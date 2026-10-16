// ============================================================================
// AUDIO — chiptune sintetizado com Web Audio. Melodias originais.
// Notas: "D5:2" = nota D5 por 2 colcheias; "-:2" = pausa.
// ============================================================================
var AUDIO = (function () {
  'use strict';
  var ctx = null, master = null, musicBus = null, sfxBus = null, muted = false;
  var track = null, nextTime = 0, step = 0, timer = null, trackName = null;

  var TRACKS = {
    vesper: { bpm: 92, lead: 'D5:2 F5:1 A5:1 G5:2 F5:2 E5:3 D5:1 C5:2 A4:2 A#4:2 D5:1 F5:1 E5:2 C5:2 D5:6 -:2 ' +
      'F5:2 A5:1 C6:1 A#5:2 A5:2 G5:3 F5:1 E5:2 C5:2 D5:2 E5:1 F5:1 G5:2 E5:2 D5:6 -:2',
      bass: 'D3:4 A2:4 C3:4 A2:4 A#2:4 F2:4 D3:4 A2:4 F2:4 C3:4 G2:4 C3:4 A#2:4 A2:4 D3:8', leadVol: 0.05, wave: 'square' },
    batalha: { bpm: 150, lead: 'A4:1 C5:1 E5:1 A5:1 G5:2 E5:2 F5:1 E5:1 D5:1 C5:1 D5:2 B4:2 C5:1 E5:1 G5:1 C6:1 B5:2 G5:2 A5:3 E5:1 A5:4 ' +
      'F5:2 A5:2 G5:2 E5:2 F5:1 E5:1 D5:1 F5:1 E5:4 D5:2 F5:2 E5:2 C5:2 B4:2 C5:1 D5:1 E5:4',
      bass: 'A2:1 A3:1 A2:1 A3:1 A2:1 A3:1 A2:1 A3:1 D3:1 D4:1 D3:1 D4:1 D3:1 D4:1 D3:1 D4:1 C3:1 C4:1 C3:1 C4:1 C3:1 C4:1 C3:1 C4:1 A2:1 A3:1 A2:1 A3:1 A2:1 A3:1 A2:1 A3:1 ' +
        'F2:1 F3:1 F2:1 F3:1 F2:1 F3:1 F2:1 F3:1 D3:1 D4:1 D3:1 D4:1 D3:1 D4:1 D3:1 D4:1 G2:1 G3:1 G2:1 G3:1 G2:1 G3:1 G2:1 G3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 G#2:1 B2:1',
      leadVol: 0.045, wave: 'square' },
    chefe: { bpm: 168, lead: 'E5:1 F5:1 E5:1 B4:1 E5:2 G5:2 F5:1 E5:1 D5:1 C5:1 B4:4 E5:1 F5:1 G5:1 A5:1 A#5:2 A5:2 G5:1 F5:1 E5:1 F5:1 E5:4 ' +
      'B5:2 A5:1 G5:1 F5:2 E5:2 F5:1 G5:1 A5:1 G5:1 F5:4 E5:1 F5:1 G5:1 B5:1 C6:2 B5:2 A5:1 G5:1 F5:1 D5:1 E5:4',
      bass: 'E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 F2:1 F3:1 F2:1 F3:1 F2:1 F3:1 F2:1 F3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 D2:1 D3:1 D2:1 D3:1 F2:1 F3:1 F2:1 F3:1 ' +
        'E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 D2:1 D3:1 D2:1 D3:1 D2:1 D3:1 D2:1 D3:1 C2:1 C3:1 C2:1 C3:1 C2:1 C3:1 C2:1 C3:1 B1:1 B2:1 B1:1 B2:1 F2:1 F3:1 F2:1 F3:1',
      leadVol: 0.045, wave: 'sawtooth' }
  };

  var NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) {
    var m = n.match(/^([A-G]#?)(\d)$/);
    if (!m) return 0;
    var midi = 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function parse(str) {
    return str.trim().split(/\s+/).map(function (t) { var p = t.split(':'); return { f: p[0] === '-' ? 0 : freq(p[0]), len: parseFloat(p[1]) }; });
  }
  Object.keys(TRACKS).forEach(function (k) { var t = TRACKS[k]; t.L = parse(t.lead); t.B = parse(t.bass); });

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
        musicBus = ctx.createGain(); musicBus.gain.value = 0.8; musicBus.connect(master);
        sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
      } catch (e) { ctx = null; return false; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* ignora */ } }
    return true;
  }

  function tone(f, t, dur, type, vol, bus, slide) {
    if (!ctx || !f) return;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  var noiseBuf = null;
  function noise(t, dur, vol, hp) {
    if (!ctx) return;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp || 800;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur);
  }

  var SFX = {
    cursor: function (t) { tone(880, t, 0.05, 'square', 0.05); },
    select: function (t) { tone(660, t, 0.05, 'square', 0.06); tone(990, t + 0.05, 0.07, 'square', 0.06); },
    deny: function (t) { tone(180, t, 0.12, 'square', 0.06); },
    swing: function (t) { noise(t, 0.08, 0.12, 2000); },
    hit: function (t) { noise(t, 0.1, 0.25, 600); tone(160, t, 0.08, 'square', 0.08, null, 60); },
    crit: function (t) { noise(t, 0.16, 0.3, 400); tone(320, t, 0.14, 'square', 0.1, null, 80); },
    magic: function (t) { for (var i = 0; i < 4; i++) tone(500 + i * 180, t + i * 0.035, 0.08, 'triangle', 0.07); },
    heal: function (t) { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, t + i * 0.05, 0.12, 'triangle', 0.07); }); },
    tech: function (t) { [392, 523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, t + i * 0.04, 0.14, 'square', 0.06); }); noise(t + 0.2, 0.25, 0.15, 1500); },
    ko: function (t) { tone(400, t, 0.35, 'square', 0.07, null, 60); },
    item: function (t) { tone(784, t, 0.06, 'square', 0.06); tone(1175, t + 0.07, 0.1, 'square', 0.06); },
    level: function (t) { [523, 659, 784, 1046, 784, 1046].forEach(function (f, i) { tone(f, t + i * 0.07, 0.1, 'square', 0.06); }); },
    victory: function (t) { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, t + i * 0.1, 0.12, 'square', 0.07); }); tone(784, t + 0.45, 0.15, 'square', 0.07); tone(1046, t + 0.62, 0.5, 'square', 0.07); },
    defeat: function (t) { [440, 392, 349, 330].forEach(function (f, i) { tone(f, t + i * 0.22, 0.3, 'triangle', 0.08); }); },
    boss: function (t) { tone(110, t, 0.6, 'sawtooth', 0.08, null, 55); noise(t, 0.5, 0.12, 200); },
    bell: function (t) { tone(1320, t, 0.6, 'triangle', 0.06); tone(1980, t, 0.4, 'sine', 0.03); }
  };

  function sfx(name) {
    if (muted || !ensure() || !SFX[name]) return;
    try { SFX[name](ctx.currentTime + 0.005); } catch (e) { /* ignora */ }
  }

  function schedule() {
    if (!ctx || !track) return;
    var spb = 60 / track.bpm / 2; // segundos por colcheia
    while (nextTime < ctx.currentTime + 0.25) {
      // step conta colcheias; toca as notas que começam neste passo
      [['L', track.wave, track.leadVol, 0.9], ['B', 'triangle', 0.09, 0.95]].forEach(function (v) {
        var seq = track[v[0]], total = seq.reduce(function (s, n) { return s + n.len; }, 0);
        var pos = step % total, acc = 0;
        for (var i = 0; i < seq.length; i++) {
          if (acc === pos) { if (seq[i].f) tone(seq[i].f, nextTime, seq[i].len * spb * v[3], v[1], v[2], musicBus); break; }
          acc += seq[i].len; if (acc > pos) break;
        }
      });
      nextTime += spb; step++;
    }
  }
  function music(name) {
    if (trackName === name) return;
    trackName = name;
    track = TRACKS[name] || null;
    step = 0;
    if (!ctx) return;
    nextTime = ctx.currentTime + 0.05;
    if (!timer) timer = setInterval(schedule, 60);
  }
  function unlock() {
    if (!ensure()) return;
    if (track && !timer) { nextTime = ctx.currentTime + 0.05; timer = setInterval(schedule, 60); }
  }
  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 1;
  }
  return { sfx: sfx, music: music, unlock: unlock, setMuted: setMuted, isMuted: function () { return muted; } };
})();
