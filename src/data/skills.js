// Técnicas (individuais e duplas). Alvos: enemy, enemies, ally, allies, self, ally_ko.
// kind: phys (multiplicador do ATQ), mag (base + MAG), heal, buff, revive, cure, taunt, gravity, steal
export const ELEMENTS = {
  fogo: { name: 'Fogo', icon: '🔥', color: '#ff7a3a' },
  gelo: { name: 'Gelo', icon: '❄', color: '#8ad8ff' },
  raio: { name: 'Raio', icon: '⚡', color: '#ffe84a' },
  vento: { name: 'Vento', icon: '🌀', color: '#9af0b0' },
  terra: { name: 'Terra', icon: '⛰', color: '#d0a060' },
  luz: { name: 'Luz', icon: '✦', color: '#fff4b0' },
  trevas: { name: 'Trevas', icon: '☾', color: '#b080ff' },
};

export const WEAPON_TYPES = {
  corte: { name: 'Corte', icon: '🗡' },
  impacto: { name: 'Impacto', icon: '🔨' },
  perfuracao: { name: 'Perfuração', icon: '🔱' },
};

export const SKILLS = {
  // ------------------------------------------------------------ Lio — Espadachim
  corte_duplo: { name: 'Corte Duplo', desc: 'Dois golpes rápidos. Ótimo para quebrar escudos.', mp: 3, target: 'enemy', kind: 'phys', power: 0.72, hits: 2, fx: 'slash2', anim: 'attack' },
  lamina_ignea: { name: 'Lâmina Ígnea', desc: 'Corte envolto em chamas.', mp: 5, target: 'enemy', kind: 'phys', power: 1.5, element: 'fogo', fx: 'fireslash', anim: 'attack' },
  foco: { name: 'Foco', desc: 'Concentra-se: ATQ +40% por 3 turnos.', mp: 4, target: 'self', kind: 'buff', buff: { atk: 0.4 }, turns: 3, fx: 'buff', anim: 'cast' },
  ventania: { name: 'Ventania', desc: 'Lâmina de vento atinge todos os inimigos.', mp: 8, target: 'enemies', kind: 'phys', power: 1.0, element: 'vento', fx: 'wind', anim: 'attack' },
  estrela_cadente: { name: 'Estrela Cadente', desc: 'Golpe de luz do Farol. Dano enorme.', mp: 14, target: 'enemy', kind: 'phys', power: 2.8, element: 'luz', fx: 'starfall', anim: 'attack' },

  // ------------------------------------------------------------ Sena — Sacerdotisa
  cura: { name: 'Cura', desc: 'Restaura HP de um aliado.', mp: 4, target: 'ally', kind: 'heal', power: 34, fx: 'heal', anim: 'cast' },
  luz_sagrada: { name: 'Luz Sagrada', desc: 'Raio de luz em um inimigo.', mp: 4, target: 'enemy', kind: 'mag', power: 20, element: 'luz', fx: 'light', anim: 'cast' },
  bencao: { name: 'Bênção', desc: 'DEF e RES do grupo +30% por 3 turnos.', mp: 6, target: 'allies', kind: 'buff', buff: { def: 0.3, res: 0.3 }, turns: 3, fx: 'buff', anim: 'cast' },
  purificar: { name: 'Purificar', desc: 'Remove venenos e males de um aliado.', mp: 3, target: 'ally', kind: 'cure', fx: 'heal', anim: 'cast' },
  prece: { name: 'Prece', desc: 'Restaura HP de todo o grupo.', mp: 10, target: 'allies', kind: 'heal', power: 30, fx: 'heal', anim: 'cast' },
  reviver: { name: 'Reviver', desc: 'Traz de volta um aliado caído.', mp: 12, target: 'ally_ko', kind: 'revive', power: 0.5, fx: 'revive', anim: 'cast' },

  // ------------------------------------------------------------ Estela — Maga Estelar
  faisca: { name: 'Faísca', desc: 'Pequena explosão de fogo.', mp: 3, target: 'enemy', kind: 'mag', power: 22, element: 'fogo', fx: 'fire', anim: 'cast' },
  geada: { name: 'Geada', desc: 'Cristais de gelo cortantes.', mp: 3, target: 'enemy', kind: 'mag', power: 22, element: 'gelo', fx: 'ice', anim: 'cast' },
  trovao: { name: 'Trovão', desc: 'Um raio cai sobre o inimigo.', mp: 4, target: 'enemy', kind: 'mag', power: 24, element: 'raio', fx: 'thunder', anim: 'cast' },
  chuva_estelar: { name: 'Chuva Estelar', desc: 'Estrelas caem sobre todos os inimigos.', mp: 9, target: 'enemies', kind: 'mag', power: 24, element: 'luz', fx: 'stars', anim: 'cast' },
  gravidade: { name: 'Gravidade', desc: 'Esmaga: tira 25% do HP atual.', mp: 10, target: 'enemy', kind: 'gravity', power: 0.25, element: 'trevas', fx: 'gravity', anim: 'cast' },
  supernova: { name: 'Supernova', desc: 'A luz de uma estrela que morre.', mp: 18, target: 'enemies', kind: 'mag', power: 52, element: 'fogo', fx: 'supernova', anim: 'cast' },

  // ------------------------------------------------------------ Brann — Guardião
  provocar: { name: 'Provocar', desc: 'Atrai os ataques inimigos e ganha DEF +50%.', mp: 2, target: 'self', kind: 'taunt', buff: { def: 0.5 }, turns: 3, fx: 'taunt', anim: 'cast' },
  estocada: { name: 'Estocada', desc: 'Golpe perfurante poderoso.', mp: 3, target: 'enemy', kind: 'phys', power: 1.55, fx: 'pierce', anim: 'attack' },
  muralha: { name: 'Muralha', desc: 'DEF do grupo +40% por 3 turnos.', mp: 6, target: 'allies', kind: 'buff', buff: { def: 0.4 }, turns: 3, fx: 'buff', anim: 'cast' },
  terremoto: { name: 'Terremoto', desc: 'Golpeia o chão: dano de terra em todos.', mp: 8, target: 'enemies', kind: 'phys', power: 1.15, element: 'terra', fx: 'quake', anim: 'attack' },
  investida: { name: 'Investida Férrea', desc: 'Três estocadas implacáveis.', mp: 10, target: 'enemy', kind: 'phys', power: 0.85, hits: 3, fx: 'pierce', anim: 'attack' },
};

