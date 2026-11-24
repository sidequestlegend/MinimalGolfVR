// Rung 1 on the fake room: several players, virtual time, the per-ball graph played by the test (helpers.ts).

import assert from "node:assert/strict";
import { test } from "node:test";
import { Button, Hand, Quaternion, Vector3 } from "../portkit/src/index.ts";
import type { FakeClient } from "../portkit/src/platform/fake.ts";
import { HOLED, OUT_OF_TIME, PICKED_UP } from "../src/GolfPlayer.ts";
import { ADVANCE_SECONDS } from "../src/MinimalGolfGame.ts";
import { LEVELS } from "../src/MiniGolfLevel.ts";
import { Golf, SLUG, near } from "./helpers.ts";

async function table(names: string[], options: Record<string, string> = {}, seed = 1) {
  const g = new Golf(seed);
  const clients = names.map((n) => g.join(n, { elements: [options] }));
  await g.world.settle();
  for (const c of clients) await g.seat(c);
  return { g, clients };
}

test("three players play a hole to the end: free putting, a shared card, the next hole 2.05 s after the last one holes out", async () => {
  const { g, clients } = await table(["Ann", "Bob", "Cat"]);
  const [ann, bob, cat] = clients as [FakeClient, FakeClient, FakeClient];
  assert.deepEqual(clients.map((c) => g.slot(c)), [0, 1, 2], "a ball each");
  for (const c of clients) await g.ready(c);

  // Everyone's ball is where the level's reset point is, and everyone sees the other balls.
  const spawn = g.golf(ann).SpawnWorld();
  for (const c of clients) near(Vector3.Distance(g.ball(c), spawn), 0, 1e-9, "ball at the reset point");
  await g.run(500);
  for (const viewer of clients) for (let s = 0; s < 3; s++) assert.equal(g.shown(viewer, `ball${s}`), true, `${viewer.name} sees ball ${s}`);
  for (let s = 3; s < 8; s++) assert.equal(g.shown(ann, `ball${s}`), false, "unused balls are hidden");

  // Each ball is owned by its player (the room's object owner), so their physics moves it for everyone.
  for (const c of clients) assert.equal(g.world.room.serverObjectOwner(`pk1/mini-golf/0/ball${g.slot(c)}`), c.sid);

  // Free play: they putt in any order. The impulse is upstream's: half pull = power 0.5, lerp(0.005, 2, 0.5).
  const first = await g.putt(bob, new Vector3(0, 0, -0.08));
  assert.ok(first);
  near(first.impulse.magnitude, 0.005 + (2 - 0.005) * 0.5, 1e-6, "impulse");
  assert.equal(g.me(bob).levelStrokes, 1);
  assert.equal(await g.putt(bob, new Vector3(0, 0, -0.08)), null, "no second putt while the ball rolls (B1)");
  assert.equal(g.me(bob).feedback, "WAIT FOR THE BALL");
  await g.rest(bob, g.ball(bob).add(new Vector3(0, 0, 0.1)));

  await g.playHole(ann, 2); // par
  assert.equal(g.me(ann).feedback, "HOLE COMPLETE  •  ON PAR!");
  await g.playHole(cat, 1);
  assert.equal(g.me(cat).feedback, "HOLE COMPLETE  •  UNDER PAR!");
  await g.run(4000);
  assert.equal(g.golf(ann).currentLevelIndex, 0, "the hole waits for Bob");
  assert.equal(g.golf(ann).holeDoneAt, 0);

  await g.playHole(bob, 3); // three more: four in all, +2
  assert.equal(g.me(bob).holeStrokes, 4);
  assert.equal(g.me(bob).feedback, "HOLE COMPLETE  •  +2 OVER PAR");
  await g.until(() => g.golf(ann).holeDoneAt > 0, "the referee sees everyone done");
  const doneAt = g.golf(ann).holeDoneAt;
  await g.run(1500);
  assert.equal(g.golf(cat).currentLevelIndex, 0, "not before 2.05 s");
  await g.until(() => clients.every((c) => g.golf(c).currentLevelIndex === 1), "level 2 everywhere");
  assert.ok(g.golf(cat).revealStart - doneAt >= ADVANCE_SECONDS - 0.06, "2.05 s after the last hole-out");

  // The card, as every client sees it.
  for (const c of clients) {
    const card = g.golf(c).card;
    assert.deepEqual(card.map((r) => [r.name, r.strokes[0]]), [["Ann", 2], ["Bob", 4], ["Cat", 1]]);
  }
  // Level 2 for everyone: strokes to 0, totals kept, the level message, the layout swapped (level 2 at the play spot).
  await g.until(() => g.me(ann).hole === 1, "Ann on level 2");
  assert.equal(g.me(ann).levelStrokes, 0);
  assert.equal(g.me(bob).totalStrokes, 4);
  assert.equal(g.me(ann).feedback, "LEVEL 2  •  THE GARDEN");
  assert.deepEqual(g.golf(bob).slotOf.slice(0, 2), [1, 0]);
  assert.equal(g.ui(ann).cardLines[2]!.text.slice(0, 16), "Ann            2");
  await g.run(3000);
  assert.ok(g.world.agree(), "every client has the same synced state");
  assert.deepEqual(g.problems(), []);
});

