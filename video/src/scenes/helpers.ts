import timeline from "../data/timeline.json";

export type SceneProps = { from: number; dur: number };

// Frame local (relativo ao início da tela) em que a palavra `idx` do bloco começa a ser falada.
export const wordFrame = (block: string, idx: number, from: number, fps = 30) => {
  const b = timeline.blocks.find((x) => x.id === block);
  if (!b) throw new Error(`bloco ${block}`);
  const w = timeline.words[b.firstWord + idx];
  if (!w) throw new Error(`palavra ${idx} de ${block}`);
  return Math.round((w.startMs / 1000) * fps) - from;
};
