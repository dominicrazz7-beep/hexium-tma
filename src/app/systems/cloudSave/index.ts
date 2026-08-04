// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Barrel Export
// ============================================================

export { cloudSaveService } from "./cloudSaveService";

export type {
  // Core types
  SaveEnvelope,
  SavePayload,
  SaveSlotId,
  SaveSlotMeta,
  StorageLocation,
  CloudStorageAdapter,
  AutoSaveConfig,

  // Sync
  SyncStatus,
  SyncState,
  SyncResult,
  SyncResultAction,

  // Conflict
  ConflictResolution,
  ConflictInfo,

  // Migration
  MigrationStep,

  // Validation
  SaveValidation,

  // Events
  CloudSaveEventType,
  CloudSaveEvent,
} from "./cloudSaveTypes";

export {
  // Constants
  CURRENT_SAVE_VERSION,
  SAVE_SLOTS,
  MANUAL_SLOTS,
  CLOUD_SYNC_SLOTS,
  DEFAULT_AUTO_SAVE_CONFIG,
  MAX_CLOUD_SAVE_SIZE,

  // Utilities
  crc32,
  getOrCreateDeviceId,
  createSaveEnvelope,
} from "./cloudSaveData";

export {
  // Migration API
  registerMigration,
  needsMigration,
  migrateSave,
} from "./cloudSaveMigration";
