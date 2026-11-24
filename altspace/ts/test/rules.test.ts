// Rules that need no room: the level table, the scorecard, settings, scaling, messages.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { leafBudget, Vector3 } from "../portkit/src/index.ts";
import * as Round from "../src/GolfRound.ts";
import game from "../src/index.ts";
import { GolfAim, HoleResult, LevelMessage, readSettings, scaledTuning, TUNING } from "../src/MinimalGolfGame.ts";
import { CourseFrame, LEVELS, SLOTS, TOTAL_PAR } from "../src/MiniGolfLevel.ts";
import { levelsJson } from "../tools/levels-from-port.ts";
import { bindings } from "./helpers.ts";

const port = readFileSync(fileURLToPath(new URL("../../PORT.md", import.meta.url)), "utf8");

test("levels.json is exactly what PORT.md's level table gives (npm run levels)", () => {
  const onDisk = readFileSync(fileURLToPath(new URL("../src/levels.json", import.meta.url)), "utf8").replace(/\r\n/g, "\n");
  assert.equal(onDisk, levelsJson(port));
});

test("all 8 upstream levels, in order, with their pars (A1)", () => {
  assert.deepEqual(
    LEVELS.map((l) => [l.levelName, l.par]),
    [
      ["THE WARM UP", 2],
      ["THE GARDEN", 3],
      ["WINDMILL WAY", 4],
      ["BUMPER BEND", 4],
      ["GRAND TOUR", 5],
      ["HILLSIDE TURN", 4],
      ["EASY ASCENT", 4],
      ["SUMMIT RUN", 6],
    ],
  );
  assert.equal(TOTAL_PAR, 32);
  assert.deepEqual(SLOTS[7]!.toString(), new Vector3(-40, 0, 89).toString());
  assert.deepEqual(
    LEVELS.map((l) => Math.round(l.revealAnimator.TotalDuration * 1000) / 1000),
    [1.235, 1.62, 1.73, 1.675, 1.785, 2.06, 1.675, 1.62],
    "A9's reveal lengths",
  );
  assert.equal(LEVELS[6]!.provisional, true, "level 7's hole centre is still to be confirmed in the editor");
});

test("messages are upstream's strings (A6, C5 with K1 fixed)", () => {
  assert.equal(LevelMessage(0, "THE WARM UP"), "LEVEL 1  •  THE WARM UP");
  assert.equal(HoleResult(1, 2), "UNDER PAR!");
  assert.equal(HoleResult(2, 2), "ON PAR!");
  assert.equal(HoleResult(5, 2), "+3 OVER PAR");
});

test("the shot model at the upstream scale: limits of the pull and of the impulse (B6, B9, B10)", () => {
  const aim = new GolfAim(TUNING);
  assert.equal(aim.BeginVRAim(new Vector3(0, 0, 0), 0, true), true);
  aim.UpdateVRAim(new Vector3(0, 0.4, -0.08)); // half of the 16 cm full pull, and vertical motion ignored
  assert.equal(aim.shotPower, 0.5);
  assert.deepEqual(aim.aimDirection.toString(), new Vector3(0, 0, 1).toString(), "the ball goes away from the hand (a slingshot)");
  aim.UpdateVRAim(new Vector3(0, 0, -0.5)); // beyond full pull
  assert.equal(aim.shotPower, 1);
  const impulse = aim.TryEndVRAimAndShoot(true)!;
  assert.equal(impulse.z, 2, "full power is the maximum impulse, 2");
  assert.equal(aim.TryApplyShot(new Vector3(1, 0, 0), 0, true), null, "power 0 is under the minimum");
  assert.equal(aim.TryApplyShot(new Vector3(1, 0, 0), 0.001, true)!.x, 0.005 + (2 - 0.005) * 0.001);
  assert.equal(aim.TryApplyShot(new Vector3(0, 1, 0), 1, true), null, "a vertical direction does not shoot");
  assert.equal(aim.TryApplyShot(new Vector3(1, 0, 0), 1, false), null, "a moving ball does not shoot");
});

