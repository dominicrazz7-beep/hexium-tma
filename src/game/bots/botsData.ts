/* ═══════════════════════════════════════════════════════
   HEX-BOTS — Evolution roster v2
   6 memorable bot classes × 5 star stages. The old 36-clone style is gone:
   every class now has a clear role, visual identity and progression line.
   ═══════════════════════════════════════════════════════ */

export type BotRarity = "common" | "rare" | "epic" | "legendary";
export type BotClass = "coder" | "drone" | "cooler" | "scout" | "power_core" | "data_hunter" | "sentinel" | "harvester" | "striker";
export type BotSpecialty = "automation" | "expedition" | "cooling" | "critical" | "reactor" | "research";

export type BotStageDef = {
  stars: 1 | 2 | 3 | 4 | 5;
  name: string;
  rarity: BotRarity;
  icon: string;
};

/** Static definition of a bot evolution line. */
export type BotDef = {
  id: BotClass;
  name: string;
  image?: string;
  role: string;
  specialty: BotSpecialty;
  bonusLabel: string;
  baseRate: number;       // HEX/sec at 1★ level 1
  startsOwned: boolean;
  startLevel: number;
  startActive: boolean;
  unlockFragments: number;
  stages: BotStageDef[];
};

/** Per-bot mutable state persisted locally. */
export type BotState = {
  owned: boolean;
  active: boolean;
  lvl: number;
  stars: 1 | 2 | 3 | 4 | 5;
  fragments: number;
  copies: number;
};

/** Whole fleet keyed by class id + last-seen timestamp for offline accrual. */
export type FleetState = {
  bots: Record<string, BotState>;
  lastSeen: number;
};

const stages = (items: [string, BotRarity, string][]): BotStageDef[] =>
  items.map(([name, rarity, icon], i) => ({ stars: (i + 1) as 1 | 2 | 3 | 4 | 5, name, rarity, icon }));

/* ═══ TEMP DEV FLAG ═══ Set to false before release. ═══ */
export const DEV_UNLOCK_ALL_BOTS = true;

