import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnSign, GlyphSign } from "../components/Cuneiform";
import { Body, Center, clamp, easeOut, Rise, SealBand, Sux, Tablet, Title } from "../components/ui";
import { C, FONT_BODY, FONT_TITLE } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

// 22. Duas línguas lado a lado
export const Akkadian: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const sep = interpolate(f, [0, 30], [0, 1], { ...clamp, easing: easeOut });
  const col = (title: string, sub: string, color: string, side: number) => (
    <div style={{ width: 380, textAlign: "center", translate: `${side * (1 - sep) * 80}px 0px`, opacity: sep }}>
      <Title size={84} color={color}>
        {title}
      </Title>
      <Body size={38} style={{ marginTop: 10 }}>
        {sub}
      </Body>
    </div>
  );
  return (
    <AbsoluteFill>
      <Center top={260}>
        <Rise at={0}>
          <Body size={44} color={C.argilaClara} style={{ fontWeight: 650 }}>
            lado a lado na Mesopotâmia
          </Body>
        </Rise>
      </Center>
      <div style={{ position: "absolute", top: 480, left: 80, width: 850, display: "flex", justifyContent: "space-between" }}>
        {col("sumério", "isolada", C.ouro, -1)}
        {col("acadiano", "semítica", C.ocre, 1)}
      </div>
      <SealBand y={760} at={10} dur={70} seed="akk" />
    </AbsoluteFill>
  );
};

// Linha do tempo compartilhada pelas telas 23 e 24 (3300 a.C. → 0)
const T0 = -3300;
const T1 = 100;
const X0 = 110;
const X1 = 900;
const tx = (yr: number) => X0 + ((yr - T0) / (T1 - T0)) * (X1 - X0);

const Timeline: React.FC<{ spokenP: number; scholarP: number }> = ({ spokenP, scholarP }) => {
  const endSpoken = tx(-1900); // faixa 2000–1800 a.C.
  return (
    <svg width={1080} height={700} style={{ position: "absolute", top: 420 }}>
      <line x1={X0} x2={X1} y1={300} y2={300} stroke={C.argilaClara} strokeOpacity={0.4} strokeWidth={3} />
      {[-3000, -2000, -1000, 0].map((y) => (
        <g key={y}>
          <line x1={tx(y)} x2={tx(y)} y1={288} y2={312} stroke={C.argilaClara} strokeOpacity={0.6} strokeWidth={3} />
          <text x={tx(y)} y={360} textAnchor="middle" fill={C.argilaClara} fontFamily={FONT_BODY} fontSize={34} fontWeight={600}>
            {y === 0 ? "0" : `${-y} a.C.`}
          </text>
        </g>
      ))}
      {/* faixa de incerteza do fim da fala: 2000–1800 a.C. */}
      <rect x={tx(-2000)} y={170} width={tx(-1800) - tx(-2000)} height={150} fill={C.terracota} opacity={0.35 * spokenP} />
      {/* sumério falado */}
      <rect x={X0} y={200} width={(endSpoken - X0) * spokenP} height={34} rx={17} fill={C.ouro} />
      <text x={X0} y={180} fill={C.ouro} fontFamily={FONT_BODY} fontSize={34} fontWeight={700} opacity={spokenP}>
        falado
      </text>
      {/* culto e escola: até o fim do 1º milênio a.C. */}
      <line
        x1={endSpoken}
        x2={endSpoken + (tx(-50) - endSpoken) * scholarP}
        y1={217}
        y2={217}
        stroke={C.ouro}
        strokeWidth={10}
        strokeDasharray="4 16"
        strokeLinecap="round"
      />
      <text x={tx(-1700)} y={180} fill={C.osso} fontFamily={FONT_BODY} fontSize={34} fontWeight={700} opacity={scholarP}>
        culto e escola
      </text>
      {/* acadiano */}
      <rect x={tx(-2600)} y={420} width={(tx(100) - tx(-2600)) * Math.max(spokenP, scholarP)} height={20} rx={10} fill={C.ocre} opacity={0.75} />
      <text x={tx(-2600)} y={480} fill={C.ocre} fontFamily={FONT_BODY} fontSize={30} fontWeight={600}>
        acadiano (esquema)
      </text>
    </svg>
  );
};

// 23. "por volta de 2000 a 1800 a.C., deixou de ser falado"
export const TimelineSpoken: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 60], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const deixou = wordFrame("acadiano", 20, from);
  return (
    <AbsoluteFill>
      <Center top={210}>
        <Rise at={0}>
          <Title size={100}>c. 2000–1800 a.C.</Title>
        </Rise>
        <div style={{ opacity: interpolate(f, [deixou - 6, deixou + 6], [0, 1], clamp) }}>
          <Body size={46} color={C.terracotaViva} style={{ fontWeight: 700, marginTop: 10 }}>
            ninguém mais o fala em casa
          </Body>
        </div>
      </Center>
      <Timeline spokenP={p} scholarP={0} />
    </AbsoluteFill>
  );
};

