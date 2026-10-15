import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnSign, GlyphSign } from "../components/Cuneiform";
import { LinhaCuneiforme, Procedencia } from "../components/LinhaCuneiforme";
import { MapaReal } from "../components/MapaReal";
import { ObjetoMuseu } from "../components/ObjetoMuseu";
import { Body, Center, clamp, easeOut, Rise, Sux, Tablet, Title } from "../components/ui";
import { C, FONT_BODY } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

// Aparece quando a palavra `idx` do bloco é falada.
const Na: React.FC<{ bloco: string; idx: number; from: number; children: React.ReactNode; dy?: number }> = ({ bloco, idx, from, children, dy = 24 }) => {
  const f = useCurrentFrame();
  const at = wordFrame(bloco, idx, from) - 4;
  const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  return <div style={{ opacity: p, translate: `0px ${(1 - p) * dy}px` }}>{children}</div>;
};

// ── gancho ────────────────────────────────────────────────────────────────
// Foto real (Met 1988.433.1, CC0) com aproximação rápida: o primeiro impacto.
export const HookFoto: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Center top={300}>
      <ObjetoMuseu
        arquivo="img/protocuneiforme.jpg"
        largura={640}
        movimento={{ de: { x: 0, y: 30, s: 1.28 }, para: { x: 0, y: 0, s: 1.0 } }}
        rotulo="Tabuinha suméria"
        data="c. 3100–2900 a.C."
        rotuloAt={20}
      />
    </Center>
    <Center top={170}>
      <Na bloco="gancho" idx={8} from={from}>
        <Title size={74} color={C.ouro}>
          nenhum parente vivo
        </Title>
      </Na>
    </Center>
  </AbsoluteFill>
);

export const HookPergunta: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={250}>
      <Tablet w={420} h={420} seed={5}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnSign size={280} start={0} gap={5} />
        </div>
      </Tablet>
    </Center>
    <Center top={760}>
      <Rise at={2}>
        <Title size={112}>como a gente consegue ler?</Title>
      </Rise>
    </Center>
  </AbsoluteFill>
);

// ── onde ──────────────────────────────────────────────────────────────────
// Mapa real (Natural Earth + Pleiades): visão do Tigre e do Eufrates até o Golfo,
// contorno do Iraque de hoje, aproximação no sul até Uruk quando é dito.
export const MapaUruk: React.FC<SceneProps> = ({ from }) => {
  const uruk = wordFrame("onde", 10, from);
  return (
    <AbsoluteFill>
      <Center top={140}>
        <Rise at={0}>
          <Title size={120}>Sumério</Title>
        </Rise>
      </Center>
      <Center top={320}>
        <MapaReal
          width={800}
          height={780}
          camera={[
            { at: 0, lon: 44.6, lat: 32.6, k: 78 },
            { at: Math.max(20, uruk - 22), lon: 45.4, lat: 31.9, k: 120 },
            { at: uruk + 12, lon: 45.75, lat: 31.45, k: 255 },
          ]}
          drawRiversFrom={2}
          iraque={{ at: wordFrame("onde", 7, from) - 6 }}
          sitios={[
            { nome: "Uruk", destaque: true, at: uruk - 4 },
            { nome: "Ur", at: uruk + 8 },
            { nome: "Nippur", at: uruk + 10 },
            { nome: "Eridu", at: uruk + 12, anchor: "end", dx: -16 },
          ]}
          rotuloHoje="Iraque, hoje"
        />
      </Center>
    </AbsoluteFill>
  );
};

export const ContasFoto: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Center top={150}>
      <Na bloco="onde" idx={25} from={from}>
        <Title size={120}>contas</Title>
      </Na>
    </Center>
    <Center top={340}>
      <ObjetoMuseu
        arquivo="img/protocuneiforme.jpg"
        largura={560}
        movimento={{ de: { x: 0, y: 0, s: 1 }, para: { x: -20, y: 0, s: 1.12 } }}
        rotulo="registro de cevada"
        data="c. 3100–2900 a.C."
        rotuloAt={wordFrame("onde", 28, from) - from * 0}
      />
    </Center>
  </AbsoluteFill>
);

