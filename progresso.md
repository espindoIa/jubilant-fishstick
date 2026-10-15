# Progresso — TikTok "A língua suméria"

Registro do que foi feito, do que funcionou e do que falhou. Data: 2026-10-14.

## Ferramentas (plugins e skills do Claude Code)

| Ferramenta | Instalação | Funcionou? | Observação |
|---|---|---|---|
| Plugin oficial Remotion (`remotion-dev/claude-code-plugin`) | `claude plugin marketplace add` + `claude plugin install remotion@remotion` (v4.0.535) | ✅ instalado | Plugins instalados no meio da sessão não viram comandos `/…` nesta mesma sessão (`Skill` respondeu "Unknown skill"). As instruções foram lidas direto do disco. |
| Remotion Agent Skills (`npx skills add remotion-dev/skills`) | 12 skills em `.agents/skills` (link simbólico em `.claude/skills`) | ✅ | Li `remotion-best-practices` (roteador), `remotion-captions` (+ `display-captions.md`), `remotion-create`, `video-layout.md`, `remotion-markup` (REFERENCE, `multi-scene-video.md`, `local-fonts.md`). Regras seguidas: animação só com `useCurrentFrame`/`interpolate` (sem CSS animation), `premountFor={fps}`, fontes locais com `@remotion/fonts`, legendas no tipo `Caption` (startMs/endMs) com espaço antes de cada palavra, texto mínimo de 44 px e título de 84 px. |
| Plugin `frontend-design` (Anthropic, `anthropic-plugin-directory`) | `claude plugin install frontend-design@anthropic-plugin-directory` | ✅ | Segui o método de duas passadas (plano → revisão contra os clichês listados na skill → construção → autocrítica por quadros). O resultado está em `design.md`. |
| Skill `svg-character-animation` (`calesthio/openmontage`) | `npx skills add calesthio/openmontage --skill svg-character-animation` | ✅ instalada e lida | É voltada a rigs de personagem com GSAP. Apliquei as regras que servem aqui: animar só transformações, pivôs estáveis e linha do tempo guiada pelo frame do Remotion (nada de rAF). Não usei GSAP: as cunhas são SVG próprio guiado por `interpolate`. |
| Skill `elevenlabs-remotion` | `npx skills add elevenlabs-remotion` **falhou** (nome sem dono). `npx skills find` achou `maartenlouis/elevenlabs-remotion-skill`; instalada com `--skill elevenlabs-remotion` | ✅ usada na 2ª sessão (preset "narrator", stitching) via `narrar.mjs` | **`ELEVENLABS_API_KEY` não existe nesta sessão.** O usuário vai cadastrar a chave nas configurações do ambiente, e ela só chega a uma sessão nova. O `generate.js` da skill não devolve tempos por palavra, então escrevi `video/scripts/narrar.mjs`: reaproveita o preset "narrator" da skill (0.65 / 0.8 / 0.15), o modelo `eleven_multilingual_v2` e o *request stitching*, e chama o endpoint `with-timestamps`. Antes de gerar, ele confere o limite do plano (`/v1/user/subscription`). |
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

## Render e medições (versão sem voz)
- Render: `npx remotion render TikTokSumerio out/video-mudo.mp4 --codec=h264 --crf=18 --muted` (~5 min com 4 núcleos). Depois `node scripts/mix.mjs out/video-mudo.mp4 ../out/tiktok-lingua-sumeria.mp4`.
- **ffprobe:** vídeo H.264 1080×1920, 30/1 fps, 3600 quadros, 120,000 s; áudio AAC 48 kHz estéreo, 120,000 s.
- **ebur128:** -14,0 LUFS integrado, pico real -1,5 dBTP, LRA 3,9 LU.
- **Legendas:** 57 páginas, no máximo 7 palavras e 2 linhas cada. Duração mínima de uma página: 0,98 s (média 1,91 s). A página mais rápida tem 15 caracteres/s, abaixo do teto usual de ~17 caracteres/s para legendas.
- Folha de quadros do arquivo final (1 a cada 5 s) conferida: nada cortado e nada nas faixas de 250 px de baixo e 150 px da direita.

## Fase 2: narração (2ª sessão, já com a `ELEVENLABS_API_KEY`)

