/* ═══════════════════════════════════════════════════════
   Reactor Modules — Data & Types
   Slot-based module system with Daily Combo
   ═══════════════════════════════════════════════════════ */

export type ModuleRarity = "common" | "rare" | "epic" | "legendary" | "quantum";

export type ModuleSlotId = "slot1" | "slot2" | "slot3";

export type ModuleId =
  | "cooling_matrix"
  | "quantum_lens"
  | "nano_core"
  | "void_stabilizer"
  | "heat_shield"
  | "energy_amplifier"
  | "quantum_converter"
  | "dark_matter_core"
  | "plasma_condenser"
  | "neural_link"
  | "temporal_shift"
  | "omega_reactor"
  | "tap_booster"
  | "crit_enhancer"
  | "scout_module"
  | "navigator"
  | "combat_boost"
  | "war_module"
  | "nano_core_r2"
  | "neural_link_r2"
  | "dark_matter_core_r2"
  | "void_stabilizer_r2"
  | "temporal_shift_r3"
  | "omega_reactor_r3"
  | "quantum_forge_r3"
  | "void_engine_r3";

export type ModuleEffect = {
  type: "tap_power" | "auto_hex" | "energy_regen" | "heat_reduction" | "max_energy" | "crit_chance" | "crit_multiplier" | "hex_multiplier";
  value: number;
};

export type ReactorModule = {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  rarity: ModuleRarity;
  effects: ModuleEffect[];
  unlockLevel: number;
  cost: { currency: "hex" | "shards" | "premium"; amount: number };
};

export type EquippedModules = {
  slot1: ModuleId | null;
  slot2: ModuleId | null;
  slot3: ModuleId | null;
};

export type DailyCombo = {
  date: string;
  modules: [ModuleId, ModuleId, ModuleId];
  bonus: ModuleEffect;
  active: boolean;
};

