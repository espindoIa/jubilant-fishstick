# Lote 1 — estabilidade

Base: cbe4ff8, branch claude/hd2d-rpg, PR #3. Sem alteração de roteiro ou PNGs.

Reproduções e correções:
- `?q=invalid`: tela preta, pageerror lendo `pixelRatio`. Stage agora valida a qualidade.
- Save parcial: aceito por load e depois dereferenciado em continueGame. Validação estrutural mantém saves v1 válidos e defaults de configuração.
- Coordenadas dos interactables: faltava somar a margem de 7 tiles aplicada aos objetos. Cristais, placas e Estilhaços agora usam a posição correspondente à arte.
- Atualização de campo: o estado livre era calculado antes da interação e reutilizado depois dela. Reavaliado antes do movimento, encontro, saída e gatilho.
- Scripts simultâneos: a primeira conclusão liberava o modo de campo enquanto outra cena seguia bloqueada.
- Repetir: atualiza a lista de alvos vivos/caídos, incluindo aliados revividos depois de uma cura em grupo.
- Estilhaços/acampamento: reserva e validação impedem recompensa duplicada por reentrada.
- A arena descartava os recursos do cenário de campo antes de reutilizá-lo: retenção explícita até retornar ou trocar de mapa.
- Flags de depuração: heróis inválidos/duplicados e níveis não finitos passam por validação.

`node --test tools/tests/stability.test.mjs`: 12/12. O teste reproduz comportamentos, incluindo eventos dispose. Efeito visual do descarte não foi afirmado.

Harness: tools/play.mjs agora aceita CHROMIUM_EXECUTABLE, TEST_SPEED, toque por seletor e assertions, e falha com pageerror/consoleerror/TIMEOUT. As esperas e assertions da história não foram enfraquecidas. Browser plugin ausente; Chromium local com SwiftShader.

Evidências e logs: `/workspace/shared/downloads/aurora-polimento`. Baseline visual: 844×390 e 390×844, q=low/high, campo/menu/diálogo/batalha. FPS iniciais com processos concorrentes não sustentam conclusão de desempenho; comparar novamente isoladamente no lote 7. As durações de navegação e até chegar ao campo são métricas diferentes.

A cobertura de história, campamentos, Estilhaços e saves por mapa é ampliada por tools/tests/cobertura-cenas.json e consolidada na entrega final; 12 testes de regressão não equivalem a uma campanha jogada por uma pessoa.
