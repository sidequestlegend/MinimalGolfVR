// MinimalGolfGame.cs (852 lines), split as PORT.md 3.4 proposes.
//
//   Here (MinimalGolfGame, one per table, written by the referee): the course. Which level is current, the level
//   layout (the swap of MinimalGolfGame.cs:718-740 kept as a permutation), when the current level's reveal started,
//   course complete, and the shared scorecard (GolfRound.ts). Advancing after a hole, restarting the course.
//   GolfPlayer.ts (one per player, written by that player): strokes, holed out, capturing, the ball, the shot.
//
// The shot model, the cup assist and the capture path are upstream's arithmetic, kept here as plain functions and a
// small class (GolfAim) so that the golden vectors can drive them alone (test/golden.test.ts).
//
// What moved where:
//   Awake, EnsureVRRig, EnsureClubsNextFrame, CreateClub, LogVRPose (:103-240)  dropped: the app owns the player
//   Update (:242-296)                 restart input -> board buttons and key R (GolfPlayer); out of bounds -> GolfPlayer
//   HandleThumbstickRotation (:298-349)  left out (PORT.md 10.2 #2): players walk round the table
//   FixedUpdate (:351-388)            the per-ball fixed-step graph; CupAssist below is its reference
//   BeginVRAim .. TryApplyShot (:391-550)   GolfAim below, driven by GolfPlayer
//   CanTakeAction, ResetBall, CaptureBall (:552-704)   GolfPlayer
//   LoadLevel, RestartCourse (:706-828)  LoadLevel below (referee); the per-player half in GolfPlayer.OnLevelLoaded
//   RestartCurrentLevel (:830-836)    GolfPlayer (that player's own hole only)

import { Behaviour, Color, Mathf, Vector3, type AudioClipRef, type AudioSourceRef, type GameObject, type Player, type StartKind } from "../portkit/src/index.ts";
import { AudioManager } from "./AudioManager.ts";
import { CameraImpactShake } from "./CameraImpactShake.ts";
import type { GolfPlayer } from "./GolfPlayer.ts";
import { GolfRelay } from "./GolfRelay.ts";
import * as Round from "./GolfRound.ts";
import { CourseFrame, LEVELS, SLOTS, type MiniGolfLevel } from "./MiniGolfLevel.ts";

// ---- the numbers (scene values, SCENE:2061-2098; code defaults differ, PORT.md 5.2) ----------------------------------

export interface Tuning {
  maximumImpulse: number;
  minimumImpulse: number;
  playableSpeed: number;
  vrMaximumDragDistance: number;
  vrMinShotPower: number;
  assistRadius: number;
  captureRadius: number;
  maximumAssistedSpeed: number;
  maximumCaptureSpeed: number;
  minimumPullAcceleration: number;
  maximumPullAcceleration: number;
  aimingLineWidth: number;
  vrAimingLineMinLength: number;
  vrAimingLineMaxLength: number;
  /** VRGolfClub: overlapRadius 0.11 plus the 0.08 of its distance test (VRGolfClub.cs:246, SCENE:11648). */
  clubReach: number;
  /** CaptureBall: drop while centring and depth below the hole centre (see FIX K4 below). */
  centerDrop: number;
  sinkDepth: number;
  /** ProximityRevealVolume: revealRadius and edgeSoftness (SCENE:23034-23040). */
  revealRadius: number;
  revealSoftness: number;
}

/** The upstream values at the upstream table scale (0.05). */
export const TUNING: Readonly<Tuning> = {
  maximumImpulse: 2.0,
  minimumImpulse: 0.005,
  playableSpeed: 0.1,
  vrMaximumDragDistance: 0.16,
  vrMinShotPower: 0.001,
  assistRadius: 0.04,
  captureRadius: 0.008,
  maximumAssistedSpeed: 0.6,
  maximumCaptureSpeed: 0.35,
  minimumPullAcceleration: 0.35,
  maximumPullAcceleration: 1.2,
  aimingLineWidth: 0.01,
  vrAimingLineMinLength: 0,
  vrAimingLineMaxLength: 0.3,
  clubReach: 0.11 + 0.08,
  // FIX K4: upstream drops 0.055 m and sinks 0.32 m in world metres (MinimalGolfGame.cs:662, 679), numbers from before
  // the course was put on a 1:20 table, so a 1.6 cm ball sank 32 cm, far through the 2.5 cm base. Scaled to the table.
  centerDrop: 0.055 * 0.05,
  sinkDepth: 0.32 * 0.05,
  revealRadius: 0.075,
  revealSoftness: 0.02,
};

