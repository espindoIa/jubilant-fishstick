import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnSign, GlyphSign, Wedge, ImpressFilter } from "../components/Cuneiform";
import { Body, Center, clamp, easeOut, Rise, Sux, Tablet, Title } from "../components/ui";
import { C, FONT_BODY, FONT_TITLE } from "../theme";
import { SceneProps, wordFrame } from "./helpers";

// 13. "ergativa"
export const ErgativeTitle: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={380}>
      <Rise at={0}>
        <Title size={150}>ergativa</Title>
      </Rise>
      <Rise at={10}>
        <Body size={44} style={{ marginTop: 20 }}>
          o sujeito muda de marca
        </Body>
      </Rise>
    </Center>
  </AbsoluteFill>
);

const Chip: React.FC<{ text: string; gloss?: string; at: number; color?: string; textColor?: string; pop?: boolean }> = ({
  text,
  gloss,
  at,
  color = C.argila,
  textColor = C.betume,
  pop,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + (pop ? 8 : 10)], [0, 1], { ...clamp, easing: pop ? Easing.out(Easing.back(2.5)) : easeOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 1.5), scale: pop ? p : 0.9 + 0.1 * p }}>
      <div
        style={{
          background: color,
          color: textColor,
          borderRadius: 18,
          padding: "10px 22px 14px",
          fontFamily: FONT_TITLE,
          fontStyle: "italic",
          fontWeight: 650,
          fontSize: 76,
          boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {text}
      </div>
      {gloss && (
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: C.argilaClara, marginTop: 12 }}>{gloss}</div>
      )}
    </div>
  );
};

// 14. lugal-e e₂ mu-du₃ — "o rei construiu o templo"
export const ErgTransitive: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const markAt = wordFrame("ergativa", 13, from);
  const arrow = interpolate(f, [16, 34], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <Center top={210}>
        <Rise at={0}>
          <Body size={46} color={C.osso} style={{ fontWeight: 650 }}>
            “o rei construiu o templo”
          </Body>
        </Rise>
      </Center>
      <Center top={400}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <Chip text="lugal" gloss="o rei" at={4} />
          <Chip text="-e" at={markAt - 2} color={C.terracotaViva} textColor={C.osso} pop />
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 34 }}>
          <Chip text="e₂" gloss="o templo" at={8} />
          <Chip text="mu-du₃" gloss="construiu" at={12} />
        </div>
      </Center>
      <svg width={1080} height={1150} style={{ position: "absolute", pointerEvents: "none" }}>
        <path d="M330 520 C 250 600, 260 680, 330 700" fill="none" stroke={C.ouro} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} />
      </svg>
      <Center top={880}>
        <div style={{ opacity: interpolate(f, [markAt, markAt + 10], [0, 1], clamp) }}>
          <Body size={44} color={C.terracotaViva} style={{ fontWeight: 700 }}>
            -e marca quem age sobre algo
          </Body>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// 15. lugal i₃-im-ĝen — "o rei veio"
export const ErgIntransitive: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Center top={210}>
        <Rise at={0}>
          <Body size={46} color={C.osso} style={{ fontWeight: 650 }}>
            “o rei veio”
          </Body>
        </Rise>
      </Center>
      <Center top={420}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <Chip text="lugal" gloss="o rei" at={3} />
          <div
            style={{
              opacity: interpolate(f, [22, 30], [0, 1], clamp),
              fontFamily: FONT_TITLE,
              fontSize: 76,
              color: C.argilaClara,
              border: `4px dashed ${C.argilaClara}`,
              borderRadius: 18,
              padding: "6px 22px 10px",
              fontWeight: 600,
            }}
          >
            Ø
          </div>
        </div>
        <div style={{ marginTop: 34 }}>
          <Chip text="i₃-im-ĝen" gloss="veio" at={8} />
        </div>
      </Center>
      <Center top={880}>
        <Rise at={28}>
          <Body size={44} style={{ fontWeight: 650 }}>
            sem objeto, sem marca
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 16. A regra em duas linhas
export const ErgRule: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Center top={260}>
      <Rise at={0}>
        <Title size={84}>quem age sobre algo</Title>
      </Rise>
      <Rise at={6}>
        <div style={{ marginTop: 20 }}>
          <Chip text="lugal-e" at={6} color={C.terracotaViva} textColor={C.osso} />
        </div>
      </Rise>
      <Rise at={30}>
        <Title size={84} style={{ marginTop: 70 }}>
          quem só faz a ação
        </Title>
      </Rise>
      <Rise at={36}>
        <div style={{ marginTop: 20 }}>
          <Chip text="lugal" at={36} />
        </div>
      </Rise>
    </Center>
  </AbsoluteFill>
);

