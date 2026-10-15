// Mede o ritmo do vídeo a partir de src/data/timeline.json:
// palavras/s por bloco (fala contínua: da 1ª à última palavra), pausas entre blocos,
// intervalo entre trocas de tela e palavras por página de legenda.
// Uso: node scripts/medir-ritmo.mjs
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("src/data/timeline.json", "utf8"));
const r = JSON.parse(fs.readFileSync("src/data/roteiro.json", "utf8"));
const re = /\[([^|\]]+)\|([^\]]+)\]|(\S+)/g;
console.log("bloco          palavras  fala(s)  pal/s");
const linhas = [];
for (const b of tl.blocks) {
  const src = r.blocks.find((x) => x.id === b.id).src;
  let n = 0;
  for (const m of src.matchAll(re)) n += (m[3] ?? m[2]).split(/\s+/).length;
  const ini = tl.words[b.firstWord].startMs, fim = tl.words[b.lastWord].endMs;
  const wps = n / ((fim - ini) / 1000);
  linhas.push({ bloco: b.id, palavras: n, fala_s: +((fim - ini) / 1000).toFixed(2), pal_s: +wps.toFixed(2) });
  console.log(`${b.id.padEnd(14)} ${String(n).padStart(8)} ${((fim - ini) / 1000).toFixed(2).padStart(8)} ${wps.toFixed(2).padStart(6)}`);
}
const pausas = tl.blocks.slice(1).map((b, i) => (tl.words[b.firstWord].startMs - tl.words[tl.blocks[i].lastWord].endMs) / 1000);
const telas = tl.beats.map((b) => b.durationInFrames / tl.fps);
const pal = tl.pages.map((p) => p.words.length);
// mudanças visuais = cortes de tela + eventos internos declarados no roteiro (beats[].eventos),
// que as cenas disparam na palavra indicada (wordFrame); intervalo entre mudanças consecutivas
const evs = [0];
for (const b of r.blocks) {
  const tb = tl.blocks.find((x) => x.id === b.id);
  for (const bt of b.beats) {
    for (const idx of [bt.at, ...(bt.eventos ?? [])]) evs.push(tl.words[tb.firstWord + idx].startMs / 1000);
  }
}
evs.push(tl.durationInFrames / tl.fps);
evs.sort((a, b) => a - b);
const inter = evs.slice(1).map((t, i) => t - evs[i]).filter((d) => d > 0.05);
const total = linhas.reduce((a, l) => a + l.palavras, 0);
const res = {
  palavras_faladas: total,
  pal_s_global: +(total / linhas.reduce((a, l) => a + l.fala_s, 0)).toFixed(2),
  pausas_entre_blocos_s: { min: +Math.min(...pausas).toFixed(2), max: +Math.max(...pausas).toFixed(2) },
  telas: { n: telas.length, min_s: +Math.min(...telas).toFixed(2), max_s: +Math.max(...telas).toFixed(2), media_s: +(telas.reduce((a, b) => a + b, 0) / telas.length).toFixed(2), fora_2a4s: telas.filter((t) => t < 2 || t > 4).length },
  mudancas_visuais: { n: inter.length, min_s: +Math.min(...inter).toFixed(2), max_s: +Math.max(...inter).toFixed(2), media_s: +(inter.reduce((a, b) => a + b, 0) / inter.length).toFixed(2), acima_de_4s: inter.filter((d) => d > 4).map((d, i) => +d.toFixed(2)), abaixo_de_2s: inter.filter((d) => d < 2).length },
  legendas: { paginas: pal.length, max_palavras: Math.max(...pal) },
};
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync("src/data/ritmo.json", JSON.stringify({ blocos: linhas, ...res }, null, 1));