test("out of bounds: the ball comes back to the reset point, BALL RETURNED, no stroke (D1, D2)", async () => {
  const { g, clients } = await table(["Ann"]);
  const [ann] = clients as [FakeClient];
  await g.ready(ann);
  await g.putt(ann, new Vector3(0.05, 0, -0.05));
  assert.equal(g.me(ann).levelStrokes, 1);
  const golf = g.golf(ann);
  const level = LEVELS[0]!;
  // Off the side: |x| > width/2 + 2.5 level units.
  const off = golf.frame.toWorld(golf.LevelPosition(0).add(new Vector3(level.courseWidth / 2 + 2.6, 0.3, 0)));
  const placesBefore = g.ops(ann, "place").length;
  ann.move(SLUG, "0", "ball0", off);
  await g.until(() => g.me(ann).feedback === "BALL RETURNED", "BALL RETURNED");
  await g.run(200);
  assert.equal(g.me(ann).levelStrokes, 1, "no penalty stroke");
  assert.equal(g.me(ann).totalStrokes, 1);
  near(Vector3.Distance(g.ball(ann), golf.SpawnWorld()), 0, 1e-9, "back at the reset point");
  const place = g.ops(ann, "place").slice(placesBefore);
  assert.equal(place.length, 1, "the ball graph is told to reset the ball (velocities, scale)");
  assert.ok(g.me(ann).CanTakeAction(), "and the player may putt again at once");
  // ResetBall buzzes both controllers (0.4; upstream 0.3/0.4 frequency/amplitude). In the app a desktop player feels nothing.
  assert.deepEqual(ann.haptics.slice(-2).map((h) => [h.side, h.strength]), [[0, 0.4], [1, 0.4]]);
  // Falling through: y < -2.25 level units.
  const below = golf.frame.toWorld(golf.LevelPosition(0).add(new Vector3(0, -2.3, 0)));
  ann.move(SLUG, "0", "ball0", below);
  await g.until(() => g.ops(ann, "place").length === placesBefore + 2, "returned again");
  assert.deepEqual(g.problems(), []);
});

test("the stroke limit: a player picks up after the last allowed stroke stops; the hole can end", async () => {
  const { g, clients } = await table(["Ann", "Bob"], { "stroke-limit": "3" });
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.playHole(bob, 2);
  await g.ready(ann);
  for (let i = 0; i < 3; i++) {
    await g.ready(ann);
    assert.ok(await g.putt(ann, new Vector3(0, 0, -0.03)));
    await g.rest(ann, g.ball(ann).add(new Vector3(0.01, 0, 0.01)));
  }
  await g.until(() => g.me(ann).finished === PICKED_UP, "picked up");
  assert.equal(g.me(ann).feedback, "STROKE LIMIT  •  PICKED UP");
  await g.until(() => g.golf(bob).currentLevelIndex === 1, "next hole");
  const row = g.golf(bob).RowOf(ann.uid)!;
  assert.equal(row.strokes[0], 3);
  assert.equal(row.marks[0], "max");
  assert.match(g.ui(bob).cardLines[2]!.text, /^Ann +3x/);
  assert.deepEqual(g.problems(), []);
});

