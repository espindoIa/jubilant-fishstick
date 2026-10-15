// Gera quadros de verificação: para cada tela, um quadro no meio e um perto do fim.
// Uso: node scripts/stills.mjs <pasta-saida> [--debug] [--only=tipo1,tipo2]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2];
const debug = process.argv.includes("--debug");
const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });
const timeline = JSON.parse(fs.readFileSync("src/data/timeline.json", "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { safeAreaDebug: debug };
const composition = await selectComposition({ serveUrl, id: "TikTokSumerio", inputProps });
let n = 0;
for (const [i, b] of timeline.beats.entries()) {
  if (only.length && !only.includes(b.type)) continue;
  const frames = [b.from + Math.round(b.durationInFrames * 0.45), b.from + b.durationInFrames - 8];
  for (const [k, frame] of frames.entries()) {
    const file = path.join(outDir, `${String(i).padStart(2, "0")}-${b.type}-${k ? "fim" : "meio"}.png`);
    await renderStill({ composition, serveUrl, output: file, frame, inputProps });
    n++;
  }
}
console.log(`${n} quadros em ${outDir}`);
