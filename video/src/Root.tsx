import React from "react";
import { Composition } from "remotion";
import "./fonts";
import timeline from "./data/timeline.json";
import { Main } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TikTokSumerio"
        component={Main}
        durationInFrames={timeline.durationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ safeAreaDebug: false }}
      />
    </>
  );
};
