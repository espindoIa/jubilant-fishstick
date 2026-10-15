import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONT_BODY, FONT_CUNEI, FONT_TITLE } from "./theme";

export const fontsReady = Promise.all([
  loadFont({ family: FONT_TITLE, url: staticFile("fonts/Fraunces.ttf"), weight: "100 900" }),
  loadFont({ family: FONT_BODY, url: staticFile("fonts/Archivo.ttf"), weight: "100 900" }),
  loadFont({ family: FONT_CUNEI, url: staticFile("fonts/NotoSansCuneiform-Regular.ttf") }),
]);
