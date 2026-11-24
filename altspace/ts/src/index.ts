// Mini Golf: the rules of dilmerv/MinimalGolfVR (MIT), made multiplayer, on the portkit runtime. The build reads the
// default export. PORT.md has the checklist, the design and what was left out.

import type { GameDefinition, GameInstance } from "../portkit/src/index.ts";
import { GolfPlayer } from "./GolfPlayer.ts";
import { MinimalGolfGame } from "./MinimalGolfGame.ts";
import { ScorecardLines, VRGolfUI } from "./VRGolfUI.ts";

const game: GameDefinition = {
  slug: "mini-golf",
  behaviours: { MinimalGolfGame, VRGolfUI, GolfPlayer },
  // Play-mode readers beside digest, state, referee and players.
  debug: (instance: GameInstance) => {
    const golf = () => instance.behaviour<MinimalGolfGame>("b1");
    return {
      hole: () => golf().currentLevelIndex,
      card: () => ScorecardLines(golf().card, golf().currentLevelIndex).join("\n"),
      layout: () => golf().slotOf.slice(),
    };
  },
};

export default game;
