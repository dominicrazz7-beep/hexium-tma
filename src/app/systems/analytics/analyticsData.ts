// ============================================================
// HEXIUM CLICKER · Analytics System · Data & Constants
// ============================================================

import type { AnalyticsConfig, AnalyticsSaveState, EventDefinition } from "./analyticsTypes";

// ============================================================
// VERSION
// ============================================================

export const ANALYTICS_SYSTEM_VERSION = 1;

// ============================================================
// STORAGE KEYS
// ============================================================

export const ANALYTICS_QUEUE_KEY = "hexium_analytics_queue";
export const ANALYTICS_SESSION_KEY = "hexium_analytics_session";
export const ANALYTICS_STATE_KEY = "hexium_analytics_state";
export const ANALYTICS_IDENTITY_KEY = "hexium_analytics_identity";
export const CLOUD_SAVE_ANALYTICS_KEY = "analyticsState";

/** Shared device ID key (same as Cloud Save module) */
export const DEVICE_ID_KEY = "hexium_device_id";

// ============================================================
// DEFAULT CONFIG
// ============================================================

export const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  flushIntervalMs: 30_000,               // 30s
  bufferFlushThreshold: 20,              // auto-flush at 20 events
  bufferMaxSize: 100,                     // max 100 in buffer
  queueMaxSize: 500,                      // max 500 offline
  maxRetries: 3,
  retryDelayMs: 2_000,                   // 2s base (exponential)
  debug: false,
  trackPerformance: true,
  trackScreenViews: true,
  sessionTimeoutMs: 30 * 60 * 1000,      // 30 minutes
  endpointUrl: "",                        // empty = local only (no backend yet)
  hashPlayerIds: true,
};

// ============================================================
// DEFAULT SAVE STATE
// ============================================================

export function createEmptySaveState(): AnalyticsSaveState {
  return {
    totalEventsTracked: 0,
    totalSessions: 0,
    firstSeenAt: 0,
    lastActiveAt: 0,
    activeDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastStreakDate: "",
  };
}

// ============================================================
// EVENT DEFINITIONS (40+ events)
// ============================================================

