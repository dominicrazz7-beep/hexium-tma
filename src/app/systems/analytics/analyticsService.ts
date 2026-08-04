// ============================================================
// HEXIUM CLICKER · Analytics System · Service (Orchestrator)
// ============================================================
// THE single entry point for all analytics tracking.
// Screens and modules call analyticsService.track().
// ============================================================

import type {
  AnalyticsEvent,
  AnalyticsCategory,
  AnalyticsConfig,
  AnalyticsIdentity,
  AnalyticsSession,
  AnalyticsSaveState,
  AnalyticsTransport,
  AnalyticsListener,
  FlushResult,
  PerformanceMetric,
} from "./analyticsTypes";
import {
  ANALYTICS_SYSTEM_VERSION,
  DEFAULT_CONFIG,
  CLOUD_SAVE_ANALYTICS_KEY,
  generateEventId,
  createEmptySaveState,
  getEventDefinition,
} from "./analyticsData";
import {
  addToBuffer,
  flushBufferToQueue,
  flushQueue,
  initQueue,
  getQueueSize,
  getBufferSize,
  getPendingCount,
  setTransport as queueSetTransport,
  setIdentity as queueSetIdentity,
  clearQueue,
  destroyQueue,
  setOnFlush,
  setOnDrop,
} from "./analyticsQueue";
import {
  createIdentity,
  loadIdentity,
  createSession,
  endSession,
  updateSession,
  isSessionExpired,
  loadSession,
  loadSaveState,
  saveSaveState,
  updateAggregateState,
  incrementSessionCount,
  sanitizeEventData,
  clearAllStorage,
} from "./analyticsStorage";

// ============================================================
// STATE
// ============================================================

let initialized = false;
let config: AnalyticsConfig = { ...DEFAULT_CONFIG };
let identity: AnalyticsIdentity | null = null;
let session: AnalyticsSession | null = null;
let saveState: AnalyticsSaveState = createEmptySaveState();
let sequenceCounter = 0;
let sessionEventsCount = 0;

// Heartbeat
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

// Listeners
const listeners: AnalyticsListener[] = [];

// Performance
const performanceMarks: Map<string, number> = new Map();

// ============================================================
// INIT
// ============================================================

