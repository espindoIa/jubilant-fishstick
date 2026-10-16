// Simulador headless: joga N jornadas por dupla de heroínas usando o MESMO
// DATA/ENGINE embutidos no index.html. Políticas: aleatória e gulosa.
// Uso: node tools/sim.js [runsPorDupla=1000] [--meta=0|max] [--json saida.json]
const load = require('./load-engine');
const { DATA, ENGINE } = load(process.argv.find((a) => a.endsWith('.html')));

const args = process.argv.slice(2);
const N = parseInt(args.find((a) => /^\d+$/.test(a)) || '1000', 10);
const metaArg = (args.find((a) => a.startsWith('--meta=')) || '--meta=0').split('=')[1];
const jsonOut = (() => { const i = args.indexOf('--json'); return i >= 0 ? args[i + 1] : null; })();
const onlyPolicy = (args.find((a) => a.startsWith('--policy=')) || '').split('=')[1];

const HEROES = Object.keys(DATA.heroes);
const PAIRS = [];
for (let i = 0; i < HEROES.length; i++) for (let j = i + 1; j < HEROES.length; j++) PAIRS.push([HEROES[i], HEROES[j]]);

function metaFor(kind) {
  const meta = ENGINE.newMeta();
  if (kind === 'max') for (const id in DATA.meta.upgrades) meta.upgrades[id] = DATA.meta.upgrades[id].costs.length;
  else if (kind.includes(':')) kind.split(',').forEach((kv) => { const [id, l] = kv.split(':'); meta.upgrades[id] = +l; });
  return meta;
}

