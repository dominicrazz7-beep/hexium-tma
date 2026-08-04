// ============================================================
// HEXIUM CLICKER · Analytics System · Barrel Export
// ============================================================
// FOUNDATION v2 · Module 6/6 — Final foundation module! 🔒
// ============================================================

export { analyticsService } from "./analyticsService";

export type {
  // Core types
  AnalyticsCategory,
  AnalyticsEvent,
  AnalyticsIdentity,
  AnalyticsSession,
  AnalyticsConfig,
  AnalyticsSaveState,
  AnalyticsTransport,
  AnalyticsListener,

  // Queue
  QueueItem,
  EventBuffer,
  FlushResult,

  // Events
  EventDefinition,

  // Performance
  PerformanceMetric,
} from "./analyticsTypes";

export {
  // Constants
  ANALYTICS_SYSTEM_VERSION,
  CLOUD_SAVE_ANALYTICS_KEY,
  DEVICE_ID_KEY,

  // Data
  DEFAULT_CONFIG,
  EVENT_DEFINITIONS,
  getEventDefinition,
  getAllEventNames,
  getEventsByCategory,
} from "./analyticsData";

// --- Event Builders (40+) ---
export * as analyticsEvents from "./analyticsEvents";

export {
  // Queue
  flushQueue,
  getQueueSize,
  getBufferSize,
  getPendingCount,
} from "./analyticsQueue";

export {
  // Storage
  createIdentity,
  loadIdentity,
  sanitizeEventData,
  loadSaveState,
} from "./analyticsStorage";