/** Everything measured in world metres (and so per second, and impulses) grows with the table (`table-scale`). */
export function scaledTuning(factor: number): Tuning {
  const out = { ...TUNING };
  for (const key of Object.keys(out) as Array<keyof Tuning>) if (key !== "vrMinShotPower") out[key] = TUNING[key] * factor;
  return out;
}

/** CaptureBall timings (MinimalGolfGame.cs:665, 680) and the wait before the next level (:698). */
export const CENTERING_SECONDS = 0.1;
export const SINKING_SECONDS = 0.52;
export const ADVANCE_SECONDS = 2.05;

// ---- messages (ShowFeedback) ---------------------------------------------------------------------------------------

export const MESSAGE_SECONDS = { level: 1.65, standard: 1.25, hole: 2.2, restarted: 1.0 } as const;

export function LevelMessage(index: number, levelName: string): string {
  return "LEVEL " + (index + 1) + "  •  " + levelName;
}

/**
 * MinimalGolfGame.cs:696. FIX K1: upstream tests `strokes <= par` first, so a hole finished in exactly par says
 * "UNDER PAR!" and its "ON PAR!" branch can never run.
 */
export function HoleResult(strokes: number, par: number): string {
  return strokes < par ? "UNDER PAR!" : strokes === par ? "ON PAR!" : "+" + (strokes - par) + " OVER PAR";
}

export function HoleCompleteMessage(strokes: number, par: number): string {
  return "HOLE COMPLETE  •  " + HoleResult(strokes, par);
}

// ---- the shot (MinimalGolfGame.cs:391-550; "dragging", "dragStartWorld", "aimDirection", "shotPower") -----------------

export class GolfAim {
  dragging = false;
  dragStartWorld = Vector3.zero;
  aimDirection = Vector3.zero;
  shotPower = 0;
  tuning: Tuning;

  constructor(tuning: Tuning = TUNING) {
    this.tuning = tuning;
  }

  /** BeginVRAim (:391-413). `canTakeAction` is CanTakeAction(); false means "WAIT FOR THE BALL" and no aim. */
  BeginVRAim(startWorld: Vector3, ballY: number, canTakeAction: boolean): boolean {
    if (!canTakeAction) return false;
    this.dragging = true;
    this.dragStartWorld = new Vector3(startWorld.x, ballY, startWorld.z);
    this.aimDirection = Vector3.zero;
    this.shotPower = 0;
    return true;
  }

  /** UpdateVRAim (:415-428): pull = start - hand, horizontal; full power at vrMaximumDragDistance. */
  UpdateVRAim(currentWorld: Vector3): void {
    if (!this.dragging) return;
    const current = new Vector3(currentWorld.x, this.dragStartWorld.y, currentWorld.z);
    const pull = this.dragStartWorld.sub(current);
    pull.y = 0;
    const effectiveMax = Math.max(0.05 * (this.tuning.vrMaximumDragDistance / TUNING.vrMaximumDragDistance), this.tuning.vrMaximumDragDistance);
    const distance = Math.min(pull.magnitude, effectiveMax);
    this.shotPower = Mathf.Clamp01(distance / effectiveMax);
    this.aimDirection = pull.sqrMagnitude > 0.000001 ? pull.normalized : Vector3.zero;
  }

  /**
   * TryEndVRAimAndShoot (:430-456) with TryApplyShot (:528-550): the impulse to apply, or null when nothing is shot
   * (no stroke). `canTakeAction` is CanTakeAction() at release.
   */
  TryEndVRAimAndShoot(canTakeAction: boolean): Vector3 | null {
    if (!this.dragging) return null;
    this.dragging = false;
    const minPower = this.tuning.vrMinShotPower;
    if (this.shotPower < minPower || this.aimDirection.sqrMagnitude < 0.001) {
      this.shotPower = 0;
      this.aimDirection = Vector3.zero;
      return null;
    }
    if (!canTakeAction) {
      this.shotPower = 0;
      this.aimDirection = Vector3.zero;
      return null;
    }
    const impulse = this.TryApplyShot(this.aimDirection, this.shotPower, canTakeAction);
    this.shotPower = 0;
    this.aimDirection = Vector3.zero;
    return impulse;
  }