export const ListaArcaica: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Center top={150}>
      <Rise at={0}>
        <Title size={96}>listas de palavras</Title>
      </Rise>
    </Center>
    <Center top={340}>
      <LinhaCuneiforme id="lu-a-arcaica-uruk-iv" start={6} perSign={9} alturaSinal={210} larguraMax={700} />
    </Center>
    <Center top={760}>
      <Procedencia id="lu-a-arcaica-uruk-iv" titulo="Uruk IV, c. 3350–3200 a.C." at={14} />
      <div style={{ height: 22 }} />
      <Na bloco="onde" idx={37} from={from}>
        <Body size={50} color={C.ouro} style={{ fontWeight: 680 }}>
          copiadas por mais de mil anos
        </Body>
      </Na>
    </Center>
  </AbsoluteFill>
);

// ── gramática ─────────────────────────────────────────────────────────────
export const MarcaQuemAge: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={170}>
      <Rise at={0}>
        <Title size={112}>e marca quem age</Title>
      </Rise>
    </Center>
    <Center top={470}>
      <ObjetoMuseu
        arquivo="img/cone-gudea.jpg"
        largura={680}
        rotacao={-8}
        movimento={{ de: { x: 40, y: 0, s: 1 }, para: { x: -30, y: 0, s: 1.1 } }}
        rotulo="cone com inscrição de Gudea"
        data="c. 2090 a.C."
        rotuloAt={10}
      />
    </Center>
  </AbsoluteFill>
);

export const GudeaLinha: React.FC<SceneProps> = ({ from }) => {
  const marca = wordFrame("gramatica", 25, from);
  return (
    <AbsoluteFill>
      <Center top={150}>
        <Rise at={0}>
          <Body size={52} color={C.osso} style={{ fontWeight: 650 }}>
            “o governante construiu o templo”
          </Body>
        </Rise>
      </Center>
      <Center top={300}>
        <LinhaCuneiforme id="gudea-cilA-22-9" start={4} perSign={5} alturaSinal={150} larguraMax={800} destaque={[0, 1]} destaqueAt={marca - 4} quebrarDepois={[3]} />
      </Center>
      <Center top={770}>
        <Procedencia id="gudea-cilA-22-9" titulo="Cilindro A de Gudea" at={12} />
        <div style={{ height: 18 }} />
        <Na bloco="gramatica" idx={25} from={from}>
          <Body size={48} color={C.terracotaViva} style={{ fontWeight: 720 }}>
            ensi₂-ke₄: o -e marca quem age
          </Body>
        </Na>
      </Center>
    </AbsoluteFill>
  );
};

// ── determinativo ─────────────────────────────────────────────────────────
export const ConeEnmetena: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={170}>
      <Rise at={0}>
        <Title size={104}>antes de um nome</Title>
      </Rise>
    </Center>
    <Center top={470}>
      <ObjetoMuseu
        arquivo="img/cone-enmetena.jpg"
        largura={700}
        rotacao={6}
        movimento={{ de: { x: -30, y: 0, s: 1 }, para: { x: 30, y: 0, s: 1.1 } }}
        rotulo="cone de fundação de Enmetena"
        data="c. 2500–2350 a.C."
        rotuloAt={8}
      />
    </Center>
  </AbsoluteFill>
);

