// ============================================================================
// UI — telas, renderização em canvas e entrada por toque. Toda regra de jogo
// vem do ENGINE; aqui só se mostra o estado e se coletam decisões.
// ============================================================================
(function () {
  'use strict';
  var D = DATA, E = ENGINE;
  var LW = 108, LH = 80;                     // resolução lógica do palco de combate
  var KEYS = { meta: 'ecos-crepusculo-meta-v1', run: 'ecos-crepusculo-run-v1', settings: 'ecos-crepusculo-settings-v1' };

  // ---------------------------------------------------------------- armazenamento seguro
  var mem = {}, storageOk = true;
  function load(k, def) {
    try {
      var v = window.localStorage.getItem(k);
      if (v == null) return mem[k] !== undefined ? JSON.parse(mem[k]) : def;
      return JSON.parse(v);
    } catch (e) { storageOk = false; return mem[k] !== undefined ? JSON.parse(mem[k]) : def; }
  }
  function save(k, v) {
    var s = JSON.stringify(v);
    mem[k] = s;
    try { window.localStorage.setItem(k, s); } catch (e) { storageOk = false; }
  }
  function drop(k) { delete mem[k]; try { window.localStorage.removeItem(k); } catch (e) { /* ignora */ } }

  var S = {
    screen: 'title', run: null, meta: null, sel: [], settings: { muted: false, speed: 2 },
    storyQueue: [], after: null, menu: null, busy: false
  };
  function loadMeta() {
    var m = load(KEYS.meta, null), base = E.newMeta();
    if (m && typeof m === 'object') for (var k in base) if (m[k] !== undefined) base[k] = m[k];
    return base;
  }
  function saveMeta() { save(KEYS.meta, S.meta); }
  function saveRun() { if (S.run && S.run.phase !== 'over') save(KEYS.run, S.run); }
  function saveSettings() { save(KEYS.settings, S.settings); }

  // ---------------------------------------------------------------- DOM helpers
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function btn(label, onTap, cls, attrs) {
    var a = attrs || {};
    a.class = 'btn ' + (cls || '');
    a.type = 'button';
    var b = el('button', a, Array.isArray(label) ? label : [label]);
    b.addEventListener('click', function (ev) {
      AUDIO.unlock();
      if (b.getAttribute('aria-disabled') === 'true') { if (a['data-why']) say(a['data-why']); AUDIO.sfx('deny'); return; }
      AUDIO.sfx('cursor');
      onTap(ev);
    });
    return b;
  }
  var view, bar, where, sndBtn, spdBtn, seedChip;
  function toast(text) {
    var t = el('div', { class: 'toast', role: 'status', text: text });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  // ---------------------------------------------------------------- sprites -> canvas
  var spriteCache = {};
  function spriteCanvas(id, pal, mode) {
    var key = id + '|' + (pal || '') + '|' + (mode || '');
    if (spriteCache[key]) return spriteCache[key];
    var s = SPRITES.get(id, pal);
    var c = document.createElement('canvas'); c.width = s.w; c.height = s.h;
    var x = c.getContext('2d'), img = x.createImageData(s.w, s.h);
    s.px.forEach(function (col, i) {
      if (!col) return;
      var r = parseInt(col.slice(1, 3), 16), g = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
      if (mode === 'white') { r = g = b = 255; }
      else if (mode === 'shadow') { r = 20; g = 16; b = 24; }
      else if (mode === 'gray') { var l = (r * 0.3 + g * 0.59 + b * 0.11) * 0.55; r = g = b = l; }
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    });
    x.putImageData(img, 0, 0);
    spriteCache[key] = c;
    return c;
  }
  function enemySprite(e) { var d = D.enemies[e.id]; return { id: d.sprite, pal: d.pal || null }; }
  function bigSprite(id, pal, scale) {
    var src = spriteCanvas(id, pal);
    var c = el('canvas', { class: 'px', width: src.width, height: src.height, 'aria-hidden': 'true' });
    c.getContext('2d').drawImage(src, 0, 0);
    c.style.width = src.width * scale + 'px'; c.style.height = src.height * scale + 'px';
    return c;
  }

  // ícones 9x9 dos nós do mapa
  var ICONS = {
    combat: ['........k', '.......kw', '......kwk', '.k...kwk.', '..k.kwk..', '...kwk...', '..kkk....', '.k...k...', 'k........'],
    elite: ['..kkkkk..', '.kwwwwwk.', 'kwwwwwwwk', 'kwkkwkkwk', 'kwkkwkkwk', 'kwwwkwwwk', '.kwwwwwk.', '..kwkwk..', '..kkkkk..'],
    event: ['..kkkkk..', '.kwwwwwk.', '.kwk.kwk.', '....kwwk.', '...kwwk..', '...kwk...', '...kkk...', '...kwk...', '...kkk...'],
    rest: ['...kkkk..', '..kwwk...', '.kwwk....', '.kwwk....', '.kwwk....', '.kwwk....', '..kwwk...', '...kwwkk.', '....kkk..'],
    treasure: ['.........', '.kkkkkkk.', 'kwwwwwwwk', 'kkkkkkkkk', 'kwwwkwwwk', 'kwwkwkwwk', 'kwwwkwwwk', 'kwwwwwwwk', 'kkkkkkkkk'],
    boss: ['.........', 'k.k.k.k.k', 'kwkwkwkwk', 'kwwwwwwwk', 'kwwkwkwwk', 'kwwwwwwwk', 'kwwwwwwwk', 'kkkkkkkkk', '.........']
  };
  var ICOL = { combat: '#f4e9d8', elite: '#ff7a6a', event: '#9ad0ff', rest: '#ffd860', treasure: '#f3a64a', boss: '#ff5050' };
  function icon(type) {
    var c = el('canvas', { class: 'px', width: 9, height: 9, 'aria-hidden': 'true' });
    var x = c.getContext('2d');
    ICONS[type].forEach(function (row, y) {
      for (var i = 0; i < 9; i++) {
        if (row[i] === 'w') { x.fillStyle = ICOL[type]; x.fillRect(i, y, 1, 1); }
        else if (row[i] === 'k') { x.fillStyle = '#0d0a1c'; x.fillRect(i, y, 1, 1); }
      }
    });
    return c;
  }
  var NODE_NAME = { combat: 'Combate', elite: 'Elite', event: 'Mistério', rest: 'Fogueira', treasure: 'Tesouro', boss: 'Chefe' };

  // ---------------------------------------------------------------- barra superior
  function setBar() {
    var r = S.run;
    seedChip.hidden = !r;
    if (r) seedChip.textContent = '#' + E.seedToStr(r.seed);
    var txt = '';
    if (r && S.screen !== 'over') {
      var row = r.pos && r.map[r.pos] ? r.map[r.pos].row + 1 : 0;
      txt = 'ATO ' + (r.act + 1) + ' · ' + D.acts[r.act].name.toUpperCase() + (row ? ' · ' + Math.min(row, 7) + '/7' : '');
    } else if (S.screen === 'title') txt = 'ECOS: ' + S.meta.ecos;
    where.textContent = txt;
    spdBtn.hidden = S.screen !== 'battle';
    spdBtn.textContent = S.settings.speed + 'x';
    sndBtn.textContent = S.settings.muted ? 'SOM:NÃO' : 'SOM:SIM';
    sndBtn.setAttribute('aria-pressed', String(!S.settings.muted));
  }

  function go(screen) {
    S.screen = screen;
    S.menu = null;
    if (screen !== 'battle') stopBattleLoop();
    view.innerHTML = '';
    view.scrollTop = 0;
    setBar();
    var f = SCREENS[screen];
    f();
    var first = view.querySelector('.btn.primary, .node.avail, .btn');
    if (first && document.activeElement && document.activeElement !== document.body) { try { first.focus({ preventScroll: true }); } catch (e) { /* ignora */ } }
  }

  // ---------------------------------------------------------------- arte do título
  function drawSky(x, w, h, act, t) {
    var sky = D.acts[act].sky;
    var band = Math.ceil(h * 0.62 / sky.length);
    for (var i = 0; i < sky.length; i++) {
      x.fillStyle = sky[i]; x.fillRect(0, i * band, w, band);
      if (i > 0) { x.fillStyle = sky[i]; for (var px = (i % 2); px < w; px += 2) x.fillRect(px, i * band - 1, 1, 1); }
    }
    var hz = Math.floor(h * 0.42);
    if (act === 0) { // o sol parado no horizonte
      x.fillStyle = '#ffe08a'; for (var r = 9; r >= 0; r--) { var ww = Math.floor(Math.sqrt(81 - r * r)); x.fillRect(Math.floor(w * 0.7) - ww, hz - r, ww * 2, 1); }
    } else if (act === 1) {
      x.fillStyle = '#7ad8f0';
      [[10, 6], [30, 9], [55, 5], [80, 8], [98, 6]].forEach(function (c) { for (var k = 0; k < c[1]; k++) x.fillRect(c[0] - Math.floor(k / 3), hz - k, 1 + Math.floor(k / 3) * 2 > 3 ? 3 : 1 + Math.floor(k / 3) * 2, 1); });
    } else {
      x.fillStyle = '#d08a4a'; x.fillRect(Math.floor(w * 0.5) - 1, 2, 3, hz - 2);
      x.fillStyle = '#5a2a5a'; for (var a = 0; a < 16; a++) x.fillRect(Math.floor(w * 0.5 + Math.cos(a / 16 * 6.28) * 7), Math.floor(10 + Math.sin(a / 16 * 6.28) * 7), 2, 2);
    }
    var gr = D.acts[act].ground;
    x.fillStyle = gr[0]; x.fillRect(0, hz, w, h - hz);
    x.fillStyle = gr[1];
    for (var yy = hz + 2; yy < h; yy += 3) for (var xx = (yy % 6); xx < w; xx += 6) x.fillRect(xx, yy, 2, 1);
  }
  function titleArt() {
    var w = 108, h = 64;
    var c = el('canvas', { class: 'px', width: w, height: h, 'aria-hidden': 'true' });
    var x = c.getContext('2d');
    drawSky(x, w, h, 0, 0);
    // a torre ao longe
    x.fillStyle = '#2a1830'; x.fillRect(20, 6, 8, 22); x.fillRect(18, 4, 12, 3); x.fillRect(23, 0, 2, 4);
    x.fillStyle = '#ffd860'; x.fillRect(23, 10, 2, 2);
    ['rocca', 'lume', 'pena', 'sino'].forEach(function (id, i) { x.drawImage(spriteCanvas(id), 30 + i * 18, 40); });
    return el('div', { class: 'title-art' }, [c]);
  }

  // ---------------------------------------------------------------- TELAS
  var SCREENS = {};

  SCREENS.title = function () {
    AUDIO.music('vesper');
    var hasRun = !!load(KEYS.run, null);
    var seenN = S.meta.seen.length, totalN = D.story.length;
    var seedIn = el('input', { class: 'seed', id: 'seedInput', placeholder: 'Semente (opcional)', maxlength: '16', autocomplete: 'off', 'aria-label': 'Semente da jornada (opcional)' });
    view.appendChild(titleArt());
    view.appendChild(el('h1', { class: 'logo', text: 'ECOS DO CREPÚSCULO' }));
    view.appendChild(el('p', { class: 'sub', text: 'Faz cem anos que é fim de tarde em Vésper.' }));
    var col = el('div', { class: 'stack' });
    if (hasRun) col.appendChild(btn('Continuar jornada', continueRun, 'primary'));
    col.appendChild(btn('Nova jornada', function () {
      S.customSeed = seedIn.value.trim();
      if (hasRun) drop(KEYS.run);
      var intro = E.pullStory(S.meta, 1).filter(function (s) { return s.id === 'intro'; });
      saveMeta();
      if (intro.length) showStory(intro, function () { go('party'); });
      else go('party');
    }, hasRun ? '' : 'primary'));
    col.appendChild(el('div', { class: 'grid2' }, [
      btn('Santuário', function () { go('sanctuary'); }),
      btn('Crônicas ' + seenN + '/' + totalN, function () { go('chronicles'); })
    ]));
    col.appendChild(btn('Como jogar', function () { go('help'); }));
    col.appendChild(seedIn);
    view.appendChild(col);
    var info = 'Jornadas: ' + S.meta.runs + ' · Vitórias: ' + S.meta.victories + ' · Ecos: ' + S.meta.ecos;
    view.appendChild(el('p', { class: 'note', text: info }));
    if (!storageOk) view.appendChild(el('p', { class: 'note', text: 'Este navegador não deixa salvar. Dá para jogar, mas o progresso some ao fechar.' }));
  };

  SCREENS.help = function () {
    var w = el('div', { class: 'win stack' });
    w.appendChild(el('h2', { text: 'Como jogar' }));
    [
      'Cada jornada: escolha 2 heroínas e suba 3 atos até a Torre. No mapa, toque no próximo destino.',
      'Combate em tempo ativo: cada barra amarela enche conforme a velocidade. Barra cheia, é a sua vez. Enquanto você escolhe, o tempo pausa.',
      'DUPLA: com as duas barras cheias e MP suficiente, as heroínas combinam uma Técnica Dupla. SEGURAR guarda o turno de uma até a parceira ficar pronta.',
      'Depois de cada vitória, escolha uma recompensa: técnica nova, relíquia ou item.',
      'Se o grupo cair, o dia recomeça. Você leva os Ecos: gaste no Santuário. A cada volta, a história revela mais.',
      'A semente aparece no topo (#). A mesma semente com as mesmas escolhas repete a mesma jornada.'
    ].forEach(function (t) { w.appendChild(el('p', { text: t, style: 'margin:0' })); });
    view.appendChild(w);
    view.appendChild(btn('Voltar', function () { go('title'); }, 'primary'));
  };

  SCREENS.party = function () {
    S.sel = S.sel.filter(function (id) { return D.heroes[id]; }).slice(0, 2);
    view.appendChild(el('div', { class: 'h', text: 'Escolha duas heroínas' }));
    var g = el('div', { class: 'grid2' });
    Object.keys(D.heroes).forEach(function (id) {
      var hd = D.heroes[id];
      var on = S.sel.indexOf(id) >= 0;
      var b = btn([
        el('div', { class: 'row' }, [bigSprite(id, null, 3), el('div', { class: 'grow' }, [el('div', { class: 'nm', text: hd.name }), el('div', { class: 'rl', text: hd.role })])]),
        el('div', { class: 'stats' }, ['PV ' + hd.hp, 'MP ' + hd.mp, 'VEL ' + hd.spd, 'ATQ ' + hd.atk, 'MAG ' + hd.mag, 'DEF ' + hd.def].map(function (t) { return el('span', { text: t }); })),
        el('div', { class: 'muted', text: hd.blurb })
      ], function () {
        var i = S.sel.indexOf(id);
        if (i >= 0) S.sel.splice(i, 1); else { S.sel.push(id); if (S.sel.length > 2) S.sel.shift(); }
        go('party');
      }, 'card' + (on ? ' sel' : ''), { 'aria-pressed': String(on) });
      g.appendChild(b);
    });
    view.appendChild(g);
    var tw = el('div', { class: 'win' });
    if (S.sel.length === 2) {
      var tmp = { party: S.sel.map(function (id) { return { id: id }; }) };
      var tid = null;
      for (var t in D.techs) { var p = D.techs[t].pair; if (S.sel.indexOf(p[0]) >= 0 && S.sel.indexOf(p[1]) >= 0) tid = t; }
      tw.appendChild(el('div', { class: 'speaker', text: 'Técnica Dupla: ' + D.techs[tid].name }));
      tw.appendChild(el('div', { text: D.techs[tid].desc }));
    } else tw.appendChild(el('div', { class: 'muted', text: 'Cada dupla tem uma Técnica Dupla própria.' }));
    view.appendChild(tw);
    view.appendChild(el('div', { class: 'grid2 dock' }, [
      btn('Voltar', function () { go('title'); }),
      btn('Partir', startRun, 'primary', S.sel.length === 2 ? {} : { 'aria-disabled': 'true', 'data-why': 'Escolha duas heroínas.' })
    ]));
  };

  function randomSeed() {
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0]; } catch (e) { return (Date.now() * 2654435761) >>> 0; }
  }
  function startRun() {
    var seed = S.customSeed ? E.strToSeed(S.customSeed) : randomSeed();
    S.run = E.newRun(seed, S.sel.slice(), S.meta);
    saveRun();
    go('map');
  }
  function continueRun() {
    var r = load(KEYS.run, null);
    if (!r || !r.party) { drop(KEYS.run); go('title'); return; }
    S.run = r;
    resumePhase();
  }
  function resumePhase() {
    var p = S.run.phase;
    if (p === 'battle') startBattleView();
    else if (p === 'over') endRunFlow();
    else go(p === 'treasure' ? 'reward' : p);
  }

  // ---------------------------------------------------------------- mapa
  function partyMini() {
    var wrap = el('div', { class: 'party win' });
    S.run.party.forEach(function (h) {
      wrap.appendChild(el('div', { class: 'pm' + (h.hp <= 0 ? ' ko' : '') }, [
        el('span', { class: 'n', text: h.name }),
        el('div', {}, [el('div', { class: 'lbl' }, [el('span', { text: 'PV' }), el('span', { text: h.hp + '/' + h.maxHp })]), barEl('', h.hp / h.maxHp)]),
        el('div', {}, [el('div', { class: 'lbl' }, [el('span', { text: 'MP' }), el('span', { text: h.mp + '/' + h.maxMp })]), barEl('mp', h.mp / h.maxMp)]),
        el('div', { class: 'sts', text: 'Nv ' + h.lvl + ' · ' + h.skills.length + ' técnicas' })
      ]));
    });
    return wrap;
  }
  function barEl(cls, f) {
    var i = el('i'); i.style.width = Math.max(0, Math.min(1, f)) * 100 + '%';
    return el('div', { class: 'bar ' + cls, role: 'presentation' }, [i]);
  }

  SCREENS.map = function () {
    var r = S.run;
    AUDIO.music('vesper');
    view.appendChild(partyMini());
    view.appendChild(el('div', { class: 'row' }, [
      el('div', { class: 'h grow', text: D.acts[r.act].name, style: 'margin:0' }),
      btn('Bolsa', openBag, 'chip')
    ]));
    var avail = E.availableNodes(r);
    var rows = D.map.rows, cols = D.map.cols;
    var W = Math.min(view.clientWidth || 328, 448), RH = 66, H = (rows + 1) * RH + 20;
    var map = el('div', { class: 'map', style: 'height:' + H + 'px;width:' + W + 'px' });
    var visited = {};
    (r.visited || []).forEach(function (id) { visited[id] = true; });
    function pos(n) {
      if (n.id === 'boss') return [W / 2, 36];
      var hsh = 0; for (var i = 0; i < n.id.length; i++) hsh = (hsh * 31 + n.id.charCodeAt(i)) & 255;
      return [(n.col + 0.5) / cols * W + ((hsh % 9) - 4), (rows - n.row) * RH + 36 + ((hsh >> 3) % 7) - 3];
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    Object.keys(r.map).forEach(function (id) {
      var n = r.map[id], a = pos(n);
      n.next.forEach(function (nx) {
        var b = pos(r.map[nx]);
        var hot = (r.pos === id || (r.pos == null && n.row === 0 && false)) && avail.indexOf(nx) >= 0;
        svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (hot ? '#ffd860' : '#4a3a60') + '" stroke-width="' + (hot ? 3 : 2) + '" stroke-dasharray="' + (hot ? '0' : '4 4') + '"/>';
      });
    });
    svg += '</svg>';
    map.innerHTML = svg;
    Object.keys(r.map).forEach(function (id) {
      var n = r.map[id], p = pos(n);
      var isAvail = avail.indexOf(id) >= 0;
      var cls = 'node' + (n.type === 'boss' ? ' boss' : '') + (isAvail ? ' avail' : '') + (r.pos === id ? ' here' : '') + (!isAvail && r.pos !== id ? ' locked' : '');
      var b = el('button', { class: cls, type: 'button', 'aria-label': NODE_NAME[n.type] + (isAvail ? ' (disponível)' : ''), 'data-node': id,
        style: 'left:' + p[0] + 'px;top:' + p[1] + 'px', disabled: isAvail ? false : 'disabled' }, [icon(n.type)]);
      if (isAvail) b.addEventListener('click', function () { AUDIO.unlock(); AUDIO.sfx('select'); enterNode(id); });
      map.appendChild(b);
    });
    view.appendChild(map);
    var lg = el('div', { class: 'legend' });
    ['combat', 'elite', 'event', 'rest', 'treasure', 'boss'].forEach(function (t) { lg.appendChild(el('span', {}, [icon(t), NODE_NAME[t]])); });
    view.appendChild(lg);
    // rola até a próxima escolha
    setTimeout(function () {
      var a = map.querySelector('.node.avail');
      if (a) { var top = a.offsetTop + map.offsetTop - view.clientHeight / 2; view.scrollTop = Math.max(0, top); }
    }, 0);
  };

  function enterNode(id) {
    var r = S.run;
    r.visited = (r.visited || []).concat([id]);
    var phase = E.enterNode(r, id);
    saveRun();
    if (phase === 'battle') startBattleView();
    else go(phase === 'treasure' ? 'reward' : phase);
  }

  function openBag() {
    var r = S.run;
    var w = el('div', { class: 'win' });
    var ov = el('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Bolsa' }, [w]);
    w.appendChild(el('h2', { text: 'Relíquias (' + r.relics.length + ')' }));
    if (!r.relics.length) w.appendChild(el('div', { class: 'muted', text: 'Nenhuma ainda.' }));
    r.relics.forEach(function (id) { var x = D.relics[id]; w.appendChild(el('div', {}, [el('div', { class: 'speaker', text: x.name, style: 'margin:0' }), el('div', { class: 'muted', text: x.desc })])); });
    w.appendChild(el('h2', { text: 'Itens (' + r.items.length + '/' + D.rules.itemSlots + ')' }));
    if (!r.items.length) w.appendChild(el('div', { class: 'muted', text: 'Bolsa vazia.' }));
    r.items.forEach(function (id) { w.appendChild(el('div', { text: D.items[id].name + ' · ' + D.items[id].desc })); });
    r.party.forEach(function (h) {
      w.appendChild(el('h2', { text: h.name + ' · Nv ' + h.lvl }));
      w.appendChild(el('div', { class: 'muted', text: 'ATQ ' + E.stat(r, h, 'atk') + ' · MAG ' + E.stat(r, h, 'mag') + ' · DEF ' + E.stat(r, h, 'def') + ' · VEL ' + E.stat(r, h, 'spd') }));
      h.skills.forEach(function (s) { w.appendChild(el('div', { text: D.skills[s].name + ' (' + D.skills[s].mp + ' MP) · ' + D.skills[s].desc })); });
    });
    var tid = E.techFor(r);
    if (tid) { w.appendChild(el('h2', { text: 'Técnica Dupla' })); w.appendChild(el('div', { text: D.techs[tid].name + ' · ' + D.techs[tid].desc })); }
    w.appendChild(el('div', { class: 'grid2' }, [
      btn('Abandonar', function () { ov.remove(); confirmAbandon(); }),
      btn('Fechar', function () { ov.remove(); }, 'primary')
    ]));
    document.body.appendChild(ov);
  }
  function confirmAbandon() {
    var w = el('div', { class: 'win' });
    var ov = el('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, [w]);
    w.appendChild(el('h2', { text: 'Abandonar a jornada?' }));
    w.appendChild(el('div', { text: 'Conta como queda: você recebe os Ecos dos andares já vencidos.' }));
    w.appendChild(el('div', { class: 'grid2' }, [
      btn('Continuar', function () { ov.remove(); }, 'primary'),
      btn('Abandonar', function () { ov.remove(); S.run.phase = 'over'; S.run.over = { won: false, cause: 'abandon', act: S.run.act, enemies: [] }; endRunFlow(); })
    ]));
    document.body.appendChild(ov);
  }

  // ---------------------------------------------------------------- recompensa / tesouro
  function optButton(o, onTap) {
    var kind, title, desc;
    if (o.kind === 'relic') { kind = 'Relíquia' + (D.relics[o.id].rarity === 'r' ? ' rara' : ''); title = D.relics[o.id].name; desc = D.relics[o.id].desc; }
    else if (o.kind === 'item') { kind = 'Item'; title = D.items[o.id].name; desc = D.items[o.id].desc; }
    else { kind = 'Técnica de ' + D.heroes[o.hero].name; title = D.skills[o.id].name + ' · ' + D.skills[o.id].mp + ' MP'; desc = D.skills[o.id].desc; }
    return btn([el('span', { class: 'k ' + o.kind, text: kind.toUpperCase() }), el('span', { class: 't', text: title }), el('span', { class: 'muted', text: desc })], onTap, 'opt');
  }
  SCREENS.reward = function () {
    var r = S.run, P = r.pending, treasure = r.phase === 'treasure';
    var w = el('div', { class: 'win' });
    if (treasure) {
      w.appendChild(el('h2', { text: 'Um baú esquecido' }));
      w.appendChild(el('div', { text: 'Dentro, duas relíquias. Só cabe uma na bolsa.' }));
    } else {
      w.appendChild(el('h2', { text: P.boss ? 'Chefe derrotado!' : 'Vitória!' }));
      w.appendChild(el('div', { text: '+' + P.xp + ' XP para cada heroína.' + (P.boss ? ' O grupo se recupera por completo.' : '') }));
      (S.levelUps || []).forEach(function (l) { w.appendChild(el('div', { style: 'color:var(--gold)', text: D.heroes[l.who].name + ' chegou ao nível ' + l.lvl + '!' })); });
      P.gained.forEach(function (g) {
        w.appendChild(el('div', { style: 'color:var(--amber)', text: (g.kind === 'relic' ? 'Relíquia obtida: ' + D.relics[g.id].name + ' (' + D.relics[g.id].desc + ')' : 'Encontrou: ' + D.items[g.id].name) }));
      });
      w.appendChild(el('div', { class: 'muted', text: 'Escolha uma recompensa:' }));
    }
    S.levelUps = null;
    view.appendChild(w);
    var list = el('div', { class: 'stack' });
    P.options.forEach(function (o, i) {
      var full = o.kind === 'item' && r.items.length >= D.rules.itemSlots;
      var b = optButton(o, function () { AUDIO.sfx('item'); E.chooseReward(r, i); afterNode(); });
      if (full) { b.setAttribute('aria-disabled', 'true'); b.addEventListener('click', function () { }); }
      list.appendChild(b);
    });
    view.appendChild(list);
    if (!treasure) view.appendChild(btn('Pular', function () { E.chooseReward(r, -1); afterNode(); }));
  };
  function afterNode() {
    if (S.run.phase === 'over') { endRunFlow(); return; }
    saveRun();
    go('map');
  }

  SCREENS.rest = function () {
    var r = S.run;
    view.appendChild(partyMini());
    var w = el('div', { class: 'win' });
    w.appendChild(el('h2', { text: 'Fogueira do Ocaso' }));
    w.appendChild(el('div', { text: 'O fogo estala. Por um instante, parece que a noite vai chegar.' }));
    view.appendChild(w);
    view.appendChild(btn([el('div', { text: 'Descansar' }), el('div', { class: 'muted', style: 'font-family:var(--body);font-size:18px', text: 'Cura ' + Math.round(D.rules.restHeal * 100) + '% do PV e todo o MP' })], function () { AUDIO.sfx('heal'); E.restChoice(r, 'rest'); afterNode(); }, 'primary'));
    view.appendChild(btn([el('div', { text: 'Treinar' }), el('div', { class: 'muted', style: 'font-family:var(--body);font-size:18px', text: 'As duas sobem um nível' })], function () { AUDIO.sfx('level'); E.restChoice(r, 'train'); afterNode(); }));
  };

  SCREENS.event = function () {
    var r = S.run, ev = D.events[r.pending.id];
    var w = el('div', { class: 'win' });
    w.appendChild(el('h2', { text: ev.title }));
    w.appendChild(el('div', { text: ev.text }));
    view.appendChild(w);
    ev.choices.forEach(function (c, i) {
      view.appendChild(btn(c.label, function () {
        var res = E.eventChoice(r, i);
        var out = el('div', { class: 'win' }, [el('h2', { text: ev.title })]);
        (res.lines.length ? res.lines : ['Vocês seguem em frente.']).forEach(function (t) { out.appendChild(el('div', { text: t })); });
        view.innerHTML = '';
        view.appendChild(partyMini());
        view.appendChild(out);
        view.appendChild(btn('Continuar', function () {
          var st = res.story.length ? E.pullStory(S.meta, 2, res.story) : [];
          saveMeta();
          if (st.length) showStory(st, afterNode); else afterNode();
        }, 'primary'));
        saveRun();
      }, i === 0 ? 'primary' : ''));
    });
  };

  // ---------------------------------------------------------------- história
  function showStory(list, then) {
    S.storyQueue = list.slice();
    S.after = then;
    go('story');
  }
  SCREENS.story = function () {
    var s = S.storyQueue[0];
    if (!s) { var f = S.after; S.after = null; (f || function () { go('title'); })(); return; }
    var portrait = { 'Clépsidra': ['clepsidra', 4], 'Grumbal': ['boss_grumbal', 2], 'Vitra': ['boss_vitra', 2], 'Morvane': ['boss_morvane', 2], 'Menina de Vidro': ['boss_vitra', 2] }[s.speaker] || ['clepsidra', 4];
    var idx = 0;
    var txt = el('div', { class: 'txt', 'aria-live': 'polite' });
    var w = el('div', { class: 'win story' }, [bigSprite(portrait[0], null, portrait[1]), el('div', { class: 'grow' }, [el('div', { class: 'speaker', text: s.speaker }), txt])]);
    view.appendChild(w);
    var typing = null;
    function show() {
      var full = s.lines[idx], n = 0;
      clearInterval(typing);
      txt.textContent = '';
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { txt.textContent = full; return; }
      typing = setInterval(function () { n += 2; txt.textContent = full.slice(0, n); if (n >= full.length) { clearInterval(typing); typing = null; } }, 30);
      AUDIO.sfx('bell');
    }
    var next = btn('Continuar >', function () {
      if (typing) { clearInterval(typing); typing = null; txt.textContent = s.lines[idx]; return; }
      idx++;
      if (idx < s.lines.length) show();
      else { S.storyQueue.shift(); go('story'); }
    }, 'primary', { id: 'storyNext' });
    view.appendChild(next);
    show();
  };

  SCREENS.chronicles = function () {
    view.appendChild(el('div', { class: 'h', text: 'Crônicas de Vésper' }));
    D.story.forEach(function (s) {
      var seen = S.meta.seen.indexOf(s.id) >= 0;
      var w = el('div', { class: 'win' });
      if (seen) { w.appendChild(el('div', { class: 'speaker', text: s.speaker })); s.lines.forEach(function (l) { w.appendChild(el('p', { text: l, style: 'margin:0 0 4px' })); }); }
      else w.appendChild(el('div', { class: 'muted', text: '??? — continue voltando.' }));
      view.appendChild(w);
    });
    view.appendChild(btn('Voltar', function () { go('title'); }, 'primary'));
  };

  SCREENS.sanctuary = function () {
    view.appendChild(el('div', { class: 'win' }, [
      el('h2', { text: 'Santuário da Última Hora' }),
      el('div', { text: 'Ecos disponíveis: ' + S.meta.ecos }),
      el('div', { class: 'muted', text: 'Jornadas ' + S.meta.runs + ' · Quedas ' + S.meta.deaths + ' · Vitórias ' + S.meta.victories + ' · Melhor andar ' + S.meta.bestFloor })
    ]));
    Object.keys(D.meta.upgrades).forEach(function (id) {
      var u = D.meta.upgrades[id], lvl = S.meta.upgrades[id] || 0, cost = E.upgradeCost(S.meta, id);
      var dots = ''; for (var i = 0; i < u.costs.length; i++) dots += i < lvl ? '■' : '□';
      var canBuy = cost != null && S.meta.ecos >= cost;
      view.appendChild(el('div', { class: 'win row' }, [
        el('div', { class: 'grow' }, [el('div', { class: 'speaker', text: u.name, style: 'margin:0' }), el('div', { text: u.desc }), el('div', { class: 'dots', text: dots })]),
        btn(cost == null ? 'MÁX' : cost + ' ecos', function () {
          if (E.buyUpgrade(S.meta, id)) { AUDIO.sfx('level'); saveMeta(); go('sanctuary'); }
        }, 'small', canBuy ? {} : { 'aria-disabled': 'true', 'data-why': cost == null ? 'Nível máximo.' : 'Faltam ' + (cost - S.meta.ecos) + ' Ecos.' })
      ]));
    });
    view.appendChild(btn('Voltar', function () { go('title'); }, 'primary'));
  };

  // ---------------------------------------------------------------- fim de jornada
  var lastEcos = 0;
  function endRunFlow() {
    var r = S.run;
    lastEcos = E.endRun(S.meta, r);
    saveMeta();
    drop(KEYS.run);
    AUDIO.music(null);
    AUDIO.sfx(r.over && r.over.won ? 'victory' : 'defeat');
    go('over');
  }
  SCREENS.over = function () {
    var r = S.run, won = r.over && r.over.won;
    var w = el('div', { class: 'win' });
    w.appendChild(el('h2', { text: won ? 'O sol se pôs em Vésper' : 'O dia recomeça...' }));
    w.appendChild(el('div', { text: won ? 'Morvane caiu. O Coração de Vésper voltou a bater.' : 'O grupo caiu no ' + D.acts[r.over.act || 0].name + '. A areia volta para o alto da ampulheta.' }));
    [['Andares vencidos', r.stats.floors], ['Combates', r.stats.battles], ['Elites', r.stats.elites], ['Chefes', r.stats.bosses], ['Ecos ganhos', '+' + lastEcos], ['Semente', '#' + E.seedToStr(r.seed)]]
      .forEach(function (kv) { w.appendChild(el('div', { class: 'kv' }, [el('span', { class: 'muted', text: kv[0] }), el('span', { text: String(kv[1]) })])); });
    view.appendChild(w);
    view.appendChild(btn('Voltar ao Santuário', function () {
      var st = E.pullStory(S.meta, 2);
      saveMeta();
      S.run = null;
      if (st.length) showStory(st, function () { go('title'); }); else go('title');
    }, 'primary', { id: 'overContinue' }));
  };

  // ================================================================ COMBATE
  var BV = { raf: 0, last: 0, acc: 0, queue: [], cur: null, t: 0, disp: {}, flash: {}, actor: [], particles: [], msg: '', who: '', fpsFrames: 0, ended: false };
  var stage, canvas, ctx, popLayer, partyBox, msgBox, cmdBox, scale = 3;

  function unitKey(ref) { return ref.side + ref.i; }
  function unitOf(ref) { return ref.side === 'h' ? S.run.party[ref.i] : S.run.battle.enemies[ref.i]; }

  function enemyAnchors(n) {
    return [[[24, 68]], [[17, 58], [40, 74]], [[14, 50], [37, 63], [14, 77]]][Math.min(n, 3) - 1];
  }
  function unitBox(ref) {
    if (ref.side === 'h') {
      var hp = [[78, 58], [94, 74]][ref.i];
      return { x: hp[0] - 8, y: hp[1] - 16, w: 16, h: 16 };
    }
    var B = S.run.battle, e = B.enemies[ref.i], sp = SPRITES.get(enemySprite(e).id, enemySprite(e).pal);
    var a = enemyAnchors(B.enemies.length)[ref.i];
    return { x: a[0] - sp.w / 2, y: a[1] - sp.h, w: sp.w, h: sp.h };
  }

  function startBattleView() {
    var r = S.run, B = r.battle;
    S.screen = 'battle';
    view.innerHTML = '';
    setBar();
    BV.queue = []; BV.cur = null; BV.flash = {}; BV.actor = []; BV.particles = []; BV.ended = false; BV.acc = 0;
    BV.disp = {};
    r.party.forEach(function (h, i) { BV.disp['h' + i] = { hp: h.hp, mp: h.mp }; });
    B.enemies.forEach(function (e, i) { BV.disp['e' + i] = { hp: e.hp }; });
    var avail = Math.min(view.clientWidth || 328, 448);
    var vh = window.innerHeight || 640;
    scale = Math.max(2, Math.min(Math.floor(avail / LW), Math.floor((vh * 0.42) / LH)));
    if (scale < 2) scale = 2;
    canvas = el('canvas', { class: 'px', width: LW, height: LH, role: 'img', 'aria-label': 'Campo de batalha' });
    canvas.style.width = LW * scale + 'px'; canvas.style.height = LH * scale + 'px';
    ctx = canvas.getContext('2d');
    popLayer = el('div', { 'aria-hidden': 'true' });
    stage = el('div', { class: 'stage', style: 'width:' + (LW * scale + 4) + 'px' }, [canvas, popLayer]);
    canvas.addEventListener('click', onStageTap);
    partyBox = el('div', { class: 'party' });
    msgBox = el('div', { class: 'win msg', 'aria-live': 'polite' });
    cmdBox = el('div', { class: 'cmdwrap' });
    view.appendChild(stage); view.appendChild(partyBox); view.appendChild(msgBox); view.appendChild(cmdBox);
    var names = B.enemies.map(function (e) { return e.name; });
    if (B.kind === 'boss') { setMsg('', names[0] + ' bloqueia o caminho!'); AUDIO.music('chefe'); AUDIO.sfx('boss'); }
    else { setMsg('', (B.kind === 'elite' ? 'Um inimigo poderoso: ' : '') + joinNames(names) + (names.length > 1 ? ' aparecem!' : ' aparece!')); AUDIO.music('batalha'); }
    BV.hold = 700;
    S.menu = null;
    renderParty();
    renderCmds();
    BV.last = performance.now();
    cancelAnimationFrame(BV.raf);
    BV.raf = requestAnimationFrame(loop);
  }
  function joinNames(a) {
    var c = {}; a.forEach(function (n) { c[n] = (c[n] || 0) + 1; });
    var parts = Object.keys(c).map(function (n) { return c[n] > 1 ? c[n] + 'x ' + n : n; });
    return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1] : parts[0];
  }
  function stopBattleLoop() { cancelAnimationFrame(BV.raf); BV.raf = 0; }
  function setMsg(who, text) {
    BV.who = who; BV.msg = text;
    if (!msgBox) return;
    msgBox.innerHTML = '';
    if (who) msgBox.appendChild(el('span', { class: 'who', text: who }));
    msgBox.appendChild(el('span', { text: text }));
  }

  var ST_LABEL = { poison: 'VEN', stun: 'ATD', shield: 'BAR', guard: 'DEF', haste: 'RÁP', slow: 'LEN', taunt: 'PRV', atkUp: 'FÚR', prism: 'PRS' };
  var ST_NAME = { poison: 'Veneno', stun: 'Atordoada', shield: 'Barreira', guard: 'Defesa', haste: 'Rápida', slow: 'Lenta', taunt: 'Provocando', atkUp: 'Fúria', prism: 'Prisma' };
  function renderParty() {
    var r = S.run, B = r.battle;
    partyBox.innerHTML = '';
    r.party.forEach(function (h, i) {
      var d = BV.disp['h' + i] || { hp: h.hp, mp: h.mp };
      var st = Object.keys(h.st || {}).map(function (s) { return ST_LABEL[s]; }).join(' ');
      if (h.held) st = 'SEGURANDO ' + st;
      var atbBar = barEl('atb' + (h.ready ? ' full' : ''), h.atb / D.atb.full);
      atbBar.setAttribute('data-atb', i);
      partyBox.appendChild(el('div', { class: 'pm win' + (B && B.prompt === i && !BV.cur && !BV.queue.length ? ' turn' : '') + (d.hp <= 0 ? ' ko' : '') }, [
        el('span', { class: 'n', text: h.name }),
        el('div', {}, [el('div', { class: 'lbl' }, [el('span', { text: 'PV' }), el('span', { text: d.hp + '/' + h.maxHp })]), barEl('', d.hp / h.maxHp)]),
        el('div', {}, [el('div', { class: 'lbl' }, [el('span', { text: 'MP ' + d.mp }), el('span', { text: 'ATB' })]), atbBar]),
        el('div', { class: 'sts', text: st })
      ]));
    });
  }
  function updateAtbBars() {
    var bars = partyBox.querySelectorAll('[data-atb]');
    for (var k = 0; k < bars.length; k++) {
      var h = S.run.party[+bars[k].getAttribute('data-atb')];
      bars[k].firstChild.style.width = (h.hp > 0 ? h.atb / D.atb.full * 100 : 0) + '%';
      bars[k].className = 'bar atb' + (h.ready ? ' full' : '');
    }
  }

  // menu de comandos (estilo Dragon Quest: poucas palavras, sempre as mesmas posições)
  function renderCmds() {
    var r = S.run, B = r.battle;
    cmdBox.innerHTML = '';
    if (!B || B.result || B.prompt == null || BV.cur || BV.queue.length || BV.hold > 0) return;
    var h = r.party[B.prompt];
    var acts = E.legalActions(r);
    var find = function (k) { return acts.filter(function (a) { return a.kind === k; }); };
    if (!S.menu) {
      setMsg(h.name, 'O que fazer?');
      var tr = E.techReady(r, h), tid = E.techFor(r);
      var tech = find('tech')[0];
      var techWhy = !tid ? '' : !tr.partnerReady ? 'A parceira ainda não está pronta (barra amarela cheia). Use Segurar ou o Badalo.' : !tr.mpOk ? 'MP insuficiente: ' + D.techs[tid].name + ' custa ' + E.techCost(r, tid, h.id) + ' MP de ' + h.name + ' e ' + E.techCost(r, tid, E.partnerOf(r, h).id) + ' da parceira.' : 'Indisponível agora.';
      var g = el('div', { class: 'cmds' }, [
        btn('Atacar', function () { pickTarget({ kind: 'attack' }, find('attack')[0].targets, 'enemy'); }, 'primary', { 'data-cmd': 'attack' }),
        btn('Técnica', function () { S.menu = 'skills'; renderCmds(); }, '', { 'data-cmd': 'skills' }),
        btn('Dupla', function () { if (tech) chooseAction({ kind: 'tech', id: tech.id }, tech.targets, D.techs[tech.id].target); }, 'tech' + (tech ? ' ready' : ''), tech ? { 'data-cmd': 'tech' } : { 'aria-disabled': 'true', 'data-why': techWhy, 'data-cmd': 'tech' }),
        btn('Item', function () { S.menu = 'items'; renderCmds(); }, '', r.items.length ? { 'data-cmd': 'items' } : { 'aria-disabled': 'true', 'data-why': 'A bolsa está vazia.', 'data-cmd': 'items' }),
        btn('Defender', function () { act({ kind: 'defend' }); }, '', { 'data-cmd': 'defend' }),
        btn('Segurar', function () { act({ kind: 'hold' }); }, '', find('hold').length ? { 'data-cmd': 'hold' } : { 'aria-disabled': 'true', 'data-why': 'Só dá para segurar enquanto a parceira está de pé e carregando.', 'data-cmd': 'hold' })
      ]);
      cmdBox.appendChild(g);
      view.scrollTop = 0;
      return;
    }
    var list = el('div', { class: 'list' });
    if (S.menu === 'skills') {
      setMsg(h.name, 'Qual técnica?');
      h.skills.forEach(function (sid) {
        var s = D.skills[sid], a = acts.filter(function (x) { return x.kind === 'skill' && x.id === sid; })[0];
        var why = h.mp < s.mp ? 'MP insuficiente.' : 'Sem alvo válido agora.';
        list.appendChild(btn([el('span', {}, [el('b', { text: s.name }), el('small', { text: s.desc })]), el('span', { class: 'cost', text: s.mp + ' MP' })],
          function () { chooseAction({ kind: 'skill', id: sid }, a.targets, s.target); }, '', a ? { 'data-skill': sid } : { 'aria-disabled': 'true', 'data-why': why, 'data-skill': sid }));
      });
    } else if (S.menu === 'items') {
      setMsg(h.name, 'Qual item?');
      var counts = {}; r.items.forEach(function (i) { counts[i] = (counts[i] || 0) + 1; });
      Object.keys(counts).forEach(function (iid) {
        var it = D.items[iid], a = acts.filter(function (x) { return x.kind === 'item' && x.id === iid; })[0];
        list.appendChild(btn([el('span', {}, [el('b', { text: it.name }), el('small', { text: it.desc })]), el('span', { class: 'cost', text: 'x' + counts[iid] })],
          function () { chooseAction({ kind: 'item', id: iid }, a.targets, it.target); }, '', a ? {} : { 'aria-disabled': 'true', 'data-why': 'Sem alvo válido agora.' }));
      });
    } else if (S.menu && S.menu.target) {
      var m = S.menu;
      setMsg(h.name, m.type === 'enemy' ? 'Em quem?' : 'Em quem? (aliada)');
      m.targets.forEach(function (ti) {
        var u = m.type === 'enemy' ? B.enemies[ti] : r.party[ti];
        var sts = Object.keys(u.st || {}).map(function (s) { return ST_NAME[s]; }).join(', ');
        list.appendChild(btn([el('span', {}, [el('b', { text: u.name }), el('small', { text: (u.hp > 0 ? 'PV ' + u.hp + '/' + u.maxHp : 'Caída') + (sts ? ' · ' + sts : '') })])],
          function () { var a2 = {}; for (var k in m.action) a2[k] = m.action[k]; a2.target = ti; act(a2); }, '', { 'data-target': ti }));
      });
    }
    list.appendChild(btn('Voltar', function () { S.menu = (S.menu && S.menu.target && S.menu.from) ? S.menu.from : null; renderCmds(); }, 'small'));
    cmdBox.appendChild(list);
    // em telas baixas, traz a lista inteira para a vista
    view.scrollTop = view.scrollHeight;
  }
  function pickTarget(action, targets, type, from) {
    S.menu = { target: true, action: action, targets: targets, type: type, from: from || null };
    renderCmds();
  }
  function chooseAction(action, targets, type) {
    if (targets && (type === 'enemy' || type === 'ally' || type === 'deadAlly')) {
      if (targets.length === 1 && type !== 'enemy') { action.target = targets[0]; act(action); return; }
      pickTarget(action, targets, type === 'enemy' ? 'enemy' : 'ally', S.menu);
      return;
    }
    if (targets && type === 'partner') action.target = targets[0];
    act(action);
  }
  function onStageTap(ev) {
    if (!S.menu || !S.menu.target || S.menu.type !== 'enemy') return;
    var rect = canvas.getBoundingClientRect();
    var x = (ev.clientX - rect.left) / rect.width * LW, y = (ev.clientY - rect.top) / rect.height * LH;
    for (var k = 0; k < S.menu.targets.length; k++) {
      var ti = S.menu.targets[k], b = unitBox({ side: 'e', i: ti });
      if (x >= b.x - 3 && x <= b.x + b.w + 3 && y >= b.y - 3 && y <= b.y + b.h + 3) {
        var a2 = {}; for (var kk in S.menu.action) a2[kk] = S.menu.action[kk]; a2.target = ti;
        AUDIO.sfx('cursor'); act(a2); return;
      }
    }
  }
  function act(action) {
    S.menu = null;
    var evs;
    try { evs = E.doAction(S.run, action); } catch (e) { toast('Ação inválida.'); renderCmds(); return; }
    cmdBox.innerHTML = '';
    BV.queue = BV.queue.concat(evs);
    saveRun();
  }

  // ---------------------------------------------------------------- reprodução de eventos
  var SPD = { 1: 1, 2: 1.7, 3: 2.6 };
  function evDuration(ev) {
    var base = { act: 480, dmg: 260, heal: 240, mp: 160, status: 200, miss: 170, ko: 420, revive: 420, atb: 140, msg: 650, hold: 380, end: 350 }[ev.e] || 150;
    if (ev.e === 'act' && ev.tech) base = 900;
    if (ev.e === 'heal' && ev.quiet) base = 120;
    return base / SPD[S.settings.speed];
  }
  function popup(ref, text, cls) {
    var b = unitBox(ref);
    var p = el('div', { class: 'pop ' + (cls || ''), text: text });
    p.style.left = ((b.x + b.w / 2) * scale + 2) + 'px';
    p.style.top = ((b.y + 4) * scale + 2) + 'px';
    popLayer.appendChild(p);
    setTimeout(function () { p.remove(); }, 950);
  }
  function burst(ref, color, n) {
    var b = unitBox(ref);
    for (var k = 0; k < (n || 8); k++) {
      BV.particles.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.8) * 50, life: 0.5, c: color });
    }
  }
  function playEvent(ev) {
    var r = S.run;
    if (ev.e === 'act') {
      var who = unitOf(ev.who);
      BV.actor = [unitKey(ev.who)];
      if (ev.partner) BV.actor.push(unitKey(ev.partner));
      var whoName = ev.partner ? who.name + ' + ' + unitOf(ev.partner).name : who.name;
      setMsg(whoName, ev.name + (ev.tech ? '!!' : ev.basic ? '' : '!'));
      AUDIO.sfx(ev.tech ? 'tech' : ev.item ? 'item' : ev.basic ? 'swing' : ev.who.side === 'h' ? 'magic' : 'swing');
      if (ev.tech) { burst(ev.who, '#d6c6ff', 14); burst(ev.partner, '#ffd860', 14); }
    } else if (ev.e === 'dmg') {
      var k = unitKey(ev.to);
      if (BV.disp[k]) BV.disp[k].hp = ev.hp;
      BV.flash[k] = 0.16;
      popup(ev.to, String(ev.v) + (ev.crit ? '!' : ''), ev.poison ? 'poison' : ev.crit ? 'crit' : '');
      burst(ev.to, ev.poison ? '#b080ff' : ev.to.side === 'e' ? '#fff3c0' : '#ff7060', ev.crit ? 12 : 6);
      AUDIO.sfx(ev.crit ? 'crit' : 'hit');
    } else if (ev.e === 'heal') {
      if (BV.disp[unitKey(ev.to)]) BV.disp[unitKey(ev.to)].hp = ev.hp;
      if (!ev.quiet || ev.v > 0) popup(ev.to, '+' + ev.v, 'heal');
      if (!ev.quiet) { burst(ev.to, '#8cf08c', 8); AUDIO.sfx('heal'); }
    } else if (ev.e === 'mp') {
      if (BV.disp[unitKey(ev.to)]) BV.disp[unitKey(ev.to)].mp = ev.mp;
      popup(ev.to, '+' + ev.v + ' MP', 'mp');
    } else if (ev.e === 'status') {
      popup(ev.to, ST_NAME[ev.s], 'st');
    } else if (ev.e === 'miss') {
      popup(ev.to, 'resistiu', 'st');
    } else if (ev.e === 'ko') {
      var u = unitOf(ev.to);
      if (BV.disp[unitKey(ev.to)]) BV.disp[unitKey(ev.to)].hp = 0;
      setMsg('', u.name + (ev.to.side === 'h' ? ' caiu!' : ' foi derrotado!'));
      burst(ev.to, '#ffffff', 16);
      AUDIO.sfx('ko');
    } else if (ev.e === 'revive') {
      if (BV.disp[unitKey(ev.to)]) BV.disp[unitKey(ev.to)].hp = ev.hp;
      popup(ev.to, '+' + ev.v, 'heal');
      setMsg('', ev.text || unitOf(ev.to).name + ' se levanta!');
      AUDIO.sfx('heal');
    } else if (ev.e === 'atb') {
      popup(ev.to, ev.full ? 'PRONTA!' : 'ATB 0', 'st');
      if (ev.full) AUDIO.sfx('bell');
    } else if (ev.e === 'msg') {
      setMsg('', ev.text);
    } else if (ev.e === 'hold') {
      setMsg(unitOf(ev.who).name, 'segura o turno e espera a parceira.');
    } else if (ev.e === 'end') {
      if (ev.result === 'win') { setMsg('', 'Vitória!'); AUDIO.music(null); AUDIO.sfx('victory'); }
      else if (ev.result === 'lose') { setMsg('', 'O grupo caiu...'); AUDIO.music(null); }
    }
    renderParty();
  }

  function loop(now) {
    BV.raf = requestAnimationFrame(loop);
    var dt = Math.min(0.1, (now - BV.last) / 1000);
    BV.last = now;
    BV.fpsFrames++;
    var r = S.run;
    if (!r || !r.battle) { draw(dt); return; }
    var B = r.battle;
    if (BV.hold > 0) { BV.hold -= dt * 1000; if (BV.hold <= 0) { renderParty(); renderCmds(); } }
    else if (BV.cur) {
      BV.t -= dt * 1000;
      if (BV.t <= 0) { BV.cur = null; BV.actor = []; }
    }
    if (!BV.cur && BV.hold <= 0) {
      if (BV.queue.length) {
        BV.cur = BV.queue.shift();
        BV.t = evDuration(BV.cur);
        playEvent(BV.cur);
      } else if (B.result) {
        if (!BV.ended) { BV.ended = true; BV.hold = 600; }
        else { finishBattleView(); return; }
      } else if (B.prompt == null) {
        // tempo ativo: avança ticks do ATB (pausado durante animações e menus)
        BV.acc += dt * D.atb.ticksPerSecond * SPD[S.settings.speed];
        var guard = 0;
        while (BV.acc >= 1 && guard++ < 60) {
          BV.acc -= 1;
          var evs = E.stepBattle(r);
          if (evs) { BV.queue = BV.queue.concat(evs); BV.acc = 0; break; }
          if (B.prompt != null) { BV.acc = 0; AUDIO.sfx('cursor'); renderParty(); renderCmds(); saveRun(); break; }
        }
        updateAtbBars();
      } else if (!cmdBox.firstChild) { renderParty(); renderCmds(); }
    }
    draw(dt);
  }

  function finishBattleView() {
    stopBattleLoop();
    var r = S.run, B = r.battle;
    var won = B.result === 'win';
    var bossId = won && B.kind === 'boss' ? B.group[0] : null;
    var res = E.finishBattle(r);
    S.levelUps = res.events.filter(function (e) { return e.e === 'lvl'; });
    if (S.levelUps.length) AUDIO.sfx('level');
    if (bossId) { E.recordBoss(S.meta, bossId); saveMeta(); }
    if (r.phase === 'over') { endRunFlow(); return; }
    saveRun();
    var st = bossId ? E.pullStory(S.meta, 1).filter(function (s) { return s.when.boss; }) : [];
    if (st.length) { saveMeta(); showStory(st, function () { go('reward'); }); }
    else go('reward');
  }

  // ---------------------------------------------------------------- desenho do palco
  function draw(dt) {
    if (!ctx || S.screen !== 'battle' || !S.run) return;
    var r = S.run, B = r.battle;
    var t = performance.now() / 1000;
    ctx.clearRect(0, 0, LW, LH);
    drawSky(ctx, LW, LH, r.act, t);
    if (!B) return;
    var units = [];
    B.enemies.forEach(function (e, i) { units.push({ ref: { side: 'e', i: i }, u: e }); });
    r.party.forEach(function (h, i) { units.push({ ref: { side: 'h', i: i }, u: h }); });
    units.sort(function (a, b) { var A = unitBox(a.ref), Bx = unitBox(b.ref); return (A.y + A.h) - (Bx.y + Bx.h); });
    units.forEach(function (o) {
      var k = unitKey(o.ref), b = unitBox(o.ref), u = o.u;
      var dHp = BV.disp[k] ? BV.disp[k].hp : u.hp;
      var dead = dHp <= 0;
      if (dead && o.ref.side === 'e' && !BV.flash[k]) return;
      var x = b.x, y = b.y;
      if (!dead) y += Math.floor((t * 2 + o.ref.i * 0.5) % 2) === 0 ? 0 : -1 * (o.ref.side === 'h' ? 1 : 0);
      if (BV.actor.indexOf(k) >= 0) x += o.ref.side === 'h' ? -6 : 6;
      if (o.ref.side === 'h' && B.prompt === o.ref.i && !BV.cur) x -= 3;
      if (BV.flash[k] > 0) { x += (Math.random() < 0.5 ? -1 : 1); }
      // sombra no chão
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(Math.round(b.x + 2), Math.round(b.y + b.h - 1), b.w - 4, 2);
      var img;
      if (o.ref.side === 'h') img = spriteCanvas(u.id, null, BV.flash[k] > 0 && Math.floor(t * 30) % 2 ? 'white' : dead ? 'gray' : null);
      else { var es = enemySprite(u); img = spriteCanvas(es.id, es.pal, BV.flash[k] > 0 && Math.floor(t * 30) % 2 ? 'white' : null); }
      if (dead && o.ref.side === 'h') {
        ctx.save(); ctx.translate(Math.round(x + b.w / 2), Math.round(y + b.h)); ctx.rotate(-Math.PI / 2); ctx.drawImage(img, -b.h + 2, -b.w / 2); ctx.restore();
      } else ctx.drawImage(img, Math.round(x), Math.round(y));
      // barra de PV dos inimigos
      if (o.ref.side === 'e' && !dead && !D.enemies[u.id].boss) {
        ctx.fillStyle = '#140c1c'; ctx.fillRect(Math.round(b.x + 1), Math.round(b.y + b.h + 1), b.w - 2, 2);
        ctx.fillStyle = '#e2574a'; ctx.fillRect(Math.round(b.x + 1), Math.round(b.y + b.h + 1), Math.max(1, Math.round((b.w - 2) * dHp / u.maxHp)), 2);
      }
      // seta da vez
      if (o.ref.side === 'h' && B.prompt === o.ref.i && !BV.cur && Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = '#ffd860'; ctx.fillRect(Math.round(x + 7), Math.round(b.y - 5), 3, 1); ctx.fillRect(Math.round(x + 8), Math.round(b.y - 4), 1, 1);
      }
      // alvo selecionável
      if (o.ref.side === 'e' && S.menu && S.menu.target && S.menu.type === 'enemy' && S.menu.targets.indexOf(o.ref.i) >= 0 && Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = '#ffd860'; ctx.fillRect(Math.round(b.x + b.w / 2 - 1), Math.round(b.y - 5), 3, 1); ctx.fillRect(Math.round(b.x + b.w / 2), Math.round(b.y - 4), 1, 1);
      }
      if (BV.flash[k] > 0) BV.flash[k] -= dt;
    });
    // barra de PV do chefe
    var boss = B.enemies.filter(function (e) { return D.enemies[e.id].boss; })[0];
    if (boss) {
      var dh = BV.disp.e0 ? BV.disp.e0.hp : boss.hp;
      ctx.fillStyle = '#140c1c'; ctx.fillRect(4, 3, LW - 8, 4);
      ctx.fillStyle = '#e2574a'; ctx.fillRect(5, 4, Math.max(0, Math.round((LW - 10) * dh / boss.maxHp)), 2);
    }
    // partículas
    BV.particles = BV.particles.filter(function (p) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt;
      if (p.life <= 0) return false;
      ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      return true;
    });
  }

  // ---------------------------------------------------------------- arranque
  function boot() {
    var app = document.getElementById('app');
    S.meta = loadMeta();
    var st = load(KEYS.settings, null);
    if (st) { S.settings.muted = !!st.muted; S.settings.speed = [1, 2, 3].indexOf(st.speed) >= 0 ? st.speed : 2; }
    AUDIO.setMuted(S.settings.muted);
    seedChip = btn('#', function () {
      var txt = E.seedToStr(S.run.seed);
      try { navigator.clipboard.writeText(txt).then(function () { toast('Semente ' + txt + ' copiada.'); }, function () { toast('Semente: ' + txt); }); }
      catch (e) { toast('Semente: ' + txt); }
    }, 'chip', { id: 'seedChip', 'aria-label': 'Semente da jornada' });
    where = el('span', { id: 'where' });
    spdBtn = btn('2x', function () { S.settings.speed = S.settings.speed % 3 + 1; saveSettings(); setBar(); }, 'chip', { id: 'spdBtn', 'aria-label': 'Velocidade do combate' });
    sndBtn = btn('SOM', function () { S.settings.muted = !S.settings.muted; AUDIO.setMuted(S.settings.muted); saveSettings(); setBar(); }, 'chip', { id: 'sndBtn', 'aria-label': 'Ligar ou desligar o som' });
    bar = el('header', { id: 'bar' }, [seedChip, where, spdBtn, sndBtn]);
    view = el('main', { id: 'view' });
    app.appendChild(bar); app.appendChild(view);
    go('title');
    // sem a fonte pixelada (offline/bloqueada), o fallback monoespaçado é largo: reduz o corpo
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!document.fonts.check('16px VT323')) document.body.classList.add('nofont'); }); } catch (e) { /* ignora */ }
    window.addEventListener('resize', function () { if (S.screen === 'battle' && S.run && S.run.battle) { var q = BV.queue, c = BV.cur; startBattleView(); BV.queue = q; BV.cur = c; BV.hold = 0; } });
    document.addEventListener('visibilitychange', function () { if (document.hidden) saveRun(); });
    // ganchos de teste/medição (não alteram regras)
    window.__ECOS = { S: S, E: E, fps: function () { return BV.fpsFrames; }, KEYS: KEYS };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
