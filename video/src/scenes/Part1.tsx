import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { AnSign } from "../components/Cuneiform";
import { Body, Center, clamp, easeOut, Rise, Sux, Tablet, Title } from "../components/ui";
import { C, CONTENT_CX, FONT_BODY, FONT_TITLE } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

// 1. Gancho: o sinal AN é gravado cunha por cunha numa tabuinha, já no primeiro segundo.
export const Hook: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Center top={250}>
        <div style={{ scale: interpolate(f, [0, 95], [1.12, 1], { ...clamp, easing: easeOut }) }}>
          <Tablet w={700} h={760} seed={4}>
            <div style={{ position: "absolute", left: 110, top: 140 }}>
              <AnSign size={480} start={3} gap={9} />
            </div>
          </Tablet>
        </div>
      </Center>
      <Center top={140}>
        <Rise at={40}>
          <Body size={40} color={C.argilaClara} style={{ fontWeight: 600 }}>
            Mesopotâmia, c. 3200 a.C.
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 2. "não tem nenhum parente vivo": a árvore em volta da tabuinha fica vazia.
export const HookOrphan: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const branches = 7;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1150} style={{ position: "absolute", top: 0 }}>
        {new Array(branches).fill(0).map((_, i) => {
          const a = (-160 + (i * 140) / (branches - 1)) * (Math.PI / 180);
          const len = 360;
          const x2 = CONTENT_CX + Math.cos(a) * len;
          const y2 = 560 + Math.sin(a) * len;
          const p = interpolate(f, [i * 3, i * 3 + 18], [0, 1], { ...clamp, easing: easeOut });
          const fade = interpolate(f, [40 + i * 2, 70 + i * 2], [1, 0.12], clamp);
          return (
            <g key={i} opacity={fade}>
              <line x1={CONTENT_CX} y1={560} x2={CONTENT_CX + (x2 - CONTENT_CX) * p} y2={560 + (y2 - 560) * p} stroke={C.ocre} strokeWidth={4} strokeDasharray="10 12" />
              <circle cx={x2} cy={y2} r={30 * p} fill="none" stroke={C.ocre} strokeWidth={4} />
              <text x={x2} y={y2 + 12} textAnchor="middle" fill={C.ocre} fontFamily={FONT_TITLE} fontSize={36} opacity={p}>
                ?
              </text>
            </g>
          );
        })}
      </svg>
      <Center top={460}>
        <Tablet w={250} h={210} seed={9}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sux size={64} color={C.betume} style={{ fontStyle: "normal", fontWeight: 700 }}>
              sumério
            </Sux>
          </div>
        </Tablet>
      </Center>
      <Center top={830}>
        <Rise at={20}>
          <Title size={92}>nenhum parente vivo</Title>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 3. Mapa esquemático: sul da Mesopotâmia, rios Tigre e Eufrates, Uruk (pino na hora em que é dito).
const EUPHRATES = "M120 120 C 230 230, 250 360, 330 470 S 470 690, 560 790 S 690 900, 760 930";
const TIGRIS = "M330 60 C 400 170, 470 270, 520 390 S 640 620, 700 760 S 750 880, 760 930";
const GULF = "M700 990 C 760 940, 860 930, 930 1000 L 930 1150 L 640 1150 Z";

