// Falas curtas de batalha: dão voz e personalidade a cada herói.
const POOL = {
  lio: {
    start: ['Vamos nessa!', 'Juntos!', 'Eu cuido da frente!'],
    low: ['Ainda não acabou!', 'Só mais um pouco…'],
    brk: ['Agora!', 'Aberto!'],
    win: ['Foi por pouco!', 'Pronto! Quem é o próximo?'],
    ko: ['Não! Aguenta aí!'],
    eco: ['Eu consigo ouvir… a canção!'],
  },
  sena: {
    start: ['Que a luz nos guie.', 'Fiquem juntos.'],
    low: ['Não posso cair agora…', 'Respire, Sena…'],
    brk: ['A guarda abriu!', 'Agora, pessoal!'],
    win: ['Todos inteiros? Ótimo.', 'Graças às estrelas.'],
    ko: ['Aguenta! Estou indo!'],
    eco: ['A Lanterna está acesa.'],
  },
  estela: {
    start: ['As estrelas estão ouvindo.', 'Vamos brilhar!'],
    low: ['Está… tão frio…'],
    brk: ['Achei o ponto fraco!'],
    win: ['Brilhamos!', 'Deu certo!'],
    ko: ['Não vá embora! Ainda não!'],
    eco: ['Todas as vozes… estão aqui.'],
  },
  brann: {
    start: ['Formação.', 'Atrás de mim.'],
    low: ['Já passei por pior.'],
    brk: ['Linha aberta.'],
    win: ['Fim da linha.', 'Nada mal para crianças.'],
    ko: ['De pé, soldado!'],
    eco: ['Clanc. Estou pronto.'],
  },
};

// fala de abertura contra certos inimigos
export const OPENERS = {
  cao_ferro: ['sena', 'Impacto e luz, Lio!'],
  golem: ['estela', 'Ele está sofrendo…'],
  varek: ['brann', 'Eu te ensinei esse golpe, Varek.'],
  tita: ['lio', 'Estela, é agora!'],
};

const pick = (a) => a[Math.floor(Math.random() * a.length)];

export class Barks {
  constructor(battle) {
    this.b = battle;
    this.last = -9;
    this.once = new Set();
  }

  say(c, kind, { force = false, key = null } = {}) {
    const b = this.b;
    if (!c || c.hp <= 0 || b.done) return;
    if (key && this.once.has(key)) return;
    if (!force && b.time - this.last < 4) return;
    const lines = POOL[c.id]?.[kind];
    if (!lines) return;
    if (key) this.once.add(key);
    this.last = b.time;
    b.popup(c, pick(lines), 'bark');
  }

  line(c, text) {
    if (!c || c.hp <= 0) return;
    this.last = this.b.time;
    this.b.popup(c, text, 'bark');
  }

  alive(except) {
    return this.b.heroes.filter((h) => h.hp > 0 && h !== except);
  }

  start() {
    const boss = this.b.enemies.find((e) => OPENERS[e.kind]);
    if (boss) {
      const [id, text] = OPENERS[boss.kind];
      const h = this.b.heroes.find((x) => x.id === id && x.hp > 0);
      if (h) return setTimeout(() => this.line(h, text), 1900);
    }
    const h = pick(this.alive());
    if (h) setTimeout(() => this.say(h, 'start', { force: true }), 1600);
  }
}
