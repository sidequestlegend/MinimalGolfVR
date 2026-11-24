// VRGolfUI.cs (237 lines): the board. Text and colour rules G1 to G5 are kept; each client's board shows its own
// player's strokes, power and messages (as upstream shows the one player's). The objects are found by bindings, not by
// child name; refreshing every tick sends only what changed (the relay host drops repeats). New: the shared scorecard
// panel and the JOIN / LEAVE label.

import { Behaviour, Color, Mathf, type GameObject, type TextRef } from "../portkit/src/index.ts";
import * as Round from "./GolfRound.ts";
import { AimLineColor, type MinimalGolfGame } from "./MinimalGolfGame.ts";
import { LEVELS } from "./MiniGolfLevel.ts";

const rgb = (hex: number, a = 1) => new Color(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255, a);
export const SEAFOAM = rgb(0x8bcba8);
export const ORANGE = rgb(0xe1822f);
export const PALE_TEXT = rgb(0xfaf1d2);

/** UpdateProgress (:181-196): colour and height of pip `i` when level `current` is being played. */
export function PipStyle(i: number, current: number): { color: Color; height: number } {
  const isCurrent = i === current;
  const color = i < current ? SEAFOAM : isCurrent ? ORANGE : new Color(PALE_TEXT.r, PALE_TEXT.g, PALE_TEXT.b, 0.18);
  return { color, height: isCurrent ? 10 : 6 };
}

/** UpdatePower (:198-216): the percent text and the colour of each of the 12 segments. */
export function PowerMeter(power: number, segments = 12): { percent: string; colors: Color[] } {
  const lit = AimLineColor(power);
  const unlit = new Color(PALE_TEXT.r, PALE_TEXT.g, PALE_TEXT.b, 0.13);
  const colors: Color[] = [];
  for (let i = 0; i < segments; i++) colors.push(power >= (i + 1) / segments ? lit : unlit);
  // Unity multiplies in single precision: 0.545 * 100 is 54.5 there (54%), 54.500002 in doubles (55%).
  return { percent: Mathf.RoundToInt(Math.fround(Math.fround(power) * 100)) + "%", colors };
}

/** UpdateFeedback (:218-226): the toast's opacity with `secondsLeft` to go; it fades over the last 0.3125 s. */
export function ToastAlpha(secondsLeft: number): number {
  return Mathf.Clamp01(secondsLeft * 3.2);
}

export class VRGolfUI extends Behaviour {
  // ---- from bindings.json ----
  game!: MinimalGolfGame;
  courseText: TextRef | null = null;
  levelText: TextRef | null = null;
  strokesText: TextRef | null = null;
  parText: TextRef | null = null;
  pips: GameObject[] = [];
  powerCanvas: GameObject | null = null;
  powerLabel: TextRef | null = null;
  powerPercent: TextRef | null = null;
  powerSegments: GameObject[] = [];
  feedbackCanvas: GameObject | null = null;
  feedbackText: TextRef | null = null;
  courseCompleteCanvas: GameObject | null = null;
  courseCompleteTotal: TextRef | null = null;
  joinLabel: TextRef | null = null;
  /** Scorecard: header, par, then one line per row. */
  cardLines: TextRef[] = [];

  private readonly shown = new Map<string, boolean>();

  private show(object: GameObject | null, visible: boolean): void {
    if (!object || this.shown.get(object.key) === visible) return;
    this.shown.set(object.key, visible);
    object.SetActive(visible);
  }

  override Update(): void {
    const game = this.game;
    if (!game?.settings) return;
    const me = game.LocalPlayer();
    const uid = this.Networking.LocalPlayer.uid;
    const seated = !!me && game.SlotOf(uid) >= 0;
    const level = game.CurrentLevel;

    // UpdateIdentity, UpdateStats (:167-179)
    if (level) {
      if (this.courseText) this.courseText.text = level.levelName;
      if (this.levelText) this.levelText.text = `LEVEL ${level.index + 1} / ${LEVELS.length}`;
      if (this.strokesText) this.strokesText.text = seated && me!.round === game.round ? String(me!.levelStrokes) : "-";
      if (this.parText) this.parText.text = String(level.par);
    }

    // UpdateProgress
    if (level) {
      for (let i = 0; i < this.pips.length && i < LEVELS.length; i++) {
        const pip = this.pips[i];
        if (!pip) continue;
        const style = PipStyle(i, level.index);
        this.Host.uiColor(pip.key, style.color);
        game.relay.uiHeight(pip.key, style.height);
      }
    }

    // UpdatePower
    const aiming = !!me && seated && me.aiming;
    this.show(this.powerCanvas, aiming);
    if (aiming) {
      const meter = PowerMeter(me!.shotPower, this.powerSegments.length || 12);
      if (this.powerLabel) this.powerLabel.text = "PUTT STRENGTH";
      if (this.powerPercent) this.powerPercent.text = meter.percent;
      this.powerSegments.forEach((seg, i) => seg && this.Host.uiColor(seg.key, meter.colors[i]!));
    }

    // UpdateFeedback
    const left = me ? me.feedbackUntil - this.Time.time : 0;
    const toast = !!me && left > 0 && me.feedback !== "";
    this.show(this.feedbackCanvas, toast);
    if (toast) {
      if (this.feedbackText) this.feedbackText.text = me!.feedback;
      if (this.feedbackCanvas) game.relay.fade(this.feedbackCanvas.key, ToastAlpha(left));
    }

    // UpdateCourseComplete
    this.show(this.courseCompleteCanvas, game.courseComplete);
    // The card's total (what the scorecard shows, holes scored as not finished included), not the player's own count.
    const myRow = game.RowOf(uid);
    if (game.courseComplete && this.courseCompleteTotal) this.courseCompleteTotal.text = seated && myRow ? String(Round.rowTotal(myRow)) : "-";

    // New: JOIN / LEAVE and the scorecard.
    if (this.joinLabel) this.joinLabel.text = seated ? "LEAVE" : Round.freeSlot(game.card, game.settings.maxPlayers) < 0 && !game.RowOf(uid) ? "TABLE FULL" : "JOIN";
    const lines = ScorecardLines(game.card, game.currentLevelIndex);
    this.cardLines.forEach((text, i) => {
      if (text) text.text = lines[i] ?? "";
    });
  }
}

/**
 * The scorecard panel's lines: header, par, then at most `rows` player rows (the board has MAX_SLOTS row lines):
 * seated players in slot order first, then departed players, the latest to leave first.
 */
export function ScorecardLines(card: readonly Round.CardRow[], currentHole: number, rows: number = Round.MAX_SLOTS): string[] {
  const out = [Round.headerLine(), Round.parLine(LEVELS.map((l) => l.par))];
  const seated = Round.sortedRows(card.filter((r) => r.slot >= 0));
  const gone = card.filter((r) => r.slot < 0).sort((a, b) => b.leftAt - a.leftAt || a.uid.localeCompare(b.uid));
  for (const row of [...seated, ...gone].slice(0, rows)) out.push(Round.rowLine(row, currentHole));
  return out;
}
