/* ═══════════════════════════════════════════════════════
   BLACK MARKET — data, item catalog, types
   6-hour rotating shop with limited deals.
   ═══════════════════════════════════════════════════════ */
import { STOCK_LIMITS, LIMIT_POOL_WEIGHT } from "./blackMarketBalance";

export type BmCurrency = "hex" | "shards";
export type BmCategory = "fragments" | "cases" | "modules" | "data";
export type BmRarity = "common" | "rare" | "epic" | "legendary";

export type BmItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  currency: BmCurrency;
  rarity: BmRarity;
  category: BmCategory;
  baseStock: number;
  isLimited?: boolean;
  originalPrice?: number;
  weight: number;
  grant: BmGrant;
};

export type BmGrant =
  | { type: "hex"; amount: number }
  | { type: "shards"; amount: number }
  | { type: "case"; caseType: "basic" | "advanced" | "premium" | "exotic" | "quantum"; amount: number }
  | { type: "bot_fragment"; botId: string; amount: number }
  | { type: "research_points"; amount: number }
  | { type: "premium"; amount: number };

const RARITY_STOCK: Record<BmRarity, number> = {
  common: STOCK_LIMITS.common,
  rare: STOCK_LIMITS.rare,
  epic: STOCK_LIMITS.epic,
  legendary: STOCK_LIMITS.legendary,
};

const POOL: BmItem[] = [
  {
    id: "frag_pack_common",
    name: "Fragment Pack",
    icon: "🧩",
    description: "5x Random Bot Fragments",
    price: 2000,
    currency: "hex",
    rarity: "common",
    category: "fragments",
    baseStock: 5,
    weight: 30,
    grant: { type: "bot_fragment", botId: "random", amount: 5 },
  },
  {
    id: "frag_pack_rare",
    name: "Rare Fragment Cache",
    icon: "🧩",
    description: "10x Random Bot Fragments",
    price: 8000,
    currency: "hex",
    rarity: "rare",
    category: "fragments",
    baseStock: 3,
    weight: 20,
    grant: { type: "bot_fragment", botId: "random", amount: 10 },
  },
  {
    id: "frag_legendary",
    name: "Legendary Fragment",
    icon: "💎",
    description: "1x Legendary-class Bot Fragment",
    price: 5000,
    currency: "hex",
    rarity: "legendary",
    category: "fragments",
    baseStock: 1,
    weight: LIMIT_POOL_WEIGHT,
    isLimited: true,
    originalPrice: 10000,
    grant: { type: "bot_fragment", botId: "legendary", amount: 1 },
  },
  {
    id: "case_basic",
    name: "Common Crate",
    icon: "📦",
    description: "Standard loot crate",
    price: 3000,
    currency: "hex",
    rarity: "common",
    category: "cases",
    baseStock: 4,
    weight: 25,
    grant: { type: "case", caseType: "basic", amount: 1 },
  },
  {
    id: "case_advanced",
    name: "Advanced Case",
    icon: "🎁",
    description: "Guaranteed Rare+ item",
    price: 5000,
    currency: "hex",
    rarity: "rare",
    category: "cases",
    baseStock: 3,
    weight: 18,
    grant: { type: "case", caseType: "advanced", amount: 1 },
  },
  {
    id: "case_premium",
    name: "Premium Case",
    icon: "👑",
    description: "Epic+ guaranteed drop",
    price: 40,
    currency: "shards",
    rarity: "epic",
    category: "cases",
    baseStock: 2,
    weight: 10,
    grant: { type: "case", caseType: "premium", amount: 1 },
  },
  {
    id: "case_quantum",
    name: "Quantum Crate",
    icon: "🔮",
    description: "Quantum-tier loot",
    price: 120,
    currency: "shards",
    rarity: "legendary",
    category: "cases",
    baseStock: 1,
    weight: LIMIT_POOL_WEIGHT,
    isLimited: true,
    originalPrice: 200,
    grant: { type: "case", caseType: "quantum", amount: 1 },
  },
  {
    id: "module_cooling",
    name: "Cooling Matrix",
    icon: "❄️",
    description: "Common Reactor Module",
    price: 1500,
    currency: "hex",
    rarity: "common",
    category: "modules",
    baseStock: 3,
    weight: 22,
    grant: { type: "premium", amount: 2 },
  },
  {
    id: "module_overclock",
    name: "Overclock Chip",
    icon: "⚙️",
    description: "Advanced Reactor Module",
    price: 7500,
    currency: "hex",
    rarity: "rare",
    category: "modules",
    baseStock: 2,
    weight: 15,
    grant: { type: "premium", amount: 5 },
  },
  {
    id: "module_flux",
    name: "Flux Capacitor",
    icon: "⚡",
    description: "Epic Reactor Module",
    price: 35,
    currency: "shards",
    rarity: "epic",
    category: "modules",
    baseStock: 2,
    weight: 8,
    grant: { type: "premium", amount: 10 },
  },
  {
    id: "data_basic",
    name: "Research Data",
    icon: "📊",
    description: "100 Research Points",
    price: 25,
    currency: "shards",
    rarity: "rare",
    category: "data",
    baseStock: 3,
    weight: 20,
    grant: { type: "research_points", amount: 100 },
  },
  {
    id: "data_advanced",
    name: "Encrypted Research",
    icon: "🔬",
    description: "500 Research Points",
    price: 80,
    currency: "shards",
    rarity: "epic",
    category: "data",
    baseStock: 2,
    weight: 12,
    grant: { type: "research_points", amount: 500 },
  },
  {
    id: "data_hex_pack",
    name: "HEX Data Shard",
    icon: "💰",
    description: "5,000 HEX instantly",
    price: 20,
    currency: "shards",
    rarity: "common",
    category: "data",
    baseStock: 4,
    weight: 18,
    grant: { type: "hex", amount: 5000 },
  },
  {
    id: "data_shard_pack",
    name: "Shard Fragment",
    icon: "🔷",
    description: "15 SHARDS instantly",
    price: 25000,
    currency: "hex",
    rarity: "rare",
    category: "data",
    baseStock: 2,
    weight: 14,
    grant: { type: "shards", amount: 15 },
  },
];

