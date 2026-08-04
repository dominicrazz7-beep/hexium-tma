// ============================================================
// HEXIUM CLICKER · Share System · Service (Orchestrator)
// ============================================================
// High-level API: screens call THIS for all sharing.
// Handles: template assembly, cooldowns, limits, method
// resolution, fallback chain, history, analytics events.
// ============================================================

import type {
  ShareContentType,
  ShareMethod,
  ShareContext,
  SharePayload,
  ShareResult,
  ShareCooldownState,
  ShareRecord,
  ShareStats,
  ShareEvent,
  ShareEventType,
  ShareAnalyticsEvent,
  ShareAnalyticsEventType,
  TelegramShareAdapter,
} from "./shareTypes";
import {
  SHARE_SYSTEM_VERSION,
  SHARE_HISTORY_KEY,
  SHARE_COOLDOWN_KEY,
  MAX_SHARE_HISTORY,
  generateShareId,
  getTodayString,
  createEmptyCooldownState,
} from "./shareData";
import {
  validateShare,
  assemblePayload,
  resolveMethod,
  buildCopyText,
  buildShareStats,
  type ShareValidation,
  type MethodAvailability,
} from "./shareLogic";
import { buildShareText, buildShareUrl } from "./shareTemplates";
import {
  initDefaultAdapter,
  setTelegramShareAdapter,
  isTelegramShareAvailable,
  telegramShare,
  copyToClipboard,
  nativeShare,
  detectMethodAvailability,
} from "./shareTelegramAdapter";

// ============================================================
// STATE
// ============================================================

let initialized = false;
let playerId: number = 0;
let referralCode: string = "";
let playerLevel: number = 1;
let cooldownState: ShareCooldownState = createEmptyCooldownState();
let shareHistory: ShareRecord[] = [];

// Event listeners
type EventListener = (event: ShareEvent) => void;
type AnalyticsListener = (event: ShareAnalyticsEvent) => void;
const eventListeners: EventListener[] = [];
const analyticsListeners: AnalyticsListener[] = [];

// ============================================================
// INIT
// ============================================================

function initialize(
  telegramId: number,
  refCode: string,
  level: number = 1
): void {
  playerId = telegramId;
  referralCode = refCode;
  playerLevel = level;

  initDefaultAdapter();
  loadCooldownState();
  loadShareHistory();

  initialized = true;

  console.log("[Share] Initialized:", {
    playerId,
    referralCode,
    level,
    telegramAvailable: isTelegramShareAvailable(),
    version: SHARE_SYSTEM_VERSION,
  });
}

function assertInit(): void {
  if (!initialized) throw new Error("[Share] Not initialized — call initialize() first");
}

function setPlayerLevel(level: number): void {
  playerLevel = level;
}

function setReferralCode(code: string): void {
  referralCode = code;
}

// ============================================================
// SHARE — MAIN API
// ============================================================

/**
 * Execute a share action.
 * This is THE entry point for all sharing from screens.
 */
async function share(context: ShareContext): Promise<ShareResult> {
  assertInit();

  // Inject player context
  const values = {
    referralCode,
    level: String(playerLevel),
    playerId: String(playerId),
    ...context.values,
  };
  const enrichedContext: ShareContext = { ...context, values };

  // Validate cooldown + limits
  const validation = validateShare(enrichedContext.contentType, cooldownState);
  if (!validation.canShare) {
    if (validation.reason === "cooldown") {
      emitEvent("share:cooldown", {
        contentType: enrichedContext.contentType,
        remaining: validation.cooldownRemaining,
      });
      emitAnalytics("share_cooldown_hit", {
        contentType: enrichedContext.contentType,
      });
    } else {
      emitEvent("share:limit_reached", {
        contentType: enrichedContext.contentType,
        reason: validation.reason,
      });
      emitAnalytics("share_limit_hit", {
        contentType: enrichedContext.contentType,
        reason: validation.reason,
      });
    }

    return {
      success: false,
      method: "direct_link",
      usedFallback: false,
      error: validation.reason,
      shareId: generateShareId(),
    };
  }

  // Detect available methods
  const availability = detectMethodAvailability();

  // Resolve method
  const method = resolveMethod(enrichedContext.preferredMethod, availability);

  // Assemble payload
  const payload = assemblePayload(enrichedContext, method);

  emitEvent("share:initiated", {
    contentType: payload.contentType,
    method,
    shareId: payload.shareId,
  });
  emitAnalytics("share_initiated", {
    contentType: payload.contentType,
    method,
    source: payload.source,
  });

  // Execute share
  const result = await executeShare(payload, availability);

  // Track
  if (result.success) {
    recordShare(payload, result);
    updateCooldown(payload.contentType);

    emitEvent("share:completed", {
      contentType: payload.contentType,
      method: result.method,
      usedFallback: result.usedFallback,
    });
    emitAnalytics("share_completed", {
      contentType: payload.contentType,
      method: result.method,
      usedFallback: result.usedFallback,
      source: payload.source,
    });

    // Emit content-type-specific analytics
    emitContentTypeAnalytics(payload.contentType, payload);
  } else {
    emitEvent("share:failed", {
      contentType: payload.contentType,
      method: result.method,
      error: result.error,
    });
    emitAnalytics("share_failed", {
      contentType: payload.contentType,
      method: result.method,
      error: result.error,
    });
  }

  return result;
}

