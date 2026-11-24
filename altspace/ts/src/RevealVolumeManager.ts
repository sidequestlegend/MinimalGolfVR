// RevealVolumeManager.cs (490 lines): up to two active volumes become the shader's globals. What is ported is
// PushGlobals (:183-220), sent as the `xray` op; the shader (RevealClip.hlsl) does the per-pixel cut. The tag scan,
// property-block fade fallback and leak clean-up only coped with shaders and editor states the shipped scene does not
// have (F7) and are left out; the occluders are the kit objects the builder gives the reveal shader (tags cannot
// exist in Altspace). The globals are per client: only the local player's hands drive them.

import { Mathf, Vector3 } from "../portkit/src/index.ts";
import type { GolfRelay } from "./GolfRelay.ts";
import type { RevealSphere } from "./ProximityRevealVolume.ts";

/** RevealClip.hlsl RevealMask (not inverted): 1 visible, 0 cut. With two spheres a point is cut if inside either. */
export function RevealMask(world: Vector3, spheres: readonly RevealSphere[]): number {
  if (spheres.length === 0) return 1;
  let minA = 1;
  for (const s of spheres.slice(0, 2)) {
    const d = Vector3.Distance(world, s.center);
    const soft = Math.max(0.001, s.softness);
    minA = Math.min(minA, hlslSmoothstep(s.radius, s.radius + soft, d));
  }
  return minA;
}

/** HLSL smoothstep(a, b, x). */
export function hlslSmoothstep(a: number, b: number, x: number): number {
  const t = Mathf.Clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export class RevealVolumeManager {
  private readonly relay: GolfRelay;
  private readonly target: string;

  constructor(relay: GolfRelay, target: string) {
    this.relay = relay;
    this.target = target;
  }

  /** PushGlobals: at most two volumes, in the order given. An unchanged set is not sent again. */
  PushGlobals(active: readonly RevealSphere[]): void {
    if (this.target) this.relay.xray(this.target, active.slice(0, 2));
  }
}
