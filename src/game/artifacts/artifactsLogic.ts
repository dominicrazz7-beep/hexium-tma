/* ═══════════════════════════════════════════════════════
   ARTIFACTS — Pure Logic
   Equip, unequip, calculate effects, drop system
   ═══════════════════════════════════════════════════════ */
import {
  type Artifact,
  type ArtifactRarity,
  type ArtifactBonusType,
  ALL_ARTIFACTS,
  ARTIFACT_BY_ID,
  TOTAL_ARTIFACTS,
  COLLECTION_MILESTONES,
} from "./artifactsData";
import { ARTIFACTS_BALANCE, RARITY_DROP_WEIGHTS } from "./artifactsBalance";
import { guardNumber } from "../utils/numberGuards";

export type ArtifactsState = {
  owned: Record<string, number>;
  equipped: (string | null)[];
};

export type ArtifactEffects = {
  hexMultiplier: number;
  tapPower: number;
  critChance: number;
  critMultiplier: number;
  autoHex: number;
  energyRegen: number;
  modulePower: number;
};

export const EMPTY_EFFECTS: ArtifactEffects = {
  hexMultiplier: 0,
  tapPower: 0,
  critChance: 0,
  critMultiplier: 0,
  autoHex: 0,
  energyRegen: 0,
  modulePower: 0,
};

export function emptyState(): ArtifactsState {
  return { owned: {}, equipped: [null, null, null] };
}

export function getSlotCount(state: ArtifactsState): number {
  return state.equipped.length;
}

export function setSlotCount(state: ArtifactsState, count: number): ArtifactsState {
  const slots = Math.max(3, Math.min(4, count));
  if (state.equipped.length === slots) return state;
  const equipped = [...state.equipped];
  while (equipped.length < slots) equipped.push(null);
  while (equipped.length > slots) equipped.pop();
  return { ...state, equipped };
}

export function isOwned(state: ArtifactsState, artifactId: string): boolean {
  return (state.owned[artifactId] ?? 0) > 0;
}

export function getOwnedCount(state: ArtifactsState, artifactId: string): number {
  return state.owned[artifactId] ?? 0;
}

export function getUniqueCount(state: ArtifactsState): number {
  return Object.values(state.owned).filter((c) => c > 0).length;
}

export function getTotalDuplicates(state: ArtifactsState): number {
  return Object.values(state.owned).reduce((s, c) => s + c, 0);
}

export function getRarityCount(state: ArtifactsState, rarity: ArtifactRarity): number {
  return ALL_ARTIFACTS.filter((a) => a.rarity === rarity && isOwned(state, a.id)).length;
}

export function getRarityTotal(rarity: ArtifactRarity): number {
  return ALL_ARTIFACTS.filter((a) => a.rarity === rarity).length;
}

export function equipArtifact(state: ArtifactsState, artifactId: string, slot: number): ArtifactsState {
  if (!isOwned(state, artifactId)) return state;
  if (slot < 0 || slot >= state.equipped.length) return state;
  if (state.equipped[slot] === artifactId) return state;

  const nextEquipped = [...state.equipped];
  nextEquipped[slot] = artifactId;
  return { ...state, equipped: nextEquipped };
}

export function unequipArtifact(state: ArtifactsState, slot: number): ArtifactsState {
  if (slot < 0 || slot >= state.equipped.length) return state;
  if (state.equipped[slot] === null) return state;
  const nextEquipped = [...state.equipped];
  nextEquipped[slot] = null;
  return { ...state, equipped: nextEquipped };
}

export function isEquipped(state: ArtifactsState, artifactId: string): boolean {
  return state.equipped.includes(artifactId);
}

export function getEquippedSlot(state: ArtifactsState, artifactId: string): number {
  return state.equipped.indexOf(artifactId);
}

export function addOwned(state: ArtifactsState, artifactId: string): ArtifactsState {
  const count = state.owned[artifactId] ?? 0;
  return { ...state, owned: { ...state.owned, [artifactId]: count + 1 } };
}

/* ── Collection Bonus ────────────────────────────────── */