export const BOT_ROSTER: BotDef[] = [
  {
    id: "coder",
    name: "CODER",
    image: "/bots/gpu-coder.png",
    role: "Automation Unit",
    specialty: "automation",
    bonusLabel: "Offline Income + Automation",
    baseRate: 0.8,
    startsOwned: true,
    startLevel: 1,
    startActive: true,
    unlockFragments: 0,
    stages: stages([
      ["GPU CODER", "common", "🧠"],
      ["QUANTUM CODER", "rare", "🔷"],
      ["VOID PROGRAMMER", "epic", "🟣"],
      ["OMEGA ARCHITECT", "legendary", "🏛️"],
      ["HEXIUM PRIME", "legendary", "👑"],
    ]),
  },
  {
    id: "drone",
    name: "DRONE",
    image: "/bots/hash-drone.png",
    role: "Resource Harvester",
    specialty: "expedition",
    bonusLabel: "Expedition Speed + Loot",
    baseRate: 1.1,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 60,
    stages: stages([
      ["HASH DRONE", "common", "🛸"],
      ["CRYPTO DRONE", "rare", "🛰️"],
      ["HEX SHADOW DRONE", "epic", "🌘"],
      ["NEXUS DRONE", "legendary", "💫"],
      ["VOID EMPEROR", "legendary", "🕳️"],
    ]),
  },
  {
    id: "cooler",
    name: "COOLER",
    image: "/bots/cooler-bot.png",
    role: "Thermal Control",
    specialty: "cooling",
    bonusLabel: "Heat Reduction + Overclock Time",
    baseRate: 0.9,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 60,
    stages: stages([
      ["COOLER BOT", "common", "❄️"],
      ["FROST CORE", "rare", "🧊"],
      ["PLASMA COOLER", "epic", "🔥"],
      ["TITAN COOLER", "legendary", "🛡️"],
      ["OMEGA OVERSEER", "legendary", "👁️"],
    ]),
  },
  {
    id: "scout",
    name: "SCOUT",
    image: "/bots/hex-scout.png",
    role: "Signal Hunter",
    specialty: "critical",
    bonusLabel: "Critical Chance + Rare Loot",
    baseRate: 1.0,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 70,
    stages: stages([
      ["HEX SCOUT", "common", "🔎"],
      ["NET RUNNER", "rare", "🏃"],
      ["GHOST SCOUT", "epic", "👻"],
      ["QUANTUM RANGER", "legendary", "🏹"],
      ["QUANTUM TITAN", "legendary", "⚔️"],
    ]),
  },
  {
    id: "power_core",
    name: "POWER CORE",
    role: "Reactor Amplifier",
    specialty: "reactor",
    bonusLabel: "HEX/sec + Reactor Output",
    baseRate: 1.4,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 80,
    stages: stages([
      ["POWER UNIT", "common", "🔋"],
      ["FUSION UNIT", "rare", "⚛️"],
      ["REACTOR MASTER", "epic", "⚡"],
      ["STARFORGE CORE", "legendary", "🌟"],
      ["NEXUS SUPREME", "legendary", "💎"],
    ]),
  },
  {
    id: "data_hunter",
    name: "DATA HUNTER",
    role: "Research Extractor",
    specialty: "research",
    bonusLabel: "Research + Blueprints",
    baseRate: 1.2,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 80,
    stages: stages([
      ["DATA HUNTER", "common", "📡"],
      ["DATA SEEKER", "rare", "🧬"],
      ["MATRIX HUNTER", "epic", "🕸️"],
      ["OMNIDATA LORD", "legendary", "📚"],
      ["THE CORE MAKER", "legendary", "🔮"],
    ]),
  },
  /* ── Release 1: Sentinel (Defense) ──────────────────── */
  {
    id: "sentinel",
    name: "SENTINEL",
    role: "Defense Unit",
    specialty: "cooling",
    bonusLabel: "Heat Management + Defense",
    baseRate: 0.9,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 80,
    stages: stages([
      ["SCOUT SENTINEL", "common", "🛡"],
      ["GUARD SENTINEL", "common", "🛡"],
      ["SHIELD SENTINEL", "rare", "🛡"],
      ["FORTRESS SENTINEL", "epic", "🏰"],
      ["OMEGA SENTINEL", "legendary", "🏛"],
    ]),
  },
  /* ── Release 2: Harvester (Expedition) ──────────────── */
  {
    id: "harvester",
    name: "HARVESTER",
    role: "Expedition Specialist",
    specialty: "expedition",
    bonusLabel: "Expedition Speed + Research",
    baseRate: 1.0,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 80,
    stages: stages([
      ["SCOUT HARVESTER", "common", "🌾"],
      ["GATHERER HARVESTER", "common", "🌾"],
      ["COLLECTOR HARVESTER", "rare", "🌾"],
      ["REAPER HARVESTER", "epic", "🌾"],
      ["OMEGA HARVESTER", "legendary", "🌾"],
    ]),
  },
  /* ── Release 3: Striker (Combat) ────────────────────── */
  {
    id: "striker",
    name: "STRIKER",
    role: "Combat Specialist",
    specialty: "critical",
    bonusLabel: "Boss Damage + Combat",
    baseRate: 1.1,
    startsOwned: false,
    startLevel: 1,
    startActive: false,
    unlockFragments: 80,
    stages: stages([
      ["SCOUT STRIKER", "common", "⚔️"],
      ["FIGHTER STRIKER", "common", "⚔️"],
      ["WARRIOR STRIKER", "rare", "⚔️"],
      ["CHAMPION STRIKER", "epic", "⚔️"],
      ["OMEGA STRIKER", "legendary", "⚔️"],
    ]),
  },
];

export const BOT_BY_ID: Record<string, BotDef> = Object.fromEntries(BOT_ROSTER.map((b) => [b.id, b]));

export function getBotStage(def: BotDef, stars: number): BotStageDef {
  return def.stages[Math.max(0, Math.min(4, Math.floor(stars || 1) - 1))];
}

export function initialFleet(): FleetState {
  const bots: Record<string, BotState> = {};
  for (const b of BOT_ROSTER) {
    bots[b.id] = {
      owned: DEV_UNLOCK_ALL_BOTS || b.startsOwned,
      active: DEV_UNLOCK_ALL_BOTS || b.startActive,
      lvl: DEV_UNLOCK_ALL_BOTS ? 3 : b.startLevel,
      stars: DEV_UNLOCK_ALL_BOTS ? 2 : 1,
      fragments: 0,
      copies: 0,
    };
  }
  return { bots, lastSeen: Date.now() };
}
