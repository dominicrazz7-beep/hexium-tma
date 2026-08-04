// ============================================================
// HEXIUM CLICKER · Analytics System · Storage
// ============================================================
// Persistent storage for identity, session, aggregate state.
// Privacy-safe: hashes player IDs before storing.
// ============================================================

import type {
  AnalyticsIdentity,
  AnalyticsSession,
  AnalyticsSaveState,
} from "./analyticsTypes";
import {
  ANALYTICS_SESSION_KEY,
  ANALYTICS_STATE_KEY,
  ANALYTICS_IDENTITY_KEY,
  DEVICE_ID_KEY,
  createEmptySaveState,
  generateSessionId,
  getTodayString,
  hashString,
} from "./analyticsData";

// ============================================================
// IDENTITY
// ============================================================

/** Create analytics identity (privacy-safe) */
export function createIdentity(
  telegramId: number,
  appVersion: string = "1.0.0",
  language: string = "uk",
  hashIds: boolean = true
): AnalyticsIdentity {
  const rawPlayerId = String(telegramId);
  const playerId = hashIds ? hashString(rawPlayerId) : rawPlayerId;
  const deviceId = generateDeviceId();

  const identity: AnalyticsIdentity = {
    playerId,
    deviceId,
    platform: detectPlatform(),
    appVersion,
    language,
  };

  saveIdentity(identity);
  return identity;
}

/** Generate stable device ID from browser fingerprint */
function generateDeviceId(): string {
  // Try to load existing
  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY);
    if (saved) return saved;
  } catch {}

  // Generate new (simple fingerprint)
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join("|");

  const id = hashString(parts);

  try {
    localStorage.setItem(DEVICE_ID_KEY, id);
  } catch {}

  return id;
}

/** Detect platform */
function detectPlatform(): AnalyticsIdentity["platform"] {
  if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
    return "telegram_webapp";
  }
  if (typeof window !== "undefined") return "browser";
  return "unknown";
}

/** Save identity */
function saveIdentity(identity: AnalyticsIdentity): void {
  try {
    localStorage.setItem(ANALYTICS_IDENTITY_KEY, JSON.stringify(identity));
  } catch {}
}

/** Load identity */
export function loadIdentity(): AnalyticsIdentity | null {
  try {
    const raw = localStorage.getItem(ANALYTICS_IDENTITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============================================================
// SESSION
// ============================================================

/** Create new session */
export function createSession(entrySource: string = "direct"): AnalyticsSession {
  const session: AnalyticsSession = {
    sessionId: generateSessionId(),
    startedAt: Date.now(),
    endedAt: 0,
    duration: 0,
    eventCount: 0,
    screensVisited: [],
    wasActive: false,
    entrySource,
  };

  saveSession(session);
  return session;
}

/** End session */
export function endSession(session: AnalyticsSession): AnalyticsSession {
  const updated: AnalyticsSession = {
    ...session,
    endedAt: Date.now(),
    duration: Math.floor((Date.now() - session.startedAt) / 1000),
  };
  saveSession(updated);
  return updated;
}

/** Update session (event count, screens) */
export function updateSession(
  session: AnalyticsSession,
  eventName: string,
  screenName?: string
): AnalyticsSession {
  const updated: AnalyticsSession = {
    ...session,
    eventCount: session.eventCount + 1,
    wasActive: true,
    duration: Math.floor((Date.now() - session.startedAt) / 1000),
  };

  if (screenName && !updated.screensVisited.includes(screenName)) {
    updated.screensVisited = [...updated.screensVisited, screenName];
  }

  saveSession(updated);
  return updated;
}

/** Check if session is expired */
export function isSessionExpired(
  session: AnalyticsSession,
  timeoutMs: number
): boolean {
  if (session.endedAt > 0) return true;
  const lastActivity = session.startedAt + session.duration * 1000;
  return Date.now() - lastActivity > timeoutMs;
}

/** Save session */
function saveSession(session: AnalyticsSession): void {
  try {
    localStorage.setItem(ANALYTICS_SESSION_KEY, JSON.stringify(session));
  } catch {}
}

/** Load session */
export function loadSession(): AnalyticsSession | null {
  try {
    const raw = localStorage.getItem(ANALYTICS_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============================================================
// AGGREGATE STATE (for cloud save)
// ============================================================

/** Load aggregate state */
export function loadSaveState(): AnalyticsSaveState {
  try {
    const raw = localStorage.getItem(ANALYTICS_STATE_KEY);
    return raw ? JSON.parse(raw) : createEmptySaveState();
  } catch {
    return createEmptySaveState();
  }
}

/** Save aggregate state */
export function saveSaveState(state: AnalyticsSaveState): void {
  try {
    localStorage.setItem(ANALYTICS_STATE_KEY, JSON.stringify(state));
  } catch {}
}

/** Update aggregate state after session */
export function updateAggregateState(
  state: AnalyticsSaveState,
  eventsTracked: number
): AnalyticsSaveState {
  const today = getTodayString();
  const updated: AnalyticsSaveState = { ...state };

  updated.totalEventsTracked += eventsTracked;
  updated.lastActiveAt = Date.now();

  if (updated.firstSeenAt === 0) {
    updated.firstSeenAt = Date.now();
  }

  // Streak logic
  if (updated.lastStreakDate === "") {
    // First ever
    updated.currentStreak = 1;
    updated.longestStreak = 1;
    updated.activeDays = 1;
    updated.lastStreakDate = today;
  } else if (updated.lastStreakDate !== today) {
    const lastDate = new Date(updated.lastStreakDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day
      updated.currentStreak++;
    } else {
      // Streak broken
      updated.currentStreak = 1;
    }

    updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);
    updated.activeDays++;
    updated.lastStreakDate = today;
  }

  saveSaveState(updated);
  return updated;
}

/** Increment session count */
export function incrementSessionCount(state: AnalyticsSaveState): AnalyticsSaveState {
  const updated = { ...state, totalSessions: state.totalSessions + 1 };
  saveSaveState(updated);
  return updated;
}

// ============================================================
// PRIVACY
// ============================================================

/** Strip PII from event data */
export function sanitizeEventData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const piiKeys = new Set([
    "name", "firstName", "lastName", "username",
    "email", "phone", "address", "ip",
    "photoUrl", "photo_url", "avatar",
  ]);

  for (const [key, value] of Object.entries(data)) {
    if (piiKeys.has(key.toLowerCase())) continue;
    if (value === undefined) continue;

    // Recursively sanitize nested objects
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeEventData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================================
// CLEANUP
// ============================================================

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(ANALYTICS_SESSION_KEY);
    localStorage.removeItem(ANALYTICS_STATE_KEY);
    localStorage.removeItem(ANALYTICS_IDENTITY_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem("hexium_analytics_queue");
  } catch {}
}
