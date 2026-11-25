// Mini Golf: the rules of dilmerv/MinimalGolfVR (MIT), made multiplayer, on the portkit runtime. The build reads the
// default export. PORT.md has the checklist, the design and what was left out.

import { Vector3, type GameDefinition, type GameInstance } from "../portkit/src/index.ts";
import { GolfPlayer } from "./GolfPlayer.ts";
import { MinimalGolfGame } from "./MinimalGolfGame.ts";
import { ScorecardLines, VRGolfUI } from "./VRGolfUI.ts";

const xyz = (v: { x: number; y: number; z: number }) => [v.x, v.y, v.z];

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
      // for the Play-mode tests (playtest/golf-playtest.js)
      pathOf: (key: string) => instance.bindings.objects[key]?.path ?? "",
      revealing: () => golf().IsRevealing(),
      courseComplete: () => golf().courseComplete,
      holeWorld: () => (golf().CurrentLevel ? xyz(golf().HoleWorld()) : null),
      spawnWorld: () => (golf().CurrentLevel ? xyz(golf().SpawnWorld()) : null),
      ballWorld: (slot: number) => (golf().balls[slot] ? xyz(golf().balls[slot]!.transform.position) : null),
      me: () => {
        const p = golf().LocalPlayer();
        if (!p) return null;
        return {
          slot: p.slot, hole: p.hole, levelStrokes: p.levelStrokes, holeStrokes: p.holeStrokes, totalStrokes: p.totalStrokes,
          finished: p.finished, capturing: p.capturing, ballLive: p.ballLive, canAct: p.CanTakeAction(), aiming: p.aiming,
          shotPower: p.shotPower, shotNumber: p.shotNumber, restShot: p.restShot, atRest: p.atRest, feedback: p.feedback,
          feedbackLeft: p.feedbackUntil - p.Time.time, captures: p.captures,
        };
      },
      local: (x: number, y: number, z: number) => {
        const level = golf().CurrentLevel;
        return level ? xyz(level.InverseTransformPoint(new Vector3(x, y, z), golf().frame, golf().LevelPosition(level.index))) : null;
      },
      myUid: () => golf().Networking.LocalPlayer.uid,
      mySid: () => golf().Networking.LocalPlayer.sid,
      rows: () => golf().card.map((r) => ({ uid: r.uid, name: r.name, slot: r.slot, strokes: r.strokes.slice(), left: r.left })),
      seat: (uid: string) => golf().SlotOf(uid),
      // test levers (Play mode only): put the own ball somewhere (as physics or a hand could), and, on the referee, load a level
      moveBall: (x: number, y: number, z: number) => {
        const p = golf().LocalPlayer();
        const ball = p && p.slot >= 0 ? golf().balls[p.slot] : null;
        if (!ball || !p) return false;
        // The page's own copy and the body in Unity, as InstantiateBallAtSpawn does. A bare transform write on the
        // interpolated, dynamic Rigidbody was lost in one Play-mode run of two (2026-11-25): Unity's ball never left
        // the green and the page never saw it outside. `place` sets the body's position and velocities.
        const at = new Vector3(x, y, z);
        ball.transform.position = at;
        golf().relay.place(ball.key, at, p.shotNumber);
        return true;
      },
      newRound: () => {
        if (!golf().Networking.IsReferee) return false;
        golf().StartRound(false);
        return true;
      },
      loadLevel: (level: number) => {
        if (!golf().Networking.IsReferee) return false;
        golf().LoadLevel(level);
        return true;
      },
      result: (uid: string, hole: number) => golf().ResultFor(uid, hole),
    };
  },
};

export default game;