test("table-scale scales world distances, speeds and impulses, not the power floor", () => {
  const t = scaledTuning(2);
  assert.equal(t.vrMaximumDragDistance, 0.32);
  assert.equal(t.maximumImpulse, 4);
  assert.equal(t.vrMinShotPower, TUNING.vrMinShotPower);
  const frame = CourseFrame.fromSettings(new Map([["table-scale", "0.1"], ["position", "1 2 3"]]));
  assert.equal(frame.factor, 2);
  assert.deepEqual(frame.toWorld(new Vector3(10, 0, 0)).toString(), new Vector3(2, 2, 3).toString());
});

test("settings: defaults as PORT.md 8.2 proposes, and bad values fall back", () => {
  const d = readSettings(new Map());
  assert.deepEqual(d, { maxPlayers: 8, holeTimeout: 120, strokeLimit: 0, desktopAim: "pull", reveal: true, haptics: true, showOtherLevels: true });
  const s = readSettings(new Map([["max-players", "20"], ["stroke-limit", "6"], ["hole-timeout", "x"], ["desktop-aim", "target"], ["haptics", "false"]]));
  assert.equal(s.maxPlayers, 8);
  assert.equal(s.strokeLimit, 6);
  assert.equal(s.holeTimeout, 120);
  assert.equal(s.desktopAim, "target");
  assert.equal(s.haptics, false);
});

test("scorecard: seats, joining late, finishing a hole, leaving, totals", () => {
  const rows: Round.CardRow[] = [Round.newRow("a", "Ann", 0, 0), Round.newRow("b", "Bob", 1, 0)];
  assert.equal(Round.freeSlot(rows, 8), 2);
  assert.equal(Round.freeSlot(rows, 2), -1, "max-players 2: full");
  assert.equal(Round.holeFinished(rows, 0), false);
  assert.ok(Round.record(rows[0]!, 0, 3, ""));
  assert.equal(Round.record(rows[0]!, 0, 9, ""), false, "a recorded hole never changes");
  assert.equal(Round.holeFinished(rows, 0), false, "Bob is still out");
  rows[1]!.left = true;
  rows[1]!.leftAt = 100;
  assert.equal(Round.holeFinished(rows, 0), true, "a player who left does not block the hole");
  assert.equal(Round.releaseSeats(rows, 120), false, "the seat is kept for 30 s");
  assert.equal(Round.releaseSeats(rows, 130), true);
  assert.equal(rows[1]!.slot, -1);
  assert.equal(Round.joinHole(3, false, false), 3, "a late joiner starts at the current hole");
  assert.equal(Round.joinHole(3, true, false), 4, "or the next, when this one is already decided");
  assert.equal(Round.joinHole(7, false, true), Round.HOLES);
  const cat = Round.newRow("c", "Cat", 1, 3);
  Round.record(cat, 3, 4, "max");
  assert.equal(Round.rowLine(cat, 4), "Cat            -   -   -  4x   .                4");
  assert.equal(Round.rowTotal(cat), 4);
  assert.deepEqual(Round.resetCard([...rows, cat]).map((r) => [r.uid, r.slot, r.joined]), [["a", 0, 0], ["c", 1, 0]], "a new round keeps the seated, drops the departed");
});

test("the game's state fits the room's key budget", () => {
  const budget = leafBudget(bindings, (type) => {
    const cls = game.behaviours[type];
    return cls ? { synced: (cls.synced ?? []).length, perPlayer: cls.perPlayer === true } : null;
  });
  assert.ok(budget.spaceLeaves <= 10, `this game uses ${budget.spaceLeaves} space-state leaves per copy`);
  assert.ok(budget.userLeavesPerPlayer <= 6);
});

test("bindings are marked provisional until the kit builder writes them", () => {
  assert.match(bindings.provisional, /PROVISIONAL/);
  assert.equal(bindings.slug, "mini-golf");
  assert.equal(bindings.behaviours.length, 3);
});
