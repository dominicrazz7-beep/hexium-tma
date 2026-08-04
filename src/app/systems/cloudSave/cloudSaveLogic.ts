// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Core Logic
// ============================================================
// Pure functions: validation, comparison, checksum verification.
// No side effects, no storage access.
// ============================================================

import type {
  SaveEnvelope,
  SavePayload,
  SaveValidation,
  ConflictInfo,
  ConflictResolution,
} from "./cloudSaveTypes";
import { crc32, CURRENT_SAVE_VERSION } from "./cloudSaveData";

// ============================================================
// VALIDATION
// ============================================================

/** Full validation of a save envelope */
export function validateSave(
  envelope: SaveEnvelope,
  expectedPlayerId?: number
): SaveValidation {
  const result: SaveValidation = {
    valid: true,
    reason: "ok",
    checksumMatch: true,
    versionOk: true,
    playerIdMatch: true,
    dataIntact: true,
  };

  // Check data exists
  if (!envelope.data || typeof envelope.data !== "object") {
    return { ...result, valid: false, reason: "missing_data", dataIntact: false };
  }

  // Checksum verification
  const dataJson = JSON.stringify(envelope.data);
  const computed = crc32(dataJson);
  if (computed !== envelope.checksum) {
    result.checksumMatch = false;
    result.valid = false;
    result.reason = "checksum_mismatch";
  }

  // Data size check
  if (Math.abs(dataJson.length - envelope.dataSize) > 10) {
    result.dataIntact = false;
    if (result.valid) {
      result.valid = false;
      result.reason = "size_mismatch";
    }
  }

  // Version check (can be older — migration handles that)
  if (envelope.version > CURRENT_SAVE_VERSION) {
    result.versionOk = false;
    if (result.valid) {
      result.valid = false;
      result.reason = "future_version";
    }
  }

  // Player ID binding
  if (expectedPlayerId !== undefined && envelope.playerId !== expectedPlayerId) {
    result.playerIdMatch = false;
    if (result.valid) {
      result.valid = false;
      result.reason = "player_id_mismatch";
    }
  }

  return result;
}

/** Quick checksum verification only */
export function verifyChecksum(envelope: SaveEnvelope): boolean {
  try {
    const dataJson = JSON.stringify(envelope.data);
    return crc32(dataJson) === envelope.checksum;
  } catch {
    return false;
  }
}

// ============================================================
// COMPARISON
// ============================================================

/** Compare two saves to determine which is newer */
export function compareSaves(
  a: SaveEnvelope,
  b: SaveEnvelope
): "a_newer" | "b_newer" | "equal" {
  // Write counter is the most reliable
  if (a.writeCounter !== b.writeCounter) {
    return a.writeCounter > b.writeCounter ? "a_newer" : "b_newer";
  }

  // Fall back to timestamp
  const tsA = new Date(a.lastModifiedAt).getTime();
  const tsB = new Date(b.lastModifiedAt).getTime();
  if (tsA !== tsB) {
    return tsA > tsB ? "a_newer" : "b_newer";
  }

  return "equal";
}

/** Check if two saves have the same content */
export function savesAreEqual(a: SaveEnvelope, b: SaveEnvelope): boolean {
  return a.checksum === b.checksum && a.dataSize === b.dataSize;
}

/** Detect conflict between local and cloud */
export function detectConflict(
  local: SaveEnvelope,
  cloud: SaveEnvelope
): ConflictInfo {
  const comparison = compareSaves(local, cloud);
  const equal = savesAreEqual(local, cloud);

  // Determine auto-resolution
  let autoResolution: ConflictResolution = "use_newer";
  if (equal) {
    autoResolution = "use_local"; // identical — keep local
  } else if (local.deviceId === cloud.deviceId) {
    // Same device — just use newer
    autoResolution = "use_newer";
  } else {
    // Different devices with different data — needs attention
    autoResolution = "use_newer";
  }

  return {
    localSave: local,
    cloudSave: cloud,
    localModifiedAt: local.lastModifiedAt,
    cloudModifiedAt: cloud.lastModifiedAt,
    localWriteCounter: local.writeCounter,
    cloudWriteCounter: cloud.writeCounter,
    localDeviceId: local.deviceId,
    cloudDeviceId: cloud.deviceId,
    autoResolution,
    resolved: equal,
  };
}

/** Resolve a conflict with a given strategy */
export function resolveConflict(
  conflict: ConflictInfo,
  resolution: ConflictResolution
): SaveEnvelope {
  switch (resolution) {
    case "use_local":
      return conflict.localSave;

    case "use_cloud":
      return conflict.cloudSave;

    case "use_newer": {
      const comp = compareSaves(conflict.localSave, conflict.cloudSave);
      return comp === "b_newer" ? conflict.cloudSave : conflict.localSave;
    }

    case "user_choice":
      // Caller should present UI and then call with use_local or use_cloud
      return conflict.localSave; // default to local until user decides

    default:
      return conflict.localSave;
  }
}

// ============================================================
// DATA HELPERS
// ============================================================

/** Safely parse JSON with fallback */
export function safeParseSave(raw: string): SaveEnvelope | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.data) {
      return null;
    }
    return parsed as SaveEnvelope;
  } catch {
    return null;
  }
}

/** Estimate cloud storage usage for a save */
export function estimateCloudSize(envelope: SaveEnvelope): number {
  return JSON.stringify(envelope).length;
}

/** Check if save needs chunking for cloud */
export function needsChunking(envelope: SaveEnvelope, chunkSize: number): boolean {
  return estimateCloudSize(envelope) > chunkSize;
}

/** Split save into chunks for cloud storage */
export function chunkSave(
  envelope: SaveEnvelope,
  chunkSize: number
): { chunks: string[]; totalChunks: number } {
  const full = JSON.stringify(envelope);
  const chunks: string[] = [];

  for (let i = 0; i < full.length; i += chunkSize) {
    chunks.push(full.slice(i, i + chunkSize));
  }

  return { chunks, totalChunks: chunks.length };
}

/** Reassemble chunked save */
export function unchunkSave(chunks: string[]): SaveEnvelope | null {
  try {
    const full = chunks.join("");
    return safeParseSave(full);
  } catch {
    return null;
  }
}
