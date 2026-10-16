// ============================================================================
// ENGINE — regras puras (sem DOM). O jogo e o simulador headless usam este
// mesmo código. Todo estado é JSON serializável (run.rng é o estado do PRNG).
// ============================================================================
var ENGINE = (function () {
  'use strict';
  var D = DATA;

  // ---------------------------------------------------------------- PRNG mulberry32
  function rnd(run) {
    var t = (run.rng = (run.rng + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rint(run, n) { return Math.floor(rnd(run) * n); }
  function pick(run, arr) { return arr[rint(run, arr.length)]; }
  function shuffle(run, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rint(run, i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function seedToStr(s) { return ('00000000' + (s >>> 0).toString(16).toUpperCase()).slice(-8); }
  function strToSeed(str) {
    str = String(str || '').trim();
    if (/^[0-9a-fA-F]{1,8}$/.test(str)) return parseInt(str, 16) >>> 0;
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------------------------------------------------------------- modificadores
  function addMods(acc, mod) {
    for (var k in mod) {
      if (/Mul$/.test(k)) acc[k] = (acc[k] == null ? 1 : acc[k]) * mod[k];
      else acc[k] = (acc[k] || 0) + mod[k];
    }
    return acc;
  }
  function mods(run) {
    if (run._modsKey === run.relics.join(',')) return run._mods;
    var m = {};
    run.relics.forEach(function (r) { addMods(m, D.relics[r].mod); });
    addMods(m, run.metaMod || {});
    Object.defineProperty(run, '_mods', { value: m, writable: true, enumerable: false, configurable: true });
    Object.defineProperty(run, '_modsKey', { value: run.relics.join(','), writable: true, enumerable: false, configurable: true });
    return m;
  }
  function mget(m, k, def) { return m[k] == null ? def : m[k]; }

  function metaMods(meta) {
    var m = {};
    var ups = (meta && meta.upgrades) || {};
    for (var id in D.meta.upgrades) {
      var lvl = ups[id] || 0;
      var u = D.meta.upgrades[id];
      for (var i = 0; i < lvl; i++) {
        for (var k in u.mod) m[k] = (m[k] || 0) + u.mod[k];
      }
    }
    // hpMul do meta é aditivo (+6% por nível) -> converte em multiplicador
    var out = {};
    if (m.hpMul) out.hpMul = 1 + m.hpMul;
    if (m.spd) out.spd = m.spd;
    if (m.startAtbBonus) out.startAtbBonus = m.startAtbBonus;
    out._startErva = m.startErva || 0;
    out._rewardChoices = m.rewardChoices || 0;
    out._startRelic = m.startRelic || 0;
    return out;
  }

  // ---------------------------------------------------------------- heróis
  function makeHero(id) {
    var b = D.heroes[id];
    return { id: id, name: b.name, lvl: 1, xp: 0, hp: b.hp, maxHp: b.hp, mp: b.mp, maxMp: b.mp,
      skills: b.start.slice(), bonusHp: 0, atb: 0, st: {}, ready: false, held: false };
  }
  function stat(run, h, s) {
    var b = D.heroes[h.id];
    var m = mods(run);
    var g = D.rules.levelGain;
    if (s === 'atk' || s === 'mag' || s === 'def') return b[s] + g[s] * (h.lvl - 1) + (m[s] || 0);
    if (s === 'spd') return b.spd + (m.spd || 0);
    return 0;
  }
  function recalcHero(run, h) {
    var b = D.heroes[h.id];
    var m = mods(run);
    var oldMax = h.maxHp;
    var mhp = Math.round(b.hp * (1 + D.rules.levelGain.hp * (h.lvl - 1)) * mget(m, 'hpMul', 1) + (m.hpFlat || 0) + h.bonusHp);
    h.maxHp = Math.max(1, mhp);
    if (h.maxHp > oldMax && h.hp > 0) h.hp += h.maxHp - oldMax;
    h.hp = Math.min(h.hp, h.maxHp);
    h.maxMp = b.mp + Math.floor((h.lvl - 1) * 2);
    h.mp = Math.min(h.mp, h.maxMp);
  }
  function recalcAll(run) { run.party.forEach(function (h) { recalcHero(run, h); }); }

  function gainXp(run, h, xp, events) {
    h.xp += xp;
    var L = D.rules.levelXp;
    while (h.lvl < L.length && h.xp >= L[h.lvl]) {
      h.lvl++;
      var oldMp = h.maxMp;
      recalcHero(run, h);
      h.mp += h.maxMp - oldMp;
      if (events) events.push({ e: 'lvl', who: h.id, lvl: h.lvl });
    }
  }
  function xpToNext(h) {
    var L = D.rules.levelXp;
    if (h.lvl >= L.length) return 0;
    return L[h.lvl] - h.xp;
  }

  // ---------------------------------------------------------------- jornada (run)
  function newRun(seed, partyIds, meta) {
    var run = {
      v: 1, seed: seed >>> 0, rng: seed | 0, party: partyIds.map(makeHero), relics: [], items: [],
      act: 0, map: null, pos: null, phase: 'map', pending: null, battle: null, over: null,
      stats: { floors: 0, battles: 0, elites: 0, bosses: 0, ticks: 0, decisions: 0, nodes: [] },
      seenEvents: [], fenixUsed: false, metaMod: metaMods(meta), log: []
    };
    var mm = run.metaMod;
    for (var i = 0; i < mm._startErva; i++) run.items.push('erva');
    if (mm._startRelic) {
      var commons = Object.keys(D.relics).filter(function (r) { return D.relics[r].rarity === 'c'; });
      run.relics.push(pick(run, commons));
    }
    recalcAll(run);
    run.party.forEach(function (h) { h.hp = h.maxHp; h.mp = h.maxMp; });
    genMap(run);
    return run;
  }

  // Mapa ramificado (Slay the Spire): caminhos de baixo para cima, sem arestas cruzadas.
  function genMap(run) {
    var M = D.map, nodes = {}, key = function (r, c) { return r + ':' + c; };
    var edges = {};
    function edge(a, b) { edges[a] = edges[a] || {}; edges[a][b] = true; }
    function hasEdge(r, c1, c2) { return edges[key(r, c1)] && edges[key(r, c1)][key(r + 1, c2)]; }
    var starts = shuffle(run, [0, 1, 2, 3]);
    for (var p = 0; p < M.paths; p++) {
      var col = p < 2 ? starts[p] : rint(run, M.cols);
      for (var r = 0; r < M.rows; r++) {
        nodes[key(r, col)] = nodes[key(r, col)] || { id: key(r, col), row: r, col: col, type: null, next: [] };
        if (r < M.rows - 1) {
          var nc = clamp(col + rint(run, 3) - 1, 0, M.cols - 1);
          // evita cruzamento: se existe aresta (r, nc) -> (r+1, col), anda reto
          if (nc !== col && hasEdge(r, nc, col)) nc = col;
          edge(key(r, col), key(r + 1, nc));
          col = nc;
        }
      }
    }
    var ids = Object.keys(nodes).sort();
    ids.forEach(function (id) {
      var n = nodes[id];
      n.next = Object.keys(edges[id] || {}).sort();
      if (n.row === M.rows - 1) n.next = ['boss'];
    });
    nodes.boss = { id: 'boss', row: M.rows, col: 1.5, type: 'boss', next: [] };
    // tipos
    var W = M.weights;
    ids.forEach(function (id) {
      var n = nodes[id];
      if (n.row === 0) n.type = M.firstRow;
      else if (n.row === M.rows - 1) n.type = M.lastRow;
      else {
        var opts = [];
        for (var t in W) {
          if (t === 'elite' && n.row < M.eliteMinRow) continue;
          if (t === 'rest' && n.row === M.rows - 2) continue;
          opts.push([t, W[t]]);
        }
        var tot = opts.reduce(function (s, o) { return s + o[1]; }, 0), x = rnd(run) * tot;
        for (var i = 0; i < opts.length; i++) { x -= opts[i][1]; if (x <= 0) { n.type = opts[i][0]; break; } }
        if (!n.type) n.type = 'combat';
      }
    });
    // garante ao menos um tesouro no meio do ato
    var mid = ids.filter(function (id) { return nodes[id].row === 3; });
    if (mid.length && !mid.some(function (id) { return nodes[id].type === 'treasure'; })) nodes[pick(run, mid)].type = 'treasure';
    run.map = nodes;
    run.pos = null;
  }

  function validateMap(run) {
    var nodes = run.map, problems = [];
    var reach = {};
    var frontier = Object.keys(nodes).filter(function (id) { return nodes[id].row === 0; });
    if (!frontier.length) problems.push('sem nós iniciais');
    while (frontier.length) {
      var id = frontier.pop();
      if (reach[id]) continue;
      reach[id] = true;
      var n = nodes[id];
      if (id !== 'boss' && !n.next.length) problems.push('beco sem saída em ' + id);
      n.next.forEach(function (x) { if (!nodes[x]) problems.push('aresta inválida ' + id + '->' + x); else frontier.push(x); });
    }
    if (!reach.boss) problems.push('chefe inalcançável');
    Object.keys(nodes).forEach(function (id) { if (!reach[id]) problems.push('nó inalcançável ' + id); });
    return problems;
  }

  function availableNodes(run) {
    if (run.phase !== 'map') return [];
    if (run.pos == null) return Object.keys(run.map).filter(function (id) { return run.map[id].row === 0; }).sort();
    return run.map[run.pos].next.slice();
  }

  function enterNode(run, id) {
    if (availableNodes(run).indexOf(id) < 0) throw new Error('nó indisponível: ' + id);
    run.pos = id;
    var n = run.map[id];
    run.stats.nodes.push(n.type);
    run.stats.decisions++;
    var act = D.acts[run.act];
    if (n.type === 'combat' || n.type === 'elite' || n.type === 'boss') {
      var group;
      if (n.type === 'boss') group = [act.boss];
      else if (n.type === 'elite') group = pick(run, act.elite);
      else group = pick(run, n.row <= 1 ? act.weak : act.normal);
      run.battle = startBattle(run, group, n.type, n.row);
      run.phase = 'battle';
    } else if (n.type === 'rest') {
      run.phase = 'rest';
      run.pending = { options: ['rest', 'train'] };
    } else if (n.type === 'treasure') {
      run.phase = 'treasure';
      var a = relicPool(run, null), b;
      run.pending = { options: shuffle(run, a).slice(0, 2).map(function (r) { return { kind: 'relic', id: r }; }) };
      if (!run.pending.options.length) run.pending.options = [{ kind: 'item', id: 'elixir' }];
    } else if (n.type === 'event') {
      var pool = Object.keys(D.events).filter(function (e) { return run.seenEvents.indexOf(e) < 0; });
      if (!pool.length) pool = Object.keys(D.events);
      var ev = pick(run, pool);
      run.seenEvents.push(ev);
      run.phase = 'event';
      run.pending = { id: ev, result: null };
    }
    return run.phase;
  }

  function completeNode(run) {
    run.stats.floors++;
    run.pending = null;
    var n = run.map[run.pos];
    if (n.type === 'boss') {
      if (run.act >= D.acts.length - 1) { run.phase = 'over'; run.over = { won: true }; return; }
      run.act++;
      run.fenixUsed = false;
      genMap(run);
    }
    run.phase = 'map';
  }

  // ---------------------------------------------------------------- combate ATB
  function makeEnemy(run, id, kind, row) {
    var e = D.enemies[id];
    var sc = 1 + D.rules.floorScale * (row || 0);
    if (kind === 'boss') sc = 1;
    return { id: id, name: e.name, hp: Math.round(e.hp * sc), maxHp: Math.round(e.hp * sc), atk: e.atk * (1 + (sc - 1) * 0.5),
      mag: e.mag * (1 + (sc - 1) * 0.5), def: e.def, spd: e.spd, atb: 0, st: {}, turns: 0, used: {}, enemy: true };
  }

  function startBattle(run, group, kind, row) {
    var m = mods(run);
    var B = { kind: kind, enemies: group.map(function (id) { return makeEnemy(run, id, kind, row); }), tick: 0, prompt: null,
      result: null, turn: 0, group: group.slice() };
    run.party.forEach(function (h) {
      h.st = {}; h.held = false; h.ready = false; h.started = false;
      h.atb = h.hp > 0 ? (m.startAtb ? D.atb.full : Math.min(D.atb.full - 1, Math.floor(rnd(run) * D.atb.heroStartMax + (m.startAtbBonus || 0) * D.atb.full))) : 0;
    });
    B.enemies.forEach(function (e) { e.atb = m.enemyStartAtb ? 0 : Math.floor(rnd(run) * D.atb.enemyStartMax); });
    run.stats.battles++;
    return B;
  }

  function alive(u) { return u.hp > 0; }
  function effSpd(run, u) {
    var s = u.enemy ? u.spd * mget(mods(run), 'enemySpdMul', 1) : stat(run, u, 'spd');
    if (u.st.haste) s *= D.status.haste.spdMul;
    if (u.st.slow) s *= D.status.slow.spdMul;
    return Math.max(1, s);
  }
  function unitRef(run, u) {
    var i = run.party.indexOf(u);
    if (i >= 0) return { side: 'h', i: i };
    return { side: 'e', i: run.battle.enemies.indexOf(u) };
  }
  function uStat(run, u, s) { return u.enemy ? u[s] : stat(run, u, s); }

  // avança 1 tick. Retorna lista de eventos (ação inimiga) ou null.
  function stepBattle(run) {
    var B = run.battle;
    if (!B || B.result || B.prompt != null) return null;
    B.tick++;
    run.stats.ticks++;
    if (B.tick > D.rules.tickCap) { B.result = 'timeout'; return [{ e: 'msg', text: 'O tempo se esgotou.' }]; }
    var FULL = D.atb.full, events = [];
    var newlyReady = false;
    run.party.forEach(function (h) {
      if (!alive(h) || h.ready) return;
      h.atb = Math.min(FULL, h.atb + effSpd(run, h));
      if (h.atb >= FULL) { h.ready = true; newlyReady = true; }
    });
    B.enemies.forEach(function (e) {
      if (!alive(e)) return;
      e.atb = Math.min(FULL, e.atb + effSpd(run, e));
    });
    // inimigos com ATB cheia agem (em ordem)
    for (var i = 0; i < B.enemies.length; i++) {
      var e = B.enemies[i];
      if (alive(e) && e.atb >= FULL && !B.result) {
        e.atb = 0;
        enemyTurn(run, e, events);
        checkEnd(run, events);
      }
    }
    if (B.result) return events.length ? events : null;
    if (newlyReady) run.party.forEach(function (h) { h.held = false; });
    // turno de herói (modo Espera: o tempo pausa enquanto há comando pendente)
    for (var j = 0; j < run.party.length; j++) {
      var h = run.party[j];
      if (h.ready && alive(h) && !h.held) {
        if (!h.started) {
          h.started = true;
          startTurn(run, h, events);
          if (!alive(h)) { h.ready = false; h.atb = 0; checkEnd(run, events); continue; }
          if (h.skip) { h.skip = false; h.ready = false; h.started = false; h.atb = 0; continue; }
        }
        B.prompt = j;
        break;
      }
    }
    if (B.result) return events;
    return events.length ? events : null;
  }

  // processa início de turno: veneno, duração de status, atordoamento
  function startTurn(run, u, events) {
    var m = mods(run);
    if (!u.enemy && m.mpPerTurn) u.mp = Math.min(u.maxMp, u.mp + m.mpPerTurn);
    if (u.st.poison) {
      var mul = u.enemy ? mget(m, 'poisonMul', 1) : 1;
      var dmg = Math.max(1, Math.round(u.maxHp * D.status.poison.frac * mul));
      u.hp = Math.max(0, u.hp - dmg);
      events.push({ e: 'dmg', to: unitRef(run, u), v: dmg, poison: true, hp: u.hp });
      if (!alive(u)) { onKo(run, u, events); }
    }
    var stunned = !!u.st.stun;
    for (var s in u.st) {
      u.st[s].dur--;
      if (u.st[s].dur <= 0) delete u.st[s];
    }
    if (stunned && alive(u)) { u.skip = true; events.push({ e: 'msg', text: u.name + ' está atordoada!', to: unitRef(run, u) }); }
  }

  function onKo(run, u, events) {
    u.hp = 0; u.atb = 0; u.st = {}; u.ready = false; u.held = false;
    events.push({ e: 'ko', to: unitRef(run, u) });
    var m = mods(run);
    if (!u.enemy && m.revive && !run.fenixUsed) {
      run.fenixUsed = true;
      u.hp = Math.round(u.maxHp * 0.6);
      events.push({ e: 'revive', to: unitRef(run, u), v: u.hp, hp: u.hp, text: 'A Pluma do Último Voo se acende!' });
    }
  }

  function checkEnd(run, events) {
    var B = run.battle;
    if (B.result) return;
    if (!B.enemies.some(alive)) B.result = 'win';
    else if (!run.party.some(alive)) B.result = 'lose';
    if (B.result && events) events.push({ e: 'end', result: B.result });
  }

  function chooseEnemyMove(run, e) {
    var def = D.enemies[e.id];
    var forced = null;
    def.moves.forEach(function (mv, i) {
      if (forced) return;
      if (mv.hpBelow && mv.once && !e.used[i] && e.hp / e.maxHp < mv.hpBelow) { forced = mv; e.used[i] = true; }
    });
    if (!forced) def.moves.forEach(function (mv) {
      if (!forced && mv.every && (e.turns + 1) % mv.every === 0) forced = mv;
    });
    if (forced) return forced;
    var pool = def.moves.filter(function (mv) { return !mv.every && !mv.hpBelow; });
    var tot = pool.reduce(function (s, m) { return s + m.w; }, 0), x = rnd(run) * tot;
    for (var i = 0; i < pool.length; i++) { x -= pool[i].w; if (x <= 0) return pool[i]; }
    return pool[0];
  }

  function enemyTurn(run, e, events) {
    startTurn(run, e, events);
    if (!alive(e)) return;
    if (e.skip) { e.skip = false; return; }
    var mv = chooseEnemyMove(run, e);
    e.turns++;
    var targets;
    var live = run.party.filter(alive);
    if (!live.length) return;
    if (mv.target === 'hero') {
      var taunt = live.filter(function (h) { return h.st.taunt; });
      targets = [taunt.length ? taunt[0] : pick(run, live)];
    } else if (mv.target === 'heroes') targets = live;
    else targets = [e];
    events.push({ e: 'act', who: unitRef(run, e), name: mv.n, boss: !!D.enemies[e.id].boss });
    applyFx(run, e, mv.fx, targets, events, { enemy: true });
  }

  // ---------------------------------------------------------------- efeitos
  function srcStat(run, src, s) {
    if (Array.isArray(src)) return src.reduce(function (a, u) { return a + uStat(run, u, s); }, 0);
    return uStat(run, src, s);
  }
  function isHeroSrc(src) { return Array.isArray(src) || !src.enemy; }

  function calcDmg(run, src, tgt, fx, ctx) {
    var m = mods(run);
    var S = srcStat(run, src, fx.stat);
    var Dv = fx.pierce ? 0 : uStat(run, tgt, 'def') * (fx.stat === 'mag' ? 0.5 : 1);
    var base = Math.max(S * fx.pow * 2 - Dv, S * fx.pow * 0.4);
    base *= 1 + (rnd(run) * 2 - 1) * D.rules.variance;
    var crit = false;
    if (fx.stat === 'atk' && rnd(run) < D.rules.critChance + (isHeroSrc(src) ? (m.crit || 0) : 0)) { base *= D.rules.critMul; crit = true; }
    if (isHeroSrc(src)) {
      base *= mget(m, 'dmgMul', 1);
      if (ctx.skill || ctx.tech) base *= mget(m, 'skillMul', 1);
      var srcs = Array.isArray(src) ? src : [src];
      if (srcs.some(function (u) { return u.st.atkUp; })) base *= D.status.atkUp.mul;
    } else {
      if (src.st.atkUp) base *= D.status.atkUp.mul;
    }
    if (!tgt.enemy) base *= mget(m, 'takenMul', 1);
    if (tgt.st.guard) base *= D.status.guard.mul;
    if (tgt.st.shield) base *= D.status.shield.mul;
    if (tgt.st.prism && fx.stat === 'mag') base *= D.status.prism.magMul;
    return { v: Math.max(1, Math.round(base)), crit: crit };
  }

  function dealDamage(run, src, tgt, amount, events, extra) {
    if (!alive(tgt)) return 0;
    var v = Math.min(tgt.hp, amount);
    tgt.hp -= v;
    var ev = { e: 'dmg', to: unitRef(run, tgt), v: amount, hp: tgt.hp };
    if (extra) for (var k in extra) ev[k] = extra[k];
    events.push(ev);
    if (!alive(tgt)) onKo(run, tgt, events);
    return v;
  }

  function addStatus(run, u, s, dur, events) {
    if (!alive(u)) return;
    var cur = u.st[s];
    u.st[s] = { dur: Math.max(dur + (u.ready && !u.enemy ? 0 : 0), cur ? cur.dur : 0) };
    events.push({ e: 'status', to: unitRef(run, u), s: s });
  }

  function resolveGroup(run, src, to) {
    var heroSide = isHeroSrc(src);
    var mine = heroSide ? run.party : run.battle.enemies;
    var theirs = heroSide ? run.battle.enemies : run.party;
    if (to === 'allies') return mine.filter(alive);
    if (to === 'enemies') return theirs.filter(alive);
    return null;
  }

  function applyFx(run, src, fxList, targets, events, ctx) {
    var m = mods(run);
    var heroSide = isHeroSrc(src);
    fxList.forEach(function (fx) {
      var tg = fx.to ? resolveGroup(run, src, fx.to) : targets;
      if (fx.t === 'dmg') {
        var hits = fx.hits || 1;
        for (var h = 0; h < hits; h++) {
          var list;
          if (fx.random) {
            var pool = (fx.to ? tg : (heroSide ? run.battle.enemies : run.party)).filter(alive);
            if (!pool.length) break;
            list = [pick(run, pool)];
          } else list = tg.filter(alive);
          list.forEach(function (t) {
            var r = calcDmg(run, src, t, fx, ctx);
            var v = dealDamage(run, src, t, r.v, events, { crit: r.crit });
            if (heroSide && m.lifesteal && v > 0) healUnits(run, Array.isArray(src) ? src : [src], Math.max(1, Math.round(v * m.lifesteal / (Array.isArray(src) ? 2 : 1))), events, true);
            if (!heroSide && fx.drain && v > 0) healUnits(run, [src], Math.round(v * fx.drain), events, true);
            if (heroSide && ctx.attack && m.poisonOnHit && alive(t) && rnd(run) < m.poisonOnHit) addStatus(run, t, 'poison', 3, events);
            if (!heroSide && m.reflect && fx.stat === 'atk' && v > 0 && alive(src)) {
              dealDamage(run, t, src, Math.max(1, Math.round(v * m.reflect)), events, { reflect: true });
            }
          });
        }
      } else if (fx.t === 'flat') {
        tg.filter(alive).forEach(function (t) { dealDamage(run, src, t, fx.v + (fx.perAct || 0) * run.act, events); });
      } else if (fx.t === 'heal') {
        var amt = Math.round(srcStat(run, src, 'mag') * fx.pow * 2 * (1 + (rnd(run) * 2 - 1) * 0.08));
        healUnits(run, tg, amt, events);
      } else if (fx.t === 'healPct') {
        tg.filter(alive).forEach(function (t) { healUnits(run, [t], Math.round(t.maxHp * fx.v), events); });
      } else if (fx.t === 'status') {
        tg.forEach(function (t) {
          if (!alive(t)) return;
          if (fx.chance != null && rnd(run) >= fx.chance) { events.push({ e: 'miss', to: unitRef(run, t) }); return; }
          addStatus(run, t, fx.s, fx.dur, events);
        });
      } else if (fx.t === 'mp') {
        tg.filter(alive).forEach(function (t) {
          if (t.enemy) return;
          var before = t.mp; t.mp = Math.min(t.maxMp, t.mp + fx.v);
          events.push({ e: 'mp', to: unitRef(run, t), v: t.mp - before, mp: t.mp });
        });
      } else if (fx.t === 'atb') {
        tg.filter(alive).forEach(function (t) {
          if (fx.v === 'full') { t.atb = D.atb.full; }
          else { t.atb = 0; if (!t.enemy) { t.ready = false; t.held = false; t.started = false; } }
          events.push({ e: 'atb', to: unitRef(run, t), full: fx.v === 'full' });
        });
      } else if (fx.t === 'revive') {
        tg.forEach(function (t) {
          if (alive(t)) return;
          t.hp = Math.max(1, Math.round(t.maxHp * fx.frac)); t.atb = 0; t.st = {}; t.ready = false; t.held = false; t.started = false;
          events.push({ e: 'revive', to: unitRef(run, t), v: t.hp, hp: t.hp });
        });
      } else if (fx.t === 'steal') {
        tg.forEach(function (t) {
          if (rnd(run) < fx.chance && run.items.length < D.rules.itemSlots) {
            var it = rnd(run) < 0.12 ? 'eter' : pick(run, ['erva', 'erva', 'eter', 'bomba', 'cha']);
            run.items.push(it);
            events.push({ e: 'msg', text: 'Pegou ' + D.items[it].name + '!' });
          } else events.push({ e: 'msg', text: 'Nada para pegar.' });
        });
      }
    });
  }

  function healUnits(run, list, amt, events, quiet) {
    list.forEach(function (t) {
      if (!alive(t)) return;
      var before = t.hp;
      t.hp = Math.min(t.maxHp, t.hp + amt);
      events.push({ e: 'heal', to: unitRef(run, t), v: t.hp - before, quiet: !!quiet, hp: t.hp });
    });
  }

  // ---------------------------------------------------------------- ações do jogador
  function partnerOf(run, h) { return run.party.filter(function (x) { return x !== h; })[0]; }
  function techFor(run) {
    var ids = run.party.map(function (h) { return h.id; });
    for (var t in D.techs) {
      var p = D.techs[t].pair;
      if (ids.indexOf(p[0]) >= 0 && ids.indexOf(p[1]) >= 0) return t;
    }
    return null;
  }
  function techCost(run, tid, heroId) {
    return Math.ceil(D.techs[tid].cost[heroId] * mget(mods(run), 'techCostMul', 1));
  }
  function targetsFor(run, h, type) {
    var B = run.battle;
    if (type === 'enemy') return B.enemies.map(function (e, i) { return alive(e) ? i : -1; }).filter(function (i) { return i >= 0; });
    if (type === 'ally') return run.party.map(function (x, i) { return alive(x) ? i : -1; }).filter(function (i) { return i >= 0; });
    if (type === 'deadAlly') return run.party.map(function (x, i) { return !alive(x) ? i : -1; }).filter(function (i) { return i >= 0; });
    if (type === 'partner') { var p = partnerOf(run, h); return p && alive(p) && !p.ready ? [run.party.indexOf(p)] : []; }
    return null; // sem escolha
  }
  function techReady(run, h) {
    var tid = techFor(run);
    if (!tid) return { ok: false };
    var p = partnerOf(run, h);
    var ok = p && alive(p) && p.ready && !p.skip && h.mp >= techCost(run, tid, h.id) && p.mp >= techCost(run, tid, p.id);
    return { ok: !!ok, id: tid, partnerReady: !!(p && p.ready && alive(p)), mpOk: !!(p && h.mp >= techCost(run, tid, h.id) && p.mp >= techCost(run, tid, p.id)) };
  }

  // Lista de ações legais para a heroína com o turno (o "menu de comandos").
  function legalActions(run) {
    var B = run.battle;
    if (!B || B.prompt == null || B.result) return [];
    var h = run.party[B.prompt];
    var acts = [];
    acts.push({ kind: 'attack', targets: targetsFor(run, h, 'enemy') });
    h.skills.forEach(function (sid) {
      var s = D.skills[sid];
      if (h.mp < s.mp) return;
      var t = targetsFor(run, h, s.target);
      if (t && !t.length) return;
      acts.push({ kind: 'skill', id: sid, targets: t });
    });
    var tr = techReady(run, h);
    if (tr.ok) {
      var tt = D.techs[tr.id];
      var tg = targetsFor(run, h, tt.target);
      if (!(tg && !tg.length)) acts.push({ kind: 'tech', id: tr.id, targets: tg });
    }
    var seen = {};
    run.items.forEach(function (it) {
      if (seen[it]) return; seen[it] = true;
      var t = targetsFor(run, h, D.items[it].target);
      if (t && !t.length) return;
      acts.push({ kind: 'item', id: it, targets: t });
    });
    acts.push({ kind: 'defend', targets: null });
    var p = partnerOf(run, h);
    if (p && alive(p) && !p.ready && !p.st.stun) acts.push({ kind: 'hold', targets: null });
    return acts;
  }

  function doAction(run, action) {
    var B = run.battle;
    var hi = B.prompt;
    var h = run.party[hi];
    var m = mods(run);
    var events = [];
    var legal = legalActions(run).filter(function (a) { return a.kind === action.kind && a.id === action.id; })[0];
    if (!legal) throw new Error('ação ilegal: ' + JSON.stringify(action));
    if (legal.targets && legal.targets.indexOf(action.target) < 0) throw new Error('alvo ilegal');
    run.stats.decisions++;
    var targetUnit = function (type, idx) {
      if (type === 'enemy') return [B.enemies[idx]];
      if (type === 'ally' || type === 'deadAlly' || type === 'partner') return [run.party[idx]];
      if (type === 'enemies') return B.enemies.filter(alive);
      if (type === 'allies') return run.party.filter(alive);
      if (type === 'self') return [h];
      return [];
    };
    var finish = [h];
    if (action.kind === 'hold') {
      h.held = true;
      B.prompt = null;
      events.push({ e: 'hold', who: unitRef(run, h) });
      afterAction(run, events);
      return events;
    }
    if (action.kind === 'attack') {
      events.push({ e: 'act', who: unitRef(run, h), name: 'Atacar', basic: true });
      var tgt = B.enemies[action.target];
      if (m.doubleAttack) {
        applyFx(run, h, [{ t: 'dmg', stat: 'atk', pow: 0.85 }], [tgt], events, { attack: true });
        var t2 = alive(tgt) ? tgt : B.enemies.filter(alive)[0];
        if (t2) applyFx(run, h, [{ t: 'dmg', stat: 'atk', pow: 0.85 }], [t2], events, { attack: true });
      } else applyFx(run, h, [{ t: 'dmg', stat: 'atk', pow: 1 }], [tgt], events, { attack: true });
    } else if (action.kind === 'skill') {
      var s = D.skills[action.id];
      h.mp -= s.mp;
      events.push({ e: 'act', who: unitRef(run, h), name: s.name, skill: action.id });
      applyFx(run, h, s.fx, targetUnit(s.target, action.target), events, { skill: true });
      if (m.echo && rnd(run) < m.echo && B.enemies.some(alive) && run.party.some(alive)) {
        var tu = targetUnit(s.target, action.target).filter(function (u) { return s.target === 'deadAlly' ? !alive(u) : alive(u); });
        if (s.target === 'enemy' && !tu.length) tu = [B.enemies.filter(alive)[0]];
        if (tu.length && tu[0]) { events.push({ e: 'act', who: unitRef(run, h), name: s.name + ' (eco)', skill: action.id }); applyFx(run, h, s.fx, tu, events, { skill: true }); }
      }
    } else if (action.kind === 'tech') {
      var T = D.techs[action.id];
      var p = partnerOf(run, h);
      h.mp -= techCost(run, action.id, h.id);
      p.mp -= techCost(run, action.id, p.id);
      events.push({ e: 'act', who: unitRef(run, h), partner: unitRef(run, p), name: T.name, tech: action.id });
      applyFx(run, [h, p], T.fx, targetUnit(T.target, action.target), events, { tech: true });
      if (m.techBuff) { addStatus(run, h, 'atkUp', 3, events); addStatus(run, p, 'atkUp', 3, events); }
      finish.push(p);
    } else if (action.kind === 'item') {
      var it = D.items[action.id];
      run.items.splice(run.items.indexOf(action.id), 1);
      events.push({ e: 'act', who: unitRef(run, h), name: it.name, item: action.id });
      applyFx(run, h, it.fx, targetUnit(it.target, action.target), events, { item: true });
    } else if (action.kind === 'defend') {
      events.push({ e: 'act', who: unitRef(run, h), name: 'Defender' });
      addStatus(run, h, 'guard', 1, events);
      var before = h.mp; h.mp = Math.min(h.maxMp, h.mp + D.rules.defendMp);
      if (h.mp > before) events.push({ e: 'mp', to: unitRef(run, h), v: h.mp - before, mp: h.mp });
    }
    finish.forEach(function (u) { u.atb = 0; u.ready = false; u.held = false; u.started = false; });
    B.prompt = null;
    B.turn++;
    afterAction(run, events);
    return events;
  }

  function afterAction(run, events) {
    checkEnd(run, events);
    var B = run.battle;
    if (B.result) return;
    // se outra heroína já está pronta, ela recebe o turno
    for (var j = 0; j < run.party.length; j++) {
      var h = run.party[j];
      if (h.ready && alive(h) && !h.held) {
        if (!h.started) {
          h.started = true;
          startTurn(run, h, events);
          if (!alive(h)) { checkEnd(run, events); if (B.result) return; continue; }
          if (h.skip) { h.skip = false; h.ready = false; h.started = false; h.atb = 0; continue; }
        }
        B.prompt = j; return;
      }
    }
  }

  // Avança o combate até precisar de decisão ou terminar (usado pelo simulador).
  function runUntilDecision(run) {
    var B = run.battle, guard = 0;
    while (!B.result && B.prompt == null) {
      stepBattle(run);
      if (++guard > D.rules.tickCap + 10) { B.result = 'timeout'; break; }
    }
  }

  // ---------------------------------------------------------------- pós-combate e recompensas
  function relicPool(run, rarity) {
    return Object.keys(D.relics).filter(function (r) {
      return run.relics.indexOf(r) < 0 && (!rarity || D.relics[r].rarity === rarity);
    });
  }
  function skillPool(run) {
    var out = [];
    run.party.forEach(function (h) {
      D.heroes[h.id].learn.forEach(function (s) { if (h.skills.indexOf(s) < 0) out.push({ kind: 'skill', id: s, hero: h.id }); });
    });
    return out;
  }
  function itemChoice(run) {
    var r = rnd(run);
    if (r < 0.06) return 'elixir';
    return pick(run, ['erva', 'erva', 'eter', 'pluma', 'bomba', 'cha']);
  }

  function buildRewards(run, kind) {
    var n = D.rules.rewardChoices + (run.metaMod._rewardChoices || 0);
    var opts = [];
    if (kind === 'boss') {
      var rare = shuffle(run, relicPool(run, 'r'));
      var more = shuffle(run, relicPool(run, 'c'));
      opts = rare.slice(0, 2).concat(more).slice(0, n).map(function (r) { return { kind: 'relic', id: r }; });
      return opts;
    }
    var skills = shuffle(run, skillPool(run));
    var relics = shuffle(run, relicPool(run, 'c'));
    var used = {};
    var guard = 0;
    while (opts.length < n && guard++ < 50) {
      var r = rnd(run), o = null;
      if (r < 0.42 && skills.length) o = skills.shift();
      else if (r < 0.65 && relics.length) o = { kind: 'relic', id: relics.shift() };
      else o = { kind: 'item', id: itemChoice(run) };
      var k = o.kind + o.id;
      if (used[k]) continue;
      used[k] = true; opts.push(o);
    }
    return opts;
  }

  function finishBattle(run) {
    var B = run.battle;
    var m = mods(run);
    var res = B.result;
    var events = [];
    run.party.forEach(function (h) { h.st = {}; h.ready = false; h.held = false; h.started = false; h.atb = 0; });
    if (res !== 'win') {
      run.phase = 'over';
      run.over = { won: false, cause: res, act: run.act, enemies: B.group.slice() };
      run.battle = null;
      return { events: events };
    }
    var xp = B.enemies.reduce(function (s, e) { return s + D.enemies[e.id].xp; }, 0);
    run.party.forEach(function (h) {
      if (!alive(h)) { h.hp = Math.max(1, Math.round(h.maxHp * D.rules.koReviveFrac)); }
      gainXp(run, h, xp, events);
      h.mp = Math.min(h.maxMp, h.mp + Math.round(h.maxMp * D.rules.postMpFrac));
      if (m.postHeal) h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * m.postHeal));
    });
    var gained = [];
    if (B.kind === 'elite') {
      run.stats.elites++;
      var pool = relicPool(run, null);
      if (pool.length) { var rr = pick(run, pool); run.relics.push(rr); recalcAll(run); gained.push({ kind: 'relic', id: rr }); }
    }
    if (B.kind === 'boss') {
      run.stats.bosses++;
      if (run.act >= D.acts.length - 1) {
        run.stats.floors++;
        run.phase = 'over'; run.over = { won: true }; run.battle = null;
        return { events: events };
      }
      run.party.forEach(function (h) { h.hp = h.maxHp; h.mp = h.maxMp; });
    }
    if (B.kind !== 'boss' && run.items.length < D.rules.itemSlots && rnd(run) < D.rules.itemDropChance + (m.itemFind || 0)) {
      var it = itemChoice(run); run.items.push(it); gained.push({ kind: 'item', id: it });
    }
    run.phase = 'reward';
    run.pending = { kind: B.kind, xp: xp, gained: gained, options: buildRewards(run, B.kind), boss: B.kind === 'boss' ? B.group[0] : null };
    run.battle = null;
    return { events: events };
  }

  function grant(run, o) {
    if (o.kind === 'relic') { run.relics.push(o.id); recalcAll(run); }
    else if (o.kind === 'item') { if (run.items.length < D.rules.itemSlots) run.items.push(o.id); }
    else if (o.kind === 'skill') {
      var h = run.party.filter(function (x) { return x.id === o.hero; })[0];
      if (h && h.skills.indexOf(o.id) < 0) h.skills.push(o.id);
    }
  }

  function chooseReward(run, idx) {
    if (run.phase !== 'reward' && run.phase !== 'treasure') throw new Error('sem recompensa');
    run.stats.decisions++;
    var o = idx >= 0 ? run.pending.options[idx] : null;
    if (o) { grant(run, o); run.log.push({ t: 'pick', kind: o.kind, id: o.id, offered: run.pending.options.map(function (x) { return x.kind + ':' + x.id; }) }); }
    else run.log.push({ t: 'skip', offered: run.pending.options.map(function (x) { return x.kind + ':' + x.id; }) });
    completeNode(run);
  }

  function restChoice(run, choice) {
    if (run.phase !== 'rest') throw new Error('não está descansando');
    run.stats.decisions++;
    var events = [];
    if (choice === 'rest') {
      run.party.forEach(function (h) { h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * D.rules.restHeal)); h.mp = h.maxMp; });
    } else {
      run.party.forEach(function (h) { gainXp(run, h, Math.max(1, xpToNext(h)), events); });
    }
    run.log.push({ t: 'rest', choice: choice });
    completeNode(run);
    return events;
  }

  function eventChoice(run, idx) {
    if (run.phase !== 'event') throw new Error('sem evento');
    run.stats.decisions++;
    var ev = D.events[run.pending.id];
    var ch = ev.choices[idx];
    var out = [];
    applyEventFx(run, ch.fx, out);
    run.log.push({ t: 'event', id: run.pending.id, choice: idx });
    var story = out.filter(function (o) { return o.story; }).map(function (o) { return o.story; });
    var res = { lines: out.filter(function (o) { return o.text; }).map(function (o) { return o.text; }), story: story };
    if (!run.party.some(alive)) {
      // segurança: evento nunca mata (dano deixa 1 PV), mas por garantia
      run.party.forEach(function (h) { h.hp = Math.max(1, h.hp); });
    }
    completeNode(run);
    return res;
  }

  function applyEventFx(run, fxList, out) {
    fxList.forEach(function (fx) {
      if (fx.t === 'heal') { run.party.forEach(function (h) { h.hp = Math.min(h.maxHp, Math.max(1, h.hp) + Math.round(h.maxHp * fx.v)); }); out.push({ text: 'O grupo recupera ' + Math.round(fx.v * 100) + '% de PV.' }); }
      else if (fx.t === 'hurt') { run.party.forEach(function (h) { h.hp = Math.max(1, h.hp - Math.round(h.hp * fx.v)); }); out.push({ text: 'Vocês sentem as horas escorrerem.' }); }
      else if (fx.t === 'relic' || fx.t === 'rareRelic') {
        var pool = relicPool(run, fx.t === 'rareRelic' ? 'r' : 'c');
        if (!pool.length) pool = relicPool(run, null);
        if (pool.length) { var r = pick(run, pool); run.relics.push(r); recalcAll(run); out.push({ text: 'Relíquia: ' + D.relics[r].name + '.' }); run.log.push({ t: 'pick', kind: 'relic', id: r, offered: ['relic:' + r], free: true }); }
      } else if (fx.t === 'item') {
        if (run.items.length < D.rules.itemSlots) { run.items.push(fx.id); out.push({ text: 'Item: ' + D.items[fx.id].name + '.' }); }
        else out.push({ text: 'A bolsa está cheia.' });
      } else if (fx.t === 'xp') { var ev = []; run.party.forEach(function (h) { gainXp(run, h, fx.v, ev); }); out.push({ text: '+' + fx.v + ' XP.' }); }
      else if (fx.t === 'skill') {
        var sp = skillPool(run);
        if (sp.length) { var s = pick(run, sp); grant(run, s); out.push({ text: D.heroes[s.hero].name + ' aprende ' + D.skills[s.id].name + '.' }); }
        else { var e2 = []; run.party.forEach(function (h) { gainXp(run, h, 30, e2); }); out.push({ text: '+30 XP.' }); }
      } else if (fx.t === 'maxHp') { run.party.forEach(function (h) { h.bonusHp += fx.v; recalcHero(run, h); }); out.push({ text: '+' + fx.v + ' PV máx.' }); }
      else if (fx.t === 'gamble') {
        if (rnd(run) < fx.chance) { out.push({ text: 'Sorte!' }); applyEventFx(run, fx.win, out); }
        else { out.push({ text: 'Azar...' }); applyEventFx(run, fx.lose, out); }
      } else if (fx.t === 'story') out.push({ story: fx.id });
    });
  }

  // ---------------------------------------------------------------- meta-progresso
  function newMeta() {
    return { v: 1, ecos: 0, totalEcos: 0, upgrades: {}, deaths: 0, victories: 0, runs: 0, bossKills: {}, heroDeaths: {}, seen: [], bestFloor: 0 };
  }
  function ecosFor(run) {
    var E = D.meta.ecos;
    return run.stats.floors * E.perFloor + run.stats.elites * E.perElite + run.stats.bosses * E.perBoss + (run.over && run.over.won ? E.victory : 0);
  }
  function endRun(meta, run) {
    var gained = ecosFor(run);
    meta.ecos += gained; meta.totalEcos += gained; meta.runs++;
    meta.bestFloor = Math.max(meta.bestFloor, run.stats.floors);
    if (run.over && run.over.won) meta.victories++;
    else {
      meta.deaths++;
      run.party.forEach(function (h) { meta.heroDeaths[h.id] = (meta.heroDeaths[h.id] || 0) + 1; });
    }
    return gained;
  }
  function recordBoss(meta, bossId) { meta.bossKills[bossId] = (meta.bossKills[bossId] || 0) + 1; }
  function upgradeCost(meta, id) {
    var u = D.meta.upgrades[id], lvl = meta.upgrades[id] || 0;
    return lvl < u.costs.length ? u.costs[lvl] : null;
  }
  function buyUpgrade(meta, id) {
    var c = upgradeCost(meta, id);
    if (c == null || meta.ecos < c) return false;
    meta.ecos -= c; meta.upgrades[id] = (meta.upgrades[id] || 0) + 1;
    return true;
  }
  // Próximos trechos de história desbloqueados (máx. `limit`), marcados como vistos.
  function pullStory(meta, limit, forceIds) {
    var out = [];
    D.story.forEach(function (s) {
      if (meta.seen.indexOf(s.id) >= 0) return;
      var w = s.when, ok = false;
      if (w.intro) ok = true;
      else if (w.deaths) ok = meta.deaths >= w.deaths;
      else if (w.boss) ok = (meta.bossKills[w.boss] || 0) > 0;
      else if (w.victory) ok = meta.victories >= w.victory;
      else if (w.heroDeath) ok = (meta.heroDeaths[w.heroDeath] || 0) > 0;
      else if (w.event) ok = forceIds && forceIds.indexOf(s.id) >= 0;
      if (ok && out.length < (limit || 2)) { out.push(s); meta.seen.push(s.id); }
    });
    return out;
  }

  return {
    rnd: rnd, seedToStr: seedToStr, strToSeed: strToSeed, mods: mods, stat: stat, xpToNext: xpToNext,
    newRun: newRun, genMap: genMap, validateMap: validateMap, availableNodes: availableNodes, enterNode: enterNode,
    stepBattle: stepBattle, runUntilDecision: runUntilDecision, legalActions: legalActions, doAction: doAction,
    techFor: techFor, techReady: techReady, techCost: techCost, partnerOf: partnerOf, finishBattle: finishBattle,
    chooseReward: chooseReward, restChoice: restChoice, grant: grant, eventChoice: eventChoice,
    newMeta: newMeta, endRun: endRun, ecosFor: ecosFor, recordBoss: recordBoss, upgradeCost: upgradeCost,
    buyUpgrade: buyUpgrade, pullStory: pullStory, metaMods: metaMods, effSpd: effSpd, alive: alive
  };
})();
if (typeof module !== 'undefined') module.exports = ENGINE;
