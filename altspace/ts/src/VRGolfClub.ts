// VRGolfClub.cs (418 lines): one per hand. Bring the hand near your own ball, hold the trigger, pull back, release to
// putt (B3 to B13). Update (:237-316) is ported; the green sphere, its material and the gizmos (about 230 lines) are a
// kit object now; the editor's mouse fallbacks are replaced by DesktopAim below.
//
// Input here: the hand's position from the page's pose stream (at most 30 a second, and none while the hand is
// still: the last pose stands), the trigger from button events (`digitalDown` / `digitalUp`, kept between ticks so a
// quick press is not missed) and from the trigger axis (`analogHeld`, threshold 0.45 as upstream).
//
// FIX B13: upstream lets the second hand start an aim while the first is aiming; the start point is overwritten and
// whichever hand lets go first shoots with the other hand's pull. A hand starts an aim only when none is in progress.

import { Button, Vector3, type HandSide, type HostEventDetail } from "../portkit/src/index.ts";

/** What a club needs of the local player (GolfPlayer). */
export interface ClubHost {
  readonly ballLive: boolean;
  BallPosition(): Vector3;
  HandPosition(side: HandSide): Vector3 | null;
  TriggerHeld(side: HandSide): boolean;
  readonly aiming: boolean;
  readonly shotPower: number;
  readonly clubReach: number;
  IsRevealing(): boolean;
  /** BeginVRAim; shows "WAIT FOR THE BALL" and returns false when the player may not act. */
  BeginAim(startWorld: Vector3): boolean;
  UpdateAim(currentWorld: Vector3): void;
  /** TryEndVRAimAndShoot: true when a stroke was played. */
  EndAimAndShoot(): boolean;
  CancelAim(): void;
  Haptic(side: HandSide, strength: number, seconds: number): void;
}

/** Seconds of each buzz; upstream leaves the length to the Meta runtime (PORT.md 10.1 #10). */
export const CLUB_HAPTIC_SECONDS = 0.08;
/** The pull buzz repeats every tick while aiming (upstream: every frame). */
export const PULL_HAPTIC_SECONDS = 0.06;

export class VRGolfClub {
  readonly controller: HandSide;
  triggerThreshold = 0.45;
  overlappingBall = false;
  aiming = false;
  private wasTriggerHeld = false;
  private digitalDown = false;
  private digitalUp = false;

  constructor(controller: HandSide) {
    this.controller = controller;
  }

  /** `button-pressed` / `button-released` for this hand (OVRInput.GetDown / GetUp). */
  OnButton(button: number, pressed: boolean): void {
    if (button !== Button.Trigger) return;
    if (pressed) this.digitalDown = true;
    else this.digitalUp = true;
  }

  /** VRGolfClub.Update (:237-316), once per tick. */
  Update(game: ClubHost): void {
    const down = this.digitalDown;
    const up = this.digitalUp;
    this.digitalDown = false;
    this.digitalUp = false;
    if (!game.ballLive) {
      this.wasTriggerHeld = game.TriggerHeld(this.controller);
      if (this.aiming) {
        this.aiming = false;
        game.CancelAim();
      }
      return;
    }

    const ball = game.BallPosition();
    const hand = game.HandPosition(this.controller);
    // The distance test decides "near the ball" (B14): overlapRadius + 0.08.
    this.overlappingBall = hand !== null && Vector3.Distance(hand, ball) < game.clubReach;

    const triggerHeld = game.TriggerHeld(this.controller);
    const heldDownEdge = triggerHeld && !this.wasTriggerHeld;
    const heldUpEdge = !triggerHeld && this.wasTriggerHeld;
    const triggerDown = heldDownEdge || down;
    const triggerUp = heldUpEdge || up;

    // Press: only start aiming, never shoot.
    if (!this.aiming && !game.aiming && this.overlappingBall && triggerDown && triggerHeld && hand) {
      const started = game.BeginAim(ProjectToBallPlane(hand, ball));
      this.aiming = started && game.aiming;
      if (this.aiming) game.Haptic(this.controller, 0.5, CLUB_HAPTIC_SECONDS);
    }

    // Hold: update the pull, no impulse.
    if (this.aiming && triggerHeld && hand) {
      game.UpdateAim(ProjectToBallPlane(hand, ball));
      const power = game.shotPower;
      if (power > 0.05) game.Haptic(this.controller, power * 0.3, PULL_HAPTIC_SECONDS);
    }

    // Release: the only place that can apply an impulse.
    if (this.aiming && triggerUp) {
      const shot = game.EndAimAndShoot();
      this.aiming = false;
      game.Haptic(this.controller, shot ? 0.8 : 0.3, CLUB_HAPTIC_SECONDS);
    }

    if (this.aiming && game.IsRevealing()) {
      this.aiming = false;
      game.CancelAim();
    }

    this.wasTriggerHeld = triggerHeld;
  }