// 24. "mas seguiu por quase dois mil anos"
export const TimelineScholarly: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Center top={210}>
        <Rise at={0}>
          <Title size={96}>quase 2 mil anos</Title>
        </Rise>
        <Rise at={10}>
          <Body size={46} style={{ marginTop: 10 }}>
            de templo e de escola
          </Body>
        </Rise>
      </Center>
      <Timeline spokenP={1} scholarP={p} />
    </AbsoluteFill>
  );
};

// 25. Como o latim na Europa
export const Latin: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={300}>
      <Rise at={0}>
        <Title size={120} color={C.ouro}>
          sumério
        </Title>
      </Rise>
      <Rise at={6}>
        <Body size={44} style={{ margin: "14px 0 40px" }}>
          na Mesopotâmia
        </Body>
      </Rise>
      <Rise at={14}>
        <Title size={80} color={C.argilaClara}>
          como o
        </Title>
      </Rise>
      <Rise at={20}>
        <Title size={120} color={C.osso} style={{ marginTop: 20 }}>
          latim
        </Title>
      </Rise>
      <Rise at={26}>
        <Body size={44} style={{ marginTop: 14 }}>
          na Europa
        </Body>
      </Rise>
    </Center>
  </AbsoluteFill>
);

// 26. Lista lexical bilíngue (esquemática): sumério | acadiano
const ROWS: { sign: "LUGAL" | "E2" | "AN"; sux: string; akk: string }[] = [
  { sign: "LUGAL", sux: "lugal", akk: "šarrum" },
  { sign: "E2", sux: "e₂-gal", akk: "ekallum" },
  { sign: "AN", sux: "dingir", akk: "ilum" },
];
export const LexicalList: React.FC<SceneProps> = () => {
  return (
    <AbsoluteFill>
      <Center top={150}>
        <Rise at={0}>
          <Title size={84}>listas bilíngues</Title>
        </Rise>
      </Center>
      <Center top={330}>
        <Tablet w={820} h={700} seed={91}>
          <div style={{ position: "absolute", inset: "50px 50px", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, color: "#3a2414", opacity: 0.85, padding: "0 20px" }}>
              <span>sumério</span>
              <span>acadiano</span>
            </div>
            {ROWS.map((r, i) => (
              <Rise key={r.sux} at={10 + i * 14}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "4px solid rgba(70,45,25,0.5)", paddingTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ width: 170, display: "flex", justifyContent: "center" }}>
                      <GlyphSign name={r.sign} height={r.sign === "LUGAL" ? 62 : 90} start={12 + i * 14} perWedge={3} />
                    </div>
                    <Sux size={60} color="#2a1608">
                      {r.sux}
                    </Sux>
                  </div>
                  <Sux size={60} color={C.lapisProfundo}>
                    {r.akk}
                  </Sux>
                </div>
              </Rise>
            ))}
          </div>
        </Tablet>
      </Center>
    </AbsoluteFill>
  );
};

// 27. Feitas pelos próprios escribas: um selo rola, assinando a tabuinha.
export const Scribes: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={300}>
      <Rise at={0}>
        <Title size={110}>feitas pelos escribas</Title>
      </Rise>
      <Rise at={8}>
        <Body size={44} style={{ marginTop: 18 }}>
          um dicionário em argila
        </Body>
      </Rise>
    </Center>
    <SealBand y={720} at={0} dur={55} seed="scribes" />
  </AbsoluteFill>
);

// 28. Chamada: qual palavra suméria você quer ver gravada?
export const Cta: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Center top={200}>
        <Rise at={0}>
          <Title size={100}>qual palavra suméria você quer ver gravada?</Title>
        </Rise>
      </Center>
      <Center top={620}>
        <Tablet w={600} h={380} seed={101}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_TITLE,
              fontSize: 200,
              color: "#3a2414",
              opacity: 0.35 + 0.35 * Math.abs(Math.sin(f / 10)),
            }}
          >
            ?
          </div>
        </Tablet>
      </Center>
    </AbsoluteFill>
  );
};

// 29. Comente e siga
export const CtaFollow: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const bounce = Math.abs(Math.sin(f / 9)) * 12;
  return (
    <AbsoluteFill>
      <Center top={180}>
        <Tablet w={520} h={480} seed={111}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnSign size={320} start={2} gap={7} />
          </div>
        </Tablet>
      </Center>
      <Center top={760}>
        <Rise at={10}>
          <Title size={104}>comente</Title>
        </Rise>
        <Rise at={18}>
          <Title size={104} color={C.ouro}>
            e siga
          </Title>
        </Rise>
        <Rise at={26}>
          <Body size={42} style={{ marginTop: 12, translate: `0px ${bounce}px` }}>
            a próxima tabuinha vem aí
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};
