// New for multiplayer (no upstream file; PORT.md 7, last row): the shared scorecard and the rule that ends a hole.
// Pure functions over the card the referee keeps in MinimalGolfGame's synced state, so the rules can be tested alone.
//
// One row per player who joined this round. A row keeps its slot (and so its ball) while the player is present; a
// player who leaves keeps the slot for SEAT_GRACE seconds (a reload gets the same ball and row back), then the slot is
// freed and the row stays on the card, marked as left, until the course is restarted (or, past MAX_ROWS rows, until a
// newcomer needs the room). A hole that ends without a result from a player who joined at or before it (out of time,
// or not there) is scored with missedScore, never better than finishing would have been.

export const HOLES = 8;
export const MAX_SLOTS = 8;
/** Seconds a departed player's slot is kept for them (user state lasts as long after a leave). */
export const SEAT_GRACE = 30;
/**
 * Rows the card keeps at most (seated players and departed ones). The card is one synced leaf (at most 16 KiB): a
 * room where people keep coming and going must not grow it without end. Past this, a newcomer's row replaces the
 * departed row whose slot was freed longest ago.
 */
export const MAX_ROWS = 24;
/** Characters of a display name the card keeps (the board shows 12). */
export const NAME_MAX = 24;
/** A hole not finished is scored at least par + this (with no stroke limit), and never below strokes so far + 1. */
export const MISSED_OVER_PAR = 2;

/** How a hole ended for a player: holed out, picked up at the stroke limit, or out of time (hole timeout). */
export type Mark = "" | "max" | "dnf";

export interface CardRow {
  uid: string;
  name: string;
  /** Ball and slot index 0..7, or -1 once a departed player's slot was freed. */
  slot: number;
  /** The first hole (0-based) this player plays this round; earlier holes stay empty. HOLES: none left this round. */
  joined: number;
  /** Strokes per hole, null while not finished (or not played). */
  strokes: Array<number | null>;
  marks: Mark[];
  left: boolean;
  /** Server seconds when the player was seen to leave. */
  leftAt: number;
  /**
   * The most strokes the referee has seen this player report on the current hole (their GolfPlayer state). A player
   * who leaves, reloads or lowers their own count keeps this as their floor; reset when a level loads.
   */
  seen: number;
}

export function newRow(uid: string, name: string, slot: number, joined: number): CardRow {
  return { uid, name: name.slice(0, NAME_MAX), slot, joined, strokes: new Array<number | null>(HOLES).fill(null), marks: new Array<Mark>(HOLES).fill(""), left: false, leftAt: 0, seen: 0 };
}

/**
 * The score of a player who did not hole out (the hole timeout ended it, or they were not there when it ended):
 * never better than holing out with the next stroke. With a stroke limit it is the limit (the same as picking up);
 * without one, at least par + MISSED_OVER_PAR, so walking away from a bad hole, or never starting it, does not pay.
 */
export function missedScore(strokesSoFar: number, par: number, strokeLimit: number): number {
  const strokes = Math.max(0, Math.trunc(strokesSoFar));
  if (strokeLimit > 0) return Math.max(strokeLimit, strokes);
  return Math.max(strokes + 1, par + MISSED_OVER_PAR);
}

/** Room for one more row: drops the departed rows whose slot was freed longest ago until fewer than MAX_ROWS remain. */
export function makeRoom(rows: CardRow[]): CardRow[] {
  const out = rows.slice();
  while (out.length >= MAX_ROWS) {
    let drop = -1;
    out.forEach((r, i) => {
      if (r.slot < 0 && r.left && (drop < 0 || r.leftAt < out[drop]!.leftAt)) drop = i;
    });
    if (drop < 0) break;
    out.splice(drop, 1);
  }
  return out;
}

export function rowOf(rows: readonly CardRow[], uid: string): CardRow | null {
  return rows.find((r) => r.uid === uid) ?? null;
}

export function rowInSlot(rows: readonly CardRow[], slot: number): CardRow | null {
  return slot < 0 ? null : (rows.find((r) => r.slot === slot) ?? null);
}

/** The lowest slot no row holds, below `maxPlayers`; -1 when the table is full. */
export function freeSlot(rows: readonly CardRow[], maxPlayers: number): number {
  for (let s = 0; s < Math.min(MAX_SLOTS, maxPlayers); s++) if (!rows.some((r) => r.slot === s)) return s;
  return -1;
}