// Técnicas duplas (estilo Chrono Trigger): exigem os dois heróis prontos.
export const DUAL_TECHS = {
  aurora: { name: 'Aurora', users: ['lio', 'sena'], mp: [5, 5], desc: 'Luz que fere inimigos e cura o grupo.', target: 'enemies', kind: 'mag', power: 26, element: 'luz', healAll: 28, fx: 'aurora' },
  lamina_estelar: { name: 'Lâmina Estelar', users: ['lio', 'estela'], mp: [5, 6], desc: 'Espada carregada de luz estelar. Quebra 3 escudos.', target: 'enemy', kind: 'phys', power: 2.6, element: 'luz', shieldHits: 3, fx: 'starfall' },
  corte_x: { name: 'Corte em X', users: ['lio', 'brann'], mp: [4, 4], desc: 'Espada e lança cruzadas: corte e perfuração.', target: 'enemy', kind: 'phys', power: 1.1, hits: 2, multiType: ['corte', 'perfuracao'], fx: 'xslash' },
  cometa_sagrado: { name: 'Cometa Sagrado', users: ['sena', 'estela'], mp: [7, 7], desc: 'Um cometa sagrado atinge todos.', target: 'enemies', kind: 'mag', power: 40, element: 'luz', fx: 'stars' },
  meteoro: { name: 'Meteoro', users: ['estela', 'brann'], mp: [8, 5], desc: 'Brann lança Estela ao céu e ela traz um meteoro.', target: 'enemies', kind: 'mag', power: 46, element: 'terra', extraElement: 'fogo', fx: 'meteor' },
  santuario: { name: 'Santuário', users: ['sena', 'brann'], mp: [6, 4], desc: 'Barreira sagrada: cura e protege o grupo.', target: 'allies', kind: 'heal', power: 26, buff: { def: 0.35, res: 0.35 }, turns: 3, fx: 'heal' },
};
