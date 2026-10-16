# SpriteCook — relatório do piloto (Lio + Lobo Sombrio)

## Resumo
- Conta: SpriteCook **free tier**, limite de 1 job simultâneo.
- **Créditos: 40 antes → 28 depois (12 gastos).**
- Entregue (seguindo `docs/SPRITECOOK.md`):
  - `src/assets/sprites/heroes/lio/` — 8 poses de batalha (virado à esquerda) + 9 quadros de campo (d/u/l × parado/passo A/passo B) + `field_ko` + `meta.json`.
  - `src/assets/sprites/enemies/lobo/` — `idle`, `alt` (respiração), `glow`, `altGlow` + `meta.json`.
- Todos os PNG: RGBA, alfa só 0/255, mesmo tamanho de tela por grupo, pés/patas na mesma linha de base (1 px de margem embaixo).
- Downloads brutos (`*_pixel.png`, 428 KB) ficaram em `spritecook_raw/` (não commitados); podem ser baixados de novo pelos asset IDs abaixo (`get_asset_metadata`).

## Ferramentas disponíveis (MCP `https://api.spritecook.ai/mcp`, servidor v2.14.5)
Usadas: `get_credit_balance`, `list_generation_models`, `list_character_workflows`, `import_asset`, `generate_game_art`.
Outras: `animate_game_art`, `generate_character` / `generate_character_animations` / `check_character_animation_run`,
`remove_background`, `auto_slice_asset`, `set_asset_alpha_cutoff`, `create_asset_upload` / `finalize_asset_upload`,
`generate_tileset`, kits de UI, projetos/coleções, presets, export Godot, `check_job_status`, `list_recent_assets`.

### Limites e custos relevantes
| Item | Limite / custo |
|---|---|
| `generate_game_art` | tamanho só é *dica* (16–512); o PNG final sai na grade de pixel detectada (vimos 72, 132, 190 px no mesmo pedido de 48×48). 1–4 variações. `reference_asset_id` + até 14 `style_asset_ids`. |
| `gpt-image-2` **low** | **2 créditos/imagem** (1K ou 2K), sem cobrança extra por referência — o que usamos. medium = 9 (1K) / 7 (2K), high = 36/28. |
| `gpt-image-2.5-flare/sunburst` | low 5, medium 8, high 25 (1K) **+8 por imagem de referência**; 1K não quadrado é cobrado como 2K. |
| `gemini-nano-banana-2.1` (padrão) | 12 (1K) / 18 (2K). |
| `import_asset` | grátis (usado para subir a referência do Lio feita em código). |
| `animate_game_art` | 2–16 quadros (pixel-engine-v1.1, pares) ou 3–16 (v1.5); ~20 créditos por animação. |
| `generate_character_animations` | personagem base 12 + **20 por animação** (+12 de "prep" para vistas costas/lado). Perspectivas: platformer, isometric, topdown (andar em 4 direções). |

As ferramentas de animação **não foram usadas**: um ciclo de caminhada custaria ≥20–32 créditos e gera 8 quadros
interpolados (mais do que os 3 quadros do contrato); um sprite sheet estático custou 2.

## Método que funcionou
1. Referência: renderizei o Lio desenhado em código (idle de batalha 8×, tira de batalha 6×, tira de campo 6×, fundo branco) e importei com `import_asset`.
2. Gerei o idle de batalha sozinho (bom, mas 132 px). Windup e attack separados saíram em **escalas de pixel diferentes** (72 px e 190 px) — inutilizável para animação.
3. Solução: **uma imagem 16:9 2K com todas as poses de um grupo** (folha de sprites). Todas saem na mesma grade e escala. 2 créditos por folha.
4. Pós-processamento (node + pngjs): alfa binarizado (já vinha 0/255), recorte por componentes conectados (a espada do ataque encosta no windup, por isso não dá para cortar só por colunas vazias; fragmentos pequenos — orbe de luz, ponta da espada, faíscas — são anexados ao sprite mais próximo), alinhamento horizontal pelo centróide dos pés (25% inferiores) para o corpo não "pular" entre quadros, base dos pés na mesma linha. KO é centralizado.
5. Lobo: dois quadros na mesma folha; corte no maior vão central; alinhados pelo centróide das patas (pixels não brilhantes). Máscara de brilho = pixels violeta saturados e claros (S>0.5, V>165, B dominante): olhos + chamas da aura.