### Voz
- Plano gratuito (limite de 10.000 caracteres). Foram usados ~2.974 caracteres: testes de voz e de grafia, 1 rodada completa e refações por bloco. O contador do plano zerou no meio da sessão (virada de ciclo): marcava 2.727, depois passou a 247.
- Comparei 3 vozes pré-definidas com a mesma frase: Brian (f0 ≈ 103 Hz), George (≈ 133 Hz) e Daniel (≈ 132 Hz). Escolhi **Brian, "Deep, Resonant and Comforting"**: a mais grave e calma, como pedido. Modelo `eleven_multilingual_v2`, preset "narrator" (0.65/0.8/0.15), velocidade 0,95, *request stitching* entre blocos.

### Pronúncia (conferida com faster-whisper `medium` em pt; transcrições em `video/public/audio/voz/pronuncia-whisper.json`)
- "dínguir" saía como "Jinger" (g mole). Testei 7 grafias; "**Dín-guir**" é transcrita "dingir"/"Dhingir" (d e g duros).
- "gal" saía "gau" (l final vocalizado do pt-BR). "**Gáll / Lúgall / É-gall**" é transcrita "Gal", "Lugal", "É, gal". Como a voz varia de uma tomada para outra, refiz o bloco *aglutinante* até as palavras saírem certas.
- "lugal-e" → "**Lúgall-ê**", transcrito "Lugalê".
- "an, céu" grudava ("Ancel"). Com ponto entre as duas ("Án. Céu."), sai "an, céu".
- Úruk → "Uruk"; os números por extenso saem certos ("3.300 a 3.200 antes de Cristo", "2.000 a 1.800").
- Transcrição final: todas as palavras do roteiro reconhecidas. As diferenças são só de forma (números em algarismos, "indo -europeia", as grafias fonéticas).
- **Não verificado:** a qualidade subjetiva da voz e o sotaque. A voz é um modelo de língua inglesa falando pt-BR pelo modelo multilíngue, e eu não consigo ouvir; o Whisper só confirma que as palavras são reconhecíveis.

### Sincronia legenda × áudio (limite pedido: 150 ms)
- As legendas usam os tempos por caractere devolvidos pela ElevenLabs (`with-timestamps`) → tempos por palavra (`build-timeline.mjs`).
- **Medição independente:** alinhamento forçado com outro modelo, torchaudio **MMS_FA** (wav2vec2 multilíngue), em `scripts/alinhar-mms.py`.
  - ElevenLabs × MMS: 526 bordas de palavra, mediana 14 ms, p95 92 ms, máximo 148 ms.
  - Nenhuma passou de 150 ms, então não houve correção.
- **De ponta a ponta no MP4 final** (`scripts/verificar-final.py`: MMS sobre o áudio já mixado com a trilha × legendas do `timeline.json`):
  - palavras: 254 tokens, mediana 19 ms, p95 97 ms, máximo 133 ms;
  - **páginas de legenda** (entrada × início da 1ª palavra; saída × fim da última): 57 páginas, mediana 60 ms, p95 114 ms, máximo 133 ms.
  - Nenhuma acima de 150 ms (`video/public/audio/voz/sincronia-final.json`).
- **Ajuste feito por causa da medição:** as páginas ficavam 150 ms na tela depois da última palavra e saíam até 283 ms atrasadas. Agora saem quando a última palavra termina.
- **Tentativas descartadas:**
  - Os tempos por palavra do Whisper erram 100–300 ms, então serviram só para a pronúncia.
  - Uma checagem por envoltória de energia confundia pausas e oclusivas e gerou falsos alarmes; foi removida.

### Mixagem (`scripts/mix.mjs`)
- A voz é posicionada pelos tempos do timeline (pausas de 0,63 s entre blocos).
- A trilha tem ganho fixo + *ducking* (sidechain) guiado pela voz, com 80 ms de antecipação, razão 3 e release de 900 ms.
- **Trilha 19,4 dB abaixo da voz** (loudness integrada: voz -24,4 LUFS, trilha no mix -43,8 LUFS).
- **Voz sempre acima da trilha:** em todas as 882 janelas de 100 ms com fala (ponderação K), a voz fica acima; menor diferença +0,4 dB, mediana +23,5 dB (`scripts/voz-acima.py`).
  - Sem o ducking, finais de palavra que coincidiam com batidas do tambor ficavam até 3–5 dB abaixo da trilha.
  - Com 18,0 dB exatos, uma janela no início de "Foi" ficava 0,6 dB abaixo. Por isso a trilha ficou 19,4 dB abaixo, em vez de 18,0.

