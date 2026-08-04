/* ═══════════════════════════════════════════════════════
   BLACK MARKET — balance constants
   ═══════════════════════════════════════════════════════ */

export const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

export const LIMIT_POOL_WEIGHT = 15;

export const STOCK_LIMITS: Record<string, number> = {
  common: 5,
  rare: 3,
  epic: 2,
  legendary: 1,
};
