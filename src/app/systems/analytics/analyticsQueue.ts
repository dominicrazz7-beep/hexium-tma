// ============================================================
// HEXIUM CLICKER · Analytics System · Queue & Buffer
// ============================================================
// Offline-capable event queue with buffer, flush, retry.
// ============================================================

import type {
  AnalyticsEvent,
  AnalyticsIdentity,
  AnalyticsTransport,
  QueueItem,
  EventBuffer,
  FlushResult,
  AnalyticsConfig,
} from "./analyticsTypes";

// ============================================================
// STATE
// ============================================================

let queue: QueueItem[] = [];
let buffer: EventBuffer = {
  events: [],
  maxSize: 100,
  flushThreshold: 20,
};
let nextQueueId = 1;
let flushTimer: ReturnType<typeof setInterval> | null = null;
let isFlushing = false;

// Config and transport
let config: AnalyticsConfig | null = null;
let transport: AnalyticsTransport | null = null;
let identity: AnalyticsIdentity | null = null;

// Callbacks
let onFlush: ((result: FlushResult) => void) | null = null;
let onDrop: ((dropped: AnalyticsEvent[]) => void) | null = null;

// ============================================================
// INIT
// ============================================================

export function initQueue(
  cfg: AnalyticsConfig,
  trn: AnalyticsTransport | null,
  idt: AnalyticsIdentity
): void {
  config = cfg;
  transport = trn;
  identity = idt;

  buffer.maxSize = cfg.bufferMaxSize;
  buffer.flushThreshold = cfg.bufferFlushThreshold;

  // Restore persisted queue
  loadQueue();

  // Start flush interval
  if (cfg.flushIntervalMs > 0) {
    startFlushInterval(cfg.flushIntervalMs);
  }

  debug("[Queue] Initialized", {
    queueSize: queue.length,
    bufferMax: buffer.maxSize,
    flushThreshold: buffer.flushThreshold,
    flushInterval: cfg.flushIntervalMs,
  });
}

// ============================================================
// BUFFER — add events here first
// ============================================================

export function addToBuffer(event: AnalyticsEvent): void {
  // Drop if buffer is full
  if (buffer.events.length >= buffer.maxSize) {
    const dropped = buffer.events.shift();
    if (dropped && onDrop) onDrop([dropped]);
    debug("[Buffer] Overflow — oldest event dropped");
  }

  buffer.events.push(event);

  // Auto-flush if threshold reached
  if (buffer.events.length >= buffer.flushThreshold) {
    debug("[Buffer] Threshold reached, flushing to queue");
    flushBufferToQueue();
  }
}

export function getBufferSize(): number {
  return buffer.events.length;
}

export function getBufferEvents(): AnalyticsEvent[] {
  return [...buffer.events];
}

// ============================================================
// FLUSH BUFFER → QUEUE
// ============================================================

export function flushBufferToQueue(): void {
  if (buffer.events.length === 0) return;

  const events = buffer.events.splice(0);
  const maxQueue = config?.queueMaxSize ?? 500;

  for (const event of events) {
    if (queue.length >= maxQueue) {
      // Drop oldest from queue
      const dropped = queue.shift();
      if (dropped && onDrop) onDrop([dropped.event]);
    }

    queue.push({
      id: nextQueueId++,
      event,
      retries: 0,
      queuedAt: Date.now(),
      status: "pending",
    });
  }

  saveQueue();
  debug("[Queue] Buffer flushed", { added: events.length, queueSize: queue.length });
}

// ============================================================
// QUEUE → TRANSPORT (send to backend)
// ============================================================

