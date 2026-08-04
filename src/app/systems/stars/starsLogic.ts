// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Logic
// ============================================================
// Pure functions: purchase validation, reward conversion,
// price calculations. No side effects.
// ============================================================

import type {
  StarsProduct,
  ProductReward,
  PurchaseRecord,
  PurchaseState,
} from "./starsTypes";
import { isProductExpired, calcDiscountPercent } from "./starsData";

// ============================================================
// PURCHASE VALIDATION
// ============================================================

export interface PurchaseValidation {
  valid: boolean;
  reason: string;
}

/** Validate if a product can be purchased */
export function validatePurchase(
  product: StarsProduct,
  purchaseCounts: Record<string, number>,
  playerLevel: number
): PurchaseValidation {
  // Product available?
  if (!product.available) {
    return { valid: false, reason: "product_unavailable" };
  }

  // Expired?
  if (isProductExpired(product.expiresAt)) {
    return { valid: false, reason: "product_expired" };
  }

  // Level requirement?
  if (product.requiredLevel && playerLevel < product.requiredLevel) {
    return { valid: false, reason: `requires_level_${product.requiredLevel}` };
  }

  // One-time purchase?
  const count = purchaseCounts[product.productId] ?? 0;
  if (product.oneTimePurchase && count > 0) {
    return { valid: false, reason: "already_purchased" };
  }

  // Max purchases?
  if (product.maxPurchases > 0 && count >= product.maxPurchases) {
    return { valid: false, reason: `max_purchases_${product.maxPurchases}` };
  }

  return { valid: true, reason: "ok" };
}

/** Check if purchase is currently in progress */
export function isPurchaseInProgress(state: PurchaseState): boolean {
  return (
    state.status === "creating_invoice" ||
    state.status === "invoice_sent" ||
    state.status === "pending_payment" ||
    state.status === "validating"
  );
}

// ============================================================
// REWARD CONVERSION
// ============================================================

/**
 * Convert ProductReward[] to game-compatible reward format.
 * The output matches the GameReward type from the game's reward system.
 */
export interface GameRewardOutput {
  type: string;
  resourceId: string;
  amount: number;
  label: string;
  source: "stars_purchase";
  productId: string;
}

/** Convert product rewards to game rewards */
export function convertRewardsToGame(
  productId: string,
  rewards: ProductReward[]
): GameRewardOutput[] {
  return rewards.map((r) => ({
    type: r.type,
    resourceId: r.resourceId,
    amount: r.amount,
    label: r.label,
    source: "stars_purchase" as const,
    productId,
  }));
}

// ============================================================
// PRICE CALCULATIONS
// ============================================================

/** Get discount info for a product */
export function getDiscountInfo(product: StarsProduct): {
  hasDiscount: boolean;
  discountPercent: number;
  savings: number;
} {
  if (!product.originalPriceStars || product.originalPriceStars <= product.priceStars) {
    return { hasDiscount: false, discountPercent: 0, savings: 0 };
  }

  return {
    hasDiscount: true,
    discountPercent: calcDiscountPercent(product.originalPriceStars, product.priceStars),
    savings: product.originalPriceStars - product.priceStars,
  };
}

/** Calculate value score (reward value per star) */
export function calcValueScore(product: StarsProduct): number {
  if (product.priceStars <= 0) return 0;

  let totalValue = 0;
  for (const r of product.rewards) {
    switch (r.type) {
      case "currency":
        totalValue += r.amount;
        break;
      case "quantum_resource":
        totalValue += r.amount * 10; // QR worth 10x currency
        break;
      case "battle_pass_premium":
        totalValue += 2000; // fixed value
        break;
      case "vip_days":
        totalValue += r.amount * 50; // per day value
        break;
      case "booster":
        totalValue += r.amount * 0.5; // per second value
        break;
      case "case_key":
        totalValue += r.amount * 100; // per key value
        break;
      case "energy":
        totalValue += Math.min(r.amount, 100) * 2;
        break;
      default:
        totalValue += r.amount * 5;
    }
  }

  return Math.round((totalValue / product.priceStars) * 100) / 100;
}

/** Sort products by best value */
export function sortByValue(products: StarsProduct[]): StarsProduct[] {
  return [...products].sort((a, b) => calcValueScore(b) - calcValueScore(a));
}

// ============================================================
// PURCHASE HISTORY HELPERS
// ============================================================

/** Get total Stars spent from purchase history */
export function getTotalSpent(history: PurchaseRecord[]): number {
  return history
    .filter((r) => r.status === "success")
    .reduce((sum, r) => sum + r.priceStars, 0);
}

/** Get purchase count for a specific product */
export function getProductPurchaseCount(
  history: PurchaseRecord[],
  productId: string
): number {
  return history.filter(
    (r) => r.productId === productId && r.status === "success"
  ).length;
}

/** Build purchase counts map from history */
export function buildPurchaseCounts(
  history: PurchaseRecord[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const record of history) {
    if (record.status === "success") {
      counts[record.productId] = (counts[record.productId] ?? 0) + 1;
    }
  }
  return counts;
}

/** Get most recent purchases */
export function getRecentPurchases(
  history: PurchaseRecord[],
  limit: number = 10
): PurchaseRecord[] {
  return [...history]
    .filter((r) => r.status === "success")
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
    .slice(0, limit);
}

/** Get spending by category */
export function getSpendingByCategory(
  history: PurchaseRecord[]
): Record<string, { count: number; totalStars: number }> {
  const result: Record<string, { count: number; totalStars: number }> = {};
  for (const record of history) {
    if (record.status !== "success") continue;
    if (!result[record.category]) {
      result[record.category] = { count: 0, totalStars: 0 };
    }
    result[record.category].count++;
    result[record.category].totalStars += record.priceStars;
  }
  return result;
}
