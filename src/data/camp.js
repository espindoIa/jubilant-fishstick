// Conversas ao redor dos cristais: cada dupla do grupo tem uma cena que aprofunda
// o passado dos personagens. Concluir uma cena cria o *Vínculo* da dupla:
// as técnicas duplas ficam 25% mais fortes e os dois ganham +4% de HP máximo.
import { HERO_DATA } from './heroes.js';

const T = (ctx, a, b) => ctx.ui.toast(`💞 Vínculo: <span style="color:var(--gold)">${HERO_DATA[a].name} ♥ ${HERO_DATA[b].name}</span>`, 2600);

export const BOND_DUAL_BONUS = 0.25;
export const BOND_HP_BONUS = 0.04;

export const CAMP_SCENES = [
  {
    id: 'lio_sena',
    pair: ['lio', 'sena'],
    title: 'A fita da mãe de Sena',
    cond: (s) => s.flag('ataque_fim'),
    async run(ctx) {
      await ctx.say(null, 'A luz do cristal tremula sobre os dois. Longe, a vila ainda cheira a fumaça.');
      await ctx.say('sena:sad', 'Você não me perguntou nada desde ontem. Isso não é a sua cara.');
      await ctx.say('lio', 'Achei que você ia falar quando quisesse.');
      await ctx.say('sena', '…Minha mãe também ouvia o céu, Lio. Era faroleira do santuário antes de mim.');
      await ctx.say('sena:sad', 'Numa noite igual à do festival, ela subiu a colina dizendo que as estrelas estavam chamando. E nunca desceu.');
      await ctx.say('lio:surprised', 'Você nunca me contou isso.');
      await ctx.say('sena', 'Você tinha oito anos e já carregava o céu inteiro nas costas. Eu não ia pôr mais um peso.');
      await ctx.say('sena:angry', 'Todo ano eu acendo a Lanterna-Guia achando que ela vai ver a luz e voltar. Que coisa mais boba.');
      await ctx.say('lio', 'Não é boba.');
      await ctx.say('lio:sad', 'Eu também acendo a minha vela na janela todo festival. Pra uma mãe que eu nem sabia se existia.');
      await ctx.say('sena:surprised', '…Você faz isso?');
      await ctx.say('lio:happy', 'Faço. E a gente nunca combinou nada. Duas bobagens bonitas, como diz o Ancião Bento.');
      await ctx.say('sena:happy', 'Hihi. Ele diria isso mesmo.');
      await ctx.say('sena', 'Dá aqui o braço.');
      await ctx.say(null, 'Sena desfaz a fita vermelha do próprio cabelo e amarra no pulso de Lio, com três voltas.');
      await ctx.say('sena', 'Era dela. Dizem que a fita protege de sono e de veneno. Eu acho que só protege de ficar sozinho.');
      await ctx.say('sena', 'Devolve quando a gente voltar. Os dois.');
      await ctx.say('lio', 'Prometo. Dessa vez, sem “só MEIO idiota”.');
      ctx.give('fita_vermelha', 1);
      T(ctx, 'lio', 'sena');
    },
  },
  {
    id: 'lio_estela',
    pair: ['lio', 'estela'],
    title: 'A mulher do farol',
    cond: (s) => s.flag('cap2'),
    async run(ctx) {
      await ctx.say('estela', 'Lio, posso te contar uma coisa? Eu lembrei. Um pedacinho.');
      await ctx.say('lio:surprised', 'Lembrou do quê?');
      await ctx.say('estela', 'Antes de cair eu estava perto de um farol. Eu ouvia uma mulher cantando lá em cima. Ela cantava de volta para nós.');
      await ctx.say('estela:happy', 'Cada vez que ela cantava, uma de nós encontrava o caminho para casa. Era tão quente…');
      await ctx.say('lio:surprised', 'Que cor era o cabelo dela?');
      await ctx.say('estela', 'Cor de fogo de lareira. Igual ao seu.');
      await ctx.say(null, 'Lio fica em silêncio. A mão dele, sem perceber, procura o cabo da Lâmina do Farol.');
      await ctx.say('lio:sad', '…Minha mãe. Aurora.');
      await ctx.say('estela', 'Ela parou de cantar de repente. Foi quando o silêncio começou. Foi quando eu comecei a cair.');
      await ctx.say('lio', 'Então a minha mãe não nos abandonou. Alguma coisa a fez parar.');
      await ctx.say('estela:happy', 'Você canta tão desafinado quanto ela deve ter ficado de saudade.');
      await ctx.say('lio:angry', 'Você tá me chamando de desafinado?!');
      await ctx.say('estela:happy', 'Hihi! Aprendi a palavra “banho” e agora também “provocar”.');
      await ctx.say('lio:happy', 'Você está aprendendo rápido demais.');
      await ctx.say('estela', 'Se eu esquecer isso, você me lembra? A mulher, o farol e a canção?');
      await ctx.say('lio', 'Todas as vezes. Prometo.');
      T(ctx, 'lio', 'estela');
    },
  },
  {
    id: 'brann_sena',
    pair: ['brann', 'sena'],
    title: 'O santuário que não queimou',
    cond: (s) => s.flag('brann_juntou'),
    async run(ctx) {
      await ctx.say('sena', 'Brann, posso perguntar uma coisa que talvez doa?');
      await ctx.say('brann', 'Pergunta. Dói do mesmo jeito se eu fugir.');
      await ctx.say('sena', 'O santuário que mandaram você queimar. Qual era?');
      await ctx.say('brann:sad', 'Santuário de Âmbar. Nas montanhas do norte. Dezoito Cantores, três crianças. Tinha uma horta e um cachorro velho.');
      await ctx.say('brann', 'Eu fiquei diante do portão e disse ao meu capitão que ele teria que passar por cima de mim.');
      await ctx.say('sena', 'E ele passou?');
      await ctx.say('brann', 'Não. Mandou me prender e levou todos para o Forte em correntes. Eu escapei na mesma noite. Cheguei tarde demais para tirá-los de lá.');
      await ctx.say('sena:surprised', 'Então eles estão vivos?');
      await ctx.say('brann', 'Estavam. Uma mulher de cabelo escuro me deu um pano para estancar o sangue. Tinha uma fita no braço. Vermelha. Três voltas de fio dourado.');
      await ctx.emote('sena', '!');
      await ctx.say('sena:surprised', '…Três voltas.');
      await ctx.say('brann', 'Você tem o mesmo desenho no pulso do seu amigo.');
      await ctx.say('sena:sad', 'Era a marca das faroleiras do santuário. A minha mãe… sua mãe tecia… Brann. Brann, como ela era?');
      await ctx.say('brann', 'Cansada e teimosa. Disse que ia esperar alguém voltar. Não disse quem.');
      await ctx.say('sena:happy', 'Teimosa. Então é ela.');
      await ctx.say('brann', 'Não prometo nada, garota. Mas se existir um corredor naquele forte que eu não conheça, eu o derrubo para você.');
      await ctx.say('sena', 'Obrigada por não ter prometido. Eu confio mais assim.');
      T(ctx, 'brann', 'sena');
    },
  },
  {
    id: 'brann_lio',
    pair: ['lio', 'brann'],
    title: 'Dois invernos',
    cond: (s) => s.flag('brann_juntou'),
    async run(ctx) {
      await ctx.say('lio:angry', 'Você conhece o Varek. Eu vi como ele olhou pra você.');
      await ctx.say('brann', 'Fui o instrutor dele. Quando chegou ao quartel ele tinha quinze anos e medo do escuro.');
      await ctx.say('lio:surprised', 'O Varek? Com medo do escuro?');
      await ctx.say('brann', 'Ele nasceu no Vale Branco, no ano do Grande Inverno. O céu ficou escuro por quatro meses. As estrelas não caíram. Os fornos apagaram. A irmãzinha dele não acordou numa manhã.');
      await ctx.say('brann:sad', 'O Império disse que aquilo nunca mais ia acontecer. Bastava manter o fogo aceso. A qualquer custo.');
      await ctx.say('lio:sad', 'E você?');
      await ctx.say('brann', 'Minha filha, Mira, também não acordou. Mesmo inverno, mesma cidade. Nós dois bebemos juntos o primeiro ano inteiro.');
      await ctx.say('brann', 'Ele escolheu nunca mais sentir frio. Eu escolhi nunca mais fazer ninguém sentir.');
      await ctx.say('lio', 'Isso não desculpa o que ele fez com a vila.');
      await ctx.say('brann', 'Não. Mas explica. E entender o inimigo é a única forma de vencê-lo sem virar ele.');
      await ctx.say('lio:happy', 'Você devia escrever isso num pergaminho.');
      await ctx.say('brann:happy', 'Já escrevi. Chama-se “dormir três horas por noite”.');
      await ctx.say('lio', 'Se a gente vencer o Varek… eu não quero odiá-lo no final. Quero que ele ouça.');
      await ctx.say('brann', 'Então o garoto tem mais coragem do que eu imaginava. E olha que eu imaginava pouco.');
      T(ctx, 'lio', 'brann');
    },
  },
  {
    id: 'brann_estela',
    pair: ['brann', 'estela'],
    title: 'O que as estrelas não são',
    cond: (s) => s.flag('golem_derrotado'),
    async run(ctx) {
      await ctx.say('estela:sad', 'Brann… o golem estava queimando por dentro. Eu senti. E se for isso o que o Império quer de mim?');
      await ctx.say('brann', 'Ele não vai chegar perto de você.');
      await ctx.say('estela', 'Você diz isso como se pudesse parar o céu.');
      await ctx.say('brann', 'Eu não posso parar o céu. Posso ficar parado entre o céu e quem eu quero proteger. Aprendi isso tarde. Foi o que me sobrou.');
      await ctx.say('estela:happy', 'Isso é bonito. É como a lareira da vó Odessa: quente e meio barulhenta.');
      await ctx.say('brann:surprised', 'Barulhenta?');
      await ctx.say('estela', 'Seus passos. Eles fazem “clanc, clanc, clanc”. Mas eu consigo ouvir de longe e saber que você está perto. É bom.');
      await ctx.say('brann:sad', 'A minha filha também dizia isso. Eu fazia barulho de propósito, para ela ouvir.');
      await ctx.say('estela', 'Então vou continuar ouvindo, Brann. Pode fazer barulho.');
      await ctx.say('brann', '…Clanc.');
      await ctx.say('estela:happy', 'Clanc!');
      await ctx.say(null, 'Ninguém ri em voz alta. Mas por um instante o cristal parece brilhar um pouco mais.');
      T(ctx, 'brann', 'estela');
    },
  },
  {
    id: 'sena_estela',
    pair: ['sena', 'estela'],
    title: 'O caderno de Sena',
    cond: (s) => s.flag('golem_derrotado'),
    async run(ctx) {
      await ctx.say('sena', 'Fica quieta. Seu cabelo está uma bagunça de estrela caída.');
      await ctx.say('estela:happy', 'Isso você chama de pentear?');
      await ctx.say('sena', 'Estou trançando. É diferente. Prende o cabelo e prende o pensamento. Minha mãe fazia isso comigo.');
      await ctx.say('estela:sad', 'Sena… eu estou esquecendo. Quando eu canto, volta um pedaço. Mas quando eu paro, outro vai embora.');
      await ctx.say('sena', 'Então a gente anota.');
      await ctx.say(null, 'Sena tira do bolso um caderninho de capa gasta e uma ponta de carvão.');
      await ctx.say('sena', 'Palavra do dia: “banho”. Ela riu. Palavra do dia: “lareira”. Ela disse que as chamas dançam. Palavra do dia: “doce de coco”. Ela perguntou se estrelas podem comer.');
      await ctx.say('estela:surprised', 'Você anotou tudo isso?');
      await ctx.say('sena', 'Desde o primeiro dia. Eu guardo as lembranças que o céu soltar. É o trabalho de uma faroleira.');
      await ctx.say('estela:happy', 'Então eu nunca vou esquecer ninguém. Alguém está guardando por mim.');
      await ctx.say('sena:happy', 'Nem o Brann e o barulho de lata dele.');
      await ctx.say('estela', 'Sena. Obrigada. É a primeira vez que a palavra “casa” não dói.');
      T(ctx, 'sena', 'estela');
    },
  },
];

