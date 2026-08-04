// ============================================================
// HEXIUM CLICKER · Analytics System · Types
// ============================================================
// FOUNDATION v2 · Module 6/6 — Final foundation module.
// Connects to: Telegram, Referral, Cloud Save, Stars, Share.
// ============================================================

// --- Analytics Event Category ---

export type AnalyticsCategory =
  | "session"           // Session lifecycle
  | "gameplay"          // Core gameplay events
  | "progression"       // Level, XP, upgrades
  | "economy"           // Currency earn/spend
  | "monetization"      // Stars, purchases, VIP
  | "social"            // Referral, share, corporation
  | "ui"                // Screen views, navigation
  | "performance"       // FPS, load time, memory
  | "cloud"             // Cloud save events
  | "system"            // Errors, warnings, init
  | "engagement";       // Retention, streaks, milestones

// --- Analytics Event ---

export interface AnalyticsEvent {
  /** Unique event ID */
  eventId: string;
  /** Event name (e.g. "session_start", "tap_click") */
  name: string;
  /** Event category */
  category: AnalyticsCategory;
  /** Source module that generated the event */
  source: string;
  /** Privacy-safe payload (no PII) */
  data: Record<string, unknown>;
  /** Event timestamp (ms) */
  timestamp: number;
  /** Session ID */
  sessionId: string;
  /** Sequence number within session */
  sequence: number;
}

// --- User Identity (privacy-safe) ---

export interface AnalyticsIdentity {
  /** Hashed player ID (never raw Telegram ID) */
  playerId: string;
  /** Device fingerprint (hashed) */
  deviceId: string;
  /** Platform */
  platform: "telegram_webapp" | "browser" | "unknown";
  /** App version */
  appVersion: string;
  /** Language */
  language: string;
}

// --- Session Data ---

export interface AnalyticsSession {
  /** Unique session ID */
  sessionId: string;
  /** Session start timestamp */
  startedAt: number;
  /** Session end timestamp (0 = active) */
  endedAt: number;
  /** Duration in seconds */
  duration: number;
  /** Events count in this session */
  eventCount: number;
  /** Screens visited */
  screensVisited: string[];
  /** Was user active (had interactions)? */
  wasActive: boolean;
  /** Session source (deep link, direct, referral) */
  entrySource: string;
}

// --- Queue Item ---

export interface QueueItem {
  /** Queue position */
  id: number;
  /** The event */
  event: AnalyticsEvent;
  /** Retry count */
  retries: number;
  /** Added to queue timestamp */
  queuedAt: number;
  /** Status */
  status: "pending" | "sending" | "failed";
}

// --- Flush Result ---

export interface FlushResult {
  /** Number of events flushed */
  flushed: number;
  /** Number of events failed */
  failed: number;
  /** Were events dropped (queue overflow)? */
  dropped: number;
  /** Flush duration ms */
  durationMs: number;
}

// --- Event Buffer ---

export interface EventBuffer {
  /** Buffered events not yet queued */
  events: AnalyticsEvent[];
  /** Buffer capacity */
  maxSize: number;
  /** Auto-flush threshold */
  flushThreshold: number;
}

// --- Analytics Config ---

export interface AnalyticsConfig {
  /** Enable/disable analytics */
  enabled: boolean;
  /** Flush interval in ms */
  flushIntervalMs: number;
  /** Max events in buffer before auto-flush */
  bufferFlushThreshold: number;
  /** Max buffer size */
  bufferMaxSize: number;
  /** Max queue size (offline) */
  queueMaxSize: number;
  /** Max retries per event */
  maxRetries: number;
  /** Retry delay base (ms) — exponential backoff */
  retryDelayMs: number;
  /** Enable debug logging */
  debug: boolean;
  /** Enable performance tracking */
  trackPerformance: boolean;
  /** Enable screen view tracking */
  trackScreenViews: boolean;
  /** Session timeout (ms) — new session after inactivity */
  sessionTimeoutMs: number;
  /** Endpoint URL (future — backend) */
  endpointUrl: string;
  /** Privacy: hash player IDs */
  hashPlayerIds: boolean;
}

// --- Event Definition ---

export interface EventDefinition {
  /** Event name */
  name: string;
  /** Category */
  category: AnalyticsCategory;
  /** Description */
  description: string;
  /** Required data keys */
  requiredKeys: string[];
  /** Optional data keys */
  optionalKeys: string[];
}

// --- Analytics State (for cloud save) ---

export interface AnalyticsSaveState {
  /** Total events tracked ever */
  totalEventsTracked: number;
  /** Total sessions */
  totalSessions: number;
  /** First seen timestamp */
  firstSeenAt: number;
  /** Last active timestamp */
  lastActiveAt: number;
  /** Daily active days count */
  activeDays: number;
  /** Longest streak (days) */
  longestStreak: number;
  /** Current streak */
  currentStreak: number;
  /** Last streak date (YYYY-MM-DD) */
  lastStreakDate: string;
}

// --- Transport Adapter ---

export interface AnalyticsTransport {
  /** Send batch of events */
  send(events: AnalyticsEvent[], identity: AnalyticsIdentity): Promise<boolean>;
  /** Is transport available? */
  isAvailable(): boolean;
}

// --- Analytics Listener ---

export type AnalyticsListener = (event: AnalyticsEvent) => void;

// --- Performance Metric ---

export interface PerformanceMetric {
  /** Metric name */
  name: string;
  /** Value */
  value: number;
  /** Unit */
  unit: "ms" | "fps" | "bytes" | "count" | "percent";
  /** Timestamp */
  timestamp: number;
}
