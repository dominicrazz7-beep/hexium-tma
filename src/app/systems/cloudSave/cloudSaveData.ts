// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Data & Constants
// ============================================================
// All configuration, key mappings, and default values.
// ============================================================

import type {
  SaveSlotId,
  SaveSlotMeta,
  AutoSaveConfig,
  SaveEnvelope,
  SavePayload,
  SyncState,
} from "./cloudSaveTypes";

// ============================================================
// CURRENT SCHEMA VERSION
// ============================================================

/** Current save schema version — bump when save format changes */
export const CURRENT_SAVE_VERSION = 1;

// ============================================================
// STORAGE KEYS
// ============================================================

/** Prefix for all localStorage keys */
export const LOCAL_KEY_PREFIX = "hexium_save_";

/** Cloud key prefix (Telegram Cloud Storage) */
export const CLOUD_KEY_PREFIX = "hx_sv_";

/** Map slot → localStorage key */
export function localKeyForSlot(slot: SaveSlotId): string {
  return `${LOCAL_KEY_PREFIX}${slot}`;
}

/** Map slot → cloud key */
export function cloudKeyForSlot(slot: SaveSlotId): string {
  return `${CLOUD_KEY_PREFIX}${slot}`;
}

/** Sync metadata key (localStorage) */
export const SYNC_META_KEY = "hexium_sync_meta";

/** Device ID key (localStorage) */
export const DEVICE_ID_KEY = "hexium_device_id";

// ============================================================
// SLOT DEFINITIONS
// ============================================================

export const SAVE_SLOTS: { id: SaveSlotId; label: string }[] = [
  { id: "auto", label: "Auto-Save" },
  { id: "manual_1", label: "Save Slot 1" },
  { id: "manual_2", label: "Save Slot 2" },
  { id: "manual_3", label: "Save Slot 3" },
  { id: "backup", label: "Backup (auto)" },
];

/** Slots that user can manually save to */
export const MANUAL_SLOTS: SaveSlotId[] = ["manual_1", "manual_2", "manual_3"];

/** Slots that sync to cloud */
export const CLOUD_SYNC_SLOTS: SaveSlotId[] = ["auto", "manual_1", "manual_2", "manual_3"];

// ============================================================
// AUTO-SAVE CONFIG
// ============================================================

export const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 30_000,     // 30 seconds
  syncAfterSave: true,    // sync to cloud after auto-save
  maxLocalSlots: 5,       // total local slots (including backup)
};

// ============================================================
// SYNC CONFIG
// ============================================================

/** Min interval between cloud syncs (ms) */
export const MIN_SYNC_INTERVAL_MS = 10_000; // 10 seconds

/** Max consecutive sync errors before going offline mode */
export const MAX_SYNC_ERRORS = 5;

/** Auto-sync interval (ms) — separate from auto-save */
export const AUTO_SYNC_INTERVAL_MS = 60_000; // 1 minute

// ============================================================
// LIMITS
// ============================================================

/** Max save size (chars) for cloud storage — Telegram limit is ~4096 per key */
export const MAX_CLOUD_SAVE_SIZE = 4000;

/** Max chunks for chunked cloud save */
export const MAX_CLOUD_CHUNKS = 10;

/** Chunk size for large saves */
export const CLOUD_CHUNK_SIZE = 3800;

// ============================================================
// DEFAULT STATE FACTORIES
// ============================================================

export function createEmptySyncState(): SyncState {
  return {
    status: "idle",
    lastSyncAt: null,
    lastSyncResult: null,
    pendingChanges: false,
    syncInProgress: false,
    consecutiveErrors: 0,
  };
}

export function createEmptySlotMeta(slotId: SaveSlotId): SaveSlotMeta {
  const slotDef = SAVE_SLOTS.find((s) => s.id === slotId);
  return {
    slotId,
    label: slotDef?.label ?? slotId,
    isEmpty: true,
    lastModifiedAt: "",
    writeCounter: 0,
    version: 0,
    checksum: "",
    dataSize: 0,
    playerId: 0,
    deviceId: "",
  };
}

export function createSaveEnvelope(
  playerId: number,
  deviceId: string,
  data: SavePayload,
  existingEnvelope?: SaveEnvelope | null
): SaveEnvelope {
  const now = new Date().toISOString();
  const dataJson = JSON.stringify(data);
  const checksum = crc32(dataJson);

  return {
    version: CURRENT_SAVE_VERSION,
    saveId: existingEnvelope?.saveId ?? generateSaveId(),
    playerId,
    deviceId,
    createdAt: existingEnvelope?.createdAt ?? now,
    lastModifiedAt: now,
    writeCounter: (existingEnvelope?.writeCounter ?? 0) + 1,
    checksum,
    dataSize: dataJson.length,
    data,
  };
}

// ============================================================
// UTILITIES
// ============================================================

/** CRC32 checksum (simple, fast, good enough for save validation) */
export function crc32(str: string): string {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, "0");
}

/** Generate unique save ID */
export function generateSaveId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `hxsv_${ts}_${rnd}`;
}

/** Generate device ID (persisted in localStorage) */
export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `dev_fallback_${Date.now()}`;
  }
}

/** Extract SaveSlotMeta from envelope without loading full data */
export function envelopeToMeta(slotId: SaveSlotId, envelope: SaveEnvelope): SaveSlotMeta {
  const slotDef = SAVE_SLOTS.find((s) => s.id === slotId);
  return {
    slotId,
    label: slotDef?.label ?? slotId,
    isEmpty: false,
    lastModifiedAt: envelope.lastModifiedAt,
    writeCounter: envelope.writeCounter,
    version: envelope.version,
    checksum: envelope.checksum,
    dataSize: envelope.dataSize,
    playerId: envelope.playerId,
    deviceId: envelope.deviceId,
  };
}
