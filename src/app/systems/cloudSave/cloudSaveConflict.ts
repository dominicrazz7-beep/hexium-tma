// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Conflict Resolution
// ============================================================
// Detects and resolves conflicts between local and cloud saves.
// Supports auto-resolution and user-choice flows.
// ============================================================

import type {
  SaveEnvelope,
  ConflictInfo,
  ConflictResolution,
} from "./cloudSaveTypes";
import {
  detectConflict,
  resolveConflict,
  savesAreEqual,
  verifyChecksum,
  compareSaves,
} from "./cloudSaveLogic";

// ============================================================
// CONFLICT STATE
// ============================================================

let pendingConflict: ConflictInfo | null = null;
let conflictCallback: ((resolution: ConflictResolution) => void) | null = null;

// ============================================================
// DETECT & RESOLVE
// ============================================================

/** Analyze local vs cloud and determine action */
export function analyzeConflict(
  local: SaveEnvelope,
  cloud: SaveEnvelope
): ConflictInfo {
  return detectConflict(local, cloud);
}

/** Auto-resolve a conflict without user input */
export function autoResolve(
  local: SaveEnvelope,
  cloud: SaveEnvelope
): {
  resolved: SaveEnvelope;
  action: string;
  conflictDetected: boolean;
} {
  // Identical saves — no conflict
  if (savesAreEqual(local, cloud)) {
    return {
      resolved: local,
      action: "no_conflict_identical",
      conflictDetected: false,
    };
  }

  // One save is invalid — use the valid one
  const localValid = verifyChecksum(local);
  const cloudValid = verifyChecksum(cloud);

  if (!localValid && cloudValid) {
    return {
      resolved: cloud,
      action: "local_corrupted_use_cloud",
      conflictDetected: true,
    };
  }

  if (localValid && !cloudValid) {
    return {
      resolved: local,
      action: "cloud_corrupted_use_local",
      conflictDetected: true,
    };
  }

  if (!localValid && !cloudValid) {
    // Both corrupted — use whichever has higher write counter
    const comp = compareSaves(local, cloud);
    return {
      resolved: comp === "b_newer" ? cloud : local,
      action: "both_corrupted_use_newer",
      conflictDetected: true,
    };
  }

  // Both valid but different — use newer
  const conflict = detectConflict(local, cloud);
  const resolved = resolveConflict(conflict, "use_newer");

  return {
    resolved,
    action: `use_newer_${compareSaves(local, cloud)}`,
    conflictDetected: true,
  };
}

/** Start a user-choice conflict (stores pending conflict) */
export function requestUserResolution(
  local: SaveEnvelope,
  cloud: SaveEnvelope,
  callback: (resolution: ConflictResolution) => void
): ConflictInfo {
  const conflict = detectConflict(local, cloud);
  pendingConflict = conflict;
  conflictCallback = callback;
  return conflict;
}

/** User chose a resolution */
export function submitUserChoice(resolution: ConflictResolution): SaveEnvelope | null {
  if (!pendingConflict) return null;

  const resolved = resolveConflict(pendingConflict, resolution);
  const cb = conflictCallback;

  pendingConflict = null;
  conflictCallback = null;

  if (cb) cb(resolution);

  return resolved;
}

/** Check if there's a pending conflict */
export function hasPendingConflict(): boolean {
  return pendingConflict !== null;
}

/** Get pending conflict info */
export function getPendingConflict(): ConflictInfo | null {
  return pendingConflict;
}

/** Cancel pending conflict (use local by default) */
export function cancelConflict(): void {
  if (conflictCallback) {
    conflictCallback("use_local");
  }
  pendingConflict = null;
  conflictCallback = null;
}

// ============================================================
// CONFLICT FORMATTING (for UI)
// ============================================================

/** Format conflict info for display */
export function formatConflictForUI(conflict: ConflictInfo): {
  title: string;
  localInfo: string;
  cloudInfo: string;
  recommendation: string;
} {
  const localDate = new Date(conflict.localModifiedAt).toLocaleString();
  const cloudDate = new Date(conflict.cloudModifiedAt).toLocaleString();
  const comparison = compareSaves(conflict.localSave, conflict.cloudSave);

  let recommendation: string;
  switch (comparison) {
    case "a_newer":
      recommendation = "Local save is newer — recommended: Keep Local";
      break;
    case "b_newer":
      recommendation = "Cloud save is newer — recommended: Keep Cloud";
      break;
    default:
      recommendation = "Both saves are the same version — either is fine";
  }

  return {
    title: "⚠️ Save Conflict Detected",
    localInfo: [
      `📱 This device (${conflict.localDeviceId.slice(0, 12)}...)`,
      `📅 Modified: ${localDate}`,
      `🔢 Writes: ${conflict.localWriteCounter}`,
    ].join("\n"),
    cloudInfo: [
      `☁️ Cloud (device: ${conflict.cloudDeviceId.slice(0, 12)}...)`,
      `📅 Modified: ${cloudDate}`,
      `🔢 Writes: ${conflict.cloudWriteCounter}`,
    ].join("\n"),
    recommendation,
  };
}
