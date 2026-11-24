// Test helpers: a room with mini-golf tables, players who join, putt and hole out. Physics does not exist in Node, so
// the tests play the ball graph's part: they move the ball where it would roll (`client.move`, which the owner's
// synced transform carries to everyone) and report what the fixed-step graph would (`golfRest`, `golfCapture`).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Vector3 } from "../portkit/src/index.ts";
import type { FakeClient } from "../portkit/src/platform/fake.ts";
import { TestWorld, type JoinOptions } from "../portkit/src/testing.ts";
import type { GolfPlayer } from "../src/GolfPlayer.ts";
import { GAME_OPS } from "../src/GolfRelay.ts";
import game from "../src/index.ts";
import type { MinimalGolfGame } from "../src/MinimalGolfGame.ts";
import type { VRGolfUI } from "../src/VRGolfUI.ts";

export const SLUG = "mini-golf";
export const bindings = JSON.parse(readFileSync(fileURLToPath(new URL("../bindings.json", import.meta.url)), "utf8"));

export class Golf {
  readonly world: TestWorld;

  constructor(seed = 1) {
    this.world = new TestWorld(game, bindings, { seed });
    // The game's own relay ops (GolfRelay.ts, built by MiniGolfKitBuilder.RelayOps): the fake graph records them.
    for (const op of GAME_OPS) this.world.room.defineRelayOp(op);
  }

  join(name: string, options: JoinOptions = {}): FakeClient {
    return this.world.join({ name, uid: `uid-${name.toLowerCase()}`, ...options });
  }

  run(ms: number): Promise<void> {
    return this.world.run(ms);
  }

  async until(done: () => boolean, what: string, maxMs = 20000): Promise<void> {
    if (await this.world.room.runUntil(done, maxMs)) return;
    throw new Error(`timed out waiting for: ${what}`);
  }

  golf(client: FakeClient, inst = "0"): MinimalGolfGame {
    return this.world.behaviour<MinimalGolfGame>(client, "b1", inst);
  }

  ui(client: FakeClient, inst = "0"): VRGolfUI {
    return this.world.behaviour<VRGolfUI>(client, "b2", inst);
  }

  /** The client's own per-player behaviour. */
  me(client: FakeClient, inst = "0"): GolfPlayer {
    const found = this.world.instance(client, inst).playerBehaviour<GolfPlayer>(client.sid, "b3");
    assert.ok(found, `${client.name} has no GolfPlayer`);
    return found;
  }

  /** Another client's view of `who`'s per-player behaviour. */
  seen(viewer: FakeClient, who: FakeClient, inst = "0"): GolfPlayer | null {
    return this.world.instance(viewer, inst).playerBehaviour<GolfPlayer>(who.sid, "b3");
  }

  slot(client: FakeClient, inst = "0"): number {
    return this.golf(client, inst).SlotOf(client.uid);
  }

  /** Clicks JOIN and waits for the referee to seat the player. */
  async seat(client: FakeClient, inst = "0"): Promise<number> {
    assert.ok(client.click(SLUG, inst, "joinButton"), "JOIN is clickable");
    await this.until(() => this.slot(client, inst) >= 0, `${client.name} seated`);
    return this.slot(client, inst);
  }

  /** Waits until the player may putt (ball on the green, at rest, nothing pending). */
  async ready(client: FakeClient, inst = "0"): Promise<void> {
    await this.until(() => this.me(client, inst).CanTakeAction(), `${client.name} can putt`);
  }

  ball(client: FakeClient, inst = "0"): Vector3 {
    return this.me(client, inst).BallPosition();
  }

  /**
   * A desktop putt: click the green at `ball - pull` (the hand pulled back by `pull`, upstream's slingshot), then Space.
   * Returns the impulse record sent to the ball graph, or null when no shot was made.
   */
  async putt(client: FakeClient, pull: Vector3, inst = "0"): Promise<{ impulse: Vector3; shot: number } | null> {
    const me = this.me(client, inst);
    const level = this.golf(client, inst).currentLevelIndex;
    const before = this.impulses(client, inst).length;
    const point = this.ball(client, inst).sub(pull);
    assert.ok(client.click(SLUG, inst, `aimPad${level}`, point), "aim pad is clickable");
    await this.run(60);
    this.key(client, "Space");
    await this.run(60);
    const records = this.impulses(client, inst);
    if (records.length === before) return null;
    const last = records[records.length - 1]!;
    assert.equal(last.target, `ball${me.slot}`);
    return { impulse: new Vector3(Number(last.args[0]), Number(last.args[1]), Number(last.args[2])), shot: Number(last.args[3]) };
  }

  /** Whether a kit object is switched on, as the relay graph last set it (objects in refs) or else the page did. */
  shown(client: FakeClient, key: string, inst = "0"): boolean {
    const viaGraph = client.graph(SLUG, inst).active.get(key);
    return viaGraph ?? client.object(SLUG, inst, key).active;
  }

  key(client: FakeClient, key: string): void {
    client.input({ type: "key", key, pressed: true });
    client.input({ type: "key", key, pressed: false });
  }

  impulses(client: FakeClient, inst = "0") {
    return this.ops(client, "impulse", inst);
  }

  /** The records of one op this client's graphs were sent, with targets as binding keys. */
  ops(client: FakeClient, op: string, inst = "0") {
    return client
      .graph(SLUG, inst)
      .records.filter((r) => r.op === op)
      .map((r) => ({ ...r, target: /^\d+$/.test(r.target) ? (bindings.refs[Number(r.target)] as string) : r.target }));
  }

  /** Where the ball stopped: the owner's physics moved it there, and the graph says it is at rest. */
  async rest(client: FakeClient, at: Vector3 | null = null, inst = "0"): Promise<void> {
    const me = this.me(client, inst);
    if (at) client.move(SLUG, inst, `ball${me.slot}`, at);
    client.graphEvent(SLUG, inst, "golfRest", `${me.slot}|${me.shotNumber}|1`);
    await this.run(100);
  }

  /** The cup test passed on the owner's ball graph: capture, sink, hole complete. */
  async holeOut(client: FakeClient, inst = "0"): Promise<void> {
    const me = this.me(client, inst);
    client.move(SLUG, inst, `ball${me.slot}`, this.golf(client, inst).HoleWorld());
    client.graphEvent(SLUG, inst, "golfCapture", `${me.slot}|${me.shotNumber}`);
    await this.until(() => me.finished === 1, `${client.name} holed out`);
  }

  /** Plays a hole in `strokes` putts: strokes - 1 that stop short, then one that drops. */
  async playHole(client: FakeClient, strokes: number, inst = "0"): Promise<void> {
    await this.ready(client, inst);
    const golf = this.golf(client, inst);
    for (let i = 0; i < strokes; i++) {
      const toHole = golf.HoleWorld().sub(this.ball(client, inst));
      toHole.y = 0;
      const shot = await this.putt(client, toHole.normalized.scale(0.08), inst);
      assert.ok(shot, `${client.name}'s putt ${i + 1} was played`);
      if (i === strokes - 1) await this.holeOut(client, inst);
      else {
        const short = this.ball(client, inst).add(toHole.scale(0.3));
        await this.rest(client, short, inst);
      }
    }
  }

  problems(): string[] {
    return this.world.problems();
  }
}

export function near(actual: number, expected: number, epsilon = 1e-6, what = ""): void {
  assert.ok(Math.abs(actual - expected) <= epsilon * Math.max(1, Math.abs(expected)), `${what} ${actual} != ${expected}`);
}
