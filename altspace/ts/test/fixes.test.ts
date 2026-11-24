// The review findings of 2026-11-25 (REVIEW-FINDINGS.md, mini-golf), one test (or more) each. Every one of these
// failed on the code before its fix.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Vector3 } from "../portkit/src/index.ts";
import type { FakeClient } from "../portkit/src/platform/fake.ts";
import { HOLED, OUT_OF_TIME, PICKED_UP } from "../src/GolfPlayer.ts";
import * as Round from "../src/GolfRound.ts";
import { LEVELS } from "../src/MiniGolfLevel.ts";
import { ScorecardLines } from "../src/VRGolfUI.ts";
import { Golf, SLUG } from "./helpers.ts";

async function table(names: string[], options: Record<string, string> = {}, seed = 1) {
  const g = new Golf(seed);
  const clients = names.map((n) => g.join(n, { elements: [options] }));
  await g.world.settle();
  for (const c of clients) await g.seat(c);
  return { g, clients };
}

/** One putt that stops short of the hole. */
async function shortPutt(g: Golf, c: FakeClient): Promise<void> {
  await g.ready(c);
  assert.ok(await g.putt(c, new Vector3(0, 0, -0.03)), `${c.name} putts`);
  await g.rest(c, g.ball(c).add(new Vector3(0.01, 0, 0.01)));
}

// ---- finding 1: the hole timeout scored a non-finisher at strokes so far (even 0), and raced a dropping ball ----------

test("finding 1: missedScore is never better than holing out next stroke; par + 2 at least; the limit when one is set", () => {
  assert.equal(Round.missedScore(0, 2, 0), 4, "no stroke at all: par + 2, not 0");
  assert.equal(Round.missedScore(1, 2, 0), 4);
  assert.equal(Round.missedScore(7, 3, 0), 8, "strokes so far + 1");
  assert.equal(Round.missedScore(0, 4, 6), 6, "with a stroke limit: the limit (as picking up)");
  assert.equal(Round.missedScore(6, 4, 6), 6);
});

test("finding 1: out of time scores at least strokes + 1 and par + 2 (a player who never putted gets no free hole)", async () => {
  const { g, clients } = await table(["Ann", "Bob", "Cat"]);
  const [ann, bob, cat] = clients as [FakeClient, FakeClient, FakeClient];
  await shortPutt(g, bob); // Bob: one stroke; Cat: none
  await g.playHole(ann, 2);
  await g.until(() => g.me(bob).finished === OUT_OF_TIME && g.me(cat).finished === OUT_OF_TIME, "both out of time", 140_000);
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "next hole");
  const par = LEVELS[0]!.par;
  const card = g.golf(ann);
  assert.deepEqual([card.RowOf(ann.uid)!.strokes[0], card.RowOf(bob.uid)!.strokes[0], card.RowOf(cat.uid)!.strokes[0]], [2, par + 2, par + 2]);
  assert.equal(card.RowOf(cat.uid)!.marks[0], "dnf");
  assert.ok(Round.rowTotal(card.RowOf(cat.uid)!) > Round.rowTotal(card.RowOf(ann.uid)!), "standing still does not beat holing out");
  assert.deepEqual(g.problems(), []);
});

test("finding 1: a ball dropping into the cup as the timeout falls is holed, not OUT OF TIME", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await shortPutt(g, bob);
  await g.playHole(ann, 2);
  const golf = g.golf(ann);
  await g.until(() => golf.firstHoledAt > 0 && golf.Now() >= golf.firstHoledAt + 119, "a second before the timeout", 140_000);
  await g.ready(bob);
  assert.ok(await g.putt(bob, new Vector3(0, 0, -0.03)));
  // Bob's second putt drops 0.4 s before the timeout: the capture (0.62 s sink) runs across it.
  await g.until(() => golf.Now() >= golf.firstHoledAt + 119.6, "0.4 s before the timeout");
  assert.equal(g.me(bob).finished, 0);
  bob.move(SLUG, "0", `ball${g.me(bob).slot}`, golf.HoleWorld());
  bob.graphEvent(SLUG, "0", "golfCapture", `${g.me(bob).slot}|${g.me(bob).shotNumber}`);
  await g.until(() => g.me(bob).finished !== 0, "Bob's hole ends", 10_000);
  assert.ok(golf.Now() > golf.firstHoledAt + golf.settings.holeTimeout, "the capture finished after the timeout");
  assert.equal(g.me(bob).finished, HOLED, "holed, not out of time");
  assert.match(g.me(bob).feedback, /^HOLE COMPLETE/);
  await g.until(() => golf.RowOf(bob.uid)!.strokes[0] !== null, "on the card");
  assert.equal(golf.RowOf(bob.uid)!.strokes[0], 2);
  assert.equal(golf.RowOf(bob.uid)!.marks[0], "");
  assert.deepEqual(g.problems(), []);
});

