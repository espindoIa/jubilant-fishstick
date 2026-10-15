// Mixagem final com ffmpeg: voz (se houver) + trilha ~18 dB abaixo da voz,
// normalização em 2 passadas para ~-14 LUFS e pico real abaixo de -1 dBTP,
// depois junta ao vídeo renderizado sem áudio.
// Uso: node scripts/mix.mjs out/video-mudo.mp4 ../out/tiktok-lingua-sumeria.mp4
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const [videoIn, videoOut] = process.argv.slice(2);
const TOTAL = 120;
const MUSIC_BELOW_VOICE_DB = 18;
const tl = JSON.parse(fs.readFileSync("src/data/timeline.json", "utf8"));
const tmp = "out/mix";
fs.mkdirSync(tmp, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const stderrOf = (args) => spawnSync("ffmpeg", args, { encoding: "utf8" }).stderr;
// loudness integrada e pico real (resumo final do filtro ebur128)
const ebur = (file) => {
  const r = stderrOf(["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const sum = r.slice(r.lastIndexOf("Summary:"));
  return { I: Number(sum.match(/I:\s+(-?[\d.]+) LUFS/)[1]), P: Number(sum.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]) };
};

const hasVoice = tl.hasVoice && tl.audio.length > 0;
const music = "public/audio/trilha.wav";
let pre = `${tmp}/pre.wav`;

if (hasVoice) {
  // trilha de voz posicionada pelos tempos do timeline
  const inputs = tl.audio.flatMap((a) => ["-i", `public/${a.src}`]);
  const delays = tl.audio
    .map((a, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round((a.fromFrame / 30) * 1000)}:all=1[v${i}]`)
    .join(";");
  const mixIn = tl.audio.map((_, i) => `[v${i}]`).join("");
  ff([...inputs, "-filter_complex", `${delays};${mixIn}amix=inputs=${tl.audio.length}:normalize=0,apad,atrim=0:${TOTAL}[out]`, "-map", "[out]", "-ar", "48000", `${tmp}/voz.wav`]);
  const v = ebur(`${tmp}/voz.wav`);
  const m = ebur(music);
  // +DUCK_COMP compensa a queda média do ducking, para o resultado ficar ~18 dB abaixo
  const DUCK_COMP = Number(process.env.DUCK_COMP ?? 9);
  const musicGain = v.I - MUSIC_BELOW_VOICE_DB - m.I + DUCK_COMP;
  console.log(`voz ${v.I} LUFS | trilha ${m.I} LUFS → ganho da trilha ${musicGain.toFixed(1)} dB (alvo ${MUSIC_BELOW_VOICE_DB} dB abaixo)`);
  // trilha com ganho fixo (-18 dB da voz) + ducking leve guiado pela voz (sidechain),
  // para a voz ficar acima da trilha também nos finais de palavra e nas batidas do tambor.
  // A chave do sidechain vai 80 ms adiantada (lookahead): a trilha já baixa quando a fala começa.
  ff(["-i", music, "-i", `${tmp}/voz.wav`, "-filter_complex", `[0:a]volume=${musicGain.toFixed(2)}dB,aresample=48000,atrim=0:${TOTAL}[m];[1:a]aresample=48000,atrim=start=0.08,asetpts=PTS-STARTPTS[k];[m][k]sidechaincompress=threshold=0.008:ratio=3:attack=10:release=900:makeup=1[out]`, "-map", "[out]", "-ar", "48000", `${tmp}/trilha-no-mix.wav`]);
  const md = ebur(`${tmp}/trilha-no-mix.wav`);
  console.log(`trilha no mix (com ducking): ${md.I} LUFS → ${(v.I - md.I).toFixed(1)} dB abaixo da voz`);
  ff(["-i", `${tmp}/voz.wav`, "-i", `${tmp}/trilha-no-mix.wav`, "-filter_complex", `[0:a][1:a]amix=inputs=2:normalize=0,atrim=0:${TOTAL}[out]`, "-map", "[out]", "-ar", "48000", pre]);
  // voz sempre acima da trilha? (janelas de 400 ms com fala)
  const acima = spawnSync("python3", ["-I", "scripts/voz-acima.py", `${tmp}/voz.wav`, `${tmp}/trilha-no-mix.wav`], { encoding: "utf8" });
  console.log(`voz × trilha: ${acima.stdout.trim()}`);
  fs.writeFileSync(`${tmp}/voz-acima.json`, acima.stdout);
} else {
  console.log("sem voz: só a trilha");
  ff(["-i", music, "-af", `atrim=0:${TOTAL}`, pre]);
}

// loudnorm em 2 passadas (linear) para -14 LUFS / -1.5 dBTP
const pass1 = stderrOf(["-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
const j = JSON.parse(pass1.slice(pass1.lastIndexOf("{"), pass1.lastIndexOf("}") + 1));
const ln = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
ff(["-i", pre, "-af", `${ln},aresample=48000`, "-ar", "48000", `${tmp}/final.wav`]);
const fin = ebur(`${tmp}/final.wav`);
console.log(`mix final: ${fin.I} LUFS integrado, pico real ${fin.P} dBTP`);

fs.mkdirSync(videoOut.split("/").slice(0, -1).join("/") || ".", { recursive: true });
ff(["-i", videoIn, "-i", `${tmp}/final.wav`, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(TOTAL), "-movflags", "+faststart", videoOut]);
console.log(`→ ${videoOut}`);