test("hole timeout: 120 s after the first player holes out, the rest are recorded as out of time (not finished: par + 2 here)", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.ready(bob);
  await g.putt(bob, new Vector3(0, 0, -0.04));
  await g.rest(bob, g.ball(bob).add(new Vector3(0, 0, 0.05)));
  await g.playHole(ann, 2);
  await g.run(100_000);
  assert.equal(g.golf(ann).currentLevelIndex, 0);
  await g.until(() => g.me(bob).finished === OUT_OF_TIME, "Bob out of time", 30_000);
  assert.equal(g.me(bob).feedback, "OUT OF TIME");
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "next hole");
  assert.deepEqual(g.golf(ann).RowOf(bob.uid)!.strokes[0], LEVELS[0]!.par + 2, "one stroke so far: scored par + 2, never the 1 so far");
  assert.equal(g.golf(ann).RowOf(bob.uid)!.marks[0], "dnf");
});

test("a player leaves mid-hole: the hole does not wait for them, the slot is kept 30 s, then freed", async () => {
  const { g, clients } = await table(["Ann", "Bob", "Cat"]);
  const [ann, bob, cat] = clients as [FakeClient, FakeClient, FakeClient];
  await g.ready(bob);
  await g.putt(bob, new Vector3(0, 0, -0.05));
  await g.playHole(ann, 2);
  g.world.leave(bob);
  await g.until(() => g.golf(ann).RowOf(bob.uid)?.left === true, "Bob marked as left");
  await g.until(() => !g.shown(ann, "ball1"), "Bob's ball hidden");
  await g.playHole(cat, 3);
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "the hole ends without Bob");
  assert.equal(g.golf(ann).RowOf(bob.uid)!.slot, 1, "the seat is still Bob's for a while");
  await g.run(31_000);
  assert.equal(g.golf(ann).RowOf(bob.uid)!.slot, -1, "then it is freed");
  assert.match(g.ui(cat).cardLines.map((t) => t.text).join("\n"), /\(Bob\)/, "the row stays, marked as left");
  // Someone new takes the free ball.
  const dee = g.join("Dee");
  await g.world.settle();
  assert.equal(await g.seat(dee), 1);
  await g.until(() => g.world.room.serverObjectOwner("pk1/mini-golf/0/ball1") === dee.sid, "Dee owns ball 1");
  assert.deepEqual(g.problems(), []);
});

test("a player who reloads within the grace gets their ball and strokes back", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [, bob] = clients as [FakeClient, FakeClient];
  await g.ready(bob);
  await g.putt(bob, new Vector3(0, 0, -0.05));
  await g.rest(bob, g.ball(bob).add(new Vector3(0, 0, 0.05)));
  await g.run(1000);
  g.world.leave(bob);
  await g.run(5000);
  const again = g.join("Bob"); // the same player on the same device (the fake room keys localStorage by user id)
  await g.world.settle();
  await g.until(() => g.slot(again) === 1, "back in slot 1");
  await g.ready(again);
  assert.equal(g.me(again).levelStrokes, 1, "the stroke is still counted (saved on the device)");
  assert.equal(g.golf(again).RowOf(again.uid)!.left, false);
});

test("a late joiner starts at the current hole; earlier holes stay empty; their total counts what they played", async () => {
  const { g, clients } = await table(["Ann"]);
  const [ann] = clients as [FakeClient];
  await g.playHole(ann, 2);
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "hole 2");
  await g.playHole(ann, 3);
  await g.until(() => g.golf(ann).currentLevelIndex === 2, "hole 3");
  const cat = g.join("Cat");
  await g.world.settle();
  assert.equal(g.golf(cat).currentLevelIndex, 2, "the joiner sees the current hole");
  await g.seat(cat);
  assert.equal(g.golf(cat).RowOf(cat.uid)!.joined, 2);
  await g.ready(cat);
  near(Vector3.Distance(g.ball(cat), g.golf(cat).SpawnWorld()), 0, 1e-9, "ball at hole 3's reset point");
  await g.playHole(cat, 4);
  await g.playHole(ann, 4);
  await g.until(() => g.golf(ann).currentLevelIndex === 3, "hole 4");
  const line = g.ui(ann).cardLines.map((t) => t.text).find((t) => t.startsWith("Cat"))!;
  assert.match(line, /^Cat +- +- +4 /);
  assert.equal(g.me(cat).totalStrokes, 4);
  // Joining while the hole is decided (the 2.05 s wait) starts at the next one.
  await g.playHole(ann, 2);
  await g.playHole(cat, 2);
  await g.until(() => g.golf(ann).holeDoneAt > 0, "hole 4 decided");
  const dee = g.join("Dee");
  await g.world.settle();
  await g.seat(dee);
  assert.equal(g.golf(dee).RowOf(dee.uid)!.joined, 4);
  await g.until(() => g.golf(ann).currentLevelIndex === 4, "hole 5");
  await g.ready(dee);
  assert.ok(g.world.agree());
  assert.deepEqual(g.problems(), []);
});

