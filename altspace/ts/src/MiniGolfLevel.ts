// MiniGolfLevel.cs (57 lines): one level's identity, bounds and the out-of-bounds test. The data comes from
// levels.json (generated from PORT.md's level table, which was parsed from the upstream scene).
//
// Where things are. Upstream: VRCourseAnchor -> VRCourseLevels (scale 0.05) -> "Level n" at its layout slot -> parts.
// Here: the snippet's holder (position, rotation, scale) -> kit root -> "Course" (scale `table-scale`) -> level roots
// at their layout slots. Level roots have no rotation upstream (PORT.md 5.3), so a level's frame is its slot offset
// inside the course frame.

import { Quaternion, Vector3 } from "../portkit/src/index.ts";
import { LevelRevealAnimator } from "./LevelRevealAnimator.ts";
import data from "./levels.json" with { type: "json" };

/** The table scale upstream tunes everything for (VRCoursePlacement.tableScale, SCENE:27381). */
export const UPSTREAM_TABLE_SCALE = 0.05;

/** The course's frame in the world: the holder's pose times the table scale. */
export class CourseFrame {
  readonly position: Vector3;
  readonly rotation: Quaternion;
  /** Holder scale times table scale: world metres per course unit. */
  readonly worldScale: number;
  readonly tableScale: number;

  constructor(position = Vector3.zero, rotation = Quaternion.identity, holderScale = 1, tableScale = UPSTREAM_TABLE_SCALE) {
    this.position = position.clone();
    this.rotation = rotation.clone();
    this.worldScale = holderScale * tableScale;
    this.tableScale = tableScale;
  }

  /** How much bigger than upstream the table is: every world distance, speed and impulse of the tuning is scaled by it. */
  get factor(): number {
    return this.worldScale / UPSTREAM_TABLE_SCALE;
  }

  static fromSettings(settings: ReadonlyMap<string, string>): CourseFrame {
    const vec = (text: string | undefined): number[] | null => {
      if (!text) return null;
      const parts = text.trim().split(/\s+/).map(Number);
      return parts.every((p) => Number.isFinite(p)) ? parts : null;
    };
    const p = vec(settings.get("position"));
    const r = vec(settings.get("rotation"));
    const s = vec(settings.get("scale"));
    const t = Number(settings.get("table-scale") ?? "");
    return new CourseFrame(
      p && p.length === 3 ? new Vector3(p[0], p[1], p[2]) : Vector3.zero,
      r && r.length === 3 ? Quaternion.Euler(r[0]!, r[1]!, r[2]!) : Quaternion.identity,
      s && s.length >= 1 && s[0]! > 0 ? s[0]! : 1,
      Number.isFinite(t) && t > 0 ? t : UPSTREAM_TABLE_SCALE,
    );
  }

  /** Course space (VRCourseLevels' local space) to world space. */
  toWorld(course: Vector3): Vector3 {
    return this.position.add(this.rotation.rotate(course.scale(this.worldScale)));
  }

  /** World space to course space. */
  toCourse(world: Vector3): Vector3 {
    return this.rotation.inverse.rotate(world.sub(this.position)).scale(1 / this.worldScale);
  }
}

export class MiniGolfLevel {
  readonly index: number;
  readonly levelName: string;
  readonly par: number;
  readonly courseWidth: number;
  readonly courseLength: number;
  /** "Ball Reset Point", level-local. */
  readonly ballSpawn: Vector3;
  /** "Hole Center - Cup Assist Target", level-local. */
  readonly holeCenter: Vector3;
  readonly revealAnimator: LevelRevealAnimator;
  /** This level's authored slot under VRCourseLevels (its position before any swap). */
  readonly authoredPosition: Vector3;
  /** True where PORT.md says the scene value was computed and is to be confirmed in the editor (level 7's hole). */
  readonly provisional: boolean;

  constructor(entry: (typeof data.levels)[number]) {
    this.index = entry.index;
    this.levelName = entry.levelName;
    this.par = entry.par;
    this.courseWidth = entry.courseWidth;
    this.courseLength = entry.courseLength;
    this.ballSpawn = new Vector3(...(entry.ballSpawn as [number, number, number]));
    this.holeCenter = new Vector3(...(entry.holeCenter as [number, number, number]));
    this.revealAnimator = new LevelRevealAnimator(entry.revealParts);
    this.authoredPosition = new Vector3(...(entry.slot as [number, number, number]));
    this.provisional = (entry as { provisional?: boolean }).provisional === true;
  }

  /** `transform.InverseTransformPoint` for a level sitting at `localPosition` (its current slot) in the course. */
  InverseTransformPoint(world: Vector3, frame: CourseFrame, localPosition: Vector3): Vector3 {
    return frame.toCourse(world).sub(localPosition);
  }

  TransformPoint(local: Vector3, frame: CourseFrame, localPosition: Vector3): Vector3 {
    return frame.toWorld(localPosition.add(local));
  }

  /** MiniGolfLevel.cs:49-55. */
  IsOutsideCourse(worldPosition: Vector3, frame: CourseFrame, localPosition: Vector3): boolean {
    const local = this.InverseTransformPoint(worldPosition, frame, localPosition);
    return IsOutsideLocal(local, this.courseWidth, this.courseLength);
  }
}

/** The bounds test on a level-local point (MiniGolfLevel.cs:52-54). */
export function IsOutsideLocal(local: Vector3, courseWidth: number, courseLength: number): boolean {
  return local.y < -2.25 || Math.abs(local.x) > courseWidth * 0.5 + 2.5 || Math.abs(local.z) > courseLength * 0.5 + 2.5;
}

/** The eight levels in play order (upstream `levels`, SCENE:2061). */
export const LEVELS: readonly MiniGolfLevel[] = data.levels.map((entry) => new MiniGolfLevel(entry));

/** Authored slot positions, by slot index (= the level that was authored there). */
export const SLOTS: readonly Vector3[] = LEVELS.map((l) => l.authoredPosition);

export const TOTAL_PAR = LEVELS.reduce((sum, l) => sum + l.par, 0);
