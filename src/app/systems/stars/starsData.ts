// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Data & Constants
// ============================================================
// All configuration, defaults, and category definitions.
// ============================================================

import type {
  PurchaseState,
  CategoryDisplay,
  ProductCategory,
} from "./starsTypes";

// ============================================================
// VERSION
// ============================================================

export const STARS_SYSTEM_VERSION = 1;

// ============================================================
// STORAGE KEYS
// ============================================================

/** Purchase history key (localStorage) */
export const PURCHASE_HISTORY_KEY = "hexium_purchase_history";

/** Purchase counter key */
export const PURCHASE_COUNTER_KEY = "hexium_purchase_counts";

/** Cloud save sub-key for Stars state */
export const CLOUD_SAVE_STARS_KEY = "starsState";

// ============================================================
// LIMITS & CONFIG
// ============================================================

/** Max purchase records to keep locally */
export const MAX_PURCHASE_HISTORY = 200;

/** Invoice timeout (ms) — cancel if no response */
export const INVOICE_TIMEOUT_MS = 120_000; // 2 minutes

/** Min time between purchases of same product (ms) */
export const PURCHASE_COOLDOWN_MS = 3_000; // 3 seconds

/** Max concurrent pending purchases */
export const MAX_PENDING_PURCHASES = 1;

// ============================================================
// CATEGORIES
// ============================================================

export const CATEGORY_DISPLAY: CategoryDisplay[] = [
  {
    category: "currency_pack",
    label: "Currency Packs",
    icon: "💰",
    sortOrder: 1,
    description: "Hexium, Quantum Dust, and more",
  },
  {
    category: "premium_battle_pass",
    label: "Battle Pass",
    icon: "🎖️",
    sortOrder: 2,
    description: "Unlock premium rewards track",
  },
  {
    category: "special_offer",
    label: "Special Offers",
    icon: "🔥",
    sortOrder: 3,
    description: "Limited-time deals",
  },
  {
    category: "case_bundle",
    label: "Case Bundles",
    icon: "📦",
    sortOrder: 4,
    description: "Keys, cases, and rare loot",
  },
  {
    category: "vip_status",
    label: "VIP",
    icon: "👑",
    sortOrder: 5,
    description: "Premium status with exclusive perks",
  },
  {
    category: "cosmetic",
    label: "Cosmetics",
    icon: "🎨",
    sortOrder: 6,
    description: "Skins, themes, and visual upgrades",
  },
  {
    category: "booster",
    label: "Boosters",
    icon: "⚡",
    sortOrder: 7,
    description: "Temporary multipliers and buffs",
  },
  {
    category: "energy_refill",
    label: "Energy",
    icon: "🔋",
    sortOrder: 8,
    description: "Instant energy refills",
  },
];

/** Get display info for a category */
export function getCategoryDisplay(category: ProductCategory): CategoryDisplay | undefined {
  return CATEGORY_DISPLAY.find((c) => c.category === category);
}

/** Get all categories sorted */
export function getSortedCategories(): CategoryDisplay[] {
  return [...CATEGORY_DISPLAY].sort((a, b) => a.sortOrder - b.sortOrder);
}

// ============================================================
// DEFAULT STATES
// ============================================================

export function createEmptyPurchaseState(): PurchaseState {
  return {
    status: "idle",
    productId: null,
    invoiceId: null,
    invoiceUrl: null,
    startedAt: null,
    completedAt: null,
    error: null,
    pendingRewards: [],
  };
}

// ============================================================
// UTILITIES
// ============================================================

/** Generate unique purchase ID */
export function generatePurchaseId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `hxp_${ts}_${rnd}`;
}

/** Generate invoice payload for validation */
export function generateInvoicePayload(
  productId: string,
  playerId: number
): string {
  const ts = Date.now();
  return JSON.stringify({
    pid: productId,
    uid: playerId,
    ts,
    nonce: Math.random().toString(36).slice(2, 10),
  });
}

/** Parse invoice payload */
export function parseInvoicePayload(
  payload: string
): { pid: string; uid: number; ts: number } | null {
  try {
    const data = JSON.parse(payload);
    if (!data.pid || !data.uid || !data.ts) return null;
    return { pid: data.pid, uid: data.uid, ts: data.ts };
  } catch {
    return null;
  }
}

/** Calculate discount percentage */
export function calcDiscountPercent(
  original: number,
  current: number
): number {
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

/** Check if product is expired */
export function isProductExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

/** Format Stars price for display */
export function formatStarsPrice(stars: number): string {
  return `⭐ ${stars}`;
}
