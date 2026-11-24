// The per-player half of MinimalGolfGame.cs (PORT.md 3.4): one copy per player, written only by that player (their
// user state), readable by everyone. The local player's copy runs upstream's single-player loop for their own ball:
// LoadLevel's per-player part, SpawnBallAfterReveal, CanTakeAction, the shot, the cup capture, ResetBall on out of
// bounds and RestartCurrentLevel. Other players' copies only replay what everyone should see and hear of them.
//
// The ball is a kit object with a synced transform, owned by this player; the shot impulse, the placement and the
// capture move go to its graph through relay ops (GolfRelay.ts), and its fixed-step graph reports capture, rest and
// impacts back (golfCapture, golfRest, golfImpact). Upstream's coroutines are deadlines checked every tick; a reset
// cancels them, as StopAllCoroutines does (D3).

import { Behaviour, Button, Hand, Vector3, type ButtonName, type DeserializationResult, type HandSide, type HostEventDetail } from "../portkit/src/index.ts";
import { ImpactPlaysSound } from "./GolfBallImpact.ts";
import { CENTERING_SECONDS, GolfAim, HoleCompleteMessage, LevelMessage, MESSAGE_SECONDS, SINKING_SECONDS, AimLineColor, AimLineLength, type MinimalGolfGame } from "./MinimalGolfGame.ts";
import { ProximityRevealVolume, type RevealSphere } from "./ProximityRevealVolume.ts";
import { RevealVolumeManager } from "./RevealVolumeManager.ts";
import { GRAPH_EVENTS } from "./GolfRelay.ts";
import { DesktopAim, VRGolfClub, type ClubHost } from "./VRGolfClub.ts";

/** `finished`: still playing, holed out, picked up at the stroke limit, out of time (hole timeout, set by the referee's card). */
export const PLAYING = 0;
export const HOLED = 1;
export const PICKED_UP = 2;
export const OUT_OF_TIME = 3;

/** Seconds a ball at rest on its last allowed stroke waits for the cup assist before the player picks up. */
export const STROKE_LIMIT_GRACE = 1.0;
const HAPTIC = 0.08;

export class GolfPlayer extends Behaviour implements ClubHost {
  static override perPlayer = true;
  /** A reload in the middle of a round gets its strokes back (only while it is the same round, `round`). */
  static override persistent = true;
  static override synced = ["round", "hole", "levelStrokes", "holeStrokes", "totalStrokes", "finished", "capturing", "captures", "shots"];

  /** The shared round this state belongs to (MinimalGolfGame.round). */
  round = 0;
  /** The level index this state is for. */
  hole = -1;
  /** Upstream `levelStrokes`: strokes of this attempt (a restart sets it to 0; the game card shows it). */
  levelStrokes = 0;
  /** Strokes on this hole including restarted attempts: what the scorecard records (K2: restarts keep their strokes). */
  holeStrokes = 0;
  /** Upstream `totalStrokes`. */
  totalStrokes = 0;
  /** PLAYING, HOLED (upstream levelComplete), PICKED_UP or OUT_OF_TIME. */
  finished = PLAYING;
  capturing = false;
  /** Counters other players' copies watch, to play the sound and the sink once each. */
  captures = 0;
  shots = 0;

  // ---- from bindings.json ----
  game!: MinimalGolfGame;

  // ---- the local player's copy only ----
  readonly aim = new GolfAim();
  readonly clubs = [new VRGolfClub(Hand.Left), new VRGolfClub(Hand.Right)];
  readonly desktop = new DesktopAim();
  /** The slot (ball) this client last saw for this player; -1 not seated. */
  slot = -1;
  /** The ball is on the green (upstream `level.ball != null`). */
  ballLive = false;
  /** SpawnBallAfterReveal is waiting. */
  spawnPending = false;
  shotNumber = 0;
  /** The latest shot the ball graph reported at rest, and whether it is at rest now (rule B1's speed test). */
  restShot = 0;
  atRest = true;
  restSince = 0;
  captureEndsAt = -1;
  feedback = "";
  feedbackUntil = 0;
  private reveal: RevealVolumeManager | null = null;
  private readonly volumes = [new ProximityRevealVolume(0.075, 0.02), new ProximityRevealVolume(0.075, 0.02)];
  private seenShots = -1;
  private seenCaptures = -1;

