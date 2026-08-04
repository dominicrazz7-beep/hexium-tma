// ============================================================
// HEXIUM CLICKER · Telegram Stars System · Payments
// ============================================================
// Handles the full purchase lifecycle:
// idle → creating_invoice → invoice_sent → pending_payment
//   → validating → success / failed / cancelled
// Also manages invoice adapter, purchase history, and refund stubs.
// ============================================================

import type {
  StarsProduct,
  PurchaseState,
  PurchaseRecord,
  InvoiceAdapter,
  InvoiceResult,
  RefundRequest,
} from "./starsTypes";
import {
  createEmptyPurchaseState,
  generatePurchaseId,
  generateInvoicePayload,
  PURCHASE_HISTORY_KEY,
  PURCHASE_COUNTER_KEY,
  MAX_PURCHASE_HISTORY,
  INVOICE_TIMEOUT_MS,
  PURCHASE_COOLDOWN_MS,
} from "./starsData";
import {
  validatePurchase,
  isPurchaseInProgress,
  buildPurchaseCounts,
} from "./starsLogic";

// ============================================================
// STATE
// ============================================================

let invoiceAdapter: InvoiceAdapter | null = null;
let purchaseState: PurchaseState = createEmptyPurchaseState();
let purchaseHistory: PurchaseRecord[] = [];
let purchaseCounts: Record<string, number> = {};
let lastPurchaseTime: Record<string, number> = {};

// ============================================================
// INVOICE ADAPTER
// ============================================================

export function setInvoiceAdapter(adapter: InvoiceAdapter): void {
  invoiceAdapter = adapter;
}

export function getInvoiceAdapter(): InvoiceAdapter | null {
  return invoiceAdapter;
}

export function isPaymentAvailable(): boolean {
  return invoiceAdapter !== null && invoiceAdapter.isAvailable();
}

// ============================================================
// PURCHASE STATE
// ============================================================

export function getPurchaseState(): PurchaseState {
  return { ...purchaseState };
}

function updatePurchaseState(partial: Partial<PurchaseState>): void {
  purchaseState = { ...purchaseState, ...partial };
}

function resetPurchaseState(): void {
  purchaseState = createEmptyPurchaseState();
}

// ============================================================
// PURCHASE FLOW
// ============================================================

export interface PurchaseResult {
  success: boolean;
  purchaseId?: string;
  error?: string;
  rewards?: StarsProduct["rewards"];
}

/**
 * Execute a full purchase flow for a product.
 * This is the main entry point for all purchases.
 */
