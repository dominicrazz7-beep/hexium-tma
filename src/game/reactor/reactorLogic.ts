/* ═══════════════════════════════════════════════════════
   Main Reactor — Game Logic
   Pure functions: tick, mine, turbo, overheat, upgrades.
   ═══════════════════════════════════════════════════════ */
import { REACTOR_BALANCE, getUpgradeCost, getUpgradeValue, LUCK_TIERS, LUCK_TIER_TOTAL_WEIGHT } from "./reactorBalance";
import { type AscensionState, emptyState as emptyAscensionState, calculateBonuses } from "../ascension/ascensionLogic";
import { guardNumber } from "../utils/numberGuards";
import type { ReactorLocalState } from "./reactorData";
import type { UpgradeKey, LuckTier } from "./reactorBalance";

const B = REACTOR_BALANCE;
export type ModuleEffects = {
  tapPowerBonus: number;
  autoHexBonus: number;
  energyRegenBonus: number;
  heatReduction: number;
  maxEnergyBonus: number;
  critChanceBonus: number;
  critMultiplierBonus: number;
  hexMultiplierBonus: number;
};

export const EMPTY_MODULE_EFFECTS: ModuleEffects = {
  tapPowerBonus: 0,
  autoHexBonus: 0,
  energyRegenBonus: 0,
  heatReduction: 0,
  maxEnergyBonus: 0,
  critChanceBonus: 0,
  critMultiplierBonus: 0,
  hexMultiplierBonus: 0,
};

/* ──────────────────────────────────────────────────────
   TAP (MINE) — Lucky Tap System
   ────────────────────────────────────────────────────── */
export type TapResult = {
  state: ReactorLocalState;
  hexGained: number;
  luckTier: LuckTier;
  isCritical: boolean;
  isTurbo: boolean;
};

function pickLuckTier(): LuckTier {
  let r = Math.random() * LUCK_TIER_TOTAL_WEIGHT;
  for (const tier of LUCK_TIERS) {
    r -= tier.weight;
    if (r <= 0) return tier;
  }
  return LUCK_TIERS[0];
}

export function performTap(prev: ReactorLocalState, mods?: ModuleEffects, ascState?: AscensionState): TapResult | null {
  // Guard: no energy or overheated
  if (prev.energy <= 0 || prev.isOverheated) return null;

  const m = mods ?? EMPTY_MODULE_EFFECTS;
  const asc = ascState ? calculateBonuses(ascState) : null;
  const tier = pickLuckTier();
  const isCritical = tier.name !== "normal";
  const isTurbo = prev.turboActive;

  // Calculate HEX
  const tapPowerLevel = prev.upgrades.tapPower ?? 0;
  const basePower = B.BASE_TAP_POWER + getUpgradeValue("tapPower", tapPowerLevel) + m.tapPowerBonus + (asc?.tapPower ?? 0);
  let hexGained = basePower;
  // Apply luck tier multiplier
  hexGained *= tier.multiplier;
  // Apply module crit multiplier bonus (only on crits)
  if (isCritical) hexGained *= (1 + m.critMultiplierBonus / 100);
  if (isTurbo) hexGained *= B.TURBO_MULTIPLIER;
  hexGained *= (1 + m.hexMultiplierBonus / 100);
  hexGained = Math.floor(guardNumber(hexGained));

  // New temperature
  let newTemp = prev.temperature + B.HEAT_PER_TAP;
  let isOverheated = false;
  let overheatTimer = 0;
  if (newTemp >= prev.maxTemperature) {
    newTemp = prev.maxTemperature;
    isOverheated = true;
    overheatTimer = B.OVERHEAT_COOLDOWN_SEC;
  }

  return {
    state: {
      ...prev,
      energy: prev.energy - B.TAP_ENERGY_COST,
      temperature: newTemp,
      isOverheated,
      overheatTimer,
      totalHexMined: prev.totalHexMined + hexGained,
      totalTaps: prev.totalTaps + 1,
      sessionTaps: prev.sessionTaps + 1,
    },
    hexGained,
    luckTier: tier,
    isCritical,
    isTurbo,
  };
}

/* ──────────────────────────────────────────────────────
   TICK (called every frame via requestAnimationFrame)
   deltaMs = time since last tick in milliseconds
   ────────────────────────────────────────────────────── */
export type TickResult = {
  state: ReactorLocalState;
  autoHex: number;   // HEX gained from auto-miner this tick
};

