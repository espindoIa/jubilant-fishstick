import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { GlyphSign } from "../components/Cuneiform";
import { Body, Center, clamp, easeOut, Rise, Sux, Tablet, Title } from "../components/ui";
import { C, CONTENT_CX, FONT_BODY, FONT_TITLE } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

const Node: React.FC<{ label: string; x: number; y: number; at: number; color?: string; size?: number; strong?: boolean }> = ({
  label,
  x,
  y,
  at,
  color = C.argilaClara,
  size = 40,
  strong,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        opacity: p,
        scale: 0.85 + 0.15 * p,
        padding: "10px 24px",
        borderRadius: 999,
        border: `3px solid ${color}`,
        background: strong ? color : "rgba(23,16,11,0.6)",
        color: strong ? C.betume : color,
        fontFamily: FONT_BODY,
        fontWeight: 650,
        fontSize: size,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

const Edge: React.FC<{ x1: number; y1: number; x2: number; y2: number; at: number; color?: string }> = ({ x1, y1, x2, y2, at, color = C.ocre }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={4} />;
};

// 6. "língua isolada"
export const Isolate: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [6, 40], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1150} style={{ position: "absolute" }}>
        {[1, 2, 3].map((k) => (
          <circle key={k} cx={CONTENT_CX} cy={560} r={120 + k * 110 * ring} fill="none" stroke={C.ocre} strokeOpacity={0.5 / k} strokeWidth={3} strokeDasharray="6 14" />
        ))}
      </svg>
      <Center top={500}>
        <Node label="sumério" x={425} y={60} at={0} color={C.ouro} size={54} strong />
      </Center>
      <Center top={220}>
        <Rise at={4}>
          <Title size={124}>língua isolada</Title>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

const Family: React.FC<{ root: string; leaves: string[]; title: string; from: number }> = ({ root, leaves, title }) => {
  const f = useCurrentFrame();
  const rx = CONTENT_CX;
  const ry = 420;
  const ly = 640;
  const span = leaves.length > 3 ? 640 : 560;
  const xs = leaves.map((_, i) => rx - span / 2 + (i * span) / (leaves.length - 1));
  const no = interpolate(f, [24, 34], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1150} style={{ position: "absolute" }}>
        {xs.map((x, i) => (
          <Edge key={i} x1={rx} y1={ry} x2={x} y2={ly} at={6 + i * 3} />
        ))}
        <line x1={rx} y1={ly + 110} x2={rx} y2={ly + 200} stroke={C.terracota} strokeWidth={6} strokeDasharray="12 10" opacity={no} />
      </svg>
      <Node label={root} x={rx} y={ry} at={0} color={C.ocre} size={46} strong />
      {leaves.map((l, i) => (
        <Node key={l} label={l} x={xs[i]} y={ly} at={10 + i * 3} size={36} />
      ))}
      <Node label="sumério" x={rx} y={ly + 290} at={18} color={C.ouro} size={48} strong />
      <div
        style={{
          position: "absolute",
          left: rx + 140,
          top: ly + 150,
          scale: no,
          fontFamily: FONT_TITLE,
          fontSize: 96,
          color: C.terracotaViva,
          fontWeight: 700,
        }}
      >
        ≠
      </div>
      <Center top={180}>
        <Rise at={0}>
          <Title size={96}>{title}</Title>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 7. não é semítica
export const FamilySemitic: React.FC<SceneProps> = (p) => (
  <Family {...p} title="não é semítica" root="semíticas" leaves={["acadiano", "hebraico", "árabe"]} />
);
// 8. não é indo-europeia
export const FamilyIE: React.FC<SceneProps> = (p) => (
  <Family {...p} title="nem indo-europeia" root="indo-europeias" leaves={["latim", "português", "grego", "inglês"]} />
);

// 9. Nenhum parente demonstrado
export const IsolateAlone: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, 110], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1150} style={{ position: "absolute" }}>
        {[-1, 1].map((s) => (
          <g key={s} opacity={1 - drift * 0.85} transform={`translate(${s * drift * 160} 0)`}>
            <line x1={CONTENT_CX + s * 120} y1={600} x2={CONTENT_CX + s * 330} y2={600} stroke={C.ocre} strokeWidth={4} strokeDasharray="8 12" />
            <circle cx={CONTENT_CX + s * 360} cy={600} r={30} fill="none" stroke={C.ocre} strokeWidth={4} />
          </g>
        ))}
      </svg>
      <Node label="sumério" x={CONTENT_CX} y={600} at={0} color={C.ouro} size={60} strong />
      <Center top={230}>
        <Rise at={2}>
          <Title size={96}>nenhum parente demonstrado</Title>
        </Rise>
      </Center>
      <Center top={800}>
        <Rise at={24}>
          <Body size={42}>até hoje</Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 10. Aglutinante: pedaços de argila que se juntam.
