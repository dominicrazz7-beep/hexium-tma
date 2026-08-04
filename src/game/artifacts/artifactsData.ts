/* ═══════════════════════════════════════════════════════
   ARTIFACTS — Data & Types
   20 artifacts · 5 rarities · 3 equipped slots
   ═══════════════════════════════════════════════════════ */

export type ArtifactRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type ArtifactBonusType =
  | "hex_multiplier"
  | "tap_power"
  | "crit_chance"
  | "crit_multiplier"
  | "auto_hex"
  | "energy_regen"
  | "module_power";

export type ArtifactBonus = {
  type: ArtifactBonusType;
  value: number;
};

export type Artifact = {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: ArtifactRarity;
  bonusType: ArtifactBonusType;
  bonusValue: number;
  dropSource: "expedition" | "world_boss" | "event";
};

export const ARTIFACT_RARITY_COLORS: Record<ArtifactRarity, string> = {
  common: "#8ea7c7",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  mythic: "#ff3366",
};

export const ALL_ARTIFACTS: Artifact[] = [
  /* ── COMMON (existing 5) ──────────────────────────── */
  { id: "quantum_chip", name: "Quantum Chip", icon: "⚛️", description: "+5% HEX/sec", rarity: "common", bonusType: "hex_multiplier", bonusValue: 5, dropSource: "expedition" },
  { id: "data_shard", name: "Data Shard", icon: "📊", description: "+3% Auto HEX/sec", rarity: "common", bonusType: "auto_hex", bonusValue: 3, dropSource: "expedition" },
  { id: "energy_cell", name: "Energy Cell", icon: "🔋", description: "+1 Energy Regen", rarity: "common", bonusType: "energy_regen", bonusValue: 1, dropSource: "expedition" },
  { id: "coolant_drop", name: "Coolant Drop", icon: "💧", description: "+2 Tap Power", rarity: "common", bonusType: "tap_power", bonusValue: 2, dropSource: "expedition" },
  { id: "signal_booster", name: "Signal Booster", icon: "📡", description: "+3% Module Power", rarity: "common", bonusType: "module_power", bonusValue: 3, dropSource: "expedition" },
  /* ── COMMON (Release 1 — 6 new) ──────────────────── */
  { id: "thermal_sink", name: "Thermal Sink", icon: "🌡", description: "-5% Heat, +2% HEX", rarity: "common", bonusType: "hex_multiplier", bonusValue: 2, dropSource: "expedition" },
  { id: "power_relay", name: "Power Relay", icon: "🔌", description: "+1% HEX, +1 Tap Power", rarity: "common", bonusType: "tap_power", bonusValue: 1, dropSource: "expedition" },
  { id: "scan_module", name: "Scan Module", icon: "🔍", description: "+2% Crit Chance", rarity: "common", bonusType: "crit_chance", bonusValue: 2, dropSource: "expedition" },
  { id: "repair_kit", name: "Repair Kit", icon: "🔧", description: "+2 Energy Regen", rarity: "common", bonusType: "energy_regen", bonusValue: 2, dropSource: "expedition" },
  { id: "flux_capacitor", name: "Flux Capacitor", icon: "⚡", description: "+2% Auto HEX, +1% HEX", rarity: "common", bonusType: "auto_hex", bonusValue: 2, dropSource: "expedition" },
  { id: "signal_booster_mk2", name: "Signal Booster MK2", icon: "📡", description: "+4% Module Power", rarity: "common", bonusType: "module_power", bonusValue: 4, dropSource: "expedition" },
  /* ── RARE (existing 5 + 1 new) ─────────────────────── */
  { id: "void_crystal", name: "Void Crystal", icon: "💎", description: "+8% HEX/sec, +3% Crit", rarity: "rare", bonusType: "hex_multiplier", bonusValue: 8, dropSource: "expedition" },
  { id: "nano_fiber", name: "Nano Fiber", icon: "🕸", description: "+2 Energy Regen", rarity: "rare", bonusType: "energy_regen", bonusValue: 2, dropSource: "expedition" },
  { id: "plasma_core", name: "Plasma Core", icon: "🔥", description: "+5% Crit Chance", rarity: "rare", bonusType: "crit_chance", bonusValue: 5, dropSource: "expedition" },
  { id: "ancient_code", name: "Ancient Code", icon: "📜", description: "+8% Module Power", rarity: "rare", bonusType: "module_power", bonusValue: 8, dropSource: "expedition" },
  { id: "void_shard", name: "Void Shard", icon: "🔮", description: "+5 Tap Power", rarity: "rare", bonusType: "tap_power", bonusValue: 5, dropSource: "expedition" },
  /* ── RARE (Release 1 + Release 2 new) ─────────────── */
  { id: "quantum_lens", name: "Quantum Lens", icon: "🔬", description: "+3% Crit Multiplier", rarity: "rare", bonusType: "crit_multiplier", bonusValue: 3, dropSource: "world_boss" },
  /* ── EPIC (5) ─────────────────────────────────────── */
  { id: "dark_battery", name: "Dark Battery", icon: "🌑", description: "+12% HEX/sec", rarity: "epic", bonusType: "hex_multiplier", bonusValue: 12, dropSource: "world_boss" },
  { id: "neural_link", name: "Neural Link", icon: "🧠", description: "+10% Crit Multiplier", rarity: "epic", bonusType: "crit_multiplier", bonusValue: 10, dropSource: "world_boss" },
  { id: "quantum_core", name: "Quantum Core", icon: "🌀", description: "+8 Tap Power", rarity: "epic", bonusType: "tap_power", bonusValue: 8, dropSource: "world_boss" },
  { id: "photon_lens", name: "Photon Lens", icon: "🔍", description: "+12% Module Power", rarity: "epic", bonusType: "module_power", bonusValue: 12, dropSource: "world_boss" },
  { id: "plasma_stone", name: "Plasma Stone", icon: "🪨", description: "+8% Auto HEX/sec", rarity: "epic", bonusType: "auto_hex", bonusValue: 8, dropSource: "world_boss" },
  /* ── LEGENDARY (3) ────────────────────────────────── */
  { id: "singularity_shard", name: "Singularity Shard", icon: "🌌", description: "+20% HEX/sec", rarity: "legendary", bonusType: "hex_multiplier", bonusValue: 20, dropSource: "world_boss" },
  { id: "dark_matter_core", name: "Dark Matter Core", icon: "⚫", description: "+15 Tap Power", rarity: "legendary", bonusType: "tap_power", bonusValue: 15, dropSource: "world_boss" },
  { id: "temporal_engine", name: "Temporal Engine", icon: "⏳", description: "+20% Module Power", rarity: "legendary", bonusType: "module_power", bonusValue: 20, dropSource: "world_boss" },
  /* ── MYTHIC (2) ───────────────────────────────────── */
  { id: "omega_fragment", name: "Omega Fragment", icon: "💎", description: "+25% HEX/sec", rarity: "mythic", bonusType: "hex_multiplier", bonusValue: 25, dropSource: "event" },
  { id: "reality_anchor", name: "Reality Anchor", icon: "👁", description: "+30% Module Power", rarity: "mythic", bonusType: "module_power", bonusValue: 30, dropSource: "world_boss" },
  /* ── Release 3: Legendary + Mythic (5 new) ─────────── */
  { id: "chrono_shard", name: "Chrono Shard", icon: "⏰", description: "+10% Expedition Speed", rarity: "legendary", bonusType: "hex_multiplier", bonusValue: 10, dropSource: "world_boss" },
  { id: "quantum_crown", name: "Quantum Crown", icon: "👑", description: "+8% Research Yield", rarity: "legendary", bonusType: "hex_multiplier", bonusValue: 8, dropSource: "world_boss" },
  { id: "void_heart", name: "Void Heart", icon: "💜", description: "+10% Module Fragment Chance", rarity: "legendary", bonusType: "module_power", bonusValue: 10, dropSource: "world_boss" },
  { id: "omega_eye", name: "Omega Eye", icon: "🔮", description: "+15% Boss Damage", rarity: "mythic", bonusType: "hex_multiplier", bonusValue: 15, dropSource: "world_boss" },
  { id: "reality_core", name: "Reality Core", icon: "🌀", description: "+12% Artifact Find Chance", rarity: "mythic", bonusType: "module_power", bonusValue: 12, dropSource: "world_boss" },
];

