/* ═══════════════════════════════════════════════════════
   HEX-BOTS — evolution balance constants
   ═══════════════════════════════════════════════════════ */

import type { BotRarity } from "./botsData";

export const BOTS_BALANCE = {
  maxLevel: 20,
  maxStars: 5,
  mergeCopiesRequired: 3,
  upgradeGrowth: 1.38,
  offlineCapSeconds: 12 * 3600,
  fragmentUnlockDefault: 80,
  starRateMultiplier: [1, 2.4, 5.8, 14, 34],
  starBonusMultiplier: [0, 0.03, 0.07, 0.13, 0.22],
} as const;

export const RARITY_RC: Record<BotRarity, string> = {
  common: "102,187,106",
  rare: "66,165,245",
  epic: "206,147,216",
  legendary: "255,213,79",
};

export const RARITY_BASE_UPGRADE: Record<BotRarity, number> = {
  common: 45,
  rare: 160,
  epic: 520,
  legendary: 1300,
};
