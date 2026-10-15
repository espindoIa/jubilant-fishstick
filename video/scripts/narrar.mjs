// Narração pt-BR com ElevenLabs (endpoint with-timestamps), bloco a bloco, com
// request stitching para manter a prosódia. Usa o preset "narrator" da skill
// elevenlabs-remotion (estabilidade 0.65, similaridade 0.8, estilo 0.15).
// Saída: public/audio/voz/<bloco>.mp3 + <bloco>.json { alignment, durationS, text, voice }
//
// Uso: node scripts/narrar.mjs [--voice=Brian] [--speed=0.95] [--only=bloco1,bloco2] [--force] [--dry]
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `=${d ?? ""}`).split("=")[1];
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force"); // refaz os blocos de --only mesmo sem mudança de texto (nova tomada)
const VOICE = arg("voice", "Brian");
const SPEED = Number(arg("speed", "0.95"));
const ONLY = arg("only", "").split(",").filter(Boolean);
const MODEL = "eleven_multilingual_v2";
// Preset "narrator" da skill (0.65/0.8/0.15) na 1ª versão; na 2ª, voz mais dinâmica
// (testada em frase curta: mais variação de f0 e 2,95 pal/s): --stability=0.35 --style=0.5 --speed=1.05
const PRESET = { stability: Number(arg("stability", "0.65")), similarity_boost: 0.8, style: Number(arg("style", "0.15")), use_speaker_boost: true };

if (!process.env.ELEVENLABS_API_KEY && fs.existsSync(".env.local")) {
  for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = l.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+)\s*$/);
    if (m) process.env.ELEVENLABS_API_KEY = m[1].replace(/^["']|["']$/g, "");
  }
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY ausente: o vídeo segue sem voz (texto na tela).");
  process.exit(2);
}

const api = async (path, opts = {}) => {
  const r = await fetch(`https://api.elevenlabs.io${path}`, {
    ...opts,
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ${await r.text()}`);
  return r;
};

// texto falado de cada bloco (mesma tokenização do build-timeline)
const tokenize = (src) => {
  const out = [];
  const re = /\[([^|\]]+)\|([^\]]+)\]|(\S+)/g;
  let m;
  while ((m = re.exec(src))) out.push(m[3] ?? m[2]);
  return out.join(" ");
};
const roteiro = JSON.parse(fs.readFileSync("src/data/roteiro.json", "utf8"));
const blocks = roteiro.blocks.map((b) => ({ id: b.id, text: tokenize(b.src) }));
const todo = blocks.filter((b) => !ONLY.length || ONLY.includes(b.id));
const need = todo.reduce((a, b) => a + b.text.length, 0);

// 1) limite do plano gratuito
const sub = await (await api("/v1/user/subscription")).json();
const left = sub.character_limit - sub.character_count;
console.log(`plano: ${sub.tier} | usados ${sub.character_count}/${sub.character_limit} | restam ${left} | este pedido: ${need}`);
if (need > left) throw new Error("Pedido passaria do limite do plano: abortado.");

// 2) voz (pré-definida, disponível no plano gratuito)
const voices = (await (await api("/v1/voices")).json()).voices;
const voice = voices.find((v) => v.voice_id === VOICE || v.name.toLowerCase().startsWith(VOICE.toLowerCase()));
if (!voice) throw new Error(`voz ${VOICE} não encontrada. Disponíveis: ${voices.map((v) => v.name).join(", ")}`);
console.log(`voz: ${voice.name} (${voice.voice_id}) ${JSON.stringify(voice.labels ?? {})}`);
if (DRY) process.exit(0);

// 3) geração com tempos por caractere
fs.mkdirSync("public/audio/voz", { recursive: true });
const prevIds = [];
for (const [i, b] of blocks.entries()) {
  const jsonPath = `public/audio/voz/${b.id}.json`;
  const hash = crypto.createHash("sha1").update(`${b.text}|${voice.voice_id}|${SPEED}|${PRESET.stability}|${PRESET.style}`).digest("hex");
  if (!todo.includes(b) || (!FORCE && fs.existsSync(jsonPath) && JSON.parse(fs.readFileSync(jsonPath, "utf8")).hash === hash)) {
    const old = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : null;
    if (old?.requestId) prevIds.push(old.requestId);
    continue;
  }
  const body = {
    text: b.text,
    model_id: MODEL,
    voice_settings: { ...PRESET, speed: SPEED },
    previous_request_ids: prevIds.slice(-3),
    next_text: blocks[i + 1]?.text,
  };
  const r = await api(`/v1/text-to-speech/${voice.voice_id}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const requestId = r.headers.get("request-id");
  const data = await r.json();
  const mp3 = `public/audio/voz/${b.id}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
  const durationS = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).toString().trim(),
  );
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ id: b.id, text: b.text, voice: voice.name, voiceId: voice.voice_id, speed: SPEED, stability: PRESET.stability, style: PRESET.style, model: MODEL, hash, requestId, durationS, alignment: data.alignment }, null, 1),
  );
  if (requestId) prevIds.push(requestId);
  console.log(`✓ ${b.id}: ${durationS.toFixed(2)} s (${b.text.length} caracteres)`);
}
const after = await (await api("/v1/user/subscription")).json();
console.log(`restam ${after.character_limit - after.character_count} caracteres no plano`);