  get isLocal(): boolean {
    return this.Player?.isLocal === true;
  }

  // ---- ClubHost ---------------------------------------------------------------------------------------------------

  get aiming(): boolean {
    return this.aim.dragging;
  }
  get shotPower(): number {
    return this.aim.shotPower;
  }
  get clubReach(): number {
    return this.game.tuning.clubReach;
  }

  BallPosition(): Vector3 {
    return this.game.balls[this.slot]?.transform.position ?? Vector3.zero;
  }

  HandPosition(side: HandSide): Vector3 | null {
    const poses = this.Input.Poses;
    if (!poses) return null;
    return (side === Hand.Left ? poses.leftHand : poses.rightHand).position.clone();
  }

  TriggerHeld(side: HandSide): boolean {
    return this.Input.GetButton(Button.Trigger, side) || this.Input.GetTrigger(side) > this.clubs[side]!.triggerThreshold;
  }

  IsRevealing(): boolean {
    return this.game.IsRevealing();
  }

  BeginAim(startWorld: Vector3): boolean {
    if (!this.CanTakeAction()) {
      this.ShowFeedback("WAIT FOR THE BALL");
      return false;
    }
    return this.aim.BeginVRAim(startWorld, this.BallPosition().y, true);
  }

  UpdateAim(currentWorld: Vector3): void {
    this.aim.UpdateVRAim(currentWorld);
  }

  EndAimAndShoot(): boolean {
    const impulse = this.aim.TryEndVRAimAndShoot(this.CanTakeAction());
    for (const club of this.clubs) club.Reset();
    if (!impulse) return false;
    this.Shoot(impulse);
    return true;
  }

  CancelAim(): void {
    this.aim.CancelAim();
    for (const club of this.clubs) club.Reset();
  }

  Haptic(side: HandSide, strength: number, seconds: number): void {
    if (this.game.settings.haptics) this.Input.Haptic(side, strength, seconds);
  }

  private HapticBoth(strength: number, seconds: number): void {
    this.Haptic(Hand.Left, strength, seconds);
    this.Haptic(Hand.Right, strength, seconds);
  }

  // ---- upstream rules ---------------------------------------------------------------------------------------------

  /** CanTakeAction (:552-555). "Speed at most 0.10" is the ball graph's report for the latest shot. */
  CanTakeAction(): boolean {
    return this.ballLive && !this.game.IsRevealing() && !this.capturing && this.finished === PLAYING && this.atRest && this.restShot >= this.shotNumber && this.game.Plays(this.Player!.uid);
  }

  /** ShowFeedback (:844-848). */
  ShowFeedback(message: string, duration: number = MESSAGE_SECONDS.standard): void {
    this.feedback = message;
    this.feedbackUntil = this.Time.time + duration;
  }

  /** TryApplyShot's effects (:542-548) for an impulse GolfAim allowed. */
  private Shoot(impulse: Vector3): void {
    this.shotNumber++;
    this.atRest = false;
    this.game.relay.impulse(this.game.BallKey(this.slot), impulse, this.shotNumber);
    this.levelStrokes++;
    this.holeStrokes++;
    this.totalStrokes++;
    this.shots++;
    this.game.audio.PlayShotSfx(this.game.ballAudio[this.slot] ?? null);
    this.HapticBoth(0.7, HAPTIC);
    this.RequestSerialization();
  }

  /** InstantiateBallAtSpawn (:557-591): the pooled ball, owned by this player, at the reset point and at rest. */
  private InstantiateBallAtSpawn(): void {
    const ball = this.game.balls[this.slot];
    if (!ball || !this.game.CurrentLevel) return;
    const world = this.game.SpawnWorld();
    ball.TakeOwnership();
    ball.transform.position = world;
    this.game.relay.place(ball.key, world, this.shotNumber);
    this.ballLive = true;
    this.atRest = true;
    this.restShot = this.shotNumber;
    this.restSince = this.Time.time;
  }

