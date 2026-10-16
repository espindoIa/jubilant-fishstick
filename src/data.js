// ============================================================================
// DATA — tabelas de jogo. Equilibrar = editar números aqui.
// Nenhuma lógica neste arquivo: engine.js lê estas tabelas.
// ============================================================================
var DATA = {
  version: 1,

  // ATB (Active Time Battle): cada unidade enche a barra com SPD por tick.
  atb: { full: 300, ticksPerSecond: 12, heroStartMax: 150, enemyStartMax: 120 },

  rules: {
    critChance: 0.05, critMul: 1.6, variance: 0.12,
    defendMp: 4,                 // Defender recupera MP
    koReviveFrac: 0.15,          // herói nocauteado volta com 15% PV após vitória
    postMpFrac: 0.25,            // MP recuperado após cada combate
    levelXp: [0, 25, 60, 110, 175, 255, 350, 460, 590, 740, 910, 1100],
    levelGain: { hp: 0.09, atk: 1, mag: 1, def: 1 },
    tickCap: 40000,              // trava de segurança: nunca deve ser atingida
    itemSlots: 4,
    itemDropChance: 0.3,
    restHeal: 0.4,
    floorScale: 0.06,            // inimigos +6% PV/ATQ por andar dentro do ato
    rewardChoices: 3
  },

  status: {
    poison: { frac: 0.06 },      // % do PV máx por turno do afetado
    haste: { spdMul: 1.6 },
    slow: { spdMul: 0.55 },
    guard: { mul: 0.5 },
    shield: { mul: 0.6 },
    atkUp: { mul: 1.3 },
    prism: { magMul: 0.4 },      // reduz dano mágico recebido
    taunt: {},
    stun: {}
  },

  // ---------------------------------------------------------------- HERÓIS
  heroes: {
    rocca: {
      name: 'Rocca', title: 'Escudo de Bronze', role: 'Guardiã',
      hp: 132, mp: 26, atk: 14, mag: 4, def: 11, spd: 9,
      start: ['golpeEscudo', 'provocar'], learn: ['terremoto', 'fortaleza', 'martelo'],
      blurb: 'Carrega um escudo maior que ela. Protege, provoca e atordoa.'
    },
    lume: {
      name: 'Lume', title: 'Lanterna do Ocaso', role: 'Maga',
      hp: 86, mp: 46, atk: 6, mag: 17, def: 6, spd: 10,
      start: ['faisca', 'chamaAlta'], learn: ['meteoro', 'lentidao', 'meditar'],
      blurb: 'O chapéu pontudo esconde uma chama que nunca apaga. Dano mágico em área.'
    },
    pena: {
      name: 'Pena', title: 'Vento da Madrugada', role: 'Arqueira',
      hp: 88, mp: 28, atk: 13, mag: 5, def: 6, spd: 14,
      start: ['flechaDupla', 'roubar'], learn: ['venenoPena', 'chuvaPenas', 'passoAgil'],
      blurb: 'Máscara de pássaro e cachecol ao vento. A mais rápida: age muitas vezes.'
    },
    sino: {
      name: 'Sino', title: 'Badalo das Vésperas', role: 'Clériga',
      hp: 88, mp: 42, atk: 7, mag: 13, def: 7, spd: 11,
      start: ['cura', 'badalo'], learn: ['cancaoSerena', 'reviver', 'dobre'],
      blurb: 'Leva um sino nas costas. Cura e, ao badalar, adianta o turno da parceira.'
    }
  },

  // ---------------------------------------------------------------- TÉCNICAS
  // target: enemy | enemies | ally | allies | self | deadAlly | partner
  // fx: dmg{stat,pow,hits,random,pierce} heal{pow} status{s,dur,chance,to} mp{v} atb{v,to} revive{frac} steal{chance}
  skills: {
    golpeEscudo: { name: 'Golpe de Escudo', owner: 'rocca', mp: 6, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 1.3 }, { t: 'status', s: 'stun', dur: 1, chance: 0.5 }],
      desc: 'Dano físico e 50% de atordoar.' },
    provocar: { name: 'Provocar', owner: 'rocca', mp: 4, target: 'self',
      fx: [{ t: 'status', s: 'taunt', dur: 3 }, { t: 'status', s: 'guard', dur: 1 }],
      desc: 'Atrai os ataques por 3 turnos e se defende.' },
    terremoto: { name: 'Terremoto', owner: 'rocca', mp: 12, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.95 }],
      desc: 'Dano físico em todos os inimigos.' },
    fortaleza: { name: 'Fortaleza', owner: 'rocca', mp: 8, target: 'allies',
      fx: [{ t: 'status', s: 'shield', dur: 4 }],
      desc: 'Barreira no grupo: -40% de dano por 4 turnos.' },
    martelo: { name: 'Martelo do Juízo', owner: 'rocca', mp: 13, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 2.8 }],
      desc: 'Golpe físico enorme em um alvo.' },

    faisca: { name: 'Faísca', owner: 'lume', mp: 5, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'mag', pow: 1.4 }], desc: 'Dano mágico em um alvo.' },
    chamaAlta: { name: 'Chama Alta', owner: 'lume', mp: 11, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'mag', pow: 1.0 }], desc: 'Dano mágico em todos.' },
    meteoro: { name: 'Meteoro Miúdo', owner: 'lume', mp: 18, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'mag', pow: 2.8 }], desc: 'Dano mágico enorme em um alvo.' },
    lentidao: { name: 'Lentidão', owner: 'lume', mp: 8, target: 'enemies',
      fx: [{ t: 'status', s: 'slow', dur: 3, chance: 0.8 }], desc: '80% de deixar todos lentos.' },
    meditar: { name: 'Meditar', owner: 'lume', mp: 0, target: 'self',
      fx: [{ t: 'mp', v: 16 }, { t: 'status', s: 'guard', dur: 1 }], desc: 'Recupera 16 MP e se defende.' },

    flechaDupla: { name: 'Flecha Dupla', owner: 'pena', mp: 5, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.75, hits: 2 }], desc: 'Dois disparos.' },
    roubar: { name: 'Surrupiar', owner: 'pena', mp: 3, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.6 }, { t: 'steal', chance: 0.45 }],
      desc: 'Golpe leve; 45% de roubar um item.' },
    venenoPena: { name: 'Pena Venenosa', owner: 'pena', mp: 6, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.7 }, { t: 'status', s: 'poison', dur: 4, chance: 0.9 }],
      desc: 'Dano e veneno por 4 turnos.' },
    chuvaPenas: { name: 'Chuva de Penas', owner: 'pena', mp: 13, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.7, hits: 4, random: true }], desc: '4 flechas em alvos aleatórios.' },
    passoAgil: { name: 'Passo Ágil', owner: 'pena', mp: 7, target: 'allies',
      fx: [{ t: 'status', s: 'haste', dur: 3 }], desc: 'Acelera o grupo por 3 turnos.' },

    cura: { name: 'Cura', owner: 'sino', mp: 6, target: 'ally',
      fx: [{ t: 'heal', pow: 2.3 }], desc: 'Cura uma aliada.' },
    badalo: { name: 'Badalo', owner: 'sino', mp: 5, target: 'partner',
      fx: [{ t: 'atb', v: 'full' }], desc: 'A parceira age já. Prepara Técnicas Duplas.' },
    cancaoSerena: { name: 'Canção Serena', owner: 'sino', mp: 11, target: 'allies',
      fx: [{ t: 'heal', pow: 2.0 }, { t: 'status', s: 'shield', dur: 2 }], desc: 'Cura o grupo e dá barreira por 2 turnos.' },
    reviver: { name: 'Reviver', owner: 'sino', mp: 10, target: 'deadAlly',
      fx: [{ t: 'revive', frac: 0.65 }], desc: 'Revive com 65% PV.' },
    dobre: { name: 'Dobre Grave', owner: 'sino', mp: 11, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'mag', pow: 0.8 }, { t: 'status', s: 'stun', dur: 1, chance: 0.25 }],
      desc: 'Dano mágico em todos, 25% de atordoar.' }
  },

  // ---------------------------------------------------------------- TÉCNICAS DUPLAS
  // Exigem as duas heroínas com ATB cheia e MP de ambas (adaptado das Techs de Chrono Trigger).
  // Dano usa a SOMA do atributo das duas.
  techs: {
    bastiao: { name: 'Bastião Ígneo', pair: ['rocca', 'lume'], cost: { rocca: 8, lume: 8 }, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'mag', pow: 1.45 }, { t: 'status', s: 'shield', dur: 2, to: 'allies' }],
      desc: 'Chamas em todos + barreira no grupo.' },
    catapulta: { name: 'Catapulta', pair: ['rocca', 'pena'], cost: { rocca: 8, pena: 8 }, target: 'enemy',
      fx: [{ t: 'dmg', stat: 'atk', pow: 1.1, pierce: true }],
      desc: 'Rocca arremessa Pena: dano enorme que ignora defesa.' },
    badaladaFerro: { name: 'Badalada de Ferro', pair: ['rocca', 'sino'], cost: { rocca: 8, sino: 8 }, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.78 }, { t: 'status', s: 'stun', dur: 1, chance: 0.5 }],
      desc: 'Escudo contra sino: dano em todos e 50% de atordoar.' },
    cometa: { name: 'Chuva Cometa', pair: ['lume', 'pena'], cost: { lume: 10, pena: 8 }, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'mag', pow: 0.58, hits: 5, random: true }],
      desc: 'Cinco flechas em chamas em alvos aleatórios.' },
    aurora: { name: 'Aurora', pair: ['lume', 'sino'], cost: { lume: 10, sino: 10 }, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'mag', pow: 0.5 }, { t: 'heal', pow: 0.72, to: 'allies' }],
      desc: 'Luz que fere todos os inimigos e cura o grupo.' },
    ciclone: { name: 'Ciclone Sonoro', pair: ['pena', 'sino'], cost: { pena: 8, sino: 9 }, target: 'enemies',
      fx: [{ t: 'dmg', stat: 'atk', pow: 0.9 }, { t: 'atb', v: 0 }],
      desc: 'Vento e som em todos; zera a ATB inimiga.' }
  },

  // ---------------------------------------------------------------- CONSUMÍVEIS
  items: {
    erva: { name: 'Erva de Vésper', target: 'ally', fx: [{ t: 'healPct', v: 0.45 }], desc: 'Cura 45% do PV.' },
    eter: { name: 'Gota de Éter', target: 'ally', fx: [{ t: 'mp', v: 22 }], desc: 'Recupera 22 MP.' },
    pluma: { name: 'Pluma Renascida', target: 'deadAlly', fx: [{ t: 'revive', frac: 0.5 }], desc: 'Revive com 50% PV.' },
    bomba: { name: 'Bomba de Fuligem', target: 'enemies', fx: [{ t: 'flat', v: 40, perAct: 45 }], desc: 'Dano fixo em todos.' },
    cha: { name: 'Chá de Relâmpago', target: 'allies', fx: [{ t: 'status', s: 'haste', dur: 3 }], desc: 'Acelera o grupo.' },
    elixir: { name: 'Elixir da Aurora', target: 'allies', fx: [{ t: 'healPct', v: 1 }, { t: 'mp', v: 99 }], desc: 'Cura tudo do grupo.', rare: true }
  },

  // ---------------------------------------------------------------- RELÍQUIAS
  // mod: chaves *Mul multiplicam; demais somam.
  relics: {
    ampulheta: { name: 'Ampulheta Rachada', rarity: 'r', mod: { startAtb: 1 }, desc: 'O grupo começa o combate com ATB cheia.' },
    presa: { name: 'Presa Rubra', rarity: 'c', mod: { lifesteal: 0.1 }, desc: 'Dano causado cura 10% dele.' },
    sinoBolso: { name: 'Sino de Bolso', rarity: 'c', mod: { techCostMul: 0 }, desc: 'Técnicas Duplas não gastam MP.' },
    botas: { name: 'Botas de Vento', rarity: 'c', mod: { spd: 1 }, desc: '+1 de velocidade.' },
    coroa: { name: 'Coroa de Espinhos', rarity: 'r', mod: { dmgMul: 1.4, hpMul: 0.9 }, desc: '+40% de dano, -10% PV máx.' },
    grimorio: { name: 'Grimório Rasgado', rarity: 'c', mod: { skillMul: 1.2 }, desc: 'Técnicas causam +20%.' },
    escama: { name: 'Escama de Dragão Velho', rarity: 'c', mod: { takenMul: 0.88 }, desc: '-12% de dano recebido.' },
    lanterna: { name: 'Lanterna Eterna', rarity: 'r', mod: { mpPerTurn: 2 }, desc: '+2 MP a cada turno.' },
    trevo: { name: 'Trevo de Sete Folhas', rarity: 'c', mod: { crit: 0.25 }, desc: '+25% de crítico.' },
    espelho: { name: 'Espelho Partido', rarity: 'r', mod: { reflect: 0.8 }, desc: 'Devolve 80% do dano físico recebido.' },
    golem: { name: 'Coração de Golem', rarity: 'c', mod: { hpFlat: 22 }, desc: '+22 PV máx.' },
    relogio: { name: 'Relógio Parado', rarity: 'c', mod: { enemyStartAtb: 1, enemySpdMul: 0.95 }, desc: 'Inimigos começam sem ATB e são 5% mais lentos.' },
    tambor: { name: 'Tambor de Guerra', rarity: 'c', mod: { techBuff: 1 }, desc: 'Após Técnica Dupla: +30% de dano por 3 turnos.' },
    semente: { name: 'Semente Antiga', rarity: 'c', mod: { postHeal: 0.15 }, desc: 'Cura 15% do PV após cada combate.' },
    olhoCorvo: { name: 'Olho do Corvo', rarity: 'r', mod: { doubleAttack: 1 }, desc: 'Atacar golpeia duas vezes (85% cada).' },
    calice: { name: 'Cálice Amargo', rarity: 'c', mod: { poisonOnHit: 0.2 }, desc: 'Atacar tem 20% de envenenar.' },
    fenix: { name: 'Pluma do Último Voo', rarity: 'r', mod: { revive: 1 }, desc: 'Uma vez por ato, quem cair volta com 60% PV.' },
    moeda: { name: 'Moeda de Duas Caras', rarity: 'c', mod: { itemFind: 0.35 }, desc: '+35% de chance de achar itens.' },
    pedraEco: { name: 'Pedra do Eco', rarity: 'r', mod: { echo: 0.4 }, desc: 'Técnicas têm 40% de se repetir de graça.' },
    manoplas: { name: 'Manoplas do Ferreiro', rarity: 'c', mod: { atk: 3 }, desc: '+3 de ataque.' },
    tiara: { name: 'Tiara de Âmbar', rarity: 'c', mod: { mag: 3 }, desc: '+3 de magia.' }
  },

  // ---------------------------------------------------------------- INIMIGOS
  // sprite: forma base + paleta própria (troca de paleta como nos RPGs de 16 bits)
  // moves: w = peso; every = a cada N turnos; hpBelow+once = gatilho único
  enemies: {
    gotim: { name: 'Gotim', sprite: 'blob', pal: ['#2f6b2a', '#7ccf4a', '#c6f58a'], hp: 36, atk: 9, mag: 4, def: 3, spd: 8, xp: 6,
      moves: [{ n: 'Encontrão', w: 4, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1 }] },
              { n: 'Salto Gosmento', w: 1, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1.4 }] }] },
    cogumago: { name: 'Cogumago', sprite: 'shroom', pal: ['#7a2430', '#d8504a', '#f3d9b0'], hp: 32, atk: 6, mag: 10, def: 2, spd: 7, xp: 8,
      moves: [{ n: 'Esporos', w: 2, target: 'hero', fx: [{ t: 'dmg', stat: 'mag', pow: 0.5 }, { t: 'status', s: 'poison', dur: 3, chance: 0.6 }] },
              { n: 'Bolha Arcana', w: 2, target: 'hero', fx: [{ t: 'dmg', stat: 'mag', pow: 1 }] }] },
    corujinha: { name: 'Corujinha-Faca', sprite: 'owl', pal: ['#5a3a22', '#a8743e', '#f0d080'], hp: 28, atk: 11, mag: 2, def: 2, spd: 14, xp: 8,
      moves: [{ n: 'Bicada', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 0.9 }] },
              { n: 'Rasante', w: 1, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 0.6, hits: 2 }] }] },
    toco: { name: 'Toco Ancião', sprite: 'stump', pal: ['#3d2a1a', '#7d5a36', '#5fae4a'], hp: 150, atk: 14, mag: 6, def: 7, spd: 7, xp: 30, elite: true,
      moves: [{ n: 'Raízes', w: 2, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 0.8 }, { t: 'status', s: 'stun', dur: 1, chance: 0.4 }] },
              { n: 'Galhada', w: 2, target: 'heroes', fx: [{ t: 'dmg', stat: 'atk', pow: 0.75 }] },
              { n: 'Seiva', w: 1, target: 'self', fx: [{ t: 'healPct', v: 0.12 }] }] },
    grumbal: { name: 'Grumbal, Sapo-Sino', sprite: 'boss_grumbal', hp: 460, atk: 15, mag: 12, def: 7, spd: 9, xp: 60, boss: true,
      moves: [{ n: 'Linguada', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1.3 }] },
              { n: 'Coaxo Azedo', w: 1, target: 'heroes', fx: [{ t: 'status', s: 'poison', dur: 3, chance: 0.5 }, { t: 'dmg', stat: 'mag', pow: 0.4 }] },
              { n: 'BADALADA!', every: 3, target: 'heroes', fx: [{ t: 'dmg', stat: 'mag', pow: 1.05 }, { t: 'status', s: 'stun', dur: 1, chance: 0.3 }] }] },

    gotimCristal: { name: 'Gotim de Cristal', sprite: 'blob', pal: ['#1c4a7a', '#4ab0e8', '#d6f6ff'], hp: 70, atk: 18, mag: 9, def: 7, spd: 9, xp: 14,
      moves: [{ n: 'Encontrão', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1 }] },
              { n: 'Endurecer', w: 1, target: 'self', fx: [{ t: 'status', s: 'guard', dur: 2 }] }] },
    morcegoPrisma: { name: 'Morcego-Prisma', sprite: 'bat', pal: ['#3a1f5c', '#a05ad8', '#ffe066'], hp: 52, atk: 18, mag: 11, def: 4, spd: 16, xp: 14,
      moves: [{ n: 'Mordida', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 0.9, drain: 0.5 }] },
              { n: 'Grito Agudo', w: 1, target: 'heroes', fx: [{ t: 'dmg', stat: 'mag', pow: 0.6 }] }] },
    fungoPrisma: { name: 'Fungo Prisma', sprite: 'shroom', pal: ['#2a2a6a', '#5a8ae0', '#e0f0ff'], hp: 60, atk: 11, mag: 19, def: 5, spd: 8, xp: 15,
      moves: [{ n: 'Esporos Frios', w: 2, target: 'heroes', fx: [{ t: 'dmg', stat: 'mag', pow: 0.55 }, { t: 'status', s: 'slow', dur: 2, chance: 0.4 }] },
              { n: 'Raio Prisma', w: 2, target: 'hero', fx: [{ t: 'dmg', stat: 'mag', pow: 1.1 }] }] },
    cavaleiroOco: { name: 'Cavaleiro Oco', sprite: 'knight', pal: ['#3a4252', '#8a96aa', '#7fe0ff'], hp: 300, atk: 24, mag: 11, def: 12, spd: 9, xp: 60, elite: true,
      moves: [{ n: 'Estocada', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1.2 }] },
              { n: 'Muralha Vazia', w: 1, target: 'self', fx: [{ t: 'status', s: 'guard', dur: 2 }] },
              { n: 'Corte Fantasma', every: 3, target: 'heroes', fx: [{ t: 'dmg', stat: 'atk', pow: 1.0 }] }] },
    vitra: { name: 'Vitra, Rainha de Vidro', sprite: 'boss_vitra', hp: 980, atk: 20, mag: 24, def: 10, spd: 11, xp: 120, boss: true,
      moves: [{ n: 'Estilhaços', w: 2, target: 'heroes', fx: [{ t: 'dmg', stat: 'mag', pow: 0.85 }] },
              { n: 'Lança de Cristal', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1.5 }] },
              { n: 'Véu Prismático', every: 4, target: 'self', fx: [{ t: 'status', s: 'prism', dur: 2 }] },
              { n: 'Lamento de Vidro', hpBelow: 0.5, once: true, target: 'heroes', fx: [{ t: 'atb', v: 0 }, { t: 'dmg', stat: 'mag', pow: 0.6 }] }] },

    engrenagem: { name: 'Engrenagem Viva', sprite: 'gear', pal: ['#5a4010', '#c89a2a', '#fff0a0'], hp: 104, atk: 26, mag: 9, def: 12, spd: 10, xp: 22,
      moves: [{ n: 'Moer', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 0.55, hits: 3 }] },
              { n: 'Girar', w: 1, target: 'self', fx: [{ t: 'status', s: 'haste', dur: 2 }] }] },
    sombra: { name: 'Sombra Ponteiro', sprite: 'ghost', pal: ['#1a1030', '#4a3a7a', '#ff6a8a'], hp: 89, atk: 15, mag: 28, def: 6, spd: 14, xp: 22,
      moves: [{ n: 'Toque Gélido', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'mag', pow: 1 }] },
              { n: 'Roubar Segundos', w: 1, target: 'hero', fx: [{ t: 'atb', v: 0 }, { t: 'status', s: 'slow', dur: 2, chance: 0.6 }] }] },
    corvo: { name: 'Corvo-Ponteiro', sprite: 'owl', pal: ['#14141e', '#3a3a52', '#e04040'], hp: 80, atk: 27, mag: 6, def: 6, spd: 18, xp: 22,
      moves: [{ n: 'Bicada de Aço', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1 }] },
              { n: 'Revoada', w: 1, target: 'heroes', fx: [{ t: 'dmg', stat: 'atk', pow: 0.6 }] }] },
    pendulo: { name: 'Pêndulo Carrasco', sprite: 'stump', pal: ['#2a1a3a', '#8a6a2a', '#d0d0e0'], hp: 508, atk: 33, mag: 11, def: 12, spd: 6, xp: 100, elite: true,
      moves: [{ n: 'Lâmina Lenta', w: 2, target: 'hero', fx: [{ t: 'dmg', stat: 'atk', pow: 1.3 }] },
              { n: 'Tique-Taque', w: 1, target: 'self', fx: [{ t: 'status', s: 'haste', dur: 2 }] },
              { n: 'Grande Oscilação', every: 2, target: 'heroes', fx: [{ t: 'dmg', stat: 'atk', pow: 0.9 }] }] },
    morvane: { name: 'Morvane, Tecelão de Horas', sprite: 'boss_morvane', hp: 1600, atk: 26, mag: 30, def: 12, spd: 12, xp: 0, boss: true,
      moves: [{ n: 'Fio do Tempo', w: 3, target: 'hero', fx: [{ t: 'dmg', stat: 'mag', pow: 1.15 }, { t: 'status', s: 'slow', dur: 2, chance: 0.4 }] },
              { n: 'Agulhas de Hora', w: 2, target: 'heroes', fx: [{ t: 'dmg', stat: 'atk', pow: 0.75, hits: 3, random: true }] },
              { n: 'Parar o Tempo', every: 4, target: 'heroes', fx: [{ t: 'atb', v: 0 }, { t: 'status', s: 'stun', dur: 1, chance: 0.25 }] },
              { n: 'Rebobinar', hpBelow: 0.4, once: true, target: 'self', fx: [{ t: 'healPct', v: 0.25 }, { t: 'status', s: 'haste', dur: 4 }] }] }
  },

  // ---------------------------------------------------------------- ATOS
  acts: [
    { name: 'Bosque Âmbar', sky: ['#2a1a3a', '#8a3a4a', '#e8804a', '#ffc870'], ground: ['#3a5a2a', '#24401c'],
      weak: [['gotim', 'gotim'], ['corujinha', 'gotim'], ['cogumago', 'gotim']],
      normal: [['gotim', 'cogumago', 'gotim'], ['corujinha', 'corujinha'], ['cogumago', 'cogumago', 'corujinha'], ['gotim', 'corujinha', 'cogumago']],
      elite: [['toco'], ['toco', 'gotim']], boss: 'grumbal' },
    { name: 'Cavernas de Vidro', sky: ['#0a0a1e', '#1a2a5a', '#2a5a8a', '#5ab0d0'], ground: ['#2a3a5a', '#1a2440'],
      weak: [['gotimCristal', 'morcegoPrisma'], ['fungoPrisma', 'gotimCristal']],
      normal: [['gotimCristal', 'fungoPrisma', 'morcegoPrisma'], ['morcegoPrisma', 'morcegoPrisma'], ['fungoPrisma', 'fungoPrisma', 'gotimCristal']],
      elite: [['cavaleiroOco'], ['cavaleiroOco', 'morcegoPrisma']], boss: 'vitra' },
    { name: 'Torre do Relógio Parado', sky: ['#120a1e', '#3a1a4a', '#7a3a6a', '#d08a4a'], ground: ['#3a2a3a', '#20142a'],
      weak: [['engrenagem', 'corvo'], ['sombra', 'engrenagem']],
      normal: [['engrenagem', 'sombra', 'corvo'], ['corvo', 'corvo', 'sombra'], ['sombra', 'sombra', 'engrenagem']],
      elite: [['pendulo'], ['pendulo', 'corvo']], boss: 'morvane' }
  ],

  // Mapa por ato (estrutura de Slay the Spire): linhas x colunas, caminhos que se cruzam sem cruzar arestas
  map: {
    rows: 6, cols: 4, paths: 3,
    weights: { combat: 50, event: 20, elite: 12, rest: 10, treasure: 8 },
    eliteMinRow: 2, firstRow: 'combat', lastRow: 'rest'
  },

  // ---------------------------------------------------------------- EVENTOS (nós "?")
  // efeitos: heal(%), hurt(% do PV atual), relic, rareRelic, item, xp, skill, maxHp, gamble{chance,win,lose}, story
  events: {
    relojoeiro: { title: 'O Relojoeiro Ambulante',
      text: 'Um velho de cartola-relógio abre o casaco cheio de engrenagens. "Uma relíquia por algumas horas da sua vida?"',
      choices: [{ label: 'Aceitar (perde 25% do PV)', fx: [{ t: 'hurt', v: 0.25 }, { t: 'relic' }] },
                { label: 'Recusar com educação', fx: [] }] },
    fonte: { title: 'Fonte de Âmbar',
      text: 'Água morna e dourada brota entre raízes. Tem gosto de tarde de verão.',
      choices: [{ label: 'Beber (cura 30%)', fx: [{ t: 'heal', v: 0.3 }] },
                { label: 'Encher um frasco (Erva)', fx: [{ t: 'item', id: 'erva' }] }] },
    estatua: { title: 'Estátua do Sino Mudo',
      text: 'Uma estátua segura um sino sem badalo. Há uma corda pendurada.',
      choices: [{ label: 'Puxar a corda (50%: relíquia rara / dano)', fx: [{ t: 'gamble', chance: 0.5, win: [{ t: 'rareRelic' }], lose: [{ t: 'hurt', v: 0.3 }] }] },
                { label: 'Rezar em silêncio (+XP)', fx: [{ t: 'xp', v: 30 }] }] },
    menina: { title: 'A Menina de Vidro',
      text: 'Uma menina translúcida chora num banco de praça. "Papai disse que a tarde nunca vai acabar. Mas eu queria ver estrelas."',
      choices: [{ label: 'Consolar a menina', fx: [{ t: 'item', id: 'pluma' }, { t: 'story', id: 'evt_menina' }] },
                { label: 'Seguir viagem', fx: [{ t: 'xp', v: 15 }] }] },
    livro: { title: 'Livro Esquecido',
      text: 'Um livro aberto flutua no ar, virando páginas sozinho.',
      choices: [{ label: 'Ler com atenção (nova técnica)', fx: [{ t: 'skill' }] },
                { label: 'Arrancar uma página (+XP)', fx: [{ t: 'xp', v: 40 }] }] },
    eco: { title: 'Seus Próprios Passos',
      text: 'Na lama, pegadas idênticas às suas. Vão até ali... e somem. Você já passou por aqui antes.',
      choices: [{ label: 'Seguir as pegadas (cura 15%, +XP)', fx: [{ t: 'heal', v: 0.15 }, { t: 'xp', v: 20 }] },
                { label: 'Apagar as pegadas (+PV máx)', fx: [{ t: 'maxHp', v: 8 }] }] }
  },

  // ---------------------------------------------------------------- PROGRESSO ENTRE JORNADAS
  meta: {
    ecos: { perFloor: 1, perElite: 3, perBoss: 12, victory: 25 },
    upgrades: {
      vigor: { name: 'Vigor do Santuário', desc: '+3% PV máx por nível', costs: [20, 35, 55], mod: { hpMul: 0.03 } },
      bolsa: { name: 'Bolsa da Guardiã', desc: '+1 Erva inicial por nível', costs: [15, 40], mod: { startErva: 1 } },
      relogio: { name: 'Corda no Relógio', desc: '+12,5% de ATB inicial por nível', costs: [25, 45], mod: { startAtbBonus: 0.125 } },
      memoria: { name: 'Memória Viva', desc: 'Recompensas com 4 opções', costs: [40], mod: { rewardChoices: 1 } },
      heranca: { name: 'Herança de Ecos', desc: 'Começa com uma relíquia comum', costs: [80], mod: { startRelic: 1 } }
    }
  },

  // ---------------------------------------------------------------- HISTÓRIA
  // when: intro | deaths:N | boss:id | victory:N | heroDeath:id | runs:N | event
  story: [
    { id: 'intro', when: { intro: true }, speaker: 'Clépsidra', lines: [
      'Acordem. O sol está parado no horizonte de novo. Faz cem anos que é fim de tarde em Vésper.',
      'Lá no alto fica a Torre do Relógio Parado. Alguém costurou as horas para que este dia nunca acabe.',
      'Só vocês quatro despertam. Se caírem, o dia recomeça, e vocês voltam a este Santuário.'] },
    { id: 'd1', when: { deaths: 1 }, speaker: 'Clépsidra', lines: [
      'Vocês voltaram. Eu me lembro da última vez. Vocês, não.',
      'Mas cada passo deixa um Eco no chão do Santuário. Gastem-nos: o Santuário fica mais forte com vocês.'] },
    { id: 'd2', when: { deaths: 2 }, speaker: 'Clépsidra', lines: [
      'Repararam nos monstros do Bosque? Têm algo de familiar.',
      'São as horas que os moradores de Vésper esqueceram de viver. Viraram bicho de tanto esperar.'] },
    { id: 'hRocca', when: { heroDeath: 'rocca' }, speaker: 'Clépsidra', lines: [
      'Rocca sempre acorda primeiro, ao meio-dia em ponto. Nunca se perguntou por quê.',
      'O escudo dela tem marcas de ponteiro. Como se tivesse sido o mostrador de alguma coisa.'] },
    { id: 'hLume', when: { heroDeath: 'lume' }, speaker: 'Clépsidra', lines: [
      'A lanterna de Lume nunca apaga. Ela diz que é "a última luz antes da noite".',
      'Não sabe de onde tirou essa frase. Eu sei.'] },
    { id: 'hPena', when: { heroDeath: 'pena' }, speaker: 'Clépsidra', lines: [
      'Pena não lembra da própria infância. Lembra só de um vento frio às quatro da manhã.',
      'Faz cem anos que não existe madrugada em Vésper. E mesmo assim ela sente esse frio.'] },
    { id: 'hSino', when: { heroDeath: 'sino' }, speaker: 'Clépsidra', lines: [
      'O sino nas costas de Sino toca sozinho quando alguém está prestes a cair.',
      'Ele nunca errou a hora. Nem uma vez.'] },
    { id: 'd3', when: { deaths: 3 }, speaker: 'Clépsidra', lines: [
      'Eu já fui ampulheta de cozinha, sabiam? Media o tempo do pão.',
      'Quando o tempo parou, fui a única coisa nesta cidade que continuou escorrendo. Então virei guardiã.'] },
    { id: 'gBoss', when: { boss: 'grumbal' }, speaker: 'Grumbal', lines: [
      'BLÓÓÓNG... o sino do campanário rachou.',
      'Clépsidra: O sapo guardava a sexta badalada, a que anuncia a noite. Sem ele, a noite pode tentar chegar.'] },
    { id: 'd5', when: { deaths: 5 }, speaker: 'Clépsidra', lines: [
      'Morvane era o relojoeiro do rei. A filha dele adoeceu num fim de tarde.',
      'Ele não deixou aquele fim de tarde terminar. Achou que, se a noite não viesse, ela também não iria.'] },
    { id: 'evt_menina', when: { event: true }, speaker: 'Menina de Vidro', lines: [
      'Obrigada. Meu nome é Vitra. Se encontrarem meu pai, digam que eu não estou com medo do escuro.'] },
    { id: 'vBoss', when: { boss: 'vitra' }, speaker: 'Vitra', lines: [
      'Pai... deixe o sol se pôr. Eu já estava cansada antes do vidro.',
      'Clépsidra: Era a filha. Ele a guardou em cristal para que a doença nunca chegasse ao fim da tarde.'] },
    { id: 'd8', when: { deaths: 8 }, speaker: 'Clépsidra', lines: [
      'Cada volta de vocês racha um pouco mais a Torre. O tempo de Morvane também está acabando.',
      'Ele sabe que vocês vêm. Ele sempre soube.'] },
    { id: 'win1', when: { victory: 1 }, speaker: 'Morvane', lines: [
      'Cem anos de tarde... e ela nunca me perdoou.',
      'Vocês quatro... o meio-dia, o crepúsculo, a madrugada e as vésperas. As horas que eu arranquei do relógio.',
      'Clépsidra: O Coração de Vésper bate de novo. O sol, enfim, se põe. Agora vocês podem envelhecer.'] },
    { id: 'win2', when: { victory: 2 }, speaker: 'Clépsidra', lines: [
      'O tempo voltou a correr em Vésper. Mas os Ecos de vocês continuam aqui.',
      'Dizem que há outras torres além do horizonte. Outras tardes presas.'] }
  ]
};
