// Códice e resumo de capítulo (menu Crônica). Entradas surgem conforme as flags da história.
import { ALL_SHARDS, shardFlag } from './shards.js';

export const CODEX = [
  { id: 'mare', title: 'Vila Maré', cond: () => true,
    text: 'Vila de pescadores sob o Farol Velho. A cada ano o Festival das Estrelas solta centenas de lanternas de papel: quem faz um pedido “é lembrado” pelo céu.' },
  { id: 'queda', title: 'Estrelas Caídas', cond: (s) => s.flag('estrela_caiu'),
    text: 'Quando uma estrela cai, o mundo esquece algo: uma canção, um nome, o caminho de casa. Esta foi a primeira que caiu inteira — e cantando — em cem anos.' },
  { id: 'bosque', title: 'Bosque Sussurrante', cond: (s) => s.flag('estrela_caiu'),
    text: 'Bosque ao norte da vila onde cogumelos brilham e o silêncio dura demais. A árvore espiritual no centro restaura quem descansa sob ela.' },
  { id: 'imperio', title: 'Império de Ferro', cond: (s) => s.flag('cao_derrotado'),
    text: 'Nação de fornalhas e navios de vapor. Queima estrelas caídas como combustível e chama isso de “calor para cem mil lares”.' },
  { id: 'varek', title: 'Capitão Varek', cond: (s) => s.flag('cao_derrotado'),
    text: 'Oficial imperial de voz educada e mão pesada. Pilota a Armadura Titã e persegue Estela por ordem de alguém que ainda não mostrou o rosto.' },
  { id: 'cantores', title: 'Cantores de Estrelas', cond: (s) => s.flag('estela_acordou'),
    text: 'Pessoas capazes de ouvir o céu e cantar de volta, guiando as estrelas para casa. O Império os persegue desde que as estrelas passaram a valer mais do que eles.' },
  { id: 'aurora', title: 'Aurora', cond: (s) => s.flag('estela_acordou'),
    text: 'Mãe de Lio e Cantora de Estrelas. Cantava do alto do farol toda noite. Desapareceu na mesma noite em que uma constelação inteira sumiu do céu.' },
  { id: 'chave', title: 'A Chave do Sino', cond: (s) => s.flag('ataque_fim'),
    text: '“A chave nunca foi este pedaço de latão. A chave é a canção — e quem é capaz de cantá-la.” — Odessa.' },
  { id: 'caverna', title: 'Caverna de Cristal', cond: (s) => s.flag('cap2'),
    text: 'Mina de ametista que cresce onde estrelas muito antigas caíram. Os mineiros fugiram quando o Império acordou algo nas profundezas.' },
  { id: 'brann', title: 'Brann, o Desertor', cond: (s) => s.flag('brann_juntou'),
    text: 'Vinte anos cavaleiro do Império. Raspou o brasão da armadura no dia em que recusou queimar um santuário com gente dentro. Come pouco, dorme três horas e faz barulho de propósito.' },
  { id: 'inverno', title: 'O Grande Inverno', cond: (s) => s.flag('camp_brann_lio'),
    text: 'Quatro meses de céu escuro no Vale Branco. Os fornos se apagaram. Brann perdeu a filha Mira; Varek, a irmã. Um escolheu proteger; o outro, nunca mais sentir frio.' },
  { id: 'ambar', title: 'Santuário de Âmbar', cond: (s) => s.flag('camp_brann_sena'),
    text: 'Santuário nas montanhas do norte: 18 Cantores, 3 crianças, uma horta e um cachorro velho. Foi levado ao Forte Ferrugem em correntes. Uma faroleira de fita vermelha ainda esperava alguém.' },
  { id: 'fita', title: 'Fita de Três Voltas', cond: (s) => s.flag('camp_lio_sena'),
    text: 'Marca das faroleiras do santuário. A mãe de Sena a tecia. Hoje está no pulso de Lio e protege de sono e veneno — e, segundo Sena, de ficar sozinho.' },
  { id: 'farol', title: 'A Mulher do Farol', cond: (s) => s.flag('camp_lio_estela'),
    text: 'Estela se lembra de uma voz de mulher cantando de um farol, cabelos cor de fogo. Quando ela parou, o silêncio começou… e Estela caiu.' },
  { id: 'caderno', title: 'Caderno de Sena', cond: (s) => s.flag('camp_sena_estela'),
    text: 'Palavras do dia de Estela: banho, lareira, doce de coco, casa. “Eu guardo as lembranças que o céu soltar. É o trabalho de uma faroleira.”' },
  { id: 'eco', title: 'Ecos e Ressonância', cond: (s) => s.flag('eco_despertou'),
    text: 'A canção de Aurora vive em Lio. Quando a batalha esquenta, o grupo acumula ECO; com a barra cheia, cada herói pode soltar sua Ressonância.' },
  { id: 'memorias', title: 'Memórias de Estela', cond: (s) => ALL_SHARDS.some((x) => s.flag(shardFlag(x.id))),
    text: (s) => `Estilhaços coletados: ${ALL_SHARDS.filter((x) => s.flag(shardFlag(x.id))).length}/${ALL_SHARDS.length}.\n\n` + ALL_SHARDS.filter((x) => s.flag(shardFlag(x.id))).map((x) => `« ${x.title} » — ${x.text}`).join('\n\n') },
  { id: 'lua', title: 'A Lua Cinzenta', cond: (s) => s.flag('varek_derrotado'),
    text: 'Uma lua que não existia antes da noite em que Aurora sumiu. Varek diz que ela está acordando. Nem a canção de Estela poderá bastar.' },
];

export const CHAPTERS = [
  { id: 'c0', title: 'Prólogo — A Estrela que Canta', cond: () => true,
    text: 'No Festival das Estrelas, uma estrela cai e canta. Lio corre ao Bosque Sussurrante e encontra uma menina que não lembra de nada.' },
  { id: 'c1', title: 'Capítulo 1 — Ecos no Farol', cond: (s) => s.flag('estela_acordou'),
    text: 'Estela acorda na casa de Lio. Odessa revela que Aurora, mãe de Lio, era Cantora de Estrelas. Os navios do Império atacam a vila e levam Odessa.' },
  { id: 'c2', title: 'Capítulo 2 — O Guardião sem Brasão', cond: (s) => s.flag('cap2'),
    text: 'O grupo atravessa a Caverna de Cristal, encontra Brann e derrota o Golem Ametista. Cada pausa ao redor dos cristais aproxima o grupo.' },
  { id: 'c3', title: 'Capítulo 3 — O Salão da Fornalha', cond: (s) => s.flag('odessa_resgatada'),
    text: 'Odessa é libertada e entrega a Lâmina do Farol. Resta enfrentar Varek e libertar a estrela presa na Armadura Titã.' },
  { id: 'c4', title: 'Epílogo — A Lua Cinzenta', cond: (s) => s.flag('final'),
    text: 'A estrela volta ao céu. Mas uma lua pálida abre um olho no horizonte. A Crônica I termina — e o caminho de Aurora continua.' },
];

export function unlockedCodex(state) {
  return CODEX.filter((e) => e.cond(state));
}
export function recap(state) {
  return CHAPTERS.filter((c) => c.cond(state));
}