  /** ResetBall (:603-640): stops everything pending (StopAllCoroutines) and puts the ball back. No stroke (D2). */
  ResetBall(penalty: boolean): void {
    this.capturing = false;
    this.captureEndsAt = -1;
    this.spawnPending = false;
    this.CancelAim();
    this.InstantiateBallAtSpawn();
    this.HapticBoth(0.4, HAPTIC);
    if (penalty) {
      this.levelStrokes++;
      this.holeStrokes++;
      this.totalStrokes++;
    }
    this.RequestSerialization();
  }

  /** CaptureBall (:642-704), first part: the ball graph saw the cup test pass. */
  private CaptureBall(): void {
    const key = this.game.BallKey(this.slot);
    this.capturing = true;
    this.CancelAim();
    this.captures++;
    this.game.audio.PlayHoleSfx(this.game.ballAudio[this.slot] ?? null);
    this.Haptic(Hand.Right, 0.9, 0.25);
    this.game.relay.assist(key, false, Vector3.zero, this.game.tuning);
    this.game.relay.sink(key, this.game.HoleWorld(), this.game.tuning.centerDrop, this.game.tuning.sinkDepth);
    this.captureEndsAt = this.Time.time + CENTERING_SECONDS + SINKING_SECONDS;
    this.RequestSerialization();
  }

  /** CaptureBall, after the sink: the hole is complete for this player. The referee waits for everyone, then advances. */
  private FinishCapture(): void {
    this.captureEndsAt = -1;
    this.capturing = false;
    this.finished = HOLED;
    const level = this.game.CurrentLevel!;
    this.ShowFeedback(HoleCompleteMessage(this.levelStrokes, level.par), MESSAGE_SECONDS.hole);
    this.RequestSerialization();
  }

  /** RestartCurrentLevel (:830-836) for this player only: ball back, level strokes 0, total kept (K2); no reveal replay. */
  RestartCurrentLevel(): void {
    if (!this.isLocal || this.slot < 0 || !this.game.Plays(this.Player!.uid)) return;
    // FIX K3: upstream reloads during the capture or after the hole is complete and leaves the capture coroutine
    // running, which then touches a destroyed ball and still advances. A finished or sinking hole cannot be restarted.
    if (this.finished !== PLAYING || this.capturing || this.game.IsRevealing() || !this.ballLive) return;
    this.CancelAim();
    this.levelStrokes = 0;
    this.InstantiateBallAtSpawn();
    this.ShowFeedback("LEVEL RESTARTED", MESSAGE_SECONDS.restarted);
    this.RequestSerialization();
  }

  /** LoadLevel (:706-823), this player's part: strokes to 0, flags cleared, the ball after the reveal (A5, A6, A11). */
  private OnLevelLoaded(): void {
    const level = this.game.CurrentLevel!;
    this.hole = level.index;
    this.levelStrokes = 0;
    this.holeStrokes = 0;
    this.finished = PLAYING;
    this.capturing = false;
    this.captureEndsAt = -1;
    this.CancelAim();
    this.ballLive = false;
    this.spawnPending = true;
    this.ShowFeedback(LevelMessage(level.index, level.levelName), MESSAGE_SECONDS.level);
    this.RequestSerialization();
  }

  // ---- the tick -----------------------------------------------------------------------------------------------------

  override Start(): void {
    // The ball graph's reports (GolfRelay.GRAPH_EVENTS). Registered here rather than as {"kind":"graph"} bindings: the kit
    // builder's C# bindings writer has no graph-event entry (portkit gap). Every copy registers; only the local player's
    // acts on them (OnCaptureReported and the others check isLocal and the ball).
    this.RegisterGraphEvent(GRAPH_EVENTS.capture, "OnGolfCapture");
    this.RegisterGraphEvent(GRAPH_EVENTS.rest, "OnGolfRest");
    this.RegisterGraphEvent(GRAPH_EVENTS.impact, "OnGolfImpact");
  }