### Medições finais (`out/tiktok-lingua-sumeria.mp4`)
- **ffprobe:** H.264 1080×1920, 30/1 fps, 3600 quadros, 120,000 s; AAC 48 kHz estéreo, 120,000 s.
- **ebur128:** -14,2 LUFS integrado, pico real -1,3 dBTP (abaixo de -1).
- Quadros das 29 telas refeitos com a nova temporização (2 por tela, área segura marcada): nada fora da área segura e nada cortado.
- O texto do roteiro não mudou na fase 2 (só as grafias fonéticas enviadas à voz). A releitura contra o `fontes.md` continua válida.

## Fase 3: mapas reais, cuneiforme real, roteiro com curiosidades, voz mais dinâmica (2026-10-15)

### O que mudou e por quê, iteração por iteração
1. **Pesquisa antes de escrever.**
   - Um agente checou 8 curiosidades contra fontes baixadas: 5 entram, 3 caem (Kushim, Ea-nasir e o incêndio de Nínive; ver `fontes.md`, itens 17–25).
   - Também tirou 4 linhas reais do CDLI (item 26).
   - Outro agente baixou o Natural Earth, as coordenadas do Pleiades e 4 fotos CC0 do Met (itens 27–28).
   - O ORACC/ePSD2 continua fora do ar; a lista de sinais do ORACC (OSL) veio do GitHub.
2. **Voz.**
   - Testei 4 configurações com a mesma frase curta e medi velocidade, variação de f0 e faixa de energia.
   - Escolhida: `multilingual_v2`, stability 0,35, style 0,5, speed 1,05–1,2. Comparada à voz anterior (stability 0,65), tem mais variação de entonação (5,5 contra 4,2 semitons), entonação de pergunta reconhecida e ~2,9 palavras/s.
   - O `eleven_v3` devolve tempos por caractere, mas não aceita *request stitching*. Ficou de fora.
3. **Roteiro novo, com um fio:** "como a gente consegue ler uma língua sem parentes?". Cada bloco responde uma parte (escrita, isolamento, gramática, sinais, escola, tradução) até a resposta, as listas bilíngues, e a virada final (Halévy e o emesal).
   - A 1ª versão tinha 297 palavras e dava 120,3 s de fala, sem espaço para pausas.
   - Cortei 16 palavras em frases que não carregam o fio e subi a velocidade para 1,08.
4. **Pronúncia** (faster-whisper `medium`):
   - "Enlil" saía "Enleu" → "Ên-líl".
   - "decifrá-lo" virava "decifrar" → "ajudaram na decifração", que também fica mais fiel à fonte ("contributed").
   - "an, céu" grudava ("Ancel", "Anyarm") → "an, que significa céu".
   - O bloco do cuneiforme oscilava a cada tomada, então dividi em 3 blocos curtos para refazer só o que falhasse.
   - "dingir" saiu "Djingir" numa tomada → refeito.
5. **Primeira rodada de quadros:**
   - mapa, cones, linha de Gudea e selo encostavam nos 150 px da direita (somados ao zoom de câmera) → larguras ≤ 800 px;
   - a tabuinha bilíngue ficava vazia por 3 s → os sinais começam na fala;
   - o título do gancho estava na faixa das abas do TikTok → desceu.
6. **Ritmo:** "gramatica", "resposta" e "dingir" estavam a ~2,0 palavras/s, com pausas de 0,5–0,7 s em cada vírgula das listas.
   - Tirar a pontuação da fala acelerou, mas grudou as palavras ("galo grande", "desfração"). **Revertido:** a pausa depois de cada palavra suméria é o que a torna compreensível.
   - Velocidade 1,2 só em "gramatica" e "dingir" funcionou (2,65 e 2,85 palavras/s, pronúncia limpa).
   - Em "resposta", 1,2 estragou "šarru" ("Shahu"), então ficou a tomada a 1,12.
7. **Trocas visuais:** 5 trechos ficavam mais de 4 s sem mudança na tela. Prendi uma revelação à fala em cada um: "antes de Cristo", "d = deus, não se lê", a data da linha do tempo, os cabeçalhos e a gravação da lista bilíngue, e "e siga".

### Como cada elemento novo foi feito
- **Mapa** (`src/components/MapaReal.tsx`):
  - vetores do Natural Earth + relevo do Natural Earth, numa projeção cilíndrica equidistante (31,5°N) aplicada igualmente ao raster e aos vetores;
  - rios traçados em animação e câmera com zoom logarítmico;
  - sítios do Pleiades;
  - rótulo "Iraque, hoje": sem costa antiga, porque não há dado traçável (`fontes.md`, item 27).
