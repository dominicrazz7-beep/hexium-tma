/* ═══════════════════════════════════════════════════════
   ARTIFACTS — Balance Constants
   ═══════════════════════════════════════════════════════ */

export const ARTIFACTS_BALANCE = {
  MAX_EQUIPPED: 3,
  HISTORY_LIMIT: 20,
} as const;

export const RARITY_DROP_WEIGHTS: Record<string, number> = {
  common: 50,
  rare: 30,
  epic: 14,
  legendary: 5,
  mythic: 1,
};
