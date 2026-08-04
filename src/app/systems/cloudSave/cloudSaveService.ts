// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Service (Orchestrator)
// ============================================================
// High-level API for save/load/sync. Screens and game core
// call THIS, not individual modules.
// ============================================================

import type {
  SaveEnvelope,
  SavePayload,
  SaveSlotId,
  SaveSlotMeta,
  SyncState,
  SyncResult,
  ConflictInfo,
  ConflictResolution,
  AutoSaveConfig,
  CloudSaveEvent,
  CloudSaveEventType,
} from "./cloudSaveTypes";
import {
  createSaveEnvelope,
  getOrCreateDeviceId,
  createEmptySyncState,
  SAVE_SLOTS,
  CLOUD_SYNC_SLOTS,
  DEFAULT_AUTO_SAVE_CONFIG,
  MIN_SYNC_INTERVAL_MS,
  MAX_SYNC_ERRORS,
} from "./cloudSaveData";
import {
  validateSave,
  verifyChecksum,
} from "./cloudSaveLogic";
import {
  saveLocal,
  loadLocal,
  deleteLocal,
  getLocalSlotsMeta,
  saveCloud,
  loadCloud,
  deleteCloud,
  setCloudAdapter as storageSetCloudAdapter,
  isCloudAvailable,
} from "./cloudSaveStorage";
import { needsMigration, migrateSave } from "./cloudSaveMigration";
import {
  autoResolve,
  requestUserResolution,
  submitUserChoice,
  hasPendingConflict,
  getPendingConflict,
  cancelConflict,
  formatConflictForUI,
} from "./cloudSaveConflict";

// ============================================================
// STATE
// ============================================================

let initialized = false;
let playerId: number = 0;
let deviceId: string = "";
let syncState: SyncState = createEmptySyncState();
let autoSaveConfig: AutoSaveConfig = { ...DEFAULT_AUTO_SAVE_CONFIG };
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
let autoSyncTimer: ReturnType<typeof setInterval> | null = null;

// Last saved envelope per slot (for dirty checking)
let lastSavedChecksums: Partial<Record<SaveSlotId, string>> = {};

// Event listeners
type EventListener = (event: CloudSaveEvent) => void;
const listeners: EventListener[] = [];

// ============================================================
// INIT
// ============================================================

/** Initialize the Cloud Save Manager */
async function initialize(
  telegramId: number,
  config?: Partial<AutoSaveConfig>
): Promise<void> {
  playerId = telegramId;
  deviceId = getOrCreateDeviceId();

  if (config) {
    autoSaveConfig = { ...autoSaveConfig, ...config };
  }

  syncState = createEmptySyncState();
  initialized = true;

  console.log("[CloudSave] Initialized:", {
    playerId,
    deviceId: deviceId.slice(0, 16),
    cloudAvailable: isCloudAvailable(),
    autoSave: autoSaveConfig.enabled,
  });
}

function assertInitialized(): void {
  if (!initialized) throw new Error("[CloudSave] Not initialized — call initialize() first");
}

// ============================================================
// SAVE
// ============================================================

/** Save game state to a slot */
function saveToSlot(
  slotId: SaveSlotId,
  data: SavePayload,
  syncToCloud: boolean = true
): { success: boolean; envelope: SaveEnvelope | null } {
  assertInitialized();

  // Load existing envelope (for writeCounter continuity)
  const existing = loadLocal(slotId);
  const envelope = createSaveEnvelope(playerId, deviceId, data, existing);

  // Validate before saving
  const validation = validateSave(envelope, playerId);
  if (!validation.valid) {
    console.error(`[CloudSave] Validation failed before save:`, validation.reason);
    return { success: false, envelope: null };
  }

  // Save locally
  const localOk = saveLocal(slotId, envelope);
  if (!localOk) {
    return { success: false, envelope: null };
  }

  lastSavedChecksums[slotId] = envelope.checksum;

  emit({ type: "save:local", data: { slotId, writeCounter: envelope.writeCounter }, timestamp: Date.now() });

  // Sync to cloud (non-blocking)
  if (syncToCloud && CLOUD_SYNC_SLOTS.includes(slotId)) {
    syncSlotToCloud(slotId, envelope).catch((err) => {
      console.warn(`[CloudSave] Background cloud sync failed for ${slotId}:`, err);
    });
  }

  return { success: true, envelope };
}

/** Quick auto-save to "auto" slot */
function autoSave(data: SavePayload): boolean {
  const result = saveToSlot("auto", data, autoSaveConfig.syncAfterSave);
  if (result.success) {
    emit({ type: "save:auto", data: { writeCounter: result.envelope?.writeCounter }, timestamp: Date.now() });
  }
  return result.success;
}

