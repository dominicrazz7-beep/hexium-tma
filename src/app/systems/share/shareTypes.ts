// ============================================================
// HEXIUM CLICKER · Share System · Types
// ============================================================
// FOUNDATION v2 · Module 5/6
// Sharing layer: Referral invites, Achievements, Boss kills,
// Case drops, Battle Pass, Corporation invites, Events
// Connects to: Referral, Stars, Achievements, World Bosses, Events
// ============================================================

// --- Share Content Type ---

export type ShareContentType =
  | "invite_friend"        // → Referral System
  | "referral_link"        // → Referral System (raw link)
  | "achievement"          // → Achievements screen
  | "boss_kill"            // → World Boss screen
  | "case_drop"            // → Cases screen
  | "battle_pass_level"    // → Battle Pass screen
  | "corporation_invite"   // → Corporation screen
  | "event"                // → Events screen
  | "vip_status"           // → VIP / Stars purchase
  | "purchase_brag"        // → Stars purchase flex
  | "leaderboard_rank"     // → Leaderboard screen
  | "custom";              // → extensible

// --- Share Method ---

export type ShareMethod =
  | "telegram_share"       // Telegram WebApp switchInlineQuery / share URL
  | "telegram_inline"      // Telegram inline mode (future)
  | "clipboard"            // navigator.clipboard.writeText fallback
  | "native_share"         // navigator.share Web Share API
  | "direct_link";         // copy link to clipboard

// --- Share Payload ---
// What gets assembled before sharing

export interface SharePayload {
  /** Unique share ID for tracking */
  shareId: string;
  /** Content type */
  contentType: ShareContentType;
  /** Share text (assembled from template) */
  text: string;
  /** Share URL (deep link or referral) */
  url: string;
  /** Optional image URL (for rich previews) */
  imageUrl?: string;
  /** Share method used */
  method: ShareMethod;
  /** Source screen / context */
  source: string;
  /** Custom data attached to this share */
  meta: Record<string, unknown>;
  /** Timestamp */
  createdAt: number;
}

// --- Share Result ---

export interface ShareResult {
  /** Share completed successfully? */
  success: boolean;
  /** Share method actually used */
  method: ShareMethod;
  /** Fallback was used? */
  usedFallback: boolean;
  /** Error if failed */
  error?: string;
  /** Share ID for tracking */
  shareId: string;
}

// --- Share Template ---
// Defines how to build text for each content type

export interface ShareTemplate {
  /** Content type this template handles */
  contentType: ShareContentType;
  /** Template display name */
  name: string;
  /** Template icon */
  icon: string;
  /** Template text with {placeholders} */
  textTemplate: string;
  /** URL template with {placeholders} */
  urlTemplate: string;
  /** Default placeholder values */
  defaults: Record<string, string>;
  /** Whether this template supports images */
  supportsImage: boolean;
}

// --- Share Context ---
// Data provided by the calling screen to fill templates

export interface ShareContext {
  /** Content type */
  contentType: ShareContentType;
  /** Source screen name */
  source: string;
  /** Template placeholder values */
  values: Record<string, string | number>;
  /** Override share URL (if not from template) */
  customUrl?: string;
  /** Override share text */
  customText?: string;
  /** Image URL for rich previews */
  imageUrl?: string;
  /** Preferred share method */
  preferredMethod?: ShareMethod;
  /** Custom metadata */
  meta?: Record<string, unknown>;
}

// --- Share Cooldown ---

export interface ShareCooldownState {
  /** Timestamp of last share per content type */
  lastShareTime: Record<string, number>;
  /** Daily share counts per content type */
  dailyCounts: Record<string, number>;
  /** Date string of current count period (YYYY-MM-DD) */
  countDate: string;
}

// --- Share Stats ---

export interface ShareStats {
  /** Total shares ever */
  totalShares: number;
  /** Shares today */
  sharesToday: number;
  /** Shares by content type */
  byContentType: Record<string, number>;
  /** Shares by method */
  byMethod: Record<string, number>;
  /** Successful share rate */
  successRate: number;
}

// --- Share Record (history) ---

export interface ShareRecord {
  /** Share ID */
  shareId: string;
  /** Content type */
  contentType: ShareContentType;
  /** Method used */
  method: ShareMethod;
  /** Was successful */
  success: boolean;
  /** Used fallback? */
  usedFallback: boolean;
  /** Timestamp */
  timestamp: number;
  /** Source screen */
  source: string;
  /** Share URL */
  url: string;
}

// --- Telegram Share Adapter ---

export interface TelegramShareAdapter {
  /** Is Telegram share available? */
  isAvailable(): boolean;
  /** Share via Telegram switchInlineQuery */
  shareInline(text: string): Promise<boolean>;
  /** Open share URL in Telegram */
  shareUrl(url: string, text: string): Promise<boolean>;
  /** Share via Telegram's sendMessage (deep link) */
  shareDirect(url: string): Promise<boolean>;
}

// --- Share Analytics Event ---

export type ShareAnalyticsEventType =
  | "share_initiated"
  | "share_completed"
  | "share_failed"
  | "share_copied"
  | "share_fallback_used"
  | "share_cooldown_hit"
  | "share_limit_hit"
  | "invite_shared"
  | "referral_link_shared"
  | "achievement_shared"
  | "boss_kill_shared"
  | "case_drop_shared"
  | "bp_level_shared"
  | "corp_invite_shared"
  | "event_shared";

export interface ShareAnalyticsEvent {
  type: ShareAnalyticsEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

// --- Share Event (internal) ---

export type ShareEventType =
  | "share:initiated"
  | "share:completed"
  | "share:failed"
  | "share:copied"
  | "share:fallback"
  | "share:cooldown"
  | "share:limit_reached";

export interface ShareEvent {
  type: ShareEventType;
  data: Record<string, unknown>;
  timestamp: number;
}