  /** B2: each hand's translucent green sphere, attached to the local player's hands in a headset (not on desktop). */
  private spheresAttached = false;

  private AttachHandSpheres(): void {
    if (this.spheresAttached || this.Input.IsVR !== true) return;
    this.spheresAttached = true;
    this.game.handSpheres.forEach((sphere, side) => {
      if (!sphere) return;
      sphere.SetActive(true);
      sphere.AttachToHand(side as HandSide);
    });
  }

  override OnDestroy(): void {
    if (this.spheresAttached) for (const sphere of this.game?.handSpheres ?? []) sphere?.Detach();
  }

  override Update(): void {
    if (!this.isLocal || !this.game?.settings) return;
    const game = this.game;
    this.AttachHandSpheres();
    if (game.round === 0) return;
    const uid = this.Player!.uid;

    if (this.round !== game.round) {
      // A new round (RestartCourse, or this device's saved state is from another one): totals to 0 (LoadLevel(0, true)).
      this.round = game.round;
      this.hole = -1;
      this.levelStrokes = this.holeStrokes = this.totalStrokes = 0;
      this.finished = PLAYING;
      this.capturing = false;
      this.captureEndsAt = -1;
      this.RequestSerialization();
    }

    const slot = game.SlotOf(uid);
    if (slot !== this.slot) {
      if (this.slot >= 0) game.relay.assist(game.BallKey(this.slot), false, Vector3.zero, game.tuning);
      this.slot = slot;
      this.CancelAim();
      this.ballLive = false;
      // Seated again in the same hole (a reload, or back within the seat grace): the ball returns to the reset point.
      this.spawnPending = slot >= 0 && this.hole === game.currentLevelIndex && this.finished === PLAYING;
    }
    if (slot < 0 || game.courseComplete || game.currentLevelIndex < 0) {
      this.Idle();
      return;
    }
    if (this.hole !== game.currentLevelIndex) this.OnLevelLoaded();
    if (!game.Plays(uid)) {
      this.Idle();
      return;
    }

    if (this.spawnPending && !game.IsRevealing()) {
      this.spawnPending = false;
      this.InstantiateBallAtSpawn();
    }
    if (this.captureEndsAt >= 0 && this.Time.time >= this.captureEndsAt) this.FinishCapture();
    if (this.finished === PLAYING && game.ResultFor(uid, this.hole) !== null) {
      // The referee recorded this hole for us (hole timeout).
      this.finished = OUT_OF_TIME;
      this.capturing = false;
      this.captureEndsAt = -1;
      this.CancelAim();
      this.ShowFeedback("OUT OF TIME");
      this.RequestSerialization();
    }
    if (this.finished !== PLAYING || !this.ballLive) {
      this.Idle();
      return;
    }

    // Out of bounds (Update :281-295), never while capturing or revealing.
    const level = game.CurrentLevel!;
    if (!this.capturing && !game.IsRevealing() && level.IsOutsideCourse(this.BallPosition(), game.frame, game.LevelPosition(level.index))) {
      this.ResetBall(false);
      this.ShowFeedback("BALL RETURNED");
    }
    this.CheckStrokeLimit();
    if (this.finished !== PLAYING) {
      this.Idle();
      return;
    }

    for (const club of this.clubs) club.Update(this);
    const key = game.BallKey(slot);
    const armed = !game.IsRevealing() && !this.capturing && !this.aim.dragging;
    game.relay.assist(key, armed, game.HoleWorld(), game.tuning);
    this.UpdateAimingLine();
    this.UpdateReveal();
  }

