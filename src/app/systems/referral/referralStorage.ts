// ============================================================
// HEXIUM CLICKER · Referral System · Storage
// ============================================================
// Dual storage: localStorage (primary) + Telegram Cloud (sync).
// localStorage is always source of truth for speed.
// Cloud sync is async and best-effort.
// ============================================================

import type { ReferralState } from "./referralTypes";
import { createEmptyReferralState, REFERRAL_STATE_VERSION } from "./referralData";

// --- Constants ---

const LOCAL_KEY = "hexium_referral_v1";
const CLOUD_KEY = "hexium_ref";

// --- Cloud adapter interface ---
// This decouples from telegramCloudStorage so tests work without Telegram

export interface ReferralCloudAdapter {
  isAvailable(): boolean;
  save(data: string): Promise<boolean>;
  load(): Promise<string | null>;
  remove(): Promise<boolean>;
}

// --- Default cloud adapter (uses telegramCloudStorage) ---

let cloudAdapter: ReferralCloudAdapter | null = null;

function setCloudAdapter(adapter: ReferralCloudAdapter): void {
  cloudAdapter = adapter;
}

function getCloudAdapter(): ReferralCloudAdapter | null {
  return cloudAdapter;
}

// ============================================================
// LOCAL STORAGE
// ============================================================

function saveLocal(state: ReferralState): boolean {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(LOCAL_KEY, json);
    return true;
  } catch (err) {
    console.error("[Referral Storage] Failed to save locally:", err);
    return false;
  }
}

function loadLocal(): ReferralState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReferralState;
    return migrateState(parsed);
  } catch (err) {
    console.error("[Referral Storage] Failed to load locally:", err);
    return null;
  }
}

function clearLocal(): void {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}

// ============================================================
// CLOUD STORAGE
// ============================================================

async function saveCloud(state: ReferralState): Promise<boolean> {
  const adapter = getCloudAdapter();
  if (!adapter || !adapter.isAvailable()) return false;

  try {
    const json = JSON.stringify(state);
    return await adapter.save(json);
  } catch (err) {
    console.error("[Referral Storage] Cloud save failed:", err);
    return false;
  }
}

async function loadCloud(): Promise<ReferralState | null> {
  const adapter = getCloudAdapter();
  if (!adapter || !adapter.isAvailable()) return null;

  try {
    const raw = await adapter.load();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReferralState;
    return migrateState(parsed);
  } catch (err) {
    console.error("[Referral Storage] Cloud load failed:", err);
    return null;
  }
}

async function clearCloud(): Promise<boolean> {
  const adapter = getCloudAdapter();
  if (!adapter || !adapter.isAvailable()) return false;

  try {
    return await adapter.remove();
  } catch {
    return false;
  }
}

// ============================================================
// DUAL SAVE / LOAD
// ============================================================

/** Save to both local and cloud (cloud is async, non-blocking) */
function save(state: ReferralState): void {
  saveLocal(state);
  // Cloud save runs in background — don't await
  saveCloud(state).catch(() => {
    console.warn("[Referral Storage] Background cloud save failed");
  });
}

/** Load with fallback: local first, then cloud */
async function load(myTelegramId: number): Promise<ReferralState> {
  // Try local first (fast)
  const local = loadLocal();
  if (local) {
    // Sync to cloud in background if not there yet
    saveCloud(local).catch(() => {});
    return local;
  }

  // Try cloud (slower)
  const cloud = await loadCloud();
  if (cloud) {
    // Cache locally
    saveLocal(cloud);
    console.log("[Referral Storage] Restored from cloud");
    return cloud;
  }

  // Fresh state
  const fresh = createEmptyReferralState(myTelegramId);
  saveLocal(fresh);
  return fresh;
}

/** Force sync: compare local vs cloud, pick newer */
async function forceSync(myTelegramId: number): Promise<ReferralState> {
  const local = loadLocal();
  const cloud = await loadCloud();

  // Both exist — pick newer
  if (local && cloud) {
    if (cloud.updatedAt > local.updatedAt) {
      console.log("[Referral Storage] Cloud is newer — using cloud");
      saveLocal(cloud);
      return cloud;
    } else {
      console.log("[Referral Storage] Local is newer — syncing to cloud");
      await saveCloud(local);
      return local;
    }
  }

  // Only local
  if (local) {
    await saveCloud(local);
    return local;
  }

  // Only cloud
  if (cloud) {
    saveLocal(cloud);
    return cloud;
  }

  // Neither — fresh
  const fresh = createEmptyReferralState(myTelegramId);
  save(fresh);
  return fresh;
}

// ============================================================
// MIGRATION
// ============================================================

function migrateState(state: ReferralState): ReferralState {
  if (!state.version || state.version < REFERRAL_STATE_VERSION) {
    console.log("[Referral Storage] Migrating state from version", state.version ?? 0);
    return {
      ...createEmptyReferralState(parseInt(state.myReferralCode, 10) || 0),
      ...state,
      version: REFERRAL_STATE_VERSION,
      updatedAt: Date.now(),
    };
  }
  return state;
}

// ============================================================
// EXPORT
// ============================================================

export const referralStorage = {
  // Local
  saveLocal,
  loadLocal,
  clearLocal,

  // Cloud
  saveCloud,
  loadCloud,
  clearCloud,

  // Dual
  save,
  load,
  forceSync,

  // Adapter
  setCloudAdapter,
  getCloudAdapter,
};