/** Create backup from current auto-save */
function createBackup(): boolean {
  assertInitialized();
  const autoEnvelope = loadLocal("auto");
  if (!autoEnvelope) return false;

  const ok = saveLocal("backup", autoEnvelope);
  if (ok) {
    emit({ type: "backup:created", data: { fromSlot: "auto" }, timestamp: Date.now() });
  }
  return ok;
}

// ============================================================
// LOAD
// ============================================================

/** Load game state from a slot */
function loadFromSlot(slotId: SaveSlotId): {
  success: boolean;
  data: SavePayload | null;
  envelope: SaveEnvelope | null;
  migrated: boolean;
} {
  assertInitialized();
  let envelope = loadLocal(slotId);

  if (!envelope) {
    return { success: false, data: null, envelope: null, migrated: false };
  }

  // Validate checksum
  if (!verifyChecksum(envelope)) {
    console.warn(`[CloudSave] Checksum mismatch on load [${slotId}] — attempting cloud fallback`);
    emit({ type: "save:corrupted", data: { slotId, source: "local" }, timestamp: Date.now() });
    // Will attempt cloud in sync
    return { success: false, data: null, envelope: null, migrated: false };
  }

  // Validate player ID
  if (envelope.playerId !== playerId) {
    console.warn(`[CloudSave] Player ID mismatch: save=${envelope.playerId}, current=${playerId}`);
    return { success: false, data: null, envelope: null, migrated: false };
  }

  // Migrate if needed
  let migrated = false;
  if (needsMigration(envelope)) {
    const migration = migrateSave(envelope);
    if (migration.success) {
      envelope = migration.migrated;
      saveLocal(slotId, envelope); // persist migrated version
      migrated = true;
      emit({
        type: "migration:applied",
        data: { slotId, steps: migration.stepsApplied },
        timestamp: Date.now(),
      });
    } else {
      console.error(`[CloudSave] Migration failed for ${slotId}`);
    }
  }

  emit({ type: "load:local", data: { slotId }, timestamp: Date.now() });

  return { success: true, data: envelope.data, envelope, migrated };
}

/** Load with cloud fallback — tries local first, then cloud */
async function loadWithFallback(slotId: SaveSlotId): Promise<{
  success: boolean;
  data: SavePayload | null;
  source: "local" | "cloud" | "none";
}> {
  assertInitialized();

  // Try local first
  const local = loadFromSlot(slotId);
  if (local.success && local.data) {
    return { success: true, data: local.data, source: "local" };
  }

  // Try cloud
  const cloudEnvelope = await loadCloud(slotId);
  if (cloudEnvelope) {
    // Validate
    if (!verifyChecksum(cloudEnvelope)) {
      emit({ type: "save:corrupted", data: { slotId, source: "cloud" }, timestamp: Date.now() });
      return { success: false, data: null, source: "none" };
    }

    if (cloudEnvelope.playerId !== playerId) {
      return { success: false, data: null, source: "none" };
    }

    // Migrate if needed
    let envelope = cloudEnvelope;
    if (needsMigration(envelope)) {
      const migration = migrateSave(envelope);
      if (migration.success) {
        envelope = migration.migrated;
      }
    }

    // Cache locally
    saveLocal(slotId, envelope);

    emit({ type: "load:cloud", data: { slotId }, timestamp: Date.now() });
    return { success: true, data: envelope.data, source: "cloud" };
  }

  return { success: false, data: null, source: "none" };
}

/** Restore from backup slot */
function restoreFromBackup(): {
  success: boolean;
  data: SavePayload | null;
} {
  assertInitialized();
  const result = loadFromSlot("backup");
  if (result.success && result.data) {
    // Write backup data to auto slot
    saveToSlot("auto", result.data, true);
    emit({ type: "backup:restored", data: {}, timestamp: Date.now() });
  }
  return { success: result.success, data: result.data };
}

// ============================================================
// SYNC
// ============================================================