  /** TryApplyShot (:528-550): impulse = lerp(minimumImpulse, maximumImpulse, power) along the horizontal direction. */
  TryApplyShot(direction: Vector3, power: number, canTakeAction: boolean): Vector3 | null {
    if (!canTakeAction) return null;
    const d = new Vector3(direction.x, 0, direction.z);
    if (d.sqrMagnitude < 0.0001) return null;
    const unit = d.normalized;
    const p = Mathf.Clamp01(power);
    if (p < this.tuning.vrMinShotPower) return null;
    const impulse = Mathf.Lerp(this.tuning.minimumImpulse, this.tuning.maximumImpulse, p);
    return unit.scale(impulse);
  }

  /** CancelAim (:478-490). */
  CancelAim(): void {
    this.dragging = false;
    this.shotPower = 0;
    this.aimDirection = Vector3.zero;
  }
}

/** UpdateAimingLine (:505-510): VR length, 0 when there is no direction. */
export function AimLineLength(power: number, direction: Vector3, tuning: Tuning = TUNING): number {
  if (direction.sqrMagnitude < 0.0001) return 0;
  return Mathf.Lerp(tuning.vrAimingLineMinLength, tuning.vrAimingLineMaxLength, power);
}

const LOW = new Color(0x89 / 255, 0xe0 / 255, 0xb3 / 255, 1);
const MIDDLE = new Color(0xf3 / 255, 0xc9 / 255, 0x6b / 255, 1);
const HIGH = new Color(0xe1 / 255, 0x82 / 255, 0x2f / 255, 1);

/** UpdateAimingLine (:518-523) and the power meter (VRGolfUI.cs:208-209): the same three-stop colour. */
export function AimLineColor(power: number): Color {
  return power < 0.55 ? Color.Lerp(LOW, MIDDLE, power / 0.55) : Color.Lerp(MIDDLE, HIGH, (power - 0.55) / 0.45);
}

// ---- what the per-ball graph does each physics step (FixedUpdate, :351-388) -------------------------------------------

/** The reference for the generated ball graph: the acceleration toward the hole, and whether capture starts. */
export function CupAssist(ball: Vector3, velocity: Vector3, hole: Vector3, t: Tuning = TUNING): { acceleration: Vector3 | null; capture: boolean } {
  const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  const offset = hole.sub(ball);
  offset.y = 0;
  const distance = offset.magnitude;
  if (distance <= t.assistRadius && horizontalSpeed <= t.maximumAssistedSpeed) {
    const closeness = 1 - Mathf.Clamp01(distance / t.assistRadius);
    const acceleration = Mathf.Lerp(t.minimumPullAcceleration, t.maximumPullAcceleration, closeness * closeness);
    const scale = t.assistRadius / TUNING.assistRadius;
    const pull = distance > 0.001 * scale ? offset.normalized.scale(acceleration) : null;
    const capture = distance <= t.captureRadius && horizontalSpeed <= t.maximumCaptureSpeed && Math.abs(ball.y - hole.y) < 1.25 * scale;
    return { acceleration: pull, capture };
  }
  return { acceleration: null, capture: false };
}

/** Mathf.SmoothStep(0, 1, t). */
export function smoothStep01(t: number): number {
  const c = Mathf.Clamp01(t);
  return -2 * c * c * c + 3 * c * c;
}

/** CaptureBall's path (:659-692): position and scale `elapsed` seconds after capture began. */
export function CapturePath(elapsed: number, start: Vector3, hole: Vector3, t: Tuning = TUNING): { position: Vector3; scale: number } {
  const centered = new Vector3(hole.x, start.y - t.centerDrop, hole.z);
  if (elapsed < CENTERING_SECONDS) {
    const k = smoothStep01(elapsed / CENTERING_SECONDS);
    return { position: Vector3.Lerp(start, centered, k), scale: Mathf.Lerp(1, 0.88, k) };
  }
  const target = hole.add(Vector3.down.scale(t.sinkDepth));
  const k = smoothStep01((elapsed - CENTERING_SECONDS) / SINKING_SECONDS);
  return { position: Vector3.Lerp(centered, target, k), scale: Mathf.Lerp(0.88, 0.08, k) };
}

/** LoadLevel's swap (:718-740): the new level takes the previous one's slot and the previous one takes the new one's. */
export function SwapLayout(slotOf: readonly number[], previous: number, next: number): number[] {
  const out = slotOf.slice();
  if (previous >= 0 && previous !== next) {
    const a = out[previous]!;
    out[previous] = out[next]!;
    out[next] = a;
  }
  return out;
}