- **Fotos** (`src/components/ObjetoMuseu.tsx`): os 4 objetos do Met, recortados do fundo (`scripts/recortar-fotos.py`), com câmera lenta e etiqueta de museu (objeto, data, nº de acesso).
- **Linhas reais** (`src/components/LinhaCuneiforme.tsx`): gravação sinal a sinal com glifos da Noto, transliteração alinhada sob cada grupo, destaque (ensi₂-ke₄, ᵈ) e etiqueta de procedência.

### Verificação externa (critérios)
| Critério | Como | Resultado |
|---|---|---|
| Fatos | Cada frase da narração e da tela tem item em `fontes.md`; a tabela frase × fonte está no item 31 | ✅ |
| Pronúncia | `scripts/verificar-pronuncia.py` (Whisper medium) → `public/audio/voz/pronuncia-whisper.json` | ✅ todas as palavras reconhecidas, incluindo lugal, gal, dingir, an, Enlil, Gudea, šarru e emesal |
| Tempos ElevenLabs × alinhador independente | `scripts/alinhar-mms.py` (MMS_FA) | ✅ 574 bordas, mediana 14 ms, máximo 139 ms; nenhuma correção |
| Sincronia de ponta a ponta (MP4) | `scripts/verificar-final.py` | ✅ **páginas**: 60, máximo 132 ms. Palavras: 276/277 ≤ 150 ms (mediana 14 ms). ⚠️ 1 exceção explicada abaixo |
| Mapa | `scripts/verificar-mapa.py` (Pleiades × Wikidata) | ✅ 8 sítios, erro máximo 0,011° (limite 0,1°); rios e costa vêm do arquivo do Natural Earth |
| Cuneiforme | `scripts/verificar-cuneiforme.py` (OSL do ORACC + ATF do CDLI) | ✅ 19/19 sinais; sequências = ATF. `1(N01)` sem Unicode, declarado |
| Licenças | API do Met (`isPublicDomain`), Natural Earth (domínio público), Noto/Fraunces/Archivo (OFL) | ✅ |
| Ritmo | `scripts/medir-ritmo.mjs` → `src/data/ritmo.json` | ✅ global 2,82 palavras/s; 9 de 10 blocos entre 2,65 e 3,37. ⚠️ "resposta" com 2,33 |
| Trocas visuais | idem (cortes + eventos declarados em `roteiro.json`) | ✅ 60 mudanças, média 2,0 s, maior intervalo 4,04 s |
| Legendas | idem | ✅ 60 páginas, no máximo 7 palavras |
| Voz × trilha | `scripts/voz-acima.py` | ✅ voz acima em todas as 866 janelas com fala (mínimo +1,8 dB); trilha 17,4 dB abaixo |
| Formato e loudness | ffprobe e ebur128 | ✅ H.264 1080×1920, 30 fps, 3600 quadros, 120,000 s, AAC; -14,1 LUFS, pico -1,2 dBTP |
| Quadros | `scripts/stills.mjs --debug`, 2 por tela | ✅ nada fora da área segura; todo texto ≥ 44 px (corrigi um texto de 42 px na tela final) |

**Exceções, com motivo:**
- **"resposta" a 2,33 palavras/s** (alvo ~2,6). Acelerar a 1,2 estragou "šarru" e cortar as pausas grudou as palavras. Entre ritmo e pronúncia, fiquei com a pronúncia.
- **Uma palavra, "lugal," no bloco "resposta"**: a 3ª medição (MMS sobre o trecho longo) dá o fim 223 ms antes. As outras duas, ElevenLabs e MMS no bloco limpo, concordam em 20 ms (6,803 × 6,823 s). É fala contínua ("Lúgall em acadiano"), sem fronteira acústica entre as palavras. A página da legenda que contém a palavra está dentro do limite.

### Voz usada (por bloco) e consumo
- Brian, `eleven_multilingual_v2`, stability 0,35, style 0,5.
- Velocidade 1,08 em gancho, onde, isolada, cunhas, determinativo, escola e final; 1,2 em gramatica e dingir; 1,12 em resposta.
- Consumo da fase 3 ≈ 6.300 caracteres. O plano está em 6.934 de 10.000 neste ciclo.

## Pendências
- [x] Narração gerada, pronúncia conferida, sincronia medida, mix refeito.
- [ ] Conferir no app do TikTok de verdade (aparência na interface, compressão da plataforma) e ouvir a voz (qualidade subjetiva, sotaque): não dá para fazer daqui.
