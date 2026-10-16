# Ecos do Crepúsculo

**Jogar:** https://claude.ai/artifact/KD8ZZGrCDbtFfiqKaiJHHf (ou abra `index.html` no navegador)

Roguelite de RPG por turnos em tempo ativo, feito para celular em pé. Um único arquivo HTML (`index.html`), Canvas 2D e JavaScript puro, sem imagens nem bibliotecas externas.

> Faz cem anos que é fim de tarde em Vésper. Alguém costurou as horas para que o dia nunca acabe. Só quatro heroínas despertam, e cada vez que caem o dia recomeça.

## Loop central

**A cada sala** você escolhe o próximo destino num mapa ramificado e vence um combate de barras de tempo ativo combinando comandos e Técnicas Duplas.
**A cada jornada** você monta uma dupla de heroínas e a fortalece com técnicas, relíquias e níveis até derrubar três chefes.
**Entre jornadas** você gasta Ecos no Santuário em melhorias permanentes, e a história revela um trecho novo a cada queda ou chefe vencido.

Tudo o que não servia a esse loop ficou de fora: ouro e loja, equipamento por slot, elementos, grupo de três, modo Ativo puro, inventário grande.

## O que foi adaptado de onde

| Origem | Sistema original | Adaptação aqui |
|---|---|---|
| Final Fantasy IV–VI | ATB: cada unidade enche uma barra conforme a velocidade e age quando ela está cheia; modo *Wait* pausa o tempo nos menus | Barras de ATB em ticks discretos (`DATA.atb`); sempre em modo Espera, porque no celular o jogador precisa de tempo para tocar. Haste/Slow mexem na velocidade de enchimento |
| Chrono Trigger | Techs duplas: exigem que os dois personagens estejam com o turno pronto e gastam MP de ambos | Uma Técnica Dupla por dupla (6 no total), com as duas barras cheias e MP das duas. Comando **Segurar** guarda o turno até a parceira ficar pronta, e o **Badalo** de Sino enche a barra da parceira na hora |
| Dragon Quest | Menu de comandos curto e fixo, janela de mensagem que narra cada ação, monstros com troca de paleta | Seis comandos sempre na mesma posição (Atacar, Técnica, Dupla, Item, Defender, Segurar); janela de diálogo de borda branca; inimigos comuns reaproveitam formas-base com paletas diferentes por ato |
| Slay the Spire | Mapa em camadas com caminhos que se cruzam sem arestas cruzadas, elites opcionais, fogueira antes do chefe, recompensa de 3 escolhas com opção de pular | `genMap`: 3 caminhos por ato, 6 andares + chefe, fogueira garantida no último andar, tesouro no meio, elite só a partir do 3º andar; recompensa de 3 opções (técnica, relíquia, item) com "Pular" |
| Hades | Morrer faz parte da narrativa; moeda persistente gasta num espelho de melhorias; diálogos novos a cada volta | Ecos gastos no Santuário (5 melhorias); a guardiã Clépsidra lembra das quedas e revela um trecho por gatilho (número de quedas, heroína que caiu, chefe vencido, vitória) |

## Personagens

Paleta de 6 cores cada, sprite 16×16 (heroínas) ou 32×32 (chefes), desenhados por código.

| Personagem | Forma dominante | Traço marcante | Habilidade que combina |
|---|---|---|---|
| Rocca, Escudo de Bronze | círculo (escudo frontal) | chifres largos | Provocar, Golpe de Escudo (atordoa), Fortaleza |
| Lume, Lanterna do Ocaso | triângulo alto (chapéu torto) | lanterna no cajado | magia em área, Meteoro |
| Pena, Vento da Madrugada | diagonal agachada | bico longo e cachecol ao vento | a mais rápida, flechas múltiplas, roubo |
| Sino, Badalo das Vésperas | sino maior que ela | corpo pequeno sob o sino | cura e Badalo (adianta o turno da parceira) |
| Grumbal, Sapo-Sino | cúpula larga e baixa | sino na cabeça | BADALADA a cada 3 turnos atordoa o grupo |
| Vitra, Rainha de Vidro | triângulo estreito | coroa de cristais | Véu Prismático reduz dano mágico; Lamento zera a ATB |
| Morvane, Tecelão de Horas | disco (mostrador) | fios dourados até o chão | Parar o Tempo zera a ATB; Rebobinar cura uma vez |

## Estrutura do código

`index.html` é gerado por `node tools/build.js` a partir de `src/`. Dentro do HTML, cada parte tem seu próprio `<script id>`:

- `#data` — `src/data.js`: **todas** as tabelas (heroínas, técnicas, Técnicas Duplas, relíquias, itens, inimigos, atos, eventos, melhorias, história). Equilibrar é editar números aqui.
- `#sprites` — `src/sprites.js`: pixel art gerada por código.
- `#engine` — `src/engine.js`: regras puras, sem DOM. Estado 100% JSON; PRNG mulberry32 com a semente guardada no próprio estado.
- `#audio` — `src/audio.js`: chiptune sintetizado com Web Audio (3 trilhas e efeitos originais), com botão de mudo.
- `#ui` — `src/ui.js`: telas, canvas e toque.