// ---- finding 2: leaving and coming back skipped a hole with no penalty --------------------------------------------------

test("finding 2: LEAVE mid-hole, come back on the next: the missed hole is scored, and the course-complete total is the card's", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  for (let i = 0; i < 3; i++) await shortPutt(g, bob);
  assert.ok(bob.click(SLUG, "0", "joinButton"), "LEAVE");
  await g.until(() => g.slot(bob) === -1, "Bob left his seat");
  await g.playHole(ann, 2);
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "hole 2 without Bob");
  const par = LEVELS[0]!.par;
  assert.equal(g.golf(ann).RowOf(bob.uid)!.strokes[0], Math.max(3 + 1, par + 2), "the hole Bob walked away from is scored");
  assert.equal(g.golf(ann).RowOf(bob.uid)!.marks[0], "dnf");
  await g.seat(bob);
  // The rest of the course, one stroke each.
  for (let hole = 1; hole < 8; hole++) {
    await g.until(() => g.golf(ann).currentLevelIndex === hole && g.me(ann).hole === hole && g.me(bob).hole === hole, `hole ${hole + 1}`, 30_000);
    await g.playHole(ann, 1);
    await g.playHole(bob, 1);
  }
  await g.until(() => g.golf(ann).courseComplete && g.golf(bob).courseComplete, "course complete", 30_000);
  await g.run(200);
  const row = g.golf(bob).RowOf(bob.uid)!;
  assert.equal(Round.rowTotal(row), 4 + 7);
  assert.equal(bob.graph(SLUG).text.get("courseCompleteTotal"), String(Round.rowTotal(row)), "the panel agrees with the card");
  assert.ok(g.ui(bob).cardLines.some((t) => t.text.startsWith("Bob") && t.text.endsWith(" 11")));
  assert.deepEqual(g.problems(), []);
});

test("finding 2: a reload slow enough to miss the end of the hole is scored as not finished, from the strokes already seen", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  for (let i = 0; i < 4; i++) await shortPutt(g, bob);
  await g.run(500);
  assert.equal(g.golf(ann).RowOf(bob.uid)!.seen, 4, "the referee has seen Bob's four strokes");
  g.world.leave(bob);
  await g.until(() => g.golf(ann).RowOf(bob.uid)!.left, "Bob marked as left");
  await g.playHole(ann, 2);
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "hole 2");
  assert.equal(g.golf(ann).RowOf(bob.uid)!.strokes[0], 5, "four strokes seen + 1 (Bob's own count left with him)");
  const again = g.join("Bob");
  await g.world.settle();
  await g.until(() => g.slot(again) === 1, "back in his seat");
  await g.ready(again);
  assert.equal(g.me(again).hole, 1, "Bob plays hole 2 now");
  assert.equal(g.golf(again).RowOf(again.uid)!.strokes[0], 5, "and hole 1 stays scored");
  assert.deepEqual(g.problems(), []);
});