test("the referee leaves during the wait before the next hole: the new referee advances on time", async () => {
  const { g, clients } = await table(["Ann", "Bob", "Cat"]);
  const referee = clients.find((c) => g.world.instance(c).networking.IsReferee)!;
  const others = clients.filter((c) => c !== referee);
  for (const c of clients) await g.playHole(c, 2);
  await g.until(() => g.golf(others[0]!).holeDoneAt > 0, "hole decided");
  g.world.leave(referee);
  await g.until(() => others.some((c) => g.world.instance(c).networking.IsReferee), "a new referee", 20_000);
  await g.until(() => g.golf(others[0]!).currentLevelIndex === 1, "level 2 under the new referee", 20_000);
  for (const c of others) await g.playHole(c, 3);
  await g.until(() => g.golf(others[1]!).currentLevelIndex === 2, "level 3: the departed referee does not block it", 40_000);
  assert.equal(g.golf(others[1]!).RowOf(referee.uid)!.left, true);
  assert.deepEqual(g.problems(), []);
});

test("two courses in one room stay separate", async () => {
  const g = new Golf(3);
  const both: Array<Record<string, string>> = [{}, { room: "north" }];
  const ann = g.join("Ann", { elements: both });
  const bob = g.join("Bob", { elements: both });
  await g.world.settle("0");
  await g.world.settle("north");
  await g.seat(ann, "0");
  await g.seat(bob, "north");
  assert.equal(g.slot(bob, "0"), -1);
  assert.equal(g.slot(ann, "north"), -1);
  await g.playHole(ann, 1, "0");
  await g.until(() => g.golf(bob, "0").currentLevelIndex === 1, "table 0 on level 2");
  assert.equal(g.golf(bob, "north").currentLevelIndex, 0, "the north table is still on level 1");
  assert.equal(g.golf(ann, "north").card.length, 1);
  assert.equal(g.golf(ann, "north").card[0]!.uid, bob.uid);
  // Separate balls, ids and state keys.
  assert.equal(g.world.room.serverObjectOwner("pk1/mini-golf/0/ball0"), ann.sid);
  assert.equal(g.world.room.serverObjectOwner("pk1/mini-golf/north/ball0"), bob.sid);
  const keys = g.world.room.stateKeys("pk1.mini-golf.");
  assert.ok(keys.every((k) => k.startsWith("pk1.mini-golf.0.") || k.startsWith("pk1.mini-golf.north.")));
  // A capture reported by table 0's graph does nothing on the north table.
  ann.graphEvent(SLUG, "north", "golfCapture", "0|1");
  await g.run(1000);
  assert.equal(g.me(bob, "north").finished, 0);
  assert.ok(g.world.agree("0") && g.world.agree("north"));
  assert.deepEqual(g.problems(), []);
});

