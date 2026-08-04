/* ═══════════════════════════════════════════════════════
   Main Reactor — Balance Constants
   All tuning knobs in one place.
   ═══════════════════════════════════════════════════════ */

export const REACTOR_BALANCE = {
  /* ── Tapping ─────────────────────────────────────── */
  BASE_TAP_POWER: 1,            // HEX per tap at level 0
  TAP_ENERGY_COST: 1,           // energy consumed per tap
  CRITICAL_CHANCE: 0.08,        // 8 % chance of critical tap (legacy — kept for reference)
  CRITICAL_MULTIPLIER: 3,       // critical = base × 3 (legacy — kept for reference)

  /* ── Energy ──────────────────────────────────────── */
  BASE_MAX_ENERGY: 100,
  ENERGY_REGEN_PER_SEC: 1,      // passive regen
  ENERGY_REGEN_INTERVAL_MS: 1000,

  /* ── Temperature / Overheat ─────────────────────── */
  BASE_MAX_TEMPERATURE: 100,
  HEAT_PER_TAP: 2.5,
  HEAT_DECAY_PER_SEC: 4,        // natural cooling
  OVERHEAT_COOLDOWN_SEC: 5,     // seconds locked after overheat
  OVERHEAT_DECAY_MULTIPLIER: 2, // cools faster during overheat

  /* ── Turbo Mode ──────────────────────────────────── */
  TURBO_MULTIPLIER: 5,
  TURBO_DURATION_SEC: 8,
  TURBO_COOLDOWN_SEC: 60,

  /* ── Auto-Miner (idle) ───────────────────────────── */
  BASE_AUTO_HEX_PER_SEC: 0,     // unlocked via upgrade

  /* ── Upgrade costs (base, multiplier per level) ──── */
  UPGRADES: {
    tapPower: {
      baseCost: 10,
      costMultiplier: 1.8,
      baseValue: 1,       // +1 HEX per tap per level
      maxLevel: 50,
      label: "Tap Power",
      icon: "⛏",
      description: "HEX за тап",
    },
    autoMiner: {
      baseCost: 50,
      costMultiplier: 2.0,
      baseValue: 0.5,     // +0.5 HEX/sec per level
      maxLevel: 40,
      label: "Auto-Miner",
      icon: "🤖",
      description: "HEX/сек пасивно",
    },
    energyCapacity: {
      baseCost: 25,
      costMultiplier: 1.6,
      baseValue: 20,      // +20 max energy per level
      maxLevel: 30,
      label: "Energy Cells",
      icon: "🔋",
      description: "Макс. енергія",
    },
    heatSink: {
      baseCost: 30,
      costMultiplier: 1.7,
      baseValue: 15,      // +15 max temperature per level
      maxLevel: 30,
      label: "Heat Sink",
      icon: "❄️",
      description: "Макс. температура",
    },
  },

} as const;

/* ── Reactor Levels ──────────────────────────────────
   Smooth geometric curve up to LVL 60 so the player can
   climb through all six Reactor Tiers (every 10 levels).
   threshold[0] = 0; threshold[n] = floor(50 · 1.35^n).
   ─────────────────────────────────────────────────── */
export const REACTOR_LEVEL_THRESHOLDS: number[] = (() => {
  const t = [0];
  for (let n = 1; n <= 60; n++) t.push(Math.floor(50 * Math.pow(1.35, n)));
  return t;
})();

export const REACTOR_MAX_LEVEL = REACTOR_LEVEL_THRESHOLDS.length - 1;

/** Compute upgrade cost for a given level. */
export function getUpgradeCost(
  upgradeKey: keyof typeof REACTOR_BALANCE.UPGRADES,
  currentLevel: number,
): number {
  const cfg = REACTOR_BALANCE.UPGRADES[upgradeKey];
  return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, currentLevel));
}

/** Compute upgrade value for a given level. */
export function getUpgradeValue(
  upgradeKey: keyof typeof REACTOR_BALANCE.UPGRADES,
  currentLevel: number,
): number {
  const cfg = REACTOR_BALANCE.UPGRADES[upgradeKey];
  return cfg.baseValue * currentLevel;
}