// ============================================================
// EXECUTE SHARE (internal)
// ============================================================

async function executeShare(
  payload: SharePayload,
  availability: MethodAvailability
): Promise<ShareResult> {
  const { shareId, text, url, method } = payload;

  // Try primary method
  const primaryResult = await tryMethod(method, text, url, payload);
  if (primaryResult) {
    return { success: true, method, usedFallback: false, shareId };
  }

  // Fallback chain
  const fallbackMethods: ShareMethod[] = [
    "telegram_share",
    "native_share",
    "clipboard",
    "direct_link",
  ].filter((m) => m !== method && availability[m as ShareMethod]) as ShareMethod[];

  for (const fallbackMethod of fallbackMethods) {
    const fallbackResult = await tryMethod(fallbackMethod, text, url, payload);
    if (fallbackResult) {
      emitEvent("share:fallback", {
        original: method,
        fallback: fallbackMethod,
      });
      emitAnalytics("share_fallback_used", {
        original: method,
        fallback: fallbackMethod,
        contentType: payload.contentType,
      });

      return {
        success: true,
        method: fallbackMethod,
        usedFallback: true,
        shareId,
      };
    }
  }

  // All methods failed — copy URL as last resort
  const copyText = buildCopyText(text, url);
  const copied = await copyToClipboard(copyText);
  if (copied) {
    emitEvent("share:copied", { contentType: payload.contentType });
    emitAnalytics("share_copied", { contentType: payload.contentType });

    return {
      success: true,
      method: "clipboard",
      usedFallback: true,
      shareId,
    };
  }

  return {
    success: false,
    method: "direct_link",
    usedFallback: true,
    error: "all_methods_failed",
    shareId,
  };
}

async function tryMethod(
  method: ShareMethod,
  text: string,
  url: string,
  payload: SharePayload
): Promise<boolean> {
  switch (method) {
    case "telegram_share": {
      const result = await telegramShare(url, text);
      return result.success;
    }
    case "native_share": {
      return await nativeShare("HEXIUM CLICKER", text, url);
    }
    case "clipboard": {
      const copyText = buildCopyText(text, url);
      return await copyToClipboard(copyText);
    }
    case "direct_link": {
      // "Direct link" = just copy URL
      return await copyToClipboard(url);
    }
    case "telegram_inline": {
      const result = await telegramShare(url, text);
      return result.success;
    }
    default:
      return false;
  }
}

// ============================================================
// QUICK SHARE HELPERS
// ============================================================

/** Quick: invite a friend */
async function inviteFriend(source: string = "unknown"): Promise<ShareResult> {
  return share({
    contentType: "invite_friend",
    source,
    values: {},
  });
}

/** Quick: share referral link */
async function shareReferralLink(source: string = "unknown"): Promise<ShareResult> {
  return share({
    contentType: "referral_link",
    source,
    values: {},
  });
}

/** Quick: share achievement */
async function shareAchievement(
  achievementId: string,
  achievementName: string,
  achievementDesc: string,
  achievementIcon: string = "⭐",
  source: string = "achievements"
): Promise<ShareResult> {
  return share({
    contentType: "achievement",
    source,
    values: { achievementId, achievementName, achievementDesc, achievementIcon },
  });
}

/** Quick: share boss kill */
async function shareBossKill(
  bossId: string,
  bossName: string,
  damage: string | number,
  time: string,
  rank: string | number,
  source: string = "world_boss"
): Promise<ShareResult> {
  return share({
    contentType: "boss_kill",
    source,
    values: { bossId, bossName, damage, time, rank },
  });
}

