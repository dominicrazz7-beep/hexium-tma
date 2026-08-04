/* ═══════════════════════════════════════════════════════
   CASES — data layer (catalog, reward pools, state shape).
   v7 "Supply Drops" integrated into the real project.
   Rewards can grant HEX, SHARDS, bot fragments, boosters, skins.
   Pure data only — no React, no side effects.
   ═══════════════════════════════════════════════════════ */

export type Rarity = "common" | "rare" | "epic" | "legendary" | "quantum";

/** A single odds row on a crate: which rarity tier and its weight (%). */
export type Odd = { rarity: Rarity; pct: number };

/** A crate definition. Early crates can be bought for HEX; premium crates use SHARDS. */
export type CaseDef = {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity; // accent / shelf tier
  price: number;
  priceCurrency: "hex" | "shards";
  blurb: string;
  odds: Odd[];
};

/** What a single reward can be. */
export type RewardKind = "hex" | "shards" | "booster" | "skin" | "bot_fragment" | "bot_copy";

export type RewardDef = {
  kind: RewardKind;
  label: string;
  icon: string;
  rarity: Rarity;
  amount?: number; // hex / shards amount
  refId?: string; // booster/skin id (shop) or bot class id (bots evolution roster)
  boosterMs?: number; // booster duration if kind==="booster"
  weight: number; // pick weight within its tier pool
  dupeShards?: number; // fallback ◈ if skin already owned
};

/* ── Crates (5 tiers, 4+ required) ── */
export const CASE_DEFS: CaseDef[] = [
  {
    id: "common",
    name: "Common Crate",
    icon: "📦",
    rarity: "common",
    price: 2_500,
    priceCurrency: "hex",
    blurb: "Entry-level supply drop",
    odds: [
      { rarity: "common", pct: 70 },
      { rarity: "rare", pct: 25 },
      { rarity: "epic", pct: 5 },
    ],
  },
  {
    id: "rare",
    name: "Rare Crate",
    icon: "🎁",
    rarity: "rare",
    price: 10_000,
    priceCurrency: "hex",
    blurb: "Better odds, better loot",
    odds: [
      { rarity: "rare", pct: 60 },
      { rarity: "epic", pct: 32 },
      { rarity: "legendary", pct: 8 },
    ],
  },
  {
    id: "epic",
    name: "Epic Crate",
    icon: "💼",
    rarity: "epic",
    price: 180,
    priceCurrency: "shards",
    blurb: "High-grade gear & boosters",
    odds: [
      { rarity: "epic", pct: 65 },
      { rarity: "legendary", pct: 30 },
      { rarity: "quantum", pct: 5 },
    ],
  },
  {
    id: "legendary",
    name: "Legendary Cache",
    icon: "🏆",
    rarity: "legendary",
    price: 420,
    priceCurrency: "shards",
    blurb: "Bot unlocks & rare skins",
    odds: [
      { rarity: "epic", pct: 40 },
      { rarity: "legendary", pct: 50 },
      { rarity: "quantum", pct: 10 },
    ],
  },
  {
    id: "quantum",
    name: "Quantum Vault",
    icon: "🔮",
    rarity: "quantum",
    price: 900,
    priceCurrency: "shards",
    blurb: "The rarest drops in HEXIUM",
    odds: [
      { rarity: "legendary", pct: 70 },
      { rarity: "quantum", pct: 30 },
    ],
  },
];

export const CASE_BY_ID: Record<string, CaseDef> = Object.fromEntries(
  CASE_DEFS.map((c) => [c.id, c]),
);

/** The crate shown in the featured hero. */
export const FEATURED_CASE_ID = "quantum";

/* ── Reward pools, keyed by the won rarity tier ──
   refId for boosters/skins matches shop item ids; bot refId matches BOT_ROSTER ids. */