export async function executePurchase(
  product: StarsProduct,
  playerId: number,
  playerLevel: number = 1,
  deviceId: string = ""
): Promise<PurchaseResult> {
  // Already purchasing?
  if (isPurchaseInProgress(purchaseState)) {
    return { success: false, error: "purchase_in_progress" };
  }

  // Payment system available?
  if (!isPaymentAvailable() || !invoiceAdapter) {
    return { success: false, error: "payment_unavailable" };
  }

  // Cooldown check
  const lastTime = lastPurchaseTime[product.productId] ?? 0;
  if (Date.now() - lastTime < PURCHASE_COOLDOWN_MS) {
    return { success: false, error: "purchase_cooldown" };
  }

  // Validate purchase eligibility
  const validation = validatePurchase(product, purchaseCounts, playerLevel);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  const purchaseId = generatePurchaseId();
  const payload = generateInvoicePayload(product.productId, playerId);

  // === Step 1: Creating invoice ===
  updatePurchaseState({
    status: "creating_invoice",
    productId: product.productId,
    startedAt: new Date().toISOString(),
    error: null,
    pendingRewards: product.rewards,
  });

  try {
    // === Step 2: Open invoice (Telegram payment UI) ===
    updatePurchaseState({ status: "invoice_sent" });

    const invoiceResult = await withTimeout(
      invoiceAdapter.openInvoice({
        title: product.name,
        description: product.description,
        amount: product.priceStars,
        payload,
      }),
      INVOICE_TIMEOUT_MS
    );

    return handleInvoiceResult(
      invoiceResult,
      product,
      purchaseId,
      playerId,
      deviceId
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    updatePurchaseState({
      status: "failed",
      completedAt: new Date().toISOString(),
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

/** Handle the invoice result from Telegram */
function handleInvoiceResult(
  result: InvoiceResult,
  product: StarsProduct,
  purchaseId: string,
  playerId: number,
  deviceId: string
): PurchaseResult {
  switch (result.status) {
    case "paid": {
      // === Step 3: Validate ===
      updatePurchaseState({
        status: "validating",
        invoiceId: result.invoiceId ?? null,
      });

      // === Step 4: Success ===
      const record: PurchaseRecord = {
        purchaseId,
        productId: product.productId,
        category: product.category,
        priceStars: product.priceStars,
        playerId,
        purchasedAt: new Date().toISOString(),
        status: "success",
        invoiceId: result.invoiceId ?? "",
        rewards: product.rewards,
        deviceId,
      };

      addPurchaseRecord(record);
      lastPurchaseTime[product.productId] = Date.now();

      updatePurchaseState({
        status: "success",
        completedAt: new Date().toISOString(),
        invoiceId: result.invoiceId ?? null,
      });

      return {
        success: true,
        purchaseId,
        rewards: product.rewards,
      };
    }

    case "cancelled":
      updatePurchaseState({
        status: "cancelled",
        completedAt: new Date().toISOString(),
      });
      return { success: false, error: "user_cancelled" };

    case "failed":
      updatePurchaseState({
        status: "failed",
        completedAt: new Date().toISOString(),
        error: result.error ?? "payment_failed",
      });
      return { success: false, error: result.error ?? "payment_failed" };

    case "pending":
      updatePurchaseState({ status: "pending_payment" });
      return { success: false, error: "payment_pending" };

    default:
      updatePurchaseState({
        status: "failed",
        completedAt: new Date().toISOString(),
        error: "unknown_status",
      });
      return { success: false, error: "unknown_status" };
  }
}

// ============================================================
// PURCHASE HISTORY
// ============================================================

export function getPurchaseHistory(): PurchaseRecord[] {
  return [...purchaseHistory];
}

export function getPurchaseCounts(): Record<string, number> {
  return { ...purchaseCounts };
}

function addPurchaseRecord(record: PurchaseRecord): void {
  purchaseHistory.unshift(record);

  // Trim history
  if (purchaseHistory.length > MAX_PURCHASE_HISTORY) {
    purchaseHistory = purchaseHistory.slice(0, MAX_PURCHASE_HISTORY);
  }

  // Update counts
  purchaseCounts[record.productId] = (purchaseCounts[record.productId] ?? 0) + 1;

  // Persist
  savePurchaseHistory();
}

/** Load purchase history from localStorage */
export function loadPurchaseHistory(): void {
  try {
    const raw = localStorage.getItem(PURCHASE_HISTORY_KEY);
    if (raw) {
      purchaseHistory = JSON.parse(raw);
      purchaseCounts = buildPurchaseCounts(purchaseHistory);
    }
  } catch (err) {
    console.error("[Stars Payments] Failed to load history:", err);
    purchaseHistory = [];
    purchaseCounts = {};
  }
}

/** Save purchase history to localStorage */
function savePurchaseHistory(): void {
  try {
    localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(purchaseHistory));
    localStorage.setItem(PURCHASE_COUNTER_KEY, JSON.stringify(purchaseCounts));
  } catch (err) {
    console.error("[Stars Payments] Failed to save history:", err);
  }
}

/** Clear all purchase history */
export function clearPurchaseHistory(): void {
  purchaseHistory = [];
  purchaseCounts = {};
  lastPurchaseTime = {};
  try {
    localStorage.removeItem(PURCHASE_HISTORY_KEY);
    localStorage.removeItem(PURCHASE_COUNTER_KEY);
  } catch {}
}

// ============================================================
// REFUND STUBS
// ============================================================

const refundRequests: RefundRequest[] = [];

/** Request a refund (stub — no actual processing) */
export function requestRefund(
  purchaseId: string,
  productId: string,
  reason: string
): RefundRequest {
  const request: RefundRequest = {
    purchaseId,
    productId,
    reason,
    requestedAt: new Date().toISOString(),
    status: "pending",
  };

  refundRequests.push(request);
  console.log(`[Stars Payments] Refund requested: ${purchaseId} — ${reason}`);

  return request;
}

/** Get all refund requests */
export function getRefundRequests(): RefundRequest[] {
  return [...refundRequests];
}

/** Mark a purchase as refunded (for future backend integration) */
export function markRefunded(purchaseId: string): boolean {
  const record = purchaseHistory.find((r) => r.purchaseId === purchaseId);
  if (!record) return false;

  record.status = "refunded";

  // Decrement purchase count
  if (purchaseCounts[record.productId] > 0) {
    purchaseCounts[record.productId]--;
  }

  savePurchaseHistory();
  return true;
}

// ============================================================
// CLOUD SAVE INTEGRATION
// ============================================================

/** Get Stars state for cloud save */
export function getStarsStateForSave(): Record<string, unknown> {
  return {
    purchaseHistory: purchaseHistory.slice(0, 50), // last 50 for cloud
    purchaseCounts: { ...purchaseCounts },
  };
}

/** Restore Stars state from cloud save */
export function restoreStarsState(
  state: Record<string, unknown>
): void {
  if (state.purchaseHistory && Array.isArray(state.purchaseHistory)) {
    purchaseHistory = state.purchaseHistory as PurchaseRecord[];
    // Rebuild counts from history for consistency
    purchaseCounts = buildPurchaseCounts(purchaseHistory);
    savePurchaseHistory();
  }
}

// ============================================================
// UTILITIES
// ============================================================

/** Promise with timeout */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("invoice_timeout")), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Reset the payment module (for testing / cleanup) */
export function resetPayments(): void {
  resetPurchaseState();
  purchaseHistory = [];
  purchaseCounts = {};
  lastPurchaseTime = {};
  refundRequests.length = 0;
}
