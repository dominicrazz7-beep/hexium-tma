/* ═══════════════════════════════════════════════════════
   CASES — balance constants & shared formatters.
   ═══════════════════════════════════════════════════════ */
import type { Rarity } from "./casesData";

/** Rarity → "r,g,b" accent driving --rc (same palette as Shop / HEX-BOTS). */
export const RARITY_RC: Record<Rarity, string> = {
  common: "102, 187, 106",
  rare: "66, 165, 245",
  epic: "206, 147, 216",
  legendary: "255, 213, 79",
  quantum: "43, 240, 255",
};

/** Keep at most this many history rows. */
export const HISTORY_LIMIT = 25;

/** Reel (opening animation) tuning. */
export const REEL_LENGTH = 44; // total filler tiles
export const REEL_WIN_INDEX = 38; // landing tile index
export const REEL_SPIN_MS = 4200; // animation duration

/** Compact number format: 12.3K / 4.5M / 1.2B. */
export function fmtShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(a % 1e9 === 0 ? 0 : 1) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(a % 1e6 === 0 ? 0 : 1) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(a % 1e3 === 0 ? 0 : 1) + "K";
  return String(Math.round(n));
}