**Não reduzi a resolução**: a saída já é a grade de pixel do SpriteCook; dividir por 2 destruiria detalhe e a grade não é exata em 2×. Por isso `heightPx` informa o tamanho real.

## Tamanhos resultantes
| Grupo | Tela | Altura do personagem |
|---|---|---|
| Lio campo | 74×69 | 67 px (d0 parado) → `heightPx: 67` |
| Lio batalha | 82×69 | 51 px (idle) → `battleHeightPx: 51` (chave extra) |
| Lobo | 224×121 | 119 px (inclui chamas da aura) |

Atenção para a integração: os quadros de **campo saíram ~30% maiores que os de batalha** (folhas diferentes) e ambos
são ~2–2,7× o tamanho SNES nativo (25 px). O jogo precisa escalar cada grupo pelo seu próprio valor de altura. O lobo
saiu muito grande relativo ao Lio (119 vs 51 px) — escalar pelo `heightPx` do inimigo.

## Prompts usados
Estilo em todos: `style: "SNES Final Fantasy VI ... sprite[ sheet], 16-bit pixel art"`, `model: gpt-image-2`, `quality: low`, `bg_mode: transparent`.

- **Idle de batalha** (1:1, ref = tira idle importada):
  "Battle idle sprite of LIO, a teenage swordsman and apprentice lighthouse keeper, full body, standing in a ready stance, facing LEFT (three-quarter side view, looking to the left). Spiky copper-orange hair with one white streak over the forehead, blue eyes, long red scarf trailing behind, short navy-blue jacket over a cream shirt, brown belt with brass buckle, grey-blue trousers, brown boots, holding a short steel sword low. Same character design as the reference image. Proportions about 16x24 pixels, head about 40% of height (not super-deformed chibi), 1px dark outline, 3 tones per material, light from top-left, saturated colors, no anti-aliasing, single character, no ground shadow."
- **Windup / Attack** (testes descartados, ref = idle gerado): "Battle pose WINDUP/ATTACK, facing LEFT: ..." + bloco de identidade.
- **Folha de batalha** (16:9, 2K, `smart_crop: false`, ref = tira de batalha importada, style = idle gerado):
  "Character sprite sheet of LIO for an SNES JRPG battle, 8 separate full-body poses in ONE horizontal row, evenly spaced with clear empty gaps between them, all the same size and same pixel scale, all facing LEFT, feet on the same baseline. Poses left to right: 1 IDLE ready stance holding sword low; 2 WINDUP sword pulled back over shoulder; 3 ATTACK lunge with sword thrust far to the left; 4 CAST one hand stretched forward holding a small glowing golden-white light orb; 5 HURT recoiling backwards, flinching; 6 KNEEL down on one knee exhausted, leaning on the sword; 7 KO lying flat on the ground unconscious; 8 WIN victory pose raising the sword up high. Character LIO: [identidade]. Match the character design of the reference image exactly and the pose layout of the reference strip. SNES Final Fantasy VI style pixel art, head about 40% of height, 1px dark outline, 3 tones per material, light from top-left, saturated colors, no anti-aliasing, no ground shadow, no text, no labels, plain background."
- **Folha de campo** (16:9, 2K, ref = tira de campo importada, style = folha de batalha):
  "Overworld field walking sprite sheet of LIO for an SNES JRPG, a grid of 3 rows x 3 columns ... Row 1: facing DOWN (front view): standing, left-foot step, right-foot step. Row 2: facing UP (back view ...). Row 3: facing LEFT (side profile): standing, step with legs apart, other step. Then at the far right of row 3: LIO lying flat on the ground knocked out. [identidade + estilo]"