export const MapScene: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const urukAt = wordFrame("onde", 14, from);
  const draw = interpolate(f, [0, 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(f, [urukAt - 10, urukAt + 25], [1, 1.35], { ...clamp, easing: easeOut });
  const pin = interpolate(f, [urukAt - 4, urukAt + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  // Uruk fica no sul, junto ao Eufrates (posição esquemática)
  const ux = 520;
  const uy = 735;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 340, width: 690, height: 742, scale: zoom, transformOrigin: `${ux * 0.742}px ${(uy - 150) * 0.742}px` }}>
        <svg width={690} height={742} viewBox="0 150 930 1000">
          <defs>
            <radialGradient id="south" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={C.ocre} stopOpacity={0.45} />
              <stop offset="1" stopColor={C.ocre} stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse cx={560} cy={760} rx={300} ry={220} fill="url(#south)" opacity={interpolate(f, [20, 45], [0, 1], clamp)} />
          <path d={GULF} fill={C.lapis} opacity={0.8} />
          {[EUPHRATES, TIGRIS].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#5f86d8" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          ))}
          <text x={150} y={300} fill={C.argilaClara} fontFamily={FONT_BODY} fontSize={34} fontWeight={600} opacity={draw} transform="rotate(48 150 300)">
            Eufrates
          </text>
          <text x={520} y={250} fill={C.argilaClara} fontFamily={FONT_BODY} fontSize={34} fontWeight={600} opacity={draw} transform="rotate(58 520 250)">
            Tigre
          </text>
          <text x={705} y={1075} fill={C.osso} fontFamily={FONT_BODY} fontSize={30} fontWeight={600} opacity={draw}>
            Golfo Pérsico
          </text>
          <g opacity={pin} transform={`translate(${ux} ${uy}) scale(${pin})`}>
            <circle r={34} fill="none" stroke={C.ouro} strokeWidth={5} />
            <circle r={13} fill={C.ouro} />
            <text x={-56} y={20} textAnchor="end" fill={C.ouro} fontFamily={FONT_TITLE} fontSize={72} fontWeight={650}>
              Uruk
            </text>
          </g>
        </svg>
      </div>
      <Center top={150}>
        <Rise at={2}>
          <Title size={150}>Sumério</Title>
        </Rise>
        <Rise at={wordFrame("onde", 7, from) - 3}>
          <Body size={44} style={{ marginTop: 10 }}>
            sul da Mesopotâmia · hoje, Iraque
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 4. A data, grande, com a faixa de Uruk IV.
export const DateScene: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const writing = wordFrame("onde", 24, from);
  return (
    <AbsoluteFill>
      <Center top={300}>
        <Rise at={0}>
          <Body size={46} color={C.ocre} style={{ fontWeight: 650 }}>
            Uruk, por volta de
          </Body>
        </Rise>
        <Rise at={4} dy={40}>
          <Title size={150} color={C.osso} style={{ fontVariantNumeric: "lining-nums", whiteSpace: "nowrap" }}>
            3300–3200
          </Title>
        </Rise>
        <Rise at={10}>
          <Title size={80} color={C.argilaClara}>
            antes de Cristo
          </Title>
        </Rise>
      </Center>
      <Center top={760}>
        <div style={{ opacity: interpolate(f, [writing - 6, writing + 8], [0, 1], clamp), translate: `0px ${interpolate(f, [writing - 6, writing + 8], [30, 0], clamp)}px` }}>
          <Title size={110} color={C.ouro}>
            surge a escrita
          </Title>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 5. Contabilidade: tabuinha com marcas numéricas impressas (círculos e cunhas largas),
//    como nas tabuinhas administrativas de Uruk. Grafismo esquemático, sem leitura.
export const Accounting: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const contas = wordFrame("onde", 31, from);
  const marks = new Array(14).fill(0).map((_, i) => ({
    x: 70 + (i % 7) * 82 + random(`acx${i}`) * 10,
    y: i < 7 ? 120 : 330,
    round: random(`acr${i}`) > 0.45,
    at: 4 + i * 4,
  }));
  return (
    <AbsoluteFill>
      <Center top={260}>
        <Tablet w={720} h={520} seed={21}>
          <svg width={720} height={520} style={{ position: "absolute", inset: 0 }}>
            <line x1={40} x2={680} y1={235} y2={235} stroke="#5b3f26" strokeWidth={4} opacity={0.6} />
            {marks.map((m, i) => {
              const p = interpolate(f, [m.at, m.at + 6], [0, 1], { ...clamp, easing: easeOut });
              return (
                <g key={i} transform={`translate(${m.x} ${m.y}) scale(${p})`}>
                  {m.round ? (
                    <circle r={28} fill="#3a2414" stroke="#e7c69c" strokeOpacity={0.35} strokeWidth={4} />
                  ) : (
                    <path d="M-30 -24 Q 0 -40 30 -24 L 22 28 Q 0 36 -22 28 Z" fill="#3a2414" stroke="#e7c69c" strokeOpacity={0.35} strokeWidth={4} />
                  )}
                </g>
              );
            })}
          </svg>
        </Tablet>
      </Center>
      <Center top={850}>
        <div style={{ opacity: interpolate(f, [contas - 8, contas + 6], [0, 1], clamp) }}>
          <Title size={104}>para fazer contas</Title>
        </div>
        <Rise at={2}>
          <Body size={40} style={{ marginTop: 14 }}>
            nada de poesia
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};
