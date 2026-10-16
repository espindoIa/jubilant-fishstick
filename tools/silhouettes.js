// Teste de silhueta: cada heroína e cada chefe preenchidos de uma só cor
// devem ser distintos. Mede IoU (interseção/união) das máscaras alinhadas
// pela base e pelo centro, e gera uma folha PNG para inspeção visual.
// Uso: node tools/silhouettes.js [saida.png]
const load = require('./load-engine');
const { SPRITES } = load();
const groups = { 'Heroínas': SPRITES.heroes, 'Chefes': SPRITES.bosses };
function mask(id) { const s = SPRITES.get(id); return { w: s.w, h: s.h, m: s.px.map((c) => (c ? 1 : 0)) }; }
function iou(a, b) {
  // alinha pela base e centro horizontal; testa também o espelhado e pega o MAIOR (pior caso)
  let best = 0;
  for (const flip of [false, true]) {
    let inter = 0, uni = 0;
    const W = Math.max(a.w, b.w), H = Math.max(a.h, b.h);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ax = x - (W - a.w) / 2, ay = y - (H - a.h), bxr = x - (W - b.w) / 2, by = y - (H - b.h);
      const bx = flip ? b.w - 1 - bxr : bxr;
      const va = ax >= 0 && ay >= 0 && ax < a.w && ay < a.h ? a.m[ay * a.w + ax] : 0;
      const vb = bx >= 0 && by >= 0 && bx < b.w && by < b.h ? b.m[by * b.w + bx] : 0;
      if (va && vb) inter++; if (va || vb) uni++;
    }
    best = Math.max(best, inter / uni);
  }
  return best;
}
const LIMIT = 0.6;
let fail = 0;
const lines = [];
for (const [g, ids] of Object.entries(groups)) {
  lines.push(`${g}:`);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const v = iou(mask(ids[i]), mask(ids[j]));
    if (v > LIMIT) fail++;
    lines.push(`  ${ids[i]} × ${ids[j]}: IoU ${v.toFixed(2)} ${v > LIMIT ? 'PARECIDOS DEMAIS' : 'ok'}`);
  }
  for (const id of ids) lines.push(`  ${id}: ${SPRITES.colors(SPRITES.get(id)).length} cores, ${SPRITES.get(id).w}x${SPRITES.get(id).h}`);
}
console.log(lines.join('\n'));
console.log(fail ? `FALHOU: ${fail} pares acima de ${LIMIT}` : `OK: todos os pares abaixo de IoU ${LIMIT}`);

// folha PNG (cores normais em cima, silhueta embaixo), escala 6
const out = process.argv[2];
if (out) {
  const zlib = require('zlib'), fs = require('fs');
  const ids = [...SPRITES.heroes, ...SPRITES.bosses, 'clepsidra'];
  const S = 6, cell = 34, W = ids.length * cell * S, H = cell * 2 * S;
  const img = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) { img[i * 4] = 0xee; img[i * 4 + 1] = 0xe6; img[i * 4 + 2] = 0xd8; img[i * 4 + 3] = 255; }
  ids.forEach((id, k) => {
    const s = SPRITES.get(id);
    for (const row of [0, 1]) for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      const c = s.px[y * s.w + x]; if (!c) continue;
      const rgb = row ? [20, 16, 24] : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      const ox = (k * cell + 1 + (cell - 2 - s.w) / 2) * S, oy = (row * cell + 1 + (cell - 2 - s.h)) * S;
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) {
        const p = ((oy + y * S + dy) * W + ox + x * S + dx) * 4; img[p] = rgb[0]; img[p + 1] = rgb[1]; img[p + 2] = rgb[2];
      }
    }
  });
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; img.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4); }
  const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
  console.log('folha salva em', out);
}
process.exitCode = fail ? 1 : 0;
