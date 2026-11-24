// ProximityRevealVolume.cs (151 lines): an x-ray sphere on each hand, active while that hand's grip is held. Here the
// page reads the grip from the app's button events (its own threshold; there is no analog grip value, PORT.md 4), and
// the centre from the hand pose. Desktop: G held puts one sphere on the player's own ball (upstream's editor key; the
// README's "U" is not what the code reads, F2). Inspector-only parts (gizmos, OnValidate) are dropped.

import { Mathf, type Vector3 } from "../portkit/src/index.ts";

export interface RevealSphere {
  center: Vector3;
  radius: number;
  softness: number;
}

export class ProximityRevealVolume {
  revealRadius: number;
  edgeSoftness: number;
  enabledReveal = true;
  requireGrip = true;

  constructor(revealRadius: number, edgeSoftness: number) {
    this.revealRadius = revealRadius;
    this.edgeSoftness = edgeSoftness;
  }

  get EffectiveRadius(): number {
    return Math.max(0.01 * (this.revealRadius / 0.075), this.revealRadius);
  }

  get EffectiveSoftness(): number {
    return Mathf.Clamp(this.edgeSoftness, 0, this.EffectiveRadius);
  }

  /** IsRevealActive: on, and the grip held when a grip is required. */
  IsRevealActive(gripHeld: boolean): boolean {
    return this.enabledReveal && (!this.requireGrip || gripHeld);
  }

  Sphere(center: Vector3): RevealSphere {
    return { center: center.clone(), radius: this.EffectiveRadius, softness: this.EffectiveSoftness };
  }
}
