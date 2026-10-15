import React from "react";
import { geoPath, geoTransform } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import costa from "../data/geo/costa.json";
import lagos from "../data/geo/lagos.json";
import paises from "../data/geo/paises.json";
import relevo from "../data/geo/relevo.json";
import rios from "../data/geo/rios.json";
import sitios from "../data/geo/sitios.json";
import terra from "../data/geo/terra.json";
import { C, FONT_BODY, FONT_TITLE } from "../theme";

// ---------------------------------------------------------------------------
// Mapa real da Mesopotâmia (geografia de HOJE): Natural Earth 1:10m (domínio
// público) + coordenadas dos sítios no gazetteer Pleiades.
// Projeção: equidistante cilíndrica com paralelo padrão 31,5°N
//   x = (lon − lon0)·cos(31,5°)·k ,  y = (lat0 − lat)·k
// O relevo (raster equiretangular, bbox 38–52°E / 27–38,5°N) passa pela MESMA
// transformação afim, então vetores e raster ficam alinhados por construção.
// ---------------------------------------------------------------------------
const PHI0 = (31.5 * Math.PI) / 180;
const COS0 = Math.cos(PHI0);
const BB = relevo.bbox; // {oeste, sul, leste, norte}

export type Camera = { at: number; lon: number; lat: number; k: number }; // k = px por grau de latitude

const camAt = (frame: number, keys: Camera[]) => {
  if (frame <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      const t = interpolate(frame, [a.at, b.at], [0, 1], { easing: Easing.inOut(Easing.cubic) });
      // zoom interpolado em escala logarítmica (movimento de câmera natural)
      const k = Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * t);
      return { at: frame, lon: a.lon + (b.lon - a.lon) * t, lat: a.lat + (b.lat - a.lat) * t, k };
    }
  }
  return keys[keys.length - 1];
};

export type Sitio = { nome: string; destaque?: boolean; at?: number; dx?: number; dy?: number; anchor?: "start" | "end" | "middle" };

