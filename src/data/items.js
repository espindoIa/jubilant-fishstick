// Itens consumíveis e equipamentos.
export const ITEMS = {
  // ---------------------------------------------------------------- consumíveis
  pocao: { name: 'Poção', type: 'use', icon: '🧪', price: 30, desc: 'Restaura 70 HP.', effect: { heal: 70 }, target: 'ally', battle: true, field: true },
  hipocao: { name: 'Hi-Poção', type: 'use', icon: '🧪', price: 120, desc: 'Restaura 220 HP.', effect: { heal: 220 }, target: 'ally', battle: true, field: true },
  eter: { name: 'Éter', type: 'use', icon: '💧', price: 150, desc: 'Restaura 25 MP.', effect: { mp: 25 }, target: 'ally', battle: true, field: true },
  pena: { name: 'Pena de Fênix', type: 'use', icon: '🪶', price: 220, desc: 'Revive um aliado com 40% do HP.', effect: { revive: 0.4 }, target: 'ally_ko', battle: true, field: true },
  antidoto: { name: 'Antídoto', type: 'use', icon: '🌿', price: 20, desc: 'Cura veneno.', effect: { cure: ['veneno'] }, target: 'ally', battle: true, field: true },
  tonico: { name: 'Tônico', type: 'use', icon: '✨', price: 60, desc: 'Cura todos os males.', effect: { cure: ['veneno', 'sono', 'lento'] }, target: 'ally', battle: true, field: true },
  bomba: { name: 'Bomba de Fogo', type: 'use', icon: '💣', price: 80, desc: 'Explode: 60 de dano de fogo em todos.', effect: { damage: 60, element: 'fogo' }, target: 'enemies', battle: true, field: false },
  fragmento: { name: 'Fragmento Estelar', type: 'use', icon: '⭐', price: 0, desc: 'Brilha com calor. Restaura todo o HP e MP do grupo.', effect: { healAll: 9999, mpAll: 999 }, target: 'allies', battle: true, field: true },

  // ---------------------------------------------------------------- armas
  espada_curta: { name: 'Espada Curta', type: 'weapon', for: ['lio'], price: 60, stats: { atk: 5 }, desc: 'A velha espada do avô de Lio.' },
  espada_ferro: { name: 'Espada de Ferro', type: 'weapon', for: ['lio'], price: 300, stats: { atk: 12 }, desc: 'Lâmina firme de ferreiro.' },
  lamina_farol: { name: 'Lâmina do Farol', type: 'weapon', for: ['lio'], price: 0, stats: { atk: 22, mag: 6 }, desc: 'Brilha como o farol. Feita de vidro estelar.' },
  cajado_carvalho: { name: 'Cajado de Carvalho', type: 'weapon', for: ['sena'], price: 50, stats: { atk: 3, mag: 3 }, desc: 'Cajado cerimonial do santuário.' },
  cajado_lunar: { name: 'Cajado Lunar', type: 'weapon', for: ['sena'], price: 340, stats: { atk: 6, mag: 9 }, desc: 'Um sino de prata tilinta no topo.' },
  astrolabio_rachado: { name: 'Astrolábio Rachado', type: 'weapon', for: ['estela'], price: 0, stats: { atk: 2, mag: 5 }, desc: 'Caiu do céu junto com ela.' },
  astrolabio_prata: { name: 'Astrolábio de Prata', type: 'weapon', for: ['estela'], price: 380, stats: { atk: 3, mag: 12 }, desc: 'Gira sozinho quando ela sorri.' },
  lanca_velha: { name: 'Lança Velha', type: 'weapon', for: ['brann'], price: 80, stats: { atk: 8 }, desc: 'Cabo remendado, ponta afiada.' },
  lanca_guerra: { name: 'Lança de Guerra', type: 'weapon', for: ['brann'], price: 360, stats: { atk: 16 }, desc: 'Lança pesada de infantaria.' },

  // ---------------------------------------------------------------- armaduras
  roupa_viagem: { name: 'Roupa de Viagem', type: 'armor', for: ['lio', 'sena', 'estela', 'brann'], price: 40, stats: { def: 3 }, desc: 'Leve e confortável.' },
  veste_santuario: { name: 'Veste do Santuário', type: 'armor', for: ['sena'], price: 0, stats: { def: 3, res: 4 }, desc: 'Tecida com fios abençoados.' },
  vestido_estelar: { name: 'Vestido Estelar', type: 'armor', for: ['estela'], price: 0, stats: { def: 2, res: 6 }, desc: 'Bordado com constelações vivas.' },
  armadura_amassada: { name: 'Armadura Amassada', type: 'armor', for: ['brann'], price: 0, stats: { def: 9 }, desc: 'O brasão foi raspado a faca.' },
  couraca: { name: 'Couraça de Couro', type: 'armor', for: ['lio', 'brann', 'sena', 'estela'], price: 160, stats: { def: 7 }, desc: 'Couro cozido e reforçado.' },
  manto_encantado: { name: 'Manto Encantado', type: 'armor', for: ['sena', 'estela'], price: 280, stats: { def: 6, res: 8 }, desc: 'Repele magia.' },
  malha_aco: { name: 'Malha de Aço', type: 'armor', for: ['lio', 'brann'], price: 420, stats: { def: 14 }, desc: 'Pesada, mas segura.' },

  // ---------------------------------------------------------------- acessórios
  amuleto_coral: { name: 'Amuleto de Coral', type: 'acc', for: null, price: 120, stats: { res: 6, hp: 20 }, desc: 'Presente do mar.' },
  anel_vento: { name: 'Anel do Vento', type: 'acc', for: null, price: 260, stats: { spd: 4 }, desc: 'Deixa os passos leves.' },
  broche_estelar: { name: 'Broche Estelar', type: 'acc', for: null, price: 300, stats: { mag: 6, mp: 10 }, desc: 'Uma estrela pequena e quente.' },
  bracelete_forca: { name: 'Bracelete de Força', type: 'acc', for: null, price: 300, stats: { atk: 6 }, desc: 'Couro de javali e rebites de bronze.' },
  fita_vermelha: { name: 'Fita Vermelha', type: 'acc', for: null, price: 0, stats: { def: 2, res: 2 }, immune: ['veneno', 'sono'], desc: 'Fita de cabelo da mãe de Sena. Protege de veneno e sono.' },
};
