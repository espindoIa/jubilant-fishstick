// Trilha sonora de "Ecos da Aurora" — músicas como dados.
//
// Formato de cada música:
//   { name, key, bpm, sig:[num, den], prog (texto p/ referência), gain, reverb,
//     echo:{ beats, fb, wet, lp },              // eco SNES (tempo em batidas)
//     ch: { canal: { inst, vol, pan, echo, rev, poly, legato, strum, transpose, intro, loop } } }
// `intro` toca uma vez; `loop` repete para sempre (todos os canais devem ter o mesmo
// comprimento, ou um divisor dele). Notação: ver engine.js (parseSeq).
// Cada string de compasso é checada pelo parser (soma de durações = fórmula de compasso).

// ---------------------------------------------------------------- helpers
/** Junta compassos com barras. */
const bars = (...b) => b.flat().join(' | ');
/** Repete um compasso n vezes. */
const rep = (n, s) => Array.from({ length: n }, () => s);
/** Notas em sequência com a mesma duração: seq('D3 A3 D4', .5) → 'D3:.5 A3:.5 D4:.5'. */
const seq = (notes, d = 0.5) => notes.trim().split(/\s+/).map((n) => `${n}:${d}`).join(' ');
/** Arpejo: voicing (grave→agudo) + padrão de índices. */
const arp = (v, pat, d = 0.5) => {
  const n = v.trim().split(/\s+/);
  return pat.map((i) => `${n[i]}:${d}`).join(' ');
};
const UP8 = [0, 1, 2, 3, 4, 3, 2, 1]; // 8 colcheias em 4/4
const UP6 = [0, 1, 2, 3, 2, 1]; // 6 colcheias em 6/8 e 3/4
const ch = (notes, d, fl = '') => notes.trim().split(/\s+/).join('+') + ':' + d + fl;

// =====================================================================
// LEITMOTIF "Ecos da Aurora" (Ré maior) — usado em `title` e `ending`.
// Antecedente (A) termina em meia-cadência; consequente (A2) em cadência perfeita;
// ponte (B) passeia por IV–iii–ii–V antes de voltar.
// A : D | A/C# | Bm | F#m/A | G | D/F# | Em7 | Asus4 A          (baixo do Cânone: D C# B A G F# E A)
// A2: D | A/C# | Bm | Bm/A | G | D/F# | Em7 A7 | D
// B : Gmaj7 | F#m7 | Em7 | A7 | Gmaj7 | F#m7 | Bm7 E7 | Asus4 A
// =====================================================================
const LEIT_A = [
  'A4:1 F#5:1.5 E5:.5 D5:1', // D   — o salto de sexta ("o nascer da aurora")
  'E5:2 C#5:1 A4:1', // A/C#
  'B4:1.5 C#5:.5 D5:1 F#5:1', // Bm
  'E5:1.5 F#5:.5 E5:1 C#5:1', // F#m/A
  'B4:1 D5:1 G5:1.5 F#5:.5', // G
  'A5:2 F#5:1 D5:1', // D/F#
  'E5:1.5 D5:.5 B4:1 D5:1', // Em7
  'D5:2 C#5:2', // Asus4 → A
];
const LEIT_A2 = [
  'A4:1 F#5:1.5 E5:.5 D5:1', // D
  'E5:2 A5:1.5 G5:.5', // A/C# (A7)
  'F#5:2 D5:1 B4:1', // Bm
  'C#5:1 D5:1 E5:1 F#5:1', // Bm/A — escala subindo para o clímax
  'G5:1.5 F#5:.5 E5:1 D5:1', // G
  'F#5:1.5 E5:.5 D5:1 A4:1', // D/F#
  'B4:.5 D5:.5 E5:1 G5:1.5 C#5:.5', // Em7 | A7
  'D5:3 r:1', // D
];
const LEIT_B = [
  'r:.5 B4:.5 D5:.5 F#5:.5 A5:2', // Gmaj7
  'A5:1 G5:.5 F#5:1.5 E5:1', // F#m7
  'r:.5 B4:.5 E5:.5 G5:.5 B5:1.5 A5:.5', // Em7
  'A5:1 G5:.5 F#5:.5 E5:2', // A7
  'r:.5 B4:.5 D5:.5 F#5:.5 A5:2', // Gmaj7
  'A5:1 B5:.5 A5:.5 F#5:2', // F#m7
  'B5:1.5 A5:.5 G#5:1 E5:1', // Bm7 | E7
  'E5:1 D5:1 C#5:2', // Asus4 | A
];
// Contracanto (cordas) — linhas longas em movimento contrário.
const LEIT_CA = ['F#4:4', 'E4:4', 'D4:4', 'C#4:4', 'B3:4', 'A3:4', 'B3:2 D4:2', 'D4:2 C#4:2'];
const LEIT_CA2 = ['F#4:4', 'E4:2 C#4:2', 'D4:2 F#4:2', 'A4:2 F#4:2', 'B4:4', 'A4:4', 'G4:2 A4:1 G4:1', 'F#4:3 r:1'];
const LEIT_CB = ['F#4:4', 'E4:4', 'D4:2 G4:2', 'E4:2 G4:2', 'F#4:4', 'A4:2 C#5:2', 'D5:2 B4:1 G#4:1', 'G4:2 E4:2'];

// Harpa (5 notas por voicing) e harmonia por compasso
const HV = {
  D: 'D3 A3 D4 F#4 A4', AC: 'C#3 A3 C#4 E4 A4', Bm: 'B2 F#3 B3 D4 F#4', FmA: 'A2 F#3 A3 C#4 E4',
  G: 'G2 D3 G3 B3 D4', DF: 'F#2 D3 F#3 A3 D4', Em7: 'E2 B2 E3 G3 D4', Asus: 'A2 E3 A3 D4 E4',
  A: 'A2 E3 A3 C#4 E4', BmA: 'A2 F#3 B3 D4 F#4', A7: 'A2 E3 G3 C#4 E4', Gmaj7: 'G2 D3 F#3 B3 D4',
  Fm7: 'F#2 C#3 E3 A3 C#4', Em7b: 'E2 B2 D3 G3 B3', Bm7: 'B2 F#3 A3 D4 F#4', E7: 'E2 B2 D3 G#3 B3',
  Bb: 'Bb2 F3 Bb3 D4 F4', C: 'C3 G3 C4 E4 G4',
};
const harpBar = (v) => arp(HV[v], UP8);
const harpHalf = (v1, v2) => arp(HV[v1], [0, 1, 2, 3]) + ' ' + arp(HV[v2], [4, 3, 2, 1]);
const LEIT_HARP_A = [harpBar('D'), harpBar('AC'), harpBar('Bm'), harpBar('FmA'), harpBar('G'), harpBar('DF'), harpBar('Em7'), harpHalf('Asus', 'A')];
const LEIT_HARP_A2 = [harpBar('D'), harpBar('AC'), harpBar('Bm'), harpBar('BmA'), harpBar('G'), harpBar('DF'), harpHalf('Em7', 'A7'), harpBar('D')];
const LEIT_HARP_B = [harpBar('Gmaj7'), harpBar('Fm7'), harpBar('Em7b'), harpBar('A7'), harpBar('Gmaj7'), harpBar('Fm7'), harpHalf('Bm7', 'E7'), harpHalf('Asus', 'A')];
const LEIT_PAD_A = ['F#3+A3+D4:4', 'E3+A3+C#4:4', 'F#3+B3+D4:4', 'F#3+A3+C#4:4', 'G3+B3+D4:4', 'F#3+A3+D4:4', 'G3+B3+D4:4', 'E3+A3+D4:2 E3+A3+C#4:2'];
const LEIT_PAD_A2 = ['F#3+A3+D4:4', 'E3+A3+C#4:4', 'F#3+B3+D4:4', 'F#3+B3+D4:4', 'G3+B3+D4:4', 'F#3+A3+D4:4', 'G3+B3+D4:2 G3+A3+C#4:2', 'F#3+A3+D4:4'];
const LEIT_PAD_B = ['F#3+B3+D4:4', 'E3+A3+C#4:4', 'G3+B3+D4:4', 'E3+G3+C#4:4', 'F#3+B3+D4:4', 'E3+A3+C#4:4', 'F#3+A3+D4:2 G#3+B3+D4:2', 'A3+D4+E4:2 A3+C#4+E4:2'];
const LEIT_BASS_A = ['D3:2 A2:2', 'C#3:2 A2:2', 'B2:2 F#2:2', 'A2:2 E2:2', 'G2:2 D3:2', 'F#2:2 A2:2', 'E2:2 B2:2', 'A2:2 E2:2'];
const LEIT_BASS_A2 = ['D3:2 A2:2', 'C#3:2 A2:2', 'B2:2 F#2:2', 'A2:2 F#2:2', 'G2:2 B2:2', 'F#2:2 D2:2', 'E2:2 A2:2', 'D2:2 A2:1 D3:1'];
const LEIT_BASS_B = ['G2:2 D3:2', 'F#2:2 C#3:2', 'E2:2 B2:2', 'A2:2 E2:2', 'G2:2 D3:2', 'F#2:2 C#3:2', 'B2:2 E2:2', 'A2:4'];