export const EnlilLinha: React.FC<SceneProps> = ({ from }) => {
  const aviso = wordFrame("determinativo", 9, from);
  return (
    <AbsoluteFill>
      <Center top={160}>
        <LinhaCuneiforme id="enmetena-1-l1-2" start={2} perSign={5} alturaSinal={150} larguraMax={800} destaque={[0]} destaqueAt={Math.max(6, aviso - 4)} quebrarDepois={[2]} />
      </Center>
      <Center top={720}>
        <Body size={52} color={C.osso} style={{ fontWeight: 650 }}>
          “Enlil, rei de todas as terras”
        </Body>
        <div style={{ height: 16 }} />
        <Procedencia id="enmetena-1-l1-2" titulo="Enmetena 1" at={10} />
        <div style={{ height: 16 }} />
        <Na bloco="determinativo" idx={16} from={from}>
          <Body size={46} color={C.ouro} style={{ fontWeight: 700 }}>
            d = deus, não se lê
          </Body>
        </Na>
      </Center>
    </AbsoluteFill>
  );
};

// ── escola ────────────────────────────────────────────────────────────────
export const Proverbio: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Center top={180}>
      <Rise at={0}>
        <Body size={46} color={C.argilaClara} style={{ fontWeight: 650 }}>
          provérbio de escola
        </Body>
      </Rise>
      <Na bloco="escola" idx={30} from={from}>
        <Title size={86} style={{ marginTop: 26 }}>
          “Escriba que não sabe sumério, de onde vai tirar a tradução?”
        </Title>
      </Na>
    </Center>
    <Center top={760}>
      <Na bloco="escola" idx={34} from={from}>
        <Sux size={48} color={C.ouro}>
          dub-sar eme-gir₁₅ nu-mu-un-zu-a inim bal-e me-da he₂-en-tum₃
        </Sux>
        <Body size={44} style={{ marginTop: 14 }}>
          Provérbios 2.49 · ETCSL
        </Body>
      </Na>
    </Center>
  </AbsoluteFill>
);

// ── resposta ──────────────────────────────────────────────────────────────
export const RespostaTitulo: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={420}>
      <Rise at={0}>
        <Title size={150} color={C.ouro}>
          tradução
        </Title>
      </Rise>
      <Rise at={10}>
        <Title size={84} style={{ marginTop: 10 }}>
          é a resposta
        </Title>
      </Rise>
    </Center>
  </AbsoluteFill>
);

export const BilingueLinha: React.FC<SceneProps> = ({ from }) => {
    return (
    <AbsoluteFill>
      <Center top={150}>
        <Rise at={0}>
          <Title size={96}>listas bilíngues</Title>
        </Rise>
      </Center>
      <div style={{ position: "absolute", top: 340, left: 80, width: 850 }}>
        <Na bloco="resposta" idx={10} from={from}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_BODY, fontSize: 44, fontWeight: 650, color: C.argilaClara, padding: "0 70px" }}>
            <span>sumério</span>
            <span>acadiano</span>
          </div>
        </Na>
      </div>
      <Center top={420}>
        <LinhaCuneiforme id="lu-sha-lugal-sharru" start={wordFrame("resposta", 12, from) - 4} perSign={10} alturaSinal={170} larguraMax={800} separadorDepois={0} />
      </Center>
      <Center top={830}>
        <Na bloco="resposta" idx={16} from={from}>
          <Title size={84} color={C.ouro}>
            rei
          </Title>
        </Na>
        <Procedencia id="lu-sha-lugal-sharru" titulo="lista “Lu = ša”" at={14} />
      </Center>
    </AbsoluteFill>
  );
};

