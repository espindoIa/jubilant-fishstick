// Tira screenshots do jogo rodando (Chromium headless com WebGL via SwiftShader).
// Uso: node tools/screenshot.mjs [url-path] [saida.png] [largura] [altura] [esperaMs] [script.js]
import { chromium } from 'playwright';
import fs from 'node:fs';

const [, , pathArg = '/', out = 'shots/shot.png', w = '1280', h = '720', wait = '2500', scriptFile] = process.argv;
const base = process.env.BASE_URL || 'http://localhost:5173';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(base + pathArg, { waitUntil: 'load' });
await page.waitForTimeout(+wait);
if (scriptFile) {
  const code = fs.readFileSync(scriptFile, 'utf8');
  await page.evaluate(code);
  await page.waitForTimeout(1500);
}
fs.mkdirSync('shots', { recursive: true });
await page.screenshot({ path: out });
console.log(logs.slice(-30).join('\n'));
console.log('saved', out);
await browser.close();