// ---- the table --------------------------------------------------------------------------------------------------------

export interface GolfSettings {
  maxPlayers: number;
  /** Seconds after the first player holes out before the rest are recorded as out of time; 0 = never. */
  holeTimeout: number;
  /** Strokes on a hole before a player picks up; 0 = no limit (upstream). */
  strokeLimit: number;
  /** "pull": a desktop click is where the hand is pulled to (upstream's slingshot). "target": the ball goes toward it. */
  desktopAim: "pull" | "target";
  reveal: boolean;
  haptics: boolean;
  showOtherLevels: boolean;
}

export function readSettings(settings: ReadonlyMap<string, string>): GolfSettings {
  const num = (name: string, fallback: number) => {
    const v = Number(settings.get(name) ?? "");
    return settings.has(name) && settings.get(name) !== "" && Number.isFinite(v) ? v : fallback;
  };
  const bool = (name: string, fallback: boolean) => {
    const v = (settings.get(name) ?? "").trim().toLowerCase();
    return v === "" ? fallback : v !== "false" && v !== "0" && v !== "no";
  };
  return {
    maxPlayers: Math.max(1, Math.min(Round.MAX_SLOTS, Math.trunc(num("max-players", Round.MAX_SLOTS)))),
    holeTimeout: Math.max(0, num("hole-timeout", 120)),
    strokeLimit: Math.max(0, Math.trunc(num("stroke-limit", 0))),
    desktopAim: (settings.get("desktop-aim") ?? "").trim() === "target" ? "target" : "pull",
    reveal: bool("reveal", true),
    haptics: bool("haptics", true),
    showOtherLevels: bool("show-other-levels", true),
  };
}

/** Seconds a player may be missing from the instance before the referee marks their row as left. */
const ABSENT_SECONDS = 3;

export class MinimalGolfGame extends Behaviour {
  /** What other clients may ask the referee to run (SendCommand): the board's JOIN / LEAVE and PLAY AGAIN. */
  static override networkCallable = ["Join", "LeaveSeat", "RestartCourse"];
  static override synced = ["round", "currentLevelIndex", "slotOf", "revealStart", "courseComplete", "holeDoneAt", "firstHoledAt", "card"];

  /** Server seconds at which this round (course) started; 0 before the first. A device's saved player state from another round is not used. */
  round = 0;
  /** -1 before the first level is loaded (upstream `currentLevel == null`). */
  currentLevelIndex = -1;
  /** For each level, the index of the authored slot it now occupies (the swap layout, K7). */
  slotOf: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  /** Server seconds at which the current level's reveal began. */
  revealStart = 0;
  courseComplete = false;
  /** Server seconds at which everyone was done with the current hole; 0 while it is in play. */
  holeDoneAt = 0;
  /** Server seconds at which the first player finished the current hole (hole timeout); 0 before. */
  firstHoledAt = 0;
  card: Round.CardRow[] = [];

  // ---- from bindings.json ----
  course!: GameObject;
  levelObjects: GameObject[] = [];
  aimPads: GameObject[] = [];
  balls: GameObject[] = [];
  ballPicks: GameObject[] = [];
  ballAudio: Array<AudioSourceRef | null> = [];
  aimLine!: GameObject;
  /** B2: the left and right hand's green sphere (attached to the local hands in a headset). */
  handSpheres: Array<GameObject | null> = [];
  board: GameObject | null = null;
  /** Left out (no licence; PORT.md 6.4): empty until CC0 replacements are chosen. */
  shotClips: AudioClipRef[] = [];
  holeClips: AudioClipRef[] = [];
  collisionClip: AudioClipRef | null = null;

  // ---- this client only ----
  frame = new CourseFrame();
  tuning: Tuning = { ...TUNING };
  settings!: GolfSettings;
  relay!: GolfRelay;
  audio!: AudioManager;
  impact!: CameraImpactShake;
  private appliedLayout = "";
  private appliedVisible: Array<boolean | null> = [];
  private appliedPads: Array<boolean | null> = [];
  private revealSent = "";
  private ballShown: Array<boolean | null> = [];
  private readonly absentSince = new Map<string, number>();

  // ---- start -----------------------------------------------------------------------------------------------------