test("the scorecard after all 8 holes, course complete, and PLAY AGAIN (D5, G5)", async () => {
  const { g, clients } = await table(["Ann", "Bob"], {}, 5);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  const annStrokes = [2, 3, 4, 3, 5, 4, 3, 6];
  const bobStrokes = [3, 2, 5, 4, 6, 5, 4, 7];
  for (let hole = 0; hole < 8; hole++) {
    await g.until(() => g.golf(ann).currentLevelIndex === hole && g.me(ann).hole === hole && g.me(bob).hole === hole, `hole ${hole + 1}`, 30_000);
    await g.playHole(ann, annStrokes[hole]!);
    await g.playHole(bob, bobStrokes[hole]!);
  }
  await g.until(() => g.golf(ann).courseComplete && g.golf(bob).courseComplete, "course complete", 30_000);
  const card = g.golf(bob).card;
  assert.deepEqual(card.find((r) => r.uid === ann.uid)!.strokes, annStrokes);
  assert.deepEqual(card.find((r) => r.uid === bob.uid)!.strokes, bobStrokes);
  assert.equal(g.me(ann).totalStrokes, 30);
  assert.equal(g.me(bob).totalStrokes, 36);
  await g.run(200);
  assert.equal(g.shown(ann, "courseCompleteCanvas"), true);
  assert.equal(ann.graph(SLUG).text.get("courseCompleteTotal"), "30");
  assert.equal(bob.graph(SLUG).text.get("courseCompleteTotal"), "36");
  const lines = g.ui(ann).cardLines.map((t) => t.text);
  assert.equal(lines[0], "PLAYER         1   2   3   4   5   6   7   8  TOT");
  assert.equal(lines[1], "PAR            2   3   4   4   5   4   4   6   32");
  assert.equal(lines[2], "Ann            2   3   4   3   5   4   3   6   30");
  assert.equal(lines[3], "Bob            3   2   5   4   6   5   4   7   36");
  assert.equal(ann.graph(SLUG).text.get("cardLine3"), lines[3]);
  for (let s = 0; s < 2; s++) assert.equal(g.shown(ann, `ball${s}`), false, "no balls once the course is complete");
  // PLAY AGAIN: everyone from level 1, totals 0, the card cleared (the layout keeps swapping, as upstream, K7).
  assert.ok(bob.click(SLUG, "0", "playAgainButton"));
  await g.until(() => !g.golf(ann).courseComplete && g.golf(ann).currentLevelIndex === 0, "a new round");
  await g.until(() => g.me(ann).totalStrokes === 0 && g.me(bob).totalStrokes === 0 && g.me(ann).hole === 0, "totals reset");
  assert.deepEqual(g.golf(ann).card.map((r) => r.strokes.every((s) => s === null)), [true, true]);
  assert.deepEqual(g.golf(ann).slotOf, [0, 2, 3, 4, 5, 6, 7, 1]);
  await g.ready(ann);
  assert.ok(g.world.agree());
  assert.deepEqual(g.problems(), []);
});

test("restart my hole: ball back, level strokes 0, total kept (D4, K2); not while sinking or done (K3 fixed)", async () => {
  const { g, clients } = await table(["Ann"]);
  const [ann] = clients as [FakeClient];
  await g.ready(ann);
  await g.putt(ann, new Vector3(0, 0, -0.05));
  await g.rest(ann, g.ball(ann).add(new Vector3(0, 0, 0.1)));
  assert.ok(ann.click(SLUG, "0", "restartButton"));
  await g.run(100);
  assert.equal(g.me(ann).feedback, "LEVEL RESTARTED");
  assert.equal(g.me(ann).levelStrokes, 0);
  assert.equal(g.me(ann).holeStrokes, 1, "the card still counts the restarted attempt");
  assert.equal(g.me(ann).totalStrokes, 1);
  near(Vector3.Distance(g.ball(ann), g.golf(ann).SpawnWorld()), 0, 1e-9);
  // R on the keyboard does the same (upstream's editor key).
  await g.putt(ann, new Vector3(0, 0, -0.05));
  await g.rest(ann);
  g.key(ann, "R");
  await g.run(100);
  assert.equal(g.me(ann).levelStrokes, 0);
  // During the capture: refused.
  await g.ready(ann);
  await g.putt(ann, new Vector3(0, 0, -0.05));
  ann.graphEvent(SLUG, "0", "golfCapture", `0|${g.me(ann).shotNumber}`);
  await g.run(100);
  assert.equal(g.me(ann).capturing, true);
  assert.equal(g.ops(ann, "sink").length, 1, "the capture move is started on the ball graph");
  g.key(ann, "R");
  await g.until(() => g.me(ann).finished === HOLED, "holed out anyway");
  assert.equal(g.me(ann).levelStrokes, 1);
  assert.equal(g.golf(ann).RowOf(ann.uid)!.strokes[0] ?? -1, -1, "not on the card until the referee sees it");
  await g.until(() => g.golf(ann).RowOf(ann.uid)!.strokes[0] === 3, "3 strokes on the card: 2 restarted and the one that dropped");
});

