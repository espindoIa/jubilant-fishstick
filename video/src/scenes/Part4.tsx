import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnSign } from "../components/Cuneiform";
import { Body, Center, clamp, Rise, Tablet, Title } from "../components/ui";
import { C, FONT_BODY } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

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
  const deixou = wordFrame("escola", 11, from);
  return (
    <AbsoluteFill>
      <Center top={210}>
        <Rise at={wordFrame("escola", 3, from) - 4}>
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

// 29. Comente e siga
export const CtaFollow: React.FC<SceneProps> = ({ from }) => {
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
        <Rise at={wordFrame("final", 37, from) - 4}>
          <Title size={104} color={C.ouro}>
            e siga
          </Title>
        </Rise>
        <Rise at={wordFrame("final", 37, from) + 20}>
          <Body size={44} style={{ marginTop: 12, translate: `0px ${bounce}px` }}>
            a próxima tabuinha vem aí
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};
