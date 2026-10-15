import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, CONTENT_CX, FONT_BODY, FONT_TITLE, SAFE, W } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// Aparece subindo levemente a partir do frame `at` (frame local da tela).
export const Rise: React.FC<{
  at?: number;
  dur?: number;
  dy?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at = 0, dur = 14, dy = 28, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ opacity: p, translate: `0px ${(1 - p) * dy}px`, ...style }}>{children}</div>
  );
};

// Bloco centralizado no eixo útil (descontando os 150 px da direita).
export const Center: React.FC<{ top: number; children: React.ReactNode; width?: number; style?: React.CSSProperties }> = ({
  top,
  children,
  width = W - SAFE.left - SAFE.right,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: CONTENT_CX - width / 2,
      width,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 120,
  color = C.osso,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT_TITLE,
      fontWeight: 640,
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: "-0.01em",
      color,
      fontVariationSettings: '"SOFT" 100, "WONK" 0, "opsz" 144',
      textWrap: "balance",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 46,
  color = C.argilaClara,
  style,
}) => (
  <div style={{ fontFamily: FONT_BODY, fontWeight: 560, fontSize: size, lineHeight: 1.25, color, ...style }}>{children}</div>
);

// Transliteração suméria (itálico serifado, com subscritos reais)
export const Sux: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 96,
  color = C.ouro,
  style,
}) => (
  <span
    style={{
      fontFamily: FONT_TITLE,
      fontStyle: "italic",
      fontWeight: 560,
      fontSize: size,
      color,
      fontVariationSettings: '"SOFT" 100, "opsz" 144',
      ...style,
    }}
  >
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Tabuinha de argila: forma de "travesseiro" com borda irregular, relevo por
// luz difusa sobre ruído fractal e sombra projetada. Os filhos ficam por cima.
// ---------------------------------------------------------------------------
export const Tablet: React.FC<{
  w: number;
  h: number;
  seed?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  tone?: string;
}> = ({ w, h, seed = 7, children, style, tone = C.argila }) => {
  const id = `tab-${seed}-${w}-${h}`;
  const r = Math.min(w, h) * 0.12;
  return (
    <div style={{ position: "relative", width: w, height: h, ...style }}>
      <svg width={w + 80} height={h + 80} viewBox={`-40 -40 ${w + 80} ${h + 80}`} style={{ position: "absolute", left: -40, top: -40, overflow: "visible" }}>
        <defs>
          <filter id={`${id}-edge`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={seed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={18} />
          </filter>
          <filter id={`${id}-surf`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={5} seed={seed + 11} result="noise" />
            <feDiffuseLighting in="noise" surfaceScale={3.2} lightingColor="#fff1dc" result="lit">
              <feDistantLight azimuth={235} elevation={42} />
            </feDiffuseLighting>
            <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1={1.05} k2={0} k3={0} k4={0} result="tex" />
            <feComposite in="tex" in2="SourceAlpha" operator="in" />
          </filter>
          <radialGradient id={`${id}-shade`} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#fff2da" stopOpacity={0.32} />
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.5} />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <rect x={0} y={0} width={w} height={h} rx={r} />
          </clipPath>
        </defs>
        {/* sombra projetada */}
        <rect x={18} y={34} width={w} height={h} rx={r} fill="#000" opacity={0.55} filter={`url(#${id}-edge)`} style={{ filter: "blur(22px)" }} />
        <g filter={`url(#${id}-edge)`}>
          <rect x={0} y={0} width={w} height={h} rx={r} fill={tone} />
          <rect x={0} y={0} width={w} height={h} rx={r} fill={tone} filter={`url(#${id}-surf)`} opacity={0.9} />
          <rect x={0} y={0} width={w} height={h} rx={r} fill={`url(#${id}-shade)`} />
          {/* borda: luz em cima, sombra embaixo */}
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={r} fill="none" stroke="#f6dcb4" strokeOpacity={0.35} strokeWidth={5} />
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

// Linha horizontal gravada (pautas que os escribas riscavam na tabuinha)
export const Ruling: React.FC<{ width: number; at?: number }> = ({ width, at = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        width: width * p,
        height: 4,
        borderRadius: 2,
        background: "linear-gradient(#5b3f26, #e3c39a)",
        opacity: 0.8,
      }}
    />
  );
};

// Selo cilíndrico rolando: deixa uma faixa de relevo (grafismo próprio, sem significado).
export const SealBand: React.FC<{ y: number; at?: number; dur?: number; seed?: string }> = ({ y, at = 0, dur = 40, seed = "seal" }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const width = W - SAFE.right;
  const motifs = 9;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={200} style={{ position: "absolute", top: y }}>
        <defs>
          <clipPath id={`seal-${seed}`}>
            <rect x={0} y={0} width={width * p} height={200} />
          </clipPath>
        </defs>
        <g clipPath={`url(#seal-${seed})`} opacity={0.75}>
          <rect x={0} y={30} width={width} height={140} fill={C.argilaEscura} opacity={0.55} />
          <line x1={0} x2={width} y1={36} y2={36} stroke={C.argilaClara} strokeOpacity={0.35} strokeWidth={3} />
          <line x1={0} x2={width} y1={164} y2={164} stroke="#000" strokeOpacity={0.5} strokeWidth={3} />
          {new Array(motifs).fill(0).map((_, i) => {
            const x = 40 + (i * (width - 80)) / (motifs - 1);
            const tall = 60 + random(`${seed}${i}`) * 30;
            return (
              <g key={i} transform={`translate(${x} 100)`}>
                {/* figura estilizada: haste + par de chifres/ramos, motivo genérico de selo */}
                <line x1={0} y1={tall / 2} x2={0} y2={-tall / 2} stroke="#2a1b10" strokeWidth={7} strokeLinecap="round" />
                <path d={`M0 ${-tall / 2 + 10} q -26 -8 -30 -30 M0 ${-tall / 2 + 10} q 26 -8 30 -30`} stroke="#2a1b10" strokeWidth={5} fill="none" strokeLinecap="round" />
                <circle cx={i % 2 ? 34 : -34} cy={10} r={7} fill="#2a1b10" />
              </g>
            );
          })}
        </g>
        {/* o próprio cilindro */}
        <g transform={`translate(${width * p} 100)`} opacity={p > 0 && p < 1 ? 1 : 0}>
          <rect x={-34} y={-86} width={68} height={172} rx={14} fill={C.lapis} />
          <rect x={-34} y={-86} width={24} height={172} rx={10} fill="#5c7cd6" opacity={0.45} />
          <rect x={-34} y={-86} width={68} height={172} rx={14} fill="none" stroke={C.ouro} strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Body2 = Body;
export const FONT = { title: FONT_TITLE, body: FONT_BODY };
