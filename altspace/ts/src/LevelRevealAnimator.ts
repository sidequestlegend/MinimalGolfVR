// LevelRevealAnimator.cs (215 lines). The motion itself is a clip the kit builder bakes from these same numbers and the
// page starts with the `reveal` op; this file keeps the timing the rules depend on (A8 to A12) and the part offsets, so
// the clip and the rules agree and the tests can check both. Upstream runs it on unscaled time; here every client
// derives it from the shared `revealStart` on the synced clock, so a late joiner sees the reveal part-way.

import { Vector3 } from "../portkit/src/index.ts";

/** Scene values (identical on all 8 levels, PORT.md 5.2). */
export const REVEAL = {
  startDelay: 0.08,
  partDuration: 0.55,
  partStagger: 0.055,
  revealDistance: 6,
} as const;

/** `revealDirections`: left, right, up, down, forward, back (LevelRevealAnimator.cs:12-20). */
export const REVEAL_DIRECTIONS: readonly Vector3[] = [Vector3.left, Vector3.right, Vector3.up, Vector3.down, Vector3.forward, Vector3.back];

/** `AnimationCurve.EaseInOut(0, 0, 1, 1)`: two keys with zero tangents, which Unity's Hermite makes 3t^2 - 2t^3. */
export function easeInOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

export class LevelRevealAnimator {
  readonly PartCount: number;

  constructor(partCount: number) {
    this.PartCount = partCount;
  }

  /** LevelRevealAnimator.cs:38. */
  get TotalDuration(): number {
    return REVEAL.startDelay + REVEAL.partDuration + Math.max(0, this.PartCount - 1) * REVEAL.partStagger;
  }

  /** `IsPlaying` for a reveal that started `elapsed` seconds ago (true until the loop has covered TotalDuration). */
  IsPlaying(elapsed: number): boolean {
    return this.PartCount > 0 && elapsed < this.TotalDuration;
  }

  /** LevelRevealAnimator.cs:142-152. */
  GetRevealOffset(index: number): Vector3 {
    return REVEAL_DIRECTIONS[index % REVEAL_DIRECTIONS.length]!.normalized.scale(REVEAL.revealDistance);
  }

  /** The eased progress of part `index` (LevelRevealAnimator.cs:91-93). */
  PartProgress(index: number, elapsed: number): number {
    const partElapsed = elapsed - REVEAL.startDelay - index * REVEAL.partStagger;
    return easeInOut(Math.min(1, Math.max(0, partElapsed / Math.max(0.05, REVEAL.partDuration))));
  }

  /** Where part `index` is relative to its authored local position (LerpUnclamped(reveal, authored, eased)). */
  PartOffset(index: number, elapsed: number): Vector3 {
    if (!this.IsPlaying(elapsed)) return Vector3.zero;
    return this.GetRevealOffset(index).scale(1 - this.PartProgress(index, elapsed));
  }
}
