# Lote 4 — interface

A skill frontend-design solicitada não está instalada/disponível. Critérios aplicados diretamente: pixel art/SNES existente, caixas medidas, foco, contraste e capturas; sem alegação de uso dessa skill.

Contraste WCAG calculado com luminância linear sRGB e o endpoint mais claro do painel (antes composto conservadoramente sobre branco): desabilitado2,25→6,51; perigo3,85→4,67; branco10,75→13,05; secundário5,79→7,79; dourado7,77→9,43. O piso4,5 vale para esses pares de texto/painel, não para cada pixel de emoji/ilustração. Nomes/escudos/ECO recebem fundos escuros explícitos para não depender da cor do cenário. Legibilidade sob reflexo solar real não é medida aqui.

Reprodução de foco: com Itens aberto, clicar Equipar elevava a pilha2→3 e deixava a operação anterior pendente. Agora canSelect/open bloqueiam troca por trás do submenu; o botão Voltar44×44 libera a navegação. Mesma entrada mantém pilha2. `tools/tests/menu-focus.json`.

Rótulos: `placeFloating` usa caixas reais, áreas seguras, painéis e rótulos anteriores. Testes de quatro caixas com ancoragem fora da tela passam nas duas orientações. Medidas de tamanho são armazenadas e recalculadas em mudanças de conteúdo/menu/viewport, não lidas a cada quadro.

Contraprova de rolagem: hipótese inicial de que touch-action:none no body bloqueava o scroller foi refutada. Mesmo gesto levou scrollTop0→100 antes e depois. Regra do body mantida; não é apresentado como bug corrigido. Teste por gestos CDP tem hasTouch/isMobile e não escreve scrollTop para produzir o resultado (zera apenas o início).

Janelas de diálogo/resultados longas limitam altura e rolam; avanço interno por toque só ocorre ao soltar sem arrastar. Equipamento mostra estatísticas atuais→previstas e os valores atuais já durante seleção de slot. Botões de voltar viraram button; opções têm semântica e estado desabilitado. Animações respeitam redução de movimento.

Capturas de título, diálogo, campo, batalha, resultados, grupo, Crônica, opções, status e loja nas quatro combinações estão na pasta de evidências. Resultados usam fixture de vitória para auditar a janela; não contam como vitória de gameplay. Textos da história e PNGs não foram alterados.