test("finding 2: a page that lowers its own stroke count does not lower what the card records", async () => {
  const { g, clients } = await table(["Ann", "Bob"]);
  const [ann, bob] = clients as [FakeClient, FakeClient];
  for (let i = 0; i < 3; i++) await shortPutt(g, bob);
  await g.run(500);
  const me = g.me(bob);
  me.holeStrokes = 0; // a modified page
  me.RequestSerialization();
  await g.run(500);
  await g.holeOut(bob);
  await g.until(() => g.golf(ann).RowOf(bob.uid)!.strokes[0] !== null, "recorded");
  assert.equal(g.golf(ann).RowOf(bob.uid)!.strokes[0], 3);
});

// ---- finding 3: one more putt slipped in during the stroke limit's pick-up grace ---------------------------------------

test("finding 3: at the stroke limit no putt is taken while the pick-up waits for the cup assist", async () => {
  const { g, clients } = await table(["Ann", "Bob"], { "stroke-limit": "2" });
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.playHole(bob, 1);
  for (let i = 0; i < 2; i++) await shortPutt(g, ann);
  assert.equal(g.me(ann).finished, 0, "still inside the 1 s grace");
  assert.equal(g.me(ann).CanTakeAction(), false, "no third stroke");
  assert.equal(await g.putt(ann, new Vector3(0, 0, -0.03)), null, "the putt is refused");
  assert.equal(g.me(ann).holeStrokes, 2);
  await g.until(() => g.me(ann).finished === PICKED_UP, "picked up");
  await g.until(() => g.golf(bob).RowOf(ann.uid)!.strokes[0] !== null, "on the card");
  assert.equal(g.golf(bob).RowOf(ann.uid)!.strokes[0], 2, "never above the limit");
  assert.deepEqual(g.problems(), []);
});

// ---- finding 4: a reload during the sink left the player capturing for good --------------------------------------------

test("finding 4: a reload during the 0.62 s sink finishes the hole on return (with no hole timeout it stayed stuck for good)", async () => {
  // (A player alone in the room who reloads finds it empty and starts a new round: "Everyone gone", PORT.md 3.4.)
  const { g, clients } = await table(["Ann", "Bob"], { "hole-timeout": "0" });
  const [ann, bob] = clients as [FakeClient, FakeClient];
  await g.playHole(ann, 1);
  await shortPutt(g, bob);
  await g.ready(bob);
  assert.ok(await g.putt(bob, new Vector3(0, 0, -0.03)));
  const slot = g.me(bob).slot;
  bob.move(SLUG, "0", `ball${slot}`, g.golf(bob).HoleWorld());
  bob.graphEvent(SLUG, "0", "golfCapture", `${slot}|${g.me(bob).shotNumber}`);
  await g.run(400); // inside the 0.62 s sink, after the state went out (and was saved on the device)
  assert.equal(g.me(bob).capturing, true, "sinking");
  assert.equal(g.me(bob).finished, 0);
  g.world.leave(bob);
  await g.run(1000);
  const again = g.join("Bob");
  await g.world.settle();
  await g.until(() => g.me(again).finished === HOLED, "the hole is finished after the reload", 10_000);
  assert.equal(g.me(again).capturing, false);
  assert.equal(g.me(again).ballLive, false, "the ball is in the cup, not back at the reset point");
  await g.until(() => g.golf(ann).currentLevelIndex === 1, "the table goes on to hole 2", 20_000);
  assert.equal(g.golf(ann).RowOf(again.uid)!.strokes[0], 2);
  assert.deepEqual(g.problems(), []);
});

// ---- finding 6: after RESTART HOLE the message counted only the last attempt --------------------------------------------

test("finding 6: the hole-complete message counts the hole's strokes, restarted attempts included, as the card does", async () => {
  const { g, clients } = await table(["Ann"]);
  const [ann] = clients as [FakeClient];
  await shortPutt(g, ann);
  await shortPutt(g, ann);
  assert.ok(ann.click(SLUG, "0", "restartButton"));
  await g.run(100);
  assert.equal(g.me(ann).levelStrokes, 0);
  await g.playHole(ann, 1);
  assert.equal(g.me(ann).holeStrokes, 3);
  assert.equal(g.me(ann).feedback, "HOLE COMPLETE  •  +1 OVER PAR", "3 strokes on a par 2, not UNDER PAR! for the last attempt's one");
  await g.until(() => g.golf(ann).RowOf(ann.uid)!.strokes[0] === 3, "the card says 3");
});

