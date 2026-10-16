// Carrega DATA + ENGINE a partir do index.html construído (mesmo código do jogo).
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(file) {
  file = file || path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const grab = (id) => {
    const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
    if (!m) throw new Error('script #' + id + ' não encontrado em ' + file);
    return m[1];
  };
  const ctx = { console, Math, JSON, Object, Array };
  vm.createContext(ctx);
  vm.runInContext(grab('data') + '\n;this.DATA = DATA;', ctx);
  vm.runInContext(grab('sprites') + '\n;this.SPRITES = SPRITES;', ctx);
  vm.runInContext(grab('engine') + '\n;this.ENGINE = ENGINE;', ctx);
  return { DATA: ctx.DATA, ENGINE: ctx.ENGINE, SPRITES: ctx.SPRITES };
};