  /** Stroke limit (new, PORT.md 3.4; setting `stroke-limit`, 0 = none as upstream): pick up once the last allowed stroke has stopped. */
  private CheckStrokeLimit(): void {
    const limit = this.game.settings.strokeLimit;
    if (limit <= 0 || this.holeStrokes < limit || this.capturing || !this.atRest || this.restShot < this.shotNumber) return;
    if (this.Time.time - this.restSince < STROKE_LIMIT_GRACE) return;
    this.finished = PICKED_UP;
    this.CancelAim();
    this.ShowFeedback("STROKE LIMIT  •  PICKED UP", MESSAGE_SECONDS.hole);
    this.RequestSerialization();
  }

  /** Nothing to play: no aim, no line, no assist on our ball. */
  private Idle(): void {
    if (this.aim.dragging) this.CancelAim();
    this.UpdateAimingLine();
    if (this.slot >= 0) this.game.relay.assist(this.game.BallKey(this.slot), false, Vector3.zero, this.game.tuning);
    this.UpdateReveal();
  }

  /** UpdateAimingLine (:492-526). */
  private UpdateAimingLine(): void {
    const target = this.game.aimLine?.key;
    if (!target) return;
    const t = this.game.tuning;
    if (!this.aim.dragging || !this.ballLive) {
      this.game.relay.line(target, false, Vector3.zero, Vector3.zero, 0, AimLineColor(0));
      return;
    }
    const from = this.BallPosition();
    const to = from.add(this.aim.aimDirection.scale(AimLineLength(this.aim.shotPower, this.aim.aimDirection, t)));
    this.game.relay.line(target, true, from, to, t.aimingLineWidth, AimLineColor(this.aim.shotPower));
  }

  /** ProximityRevealVolume per hand while its grip is held; desktop: G on the own ball. */
  private UpdateReveal(): void {
    const target = this.game.course?.key;
    if (!target) return;
    this.reveal ??= new RevealVolumeManager(this.game.relay, target);
    const t = this.game.tuning;
    const active: RevealSphere[] = [];
    if (this.game.settings.reveal) {
      for (const side of [Hand.Left, Hand.Right] as const) {
        const volume = this.volumes[side]!;
        volume.revealRadius = t.revealRadius;
        volume.edgeSoftness = t.revealSoftness;
        const hand = this.HandPosition(side);
        if (hand && volume.IsRevealActive(this.Input.GetButton(Button.Grip, side))) active.push(volume.Sphere(hand));
      }
      if (this.ballLive && (this.Input.GetKey("G") || this.Input.GetKey("LeftShift")) && active.length < 2) active.push(this.volumes[0]!.Sphere(this.BallPosition()));
    }
    this.reveal.PushGlobals(active);
  }

  // ---- what the graphs and the page report --------------------------------------------------------------------------

  OnCaptureReported(ball: number, _shot: number): void {
    if (!this.isLocal || ball !== this.slot || !this.ballLive || this.capturing || this.finished !== PLAYING) return;
    // FixedUpdate's own conditions (:353-362): not while revealing or aiming.
    if (this.game.IsRevealing() || this.aim.dragging) return;
    this.CaptureBall();
  }

  OnRestReported(ball: number, shot: number, atRest: boolean): void {
    if (!this.isLocal || ball !== this.slot || shot !== this.shotNumber) return;
    if (atRest && !this.atRest) this.restSince = this.Time.time;
    this.atRest = atRest;
    if (atRest) this.restShot = shot;
  }

  OnImpactReported(ball: number, speed: number, other: string): void {
    if (!this.isLocal || ball !== this.slot) return;
    const strength = this.game.impact.RegisterImpact(speed, this.Time.time);
    if (strength !== null) this.HapticBoth(strength, HAPTIC);
    if (ImpactPlaysSound(other)) this.game.audio.PlayCollisionSfx(this.game.ballAudio[this.slot] ?? null);
  }

  // ---- bound in bindings.json to this per-player behaviour: the runtime hands them to the local player's copy ------------

  /** A click on an aim pad (every level's pad is bound here; only the current level's is switched on). */
  AimPadClick(detail: HostEventDetail): void {
    this.OnAimPadClick(this.game.currentLevelIndex, detail);
  }

