// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Product Catalog
// ============================================================
// All purchasable products. Each connects to a game system:
// SHOP, BATTLE PASS, OFFERS, CASES, VIP.
// ============================================================

import type {
  StarsProduct,
  ProductCategory,
  ProductReward,
} from "./starsTypes";
import { isProductExpired } from "./starsData";

// ============================================================
// PRODUCT CATALOG
// ============================================================

const PRODUCTS: StarsProduct[] = [

  // ─────────────── CURRENCY PACKS (→ SHOP) ───────────────

  {
    productId: "pack_starter_100",
    name: "Starter Pack",
    description: "100 Hexium — perfect start",
    category: "currency_pack",
    priceStars: 10,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 100, label: "100 Hexium" },
    ],
    icon: "💎",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 1,
    tags: ["starter", "hexium"],
  },
  {
    productId: "pack_advanced_500",
    name: "Advanced Pack",
    description: "500 Hexium + 10 Quantum Dust",
    category: "currency_pack",
    priceStars: 45,
    originalPriceStars: 55,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 500, label: "500 Hexium" },
      { type: "quantum_resource", resourceId: "quantumDust", amount: 10, label: "10 Quantum Dust" },
    ],
    icon: "💎💎",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 2,
    tags: ["value", "hexium", "quantum"],
  },
  {
    productId: "pack_elite_2000",
    name: "Elite Pack",
    description: "2000 Hexium + 50 Quantum Dust + 5 Void Essence",
    category: "currency_pack",
    priceStars: 150,
    originalPriceStars: 200,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 2000, label: "2000 Hexium" },
      { type: "quantum_resource", resourceId: "quantumDust", amount: 50, label: "50 Quantum Dust" },
      { type: "quantum_resource", resourceId: "voidEssence", amount: 5, label: "5 Void Essence" },
    ],
    icon: "💎💎💎",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 3,
    tags: ["elite", "best_value", "hexium", "quantum", "void"],
  },
  {
    productId: "pack_quantum_dust_25",
    name: "Quantum Dust Bundle",
    description: "25 Quantum Dust",
    category: "currency_pack",
    priceStars: 30,
    rewards: [
      { type: "quantum_resource", resourceId: "quantumDust", amount: 25, label: "25 Quantum Dust" },
    ],
    icon: "✨",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 4,
    tags: ["quantum"],
  },
  {
    productId: "pack_void_essence_10",
    name: "Void Essence Vial",
    description: "10 Void Essence",
    category: "currency_pack",
    priceStars: 75,
    rewards: [
      { type: "quantum_resource", resourceId: "voidEssence", amount: 10, label: "10 Void Essence" },
    ],
    icon: "🌀",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 5,
    tags: ["void", "rare"],
  },

  // ─────────────── PREMIUM BATTLE PASS (→ BATTLE PASS) ───────────────

  {
    productId: "bp_premium_s1",
    name: "Premium Battle Pass — Season 1",
    description: "Unlock premium reward track + 5 tier skips",
    category: "premium_battle_pass",
    priceStars: 200,
    rewards: [
      { type: "battle_pass_premium", resourceId: "season_1", amount: 1, label: "Premium Track" },
      { type: "experience", resourceId: "bp_xp", amount: 500, label: "+5 Tier Skips" },
    ],
    icon: "🎖️",
    available: true,
    oneTimePurchase: true,
    maxPurchases: 1,
    sortOrder: 1,
    tags: ["battle_pass", "season_1", "premium"],
    meta: { season: 1, tierSkips: 5 },
  },
  {
    productId: "bp_premium_plus_s1",
    name: "Premium+ Battle Pass — Season 1",
    description: "Premium track + 25 tier skips + exclusive cosmetic",
    category: "premium_battle_pass",
    priceStars: 400,
    originalPriceStars: 500,
    rewards: [
      { type: "battle_pass_premium", resourceId: "season_1", amount: 1, label: "Premium Track" },
      { type: "experience", resourceId: "bp_xp", amount: 2500, label: "+25 Tier Skips" },
      { type: "cosmetic", resourceId: "skin_quantum_aura", amount: 1, label: "Quantum Aura Skin" },
    ],
    icon: "🎖️⭐",
    available: true,
    oneTimePurchase: true,
    maxPurchases: 1,
    sortOrder: 2,
    tags: ["battle_pass", "season_1", "premium_plus"],
    meta: { season: 1, tierSkips: 25 },
  },
  {
    productId: "bp_tier_skip_10",
    name: "10 Tier Skips",
    description: "Skip 10 Battle Pass tiers instantly",
    category: "premium_battle_pass",
    priceStars: 50,
    rewards: [
      { type: "experience", resourceId: "bp_xp", amount: 1000, label: "+10 Tiers" },
    ],
    icon: "⏩",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 3,
    tags: ["battle_pass", "tier_skip"],
    meta: { tierSkips: 10 },
  },

  // ─────────────── SPECIAL OFFERS (→ OFFERS) ───────────────

  {
    productId: "offer_welcome",
    name: "Welcome Offer",
    description: "300 Hexium + 20 Quantum Dust + Starter Skin — 70% OFF!",
    category: "special_offer",
    priceStars: 30,
    originalPriceStars: 100,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 300, label: "300 Hexium" },
      { type: "quantum_resource", resourceId: "quantumDust", amount: 20, label: "20 Quantum Dust" },
      { type: "cosmetic", resourceId: "skin_starter_glow", amount: 1, label: "Starter Glow Skin" },
    ],
    icon: "🎁",
    available: true,
    oneTimePurchase: true,
    maxPurchases: 1,
    sortOrder: 1,
    tags: ["welcome", "best_deal", "limited"],
    requiredLevel: 1,
  },
  {
    productId: "offer_weekend_blast",
    name: "Weekend Blast",
    description: "1000 Hexium + 2h Double XP Booster",
    category: "special_offer",
    priceStars: 60,
    originalPriceStars: 90,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 1000, label: "1000 Hexium" },
      { type: "booster", resourceId: "double_xp", amount: 7200, label: "2h Double XP" },
    ],
    icon: "🔥",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 3,
    sortOrder: 2,
    tags: ["weekend", "booster"],
  },
  {
    productId: "offer_mega_value",
    name: "Mega Value Pack",
    description: "5000 Hexium + 100 QD + 20 VE + 3 Case Keys",
    category: "special_offer",
    priceStars: 350,
    originalPriceStars: 600,
    rewards: [
      { type: "currency", resourceId: "hexium", amount: 5000, label: "5000 Hexium" },
      { type: "quantum_resource", resourceId: "quantumDust", amount: 100, label: "100 Quantum Dust" },
      { type: "quantum_resource", resourceId: "voidEssence", amount: 20, label: "20 Void Essence" },
      { type: "case_key", resourceId: "premium_key", amount: 3, label: "3 Premium Keys" },
    ],
    icon: "💰🔥",
    available: true,
    oneTimePurchase: true,
    maxPurchases: 1,
    sortOrder: 3,
    tags: ["mega", "best_value"],
    requiredLevel: 10,
  },

  // ─────────────── CASE BUNDLES (→ CASES) ───────────────

  {
    productId: "case_key_3",
    name: "3 Case Keys",
    description: "Open 3 cases of any tier",
    category: "case_bundle",
    priceStars: 25,
    rewards: [
      { type: "case_key", resourceId: "standard_key", amount: 3, label: "3 Standard Keys" },
    ],
    icon: "🔑",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 1,
    tags: ["case", "key"],
  },
  {
    productId: "case_key_10",
    name: "10 Case Keys + 1 Premium",
    description: "10 standard keys + 1 premium key",
    category: "case_bundle",
    priceStars: 70,
    originalPriceStars: 95,
    rewards: [
      { type: "case_key", resourceId: "standard_key", amount: 10, label: "10 Standard Keys" },
      { type: "case_key", resourceId: "premium_key", amount: 1, label: "1 Premium Key" },
    ],
    icon: "🔑🔑",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 2,
    tags: ["case", "key", "premium", "value"],
  },
  {
    productId: "case_bundle_legendary",
    name: "Legendary Case Bundle",
    description: "1 Legendary Case + 1 Legendary Key + 500 Hexium",
    category: "case_bundle",
    priceStars: 250,
    rewards: [
      { type: "inventory_item", resourceId: "case_legendary", amount: 1, label: "Legendary Case" },
      { type: "case_key", resourceId: "legendary_key", amount: 1, label: "Legendary Key" },
      { type: "currency", resourceId: "hexium", amount: 500, label: "500 Hexium" },
    ],
    icon: "📦⭐",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 5,
    sortOrder: 3,
    tags: ["legendary", "case", "rare"],
    requiredLevel: 20,
  },

  // ─────────────── VIP STATUS ───────────────

  {
    productId: "vip_7d",
    name: "VIP — 7 Days",
    description: "+50% all income, exclusive badge, priority queue",
    category: "vip_status",
    priceStars: 100,
    rewards: [
      { type: "vip_days", resourceId: "vip", amount: 7, label: "7 Days VIP" },
    ],
    icon: "👑",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 1,
    tags: ["vip", "premium"],
  },
  {
    productId: "vip_30d",
    name: "VIP — 30 Days",
    description: "+50% all income, exclusive badge, priority queue",
    category: "vip_status",
    priceStars: 300,
    originalPriceStars: 400,
    rewards: [
      { type: "vip_days", resourceId: "vip", amount: 30, label: "30 Days VIP" },
    ],
    icon: "👑⭐",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 2,
    tags: ["vip", "premium", "value"],
  },

  // ─────────────── BOOSTERS ───────────────

  {
    productId: "booster_double_tap_1h",
    name: "Double Tap — 1 Hour",
    description: "2x tap income for 1 hour",
    category: "booster",
    priceStars: 15,
    rewards: [
      { type: "booster", resourceId: "double_tap", amount: 3600, label: "1h Double Tap" },
    ],
    icon: "⚡",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 1,
    tags: ["booster", "tap"],
  },
  {
    productId: "booster_auto_click_2h",
    name: "Auto-Clicker — 2 Hours",
    description: "Automatic clicking for 2 hours",
    category: "booster",
    priceStars: 25,
    rewards: [
      { type: "booster", resourceId: "auto_click", amount: 7200, label: "2h Auto-Click" },
    ],
    icon: "🤖",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 2,
    tags: ["booster", "auto"],
  },

  // ─────────────── ENERGY REFILLS ───────────────

  {
    productId: "energy_full_refill",
    name: "Full Energy Refill",
    description: "Instantly refill energy to maximum",
    category: "energy_refill",
    priceStars: 10,
    rewards: [
      { type: "energy", resourceId: "energy", amount: 9999, label: "Full Energy" },
    ],
    icon: "🔋",
    available: true,
    oneTimePurchase: false,
    maxPurchases: 0,
    sortOrder: 1,
    tags: ["energy", "refill"],
  },
];