export const EVENT_DEFINITIONS: EventDefinition[] = [

  // ═══════ SESSION (5) ═══════
  { name: "session_start",    category: "session", description: "App opened, session started", requiredKeys: ["entrySource"], optionalKeys: ["deepLink", "referralCode"] },
  { name: "session_end",      category: "session", description: "App closed or backgrounded", requiredKeys: ["duration"], optionalKeys: ["eventCount", "screensVisited"] },
  { name: "session_resume",   category: "session", description: "App returned from background", requiredKeys: ["pauseDuration"], optionalKeys: [] },
  { name: "session_heartbeat",category: "session", description: "Periodic alive signal", requiredKeys: ["uptime"], optionalKeys: ["memoryUsage"] },
  { name: "first_open",       category: "session", description: "Very first app open", requiredKeys: [], optionalKeys: ["referralCode", "platform"] },

  // ═══════ GAMEPLAY (8) ═══════
  { name: "tap_click",        category: "gameplay", description: "Player tapped the clicker", requiredKeys: ["tapValue"], optionalKeys: ["comboCount", "isCritical"] },
  { name: "auto_click",       category: "gameplay", description: "Auto-clicker tick", requiredKeys: ["autoValue", "generators"], optionalKeys: [] },
  { name: "generator_buy",    category: "gameplay", description: "Player bought a generator", requiredKeys: ["generatorId", "level", "cost"], optionalKeys: ["currency"] },
  { name: "generator_upgrade",category: "gameplay", description: "Player upgraded a generator", requiredKeys: ["generatorId", "fromLevel", "toLevel", "cost"], optionalKeys: [] },
  { name: "prestige_reset",   category: "gameplay", description: "Player prestiged", requiredKeys: ["prestigeLevel", "quantumEarned"], optionalKeys: ["totalHexium", "playTime"] },
  { name: "quest_complete",   category: "gameplay", description: "Quest completed", requiredKeys: ["questId", "questType"], optionalKeys: ["reward", "timeToComplete"] },
  { name: "daily_login",      category: "gameplay", description: "Daily login bonus claimed", requiredKeys: ["day", "streak"], optionalKeys: ["reward"] },
  { name: "tutorial_step",    category: "gameplay", description: "Tutorial step completed", requiredKeys: ["step", "totalSteps"], optionalKeys: ["skipped"] },

  // ═══════ PROGRESSION (6) ═══════
  { name: "level_up",         category: "progression", description: "Player leveled up", requiredKeys: ["fromLevel", "toLevel"], optionalKeys: ["totalXp"] },
  { name: "xp_earned",        category: "progression", description: "XP gained", requiredKeys: ["amount", "source"], optionalKeys: [] },
  { name: "achievement_unlock", category: "progression", description: "Achievement unlocked", requiredKeys: ["achievementId", "achievementName"], optionalKeys: ["category"] },
  { name: "milestone_reached",  category: "progression", description: "Major milestone", requiredKeys: ["milestoneId", "value"], optionalKeys: [] },
  { name: "bp_level_up",      category: "progression", description: "Battle pass level up", requiredKeys: ["bpLevel", "season"], optionalKeys: ["isPremium", "reward"] },
  { name: "bp_reward_claim",  category: "progression", description: "Battle pass reward claimed", requiredKeys: ["bpLevel", "rewardId", "isPremium"], optionalKeys: [] },

  // ═══════ ECONOMY (5) ═══════
  { name: "currency_earn",    category: "economy", description: "Currency earned", requiredKeys: ["currency", "amount", "source"], optionalKeys: ["balance"] },
  { name: "currency_spend",   category: "economy", description: "Currency spent", requiredKeys: ["currency", "amount", "target"], optionalKeys: ["balance"] },
  { name: "case_open",        category: "economy", description: "Case opened", requiredKeys: ["caseId", "caseName"], optionalKeys: ["itemReceived", "rarity"] },
  { name: "item_received",    category: "economy", description: "Item received (any source)", requiredKeys: ["itemId", "source"], optionalKeys: ["rarity", "quantity"] },
  { name: "resource_convert", category: "economy", description: "Resource conversion", requiredKeys: ["fromCurrency", "toCurrency", "fromAmount", "toAmount"], optionalKeys: [] },

  // ═══════ MONETIZATION (6) ═══════
  { name: "stars_purchase_start",  category: "monetization", description: "Stars purchase initiated", requiredKeys: ["productId", "starsAmount"], optionalKeys: ["productCategory"] },
  { name: "stars_purchase_success",category: "monetization", description: "Stars purchase completed", requiredKeys: ["productId", "starsAmount", "invoiceId"], optionalKeys: ["productCategory"] },
  { name: "stars_purchase_fail",   category: "monetization", description: "Stars purchase failed", requiredKeys: ["productId", "error"], optionalKeys: ["starsAmount"] },
  { name: "vip_activated",    category: "monetization", description: "VIP status activated", requiredKeys: ["duration", "starsSpent"], optionalKeys: ["tier"] },
  { name: "offer_shown",      category: "monetization", description: "Special offer displayed", requiredKeys: ["offerId", "offerType"], optionalKeys: ["price"] },
  { name: "offer_purchased",  category: "monetization", description: "Special offer bought", requiredKeys: ["offerId", "starsAmount"], optionalKeys: ["offerType"] },

  // ═══════ SOCIAL (7) ═══════
  { name: "referral_created",   category: "social", description: "New referral registered", requiredKeys: ["referralCode"], optionalKeys: ["referralTier"] },
  { name: "referral_rewarded",  category: "social", description: "Referral reward received", requiredKeys: ["referralCount", "rewardType"], optionalKeys: ["rewardAmount"] },
  { name: "share_completed",    category: "social", description: "Content shared successfully", requiredKeys: ["contentType", "method"], optionalKeys: ["usedFallback", "source"] },
  { name: "share_failed",       category: "social", description: "Share attempt failed", requiredKeys: ["contentType", "error"], optionalKeys: ["method"] },
  { name: "invite_sent",        category: "social", description: "Friend invite sent", requiredKeys: ["method"], optionalKeys: ["source"] },
  { name: "corp_joined",        category: "social", description: "Joined a corporation", requiredKeys: ["corpId"], optionalKeys: ["corpName", "memberCount"] },
  { name: "boss_fight",         category: "social", description: "World boss participation", requiredKeys: ["bossId", "damage"], optionalKeys: ["rank", "reward"] },

  // ═══════ UI (4) ═══════
  { name: "screen_view",      category: "ui", description: "Screen opened/viewed", requiredKeys: ["screenName"], optionalKeys: ["fromScreen", "viewDuration"] },
  { name: "screen_exit",      category: "ui", description: "Screen closed", requiredKeys: ["screenName", "duration"], optionalKeys: ["action"] },
  { name: "button_click",     category: "ui", description: "UI button clicked", requiredKeys: ["buttonId", "screen"], optionalKeys: ["context"] },
  { name: "modal_shown",      category: "ui", description: "Modal/popup displayed", requiredKeys: ["modalId"], optionalKeys: ["screen", "trigger"] },

  // ═══════ PERFORMANCE (4) ═══════
  { name: "app_load",         category: "performance", description: "App initial load time", requiredKeys: ["loadTimeMs"], optionalKeys: ["bundleSize"] },
  { name: "fps_drop",         category: "performance", description: "FPS dropped below threshold", requiredKeys: ["fps", "screen"], optionalKeys: ["duration"] },
  { name: "memory_warning",   category: "performance", description: "Memory usage high", requiredKeys: ["usedMb", "limitMb"], optionalKeys: [] },
  { name: "error_caught",     category: "performance", description: "Runtime error caught", requiredKeys: ["errorType", "message"], optionalKeys: ["stack", "screen"] },

  // ═══════ CLOUD (3) ═══════
  { name: "cloud_save_success",  category: "cloud", description: "Cloud save succeeded", requiredKeys: ["saveSlot", "sizeBytes"], optionalKeys: ["duration"] },
  { name: "cloud_save_fail",     category: "cloud", description: "Cloud save failed", requiredKeys: ["error"], optionalKeys: ["saveSlot"] },
  { name: "cloud_load_success",  category: "cloud", description: "Cloud load succeeded", requiredKeys: ["saveSlot", "version"], optionalKeys: ["duration", "migrated"] },

  // ═══════ ENGAGEMENT (3) ═══════
  { name: "retention_day",    category: "engagement", description: "Player returned on day N", requiredKeys: ["day"], optionalKeys: ["totalSessions"] },
  { name: "streak_milestone", category: "engagement", description: "Login streak milestone", requiredKeys: ["streakDays"], optionalKeys: ["reward"] },
  { name: "idle_return",      category: "engagement", description: "Returned after idle period", requiredKeys: ["idleDuration"], optionalKeys: ["offlineEarnings"] },
];

// ============================================================
// EVENT NAME → DEFINITION MAP
// ============================================================

const EVENT_MAP = new Map<string, EventDefinition>(
  EVENT_DEFINITIONS.map((d) => [d.name, d])
);

export function getEventDefinition(name: string): EventDefinition | undefined {
  return EVENT_MAP.get(name);
}

export function getAllEventNames(): string[] {
  return EVENT_DEFINITIONS.map((d) => d.name);
}

export function getEventsByCategory(category: string): EventDefinition[] {
  return EVENT_DEFINITIONS.filter((d) => d.category === category);
}

// ============================================================
// UTILITY
// ============================================================

/** Generate unique event ID */
export function generateEventId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 7);
  return `hxa_${ts}_${rnd}`;
}

/** Generate unique session ID */
export function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `hxs_${ts}_${rnd}`;
}

/** Get today as YYYY-MM-DD */
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Simple non-crypto hash for privacy (FNV-1a) */
export function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