// ---------------------------------------------------------------- políticas
// Cada política recebe um PRNG próprio (separado do PRNG do jogo).
function policyRng(seed) {
  let s = seed | 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pickR = (r, a) => a[Math.floor(r() * a.length)];

const randomPolicy = {
  name: 'aleatória',
  battle(run, r) {
    const acts = ENGINE.legalActions(run);
    const a = pickR(r, acts);
    return { kind: a.kind, id: a.id, target: a.targets ? pickR(r, a.targets) : undefined };
  },
  node(run, r, opts) { return pickR(r, opts); },
  reward(run, r) { return Math.floor(r() * (run.pending.options.length + 1)) - 1; },
  rest(run, r) { return r() < 0.5 ? 'rest' : 'train'; },
  event(run, r) { return Math.floor(r() * DATA.events[run.pending.id].choices.length); }
};

function hpFrac(h) { return h.hp / h.maxHp; }
function estDamage(run, src, fx, target) {
  const S = Array.isArray(src) ? src.reduce((a, u) => a + ENGINE.stat(run, u, fx.stat), 0) : ENGINE.stat(run, src, fx.stat);
  const def = fx.pierce ? 0 : target.def * (fx.stat === 'mag' ? 0.5 : 1);
  let v = Math.max(S * fx.pow * 2 - def, S * fx.pow * 0.4) * (fx.hits || 1);
  if (target.st.prism && fx.stat === 'mag') v *= DATA.status.prism.magMul;
  if (target.st.guard) v *= 0.5;
  return v;
}
function scoreOffense(run, src, fxs, targetType, targetIdx) {
  const B = run.battle;
  const live = B.enemies.filter((e) => e.hp > 0);
  let score = 0;
  for (const fx of fxs) {
    if (fx.t !== 'dmg' && fx.t !== 'flat') continue;
    if (fx.t === 'flat') { score += live.reduce((s, e) => s + Math.min(e.hp, fx.v + (fx.perAct || 0) * run.act), 0); continue; }
    if (targetType === 'enemy') { const e = B.enemies[targetIdx]; score += Math.min(e.hp, estDamage(run, src, fx, e)); }
    else if (fx.random) { const avg = live.reduce((s, e) => s + estDamage(run, src, fx, e), 0) / live.length; score += avg; }
    else score += live.reduce((s, e) => s + Math.min(e.hp, estDamage(run, src, fx, e)), 0);
  }
  return score;
}
const greedyPolicy = {
  name: 'gulosa',
  battle(run, r) {
    const B = run.battle, h = run.party[B.prompt], p = ENGINE.partnerOf(run, h);
    const acts = ENGINE.legalActions(run);
    const find = (k, id) => acts.find((a) => a.kind === k && (id == null || a.id === id));
    const live = B.enemies.map((e, i) => [e, i]).filter(([e]) => e.hp > 0);
    const lowestEnemy = live.slice().sort((a, b) => a[0].hp - b[0].hp)[0][1];
    // 1) reviver parceira
    if (p && p.hp <= 0) {
      const rv = acts.find((a) => (a.kind === 'skill' || a.kind === 'item') && a.targets && a.targets.length && ((a.kind === 'skill' && DATA.skills[a.id].target === 'deadAlly') || (a.kind === 'item' && DATA.items[a.id].target === 'deadAlly')));
      if (rv) return { kind: rv.kind, id: rv.id, target: rv.targets[0] };
    }
    // 2) cura de emergência
    const allies = run.party.map((x, i) => [x, i]).filter(([x]) => x.hp > 0);
    const hurt = allies.slice().sort((a, b) => hpFrac(a[0]) - hpFrac(b[0]))[0];
    if (hurt && hpFrac(hurt[0]) < 0.38) {
      const both = allies.every(([x]) => hpFrac(x) < 0.55) && allies.length > 1;
      if (both && find('tech', 'aurora')) return { kind: 'tech', id: 'aurora' };
      if (both && find('skill', 'cancaoSerena')) return { kind: 'skill', id: 'cancaoSerena' };
      if (find('skill', 'cura')) return { kind: 'skill', id: 'cura', target: hurt[1] };
      if (find('item', 'elixir') && both) return { kind: 'item', id: 'elixir' };
      if (find('item', 'erva')) return { kind: 'item', id: 'erva', target: hurt[1] };
    }
    // 3) técnicas de suporte situacionais
    const big = B.kind !== 'combat';
    if (h.id === 'rocca' && p && p.hp > 0 && hpFrac(p) < 0.5 && !h.st.taunt && find('skill', 'provocar')) return { kind: 'skill', id: 'provocar' };
    if (big && find('skill', 'fortaleza') && !h.st.shield) return { kind: 'skill', id: 'fortaleza' };
    if (big && find('skill', 'passoAgil') && !h.st.haste) return { kind: 'skill', id: 'passoAgil' };
    if (big && find('item', 'cha') && !h.st.haste) return { kind: 'item', id: 'cha' };
    // 4) técnica dupla
    const tech = find('tech');
    if (tech) return { kind: 'tech', id: tech.id, target: tech.targets ? lowestEnemy : undefined };
    // 5) badalo / segurar para preparar a dupla
    const tr = ENGINE.techReady(run, h);
    const tid = ENGINE.techFor(run);
    if (tid && p && p.hp > 0 && !p.ready) {
      const costH = ENGINE.techCost(run, tid, h.id), costP = ENGINE.techCost(run, tid, p.id);
      if (find('skill', 'badalo') && h.mp >= costH + DATA.skills.badalo.mp && p.mp >= costP) return { kind: 'skill', id: 'badalo', target: run.party.indexOf(p) };
      if (find('hold') && h.mp >= costH && p.mp >= costP && p.atb > DATA.atb.full * 0.7) return { kind: 'hold' };
    }
    // 6) maior dano esperado (reservando MP para a dupla)
    const reserve = tid ? ENGINE.techCost(run, tid, h.id) : 0;
    let best = { kind: 'attack', target: lowestEnemy }, bestScore = scoreOffense(run, h, [{ t: 'dmg', stat: 'atk', pow: ENGINE.mods(run).doubleAttack ? 1.7 : 1 }], 'enemy', lowestEnemy);
    for (const a of acts) {
      let fxs, ttype, cost = 0;
      if (a.kind === 'skill') { const s = DATA.skills[a.id]; fxs = s.fx; ttype = s.target; cost = s.mp; }
      else if (a.kind === 'item' && a.id === 'bomba') { fxs = DATA.items.bomba.fx; ttype = 'enemies'; }
      else continue;
      if (!fxs.some((f) => f.t === 'dmg' || f.t === 'flat')) continue;
      const tgt = ttype === 'enemy' ? lowestEnemy : undefined;
      let sc = scoreOffense(run, h, fxs, ttype, tgt) * (ENGINE.mods(run).skillMul || 1);
      if (a.kind === 'skill' && h.mp - cost < reserve) sc *= 0.75;
      if (fxs.some((f) => f.t === 'status' && f.s === 'stun')) sc *= 1.1;
      if (sc > bestScore * 1.05) { bestScore = sc; best = { kind: a.kind, id: a.id, target: tgt }; }
    }
    if (h.id === 'lume' && h.mp < 8 && find('skill', 'meditar') && best.kind === 'attack') return { kind: 'skill', id: 'meditar' };
    return best;
  },
  node(run, r, opts) {
    const avg = run.party.reduce((s, h) => s + hpFrac(h), 0) / run.party.length;
    const score = { rest: avg < 0.6 ? 10 : 1, elite: avg > 0.75 ? 7 : -5, treasure: 8, event: 5, combat: 4, boss: 0 };
    return opts.slice().sort((a, b) => score[run.map[b].type] - score[run.map[a].type])[0];
  },
  reward(run, r) {
    const opts = run.pending.options;
    let best = -1, bestS = 2;
    opts.forEach((o, i) => {
      let s = 0;
      if (o.kind === 'relic') s = DATA.relics[o.id].rarity === 'r' ? 9 : 7;
      else if (o.kind === 'skill') s = DATA.skills[o.id].target === 'enemies' ? 7.5 : 6;
      else if (o.kind === 'item') s = run.items.length >= DATA.rules.itemSlots ? 0 : o.id === 'elixir' ? 6 : 4;
      if (s > bestS) { bestS = s; best = i; }
    });
    return best;
  },
  rest(run) { const avg = run.party.reduce((s, h) => s + hpFrac(h), 0) / run.party.length; return avg < 0.65 ? 'rest' : 'train'; },
  event(run) {
    const ev = DATA.events[run.pending.id];
    const avg = run.party.reduce((s, h) => s + hpFrac(h), 0) / run.party.length;
    const risky = (c) => c.fx.some((f) => f.t === 'hurt' || f.t === 'gamble');
    if (avg < 0.55 && risky(ev.choices[0])) return 1;
    return 0;
  }
};

// ---------------------------------------------------------------- uma jornada
function playRun(seed, pair, policy, meta, tally, start) {
  const r = policyRng(seed ^ 0x9e3779b9);
  const run = ENGINE.newRun(seed, pair, meta);
  if (start) ENGINE.grant(run, start);
  const issues = [];
  let steps = 0;
  const techUses = {};
  const checkMap = () => { const p = ENGINE.validateMap(run); if (p.length) issues.push('mapa: ' + p.join('; ')); };
  checkMap();
  let lastAct = 0;
  while (run.phase !== 'over') {
    if (++steps > 5000) { issues.push('limite de decisões'); break; }
    if (run.act !== lastAct) { lastAct = run.act; checkMap(); }
    if (run.phase === 'map') {
      const opts = ENGINE.availableNodes(run);
      if (!opts.length) { issues.push('sala sem saída'); break; }
      ENGINE.enterNode(run, policy.node(run, r, opts));
    } else if (run.phase === 'battle') {
      while (!run.battle.result) {
        ENGINE.runUntilDecision(run);
        if (run.battle.result) break;
        const acts = ENGINE.legalActions(run);
        if (!acts.length) { issues.push('sem ações legais'); run.battle.result = 'timeout'; break; }
        const a = policy.battle(run, r);
        if (a.kind === 'tech') techUses[a.id] = (techUses[a.id] || 0) + 1;
        ENGINE.doAction(run, a);
      }
      if (run.battle.result === 'timeout') issues.push('combate travado (tickCap) contra ' + run.battle.group.join('+'));
      const boss = run.battle.kind === 'boss' && run.battle.result === 'win' ? run.battle.group[0] : null;
      ENGINE.finishBattle(run);
      if (boss) tally.bossKills[boss] = (tally.bossKills[boss] || 0) + 1;
    } else if (run.phase === 'reward' || run.phase === 'treasure') {
      ENGINE.chooseReward(run, run.phase === 'treasure' ? Math.max(0, policy.reward(run, r)) : policy.reward(run, r));
    } else if (run.phase === 'rest') {
      ENGINE.restChoice(run, policy.rest(run, r));
    } else if (run.phase === 'event') {
      ENGINE.eventChoice(run, policy.event(run, r));
    } else { issues.push('fase desconhecida ' + run.phase); break; }
  }
  return { run, issues, techUses };
}

// ---------------------------------------------------------------- execução
function simulate(policy, metaKind) {
  const meta = metaFor(metaKind);
  const res = { policy: policy.name, meta: metaKind, runsPerPair: N, pairs: {}, heroes: {}, relics: {}, skills: {}, items: {},
    techs: {}, issues: [], issueRuns: 0, floors: 0, ticks: 0, decisions: 0, battles: 0, wins: 0, runs: 0, deathAct: [0, 0, 0], deathBy: {}, bossKills: {} };
  const tally = res;
  for (const pair of PAIRS) {
    const key = pair.join('+');
    const P = (res.pairs[key] = { runs: 0, wins: 0, floors: 0 });
    for (let k = 0; k < N; k++) {
      const seed = (0xC0FFEE + k * 7919 + PAIRS.indexOf(pair) * 104729) >>> 0;
      let out;
      try { out = playRun(seed, pair, policy, meta, tally); }
      catch (e) { res.issues.push('exceção seed ' + ENGINE.seedToStr(seed) + ': ' + e.message); res.issueRuns++; continue; }
      const { run, issues, techUses } = out;
      if (issues.length) { res.issueRuns++; issues.forEach((m) => res.issues.length < 30 && res.issues.push(ENGINE.seedToStr(seed) + ' ' + key + ': ' + m)); }
      const won = !!(run.over && run.over.won);
      res.runs++; P.runs++; P.floors += run.stats.floors;
      if (won) { res.wins++; P.wins++; }
      else if (run.over) { res.deathAct[run.over.act || 0]++; const by = (run.over.enemies || []).join('+'); res.deathBy[by] = (res.deathBy[by] || 0) + 1; }
      res.floors += run.stats.floors; res.ticks += run.stats.ticks; res.decisions += run.stats.decisions; res.battles += run.stats.battles;
      for (const h of pair) { const H = (res.heroes[h] = res.heroes[h] || { runs: 0, wins: 0 }); H.runs++; if (won) H.wins++; }
      for (const t in techUses) { const T = (res.techs[t] = res.techs[t] || { uses: 0, runs: 0 }); T.uses += techUses[t]; T.runs++; }
      // ofertas e escolhas
      const owned = new Set(run.relics);
      for (const l of run.log) {
        if (l.t !== 'pick' && l.t !== 'skip') continue;
        for (const o of l.offered) {
          const [kind, id] = o.split(':');
          const bucket = kind === 'relic' ? res.relics : kind === 'skill' ? res.skills : res.items;
          const X = (bucket[id] = bucket[id] || { offered: 0, picked: 0, ownedRuns: 0, ownedWins: 0 });
          if (!l.free) X.offered++;
        }
        if (l.t === 'pick') {
          const bucket = l.kind === 'relic' ? res.relics : l.kind === 'skill' ? res.skills : res.items;
          const X = (bucket[l.id] = bucket[l.id] || { offered: 0, picked: 0, ownedRuns: 0, ownedWins: 0 });
          if (!l.free) X.picked++;
        }
      }
      owned.forEach((id) => { const X = (res.relics[id] = res.relics[id] || { offered: 0, picked: 0, ownedRuns: 0, ownedWins: 0 }); X.ownedRuns++; if (won) X.ownedWins++; });
      run.party.forEach((h) => h.skills.forEach((s) => { if (DATA.heroes[h.id].start.includes(s)) return; const X = (res.skills[s] = res.skills[s] || { offered: 0, picked: 0, ownedRuns: 0, ownedWins: 0 }); X.ownedRuns++; if (won) X.ownedWins++; }));
    }
  }
  return res;
}

const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : '—');
function report(res) {
  const L = [];
  L.push(`## Política ${res.policy} · meta ${res.meta === 'max' ? 'máximo' : 'zero'} · ${res.runs} jornadas (${res.runsPerPair} por dupla)`);
  L.push('');
  L.push(`Vitória geral: **${pct(res.wins, res.runs)}** · Andares médios: ${(res.floors / res.runs).toFixed(1)} de 21 · Combates/jornada: ${(res.battles / res.runs).toFixed(1)} · Decisões/jornada: ${(res.decisions / res.runs).toFixed(0)}`);
  const secs = (res.ticks / res.runs) / DATA.atb.ticksPerSecond + (res.decisions / res.runs) * 2.5;
  L.push(`Duração estimada (tempo de ATB a 1x + 2,5 s por decisão): **${(secs / 60).toFixed(1)} min** por jornada`);
  L.push(`Mortes por ato: Ato 1 ${res.deathAct[0]} · Ato 2 ${res.deathAct[1]} · Ato 3 ${res.deathAct[2]}`);
  L.push(`Travamentos/problemas: **${res.issueRuns}** jornadas com problema${res.issues.length ? ' — ' + res.issues.slice(0, 5).join(' | ') : ''}`);
  L.push('');
  L.push('| Heroína | Jornadas | Vitórias |'); L.push('|---|---:|---:|');
  for (const h in res.heroes) L.push(`| ${DATA.heroes[h].name} | ${res.heroes[h].runs} | ${pct(res.heroes[h].wins, res.heroes[h].runs)} |`);
  L.push('');
  L.push('| Dupla | Vitórias | Andares médios |'); L.push('|---|---:|---:|');
  for (const k in res.pairs) { const p = res.pairs[k]; L.push(`| ${k.split('+').map((h) => DATA.heroes[h].name).join(' + ')} | ${pct(p.wins, p.runs)} | ${(p.floors / p.runs).toFixed(1)} |`); }
  L.push('');
  const table = (title, bucket, names) => {
    const rows = Object.entries(bucket).filter(([, x]) => x.offered > 0).map(([id, x]) => ({ id, name: names[id].name, rate: x.picked / x.offered, ...x }));
    rows.sort((a, b) => b.rate - a.rate);
    L.push(`**${title}** (taxa de escolha quando oferecido · vitória quando possuído)`);
    L.push(''); L.push('| Item | Ofertas | Escolha | Vitória c/ ele |'); L.push('|---|---:|---:|---:|');
    rows.forEach((x) => L.push(`| ${x.name} | ${x.offered} | ${pct(x.picked, x.offered)} | ${x.ownedRuns ? pct(x.ownedWins, x.ownedRuns) : '—'} |`));
    L.push('');
  };
  table('Relíquias', res.relics, DATA.relics);
  table('Técnicas aprendidas', res.skills, DATA.skills);
  table('Consumíveis', res.items, DATA.items);
  L.push('| Técnica Dupla | Usos/jornada (quando usada) |'); L.push('|---|---:|');
  for (const t in res.techs) L.push(`| ${DATA.techs[t].name} | ${(res.techs[t].uses / res.techs[t].runs).toFixed(1)} |`);
  L.push('');
  const deaths = Object.entries(res.deathBy).sort((a, b) => b[1] - a[1]).slice(0, 6);
  L.push('Quem mais derrota o grupo: ' + deaths.map(([k, v]) => `${k.split('+').map((e) => DATA.enemies[e].name).join(' + ')} (${v})`).join(', '));
  L.push('');
  return L.join('\n');
}

