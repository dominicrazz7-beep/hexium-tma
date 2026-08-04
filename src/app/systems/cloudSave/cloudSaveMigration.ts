// ============================================================
// HEXIUM CLICKER · Cloud Save Manager · Migration
// ============================================================
// Handles save version migration when the schema changes.
// Migrations are sequential: v1→v2→v3→...→current.
// ============================================================

import type {
  SaveEnvelope,
  SavePayload,
  MigrationStep,
} from "./cloudSaveTypes";
import { CURRENT_SAVE_VERSION, crc32 } from "./cloudSaveData";

// ============================================================
// MIGRATION REGISTRY
// ============================================================

const migrations: MigrationStep[] = [];

/** Register a migration step */
export function registerMigration(step: MigrationStep): void {
  // Insert in order
  const idx = migrations.findIndex((m) => m.fromVersion >= step.fromVersion);
  if (idx < 0) {
    migrations.push(step);
  } else {
    migrations.splice(idx, 0, step);
  }
}

/** Get all registered migrations */
export function getMigrations(): MigrationStep[] {
  return [...migrations];
}

// ============================================================
// PRE-REGISTERED MIGRATIONS
// ============================================================

// -- Example: v1 → v2 (commented out — add when schema changes) --
// registerMigration({
//   fromVersion: 1,
//   toVersion: 2,
//   description: "Add quantum resources to save",
//   migrate: (data) => {
//     return {
//       ...data,
//       quantumResources: data.quantumResources ?? {
//         quantumDust: 0,
//         voidEssence: 0,
//         chronoFragments: 0,
//         darkMatter: 0,
//         singularityShards: 0,
//       },
//     };
//   },
// });

// ============================================================
// MIGRATION ENGINE
// ============================================================

/** Check if a save needs migration */
export function needsMigration(envelope: SaveEnvelope): boolean {
  return envelope.version < CURRENT_SAVE_VERSION;
}

/** Get required migration steps */
export function getMigrationPath(fromVersion: number): MigrationStep[] {
  const path: MigrationStep[] = [];
  let current = fromVersion;

  while (current < CURRENT_SAVE_VERSION) {
    const step = migrations.find((m) => m.fromVersion === current);
    if (!step) {
      console.warn(`[CloudSave Migration] No migration from v${current} to v${current + 1}`);
      break;
    }
    path.push(step);
    current = step.toVersion;
  }

  return path;
}

/** Apply all needed migrations to an envelope */
export function migrateSave(envelope: SaveEnvelope): {
  migrated: SaveEnvelope;
  stepsApplied: string[];
  success: boolean;
} {
  if (!needsMigration(envelope)) {
    return { migrated: envelope, stepsApplied: [], success: true };
  }

  const path = getMigrationPath(envelope.version);
  const stepsApplied: string[] = [];
  let data: SavePayload = { ...envelope.data };
  let currentVersion = envelope.version;

  for (const step of path) {
    try {
      console.log(`[CloudSave Migration] Applying: v${step.fromVersion}→v${step.toVersion}: ${step.description}`);
      data = step.migrate(data);
      currentVersion = step.toVersion;
      stepsApplied.push(`v${step.fromVersion}→v${step.toVersion}: ${step.description}`);
    } catch (err) {
      console.error(`[CloudSave Migration] Failed at v${step.fromVersion}→v${step.toVersion}:`, err);
      return {
        migrated: envelope,
        stepsApplied,
        success: false,
      };
    }
  }

  // Rebuild envelope with migrated data
  const dataJson = JSON.stringify(data);
  const migrated: SaveEnvelope = {
    ...envelope,
    version: currentVersion,
    data,
    checksum: crc32(dataJson),
    dataSize: dataJson.length,
    lastModifiedAt: new Date().toISOString(),
    writeCounter: envelope.writeCounter + 1,
  };

  console.log(`[CloudSave Migration] Complete: v${envelope.version}→v${currentVersion} (${stepsApplied.length} steps)`);

  return { migrated, stepsApplied, success: true };
}

/** Validate that migration path is complete (no gaps) */
export function validateMigrationPath(): {
  valid: boolean;
  gaps: number[];
} {
  const gaps: number[] = [];

  for (let v = 1; v < CURRENT_SAVE_VERSION; v++) {
    const step = migrations.find((m) => m.fromVersion === v);
    if (!step) {
      gaps.push(v);
    }
  }

  return { valid: gaps.length === 0, gaps };
}
