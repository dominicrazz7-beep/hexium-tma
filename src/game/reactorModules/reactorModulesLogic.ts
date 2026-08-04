/* ═══════════════════════════════════════════════════════
   Reactor Modules — Logic
   Slot management, Daily Combo, effects calculation
   ═══════════════════════════════════════════════════════ */

import type { ModuleId, EquippedModules, DailyCombo, ReactorModule, ModuleEffect } from "./reactorModulesData";
import { ALL_MODULES, MAX_SLOTS } from "./reactorModulesData";

// ── Daily Combo Generation ──────────────────────────────

function getDailySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) / 4294967296);
}

export function generateDailyCombo(): DailyCombo {
  const date = getDailySeed();
  const rng = seededRandom(date);

  const eligible = ALL_MODULES.filter((m) => m.unlockLevel <= 30);
  const shuffled = [...eligible].sort((a, b) => {
    const ra = seededRandom(a.id + date);
    const rb = seededRandom(b.id + date);
    return ra - rb;
  });

  const comboModules: [ModuleId, ModuleId, ModuleId] = [
    shuffled[0].id,
    shuffled[1].id,
    shuffled[2].id,
  ];

  const bonusType: ModuleEffect["type"] = rng > 0.5 ? "hex_multiplier" : "tap_power";
  const bonusValue = 20 + Math.floor(rng * 30);

  return {
    date,
    modules: comboModules,
    bonus: { type: bonusType, value: bonusValue },
    active: true,
  };
}

export function isDailyComboActive(combo: DailyCombo): boolean {
  return combo.date === getDailySeed() && combo.active;
}

// ── Module Effects Calculation ───────────────────────────

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

export function calculateModuleEffects(equipped: EquippedModules): ModuleEffects {
  const effects: ModuleEffects = {
    tapPowerBonus: 0,
    autoHexBonus: 0,
    energyRegenBonus: 0,
    heatReduction: 0,
    maxEnergyBonus: 0,
    critChanceBonus: 0,
    critMultiplierBonus: 0,
    hexMultiplierBonus: 0,
  };

  const slotIds: (keyof EquippedModules)[] = ["slot1", "slot2", "slot3"];

  for (const slotId of slotIds) {
    const moduleId = equipped[slotId];
    if (!moduleId) continue;

    const module = ALL_MODULES.find((m) => m.id === moduleId);
    if (!module) continue;

    for (const effect of module.effects) {
      switch (effect.type) {
        case "tap_power":
          effects.tapPowerBonus += effect.value;
          break;
        case "auto_hex":
          effects.autoHexBonus += effect.value;
          break;
        case "energy_regen":
          effects.energyRegenBonus += effect.value;
          break;
        case "heat_reduction":
          effects.heatReduction += effect.value;
          break;
        case "max_energy":
          effects.maxEnergyBonus += effect.value;
          break;
        case "crit_chance":
          effects.critChanceBonus += effect.value;
          break;
        case "crit_multiplier":
          effects.critMultiplierBonus += effect.value;
          break;
        case "hex_multiplier":
          effects.hexMultiplierBonus += effect.value;
          break;
      }
    }
  }

  return effects;
}

export function calculateComboBonus(combo: DailyCombo, equipped: EquippedModules): ModuleEffects {
  const bonus: ModuleEffects = {
    tapPowerBonus: 0,
    autoHexBonus: 0,
    energyRegenBonus: 0,
    heatReduction: 0,
    maxEnergyBonus: 0,
    critChanceBonus: 0,
    critMultiplierBonus: 0,
    hexMultiplierBonus: 0,
  };

  if (!isDailyComboActive(combo)) return bonus;

  const allEquipped = [equipped.slot1, equipped.slot2, equipped.slot3].filter(Boolean) as ModuleId[];
  const comboSet = new Set(combo.modules);
  const matchCount = allEquipped.filter((id) => comboSet.has(id)).length;

  if (matchCount < 2) return bonus;

  const multiplier = matchCount === 3 ? 1.5 : 1.0;

  switch (combo.bonus.type) {
    case "hex_multiplier":
      bonus.hexMultiplierBonus = Math.round(combo.bonus.value * multiplier);
      break;
    case "tap_power":
      bonus.tapPowerBonus = Math.round(combo.bonus.value * multiplier);
      break;
  }

  return bonus;
}

// ── Slot Management ──────────────────────────────────────

export function equipModule(
  equipped: EquippedModules,
  moduleId: ModuleId,
  slotIndex: 0 | 1 | 2,
): EquippedModules {
  const slotKey = `slot${slotIndex + 1}` as keyof EquippedModules;
  return { ...equipped, [slotKey]: moduleId };
}

export function unequipModule(
  equipped: EquippedModules,
  slotIndex: 0 | 1 | 2,
): EquippedModules {
  const slotKey = `slot${slotIndex + 1}` as keyof EquippedModules;
  return { ...equipped, [slotKey]: null };
}

export function isModuleEquipped(equipped: EquippedModules, moduleId: ModuleId): boolean {
  return equipped.slot1 === moduleId || equipped.slot2 === moduleId || equipped.slot3 === moduleId;
}

export function getEquippedModulesList(equipped: EquippedModules): ReactorModule[] {
  const ids = [equipped.slot1, equipped.slot2, equipped.slot3].filter(Boolean) as ModuleId[];
  return ids.map((id) => ALL_MODULES.find((m) => m.id === id)!).filter(Boolean);
}

// ── Effects Display ──────────────────────────────────────

export function formatEffect(effect: ModuleEffect): string {
  switch (effect.type) {
    case "tap_power":
      return `+${effect.value} Tap Power`;
    case "auto_hex":
      return `+${effect.value} HEX/sec`;
    case "energy_regen":
      return `+${effect.value} Energy Regen`;
    case "heat_reduction":
      return `-${effect.value}% Heat`;
    case "max_energy":
      return `+${effect.value} Max Energy`;
    case "crit_chance":
      return `+${effect.value}% Crit Chance`;
    case "crit_multiplier":
      return `+${effect.value}% Crit Multi`;
    case "hex_multiplier":
      return `+${effect.value}% HEX Multi`;
  }
}

export function getTotalEffectsFormatted(equipped: EquippedModules): string[] {
  const effects = calculateModuleEffects(equipped);
  const result: string[] = [];

  if (effects.tapPowerBonus > 0) result.push(`+${effects.tapPowerBonus} Tap Power`);
  if (effects.autoHexBonus > 0) result.push(`+${effects.autoHexBonus} HEX/sec`);
  if (effects.energyRegenBonus > 0) result.push(`+${effects.energyRegenBonus} Energy Regen`);
  if (effects.heatReduction > 0) result.push(`-${effects.heatReduction}% Heat`);
  if (effects.maxEnergyBonus > 0) result.push(`+${effects.maxEnergyBonus} Max Energy`);
  if (effects.critChanceBonus > 0) result.push(`+${effects.critChanceBonus}% Crit Chance`);
  if (effects.critMultiplierBonus > 0) result.push(`+${effects.critMultiplierBonus}% Crit Multi`);
  if (effects.hexMultiplierBonus > 0) result.push(`+${effects.hexMultiplierBonus}% HEX Multi`);

  return result;
}
