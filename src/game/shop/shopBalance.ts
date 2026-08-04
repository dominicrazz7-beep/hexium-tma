/* ═══════════════════════════════════════════════════════
   SHOP — balance constants (rarity colours, limits)
   ═══════════════════════════════════════════════════════ */
import type { Rarity } from "./shopData";

/** Rarity → "r,g,b" accent (matches v7 .rar-* palette). Drives --rc. */
export const RARITY_RC: Record<Rarity, string> = {
  common: "102, 187, 106",
  rare: "66, 165, 245",
  epic: "206, 147, 216",
  legendary: "255, 213, 79",
  quantum: "43, 240, 255",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  quantum: "Quantum",
};

/** How many purchases to keep in local history. */
export const HISTORY_LIMIT = 20;

/** Special offer cooldown before it can be bought again (24h). */
export const OFFER_COOLDOWN_MS = 24 * 60 * 60 * 1000;
