import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../data/timeline.json";
import { C, FONT_BODY, SAFE } from "../theme";

// Legendas palavra a palavra: página de até 2 linhas, palavra falada em ouro.
// Fica no terço do meio (topo em y=1180), longe dos 250 px de baixo e dos 150 px da direita.
const SUMERIAN = /^(lu₂|gal|lugal|e₂|e₂-gal|lugal-e|dingir|an)[,.:]?$/;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const page = timeline.pages.find((p) => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;
  const enter = interpolate(ms, [page.startMs, page.startMs + 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(ms, [page.endMs - 90, page.endMs], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: 1080 - SAFE.left - SAFE.right,
        top: 1110,
        display: "flex",
        justifyContent: "center",
        opacity: enter * exit,
        translate: `0px ${interpolate(enter, [0, 1], [18, 0])}px`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 760,
          fontStretch: "106%",
          fontSize: 66,
          lineHeight: 1.18,
          textAlign: "center",
          color: C.osso,
          padding: "18px 30px 22px",
          borderRadius: 26,
          background: "rgba(23,16,11,0.72)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
          maxWidth: 850,
          textWrap: "balance",
        }}
      >
        {page.words.map((k, n) => {
          const w = timeline.words[k];
          const active = ms >= w.startMs - 40 && ms < w.endMs + 60;
          const spoken = ms >= w.startMs - 40;
          const isSux = SUMERIAN.test(w.text.replace(/[“”]/g, ""));
          return (
            <span
              key={k}
              style={{
                color: active ? C.ouro : spoken ? C.osso : "rgba(244,234,216,0.55)",
                fontFamily: isSux ? "Fraunces" : undefined,
                fontStyle: isSux ? "italic" : undefined,
                fontWeight: isSux ? 650 : undefined,
                display: "inline-block",
                marginRight: n === page.words.length - 1 ? 0 : "0.26em",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
