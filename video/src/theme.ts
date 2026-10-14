// Tokens de cor e tipo — ver ../../design.md
export const C = {
  betume: "#17100B",
  betumeSoft: "#241911",
  argila: "#B98A5E",
  argilaEscura: "#8A6440",
  argilaClara: "#E6C9A0",
  ocre: "#C8902E",
  terracota: "#A4462F",
  terracotaViva: "#C9583A",
  lapis: "#1E3A8A",
  lapisProfundo: "#14245A",
  ouro: "#D9B04A",
  osso: "#F4EAD8",
} as const;

export const W = 1080;
export const H = 1920;
// Áreas seguras do TikTok
export const SAFE = { left: 80, right: 150, top: 120, bottom: 250 } as const;
export const CONTENT_W = W - SAFE.left - SAFE.right; // 850
export const CONTENT_CX = SAFE.left + CONTENT_W / 2; // 505

export const FONT_TITLE = "Fraunces";
export const FONT_BODY = "Archivo";
export const FONT_CUNEI = "Noto Sans Cuneiform";
