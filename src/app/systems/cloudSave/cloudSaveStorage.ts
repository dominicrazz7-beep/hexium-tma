// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Storage Layer
// ============================================================
// Handles reading/writing save envelopes to localStorage and
// Telegram Cloud Storage via adapter. Supports chunked saves.
// ============================================================

import type {
  SaveEnvelope,
  SaveSlotId,
  SaveSlotMeta,
  CloudStorageAdapter,
} from "./cloudSaveTypes";
import {
  localKeyForSlot,
  cloudKeyForSlot,
  envelopeToMeta,
  createEmptySlotMeta,
  CLOUD_CHUNK_SIZE,
  MAX_CLOUD_CHUNKS,
} from "./cloudSaveData";
import {
  safeParseSave,
  needsChunking,
  chunkSave,
  unchunkSave,
} from "./cloudSaveLogic";

// ============================================================
// CLOUD ADAPTER
// ============================================================

let cloudAdapter: CloudStorageAdapter | null = null;

export function setCloudAdapter(adapter: CloudStorageAdapter): void {
  cloudAdapter = adapter;
}

export function getCloudAdapter(): CloudStorageAdapter | null {
  return cloudAdapter;
}

export function isCloudAvailable(): boolean {
  return cloudAdapter !== null && cloudAdapter.isAvailable();
}

// ============================================================
// LOCAL STORAGE — Read / Write
// ============================================================

/** Save envelope to localStorage */
export function saveLocal(slotId: SaveSlotId, envelope: SaveEnvelope): boolean {
  try {
    const key = localKeyForSlot(slotId);
    const json = JSON.stringify(envelope);
    localStorage.setItem(key, json);
    return true;
  } catch (err) {
    console.error(`[CloudSave Storage] Local save failed [${slotId}]:`, err);
    return false;
  }
}

/** Load envelope from localStorage */
export function loadLocal(slotId: SaveSlotId): SaveEnvelope | null {
  try {
    const key = localKeyForSlot(slotId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return safeParseSave(raw);
  } catch (err) {
    console.error(`[CloudSave Storage] Local load failed [${slotId}]:`, err);
    return null;
  }
}

/** Delete local save */
export function deleteLocal(slotId: SaveSlotId): boolean {
  try {
    localStorage.removeItem(localKeyForSlot(slotId));
    return true;
  } catch {
    return false;
  }
}

/** Get metadata for all local slots (without loading full data) */
export function getLocalSlotsMeta(slots: SaveSlotId[]): SaveSlotMeta[] {
  return slots.map((slotId) => {
    const envelope = loadLocal(slotId);
    if (!envelope) return createEmptySlotMeta(slotId);
    return envelopeToMeta(slotId, envelope);
  });
}

// ============================================================
// CLOUD STORAGE — Read / Write (with chunking)
// ============================================================

/** Save envelope to cloud (auto-chunks if needed) */
export async function saveCloud(
  slotId: SaveSlotId,
  envelope: SaveEnvelope
): Promise<boolean> {
  if (!isCloudAvailable() || !cloudAdapter) return false;

  try {
    const baseKey = cloudKeyForSlot(slotId);

    if (needsChunking(envelope, CLOUD_CHUNK_SIZE)) {
      // Chunked save
      const { chunks, totalChunks } = chunkSave(envelope, CLOUD_CHUNK_SIZE);

      if (totalChunks > MAX_CLOUD_CHUNKS) {
        console.error(`[CloudSave Storage] Save too large: ${totalChunks} chunks (max ${MAX_CLOUD_CHUNKS})`);
        return false;
      }

      // Write chunk count header
      await cloudAdapter.setItem(`${baseKey}_n`, String(totalChunks));

      // Write each chunk
      for (let i = 0; i < totalChunks; i++) {
        const ok = await cloudAdapter.setItem(`${baseKey}_${i}`, chunks[i]);
        if (!ok) {
          console.error(`[CloudSave Storage] Cloud chunk ${i} write failed`);
          return false;
        }
      }

      // Clean up stale chunks (if previous save had more chunks)
      for (let i = totalChunks; i < MAX_CLOUD_CHUNKS; i++) {
        await cloudAdapter.removeItem(`${baseKey}_${i}`).catch(() => {});
      }

      return true;
    } else {
      // Single-key save
      const json = JSON.stringify(envelope);
      const ok = await cloudAdapter.setItem(baseKey, json);

      // Remove any stale chunk keys
      await cloudAdapter.removeItem(`${baseKey}_n`).catch(() => {});

      return ok;
    }
  } catch (err) {
    console.error(`[CloudSave Storage] Cloud save failed [${slotId}]:`, err);
    return false;
  }
}

/** Load envelope from cloud (auto-unchunks if needed) */
export async function loadCloud(
  slotId: SaveSlotId
): Promise<SaveEnvelope | null> {
  if (!isCloudAvailable() || !cloudAdapter) return null;

  try {
    const baseKey = cloudKeyForSlot(slotId);

    // Check for chunked save
    const chunkCountStr = await cloudAdapter.getItem(`${baseKey}_n`);

    if (chunkCountStr) {
      // Chunked load
      const totalChunks = parseInt(chunkCountStr, 10);
      if (isNaN(totalChunks) || totalChunks <= 0 || totalChunks > MAX_CLOUD_CHUNKS) {
        console.error(`[CloudSave Storage] Invalid chunk count: ${chunkCountStr}`);
        return null;
      }

      const chunks: string[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunk = await cloudAdapter.getItem(`${baseKey}_${i}`);
        if (chunk === null) {
          console.error(`[CloudSave Storage] Missing cloud chunk ${i}`);
          return null;
        }
        chunks.push(chunk);
      }

      return unchunkSave(chunks);
    } else {
      // Single-key load
      const raw = await cloudAdapter.getItem(baseKey);
      if (!raw) return null;
      return safeParseSave(raw);
    }
  } catch (err) {
    console.error(`[CloudSave Storage] Cloud load failed [${slotId}]:`, err);
    return null;
  }
}

/** Delete cloud save */
export async function deleteCloud(slotId: SaveSlotId): Promise<boolean> {
  if (!isCloudAvailable() || !cloudAdapter) return false;

  try {
    const baseKey = cloudKeyForSlot(slotId);

    // Remove single key
    await cloudAdapter.removeItem(baseKey);

    // Remove chunked keys
    await cloudAdapter.removeItem(`${baseKey}_n`).catch(() => {});
    for (let i = 0; i < MAX_CLOUD_CHUNKS; i++) {
      await cloudAdapter.removeItem(`${baseKey}_${i}`).catch(() => {});
    }

    return true;
  } catch {
    return false;
  }
}

/** Get metadata for cloud slots */
export async function getCloudSlotsMeta(
  slots: SaveSlotId[]
): Promise<SaveSlotMeta[]> {
  const results: SaveSlotMeta[] = [];
  for (const slotId of slots) {
    const envelope = await loadCloud(slotId);
    if (!envelope) {
      results.push(createEmptySlotMeta(slotId));
    } else {
      results.push(envelopeToMeta(slotId, envelope));
    }
  }
  return results;
}
