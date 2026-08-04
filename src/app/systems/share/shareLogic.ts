// ============================================================
// HEXIUM CLICKER · Share System · Logic
// ============================================================
// Pure functions: cooldown checks, daily limits, URL building,
// payload assembly. No side effects.
// ============================================================

import type {
  ShareContentType,
  ShareMethod,
  SharePayload,
  ShareContext,
  ShareCooldownState,
  ShareRecord,
  ShareStats,
} from "./shareTypes";
import {
  SHARE_COOLDOWNS,
  DAILY_SHARE_LIMITS,
  MAX_DAILY_SHARES_TOTAL,
  METHOD_FALLBACK_CHAIN,
  generateShareId,
  getTodayString,
  getTelegramShareUrl,
} from "./shareData";
import {
  buildShareText,
  buildShareUrl,
} from "./shareTemplates";

// ============================================================
// COOLDOWN CHECKS
// ============================================================

/** Check if a share type is on cooldown */
export function isOnCooldown(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): boolean {
  const lastTime = cooldownState.lastShareTime[contentType] ?? 0;
  const cooldownMs = SHARE_COOLDOWNS[contentType] ?? 15_000;
  return Date.now() - lastTime < cooldownMs;
}

/** Get remaining cooldown in ms */
export function getCooldownRemaining(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): number {
  const lastTime = cooldownState.lastShareTime[contentType] ?? 0;
  const cooldownMs = SHARE_COOLDOWNS[contentType] ?? 15_000;
  const remaining = cooldownMs - (Date.now() - lastTime);
  return Math.max(0, remaining);
}

/** Get remaining cooldown formatted as "Xs" */
export function getCooldownFormatted(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): string {
  const ms = getCooldownRemaining(contentType, cooldownState);
  if (ms <= 0) return "";
  return `${Math.ceil(ms / 1000)}s`;
}

// ============================================================
// DAILY LIMIT CHECKS
// ============================================================

/** Check if daily limit is reached for a content type */
export function isDailyLimitReached(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): boolean {
  // Reset counts if new day
  if (cooldownState.countDate !== getTodayString()) return false;

  const limit = DAILY_SHARE_LIMITS[contentType] ?? 30;
  if (limit === 0) return false; // unlimited

  const count = cooldownState.dailyCounts[contentType] ?? 0;
  return count >= limit;
}

/** Check if total daily limit is reached */
export function isTotalDailyLimitReached(
  cooldownState: ShareCooldownState
): boolean {
  if (cooldownState.countDate !== getTodayString()) return false;

  const total = Object.values(cooldownState.dailyCounts).reduce(
    (sum, c) => sum + c,
    0
  );
  return total >= MAX_DAILY_SHARES_TOTAL;
}

/** Get remaining daily shares for a type */
export function getDailySharesRemaining(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): number {
  if (cooldownState.countDate !== getTodayString()) {
    return DAILY_SHARE_LIMITS[contentType] ?? 30;
  }
  const limit = DAILY_SHARE_LIMITS[contentType] ?? 30;
  if (limit === 0) return 999; // unlimited
  const count = cooldownState.dailyCounts[contentType] ?? 0;
  return Math.max(0, limit - count);
}

// ============================================================
// SHARE VALIDATION (combined)
// ============================================================

export interface ShareValidation {
  canShare: boolean;
  reason: string;
  cooldownRemaining?: number;
  dailyRemaining?: number;
}

/** Full validation: cooldown + daily limit */
export function validateShare(
  contentType: ShareContentType,
  cooldownState: ShareCooldownState
): ShareValidation {
  if (isTotalDailyLimitReached(cooldownState)) {
    return {
      canShare: false,
      reason: "total_daily_limit",
      dailyRemaining: 0,
    };
  }

  if (isDailyLimitReached(contentType, cooldownState)) {
    return {
      canShare: false,
      reason: "daily_limit",
      dailyRemaining: 0,
    };
  }

  if (isOnCooldown(contentType, cooldownState)) {
    return {
      canShare: false,
      reason: "cooldown",
      cooldownRemaining: getCooldownRemaining(contentType, cooldownState),
    };
  }

  return {
    canShare: true,
    reason: "ok",
    dailyRemaining: getDailySharesRemaining(contentType, cooldownState),
  };
}

// ============================================================
// PAYLOAD ASSEMBLY
// ============================================================

/** Assemble a SharePayload from context */
export function assemblePayload(
  context: ShareContext,
  method: ShareMethod
): SharePayload {
  const values = context.values as Record<string, string | number>;

  const text = context.customText ?? buildShareText(context.contentType, values);
  const url = context.customUrl ?? buildShareUrl(context.contentType, values);

  return {
    shareId: generateShareId(),
    contentType: context.contentType,
    text,
    url,
    imageUrl: context.imageUrl,
    method,
    source: context.source,
    meta: context.meta ?? {},
    createdAt: Date.now(),
  };
}

// ============================================================
// METHOD RESOLUTION
// ============================================================

export interface MethodAvailability {
  telegram_share: boolean;
  telegram_inline: boolean;
  clipboard: boolean;
  native_share: boolean;
  direct_link: boolean;
}

/** Resolve which method to use (with fallback chain) */
export function resolveMethod(
  preferred: ShareMethod | undefined,
  availability: MethodAvailability
): ShareMethod {
  // Try preferred first
  if (preferred && availability[preferred]) {
    return preferred;
  }

  // Walk fallback chain
  for (const method of METHOD_FALLBACK_CHAIN) {
    if (availability[method]) return method;
  }

  // Last resort — always available
  return "direct_link";
}

// ============================================================
// URL HELPERS
// ============================================================

/** Build Telegram share dialog URL */
export function buildTelegramShareDialogUrl(
  url: string,
  text: string
): string {
  return getTelegramShareUrl(url, text);
}

/** Build a copyable text block (URL + text combined) */
export function buildCopyText(text: string, url: string): string {
  return `${text}\n\n${url}`;
}

// ============================================================
// HISTORY / STATS
// ============================================================

/** Build stats from share history */
export function buildShareStats(history: ShareRecord[]): ShareStats {
  const today = getTodayString();
  const todayRecords = history.filter(
    (r) => new Date(r.timestamp).toISOString().slice(0, 10) === today
  );

  const byContentType: Record<string, number> = {};
  const byMethod: Record<string, number> = {};
  let successCount = 0;

  for (const record of history) {
    byContentType[record.contentType] = (byContentType[record.contentType] ?? 0) + 1;
    byMethod[record.method] = (byMethod[record.method] ?? 0) + 1;
    if (record.success) successCount++;
  }

  return {
    totalShares: history.length,
    sharesToday: todayRecords.length,
    byContentType,
    byMethod,
    successRate: history.length > 0 ? successCount / history.length : 0,
  };
}

/** Get shares of a specific type today */
export function getSharesToday(
  contentType: ShareContentType,
  history: ShareRecord[]
): number {
  const today = getTodayString();
  return history.filter(
    (r) =>
      r.contentType === contentType &&
      new Date(r.timestamp).toISOString().slice(0, 10) === today
  ).length;
}
