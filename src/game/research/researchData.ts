/* ═══════════════ HEXIUM · Research Center — data / types ═══════════════ */

export type ResearchBranch = "energy" | "heat" | "mining" | "advanced";

export type ResearchTier = 1 | 2 | 3;

export type ResearchEffectType =
  | "energy_capacity"
  | "energy_regen"
  | "turbo_duration"
  | "overclock_power"
  | "heat_resistance"
  | "coolant_efficiency"
  | "thermal_shield"
  | "plasma_control"
  | "tap_multiplier"
  | "auto_mine_rate"
  | "lucky_chance"
  | "quantum_boost";

export type ResearchDef = {
  id: string;
  name: string;
  description: string;
  branch: ResearchBranch;
  icon: string;
  effectType: ResearchEffectType;
  tiers: {
    costHex: number;
    costShards: number;
    durationMinutes: number;
    effectValue: number;
    description: string;
  }[];
};

export const BRANCH_META: Record<ResearchBranch, { label: string; icon: string; accent: string }> = {
  energy: { label: "Energy Core", icon: "⚡", accent: "#4fd6ff" },
  heat: { label: "Thermal Control", icon: "🌡", accent: "#ff6b6b" },
  mining: { label: "Mining Systems", icon: "⛏", accent: "#ffd54f" },
  advanced: { label: "Advanced Tech", icon: "🔮", accent: "#c026ff" },
};

