/* ═══════════════════════════════════════════════════════
   ASCENSION — Balance Constants
   ═══════════════════════════════════════════════════════ */

export const ASCENSION_BALANCE = {
  STORAGE_KEY: "hexium_ascension_v1",
  REACTOR_KEY: "hexium_reactor_state_v1",
  MODULES_KEY: "hexium_reactor_modules_v1",
  BOTS_KEY: "hexium_bots_state_v1",
  BOTS_V2_KEY: "hexium_bots_evolution_v2",
  EXPEDITIONS_KEY: "hexium_expeditions_v1",
  BLACK_MARKET_KEY: "hexium_black_market_v1",
  MIN_REACTOR_LEVEL: 25,
  MIN_TOTAL_HEX: 1_000_000,
  BASE_ESSENCE: 1,
  ESSENCE_PER_3_ASCENSIONS: 1,
  BONUS_ESSENCE_LVL50: 1,
  BONUS_ESSENCE_LVL60: 2,
  MAX_ARTIFACT_SLOTS: 4,
  MAX_EXPEDITION_SLOTS: 3,
  UNDO_WINDOW_MS: 10_000,
} as const;
