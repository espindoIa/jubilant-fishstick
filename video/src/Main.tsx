import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ClayBackground, Dust, SlowCamera } from "./components/Atmosphere";
import { Captions } from "./components/Captions";
import timeline from "./data/timeline.json";
import { SceneProps } from "./scenes/helpers";
import { DateScene } from "./scenes/Part1";
import { FamilyIE, FamilySemitic, Isolate, IsolateAlone, LugalBuild } from "./scenes/Part2";
import { DingirAn, SignRoles, StylusScene } from "./scenes/Part3";
import { CtaFollow, Latin, TimelineSpoken } from "./scenes/Part4";
import {
  BilingueLinha,
  ConeEnmetena,
  ContasFoto,
  CtaSelo,
  Emesal,
  EnlilLinha,
  GudeaLinha,
  Halevy,
  HookFoto,
  HookPergunta,
  ListaArcaica,
  MapaNinive,
  MapaUruk,
  MarcaQuemAge,
  Pronuncia,
  Proverbio,
  RespostaTitulo,
} from "./scenes/Part5";
import { C, SAFE } from "./theme";

const SCENES: Record<string, React.FC<SceneProps>> = {
  hookFoto: HookFoto,
  hookPergunta: HookPergunta,
  mapaUruk: MapaUruk,
  date: DateScene,
  contasFoto: ContasFoto,
  listaArcaica: ListaArcaica,
  isolate: Isolate,
  familySemitic: FamilySemitic,
  familyIE: FamilyIE,
  isolateAlone: IsolateAlone,
  lugalBuild: LugalBuild,
  marcaQuemAge: MarcaQuemAge,
  gudeaLinha: GudeaLinha,
  stylus: StylusScene,
  signRoles: SignRoles,
  dingirAn: DingirAn,
  coneEnmetena: ConeEnmetena,
  enlilLinha: EnlilLinha,
  timelineSpoken: TimelineSpoken,
  latin: Latin,
  proverbio: Proverbio,
  respostaTitulo: RespostaTitulo,
  bilingueLinha: BilingueLinha,
  pronuncia: Pronuncia,
  mapaNinive: MapaNinive,
  halevy: Halevy,
  emesal: Emesal,
  ctaSelo: CtaSelo,
  ctaFollow: CtaFollow,
};

// Blocos com fundo de lápis-lazúli (telas-chave de gramática e do sinal)
const LAPIS_BLOCKS = new Set(["gramatica", "determinativo", "resposta"]);

const SceneFrame: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(f, [dur - 4, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: Math.min(inP, outP), scale: interpolate(inP, [0, 1], [1.03, 1]) }}>{children}</AbsoluteFill>;
};

// Volume da trilha: ~18 dB abaixo da voz quando há narração (ver scripts/mix.sh)
export const MUSIC_GAIN_DB_WITH_VOICE = -18;

export const Main: React.FC<{ safeAreaDebug?: boolean }> = ({ safeAreaDebug }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.betume }}>
      {timeline.beats.map((b) => {
        const Scene = SCENES[b.type];
        if (!Scene) throw new Error(`tela sem componente: ${b.type}`);
        return (
          <Sequence key={`${b.type}-${b.from}`} name={b.type} from={b.from} durationInFrames={b.durationInFrames} premountFor={fps}>
            <ClayBackground tint={LAPIS_BLOCKS.has(b.block) ? "lapis" : "betume"} seed={b.from % 97} />
            <SceneFrame dur={b.durationInFrames}>
              <SlowCamera from={1} to={1.04}>
                <Scene from={b.from} dur={b.durationInFrames} />
              </SlowCamera>
            </SceneFrame>
          </Sequence>
        );
      })}
      <Dust />
      <Captions />
      {(timeline.audio as { src: string; fromFrame: number; block: string }[]).map((a) => (
        <Sequence key={a.src} name={`voz ${a.block}`} from={a.fromFrame} premountFor={fps}>
          <Audio src={staticFile(a.src)} />
        </Sequence>
      ))}
      {safeAreaDebug && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: SAFE.bottom, background: "rgba(255,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: SAFE.right, background: "rgba(255,0,0,0.35)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, height: 640, border: "3px dashed rgba(0,255,0,0.6)" }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