/** Derive reactor level from total HEX mined (lifetime). */
export function getReactorLevel(totalHexMined: number): number {
  const t = REACTOR_LEVEL_THRESHOLDS;
  for (let i = t.length - 1; i >= 0; i--) {
    if (totalHexMined >= t[i]) return i;
  }
  return 0;
}

export type UpgradeKey = keyof typeof REACTOR_BALANCE.UPGRADES;

/* ═══════════════════════════════════════════════════════
   REACTOR TIERS — the evolution backbone.
   One tier every 10 levels. Each tier is a DISTINCT visual
   identity: form/armor, orbit drones, sector background and
   ambient effect, so the jump between tiers is unmistakable.

     id 0  MK-I   Core         LVL 0–9
     id 1  MK-II  Refinery     LVL 10–19
     id 2  MK-III Quantum      LVL 20–29
     id 3  MK-IV  Singularity  LVL 30–39
     id 4  MK-V   Hyperion     LVL 40–49
     id 5  MK-VI  Godcore      LVL 50+

   accent / accent2 are "r,g,b" strings used in CSS vars.
   ═══════════════════════════════════════════════════════ */
export type ArmorStyle =
  | "plates" | "refinery" | "crown" | "singularity" | "hyperion" | "godcore";
export type TierEffect =
  | "spark" | "coolant" | "quantum" | "vortex" | "solar" | "divine";
export type TierDrone = { icon: string; tag: string };

export type ReactorTier = {
  id: number;
  mk: string;          // "MK-IV"
  name: string;        // "Singularity"
  fullName: string;    // "MK-IV Singularity"
  minLevel: number;    // first level of this tier
  accent: string;      // primary "r,g,b"  → --tc
  accent2: string;     // secondary "r,g,b" → --tc2
  sectorName: string;  // sector label in HUD
  armor: ArmorStyle;   // reactor form / armor stack
  orbits: number;      // number of orbiting drones
  drones: TierDrone[]; // drone roster shown in orbit
  effect: TierEffect;  // ambient effect layer
};

export const REACTOR_TIERS: ReactorTier[] = [
  {
    id: 0, mk: "MK-I", name: "Core", fullName: "MK-I Core", minLevel: 0,
    accent: "0,240,255", accent2: "60,180,255", sectorName: "Quantum Core Zone",
    armor: "plates", orbits: 1, effect: "spark",
    drones: [{ icon: "🛰", tag: "SCOUT" }],
  },
  {
    id: 1, mk: "MK-II", name: "Refinery", fullName: "MK-II Refinery", minLevel: 10,
    accent: "0,230,170", accent2: "90,255,205", sectorName: "Cryo Refinery",
    armor: "refinery", orbits: 2, effect: "coolant",
    drones: [{ icon: "🛰", tag: "SCOUT" }, { icon: "⚙", tag: "REFINE" }],
  },
  {
    id: 2, mk: "MK-III", name: "Quantum", fullName: "MK-III Quantum", minLevel: 20,
    accent: "170,95,255", accent2: "225,135,255", sectorName: "Quantum Void",
    armor: "crown", orbits: 3, effect: "quantum",
    drones: [{ icon: "🛰", tag: "SCOUT" }, { icon: "⚙", tag: "REFINE" }, { icon: "🔮", tag: "QBIT" }],
  },
  {
    id: 3, mk: "MK-IV", name: "Singularity", fullName: "MK-IV Singularity", minLevel: 30,
    accent: "255,70,135", accent2: "255,150,90", sectorName: "Singularity Rift",
    armor: "singularity", orbits: 3, effect: "vortex",
    drones: [{ icon: "🔮", tag: "QBIT" }, { icon: "🛡", tag: "WARD" }, { icon: "⚛", tag: "FORGE" }],
  },
  {
    id: 4, mk: "MK-V", name: "Hyperion", fullName: "MK-V Hyperion", minLevel: 40,
    accent: "255,200,70", accent2: "255,140,40", sectorName: "Hyperion Nexus",
    armor: "hyperion", orbits: 4, effect: "solar",
    drones: [{ icon: "🛡", tag: "WARD" }, { icon: "⚛", tag: "FORGE" }, { icon: "☄", tag: "PRIME" }, { icon: "🔱", tag: "OMEGA" }],
  },
  {
    id: 5, mk: "MK-VI", name: "Godcore", fullName: "MK-VI Godcore", minLevel: 50,
    accent: "150,255,180", accent2: "255,255,255", sectorName: "Godcore Ascension",
    armor: "godcore", orbits: 5, effect: "divine",
    drones: [
      { icon: "⚛", tag: "FORGE" }, { icon: "☄", tag: "PRIME" }, { icon: "🔱", tag: "OMEGA" },
      { icon: "👁", tag: "ORACLE" }, { icon: "✦", tag: "GOD" },
    ],
  },
];