// Entrada real de lista com pronúncia: Syllabary B (Sb) I 331, "lu-gal LUGAL = šar-ru",
// citada no CAD Š/2, p. 76 — pronúncia | sinal | equivalente acadiano.
export const Pronuncia: React.FC<SceneProps> = ({ from }) => {
  const col = (cab: string, el: React.ReactNode, idx: number) => (
    <Na bloco="resposta" idx={idx} from={from}>
      <div style={{ width: 250, textAlign: "center" }}>
        <Body size={44} color={C.argilaClara} style={{ fontWeight: 650 }}>
          {cab}
        </Body>
        <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>{el}</div>
      </div>
    </Na>
  );
  return (
    <AbsoluteFill>
      <Center top={180}>
        <Rise at={0}>
          <Title size={100}>boa parte da pronúncia</Title>
        </Rise>
        <Na bloco="resposta" idx={23} from={from}>
          <Body size={52} color={C.osso} style={{ marginTop: 24, fontWeight: 650 }}>
            só conhecemos por essas listas
          </Body>
        </Na>
      </Center>
      <div style={{ position: "absolute", top: 600, left: 80, width: 850, display: "flex", justifyContent: "space-between" }}>
        {col("pronúncia", <Sux size={84}>lu-gal</Sux>, 17)}
        {col("sinal", <GlyphSign name="LUGAL" height={92} start={wordFrame("resposta", 19, from)} perWedge={3} color={C.osso} impressed={false} />, 19)}
        {col("acadiano", <Sux size={84} color={C.ocre}>šar-ru</Sux>, 21)}
      </div>
      <Center top={860}>
        <Na bloco="resposta" idx={21} from={from}>
          <Body size={44}>Silabário B, I 331 (CAD Š/2, p. 76)</Body>
        </Na>
      </Center>
    </AbsoluteFill>
  );
};

export const MapaNinive: React.FC<SceneProps> = ({ from }) => {
  const ninive = wordFrame("resposta", 32, from);
  return (
    <AbsoluteFill>
      <Center top={140}>
        <Rise at={0}>
          <Title size={96}>tabuinhas de Nínive</Title>
        </Rise>
      </Center>
      <Center top={320}>
        <MapaReal
          width={800}
          height={780}
          camera={[
            { at: 0, lon: 45.75, lat: 31.45, k: 200 },
            { at: Math.max(16, ninive + 6), lon: 44.2, lat: 34.2, k: 92 },
          ]}
          drawRiversFrom={-60}
          sitios={[
            { nome: "Uruk", at: 0 },
            { nome: "Babilônia", at: 6, anchor: "end", dx: -16 },
            { nome: "Nínive", destaque: true, at: ninive - 2 },
          ]}
          rotuloHoje="Iraque, hoje"
        />
      </Center>
    </AbsoluteFill>
  );
};

// ── final ─────────────────────────────────────────────────────────────────
export const Halevy: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Center top={250}>
      <Rise at={0}>
        <Title size={120} color={C.argilaClara}>
          século XIX
        </Title>
      </Rise>
      <Na bloco="final" idx={12} from={from}>
        <Title size={96} style={{ marginTop: 34 }}>
          “é só um código de sacerdotes”
        </Title>
      </Na>
      <Na bloco="final" idx={7} from={from}>
        <Body size={46} style={{ marginTop: 26 }}>
          a tese de Joseph Halévy
        </Body>
      </Na>
    </Center>
  </AbsoluteFill>
);

export const Emesal: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const at = wordFrame("final", 19, from);
  const p = interpolate(f, [at - 4, at + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill>
      <Center top={220}>
        <Rise at={0}>
          <Title size={96}>a prova contra?</Title>
        </Rise>
      </Center>
      <Center top={460}>
        <div style={{ scale: 0.8 + 0.2 * p, opacity: p }}>
          <Sux size={150}>emesal</Sux>
        </div>
        <Na bloco="final" idx={21} from={from}>
          <Body size={52} color={C.osso} style={{ marginTop: 20, fontWeight: 650 }}>
            um dialeto usado na fala de deusas
          </Body>
        </Na>
      </Center>
    </AbsoluteFill>
  );
};

export const CtaSelo: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={190}>
      <Rise at={0}>
        <Title size={100}>qual palavra suméria você quer ver na argila?</Title>
      </Rise>
    </Center>
    <Center top={640}>
      <ObjetoMuseu
        arquivo="img/selo-cilindrico.jpg"
        largura={720}
        movimento={{ de: { x: 30, y: 0, s: 1 }, para: { x: -30, y: 0, s: 1.08 } }}
        rotulo="selo cilíndrico e sua impressão"
        data="c. 3300–2900 a.C."
        rotuloAt={10}
      />
    </Center>
  </AbsoluteFill>
);