export const MapaReal: React.FC<{
  width: number;
  height: number;
  camera: Camera[];
  sitios: Sitio[];
  drawRiversFrom?: number; // frame em que os rios começam a ser traçados
  iraque?: { at: number }; // contorno do Iraque de hoje
  rotuloHoje?: string;
}> = ({ width, height, camera, sitios: mostrar, drawRiversFrom = 0, iraque, rotuloHoje = "geografia de hoje" }) => {
  const frame = useCurrentFrame();
  const cam = camAt(frame, camera);
  const px = (lon: number, lat: number): [number, number] => [
    width / 2 + (lon - cam.lon) * COS0 * cam.k,
    height / 2 + (cam.lat - lat) * cam.k,
  ];
  const proj = geoTransform({
    point(lon: number, lat: number) {
      const [x, y] = px(lon, lat);
      this.stream.point(x, y);
    },
  });
  const path = geoPath(proj);
  const fc = (d: unknown) => d as FeatureCollection;
  // retângulo do raster na tela
  const [rx0, ry0] = px(BB.oeste, BB.norte);
  const [rx1, ry1] = px(BB.leste, BB.sul);
  const riverP = interpolate(frame, [drawRiversFrom, drawRiversFrom + 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const iraqP = iraque ? interpolate(frame, [iraque.at, iraque.at + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.55)" }}>
      {/* mar (lápis) por baixo */}
      <div style={{ position: "absolute", inset: 0, background: C.lapisProfundo }} />
      <Img
        src={staticFile(relevo.arquivo)}
        style={{
          position: "absolute",
          left: rx0,
          top: ry0,
          width: rx1 - rx0,
          height: ry1 - ry0,
          // tons de argila: o relevo real em sépia
          filter: "sepia(0.9) saturate(1.3) hue-rotate(-12deg) brightness(0.62) contrast(1.25)",
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="vinheta-mapa" cx="50%" cy="45%" r="75%">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#0b0603" stopOpacity={0.55} />
          </radialGradient>
        </defs>
        {/* mar em lápis-lazúli: retângulo da tela menos a terra (regra evenodd) */}
        <path d={`M0 0H${width}V${height}H0Z ${path(fc(terra)) ?? ""}`} fill={C.lapisProfundo} fillRule="evenodd" opacity={0.92} />
        {/* vinheta quente sobre a terra */}
        <rect width={width} height={height} fill="url(#vinheta-mapa)" />
        {fc(lagos).features.map((f, i) => (
          <path key={`l${i}`} d={path(f) ?? ""} fill="#3d5fb0" opacity={0.85} />
        ))}
        {/* fronteiras de hoje */}
        {fc(paises).features.map((f, i) => (
          <path
            key={`p${i}`}
            d={path(f) ?? ""}
            fill="none"
            stroke={C.osso}
            strokeOpacity={0.35}
            strokeWidth={1.6}
            strokeDasharray="6 7"
          />
        ))}
        {iraque &&
          fc(paises)
            .features.filter((f) => (f.properties as { destaque?: boolean }).destaque)
            .map((f, i) => (
              <path key={`iq${i}`} d={path(f) ?? ""} fill={C.ouro} fillOpacity={0.08 * iraqP} stroke={C.ouro} strokeOpacity={0.8 * iraqP} strokeWidth={3} strokeDasharray="10 8" />
            ))}
        <path d={path(fc(costa)) ?? ""} fill="none" stroke={C.argilaClara} strokeOpacity={0.55} strokeWidth={1.6} />
        {/* rios: traçado animado, principais mais grossos */}
        {fc(rios).features.map((f, i) => {
          const principal = (f.properties as { principal?: boolean }).principal;
          return (
            <path
              key={`r${i}`}
              d={path(f) ?? ""}
              fill="none"
              stroke={principal ? "#7fa6ff" : "#7fa6ff"}
              strokeOpacity={principal ? 0.95 : 0.5}
              strokeWidth={principal ? 4.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - riverP}
            />
          );
        })}
        {/* sítios (Pleiades) */}
        {mostrar.map((s) => {
          const d = sitios.find((x) => x.nome_pt.split(" (")[0] === s.nome);
          if (!d) throw new Error(`sítio ${s.nome} não está em sitios.json`);
          const [x, y] = px(d.lon, d.lat);
          const p = interpolate(frame, [s.at ?? 0, (s.at ?? 0) + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2)) });
          const r = s.destaque ? 13 : 7;
          const fs = s.destaque ? 64 : 44; // texto ≥ 44 px
          return (
            <g key={s.nome} opacity={Math.min(1, p * 1.4)} transform={`translate(${x} ${y})`}>
              {s.destaque && <circle r={30 * p} fill="none" stroke={C.ouro} strokeWidth={4} />}
              <circle r={r * p} fill={s.destaque ? C.ouro : C.osso} stroke={C.betume} strokeWidth={2} />
              <text
                x={s.dx ?? 16}
                y={s.dy ?? 10}
                textAnchor={s.anchor ?? "start"}
                fill={s.destaque ? C.ouro : C.osso}
                fontFamily={s.destaque ? FONT_TITLE : FONT_BODY}
                fontWeight={s.destaque ? 680 : 650}
                fontSize={fs}
                stroke={C.betume}
                strokeWidth={6}
                paintOrder="stroke"
              >
                {s.nome}
              </text>
            </g>
          );
        })}
      </svg>
      {/* rótulo de época + crédito dos dados */}
      <div
        style={{
          position: "absolute",
          left: 18,
          bottom: 14,
          fontFamily: FONT_BODY,
          fontSize: 44,
          fontWeight: 650,
          color: C.osso,
          background: "rgba(23,16,11,0.7)",
          padding: "6px 12px",
          borderRadius: 10,
        }}
      >
        {rotuloHoje}
      </div>
    </div>
  );
};
