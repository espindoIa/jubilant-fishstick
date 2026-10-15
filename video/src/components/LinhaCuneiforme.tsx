import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import glyphData from "../data/glyphs.json";
import linhas from "../data/linhas-cuneiformes.json";
import { C, FONT_BODY, FONT_TITLE } from "../theme";
import { GlyphSign, glyphAspect } from "./Cuneiform";
import { Tablet } from "./ui";

// ---------------------------------------------------------------------------
// Linha cuneiforme REAL (src/data/linhas-cuneiformes.json, tirada do ATF do CDLI
// e conferida por scripts/verificar-cuneiforme.py contra a OSL do ORACC).
// Cada grupo (um valor transliterado, ex. ensi₂ = PA.TE.SI) é gravado sinal a
// sinal na tabuinha, com o valor alinhado embaixo. O marcador proto-cuneiforme
// 1(N01) não tem código Unicode: é desenhado como impressão numérica simples.
// ---------------------------------------------------------------------------
type GlyphName = keyof typeof glyphData.signs;
const porCodigo: Record<string, GlyphName> = Object.fromEntries(
  Object.entries(glyphData.signs).map(([k, v]) => [v.codepoint, k as GlyphName]),
);

type Linha = (typeof linhas.linhas)[number];
export const linhaPorId = (id: string): Linha => {
  const l = linhas.linhas.find((x) => x.id === id);
  if (!l) throw new Error(`linha ${id} não existe`);
  return l;
};

const N01: React.FC<{ h: number; start: number }> = ({ h, start }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // impressão numérica "1" (N01): marca alongada feita com a ponta do cálamo
  return (
    <svg width={h * 0.55} height={h} viewBox="0 0 55 100" style={{ opacity: p }}>
      <path d="M27 18 C 44 30, 44 70, 27 82 C 12 70, 12 30, 27 18 Z" fill={C.betume} opacity={0.85} />
      <path d="M27 22 C 38 34, 38 66, 27 78" fill="none" stroke={C.argilaClara} strokeOpacity={0.4} strokeWidth={3} />
    </svg>
  );
};

export const LinhaCuneiforme: React.FC<{
  id: string;
  start: number;
  perSign?: number;
  alturaSinal?: number;
  larguraMax?: number;
  destaque?: number[]; // índices dos grupos (sinais[] do JSON) em destaque
  destaqueAt?: number;
  quebrarDepois?: number[]; // índice do grupo após o qual quebra a linha da tabuinha
  ocultarValores?: boolean;
  separadorDepois?: number; // lista bilíngue: "=" entre a coluna suméria e a acadiana
}> = ({ id, start, perSign = 7, alturaSinal = 120, larguraMax = 820, destaque = [], destaqueAt = 0, quebrarDepois = [], ocultarValores, separadorDepois }) => {
  const f = useCurrentFrame();
  const l = linhaPorId(id);
  // largura de cada grupo na altura base
  const grupos = l.sinais.map((s) => {
    const cps = (s.codepoint ?? "").split(" ").filter(Boolean);
    const nomes = cps.map((c) => {
      const n = porCodigo[c];
      if (!n) throw new Error(`sinal ${c} sem glifo extraído (rode scripts/extract-glyphs.py)`);
      return n;
    });
    const w = nomes.length ? nomes.reduce((a, n) => a + glyphAspect(n) * alturaSinal + 10, 0) : alturaSinal * 0.6;
    return { ...s, nomes, w };
  });
  // quebra em linhas da tabuinha
  const fileiras: (typeof grupos)[] = [[]];
  grupos.forEach((g, i) => {
    fileiras[fileiras.length - 1].push(g);
    if (quebrarDepois.includes(i)) fileiras.push([]);
  });
  const larguraFileira = (r: typeof grupos) => r.reduce((a, g) => a + Math.max(g.w, 90) + 26, 0);
  const escala = Math.min(1, (larguraMax - 80) / Math.max(...fileiras.map(larguraFileira)));
  const h = alturaSinal * escala;
  let k = 0; // contador de sinais para o tempo de gravação
  const hp = interpolate(f, [destaqueAt, destaqueAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const altTab = fileiras.length * (h + (ocultarValores ? 40 : 110)) + 70;
  return (
    <Tablet w={larguraMax} h={altTab} seed={id.length * 13}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
        {fileiras.map((r, ri) => (
          <div key={ri} style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 26 * escala }}>
            {r.map((g) => {
              const gi = grupos.indexOf(g);
              const on = destaque.includes(gi);
              const st0 = start + k * perSign;
              const items = g.nomes.length
                ? g.nomes.map((n, j) => {
                    const st = start + k++ * perSign;
                    return (
                      <div key={j} style={{ filter: on && hp > 0 ? `drop-shadow(0 0 ${12 * hp}px rgba(217,176,74,${0.9 * hp}))` : undefined }}>
                        <GlyphSign name={n} height={h} start={st} perWedge={3} color={on ? interpolateColor(hp) : C.betume} />
                      </div>
                    );
                  })
                : [<N01 key="n" h={h} start={start + k++ * perSign} />];
              const vp = interpolate(f, [st0 + 4, st0 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <React.Fragment key={gi}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90 * escala }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 * escala }}>{items}</div>
                  {!ocultarValores && (
                    <div
                      style={{
                        marginTop: 10,
                        opacity: vp,
                        fontFamily: FONT_TITLE,
                        fontStyle: "italic",
                        fontWeight: 650,
                        fontSize: 46,
                        color: on ? (hp > 0.5 ? C.terracota : "#3a2414") : "#3a2414",
                        borderBottom: on ? `4px solid rgba(164,70,47,${hp})` : "4px solid transparent",
                        lineHeight: 1.1,
                      }}
                    >
                      {g.valor === "ᵈ" ? "d" : g.valor === "1(N01)" ? "1" : g.valor}
                    </div>
                  )}
                </div>
                {separadorDepois === gi && (
                  <div style={{ alignSelf: "center", fontFamily: FONT_TITLE, fontSize: 90, color: C.lapisProfundo, opacity: vp, margin: "0 10px" }}>=</div>
                )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </Tablet>
  );
};

// betume → terracota viva para o grupo em destaque
const interpolateColor = (t: number) => {
  const a = [0x17, 0x10, 0x0b];
  const b = [0xa4, 0x46, 0x2f];
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// Etiqueta de procedência (objeto, museu, linha) — texto ≥ 44 px
export const Procedencia: React.FC<{ id: string; titulo?: string; at?: number }> = ({ id, titulo, at = 0 }) => {
  const f = useCurrentFrame();
  const l = linhaPorId(id);
  const p = interpolate(f, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const museu = l.museu.replace("Musée du Louvre", "Louvre").replace("Vorderasiatisches Museum, Berlim", "Berlim").replace(/\s*\(.*\)$/, "");
  const linha = l.linha.replace("anverso, ", "").replace("col.", "col.");
  return (
    <div style={{ opacity: p, textAlign: "center", fontFamily: FONT_BODY, color: C.argilaClara }}>
      {titulo && <div style={{ fontFamily: FONT_TITLE, fontSize: 54, fontWeight: 640, color: C.osso, marginBottom: 6 }}>{titulo}</div>}
      <div style={{ fontSize: 44, fontWeight: 600 }}>
        {museu} · {linha}
      </div>
    </div>
  );
};