export { POOL };

/* ── Seeded pseudo-random (mulberry32) ── */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function currentWindowSeed(now: number, intervalMs: number): number {
  return Math.floor(now / intervalMs);
}

export function generateMarketSelection(seed: number): BmItem[] {
  const rng = mulberry32(seed);
  const totalWeight = POOL.reduce((s, i) => s + i.weight, 0);
  const pickCount = Math.min(8, POOL.length);
  const picked: BmItem[] = [];
  const used = new Set<string>();

  while (picked.length < pickCount) {
    let r = rng() * totalWeight;
    for (const item of POOL) {
      if (used.has(item.id)) continue;
      r -= item.weight;
      if (r <= 0) {
        used.add(item.id);
        const stock = Math.max(1, Math.floor(item.baseStock * (0.5 + rng() * 0.5)));
        picked.push({
          ...item,
          baseStock: item.isLimited ? RARITY_STOCK[item.rarity] : stock,
        });
        break;
      }
    }
  }

  picked.sort((a, b) => {
    if (a.isLimited && !b.isLimited) return -1;
    if (!a.isLimited && b.isLimited) return 1;
    const ro: Record<BmRarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return ro[a.rarity] - ro[b.rarity];
  });

  return picked;
}

export const RARITY_COLORS: Record<BmRarity, string> = {
  common: "#8ea7c7",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export const CATEGORY_DEFS: { id: BmCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "ALL", icon: "📦" },
  { id: "fragments", label: "FRAGMENTS", icon: "🧩" },
  { id: "cases", label: "CASES", icon: "🎁" },
  { id: "modules", label: "MODULES", icon: "⚙️" },
  { id: "data", label: "DATA", icon: "📊" },
];