// ---------------------------------------------------------------- experimento controlado
// Mesmas sementes, mesma política gulosa; a única diferença é começar com o item.
if (args.includes('--power')) {
  const M = parseInt((args.find((a) => a.startsWith('--n=')) || '--n=300').split('=')[1], 10);
  const meta = metaFor('0');
  const winRate = (start, pairs) => {
    let w = 0, n = 0;
    for (const pair of pairs) for (let k = 0; k < M; k++) {
      const seed = (0xBEEF + k * 7919 + PAIRS.indexOf(pair) * 104729) >>> 0;
      const { run } = playRun(seed, pair, greedyPolicy, meta, { bossKills: {} }, start);
      n++; if (run.over && run.over.won) w++;
    }
    return w / n;
  };
  const L = ['## Força medida por experimento controlado (política gulosa, meta zero, ' + M + ' sementes por dupla)', '',
    'Cada linha: jornadas com as MESMAS sementes, começando com o item. Δ = diferença em pontos percentuais para a linha de base.', ''];
  const base = winRate(null, PAIRS);
  L.push('Linha de base (sem item extra): **' + (base * 100).toFixed(1) + '%**', '');
  L.push('| Relíquia | Vitória | Δ |', '|---|---:|---:|');
  const rows = [];
  for (const id in DATA.relics) { const v = winRate({ kind: 'relic', id }, PAIRS); rows.push([DATA.relics[id].name + (DATA.relics[id].rarity === 'r' ? ' (rara)' : ''), v, v - base]); }
  rows.sort((a, b) => b[2] - a[2]).forEach((x) => L.push(`| ${x[0]} | ${(x[1] * 100).toFixed(1)}% | ${x[2] >= 0 ? '+' : ''}${(x[2] * 100).toFixed(1)} |`));
  L.push('', '| Técnica (aprendida no início) | Vitória | Base da dona | Δ |', '|---|---:|---:|---:|');
  const rows2 = [];
  for (const h of HEROES) {
    const pairs = PAIRS.filter((p) => p.includes(h));
    const b = winRate(null, pairs);
    for (const id of DATA.heroes[h].learn) { const v = winRate({ kind: 'skill', id, hero: h }, pairs); rows2.push([DATA.skills[id].name + ' (' + DATA.heroes[h].name + ')', v, b, v - b]); }
  }
  rows2.sort((a, b) => b[3] - a[3]).forEach((x) => L.push(`| ${x[0]} | ${(x[1] * 100).toFixed(1)}% | ${(x[2] * 100).toFixed(1)}% | ${x[3] >= 0 ? '+' : ''}${(x[3] * 100).toFixed(1)} |`));
  console.log(L.join('\n'));
  process.exit(0);
}

const t0 = Date.now();
const out = [];
const results = [];
const policies = onlyPolicy === 'gulosa' ? [greedyPolicy] : onlyPolicy === 'aleatoria' ? [randomPolicy] : [randomPolicy, greedyPolicy];
for (const pol of policies) {
  const res = simulate(pol, metaArg);
  results.push(res);
  out.push(report(res));
}
if (metaArg === '0' && !onlyPolicy) { const res = simulate(greedyPolicy, 'max'); results.push(res); out.push(report(res)); }
console.log(out.join('\n'));
console.log(`_Simulação concluída em ${((Date.now() - t0) / 1000).toFixed(1)} s._`);
if (jsonOut) require('fs').writeFileSync(jsonOut, JSON.stringify(results.map((r) => ({ policy: r.policy, meta: r.meta, runs: r.runs, wins: r.wins, heroes: r.heroes, pairs: r.pairs, issueRuns: r.issueRuns })), null, 1));
