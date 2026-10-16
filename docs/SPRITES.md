# Sprites em PNG — contrato de arquivos

Sprites gerados no de imagens externas (PNG) substituem os sprites desenhados em código
(`src/art/sprites/*.js`, `src/art/enemies_*.js`) quando existem em `src/assets/sprites/`.
O jogo carrega as imagens na inicialização e cai de volta para a arte em código
quando um quadro não existe.

## Estilo
- Pixel art de SNES no estilo **Final Fantasy VI**: contorno escuro de 1 px, 3 tons por
  material, luz vindo de cima/esquerda, cores saturadas.
- PNG RGBA, fundo transparente, **sem anti-aliasing** (alfa só 0 ou 255), sem sombra no chão.
- Mesma identidade dos personagens atuais (ver `docs/` e as prévias geradas com
  `node tools/preview-defs.mjs src/art/sprites/<id>.js 8` → `shots/defs/`).

## Pastas e quadros
```
src/assets/sprites/heroes/<id>/      id: lio, sena, estela, brann
  meta.json
  field_d0.png field_d1.png field_d2.png   # de frente: parado, passo A, passo B
  field_u0.png field_u1.png field_u2.png   # de costas
  field_l0.png field_l1.png field_l2.png   # virado para a ESQUERDA (a direita é espelhada)
  field_ko.png                             # caído (cena da Estela desacordada)
  battle_idle.png battle_windup.png battle_attack.png battle_cast.png
  battle_hurt.png battle_kneel.png battle_ko.png battle_win.png   # virado para a ESQUERDA

src/assets/sprites/enemies/<kind>/   kind: goticula, cogumelo, lobo, vespa, cao_ferro, morcego,
                                      lodo, aranha, tatu, golem, soldado, drone, cao_ferro2,
                                      mago, varek, tita
  meta.json
  idle.png alt.png                 # 2 quadros do loop parado, virado para a DIREITA
  glow.png altGlow.png             # opcional: só os pixels que brilham (olhos, cristais)
```
- Todos os quadros de um grupo (field, battle, inimigo) têm o **mesmo tamanho de tela**
  e os pés na **mesma linha de base**.

## meta.json
```json
{ "fieldW": 32, "fieldH": 32, "battleW": 48, "battleH": 40, "heightPx": 25 }
```
- `heightPx`: altura do personagem em pixels (topo da cabeça até a sola), parado.
  O jogo usa isso para manter o tamanho no mundo (Lio ≈ 25 px nativos × 1,2).
- Inimigos: `{ "w": 46, "h": 30, "heightPx": 28 }`.
- Tamanho nativo preferido: o do SNES (heróis ~16×25 numa tela de 32×32 / 48×40).
  Se o gerador entregar maior, reduza por fator inteiro com vizinho mais próximo
  apenas quando a imagem for pixel art em grade exata; senão mantenha e informe `heightPx`.
