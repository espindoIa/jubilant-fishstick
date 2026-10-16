// Teste ponta a ponta com Playwright em emulação de celular (360x640, toque).
// Inicia uma jornada, vence um combate, mede FPS em combate, joga até morrer,
// e confirma que o progresso foi salvo (localStorage) e sobrevive a um reload.
// Também testa o jogo com localStorage bloqueado.  Uso: node tools/e2e.js
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'reports/screens');
fs.mkdirSync(SHOTS, { recursive: true });

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const f = path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
      rsp.end(fs.readFileSync(f));
    }).listen(0, () => res(srv));
  });
}
const log = (...a) => console.log('[e2e]', ...a);
const results = { checks: [] };
function check(name, ok, detail) { results.checks.push({ name, ok: !!ok, detail }); log((ok ? 'OK  ' : 'FALHA ') + name + (detail ? ' — ' + detail : '')); }

async function main() {
  const srv = await serve();
  const url = 'http://127.0.0.1:' + srv.address().port + '/';
  // Fontes do Google podem não carregar no ambiente de teste: bloqueia para não atrasar.
  const browser = await chromium.launch();
  const device = { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
  const ctx = await browser.newContext(device);
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text()) && !/ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  await page.waitForSelector('text=ECOS DO CREPÚSCULO');
  const vis = (sel) => page.locator(sel).first().isVisible().catch(() => false);
  const tap = async (sel) => { await page.locator(sel).first().tap(); };

  // alvos de toque: todo botão visível precisa ter >= 44x44
  async function auditTargets(where) {
    const small = await page.$$eval('button', (bs) => bs.filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44); }).map((b) => b.textContent.trim().slice(0, 20) + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check('alvos >= 44px e sem rolagem horizontal em ' + where, !small.length && !overflow, small.join(', ') || (overflow ? 'rolagem horizontal' : ''));
  }
  await auditTargets('título');
  await page.screenshot({ path: path.join(SHOTS, '01-titulo.png') });

  // nova jornada com semente fixa
  await page.fill('#seedInput', 'E2E2026');
  await page.getByRole('button', { name: 'Nova jornada' }).tap();
  while (await vis('#storyNext')) { await tap('#storyNext'); await page.waitForTimeout(40); }
  await page.getByRole('button', { name: /Rocca/ }).tap();
  await page.getByRole('button', { name: /Lume/ }).tap();
  await auditTargets('seleção');
  await page.screenshot({ path: path.join(SHOTS, '02-grupo.png') });
  await page.getByRole('button', { name: 'Partir' }).tap();
  await page.waitForSelector('.node.avail');
  const seed = await page.textContent('#seedChip');
  check('semente exibida na jornada', /^#[0-9A-F]{8}$/.test(seed.trim()), seed.trim());
  await auditTargets('mapa');
  await page.screenshot({ path: path.join(SHOTS, '03-mapa.png') });
  // velocidade 3x
  await tap('.node.avail');
  await page.waitForSelector('canvas[aria-label="Campo de batalha"]');
  while ((await page.textContent('#spdBtn')).trim() !== '3x') await tap('#spdBtn');

  // FPS durante combate (conta quadros do requestAnimationFrame do jogo)
  const f0 = await page.evaluate(() => window.__ECOS.fps());
  const t0 = Date.now();
  await page.waitForTimeout(3000);
  const f1 = await page.evaluate(() => window.__ECOS.fps());
  results.fps = Math.round((f1 - f0) / ((Date.now() - t0) / 1000));
  check('FPS em combate (headless, sem GPU)', results.fps >= 30, results.fps + ' fps');
  // mesma medição com a CPU 4x mais lenta (aproxima um celular de entrada)
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const g0 = await page.evaluate(() => window.__ECOS.fps());
  const u0 = Date.now();
  await page.waitForTimeout(3000);
  const g1 = await page.evaluate(() => window.__ECOS.fps());
  results.fpsThrottled4x = Math.round((g1 - g0) / ((Date.now() - u0) / 1000));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  check('FPS em combate com CPU 4x mais lenta', results.fpsThrottled4x >= 30, results.fpsThrottled4x + ' fps');

  // laço de jogo: ataca sempre; escolhe o primeiro destino; treina na fogueira
  let wonFirst = false, battles = 0, steps = 0, shotBattle = false, shotReward = false, sawTech = false;
  const deadline = Date.now() + 9 * 60 * 1000;
  while (Date.now() < deadline && steps++ < 4000) {
    if (await vis('#overContinue')) break;
    if (await vis('[data-cmd="attack"]')) {
      if (!shotBattle) { await auditTargets('combate'); await page.screenshot({ path: path.join(SHOTS, '04-combate.png') }); shotBattle = true; }
      if (await vis('.btn.tech.ready')) { sawTech = true; await tap('.btn.tech.ready'); if (await vis('[data-target]')) await tap('[data-target]'); continue; }
      await tap('[data-cmd="attack"]');
      await page.waitForSelector('[data-target]', { timeout: 3000 }).catch(() => {});
      if (await vis('[data-target]')) await tap('[data-target]');
      continue;
    }
    if (await vis('text=Escolha uma recompensa:')) {
      battles++;
      if (!wonFirst) { wonFirst = true; check('venceu o primeiro combate', true, 'tela de recompensa exibida'); }
      if (!shotReward) { await page.screenshot({ path: path.join(SHOTS, '05-recompensa.png') }); shotReward = true; }
      await page.getByRole('button', { name: 'Pular' }).tap();
      continue;
    }
    if (await vis('text=Um baú esquecido')) { await tap('.btn.opt'); continue; }
    if (await vis('#storyNext')) { await tap('#storyNext'); continue; }
    if (await vis('text=Fogueira do Ocaso')) { await page.getByRole('button', { name: /Treinar/ }).tap(); continue; }
    if (await vis('.node.avail')) {
      // prefere elites para encerrar mais rápido
      const elite = page.locator('.node.avail[aria-label^="Elite"]');
      if (await elite.count()) await elite.first().tap(); else await tap('.node.avail');
      continue;
    }
    if (await vis('text=Continuar')) { await page.getByRole('button', { name: 'Continuar' }).last().tap(); continue; }
    const ev = page.locator('main .btn.primary');
    if (await ev.count() && !(await vis('canvas[aria-label="Campo de batalha"]'))) { await ev.first().tap(); continue; }
    await page.waitForTimeout(150);
  }
  results.battlesWon = battles;
  results.usedTech = sawTech;
  const died = await vis('#overContinue');
  check('o grupo morreu e a tela de fim apareceu', died, battles + ' combates vencidos antes');
  await page.screenshot({ path: path.join(SHOTS, '06-fim.png') });

  const meta = await page.evaluate(() => JSON.parse(localStorage.getItem('ecos-crepusculo-meta-v1')));
  const runLeft = await page.evaluate(() => localStorage.getItem('ecos-crepusculo-run-v1'));
  check('meta salvo no localStorage após a morte', meta && meta.deaths === 1 && meta.runs === 1 && meta.ecos > 0, meta && `quedas=${meta.deaths} jornadas=${meta.runs} ecos=${meta.ecos}`);
  check('jornada em andamento apagada após a morte', runLeft === null);
  await tap('#overContinue');
  let storyBeats = 0;
  while (await vis('#storyNext')) { storyBeats++; await tap('#storyNext'); await page.waitForTimeout(30); }
  check('história avançou após a morte', storyBeats > 0, storyBeats + ' toques de diálogo novo');
  await page.screenshot({ path: path.join(SHOTS, '07-revelacao-titulo.png') });

  // recarrega e confirma persistência
  await page.reload();
  await page.waitForSelector('text=ECOS DO CREPÚSCULO');
  const note = await page.textContent('.note');
  check('progresso sobrevive ao recarregar', /Jornadas: 1/.test(note) && /Ecos: [1-9]/.test(note), note.trim());
  const chron = await page.getByRole('button', { name: /Crônicas/ }).textContent();
  check('crônicas desbloqueadas persistem', /Crônicas [2-9]/.test(chron), chron.trim());

  // jornada salva no meio: inicia, entra no mapa, recarrega, "Continuar jornada"
  await page.getByRole('button', { name: 'Nova jornada' }).tap();
  await page.getByRole('button', { name: /Pena/ }).tap();
  await page.getByRole('button', { name: /Sino/ }).tap();
  await page.getByRole('button', { name: 'Partir' }).tap();
  await page.waitForSelector('.node.avail');
  await page.reload();
  await page.waitForSelector('text=ECOS DO CREPÚSCULO');
  check('jornada em andamento pode ser continuada', await vis('text=Continuar jornada'));

  // armazenamento bloqueado: o jogo precisa funcionar mesmo assim
  const ctx2 = await browser.newContext(device);
  await ctx2.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx2.addInitScript(() => {
    const boom = () => { throw new DOMException('bloqueado', 'SecurityError'); };
    Storage.prototype.getItem = boom; Storage.prototype.setItem = boom; Storage.prototype.removeItem = boom;
  });
  const p2 = await ctx2.newPage();
  const errs2 = [];
  p2.on('pageerror', (e) => errs2.push(e.message));
  await p2.goto(url);
  await p2.waitForSelector('text=ECOS DO CREPÚSCULO');
  await p2.getByRole('button', { name: 'Nova jornada' }).tap();
  while (await p2.locator('#storyNext').isVisible().catch(() => false)) await p2.locator('#storyNext').tap();
  await p2.getByRole('button', { name: /Rocca/ }).tap();
  await p2.getByRole('button', { name: /Sino/ }).tap();
  await p2.getByRole('button', { name: 'Partir' }).tap();
  await p2.locator('.node.avail').first().tap();
  const ok2 = await p2.waitForSelector('[data-cmd="attack"]', { timeout: 20000 }).then(() => true).catch(() => false);
  check('com localStorage bloqueado o jogo chega ao combate', ok2 && !errs2.length, errs2.join(' | '));
  await ctx2.close();

  check('nenhum erro de JavaScript no console', !errors.length, errors.slice(0, 3).join(' | '));
  await browser.close();
  srv.close();
  fs.writeFileSync(path.join(ROOT, 'reports/e2e.json'), JSON.stringify(results, null, 1));
  const fail = results.checks.filter((c) => !c.ok).length;
  log(fail ? fail + ' verificações falharam' : 'todas as ' + results.checks.length + ' verificações passaram');
  process.exitCode = fail ? 1 : 0;
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
