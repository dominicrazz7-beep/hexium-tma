/* ═══════════════════════════════════════════════════════
   ASCENSION — Data & Types
   Prestige reset mechanic with permanent bonuses
   ═══════════════════════════════════════════════════════ */

export type AscensionUpgradeCategory = "hex" | "reactor" | "expedition" | "artifact" | "endgame";

export type AscensionUpgrade = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AscensionUpgradeCategory;
  cost: number;
  effect: AscensionEffect;
  requires?: string;
};

export type AscensionEffect =
  | { type: "hex_multiplier"; value: number }
  | { type: "head_start"; level: number }
  | { type: "tap_power"; value: number }
  | { type: "max_energy"; value: number }
  | { type: "max_temperature"; value: number }
  | { type: "expedition_speed"; value: number }
  | { type: "expedition_slot"; value: number }
  | { type: "research_yield"; value: number }
  | { type: "artifact_slot"; value: number }
  | { type: "artifact_power"; value: number }
  | { type: "collection_boost"; value: number }
  | { type: "bot_start_stars"; value: number }
  | { type: "lucky_boost"; value: number }
  | { type: "quantum_core_gen"; value: number };

export const ALL_ASCENSION_UPGRADES: AscensionUpgrade[] = [
  /* ── Tier 1: HEX Bonuses ────────────────────────── */
  { id: "hex_boost_1", name: "HEX Boost I", description: "+10% HEX/sec", icon: "💰", category: "hex", cost: 1, effect: { type: "hex_multiplier", value: 10 } },
  { id: "hex_boost_2", name: "HEX Boost II", description: "+20% HEX/sec", icon: "💰", category: "hex", cost: 2, effect: { type: "hex_multiplier", value: 20 }, requires: "hex_boost_1" },
  { id: "hex_boost_3", name: "HEX Boost III", description: "+30% HEX/sec", icon: "💰", category: "hex", cost: 3, effect: { type: "hex_multiplier", value: 30 }, requires: "hex_boost_2" },
  { id: "hex_boost_4", name: "HEX Boost IV", description: "+50% HEX/sec", icon: "💰", category: "hex", cost: 5, effect: { type: "hex_multiplier", value: 50 }, requires: "hex_boost_3" },
  { id: "hex_boost_5", name: "HEX Boost V", description: "+75% HEX/sec", icon: "💰", category: "hex", cost: 8, effect: { type: "hex_multiplier", value: 75 }, requires: "hex_boost_4" },

  /* ── Tier 2: Reactor Bonuses ─────────────────────── */
  { id: "head_start_1", name: "Head Start I", description: "Start at LVL 3", icon: "🚀", category: "reactor", cost: 2, effect: { type: "head_start", level: 3 } },
  { id: "head_start_2", name: "Head Start II", description: "Start at LVL 5", icon: "🚀", category: "reactor", cost: 4, effect: { type: "head_start", level: 5 }, requires: "head_start_1" },
  { id: "head_start_3", name: "Head Start III", description: "Start at LVL 8", icon: "🚀", category: "reactor", cost: 8, effect: { type: "head_start", level: 8 }, requires: "head_start_2" },
  { id: "tap_power_1", name: "Tap Power I", description: "+5 base tap power", icon: "⛏", category: "reactor", cost: 2, effect: { type: "tap_power", value: 5 } },
  { id: "tap_power_2", name: "Tap Power II", description: "+15 base tap power", icon: "⛏", category: "reactor", cost: 5, effect: { type: "tap_power", value: 15 }, requires: "tap_power_1" },
  { id: "energy_reserve_1", name: "Energy Reserve I", description: "+50 max energy", icon: "🔋", category: "reactor", cost: 3, effect: { type: "max_energy", value: 50 } },
  { id: "heat_tolerance_1", name: "Heat Tolerance I", description: "+20 max temperature", icon: "🌡", category: "reactor", cost: 3, effect: { type: "max_temperature", value: 20 } },

  /* ── Tier 3: Expedition Bonuses ──────────────────── */
  { id: "expedition_speed_1", name: "Expedition Speed I", description: "-10% expedition duration", icon: "⏱", category: "expedition", cost: 3, effect: { type: "expedition_speed", value: 10 } },
  { id: "expedition_speed_2", name: "Expedition Speed II", description: "-20% expedition duration", icon: "⏱", category: "expedition", cost: 6, effect: { type: "expedition_speed", value: 20 }, requires: "expedition_speed_1" },
  { id: "expedition_slot", name: "Extra Slot", description: "+1 expedition slot", icon: "📦", category: "expedition", cost: 8, effect: { type: "expedition_slot", value: 1 } },
  { id: "research_yield_1", name: "Research Yield I", description: "+20% research from expeditions", icon: "🔬", category: "expedition", cost: 4, effect: { type: "research_yield", value: 20 } },

  /* ── Tier 4: Artifact Bonuses ────────────────────── */
  { id: "artifact_slot", name: "Extra Artifact Slot", description: "+1 artifact slot (max 4)", icon: "🔮", category: "artifact", cost: 5, effect: { type: "artifact_slot", value: 1 } },
  { id: "artifact_power_1", name: "Artifact Power I", description: "+25% artifact effects", icon: "⚡", category: "artifact", cost: 8, effect: { type: "artifact_power", value: 25 } },
  { id: "collection_boost_1", name: "Collection Boost", description: "+5% HEX per 5 artifacts", icon: "🏆", category: "artifact", cost: 10, effect: { type: "collection_boost", value: 5 } },

  /* ── Tier 5: Endgame ─────────────────────────────── */
  { id: "bot_evolution_boost", name: "Bot Evolution Boost", description: "Bots start at 1★", icon: "🤖", category: "endgame", cost: 10, effect: { type: "bot_start_stars", value: 1 } },
  { id: "lucky_boost", name: "Lucky Boost", description: "+2% to Mega/Ultra/Quantum tiers", icon: "🍀", category: "endgame", cost: 15, effect: { type: "lucky_boost", value: 2 } },
  { id: "quantum_core_gen", name: "Quantum Core Generator", description: "+1 Quantum Core per day", icon: "💎", category: "endgame", cost: 20, effect: { type: "quantum_core_gen", value: 1 } },
];

export const ASCENSION_BY_ID: Record<string, AscensionUpgrade> = Object.fromEntries(
  ALL_ASCENSION_UPGRADES.map((u) => [u.id, u]),
);

export const ASCENSION_CATEGORIES: { id: AscensionUpgradeCategory; label: string; icon: string }[] = [
  { id: "hex", label: "HEX Bonuses", icon: "💰" },
  { id: "reactor", label: "Reactor Bonuses", icon: "⚛️" },
  { id: "expedition", label: "Expedition Bonuses", icon: "🚀" },
  { id: "artifact", label: "Artifact Bonuses", icon: "🔮" },
  { id: "endgame", label: "Endgame", icon: "🏆" },
];

export const TOTAL_ESSENCE_COST = ALL_ASCENSION_UPGRADES.reduce((s, u) => s + u.cost, 0);
