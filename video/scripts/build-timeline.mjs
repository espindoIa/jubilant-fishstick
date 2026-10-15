// Monta src/data/timeline.json a partir do roteiro.
// - Com voz: usa os tempos por caractere devolvidos pela ElevenLabs (public/audio/voz/<bloco>.json).
// - Sem voz: estima tempos de leitura (texto na tela).
// Uso: node scripts/build-timeline.mjs [--report]
import fs from "node:fs";

const FPS = 30;
const TOTAL_S = 120;
const LEAD_S = 0.35; // respiro antes da primeira fala
const TAIL_S = 2.6; // tela final sem narração
const MIN_GAP_S = 0.45;
const roteiro = JSON.parse(fs.readFileSync("src/data/roteiro.json", "utf8"));

// Tokeniza "src" em tokens de legenda {display, spoken}
export function tokenize(src) {
  const out = [];
  const re = /\[([^|\]]+)\|([^\]]+)\]|(\S+)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[3]) out.push({ display: m[3], spoken: m[3] });
    else out.push({ display: m[1], spoken: m[2] });
  }
  return out;
}
export const spokenText = (tokens) => tokens.map((t) => t.spoken).join(" ");

// Estimativa de duração (sem voz): ~0,07 s por letra + pausas de pontuação
function estimate(tokens) {
  let t = 0;
  return tokens.map((tok) => {
    const letters = tok.spoken.replace(/[^\p{L}\p{N}]/gu, "").length;
    const d = 0.06 + letters * 0.058;
    const w = { startMs: t * 1000, endMs: (t + d) * 1000 };
    t += d;
    if (/[.!?]$/.test(tok.spoken)) t += 0.42;
    else if (/[,:;]$/.test(tok.spoken)) t += 0.2;
    else t += 0.04;
    return w;
  });
}

// Converte o alinhamento por caractere da ElevenLabs em tempos por token
function fromAlignment(tokens, al) {
  const chars = al.characters;
  const st = al.character_start_times_seconds;
  const en = al.character_end_times_seconds;
  const text = chars.join("");
  const expected = spokenText(tokens);
  if (text.trim() !== expected.trim()) {
    throw new Error(`Texto do alinhamento difere do roteiro:\n${text}\n${expected}`);
  }
  let pos = text.indexOf(expected.trim()[0]);
  return tokens.map((tok) => {
    const i0 = text.indexOf(tok.spoken, pos);
    const i1 = i0 + tok.spoken.length - 1;
    pos = i1 + 1;
    // ignora pontuação final para o fim da palavra
    let j = i1;
    while (j > i0 && /[^\p{L}\p{N}]/u.test(chars[j])) j--;
    return { startMs: st[i0] * 1000, endMs: en[j] * 1000 };
  });
}

// Tempos por token a partir das palavras faladas já ajustadas (uma ou mais por token)
function fromWords(tokens, ws) {
  let n = 0;
  return tokens.map((tok) => {
    const k = tok.spoken.split(/\s+/).length;
    const part = ws.slice(n, n + k);
    n += k;
    if (part.length !== k) throw new Error(`palavras ajustadas não batem com o roteiro em «${tok.spoken}»`);
    return { startMs: part[0].s * 1000, endMs: part[k - 1].e * 1000 };
  });
}

const blocks = [];
for (const b of roteiro.blocks) {
  const tokens = tokenize(b.src);
  const alPath = `public/audio/voz/${b.id}.json`;
  let words, durS, audio = null;
  if (fs.existsSync(alPath)) {
    const al = JSON.parse(fs.readFileSync(alPath, "utf8"));
    // tempos ajustados à onda (scripts/ajustar-tempos.py) quando existem
    words = al.words ? fromWords(tokens, al.words) : fromAlignment(tokens, al.alignment);
    durS = al.durationS;
    audio = `audio/voz/${b.id}.mp3`;
  } else {
    words = estimate(tokens);
    durS = words[words.length - 1].endMs / 1000 + 0.15;
  }
  blocks.push({ ...b, tokens, words, durS, audio });
}

const speechS = blocks.reduce((a, b) => a + b.durS, 0);
const free = TOTAL_S - LEAD_S - TAIL_S - speechS;
const nGaps = blocks.length - 1;
if (free < nGaps * MIN_GAP_S) {
  throw new Error(`Narração longa demais: ${speechS.toFixed(2)} s de fala; sobra ${free.toFixed(2)} s.`);
}
let gap = free / nGaps;
let tail = TAIL_S;
// pausas longas demais soam vazias: limita a 1,1 s e manda o resto para o final
// (sem voz, a pausa pode ser maior: é tempo de leitura das telas)
const MAX_GAP = blocks.every((b) => b.audio) ? 1.1 : 1.9;
if (gap > MAX_GAP) {
  tail += (gap - MAX_GAP) * nGaps;
  gap = MAX_GAP;
}