/** Sync a single slot to cloud */
async function syncSlotToCloud(
  slotId: SaveSlotId,
  localEnvelope?: SaveEnvelope
): Promise<SyncResult> {
  assertInitialized();
  const now = new Date().toISOString();

  if (!isCloudAvailable()) {
    return { action: "error", timestamp: now, localVersion: 0, cloudVersion: 0, conflictDetected: false, error: "cloud_unavailable" };
  }

  // Throttle
  if (syncState.lastSyncAt) {
    const elapsed = Date.now() - new Date(syncState.lastSyncAt).getTime();
    if (elapsed < MIN_SYNC_INTERVAL_MS) {
      return { action: "no_change", timestamp: now, localVersion: 0, cloudVersion: 0, conflictDetected: false, error: "throttled" };
    }
  }

  syncState = { ...syncState, syncInProgress: true, status: "syncing" };
  emit({ type: "sync:start", data: { slotId }, timestamp: Date.now() });

  try {
    // Load both
    const local = localEnvelope ?? loadLocal(slotId);
    const cloud = await loadCloud(slotId);

    // Case 1: No local, no cloud → nothing to sync
    if (!local && !cloud) {
      const result: SyncResult = { action: "no_change", timestamp: now, localVersion: 0, cloudVersion: 0, conflictDetected: false, error: null };
      finishSync(result);
      return result;
    }

    // Case 2: Local exists, no cloud → upload
    if (local && !cloud) {
      await saveCloud(slotId, local);
      const result: SyncResult = { action: "uploaded", timestamp: now, localVersion: local.writeCounter, cloudVersion: 0, conflictDetected: false, error: null };
      finishSync(result);
      return result;
    }

    // Case 3: No local, cloud exists → download
    if (!local && cloud) {
      saveLocal(slotId, cloud);
      const result: SyncResult = { action: "downloaded", timestamp: now, localVersion: 0, cloudVersion: cloud.writeCounter, conflictDetected: false, error: null };
      finishSync(result);
      return result;
    }

    // Case 4: Both exist → conflict resolution
    if (local && cloud) {
      const { resolved, action, conflictDetected } = autoResolve(local, cloud);

      // Save resolved version to both
      saveLocal(slotId, resolved);
      await saveCloud(slotId, resolved);

      const result: SyncResult = {
        action: conflictDetected ? "conflict_resolved" : "no_change",
        timestamp: now,
        localVersion: local.writeCounter,
        cloudVersion: cloud.writeCounter,
        conflictDetected,
        error: null,
      };

      if (conflictDetected) {
        emit({ type: "sync:conflict", data: { slotId, resolution: action }, timestamp: Date.now() });
      }

      finishSync(result);
      return result;
    }

    // Shouldn't reach here
    const result: SyncResult = { action: "no_change", timestamp: now, localVersion: 0, cloudVersion: 0, conflictDetected: false, error: null };
    finishSync(result);
    return result;

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const result: SyncResult = { action: "error", timestamp: now, localVersion: 0, cloudVersion: 0, conflictDetected: false, error: errorMsg };
    finishSyncError(result);
    return result;
  }
}

/** Sync all cloud-enabled slots */
async function syncAll(): Promise<SyncResult[]> {
  assertInitialized();
  const results: SyncResult[] = [];
  for (const slotId of CLOUD_SYNC_SLOTS) {
    const result = await syncSlotToCloud(slotId);
    results.push(result);
  }
  return results;
}

/** Manual full sync (user-triggered) */
async function manualSync(): Promise<{
  results: SyncResult[];
  conflicts: number;
  errors: number;
}> {
  const results = await syncAll();
  const conflicts = results.filter((r) => r.conflictDetected).length;
  const errors = results.filter((r) => r.action === "error").length;
  return { results, conflicts, errors };
}

function finishSync(result: SyncResult): void {
  syncState = {
    ...syncState,
    status: "synced",
    lastSyncAt: result.timestamp,
    lastSyncResult: result,
    syncInProgress: false,
    pendingChanges: false,
    consecutiveErrors: 0,
  };
  emit({ type: "sync:complete", data: { result }, timestamp: Date.now() });
}

function finishSyncError(result: SyncResult): void {
  const errors = syncState.consecutiveErrors + 1;
  syncState = {
    ...syncState,
    status: errors >= MAX_SYNC_ERRORS ? "offline" : "error",
    lastSyncAt: result.timestamp,
    lastSyncResult: result,
    syncInProgress: false,
    consecutiveErrors: errors,
  };
  emit({ type: "sync:error", data: { result, consecutiveErrors: errors }, timestamp: Date.now() });
}

// ============================================================
// AUTO-SAVE & AUTO-SYNC TIMERS
// ============================================================

/** Start auto-save timer */
function startAutoSave(getGameState: () => SavePayload): void {
  stopAutoSave();
  if (!autoSaveConfig.enabled) return;

  autoSaveTimer = setInterval(() => {
    try {
      const data = getGameState();
      autoSave(data);
    } catch (err) {
      console.error("[CloudSave] Auto-save error:", err);
    }
  }, autoSaveConfig.intervalMs);

  console.log(`[CloudSave] Auto-save started (${autoSaveConfig.intervalMs / 1000}s interval)`);
}

