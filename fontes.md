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

### 16. Grafias fonéticas usadas na narração (2ª sessão)
- Grafias enviadas à voz (convenção, ver item 9; a tela mostra a transliteração correta): Lú (lu₂), Gáll (gal), Lúgall (lugal), É (e₂), É-gall (e₂-gal), Lúgall-ê (lugal-e), Dín-guir (dingir), Án (an), Úruk (Uruk).
- O "ll" duplo serve para impedir a vocalização do l final do pt-BR ("gal" → "gau"). "Dín-guir" com hífen e maiúscula garante g duro ("dinguir", e não "jinguir"). As duas coisas foram conferidas com transcrição automática (faster-whisper `medium`): `video/public/audio/voz/pronuncia-whisper.json`.

---

## 4ª rodada: curiosidades e linhas reais (2026-10-15)

Fio narrativo: "Como conseguimos ler uma língua que não tem parentes?". Para cada curiosidade candidata, o item abaixo traz a frase como pode aparecer no vídeo, o veredito, a fonte, a citação e a página. As fontes foram baixadas nesta rodada (curl ou WebFetch) e o texto foi extraído e lido.

### Fontes novas desta rodada
- **Wagensonner, K. "Lu₂ A Again!"**, *Cuneiform Digital Library Notes* 2014:15 (CC BY 4.0): https://cdli.earth/articles/cdln/2014-15
- **Marsal, E. "The beginnings of Sumerology (I)"**, *Aula Orientalis* 32/2 (2014), p. 283–297: https://www.ub.edu/ipoa/wp-content/uploads/2021/08/20142AuOrMarsal.pdf
- **ETCSL**, Proverbs: collection 2 + 6 (t.6.1.02 / c.6.1.02): https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=t.6.1.02 e https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.6.1.02
- **ETCSL**, "The advice of a supervisor to a younger scribe (E-dub-ba-a C)" (t.5.1.3 / c.5.1.3): https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=t.5.1.3
- **CDLI**: páginas e ATF via API JSON (`https://cdli.earth/artifacts/<id>` com `Accept: application/json`); página "About": https://cdli.earth/about
- **Black, J. e Zólyomi, G. "The study of diachronic and synchronic variation in Sumerian"** (ETCSL): https://etcsl.orinst.ox.ac.uk/edition2/pdf/diachronsum.pdf. Só para conferir o emesal; não foi citado abaixo.
- Jagersma 2010 e Zólyomi 2017: os mesmos PDFs das rodadas anteriores. A nova tentativa de baixar Jagersma em 15/10 caiu numa página anti-robô, então usei a cópia baixada nesta mesma sessão em 14/10 (776 p.).