export const RESEARCH_ITEMS: ResearchDef[] = [
  {
    id: "energy_capacity",
    name: "Energy Reservoir",
    description: "Expand the reactor's energy storage capacity.",
    branch: "energy",
    icon: "🔋",
    effectType: "energy_capacity",
    tiers: [
      { costHex: 500, costShards: 2, durationMinutes: 5, effectValue: 1.15, description: "+15% energy capacity" },
      { costHex: 2000, costShards: 5, durationMinutes: 15, effectValue: 1.35, description: "+35% energy capacity" },
      { costHex: 8000, costShards: 12, durationMinutes: 60, effectValue: 1.60, description: "+60% energy capacity" },
    ],
  },
  {
    id: "energy_regen",
    name: "Regen Accelerator",
    description: "Speed up natural energy regeneration.",
    branch: "energy",
    icon: "♻️",
    effectType: "energy_regen",
    tiers: [
      { costHex: 600, costShards: 2, durationMinutes: 5, effectValue: 1.20, description: "+20% energy regen" },
      { costHex: 2500, costShards: 6, durationMinutes: 20, effectValue: 1.45, description: "+45% energy regen" },
      { costHex: 10000, costShards: 15, durationMinutes: 90, effectValue: 1.75, description: "+75% energy regen" },
    ],
  },
  {
    id: "turbo_duration",
    name: "Turbo Overclock",
    description: "Extend the duration of turbo mode activations.",
    branch: "energy",
    icon: "🚀",
    effectType: "turbo_duration",
    tiers: [
      { costHex: 800, costShards: 3, durationMinutes: 8, effectValue: 1.25, description: "+25% turbo duration" },
      { costHex: 3000, costShards: 8, durationMinutes: 25, effectValue: 1.55, description: "+55% turbo duration" },
      { costHex: 12000, costShards: 18, durationMinutes: 120, effectValue: 1.90, description: "+90% turbo duration" },
    ],
  },
  {
    id: "overclock_power",
    name: "Overclock Matrix",
    description: "Boost the power output during overclocked states.",
    branch: "energy",
    icon: "⚙️",
    effectType: "overclock_power",
    tiers: [
      { costHex: 1000, costShards: 4, durationMinutes: 10, effectValue: 1.20, description: "+20% overclock power" },
      { costHex: 4000, costShards: 10, durationMinutes: 30, effectValue: 1.50, description: "+50% overclock power" },
      { costHex: 15000, costShards: 20, durationMinutes: 150, effectValue: 1.85, description: "+85% overclock power" },
    ],
  },
  {
    id: "heat_resistance",
    name: "Thermal Plating",
    description: "Reduce heat generation from all reactor actions.",
    branch: "heat",
    icon: "🛡️",
    effectType: "heat_resistance",
    tiers: [
      { costHex: 500, costShards: 2, durationMinutes: 5, effectValue: 0.85, description: "-15% heat generation" },
      { costHex: 2000, costShards: 5, durationMinutes: 15, effectValue: 0.70, description: "-30% heat generation" },
      { costHex: 8000, costShards: 12, durationMinutes: 60, effectValue: 0.55, description: "-45% heat generation" },
    ],
  },
  {
    id: "coolant_efficiency",
    name: "Coolant System",
    description: "Accelerate heat dissipation rates.",
    branch: "heat",
    icon: "❄️",
    effectType: "coolant_efficiency",
    tiers: [
      { costHex: 600, costShards: 2, durationMinutes: 5, effectValue: 1.25, description: "+25% heat cooldown" },
      { costHex: 2500, costShards: 6, durationMinutes: 20, effectValue: 1.55, description: "+55% heat cooldown" },
      { costHex: 10000, costShards: 15, durationMinutes: 90, effectValue: 1.90, description: "+90% heat cooldown" },
    ],
  },
  {
    id: "thermal_shield",
    name: "Thermal Shield",
    description: "Increase the maximum safe operating temperature.",
    branch: "heat",
    icon: "🔥",
    effectType: "thermal_shield",
    tiers: [
      { costHex: 800, costShards: 3, durationMinutes: 8, effectValue: 1.10, description: "+10% max temperature" },
      { costHex: 3000, costShards: 8, durationMinutes: 25, effectValue: 1.25, description: "+25% max temperature" },
      { costHex: 12000, costShards: 18, durationMinutes: 120, effectValue: 1.45, description: "+45% max temperature" },
    ],
  },
  {
    id: "plasma_control",
    name: "Plasma Regulator",
    description: "Reduce overheat penalty duration and severity.",
    branch: "heat",
    icon: "🌊",
    effectType: "plasma_control",
    tiers: [
      { costHex: 1000, costShards: 4, durationMinutes: 10, effectValue: 0.80, description: "-20% overheat penalty" },
      { costHex: 4000, costShards: 10, durationMinutes: 30, effectValue: 0.60, description: "-40% overheat penalty" },
      { costHex: 15000, costShards: 20, durationMinutes: 150, effectValue: 0.40, description: "-60% overheat penalty" },
    ],
  },
  {
    id: "tap_multiplier",
    name: "Tap Amplifier",
    description: "Increase HEX earned per tap.",
    branch: "mining",
    icon: "👆",
    effectType: "tap_multiplier",
    tiers: [
      { costHex: 700, costShards: 3, durationMinutes: 6, effectValue: 1.20, description: "+20% tap power" },
      { costHex: 3000, costShards: 8, durationMinutes: 20, effectValue: 1.50, description: "+50% tap power" },
      { costHex: 12000, costShards: 16, durationMinutes: 100, effectValue: 1.85, description: "+85% tap power" },
    ],
  },
  {
    id: "auto_mine_rate",
    name: "Auto-Miner Boost",
    description: "Increase passive HEX generation from the auto-miner.",
    branch: "mining",
    icon: "🤖",
    effectType: "auto_mine_rate",
    tiers: [
      { costHex: 800, costShards: 3, durationMinutes: 8, effectValue: 1.25, description: "+25% auto-mine rate" },
      { costHex: 3500, costShards: 9, durationMinutes: 25, effectValue: 1.60, description: "+60% auto-mine rate" },
      { costHex: 14000, costShards: 18, durationMinutes: 120, effectValue: 2.00, description: "+100% auto-mine rate" },
    ],
  },
  {
    id: "lucky_chance",
    name: "Quantum Luck",
    description: "Increase the chance of triggering lucky tap bonuses.",
    branch: "mining",
    icon: "🍀",
    effectType: "lucky_chance",
    tiers: [
      { costHex: 1000, costShards: 4, durationMinutes: 10, effectValue: 1.30, description: "+30% lucky chance" },
      { costHex: 4000, costShards: 10, durationMinutes: 30, effectValue: 1.70, description: "+70% lucky chance" },
      { costHex: 16000, costShards: 22, durationMinutes: 150, effectValue: 2.20, description: "+120% lucky chance" },
    ],
  },
  {
    id: "quantum_boost",
    name: "Quantum Resonance",
    description: "Amplify all income sources through quantum entanglement.",
    branch: "advanced",
    icon: "⚛️",
    effectType: "quantum_boost",
    tiers: [
      { costHex: 2000, costShards: 8, durationMinutes: 20, effectValue: 1.15, description: "+15% all income" },
      { costHex: 8000, costShards: 20, durationMinutes: 60, effectValue: 1.35, description: "+35% all income" },
      { costHex: 30000, costShards: 40, durationMinutes: 240, effectValue: 1.60, description: "+60% all income" },
    ],
  },
];

export const RESEARCH_BY_ID: Record<string, ResearchDef> = Object.fromEntries(
  RESEARCH_ITEMS.map((r) => [r.id, r]),
);
