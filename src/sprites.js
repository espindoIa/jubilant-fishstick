// ============================================================================
// SPRITES — pixel art gerada por código. Puro (sem DOM): devolve {w,h,px[]}.
// Heroínas: matrizes 16x16 desenhadas à mão, paleta própria de 6 cores.
// Inimigos comuns: formas-base com troca de paleta. Elites 24x24 e chefes
// 32x32: primitivas numa grade de pixels + contorno automático.
// ============================================================================
var SPRITES = (function () {
  'use strict';
  var K = '#141018', W = '#ffffff';

  var HAND = {
    // Rocca — forma dominante: escudo redondo gigante na frente do corpo, chifres largos.
    rocca: { pal: { k: K, b: '#b8692e', y: '#f0b860', s: '#4a6a8a', l: '#a8c4dc', f: '#f0b890' }, rows: [
      '..k..........k..',
      '..kyk......kyk..',
      '...kyk....kyk...',
      '....kssssssk....',
      '....ksllllsk....',
      '....kfkffkfk....',
      '...kkkkkkkkkk...',
      '..kbbyyyybbbbk..',
      '.kbyyyyyybbbbbk.',
      '.kbyykkkkyybbbk.',
      'kbbykyyyykybbbbk',
      'kbbykyyyykybbbbk',
      '.kbyykkkkyybbbk.',
      '.kbbyyyybbbbbbk.',
      '..kkbbbbbbbbkk..',
      '...ksk....ksk...'] },
    // Lume — forma dominante: chapéu pontudo torto, alto. Lanterna no cajado.
    lume: { pal: { k: K, p: '#5b3a8c', v: '#9a6fd1', y: '#ffd84a', o: '#f08a2a', f: '#f1c7a0' }, rows: [
      '...........kk...',
      '..........kpk...',
      '.........kpk....',
      '........kvpk....',
      '.......kvppk....',
      '......kvpppk....',
      '.....kvppppk....',
      '...kkkkkkkkkkk..',
      '.kk..kfkffk.....',
      'kyyk.kffffk.....',
      'kyok.kppppk.....',
      '.kk..kpvppk.....',
      '..k.kpvpppk.....',
      '..k.kpvpppk.....',
      '..k.kpvppppk....',
      '..k.kkkkkkkk....'] },
    // Pena — forma dominante: bico longo + cachecol horizontal ao vento, agachada.
    pena: { pal: { k: K, g: '#3f8f5a', m: '#9be07a', w: '#f2f2e8', r: '#d8463c', t: '#e0b050' }, rows: [
      '................',
      '......kkkk......',
      '.....kmmmmk.....',
      '...kkkwkmmgk....',
      '.kttttkmmgggk...',
      '..kkkkmmgggkkkk.',
      '.....kggggkrrrrk',
      '....kgkrrrkkrrrk',
      '....kgrrrrk.kkk.',
      '...kggkggk......',
      '..kgmggggk......',
      '..kgmgggggk.....',
      '...kkggkgggk....',
      '....kgk.kggk....',
      '...kttk..kttk...',
      '...kkk....kkk...'] },
    // Sino — forma dominante: sino enorme nas costas, corpo pequeno.
    sino: { pal: { k: K, d: '#e3b23c', e: '#9c6a1e', c: '#2f9c9a', a: '#8fe3d6', f: '#f3c9a3' }, rows: [
      '........kkkk....',
      '.......kddddk...',
      '......kdddddek..',
      '......kddddddek.',
      '..kkk.kddddddek.',
      '.kaaakkdddddddek',
      '.kfffkddddddddek',
      '.kfkfkkeeeeeeeek',
      '.kffffk.kkkkkkk.',
      '..kkkk....kek...',
      '.kcacck...k.....',
      'kccaccck........',
      'kcaccccck.......',
      '.kccccck........',
      '..kfkfk.........',
      '..kkkkk.........'] },

    // formas-base de inimigos: 1=escuro 2=médio 3=claro (paleta do inimigo)
    blob: { rows: [
      '................',
      '................',
      '................',
      '................',
      '.......kk.......',
      '......k33k......',
      '.....k3322k.....',
      '....k332222k....',
      '...k33222222k...',
      '..k3222222222k..',
      '..k22kw222kw22k.',
      '.k222kk222kk222k',
      '.k2222222222221k',
      '.k1222kkkk22211k',
      '..k11111111111k.',
      '...kkkkkkkkkkk..'] },
    shroom: { rows: [
      '................',
      '................',
      '.....kkkkkk.....',
      '...kk223222kk...',
      '..k2222222322k..',
      '.k232222222222k.',
      '.k222222232222k.',
      'k11222222222211k',
      'kkk1111111111kkk',
      '...k33333333k...',
      '...k3kw33kw3k...',
      '...k33333333k...',
      '...k333kk333k...',
      '....k333333k....',
      '....k3k33k3k....',
      '.....kk..kk.....'] },
    owl: { rows: [
      '................',
      '...k........k...',
      '...kk......kk...',
      '...k2kkkkkk2k...',
      '..k2222222222k..',
      '..k2kkk22kkk2k..',
      '..kkwwk22kwwkk..',
      '..kkwkk33kkwkk..',
      '..k22kk33kk22k..',
      '.k1222k33k2221k.',
      'k11223333332211k',
      'k1122333333221k.',
      '.k11223333221k..',
      '..k112222211k...',
      '....k3k..k3k....',
      '....kk....kk....'] },
    bat: { rows: [
      '................',
      '................',
      '................',
      'k..............k',
      'kk....k..k....kk',
      'k1k...kkkk...k1k',
      'k11k.k2222k.k11k',
      'k111kk3223kk111k',
      'k1111k2222k1111k',
      'k11111k22k11111k',
      'k1k1k1k22k1k1k1k',
      'kk.k.kk33kk.k.kk',
      '......kwwk......',
      '.......kk.......',
      '................',
      '................'] }
  };

  // ---------------------------------------------------------------- grade procedural
  function grid(w, h) {
    var px = new Array(w * h).fill(null);
    var g = {
      w: w, h: h, px: px,
      set: function (x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = c; },
      get: function (x, y) { return x >= 0 && y >= 0 && x < w && y < h ? px[y * w + x] : null; },
      rect: function (x, y, rw, rh, c) { for (var j = 0; j < rh; j++) for (var i = 0; i < rw; i++) g.set(x + i, y + j, c); },
      ell: function (cx, cy, rx, ry, c) {
        for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
          for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
            var dx = (x - cx) / (rx + 0.35), dy = (y - cy) / (ry + 0.35);
            if (dx * dx + dy * dy <= 1) g.set(x, y, c);
          }
      },
      ring: function (cx, cy, r0, r1, c) {
        for (var y = Math.floor(cy - r1); y <= Math.ceil(cy + r1); y++)
          for (var x = Math.floor(cx - r1); x <= Math.ceil(cx + r1); x++) {
            var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            if (d >= r0 && d <= r1 + 0.3) g.set(x, y, c);
          }
      },
      tri: function (x1, y1, x2, y2, x3, y3, c) {
        var minX = Math.floor(Math.min(x1, x2, x3)), maxX = Math.ceil(Math.max(x1, x2, x3));
        var minY = Math.floor(Math.min(y1, y2, y3)), maxY = Math.ceil(Math.max(y1, y2, y3));
        function s(ax, ay, bx, by, px_, py) { return (px_ - bx) * (ay - by) - (ax - bx) * (py - by); }
        for (var y = minY; y <= maxY; y++) for (var x = minX; x <= maxX; x++) {
          var d1 = s(x, y, x1, y1, x2, y2), d2 = s(x, y, x2, y2, x3, y3), d3 = s(x, y, x3, y3, x1, y1);
          var neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
          if (!(neg && pos)) g.set(x, y, c);
        }
      },
      line: function (x0, y0, x1, y1, c) {
        var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
        for (var i = 0; i <= n; i++) g.set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
      },
      outline: function (c) {
        var add = [];
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
          if (px[y * w + x]) continue;
          if (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1)) add.push([x, y]);
        }
        add.forEach(function (p) { px[p[1] * w + p[0]] = c; });
      }
    };
    return g;
  }

  var PROC = {
    // Elite: tronco vivo (Toco Ancião / Pêndulo Carrasco por troca de paleta)
    stump: function (p) {
      var g = grid(24, 24);
      g.line(7, 12, 2, 5, p[1]); g.line(2, 5, 1, 2, p[1]); g.line(16, 11, 21, 6, p[1]); g.line(21, 6, 22, 3, p[1]);
      g.set(1, 1, p[2]); g.set(22, 2, p[2]); g.set(0, 2, p[2]); g.set(23, 3, p[2]);
      g.rect(6, 8, 12, 14, p[1]);
      g.tri(3, 23, 7, 16, 9, 23, p[0]); g.tri(14, 23, 17, 16, 21, 23, p[0]);
      g.ell(12, 8, 7, 3, p[2]); g.ell(12, 8, 4, 1, p[0]);
      g.line(8, 11, 8, 20, p[0]); g.line(15, 12, 15, 21, p[0]);
      g.set(9, 13, W); g.set(10, 13, W); g.set(14, 13, W); g.set(13, 13, W);
      g.set(10, 14, K); g.set(13, 14, K);
      g.line(9, 17, 14, 17, p[0]); g.set(10, 18, W); g.set(13, 18, W);
      g.outline(K);
      return g;
    },
    // Elite: armadura vazia flutuante
    knight: function (p) {
      var g = grid(24, 24);
      g.ell(12, 6, 5, 5, p[1]); g.rect(7, 6, 11, 4, p[1]);
      g.line(12, 0, 12, 2, p[2]); g.line(13, 0, 16, 1, p[2]);
      g.rect(8, 6, 9, 2, p[0]); g.set(10, 6, p[2]); g.set(14, 6, p[2]);
      g.tri(4, 11, 20, 11, 12, 21, p[1]); g.rect(9, 11, 7, 6, p[0]);
      g.ell(4, 12, 2, 2, p[1]); g.ell(20, 12, 2, 2, p[1]);
      g.line(21, 14, 21, 23, p[2]); g.rect(19, 13, 5, 1, p[0]);
      g.set(11, 21, p[1]); g.set(12, 22, p[1]); g.set(13, 21, p[1]);
      g.outline(K);
      return g;
    },
    // engrenagem viva com olho
    gear: function (p) {
      var g = grid(16, 16);
      for (var a = 0; a < 8; a++) {
        var ang = a * Math.PI / 4, x = 8 + Math.cos(ang) * 6, y = 8 + Math.sin(ang) * 6;
        g.rect(Math.round(x - 1), Math.round(y - 1), 2, 2, p[1]);
      }
      g.ell(8, 8, 5, 5, p[1]); g.ring(8, 8, 4, 4.5, p[0]);
      g.ell(8, 8, 2, 2, W); g.set(8, 8, p[2]); g.set(7, 8, K); g.set(8, 7, K);
      g.outline(K);
      return g;
    },
    // sombra com ponteiro de relógio
    ghost: function (p) {
      var g = grid(16, 16);
      g.ell(8, 6, 5, 5, p[1]); g.rect(3, 6, 11, 7, p[1]);
      for (var x = 3; x < 14; x++) if ((x % 3) !== 1) g.set(x, 13, p[1]);
      g.set(6, 6, p[2]); g.set(10, 6, p[2]); g.set(6, 7, p[2]); g.set(10, 7, p[2]);
      g.line(8, 9, 13, 3, p[0]); g.line(13, 3, 14, 1, p[2]);
      g.outline(K);
      return g;
    },
    // Clépsidra, a guardiã: uma ampulheta com rosto
    clepsidra: function () {
      var wd = '#8a5a2a', gl = '#cfeef5', wa = '#3a9ad8', fc = '#f6e0b0';
      var g = grid(16, 16);
      g.tri(4, 2, 11, 2, 7.5, 8, gl); g.tri(7.5, 8, 4, 13, 11, 13, gl);
      g.tri(5, 5, 10, 5, 7.5, 8, wa); g.tri(7.5, 10, 5, 13, 10, 13, wa); g.line(7.5, 8, 7.5, 12, wa);
      g.rect(5, 2, 6, 3, fc); g.set(6, 3, K); g.set(9, 3, K); g.set(7, 4, '#c06040'); g.set(8, 4, '#c06040');
      g.rect(2, 0, 12, 2, wd); g.rect(2, 14, 12, 2, wd); g.line(2, 2, 2, 13, wd); g.line(13, 2, 13, 13, wd);
      g.outline(K);
      return g;
    },
    // Chefe 1: sapo largo e baixo com um sino na cabeça (silhueta: cúpula larga)
    boss_grumbal: function () {
      var o = '#5a7a2a', gl = '#9ac850', b = '#c88a30', y = '#f8d870';
      var g = grid(32, 32);
      g.ell(16, 24, 15, 6, o); g.ell(16, 26, 10, 3, gl);
      g.ell(6, 17, 4, 3, o); g.ell(26, 17, 4, 3, o);
      g.ell(6, 16, 2, 2, W); g.ell(26, 16, 2, 2, W); g.set(5, 16, K); g.set(25, 16, K); g.set(5, 17, K); g.set(25, 17, K);
      g.line(4, 23, 28, 23, K); g.line(6, 24, 26, 24, K);
      g.ell(16, 12, 3, 2, b); g.rect(13, 12, 7, 4, b); g.rect(11, 16, 11, 2, b);
      g.line(14, 12, 14, 15, y); g.set(16, 18, K); g.set(16, 9, b); g.set(16, 8, K);
      g.ell(3, 30, 3, 1, o); g.ell(29, 30, 3, 1, o);
      g.outline(K);
      return g;
    },
    // Chefe 2: rainha alta e estreita, coroa de cristais (silhueta: triângulo com espinhos)
    boss_vitra: function () {
      var c = '#5ad0e8', w = '#e8fcff', m = '#d04aa0', p = '#f0d8e8', v = '#6a3a9a';
      var g = grid(32, 32);
      g.tri(16, 12, 6, 31, 26, 31, c);
      g.line(16, 15, 11, 30, w); g.line(16, 15, 21, 30, w);
      g.rect(14, 10, 5, 7, m);
      g.ell(16, 8, 3, 3, p); g.rect(13, 6, 1, 6, v); g.rect(19, 6, 1, 6, v);
      g.set(15, 8, K); g.set(17, 8, K);
      [[12, 3], [14, 1], [16, 0], [18, 1], [20, 3]].forEach(function (s) { g.line(s[0], 5, s[0], s[1], w); g.set(s[0], 5, c); });
      g.line(14, 12, 8, 17, p); g.tri(6, 15, 4, 18, 7, 21, c);
      g.line(18, 12, 24, 7, p); g.tri(25, 2, 23, 6, 27, 6, c); g.line(25, 2, 25, 6, w);
      g.outline(K);
      return g;
    },
    // Chefe 3: encapuzado diante de um mostrador gigante (silhueta: disco)
    boss_morvane: function () {
      var d = '#2a1840', p = '#5a3a8a', gd = '#e0b040', y = '#fff0a0', r = '#ff4060';
      var g = grid(32, 32);
      g.ell(16, 11, 10, 10, gd); g.ell(16, 11, 8, 8, y);
      for (var a = 0; a < 12; a++) {
        var ang = a * Math.PI / 6;
        g.set(16 + Math.cos(ang) * 7, 11 + Math.sin(ang) * 7, d);
      }
      g.line(16, 11, 16, 0, K); g.line(16, 11, 27, 6, K);
      g.tri(16, 9, 10, 24, 22, 24, p); g.tri(16, 12, 14, 24, 18, 24, d);
      [11, 14, 17, 20].forEach(function (x) { g.set(x, 25, p); g.set(x + 1, 26, p); });
      g.ell(16, 13, 2, 2, d); g.set(15, 13, r); g.set(17, 13, r);
      g.line(13, 20, 1, 31, gd); g.line(19, 20, 31, 31, gd); g.line(13, 22, 5, 31, y); g.line(19, 22, 27, 31, y);
      g.outline(K);
      return g;
    }
  };

  var cache = {};
  function fromRows(def, pal) {
    var h = def.rows.length, w = 16;
    var px = new Array(w * h).fill(null);
    var map = {};
    if (def.pal) for (var k in def.pal) map[k] = def.pal[k];
    else { map.k = K; map.w = W; map['1'] = pal[0]; map['2'] = pal[1]; map['3'] = pal[2]; }
    def.rows.forEach(function (row, y) {
      for (var x = 0; x < w; x++) { var ch = row[x]; if (ch && ch !== '.') px[y * w + x] = map[ch] || null; }
    });
    return { w: w, h: h, px: px };
  }
  function get(id, pal) {
    var key = id + '|' + (pal ? pal.join(',') : '');
    if (cache[key]) return cache[key];
    var s;
    if (HAND[id]) s = fromRows(HAND[id], pal);
    else if (PROC[id]) { var g = PROC[id](pal || ['#333', '#777', '#bbb']); s = { w: g.w, h: g.h, px: g.px }; }
    else throw new Error('sprite desconhecido: ' + id);
    cache[key] = s;
    return s;
  }
  function rowsValid() {
    var bad = [];
    for (var id in HAND) HAND[id].rows.forEach(function (r, i) { if (r.length !== 16) bad.push(id + ' linha ' + i + ' tem ' + r.length); });
    return bad;
  }
  function colors(s) {
    var set = {};
    s.px.forEach(function (c) { if (c) set[c] = 1; });
    return Object.keys(set);
  }
  return { get: get, rowsValid: rowsValid, colors: colors, heroes: ['rocca', 'lume', 'pena', 'sino'],
    bosses: ['boss_grumbal', 'boss_vitra', 'boss_morvane'] };
})();
if (typeof module !== 'undefined') module.exports = SPRITES;
