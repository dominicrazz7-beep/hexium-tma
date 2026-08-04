// ============================================================
// HEXIUM CLICKER · Telegram Cloud Storage
// ============================================================
// Wraps Telegram WebApp CloudStorage API with Promise-based
// interface for saving/loading cloud profile data.
// ============================================================
// Telegram CloudStorage limits:
//   - Max 1024 keys per bot per user
//   - Max key length: 128 chars
//   - Max value length: 4096 chars
//   - For large data: split into chunks
// ============================================================

import type { CloudProfileData } from "./telegramTypes";
import { telegramWebApp } from "./telegramWebApp";

// --- Constants ---

const PROFILE_KEY = "hexium_profile";
const PROFILE_CHUNK_PREFIX = "hexium_chunk_";
const MAX_VALUE_LENGTH = 4096;
const MAX_CHUNKS = 50; // Max 50 × 4096 = ~200KB

// --- Helpers ---

function getCloudStorage() {
  const wa = telegramWebApp.getWebApp();
  return wa?.CloudStorage ?? null;
}

function isAvailable(): boolean {
  return getCloudStorage() !== null;
}

// --- Basic operations (Promise wrappers) ---

function setItem(key: string, value: string): Promise<boolean> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      console.warn("[TG Cloud] CloudStorage not available");
      resolve(false);
      return;
    }
    cs.setItem(key, value, (error, success) => {
      if (error) {
        console.error("[TG Cloud] setItem error:", error);
        resolve(false);
      } else {
        resolve(success ?? true);
      }
    });
  });
}

function getItem(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      resolve(null);
      return;
    }
    cs.getItem(key, (error, value) => {
      if (error) {
        console.error("[TG Cloud] getItem error:", error);
        resolve(null);
      } else {
        resolve(value ?? null);
      }
    });
  });
}

function getItems(keys: string[]): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      resolve(null);
      return;
    }
    cs.getItems(keys, (error, values) => {
      if (error) {
        console.error("[TG Cloud] getItems error:", error);
        resolve(null);
      } else {
        resolve(values ?? null);
      }
    });
  });
}

function removeItem(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      resolve(false);
      return;
    }
    cs.removeItem(key, (error, success) => {
      if (error) {
        console.error("[TG Cloud] removeItem error:", error);
        resolve(false);
      } else {
        resolve(success ?? true);
      }
    });
  });
}

function removeItems(keys: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      resolve(false);
      return;
    }
    cs.removeItems(keys, (error, success) => {
      if (error) {
        console.error("[TG Cloud] removeItems error:", error);
        resolve(false);
      } else {
        resolve(success ?? true);
      }
    });
  });
}

function getKeys(): Promise<string[]> {
  return new Promise((resolve) => {
    const cs = getCloudStorage();
    if (!cs) {
      resolve([]);
      return;
    }
    cs.getKeys((error, keys) => {
      if (error) {
        console.error("[TG Cloud] getKeys error:", error);
        resolve([]);
      } else {
        resolve(keys ?? []);
      }
    });
  });
}

// --- Chunked storage (for data > 4096 chars) ---

function splitIntoChunks(data: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += MAX_VALUE_LENGTH) {
    chunks.push(data.substring(i, i + MAX_VALUE_LENGTH));
  }
  return chunks;
}

async function saveChunked(key: string, data: string): Promise<boolean> {
  const chunks = splitIntoChunks(data);
  if (chunks.length > MAX_CHUNKS) {
    console.error(`[TG Cloud] Data too large: ${chunks.length} chunks (max ${MAX_CHUNKS})`);
    return false;
  }

  // Save chunk count in main key
  const meta = JSON.stringify({ chunks: chunks.length, savedAt: Date.now() });
  const metaOk = await setItem(key, meta);
  if (!metaOk) return false;

  // Save each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkKey = `${key}_${i}`;
    const ok = await setItem(chunkKey, chunks[i]);
    if (!ok) {
      console.error(`[TG Cloud] Failed to save chunk ${i}`);
      return false;
    }
  }

  console.log(`[TG Cloud] Saved ${chunks.length} chunks for "${key}"`);
  return true;
}

async function loadChunked(key: string): Promise<string | null> {
  const metaRaw = await getItem(key);
  if (!metaRaw) return null;

  let meta: { chunks: number; savedAt: number };
  try {
    meta = JSON.parse(metaRaw);
  } catch {
    // Not chunked — return raw value
    return metaRaw;
  }

  if (!meta.chunks || meta.chunks < 1) return null;

  const chunkKeys = Array.from({ length: meta.chunks }, (_, i) => `${key}_${i}`);
  const values = await getItems(chunkKeys);
  if (!values) return null;

  let result = "";
  for (let i = 0; i < meta.chunks; i++) {
    const chunkKey = `${key}_${i}`;
    const chunk = values[chunkKey];
    if (chunk === undefined) {
      console.error(`[TG Cloud] Missing chunk ${i}`);
      return null;
    }
    result += chunk;
  }

  return result;
}

async function removeChunked(key: string): Promise<boolean> {
  const metaRaw = await getItem(key);
  if (!metaRaw) return true;

  let meta: { chunks: number };
  try {
    meta = JSON.parse(metaRaw);
  } catch {
    return removeItem(key);
  }

  const keysToRemove = [key];
  if (meta.chunks) {
    for (let i = 0; i < meta.chunks; i++) {
      keysToRemove.push(`${key}_${i}`);
    }
  }

  return removeItems(keysToRemove);
}

// --- Cloud Profile (game state) ---

async function saveProfile(profileData: CloudProfileData): Promise<boolean> {
  const json = JSON.stringify(profileData);
  if (json.length <= MAX_VALUE_LENGTH) {
    return setItem(PROFILE_KEY, json);
  }
  return saveChunked(PROFILE_KEY, json);
}

async function loadProfile(): Promise<CloudProfileData | null> {
  const raw = await loadChunked(PROFILE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CloudProfileData;
  } catch {
    console.error("[TG Cloud] Failed to parse profile data");
    return null;
  }
}

async function deleteProfile(): Promise<boolean> {
  return removeChunked(PROFILE_KEY);
}

async function getProfileAge(): Promise<number | null> {
  const profile = await loadProfile();
  if (!profile) return null;
  return Date.now() - profile.lastSavedAt;
}

// --- Export ---

export const telegramCloudStorage = {
  // Status
  isAvailable,

  // Basic ops
  setItem,
  getItem,
  getItems,
  removeItem,
  removeItems,
  getKeys,

  // Chunked (for large data)
  saveChunked,
  loadChunked,
  removeChunked,

  // Profile
  saveProfile,
  loadProfile,
  deleteProfile,
  getProfileAge,
};