  /** The aim was ended elsewhere (a reset, a capture, the desktop aim): this hand is no longer aiming. */
  Reset(): void {
    this.aiming = false;
  }
}

/** ProjectToBallPlane (:318-323). */
export function ProjectToBallPlane(world: Vector3, ball: Vector3): Vector3 {
  return new Vector3(world.x, ball.y, world.z);
}

// ---- desktop (new: upstream has no flat-screen play at this commit, PORT.md 8.5) ------------------------------------

/** Degrees an arrow key turns the aim, and the share of full power an arrow key adds or takes. */
export const DESKTOP_TURN_DEGREES = 5;
export const DESKTOP_POWER_STEP = 1 / 12;

/**
 * A desktop player cannot hold a button over a moving pointer (the page hears no mouse drag), so the drag is made of
 * clicks and keys: a click on the green is where the hand would be pulled to (`desktop-aim="pull"`, upstream's
 * slingshot) or where the ball should go (`"target"`); another click moves it; Left/Right turn it, Up/Down change the
 * pull; Space, Enter or a click on your own ball putts; Esc or C cancels. The shot is the same GolfAim arithmetic.
 */
export class DesktopAim {
  mode: "pull" | "target";

  constructor(mode: "pull" | "target" = "pull") {
    this.mode = mode;
  }

  /** A click on the current level's aim pad. */
  Click(game: ClubHost, detail: HostEventDetail): void {
    if (!game.ballLive || !detail.point) return;
    const ball = game.BallPosition();
    if (!game.aiming && !game.BeginAim(ball)) return;
    const point = ProjectToBallPlane(detail.point, ball);
    // "target": the hand is placed opposite the click, so that the pull points at it.
    const hand = this.mode === "target" ? ball.scale(2).sub(point) : point;
    game.UpdateAim(hand);
  }

  /** Keys while aiming. Returns true when the key was used. */
  Key(game: ClubHost, key: string, start: Vector3, pull: Vector3, maxPull: number): boolean {
    if (!game.aiming) return false;
    if (key === "Space" || key === "Return" || key === "KeypadEnter") {
      game.EndAimAndShoot();
      return true;
    }
    if (key === "Escape" || key === "C") {
      game.CancelAim();
      return true;
    }
    let next: Vector3 | null = null;
    if (key === "LeftArrow" || key === "RightArrow") {
      const a = ((key === "LeftArrow" ? 1 : -1) * DESKTOP_TURN_DEGREES * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      next = new Vector3(pull.x * c - pull.z * s, 0, pull.x * s + pull.z * c);
    } else if (key === "UpArrow" || key === "DownArrow") {
      const length = pull.magnitude;
      const direction = length > 1e-9 ? pull.scale(1 / length) : new Vector3(0, 0, 1);
      const wanted = Math.max(0, Math.min(maxPull, length + (key === "UpArrow" ? 1 : -1) * DESKTOP_POWER_STEP * maxPull));
      next = direction.scale(wanted);
    }
    if (!next) return false;
    // The hand stands at start - pull.
    game.UpdateAim(new Vector3(start.x - next.x, start.y, start.z - next.z));
    return true;
  }
}