export async function flushQueue(): Promise<FlushResult> {
  const startTime = Date.now();

  // First, move buffer contents to queue
  flushBufferToQueue();

  if (queue.length === 0) {
    return { flushed: 0, failed: 0, dropped: 0, durationMs: 0 };
  }

  if (isFlushing) {
    debug("[Queue] Already flushing, skipping");
    return { flushed: 0, failed: 0, dropped: 0, durationMs: 0 };
  }

  isFlushing = true;

  // No transport = store locally only
  if (!transport || !transport.isAvailable()) {
    isFlushing = false;
    debug("[Queue] No transport, events stored locally", { count: queue.length });
    saveQueue();
    return { flushed: 0, failed: 0, dropped: 0, durationMs: Date.now() - startTime };
  }

  const pending = queue.filter((q) => q.status === "pending" || q.status === "failed");
  if (pending.length === 0) {
    isFlushing = false;
    return { flushed: 0, failed: 0, dropped: 0, durationMs: Date.now() - startTime };
  }

  let flushed = 0;
  let failed = 0;
  let dropped = 0;

  // Send in batches of 50
  const batchSize = 50;
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const events = batch.map((q) => q.event);

    // Mark as sending
    for (const item of batch) item.status = "sending";

    try {
      const success = await transport.send(events, identity!);

      if (success) {
        // Remove from queue
        const ids = new Set(batch.map((q) => q.id));
        queue = queue.filter((q) => !ids.has(q.id));
        flushed += batch.length;
      } else {
        throw new Error("Transport returned false");
      }
    } catch (err) {
      // Retry logic
      const maxRetries = config?.maxRetries ?? 3;
      for (const item of batch) {
        item.retries++;
        if (item.retries >= maxRetries) {
          item.status = "failed";
          dropped++;
          // Remove permanently failed items
          queue = queue.filter((q) => q.id !== item.id);
        } else {
          item.status = "pending";
        }
      }
      failed += batch.length;
      debug("[Queue] Batch failed", { error: err, retries: batch[0]?.retries });
    }
  }

  saveQueue();
  isFlushing = false;

  const result: FlushResult = {
    flushed,
    failed,
    dropped,
    durationMs: Date.now() - startTime,
  };

  if (onFlush) onFlush(result);
  debug("[Queue] Flush complete", result);

  return result;
}

// ============================================================
// FLUSH INTERVAL
// ============================================================

export function startFlushInterval(intervalMs: number): void {
  stopFlushInterval();
  flushTimer = setInterval(() => {
    flushQueue().catch((err) => {
      debug("[Queue] Auto-flush error:", err);
    });
  }, intervalMs);
}

export function stopFlushInterval(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// ============================================================
// PERSISTENCE
// ============================================================

const QUEUE_STORAGE_KEY = "hexium_analytics_queue";

function saveQueue(): void {
  try {
    // Only save pending items, limit to prevent storage bloat
    const toSave = queue
      .filter((q) => q.status !== "failed")
      .slice(0, config?.queueMaxSize ?? 500);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    debug("[Queue] Save failed:", err);
  }
}

function loadQueue(): void {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw) as QueueItem[];
      queue = loaded.map((q) => ({
        ...q,
        status: "pending" as const,  // reset status on load
      }));
      nextQueueId = queue.reduce((max, q) => Math.max(max, q.id + 1), 1);
      debug("[Queue] Loaded", { count: queue.length });
    }
  } catch (err) {
    queue = [];
    debug("[Queue] Load failed:", err);
  }
}

export function clearQueue(): void {
  queue = [];
  buffer.events = [];
  try { localStorage.removeItem(QUEUE_STORAGE_KEY); } catch {}
}

// ============================================================
// GETTERS
// ============================================================

export function getQueueSize(): number {
  return queue.length;
}

export function getQueueItems(): QueueItem[] {
  return [...queue];
}

export function getPendingCount(): number {
  return queue.filter((q) => q.status === "pending").length;
}

export function getFailedCount(): number {
  return queue.filter((q) => q.status === "failed").length;
}

// ============================================================
// TRANSPORT
// ============================================================

export function setTransport(trn: AnalyticsTransport): void {
  transport = trn;
}

export function setIdentity(idt: AnalyticsIdentity): void {
  identity = idt;
}

// ============================================================
// CALLBACKS
// ============================================================

export function setOnFlush(callback: (result: FlushResult) => void): void {
  onFlush = callback;
}

export function setOnDrop(callback: (dropped: AnalyticsEvent[]) => void): void {
  onDrop = callback;
}

// ============================================================
// CLEANUP
// ============================================================

export function destroyQueue(): void {
  stopFlushInterval();
  queue = [];
  buffer.events = [];
  isFlushing = false;
  onFlush = null;
  onDrop = null;
}

// ============================================================
// DEBUG
// ============================================================

function debug(...args: unknown[]): void {
  if (config?.debug) {
    console.log("[Analytics]", ...args);
  }
}