export const REWARD_POOLS: Record<Rarity, RewardDef[]> = {
  common: [
    { kind: "hex", label: "300 HEX", icon: "💰", rarity: "common", amount: 300, weight: 5 },
    { kind: "hex", label: "800 HEX", icon: "💰", rarity: "common", amount: 800, weight: 4 },
    { kind: "shards", label: "2 ◈", icon: "🔹", rarity: "common", amount: 2, weight: 3 },
    { kind: "bot_fragment", label: "10 Coder Fragments", icon: "🧩", rarity: "common", refId: "coder", amount: 10, weight: 4 },
    { kind: "bot_fragment", label: "10 Drone Fragments", icon: "🧩", rarity: "common", refId: "drone", amount: 10, weight: 4 },
  ],
  rare: [
    { kind: "hex", label: "2,000 HEX", icon: "💎", rarity: "rare", amount: 2_000, weight: 5 },
    { kind: "shards", label: "7 ◈", icon: "🔷", rarity: "rare", amount: 7, weight: 4 },
    { kind: "booster", label: "Overclock Core", icon: "🔧", rarity: "rare", refId: "boost_overclock", boosterMs: 30 * 60 * 1000, weight: 2 },
    { kind: "bot_fragment", label: "18 Cooler Fragments", icon: "🧊", rarity: "rare", refId: "cooler", amount: 18, weight: 4 },
    { kind: "bot_fragment", label: "18 Scout Fragments", icon: "🔎", rarity: "rare", refId: "scout", amount: 18, weight: 4 },
  ],
  epic: [
    { kind: "hex", label: "8,000 HEX", icon: "🧊", rarity: "epic", amount: 8_000, weight: 5 },
    { kind: "shards", label: "25 ◈", icon: "💠", rarity: "epic", amount: 25, weight: 4 },
    { kind: "booster", label: "2× Mining Boost", icon: "⚡", rarity: "epic", refId: "boost_mining_2x", boosterMs: 20 * 60 * 1000, weight: 3 },
    { kind: "skin", label: "Plasma Hull Skin", icon: "🟣", rarity: "epic", refId: "skin_plasma", dupeShards: 60, weight: 1 },
    { kind: "bot_fragment", label: "30 Power Core Fragments", icon: "🔋", rarity: "epic", refId: "power_core", amount: 30, weight: 4 },
    { kind: "bot_fragment", label: "30 Data Hunter Fragments", icon: "📡", rarity: "epic", refId: "data_hunter", amount: 30, weight: 4 },
  ],
  legendary: [
    { kind: "hex", label: "35,000 HEX", icon: "🌟", rarity: "legendary", amount: 35_000, weight: 5 },
    { kind: "shards", label: "80 ◈", icon: "💠", rarity: "legendary", amount: 80, weight: 3 },
    { kind: "booster", label: "3× Turbo Surge", icon: "🚀", rarity: "legendary", refId: "boost_turbo_3x", boosterMs: 10 * 60 * 1000, weight: 3 },
    { kind: "bot_copy", label: "Power Core Copy", icon: "⚡", rarity: "legendary", refId: "power_core", amount: 1, weight: 2 },
    { kind: "bot_copy", label: "Coder Copy", icon: "🧠", rarity: "legendary", refId: "coder", amount: 1, weight: 2 },
    { kind: "skin", label: "Neon Reactor Skin", icon: "🎨", rarity: "legendary", refId: "skin_neon", dupeShards: 140, weight: 1 },
  ],
  quantum: [
    { kind: "hex", label: "120,000 HEX", icon: "🌠", rarity: "quantum", amount: 120_000, weight: 4 },
    { kind: "shards", label: "180 ◈", icon: "🔱", rarity: "quantum", amount: 180, weight: 3 },
    { kind: "bot_copy", label: "Data Hunter Copy", icon: "💠", rarity: "quantum", refId: "data_hunter", amount: 1, weight: 2 },
    { kind: "bot_copy", label: "Scout Copy", icon: "🏹", rarity: "quantum", refId: "scout", amount: 1, weight: 2 },
    { kind: "skin", label: "Quantum Aura Skin", icon: "🔮", rarity: "quantum", refId: "skin_quantum", dupeShards: 220, weight: 1 },
  ],
};

/* ── Persisted state ── */
export type CaseHistoryRecord = {
  uid: number;
  caseId: string;
  caseName: string;
  rewardLabel: string;
  rewardIcon: string;
  rewardRarity: Rarity;
  dupe?: boolean;
  at: number;
};

export type CasesState = {
  totalOpened: number;
  history: CaseHistoryRecord[]; // most recent first
};

export function initialCasesState(): CasesState {
  return { totalOpened: 0, history: [] };
}

export const RARITY_NAME: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legend",
  quantum: "Quantum",
};
