# Progresso — TikTok "A língua suméria"

Registro do que foi feito, do que funcionou e do que falhou. Data: 2026-10-14.

## Ferramentas (plugins e skills do Claude Code)

| Ferramenta | Instalação | Funcionou? | Observação |
|---|---|---|---|
| Plugin oficial Remotion (`remotion-dev/claude-code-plugin`) | `claude plugin marketplace add` + `claude plugin install remotion@remotion` (v4.0.535) | ✅ instalado | Plugins instalados no meio da sessão não viram comandos `/…` nesta mesma sessão (`Skill` respondeu "Unknown skill"). As instruções foram lidas direto do disco. |
| Remotion Agent Skills (`npx skills add remotion-dev/skills`) | 12 skills em `.agents/skills` (link simbólico em `.claude/skills`) | ✅ | Li `remotion-best-practices` (roteador), `remotion-captions` (+ `display-captions.md`), `remotion-create`, `video-layout.md`, `remotion-markup` (REFERENCE, `multi-scene-video.md`, `local-fonts.md`). Regras seguidas: animação só com `useCurrentFrame`/`interpolate` (sem CSS animation), `premountFor={fps}`, fontes locais com `@remotion/fonts`, legendas no tipo `Caption` (startMs/endMs) com espaço antes de cada palavra, texto mínimo de 44 px e título de 84 px. |
| Plugin `frontend-design` (Anthropic, `anthropic-plugin-directory`) | `claude plugin install frontend-design@anthropic-plugin-directory` | ✅ | Segui o método de duas passadas (plano → revisão contra os clichês listados na skill → construção → autocrítica por quadros). O resultado está em `design.md`. |
| Skill `svg-character-animation` (`calesthio/openmontage`) | `npx skills add calesthio/openmontage --skill svg-character-animation` | ✅ instalada e lida | É voltada a rigs de personagem com GSAP. Apliquei as regras que servem aqui: animar só transformações, pivôs estáveis e linha do tempo guiada pelo frame do Remotion (nada de rAF). Não usei GSAP: as cunhas são SVG próprio guiado por `interpolate`. |
| Skill `elevenlabs-remotion` | `npx skills add elevenlabs-remotion` **falhou** (nome sem dono). `npx skills find` achou `maartenlouis/elevenlabs-remotion-skill`; instalada com `--skill elevenlabs-remotion` | ⚠️ instalada, **não executada** | **`ELEVENLABS_API_KEY` não existe nesta sessão.** O usuário vai cadastrar a chave nas configurações do ambiente, e ela só chega a uma sessão nova. O `generate.js` da skill não devolve tempos por palavra, então escrevi `video/scripts/narrar.mjs`: reaproveita o preset "narrator" da skill (0.65 / 0.8 / 0.15), o modelo `eleven_multilingual_v2` e o *request stitching*, e chama o endpoint `with-timestamps`. Antes de gerar, ele confere o limite do plano (`/v1/user/subscription`). |
| Fonte Noto Sans Cuneiform (OFL) | baixada de `notofonts.github.io` | ✅ | Sinais conferidos por código (Python `unicodedata` + cmap da fonte). Contornos extraídos com fontTools (`scripts/extract-glyphs.py`). |
| Fraunces e Archivo (OFL, Google Fonts) | baixadas do repositório `google/fonts` | ✅ | Títulos serifados com acentos completos; corpo e legendas sem serifa. |
| ffmpeg / ffprobe | já instalados (6.1.1) | ✅ | Mixagem, loudness (ebur128/loudnorm) e medição final. |
| Chromium para o Remotion | o Remotion baixou o próprio *headless shell* | ✅ | O Chromium de `/opt/pw-browsers` caiu ao abrir. Usei o do Remotion. |

Nenhum gerador de imagem ou vídeo por IA foi usado. Tudo o que aparece na tela sai de código: SVG, gradientes, ruído `feTurbulence` + `feDiffuseLighting` para a argila, partículas de poeira determinísticas e glifos da fonte.