export const ARTIFACT_BY_ID: Record<string, Artifact> = Object.fromEntries(
  ALL_ARTIFACTS.map((a) => [a.id, a]),
);

export const TOTAL_ARTIFACTS = ALL_ARTIFACTS.length;

export const RARITY_ORDER: ArtifactRarity[] = ["common", "rare", "epic", "legendary", "mythic"];

export type CollectionMilestone = {
  required: number;
  label: string;
  effects: ArtifactBonus[];
};

export const COLLECTION_MILESTONES: CollectionMilestone[] = [
  { required: 5,  label: "5 Discovered",  effects: [{ type: "hex_multiplier", value: 2 }] },
  { required: 10, label: "10 Discovered", effects: [{ type: "hex_multiplier", value: 5 }] },
  { required: 15, label: "15 Discovered", effects: [{ type: "tap_power", value: 5 }] },
  { required: 20, label: "20 Discovered", effects: [{ type: "hex_multiplier", value: 10 }, { type: "tap_power", value: 10 }, { type: "crit_chance", value: 5 }] },
];

export function formatArtifactBonus(type: ArtifactBonusType, value: number): string {
  switch (type) {
    case "hex_multiplier": return `+${value}% HEX/sec`;
    case "tap_power": return `+${value} Tap Power`;
    case "crit_chance": return `+${value}% Crit Chance`;
    case "crit_multiplier": return `+${value}% Crit Multi`;
    case "auto_hex": return `+${value}% Auto HEX`;
    case "energy_regen": return `+${value} Energy Regen`;
    case "module_power": return `+${value}% Module Power`;
  }
}
