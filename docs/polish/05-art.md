# Lote 5 — gráficos 2D

Problema medido: baixo contraste das rampas do chão exterior, não resolução dos PNGs. Alteradas só rampas grass/forest/path/plaza/rock/metal, com altas quentes e sombras frias. Sombreamento direcional, detalhes e coordenadas dos pintores preservados. Caverna/cristal preservados porque já continham 32% de pixels escuros. Nenhum PNG, retrato ou história alterado; nenhum crédito de geração usado.

`node tools/art-metrics.mjs`, antes→depois (cores; matizes; luminância média; desvio):

| Textura | Antes | Depois |
|---|---|---|
| Vila | 1403;7;131,0;43,6 | 1350;7;129,6;57,0 |
| Bosque | 1165;5;134,2;26,8 | 1114;6;133,0;49,6 |
| Caverna | 636;2;60,4;36,6 | igual |
| Forte | 857;4;88,6;36,4 | 941;4;88,2;41,0 |
| Laterais | 36;5;132,8;54,7 | 36;5;129,4;60,5 |

Referências existentes: árvore40 cores/5matizes/desvio60,4; lampião40/6/62,8; herói1787/5/60,3. Mapa inteiro reúne materiais diferentes; não equivale a um único sprite. Candidatos que clareavam demais foram rejeitados. Quantização experimental também foi rejeitada: reduzir contagem de cores por si só não garante beleza e perdia gradações da floresta. Não se afirma equivalência artística aos melhores RPGs do SNES por métricas estatísticas.

Oclusão: raio antes fixo em25% da altura do buffer,211px no teste390×844 a ambas distâncias. Herói2u projetado145,7→70,7px: razão raio/altura1,45→2,99. Agora projeta folga horizontal1u no torso:89,67→44,17px, razão0,615→0,625. Atualização depois da câmera; dithering na resolução nativa e numa borda menor. Teste de regressão nas duas orientações. Capturas de campo mantêm entrada/estado da matriz anterior; teste CPU não substitui avaliação de cada árvore atravessada em celular.

`tools/sprite-audit.mjs` registra canvas, altura opaca, margem dos pés e alfa dos quadros PNG. `check-art` verifica contrato e quadros. Escalas de heróis já normalizam altura opaca ao corpo anterior; não foram alteradas sem evidência de defeito. Sombras de contato existentes preservadas. A comparação do pacote embutido no HTML anexado não foi concluída: o arquivo temporário se perdeu na reinicialização do ambiente; referências do repositório foram medidas. Efeitos não foram redesenhados; a ferramenta polish-effects captura instantes fixos do efeito real, sem alegação de melhora não medida.
