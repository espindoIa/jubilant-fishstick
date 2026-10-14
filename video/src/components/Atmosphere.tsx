import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, H, W } from "../theme";

// Fundo de betume com luz quente rasante, textura de argila (ruído fractal) e vinheta.
export const ClayBackground: React.FC<{ tint?: "betume" | "lapis"; seed?: number }> = ({
  tint = "betume",
  seed = 3,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // a luz passeia devagar pela cena inteira
  const lx = interpolate(frame, [0, durationInFrames], [28, 40]);
  const base = tint === "lapis" ? C.lapisProfundo : C.betume;
  const glow = tint === "lapis" ? "rgba(70,110,200,0.35)" : "rgba(200,144,46,0.22)";
  return (
    <AbsoluteFill style={{ backgroundColor: base }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 55% at ${lx}% 30%, ${glow}, transparent 70%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={4} seed={seed} />
          <feDiffuseLighting lightingColor={tint === "lapis" ? "#6d86c9" : "#c99a68"} surfaceScale={2.2}>
            <feDistantLight azimuth={225} elevation={38} />
          </feDiffuseLighting>
          <feComposite operator="arithmetic" k1={0} k2={0.35} k3={0} k4={0} />
        </filter>
        <rect width={W} height={H} filter={`url(#grain-${seed})`} style={{ mixBlendMode: "soft-light" }} />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 45%, transparent 45%, rgba(8,5,3,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Partículas de poeira suspensas na luz (determinísticas).
export const Dust: React.FC<{ count?: number; seed?: string }> = ({ count = 70, seed = "dust" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        {new Array(count).fill(0).map((_, i) => {
          const x0 = random(`${seed}x${i}`) * W;
          const y0 = random(`${seed}y${i}`) * H;
          const r = 0.8 + random(`${seed}r${i}`) * 2.6;
          const sp = 0.15 + random(`${seed}s${i}`) * 0.5;
          const ph = random(`${seed}p${i}`) * 100;
          const x = (x0 + Math.sin((frame + ph) / 45) * 18 + frame * sp * 0.6) % W;
          const y = (y0 - frame * sp + H * 2) % H;
          const tw = 0.25 + 0.75 * Math.abs(Math.sin((frame + ph * 7) / 30));
          // mais brilho na faixa iluminada (terço superior esquerdo)
          const lit = interpolate(Math.hypot(x - W * 0.32, y - H * 0.3), [0, 900], [1, 0.25], {
            extrapolateRight: "clamp",
          });
          return <circle key={i} cx={x} cy={y} r={r} fill={C.argilaClara} opacity={0.5 * tw * lit} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Câmera lenta contínua (zoom suave) aplicada ao conteúdo de uma tela.
export const SlowCamera: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  drift?: number;
}> = ({ children, from = 1, to = 1.06, drift = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, durationInFrames], [from, to]),
        translate: `${interpolate(frame, [0, durationInFrames], [0, drift])}px 0px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