/** Quick: share case drop */
async function shareCaseDrop(
  dropId: string,
  itemName: string,
  rarity: string,
  caseName: string,
  rarityIcon: string = "✨",
  source: string = "cases"
): Promise<ShareResult> {
  return share({
    contentType: "case_drop",
    source,
    values: { dropId, itemName, rarity, caseName, rarityIcon },
  });
}

/** Quick: share battle pass level */
async function shareBattlePassLevel(
  bpLevel: number,
  rewardName: string,
  season: number | string = 1,
  isPremium: boolean = false,
  rewardIcon: string = "🎁",
  source: string = "battle_pass"
): Promise<ShareResult> {
  return share({
    contentType: "battle_pass_level",
    source,
    values: {
      bpLevel,
      rewardName,
      season,
      rewardIcon,
      premiumBadge: isPremium ? "⭐ PREMIUM" : "",
    },
  });
}

/** Quick: share corporation invite */
async function shareCorporationInvite(
  corpId: string,
  corpName: string,
  memberCount: number,
  maxMembers: number = 50,
  corpRank: string | number = "?",
  source: string = "corporation"
): Promise<ShareResult> {
  return share({
    contentType: "corporation_invite",
    source,
    values: { corpId, corpName, memberCount, maxMembers, corpRank },
  });
}

/** Quick: share event */
async function shareEvent(
  eventId: string,
  eventName: string,
  eventDesc: string = "",
  endsAt: string = "soon",
  rewards: string = "exclusive items",
  eventIcon: string = "🎉",
  source: string = "events"
): Promise<ShareResult> {
  return share({
    contentType: "event",
    source,
    values: { eventId, eventName, eventDesc, endsAt, rewards, eventIcon },
  });
}

/** Quick: share leaderboard rank */
async function shareLeaderboardRank(
  rank: number,
  hexiumAmount: number | string,
  level: number | string,
  source: string = "leaderboard"
): Promise<ShareResult> {
  return share({
    contentType: "leaderboard_rank",
    source,
    values: { rank, hexiumAmount, level },
  });
}

// ============================================================
// VALIDATION (public)
// ============================================================

/** Check if a share type can be shared right now */
function canShare(contentType: ShareContentType): ShareValidation {
  return validateShare(contentType, cooldownState);
}

/** Get available share methods */
function getAvailableMethods(): MethodAvailability {
  return detectMethodAvailability();
}

// ============================================================
// COOLDOWN & LIMITS MANAGEMENT
// ============================================================

function updateCooldown(contentType: ShareContentType): void {
  const today = getTodayString();

  // Reset daily counts on new day
  if (cooldownState.countDate !== today) {
    cooldownState.dailyCounts = {};
    cooldownState.countDate = today;
  }

  cooldownState.lastShareTime[contentType] = Date.now();
  cooldownState.dailyCounts[contentType] =
    (cooldownState.dailyCounts[contentType] ?? 0) + 1;

  saveCooldownState();
}

function loadCooldownState(): void {
  try {
    const raw = localStorage.getItem(SHARE_COOLDOWN_KEY);
    if (raw) {
      cooldownState = JSON.parse(raw);
      // Reset if new day
      if (cooldownState.countDate !== getTodayString()) {
        cooldownState.dailyCounts = {};
        cooldownState.countDate = getTodayString();
      }
    }
  } catch {
    cooldownState = createEmptyCooldownState();
  }
}

function saveCooldownState(): void {
  try {
    localStorage.setItem(SHARE_COOLDOWN_KEY, JSON.stringify(cooldownState));
  } catch (err) {
    console.error("[Share] Failed to save cooldown state:", err);
  }
}

// ============================================================
// HISTORY
// ============================================================

function recordShare(payload: SharePayload, result: ShareResult): void {
  const record: ShareRecord = {
    shareId: payload.shareId,
    contentType: payload.contentType,
    method: result.method,
    success: result.success,
    usedFallback: result.usedFallback,
    timestamp: Date.now(),
    source: payload.source,
    url: payload.url,
  };

  shareHistory.unshift(record);
  if (shareHistory.length > MAX_SHARE_HISTORY) {
    shareHistory = shareHistory.slice(0, MAX_SHARE_HISTORY);
  }

  saveShareHistory();
}

function loadShareHistory(): void {
  try {
    const raw = localStorage.getItem(SHARE_HISTORY_KEY);
    if (raw) shareHistory = JSON.parse(raw);
  } catch {
    shareHistory = [];
  }
}

function saveShareHistory(): void {
  try {
    localStorage.setItem(SHARE_HISTORY_KEY, JSON.stringify(shareHistory));
  } catch (err) {
    console.error("[Share] Failed to save history:", err);
  }
}