export const ALL_MODULES: ReactorModule[] = [
  // Common
  {
    id: "cooling_matrix",
    name: "Cooling Matrix",
    description: "Стандартна система охолодження. Знижує нагрів.",
    icon: "❄️",
    rarity: "common",
    effects: [{ type: "heat_reduction", value: 15 }],
    unlockLevel: 5,
    cost: { currency: "hex", amount: 500 },
  },
  {
    id: "heat_shield",
    name: "Heat Shield",
    description: "Термозахисний бар'єр. Підвищує поріг перегріву.",
    icon: "🛡️",
    rarity: "common",
    effects: [{ type: "heat_reduction", value: 10 }],
    unlockLevel: 3,
    cost: { currency: "hex", amount: 300 },
  },

  // Rare
  {
    id: "quantum_lens",
    name: "Quantum Lens",
    description: "Квантовий фокусувальник. Підвищує критичний шанс.",
    icon: "🔮",
    rarity: "rare",
    effects: [
      { type: "crit_chance", value: 5 },
      { type: "tap_power", value: 2 },
    ],
    unlockLevel: 10,
    cost: { currency: "hex", amount: 2000 },
  },
  {
    id: "energy_amplifier",
    name: "Energy Amplifier",
    description: "Підсилювач енергії. Швидша регенерація.",
    icon: "⚡",
    rarity: "rare",
    effects: [
      { type: "energy_regen", value: 2 },
      { type: "max_energy", value: 50 },
    ],
    unlockLevel: 8,
    cost: { currency: "hex", amount: 1500 },
  },
  {
    id: "plasma_condenser",
    name: "Plasma Condenser",
    description: "Конденсатор плазми. Підвищує добуток HEX.",
    icon: "🔥",
    rarity: "rare",
    effects: [{ type: "hex_multiplier", value: 10 }],
    unlockLevel: 12,
    cost: { currency: "shards", amount: 50 },
  },

  // Epic
  {
    id: "nano_core",
    name: "Nano Core",
    description: "Нанотехнологічне ядро. Підвищує потужність тапів.",
    icon: "⚛️",
    rarity: "epic",
    effects: [
      { type: "tap_power", value: 8 },
      { type: "crit_multiplier", value: 15 },
    ],
    unlockLevel: 20,
    cost: { currency: "hex", amount: 8000 },
  },
  {
    id: "quantum_converter",
    name: "Quantum Converter",
    description: "Квантовий конвертер. Пасивний дохід HEX.",
    icon: "🌀",
    rarity: "epic",
    effects: [
      { type: "auto_hex", value: 5 },
      { type: "hex_multiplier", value: 15 },
    ],
    unlockLevel: 18,
    cost: { currency: "shards", amount: 150 },
  },
  {
    id: "neural_link",
    name: "Neural Link",
    description: "Нейронний зв'язок. Підвищує критичний множник.",
    icon: "🧠",
    rarity: "epic",
    effects: [
      { type: "crit_chance", value: 8 },
      { type: "crit_multiplier", value: 25 },
    ],
    unlockLevel: 25,
    cost: { currency: "hex", amount: 12000 },
  },

  // Legendary
  {
    id: "void_stabilizer",
    name: "Void Stabilizer",
    description: "Стабілізатор порожнечі. Знижує нагрів та підвищує добуток.",
    icon: "🌌",
    rarity: "legendary",
    effects: [
      { type: "heat_reduction", value: 30 },
      { type: "hex_multiplier", value: 25 },
      { type: "tap_power", value: 5 },
    ],
    unlockLevel: 30,
    cost: { currency: "shards", amount: 300 },
  },
  {
    id: "dark_matter_core",
    name: "Dark Matter Core",
    description: "Ядро з темної матерії. Максимальний добуток.",
    icon: "🌑",
    rarity: "legendary",
    effects: [
      { type: "auto_hex", value: 15 },
      { type: "hex_multiplier", value: 40 },
      { type: "energy_regen", value: 3 },
    ],
    unlockLevel: 35,
    cost: { currency: "premium", amount: 50 },
  },

  // Quantum (ultimate)
  {
    id: "temporal_shift",
    name: "Temporal Shift",
    description: "Часовий зсув. Зупиняє час перегріву.",
    icon: "⏳",
    rarity: "quantum",
    effects: [
      { type: "heat_reduction", value: 50 },
      { type: "tap_power", value: 15 },
      { type: "crit_chance", value: 12 },
    ],
    unlockLevel: 40,
    cost: { currency: "premium", amount: 100 },
  },
  {
    id: "omega_reactor",
    name: "Omega Reactor",
    description: "Омега-реактор. Абсолютна потужність.",
    icon: "💎",
    rarity: "quantum",
    effects: [
      { type: "tap_power", value: 25 },
      { type: "auto_hex", value: 25 },
      { type: "hex_multiplier", value: 60 },
      { type: "crit_chance", value: 15 },
      { type: "crit_multiplier", value: 50 },
    ],
    unlockLevel: 50,
    cost: { currency: "premium", amount: 200 },
  },
  /* ── Release 1: Common/Rare modules ──────────────── */
  {
    id: "tap_booster",
    name: "Tap Booster",
    description: "Підсилювач тапів. +3 Tap Power.",
    icon: "⛏",
    rarity: "common",
    effects: [{ type: "tap_power", value: 3 }],
    unlockLevel: 1,
    cost: { currency: "hex", amount: 200 },
  },
  {
    id: "crit_enhancer",
    name: "Crit Enhancer",
    description: "Підвищує критичний шанс. +3% Crit Chance.",
    icon: "🎯",
    rarity: "common",
    effects: [{ type: "crit_chance", value: 3 }],
    unlockLevel: 3,
    cost: { currency: "hex", amount: 350 },
  },
  {
    id: "scout_module",
    name: "Scout Module",
    description: "Розвідувальний модуль. +5% Expedition Speed.",
    icon: "🛰",
    rarity: "common",
    effects: [{ type: "energy_regen", value: 1 }, { type: "hex_multiplier", value: 3 }],
    unlockLevel: 5,
    cost: { currency: "hex", amount: 500 },
  },
  {
    id: "navigator",
    name: "Navigator",
    description: "Навігаційний модуль. +10% Expedition Speed, +10% Research.",
    icon: "🧭",
    rarity: "rare",
    effects: [{ type: "energy_regen", value: 2 }, { type: "hex_multiplier", value: 5 }],
    unlockLevel: 8,
    cost: { currency: "hex", amount: 1200 },
  },
  {
    id: "combat_boost",
    name: "Combat Boost",
    description: "Бойовий модуль. +5% Boss Damage.",
    icon: "⚔️",
    rarity: "common",
    effects: [{ type: "tap_power", value: 4 }, { type: "crit_chance", value: 2 }],
    unlockLevel: 10,
    cost: { currency: "hex", amount: 800 },
  },
  {
    id: "war_module",
    name: "War Module",
    description: "Військовий модуль. +10% Boss Damage, +5% HEX.",
    icon: "🛡",
    rarity: "rare",
    effects: [{ type: "tap_power", value: 6 }, { type: "hex_multiplier", value: 5 }],
    unlockLevel: 15,
    cost: { currency: "hex", amount: 2000 },
  },
  /* ── Release 2: Epic modules ──────────────────────── */
  {
    id: "nano_core_r2",
    name: "Nano Core",
    description: "Нанотехнологічне ядро. +8 Tap, +15% Crit Multi.",
    icon: "⚛️",
    rarity: "epic",
    effects: [{ type: "tap_power", value: 8 }, { type: "crit_multiplier", value: 15 }],
    unlockLevel: 20,
    cost: { currency: "hex", amount: 8000 },
  },
  {
    id: "neural_link_r2",
    name: "Neural Link",
    description: "Нейронний зв'язок. +8% Crit, +25% Crit Multi.",
    icon: "🧠",
    rarity: "epic",
    effects: [{ type: "crit_chance", value: 8 }, { type: "crit_multiplier", value: 25 }],
    unlockLevel: 25,
    cost: { currency: "hex", amount: 12000 },
  },
  {
    id: "dark_matter_core_r2",
    name: "Dark Matter Core",
    description: "Ядро з темної матерії. +15 Tap, +25% HEX.",
    icon: "🌑",
    rarity: "epic",
    effects: [{ type: "tap_power", value: 15 }, { type: "hex_multiplier", value: 25 }],
    unlockLevel: 30,
    cost: { currency: "shards", amount: 100 },
  },
  {
    id: "void_stabilizer_r2",
    name: "Void Stabilizer",
    description: "Стабілізатор порожнечі. -30% Heat, +25% HEX, +5 Tap.",
    icon: "🌌",
    rarity: "epic",
    effects: [{ type: "heat_reduction", value: 30 }, { type: "hex_multiplier", value: 25 }, { type: "tap_power", value: 5 }],
    unlockLevel: 35,
    cost: { currency: "shards", amount: 150 },
  },
  /* ── Release 3: Legendary + Quantum modules ──────── */
  {
    id: "temporal_shift_r3",
    name: "Temporal Shift",
    description: "Часовий зсув. -20% Heat, +10% HEX.",
    icon: "⏳",
    rarity: "legendary",
    effects: [{ type: "heat_reduction", value: 20 }, { type: "hex_multiplier", value: 10 }],
    unlockLevel: 40,
    cost: { currency: "shards", amount: 200 },
  },
  {
    id: "omega_reactor_r3",
    name: "Omega Reactor",
    description: "Омега-реактор. +8 Tap, +10% HEX.",
    icon: "💎",
    rarity: "legendary",
    effects: [{ type: "tap_power", value: 8 }, { type: "hex_multiplier", value: 10 }],
    unlockLevel: 45,
    cost: { currency: "shards", amount: 250 },
  },
  {
    id: "quantum_forge_r3",
    name: "Quantum Forge",
    description: "Квантова кузня. +15% HEX, +5% Crit Multi.",
    icon: "⚒️",
    rarity: "quantum",
    effects: [{ type: "hex_multiplier", value: 15 }, { type: "crit_multiplier", value: 5 }],
    unlockLevel: 50,
    cost: { currency: "premium", amount: 150 },
  },
  {
    id: "void_engine_r3",
    name: "Void Engine",
    description: "Двигун порожнечі. +10% HEX, +10% Expedition Speed.",
    icon: "🌀",
    rarity: "quantum",
    effects: [{ type: "hex_multiplier", value: 10 }, { type: "energy_regen", value: 3 }],
    unlockLevel: 50,
    cost: { currency: "premium", amount: 200 },
  },
];

export const MODULE_RARITY_COLORS: Record<ModuleRarity, string> = {
  common: "#8ea7c7",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  quantum: "#00f0ff",
};

export const MAX_SLOTS = 3;

export function getModuleById(id: ModuleId): ReactorModule | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}

export function getModulesByRarity(rarity: ModuleRarity): ReactorModule[] {
  return ALL_MODULES.filter((m) => m.rarity === rarity);
}

export function getUnlockedModules(reactorLevel: number): ReactorModule[] {
  return ALL_MODULES.filter((m) => reactorLevel >= m.unlockLevel);
}