test("VR: hand near the ball, trigger, pull back, release putts; haptics on the aiming hand (B3 to B11)", async () => {
  const { g, clients } = await table(["Ann"]);
  const [ann] = clients as [FakeClient];
  await g.ready(ann);
  const ball = g.ball(ann);
  const head = ball.add(new Vector3(0, 0.5, -0.4));
  const pose = (right: Vector3) => ann.pose({ head: { position: head, rotation: Quaternion.identity }, leftHand: { position: head, rotation: Quaternion.identity }, rightHand: { position: right, rotation: Quaternion.identity } });
  // Too far: nothing happens.
  pose(ball.add(new Vector3(0, 0.02, -0.3)));
  await g.run(60);
  ann.input({ type: "button", button: Button.Trigger, side: Hand.Right, pressed: true });
  await g.run(100);
  assert.equal(g.me(ann).aiming, false, "out of reach (0.19 m)");
  ann.input({ type: "button", button: Button.Trigger, side: Hand.Right, pressed: false });
  await g.run(100);
  // In reach: aim, pull 12 cm back (power 0.75), release.
  pose(ball.add(new Vector3(0.02, 0.05, -0.05)));
  await g.run(60);
  ann.input({ type: "button", button: Button.Trigger, side: Hand.Right, pressed: true });
  await g.run(60);
  assert.equal(g.me(ann).aiming, true);
  pose(ball.add(new Vector3(0.02, 0.05, -0.17)));
  await g.run(100);
  near(g.me(ann).shotPower, 0.75, 1e-9, "power");
  assert.equal(ann.graph(SLUG).active.get("powerCanvas"), true, "the power meter shows while aiming");
  assert.equal(ann.graph(SLUG).text.get("powerPercent"), "75%");
  const line = g.ops(ann, "line").at(-1)!;
  assert.equal(line.args[0], "1", "the aiming line is on");
  ann.input({ type: "button", button: Button.Trigger, side: Hand.Right, pressed: false });
  await g.run(100);
  const impulse = g.impulses(ann).at(-1)!;
  near(Number(impulse.args[2]), 0.005 + (2 - 0.005) * 0.75, 1e-6, "impulse along +z, away from the pulled hand");
  assert.equal(g.me(ann).levelStrokes, 1);
  assert.equal(g.ops(ann, "line").at(-1)!.args[0], "0", "the line goes off");
});

test("graph events: capture is only honoured for the player's own ball and the latest shot's rest; impacts buzz with a cooldown", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.ready(ann);
  await g.ready(bob);
  ann.graphEvent(SLUG, "0", "golfCapture", "1|0"); // Bob's ball, reported on Ann's page: not hers
  await g.run(200);
  assert.equal(g.me(ann).capturing, false);
  assert.equal(g.me(bob).capturing, false);
  await g.putt(ann, new Vector3(0, 0, -0.05));
  ann.graphEvent(SLUG, "0", "golfRest", `0|${g.me(ann).shotNumber - 1}|1`); // an older shot's report
  await g.run(100);
  assert.equal(g.me(ann).CanTakeAction(), false);
  await g.rest(ann);
  assert.equal(g.me(ann).CanTakeAction(), true);
  // The assist is armed for the player's own ball only, with the hole's world position.
  const armed = g.ops(ann, "assist").filter((r) => r.args[0] === "1");
  assert.ok(armed.length > 0 && armed.every((r) => r.target === "ball0"));
  assert.equal(g.ops(bob, "assist").filter((r) => r.target === "ball0").length, 0, "Bob's page never arms Ann's ball");
});

test("each player's sounds and sinks reach the others: a remote capture starts the sink on their copy", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.playHole(ann, 1);
  await g.until(() => g.ops(bob, "sink").some((r) => r.target === "ball0"), "Bob's page sinks Ann's ball");
  assert.equal(g.seen(bob, ann)!.captures, 1);
});

