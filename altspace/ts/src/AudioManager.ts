// AudioManager.cs (240 lines): sound effects with no clip twice in a row. Music and its code are left out (the three
// tracks have no licence, PORT.md 6.4); so are the seven effects for now (same reason): the clip lists come from
// bindings and are empty until CC0 replacements are in the kit, so the plays below do nothing yet. The choice rule is
// kept and tested. Listener juggling, DontDestroyOnLoad and the singleton are dropped: one manager per client and table.
//
// Changed (PORT.md 10.1 #9): effects play through the ball's own audio source, 3D at the table, so that every player
// hears a shot at the ball that made it; upstream plays them on one near-2D source at the scene origin.

import type { AudioClipRef, AudioSourceRef } from "../portkit/src/index.ts";

/** PlayRandomOneShot's choice (AudioManager.cs:164-187): a random clip, never the one played last. */
export function ChooseIndex(count: number, previousIndex: number, rangeInt: (min: number, max: number) => number): number {
  if (count === 1) return 0;
  if (previousIndex < 0) return rangeInt(0, count);
  let index = rangeInt(0, count - 1);
  if (index >= previousIndex) index++;
  return index;
}

export class AudioManager {
  readonly shotClips: readonly AudioClipRef[];
  readonly holeClips: readonly AudioClipRef[];
  readonly collisionClip: AudioClipRef | null;
  private readonly rangeInt: (min: number, max: number) => number;
  previousShotIndex = -1;
  previousHoleIndex = -1;
  /** For tests: the clip each play chose. */
  LastPlayedSfx: AudioClipRef | null = null;

  constructor(shotClips: readonly AudioClipRef[], holeClips: readonly AudioClipRef[], collisionClip: AudioClipRef | null, rangeInt: (min: number, max: number) => number) {
    this.shotClips = shotClips ?? [];
    this.holeClips = holeClips ?? [];
    this.collisionClip = collisionClip ?? null;
    this.rangeInt = rangeInt;
  }

  PlayShotSfx(source: AudioSourceRef | null): void {
    if (!this.shotClips.length) return;
    this.previousShotIndex = ChooseIndex(this.shotClips.length, this.previousShotIndex, this.rangeInt);
    this.PlayOneShot(source, this.shotClips[this.previousShotIndex]!);
  }

  PlayHoleSfx(source: AudioSourceRef | null): void {
    if (!this.holeClips.length) return;
    this.previousHoleIndex = ChooseIndex(this.holeClips.length, this.previousHoleIndex, this.rangeInt);
    this.PlayOneShot(source, this.holeClips[this.previousHoleIndex]!);
  }

  /** Upstream assigns no collision clip (H4), so this plays nothing unless the kit adds one. */
  PlayCollisionSfx(source: AudioSourceRef | null): void {
    if (this.collisionClip) this.PlayOneShot(source, this.collisionClip);
  }

  private PlayOneShot(source: AudioSourceRef | null, clip: AudioClipRef): void {
    this.LastPlayedSfx = clip;
    source?.PlayOneShot(clip);
  }
}
