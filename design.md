# Direção visual — "A língua suméria" (TikTok 9:16)

Feito com o plugin **frontend-design** (Anthropic) no método de duas passadas: plano → revisão contra o briefing → construção → autocrítica por quadros.

## Assunto, público, função
- **Assunto:** a língua suméria e a escrita cuneiforme. Material: tabuinha de argila crua, cunhas de cálamo, selo cilíndrico, betume, lápis-lazúli e ouro (os materiais do "Estandarte de Ur" e das jóias de Ur).
- **Público:** quem rola o TikTok no celular; curioso, não especialista.
- **Função:** ensinar 5 ideias em 120 s sem perder o espectador. Cada tela tem **uma** coisa a notar.

## Cor (tokens)
| Token | Hex | Papel |
|---|---|---|
| `betume` | `#17100B` | fundo/sombra (não é preto puro: é o asfalto natural usado nas incrustações) |
| `argila` | `#B98A5E` | superfície da tabuinha, textura de fundo |
| `argilaClara` | `#E6C9A0` | realce da luz rasante na argila, texto secundário |
| `ocre` | `#C8902E` | linhas, cunhas recém-gravadas, marcadores |
| `terracota` | `#A4462F` | marca ergativa `-e`, avisos, destaque gramatical |
| `lapis` | `#1E3A8A` / profundo `#14245A` | campo de destaque das telas-chave (como as incrustações de lápis) |
| `ouro` | `#D9B04A` | palavra falada na legenda, sinais "revelados", brilho |
| `osso` | `#F4EAD8` | texto principal (alto contraste sobre betume/lápis) |

Revisão contra os tiques genéricos: o briefing *pede* argila/terracota, então elas ficam, mas **não** como fundo creme + acento terracota (o clichê). O fundo é escuro (betume), a argila aparece como **objeto físico** (tabuinha iluminada de lado), e o acento principal é o **par lápis-lazúli + ouro**, que é específico de Ur e não de "página bonita".

## Tipografia
- **Fraunces** (variável, eixo SOFT alto, opsz 144, peso 600–800): títulos e palavras-chave. Serifada, com acentos completos do português; o eixo "soft" dá a borda arredondada de algo pressionado em argila molhada, em vez da serifa de mármore romano (Cinzel/Trajan seriam o clichê de "antigo").
- **Archivo** (variável, largura 100–112, peso 700–800): legendas e corpo. Sem serifa, robusta, legível a 64–76 px no celular.
- **Noto Sans Cuneiform** (OFL): todos os sinais, conferidos por código Unicode.
- Escala (1080 px de largura): título 120–150 px; palavra suméria 110 px; legenda 66 px (2 linhas máx.); apoio 44 px. Sem caixa-alta em rótulos, sem sobrelinhas de "eyebrow".
- Transliteração em itálico Fraunces com subscritos reais (lu₂, e₂).

## Layout (1080×1920)
```
 0 ┌──────────────────────────┐
   │  respiro / poeira        │   0–300: só atmosfera
300│                          │
   │   OBJETO DA TELA         │   300–1050: sinal, tabuinha, diagrama
   │   (sinal, tabuinha)      │
1050│──────────────────────────│
   │  LEGENDA (2 linhas)      │   1150–1450: legenda, terço do meio-baixo
   │                          │
1670│ ▒▒▒ zona do TikTok ▒▒▒▒▒ │   últimos 250 px: vazio
1920└────────────────────▒▒▒▒─┘   ~150 px da direita: vazio (botões)
```
- Conteúdo centralizado num eixo deslocado 75 px para a esquerda (centro útil = (1080−150)/2 + margem = x≈465 a 540). Margem esquerda mínima 80 px, direita mínima 150 px.
- Legenda: caixa de 820 px de largura começando em x=80, alinhada ao centro dessa caixa.

## Princípios
1. **Um momento memorável:** a gravação cunha por cunha dos sinais, com luz rasante — é o único efeito "ousado". O resto é quieto.
2. **A argila é física:** relevo por sombra interna (luz vinda de cima à esquerda), ruído fractal, borda irregular. Nunca um retângulo chapado.
3. **Gramática como objeto:** as peças das palavras (lú + gal) se juntam fisicamente; a marca ergativa é uma cunha terracota que "cola" no rei.
4. **Movimento só para guiar o olho:** câmera lenta contínua (zoom 1.00→1.06), poeira suspensa; cortes a cada 2–4 s trocam o objeto em foco.
5. **Legenda é a voz:** palavra falada em ouro, demais em osso; fundo de betume translúcido para contraste ≥ 7:1.