O simulador e os testes carregam `#data`, `#sprites` e `#engine` **de dentro do `index.html`**, então jogam exatamente as mesmas regras do jogo.

## Como verificar

```bash
node tools/build.js            # gera index.html e dist/artifact.html
node tools/sim.js 1000         # 1000 jornadas por dupla: aleatória, gulosa e gulosa com meta máximo
node tools/sim.js --power      # força de cada relíquia/técnica por experimento controlado
node tools/determinism.js      # mesma semente + mesmas escolhas = mesma jornada
node tools/silhouettes.js reports/silhouettes.png   # teste de silhueta
node tools/e2e.js              # Playwright, 360x640, toque
```

Resultados em `reports/`.

## Resultados verificados por execução

Todos os números abaixo saíram dos scripts acima, rodando sobre o `index.html` final. Relatórios completos em `reports/`.

### Balanceamento: antes e depois (1.000 jornadas por dupla, 6.000 por política)

| Métrica | Antes | Depois |
|---|---:|---:|
| Política gulosa, meta zero: vitória geral | 39,7% | 37,7% |
| Faixa por heroína | 33,4% (Rocca) a 51,2% (Pena) | 37,4% a 38,2% |
| Faixa por dupla | 11,5% (Rocca+Lume) a 53,5% (Rocca+Pena) | 36,8% a 38,6% |
| Gulosa com o Santuário no máximo | 90,3% | 74,4% |
| Política aleatória | 0,1% | 0,1% |
| Jornadas com travamento, sala sem saída ou combate sem fim | 0 de 18.000 | 0 de 18.000 |

Força de cada item por experimento controlado (mesmas sementes, com e sem o item desde o início, 1.200 jornadas cada; `reports/power-*.md`):

| | Antes | Depois |
|---|---|---|
| Relíquias comuns | +6,2 a +27,0 pp (Cálice Amargo dominava) | +5,3 a +18,5 pp |
| Relíquias raras | +8,6 a +13,8 pp (mais fracas que as comuns) | +13,3 a +22,5 pp |
| Técnicas aprendidas | +0,2 a +13,3 pp | +1,8 a +11,0 pp |

Mais e menos escolhidos pela política gulosa (meta zero): relíquia mais escolhida Pedra do Eco (61,8% das ofertas), menos escolhida Sino de Bolso (44,8%); técnica mais escolhida Dobre Grave (94,8%), menos escolhida Pena Venenosa (23,4%); consumíveis quase nunca (Erva 1,9%). Essas taxas refletem a regra de pontuação da própria política (ela prefere raras > técnica de área > relíquia comum > item), por isso a força real foi medida pelo experimento controlado.

Duração média: 10,5 combates e 121 decisões por jornada com a política gulosa, cerca de 6,7 minutos estimados (tempo de ATB em 1x + 2,5 s por decisão). Quem mais derruba o grupo: Morvane e Vitra, depois Grumbal.

### Outros testes

- **Determinismo** (`tools/determinism.js`): 200/200 sementes geram jornadas idênticas ao repetir as mesmas decisões, inclusive serializando o estado em JSON no meio (o que o "Continuar jornada" faz). 50 sementes distintas geraram 50 jornadas diferentes.
- **Silhueta** (`tools/silhouettes.js`): IoU máximo entre heroínas 0,57 e entre chefes 0,52 (limite 0,60, comparando também a versão espelhada). Folha em `reports/silhouettes.png`.
- **Playwright** (`tools/e2e.js`, 360×640, `isMobile` + `hasTouch`, toques reais): 17/17 verificações. Inicia jornada com semente, vence um combate, morre, confere `localStorage` (quedas=1, jornadas=1, Ecos=6), recarrega e confirma persistência, continua uma jornada salva, joga com `localStorage` bloqueado, confere alvos de toque ≥ 44 px e ausência de rolagem horizontal. FPS em combate: 60 (teto do rAF) e 60 com a CPU desacelerada 4×. Capturas em `reports/screens/`.

### O que não foi verificado

- Celular físico: só emulação no Chromium. Safari/iOS (áudio, `100%` de altura, fontes) não foi testado.
- O FPS headless não usa GPU real; o número diz que o jogo é leve, não garante 60 em qualquer aparelho.
- Políticas de simulação não são jogadores. A gulosa subusa suporte (Canção Serena, Reviver, Pena Venenosa medem +2 a +4 pp); um humano pode achar esses itens melhores ou piores.
- Diversão, legibilidade dos sprites em tela pequena, ritmo do texto e da música: só um playtester pode julgar.