### Não funcionaram ou não serviram
- British Museum, blog "A library fit for a king" (https://www.britishmuseum.org/blog/library-fit-king): HTTP 403 no curl e no WebFetch. Por isso, **o texto do museu sobre o incêndio de Nínive não foi lido**.
- Cooper, "Sumer, Sumerisch" (RlA, krieger2.jhu.edu): bloqueado pelo Cloudflare.
- Sauer, "Archaische Keilschriftlisten" (5300jahreschrift.materiale-textkulturen.de): falhou a verificação TLS. Não desativei a verificação.
- Veldhuis, *History of the Cuneiform Lexical Tradition* (GMTR 6, 2014): não achei versão em acesso aberto.
- Englund, "Texts from the Late Uruk Period" (OBO 160/1) e Nissen, Damerow e Englund, *Archaic Bookkeeping* (1993): não achei on-line.
- A busca simples do CDLI por palavra-chave ignora o filtro. Funcionam `designation=`, `museum_no=` e `atf_transliteration=` (+ `genre=`). A paginação (`page=`) devolveu resposta vazia.

### 17. Listas lexicais desde o começo da escrita
- **Frase sugerida:** "Já nas primeiras tabuinhas há listas de palavras, copiadas por mais de mil anos."
- **Veredito:** **confirmado, com ajuste.** Diga "listas de palavras" ou "listas de títulos e profissões", e não "dicionários": as listas arcaicas são monolíngues. As bilíngues (sumério–acadiano) vêm muito depois (ver itens 8 e 10).
- **Fontes e evidências:**
  - Hawkins 2019 (Unicode L2/19-284), p. 4: "the nearly 4900 texts from the Uruk III period, including Jemdat Nasr. Of these texts, 703 are lexical texts and 4167 are administrative".
  - Wagensonner, CDLN 2014:15: "The Early Dynastic list of professions Lu₂ A with its archaic roots in Uruk is one of the most popular compilations of the 3rd millennium BC and was still copied faithfully in the first half of the 2nd millennium BC." Ele acrescenta que essas listas antigas "were copied and studied; the latter aspect is quite apparent in the Old Babylonian period when pronunciation glosses are being added to the various entries of archaic lists."
  - CDLI P000006 (VAT 15003, "CDLI Lexical 000002, ex. 173"): o catálogo data a tabuinha no período **Uruk IV (ca. 3350–3200 a.C.)**, com proveniência Uruk e gênero "Lexical". É uma lista de títulos alinhada ao composto Archaic Lu₂ A (P464118). https://cdli.earth/artifacts/6
- **Cálculo:** de Uruk III (ca. 3200–3000 a.C.) até a 1ª metade do 2º milênio a.C. são mais de mil anos. "Mais de mil anos" é seguro.
- **Encaixe no fio:** bom. Mostra que os escribas faziam listas desde o começo, e essa tradição é que depois gerou as listas bilíngues.

### 18. "Houve quem duvidasse que o sumério fosse uma língua de verdade" (Halévy)
- **Frase sugerida:** "No século XIX, houve quem jurasse que o sumério era só um código de sacerdotes."
- **Veredito:** **confirmado.**
- **Fontes e evidências:**
  - Marsal 2014, *Aula Orientalis* 32/2, p. 284, nota 10: "The French Orientalist Joseph Halévy (1827-1917) wrote ferociously against the existence of Sumerian as a real language. Muss-Arnoldt in 1894 wrote: 'For upwards of twenty years Oppert has fought for the reality of this Akkadian language against Joseph Halévy, who maintained that it was only a system of cryptography invented by the Babylonian priests and scribes.'" Na época, "Akkadian" era o nome que se dava ao sumério (p. 284).
  - Marsal 2014, p. 290: Weissbach, em *Zur Lösung der sumerischen Frage* (1897), "largely proved the inconsistencies of Halévy's arguments". Em *Die sumerische Frage* (1898) ele insistiu "on the existence of the Eme-sal dialect as the main evidence for the existence of Sumerian. With the publication of these important works, the reality of a Sumerian language was proved definitively".
  - Jagersma e Zólyomi não mencionam Halévy (procurei nos dois PDFs).
- **Encaixe no fio:** excelente. A primeira dúvida dos estudiosos foi se a língua sequer existia.

### 19. Emesal
- **Frase sugerida:** "O emesal, dialeto da fala de deusas, virou prova de que o sumério era real." Variante sem a ligação com Halévy: "Havia até um dialeto especial, o emesal, usado na fala de deusas e em lamentos."
- **Veredito:** **confirmado, com nuance.** Não diga "a língua das mulheres", sem ressalva. Ser um dialeto feminino é hipótese (Zólyomi: "supposed to be"). O que está atestado é o uso nos textos de sacerdotes lamentadores e na fala direta de deusas. "eme-sal" significa provavelmente "língua fina".
- **Fontes e evidências:**
  - Jagersma 2010, p. 8: "Emesal. This is the Sumerian name (eme-sal 'thin tongue') of a dialect documented in certain literary and cultic texts dating from the Old Babylonian period or later. Some texts are fully in Emesal, among them the texts used by lamentation priests. Other texts display a shift between Emesal and standard Sumerian sections. In such texts, it is primarily the direct speech of goddesses that is in Emesal." Ainda na p. 8: "Emesal is rooted in actually spoken language."
  - Zólyomi 2017, p. 19–20: "a sociolect known under the Sumerian term eme–sal (meaning probably 'fine tongue') … it is supposed to be a form of spoken Sumerian, specifically a women's dialect. By the early 2nd millennium … the eme–sal dialect had already become restricted to certain religious and poetic genres and contexts, also including the literary representation of women's speech."
  - Marsal 2014, p. 290: Weissbach (1898) usou o emesal como "the main evidence for the existence of Sumerian" (ver item 18).
- **Exemplos para a tela (Jagersma, p. 8):** emesal **me-e** = padrão **ĝe₂₆** "eu"; emesal **mu** = padrão **ĝiš** "madeira"; emesal **zé-eb** = padrão **du₁₀.g** "doce".
- **Encaixe no fio:** bom, sobretudo junto com o item 18.

### 20. Kushim, "o primeiro nome próprio escrito"
- **Veredito:** **EXCLUÍDO.**
- **Motivos:**
  1. Não se sabe se KU.ŠIM é nome de pessoa, título de cargo ou instituição. A Wikipedia (*Kushim (Uruk period)*, só como corroboração) diz: "It is uncertain if the name refers to an individual, a generic title of an officeholder, or an institution". Ela atribui a dúvida a Nissen, Damerow e Englund, *Archaic Bookkeeping* (1993), p. 36, livro que não consegui consultar.
  2. O rótulo "primeiro nome" vem de divulgação: Harari, *Sapiens*, e National Geographic, segundo a mesma página.
  3. Não ajuda a responder à pergunta do vídeo.
- **Dado conferido:** o catálogo do CDLI registra o tablete MS 1717 = P005340 (MSVO 3, 29), Uruk III, com ATF "(KU~b1 SZIM~a)a SZAM2" e a tradução "5617 1/5 N1's, exchange barley, 37 months, Kushim's final account" (https://cdli.earth/artifacts/5340). Ou seja, o CDLI trata Kushim como nome, mas a dúvida persiste na literatura.
- **Se ainda assim for usar:** "Kushim, talvez um dos nomes de pessoa mais antigos já escritos." Nunca "o primeiro".

### 21. Carta de reclamação a Ea-nasir
- **Veredito:** **EXCLUÍDO.** A carta é **acadiana** (paleobabilônica), não suméria.
- **Fonte:** CDLI P414985 = UET 5, 81, British Museum **BM 131236**. Período "Old Babylonian (ca. 1900-1600 BC)", proveniência "Ur (mod. Tell Muqayyar)", língua "Akkadian", ATF `#atf: lang akk`. O texto começa assim: "a-na e2-a-na-s,i-ir / qi2-bi2-ma / um-ma na-an-ni-ma" ("Diga a Ea-nāṣir: assim (fala) Nanni"). https://cdli.earth/artifacts/414985

### 22. A escola (é-dub-ba-a) e "sem sumério você não é humano de verdade"
- **Frases sugeridas:**
  - "Na escola, a 'casa da tabuinha', alunos copiavam sumério séculos depois de ele morrer."
  - Provérbio escolar, citação literal: "Um escriba que não sabe sumério, que escriba é esse?"
  - Provérbio que encaixa melhor no fio: "Escriba que não sabe sumério: de onde vai tirar a tradução?"
- **Veredito:** **confirmado, com ajuste.** "Without Sumerian you are no true human" é o **título do texto de divulgação de Fink**, uma paráfrase dele, e **não** a citação de um texto antigo. Fink diz que o lema "is actually a quotation from a proverb collection" e se refere à frase "A scribe who does not know Sumerian, what kind of scribe is he?". A ideia do "verdadeiro ser humano" é a interpretação dele do termo nam-lu₂-ulu₃ ("humanidade"). Não use "sem sumério você não é humano" como citação antiga.
- **Fontes e evidências:**
  - Fink (Helsinki, 31/03/2021): "A scribe who does not know Sumerian, what kind of scribe is he? The motto of this text is actually a quotation from a proverb collection"; "one could only become a true member of humanity nam.lú.ùlu through the study of Sumerian. This is expressed in numerous proverbs and school texts".
  - ETCSL, Proverbs: collection 2 + 6 (t.6.1.02), provérbio 2.47 (linha 80): "What kind of a scribe is a scribe who does not know Sumerian?" Em sumério (c.6.1.02): "dub-sar eme-gir15 nu-mu-un-zu-a a-na-am3 nam-dub-sar-ra-ni".
  - Mesma coleção, 2.49 (linha 82): "A scribe who does not know Sumerian -- from where will he produce a translation?" Em sumério: "dub-sar eme-gir15 nu-mu-un-zu-a inim bal-e me-da he2-en-tum3".
  - É-dub-ba-a = "escola": o título ETCSL "The advice of a supervisor to a younger scribe (E-dub-ba-a C)", linha 1: "dumu e2-dub-ba-a …" = "One-time member of the school". O literal "casa da(s) tabuinha(s)" vem de é "casa" (Jagersma p. 48) + dub "tabuinha, documento" (Jagersma, ex. 126: "dub … tablet").
  - Jagersma 2010, p. 6: no período paleobabilônico, "Akkadian had become the primary language of the scribes. That we have all these wonderful literary and lexical texts is only thanks to their efforts to learn proper Sumerian. They are the products of a scribal education".
- **Encaixe no fio:** muito bom. Foi a escola que manteve o sumério legível, e o provérbio 2.49 fala justamente de tradução.

### 23. Quantas tabuinhas cuneiformes existem
- **Frase sugerida:** "Estima-se que haja mais de meio milhão de objetos com escrita cuneiforme."
- **Veredito:** **confirmado como estimativa.** Não diga "tabuinhas sumérias": o número inclui todas as línguas escritas em cuneiforme (acadiano etc.).
- **Fonte:** CDLI, página "About" (https://cdli.earth/about): "We estimate the number of these artifacts currently kept in public and private collections to exceed 500,000 exemplars, of which now more than 360,000 have been catalogued in electronic form by the CDLI." Obs.: a mesma página traz, em outro parágrafo, "more than 400,000" catalogados. A estimativa de 500 mil é a mesma nos dois trechos.
- **Encaixe no fio:** médio. Mostra quanto material existe para estudar.

### 24. Biblioteca de Nínive: o incêndio "cozinhou" as tabuinhas
- **Veredito:** **NÃO VERIFICADO e, portanto, EXCLUÍDO.**
- **Motivos:** o texto do British Museum (blog "A library fit for a king") deu HTTP 403 e não foi lido. Não achei fonte acadêmica aberta. A Wikipedia (*Library of Ashurbanipal*), só como corroboração, é cautelosa: "It is believed that … the clay cuneiform tablets [became] partially baked". Os textos que afirmam isso com mais força são de divulgação.
- **Alternativa segura (já verificada):** "Em Nínive, foram achadas muitas tabuinhas bilíngues, chave para decifrar o sumério" (Zólyomi p. 22; Jagersma p. 10; item 8).

### 25. Curiosidades novas encontradas nas fontes
- **25a. A pronúncia vem dos escribas acadianos.**
  - Frase: "Boa parte da pronúncia do sumério só conhecemos por listas de escribas acadianos."
  - **Confirmado.** Jagersma 2010, p. 56: "Since most Sumerian stems are written with word signs, we usually know their pronunciation only thanks to lexical lists produced by Akkadian scribes." Na p. 12–13, nota 3: "The pronunciation of the word signs is only partly known: we read and transliterate them according to Akkadian word lists dating from many centuries later."
  - Wagensonner (CDLN 2014:15): no período paleobabilônico, "pronunciation glosses are being added to the various entries of archaic lists".
  - **Encaixe:** central. É a resposta direta à pergunta do gancho.
- **25b. Tabelas de conjugação bilíngues.**
  - Frase: "Escribas babilônios montaram tabelas de verbos sumérios com tradução em acadiano."
  - **Confirmado.** Zólyomi 2017, p. 20: "The appearance of the long, sophisticatedly organised Akkadian–Sumerian verbal paradigms, the so called Old Babylonian Grammatical Texts (Black 1991), which analyse Sumerian in terms of Akkadian categories, also imply the second language status of Sumerian."
  - **Encaixe:** muito bom. Pode vir logo antes das listas bilíngues do final.
  - Evitar "a primeira gramática do mundo": não há fonte para isso.
- **25c.** O provérbio 2.49 ("de onde vai tirar a tradução?") e a ligação Halévy → emesal → prova (itens 18, 19 e 22).

### 26. Linhas cuneiformes reais para a tela
- **Arquivo:** `video/src/data/linhas-cuneiformes.json`.
  - Cada sinal foi mapeado ao nome na OSL do ORACC (`@sign`, `@v`, `@list U+…`/`@ucun`).
  - Cada código Unicode foi conferido com Python `unicodedata`, Unicode 15.1.0. O nome `@uname` da OSL coincide com o do Python em todos os casos.
  - Script gerador (fora do repositório): scratchpad `bin/gerar_linhas.py`.

| Linha | Objeto | CDLI | ATF | Sinais (OSL → Unicode) |
|---|---|---|---|---|
| Gudea, Cil. A **22:9** | Louvre **MNB 1512**, Lagash II (ca. 2200–2100 a.C.), Girsu | P232300 (composto P431881) | `ensi2-ke4 e2 mu-du3 mu-mu2` | ensi₂ = \|PA.TE.SI\| (U+1227A U+122FC U+122DB), ke₄ = KID U+121A4, e₂ = E2 U+1208D, mu = MU U+1222C, du₃ = KAK U+12195, mu = MU, mu₂ = SAR U+122AC |
| Enmetena 1 (RIME 1.09.05.01), col. 1, 1–2 | Louvre **AO 3004** (cone, ex. 01), ED IIIb (ca. 2500–2340 a.C.), Girsu | P222532 (composto P431117) | `{d}en-lil2` / `lugal kur-kur-ra` | ᵈ = AN U+1202D, en = EN U+12097, lil₂ = KID U+121A4, lugal = LUGAL U+12217, kur = KUR U+121B3 (×2), ra = RA U+1228F |
| Lista lexical arcaica (Lu₂ A), anv. col. 1, 4 | Berlim **VAT 15003**, **Uruk IV** (ca. 3350–3200 a.C.), Uruk | P000006 (composto P464118) | `1(N01) , NAM2 NAM2` | NAM₂ U+12247 (×2). **1(N01) não mapeado**: é o marcador de entrada proto-cuneiforme, que não tem código Unicode exato |
| Lista bilíngue Lu = ša, tab. 1, anv. col. 1, 41 | Berlim **VAT 10216**, neoassírio (ca. 911–612 a.C.) | P373780 (MSL 12, 91 A) | `lugal = %a szar-ru` | lugal = LUGAL U+12217; šar = SAR U+122AC; ru = RU U+12292 |

- **Traduções (CDLI, composto):**
  - Gudea 22:9: "The governor built the house, he made it grow". Em pt: "O governante construiu a casa (o templo) e a fez crescer". Zólyomi (p. 41) cita só "ensi₂-ke₄ e₂ mu-du₃", "The ruler has built the temple". A linha do CDLI confirma o número **22:9** e continua com "mu-mu2".
  - Enmetena: "Enlil, king of all the lands". Em pt: "Enlil, rei de todas as terras".
- **Ressalvas:**
  - (a) A linha de Uruk IV é proto-cuneiforme: os sinais eram desenhados. O glifo da Noto Sans Cuneiform mostra a forma posterior. Não traduza "NAM₂ NAM₂" na tela, porque o sentido exato não está nas fontes consultadas; use só "uma entrada de lista de títulos e profissões, c. 3300 a.C.".
  - (b) A proveniência de VAT 10216 não está registrada no CDLI; não afirme o local de achado.
  - (c) Para lugal = šarru, a tabuinha VAT 10216 é uma prova direta do CDLI, além da citação de Sb I 331 no CAD (item 10).

---

## 5ª rodada: mapas reais, fotos de acervo, linhas cuneiformes e roteiro final (2026-10-15)

### 27. Mapa real (telas "Sumério" e "tabuinhas de Nínive")
- **Dados vetoriais:** Natural Earth 1:10m, domínio público (naturalearthdata.com, baixado de naciscdn.org): costa, `rivers_lake_centerlines`, lagos e `admin_0_countries`, recortados para 38–52°E / 27–38,5°N → `video/src/data/geo/*.json`. Rios principais conferidos pelo nome nos atributos do próprio arquivo: Tigris/Dicle, Euphrates/Firat/Al Furat, Shatt al-Arab.
- **Relevo:** Natural Earth NE1_HR_LC_SR_W (domínio público), equiretangular, 60 px/grau → `video/public/img/relevo.jpg`. Vetores e relevo passam pela mesma transformação afim (cilíndrica equidistante, paralelo padrão 31,5°N): o alinhamento é exato por construção.
- **Sítios:** gazetteer Pleiades (pleiades.stoa.org): Uruk 912986, Ur 912985, Nippur 912910, Eridu 912845, Lagash 959120263, Girsu 912855, Nínive 874621, Babilônia 893951 → `video/src/data/geo/sitios.json`.
- **Verificação externa** (`video/scripts/verificar-mapa.py`, resultado em `video/src/data/geo/verificacao-mapa.json`): coordenadas do Pleiades comparadas com o Wikidata (P625). Os 8 sítios ficam a no máximo 0,011° (Girsu); o limite pedido é 0,1°. Ur (Q5699) e Nínive (Q5680) foram fixados pelo ID porque a busca por nome era ambígua: Nínive voltava como a província moderna. Q5680 é o ID citado na página "Nineveh" da Wikipédia, cuja coordenada (36,35944; 43,15278) também bate.
- **Época:** o mapa mostra a **geografia de hoje** e está rotulado "Iraque, hoje". Não desenhamos a costa antiga porque a melhor fonte aberta não a traça para 3000 a.C. Giosan, L. & Goodman, R. (2025), "Morphodynamic Foundations of Sumer", *PLOS ONE* 20(8): e0329084, CC BY 4.0, https://doi.org/10.1371/journal.pone.0329084, diz que Uruk e cidades vizinhas "developed close to the sea, but their precise proximity to the ancient coast remains unclear". A fonte não traz shapefile, e traçar a figura à mão seria apresentar um palpite como se fosse dado.

### 28. Fotos de objetos reais (Met Open Access, CC0)
Licença reconferida pela API do Met em 2026-10-15 (`isPublicDomain: true`). Os recortes de fundo foram feitos com `video/scripts/recortar-fotos.py` e os metadados estão em `video/src/data/imagens.json`.
| Tela | Objeto | Nº de acesso | Data (Met) | URL |
|---|---|---|---|---|
| gancho, "contas" | Tabuinha protocuneiforme: "administrative account of barley distribution" | 1988.433.1 | ca. 3100–2900 BCE (Jemdet Nasr) | https://www.metmuseum.org/art/collection/search/329081 |
| "e marca quem age" | Cone votivo com inscrição de Gudea (templo Eninnu para Ningirsu) | 45.90 | ca. 2090 BCE | https://www.metmuseum.org/art/collection/search/324015 |
| "antes de um nome" | Cone de fundação com inscrição de Enmetena de Lagash | 1999.190.1 | ca. 2500–2350 BCE | https://www.metmuseum.org/art/collection/search/327592 |
| chamada final | Selo cilíndrico e impressão moderna | 62.70.74 | ca. 3300–2900 BCE | https://www.metmuseum.org/art/collection/search/325479 |
- O cone de Enmetena do Met **não é** o exemplar cuja linha aparece na tela seguinte (Louvre AO 3004). As duas etiquetas dizem objeto e museu separadamente.
- O rótulo "Tabuinha suméria" segue o campo `culture: Sumerian` do Met. Se a língua das tabuinhas mais antigas é suméria ainda é discutido (item 2); a narração não afirma isso.

### 29. Linhas cuneiformes reais: verificação sinal a sinal
- **Script:** `video/scripts/verificar-cuneiforme.py`, que lê `video/src/data/linhas-cuneiformes.json` e a OSL do ORACC (`00lib/osl.asl`, github.com/oracc/ogsl).
- **Resultado:** **19 de 19 sinais conferidos, 0 falhas.** Para cada valor transliterado, o sinal da OSL com esse `@v` tem exatamente os caracteres (`@ucun`) e o nome Unicode (`@uname`) desenhados no vídeo. ensi₂ é o composto |PA.TE.SI|, conferido pela sequência dos componentes. A sequência de valores de cada linha reproduz o ATF do CDLI.
- **Exceção declarada:** `1(N01)`, o marcador numérico protocuneiforme da lista de Uruk IV (VAT 15003), não tem código Unicode. É desenhado como uma impressão simples e rotulado "1".
- **Linhas usadas:**
  - Cilindro A de Gudea 22:9 (Louvre MNB 1512, CDLI P232300);
  - Enmetena 1, col. 1, l. 1–2 (Louvre AO 3004, P222532);
  - lista arcaica, Uruk IV, anv. col. 1, l. 4 (Berlim VAT 15003, P000006);
  - lista bilíngue "Lu = ša", anv. col. 1, l. 41 (Berlim VAT 10216, P373780).
  Detalhes no item 26.
- Os glifos são os da Noto Sans Cuneiform, extraídos pelo código (`video/scripts/extract-glyphs.py`, que confere o nome Unicode de cada um).

### 30. Tela "boa parte da pronúncia": entrada real de lista com pronúncia
- A tela mostra "pronúncia lu-gal | sinal 𒈗 | acadiano šar-ru", que é a entrada do Silabário B (Sb I 331) citada no CAD Š/2, p. 76: "lu-gal LUGAL = šar-ru" (item 10).
- A frase falada, "Boa parte da pronúncia do sumério só conhecemos por elas", vem de Jagersma 2010, p. 56: "we usually know their pronunciation only thanks to lexical lists produced by Akkadian scribes" (item 25a).

### 31. Roteiro final, frase por frase × fonte
| Frase (narração) | Item |
|---|---|
| Uma das línguas escritas mais antigas do mundo não tem nenhum parente vivo. | 1 |
| Então como é que a gente consegue ler? | pergunta-fio (respondida pelos itens 8, 25a) |
| É o sumério, do sul da Mesopotâmia, atual Iraque. | 2, 14, 27 |
| Em Uruk, por volta de 3300 a 3200 antes de Cristo, surge a escrita. | 2 (Hawkins: Uruk IV ca. 3350–3200) |
| Para quê? Contas. Esta tabuinha registra cevada. | 2 (Jagersma p. 2); 28 (Met 1988.433.1, "barley distribution") |
| E, desde o começo, listas de palavras, copiadas por mais de mil anos. | 17 |
| Só que o sumério é isolado. Não é semítico, como o acadiano. Nem indo-europeu, como o português. | 1, 14 |
| Sem parentes, não há com quem comparar. | consequência do item 1: sem línguas aparentadas, não há o que comparar. É inferência, não citação. |
| E ele junta pedaços: lu₂, homem, mais gal, grande: lugal, o rei. | 3, 4 |
| E marca quem age. Numa inscrição de Gudea, "o governante construiu o templo": o governante leva a marca. | 5 (Zólyomi p. 41, ex. 17), 26, 29 |
| Tudo em cunhas de cálamo na argila úmida. E um sinal podia ser palavra ou som. | 6, 13 |
| Este é dingir, deus. Também se lê an, que significa céu. | 4 |
| E, antes de um nome, nem se lê: só avisa que é um deus, como em Enlil. | 11, 26 |
| Por volta de 2000 a 1800 antes de Cristo, o sumério deixou de ser falado. | 7 |
| Mas virou língua de escola, como o latim na Europa. | 7 (Viano; Jagersma p. 1), 22 |
| Um provérbio de escola provoca: escriba que não sabe sumério, de onde vai tirar a tradução? | 22 (ETCSL, Provérbios 2.49) |
| Tradução: essa é a resposta. Escribas que falavam acadiano fizeram listas bilíngues. | 8, 25a |
| lugal, em acadiano, šarru: rei. | 10, 26 (VAT 10216) |
| Boa parte da pronúncia do sumério só conhecemos por elas. | 25a, 30 |
| E as tabuinhas bilíngues de Nínive ajudaram na decifração. | 8 (Zólyomi p. 22: "contributed to the decipherment"); por isso "ajudaram", e não "abriram" |
| No século XIX, teve gente jurando que o sumério era só um código de sacerdotes. | 18 (Halévy) |
| A prova contra? O emesal, um dialeto usado na fala de deusas. | 18, 19 (Marsal p. 290; Jagersma p. 8) |
| Qual palavra suméria você quer ver na argila? Comenta e segue. | chamada (sem afirmação) |

**Textos só de tela:**
- "nenhum parente vivo": item 1.
- "Iraque, hoje": item 27.
- "registro de cevada", "cone com inscrição de Gudea", "cone de fundação de Enmetena", "selo cilíndrico e sua impressão": item 28.
- "Uruk IV, c. 3350–3200 a.C.", "copiadas por mais de mil anos": item 17.
- "ensi₂-ke₄: o -e marca quem age": item 5.
- "Enlil, rei de todas as terras" e "d = deus, não se lê": itens 11 e 26.
- "ninguém mais o fala em casa": item 7 (Zólyomi p. 20, "replacement … as the vernacular").
- "Provérbios 2.49 · ETCSL": item 22.
- "a tese de Joseph Halévy": item 18.
- "Silabário B, I 331 (CAD Š/2, p. 76)": itens 10 e 30.
- Faixa "acadiano (esquema)": item 14.

**Curiosidades descartadas** (não entram no vídeo): Kushim (item 20), Ea-nasir (item 21, é carta acadiana), o incêndio de Nínive que teria "cozido" as tabuinhas (item 24, não verificado) e "sem sumério você não é humano" como citação antiga (item 22: é título de blog).