function getHistory(limit?: number): ShareRecord[] {
  return limit ? shareHistory.slice(0, limit) : [...shareHistory];
}

function clearHistory(): void {
  shareHistory = [];
  try { localStorage.removeItem(SHARE_HISTORY_KEY); } catch {}
}

// ============================================================
// STATS
// ============================================================

function getStats(): ShareStats {
  return buildShareStats(shareHistory);
}

// ============================================================
// CLOUD SAVE
// ============================================================

function getStateForSave(): Record<string, unknown> {
  return {
    shareHistory: shareHistory.slice(0, 30), // last 30
    cooldownState: {
      dailyCounts: cooldownState.dailyCounts,
      countDate: cooldownState.countDate,
    },
  };
}

function restoreFromSave(state: Record<string, unknown>): void {
  if (state.shareHistory && Array.isArray(state.shareHistory)) {
    shareHistory = state.shareHistory as ShareRecord[];
    saveShareHistory();
  }
  if (state.cooldownState) {
    const saved = state.cooldownState as Partial<ShareCooldownState>;
    cooldownState.dailyCounts = saved.dailyCounts ?? {};
    cooldownState.countDate = saved.countDate ?? getTodayString();
    saveCooldownState();
  }
  console.log("[Share] Restored from cloud save");
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

function emitEvent(type: ShareEventType, data: Record<string, unknown>): void {
  const event: ShareEvent = { type, data, timestamp: Date.now() };
  for (const l of eventListeners) {
    try { l(event); } catch (e) { console.error("[Share] Event error:", e); }
  }
}

function emitAnalytics(
  type: ShareAnalyticsEventType,
  data: Record<string, unknown>
): void {
  const event: ShareAnalyticsEvent = { type, data, timestamp: Date.now() };
  for (const l of analyticsListeners) {
    try { l(event); } catch (e) { console.error("[Share] Analytics error:", e); }
  }
}

/** Emit content-type-specific analytics event */
function emitContentTypeAnalytics(
  contentType: ShareContentType,
  payload: SharePayload
): void {
  const typeMap: Partial<Record<ShareContentType, ShareAnalyticsEventType>> = {
    invite_friend: "invite_shared",
    referral_link: "referral_link_shared",
    achievement: "achievement_shared",
    boss_kill: "boss_kill_shared",
    case_drop: "case_drop_shared",
    battle_pass_level: "bp_level_shared",
    corporation_invite: "corp_invite_shared",
    event: "event_shared",
  };

  const analyticsType = typeMap[contentType];
  if (analyticsType) {
    emitAnalytics(analyticsType, {
      contentType,
      source: payload.source,
      shareId: payload.shareId,
    });
  }
}

// ============================================================
// ADAPTER
// ============================================================

function setAdapter(adapter: TelegramShareAdapter): void {
  setTelegramShareAdapter(adapter);
}

// ============================================================
// PREVIEW (for UI buttons)
// ============================================================

/** Preview share text without actually sharing */
function previewText(
  contentType: ShareContentType,
  values: Record<string, string | number> = {}
): string {
  return buildShareText(contentType, {
    referralCode,
    level: String(playerLevel),
    playerId: String(playerId),
    ...values,
  });
}

/** Preview share URL without sharing */
function previewUrl(
  contentType: ShareContentType,
  values: Record<string, string | number> = {}
): string {
  return buildShareUrl(contentType, {
    referralCode,
    level: String(playerLevel),
    playerId: String(playerId),
    ...values,
  });
}

// ============================================================
// CLEANUP
// ============================================================

function destroy(): void {
  eventListeners.length = 0;
  analyticsListeners.length = 0;
  shareHistory = [];
  cooldownState = createEmptyCooldownState();
  initialized = false;
  console.log("[Share] Destroyed");
}

// ============================================================
// EXPORT
// ============================================================

export const shareService = {
  // Init
  initialize,
  setPlayerLevel,
  setReferralCode,
  setAdapter,

  // Main API
  share,

  // Quick helpers
  inviteFriend,
  shareReferralLink,
  shareAchievement,
  shareBossKill,
  shareCaseDrop,
  shareBattlePassLevel,
  shareCorporationInvite,
  shareEvent,
  shareLeaderboardRank,

  // Validation
  canShare,
  getAvailableMethods,

  // History & Stats
  getHistory,
  clearHistory,
  getStats,

  // Cloud Save
  getStateForSave,
  restoreFromSave,

  // Preview
  previewText,
  previewUrl,

  // Events
  onEvent,
  offEvent,
  onAnalytics,
  offAnalytics,

  // Cleanup
  destroy,
};