  /** A click on a ball's pick sphere: it counts for the own ball when that is the ball nearest the click point. */
  BallPickClick(detail: HostEventDetail): void {
    if (this.slot < 0) return;
    let nearest = this.slot;
    if (detail.point) {
      let best = Infinity;
      this.game.balls.forEach((ball, slot) => {
        if (!ball) return;
        const d = ball.transform.position.sub(detail.point!).magnitude;
        if (d < best) [best, nearest] = [d, slot];
      });
    }
    this.OnBallClick(nearest);
  }

  /** RESTART HOLE on the board (upstream: left Menu button, :244-260): the course when it is complete, else this hole. */
  RestartMyHole(): void {
    this.game.RestartMyHole();
  }

  /** Graph event golfCapture `<ball>|<shot>` from the ball's fixed-step graph (only the owner arms it). */
  OnGolfCapture(ball: string, shot: string): void {
    this.OnCaptureReported(Number(ball), Number(shot));
  }

  /** Graph event golfRest `<ball>|<shot>|<1 at rest, 0 moving>`. */
  OnGolfRest(ball: string, shot: string, atRest: string): void {
    this.OnRestReported(Number(ball), Number(shot), atRest === "1");
  }

  /** Graph event golfImpact `<ball>|<relative speed>|<other collider's name>`. */
  OnGolfImpact(ball: string, speed: string, other: string): void {
    this.OnImpactReported(Number(ball), Number(speed), other ?? "");
  }

  OnAimPadClick(level: number, detail: HostEventDetail): void {
    if (!this.isLocal || level !== this.game.currentLevelIndex || this.slot < 0 || this.finished !== PLAYING) return;
    this.desktop.mode = this.game.settings.desktopAim;
    this.desktop.Click(this, detail);
  }

  OnBallClick(slot: number): void {
    if (this.isLocal && slot === this.slot && this.aim.dragging) this.EndAimAndShoot();
  }

  override OnButtonPressed(button: ButtonName, side: HandSide): void {
    if (this.isLocal) this.clubs[side]?.OnButton(button, true);
  }

  override OnButtonReleased(button: ButtonName, side: HandSide): void {
    if (this.isLocal) this.clubs[side]?.OnButton(button, false);
  }

  override OnKeyPressed(key: string): void {
    if (!this.isLocal || !this.game?.settings) return;
    if (key === "R") {
      // Upstream's editor key for the left Menu button (:247-260): the course when complete, else this hole.
      this.game.RestartMyHole();
      return;
    }
    if (this.game.courseComplete && (key === "Return" || key === "Space")) {
      this.game.PlayAgain(); // D5's editor keys
      return;
    }
    const maxPull = this.game.tuning.vrMaximumDragDistance;
    const pull = this.aim.aimDirection.scale(this.aim.shotPower * maxPull);
    this.desktop.Key(this, key, this.aim.dragStartWorld, pull, maxPull);
  }

  // ---- other players' copies ---------------------------------------------------------------------------------------

  override OnDeserialization(result: DeserializationResult): void {
    if (this.isLocal || !this.game?.settings) return;
    if (result.isSnapshot || this.seenShots < 0) {
      this.seenShots = this.shots;
      this.seenCaptures = this.captures;
      return;
    }
    const slot = this.game.SlotOf(this.Player!.uid);
    const source = slot >= 0 ? (this.game.ballAudio[slot] ?? null) : null;
    if (this.shots > this.seenShots) this.game.audio.PlayShotSfx(source);
    if (this.captures > this.seenCaptures && slot >= 0 && this.game.CurrentLevel) {
      // The scale of a capture is not carried by the synced transform: each client plays the sink itself.
      this.game.audio.PlayHoleSfx(source);
      this.game.relay.sink(this.game.BallKey(slot), this.game.HoleWorld(), this.game.tuning.centerDrop, this.game.tuning.sinkDepth);
    }
    this.seenShots = this.shots;
    this.seenCaptures = this.captures;
  }
}