// ---- finding 7: the ball graph's two lengths did not grow with table-scale ---------------------------------------------

test("finding 7: the ball graph scales CupAssist's 0.001 and 1.25 with the assist radius, as CupAssist does", () => {
  const source = readFileSync(fileURLToPath(new URL("../../Assets/Kit/Editor/MiniGolfKitBuilder.cs", import.meta.url)), "utf8");
  const ball = source.slice(source.indexOf("static GraphWriter BallGraph()"), source.indexOf("g.On(new Update()", source.indexOf("static GraphWriter BallGraph()")));
  assert.ok(ball.length > 100, "found the ball graph's FixedUpdate");
  assert.doesNotMatch(ball, /\b1\.25f\b(?! \/)/, "no fixed 1.25 m height window");
  assert.doesNotMatch(ball, /Greater\(distance, 0\.001f\)/, "no fixed 1 mm pull cut-off");
  assert.match(ball, /F\("PkAssistR"\) \* \(1\.25f \/ 0\.04f\)/);
  assert.match(ball, /F\("PkAssistR"\) \* \(0\.001f \/ 0\.04f\)/);
});

// ---- finding 9: the card grew with every newcomer; the board draws 8 rows --------------------------------------------

test("finding 9: a room where people keep coming and going keeps the card bounded, under the leaf limit, seated rows shown", async () => {
  const g = new Golf(4);
  const host = g.join("Host");
  await g.world.settle();
  await g.seat(host);
  for (let wave = 0; wave < 4; wave++) {
    const guests: FakeClient[] = [];
    for (let i = 0; i < 7; i++) {
      const c = g.join(`Guest${wave}x${i}-with-a-rather-long-display-name`);
      guests.push(c);
    }
    await g.world.settle();
    for (const c of guests) await g.seat(c);
    for (const c of guests) g.world.leave(c);
    await g.run(Round.SEAT_GRACE * 1000 + 5000);
  }
  const golf = g.golf(host);
  assert.ok(golf.card.length <= Round.MAX_ROWS, `${golf.card.length} rows`);
  assert.ok(golf.card.every((r) => r.name.length <= Round.NAME_MAX));
  assert.ok(golf.RowOf(host.uid), "the seated player's row is kept");
  const leaf = Object.entries(g.world.room.stateSnapshot()).filter(([k]) => k === "pk1.mini-golf.0.v.b1");
  assert.equal(leaf.length, 1, "the table's state leaf");
  const bytes = Buffer.byteLength(JSON.stringify(leaf[0]![1]), "utf8");
  assert.ok(bytes < 16384 / 2, `the card's leaf stays well under 16 KiB: ${bytes} bytes`);
  // Worst case: MAX_ROWS rows with the longest names, uids and every hole scored, two digits each.
  const worst = Array.from({ length: Round.MAX_ROWS }, (_, i) => {
    const r = Round.newRow(`uid-${"x".repeat(60)}-${i}`, "W".repeat(80), i < 8 ? i : -1, 0);
    r.strokes = r.strokes.map(() => 99);
    r.marks = r.marks.map(() => "dnf");
    r.left = i >= 8;
    r.leftAt = 1e9 + i;
    r.seen = 99;
    return r;
  });
  assert.ok(Buffer.byteLength(JSON.stringify({ card: worst, slotOf: [0, 1, 2, 3, 4, 5, 6, 7], round: 1e9, revealStart: 1e9, holeDoneAt: 1e9, firstHoledAt: 1e9 })) < 16384, "worst case under 16 KiB");
  // The board: header, par and 8 rows, the seated first.
  const lines = ScorecardLines(golf.card, golf.currentLevelIndex);
  assert.equal(lines.length, 2 + Math.min(8, golf.card.length));
  assert.match(lines[2]!, /^Host/);
  assert.equal(g.ui(host).cardLines.length, 10, "the board has ten lines");
  assert.deepEqual(g.problems(), []);
});
