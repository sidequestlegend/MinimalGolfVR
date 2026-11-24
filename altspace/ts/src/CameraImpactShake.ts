// CameraImpactShake.cs (46 lines): a ball impact buzzes both controllers, at most once per cooldown. The two camera
// amplitudes it computes and never uses are dropped. Frequency has no equivalent in `scene.SendHapticImpulse`, and a
// duration has to be chosen (PORT.md 10.1 #10).

import { Mathf } from "../portkit/src/index.ts";

export const IMPACT = { cooldown: 0.18, minimumImpact: 0.35, fullImpact: 7.5 } as const;
/** Seconds of each buzz (upstream leaves the length to the Meta runtime). */
export const HAPTIC_SECONDS = 0.08;

export class CameraImpactShake {
  private nextAllowedImpact = 0;

  /**
   * RegisterImpact (:28-40): the haptic strength for an impact at `collisionVelocity`, or null when it is too weak or
   * inside the cooldown. `now` is unscaled seconds.
   */
  RegisterImpact(collisionVelocity: number, now: number): number | null {
    // Unity compares single-precision floats: a reported 0.35 is exactly the threshold there, a hair under it in doubles.
    if (Math.fround(collisionVelocity) < Math.fround(IMPACT.minimumImpact) || now < this.nextAllowedImpact) return null;
    const strength = Mathf.InverseLerp(IMPACT.minimumImpact, IMPACT.fullImpact, collisionVelocity);
    const haptic = Mathf.Lerp(0.2, 0.9, strength);
    this.nextAllowedImpact = now + IMPACT.cooldown;
    return haptic;
  }
}