  override Start(): void {
    this.settings = readSettings(this.Settings);
    this.frame = CourseFrame.fromSettings(this.Settings);
    this.tuning = scaledTuning(this.frame.factor);
    this.relay = new GolfRelay(this.Host);
    this.audio = new AudioManager(this.shotClips, this.holeClips, this.collisionClip, (min, max) => this.Random.RangeInt(min, max));
    this.impact = new CameraImpactShake();
    // The course node carries the table scale (upstream VRCourseLevels, 0.05); the holder carries `scale`.
    const t = this.frame.tableScale;
    if (this.course) this.course.transform.localScale = new Vector3(t, t, t);
    const boardAt = (this.Settings.get("board") ?? "").trim().split(/\s+/).map(Number);
    if (this.board && boardAt.length === 3 && boardAt.every((v) => Number.isFinite(v))) this.board.transform.localPosition = new Vector3(boardAt[0], boardAt[1], boardAt[2]);
  }

  override OnInstanceStart(kind: StartKind): void {
    // "resumed": saved state nobody is playing (everyone left; space state lasts 24 h). PORT.md 3.4 "Everyone gone".
    if (this.Networking.IsReferee && (this.round === 0 || kind === "resumed")) this.StartRound(false);
  }

  // ---- reading the shared state ------------------------------------------------------------------------------------

  Now(): number {
    return this.Networking.GetServerTimeInSeconds();
  }

  get CurrentLevel(): MiniGolfLevel | null {
    return this.currentLevelIndex >= 0 ? (LEVELS[this.currentLevelIndex] ?? null) : null;
  }

  /** Where a level sits in the course now (its layout slot). */
  LevelPosition(level: number): Vector3 {
    return SLOTS[this.slotOf[level] ?? level]!.clone();
  }

  /** MiniGolfLevel.IsRevealing for the current level, from the shared start time. */
  IsRevealing(): boolean {
    const level = this.CurrentLevel;
    return !!level && level.revealAnimator.IsPlaying(this.Now() - this.revealStart);
  }

  RowOf(uid: string): Round.CardRow | null {
    return Round.rowOf(this.card, uid);
  }

  /** The slot (and ball) of a seated, present player, or -1. */
  SlotOf(uid: string): number {
    const row = this.RowOf(uid);
    return row && !row.left ? row.slot : -1;
  }

  /** True when that player plays the current hole (seated, and joined at or before it). */
  Plays(uid: string): boolean {
    const row = this.RowOf(uid);
    return !!row && !row.left && row.slot >= 0 && row.joined <= this.currentLevelIndex && !this.courseComplete;
  }

  /** The card's result for a player and hole, or null. */
  ResultFor(uid: string, hole: number): number | null {
    const row = this.RowOf(uid);
    return row && hole >= 0 ? (row.strokes[hole] ?? null) : null;
  }

  LocalPlayer(): GolfPlayer | null {
    return this.PlayerBehaviour<GolfPlayer>(this.Networking.LocalPlayer, "GolfPlayer");
  }

  /** The per-player behaviour of whoever holds a slot, if they are present. */
  PlayerInSlot(slot: number): GolfPlayer | null {
    const row = Round.rowInSlot(this.card, slot);
    if (!row) return null;
    for (const p of this.Networking.GetPlayers()) if (p.uid === row.uid) return this.PlayerBehaviour<GolfPlayer>(p, "GolfPlayer");
    return null;
  }

  BallKey(slot: number): string {
    return this.balls[slot]?.key ?? "";
  }

  HoleWorld(): Vector3 {
    const level = this.CurrentLevel!;
    return level.TransformPoint(level.holeCenter, this.frame, this.LevelPosition(level.index));
  }

  SpawnWorld(): Vector3 {
    const level = this.CurrentLevel!;
    return level.TransformPoint(level.ballSpawn, this.frame, this.LevelPosition(level.index));
  }

  // ---- buttons on the board (any client) ----------------------------------------------------------------------------

  /** JOIN / LEAVE. */
  ToggleJoin(): void {
    const me = this.Networking.LocalPlayer;
    if (this.SlotOf(me.uid) >= 0) this.SendCommand("LeaveSeat");
    else this.SendCommand("Join");
  }

  /** RESTART HOLE (upstream: left Menu button or R, MinimalGolfGame.cs:244-260). */
  RestartMyHole(): void {
    if (this.courseComplete) {
      this.PlayAgain();
      return;
    }
    this.LocalPlayer()?.RestartCurrentLevel();
  }

