// Roteiro — Ecos da Aurora, Crônica I: "A Estrela que Canta".
// Cada script é uma função async(ctx). Coordenadas = tiles do mapa original.

const LOJA_VILA = ['pocao', 'antidoto', 'tonico', 'eter', 'bomba', 'couraca', 'espada_ferro', 'anel_vento'];
const LOJA_ACAMPAMENTO = ['pocao', 'hipocao', 'eter', 'tonico', 'pena', 'manto_encantado', 'bracelete_forca', 'malha_aco'];

export const SCRIPTS = {
  // ================================================================ PRÓLOGO
  async intro(ctx) {
    ctx.ui.setFade(1);
    ctx.music('star');
    await ctx.wait(500);
    await ctx.say(null, 'Dizem que cada estrela no céu guarda uma lembrança do mundo.');
    await ctx.say(null, 'Quando uma estrela cai… o mundo esquece alguma coisa.');
    await ctx.say(null, 'Naquela noite de festival, em Vila Maré, uma estrela caiu.\nE, pela primeira vez em cem anos… ela cantou.');
    await ctx.chapter('Prólogo', 'ECOS DA AURORA');
    ctx.music('village');
    ctx.spawn({ id: 'odessa_i', char: 'odessa', x: 32, y: 13, dir: 'left' });
    ctx.place('lio', 30, 13, 'up');
    await ctx.fadeIn(1200);
    ctx.banner('Vila Maré', 'Noite do Festival das Estrelas');
    await ctx.wait(1400);
    await ctx.say('odessa', 'Lio! Ainda aí parado olhando pro céu? O Festival das Estrelas já começou lá embaixo.');
    ctx.face('lio', 'right');
    await ctx.say('lio', 'Eu sei, vó. É que… parece que o céu tá cantarolando hoje.');
    await ctx.emote('odessa_i', '…');
    await ctx.say('odessa:surprised', 'Cantarolando, é?');
    await ctx.say('odessa:happy', 'Hmpf. Você e essas ideias. Igualzinho à sua mãe.');
    await ctx.say('lio:surprised', 'À minha mãe? Você nunca fala dela.');
    await ctx.say('odessa', 'E não vai ser hoje, que hoje é dia de festa. A Sena está no santuário te esperando para acender a Lanterna-Guia.');
    await ctx.say('odessa:happy', 'E não deixe a moça esperando. Ela tem paciência de santa… mas a mão é de pescador.');
    await ctx.say('lio:happy', 'Tá bom, tá bom! Já tô indo!');
    await ctx.say('odessa', 'Leve isto. Nunca se sabe quando um menino desastrado vai precisar.');
    ctx.give('pocao', 2);
    await ctx.wait(300);
    await ctx.say(null, 'Arraste o dedo na tela (ou use as setas/WASD) para andar.\nToque em *A* (ou Enter) para conversar e examinar. *☰* abre o menu.');
    ctx.remove('odessa_i');
    ctx.spawn({ id: 'odessa', char: 'odessa', x: 32, y: 13, dir: 'left', talk: 'odessa_vila' });
    ctx.set('intro_feita');
    ctx.objective('Encontrar Sena no santuário (colina a oeste da praça).');
  },

  async odessa_vila(ctx) {
    await ctx.say('odessa', 'O santuário fica na colina a oeste da praça. Siga o caminho de pedras e suba a escadaria.');
    await ctx.say('odessa:happy', 'E compre um doce de coco pra mim no caminho. Brincadeira! …A não ser que você queira.');
  },

  async bento(ctx) {
    if (ctx.flag('ataque_fim')) return SCRIPTS.manha_bento(ctx);
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, 'Sabia que o farol é mais velho que a própria vila, rapaz?');
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, 'Os antigos diziam que ele foi erguido sobre um sino que canta para as estrelas, para que elas não esqueçam o caminho de casa.');
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, '…Bobagem de velho, claro. Mas é uma bobagem bonita, não é?');
  },

  async loja_vila(ctx) {
    await ctx.say({ name: 'Dona Cida', portrait: 'mercadora' }, 'Bem-vindo à barraca da Cida! Poções fresquinhas, preço de festival!');
    await ctx.shop(ctx.flag('cap2') ? [...LOJA_VILA, 'hipocao', 'pena'] : LOJA_VILA);
    await ctx.say({ name: 'Dona Cida', portrait: 'mercadora' }, 'Volte sempre, meu bem!');
  },

  async pousada(ctx) {
    await ctx.say({ name: 'Rosa', portrait: 'estalajadeira' }, 'Pousada da Rosa! Uma noite de sono e um caldo de peixe por *20 moedas*. Quer descansar?');
    const c = await ctx.choose(['Descansar (20 moedas)', 'Agora não'], { cancel: 1 });
    if (c !== 0) return ctx.say({ name: 'Rosa', portrait: 'estalajadeira' }, 'Fica pra próxima, então!');
    if (ctx.state.gold < 20) return ctx.say({ name: 'Rosa', portrait: 'estalajadeira' }, 'Hmm… parece que falta dinheiro, querido.');
    ctx.state.gold -= 20;
    await ctx.fadeOut(600);
    ctx.heal();
    await ctx.wait(700);
    await ctx.fadeIn(600);
    await ctx.say({ name: 'Rosa', portrait: 'estalajadeira' }, 'Prontinho! Novinho em folha.');
  },

  async pescador(ctx) {
    if (ctx.flag('ataque_fim')) {
      await ctx.say({ name: 'Seu Jonas', portrait: 'pescador' }, 'Levaram a Odessa… e afundaram dois barcos meus. Se precisar de qualquer coisa, garoto, é só falar.');
      return;
    }
    await ctx.say({ name: 'Seu Jonas', portrait: 'pescador' }, 'Viu aqueles navios com fumaça preta no horizonte, Lio? Navios do Império de Ferro.');
    await ctx.say({ name: 'Seu Jonas', portrait: 'pescador' }, 'Nunca vi nada de bom sair de um navio que queima pedra brilhante em vez de vento.');
  },

  async pescador2(ctx) {
    await ctx.say({ name: 'Pescador', portrait: 'pescador' }, 'Dizem que se você faz um pedido quando a lanterna sobe, as estrelas lembram de você para sempre.');
  },

  async tito(ctx) {
    if (ctx.flag('ataque_fim')) return ctx.say({ name: 'Tito', portrait: 'crianca' }, 'Eu vi o grandão de armadura… quer dizer, os soldados! Eu não chorei. Só um pouquinho.');
    await ctx.say({ name: 'Tito', portrait: 'crianca' }, 'Quando eu crescer vou ser cavaleiro! Tchá! Tchá! …Lio, me ensina a usar espada de verdade?');
  },

  async lina(ctx) {
    if (ctx.flag('ataque_fim')) return ctx.say({ name: 'Lina', portrait: 'menina' }, 'Minha lanterna queimou no ataque… mas eu vou fazer outra. Maior!');
    await ctx.say({ name: 'Lina', portrait: 'menina' }, 'Fiz minha lanterna em forma de estrela! Você acha que as estrelas de verdade vão gostar?');
  },

  async placa_praia(ctx) {
    await ctx.say(null, '« Praia da Maré » — Cuidado com os caranguejos. Eles não têm senso de humor.');
  },

  async placa_norte(ctx) {
    await ctx.say(null, '« Norte: Bosque Sussurrante » — Não entre depois do anoitecer.');
  },

  async poco(ctx) {
    await ctx.say(null, 'Um poço antigo. Lá no fundo, a água reflete as estrelas como se fossem moedas perdidas.');
  },

  async porta_trancada(ctx) {
    await ctx.say(null, 'A porta está trancada. Todo mundo está no festival.');
  },

  async cristal_save(ctx) {
    ctx.sfx('star');
    await ctx.say(null, 'Um cristal azul pulsa com uma luz calma. Seu calor restaura o grupo.');
    ctx.heal();
    const c = await ctx.choose(['Salvar o progresso', 'Não salvar'], { cancel: 1 });
    if (c === 0) {
      const ok = await ctx.saveMenu();
      await ctx.say(null, ok ? 'Progresso salvo.' : 'Não foi possível salvar neste navegador.');
    }
  },

  async norte_bloqueado(ctx) {
    if (ctx.flag('ataque') && !ctx.flag('ataque_fim')) {
      await ctx.say('lio:angry', 'Não posso fugir agora. A vila está pegando fogo!');
    } else if (!ctx.flag('estrela_caiu')) {
      await ctx.say('lio', 'Primeiro o santuário. Se eu me atrasar de novo, a Sena me transforma em oferenda.');
    } else {
      await ctx.say('lio', 'Agora não.');
    }
    await ctx.stepBack('down', 1.1);
  },

  async entrar_casa(ctx) {
    ctx.sfx('door');
    await ctx.teleport('casa', 'door');
  },

  async estante_casa(ctx) {
    await ctx.say(null, 'Livros sobre marés, navegação… e um caderno de partituras com a capa gasta. Na primeira página: « Aurora ».');
  },

  async estante_casa2(ctx) {
    await ctx.say(null, 'Potes de conserva da Vó Odessa. Um rótulo diz: « NÃO MEXA, LIO ».');
  },

  async odessa_casa(ctx) {
    await ctx.say('odessa', 'O que está fazendo aqui dentro? A festa é lá fora, menino!');
  },

  async sena_santuario(ctx) {
    await ctx.say('sena', 'Lio! Venha, suba aqui. A Lanterna-Guia não se acende sozinha.');
  },

  async santuario_cena(ctx) {
    ctx.gather();
    await ctx.camera(5, 8, 600);
    await ctx.say('sena:happy', 'Finalmente! Achei que você ia perder a hora de novo.');
    await ctx.say('lio', 'Eu nunca perco a hora. Só… chego no último segundo.');
    await ctx.say('sena', 'Claro. Pegue a tocha. Juntos, como todo ano.');
    ctx.sfx('fire');
    await ctx.flash(500, '#ffd890', 0.7);
    await ctx.say(null, 'A Lanterna-Guia se acende. Lá embaixo, centenas de lanternas de papel sobem ao céu.');
    await ctx.say('sena:happy', 'Pronto. Agora faça um pedido.');
    await ctx.say('lio', '…Eu queria entender o que o céu tanto canta.');
    await ctx.say('sena:surprised', 'Você ainda ouve isso? Desde pequeno você diz que…');
    ctx.stopMusic(0.6);
    await ctx.wait(500);
    ctx.sfx('star');
    ctx.shake(0.5);
    await ctx.flash(900, '#c8f0ff', 0.9);
    ctx.music('star');
    await ctx.say(null, 'Uma luz rasgou o céu — maior e mais brilhante que qualquer estrela — e caiu atrás das árvores ao norte.');
    await ctx.emote('lio', '!');
    await ctx.say('lio:surprised', 'Você ouviu isso?! Ela… ela CANTOU!');
    await ctx.say('sena:surprised', 'Caiu no Bosque Sussurrante!');
    await ctx.say('lio', 'Eu vou até lá!');
    await ctx.say('sena:angry', 'Lio, espera! O bosque à noite é perigoso!');
    await ctx.say('lio:happy', 'Por isso mesmo eu tenho que ir rápido!');
    await ctx.say('sena:sad', 'Ai, esse menino… Vou avisar o Ancião Bento e te alcanço. Não faça nada idiota!');
    await ctx.say('lio:happy', 'Prometo não fazer nada MUITO idiota.');
    await ctx.move('sena', [[5, 9], [5, 11], [8, 12]], 3.2);
    ctx.remove('sena');
    ctx.cameraFollow();
    ctx.music('village');
    ctx.objective('Investigar a estrela caída no Bosque Sussurrante (saída norte da vila).');
  },

  // ================================================================ BOSQUE
  async bosque_entrada(ctx) {
    await ctx.say('lio', 'Os cogumelos estão brilhando mais que o normal… E esse silêncio. Nem os grilos estão cantando.');
    await ctx.say(null, 'Monstros vagam pelo bosque. Encostar neles inicia uma batalha.\nCada inimigo tem um *ESCUDO* 🛡. Acerte suas *FRAQUEZAS* para quebrá-lo: um inimigo quebrado perde a vez e sofre muito mais dano!');
  },

  async arvore_espiritual(ctx) {
    ctx.sfx('star');
    await ctx.say(null, 'Uma árvore antiga. Suas folhas brilham como água ao luar. Você sente uma paz estranha… suas forças voltam.');
    ctx.heal();
    if (!ctx.flag('fragmento_arvore')) {
      ctx.set('fragmento_arvore');
      await ctx.say(null, 'Entre as raízes, algo cintila.');
      ctx.give('fragmento', 1);
    }
  },

  async bosque_leste_bloqueado(ctx) {
    await ctx.say('lio', 'Esse caminho leva às Montanhas Cinzentas. Não tenho motivo para ir pra lá… ainda.');
    await ctx.stepBack('left', 1.1);
  },

  async clareira(ctx) {
    ctx.autosave();
    ctx.gather();
    ctx.stopMusic(1);
    ctx.spawn({ id: 'estela', char: 'estela', x: 17, y: 6, dir: 'down', pose: 'ko' });
    await ctx.camera(17, 7, 900);
    await ctx.say(null, 'No centro da clareira, uma cratera rasa ainda solta faíscas azuis. E, no meio dela…');
    await ctx.move('lio', [[17, 8]], 2.2);
    await ctx.emote('lio', '!');
    await ctx.say('lio:surprised', 'É… uma menina?!');
    ctx.music('star');
    await ctx.say('lio', 'Ei! Ei, você tá bem? Consegue me ouvir?');
    await ctx.say('estela:sad', '…frio… tão frio… o céu… está esquecendo…');
    ctx.stopMusic(0.5);
    ctx.sfx('steam');
    ctx.shake(0.3);
    await ctx.wait(600);
    await ctx.say({ name: '???', portrait: 'varek' }, 'Afaste-se do fragmento, garoto.');
    ctx.spawn({ id: 'varek', char: 'varek', x: 22, y: 11, dir: 'left' });
    ctx.spawn({ id: 's1', char: 'soldado', x: 23, y: 12, dir: 'left' });
    ctx.spawn({ id: 's2', char: 'soldado', x: 22, y: 13, dir: 'left' });
    const cao = ctx.showEnemy('cao_ferro', 20, 10, 0.8);
    ctx.face('lio', 'right');
    await ctx.camera(20, 9, 700);
    ctx.music('fort');
    await ctx.say('varek:happy', 'Que sorte a nossa. Desta vez a estrela caiu inteira.');
    await ctx.say('lio:angry', 'Estrela? Ela é uma pessoa!');
    await ctx.say('varek', 'Uma pessoa? Garoto, aquilo é o combustível mais puro deste mundo. O Império agradece a sua… preocupação.');
    await ctx.say('varek', 'Cão. Recolha a carga.');
    ctx.sfx('steam');
    await ctx.say('lio:angry', 'Vai ter que passar por mim primeiro!');
    ctx.sfx('light');
    await ctx.flash(400, '#fff8d0', 0.85);
    ctx.shake(0.4);
    await ctx.say({ name: '???', portrait: 'sena' }, 'Luz Sagrada!');
    ctx.spawn({ id: 'sena_c', char: 'sena', x: 15, y: 11, dir: 'up' });
    await ctx.move('sena_c', [[16, 9]], 3.5);
    await ctx.say('sena:angry', 'Eu disse para não fazer nada idiota!');
    await ctx.say('lio:happy', 'Isso foi só MEIO idiota!');
    await ctx.say('varek', 'Uma sacerdotisa do santuário? Achei que essa ordem tinha morrido junto com as velhas canções.');
    await ctx.say('sena', 'O santuário ainda está de pé. E nós também.');
    ctx.remove('sena_c');
    await ctx.join('sena');
    await ctx.say(null, 'Dica: o *Cão de Ferro* é fraco contra *IMPACTO* 🔨 (o cajado da Sena) e *LUZ* ✦ (Luz Sagrada).\nQuando ele carregar a fornalha, quebre o escudo para interromper o ataque!');
    ctx.hideEnemy(cao);
    const r = await ctx.battle(['cao_ferro'], { bg: 'forest', music: 'boss', noFlee: true });
    if (r !== 'win') return;
    ctx.set('cao_derrotado');
    ctx.music('fort');
    await ctx.say(null, 'O Cão de Ferro desaba numa nuvem de vapor e faíscas.');
    await ctx.say('varek', 'Hm. Interessante.');
    await ctx.say('varek', 'Recuar. Já medimos o que viemos medir.');
    await ctx.say('varek:happy', 'Garoto… guarde bem essa estrela. Eu volto para buscá-la.');
    await ctx.move('varek', [[25, 12], [29, 13]], 3);
    ctx.remove('varek');
    ctx.remove('s1');
    ctx.remove('s2');
    ctx.music('star');
    await ctx.say('sena:sad', 'Quem eram aqueles…?');
    await ctx.say('lio', 'Soldados do Império de Ferro. E eles queriam… ela.');
    await ctx.say('estela:sad', '…canção… você… canta igual a elas…');
    await ctx.say('sena', 'Ela desmaiou de novo. Está gelada! Precisamos levá-la para um lugar quente.');
    await ctx.say('lio', 'Lá em casa. A vó vai saber o que fazer.');
    await ctx.fadeOut(900);
    ctx.remove('estela');
    await ctx.teleport('casa', 'bed');
    await SCRIPTS.estela_acorda(ctx);
  },

  // ================================================================ CAPÍTULO 1
  async estela_acorda(ctx) {
    ctx.gather();
    ctx.ui.setFade(1);
    ctx.spawn({ id: 'estela', char: 'estela', x: 9, y: 6, dir: 'down', pose: 'ko' });
    ctx.place('lio', 6, 7, 'right');
    const sena = ctx.actor('sena');
    if (sena) ctx.place('sena', 7, 8, 'up');
    ctx.music('star');
    await ctx.chapter('Capítulo 1', 'ECOS NO FAROL');
    await ctx.fadeIn(1000);
    await ctx.say('odessa', 'Ela dormiu feito pedra. Pobrezinha, estava gelada como o mar de inverno.');
    await ctx.wait(400);
    ctx.remove('estela');
    ctx.spawn({ id: 'estela', char: 'estela', x: 9, y: 6, dir: 'left' });
    await ctx.emote('estela', '?');
    await ctx.say('estela', '…Onde… onde estão as outras?');
    await ctx.say('lio:surprised', 'Outras?');
    await ctx.say('estela:sad', 'As outras estrelas. Eu ouvia todas elas, o tempo todo. Agora só ouço silêncio…');
    await ctx.say('estela', '…e você. Você canta igual a elas.');
    await ctx.say('lio:surprised', 'Eu? Eu não canto. Juro.');
    await ctx.say('sena:happy', 'Ele canta no banho. Muito mal.');
    await ctx.say('lio:angry', 'Sena!');
    await ctx.say('estela:happy', 'Hihi… « banho ». Que palavra engraçada.');
    await ctx.say('odessa', 'Como você se chama, querida?');
    await ctx.say('estela', '…Estela. É a única coisa que eu lembro. Isso, e que o céu está esquecendo.');
    await ctx.say('odessa:sad', 'Vidro estelar nas roupas dela… Então é verdade. O Império está caçando as estrelas.');
    await ctx.say('lio', 'Vó, você sabe de alguma coisa. Eu sei que sabe.');
    await ctx.say('odessa:sad', '…Quando uma estrela cai, o mundo esquece algo. Uma canção, um nome, o caminho de casa.');
    await ctx.say('odessa', 'O Império queima as estrelas caídas para mover suas máquinas. Quanto mais queimam, mais o céu escurece… e mais o mundo esquece.');
    await ctx.say('odessa', 'Por isso existiam os Cantores de Estrelas. Pessoas capazes de ouvir o céu e cantar de volta, para guiar as estrelas para casa.');
    await ctx.say('odessa:sad', 'Sua mãe, Aurora, era uma delas, Lio.');
    await ctx.emote('lio', '!');
    await ctx.say('lio:surprised', 'Minha mãe…? Era por isso que ela…');
    await ctx.say('odessa', 'Eu ia te contar quando você fosse mais velho. Pelo visto, o céu decidiu por mim.');
    ctx.stopMusic(0.3);
    ctx.sfx('explosion');
    ctx.shake(0.7);
    await ctx.flash(300, '#ff9050', 0.8);
    await ctx.say('sena:surprised', 'O que foi isso?!');
    ctx.sfx('explosion');
    ctx.shake(0.6);
    await ctx.say('odessa:angry', 'Canhões… Os navios do Império! Estão atacando a vila!');
    await ctx.say('lio:angry', 'Eles vieram atrás da Estela. Fiquem aqui!');
    await ctx.say('odessa:angry', 'Ficar aqui uma ova! Esta casa é minha e a vila também!');
    ctx.set('estela_acordou');
    ctx.set('ataque');
    ctx.remove('estela');
    await ctx.fadeOut(500);
    await ctx.teleport('vila', 'casa_porta');
    await SCRIPTS.ataque_inicio(ctx);
  },

  async estela_casa(ctx) {
    await ctx.say('estela', 'O fogo dessa lareira dança. As estrelas também dançam, sabia?');
  },

  async ataque_inicio(ctx) {
    if (ctx.flag('ataque_luta')) return;
    ctx.set('ataque_luta');
    ctx.gather();
    ctx.spawn({ id: 'odessa_a', char: 'odessa', x: 31, y: 13, dir: 'left' });
    ctx.spawn({ id: 'estela_a', char: 'estela', x: 29, y: 13, dir: 'left' });
    ctx.spawn({ id: 'varek', char: 'varek', x: 24, y: 13, dir: 'right' });
    ctx.spawn({ id: 'r1', char: 'soldado', x: 25, y: 12, dir: 'right' });
    ctx.spawn({ id: 'r2', char: 'soldado', x: 25, y: 14, dir: 'right' });
    ctx.place('lio', 28, 13, 'left');
    await ctx.camera(27, 13, 400);
    await ctx.fadeIn(800);
    ctx.banner('Vila Maré', 'Sob ataque');
    await ctx.say(null, 'A vila arde. Lanternas de festival queimam junto com os telhados.');
    await ctx.say('varek', 'Boa noite, Vila Maré. Perdoem o barulho. O Império não costuma bater na porta.');
    await ctx.say('varek', 'Viemos buscar duas coisas: a estrela… e a velha guardiã que esconde a Chave do Sino.');
    await ctx.say('odessa:angry', 'Pois venha buscar, seu cabide de medalhas!');
    await ctx.say('varek:happy', 'Com prazer. Soldados.');
    await ctx.say('estela', 'Lio… eu posso ajudar. As estrelas ainda me respondem, um pouquinho.');
    await ctx.say('lio', 'Então fica perto de mim.');
    ctx.remove('estela_a');
    await ctx.join('estela');
    await ctx.say(null, 'A *Estela* usa magia elemental: 🔥 Faísca, ❄ Geada e ⚡ Trovão. Combine elementos para descobrir fraquezas!\nCom duas pessoas prontas, experimente as *Duplas* ✧ no menu de batalha.');
    const r = await ctx.battle(['recruta', 'recruta'], { bg: 'night', atmosphere: 'burning', music: 'battle', noFlee: true });
    if (r !== 'win') return;
    ctx.remove('r1');
    ctx.remove('r2');
    ctx.music('sad');
    await ctx.say('varek', 'Recrutas… sempre decepcionantes.');
    ctx.sfx('steam');
    ctx.shake(0.4);
    await ctx.say(null, 'Uma sombra gigantesca cobre a lua: um navio voador, sustentado por hélices e vapor.');
    ctx.spawn({ id: 'r3', char: 'soldado', x: 32, y: 12, dir: 'left' });
    await ctx.move('r3', [[32, 13]], 3);
    await ctx.say('odessa:angry', 'Me larga! Lio! LIO!');
    await ctx.say('lio:angry', 'VÓ!');
    await ctx.say('varek', 'A estrela pode esperar. Já ouvi o que precisava: ela canta para você, garoto. Então você virá até mim.');
    await ctx.say('varek:happy', 'Se quiser a velha de volta, venha buscá-la no Forte Ferrugem. E traga a estrela.');
    await ctx.say('odessa:sad', 'Lio! Proteja a menina! E não venha atrás de m—');
    await ctx.fadeOut(1200);
    ctx.remove('odessa_a');
    ctx.remove('r3');
    ctx.remove('varek');
    ctx.remove('odessa');
    await ctx.say(null, 'O navio sumiu entre as nuvens. As chamas foram apagadas com baldes de água do mar, por mãos que tremiam.');
    await ctx.say(null, 'Ninguém dormiu naquela noite.');
    ctx.set('ataque_fim');
    await ctx.teleport('vila', 'plaza');
    await SCRIPTS.manha(ctx);
  },

  async manha(ctx) {
    ctx.gather();
    ctx.music('village');
    ctx.place('lio', 17, 15, 'up');
    await ctx.chapter('Capítulo 2', 'O GUARDIÃO SEM BRASÃO');
    await ctx.fadeIn(900);
    await ctx.say('sena:sad', 'Lio… você não pregou o olho.');
    await ctx.say('lio', 'Forte Ferrugem. Onde fica isso?');
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, 'Além das Montanhas Cinzentas, rapaz. O único caminho a pé é pela Caverna de Cristal, a leste do Bosque Sussurrante.');
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, 'Os mineiros fugiram de lá faz um mês. Dizem que o Império acordou alguma coisa nas profundezas.');
    await ctx.say('lio', 'Então eu vou pela caverna.');
    await ctx.say('sena', 'NÓS vamos. O santuário pode esperar. A Vó Odessa não.');
    await ctx.say('estela', 'Eu também vou.');
    await ctx.say('lio:surprised', 'Estela, eles querem você. Ir até lá é entregar exatamente o que…');
    await ctx.say('estela', 'Se eu ficar, ele vem me buscar. Se eu for… pelo menos eu escolho.');
    await ctx.say('estela:happy', 'E vocês me ensinaram a palavra « banho ». Agora eu devo isso a vocês.');
    await ctx.say('lio:happy', '…Tá. Juntos, então.');
    ctx.set('cap2');
    ctx.cameraFollow();
    await ctx.say(null, 'Lojas da vila agora vendem *Hi-Poções* e *Penas de Fênix*. Prepare-se antes de partir!');
    ctx.objective('Atravessar a Caverna de Cristal (Bosque Sussurrante → saída leste).');
  },

  async manha_bento(ctx) {
    await ctx.say({ name: 'Ancião Bento', portrait: 'anciao' }, 'A Caverna de Cristal fica a leste do Bosque Sussurrante. Que as estrelas guiem vocês.');
  },

  // ================================================================ CAVERNA
  async caverna_entrada(ctx) {
    await ctx.say('estela:sad', 'As pedras daqui… estão chorando.');
    await ctx.say('sena', 'São cristais de ametista. Dizem que crescem onde estrelas muito antigas caíram.');
    await ctx.say('lio', 'Ótimo. Cristais chorões. Vamos logo antes que eu comece a chorar junto.');
    await ctx.say(null, 'Dica: a *Faísca* 🔥 da Estela e o *Corte Duplo* do Lio são ótimos para quebrar escudos rapidamente.');
  },

  async brann_encontro(ctx) {
    if (ctx.flag('brann_juntou')) return;
    if (ctx.flag('brann_conversou')) {
      return ctx.say('brann', 'Já disse. Eu vou com vocês. Andem.');
    }
    ctx.set('brann_conversou');
    ctx.gather();
    await ctx.camera(29, 27, 600);
    ctx.face('brann', 'left');
    await ctx.say({ name: '???', portrait: 'brann' }, 'Parados. Mais um passo e eu ponho vocês para dormir.');
    await ctx.emote('lio', '!');
    await ctx.say('lio:angry', 'Um soldado imperial?!');
    await ctx.say('sena', 'Espere, Lio. Olhe a armadura dele. O brasão foi raspado.');
    await ctx.say('brann', '…Garota observadora.');
    await ctx.say({ name: 'Mineiro', portrait: 'mineiro' }, 'Ele não é um deles! Esse grandalhão tirou a gente das minas quando o Império tomou tudo!');
    await ctx.say('brann', 'Meu nome é Brann. Fui cavaleiro do Império por vinte anos.');
    await ctx.say('brann:sad', 'Até o dia em que me mandaram queimar um santuário de Cantores de Estrelas… com gente dentro.');
    await ctx.say('brann', 'Recusei. Me chamaram de traidor. Eu chamo de ter estômago.');
    await ctx.emote('brann', '…');
    await ctx.say('brann:surprised', 'Essa luz… Menina, você é uma das que eles caçam.');
    await ctx.say('estela', 'Você está triste. Dá para ouvir.');
    await ctx.say('brann', '…Estou cansado, menina. É diferente.');
    await ctx.say('lio', 'Levaram a minha avó para o Forte Ferrugem. Nós vamos buscá-la.');
    await ctx.say('brann', 'Forte Ferrugem. Eu servi lá. Conheço cada corredor, cada guarda preguiçoso… e o que eles guardam no salão da fornalha.');
    await ctx.say('brann', 'Três crianças contra uma fortaleza. Vocês vão morrer.');
    await ctx.say('sena:angry', 'Obrigada pelo encorajamento.');
    await ctx.say('brann:happy', 'Por isso eu vou junto.');
    await ctx.say('brann', 'Não por vocês. Pelas estrelas que eu ajudei a apagar.');
    await ctx.join('brann');
    ctx.set('brann_juntou');
    ctx.remove('brann');
    await ctx.say(null, 'O *Brann* é um Guardião: *Provocar* atrai os ataques para ele, e sua lança causa dano de *PERFURAÇÃO* 🔱.');
    await ctx.say('brann', 'Um aviso. O túnel norte é guardado por uma coisa que o Império acordou com uma fornalha estelar. Um golem.');
    await ctx.say('brann', 'Mirem nas rachaduras: impacto, perfuração… e o frio faz a pedra rachar.');
    await ctx.say({ name: 'Mineiro', portrait: 'mineiro' }, 'Se precisarem de suprimentos, a gente tem um pouco. Pode pegar o que quiser… pagando, claro. A vida tá difícil.');
    ctx.cameraFollow();
    ctx.objective('Derrotar o guardião do túnel norte da caverna.');
  },

  async mineiro1(ctx) {
    await ctx.say({ name: 'Mineiro', portrait: 'mineiro' }, 'Quer comprar alguma coisa? A gente salvou o que deu das minas.');
    await ctx.shop(LOJA_ACAMPAMENTO);
    if (!ctx.flag('brann_juntou')) await ctx.say({ name: 'Mineiro', portrait: 'mineiro' }, 'O grandalhão divide a comida dele com as crianças. Não conta pra ele que eu falei.');
  },

  async mineiro2(ctx) {
    await ctx.say({ name: 'Mineiro', portrait: 'mineiro' }, 'O Império enfiou uma fornalha de cristal no coração da montanha. Desde então as paredes zumbem à noite.');
  },

  async menina_caverna(ctx) {
    await ctx.say({ name: 'Menina', portrait: 'menina' }, 'Moço, você vai trazer a sua vovó de volta? A minha também ficou lá no forte…');
    if (ctx.flag('brann_juntou')) await ctx.say('brann', '…Vamos trazer todas elas, pequena.');
  },

  async golem_luta(ctx) {
    if (!ctx.flag('brann_juntou')) {
      await ctx.say('lio', 'Esse zumbido… tem algo enorme lá na frente. Melhor falar com os mineiros do acampamento primeiro.');
      await ctx.stepBack('down', 1.2);
      return;
    }
    ctx.autosave();
    ctx.gather();
    ctx.stopMusic(0.6);
    const g = ctx.showEnemy('golem', 24, 4, 0.75);
    await ctx.camera(24, 5, 800);
    ctx.sfx('quake');
    ctx.shake(0.6);
    await ctx.say(null, 'Os cristais do salão se acendem um a um. Uma montanha de pedra e ametista se ergue.');
    await ctx.say('estela:sad', 'Ele está sofrendo… tem uma estrela queimando dentro do peito dele!');
    await ctx.say('brann', 'Golem Ametista. A fornalha o deixou louco. Não tem como conversar.');
    await ctx.say('lio', 'Então a gente apaga essa fornalha. Juntos!');
    ctx.hideEnemy(g);
    const r = await ctx.battle(['golem'], { bg: 'cave', music: 'boss', noFlee: true });
    if (r !== 'win') return;
    ctx.set('golem_derrotado');
    ctx.music('cave');
    await ctx.say(null, 'O golem se desfaz em pedra comum. Do peito dele, uma pequena luz sobe e some pelo teto da caverna.');
    await ctx.say('estela:happy', 'Ela… voltou para casa. Obrigada.');
    await ctx.say('sena', 'Você ouviu isso, Lio? Parecia um sino distante.');
    await ctx.say('lio', '…Ouvi.');
    await ctx.say('brann', 'O caminho para o norte está livre. O forte fica a poucas horas daqui. Descansem enquanto podem.');
    ctx.cameraFollow();
    ctx.objective('Invadir o Forte Ferrugem e resgatar a Vó Odessa.');
  },

  // ================================================================ FORTE
  async forte_entrada(ctx) {
    await ctx.say('brann', 'Forte Ferrugem. Lar doce lar.');
    await ctx.say('sena', 'Você está brincando, né?');
    await ctx.say('brann', 'Mais ou menos.');
    await ctx.say('brann', 'As celas ficam na ala oeste. O salão da fornalha, ao norte. Primeiro a sua avó, garoto.');
    ctx.objective('Encontrar a Vó Odessa nas celas da ala oeste.');
  },

  async salao_trancado(ctx) {
    await ctx.say('brann', 'Portão do salão da fornalha. Só abre por dentro, ou com a chave do carcereiro. Primeiro as celas.');
    await ctx.stepBack('down', 1.3);
  },

  async odessa_cela(ctx) {
    if (ctx.flag('odessa_resgatada')) return;
    ctx.gather();
    await ctx.say('lio:happy', 'Vó!');
    await ctx.say('odessa:surprised', 'Lio?! Seu cabeça-dura, eu disse para não vir atrás de mim!');
    await ctx.say('lio', 'Você disse « não venha atrás de m— ». Você não terminou a frase.');
    await ctx.say('odessa:happy', '…Puxou a teimosia de mim.');
    await ctx.say('brann', 'Afaste-se da grade, senhora.');
    ctx.sfx('blunt');
    ctx.shake(0.4);
    await ctx.say(null, 'Brann arranca a fechadura com a ponta da lança.');
    await ctx.say('odessa', 'Hmpf. Um armário de lata com bons modos. Obrigada, moço.');
    await ctx.say('odessa', 'Escute, Lio. O Varek queria a Chave do Sino. Mas a chave nunca foi este pedaço de latão.');
    await ctx.say('odessa', 'A chave é a canção. E quem é capaz de cantá-la.');
    await ctx.say('odessa:sad', 'Eles prenderam uma estrela no salão da fornalha para mover a tal Armadura Titã. Se ela queimar até o fim…');
    await ctx.say('estela:sad', '…o céu esquece mais um pedaço do mundo.');
    await ctx.say('odessa', 'Tome. Eu escondi isto no forro do xale. Era da sua mãe.');
    ctx.give('lamina_farol', 1);
    await ctx.say(null, 'Lio recebeu a *Lâmina do Farol*! Forjada com vidro estelar do próprio Sino.');
    const hh = ctx.state.heroes.lio;
    if (hh) {
      ctx.state.equip('lio', 'weapon', 'lamina_farol');
      await ctx.say(null, 'A Lâmina do Farol foi equipada automaticamente.');
    }
    await ctx.say('odessa', 'Agora vão. Eu sei me virar — já escapei de coisa pior que um forte. Vou tirar as outras prisioneiras daqui.');
    await ctx.say('lio', 'Vó…');
    await ctx.say('odessa:happy', 'Vai, menino! Acabe com o cabide de medalhas.');
    ctx.set('odessa_resgatada');
    await ctx.move('odessa', [[3, 21], [12, 21]], 3);
    ctx.remove('odessa');
    ctx.objective('Enfrentar o Capitão Varek no salão da fornalha (norte).');
  },

  async varek_luta(ctx) {
    ctx.autosave();
    ctx.gather();
    ctx.stopMusic(0.8);
    ctx.spawn({ id: 'varek', char: 'varek', x: 18, y: 8, dir: 'down' });
    await ctx.camera(18, 7, 900);
    await ctx.say(null, 'No centro do salão, uma estrela presa numa jaula de engrenagens queima em azul. Ao lado, uma armadura gigante respira vapor.');
    await ctx.say('varek', 'A guardiã fugiu. A estrela veio por conta própria. E o traidor Brann… que reunião comovente.');
    await ctx.say('brann:angry', 'Varek.');
    await ctx.say('varek', 'Capitão Varek, soldado.');
    await ctx.say('lio:angry', 'Solta a estrela!');
    await ctx.say('varek', 'Você ainda não entende. O Império aquece cem mil lares com aquilo que vocês chamam de céu.');
    await ctx.say('varek', 'As estrelas cantam. Nós as fazemos trabalhar. Lembranças são um luxo, garoto. Calor, não.');
    await ctx.say('sena:angry', 'Um mundo que esquece não tem lar nenhum para aquecer.');
    await ctx.say('varek:happy', 'Que bonito. Vejamos se a fé segura uma lâmina.');
    const r = await ctx.battle(['varek'], { bg: 'fort', music: 'boss', noFlee: true });
    if (r !== 'win') return;
    await ctx.say('varek:angry', 'Hah… nada mal. Mas a fornalha já está quente.');
    ctx.sfx('steam');
    ctx.shake(0.8);
    await ctx.flash(500, '#ff8040', 0.8);
    ctx.remove('varek');
    const t = ctx.showEnemy('tita', 18, 7, 0.6);
    await ctx.say(null, 'Varek salta para dentro da Armadura Titã. As fornalhas rugem em vermelho.');
    await ctx.say('brann', 'Mirem no domo do piloto! Raio, gelo, luz… o que tiverem!');
    await ctx.say('estela', 'Lio… quando ela cair, eu vou cantar para a estrela. Mas preciso que você cante comigo.');
    await ctx.say('lio', 'Eu não sei cantar!');
    await ctx.say('estela:happy', 'Sabe sim. Você sempre soube.');
    ctx.hideEnemy(t);
    const r2 = await ctx.battle(['tita'], { bg: 'fort', music: 'boss', noFlee: true });
    if (r2 !== 'win') return;
    ctx.set('varek_derrotado');
    await SCRIPTS.final(ctx);
  },

  async final(ctx) {
    ctx.stopMusic(1);
    ctx.sfx('explosion');
    ctx.shake(0.9);
    await ctx.flash(700, '#ffffff', 0.9);
    await ctx.say(null, 'A Armadura Titã desaba. De dentro dela, Varek se arrasta para fora, ferido.');
    ctx.spawn({ id: 'varek', char: 'varek', x: 21, y: 6, dir: 'left' });
    await ctx.say('varek:angry', 'Isto… não acabou. Vocês não fazem ideia do que está vindo.');
    await ctx.say('varek', 'A Lua Cinzenta já está acordando. E quando ela abrir os olhos… nem a sua canção vai bastar.');
    ctx.sfx('steam');
    await ctx.move('varek', [[25, 4], [28, 3]], 3.5);
    ctx.remove('varek');
    ctx.music('star');
    await ctx.say('estela', 'Agora, Lio.');
    await ctx.say(null, 'Estela começa a cantar. Uma melodia sem palavras, antiga como o mar.');
    await ctx.say(null, 'E Lio — sem saber como — reconhece a canção. É a mesma que ele sempre ouviu no céu.');
    await ctx.say('lio', '…♪');
    ctx.sfx('star');
    await ctx.flash(1400, '#d0f4ff', 1);
    await ctx.say(null, 'A jaula de engrenagens se parte. A estrela presa sobe, livre, atravessa o teto do forte… e volta para o céu.');
    await ctx.say('sena:happy', 'Lio… você cantou. De verdade.');
    await ctx.say('brann:happy', 'Desafinado. Mas cantou.');
    await ctx.say('lio:happy', 'Ninguém pediu sua opinião, armário de lata.');
    await ctx.fadeOut(1400);
    ctx.set('final');
    await ctx.teleport('vila', 'start');
    ctx.gather();
    ctx.music('ending');
    ctx.spawn({ id: 'odessa_f', char: 'odessa', x: 32, y: 13, dir: 'left' });
    ctx.place('lio', 30, 13, 'up');
    await ctx.camera(31, 11, 300);
    await ctx.fadeIn(1500);
    await ctx.say(null, 'Dias depois. No alto do penhasco do farol.');
    await ctx.say('odessa', 'Aurora cantava daquele jeito. Todas as noites, lá no topo do farol.');
    await ctx.say('lio', 'Vó… ela ainda está viva, não está?');
    await ctx.say('odessa:sad', 'Na noite em que sua mãe sumiu, uma constelação inteira desapareceu do céu. E apareceu uma lua que não estava lá antes.');
    await ctx.say('estela', 'A Lua Cinzenta.');
    await ctx.say('sena', 'O que o Varek falou… que ela está acordando…');
    await ctx.say('brann', 'Se o Império está com medo de alguma coisa, nós deveríamos estar apavorados.');
    await ctx.say('lio', 'Então a gente descobre o que é. E traz as estrelas — e a minha mãe — de volta pra casa.');
    await ctx.say('estela:happy', 'Juntos?');
    await ctx.say('lio:happy', 'Juntos.');
    await ctx.say(null, 'No horizonte, por um instante, uma lua pálida e cinzenta abriu um olho de luz.');
    await ctx.chapter('Fim da Crônica I', 'OBRIGADO POR JOGAR');
    await ctx.say(null, 'ECOS DA AURORA\n\nContinua na Crônica II — « A Lua Cinzenta ».');
    await ctx.say(null, 'Seu progresso foi salvo antes do salão da fornalha. Você pode continuar explorando a partir do último cristal.');
    ctx.remove('odessa_f');
    ctx.cameraFollow();
    location.reload();
  },
};