function initialize(
  telegramId: number,
  appVersion: string = "1.0.0",
  language: string = "uk",
  customConfig?: Partial<AnalyticsConfig>
): void {
  if (initialized) {
    debug("[Analytics] Already initialized, skipping");
    return;
  }

  // Merge config
  if (customConfig) {
    config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  // Identity
  identity = loadIdentity();
  if (!identity) {
    identity = createIdentity(telegramId, appVersion, language, config.hashPlayerIds);
  }

  // Load aggregate state
  saveState = loadSaveState();

  // Init queue
  initQueue(config, null, identity);

  // Session
  const existingSession = loadSession();
  if (existingSession && !isSessionExpired(existingSession, config.sessionTimeoutMs)) {
    session = existingSession;
    debug("[Analytics] Resumed session:", session.sessionId);
  } else {
    startNewSession("direct");
  }

  // Heartbeat
  startHeartbeat();

  // Visibility change listener
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // Before unload — flush
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  initialized = true;

  debug("[Analytics] Initialized", {
    version: ANALYTICS_SYSTEM_VERSION,
    sessionId: session?.sessionId,
    identity: { playerId: identity.playerId, platform: identity.platform },
    totalEvents: saveState.totalEventsTracked,
    totalSessions: saveState.totalSessions,
    streak: saveState.currentStreak,
  });
}

// ============================================================
// TRACK — MAIN API
// ============================================================

/**
 * Track an analytics event.
 *
 * @param name     Event name (from EVENT_DEFINITIONS or custom)
 * @param data     Privacy-safe payload
 * @param source   Module source (auto-detected from definition if omitted)
 * @param category Category (auto-detected from definition if omitted)
 */
function track(
  name: string,
  data: Record<string, unknown> = {},
  source?: string,
  category?: AnalyticsCategory
): void {
  if (!initialized || !config.enabled) return;

  // Look up event definition
  const definition = getEventDefinition(name);
  const resolvedCategory = category ?? (definition?.category as AnalyticsCategory) ?? "system";
  const resolvedSource = source ?? definition?.category ?? "unknown";

  // Sanitize data (strip PII)
  const cleanData = sanitizeEventData(data);

  // Build event
  const event: AnalyticsEvent = {
    eventId: generateEventId(),
    name,
    category: resolvedCategory,
    source: resolvedSource,
    data: cleanData,
    timestamp: Date.now(),
    sessionId: session?.sessionId ?? "no_session",
    sequence: sequenceCounter++,
  };

  // Update session
  if (session) {
    const screenName = name === "screen_view" ? String(data.screenName ?? "") : undefined;
    session = updateSession(session, name, screenName);
    sessionEventsCount++;
  }

  // Add to buffer
  addToBuffer(event);

  // Emit to listeners
  for (const listener of listeners) {
    try { listener(event); } catch (err) { debug("[Analytics] Listener error:", err); }
  }

  debug("[Track]", name, cleanData);
}

/**
 * Track from event builder (from analyticsEvents.ts).
 * Usage: analyticsService.trackEvent(events.tapClick(42, 3, true))
 */
function trackEvent(eventData: {
  name: string;
  category: string;
  source: string;
  data: Record<string, unknown>;
}): void {
  track(eventData.name, eventData.data, eventData.source, eventData.category as AnalyticsCategory);
}

// ============================================================
// SESSION
// ============================================================

function startNewSession(entrySource: string = "direct"): void {
  // End previous session
  if (session) {
    endCurrentSession();
  }

  session = createSession(entrySource);
  sequenceCounter = 0;
  sessionEventsCount = 0;

  saveState = incrementSessionCount(saveState);

  track("session_start", { entrySource });
  debug("[Session] Started:", session.sessionId);
}

function endCurrentSession(): void {
  if (!session) return;

  track("session_end", {
    duration: session.duration,
    eventCount: sessionEventsCount,
    screensVisited: session.screensVisited,
  });

  session = endSession(session);
  saveState = updateAggregateState(saveState, sessionEventsCount);

  debug("[Session] Ended:", session.sessionId, {
    duration: session.duration,
    events: sessionEventsCount,
  });
}

function getSessionId(): string {
  return session?.sessionId ?? "no_session";
}

function getSessionDuration(): number {
  if (!session) return 0;
  return Math.floor((Date.now() - session.startedAt) / 1000);
}

// ============================================================
// HEARTBEAT
// ============================================================

function startHeartbeat(): void {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (!session) return;
    track("session_heartbeat", {
      uptime: getSessionDuration(),
      memoryUsage: getMemoryUsage(),
    });
  }, 60_000); // every 60s
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function getMemoryUsage(): number | undefined {
  try {
    const perf = (performance as any);
    if (perf?.memory) {
      return Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
    }
  } catch {}
  return undefined;
}

// ============================================================
// VISIBILITY / LIFECYCLE
// ============================================================

function handleVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    // App going to background — flush
    flushBufferToQueue();
    if (session) {
      session = updateSession(session, "app_background");
    }
  } else {
    // App returned
    if (session && isSessionExpired(session, config.sessionTimeoutMs)) {
      startNewSession("resume");
    } else {
      track("session_resume", {
        pauseDuration: session ? Date.now() - (session.startedAt + session.duration * 1000) : 0,
      });
    }
  }
}

function handleBeforeUnload(): void {
  endCurrentSession();
  flushBufferToQueue();
}

// ============================================================
// SCREEN TRACKING
// ============================================================

const screenTimers: Map<string, number> = new Map();

/** Track screen view (auto-tracks duration on exit) */
function trackScreenView(screenName: string, fromScreen?: string): void {
  if (!config.trackScreenViews) return;

  // End previous screen
  const prevScreen = [...screenTimers.keys()].pop();
  if (prevScreen) {
    trackScreenExit(prevScreen);
  }

  screenTimers.set(screenName, Date.now());
  track("screen_view", { screenName, fromScreen });
}

/** Track screen exit */
function trackScreenExit(screenName: string, action?: string): void {
  const startTime = screenTimers.get(screenName);
  const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  screenTimers.delete(screenName);
  track("screen_exit", { screenName, duration, action });
}

// ============================================================
// PERFORMANCE TRACKING
// ============================================================

/** Start performance measurement */
function perfStart(markName: string): void {
  if (!config.trackPerformance) return;
  performanceMarks.set(markName, Date.now());
}

/** End performance measurement and track */
function perfEnd(markName: string): number {
  if (!config.trackPerformance) return 0;
  const startTime = performanceMarks.get(markName);
  if (!startTime) return 0;

  performanceMarks.delete(markName);
  const durationMs = Date.now() - startTime;

  track("perf_measure", {
    name: markName,
    durationMs,
  });

  return durationMs;
}