  /** PLAY AGAIN (VRGolfUI.cs:145-147; clickable here, D6). */
  PlayAgain(): void {
    if (this.courseComplete) this.SendCommand("RestartCourse");
  }

  // ---- commands, run by the referee -------------------------------------------------------------------------------

  Join(): void {
    const caller = this.Networking.CallingPlayer;
    if (!caller || !this.Networking.IsReferee) return;
    const row = this.RowOf(caller.uid);
    if (row && row.slot >= 0) {
      row.left = false;
      row.name = caller.displayName;
    } else {
      const slot = Round.freeSlot(this.card, this.settings.maxPlayers);
      if (slot < 0) return; // the table is full
      const joined = Round.joinHole(this.currentLevelIndex, this.holeDoneAt > 0, this.courseComplete);
      if (row) {
        row.slot = slot;
        row.left = false;
        row.joined = Math.max(row.joined, joined);
      } else this.card.push(Round.newRow(caller.uid, caller.displayName, slot, joined));
    }
    this.card = Round.sortedRows(this.card);
    this.Commit();
  }

  LeaveSeat(): void {
    const caller = this.Networking.CallingPlayer;
    if (!caller || !this.Networking.IsReferee) return;
    const row = this.RowOf(caller.uid);
    if (!row || row.slot < 0) return;
    row.left = true;
    row.leftAt = this.Now();
    row.slot = -1;
    this.card = Round.sortedRows(this.card);
    this.Commit();
  }

  /** RestartCourse (:825-828): only once the course is complete (D5); everyone starts again from level 1. */
  RestartCourse(): void {
    if (!this.Networking.IsReferee || !this.courseComplete) return;
    const caller = this.Networking.CallingPlayer;
    if (caller && this.SlotOf(caller.uid) < 0) return; // a spectator cannot restart a round others are seated in
    this.StartRound(true);
  }

  // ---- the referee's side of the course ---------------------------------------------------------------------------

  private Commit(): void {
    this.Networking.SetOwner(this.Networking.LocalPlayer, this.gameObject);
    this.RequestSerialization();
  }

  /** A new round from level 1 with every total at 0 (LoadLevel(0, true)). */
  StartRound(keepRows: boolean): void {
    this.round = Math.max(this.round + 1, Math.floor(this.Now()));
    this.card = keepRows ? Round.resetCard(this.card) : [];
    this.LoadLevel(0);
  }

  /** LoadLevel (:706-761), the shared half: layout swap, current level, reveal start; everyone's strokes go to 0 on their own. */
  LoadLevel(index: number): void {
    const newIndex = Mathf.Clamp(index, 0, LEVELS.length - 1);
    this.slotOf = SwapLayout(this.slotOf, this.currentLevelIndex, newIndex);
    this.currentLevelIndex = newIndex;
    this.courseComplete = false;
    this.revealStart = this.Now();
    this.holeDoneAt = 0;
    this.firstHoledAt = 0;
    this.Commit();
  }