export function tickReactor(prev: ReactorLocalState, deltaMs: number, mods?: ModuleEffects, ascState?: AscensionState): TickResult {
  const dt = deltaMs / 1000; // seconds
  let s = { ...prev };
  let autoHex = 0;
  const m = mods ?? EMPTY_MODULE_EFFECTS;
  const asc = ascState ? calculateBonuses(ascState) : null;

  /* ── Energy regen ────────────────────────────────── */
  if (s.energy < s.maxEnergy) {
    s.energy = Math.min(s.maxEnergy, s.energy + (B.ENERGY_REGEN_PER_SEC + m.energyRegenBonus) * dt);
  }

  /* ── Temperature decay ───────────────────────────── */
  const heatDecayMultiplier = Math.max(0, 1 - guardNumber(m.heatReduction) / 100);
  if (s.isOverheated) {
    s.overheatTimer = Math.max(0, s.overheatTimer - dt);
    s.temperature = Math.max(
      0,
      s.temperature - B.HEAT_DECAY_PER_SEC * B.OVERHEAT_DECAY_MULTIPLIER * heatDecayMultiplier * dt,
    );
    if (s.overheatTimer <= 0 && s.temperature < s.maxTemperature * 0.5) {
      s.isOverheated = false;
    }
  } else if (s.temperature > 0) {
    s.temperature = Math.max(0, s.temperature - B.HEAT_DECAY_PER_SEC * heatDecayMultiplier * dt);
  }

  /* ── Turbo countdown ─────────────────────────────── */
  if (s.turboActive) {
    s.turboTimeLeft = Math.max(0, s.turboTimeLeft - dt);
    if (s.turboTimeLeft <= 0) {
      s.turboActive = false;
      s.turboCooldown = B.TURBO_COOLDOWN_SEC;
    }
  } else if (s.turboCooldown > 0) {
    s.turboCooldown = Math.max(0, s.turboCooldown - dt);
  }

  /* ── Auto-miner ──────────────────────────────────── */
  const autoLevel = s.upgrades.autoMiner ?? 0;
  if (autoLevel > 0) {
    const hexPerSec = getUpgradeValue("autoMiner", autoLevel) + m.autoHexBonus;
    autoHex = guardNumber(hexPerSec * dt);
    s.totalHexMined += autoHex;
  } else if (m.autoHexBonus > 0) {
    autoHex = guardNumber(m.autoHexBonus * dt);
    s.totalHexMined += autoHex;
  }

  /* ── Update maxEnergy / maxTemperature from upgrades + modules + ascension  */
  s.maxEnergy =
    B.BASE_MAX_ENERGY + getUpgradeValue("energyCapacity", s.upgrades.energyCapacity ?? 0) + m.maxEnergyBonus + (asc?.maxEnergy ?? 0);
  s.maxTemperature =
    B.BASE_MAX_TEMPERATURE + getUpgradeValue("heatSink", s.upgrades.heatSink ?? 0) + (asc?.maxTemperature ?? 0);

  return { state: s, autoHex };
}

/* ──────────────────────────────────────────────────────
   TURBO ACTIVATION
   ────────────────────────────────────────────────────── */
export function activateTurbo(prev: ReactorLocalState): ReactorLocalState | null {
  if (prev.turboActive || prev.turboCooldown > 0 || prev.isOverheated) return null;
  return {
    ...prev,
    turboActive: true,
    turboTimeLeft: B.TURBO_DURATION_SEC,
  };
}

/** Check if turbo is available. */
export function isTurboAvailable(s: ReactorLocalState): boolean {
  return !s.turboActive && s.turboCooldown <= 0 && !s.isOverheated;
}

/* ──────────────────────────────────────────────────────
   UPGRADES
   ────────────────────────────────────────────────────── */
export type UpgradeResult = {
  state: ReactorLocalState;
  cost: number;
};

export function purchaseUpgrade(
  prev: ReactorLocalState,
  key: UpgradeKey,
  currentHex: number,
): UpgradeResult | null {
  const cfg = B.UPGRADES[key];
  const level = prev.upgrades[key] ?? 0;
  if (level >= cfg.maxLevel) return null;

  const cost = getUpgradeCost(key, level);
  if (currentHex < cost) return null;

  return {
    state: {
      ...prev,
      upgrades: {
        ...prev.upgrades,
        [key]: level + 1,
      },
    },
    cost,
  };
}

/* ──────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────── */

/** Temperature percentage 0..100 */
export function getTempPercent(s: ReactorLocalState): number {
  if (s.maxTemperature <= 0) return 0;
  return Math.min(100, (s.temperature / s.maxTemperature) * 100);
}

/** CSS class for temperature color */
export function getTempColorClass(pct: number): string {
  if (pct < 30) return "mr-temp-blue";
  if (pct < 55) return "mr-temp-yellow";
  if (pct < 80) return "mr-temp-orange";
  return "mr-temp-red";
}

/** Energy percentage 0..100 */
export function getEnergyPercent(s: ReactorLocalState): number {
  if (s.maxEnergy <= 0) return 0;
  return Math.min(100, (s.energy / s.maxEnergy) * 100);
}

/** HEX per second from auto-miner + module bonuses (hexMultiplierBonus applied here) */
export function getAutoHexPerSec(s: ReactorLocalState, mods?: ModuleEffects): number {
  const level = s.upgrades.autoMiner ?? 0;
  const m = mods ?? EMPTY_MODULE_EFFECTS;
  const hexMult = 1 + m.hexMultiplierBonus / 100;
  return guardNumber((getUpgradeValue("autoMiner", level) + m.autoHexBonus) * hexMult);
}

/** Current tap power (what one tap yields, before crit/turbo, with module + ascension bonuses). */
export function getCurrentTapPower(s: ReactorLocalState, mods?: ModuleEffects, ascState?: AscensionState): number {
  const level = s.upgrades.tapPower ?? 0;
  const m = mods ?? EMPTY_MODULE_EFFECTS;
  const asc = ascState ? calculateBonuses(ascState) : null;
  return guardNumber(B.BASE_TAP_POWER + getUpgradeValue("tapPower", level) + m.tapPowerBonus + (asc?.tapPower ?? 0));
}
