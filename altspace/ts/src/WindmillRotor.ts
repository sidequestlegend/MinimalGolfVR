// WindmillRotor.cs (26 lines). The blades turn in a small generated graph on the kit's windmill, from
// BS.SyncedClock.NowSeconds, so every client simulates its own ball against the same blades (PORT.md 7 #9). Upstream
// adds 72 * 0.02 degrees each physics step (FixedUpdate, fixed step 0.02 s), all the time, current level or not.

export const DEGREES_PER_SECOND = 72;
export const FIXED_STEP = 0.02;

/** The blade angle about local Z, in degrees [0, 360), at synced time `seconds`. */
export function BladeAngle(seconds: number): number {
  // The epsilon keeps 0.06 / 0.02 (2.9999999999999996 in doubles) at 3 steps.
  const steps = Math.floor(seconds / FIXED_STEP + 1e-6);
  const angle = (steps * DEGREES_PER_SECOND * FIXED_STEP) % 360;
  return angle < 0 ? angle + 360 : angle;
}