/** Tier derived from reactor level (one tier per 10 levels, capped at MK-VI). */
export function getReactorTier(reactorLevel: number): ReactorTier {
  const idx = Math.min(REACTOR_TIERS.length - 1, Math.max(0, Math.floor(reactorLevel / 10)));
  return REACTOR_TIERS[idx];
}

/** Progress within the current tier: { inTier, span, ratio, nextTier }. */
export function getTierProgress(reactorLevel: number): {
  inTier: number; span: number; ratio: number; nextTier: ReactorTier | null;
} {
  const tier = getReactorTier(reactorLevel);
  const last = REACTOR_TIERS[REACTOR_TIERS.length - 1];
  if (tier.id === last.id) {
    return { inTier: reactorLevel - tier.minLevel, span: 10, ratio: 1, nextTier: null };
  }
  const next = REACTOR_TIERS[tier.id + 1];
  const span = next.minLevel - tier.minLevel;
  const inTier = reactorLevel - tier.minLevel;
  return { inTier, span, ratio: Math.min(1, inTier / span), nextTier: next };
}

/* ═══════════════════════════════════════════════════════
   LUCK TIERS — multi-tier critical tap system
   Weighted random pick determines multiplier and label.
   ═══════════════════════════════════════════════════════ */
export type LuckTier = {
  name: string;
  label: string;     // short label for floating text
  weight: number;    // relative probability weight
  multiplier: number;
  cssClass: string;  // CSS class for visual feedback
  vibratePattern: number[];
};

export const LUCK_TIERS: LuckTier[] = [
  { name: "normal",   label: "",          weight: 60, multiplier: 1,   cssClass: "",                vibratePattern: [15] },
  { name: "critical", label: "CRIT",      weight: 25, multiplier: 5,   cssClass: "mr-float-crit",    vibratePattern: [30, 20, 50] },
  { name: "mega",     label: "MEGA CRIT", weight: 10, multiplier: 10,  cssClass: "mr-float-mega",    vibratePattern: [40, 15, 60, 15, 40] },
  { name: "ultra",    label: "ULTRA",     weight: 4,  multiplier: 25,  cssClass: "mr-float-ultra",   vibratePattern: [50, 10, 80, 10, 50, 10, 80] },
  { name: "quantum",  label: "QUANTUM",   weight: 1,  multiplier: 100, cssClass: "mr-float-quantum", vibratePattern: [80, 10, 80, 10, 80, 10, 80, 10, 80] },
];

export const LUCK_TIER_TOTAL_WEIGHT = LUCK_TIERS.reduce((s, t) => s + t.weight, 0);

/* ═══════════════════════════════════════════════════════
   HEAT STATE — drives the State Ring around the reactor
   ═══════════════════════════════════════════════════════ */
export type HeatState = "stable" | "highload" | "critical" | "overheat";

export function getHeatState(tempPercent: number, isOverheated: boolean): HeatState {
  if (isOverheated) return "overheat";
  if (tempPercent >= 80) return "critical";
  if (tempPercent >= 55) return "highload";
  return "stable";
}

export const HEAT_STATE_LABELS: Record<HeatState, string> = {
  stable: "● STABLE",
  highload: "◆ HIGH LOAD",
  critical: "▲ CRITICAL",
  overheat: "✖ OVERHEAT",
};
