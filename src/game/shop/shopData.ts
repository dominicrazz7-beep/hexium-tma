/* ═══════════════════════════════════════════════════════
   SHOP — data, item catalog, persisted state shape
   v7 "Black Market" integrated into the real HEXIUM project.
   ═══════════════════════════════════════════════════════ */

export type Rarity = "common" | "rare" | "epic" | "legendary" | "quantum";
export type ShopCurrency = "hex" | "shards";
export type ShopCategory =
  | "booster"
  | "hex_pack"
  | "shard_pack"
  | "utility"
  | "cosmetic";

export type ShopItem = {
  id: string;
  category: ShopCategory;
  name: string;
  sub: string;
  icon: string;
  rarity: Rarity;
  cost: number;
  costCurrency: ShopCurrency;
  tag?: string;
  grantCurrency?: ShopCurrency;
  grantAmount?: number;
  boosterMs?: number;
  boosterMult?: number;
  effect?: "reset_heat" | "restore_energy";
  cosmetic?: boolean;
  hidden?: boolean;
};

/* ── Catalog ── */
export const SHOP_ITEMS: ShopItem[] = [
  /* Boosters */
  { id: "boost_mini_2x", category: "booster", name: "Mini 2× Mining", sub: "Double output · 10 min", icon: "⚡", rarity: "common", cost: 2_500, costCurrency: "hex", boosterMs: 10 * 60 * 1000, boosterMult: 2, tag: "HEX" },
  { id: "boost_mining_2x", category: "booster", name: "2× Mining Boost", sub: "Double output · 20 min", icon: "⚡", rarity: "rare", cost: 25, costCurrency: "shards", boosterMs: 20 * 60 * 1000, boosterMult: 2 },
  { id: "boost_turbo_3x", category: "booster", name: "3× Turbo Surge", sub: "Triple output · 10 min", icon: "🚀", rarity: "epic", cost: 55, costCurrency: "shards", boosterMs: 10 * 60 * 1000, boosterMult: 3, tag: "HOT" },
  { id: "boost_autoclaim", category: "booster", name: "Auto-Claim Module", sub: "Idle ×2 · 2 hours", icon: "🛰", rarity: "rare", cost: 70, costCurrency: "shards", boosterMs: 2 * 60 * 60 * 1000, boosterMult: 2 },
  { id: "boost_overclock", category: "booster", name: "Overclock Core", sub: "+50% output · 30 min", icon: "🔧", rarity: "rare", cost: 7_500, costCurrency: "hex", boosterMs: 30 * 60 * 1000, boosterMult: 1.5, tag: "HEX" },
  { id: "boost_ad_mining_2x", category: "booster", name: "Ad 2× Mining", sub: "Ad reward · 15 min", icon: "📺", rarity: "rare", cost: 0, costCurrency: "hex", boosterMs: 15 * 60 * 1000, boosterMult: 2, hidden: true },

  /* HEX packs */
  { id: "pack_hex_vault", category: "hex_pack", name: "HEX Vault", sub: "5,000 HEX · instant", icon: "💎", rarity: "rare", cost: 20, costCurrency: "shards", grantCurrency: "hex", grantAmount: 5_000 },
  { id: "pack_hex_mega", category: "hex_pack", name: "Mega HEX Crate", sub: "25,000 HEX · instant", icon: "🧊", rarity: "epic", cost: 85, costCurrency: "shards", grantCurrency: "hex", grantAmount: 25_000, tag: "POPULAR" },
  { id: "pack_hex_hyper", category: "hex_pack", name: "Hyper HEX Reserve", sub: "120,000 HEX · instant", icon: "🌟", rarity: "legendary", cost: 320, costCurrency: "shards", grantCurrency: "hex", grantAmount: 120_000 },

  /* SHARD packs */
  { id: "pack_shard_pouch", category: "shard_pack", name: "Shard Pouch", sub: "10 ◈ · instant", icon: "🔹", rarity: "common", cost: 50_000, costCurrency: "hex", grantCurrency: "shards", grantAmount: 10 },
  { id: "pack_shard_cache", category: "shard_pack", name: "Shard Cache", sub: "45 ◈ · instant", icon: "🔷", rarity: "rare", cost: 250_000, costCurrency: "hex", grantCurrency: "shards", grantAmount: 45, tag: "GRIND" },
  { id: "pack_shard_vault", category: "shard_pack", name: "Shard Vault", sub: "160 ◈ · instant", icon: "💠", rarity: "epic", cost: 1_000_000, costCurrency: "hex", grantCurrency: "shards", grantAmount: 160 },

  /* Utilities */
  { id: "util_energy_hex", category: "utility", name: "Energy Refill", sub: "Restore reactor energy", icon: "🔋", rarity: "common", cost: 1_200, costCurrency: "hex", effect: "restore_energy", tag: "HEX" },
  { id: "util_cooldown_hex", category: "utility", name: "Quick Cooldown", sub: "Reset reactor heat", icon: "♻️", rarity: "common", cost: 1_800, costCurrency: "hex", effect: "reset_heat", tag: "HEX" },
  { id: "util_cooldown", category: "utility", name: "Instant Cooldown+", sub: "Reset heat · premium", icon: "♻️", rarity: "rare", cost: 15, costCurrency: "shards", effect: "reset_heat" },
  { id: "util_energy", category: "utility", name: "Energy Refill+", sub: "Restore energy · premium", icon: "🔋", rarity: "rare", cost: 12, costCurrency: "shards", effect: "restore_energy" },
  { id: "util_coolant", category: "utility", name: "Coolant Flush", sub: "Clear heat + refill energy", icon: "🧯", rarity: "rare", cost: 25, costCurrency: "shards", effect: "reset_heat" },

  /* Skins */
  { id: "skin_neon", category: "cosmetic", name: "Neon Reactor Skin", sub: "Cosmetic · permanent", icon: "🎨", rarity: "legendary", cost: 1200, costCurrency: "shards", cosmetic: true, tag: "NEW" },
  { id: "skin_plasma", category: "cosmetic", name: "Plasma Hull Skin", sub: "Cosmetic · permanent", icon: "🟣", rarity: "epic", cost: 900, costCurrency: "shards", cosmetic: true },
  { id: "skin_quantum", category: "cosmetic", name: "Quantum Aura Skin", sub: "Cosmetic · permanent", icon: "🔮", rarity: "quantum", cost: 2000, costCurrency: "shards", cosmetic: true },
];

export const ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((i) => [i.id, i]),
);

export const CATEGORY_SECTIONS: { id: ShopCategory; label: string }[] = [
  { id: "booster", label: "⬢ Boosters" },
  { id: "hex_pack", label: "⬢ HEX Packs" },
  { id: "shard_pack", label: "⬢ Shard Packs" },
  { id: "utility", label: "⬢ Energy & Cooldown" },
  { id: "cosmetic", label: "⬢ Skins & Cosmetics" },
];

/* ── Persisted local state ── */
export type ActiveBooster = { id: string; expiresAt: number };
export type PurchaseRecord = {
  uid: number;
  itemId: string;
  name: string;
  icon: string;
  cost: number;
  costCurrency: ShopCurrency;
  at: number;
};

export type ShopState = {
  ownedSkins: string[];
  equippedSkin: string | null;
  boosters: ActiveBooster[];
  history: PurchaseRecord[];
  purchaseSeq: number;
};

export function initialShopState(): ShopState {
  return {
    ownedSkins: [],
    equippedSkin: null,
    boosters: [],
    history: [],
    purchaseSeq: 0,
  };
}