- **Lobo** (16:9, 2K, sem referência):
  "Enemy battle sprite sheet for an SNES JRPG: LOBO SOMBRIO, a lean menacing shadow wolf with dark purple-black fur, glowing violet eyes and a faint violet aura/wisps around its body, bared fangs, low prowling stance, full body side view FACING RIGHT. Two frames side by side in one row, same size, same pixel scale, same position, paws on the same baseline, clear empty gap between them: frame 1 idle; frame 2 breathing frame (chest slightly expanded, head and back raised by one pixel, aura wisps shifted). SNES Final Fantasy VI enemy sprite style, ..."

## Asset IDs (para referências futuras)
| Asset | ID |
|---|---|
| Ref importada: Lio idle (código) | `823d5379-fbcc-4997-8b9b-8e6aa8f926fa` |
| Ref importada: Lio tira de batalha (código) | `45851dc8-bd6f-4970-803e-4c19a7fd35e5` |
| Ref importada: Lio tira de campo (código) | `8195c4dc-f62f-48a0-b9f2-d352c24cd161` |
| Lio idle de batalha (gerado, avulso) | `3f5a0d29-f2ec-4a46-9f82-14e47fb6acab` |
| Lio windup avulso (descartado) | `bf46a8d4-5772-45cf-b9c1-ed1d46454a18` |
| Lio attack avulso (descartado) | `2d44a2c4-6c92-4778-8f58-20632f388e69` |
| **Lio folha de batalha (usada)** | `ef3e1b45-eb39-4155-add3-36e3b49d76cd` |
| **Lio folha de campo (usada)** | `729f987b-9d5b-409e-8013-c13f68570b2d` |
| **Lobo folha 2 quadros (usada)** | `4907b9c3-4af1-4bcf-a226-bc5eee1efbe0` |

Use a folha de batalha do Lio como `style_asset_ids` nas folhas dos outros heróis para manter escala e acabamento.

## Problemas / observações
- A escala de pixel varia por geração — só folhas únicas garantem consistência dentro de um grupo. Entre folhas (campo × batalha) a escala ainda difere.
- Identidade: boa (cabelo cobre com mecha branca, cachecol vermelho, jaqueta azul, fivela). O estilo é um pouco mais "chibi"/cabeça grande que o FF6 e mais detalhado que 16×24.
- Costas (u1/u2): os passos quase não diferem do parado — o ciclo de costas fica fraco; talvez regerar só essa linha ou editar à mão.
- Pose de hurt é um recuo leve; KO de batalha e campo saíram parecidos (ok).
- Lobo: pelo com contorno escuro mais fraco e textura "ruidosa" (menos limpo que os heróis); quadro alt difere pouco além das chamas; chamas soltas aumentam a tela (224×121).
- `quality: low` foi suficiente; `medium` (9 créditos) provavelmente limparia o lobo.

## Estimativa para o conjunto completo
Método da folha com `gpt-image-2` low (2 créditos/folha):
- Heróis restantes (Sena, Estela, Brann): 2 folhas cada (batalha + campo) = 6 folhas = **12 créditos**, +~50% para regerações ≈ **18**.
- 16 inimigos (15 restantes além do lobo): 1 folha cada = **30 créditos**, +~50% ≈ **45**. Dá para pôr 2 inimigos por folha (mesmo custo) e cair para ~16–24, com risco de qualidade menor.
- Retoques do Lio (linha de costas, campo/batalha na mesma escala): ~4.
- **Total ≈ 50–70 créditos** (≈ 35 sem regerações). Saldo atual: **28** → faltam ~25–45 créditos (recarga ou plano pago). Com `quality: medium` (9/folha) seria ≈ 4,5× (~250–300).
- As ferramentas de animação (20+ créditos cada) multiplicariam o custo por ~10 e não são necessárias para 2–3 quadros.
