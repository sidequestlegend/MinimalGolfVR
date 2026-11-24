// GolfBallImpact.cs (17 lines). OnCollisionEnter runs in the ball's graph, which reports `golfImpact` with the
// collision's relative speed and the other collider's name (the page's own collision event carries no speed).

/** The collider whose hits make no sound (GolfBallImpact.cs:11). */
export const SILENT_SURFACE = "Green Playing Surface";

/** OnCollisionEnter: always the haptic; the collision sound only off the green. */
export function ImpactPlaysSound(otherName: string): boolean {
  return otherName !== SILENT_SURFACE;
}