/** Track a performance metric */
function trackPerformance(metric: PerformanceMetric): void {
  if (!config.trackPerformance) return;
  track("perf_metric", {
    name: metric.name,
    value: metric.value,
    unit: metric.unit,
  });
}

// ============================================================
// FLUSH
// ============================================================

async function flush(): Promise<FlushResult> {
  return flushQueue();
}

function getQueueInfo(): {
  bufferSize: number;
  queueSize: number;
  pendingCount: number;
} {
  return {
    bufferSize: getBufferSize(),
    queueSize: getQueueSize(),
    pendingCount: getPendingCount(),
  };
}

// ============================================================
// TRANSPORT
// ============================================================

function setTransport(transport: AnalyticsTransport): void {
  queueSetTransport(transport);
}

// ============================================================
// LISTENERS
// ============================================================

function onTrack(listener: AnalyticsListener): void {
  listeners.push(listener);
}

function offTrack(listener: AnalyticsListener): void {
  const idx = listeners.indexOf(listener);
  if (idx >= 0) listeners.splice(idx, 1);
}

// ============================================================
// CLOUD SAVE
// ============================================================

function getStateForSave(): Record<string, unknown> {
  return {
    saveState: { ...saveState },
    version: ANALYTICS_SYSTEM_VERSION,
  };
}

function restoreFromSave(data: Record<string, unknown>): void {
  if (data?.saveState) {
    const restored = data.saveState as Partial<AnalyticsSaveState>;
    saveState = {
      ...createEmptySaveState(),
      ...restored,
    };
    saveSaveState(saveState);
    debug("[Analytics] Restored from cloud save");
  }
}

// ============================================================
// STATS
// ============================================================

function getStats(): {
  totalEventsTracked: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  sessionEventsCount: number;
  sessionDuration: number;
  queueSize: number;
  bufferSize: number;
} {
  return {
    totalEventsTracked: saveState.totalEventsTracked,
    totalSessions: saveState.totalSessions,
    currentStreak: saveState.currentStreak,
    longestStreak: saveState.longestStreak,
    activeDays: saveState.activeDays,
    sessionEventsCount,
    sessionDuration: getSessionDuration(),
    queueSize: getQueueSize(),
    bufferSize: getBufferSize(),
  };
}

// ============================================================
// CONFIG
// ============================================================

function updateConfig(partial: Partial<AnalyticsConfig>): void {
  config = { ...config, ...partial };
}

function isEnabled(): boolean {
  return config.enabled;
}

function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

// ============================================================
// FLUSH CALLBACKS
// ============================================================

function onFlushComplete(callback: (result: FlushResult) => void): void {
  setOnFlush(callback);
}

function onEventDropped(callback: (dropped: AnalyticsEvent[]) => void): void {
  setOnDrop(callback);
}

// ============================================================
// CLEANUP
// ============================================================

function destroy(): void {
  endCurrentSession();
  flushBufferToQueue();
  stopHeartbeat();
  destroyQueue();
  listeners.length = 0;
  performanceMarks.clear();
  screenTimers.clear();

  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  }

  initialized = false;
  debug("[Analytics] Destroyed");
}

function reset(): void {
  destroy();
  clearQueue();
  clearAllStorage();
  saveState = createEmptySaveState();
  debug("[Analytics] Full reset");
}

// ============================================================
// DEBUG
// ============================================================

function debug(...args: unknown[]): void {
  if (config.debug) {
    console.log("[Analytics]", ...args);
  }
}

// ============================================================
// EXPORT
// ============================================================

export const analyticsService = {
  // Init
  initialize,

  // Main API
  track,
  trackEvent,

  // Session
  startNewSession,
  endCurrentSession,
  getSessionId,
  getSessionDuration,

  // Screen tracking
  trackScreenView,
  trackScreenExit,

  // Performance
  perfStart,
  perfEnd,
  trackPerformance,

  // Flush
  flush,
  getQueueInfo,

  // Transport
  setTransport,

  // Listeners
  onTrack,
  offTrack,

  // Cloud Save
  getStateForSave,
  restoreFromSave,

  // Stats
  getStats,

  // Config
  updateConfig,
  isEnabled,
  setEnabled,

  // Callbacks
  onFlushComplete,
  onEventDropped,

  // Cleanup
  destroy,
  reset,
};