// Cálamo (haste de junco com ponta em bisel), desenhado em SVG.
const Stylus: React.FC<{ x: number; y: number; angle: number }> = ({ x, y, angle }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <defs>
      <linearGradient id="reed" x1="0" x2="1">
        <stop offset="0" stopColor="#8f7a45" />
        <stop offset="0.45" stopColor="#d8c48a" />
        <stop offset="1" stopColor="#7a6535" />
      </linearGradient>
    </defs>
    <path d="M-16 -620 L16 -620 L16 -40 L0 0 L-16 -40 Z" fill="url(#reed)" />
    {[-480, -300, -140].map((n) => (
      <rect key={n} x={-18} y={n} width={36} height={10} rx={4} fill="#6d5a2e" />
    ))}
  </g>
);

// 17. O cálamo pressiona a argila, cunha por cunha.
export const StylusScene: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const fid = "imp-stylus";
  const presses = [
    { x: 220, y: 300, angle: 0, at: 14 },
    { x: 220, y: 420, angle: 0, at: 40 },
    { x: 560, y: 200, angle: 90, at: 66 },
    { x: 360, y: 560, angle: 0, at: 92 },
  ];
  // posição do cálamo: desce e sobe a cada toque
  let sx = 120;
  let sy = -200;
  let ang = -38;
  for (const p of presses) {
    const t = f - p.at;
    if (t > -14) {
      const down = interpolate(t, [-14, 0, 6, 18], [0, 1, 1, 0], clamp);
      sx = p.x + (p.angle === 90 ? 0 : -10);
      sy = p.y - 160 * (1 - down);
      ang = p.angle === 90 ? -12 : -38;
    }
  }
  const pull = interpolate(f, [0, 150], [1.18, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill>
      <Center top={220}>
        <div style={{ scale: pull }}>
          <Tablet w={760} h={760} seed={51}>
            <svg width={760} height={760} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs>
                <ImpressFilter id={fid} depth={1.2} />
              </defs>
              {presses.map((p, i) => (
                <Wedge key={i} spec={{ x: p.x, y: p.y, angle: p.angle, length: 280, head: 46 }} start={p.at} filterId={fid} />
              ))}
              <Stylus x={sx} y={sy} angle={ang} />
            </svg>
          </Tablet>
        </div>
      </Center>
      <Center top={130}>
        <Rise at={4}>
          <Body size={44} color={C.argilaClara} style={{ fontWeight: 650 }}>
            cálamo + argila úmida
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 18. Cada toque, uma cunha: cuneiforme.
export const WedgeName: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const nameAt = wordFrame("cuneiforme", 20, from);
  const fid = "imp-name";
  return (
    <AbsoluteFill>
      <Center top={250}>
        <svg width={700} height={420} viewBox="-60 -60 700 420" style={{ overflow: "visible" }}>
          <defs>
            <ImpressFilter id={fid} depth={1.6} />
          </defs>
          <rect x={-60} y={-60} width={700} height={420} rx={60} fill={C.argila} opacity={0.9} />
          <Wedge spec={{ x: 40, y: 150, angle: 0, length: 520, head: 120 }} start={2} filterId={fid} dur={10} />
        </svg>
      </Center>
      <Center top={760}>
        <div style={{ opacity: interpolate(f, [nameAt - 8, nameAt + 4], [0, 1], clamp), scale: interpolate(f, [nameAt - 8, nameAt + 4], [0.9, 1], clamp) }}>
          <Title size={128}>
            <span style={{ color: C.ouro }}>cunei</span>forme
          </Title>
        </div>
        <Rise at={6}>
          <Body size={44} style={{ marginTop: 8 }}>
            cunha → cuneiforme
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};

// 19. Um sinal: palavra ou som.
export const SignRoles: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const split = interpolate(f, [18, 36], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <Center top={220}>
        <Tablet w={360} h={340} seed={61}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnSign size={220} start={0} gap={4} />
          </div>
        </Tablet>
      </Center>
      <div style={{ position: "absolute", top: 700, left: 80, width: 850, display: "flex", justifyContent: "space-between", opacity: split }}>
        {["palavra", "som"].map((t, i) => (
          <div key={t} style={{ width: 380, textAlign: "center", translate: `${(i ? 1 : -1) * (1 - split) * -120}px 0px` }}>
            <Title size={96} color={i ? C.ocre : C.ouro}>
              {t}
            </Title>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 20. dingir "deus" → an "céu"
export const DingirAn: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const anAt = wordFrame("cuneiforme", 37, from);
  const sw = interpolate(f, [anAt - 6, anAt + 6], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <Center top={190}>
        <Tablet w={600} h={560} seed={71}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnSign size={380} start={0} gap={6} />
          </div>
        </Tablet>
      </Center>
      <Center top={820}>
        <div style={{ position: "relative", width: 850, height: 200 }}>
          <div style={{ position: "absolute", width: "100%", opacity: 1 - sw, translate: `0px ${-sw * 30}px` }}>
            <Sux size={110}>dingir</Sux>
            <Body size={46} color={C.osso} style={{ fontWeight: 650 }}>
              deus
            </Body>
          </div>
          <div style={{ position: "absolute", width: "100%", opacity: sw, translate: `0px ${(1 - sw) * 30}px` }}>
            <Sux size={110} color={C.ocre}>
              an
            </Sux>
            <Body size={46} color={C.osso} style={{ fontWeight: 650 }}>
              céu
            </Body>
          </div>
        </div>
      </Center>
      <div style={{ position: "absolute", top: 120, left: 80, width: 850, textAlign: "center" }}>
        <Body size={34} color={C.argilaClara}>
          sinal AN · U+1202D
        </Body>
      </div>
    </AbsoluteFill>
  );
};

// 21. Determinativo: ᵈen-lil₂ = Enlil
export const Determinative: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const glow = interpolate(f, [30, 46], [0, 0.85], clamp);
  return (
    <AbsoluteFill>
      <Center top={230}>
        <Tablet w={820} h={330} seed={81}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <GlyphSign name="AN" height={150} start={2} glow={glow} />
            <GlyphSign name="EN" height={150} start={10} perWedge={5} />
            <GlyphSign name="KID" height={150} start={20} perWedge={2} />
          </div>
        </Tablet>
      </Center>
      <Center top={620}>
        <Rise at={8}>
          <div>
            <Sux size={104} color={C.ouro}>
              <sup style={{ fontSize: 64 }}>d</sup>
            </Sux>
            <Sux size={104} color={C.osso}>
              en-lil₂
            </Sux>
          </div>
        </Rise>
        <Rise at={32}>
          <Body size={44} color={C.osso} style={{ fontWeight: 650, marginTop: 6 }}>
            o deus Enlil
          </Body>
        </Rise>
        <Rise at={44}>
          <Body size={38} color={C.ouro} style={{ marginTop: 14 }}>
            o primeiro sinal não se lê: só avisa “deus”
          </Body>
        </Rise>
      </Center>
    </AbsoluteFill>
  );
};
