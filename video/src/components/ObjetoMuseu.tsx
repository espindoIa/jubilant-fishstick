import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import imagens from "../data/imagens.json";
import { C, FONT_BODY, FONT_TITLE } from "../theme";

// Foto real de objeto do Met (Open Access, CC0), recortada do fundo
// (scripts/recortar-fotos.py), com movimento lento de câmera e etiqueta de museu.
export type Movimento = { de: { x: number; y: number; s: number }; para: { x: number; y: number; s: number } };

export const ObjetoMuseu: React.FC<{
  arquivo: string; // ex.: "img/protocuneiforme.jpg" (o recorte é usado automaticamente)
  largura: number; // largura base do objeto em px
  movimento?: Movimento;
  rotulo: string; // título curto em pt
  data: string;
  rotacao?: number;
  mostrarRotulo?: boolean;
  rotuloAt?: number;
}> = ({ arquivo, largura, movimento, rotulo, data, rotacao = 0, mostrarRotulo = true, rotuloAt = 8 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const meta = imagens.find((i) => i.arquivo === arquivo);
  if (!meta) throw new Error(`imagem sem metadados: ${arquivo}`);
  const recorte = arquivo.replace("img/", "img/recorte-").replace(/\.jpg$/, ".png");
  const t = interpolate(f, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const m = movimento ?? { de: { x: 0, y: 0, s: 1 }, para: { x: 0, y: 0, s: 1.08 } };
  const x = m.de.x + (m.para.x - m.de.x) * t;
  const y = m.de.y + (m.para.y - m.de.y) * t;
  const s = m.de.s + (m.para.s - m.de.s) * t;
  const rp = interpolate(f, [rotuloAt, rotuloAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ translate: `${x}px ${y}px`, scale: s, rotate: `${rotacao}deg` }}>
        {/* luz quente por trás, sombra no chão */}
        <div style={{ position: "absolute", inset: "-12%", background: "radial-gradient(closest-side, rgba(217,176,74,0.22), transparent)", filter: "blur(10px)" }} />
        <Img src={staticFile(recorte)} style={{ position: "relative", width: largura, filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.65)) contrast(1.06)" }} />
      </div>
      {mostrarRotulo && (
        <div style={{ marginTop: 34, opacity: rp, translate: `0px ${(1 - rp) * 16}px`, textAlign: "center", maxWidth: 840 }}>
          <div style={{ fontFamily: FONT_TITLE, fontSize: 52, fontWeight: 620, color: C.osso, lineHeight: 1.1 }}>{rotulo}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 44, fontWeight: 600, color: C.argilaClara, marginTop: 8 }}>
            {data} · Met {meta.numero_acesso}
          </div>
        </div>
      )}
    </div>
  );
};
