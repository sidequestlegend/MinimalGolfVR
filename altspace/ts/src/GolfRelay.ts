// The game's own relay ops and graph events: what the page asks the kit's graphs to do that it cannot do itself, and
// what the per-ball fixed-step graph reports back. This file is the contract with the Unity side (PORT.md 11.3; the
// ops are built by MiniGolfKitBuilder.RelayOps). Records go through the runtime's `Host.op`, batched with the rest of
// the tick; a value op (with a property) is sent only when it changed.

import { relayNumber, type Color, type HostActions, type Vector3 } from "../portkit/src/index.ts";

/** Names the per-ball graph reports through `window.__pk1.event("mini-golf:<inst>", name, args)`. */
export const GRAPH_EVENTS = {
  /** `<ball index>|<shot number>`: the cup test of MinimalGolfGame.cs:378-382 passed on the ball's owner. */
  capture: "golfCapture",
  /** `<ball index>|<shot number>|<1 at rest, 0 moving>`: speed against playableSpeed (rule B1). */
  rest: "golfRest",
  /** `<ball index>|<relative speed>|<other collider's name>`: GolfBallImpact.OnCollisionEnter. */
  impact: "golfImpact",
} as const;

/** The game's relay ops, in the order PORT.md lists them. */
export const GAME_OPS = ["impulse", "place", "assist", "sink", "line", "reveal", "xray", "uiHeight", "fade"] as const;

const n = relayNumber;
const v3 = (v: Vector3) => [n(v.x), n(v.y), n(v.z)];

export class GolfRelay {
  private readonly host: HostActions;

  constructor(host: HostActions) {
    this.host = host;
  }

  /** An op whose latest value is all that matters: an unchanged value is not sent again. */
  private value(op: string, target: string, property: string, args: string[]): void {
    this.host.op(op, target, args, property);
  }

  /** An op that must run every time it is asked for. */
  private event(op: string, target: string, args: string[]): void {
    this.host.op(op, target, args);
  }

  /** `Rigidbody.AddForce(impulse, ForceMode.Impulse)` on the ball (MinimalGolfGame.cs:542); the graph then watches
   * for the ball to come to rest after shot `shot` and reports `golfRest`. */
  impulse(ball: string, impulse: Vector3, shot: number): void {
    this.event("impulse", ball, [...v3(impulse), String(shot)]);
  }

  /** Puts the ball at a world position at rest: velocities zero, scale 1, dynamic, interpolated (InstantiateBallAtSpawn). */
  place(ball: string, position: Vector3, shot: number): void {
    this.event("place", ball, [...v3(position), String(shot)]);
  }

  /** Arms or disarms the ball's fixed-step cup assist and capture test (MinimalGolfGame.cs:351-388). */
  assist(ball: string, armed: boolean, hole: Vector3, t: AssistTuning): void {
    const args = armed
      ? ["1", ...v3(hole), n(t.assistRadius), n(t.captureRadius), n(t.maximumAssistedSpeed), n(t.maximumCaptureSpeed), n(t.minimumPullAcceleration), n(t.maximumPullAcceleration), n(t.playableSpeed)]
      : ["0"];
    this.value("assist", ball, "assist", args);
  }

  /** The capture move (MinimalGolfGame.cs:659-692): centre over the hole while dropping `centerDrop` and scaling to 0.88
   * over 0.10 s, then sink to `sinkDepth` below the hole centre while scaling to 0.08 over 0.52 s. */
  sink(ball: string, hole: Vector3, centerDrop: number, sinkDepth: number): void {
    this.event("sink", ball, [...v3(hole), n(centerDrop), n(sinkDepth)]);
  }

  /** The aiming line (LineRenderer, two world points, MinimalGolfGame.cs:492-526). */
  line(target: string, enabled: boolean, from: Vector3, to: Vector3, width: number, color: Color): void {
    const q = (x: number) => n(Math.round(x * 10000) / 10000);
    const args = enabled ? ["1", q(from.x), q(from.y), q(from.z), q(to.x), q(to.y), q(to.z), n(width), q(color.r), q(color.g), q(color.b), q(color.a)] : ["0"];
    this.value("line", target, "line", args);
  }

  /** Starts the level's baked reveal clip `secondsIn` seconds in (late joiners join part-way). */
  reveal(level: string, secondsIn: number): void {
    this.event("reveal", level, [n(Math.max(0, secondsIn))]);
  }

  /** The reveal-volume shader globals (RevealVolumeManager.PushGlobals): up to two spheres. */
  xray(target: string, volumes: ReadonlyArray<{ center: Vector3; radius: number; softness: number }>): void {
    const q = (x: number) => n(Math.round(x * 1000) / 1000);
    const args = [String(Math.min(2, volumes.length))];
    for (const v of volumes.slice(0, 2)) args.push(q(v.center.x), q(v.center.y), q(v.center.z), n(v.radius), n(v.softness));
    this.value("xray", target, "xray", args);
  }

  /** The height of a uGUI graphic's RectTransform.sizeDelta, its width kept (the progress pips, VRGolfUI.cs:194-195). */
  uiHeight(target: string, height: number): void {
    this.value("uiHeight", target, "uiHeight", [n(height)]);
  }

  /** The alpha of every graphic under a canvas (CanvasGroup.alpha, which is not on the allow-list). */
  fade(target: string, alpha: number): void {
    this.value("fade", target, "fade", [n(Math.round(alpha * 100) / 100)]);
  }
}

export interface AssistTuning {
  assistRadius: number;
  captureRadius: number;
  maximumAssistedSpeed: number;
  maximumCaptureSpeed: number;
  minimumPullAcceleration: number;
  maximumPullAcceleration: number;
  playableSpeed: number;
}