export function getCollectionBonus(state: ArtifactsState): ArtifactEffects {
  const unique = getUniqueCount(state);
  const bonus = { ...EMPTY_EFFECTS };

  for (const milestone of COLLECTION_MILESTONES) {
    if (unique >= milestone.required) {
      for (const effect of milestone.effects) {
        switch (effect.type) {
          case "hex_multiplier": bonus.hexMultiplier += effect.value; break;
          case "tap_power": bonus.tapPower += effect.value; break;
          case "crit_chance": bonus.critChance += effect.value; break;
          case "crit_multiplier": bonus.critMultiplier += effect.value; break;
          case "auto_hex": bonus.autoHex += effect.value; break;
          case "energy_regen": bonus.energyRegen += effect.value; break;
          case "module_power": bonus.modulePower += effect.value; break;
        }
      }
    }
  }

  return bonus;
}

export function getNextMilestone(state: ArtifactsState): { milestone: typeof COLLECTION_MILESTONES[0]; remaining: number } | null {
  const unique = getUniqueCount(state);
  for (const milestone of COLLECTION_MILESTONES) {
    if (unique < milestone.required) {
      return { milestone, remaining: milestone.required - unique };
    }
  }
  return null;
}

export function calculateEffects(state: ArtifactsState): ArtifactEffects {
  const effects = { ...EMPTY_EFFECTS };

  for (const slot of state.equipped) {
    if (!slot) continue;
    const artifact = ARTIFACT_BY_ID[slot];
    if (!artifact) continue;

    switch (artifact.bonusType) {
      case "hex_multiplier":
        effects.hexMultiplier += artifact.bonusValue;
        break;
      case "tap_power":
        effects.tapPower += artifact.bonusValue;
        break;
      case "crit_chance":
        effects.critChance += artifact.bonusValue;
        break;
      case "crit_multiplier":
        effects.critMultiplier += artifact.bonusValue;
        break;
      case "auto_hex":
        effects.autoHex += artifact.bonusValue;
        break;
      case "energy_regen":
        effects.energyRegen += artifact.bonusValue;
        break;
      case "module_power":
        effects.modulePower += artifact.bonusValue;
        break;
    }
  }

  return effects;
}

export function applyArtifactEffects(
  moduleEffects: {
    tapPowerBonus: number;
    autoHexBonus: number;
    energyRegenBonus: number;
    heatReduction: number;
    maxEnergyBonus: number;
    critChanceBonus: number;
    critMultiplierBonus: number;
    hexMultiplierBonus: number;
  },
  artifactEffects: ArtifactEffects,
): typeof moduleEffects {
  const moduleMult = 1 + guardNumber(artifactEffects.modulePower) / 100;

  return {
    tapPowerBonus: guardNumber(moduleEffects.tapPowerBonus * moduleMult) + artifactEffects.tapPower,
    autoHexBonus: guardNumber(moduleEffects.autoHexBonus * moduleMult) + artifactEffects.autoHex,
    energyRegenBonus: moduleEffects.energyRegenBonus + artifactEffects.energyRegen,
    heatReduction: moduleEffects.heatReduction,
    maxEnergyBonus: moduleEffects.maxEnergyBonus,
    critChanceBonus: moduleEffects.critChanceBonus + artifactEffects.critChance,
    critMultiplierBonus: moduleEffects.critMultiplierBonus + artifactEffects.critMultiplier,
    hexMultiplierBonus: moduleEffects.hexMultiplierBonus + artifactEffects.hexMultiplier,
  };
}

/* ── Drop system ─────────────────────────────────────── */

export function rollArtifactDrop(source: "expedition" | "world_boss" | "event"): Artifact | null {
  const eligible = ALL_ARTIFACTS.filter((a) => a.dropSource === source);
  if (eligible.length === 0) return null;

  const totalWeight = Object.values(RARITY_DROP_WEIGHTS).reduce((s, w) => s + w, 0);
  let r = Math.random() * totalWeight;

  let selectedRarity: ArtifactRarity = "common";
  for (const [rarity, weight] of Object.entries(RARITY_DROP_WEIGHTS)) {
    r -= weight;
    if (r <= 0) {
      selectedRarity = rarity as ArtifactRarity;
      break;
    }
  }

  const pool = eligible.filter((a) => a.rarity === selectedRarity);
  if (pool.length === 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