export function sceneAvailable(state, scene) {
  if (state.flag('camp_' + scene.id)) return false;
  if (!scene.pair.every((id) => state.party.includes(id))) return false;
  return !!scene.cond(state);
}

export function pendingScenes(state) {
  return CAMP_SCENES.filter((s) => sceneAvailable(state, s));
}

export function bondRank(state, a, b) {
  const id = CAMP_SCENES.find((s) => s.pair.includes(a) && s.pair.includes(b))?.id;
  return id && state.flag('camp_' + id) ? 1 : 0;
}

export function bondsOf(state, heroId) {
  return CAMP_SCENES.filter((s) => s.pair.includes(heroId) && state.flag('camp_' + s.id)).length;
}

// Escolhe e executa uma cena ao redor do cristal
export async function playCamp(ctx) {
  const list = pendingScenes(ctx.state);
  if (!list.length) return false;
  const pick = await ctx.choose([...list.map((s) => `✦ ${s.title}`), 'Agora não'], { cancel: list.length });
  if (pick >= list.length) return false;
  const scene = list[pick];
  ctx.gather();
  ctx.music('star');
  await ctx.fadeOut(500);
  await ctx.wait(300);
  await ctx.fadeIn(600);
  await scene.run(ctx);
  ctx.state.set('camp_' + scene.id);
  ctx.sfx('levelup');
  const m = ctx.f.map?.music;
  ctx.music((typeof m === 'function' ? m(ctx.state) : m) || 'village');
  return true;
}
