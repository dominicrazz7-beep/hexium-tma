// ============================================================
// HEXIUM CLICKER · Share System · Data & Constants
// ============================================================
// Configuration, limits, defaults, bot name, deep link base.
// ============================================================

import type { ShareCooldownState, ShareContentType, ShareMethod } from "./shareTypes";

// ============================================================
// VERSION
// ============================================================

export const SHARE_SYSTEM_VERSION = 1;

// ============================================================
// TELEGRAM BOT / APP CONFIG
// ============================================================

/** Bot username for t.me links (placeholder — set at init) */
let BOT_USERNAME = "HexiumClickerBot";

/** Mini App short name for direct links */
let APP_SHORT_NAME = "hexium";

export function setBotUsername(name: string): void {
  BOT_USERNAME = name;
}

export function getBotUsername(): string {
  return BOT_USERNAME;
}

export function setAppShortName(name: string): void {
  APP_SHORT_NAME = name;
}

export function getAppShortName(): string {
  return APP_SHORT_NAME;
}

// ============================================================
// DEEP LINK / URL CONFIG
// ============================================================

/** Base URL for Telegram bot deep links */
export function getDeepLinkBase(): string {
  return `https://t.me/${BOT_USERNAME}`;
}

/** Base URL for Mini App direct launch */
export function getAppLinkBase(): string {
  return `https://t.me/${BOT_USERNAME}/${APP_SHORT_NAME}`;
}

/** Telegram share URL (opens share dialog in Telegram) */
export function getTelegramShareUrl(url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}

// ============================================================
// STORAGE KEYS
// ============================================================

export const SHARE_HISTORY_KEY = "hexium_share_history";
export const SHARE_COOLDOWN_KEY = "hexium_share_cooldowns";
export const SHARE_STATS_KEY = "hexium_share_stats";
export const CLOUD_SAVE_SHARE_KEY = "shareState";

// ============================================================
// LIMITS & CONFIG
// ============================================================

/** Max share history records stored locally */
export const MAX_SHARE_HISTORY = 100;

/** Cooldown per content type (ms) */
export const SHARE_COOLDOWNS: Record<ShareContentType, number> = {
  invite_friend:      10_000,   // 10s — frequent use OK
  referral_link:      10_000,   // 10s
  achievement:        30_000,   // 30s — prevent spam
  boss_kill:          60_000,   // 60s — rare events
  case_drop:          30_000,   // 30s
  battle_pass_level:  30_000,   // 30s
  corporation_invite: 60_000,   // 60s
  event:              30_000,   // 30s
  vip_status:         120_000,  // 2min — one-time flex
  purchase_brag:      120_000,  // 2min
  leaderboard_rank:   60_000,   // 60s
  custom:             15_000,   // 15s
};

/** Daily share limits per content type (0 = unlimited) */
export const DAILY_SHARE_LIMITS: Record<ShareContentType, number> = {
  invite_friend:      50,
  referral_link:      50,
  achievement:        20,
  boss_kill:          10,
  case_drop:          15,
  battle_pass_level:  10,
  corporation_invite: 10,
  event:              15,
  vip_status:         5,
  purchase_brag:      5,
  leaderboard_rank:   10,
  custom:             30,
};

/** Total daily shares across all types */
export const MAX_DAILY_SHARES_TOTAL = 100;

// ============================================================
// METHOD PRIORITY
// ============================================================

/**
 * Fallback chain: try methods in this order.
 * If preferred method fails, walk down the chain.
 */
export const METHOD_FALLBACK_CHAIN: ShareMethod[] = [
  "telegram_share",
  "native_share",
  "clipboard",
  "direct_link",
];

// ============================================================
// DEFAULT STATE
// ============================================================

export function createEmptyCooldownState(): ShareCooldownState {
  return {
    lastShareTime: {},
    dailyCounts: {},
    countDate: getTodayString(),
  };
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// UTILITY
// ============================================================

/** Generate unique share ID */
export function generateShareId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `hxs_${ts}_${rnd}`;
}