export const SONGS = {
  // ===================================================================
  // TITLE — "Ecos da Aurora". Ré maior, 84 BPM, 4/4. Intro: G – A (IV–V).
  // Forma: A (antecedente) · A2 (consequente) · B (ponte). Loop 24 compassos ≈ 69 s.
  // Flauta canta o tema; cordas fazem contracanto em A2/B; harpa arpeja; sinos pontuam.
  // ===================================================================
  title: {
    name: 'Ecos da Aurora', key: 'D major', bpm: 84, sig: [4, 4], gain: 0.7,
    prog: 'intro G A | A: D A/C# Bm F#m/A G D/F# Em7 Asus4-A | A2: D A/C# Bm Bm/A G D/F# Em7-A7 D | B: Gmaj7 F#m7 Em7 A7 Gmaj7 F#m7 Bm7-E7 Asus4-A',
    echo: { beats: 0.75, fb: 0.35, wet: 0.3, lp: 2600 },
    ch: {
      lead: { inst: 'flute', vol: 1, echo: 0.35, rev: 0.3, intro: bars(rep(2, 'r:4')), loop: bars(LEIT_A, LEIT_A2, LEIT_B) },
      counter: { inst: 'strings', vol: 0.55, pan: -0.3, echo: 0.15, rev: 0.3, intro: bars(rep(2, 'r:4')), loop: bars(rep(8, 'r:4'), LEIT_CA2, LEIT_CB) },
      harp: { inst: 'harp', vol: 0.55, pan: 0.35, echo: 0.3, rev: 0.25, intro: bars(harpBar('Gmaj7'), harpBar('A')), loop: bars(LEIT_HARP_A, LEIT_HARP_A2, LEIT_HARP_B) },
      pad: { inst: 'pad', vol: 0.8, pan: -0.15, rev: 0.35, intro: bars('F#3+B3+D4:4', 'E3+A3+C#4:4'), loop: bars(LEIT_PAD_A, LEIT_PAD_A2, LEIT_PAD_B) },
      bass: { inst: 'softbass', vol: 0.8, rev: 0.05, intro: bars('G2:4', 'A2:4'), loop: bars(LEIT_BASS_A, LEIT_BASS_A2, LEIT_BASS_B) },
      bell: {
        inst: 'glock', vol: 0.45, pan: 0.45, echo: 0.5, rev: 0.4, intro: bars('r:4', 'r:2 E6:1 C#6:1'),
        loop: bars('r:4', 'r:4', 'r:4', 'r:3 C#6:1', 'r:4', 'r:4', 'r:4', 'r:2 E6:1 A6:1',
          'r:4', 'r:4', 'r:4', 'r:3 F#6:1', 'r:4', 'r:4', 'r:4', 'r:2 A5:1 D6:1',
          'r:4', 'r:4', 'r:4', 'r:2 C#6:1 E6:1', 'r:4', 'r:4', 'r:4', 'r:2 E6:1 C#6:1'),
      },
    },
  },

  // ===================================================================
  // VILLAGE — Vila Maré no Festival das Estrelas. Sol maior (toques mixolídios: Fá♮), 6/8, 100 BPM (♩.≈67).
  // A : G | C | D7 | G | Em | C | Am D7 | G
  // A2: G | C | D7 | G | Em | Am | D7 | G
  // B : C | C | G/B | G | F(♭VII) | C | Dsus4 D | D7    — pergunta (acordeão) e resposta (flauta)
  // Forma A A2 B A2 = 32 compassos ≈ 58 s. Violão "oom-pah-pah", zabumba/shaker leves.
  // ===================================================================
  village: (() => {
    const A = ['D5:1 B4:.5 G4:1 B4:.5', 'C5:1 E5:.5 G5:1 E5:.5', 'F#5:1 E5:.5 D5:1 C5:.5', 'B4:1.5 G4:1 r:.5',
      'G5:1 F#5:.5 E5:1 B4:.5', 'C5:1 E5:.5 G5:1.5', 'A5:1 G5:.5 F#5:.5 E5:.5 F#5:.5', 'G5:1.5 r:1.5'];
    const A2 = [A[0], A[1], A[2], 'B4:.5 C5:.5 D5:.5 G5:1.5', 'E5:1 G5:.5 B5:1 G5:.5', 'A5:1 G5:.5 E5:1 C5:.5',
      'A5:1 F#5:.5 D5:.5 E5:.5 F#5:.5', 'G5:1.5 r:1.5'];
    const B = ['G5:1 E5:.5 C5:1 E5:.5', 'r:3', 'D5:1 G5:.5 B5:1 G5:.5', 'r:3', 'A5:1 G5:.5 F5:1 C5:.5', 'E5:1 D5:.5 C5:1.5',
      'G5:1.5 F#5:1.5', 'A5:.5 G5:.5 F#5:.5 E5:.5 D5:.5 C5:.5'];
    const FA = ['r:3', 'r:3', 'r:3', 'r:1.5 G5:.5 A5:.5 B5:.5', 'r:3', 'r:3', 'r:3', 'r:1.5 D6:.5 B5:.5 G5:.5'];
    const FA2 = ['B4:1.5 D5:1.5', 'E5:1.5 C5:1.5', 'D5:1.5 C5:1.5', 'B4:3', 'G4:1.5 B4:1.5', 'C5:1.5 E5:1.5', 'F#5:1.5 C5:1.5', 'r:1.5 G5:.5 F#5:.5 E5:.5'];
    const FB = ['r:3', 'G5:.5 A5:.5 G5:.5 E5:.5 D5:.5 C5:.5', 'r:3', 'B5:.5 A5:.5 G5:.5 D5:.5 E5:.5 F5:.5', 'C5:1.5 A4:1.5', 'C5:1.5 E5:1.5', 'D5:1.5 A4:1.5', 'r:3'];
    const GV = { G: 'B3+D4+G4', C: 'C4+E4+G4', D7: 'A3+C4+F#4', Em: 'B3+E4+G4', Am: 'A3+C4+E4', F: 'A3+C4+F4', Dsus: 'A3+D4+G4', D: 'A3+D4+F#4' };
    const oom = (x, y = x) => `r:.5 ${GV[x]}:.5 ${GV[x]}:.5 r:.5 ${GV[y]}:.5 ${GV[y]}:.5`;
    const gA = [oom('G'), oom('C'), oom('D7'), oom('G'), oom('Em'), oom('C'), oom('Am', 'D7'), oom('G')];
    const gA2 = [oom('G'), oom('C'), oom('D7'), oom('G'), oom('Em'), oom('Am'), oom('D7'), oom('G')];
    const gB = [oom('C'), oom('C'), oom('G'), oom('G'), oom('F'), oom('C'), oom('Dsus', 'D'), oom('D7')];
    const bA = ['G2:1.5 D3:1.5', 'C3:1.5 G2:1.5', 'D3:1.5 A2:1.5', 'G2:1.5 D3:1.5', 'E2:1.5 B2:1.5', 'C3:1.5 G2:1.5', 'A2:1.5 D3:1.5', 'G2:1.5 D2:1.5'];
    const bA2 = ['G2:1.5 D3:1.5', 'C3:1.5 G2:1.5', 'D3:1.5 A2:1.5', 'G2:1.5 B2:1.5', 'E2:1.5 B2:1.5', 'A2:1.5 E3:1.5', 'D3:1.5 F#2:1.5', 'G2:1.5 D2:1.5'];
    const bB = ['C3:1.5 G2:1.5', 'C3:1.5 E3:1.5', 'B2:1.5 D3:1.5', 'G2:1.5 B2:1.5', 'F2:1.5 C3:1.5', 'C3:1.5 G2:1.5', 'D3:1.5 A2:1.5', 'D3:1.5 F#2:1.5'];
    const D1 = 'k:.5 b:.5^ b:.5^ t:.5^ b:.5^ b:.5^';
    const D2 = 'k:.5 b:.5^ b:.5^ o:.5 b:.5^ b:.5';
    const drum8 = [D1, D1, D1, D2, D1, D1, D1, D2];
    return {
      name: 'Vila Maré — Festival das Estrelas', key: 'G major (mixolydian color)', bpm: 100, sig: [6, 8], gain: 1,
      prog: 'A: G C D7 G Em C Am-D7 G | A2: G C D7 G Em Am D7 G | B: C C G/B G F C Dsus4-D D7',
      echo: { beats: 0.5, fb: 0.25, wet: 0.22, lp: 2800 },
      ch: {
        lead: { inst: 'accordion', vol: 1.6, pan: 0.05, echo: 0.2, rev: 0.2, loop: bars(A, A2, B, A2) },
        flute: { inst: 'flute', vol: 0.45, pan: -0.35, echo: 0.3, rev: 0.25, loop: bars(FA, FA2, FB, FA2) },
        guitar: { inst: 'guitar', vol: 0.5, pan: 0.3, strum: 0.012, echo: 0.1, rev: 0.15, loop: bars(gA, gA2, gB, gA2) },
        bass: { inst: 'bass', vol: 0.65, loop: bars(bA, bA2, bB, bA2) },
        drums: { inst: 'drums', vol: 0.5, pan: -0.1, rev: 0.1, loop: bars(drum8, drum8, drum8, drum8) },
        bell: { inst: 'glock', vol: 0.35, pan: 0.5, echo: 0.5, rev: 0.4, loop: bars('r:1.5 D6:.5? G6:.5? r:.5', 'r:2 B6:.5? r:.5') },
      },
    };
  })(),

  // ===================================================================
  // FOREST — Bosque Sussurrante (crepúsculo, vaga-lumes). Ré dórico (Si♮), 90 BPM, 4/4.
  // Dm9 | G6/D | Dm9 | G6/D | Fmaj7 | C/E | Bbmaj7 | Asus4 A7 |
  // Dm9 | G6/D | Dm9 | G6/D | Bbmaj7 | C | Asus4 | A7          (16 compassos ≈ 43 s + intro)
  // Ostinato de harpa, flauta misteriosa, pad quente, "vaga-lumes" de glockenspiel aleatórios.
  // ===================================================================
  forest: (() => {
    const H = {
      Dm9: 'D3 A3 C4 E4 F4 E4 C4 A3', G6: 'D3 B3 D4 E4 G4 E4 D4 B3', F7: 'F2 C3 E3 A3 C4 A3 E3 C3',
      CE: 'E2 C3 G3 C4 E4 C4 G3 C3', Bb7: 'Bb2 F3 A3 D4 F4 D4 A3 F3', AsA7: 'A2 E3 A3 D4 A2 E3 G3 C#4',
      C: 'C3 G3 C4 E4 G4 E4 C4 G3', As: 'A2 E3 A3 D4 E4 D4 A3 E3', A7: 'A2 E3 G3 C#4 E4 C#4 G3 E3',
    };
    const prog = ['Dm9', 'G6', 'Dm9', 'G6', 'F7', 'CE', 'Bb7', 'AsA7', 'Dm9', 'G6', 'Dm9', 'G6', 'Bb7', 'C', 'As', 'A7'];
    const P = {
      Dm9: 'F3+A3+C4+E4:4', G6: 'G3+B3+E4:4', F7: 'E3+A3+C4:4', CE: 'E3+G3+C4:4', Bb7: 'F3+A3+D4:4',
      AsA7: 'E3+A3+D4:2 E3+G3+C#4:2', C: 'E3+G3+C4:4', As: 'E3+A3+D4:4', A7: 'E3+G3+C#4:4',
    };
    const B = { Dm9: 'D2:4', G6: 'D2:4', F7: 'F2:4', CE: 'E2:4', Bb7: 'Bb1:4', AsA7: 'A1:4', C: 'C2:4', As: 'A1:4', A7: 'A1:4' };
    const lead = ['r:2 A4:.5 C5:.5 D5:1', 'E5:1.5 D5:.5 B4:2', 'r:1 A4:.5 C5:.5 D5:1 F5:1', 'E5:3 r:1',
      'A5:1.5 G5:.5 F5:1 E5:1', 'G5:2 E5:1 C5:1', 'F5:1 D5:1 Bb4:1 A4:1', 'E5:1 D5:1 C#5:1 E5:1',
      'r:2 A5:.5 G5:.5 F5:1', 'E5:1.5 F5:.5 G5:2', 'A5:1 F5:1 E5:1 D5:1', 'B4:3 r:1',
      'D5:1 F5:1 A5:1.5 G5:.5', 'F5:1.5 E5:.5 C5:2', 'D5:1 E5:1 A5:2', 'G5:1 E5:1 C#5:2'];
    const counter = [...rep(8, 'r:4'), 'D4:4', 'E4:2 D4:2', 'C4:4', 'D4:4', 'D4:2 F4:2', 'E4:2 G4:2', 'E4:4', 'C#4:2 E4:2'];
    return {
      name: 'Bosque Sussurrante', key: 'D dorian', bpm: 90, sig: [4, 4], gain: 0.85,
      prog: 'Dm9 G6/D Dm9 G6/D Fmaj7 C/E Bbmaj7 Asus4-A7 | Dm9 G6/D Dm9 G6/D Bbmaj7 C Asus4 A7',
      echo: { beats: 0.75, fb: 0.45, wet: 0.38, lp: 2200 },
      ch: {
        lead: { inst: 'flute', vol: 1, pan: 0.1, echo: 0.45, rev: 0.3, intro: bars(rep(2, 'r:4')), loop: bars(lead) },
        harp: { inst: 'harp', vol: 0.55, pan: -0.3, echo: 0.3, rev: 0.25, intro: bars(seq(H.Dm9), seq(H.G6)), loop: bars(prog.map((c) => seq(H[c]))) },
        counter: { inst: 'strings', vol: 0.45, pan: -0.4, echo: 0.2, rev: 0.35, intro: bars(rep(2, 'r:4')), loop: bars(counter) },
        pad: { inst: 'pad', vol: 0.75, pan: 0.2, rev: 0.4, intro: bars(P.Dm9, P.G6), loop: bars(prog.map((c) => P[c])) },
        bass: { inst: 'softbass', vol: 0.75, intro: bars('D2:4', 'D2:4'), loop: bars(prog.map((c) => B[c])) },
        fireflies: {
          inst: 'glock', vol: 0.4, pan: 0.5, echo: 0.6, rev: 0.45, intro: bars(rep(2, 'r:4')),
          loop: bars('r:1 A6:.5? r:1 E6:.5? r:1', 'r:2.5 D6:.5? r:1', 'r:.5 F6:.5? r:2 C6:.5? r:.5', 'r:3 E6:.5? r:.5'),
        },
      },
    };
  })(),

  // ===================================================================
  // CAVE — Caverna de Cristal. Mi menor (eólio, com Dó lídio = Cmaj7#11), 70 BPM, 4/4.
  // Em9 | Cmaj7#11 | Em9 | Cmaj7#11 | Am9 | Cmaj7 | Bm7 | Bsus4 B |
  // Em9 | Cmaj7#11 | Gmaj7/D | Cmaj7#11 | Am9 | D6 | Cmaj7#11 | Bsus4 B7   (16 compassos ≈ 55 s)
  // Glockenspiel esparso com eco longo, coral lento, harpa em semínimas, gotas d'água.
  // ===================================================================
  cave: (() => {
    const prog = ['Em9', 'C11', 'Em9', 'C11', 'Am9', 'C7', 'Bm7', 'BsB', 'Em9', 'C11', 'G7D', 'C11', 'Am9', 'D6', 'C11', 'BsB7'];
    const P = {
      Em9: 'G3+B3+F#4:4', C11: 'E3+B3+F#4:4', Am9: 'E3+G3+B3:4', C7: 'E3+G3+B3:4', Bm7: 'D3+F#3+A3:4',
      BsB: 'E3+F#3+B3:2 D#3+F#3+B3:2', G7D: 'F#3+B3+D4:4', D6: 'F#3+A3+B3:4', BsB7: 'E3+F#3+B3:2 D#3+F#3+A3:2',
    };
    const B = { Em9: 'E2:4', C11: 'C2:4', Am9: 'A1:4', C7: 'C2:4', Bm7: 'B1:4', BsB: 'B1:4', G7D: 'D2:4', D6: 'D2:4', BsB7: 'B1:4' };
    const H = {
      Em9: 'E3 B3 D4 F#4', C11: 'C3 G3 B3 F#4', Am9: 'A2 E3 G3 B3', C7: 'C3 G3 B3 E4', Bm7: 'B2 F#3 A3 D4',
      BsB: 'B2 E3 B2 D#3', G7D: 'D3 G3 B3 F#4', D6: 'D3 A3 B3 F#4', BsB7: 'B2 E3 A3 D#4',
    };
    const lead = ['E5:1 F#5:1 B5:2', 'r:1 G5:1 F#5:1 E5:1', 'D5:1 E5:1 B4:2', 'r:4',
      'C6:1.5 B5:.5 E5:2', 'G5:1.5 F#5:.5 E5:2', 'F#5:1 D5:1 A5:2', 'E5:2 D#5:2',
      'B5:1 A5:1 G5:1 F#5:1', 'G5:2 E5:2', 'F#5:1.5 G5:.5 D6:2', 'E6:1 B5:1 F#5:2',
      'G5:1 A5:1 B5:1 C6:1', 'B5:2 A5:1 F#5:1', 'G5:2 F#5:1 E5:1', 'E5:1 F#5:1 D#5:2'];
    return {
      name: 'Caverna de Cristal', key: 'E minor (aeolian + C lydian)', bpm: 70, sig: [4, 4], gain: 1.05, reverb: 1.4,
      prog: 'Em9 Cmaj7#11 Em9 Cmaj7#11 Am9 Cmaj7 Bm7 Bsus4-B | Em9 Cmaj7#11 Gmaj7/D Cmaj7#11 Am9 D6 Cmaj7#11 Bsus4-B7',
      echo: { beats: 1, fb: 0.55, wet: 0.45, lp: 2000 },
      ch: {
        lead: { inst: 'glock', vol: 1.45, pan: 0.15, echo: 0.6, rev: 0.45, loop: bars(lead) },
        pad: { inst: 'choir', vol: 0.8, pan: -0.2, rev: 0.5, loop: bars(prog.map((c) => P[c])) },
        harp: { inst: 'harp', vol: 0.4, pan: -0.4, echo: 0.5, rev: 0.4, loop: bars(prog.map((c) => seq(H[c], 1))) },
        bass: { inst: 'softbass', vol: 0.65, rev: 0.2, loop: bars(prog.map((c) => B[c])) },
        drops: { inst: 'drop', vol: 0.6, pan: 0.5, echo: 0.7, rev: 0.5, loop: bars('r:2.5 B5:.5? r:1', 'r:1 E6:.5? r:1.5 G5:.5? r:.5') },
      },
    };
  })(),

  // ===================================================================
  // FORT — Forte Ferrugem (forte imperial steampunk). Dó menor, 110 BPM, marcha 4/4.
  // A : Cm | Db(♭II) | Cm | G7(♭9) | Cm | Ab | Fm | G
  // A2: Cm | Db | Cm | G7(♭9) | Cm | Ab | Fm G7 | Cm
  // B : Ab | Eb/G | Fm | G | Ab | Bb | Cm | G7        (24 compassos ≈ 52 s + 1 de rufo)
  // Metais graves com filtro, "oom-pah" de metais, caixa militar, pífaro respondendo, bigorna.
  // ===================================================================
  fort: (() => {
    const A = ['C4:1.5 C4:.25 C4:.25 Eb4:1 G4:1', 'Ab4:1.5 G4:.5 F4:1 Db4:1', 'Eb4:1.5 D4:.25 C4:.25 G4:2', 'B3:1 D4:1 F4:1 Ab4:1',
      'C5:1.5 B4:.25 C5:.25 G4:2', 'Ab4:1 C5:1 Eb5:1.5 D5:.5', 'C5:1 Ab4:1 F4:1 Ab4:.5 G4:.5', 'G4:3 r:1'];
    const A2 = [A[0], A[1], A[2], 'B3:.5 D4:.5 F4:.5 Ab4:.5 B4:1 D5:1', 'Eb5:1.5 D5:.25 C5:.25 G5:2', 'Eb5:1 C5:1 Ab4:1.5 Bb4:.5',
      'C5:1 Ab4:1 B4:1 D5:1', 'C5:3 r:1'];
    const B = ['Eb5:2 C5:1 Ab4:1', 'Bb4:1.5 C5:.5 Bb4:1 G4:1', 'Ab4:1.5 G4:.5 F4:1 C5:1', 'B4:3 r:1',
      'C5:1.5 Eb5:.5 Ab5:2', 'F5:1.5 D5:.5 Bb4:2', 'G5:1 Eb5:1 C5:1 G4:1', 'G4:1 F4:.5 Eb4:.5 D4:1 B3:1'];
    const fifeA2 = ['r:4', 'r:2 F5:.5 Eb5:.5 Db5:.5 C5:.5', 'r:4', 'r:2 D5:.5 F5:.5 Ab5:.5 B5:.5',
      'C6:2 r:2', 'r:2 C6:.5 Bb5:.5 Ab5:1', 'r:4', 'r:2 G5:.5 F5:.5 Eb5:.5 D5:.5'];
    const fifeB = ['r:4', 'r:4', 'r:4', 'r:2 B4:.5 C5:.5 D5:.5 F5:.5', 'r:4', 'r:4', 'r:4', 'r:4'];
    const V = { Cm: 'Eb3+G3+C4', Db: 'F3+Ab3+Db4', G7: 'F3+Ab3+B3', Ab: 'Eb3+Ab3+C4', Fm: 'F3+Ab3+C4', G: 'D3+G3+B3', EbG: 'G3+Bb3+Eb4', Bb: 'F3+Bb3+D4', G7n: 'F3+G3+B3' };
    const pah = (x, y = x) => `r:1 ${V[x]}:.5 r:1.5 ${V[y]}:.5 r:.5`;
    const oom = (r, f) => `${r}:.8 r:1.2 ${f}:.8 r:1.2`;
    const stA = [pah('Cm'), pah('Db'), pah('Cm'), pah('G7'), pah('Cm'), pah('Ab'), pah('Fm'), pah('G')];
    const stA2 = [pah('Cm'), pah('Db'), pah('Cm'), pah('G7'), pah('Cm'), pah('Ab'), pah('Fm', 'G7n'), pah('Cm')];
    const stB = [pah('Ab'), pah('EbG'), pah('Fm'), pah('G'), pah('Ab'), pah('Bb'), pah('Cm'), pah('G7n')];
    const bA = [oom('C2', 'G2'), oom('Db2', 'Ab2'), oom('C2', 'G2'), oom('G2', 'D2'), oom('C2', 'G2'), oom('Ab2', 'Eb2'), oom('F2', 'C2'), oom('G2', 'D2')];
    const bA2 = [...bA.slice(0, 6), oom('F2', 'G2'), oom('C2', 'G2')];
    const bB = [oom('Ab2', 'Eb2'), oom('G2', 'Eb2'), oom('F2', 'C2'), oom('G2', 'D2'), oom('Ab2', 'Eb2'), oom('Bb2', 'F2'), oom('C2', 'G2'), oom('G2', 'B1')];
    const M = 'k:.5 s:.25^ s:.25^ s:.5! r:.5 k:.5 s:.25^ s:.25^ s:.5! r:.5';
    const MA = 'k:.5 s:.25^ s:.25^ s:.5! r:.5 k:.5 s:.25^ s:.25^ s:.5! a:.5';
    const ROLL = 'k:.5 s:.25^ s:.25^ s:.5! r:.5 s:.25^ s:.25^ s:.25 s:.25 s:.25 s:.25 s:.25! s:.25!';
    const MO = 'k+o:.5 s:.25^ s:.25^ s:.5! r:.5 k:.5 s:.25^ s:.25^ s:.5! r:.5';
    const drums8 = [MO, M, M, MA, M, M, M, ROLL];
    const timp = ['C3:1! r:3', 'r:4', 'r:4', 'G2:1 r:3', 'C3:1! r:3', 'r:4', 'r:4', 'G2:.5 G2:.5 G2:.5 G2:.5 r:2'];
    return {
      name: 'Forte Ferrugem', key: 'C minor', bpm: 110, sig: [4, 4], gain: 1.15,
      prog: 'A: Cm Db Cm G7b9 Cm Ab Fm G | A2: Cm Db Cm G7b9 Cm Ab Fm-G7 Cm | B: Ab Eb/G Fm G Ab Bb Cm G7',
      echo: { beats: 0.25, fb: 0.2, wet: 0.18, lp: 2400 },
      ch: {
        lead: { inst: 'brass', vol: 1, pan: 0.05, echo: 0.2, rev: 0.2, intro: 'r:4', loop: bars(A, A2, B) },
        fife: { inst: 'fife', vol: 0.75, pan: 0.4, echo: 0.3, rev: 0.2, intro: 'r:4', loop: bars(rep(8, 'r:4'), fifeA2, fifeB) },
        stab: { inst: 'stab', vol: 0.8, pan: -0.25, rev: 0.15, intro: 'r:4', loop: bars(stA, stA2, stB) },
        bass: { inst: 'bass', vol: 0.8, intro: 'C2:1 r:3', loop: bars(bA, bA2, bB) },
        timp: { inst: 'timp', vol: 0.7, pan: -0.3, rev: 0.25, intro: 'r:4', loop: bars(timp, timp, rep(8, 'r:4')) },
        drums: {
          inst: 'drums', vol: 0.6, pan: 0.1, rev: 0.12, intro: 's:.25^ s:.25^ s:.25^ s:.25^ s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25! s:.25! s:.25! s:.25!',
          loop: bars(drums8, drums8, drums8),
        },
      },
    };
  })(),

  // ===================================================================
  // BATTLE — Batalha comum. Lá menor, 150 BPM, 4/4. Intro de 2 compassos (rufo + subida cromática).
  // A: Am | F | G | E | Am | F | G | E
  // B: F | G | Em | Am | Dm | G | Esus4 | E          (o "refrão heroico")
  // C: Am | Am | F | F | Dm | E | F | E7             (síncope 3+3+2, pergunta/resposta)
  // 24 compassos ≈ 38 s. Baixo em oitavas, comp de pulso no contratempo, bateria marcada.
  // ===================================================================
  battle: (() => {
    const A = ['A4:.5 C5:.5 E5:1.5 D5:.5 C5:.5 D5:.5', 'E5:1.5 C5:.5 A4:2', 'B4:.5 D5:.5 G5:1.5 F5:.5 E5:.5 D5:.5', 'E5:2 G#4:1 B4:1',
      'A4:.5 C5:.5 E5:1.5 D5:.5 C5:.5 E5:.5', 'A5:1.5 G5:.5 F5:1 C5:1', 'G5:1 F5:.5 E5:.5 D5:1 B4:1', 'E5:1.5 E5:.5 G#5:1 B5:1'];
    const B = ['C5:1 F5:1 A5:1.5 G5:.5', 'G5:1 D5:1 B4:1.5 D5:.5', 'E5:1 G5:1 B5:1.5 A5:.5', 'A5:2 E5:1 C5:1',
      'D5:1 F5:1 A5:1 D6:1', 'B5:1.5 A5:.5 G5:1 D5:1', 'A5:2 B5:2', 'G#5:3 r:1'];
    const C = ['E5:.75 E5:.75 D5:.5 E5:1 r:1', 'C5:.75 D5:.75 E5:.5 A5:2', 'G5:.75 F5:.75 E5:.5 F5:1 r:1', 'A5:.75 G5:.75 F5:.5 C5:2',
      'D5:.75 E5:.75 F5:.5 A5:1 D6:1', 'B5:.75 G#5:.75 E5:.5 B4:2', 'C5:.5 D5:.5 E5:.5 F5:.5 G5:.5 A5:.5 B5:.5 C6:.5', 'B5:2 G#5:1 E5:1'];
    const counter = [...rep(8, 'r:4'),
      'F4:4', 'G4:2 B4:2', 'B4:2 G4:2', 'C5:2 E5:2', 'F4:2 A4:2', 'D5:2 B4:2', 'E5:4', 'E5:2 D5:2',
      'r:3 A4:.5 B4:.5', 'r:4', 'r:3 C5:.5 D5:.5', 'r:4', 'r:4', 'r:4', 'r:4', 'r:4'];
    const oct = (a, b, c, d) => `${a}:.5 ${b}:.5 ${a}:.5 ${b}:.5 ${a}:.5 ${b}:.5 ${c}:.5 ${d}:.5`;
    const Bs = {
      Am: oct('A2', 'A3', 'G3', 'E3'), F: oct('F2', 'F3', 'E3', 'C3'), G: oct('G2', 'G3', 'F3', 'D3'),
      E: 'E2:.5 E3:.5 E2:.5 E3:.5 G#2:.5 G#3:.5 B2:.5 B3:.5', Em: oct('E2', 'E3', 'D3', 'B2'),
      Dm: oct('D2', 'D3', 'C3', 'A2'), Es: oct('E2', 'E3', 'E2', 'E3'),
    };
    const syn = (r, o, x) => `${r}:.75 ${r}:.75 ${r}:.5 ${r}:.75 ${o}:.75 ${x}:.5`;
    const bassC = [syn('A2', 'A3', 'G3'), syn('A2', 'A3', 'G3'), syn('F2', 'F3', 'E3'), syn('F2', 'F3', 'E3'),
      syn('D2', 'D3', 'C3'), syn('E2', 'E3', 'D3'), syn('F2', 'F3', 'E3'), syn('E2', 'E3', 'D3')];
    const V = { Am: 'C4+E4+A4', F: 'C4+F4+A4', G: 'B3+D4+G4', E: 'B3+E4+G#4', Em: 'B3+E4+G4', Dm: 'D4+F4+A4', Es: 'B3+E4+A4', E7: 'B3+D4+G#4' };
    const off = (x) => `r:.5 ${V[x]}:.5 r:.5 ${V[x]}:.5 r:.5 ${V[x]}:.5 r:.5 ${V[x]}:.5`;
    const stab = (x) => `${V[x]}:.5 r:1 ${V[x]}:.5 r:1 ${V[x]}:.5 r:.5`;
    const DR = 'k+h:.5 h:.5 s+h:.5 k+h:.5 k+h:.5 h:.5 s+h:.5 h:.5';
    const DC = 'k+c:.5 h:.5 s+h:.5 k+h:.5 k+h:.5 h:.5 s+h:.5 h:.5';
    const DF = 'k+h:.5 h:.5 s+h:.5 k:.5 s:.25 s:.25 s:.25 s:.25 T:.25 T:.25 m:.25 t:.25';
    const DS = 'k+h:.5 h:.5 s+h:.5 k+h:.5 h:.5 k+h:.5 s+h:.5 h:.5';
    const DSC = 'k+c:.5 h:.5 s+h:.5 k+h:.5 h:.5 k+h:.5 s+h:.5 h:.5';
    return {
      name: 'Batalha!', key: 'A minor', bpm: 150, sig: [4, 4], gain: 1.12,
      prog: 'intro E | A: Am F G E Am F G E | B: F G Em Am Dm G Esus4 E | C: Am Am F F Dm E F E7',
      echo: { beats: 0.5, fb: 0.22, wet: 0.18, lp: 2600 },
      ch: {
        lead: { inst: 'lead', vol: 1.3, pan: 0.05, echo: 0.25, rev: 0.15, intro: bars('r:4', 'E5:.5 F5:.5 F#5:.5 G5:.5 G#5:2'), loop: bars(A, B, C) },
        counter: { inst: 'brass', vol: 0.6, pan: -0.35, echo: 0.15, rev: 0.2, intro: bars('r:4', 'r:2 B4:2'), loop: bars(counter) },
        comp: {
          inst: 'comp', vol: 0.6, pan: 0.35, rev: 0.1, intro: bars('r:4', 'r:4'),
          loop: bars(['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'Es', 'E'].map(off), ['Am', 'Am', 'F', 'F', 'Dm', 'E', 'F', 'E7'].map(stab)),
        },
        bass: {
          inst: 'synbass', vol: 0.85, intro: bars('A2:.5 A2:.5 r:1 A2:.5 A2:.5 r:1', 'E2:.5 E3:.5 E2:.5 E3:.5 E2:.5 E3:.5 G#2:.5 B2:.5'),
          loop: bars(['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'Es', 'E'].map((c) => Bs[c]), bassC),
        },
        drums: {
          inst: 'drums', vol: 0.62, rev: 0.08,
          intro: bars('k+c:1! s:.25 s:.25 s:.25 s:.25 T:.5 T:.5 m:.5 t:.5', 'k:.5 s:.25^ s:.25^ s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25 s:.25! s:.25! s:.25! s:.25!'),
          loop: bars(DC, rep(6, DR), DF, DC, rep(6, DR), DF, DSC, rep(6, DS), DF),
        },
      },
    };
  })(),

  // ===================================================================
  // BOSS — Chefe. Ré menor harmônico, 160 BPM, 4/4, síncope 3+3+2. Intro: Dm(maj7) → Eb → A7 + tímpanos.
  // A: Dm | Eb(♭II napolitano) | Dm | A7 | Bb | C7 | A7(♭13) | A7
  // B: Dm | Dm/C | Bbmaj7 | A7 | Gm | Gm/F | Eb | A7(♭9)       (baixo em lamento descendente)
  // C: Dm | Dm | Bb | Bb | Gm | A7 | Bb C | A7                    (metais chamam, órgão responde)
  // 24 compassos ≈ 36 s.
  // ===================================================================
  boss: (() => {
    const A = ['D5:1.5 F5:1.5 E5:1', 'Eb5:1.5 Bb4:1.5 G5:1', 'F5:1.5 A5:1.5 G5:.5 F5:.5', 'E5:1.5 C#5:1.5 A4:1',
      'D5:.5 F5:.5 Bb5:1 A5:.5 G5:.5 F5:1', 'E5:.5 G5:.5 C6:1 Bb5:.5 A5:.5 G5:1', 'A5:1.5 G5:.5 F5:.5 E5:.5 C#5:1', 'E5:1 r:.5 E5:.5 F5:.5 G5:.5 A5:1'];
    const B = ['A5:3 G5:.5 F5:.5', 'F5:2 E5:1 D5:1', 'D5:1.5 E5:.5 F5:2', 'E5:3 r:1',
      'Bb5:3 A5:.5 G5:.5', 'A5:2 G5:1 F5:1', 'G5:1.5 F5:.5 Eb5:2', 'C#5:1 E5:1 G5:1 Bb5:1'];
    const C = ['D5:.5 D5:.5 r:.5 F5:.5 r:.5 E5:.5 D5:.5 C#5:.5', 'r:4', 'F5:.5 F5:.5 r:.5 Bb5:.5 r:.5 A5:.5 G5:.5 F5:.5', 'r:4',
      'G5:.5 Bb5:.5 D6:1 C6:.5 Bb5:.5 A5:1', 'G5:.5 F5:.5 E5:1 C#5:1 A4:1', 'D5:1 F5:1 E5:1 G5:1', 'A5:2 G5:1 E5:1'];
    const V = { Dm: 'D4+F4+A4', Eb: 'Eb4+G4+Bb4', A7: 'C#4+E4+G4', Bb: 'D4+F4+Bb4', C7: 'C4+E4+Bb4', DmC: 'C4+F4+A4', Bbm7: 'D4+F4+A4', Gm: 'D4+G4+Bb4', A7b9: 'C#4+G4+Bb4', C: 'C4+E4+G4' };
    const S = (x) => `${V[x]}:.5 r:1 ${V[x]}:.5 r:1 ${V[x]}:.5 r:.5`;
    const organ = [
      ...['Dm', 'Eb', 'Dm', 'A7', 'Bb', 'C7', 'A7', 'A7'].map(S),
      ...['Dm', 'DmC', 'Bbm7', 'A7', 'Gm', 'Gm', 'Eb', 'A7b9'].map(S),
      S('Dm'), 'D4+F4+A4:.5! D4+F4+A4:.5 r:.5 F4+A4+D5:.5! r:.5 E4+G4+C#5:.5 F4+A4+D5:.5 E4+G4+C#5:.5',
      S('Bb'), 'D4+F4+Bb4:.5! D4+F4+Bb4:.5 r:.5 F4+Bb4+D5:.5! r:.5 F4+A4+C5:.5 D4+F4+Bb4:.5 C4+F4+A4:.5',
      S('Gm'), S('A7'), 'D4+F4+Bb4:.5 r:1 D4+F4+Bb4:.5 C4+E4+G4:.5 r:1 C4+E4+G4:.5', S('A7'),
    ];
    const o8 = (lo, hi, a = lo, b = hi) => `${lo}:.5 ${hi}:.5 ${lo}:.5 ${hi}:.5 ${lo}:.5 ${hi}:.5 ${a}:.5 ${b}:.5`;
    const bass = [
      o8('D2', 'D3'), o8('Eb2', 'Eb3'), o8('D2', 'D3'), o8('A1', 'A2'), o8('Bb1', 'Bb2'), o8('C2', 'C3'), o8('A1', 'A2'), o8('A1', 'A2', 'C#2', 'C#3'),
      o8('D2', 'D3'), o8('C2', 'C3'), o8('Bb1', 'Bb2'), o8('A1', 'A2'), o8('G1', 'G2'), o8('F1', 'F2'), o8('Eb2', 'Eb3'), o8('A1', 'A2', 'C#2', 'C#3'),
      o8('D2', 'D3'), o8('D2', 'D3', 'C2', 'C3'), o8('Bb1', 'Bb2'), o8('Bb1', 'Bb2', 'A1', 'A2'), o8('G1', 'G2'), o8('A1', 'A2'), 'Bb1:.5 Bb2:.5 Bb1:.5 Bb2:.5 C2:.5 C3:.5 C2:.5 C3:.5', o8('A1', 'A2', 'C#2', 'C#3'),
    ];
    const DA = 'k+h:.5 h:.5 s+h:.5 k+h:.5 h:.5 k+h:.5 s+h:.5 h:.5';
    const DAC = 'k+c:.5 h:.5 s+h:.5 k+h:.5 h:.5 k+h:.5 s+h:.5 h:.5';
    const DB = 'k+h:.5 h:.5 s+h:.5 h:.5 k+h:.5 k+h:.5 s+h:.5 h:.5';
    const DF = 'k+h:.5 h:.5 s+h:.5 k+h:.5 s:.25 s:.25 T:.25 T:.25 m:.25 m:.25 t:.25 t:.25';
    const timp8 = ['D3:1! r:3', 'r:4', 'D3:1 r:3', 'A2:1! r:1 A2:.5 A2:.5 A2:1', 'r:4', 'r:4', 'A2:1 r:3', seq('A2 A2 A2 A2 A2 A2 A2 A2', 0.25) + ' r:2'];
    return {
      name: 'Batalha contra o Chefe', key: 'D minor (harmonic)', bpm: 160, sig: [4, 4], gain: 1.08,
      prog: 'intro Dm(maj7) Eb-A7 | A: Dm Eb Dm A7 Bb C7 A7 A7 | B: Dm Dm/C Bbmaj7 A7 Gm Gm/F Eb A7b9 | C: Dm Dm Bb Bb Gm A7 Bb-C A7',
      echo: { beats: 0.75, fb: 0.28, wet: 0.18, lp: 2400 },
      ch: {
        lead: { inst: 'brass', vol: 1.25, pan: 0.05, echo: 0.2, rev: 0.15, intro: bars('r:4', 'r:4'), loop: bars(A, B, C) },
        organ: { inst: 'organ', vol: 0.75, pan: -0.3, echo: 0.1, rev: 0.15, intro: bars('D4+F4+A4+C#5:4', 'Eb4+G4+Bb4:2 C#4+E4+G4+A4:2'), loop: bars(organ) },
        bass: { inst: 'synbass', vol: 0.85, intro: bars('D2:4', 'Eb2:2 A1:2'), loop: bars(bass) },
        timp: { inst: 'timp', vol: 0.65, pan: 0.3, rev: 0.2, intro: bars(seq('D3 D3 D3 D3 D3 D3 D3 D3', 0.25) + ' ' + seq('D3 D3 D3 D3 D3 D3 D3 D3', 0.25), 'A2:1! r:3'), loop: bars(timp8, rep(8, 'r:4'), timp8) },
        drums: {
          inst: 'drums', vol: 0.62, rev: 0.08, intro: bars('r:4', 'r:2 s:.25 s:.25 s:.25 s:.25 T:.25 T:.25 t:.25 t:.25'),
          loop: bars(DAC, rep(6, DA), DF, DAC, rep(6, DB), DF, DAC, rep(6, DA), DF),
        },
      },
    };
  })(),

  // ===================================================================
  // VICTORY — Fanfarra (3 compassos ≈ 6 s) e depois vamp calmo de 8 compassos. Dó maior, 120 BPM.
  // Fanfarra: C | Ab Bb (♭VI–♭VII) | C
  // Vamp: Cmaj7 | Am7 | Dm7 | G7 | Cmaj7 | Am7 | Dm7 G7 | C6     (16 s por volta)
  // ===================================================================
  victory: (() => {
    const VL = ['G5:1.5 E5:.5 C5:1 D5:1', 'E5:2 r:1 C5:.5 D5:.5', 'F5:1.5 E5:.5 D5:1 A4:1', 'B4:1 D5:1 G5:1 F5:1',
      'E5:1.5 D5:.5 C5:1 G4:1', 'A4:1 C5:1 E5:1 G5:1', 'F5:1 A5:1 G5:1 F5:1', 'E5:2 r:2'];
    const H = {
      C: 'C3 G3 B3 E4 G4 E4 B3 G3', Am: 'A2 E3 G3 C4 E4 C4 G3 E3', Dm: 'D3 A3 C4 F4 A4 F4 C4 A3',
      G7: 'G2 D3 F3 B3 D4 B3 F3 D3', DmG: 'D3 A3 C4 F4 G2 D3 F3 B3', C6: 'C3 G3 A3 E4 G4 E4 A3 G3',
    };
    const prog = ['C', 'Am', 'Dm', 'G7', 'C', 'Am', 'DmG', 'C6'];
    const P = { C: 'E3+G3+B3:4', Am: 'E3+G3+C4:4', Dm: 'F3+A3+C4:4', G7: 'F3+B3+D4:4', DmG: 'F3+A3+C4:2 F3+B3+D4:2', C6: 'E3+G3+A3+C4:4' };
    const bass = ['C3:1 E3:1 G3:1 E3:1', 'A2:1 C3:1 E3:1 C3:1', 'D3:1 F3:1 A3:1 F3:1', 'G3:1 F3:1 D3:1 B2:1',
      'C3:1 E3:1 G3:1 E3:1', 'A2:1 C3:1 E3:1 C3:1', 'D3:1 F3:1 G2:1 B2:1', 'C3:2 G2:2'];
    const DV = 'k:1^ h:.5^ h:.5^ x:1^ h:.5^ h:.5^';
    return {
      name: 'Vitória', key: 'C major', bpm: 120, sig: [4, 4], gain: 1,
      prog: 'fanfare C | Ab-Bb | C — vamp: Cmaj7 Am7 Dm7 G7 Cmaj7 Am7 Dm7-G7 C6',
      echo: { beats: 0.5, fb: 0.3, wet: 0.22, lp: 2800 },
      ch: {
        fan: { inst: 'fanfare', vol: 1, pan: 0.1, echo: 0.2, rev: 0.25, intro: bars('G4:1/3 C5:1/3 E5:1/3 G5:1.5 E5:.5 G5:1', 'C5:.5 Eb5:.5 Ab5:1 D5:.5 F5:.5 Bb5:1', 'C6:3 r:1'), loop: bars(rep(8, 'r:4')) },
        fan2: { inst: 'brass', vol: 0.75, pan: -0.25, echo: 0.15, rev: 0.25, intro: bars('E4:1/3 G4:1/3 C5:1/3 E5:1.5 C5:.5 E5:1', 'Ab4:.5 C5:.5 Eb5:1 Bb4:.5 D5:.5 F5:1', 'G5:3 r:1'), loop: bars(rep(8, 'r:4')) },
        lead: { inst: 'flute', vol: 0.95, pan: 0.05, echo: 0.3, rev: 0.25, intro: bars(rep(3, 'r:4')), loop: bars(VL) },
        harp: { inst: 'harp', vol: 0.55, pan: 0.35, echo: 0.25, rev: 0.25, intro: bars(rep(3, 'r:4')), loop: bars(prog.map((c) => seq(H[c]))) },
        pad: { inst: 'pad', vol: 0.7, pan: -0.2, rev: 0.35, intro: bars('C4+E4+G4:4', 'C4+Eb4+Ab4:2 D4+F4+Bb4:2', 'C4+E4+G4:3 r:1'), loop: bars(prog.map((c) => P[c])) },
        bass: { inst: 'bass', vol: 0.7, intro: bars('C3:1 r:1 C3:1 r:1', 'Ab2:2 Bb2:2', 'C3:3 r:1'), loop: bars(bass) },
        timp: { inst: 'timp', vol: 0.6, pan: -0.3, rev: 0.2, intro: bars('C3:1! r:1 G2:1 r:1', 'Ab2:2 ' + seq('Bb2 Bb2 Bb2 Bb2 Bb2 Bb2 Bb2 Bb2', 0.25), 'C3:1! r:3'), loop: bars(rep(8, 'r:4')) },
        drums: {
          inst: 'drums', vol: 0.5, rev: 0.12,
          intro: bars('c+k:1! r:1 s:.25 s:.25 s:.25 s:.25 k:1', 'k:1 s:1 k:1 s:.25 s:.25 s:.25 s:.25', 'c+k:1! r:3'),
          loop: bars(rep(8, DV)),
        },
      },
    };
  })(),

  // ===================================================================
  // SAD — Tema da perda (sequestro). Sol menor, 66 BPM, 4/4.
  // Gm | Eb | Bb/D | Cm | Gm/Bb | Cm | D7sus4 | D7 |
  // Eb | F | Bb | Gm | Cm | Am7b5 | D7 | Gm            (16 compassos ≈ 58 s)
  // Violino solo com vibrato (suspiros Eb→D), piano em arpejos, cordas graves, segundo violino em B.
  // ===================================================================
  sad: (() => {
    const L = ['G4:1 Bb4:1 D5:1.5 C5:.5', 'Bb4:2 G4:1 Eb5:1', 'D5:1.5 C5:.5 Bb4:1 F4:1', 'Eb5:2 D5:2',
      'G4:1 Bb4:1 D5:1 G5:1', 'G5:1.5 F5:.5 Eb5:1 C5:1', 'C5:1 Bb4:1 A4:1 G4:1', 'F#4:3 r:1',
      'G5:1.5 F5:.5 Eb5:1 Bb4:1', 'A4:1 C5:1 F5:1.5 Eb5:.5', 'D5:2 F5:1 Bb5:1', 'Bb5:1.5 A5:.5 G5:2',
      'G5:1.5 Eb5:.5 C5:1 Eb5:1', 'Eb5:1.5 D5:.5 C5:2', 'C5:1 A4:1 F#4:1 A4:1', 'G4:3 r:1'];
    const H = {
      Gm: 'G2 D3 G3 Bb3 D4 Bb3 G3 D3', Eb: 'Eb2 Bb2 Eb3 G3 Bb3 G3 Eb3 Bb2', BbD: 'D2 Bb2 D3 F3 Bb3 F3 D3 Bb2',
      Cm: 'C2 G2 C3 Eb3 G3 Eb3 C3 G2', GmBb: 'Bb1 G2 Bb2 D3 G3 D3 Bb2 G2', D7s: 'D2 A2 C3 G3 A3 G3 C3 A2',
      D7: 'D2 A2 C3 F#3 A3 F#3 C3 A2', F: 'F2 C3 F3 A3 C4 A3 F3 C3', Bb: 'Bb1 F2 Bb2 D3 F3 D3 Bb2 F2',
      Am7b5: 'A2 Eb3 G3 C4 Eb4 C4 G3 Eb3',
    };
    const prog = ['Gm', 'Eb', 'BbD', 'Cm', 'GmBb', 'Cm', 'D7s', 'D7', 'Eb', 'F', 'Bb', 'Gm', 'Cm', 'Am7b5', 'D7', 'Gm'];
    const P = {
      Gm: 'G3+Bb3+D4:4', Eb: 'G3+Bb3+Eb4:4', BbD: 'F3+Bb3+D4:4', Cm: 'G3+C4+Eb4:4', GmBb: 'G3+Bb3+D4:4', D7s: 'G3+A3+C4:4',
      D7: 'F#3+A3+C4:4', F: 'F3+A3+C4:4', Bb: 'F3+Bb3+D4:4', Am7b5: 'G3+C4+Eb4:4',
    };
    const bass = ['G2:4', 'Eb2:4', 'D2:4', 'C2:4', 'Bb1:4', 'C2:4', 'D2:4', 'D2:4', 'Eb2:4', 'F2:4', 'Bb1:4', 'G2:4', 'C2:4', 'A1:4', 'D2:4', 'G2:4'];
    const viola = [...rep(8, 'r:4'), 'Eb4:4', 'F4:2 Eb4:2', 'D4:4', 'G4:4', 'Eb4:2 G4:2', 'Eb4:4', 'D4:2 C4:2', 'Bb3:3 r:1'];
    return {
      name: 'Lágrimas na Maré', key: 'G minor', bpm: 66, sig: [4, 4], gain: 1.05,
      prog: 'Gm Eb Bb/D Cm Gm/Bb Cm D7sus4 D7 | Eb F Bb Gm Cm Am7b5 D7 Gm',
      echo: { beats: 0.75, fb: 0.38, wet: 0.3, lp: 2200 },
      ch: {
        lead: { inst: 'strings', vol: 1.4, pan: 0.05, echo: 0.3, rev: 0.4, loop: bars(L) },
        viola: { inst: 'strings', vol: 0.6, pan: -0.35, echo: 0.15, rev: 0.4, loop: bars(viola) },
        piano: { inst: 'piano', vol: 0.6, pan: 0.3, echo: 0.2, rev: 0.3, loop: bars(prog.map((c) => seq(H[c]))) },
        pad: { inst: 'pad', vol: 0.75, pan: -0.15, rev: 0.4, loop: bars(prog.map((c) => P[c])) },
        bass: { inst: 'softbass', vol: 0.7, rev: 0.1, loop: bars(bass) },
      },
    };
  })(),

  // ===================================================================
  // STAR — Tema de Estela. Fá maior, 3/4, 80 BPM. Celesta/caixinha de música.
  // F | Am/E | Dm | F/C | Bb | F/A | Gm7 | C7 |
  // F | A7/E | Dm | Bbm(iv emprestado) | F/C | D7 | Gm7 C7 | F      (16 compassos ≈ 36 s)
  // ===================================================================
  star: (() => {
    const L = ['C6:1.5 A5:.5 F5:1', 'G5:1 E5:1 C5:1', 'D5:1.5 E5:.5 F5:1', 'A5:3',
      'Bb5:1.5 A5:.5 G5:1', 'F5:1 A5:1 C6:1', 'D6:1.5 C6:.5 Bb5:1', 'G5:2 E5:1',
      'C6:1.5 A5:.5 F5:1', 'E5:1 G5:1 C#6:1', 'D6:2 A5:1', 'Db6:1.5 C6:.5 Bb5:1',
      'A5:1.5 G5:.5 F5:1', 'F#5:1 A5:1 C6:1', 'Bb5:1 A5:.5 G5:.5 E5:1', 'F5:3'];
    const H = {
      F: 'F3 C4 F4 A4 F4 C4', AmE: 'E3 C4 E4 A4 E4 C4', Dm: 'D3 A3 D4 F4 D4 A3', FC: 'C3 A3 C4 F4 C4 A3',
      Bb: 'Bb2 F3 Bb3 D4 Bb3 F3', FA: 'A2 F3 A3 C4 A3 F3', Gm7: 'G2 D3 F3 Bb3 F3 D3', C7: 'C3 G3 Bb3 E4 Bb3 G3',
      A7E: 'E3 A3 C#4 G4 C#4 A3', Bbm: 'Bb2 F3 Bb3 Db4 Bb3 F3', D7: 'D3 A3 C4 F#4 C4 A3', GmC: 'G2 D3 F3 Bb3 C3 E3',
    };
    const prog = ['F', 'AmE', 'Dm', 'FC', 'Bb', 'FA', 'Gm7', 'C7', 'F', 'A7E', 'Dm', 'Bbm', 'FC', 'D7', 'GmC', 'F'];
    const P = {
      F: 'A3+C4+F4:3', AmE: 'A3+C4+E4:3', Dm: 'A3+D4+F4:3', FC: 'A3+C4+F4:3', Bb: 'Bb3+D4+F4:3', FA: 'A3+C4+F4:3',
      Gm7: 'Bb3+D4+F4:3', C7: 'Bb3+E4+G4:3', A7E: 'G3+C#4+E4:3', Bbm: 'Bb3+Db4+F4:3', D7: 'A3+C4+F#4:3', GmC: 'Bb3+D4+F4:2 Bb3+E4+G4:1',
    };
    const bass = ['F2:3', 'E2:3', 'D2:3', 'C2:3', 'Bb1:3', 'A1:3', 'G1:3', 'C2:3', 'F2:3', 'E2:3', 'D2:3', 'Bb1:3', 'C2:3', 'D2:3', 'G1:2 C2:1', 'F2:3'];
    return {
      name: 'Estela', key: 'F major', bpm: 80, sig: [3, 4], gain: 1.05,
      prog: 'F Am/E Dm F/C Bb F/A Gm7 C7 | F A7/E Dm Bbm F/C D7 Gm7-C7 F',
      echo: { beats: 0.75, fb: 0.48, wet: 0.4, lp: 2600 },
      ch: {
        lead: { inst: 'celesta', vol: 1.5, pan: 0.1, echo: 0.55, rev: 0.4, loop: bars(L) },
        harp: { inst: 'harp', vol: 0.5, pan: -0.35, echo: 0.3, rev: 0.3, loop: bars(prog.map((c) => seq(H[c]))) },
        pad: { inst: 'choir', vol: 0.85, pan: 0.2, rev: 0.5, loop: bars(prog.map((c) => P[c])) },
        bass: { inst: 'softbass', vol: 0.6, rev: 0.1, loop: bars(bass) },
        stars: { inst: 'glock', vol: 0.35, pan: -0.5, echo: 0.6, rev: 0.5, loop: bars('r:1 C7:.5? r:1.5', 'r:2 A6:.5? F6:.5?') },
      },
    };
  })(),

  // ===================================================================
  // ENDING — Reprise grandiosa do leitmotif. Ré maior, 76 BPM, 4/4.
  // Intro: rufo de tímpano D → A7. Loop: A (cordas) · B (flauta) · A2 (cordas + trompas em oitava,
  // tímpanos, prato) · coda Bb | C (♭VI–♭VII → I). 26 compassos ≈ 82 s.
  // ===================================================================
  ending: (() => {
    const timpA2 = ['D3:1! r:3', 'A2:1 r:3', 'B2:1 r:3', 'A2:1 r:3', 'G2:1 r:3', 'D3:1 r:3', 'A2:1 r:1 A2:1 r:1', 'D3:1! r:3'];
    const timpCoda = ['Bb2:1! r:1 ' + seq('Bb2 Bb2 Bb2 Bb2', 0.25) + ' Bb2:1', seq('C3 C3 C3 C3 C3 C3 C3 C3 C3 C3 C3 C3', 0.25) + ' C3:1!'];
    return {
      name: 'Ecos da Aurora — Finale', key: 'D major', bpm: 76, sig: [4, 4], gain: 0.95,
      prog: 'intro D A7 | A: D A/C# Bm F#m/A G D/F# Em7 Asus4-A | B: Gmaj7 F#m7 Em7 A7 Gmaj7 F#m7 Bm7-E7 Asus4-A | A2: D A/C# Bm Bm/A G D/F# Em7-A7 D | coda Bb C',
      echo: { beats: 0.75, fb: 0.38, wet: 0.28, lp: 2400 },
      ch: {
        lead: { inst: 'strings', vol: 2.0, pan: 0.05, echo: 0.3, rev: 0.4, intro: bars(rep(2, 'r:4')), loop: bars(LEIT_A, rep(8, 'r:4'), LEIT_A2, 'D5:2 F5:2', 'G5:3 r:1') },
        flute: { inst: 'flute', vol: 1, pan: 0.15, echo: 0.35, rev: 0.35, intro: bars(rep(2, 'r:4')), loop: bars(rep(8, 'r:4'), LEIT_B, rep(10, 'r:4')) },
        horn: { inst: 'brass', vol: 0.75, pan: -0.25, transpose: -12, echo: 0.15, rev: 0.35, intro: bars(rep(2, 'r:4')), loop: bars(rep(16, 'r:4'), LEIT_A2, 'Bb4:2 D5:2', 'E5:3 r:1') },
        counter: { inst: 'strings', vol: 0.45, pan: -0.35, echo: 0.15, rev: 0.4, intro: bars(rep(2, 'r:4')), loop: bars(LEIT_CA, LEIT_CB, LEIT_CA2, 'F4:2 Bb4:2', 'C5:2 G4:1 A4:1') },
        harp: { inst: 'harp', vol: 0.45, pan: 0.35, echo: 0.3, rev: 0.3, intro: bars(harpBar('D'), harpBar('A7')), loop: bars(LEIT_HARP_A, LEIT_HARP_B, LEIT_HARP_A2, harpBar('Bb'), harpBar('C')) },
        pad: { inst: 'pad', vol: 0.7, pan: -0.1, rev: 0.4, intro: bars('F#3+A3+D4:4', 'G3+A3+C#4+E4:4'), loop: bars(LEIT_PAD_A, LEIT_PAD_B, LEIT_PAD_A2, 'F3+Bb3+D4:4', 'G3+C4+E4:4') },
        bass: { inst: 'softbass', vol: 0.85, rev: 0.1, intro: bars('D2:4', 'A1:4'), loop: bars(LEIT_BASS_A, LEIT_BASS_B, LEIT_BASS_A2, 'Bb1:2 Bb2:2', 'C2:2 C3:2') },
        timp: {
          inst: 'timp', vol: 0.65, pan: 0.25, rev: 0.3,
          intro: bars(seq('D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3 D3', 0.25), seq('A2 A2 A2 A2 A2 A2 A2 A2 A2 A2 A2 A2', 0.25) + ' r:1'),
          loop: bars(rep(16, 'r:4'), timpA2, timpCoda),
        },
        drums: {
          inst: 'drums', vol: 0.5, rev: 0.3, intro: bars('r:4', 'r:4'),
          loop: bars('c:4^', rep(14, 'r:4'), 'r:2 ' + seq('s s s s', 0.25).replace(/:0\.25/g, ':.25^') + ' ' + seq('s s s s', 0.25), 'c:4!', rep(7, 'r:4'), 'c:4', 'r:4'),
        },
      },
    };
  })(),
};

/** Lista de ids de músicas. */
export const SONG_IDS = Object.keys(SONGS);