  /** Runs on the referee every tick: seats, results, the end of the hole, the next level (CaptureBall :695-703). */
  private RefereeUpdate(): void {
    const now = this.Now();
    let changed = false;
    if (this.round === 0) {
      this.StartRound(false);
      return;
    }

    // Seats: a player who is gone keeps their slot for SEAT_GRACE seconds; one who comes back within it carries on.
    const present = new Set(this.Networking.GetPlayers().map((p) => p.uid));
    for (const row of this.card) {
      if (present.has(row.uid)) {
        this.absentSince.delete(row.uid);
        if (row.left && row.slot >= 0) {
          row.left = false;
          changed = true;
        }
      } else if (!row.left) {
        const since = this.absentSince.get(row.uid) ?? now;
        this.absentSince.set(row.uid, since);
        if (now - since >= ABSENT_SECONDS) {
          row.left = true;
          row.leftAt = now;
          changed = true;
        }
      }
    }
    if (Round.releaseSeats(this.card, now)) changed = true;

    const hole = this.currentLevelIndex;
    if (!this.courseComplete && hole >= 0) {
      // Results, as each player reports them in their own state.
      for (const p of this.Networking.GetPlayers()) {
        const gp = this.PlayerBehaviour<GolfPlayer>(p, "GolfPlayer");
        const row = this.RowOf(p.uid);
        if (!gp || !row || row.slot < 0 || gp.round !== this.round || gp.hole !== hole || gp.finished === 0) continue;
        if (Round.record(row, hole, gp.holeStrokes, gp.finished === 2 ? "max" : gp.finished === 3 ? "dnf" : "")) {
          if (this.firstHoledAt === 0) this.firstHoledAt = now;
          changed = true;
        }
      }
      // Hole timeout (PORT.md 3.4 "Not blocking the group"): the rest are recorded with their strokes so far.
      if (this.settings.holeTimeout > 0 && this.firstHoledAt > 0 && now >= this.firstHoledAt + this.settings.holeTimeout && this.holeDoneAt === 0) {
        for (const row of Round.activeRows(this.card, hole)) {
          if (Round.isFinished(row, hole)) continue;
          const gp = this.PlayerInSlot(row.slot);
          if (Round.record(row, hole, gp && gp.round === this.round && gp.hole === hole ? gp.holeStrokes : 0, "dnf")) changed = true;
        }
      }
      if (this.holeDoneAt === 0 && Round.holeFinished(this.card, hole)) {
        this.holeDoneAt = now;
        changed = true;
      }
      if (this.holeDoneAt > 0 && now >= this.holeDoneAt + ADVANCE_SECONDS) {
        if (hole + 1 < LEVELS.length) {
          this.LoadLevel(hole + 1);
          return;
        }
        this.courseComplete = true;
        changed = true;
      }
    }
    if (changed) this.Commit();
  }

  override OnPlayerLeft(player: Player): void {
    // Seen by the referee's sweep in RefereeUpdate (with a short grace); nothing to do at once.
    this.absentSince.set(player.uid, this.absentSince.get(player.uid) ?? this.Now());
  }

  // ---- every client: what the table looks like -------------------------------------------------------------------

  override Update(): void {
    if (this.Networking.IsReferee) this.RefereeUpdate();
    this.ApplyLayout();
    this.ApplyReveal();
    this.RefreshBalls();
  }

  /** Level roots at their layout slots; the others hidden when `show-other-levels` is off (A3). */
  private ApplyLayout(): void {
    const key = this.slotOf.join(",");
    if (key !== this.appliedLayout) {
      this.appliedLayout = key;
      this.levelObjects.forEach((obj, level) => {
        if (obj) obj.transform.localPosition = this.LevelPosition(level);
      });
    }
    this.levelObjects.forEach((obj, level) => {
      const visible = this.settings.showOtherLevels || level === this.currentLevelIndex;
      if (obj && this.appliedVisible[level] !== visible) {
        this.appliedVisible[level] = visible;
        obj.SetActive(visible);
      }
    });
    // Only the current level's aim pad takes clicks (a click on another level's green would aim from far away).
    this.aimPads.forEach((pad, level) => {
      const on = level === this.currentLevelIndex;
      if (pad && this.appliedPads[level] !== on) {
        this.appliedPads[level] = on;
        pad.SetActive(on);
      }
    });
  }

  /** PlayReveal (A8) on this client, joined part-way when the reveal is already running. */
  private ApplyReveal(): void {
    const level = this.CurrentLevel;
    if (!level) return;
    const key = `${this.round}:${this.currentLevelIndex}:${this.revealStart}`;
    if (key === this.revealSent) return;
    this.revealSent = key;
    const elapsed = this.Now() - this.revealStart;
    const target = this.levelObjects[level.index]?.key;
    if (target && level.revealAnimator.IsPlaying(elapsed)) this.relay.reveal(target, elapsed);
  }

  /** One ball per seated player, shown only while that player has one on the current level (A11, port of A7). */
  private RefreshBalls(): void {
    const local = this.Networking.LocalPlayer;
    for (let slot = 0; slot < this.balls.length; slot++) {
      const ball = this.balls[slot];
      if (!ball) continue;
      const row = Round.rowInSlot(this.card, slot);
      let visible = false;
      if (row && !row.left && !this.courseComplete && this.currentLevelIndex >= 0 && !this.IsRevealing()) {
        const gp = this.PlayerInSlot(slot);
        if (gp && gp.round === this.round && gp.hole === this.currentLevelIndex && gp.finished !== 2 && gp.finished !== 3) {
          visible = row.uid === local.uid ? gp.ballLive : true;
        }
      }
      if (this.ballShown[slot] !== visible) {
        this.ballShown[slot] = visible;
        ball.SetActive(visible);
      }
    }
  }

}
