import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { AnSign, Wedge, ImpressFilter } from "../components/Cuneiform";
import { Body, Center, clamp, easeOut, Rise, Sux, Tablet, Title } from "../components/ui";
import { C } from "../theme";
import { SceneProps, wordFrame } from "./helpers";


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
  const anAt = wordFrame("dingir", 7, from);
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

