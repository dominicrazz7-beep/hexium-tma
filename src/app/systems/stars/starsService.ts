// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Service (Orchestrator)
// ============================================================
// High-level API for the Stars monetization layer.
// Screens and game core call THIS, not individual modules.
// ============================================================

import type {
  StarsProduct,
  ProductCategory,
  PurchaseState,
  PurchaseRecord,
  InvoiceAdapter,
  RefundRequest,
  StarsEvent,
  StarsEventType,
  StarsAnalyticsEvent,
  StarsAnalyticsEventType,
  CategoryDisplay,
} from "./starsTypes";
import {
  STARS_SYSTEM_VERSION,
  getCategoryDisplay,
  getSortedCategories,
  formatStarsPrice,
} from "./starsData";
import {
  getAllProducts,
  getAvailableProducts,
  getProductsByCategory,
  getProductById,
  getProductsByTag,
  getProductsSorted,
  getFeaturedProducts,
  getProductsForLevel,
  registerProduct,
  removeProduct,
  getActiveCategories,
} from "./starsProducts";
import {
  validatePurchase,
  convertRewardsToGame,
  getDiscountInfo,
  calcValueScore,
  sortByValue,
  getTotalSpent,
  getProductPurchaseCount,
  getRecentPurchases,
  getSpendingByCategory,
  type GameRewardOutput,
} from "./starsLogic";
import {
  setInvoiceAdapter as paymentsSetInvoiceAdapter,
  isPaymentAvailable,
  getPurchaseState,
  executePurchase,
  getPurchaseHistory,
  getPurchaseCounts,
  loadPurchaseHistory,
  clearPurchaseHistory,
  requestRefund,
  getRefundRequests,
  markRefunded,
  getStarsStateForSave,
  restoreStarsState,
  resetPayments,
} from "./starsPayments";

// ============================================================
// STATE
// ============================================================

let initialized = false;
let playerId: number = 0;
let deviceId: string = "";
let playerLevel: number = 1;

// Event listeners
type EventListener = (event: StarsEvent) => void;
type AnalyticsListener = (event: StarsAnalyticsEvent) => void;
const eventListeners: EventListener[] = [];
const analyticsListeners: AnalyticsListener[] = [];

// ============================================================
// INIT
// ============================================================

function initialize(
  telegramId: number,
  devId: string,
  level: number = 1
): void {
  playerId = telegramId;
  deviceId = devId;
  playerLevel = level;

  loadPurchaseHistory();
  initialized = true;

  console.log("[Stars] Initialized:", {
    playerId,
    deviceId: deviceId.slice(0, 16),
    level,
    paymentAvailable: isPaymentAvailable(),
    products: getAllProducts().length,
    version: STARS_SYSTEM_VERSION,
  });
}

function assertInit(): void {
  if (!initialized) throw new Error("[Stars] Not initialized — call initialize() first");
}

/** Update player level (for level-gated products) */
function setPlayerLevel(level: number): void {
  playerLevel = level;
}

// ============================================================
// PRODUCTS
// ============================================================

