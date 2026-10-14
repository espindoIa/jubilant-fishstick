# Fontes e checagem: vídeo "A língua suméria" (TikTok, pt-BR, ~2 min)

**Data da checagem:** 2026-10-14

## Método

Só valem as afirmações conferidas contra fontes baixadas de fato nesta sessão (curl/WebFetch, com o texto extraído e lido), nunca de memória. As citações abaixo foram copiadas dos textos baixados. As páginas indicadas são as impressas no livro.

### Sites que funcionaram (fonte primária ou acadêmica)
- **Jagersma, B. *A Descriptive Grammar of Sumerian*** (tese, Leiden, 2010). PDF completo: https://scholarlypublications.universiteitleiden.nl/access/item%3A2961989/download (handle: https://hdl.handle.net/1887/16107). Obs.: o link openaccess.leidenuniv.nl/…/Binnenwerk-jagersma.pdf caiu num captcha; o item 2961988 é só a capa.
- **Zólyomi, G. *An Introduction to the Grammar of Sumerian*** (ELTE, Budapeste, 2017). PDF: https://www.eltereader.hu/media/2017/02/Zolyomi_Sumer_READER.pdf
- **Lista de sinais do ORACC (OSL/OGSL)**, repositório oficial no GitHub, clonado com git: https://github.com/oracc/ogsl (arquivo `00lib/osl.asl`)
- **Unicode**: https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt e https://www.unicode.org/charts/PDF/U12000.pdf
- **Hawkins, L. Proposal to encode Proto-Cuneiform** (Unicode L2/19-284, 2019): https://www.unicode.org/L2/L2019/19284-proto-cuneiform.pdf
- **Viano, M. "The Reception of Sumerian Literature in the Western Periphery"** (Edizioni Ca' Foscari), cap. 2: https://edizionicafoscari.it/media/pdf/books/978-88-7543-417-5/978-88-7543-417-5-ch-02.pdf
- **Fink, S. "Without Sumerian you are no true human"** (Univ. de Helsinki, 31/03/2021): https://www.helsinki.fi/en/researchgroups/ancient-near-eastern-empires/news/without-sumerian-you-are-no-true-human
- **ETCSL**, lista de sinais: https://etcsl.orinst.ox.ac.uk/edition2/signlist.php
- **Licença da fonte Noto Sans Cuneiform**: https://raw.githubusercontent.com/notofonts/cuneiform/main/OFL.txt
- Só para corroborar: Wikipedia (en) *Sumerian language*, *Cuneiform*, *Egyptian hieroglyphs*, *Urra=hubullu*; Brewminate (republica, sob CC BY 4.0, um texto da Universidade de Cambridge): https://brewminate.com/an-overview-of-ancient-mesopotamian-languages/

### Sites que NÃO funcionaram
- **ORACC / ePSD2 ficou inacessível.** https://oracc.museum.upenn.edu/epsd2/sux: o curl falhou em TLS ("unable to get local issuer certificate") e o WebFetch recebeu HTTP 503. O http:// redireciona para https e falha do mesmo jeito. Também falharam https://oracc.org (túnel fechado), https://build-oracc.museum.upenn.edu/json/epsd2-sux.zip (TLS) e a página de verbete http://oracc.museum.upenn.edu/epsd2/cbd/sux/o0032435.html.
  - Consequência: **o glosário do ePSD2 ("lugal = king, lord, master, owner") não foi conferido diretamente.** Usei a lista de sinais oficial do ORACC (GitHub) para sinais e valores, e as gramáticas de Jagersma e Zólyomi para os significados.
- **ePSD1** (http://psd.museum.upenn.edu/epsd1/) redireciona para o ORACC e também ficou inacessível.
- O repositório github.com/oracc/epsd2 é privado ou exige autenticação (o git pediu credenciais).
- **Britannica** (topic/Sumerian-language e topic/cuneiform): HTTP 403.
- github.com/notofonts/cuneiform deu HTTP 403 via curl. A página fonts.google.com/noto/specimen/Noto+Sans+Cuneiform carregou, mas é só JavaScript e a licença não aparece no HTML. Em compensação, o OFL.txt (link acima) foi lido.
- cdli.ox.ac.uk/wiki/proto-cuneiform estava atrás de um bloqueio anti-robô (Anubis). Jagersma, Michalowski e o capítulo da Cambridge Encyclopedia não foram consultados nessas versões.

---

## Checagem por afirmação

### 1. Antiguidade e isolamento
- **Afirmação (texto FINAL do vídeo, gancho):** "Uma das línguas escritas mais antigas do mundo não tem nenhum parente vivo."
- **Veredito:** **confirmado** (a formulação final já usa "uma das… mais antigas", que é a forma defensável). "Nenhum parente vivo" é verdadeiro, e na realidade é até mais forte: não se conhece **nenhum** parente, nem vivo nem extinto (Jagersma: "no known relatives"; Zólyomi: "no known ancient or modern relatives"). Evitar "a mais antiga": a escrita egípcia é aproximadamente contemporânea.
- **Fontes e evidências:**
  - Jagersma 2010, p. 1 (URL Leiden acima): "Sumerian is a language isolate with no known relatives. Its position … shows it to be a last remnant of the languages that preceded the arrival of Semitic languages in the area … much like that of Basque in Europe". Na p. 15, o cuneiforme (c. 3200 a.C.) é "the oldest script known".
  - Zólyomi 2017, p. 15: "Sumerian is a language isolate with no known ancient or modern relatives."
  - Hawkins 2019 (Unicode L2/19-284), p. 1: "Cuneiform is **perhaps** the oldest writing system attested".
  - Wikipedia, *Egyptian hieroglyphs* (corroboração): "discoveries of glyphs at Abydos, dated between 3400 and 3200 BC, have shed further doubt on the classical notion that the Mesopotamian symbol system predates the Egyptian one."
  - Wikipedia, *Sumerian language* (corroboração): a hipótese de que o sumério fosse indo-europeu "has been almost universally rejected".

### 2. Origem da escrita em Uruk
- **Afirmação (texto FINAL):** "Em Uruk, por volta de 3300 a 3200 antes de Cristo, surge a escrita."
- **Veredito:** **confirmado (defensável).** A faixa 3300–3200 a.C. corresponde ao período Uruk IV, que Hawkins (Unicode L2/19-284) data em ca. 3350–3200 a.C. A Wikipedia diz "from c. 3300 BC". Jagersma é mais conservador e dá ca. 3200–3000 a.C. para Uruk IV/III. Também é verdade que a escrita surgiu para administração e contabilidade.
- **Fontes e evidências:**
  - Hawkins 2019, p. 1: a escavação alemã "unearthed most of the tablets of this early phase of cuneiform history during their excavations at the ancient city of Uruk". Mais adiante: "Uruk IV, ca. 3350-3200 BCE; Uruk III, ca. 3200–3000 BCE".
  - Jagersma 2010, p. 4: "The earliest texts, about 6000 in number, date to the Uruk III and Uruk IV periods (ca. 3200-3000 BCE) and are written in a somewhat rudimentary script called proto-cuneiform."
  - Jagersma 2010, p. 2: "a meticulous administration and accounting system. It was, in fact, precisely for this purpose that the Sumerian cuneiform script was invented at all."
  - Zólyomi 2017, p. 15: "The first written documents, created most probably by Sumerian speaking people, are dated to the end of the 4th millennium BCE."
  - Wikipedia, *Cuneiform* (corroboração): "The first unequivocal written documents start with the Uruk IV period, from c. 3300 BC"; "Most Proto-Cuneiform records from this period were of an accounting nature."
- **Nuance:** ainda se discute se os textos mais antigos estão de fato em sumério. Jagersma, p. 4, registra que Englund "still sees no definitive evidence identifying the language of these texts". Por isso é melhor dizer "a escrita surge em Uruk" do que "o sumério é escrito pela primeira vez em 3300 a.C.".

### 3. Língua aglutinante
- **Afirmação:** "O sumério é aglutinante: monta palavras empilhando pedacinhos."
- **Veredito:** **confirmado.**
- **Fontes e evidências:**
  - Zólyomi 2017, p. 15: "Sumerian is a mainly agglutinative language, characterised by split ergativity."
  - Jagersma 2010, p. 69: "Sumerologists consistently describe Sumerian as an agglutinative language." Ele ressalva que o sentido do termo mudou desde Poebel (1914).

### 4. Exemplos de palavras, sinais e Unicode
- **Veredito geral:** **confirmado.** Os cinco códigos foram conferidos em três fontes: UnicodeData.txt, o chart U12000.pdf e a OSL do ORACC (`@uname`/`@list U+…`).

| Sinal | Unicode (nome oficial) | Valores na OSL do ORACC (seleção) | Significado (fonte) |
|---|---|---|---|
| 𒈗 | U+12217 CUNEIFORM SIGN LUGAL | lugal, šarrum, … | lugal "rei" (Jagersma p. 120) |
| 𒇽 | U+121FD CUNEIFORM SIGN LU2 | lu₂, … | lú "homem" (Jagersma p. 120) |
| 𒃲 | U+120F2 CUNEIFORM SIGN GAL | gal, kal₂, rab₂, … | gal "grande" (Jagersma p. 120) |
| 𒂍 | U+1208D CUNEIFORM SIGN E2 | e₂, bitu, … | é "casa" (Jagersma p. 48); e₂ "temple" no ex. 17 de Zólyomi |
| 𒀭 | U+1202D CUNEIFORM SIGN AN | an, d, diŋir/dingir, … | diĝir "deus", an "céu" (Jagersma p. 16, 19) |

- **lugal = lu₂ + gal:** **confirmado como etimologia padrão**, com uma nuance gráfica.
  - Jagersma 2010, p. 120: "lugal 'king' (< lú 'man' and gal 'big')".
  - Jagersma 2010, p. 121: "lugal 'king' is written GAL.LÚ … spellings may go back to the old pattern where the adjective precedes the noun."
  - Ou seja, na escrita o sinal é GAL + LU₂ (nessa ordem), embora a palavra seja lu-gal.
  - Frase segura para o vídeo: "lugal, 'rei': literalmente 'homem grande', e o sinal é feito de 'grande' + 'homem'". Lembrete: na OSL do ORACC, LUGAL aparece como sinal próprio (U+12217), e não como sequência de dois códigos.
- **e₂-gal "palácio" = "casa grande":** **confirmado.** Jagersma 2010, p. 48: "é-gal 'palace (lit. "big house")'", forma que chegou ao hebraico *hēkal* e ao árabe *hajkal*, entre outras línguas. Escrita com dois sinais: 𒂍𒃲 (U+1208D + U+120F2).
- **dingir / AN (mesmo sinal como palavra, como som e como classificador):** **confirmado.**
  - Jagersma 2010, p. 16: "The logogram diĝir 'god', for instance, is used as a determinative before the names of gods: ᵈinanna".
  - Jagersma 2010, p. 19: "the sound sign for an (a value derived from its usage as the word sign for an 'heaven')".
  - A OSL do ORACC lista para AN os valores `an`, `d`, `diŋir`, `dingir`; a lista do ETCSL dá "AN am₆, an, diĝir, il₃".
  - Obs.: as fontes atuais (ePSD2/ORACC, Zólyomi, Jagersma) transliteram **diŋir/diĝir** (com ŋ = "ng" de *sing*). "dingir" é a forma tradicional, também aceita.
- **Glosa do ePSD2 ("king, lord, master, owner"):** **não verificada** porque o ORACC estava fora do ar. No vídeo, use só "rei".

### 5. Ergatividade
- **Afirmação (texto FINAL):** "lugal-e e₂ mu-du₃" = "o rei construiu o templo"; "lugal i₃-im-ĝen" = "o rei veio". O agente transitivo leva -e (ergativo); o sujeito intransitivo e o objeto ficam sem marca (absolutivo).
- **Veredito:** **confirmado, com nuance.** A ergatividade é cindida (split): nos substantivos é consistente; os pronomes independentes e a concordância verbal do presente-futuro (marû) seguem o padrão nominativo-acusativo.
- **Fontes e evidências:**
  - Zólyomi 2017, p. 41: "The ergative case-marker is the enclitic =/e/; the absolutive case is signalled with the lack of any case-marker … =/ø/". O ex. (17), Gudea Cil. A 22:9, é atestado: **ensi₂-ke₄ e₂ mu-du₃** "The ruler has built the temple".
  - Zólyomi 2017, p. 161, ex. (251), atestado: **mu ᵈamar-ᵈsuen lugal-e ur-bi₂-lum mu-ḫul** "The year: Amar-Suena, the king, raided Urbilum", com lugal=e glosado como "king=ERG".
  - Jagersma 2010, p. 499–500, ex. (17), atestado (Umma): **lugal ki-en-gi-šè ì-im-ĝen-na-a** "when the king came to Sumer", com lugal=Ø glosado como "king=ABS".
  - Zólyomi 2017, p. 62: "Nouns are marked ergatively, while independent personal pronouns are marked accusatively". Na p. 125: "The pronominal cross-referencing system of the preterite is ergative … of the present-future is nominative-accusative".
  - Wikipedia, *Sumerian language* (corroboração), traz exatamente o par didático: **lugal i₃-im-g̃en** "The king came" / **lugal-e e₂ in-du₃** "The king built a house".
- **Formas recomendadas para a tela:**
  - **lugal-e e₂ mu-du₃** = "o rei construiu a casa/o templo". Segue o modelo atestado ensi₂-ke₄ e₂ mu-du₃. "mu-un-du₃" é grafia de período posterior, também comum. "in-du₃" é a variante da Wikipedia.
  - **lugal i₃-im-ĝen** (ou "lugal i₃-im-gen") = "o rei **veio**", e não "chegou". ĝen significa "ir"; com o prefixo ventivo -m- vira "vir" (Jagersma, ex. 17; Zólyomi p. 65 glosa ba-ŋen como "go"). Para "chegou", "veio" é a tradução mais segura.
  - As duas frases do par são **construções didáticas** baseadas em padrões atestados, e não citações literais de um texto.
- **Verbos:** du₃ "to build" (Zólyomi p. 93, "the verb du₃ 'to build'"); ŋen/ĝen "to go" (Zólyomi p. 103; Jagersma p. 17); kur₉/ku₄ "to enter" (Zólyomi p. 41). e₂ aparece como "temple" (Zólyomi ex. 17) e como "house" (Jagersma p. 48).

### 6. Escrita cuneiforme: cálamo, argila e sinais polivalentes
- **Afirmação (texto FINAL):** "Com o tempo, a escrita virou cunhas: um cálamo pressionado na argila úmida." Um mesmo sinal pode ser palavra, som ou classificador.
- **Veredito:** **confirmado.** "Com o tempo" está correto: nas tábuas mais antigas os sinais eram *desenhados*; a cunha impressa vem depois. O "cálamo" (junco) é a ferramenta tradicional, apoiada pelo próprio nome do estilete (sum. gi-dub-ba, acad. qan ṭuppi, "junco de tábua"); estiletes de madeira ou osso não são descartados. Ver a fonte acadêmica no item 13.
- **Fontes e evidências:**
  - Hawkins 2019, p. 1: "The signs … were drawn, and in later cuneiform impressed, with the aid of a stylus into the still soft surface of clay tablets."
  - Wikipedia, *Cuneiform* (corroboração do "junco"): "drawn on clay tablets … with a sharpened reed stylus"; "In the mid-3rd millennium BC, a new wedge-tipped stylus was introduced which was pushed into the clay, producing wedge-shaped cuneiform."
  - Zólyomi 2017, p. 16–17: o sistema tem "logograms … and phonograms … Many signs may be used either as a logogram or a phonogram"; o sinal auxiliar que funciona como logograma "is called determinative".
  - Jagersma 2010, p. 15–16 dá o exemplo do sinal KA, que vale ka "boca", zú "dente", inim "palavra" e também o som ka.
- **Ressalva:** o material "junco" só aparece na Wikipedia entre as fontes baixadas. Hawkins diz apenas "stylus". Se quiser ficar 100% nas fontes acadêmicas, diga "estilete".

### 7. Convivência com o acadiano e uso como "latim" da Mesopotâmia
- **Afirmação (texto FINAL):** "Por volta de 2000 a 1800 antes de Cristo, o sumério deixou de ser falado. Mas seguiu por quase dois mil anos como língua do culto e da escola. Como o latim na Europa."
- **Veredito:** **confirmado.** A faixa 2000–1800 a.C. cobre as posições acadêmicas: Fink diz ~2000 a.C.; Jagersma diz séc. 19 a.C. e "nobody … after the 18th century"; a posição "precoce" põe o fim no período Ur III (fim do 3º milênio), o que a faixa não inclui, mas é posição minoritária. "Quase dois mil anos" vai de ~1800 a.C. até o fim do 1º milênio a.C. ou os primeiros séculos d.C. (Jagersma p. 1; Fink).
- **Fontes e evidências:**
  - Jagersma 2010, p. 1: "documented as a living language from the late fourth millennium … until the early second millennium. Though no longer spoken, Sumerian continued to be used as a language of scholarship and cult until the end of the first millennium BCE."
  - Jagersma 2010, p. 9: "Proponents of an early demise … Sumerian had become an only written language by the Ur III period … Nobody, however, dates the death of Sumerian after the 18th century". Na p. 10: "Sumerian had ceased to be a living language by the 19th century."
  - Zólyomi 2017, p. 20: "The dominance of Akkadian eventually led to the replacement of Sumerian by Akkadian as the vernacular … by the end of the Old Babylonian period Sumerian was no longer acquired as a first language."
  - Viano (Ca' Foscari), cap. 2: "Sumerian had been a dead language for over half a millennium, but it continued to function as a written language of scholarship and education in scribal circles, **very much like Latin in the Middle Ages**."
  - Fink (Helsinki, 2021): "it ceased to be a vernacular around 2000 BC"; "the scribes continued to study Sumerian until the very end of cuneiform in the first centuries AD".
  - Brewminate/Cambridge: "survived as a scholarly and liturgical language, much like mediaeval Latin".
- **Frase segura:** "Por volta de 2000–1800 a.C. o sumério deixou de ser falado, mas seguiu vivo nos templos e nas escolas por quase dois mil anos, como o latim na Europa."

### 8. Como conseguimos ler o sumério
- **Afirmação:** "Conseguimos ler o sumério graças aos próprios escribas, que fizeram listas bilíngues sumério–acadiano. Como o acadiano (semítico) já tinha sido decifrado, essas listas viraram dicionários."
- **Veredito:** **confirmado.** Sobre o exemplo da série ur₅-ra = ḫubullu: **ajustado**. A série existe e é bilíngue nas versões posteriores, mas a única fonte baixada que a descreve é a Wikipedia; a fonte primária (DCCLT/ORACC) estava fora do ar. Sugestão: não citar o nome da série, ou citá-la só como exemplo.
- **Fontes e evidências:**
  - Zólyomi 2017, p. 22: "Only after understanding the Akkadian texts better did scholars become aware of the existence of texts written in another different language. The royal library in Nineveh provided many bilingual sources, mainly lexical lists and literary texts with Akkadian translations which contributed to the decipherment of the Sumerian script and language."
  - Jagersma 2010, p. 10: "The modern study of Sumerian began in the 1850s with the discovery of the royal libraries in Niniveh … bilingual tablets … included texts with Akkadian translations but also lexical lists giving the readings and meanings of many Sumerian words".
  - Wikipedia, *Sumerian language* (corroboração): "Knowledge of the readings of Sumerian signs is based, to a great extent, on lexical lists made for Akkadian speakers".
  - Wikipedia, *Urra=hubullu* (corroboração): "ur₅-ra — ḫu-bul-lu₄ … consists of Sumerian and Akkadian lexical lists ordered by topic … a bilingual tradition existing by the time of the Kassites."
- **Frase segura:** "Os próprios escribas babilônios deixaram listas bilíngues, sumério de um lado e acadiano do outro. Elas, encontradas sobretudo na biblioteca de Nínive, foram a chave para decifrar o sumério."

### 9. Pronúncia para a narração (dicas para o TTS em pt-BR)
- **Veredito:** **convenção.** Não existe pronúncia "certa" atestada. Jagersma, p. 40: "the Sumerian rules of accentuation are largely unknown". A sílaba tônica é convenção moderna.

| Palavra | Dica de leitura para o TTS | Base |
|---|---|---|
| lugal | "LÚ-gal" ou "lu-GAL" (as duas são aceitáveis; recomendo "LÚ-gal") | Convenção; acento desconhecido (Jagersma p. 40) |
| e₂-gal | "é-GAL" | Convenção; o ₂ só distingue sinais e não se pronuncia (Jagersma p. 15, nota 2) |
| dingir / diŋir | "DÍN-guir" (g duro) | Convenção. A transliteração atual é **diŋir**, com ŋ = "ng" de *sing* (Zólyomi p. 22; Jagersma p. 33: "ĝ [ŋ]"). "DÍN-guir" é uma boa aproximação em português. |
| Uruk | "U-RUK" (ou "Úruk") | Convenção. O nome sumério é **Unug** (Jagersma p. 180, ex. 201: "lugal unugᵏⁱ-šè du-né … ‘when the king was going to Uruk’"); "Uruk" vem da forma acadiana. |

---

## Fonte tipográfica
- **Noto Sans Cuneiform** usa a **SIL Open Font License 1.1**: "Copyright 2022 The Noto Project Authors (https://github.com/notofonts/cuneiform). This Font Software is licensed under the SIL Open Font License, Version 1.1." Lido em https://raw.githubusercontent.com/notofonts/cuneiform/main/OFL.txt. A OFL permite usar a fonte em vídeo sem restrição.
- Página de referência (carregada, mas é só JavaScript): https://fonts.google.com/noto/specimen/Noto+Sans+Cuneiform

---

## Checagens adicionais (2026-10-14, 2ª rodada)

Novas fontes lidas nesta rodada:
- **CAD (Chicago Assyrian Dictionary)**, PDFs oficiais do ISAC/University of Chicago:
  - vol. 4 (E): https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/cad_e.pdf
  - vol. 7 (I/J): https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/cad_i-j.pdf
  - vol. 17/II (Š): https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/cad_s_shin_2.pdf
  - Esses links abrem uma página HTML com o link do PDF real, hospedado em isac-assets.s3.amazonaws.com. Baixei o PDF real e extraí o texto, que é OCR: š e ṭ às vezes saem como s e t.
- **Bramanti, A. "The Cuneiform Stylus. Some Addenda"**, *Cuneiform Digital Library Notes* 2015:12 (CC BY 4.0): https://cdli.earth/articles/cdln/2015-12
- **Priberam**: https://dicionario.priberam.org/cuneiforme
- **Michaelis**: https://michaelis.uol.com.br/moderno-portugues/busca/portugues-brasileiro/cuneiforme/
- **Wikcionário (pt)**: https://pt.wiktionary.org/wiki/cuneiforme

Não funcionaram ou não foram consultados:
- Etymonline (HTTP 403).
- O *Concise Dictionary of Akkadian* (Black/George/Postgate) e Huehnergard não foram consultados; o CAD bastou.
- cuneiform.neocities.org abriu, mas é um site amador sobre hititas, sem o texto de Cammarosano. O artigo de Cammarosano, "The Cuneiform Stylus" (*Mesopotamia* 49, 2014), não foi baixado; ele só aparece citado por Bramanti.

### 10. Equivalentes acadianos (tela de "lista lexical bilíngue")
- **Afirmação (tela):** lugal = šarru(m) "rei"; e₂-gal = ekallu(m) "palácio"; dingir = ilu(m) "deus".
- **Veredito:** **confirmado.** Melhor ainda: as três equações aparecem **literalmente** em listas lexicais antigas, citadas pelo CAD. Também está **confirmado** que ekallu é empréstimo do sumério é-gal.

| Sumério | Acadiano | Fonte (CAD; página impressa) | Evidência (lista lexical antiga citada no CAD) |
|---|---|---|---|
| lugal | **šarru** (OB **šarrum**) "rei" | CAD Š/2, p. 76, verbete *šarru*: "1. king … from OAkk. on; wr. syll. and LUGAL" | "lu-gal LUGAL = šar-ru Sb I 331" (o OCR traz "ar-ru"/"sar-ru") |
| é-gal | **ekallu** (OB **ekallum**) "palácio" | CAD E, p. 52, verbete *ekallu*: "1. royal palace … from OAkk. on; **Sum lw.**" (lw. = loanword) | "é.gal = e-kal-lu … Igituh I 364" |
| diĝir | **ilu** (OB **ilum**) "deus" | CAD I/J, p. 91, verbete *ilu*: "1. god, deity" | "di-in-gir AN = i-lum Sb II 2" |

- **ekallu como empréstimo do sumério:**
  - CAD E p. 52: "Sum lw.".
  - Jagersma 2010, p. 37: "Early Sumerian loanwords in Akkadian show that Akkadians heard Sumerian /b/, /d/, and /g/ as their own /p/, /t/, and /k/: e.g., ekallu 'palace' (Sumerian é-gal)". Também na p. 51.
  - Zólyomi 2017, p. 34 (tabela de empréstimos do 3º milênio): "e₂-gal ➙ ekallum 'palace'".
- **Nota para a tela:**
  - Com mimação (período paleobabilônico, época das listas bilíngues antigas): **šarrum / ekallum / ilum**.
  - Sem mimação, como nos lemas do CAD e nas listas tardias: **šarru / ekallu / ilu**.
  - As duas formas estão corretas. O mais coerente é escolher uma e manter nas três palavras.

### 11. Determinativo: Enlil = ᵈen-lil₂
- **Afirmação (tela):** ᵈen-lil₂ "Enlil", em que o 𒀭 (AN/DINGIR) não se lê: ele só indica "isto é um deus".
- **Veredito:** **confirmado, mas os códigos Unicode estavam ERRADOS e foram corrigidos:**
  - **EN não é U+12117.** U+12117 é "CUNEIFORM SIGN GU CROSSING GU". O certo é **U+12097 CUNEIFORM SIGN EN (𒂗)**.
  - **lil₂ não é o sinal LIL.** O valor lil₂ pertence ao sinal **KID: U+121A4 CUNEIFORM SIGN KID (𒆤)**. O sinal LIL é **U+121F8** (𒇸), com o valor *lil*, sem o ₂, e **não** é usado em Enlil.
  - Sequência correta: **𒀭𒂗𒆤 = U+1202D U+12097 U+121A4.** Conferi com Python `unicodedata`: AN, EN, KID.
- **Fontes e evidências:**
  - Grafia: Zólyomi 2017, p. 39, ex. (16), En-metena 1: "ᵈen-lil₂, lugal kur-kur-ra … 'Enlil, the king of all lands, the father of all gods'".
  - Jagersma 2010, p. 16: "The logogram diĝir 'god', for instance, is used as a determinative before the names of gods: ᵈinanna …, ᵈen-líl '(the god) Enlil'". Na notação de Jagersma, líl = lil₂.
  - OSL do ORACC (`00lib/osl.asl`):
    - `@sign EN` / `@uname CUNEIFORM SIGN EN` / `@list U+12097` / `@v en`
    - `@sign KID` / `@uname CUNEIFORM SIGN KID` / `@list U+121A4` / … `@v lil₂` …
    - `@sign LIL` / `@uname CUNEIFORM SIGN LIL` / `@list U+121F8` / `@v lil`
  - UnicodeData.txt: "12097;CUNEIFORM SIGN EN", "121A4;CUNEIFORM SIGN KID", "121F8;CUNEIFORM SIGN LIL", "12117;CUNEIFORM SIGN GU CROSSING GU".
  - Chart U12000.pdf: "12097 𒂗 CUNEIFORM SIGN EN", "121A4 𒆤 CUNEIFORM SIGN KID".
  - Lista de sinais do ETCSL: "KID ge₂, gi₂, ke₄, kid, lil₂"; "LIL lil, sukuₓ"; "EN en, in₄, ru₁₂, uru₁₆".
  - Wikipedia, *Cuneiform* (corroboração): "𒀭𒂗𒆤 as ᵈen-líl".

### 12. Etimologia de "cuneiforme"
- **Afirmação:** "cuneiforme" vem do latim *cuneus*, "cunha" (+ *forma*).
- **Veredito:** **confirmado.**
- **Fontes e evidências:**
  - Priberam: "Que tem forma de cunha … Diz-se da antiga escrita desenvolvida no IV milénio a.C. na Mesopotâmia, constituída por sinais triangulares em forma de cunha impressos por um estilete … **Origem: latim cuneus, -i, cunha + -forme**."
  - Michaelis: "Em forma de cunha … ETIMOLOGIA voc comp do lat cuneum+i+lat forma, como fr cunéiforme."
  - Wikcionário (corroboração): "que tem forma de cunha".

### 13. Fonte acadêmica para "cálamo/junco"
- **Afirmação (texto FINAL):** "um cálamo pressionado na argila úmida."
- **Veredito:** **confirmado, com nuance.** O junco é a hipótese tradicional e tem base no próprio vocabulário antigo, mas não há prova de que fosse o único material.
- **Fontes e evidências:**
  - Bramanti, CDLN 2015:12, seção 2 ("Literature"): Messerschmidt "first reconstructed a stylus from a reed, according to the etymology of the word (Sum. gi-dub(-ba), Akk. qan-tuppi), literally 'tablet reed'. In any case, this information should not dissuade one from taking other materials into consideration … Edzard was among the first to admit the possibility of a 'dauerhafteres Schreibgerät' besides reed styli". Na seção de vestígios: "its presence alone does not prove the use of a reed stylus, since similar traces can be left from wooden tools as well."
  - Hawkins 2019, p. 1: os sinais foram "drawn, and in later cuneiform impressed, with the aid of a stylus into the still soft surface of clay tablets". Isso sustenta "pressionado" e "argila úmida/mole".
- **Conclusão:** "cálamo" é aceitável. Em sumério, o próprio nome do estilete significa "junco de tábua", e a frase da narração não afirma exclusividade.

---

## Checagens do texto de tela (3ª rodada, feita pela sessão principal)

### 14. Telas de apoio: famílias, mapa e linha do tempo
- **Árvores "semíticas: acadiano, hebraico, árabe" e "indo-europeias: latim, português, grego, inglês".** **Confirmado.**
  - Wikipedia, *Semitic languages* (https://en.wikipedia.org/wiki/Semitic_languages): "They include Arabic, Amharic, Tigrinya, Tigre, Aramaic, Hebrew, Maltese"; "the earliest attested being the East Semitic Akkadian of Mesopotamia".
  - Wikipedia, *Akkadian language* (https://en.wikipedia.org/wiki/Akkadian_language): "Akkadian is a Semitic language of the East Semitic branch."
  - Wikipedia, *Indo-European languages* (https://en.wikipedia.org/wiki/Indo-European_languages): Germanic "Includes English…"; "English, French, Portuguese"; "Sanskrit, Latin, and Greek"; "Mycenaean Greek".
  - Classificação consensual. Wikipedia usada como fonte suficiente para fato de manual; a Britannica deu 403.
- **Mapa esquemático (Uruk no sul da Mesopotâmia, perto do Eufrates; Tigre, Eufrates, Golfo Pérsico; hoje Iraque).** **Confirmado como esquema.** O desenho é aproximado e não tem escala.
  - Wikipedia, *Uruk* (https://en.wikipedia.org/wiki/Uruk): "located east of the current bed of the Euphrates River, on an ancient, now-dried channel … Muthanna Governorate, Iraq"; "The original city of Uruk was situated southwest of the ancient Euphrates River"; "In Uruk, in southern Mesopotamia…"; "Eanna during period IVa contains the earliest examples of writing."
- **Faixa "acadiano (esquema)" na linha do tempo, de c. 2600 a.C. até c. 100 d.C.** **Confirmado.**
  - Wikipedia, *Akkadian language*: Era "c. 2600–500 BC; academic or liturgical use until AD 100"; "The last known Akkadian cuneiform document dates from the 1st century AD."
- **Selos cilíndricos e cunhas decorativas** (faixa de selo rolando, cunhas da tela do cálamo e da palavra "cuneiforme"): são **grafismos sem leitura**, desenhados em SVG próprio. Não representam nenhum sinal real e não afirmam nada.
- **Marcas numéricas na tela "para fazer contas"**: esquema de impressões redondas e em forma de cunha larga, típicas das tabuinhas numéricas, **sem leitura** (item 2: "Most Proto-Cuneiform records … were of an accounting nature").

### 15. Formas transliteradas usadas na tela
- lu₂, gal, lugal, e₂, e₂-gal, lugal-e, e₂, mu-du₃, i₃-im-ĝen, dingir, an, ᵈen-lil₂: ver itens 4, 5 e 11.
- Acadiano na lista bilíngue: šarrum, ekallum, ilum (com mimação, as três coerentes): ver item 10.
- "dingir" é a transliteração tradicional; as fontes atuais escrevem diŋir/diĝir (item 4). Mantive "dingir" porque é a forma pedida e a mais reconhecível.
