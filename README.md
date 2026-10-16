# Ecos da Aurora — Crônica I: *A Estrela que Canta*

RPG em **pixel art HD-2D** para celular (e navegador), inspirado em *Chrono Trigger*,
*Final Fantasy VI*, *Dragon Quest* e *Octopath Traveler*. Toda a arte — personagens,
retratos, inimigos, cenários, texturas — é **gerada por código** em pixel art estilo SNES,
e o mundo é um diorama 3D com profundidade de campo, bloom, sombras e luzes dinâmicas.

## A história

Na noite do Festival das Estrelas, em Vila Maré, uma estrela cai no Bosque Sussurrante —
e **canta**. Lio, aprendiz de faroleiro que sempre ouviu o céu cantarolar, encontra no
lugar da queda uma menina chamada Estela. O Império de Ferro, que queima estrelas caídas
para mover suas máquinas, quer levá-la. Cada estrela que queima faz o mundo esquecer algo.

**Grupo (apresentado aos poucos):**

| Herói | Classe | Estilo |
|---|---|---|
| **Lio** | Espadachim | golpes de corte, Corte Duplo para quebrar escudos, técnicas de fogo, vento e luz |
| **Sena** | Sacerdotisa | cura, bênçãos e Luz Sagrada; cajado de impacto |
| **Estela** | Maga Estelar | fogo, gelo, raio, chuva de estrelas e gravidade |
| **Brann** | Guardião | ex-cavaleiro imperial; provoca inimigos, protege o grupo, lança perfurante |

Prólogo → Capítulo 1 (*Ecos no Farol*) → Capítulo 2 (*O Guardião Sem Brasão*) → Forte Ferrugem e o final da Crônica I.

## Sistemas

- **Batalha ATB (modo espera)** no estilo FF/Chrono Trigger, com **escudos e fraquezas** (estilo
  Octopath): acerte fraquezas (corte, impacto, perfuração, fogo, gelo, raio, vento, terra, luz)
  para **quebrar** o inimigo — ele perde a vez e sofre mais dano. Chefes carregam ataques
  devastadores que só podem ser interrompidos quebrando o escudo.
- **Técnicas Duplas** (estilo Chrono Trigger) quando dois heróis estão prontos.
- Inimigos visíveis no mapa (sem encontros aleatórios), baús, lojas, pousada, equipamento,
  níveis, cristais de save, grupo que segue o líder.
- Interface pensada para toque: joystick flutuante, botão de ação, menus grandes,
  indicador de interação, layout adaptado para celular deitado ou em pé.
- Música e efeitos sonoros procedurais (Web Audio, sem arquivos de áudio).
- Resolução dinâmica para manter a fluidez em celulares mais fracos; instalável como app (PWA).

## Como jogar

- **Celular:** arraste o dedo na metade esquerda da tela para andar; **A** conversa/examina;
  **☰** abre o menu. Na batalha, toque nos comandos e no inimigo-alvo.
- **Teclado:** setas/WASD andam, Enter/Espaço/Z confirmam, Esc/X voltam, M/Tab abre o menu, Shift corre.

## Desenvolvimento

```bash
npm install
npm run dev          # servidor local (acessível pela rede para testar no celular)
npm run build        # gera dist/
npm run build:single # gera dist-single/index.html (um único arquivo)
npm test             # gera toda a arte em Node e valida dados
npm run art          # exporta prévias PNG dos sprites (shots/art)
```

Ferramentas de prévia/QA: `tools/preview-*.mjs` (arte), `tools/play.mjs` (robô que joga e tira
screenshots via Playwright), `tools/screenshot.mjs`. Parâmetros de teste na URL:
`?fast=1` (texto instantâneo), `?q=high|medium|low` (qualidade fixa),
`?start=bosque&party=lio,sena&lv=5` (começa direto num mapa).

### Estrutura

```
src/art/        pixel art em código: Bitmap, sprites ASCII, retratos, inimigos, props, terreno
src/render/     three.js: Stage (pós-processamento), terreno, prédios, atores, partículas, oclusão
src/field/      exploração (movimento, colisão, NPCs, baús, inimigos, gatilhos)
src/battle/     batalha ATB, arenas temáticas, efeitos
src/ui/         interface HTML (diálogos, menus, loja, título)
src/data/       mapas, roteiro, heróis, técnicas, itens, inimigos, atmosferas
src/audio/      sequenciador e sintetizador Web Audio
```

As *skills* de terceiros usadas para construir o jogo estão em `.claude/skills/` (veja `SOURCES.md`).