export const Agglutinative: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const join = interpolate(f, [30, 70], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const piece = (label: string, i: number) => (
    <div
      key={label}
      style={{
        translate: `${(i - 1) * 90 * join}px ${Math.abs(i - 1) * 40 * join}px`,
        rotate: `${(i - 1) * 6 * join}deg`,
      }}
    >
      <Tablet w={230} h={170} seed={30 + i}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, color: C.betume }}>
          {label}
        </div>
      </Tablet>
    </div>
  );
  return (
    <AbsoluteFill>
      <Center top={220}>
        <Rise at={0}>
          <Title size={124}>aglutinante</Title>
        </Rise>
      </Center>
      <Center top={560}>
        <div style={{ display: "flex", gap: 10 * (1 + join * 3) }}>{["pedaço", "+", "pedaço"].map((l, i) => (l === "+" ? <div key={i} style={{ alignSelf: "center", fontSize: 70, color: C.ouro, fontFamily: FONT_TITLE, opacity: join }}>+</div> : piece(l, i)))}</div>
      </Center>
      <Center top={800}>
        <Rise at={60}>
          <Body size={46} color={C.ouro} style={{ fontWeight: 650 }}>
            = uma palavra
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// Cartão de palavra: sinal + transliteração + tradução
const WordCard: React.FC<{
  sign: "LU2" | "GAL" | "LUGAL" | "E2";
  sux: string;
  pt: string;
  at: number;
  height?: number;
  big?: boolean;
}> = ({ sign, sux, pt, at, height = 150, big }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: p, translate: `0px ${(1 - p) * 30}px` }}>
      <Tablet w={big ? 640 : 330} h={height + 110} seed={sux.length * 7}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GlyphSign name={sign} height={height} start={at + 2} perWedge={big ? 6 : 5} />
        </div>
      </Tablet>
      <div style={{ marginTop: 26 }}>
        <Sux size={big ? 104 : 78}>{sux}</Sux>
      </div>
      <Body size={big ? 46 : 38} color={C.osso} style={{ marginTop: 4, fontWeight: 600 }}>
        {pt}
      </Body>
    </div>
  );
};

// 11. lu₂ + gal → lugal
export const LugalBuild: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const galAt = wordFrame("aglutinante", 10, from);
  const lugalAt = wordFrame("aglutinante", 12, from);
  const merge = interpolate(f, [lugalAt - 8, lugalAt + 6], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Center top={140}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", opacity: interpolate(merge, [0, 1], [0.35, 1]), scale: interpolate(merge, [0, 1], [0.78, 1]), transformOrigin: "50% 0%" }}>
          <WordCard sign="LU2" sux="lu₂" pt="homem" at={0} height={110} />
          <div style={{ fontFamily: FONT_TITLE, fontSize: 90, color: C.ouro, alignSelf: "center", marginTop: -80, opacity: interpolate(f, [galAt - 6, galAt], [0, 1], clamp) }}>+</div>
          <WordCard sign="GAL" sux="gal" pt="grande" at={galAt - 3} height={110} />
        </div>
      </Center>
      <Center top={640}>
        <WordCard sign="LUGAL" sux="lugal" pt="rei · lit. “homem grande”" at={lugalAt - 4} height={130} big />
      </Center>
    </AbsoluteFill>
  );
};

// 12. e₂ + gal → e₂-gal
export const EgalBuild: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const egalAt = wordFrame("aglutinante", 20, from);
  const show2 = interpolate(f, [egalAt - 6, egalAt + 6], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <Center top={200}>
        <Tablet w={760} h={330} seed={44}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
            <GlyphSign name="E2" height={190} start={2} perWedge={5} />
            <div style={{ opacity: show2, width: show2 * 300, overflow: "hidden" }}>
              <GlyphSign name="GAL" height={190} start={egalAt - 4} perWedge={6} />
            </div>
          </div>
        </Tablet>
      </Center>
      <Center top={600}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <Sux size={116}>
            e₂<span style={{ opacity: show2 }}>-gal</span>
          </Sux>
        </div>
        <div style={{ position: "relative", height: 130, width: 800 }}>
          <Body size={52} color={C.osso} style={{ position: "absolute", width: "100%", opacity: 1 - show2, fontWeight: 650 }}>
            casa
          </Body>
          <Body size={52} color={C.osso} style={{ position: "absolute", width: "100%", opacity: show2, fontWeight: 650 }}>
            palácio · lit. “casa grande”
          </Body>
        </div>
      </Center>
    </AbsoluteFill>
  );
};
