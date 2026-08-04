// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Types
// ============================================================
// FOUNDATION v2 · Module 3/6
// Extends: telegramCloudStorage, telegramBridge, telegramUser
// ============================================================

// --- Save Envelope ---
// Wraps any game state into a versioned, checksummed save

export interface SaveEnvelope {
  /** Schema version for migration */
  version: number;
  /** Unique save identifier */
  saveId: string;
  /** Telegram user ID — owner of this save */
  playerId: number;
  /** Device fingerprint that last wrote */
  deviceId: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  lastModifiedAt: string;
  /** Monotonic counter — increments on every write */
  writeCounter: number;
  /** CRC32 checksum of `data` JSON string */
  checksum: string;
  /** Size of `data` JSON string in bytes */
  dataSize: number;
  /** The actual game state payload */
  data: SavePayload;
}

// --- Save Payload ---
// The actual data inside the envelope.
// Using `Record<string, unknown>` so any game state shape can be saved.

export type SavePayload = Record<string, unknown>;

// --- Save Slot ---

export type SaveSlotId = "auto" | "manual_1" | "manual_2" | "manual_3" | "backup";

export interface SaveSlotMeta {
  slotId: SaveSlotId;
  label: string;
  isEmpty: boolean;
  lastModifiedAt: string;
  writeCounter: number;
  version: number;
  checksum: string;
  dataSize: number;
  playerId: number;
  deviceId: string;
}

// --- Storage Location ---

export type StorageLocation = "local" | "cloud";

// --- Sync Status ---

export type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "conflict"
  | "error"
  | "offline";

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: string | null;
  lastSyncResult: SyncResult | null;
  pendingChanges: boolean;
  syncInProgress: boolean;
  consecutiveErrors: number;
}

// --- Sync Result ---

export type SyncResultAction =
  | "no_change"
  | "uploaded"
  | "downloaded"
  | "merged"
  | "conflict_resolved"
  | "error";

export interface SyncResult {
  action: SyncResultAction;
  timestamp: string;
  localVersion: number;
  cloudVersion: number;
  conflictDetected: boolean;
  error: string | null;
}

// --- Conflict ---

export type ConflictResolution =
  | "use_local"
  | "use_cloud"
  | "use_newer"
  | "user_choice";

export interface ConflictInfo {
  localSave: SaveEnvelope;
  cloudSave: SaveEnvelope;
  localModifiedAt: string;
  cloudModifiedAt: string;
  localWriteCounter: number;
  cloudWriteCounter: number;
  localDeviceId: string;
  cloudDeviceId: string;
  autoResolution: ConflictResolution;
  resolved: boolean;
}

// --- Migration ---

export interface MigrationStep {
  fromVersion: number;
  toVersion: number;
  description: string;
  migrate: (data: SavePayload) => SavePayload;
}

// --- Validation Result ---

export interface SaveValidation {
  valid: boolean;
  reason: string;
  checksumMatch: boolean;
  versionOk: boolean;
  playerIdMatch: boolean;
  dataIntact: boolean;
}

// --- Cloud Adapter Interface ---
// Decouples from telegramCloudStorage

export interface CloudStorageAdapter {
  isAvailable(): boolean;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<boolean>;
  removeItem(key: string): Promise<boolean>;
  getKeys(): Promise<string[]>;
}

// --- Auto-save Config ---

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  syncAfterSave: boolean;
  maxLocalSlots: number;
}

// --- Cloud Save Event ---

export type CloudSaveEventType =
  | "save:local"
  | "save:cloud"
  | "save:auto"
  | "load:local"
  | "load:cloud"
  | "sync:start"
  | "sync:complete"
  | "sync:conflict"
  | "sync:error"
  | "migration:applied"
  | "backup:created"
  | "backup:restored"
  | "save:corrupted";

export interface CloudSaveEvent {
  type: CloudSaveEventType;
  data: Record<string, unknown>;
  timestamp: number;
}