/** Stop auto-save timer */
function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

/** Start auto-sync timer */
function startAutoSync(): void {
  stopAutoSync();

  autoSyncTimer = setInterval(async () => {
    if (syncState.syncInProgress) return;
    if (syncState.status === "offline") return;

    try {
      await syncSlotToCloud("auto");
    } catch {
      // swallow — finishSyncError handles tracking
    }
  }, 60_000); // every 60s

  console.log("[CloudSave] Auto-sync started (60s interval)");
}

/** Stop auto-sync timer */
function stopAutoSync(): void {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}

// ============================================================
// SLOT MANAGEMENT
// ============================================================

/** Get metadata for all slots */
function getAllSlotsMeta(): SaveSlotMeta[] {
  assertInitialized();
  const slots = SAVE_SLOTS.map((s) => s.id);
  return getLocalSlotsMeta(slots);
}

/** Delete a save slot (local + cloud) */
async function deleteSlot(slotId: SaveSlotId): Promise<boolean> {
  assertInitialized();
  deleteLocal(slotId);
  await deleteCloud(slotId);
  delete lastSavedChecksums[slotId];
  return true;
}

/** Copy save from one slot to another */
function copySlot(fromSlot: SaveSlotId, toSlot: SaveSlotId): boolean {
  assertInitialized();
  const envelope = loadLocal(fromSlot);
  if (!envelope) return false;
  return saveLocal(toSlot, envelope);
}

// ============================================================
// CONFLICT UI BRIDGE
// ============================================================

/** Trigger user-choice conflict resolution */
function triggerUserConflict(
  local: SaveEnvelope,
  cloud: SaveEnvelope,
  callback: (resolution: ConflictResolution) => void
): ConflictInfo {
  return requestUserResolution(local, cloud, callback);
}

/** Submit user's conflict choice */
function resolveUserConflict(resolution: ConflictResolution): SaveEnvelope | null {
  return submitUserChoice(resolution);
}

/** Check for pending conflict */
function hasConflict(): boolean {
  return hasPendingConflict();
}

/** Get conflict info for UI */
function getConflictInfo() {
  const conflict = getPendingConflict();
  if (!conflict) return null;
  return formatConflictForUI(conflict);
}

/** Cancel conflict */
function dismissConflict(): void {
  cancelConflict();
}

// ============================================================
// STATUS
// ============================================================

/** Get current sync status */
function getSyncState(): SyncState {
  return { ...syncState };
}

/** Get device ID */
function getDeviceId(): string {
  return deviceId;
}

/** Check if cloud is available */
function cloudAvailable(): boolean {
  return isCloudAvailable();
}

/** Mark state as dirty (pending changes) */
function markDirty(): void {
  syncState = { ...syncState, pendingChanges: true };
}

// ============================================================
// EVENTS
// ============================================================

function on(listener: EventListener): void {
  listeners.push(listener);
}

function off(listener: EventListener): void {
  const idx = listeners.indexOf(listener);
  if (idx >= 0) listeners.splice(idx, 1);
}

function emit(event: CloudSaveEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("[CloudSave] Event listener error:", err);
    }
  }
}

// ============================================================
// CLEANUP
// ============================================================

/** Stop all timers and clean up */
function destroy(): void {
  stopAutoSave();
  stopAutoSync();
  initialized = false;
  listeners.length = 0;
  lastSavedChecksums = {};
  console.log("[CloudSave] Destroyed");
}

// ============================================================
// EXPORT
// ============================================================

export const cloudSaveService = {
  // Init
  initialize,

  // Save
  saveToSlot,
  autoSave,
  createBackup,

  // Load
  loadFromSlot,
  loadWithFallback,
  restoreFromBackup,

  // Sync
  syncSlotToCloud,
  syncAll,
  manualSync,

  // Auto timers
  startAutoSave,
  stopAutoSave,
  startAutoSync,
  stopAutoSync,

  // Slots
  getAllSlotsMeta,
  deleteSlot,
  copySlot,

  // Conflict
  triggerUserConflict,
  resolveUserConflict,
  hasConflict,
  getConflictInfo,
  dismissConflict,

  // Status
  getSyncState,
  getDeviceId,
  cloudAvailable,
  markDirty,

  // Cloud adapter
  setCloudAdapter: storageSetCloudAdapter,

  // Events
  on,
  off,

  // Cleanup
  destroy,
};
