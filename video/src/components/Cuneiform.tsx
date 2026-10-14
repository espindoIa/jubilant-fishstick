import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import glyphData from "../data/glyphs.json";
import { C } from "../theme";

// ---------------------------------------------------------------------------
// Filtro de "impressão na argila": sombra interna com luz vinda de cima/esquerda
// e um fio de luz na borda oposta. Usado por todos os sinais.
// ---------------------------------------------------------------------------
export const ImpressFilter: React.FC<{ id: string; depth?: number }> = ({ id, depth = 1 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    {/* sombra interna (borda superior/esquerda) */}
    <feComponentTransfer in="SourceAlpha" result="inv">
      <feFuncA type="table" tableValues="1 0" />
    </feComponentTransfer>
    <feOffset in="inv" dx={6 * depth} dy={8 * depth} result="off" />
    <feGaussianBlur in="off" stdDeviation={5 * depth} result="blur" />
    <feComposite in="blur" in2="SourceAlpha" operator="in" result="innerShadow" />
    <feFlood floodColor="#0b0603" floodOpacity={0.85} />
    <feComposite in2="innerShadow" operator="in" result="shadowColored" />
    {/* realce na borda inferior/direita */}
    <feOffset in="inv" dx={-3 * depth} dy={-4 * depth} result="off2" />
    <feGaussianBlur in="off2" stdDeviation={2.5 * depth} result="blur2" />
    <feComposite in="blur2" in2="SourceAlpha" operator="in" result="innerHi" />
    <feFlood floodColor={C.argilaClara} floodOpacity={0.55} />
    <feComposite in2="innerHi" operator="in" result="hiColored" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="shadowColored" />
      <feMergeNode in="hiColored" />
    </feMerge>
  </filter>
);

// ---------------------------------------------------------------------------
// Cunha desenhada à mão (SVG próprio): cabeça triangular facetada + cauda.
// Coordenadas locais: cabeça na origem, apontando para +x.
// ---------------------------------------------------------------------------
export type WedgeSpec = {
  x: number; // posição da cabeça
  y: number;
  angle: number; // graus, direção cabeça → cauda
  length: number;
  head: number; // meia-largura da cabeça
};

const wedgePath = (L: number, hw: number) => {
  const hl = hw * 1.6; // comprimento da cabeça
  const tw = Math.max(3, hw * 0.2); // meia-largura da cauda
  return {
    outline: `M0 ${-hw} Q${hl * 0.45} ${-hw * 0.35} ${hl} ${-tw * 1.6} L${L} ${-tw * 0.4} L${L} ${tw * 0.4} L${hl} ${tw * 1.6} Q${hl * 0.45} ${hw * 0.35} 0 ${hw} Q${hl * 0.18} 0 0 ${-hw}Z`,
    facetTop: `M0 ${-hw} Q${hl * 0.45} ${-hw * 0.35} ${hl} ${-tw * 1.6} L${hl * 0.55} 0 Q${hl * 0.12} ${-hw * 0.2} 0 ${-hw}Z`,
    facetBottom: `M0 ${hw} Q${hl * 0.45} ${hw * 0.35} ${hl} ${tw * 1.6} L${hl * 0.55} 0 Q${hl * 0.12} ${hw * 0.2} 0 ${hw}Z`,
  };
};

export const Wedge: React.FC<{
  spec: WedgeSpec;
  start: number; // frame em que o cálamo toca
  dur?: number;
  color?: string;
  filterId?: string;
}> = ({ spec, start, dur = 7, color = C.betume, filterId }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const press = interpolate(frame, [start, start + 3, start + dur + 4], [1.25, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { outline, facetTop, facetBottom } = wedgePath(spec.length * p, spec.head * Math.min(1, p * 2.2));
  const flash = interpolate(frame, [start, start + 4, start + 18], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <g transform={`translate(${spec.x} ${spec.y}) rotate(${spec.angle}) scale(${press})`}>
      <path d={outline} fill={color} filter={filterId ? `url(#${filterId})` : undefined} />
      <path d={facetTop} fill="#000" opacity={0.35} />
      <path d={facetBottom} fill={C.argilaClara} opacity={0.12} />
      {/* brilho do toque do cálamo */}
      <circle cx={spec.head * 0.6} cy={0} r={spec.head * 1.4} fill={C.ouro} opacity={flash * 0.35} />
      <ClayPuff start={start} seed={`${spec.x}-${spec.y}`} size={spec.head} />
    </g>
  );
};

// Farelos de argila que saltam quando a cunha é pressionada.
export const ClayPuff: React.FC<{ start: number; seed: string; size: number }> = ({ start, seed, size }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 22) return null;
  return (
    <g>
      {new Array(9).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const v = (0.6 + random(`${seed}v${i}`)) * size * 0.11;
        const x = Math.cos(a) * v * t;
        const y = Math.sin(a) * v * t + 0.05 * t * t;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.5 + random(`${seed}r${i}`) * size * 0.06}
            fill={C.argilaClara}
            opacity={interpolate(t, [0, 22], [0.9, 0])}
          />
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Sinal da fonte Noto Sans Cuneiform (OFL), extraído por código Unicode
// (scripts/extract-glyphs.py). Cada contorno é revelado em sequência,
// varrido a partir da cabeça da cunha, como se o cálamo o gravasse.
// ---------------------------------------------------------------------------
type GlyphName = keyof typeof glyphData.signs;

export const GlyphSign: React.FC<{
  name: GlyphName;
  height: number; // altura em px do corpo do sinal
  start: number;
  perWedge?: number;
  color?: string;
  impressed?: boolean;
  glow?: number; // 0..1 brilho dourado
}> = ({ name, height, start, perWedge = 8, color = C.betume, impressed = true, glow = 0 }) => {
  const frame = useCurrentFrame();
  const sign = glyphData.signs[name];
  const [x0, y0, x1, y1] = sign.bounds as [number, number, number, number];
  const gw = x1 - x0;
  const gh = y1 - y0;
  const s = height / gh;
  const width = gw * s;
  const fid = `imp-${name}`;
  // ordem de gravação: da esquerda para a direita, de cima para baixo
  const order = sign.contours
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => a.cx - b.cx || b.cy - a.cy);
  return (
    <svg width={width + 40} height={height + 40} viewBox={`-20 -20 ${width + 40} ${height + 40}`} style={{ overflow: "visible" }}>
      <defs>
        <ImpressFilter id={fid} depth={height / 420} />
        {order.map((c, k) => {
          const st = start + k * perWedge;
          const p = interpolate(frame, [st, st + perWedge * 0.9], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.quad),
          });
          // máscara que varre da esquerda (cabeça das horizontais) e de cima (verticais)
          return (
            <clipPath id={`clip-${name}-${c.i}`} key={c.i}>
              <rect x={x0 - 50} y={y0 - 200} width={(gw + 100) * p} height={gh + 400} />
            </clipPath>
          );
        })}
      </defs>
      <g transform={`scale(${s} ${-s}) translate(${-x0} ${-y1})`}>
        {order.map((c, k) => {
          const st = start + k * perWedge;
          if (frame < st) return null;
          return (
            <g key={c.i} clipPath={`url(#clip-${name}-${c.i})`}>
              <path d={c.d} fill={color} filter={impressed ? `url(#${fid})` : undefined} />
              {glow > 0 && <path d={c.d} fill={C.ouro} opacity={glow} />}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const glyphAspect = (name: GlyphName) => {
  const [x0, y0, x1, y1] = glyphData.signs[name].bounds as [number, number, number, number];
  return (x1 - x0) / (y1 - y0);
};

// ---------------------------------------------------------------------------
// AN / dingir (U+1202D) remontado cunha por cunha em SVG próprio, seguindo a
// forma do glifo Noto: vertical (cabeça em cima), horizontal (cabeça à esquerda)
// e duas diagonais com cabeças à esquerda. Caixa 0..848 × 0..848.
// ---------------------------------------------------------------------------
export const AN_WEDGES: WedgeSpec[] = [
  { x: 405, y: 0, angle: 90, length: 848, head: 105 }, // vertical
  { x: 0, y: 400, angle: 0, length: 848, head: 108 }, // horizontal
  { x: 60, y: 150, angle: 42, length: 640, head: 92 }, // diagonal ↘
  { x: 60, y: 650, angle: -42, length: 640, head: 92 }, // diagonal ↗
];

export const AnSign: React.FC<{ size: number; start: number; gap?: number; color?: string }> = ({
  size,
  start,
  gap = 12,
  color = C.betume,
}) => {
  const fid = "imp-an-hand";
  return (
    <svg width={size} height={size} viewBox="-60 -60 968 968" style={{ overflow: "visible" }}>
      <defs>
        <ImpressFilter id={fid} depth={1.6} />
      </defs>
      {AN_WEDGES.map((w, i) => (
        <Wedge key={i} spec={w} start={start + i * gap} color={color} filterId={fid} dur={8} />
      ))}
    </svg>
  );
};