/** Get all available products */
function getShopProducts(category?: ProductCategory): StarsProduct[] {
  assertInit();
  const products = category ? getProductsByCategory(category) : getAvailableProducts();
  emitAnalytics("shop_opened", { category });
  return products.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get products filtered by player level */
function getProductsForPlayer(): StarsProduct[] {
  return getProductsForLevel(playerLevel);
}

/** Get featured/best-deal products */
function getFeatured(): StarsProduct[] {
  return getFeaturedProducts();
}

/** Get product details with discount info */
function getProductDetails(productId: string): {
  product: StarsProduct | undefined;
  discount: ReturnType<typeof getDiscountInfo>;
  valueScore: number;
  canPurchase: boolean;
  purchaseCount: number;
  formattedPrice: string;
} | null {
  const product = getProductById(productId);
  if (!product) return null;

  const counts = getPurchaseCounts();
  const validation = validatePurchase(product, counts, playerLevel);

  emitAnalytics("product_viewed", { productId });

  return {
    product,
    discount: getDiscountInfo(product),
    valueScore: calcValueScore(product),
    canPurchase: validation.valid,
    purchaseCount: counts[productId] ?? 0,
    formattedPrice: formatStarsPrice(product.priceStars),
  };
}

/** Get all categories with product counts */
function getCategories(): (CategoryDisplay & { productCount: number })[] {
  const active = getActiveCategories();
  return getSortedCategories()
    .filter((c) => active.includes(c.category))
    .map((c) => ({
      ...c,
      productCount: getProductsByCategory(c.category).length,
    }));
}

/** Best value products (sorted) */
function getBestValue(limit: number = 5): StarsProduct[] {
  return sortByValue(getAvailableProducts()).slice(0, limit);
}

// ============================================================
// PURCHASE
// ============================================================

/** Purchase a product (full flow) */
async function purchase(productId: string): Promise<{
  success: boolean;
  rewards?: GameRewardOutput[];
  purchaseId?: string;
  error?: string;
}> {
  assertInit();
  const product = getProductById(productId);
  if (!product) {
    return { success: false, error: "product_not_found" };
  }

  emitAnalytics("product_clicked", { productId, priceStars: product.priceStars });
  emitEvent("purchase:start", { productId, priceStars: product.priceStars });

  const result = await executePurchase(product, playerId, playerLevel, deviceId);

  if (result.success && result.rewards) {
    const gameRewards = convertRewardsToGame(productId, result.rewards);

    emitEvent("purchase:success", {
      productId,
      purchaseId: result.purchaseId,
      priceStars: product.priceStars,
      rewardCount: gameRewards.length,
    });
    emitAnalytics("payment_success", {
      productId,
      priceStars: product.priceStars,
      category: product.category,
    });
    emitEvent("purchase:reward_delivered", {
      productId,
      rewards: gameRewards,
    });
    emitAnalytics("reward_delivered", {
      productId,
      rewards: gameRewards.map((r) => r.label),
    });

    return {
      success: true,
      rewards: gameRewards,
      purchaseId: result.purchaseId,
    };
  }

  // Failed or cancelled
  if (result.error === "user_cancelled") {
    emitEvent("purchase:cancelled", { productId });
    emitAnalytics("payment_cancelled", { productId });
  } else {
    emitEvent("purchase:failed", { productId, error: result.error });
    emitAnalytics("payment_failed", { productId, error: result.error });
  }

  return { success: false, error: result.error };
}

/** Get current purchase state */
function getCurrentPurchase(): PurchaseState {
  return getPurchaseState();
}

// ============================================================
// HISTORY & STATS
// ============================================================

/** Get purchase history */
function getHistory(limit?: number): PurchaseRecord[] {
  const history = getPurchaseHistory();
  return limit ? getRecentPurchases(history, limit) : history;
}

/** Get total Stars spent */
function totalSpent(): number {
  return getTotalSpent(getPurchaseHistory());
}

/** Get spending breakdown by category */
function spendingBreakdown(): Record<string, { count: number; totalStars: number }> {
  return getSpendingByCategory(getPurchaseHistory());
}

/** How many times a product was purchased */
function productPurchaseCount(productId: string): number {
  return getProductPurchaseCount(getPurchaseHistory(), productId);
}

// ============================================================
// REFUNDS
// ============================================================

/** Request a refund (stub) */
function refund(purchaseId: string, reason: string): RefundRequest {
  assertInit();
  const record = getPurchaseHistory().find((r) => r.purchaseId === purchaseId);
  emitEvent("purchase:refund_requested", { purchaseId, reason });
  emitAnalytics("refund_requested", { purchaseId, reason });
  return requestRefund(purchaseId, record?.productId ?? "unknown", reason);
}

/** Get refund requests */
function getRefunds(): RefundRequest[] {
  return getRefundRequests();
}

/** Process a refund (admin/backend stub) */
function processRefund(purchaseId: string): boolean {
  return markRefunded(purchaseId);
}

// ============================================================
// CLOUD SAVE
// ============================================================

/** Get state for cloud save inclusion */
function getStateForSave(): Record<string, unknown> {
  return getStarsStateForSave();
}

/** Restore from cloud save */
function restoreFromSave(state: Record<string, unknown>): void {
  restoreStarsState(state);
  console.log("[Stars] Restored from cloud save");
}

// ============================================================
// INVOICE ADAPTER
// ============================================================

function setInvoiceAdapter(adapter: InvoiceAdapter): void {
  paymentsSetInvoiceAdapter(adapter);
}

function paymentsAvailable(): boolean {
  return isPaymentAvailable();
}

// ============================================================
// DYNAMIC PRODUCTS
// ============================================================

/** Add/update a product at runtime */
function addProduct(product: StarsProduct): void {
  registerProduct(product);
  emitEvent("product:unlocked", { productId: product.productId });
}

/** Remove a product at runtime */
function dropProduct(productId: string): boolean {
  return removeProduct(productId);
}

// ============================================================
// EVENTS
// ============================================================

function onEvent(listener: EventListener): void {
  eventListeners.push(listener);
}

function offEvent(listener: EventListener): void {
  const idx = eventListeners.indexOf(listener);
  if (idx >= 0) eventListeners.splice(idx, 1);
}

function onAnalytics(listener: AnalyticsListener): void {
  analyticsListeners.push(listener);
}

function offAnalytics(listener: AnalyticsListener): void {
  const idx = analyticsListeners.indexOf(listener);
  if (idx >= 0) analyticsListeners.splice(idx, 1);
}

function emitEvent(type: StarsEventType, data: Record<string, unknown>): void {
  const event: StarsEvent = { type, data, timestamp: Date.now() };
  for (const l of eventListeners) {
    try { l(event); } catch (e) { console.error("[Stars] Event listener error:", e); }
  }
}

function emitAnalytics(type: StarsAnalyticsEventType, data: Record<string, unknown>): void {
  const event: StarsAnalyticsEvent = { type, data, timestamp: Date.now() };
  for (const l of analyticsListeners) {
    try { l(event); } catch (e) { console.error("[Stars] Analytics listener error:", e); }
  }
}

// ============================================================
// CLEANUP
// ============================================================

function destroy(): void {
  resetPayments();
  eventListeners.length = 0;
  analyticsListeners.length = 0;
  initialized = false;
  console.log("[Stars] Destroyed");
}

// ============================================================
// EXPORT
// ============================================================

export const starsService = {
  // Init
  initialize,
  setPlayerLevel,

  // Products
  getShopProducts,
  getProductsForPlayer,
  getFeatured,
  getProductDetails,
  getCategories,
  getBestValue,

  // Purchase
  purchase,
  getCurrentPurchase,

  // History & Stats
  getHistory,
  totalSpent,
  spendingBreakdown,
  productPurchaseCount,

  // Refunds
  refund,
  getRefunds,
  processRefund,

  // Cloud Save
  getStateForSave,
  restoreFromSave,

  // Invoice Adapter
  setInvoiceAdapter,
  paymentsAvailable,

  // Dynamic Products
  addProduct,
  dropProduct,

  // Events
  onEvent,
  offEvent,
  onAnalytics,
  offAnalytics,

  // Cleanup
  destroy,
};
