import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Body, Center, clamp, Rise, Title } from "../components/ui";
import { C } from "../theme";
import { SceneProps, wordFrame } from "./helpers";


// 4. A data, grande, com a faixa de Uruk IV.
export const DateScene: React.FC<SceneProps> = ({ from }) => {
  const f = useCurrentFrame();
  const writing = wordFrame("onde", 20, from);
  return (
    <AbsoluteFill>
      <Center top={300}>
        <Rise at={0}>
          <Body size={46} color={C.ocre} style={{ fontWeight: 650 }}>
            Uruk, por volta de
          </Body>
        </Rise>
        <Rise at={4} dy={40}>
          <Title size={150} color={C.osso} style={{ fontVariantNumeric: "lining-nums", whiteSpace: "nowrap" }}>
            3300–3200
          </Title>
        </Rise>
        <Rise at={wordFrame("onde", 17, from) - 4}>
          <Title size={80} color={C.argilaClara}>
            antes de Cristo
          </Title>
        </Rise>
      </Center>
      <Center top={760}>
        <div style={{ opacity: interpolate(f, [writing - 6, writing + 8], [0, 1], clamp), translate: `0px ${interpolate(f, [writing - 6, writing + 8], [30, 0], clamp)}px` }}>
          <Title size={110} color={C.ouro}>
            surge a escrita
          </Title>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

