// Rung 1 against upstream: vectors/upstream.json was written by MinimalGolfVR's own C# (compiled with dotnet 8 against
// golden/UnityStubs.cs, driven by golden/Harness.cs: `npm run golden`). Each test plays the same inputs through the
// TypeScript and allows only the differences the port decided on, each named where it is allowed:
//   K1  a hole in exactly par says "ON PAR!" (upstream: "UNDER PAR!")
//   K4  the capture drops and sinks by table-scaled distances (the arithmetic itself is checked with upstream's numbers)
//   B13 a second hand cannot start an aim while the first is aiming
// Comparisons are in doubles against upstream's floats, so the tuning is rounded to floats first (Math.fround) and
// results are compared with a tolerance.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Hand, Quaternion, Vector3, type HandSide } from "../portkit/src/index.ts";
import { ChooseIndex } from "../src/AudioManager.ts";
import { CameraImpactShake } from "../src/CameraImpactShake.ts";
import { LevelRevealAnimator } from "../src/LevelRevealAnimator.ts";
import {
  AimLineColor,
  AimLineLength,
  CENTERING_SECONDS,
  CapturePath,
  CupAssist,
  GolfAim,
  HoleCompleteMessage,
  LevelMessage,
  SINKING_SECONDS,
  SwapLayout,
  TUNING,
  ADVANCE_SECONDS,
  type Tuning,
} from "../src/MinimalGolfGame.ts";
import { CourseFrame, LEVELS } from "../src/MiniGolfLevel.ts";
import { PipStyle, PowerMeter, ToastAlpha } from "../src/VRGolfUI.ts";
import { VRGolfClub, type ClubHost } from "../src/VRGolfClub.ts";
import { BladeAngle } from "../src/WindmillRotor.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const V: any = JSON.parse(readFileSync(fileURLToPath(new URL("../vectors/upstream.json", import.meta.url)), "utf8"));

