// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Types
// ============================================================
// FOUNDATION v2 · Module 4/6
// Monetization layer: Stars Products → Invoice → Payment → Reward
// Connects to: SHOP, BATTLE PASS, OFFERS, CASES
// ============================================================

// --- Product Category ---
// Each category maps to a future game system

export type ProductCategory =
  | "currency_pack"        // → SHOP screen
  | "premium_battle_pass"  // → BATTLE PASS screen
  | "special_offer"        // → OFFERS screen
  | "case_bundle"          // → CASES screen
  | "vip_status"           // → PROFILE / perks
  | "cosmetic"             // → SHOP cosmetics tab
  | "booster"              // → SHOP boosters tab
  | "energy_refill"        // → quick purchase (inline)
  | "custom";              // → extensible

// --- Stars Product ---

export interface StarsProduct {
  /** Unique product ID (e.g. "pack_starter_100") */
  productId: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Category for routing to game systems */
  category: ProductCategory;
  /** Price in Telegram Stars */
  priceStars: number;
  /** Optional original price (for discount display) */
  originalPriceStars?: number;
  /** Rewards granted on purchase */
  rewards: ProductReward[];
  /** Product icon/emoji */
  icon: string;
  /** Is this product currently available? */
  available: boolean;
  /** One-time purchase (non-repeatable) */
  oneTimePurchase: boolean;
  /** Max purchases allowed (0 = unlimited) */
  maxPurchases: number;
  /** Sort priority (lower = first) */
  sortOrder: number;
  /** Tags for filtering */
  tags: string[];
  /** Optional expiry (ISO timestamp) */
  expiresAt?: string;
  /** Optional required level */
  requiredLevel?: number;
  /** Custom metadata for game systems */
  meta?: Record<string, unknown>;
}

// --- Product Reward ---
// Maps to HexiumGameState reward system

export interface ProductReward {
  /** Reward type matching game reward system */
  type: ProductRewardType;
  /** Resource/item ID */
  resourceId: string;
  /** Amount to grant */
  amount: number;
  /** Display label */
  label: string;
}

export type ProductRewardType =
  | "currency"           // hexium, quantumDust, etc.
  | "quantum_resource"   // voidEssence, chronoFragments, etc.
  | "inventory_item"     // specific item
  | "battle_pass_premium" // unlock premium BP track
  | "vip_days"           // VIP status duration
  | "booster"            // temporary multiplier
  | "energy"             // energy refill
  | "case_key"           // key for cases
  | "cosmetic"           // skin/theme
  | "experience"         // XP
  | "custom";            // extensible

// --- Purchase State ---

export type PurchaseStatus =
  | "idle"
  | "creating_invoice"
  | "invoice_sent"
  | "pending_payment"
  | "validating"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PurchaseState {
  /** Current purchase status */
  status: PurchaseStatus;
  /** Product being purchased */
  productId: string | null;
  /** Invoice ID from Telegram */
  invoiceId: string | null;
  /** Invoice URL (for Telegram payment) */
  invoiceUrl: string | null;
  /** Timestamp when purchase started */
  startedAt: string | null;
  /** Timestamp when completed/failed */
  completedAt: string | null;
  /** Error message if failed */
  error: string | null;
  /** Rewards pending delivery */
  pendingRewards: ProductReward[];
}

// --- Purchase Record (history) ---

export interface PurchaseRecord {
  /** Unique purchase ID */
  purchaseId: string;
  /** Product purchased */
  productId: string;
  /** Product category at time of purchase */
  category: ProductCategory;
  /** Stars paid */
  priceStars: number;
  /** Telegram user ID */
  playerId: number;
  /** Purchase timestamp */
  purchasedAt: string;
  /** Status at completion */
  status: "success" | "refunded";
  /** Telegram invoice ID */
  invoiceId: string;
  /** Rewards delivered */
  rewards: ProductReward[];
  /** Device ID for tracking */
  deviceId: string;
}

// --- Invoice Adapter ---
// Decouples from Telegram WebApp invoice API

export interface InvoiceAdapter {
  /** Check if Stars payments are available */
  isAvailable(): boolean;
  /** Create and open an invoice for a product */
  openInvoice(params: InvoiceParams): Promise<InvoiceResult>;
}

export interface InvoiceParams {
  /** Product title */
  title: string;
  /** Product description */
  description: string;
  /** Price in Stars */
  amount: number;
  /** Payload string for validation */
  payload: string;
  /** Product photo URL (optional) */
  photoUrl?: string;
}

export type InvoiceResultStatus = "paid" | "cancelled" | "failed" | "pending";

export interface InvoiceResult {
  /** Payment status */
  status: InvoiceResultStatus;
  /** Invoice ID (if created) */
  invoiceId?: string;
  /** Error details */
  error?: string;
}

// --- Refund Request (stub) ---

export interface RefundRequest {
  purchaseId: string;
  productId: string;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "denied";
}

// --- Stars Analytics Event ---

export type StarsAnalyticsEventType =
  | "product_viewed"
  | "product_clicked"
  | "invoice_created"
  | "invoice_opened"
  | "payment_success"
  | "payment_failed"
  | "payment_cancelled"
  | "reward_delivered"
  | "refund_requested"
  | "shop_opened"
  | "category_browsed";

export interface StarsAnalyticsEvent {
  type: StarsAnalyticsEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

// --- Stars Event (internal) ---

export type StarsEventType =
  | "purchase:start"
  | "purchase:invoice_created"
  | "purchase:success"
  | "purchase:failed"
  | "purchase:cancelled"
  | "purchase:reward_delivered"
  | "purchase:refund_requested"
  | "product:unlocked"
  | "product:expired";

export interface StarsEvent {
  type: StarsEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

// --- Category Display ---

export interface CategoryDisplay {
  category: ProductCategory;
  label: string;
  icon: string;
  sortOrder: number;
  description: string;
}
