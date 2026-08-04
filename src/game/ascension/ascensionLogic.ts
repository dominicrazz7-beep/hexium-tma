/* ═══════════════════════════════════════════════════════
   ASCENSION — Pure Logic
   Purchase upgrades, calculate bonuses, reset mechanics
   ═══════════════════════════════════════════════════════ */
import {
  type AscensionUpgrade,
  type AscensionEffect,
  ALL_ASCENSION_UPGRADES,
  ASCENSION_BY_ID,
} from "./ascensionData";
import { ASCENSION_BALANCE } from "./ascensionBalance";
import { guardNumber } from "../utils/numberGuards";

export type AscensionState = {
  count: number;
  essence: number;
  upgrades: string[];
  totalEssenceEarned: number;
};

export type AscensionBonuses = {
  hexMultiplier: number;
  headStartLevel: number;
  tapPower: number;
  maxEnergy: number;
  maxTemperature: number;
  expeditionSpeed: number;
  expeditionSlot: number;
  researchYield: number;
  artifactSlot: number;
  artifactPower: number;
  collectionBoost: number;
  botStartStars: number;
  luckyBoost: number;
  quantumCoreGen: number;
};

export const EMPTY_BONUSES: AscensionBonuses = {
  hexMultiplier: 0,
  headStartLevel: 0,
  tapPower: 0,
  maxEnergy: 0,
  maxTemperature: 0,
  expeditionSpeed: 0,
  expeditionSlot: 0,
  researchYield: 0,
  artifactSlot: 0,
  artifactPower: 0,
  collectionBoost: 0,
  botStartStars: 0,
  luckyBoost: 0,
  quantumCoreGen: 0,
};

export function emptyState(): AscensionState {
  return { count: 0, essence: 0, upgrades: [], totalEssenceEarned: 0 };
}

function safeRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}

function safeWrite(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

/**
 * Reset subsystem localStorage keys on ascension.
 * Preserves: ascension state, artifacts, corporation, cases, shop, world boss,
 *            network, profile, economy, research points, premium currencies.
 * Resets: reactor, equipped modules, bot levels, expeditions, black market.
 */
export function performAscensionReset(): void {
  const K = ASCENSION_BALANCE;

  /* ── Reset reactor (clear upgrades, keep structure) ── */
  safeRemove(K.REACTOR_KEY);

  /* ── Reset equipped modules (clear equipped, keep ownership in a future system) ── */
  safeRemove(K.MODULES_KEY);

  /* ── Reset bot levels to LVL 1 but preserve ownership ── */
  const resetBots = (key: string) => {
    const fleet = safeRead<{ bots?: Record<string, { lvl?: number; owned?: boolean; active?: boolean; stars?: number; fragments?: number; copies?: number }> }>(key, {});
    if (fleet.bots) {
      for (const id of Object.keys(fleet.bots)) {
        const bot = fleet.bots[id];
        if (bot) {
          bot.lvl = 1;
          bot.stars = 1;
          bot.copies = 0;
          bot.active = Boolean(bot.owned);
        }
      }
    }
    safeWrite(key, fleet);
  };
  resetBots(K.BOTS_KEY);
  resetBots(K.BOTS_V2_KEY);

  /* ── Cancel active expeditions ── */
  const expState = safeRead<{ active?: unknown[] }>(K.EXPEDITIONS_KEY, {});
  if (expState.active) expState.active = [];
  safeWrite(K.EXPEDITIONS_KEY, expState);

  /* ── Reset black market stock ── */
  safeRemove(K.BLACK_MARKET_KEY);
}

export function canAscend(reactorLevel: number, totalHexMined: number): boolean {
  return reactorLevel >= ASCENSION_BALANCE.MIN_REACTOR_LEVEL
    && totalHexMined >= ASCENSION_BALANCE.MIN_TOTAL_HEX;
}

export function calculateEssenceGain(ascensionCount: number, reactorLevel: number): number {
  let essence = ASCENSION_BALANCE.BASE_ESSENCE;
  essence += Math.floor(ascensionCount / 3) * ASCENSION_BALANCE.ESSENCE_PER_3_ASCENSIONS;
  if (reactorLevel >= 50) essence += ASCENSION_BALANCE.BONUS_ESSENCE_LVL50;
  if (reactorLevel >= 60) essence += ASCENSION_BALANCE.BONUS_ESSENCE_LVL60;
  return essence;
}

export function isOwned(state: AscensionState, upgradeId: string): boolean {
  return state.upgrades.includes(upgradeId);
}

export function canAfford(state: AscensionState, upgrade: AscensionUpgrade): boolean {
  if (isOwned(state, upgrade.id)) return false;
  if (state.essence < upgrade.cost) return false;
  if (upgrade.requires && !isOwned(state, upgrade.requires)) return false;
  return true;
}

export function purchaseUpgrade(state: AscensionState, upgradeId: string): AscensionState | null {
  const upgrade = ASCENSION_BY_ID[upgradeId];
  if (!upgrade) return null;
  if (!canAfford(state, upgrade)) return null;

  return {
    ...state,
    essence: state.essence - upgrade.cost,
    upgrades: [...state.upgrades, upgradeId],
  };
}

export function calculateBonuses(state: AscensionState): AscensionBonuses {
  const bonuses = { ...EMPTY_BONUSES };

  for (const upgradeId of state.upgrades) {
    const upgrade = ASCENSION_BY_ID[upgradeId];
    if (!upgrade) continue;

    switch (upgrade.effect.type) {
      case "hex_multiplier":
        bonuses.hexMultiplier += upgrade.effect.value;
        break;
      case "head_start":
        bonuses.headStartLevel = Math.max(bonuses.headStartLevel, upgrade.effect.level);
        break;
      case "tap_power":
        bonuses.tapPower += upgrade.effect.value;
        break;
      case "max_energy":
        bonuses.maxEnergy += upgrade.effect.value;
        break;
      case "max_temperature":
        bonuses.maxTemperature += upgrade.effect.value;
        break;
      case "expedition_speed":
        bonuses.expeditionSpeed += upgrade.effect.value;
        break;
      case "expedition_slot":
        bonuses.expeditionSlot += upgrade.effect.value;
        break;
      case "research_yield":
        bonuses.researchYield += upgrade.effect.value;
        break;
      case "artifact_slot":
        bonuses.artifactSlot += upgrade.effect.value;
        break;
      case "artifact_power":
        bonuses.artifactPower += upgrade.effect.value;
        break;
      case "collection_boost":
        bonuses.collectionBoost += upgrade.effect.value;
        break;
      case "bot_start_stars":
        bonuses.botStartStars = Math.max(bonuses.botStartStars, upgrade.effect.value);
        break;
      case "lucky_boost":
        bonuses.luckyBoost += upgrade.effect.value;
        break;
      case "quantum_core_gen":
        bonuses.quantumCoreGen += upgrade.effect.value;
        break;
    }
  }

  return bonuses;
}

export function applyHexMultiplier(baseHex: number, bonuses: AscensionBonuses): number {
  return guardNumber(baseHex * (1 + bonuses.hexMultiplier / 100));
}

export function applyExpeditionSpeed(baseDurationMs: number, bonuses: AscensionBonuses): number {
  return guardNumber(baseDurationMs / (1 + bonuses.expeditionSpeed / 100));
}

export function applyResearchYield(baseResearch: number, bonuses: AscensionBonuses): number {
  return guardNumber(baseResearch * (1 + bonuses.researchYield / 100));
}

export function applyArtifactPower(baseEffect: number, bonuses: AscensionBonuses): number {
  return guardNumber(baseEffect * (1 + bonuses.artifactPower / 100));
}