const vec = (a: number[]) => new Vector3(a[0], a[1], a[2]);
const close = (a: number, b: number, eps = 2e-5, what = "") => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${what}: ${a} vs ${b}`);
const closeVec = (a: Vector3, b: Vector3, eps = 2e-5, what = "") => {
  close(a.x, b.x, eps, what + ".x");
  close(a.y, b.y, eps, what + ".y");
  close(a.z, b.z, eps, what + ".z");
};
const closeColor = (c: { r: number; g: number; b: number; a: number }, a: number[], what = "") => {
  close(c.r, a[0]!, 1e-5, what + ".r");
  close(c.g, a[1]!, 1e-5, what + ".g");
  close(c.b, a[2]!, 1e-5, what + ".b");
  close(c.a, a[3]!, 1e-5, what + ".a");
};
/** The scene's tuning as the floats upstream holds. */
const F: Tuning = Object.fromEntries(Object.entries(TUNING).map(([k, v]) => [k, Math.fround(v)])) as unknown as Tuning;
/** Upstream's own (unscaled, FIX K4) capture distances, to check the arithmetic of CapturePath. */
const UPSTREAM_CAPTURE: Tuning = { ...F, centerDrop: Math.fround(0.055), sinkDepth: Math.fround(0.32) };
const playable = (speed: number) => Math.fround(speed) <= Math.fround(0.1);

function events(list: string[], prefix: string): number[][] {
  return list.filter((e) => e.startsWith(prefix)).map((e) => e.slice(prefix.length).trim().split(" ").map(Number));
}

test("golden: the vectors are there and come from the upstream C#", () => {
  assert.match(V.source, /MinimalGolfVR/);
  assert.ok(V.aim.length > 80 && V.assist.length > 200 && V.bounds.length > 90);
});

test("golden: the shot model matches upstream (pull to power and direction, the gates, the impulse, the line)", () => {
  let shots = 0;
  let refused = 0;
  for (const c of V.aim) {
    if (c.apply) {
      const impulse = new GolfAim(F).TryApplyShot(vec(c.direction), c.power, true);
      const forces = events(c.events, "AddForce Impulse");
      assert.equal(impulse !== null, c.shot, `TryApplyShot(${c.direction}, ${c.power})`);
      if (impulse) closeVec(impulse, vec(forces[0]!), 2e-5, "impulse");
      continue;
    }
    const aim = new GolfAim(F);
    const ball = vec(c.ball);
    const began = aim.BeginVRAim(vec(c.start), ball.y, playable(c.beginSpeed));
    assert.equal(began, c.began, "began");
    if (!began) assert.equal(c.feedback, "WAIT FOR THE BALL");
    for (const step of c.steps) {
      aim.UpdateVRAim(vec(step.hand));
      if (!began) continue;
      close(aim.shotPower, step.power, 2e-5, "power");
      closeVec(aim.aimDirection, vec(step.direction), 2e-4, "direction");
      const line = vec(step.lineTo).sub(vec(step.lineFrom)).magnitude;
      close(AimLineLength(aim.shotPower, aim.aimDirection, F), line, 1e-4, "line length");
      closeColor(AimLineColor(aim.shotPower), step.lineColor, "line colour");
    }
    const impulse = aim.TryEndVRAimAndShoot(playable(c.releaseSpeed));
    assert.equal(impulse !== null, c.shot, `shot for ${JSON.stringify(c.steps.map((s: { hand: number[] }) => s.hand))}`);
    assert.equal(c.levelStrokes, c.shot ? 1 : 0);
    assert.equal(c.totalStrokes, c.shot ? 1 : 0);
    if (impulse) {
      closeVec(impulse, vec(events(c.events, "AddForce Impulse")[0]!), 5e-5, "impulse");
      shots++;
    } else refused++;
  }
  assert.ok(shots > 40 && refused >= 5, `${shots} shots, ${refused} refused`);
});

/** A local player for the club alone: GolfAim plus what GolfPlayer does around it, recording haptics like OVRInput. */
class Host implements ClubHost {
  readonly aim = new GolfAim(F);
  ballLive = true;
  ball: Vector3;
  hands: [Vector3, Vector3] = [Vector3.zero, Vector3.zero];
  triggers: [number, number] = [0, 0];
  buttons: [boolean, boolean] = [false, false];
  speed = 0;
  strokes = 0;
  feedback = "";
  log: string[] = [];
  readonly clubReach = Math.fround(0.11) + Math.fround(0.08);

  constructor(ball: Vector3) {
    this.ball = ball;
  }
  get aiming() { return this.aim.dragging; }
  get shotPower() { return this.aim.shotPower; }
  BallPosition() { return this.ball.clone(); }
  HandPosition(side: HandSide) { return this.hands[side].clone(); }
  TriggerHeld(side: HandSide) { return this.buttons[side] || this.triggers[side] > Math.fround(0.45); }
  IsRevealing() { return false; }
  BeginAim(start: Vector3) {
    if (!playable(this.speed)) {
      this.feedback = "WAIT FOR THE BALL";
      return false;
    }
    return this.aim.BeginVRAim(start, this.ball.y, true);
  }
  UpdateAim(current: Vector3) { this.aim.UpdateVRAim(current); }
  EndAimAndShoot() {
    const impulse = this.aim.TryEndVRAimAndShoot(playable(this.speed));
    if (!impulse) return false;
    this.strokes++;
    this.log.push(`AddForce Impulse ${impulse.x} ${impulse.y} ${impulse.z}`, "Vibrate 1 0.7", "Vibrate 0 0.7");
    return true;
  }
  CancelAim() { this.aim.CancelAim(); }
  Haptic(side: HandSide, strength: number) { this.log.push(`Vibrate ${side} ${strength}`); }
}

/** Upstream's events of a frame in the host's form: vibrations as "Vibrate <side> <amplitude>". */
function upstreamFrame(list: string[]): string[] {
  return list.map((e) => {
    const m = /^Vibrate (LTouch|RTouch) \S+ (\S+)$/.exec(e);
    return m ? `Vibrate ${m[1] === "LTouch" ? 0 : 1} ${m[2]}` : e;
  });
}

function sameFrame(ours: string[], theirs: string[], what: string): void {
  assert.equal(ours.length, theirs.length, `${what}: ${ours.join("; ")} vs ${theirs.join("; ")}`);
  ours.forEach((e, i) => {
    const a = e.split(" ");
    const b = theirs[i]!.split(" ");
    assert.equal(a.slice(0, a.length === 3 ? 2 : 2).join(" "), b.slice(0, 2).join(" "), what);
    for (let k = 2; k < a.length; k++) close(Number(a[k]), Number(b[k]), 5e-5, `${what} ${e}`);
  });
}

test("golden: the club in each hand matches upstream (reach, trigger threshold, haptics, the release); B13 fixed", () => {
  for (const script of V.club) {
    const host = new Host(vec(script.ball));
    const clubs = [new VRGolfClub(Hand.Left), new VRGolfClub(Hand.Right)];
    const was = [false, false];
    script.frames.forEach((f: Record<string, never>, i: number) => {
      host.log = [];
      host.hands = [vec(f.left), vec(f.right)];
      host.triggers = [f.leftTrigger, f.rightTrigger];
      host.buttons = [f.leftHeld, f.rightHeld];
      host.speed = f.speed;
      for (const side of [0, 1] as const) {
        if (host.buttons[side] !== was[side]) clubs[side]!.OnButton(0, host.buttons[side]);
        was[side] = host.buttons[side];
      }
      clubs[1]!.Update(host); // upstream's order: the right club's Update, then the left's
      clubs[0]!.Update(host);
      const what = `${script.name}, frame ${i + 1}`;
      if (script.name === "second hand while aiming" && i >= 3) {
        // FIX B13: upstream lets the left hand start a second aim (frames 4 and 5) and shoot with its own pull (frame 6).
        if (i === 3 || i === 4) assert.equal(f.leftAiming, true, "upstream's B13");
        assert.equal(clubs[0]!.aiming, false, `${what}: the left hand never starts an aim while the right is aiming`);
        return;
      }
      assert.equal(host.aiming, f.aiming, `${what}: aiming`);
      assert.equal(clubs[1]!.aiming, f.rightAiming, `${what}: right club`);
      close(host.shotPower, f.power, 2e-5, `${what}: power`);
      assert.equal(host.strokes, f.strokes, `${what}: strokes`);
      if (f.feedback === "WAIT FOR THE BALL") assert.equal(host.feedback, "WAIT FOR THE BALL");
      sameFrame(host.log, upstreamFrame(f.events), what);
    });
  }
  // The fixed behaviour: the right hand keeps its aim, and its own release shoots.
  const script = V.club.find((s: { name: string }) => s.name === "second hand while aiming");
  const host = new Host(vec(script.ball));
  const clubs = [new VRGolfClub(Hand.Left), new VRGolfClub(Hand.Right)];
  const was = [false, false];
  for (const f of script.frames) {
    host.hands = [vec(f.left), vec(f.right)];
    host.triggers = [f.leftTrigger, f.rightTrigger];
    host.buttons = [f.leftHeld, f.rightHeld];
    for (const side of [0, 1] as const) {
      if (host.buttons[side] !== was[side]) clubs[side]!.OnButton(0, host.buttons[side]);
      was[side] = host.buttons[side];
    }
    clubs[1]!.Update(host);
    clubs[0]!.Update(host);
  }
  assert.equal(host.strokes, 1, "one stroke, from the right hand's pull");
});

test("golden: the cup assist and capture test match upstream's FixedUpdate", () => {
  let boundary = 0;
  let pulled = 0;
  let captured = 0;
  for (const c of V.assist) {
    const ball = vec(c.ball);
    const hole = vec(c.hole);
    const velocity = vec(c.velocity);
    const d = Math.hypot(hole.x - ball.x, hole.z - ball.z);
    const near = (x: number, edge: number) => Math.abs(x - edge) < 2e-6;
    if (near(d, F.assistRadius) || near(d, F.captureRadius) || near(d, 0.001)) {
      boundary++; // float rounding decides these exact edges; not compared
      continue;
    }
    const r = CupAssist(ball, velocity, hole, F);
    const forces = events(c.events, "AddForce Acceleration");
    assert.equal(r.acceleration !== null, forces.length > 0, `pull at d=${d} v=${velocity.z}`);
    if (r.acceleration) {
      closeVec(r.acceleration, vec(forces[0]!), 1e-4, "acceleration");
      pulled++;
    }
    assert.equal(r.capture, c.capture, `capture at d=${d} v=${velocity.z} dy=${ball.y - hole.y}`);
    if (r.capture) {
      captured++;
      assert.ok(c.events.includes("Vibrate RTouch 1 0.9"));
    }
  }
  assert.ok(pulled > 80 && captured > 15 && boundary <= 48, `${pulled} pulled, ${captured} captured, ${boundary} on an edge`);
});

test("golden: the capture path, the hole message and the wait before the next level match upstream (K1, K4 aside)", () => {
  for (const c of V.capture) {
    const dt = c.dt;
    const start = vec(c.start);
    const hole = vec(c.hole);
    const samples: number[][] = c.samples;
    // Upstream's loops: elapsed += dt, then evaluate, while elapsed < duration (so the last sample is clamped).
    const n1 = Math.ceil(CENTERING_SECONDS / dt - 1e-9);
    const n2 = Math.ceil(SINKING_SECONDS / dt - 1e-9);
    assert.equal(samples.length, n1 + n2 + 1, "one sample per frame of each phase, and the final placement");
    for (let k = 1; k <= n1 + n2; k++) {
      const elapsed = k <= n1 ? Math.min(k * dt, CENTERING_SECONDS - 1e-12) : CENTERING_SECONDS + Math.min((k - n1) * dt, SINKING_SECONDS);
      const p = CapturePath(elapsed, start, hole, UPSTREAM_CAPTURE);
      const s = samples[k - 1]!;
      closeVec(p.position, new Vector3(s[0], s[1], s[2]), 1e-5, `sample ${k}`);
      close(p.scale, s[3]!, 1e-5, `scale ${k}`);
    }
    const par = LEVELS[0]!.par;
    const ours = HoleCompleteMessage(c.strokes, par);
    if (c.strokes === par) {
      assert.equal(c.message, "HOLE COMPLETE  •  UNDER PAR!", "upstream's K1");
      assert.equal(ours, "HOLE COMPLETE  •  ON PAR!", "FIX K1");
    } else assert.equal(ours, c.message);
    assert.ok(c.advanceAfter >= ADVANCE_SECONDS && c.advanceAfter < ADVANCE_SECONDS + dt + 1e-6, `advance after ${c.advanceAfter}`);
    assert.equal(c.nextLevel, 1);
    assert.equal(c.nextMessage, LevelMessage(1, LEVELS[1]!.levelName));
  }
  // FIX K4: the port sinks by table-scaled distances (upstream's 0.055 m and 0.32 m are world metres from before the table).
  close(TUNING.centerDrop, 0.055 * 0.05, 1e-12);
  close(TUNING.sinkDepth, 0.32 * 0.05, 1e-12);
});

test("golden: the level layout after any sequence of loads matches upstream's swap (K7 kept)", () => {
  let slotOf = [0, 1, 2, 3, 4, 5, 6, 7];
  let current = -1;
  for (const step of V.layout) {
    const name: string = step.step;
    if (name === "start" || name === "restart course") {
      slotOf = SwapLayout(slotOf, current, 0);
      current = 0;
      assert.equal(step.totalStrokes, 0, "a course restart sets the total to 0");
    } else if (name.startsWith("load ")) {
      const next = Number(name.slice(5));
      slotOf = SwapLayout(slotOf, current, next);
      current = next;
    }
    assert.equal(step.current, current, name);
    assert.deepEqual(step.slotOf, slotOf, name);
    const expected = name === "restart current" ? "LEVEL RESTARTED" : LevelMessage(current, LEVELS[current]!.levelName);
    assert.equal(step.feedback, expected, name);
  }
});

test("golden: out of bounds matches MiniGolfLevel.IsOutsideCourse in a moved, turned course", () => {
  let outside = 0;
  for (const c of V.bounds) {
    const q = c.anchorRotation as number[];
    const frame = new CourseFrame(vec(c.anchor), new Quaternion(q[0], q[1], q[2], q[3]), 1, c.scale);
    const level = LEVELS[c.level]!;
    assert.equal(level.IsOutsideCourse(vec(c.world), frame, vec(c.slot)), c.outside, `level ${c.level} at ${c.world}`);
    if (c.outside) outside++;
  }
  assert.ok(outside >= 40, `${outside} outside`);
});

test("golden: the reveal's length and part motion match LevelRevealAnimator", () => {
  for (const t of V.reveal.totals) close(new LevelRevealAnimator(t.parts).TotalDuration, t.total, 1e-6, `${t.parts} parts`);
  for (const run of V.reveal.runs) {
    const anim = new LevelRevealAnimator(run.parts);
    for (const frame of run.frames) {
      const elapsed = frame.frame * run.dt;
      // Upstream clears IsPlaying one frame after the motion ends (the loop's test runs before the next evaluation).
      assert.equal(frame.playing, anim.IsPlaying(elapsed - run.dt), `frame ${frame.frame}`);
      run.watch.forEach((part: number, i: number) => closeVec(anim.PartOffset(part, elapsed), vec(frame.offsets[i]), 1e-5, `part ${part} frame ${frame.frame}`));
    }
  }
});

test("golden: the board's numbers and colours match VRGolfUI (pips, power meter, toast)", () => {
  for (const p of V.ui.progress) {
    const level = LEVELS[p.current]!;
    assert.equal(p.course, level.levelName);
    assert.equal(p.level, `LEVEL ${p.current + 1} / 8`);
    assert.equal(p.par, String(level.par));
    for (let i = 0; i < 8; i++) {
      const style = PipStyle(i, p.current);
      closeColor(style.color, p.colors[i], `pip ${i} at ${p.current}`);
      assert.equal(style.height, p.heights[i]);
    }
  }
  for (const p of V.ui.power) {
    const meter = PowerMeter(p.power);
    assert.equal(p.label, "PUTT STRENGTH");
    assert.equal(meter.percent, p.percent, `power ${p.power}`);
    meter.colors.forEach((c, i) => closeColor(c, p.colors[i], `segment ${i} at ${p.power}`));
  }
  assert.equal(V.ui.powerHiddenAfter, true);
  for (const t of V.ui.toast) {
    assert.equal(t.until - t.now > 0, t.shown, `toast at ${t.now}`);
    if (t.shown) close(ToastAlpha(t.until - t.now), t.alpha, 1e-5, `alpha at ${t.now}`);
  }
  assert.deepEqual(V.ui.complete, { shown: true, total: "41" });
});

test("golden: impact haptics and their cooldown match CameraImpactShake", () => {
  const shake = new CameraImpactShake();
  for (const c of V.impact) {
    const strength = shake.RegisterImpact(c.speed, c.now);
    const vib = events(c.events, "Vibrate");
    assert.equal(strength !== null, vib.length === 2, `impact ${c.speed} at ${c.now}`);
    if (strength !== null) close(strength, Number(c.events[0].split(" ")[3]), 1e-5);
  }
});

test("golden: sound choice never repeats a clip, draw for draw as AudioManager", () => {
  let draw = 0;
  const rangeInt = (min: number, max: number) => {
    const d = V.audio.draws[draw++];
    assert.deepEqual([d[0], d[1]], [min, max]);
    return d[2] as number;
  };
  let shot = -1;
  let hole = -1;
  V.audio.plays.forEach((play: string, i: number) => {
    if (i % 3 === 2) {
      hole = ChooseIndex(3, hole, rangeInt);
      assert.equal(play, `PlayOneShot hole${hole + 1}`);
    } else {
      shot = ChooseIndex(3, shot, rangeInt);
      assert.equal(play, `PlayOneShot hit${shot + 1}`);
    }
  });
  assert.equal(draw, V.audio.draws.length);
});

test("golden: the windmill angle matches WindmillRotor's fixed steps", () => {
  for (const w of V.windmill) {
    const q = w.rotation as number[];
    const upstream = (((2 * Math.atan2(q[2]!, q[3]!) * 180) / Math.PI) % 360 + 360) % 360;
    const ours = BladeAngle(w.steps * 0.02);
    const diff = Math.min(Math.abs(upstream - ours), 360 - Math.abs(upstream - ours));
    assert.ok(diff < 0.01, `after ${w.steps} steps: ${upstream} vs ${ours}`);
  }
});
