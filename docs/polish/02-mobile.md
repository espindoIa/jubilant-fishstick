# Lote 2 — controles e celular

Reprodução: em 844×390, deslocamento do joystick de 92 px (raio46) gerava `{x:0.5,run:true}`. A mesma entrada agora gera `{x:1,run:true}`. Teste tools/tests/joystick.json.

Alvos anteriores de abas em paisagem: 23,56 px de altura. Opções, botões de fechar, indicador interativo e chip têm agora caixa mínima44×44. Abas em paisagem rolam horizontalmente; em retrato são três colunas. Listas usam pan-y, overscroll contido e espaço para voltar. Revalidar caixas e colisões nas capturas.

Blur/segundo plano limpa joystick/teclas e suspende a atualização/renderização até tocar a sobreposição de pausa. Timers de apresentação do JavaScript não são um relógio global pausável; confirmar cutscenes/áudio no sistema real. Vibração e wake lock dependem do navegador e não são comprovados por Chromium emulado.

`tools/tests/touch-menus.json`: hasTouch/isMobile, toque real via locator.tap; itens/uso, equipamento/prévia, técnicas, Crônica, opções/três dificuldades, troca de líder e pausa. Setup por eval injeta inventário/HP/áreas seguras, sem simular as escolhas do jogador. Insets resolvidos por --safe-* (24/20/44/12), derivados das variáveis env no CSS; não simula a interface física de Safari/Android.

Nenhum roteiro, capítulo ou PNG foi alterado. Layout/contraste geral é o lote4. A sensação de joystick, haptics, notch real, barras do navegador, teclado do sistema e tela cheia precisam de celular físico.

Resultado: touch-menus nas duas orientações, touch-battle (quatro Ressonâncias, seleção de alvo, ataque, Repetir, Aurora) e touch-shop-save passaram com HEALTH 0/0/0. Loja: ouro60→30 e poções3→4; save recarregável em Vila Maré. A troca de líder tinha pendingReload sem consumidor; reorderParty agora altera o ator controlado e seguidores preservando posição e mundo. Os três comandos obrigatórios saíram0 e a matriz visual4/4. HTML3.205.930 bytes.

A espera do teste de salvamento não deve tocar enquanto procura a confirmação: isso fechava o próprio diálogo observado. Agora aguarda o texto sem entrada adicional, mantendo a assertion de leitura do save.
