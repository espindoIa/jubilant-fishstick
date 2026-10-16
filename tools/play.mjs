// Robô de testes: executa uma sequência de passos no jogo e tira screenshots.
// Uso: node tools/play.mjs roteiro.json   (ou JSON inline como argumento)
// Passos: {"wait":ms} {"key":"Enter"} {"keys":["Enter",3]} {"hold":"ArrowUp","ms":800}
//         {"tap":[x,y]} {"shot":"nome"} {"eval":"código"} {"until":"expr","timeout":ms}
import { chromium } from 'playwright';
import fs from 'node:fs';

const arg = process.argv[2];
const spec = JSON.parse(fs.existsSync(arg) ? fs.readFileSync(arg, 'utf8') : arg);
const base = process.env.BASE_URL || 'http://localhost:5173';
const W = spec.width || 1280, H = spec.height || 720;
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
// "video": "nome" grava a sessão inteira em shots/play/<nome>.webm
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  hasTouch: !!spec.touch,
  isMobile: !!spec.touch,
  ...(spec.video ? { recordVideo: { dir: 'shots/play/video-tmp', size: { width: W, height: H } } } : {}),
});
const page = await ctx.newPage();
const logs = [];
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${t}`);
});
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack}`));
await page.goto(base + (spec.url || '/'), { waitUntil: 'load' });
fs.mkdirSync('shots/play', { recursive: true });
let n = 0;
for (const step of spec.steps) {
  if (step.wait) await page.waitForTimeout(step.wait);
  if (step.key) await page.keyboard.press(step.key);
  if (step.keys) {
    const [k, times, gap] = step.keys;
    for (let i = 0; i < times; i++) {
      await page.keyboard.press(k);
      await page.waitForTimeout(gap || 350);
    }
  }
  if (step.hold) {
    await page.keyboard.down(step.hold);
    await page.waitForTimeout(step.ms || 500);
    await page.keyboard.up(step.hold);
  }
  if (step.tap) await page.mouse.click(step.tap[0], step.tap[1]);
  if (step.eval) {
    const r = await page.evaluate(step.eval);
    if (r !== undefined) console.log('eval →', JSON.stringify(r));
  }
  if (step.until) {
    const t0 = Date.now();
    while (Date.now() - t0 < (step.timeout || 10000)) {
      const ok = await page.evaluate(step.until).catch(() => false);
      if (ok) break;
      if (step.press) await page.keyboard.press(step.press);
      await page.waitForTimeout(step.every || 400);
    }
  }
  if (step.shot) {
    const f = `shots/play/${String(n++).padStart(2, '0')}-${step.shot}.png`;
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
}
console.log(logs.slice(-40).join('\n'));
const video = page.video();
await ctx.close();
if (video && spec.video) {
  const out = `shots/play/${spec.video}.webm`;
  await video.saveAs(out);
  await video.delete();
  console.log('video', out);
}
await browser.close();
