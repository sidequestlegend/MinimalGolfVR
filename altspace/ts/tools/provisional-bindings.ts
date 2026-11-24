// Writes a PROVISIONAL bindings.json: what the rules expect of the kit, until the kit builder (MiniGolfKitBuilder.cs,
// not written yet: no Unity in this step) exports the real one from the built prefab. Paths follow the upstream scene's
// own names (PORT.md 5.1 and VRGolfUI.cs:88-149) under a kit root laid out as PORT.md 8 proposes.
//
//   node tools/provisional-bindings.ts

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import data from "../src/levels.json" with { type: "json" };

type Obj = { path: string; sync: "none" | "transform"; grab: boolean; click: boolean; seat: boolean };

export function provisionalBindings(): Record<string, unknown> {
  const objects: Record<string, Obj> = {};
  const refs: string[] = [];
  const add = (key: string, path: string, opts: Partial<Obj> = {}, ref = true) => {
    objects[key] = { path, sync: "none", grab: false, click: false, seat: false, ...opts };
    if (ref) refs.push(key);
    return key;
  };
  const obj = (key: string) => ({ $obj: key });
  const tmp = (key: string) => ({ $comp: key, kind: "TMP" });

  add("gameSystems", "GameSystems", {}, false);
  add("course", "Course");
  const levels: string[] = [];
  const pads: string[] = [];
  data.levels.forEach((level, k) => {
    const path = `Course/Level ${k + 1} - ${level.levelName}`;
    levels.push(add(`level${k}`, path));
    pads.push(add(`aimPad${k}`, `${path}/AimPad`, { click: true }, false));
  });
  const balls: string[] = [];
  const picks: string[] = [];
  for (let s = 0; s < 8; s++) {
    balls.push(add(`ball${s}`, `Course/Balls/Ball ${s}`, { sync: "transform" }));
    picks.push(add(`ballPick${s}`, `Course/Balls/Ball ${s}/Pick`, { click: true }, false));
  }
  add("aimLine", "AimLine");
  add("board", "Board", {}, false);
  const ui = "Board/VR_UI";
  add("courseText", `${ui}/GamePlayCard/Course`);
  add("levelText", `${ui}/GamePlayCard/Level`);
  add("strokesText", `${ui}/GamePlayCard/Strokes`);
  add("parText", `${ui}/GamePlayCard/Par`);
  const pips: string[] = [];
  for (let i = 0; i < 8; i++) pips.push(add(`pip${i}`, `${ui}/GamePlayCard/ProgressGroup/Pip${i}`));
  add("powerCanvas", `${ui}/PowerMeter`);
  add("powerLabel", `${ui}/PowerMeter/Label`);
  add("powerPercent", `${ui}/PowerMeter/Percent`);
  const segs: string[] = [];
  for (let i = 0; i < 12; i++) segs.push(add(`seg${i}`, `${ui}/PowerMeter/Seg${i}`));
  add("feedbackCanvas", `${ui}/FeedbackToast`);
  add("feedbackText", `${ui}/FeedbackToast/Feedback`);
  add("courseCompleteCanvas", `${ui}/CourseComplete`);
  add("courseCompleteTotal", `${ui}/CourseComplete/ScoreBox/Total`);
  add("playAgainButton", `${ui}/CourseComplete/PlayAgain`, { click: true }, false);
  const lines: string[] = [];
  for (let i = 0; i < 10; i++) lines.push(add(`cardLine${i}`, `${ui}/Scorecard/Line${i}`));
  add("joinButton", `${ui}/Buttons/Join`, { click: true }, false);
  add("joinLabel", `${ui}/Buttons/Join/Label`);
  add("restartButton", `${ui}/Buttons/Restart`, { click: true }, false);

  const behaviours = [
    {
      id: "b1",
      type: "MinimalGolfGame",
      object: "gameSystems",
      fields: {
        course: obj("course"),
        levelObjects: levels.map(obj),
        aimPads: pads.map(obj),
        balls: balls.map(obj),
        ballPicks: picks.map(obj),
        ballAudio: balls.map((b) => ({ $comp: b, kind: "AudioSource" })),
        aimLine: obj("aimLine"),
        board: obj("board"),
        shotClips: [],
        holeClips: [],
        collisionClip: null,
      },
    },
    {
      id: "b2",
      type: "VRGolfUI",
      object: "board",
      fields: {
        game: { $beh: "b1" },
        courseText: tmp("courseText"),
        levelText: tmp("levelText"),
        strokesText: tmp("strokesText"),
        parText: tmp("parText"),
        pips: pips.map(obj),
        powerCanvas: obj("powerCanvas"),
        powerLabel: tmp("powerLabel"),
        powerPercent: tmp("powerPercent"),
        powerSegments: segs.map(obj),
        feedbackCanvas: obj("feedbackCanvas"),
        feedbackText: tmp("feedbackText"),
        courseCompleteCanvas: obj("courseCompleteCanvas"),
        courseCompleteTotal: tmp("courseCompleteTotal"),
        joinLabel: tmp("joinLabel"),
        cardLines: lines.map(tmp),
      },
    },
    { id: "b3", type: "GolfPlayer", perPlayer: true, fields: { game: { $beh: "b1" } } },
  ];
  const events = [
    { object: "joinButton", kind: "click", behaviour: "b1", method: "ToggleJoin" },
    { object: "restartButton", kind: "click", behaviour: "b1", method: "RestartMyHole" },
    { object: "playAgainButton", kind: "click", behaviour: "b1", method: "PlayAgain" },
    { kind: "graph", name: "golfCapture", behaviour: "b1", method: "OnGolfCapture" },
    { kind: "graph", name: "golfRest", behaviour: "b1", method: "OnGolfRest" },
    { kind: "graph", name: "golfImpact", behaviour: "b1", method: "OnGolfImpact" },
  ];
  return {
    schema: 1,
    slug: "mini-golf",
    hash: "",
    provisional:
      "PROVISIONAL: written by tools/provisional-bindings.ts, not by the kit builder. Paths, keys and the clip lists will change when MiniGolfKitBuilder.cs exports the real file from the built prefab.",
    bundles: { windows: "", android: "" },
    objects,
    refs,
    behaviours,
    events,
  };
}

if (argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)) {
  const target = fileURLToPath(new URL("../bindings.json", import.meta.url));
  writeFileSync(target, JSON.stringify(provisionalBindings(), null, 2) + "\n");
  console.log(`wrote ${target}`);
}