/** Which hole a player joining now starts at: the current one, or the next if this one is already decided. */
export function joinHole(currentHole: number, holeDecided: boolean, courseComplete: boolean): number {
  if (courseComplete) return HOLES;
  return holeDecided ? currentHole + 1 : currentHole;
}

/** The rows that must finish `hole` before it ends: seated, present, and joined at or before it. */
export function activeRows(rows: readonly CardRow[], hole: number): CardRow[] {
  return rows.filter((r) => r.slot >= 0 && !r.left && r.joined <= hole);
}

export function isFinished(row: CardRow, hole: number): boolean {
  return row.strokes[hole] !== null && row.strokes[hole] !== undefined;
}

/** The hole is over when someone is playing it and every one of them has a result. */
export function holeFinished(rows: readonly CardRow[], hole: number): boolean {
  const active = activeRows(rows, hole);
  return active.length > 0 && active.every((r) => isFinished(r, hole));
}

/** Writes a result once; a hole already on the card is never changed. Returns true when it wrote. */
export function record(row: CardRow, hole: number, strokes: number, mark: Mark): boolean {
  if (hole < 0 || hole >= HOLES || isFinished(row, hole)) return false;
  row.strokes[hole] = Math.max(0, Math.trunc(strokes));
  row.marks[hole] = mark;
  return true;
}

export function rowTotal(row: CardRow): number {
  let total = 0;
  for (const s of row.strokes) if (s !== null) total += s;
  return total;
}

/** For each departed player whose grace has run out, frees the slot. Returns true when something changed. */
export function releaseSeats(rows: CardRow[], now: number): boolean {
  let changed = false;
  for (const row of rows) {
    if (row.left && row.slot >= 0 && now - row.leftAt >= SEAT_GRACE) {
      row.slot = -1;
      changed = true;
    }
  }
  return changed;
}

/** A new round: departed players' rows go, everyone else starts again from hole 1. */
export function resetCard(rows: readonly CardRow[]): CardRow[] {
  return rows.filter((r) => !r.left && r.slot >= 0).map((r) => newRow(r.uid, r.name, r.slot, 0));
}

/** Rows in slot order (freed rows last), as the board shows them. */
export function sortedRows(rows: readonly CardRow[]): CardRow[] {
  return rows.slice().sort((a, b) => (a.slot < 0 ? 99 : a.slot) - (b.slot < 0 ? 99 : b.slot) || a.uid.localeCompare(b.uid));
}

// ---- what the scorecard panel shows (new panel; each player's own game card keeps showing upstream's G1) ----------

const pad = (text: string, width: number) => (text.length >= width ? text.slice(0, width) : text + " ".repeat(width - text.length));
const padLeft = (text: string, width: number) => (text.length >= width ? text : " ".repeat(width - text.length) + text);

/** One cell: strokes, "-" for a hole not played, "." for one in play, with "x" after a pick-up and "?" after a time-out. */
export function cellText(row: CardRow, hole: number, currentHole: number): string {
  const s = row.strokes[hole];
  if (s !== null && s !== undefined) return String(s) + (row.marks[hole] === "max" ? "x" : row.marks[hole] === "dnf" ? "?" : "");
  if (hole < row.joined) return "-";
  return hole === currentHole && !row.left && row.slot >= 0 ? "." : "";
}

export function headerLine(): string {
  let line = pad("PLAYER", 12);
  for (let h = 0; h < HOLES; h++) line += padLeft(String(h + 1), 4);
  return line + padLeft("TOT", 5);
}

export function parLine(pars: readonly number[]): string {
  let line = pad("PAR", 12);
  for (let h = 0; h < HOLES; h++) line += padLeft(String(pars[h] ?? ""), 4);
  return line + padLeft(String(pars.reduce((a, b) => a + b, 0)), 5);
}

export function rowLine(row: CardRow, currentHole: number): string {
  const name = row.left ? `(${row.name})` : row.name;
  let line = pad(name, 12);
  for (let h = 0; h < HOLES; h++) line += padLeft(cellText(row, h, currentHole), 4);
  return line + padLeft(String(rowTotal(row)), 5);
}