// ============================================================
// CATALOG API
// ============================================================

/** Get all products */
export function getAllProducts(): StarsProduct[] {
  return [...PRODUCTS];
}

/** Get available products (not expired, available flag) */
export function getAvailableProducts(): StarsProduct[] {
  return PRODUCTS.filter((p) => p.available && !isProductExpired(p.expiresAt));
}

/** Get products by category */
export function getProductsByCategory(category: ProductCategory): StarsProduct[] {
  return getAvailableProducts().filter((p) => p.category === category);
}

/** Get product by ID */
export function getProductById(productId: string): StarsProduct | undefined {
  return PRODUCTS.find((p) => p.productId === productId);
}

/** Get products by tag */
export function getProductsByTag(tag: string): StarsProduct[] {
  return getAvailableProducts().filter((p) => p.tags.includes(tag));
}

/** Get products sorted by sortOrder within category */
export function getProductsSorted(category?: ProductCategory): StarsProduct[] {
  const list = category ? getProductsByCategory(category) : getAvailableProducts();
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get featured products (special offers + best value) */
export function getFeaturedProducts(): StarsProduct[] {
  return getAvailableProducts().filter(
    (p) => p.tags.includes("best_deal") || p.tags.includes("best_value") || p.category === "special_offer"
  );
}

/** Get products requiring specific max level */
export function getProductsForLevel(level: number): StarsProduct[] {
  return getAvailableProducts().filter(
    (p) => !p.requiredLevel || p.requiredLevel <= level
  );
}

/** Register a new product dynamically */
export function registerProduct(product: StarsProduct): void {
  const existing = PRODUCTS.findIndex((p) => p.productId === product.productId);
  if (existing >= 0) {
    PRODUCTS[existing] = product;
  } else {
    PRODUCTS.push(product);
  }
}

/** Remove a product */
export function removeProduct(productId: string): boolean {
  const idx = PRODUCTS.findIndex((p) => p.productId === productId);
  if (idx >= 0) {
    PRODUCTS.splice(idx, 1);
    return true;
  }
  return false;
}

/** Get unique categories from available products */
export function getActiveCategories(): ProductCategory[] {
  const cats = new Set<ProductCategory>();
  getAvailableProducts().forEach((p) => cats.add(p.category));
  return [...cats];
}