test("a spectator sees the table and card but has no ball and cannot putt", async () => {
  const { g } = await table(["Ann"]);
  const eve = g.join("Eve");
  await g.world.settle();
  await g.run(3000);
  assert.equal(g.slot(eve), -1);
  assert.equal(g.me(eve).ballLive, false);
  assert.equal(eve.graph(SLUG).text.get("joinLabel"), "JOIN");
  assert.equal(eve.graph(SLUG).text.get("strokesText"), "-");
  assert.ok(eve.click(SLUG, "0", "aimPad0", new Vector3(0, 0, 0)));
  await g.run(200);
  assert.equal(g.me(eve).aiming, false);
  assert.match(eve.graph(SLUG).text.get("cardLine2") ?? "", /^Ann/);
});

test("desktop: target mode, arrow keys turn and strengthen the aim, Esc cancels, G holds the x-ray on the own ball", async () => {
  const { g, clients } = await table(["Ann"], { "desktop-aim": "target" });
  const [ann] = clients as [FakeClient];
  await g.ready(ann);
  const ball = g.ball(ann);
  // "target": the ball goes toward the click, 4 cm in front of it (+z): power 0.25.
  assert.ok(ann.click(SLUG, "0", "aimPad0", ball.add(new Vector3(0, 0, 0.04))));
  await g.run(60);
  const me = g.me(ann);
  near(me.shotPower, 0.25, 1e-9, "power from the click's distance");
  near(me.aim.aimDirection.z, 1, 1e-9, "toward the click");
  g.key(ann, "UpArrow");
  await g.run(60);
  near(me.shotPower, 0.25 + 1 / 12, 1e-9, "Up adds a twelfth of full power");
  g.key(ann, "LeftArrow");
  await g.run(60);
  near(Math.atan2(me.aim.aimDirection.x, me.aim.aimDirection.z) * (180 / Math.PI), -5, 1e-6, "Left turns the aim 5 degrees");
  g.key(ann, "Escape");
  await g.run(60);
  assert.equal(me.aiming, false, "Esc cancels: no stroke");
  assert.equal(me.levelStrokes, 0);
  ann.input({ type: "key", key: "G", pressed: true });
  await g.run(200);
  const xray = g.ops(ann, "xray").at(-1)!;
  assert.equal(xray.args[0], "1", "one reveal sphere");
  near(Number(xray.args[3]), Math.round(ball.z * 1000) / 1000, 1e-9, "centred on the own ball");
  ann.input({ type: "key", key: "G", pressed: false });
  await g.run(200);
  assert.equal(g.ops(ann, "xray").at(-1)!.args[0], "0", "released: no sphere");
  // Click your own ball to putt.
  assert.ok(ann.click(SLUG, "0", "aimPad0", ball.add(new Vector3(0.03, 0, 0))));
  await g.run(60);
  assert.ok(ann.click(SLUG, "0", "ballPick0"));
  await g.run(60);
  assert.equal(me.levelStrokes, 1);
  near(Number(g.impulses(ann).at(-1)!.args[0]), 0.005 + (2 - 0.005) * (0.03 / 0.16), 1e-6, "impulse toward +x");
  assert.deepEqual(g.problems(), []);
});

test("B2: in a headset each hand carries its green sphere (AttachToHand); on desktop nothing is attached", async () => {
  const g = new Golf(3);
  const ann = g.join("Ann");
  ann.vr = true;
  const bob = g.join("Bob");
  await g.world.settle();
  await g.run(500);
  // The runtime's own throwaway head probe (localPosition(), portkit bs.ts readHead) is not the game's.
  const attached = [...ann.attached.entries()].filter(([path]) => path !== "pk1-head-probe").map(([path, a]) => `${path.replace(/^.*?\(Clone\)\//, "")}:${a.point}:${a.uid === ann.uid}`).sort();
  const paths = ["handSphereL", "handSphereR"].map((k) => g.world.bindings.objects[k]!.path);
  assert.deepEqual(attached, [`${paths[0]}:1:true`, `${paths[1]}:2:true`], "left sphere on the left hand, right on the right");
  assert.equal([...bob.attached.keys()].filter((path) => path !== "pk1-head-probe").length, 0, "a desktop player attaches nothing");
  assert.deepEqual(g.problems(), []);
});