const timeline = { fps: FPS, durationInFrames: TOTAL_S * FPS, hasVoice: blocks.every((b) => b.audio), words: [], beats: [], audio: [], blocks: [] };
let t = LEAD_S;
for (const b of blocks) {
  const off = t * 1000;
  const firstWord = timeline.words.length;
  b.tokens.forEach((tok, i) => {
    timeline.words.push({
      text: tok.display,
      startMs: Math.round(off + b.words[i].startMs),
      endMs: Math.round(off + b.words[i].endMs),
      block: b.id,
      sentenceEnd: /[.!?]["”]?$/.test(tok.display),
      clauseEnd: /[,:;]["”]?$/.test(tok.display),
    });
  });
  if (b.audio) timeline.audio.push({ src: b.audio, fromFrame: Math.round(t * FPS), block: b.id });
  timeline.blocks.push({ id: b.id, startMs: Math.round(off), endMs: Math.round(off + b.durS * 1000), firstWord, lastWord: timeline.words.length - 1 });
  for (const beat of b.beats) {
    if (beat.at >= b.tokens.length) throw new Error(`beat ${beat.type} fora do bloco ${b.id}`);
    const w = timeline.words[firstWord + beat.at];
    timeline.beats.push({ type: beat.type, block: b.id, word: b.tokens[beat.at].display, startMs: w.startMs - 120 });
  }
  t += b.durS + gap;
}
timeline.beats[0].startMs = 0;
// cada tela vai até a próxima; a última até o fim
timeline.beats.forEach((bt, i) => {
  const next = timeline.beats[i + 1];
  bt.endMs = next ? next.startMs : TOTAL_S * 1000;
  bt.from = Math.round((bt.startMs / 1000) * FPS);
  bt.durationInFrames = Math.round((bt.endMs / 1000) * FPS) - bt.from;
});

// Páginas de legenda: no máximo 7 palavras e ~2 linhas, quebrando em frases e
// dividindo frases longas em pedaços equilibrados (preferindo vírgulas, sem órfãs).
const MAX_WORDS = 7;
const MAX_CHARS = 36; // ~2 linhas de ~18 caracteres a 66 px
const len = (idx) => idx.map((k) => timeline.words[k].text).join(" ").length;
const pages = [];
let sentence = [];
const splitSentence = (idx) => {
  if (idx.length <= MAX_WORDS && len(idx) <= MAX_CHARS) return [idx];
  // DP: minimiza desequilíbrio, premia quebras após pontuação, pune páginas curtas
  const n = idx.length;
  const best = new Array(n + 1).fill(Infinity);
  const prev = new Array(n + 1).fill(-1);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let i = Math.max(0, j - MAX_WORDS); i < j; i++) {
      const seg = idx.slice(i, j);
      const c = len(seg);
      if (c > MAX_CHARS) continue;
      const last = timeline.words[seg[seg.length - 1]];
      let cost = Math.pow(MAX_CHARS - c, 2) * 0.05 + 10;
      if (j < n && !last.clauseEnd) cost += 12;
      if (seg.length === 1) cost += 60;
      if (best[i] + cost < best[j]) {
        best[j] = best[i] + cost;
        prev[j] = i;
      }
    }
  }
  const out = [];
  for (let j = n; j > 0; j = prev[j]) out.unshift(idx.slice(prev[j], j));
  return out;
};
timeline.words.forEach((w, i) => {
  const p = timeline.words[i - 1];
  if (p && p.block !== w.block && sentence.length) {
    pages.push(...splitSentence(sentence));
    sentence = [];
  }
  sentence.push(i);
  if (w.sentenceEnd) {
    pages.push(...splitSentence(sentence));
    sentence = [];
  }
});
if (sentence.length) pages.push(...splitSentence(sentence));
// junta frases muito curtas com a seguinte quando cabem (ex.: "deus." sozinho)
for (let i = 0; i < pages.length - 1; i++) {
  const a = pages[i], b = pages[i + 1];
  const sameBlock = timeline.words[a[0]].block === timeline.words[b[0]].block;
  if (sameBlock && (a.length <= 2 || b.length <= 1) && a.length + b.length <= MAX_WORDS && len([...a, ...b]) <= MAX_CHARS) {
    pages.splice(i, 2, [...a, ...b]);
    i--;
  }
}
timeline.pages = pages.map((idx, i) => {
  const startMs = timeline.words[idx[0]].startMs;
  const lastEnd = timeline.words[idx[idx.length - 1]].endMs;
  const nextStart = pages[i + 1] ? timeline.words[pages[i + 1][0]].startMs : lastEnd + 600;
  // a página fica até a próxima começar, e some quando a última palavra termina
  // (início e fim da legenda colados ao áudio: tolerância de 150 ms)
  const hold = timeline.hasVoice ? 0 : 600;
  return { words: idx, startMs, endMs: Math.min(nextStart, lastEnd + hold) };
});

fs.writeFileSync("src/data/timeline.json", JSON.stringify(timeline, null, 1));

const nWords = timeline.words.reduce((a, w) => a + w.text.split(/\s+/).length, 0);
const spokenWords = blocks.reduce((a, b) => a + spokenText(b.tokens).split(/\s+/).length, 0);
console.log(`voz: ${timeline.hasVoice ? "sim" : "NÃO (estimativa)"} | fala ${speechS.toFixed(2)} s | pausa entre blocos ${gap.toFixed(2)} s | final ${tail.toFixed(2)} s`);
console.log(`palavras faladas: ${spokenWords} | tokens de legenda: ${nWords} | páginas: ${timeline.pages.length} | telas: ${timeline.beats.length}`);
if (process.argv.includes("--report")) {
  for (const bt of timeline.beats) console.log(`${(bt.startMs / 1000).toFixed(2).padStart(7)}s  ${(bt.durationInFrames / FPS).toFixed(2).padStart(5)}s  ${bt.type.padEnd(18)} «${bt.word}»`);
  for (const p of timeline.pages) console.log(`  [${(p.startMs / 1000).toFixed(2)}–${(p.endMs / 1000).toFixed(2)}] ${p.words.map((k) => timeline.words[k].text).join(" ")}`);
}