## Fontes e checagem
- ORACC/ePSD2 ficou **inacessível** a sessão inteira (erro de TLS no curl, 503 no WebFetch). Para não depender da memória, a checagem usou a lista de sinais oficial do ORACC (GitHub `oracc/ogsl`), UnicodeData + o chart U12000, as gramáticas de Jagersma (2010) e Zólyomi (2017), o CAD (Chicago), a proposta Unicode L2/19-284, Bramanti (CDLN 2015:12) e Priberam/Michaelis. Detalhes em `fontes.md`.
- **Mudanças no roteiro por causa das fontes:**
  1. O gancho pedido era "A língua escrita **mais antiga** que conhecemos…". Virou "**Uma das** línguas escritas mais antigas do mundo…", porque a escrita egípcia de Abidos é aproximadamente contemporânea e Hawkins diz "*perhaps* the oldest".
  2. O exemplo intransitivo virou "o rei **veio**" (*lugal i₃-im-ĝen*) em vez de "chegou": ĝen = "ir", e com o ventivo = "vir". O transitivo é *lugal-e e₂ mu-du₃* (modelo atestado em Gudea: *ensi₂-ke₄ e₂ mu-du₃*).
  3. O fim do sumério falado ficou como faixa: "por volta de 2000 a 1800 a.C.". O uso no culto e na escola: "quase dois mil anos".
  4. "Só conseguimos ler o sumério graças às listas bilíngues" virou "Hoje lemos o sumério graças, **em grande parte**, às listas bilíngues…". As fontes dizem que as listas *contribuíram* para a decifração, junto com o conhecimento do acadiano.
  5. Não citei o nome da série *ur₅-ra = ḫubullu* (só a Wikipedia a confirmava).
  6. O exemplo de determinativo é ᵈen-lil₂ (Enlil) = AN U+1202D + EN U+12097 + KID U+121A4. Dois códigos que eu tinha chutado de memória (U+12117, LIL) estavam errados e foram corrigidos pela checagem.
- O glosário do ePSD2 não foi consultado; no vídeo, lugal é só "rei".

## Roteiro
- 8 blocos, 263 palavras faladas (`video/src/data/roteiro.json`). O formato `[tela|fala]` separa a grafia da legenda (lu₂, e₂-gal, 3300) da grafia enviada à voz ("Lú", "É-gal", "três mil e trezentos").
- Grafias fonéticas para a voz (convenção, já que o acento sumério é desconhecido, Jagersma p. 40): Lú, Gál, Lúgal, É, É-gal, lúgal-ê, dínguir, án, Úruk.

## Montagem
- `video/scripts/build-timeline.mjs` gera `src/data/timeline.json` com palavras, páginas de legenda (≤ 7 palavras, ≤ ~36 caracteres = 2 linhas, quebradas por frase/vírgula e sem palavra órfã) e telas ancoradas na palavra em que começam.
  - **Com voz:** tempos por caractere da ElevenLabs → tempos por palavra. Sem estimativa, então o desvio é zero por construção.
  - **Sem voz (situação atual):** tempo de leitura estimado (~0,058 s por letra + pausas de pontuação). Pausas de 1,7 s entre blocos.
- 29 telas, trocando a cada 2–6 s. As telas mais longas (mapa, data, contas, lugal, e₂-gal, cálamo, linha do tempo, lista bilíngue) têm uma mudança interna presa à palavra falada: pino de Uruk, "surge a escrita", sinal novo, cunha nova, barra que cresce.
- Trilha original: `video/scripts/gerar-trilha.mjs` gera um drone em Lá/Sol/Fá com batimento estéreo, vento filtrado e tambor de moldura a 72 BPM. Tudo sintetizado em código.
- Mixagem: `video/scripts/mix.mjs`. Com voz, a trilha fica 18 dB abaixo da loudness integrada da voz. Depois vem o loudnorm em 2 passadas para -14 LUFS / -1,5 dBTP.

## Verificação feita
- Quadros (`scripts/stills.mjs`, com a área segura em vermelho), 2 por tela: no meio e perto do fim. Problemas achados e corrigidos:
  - a data em 190 px invadia a faixa dos 150 px da direita (passou para 150 px);
  - as árvores de famílias encostavam na borda direita (vão reduzido);
  - o mapa passava para a área segura e cobria o título (reduzido e reposicionado);
  - a palavra ativa da legenda, ampliada, "comia" o espaço entre palavras (ampliação removida);
  - havia um espaço solto em "e₂ -gal";
  - a legenda subiu para y = 1110 para ficar no terço do meio.

## Pendências
- [ ] Narração: rodar `node scripts/narrar.mjs` numa sessão com a chave, depois `build-timeline` → `stills` → render → `mix`. Ouvir os trechos sumérios e checar a sincronia.
