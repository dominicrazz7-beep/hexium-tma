#!/usr/bin/env node
/*
 * HEXIUM Storage Manifest Audit
 *
 * Read-only audit script. Scans src/ for HEXIUM storage-key string literals
 * and verifies they are documented in src/app/core/storageManifest.ts.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXIT_PASS = 0;
const EXIT_MISSING_SOURCE_KEYS = 1;
const EXIT_REQUIRED_FILE_READ_ERROR = 2;
const EXIT_INTERNAL_ERROR = 3;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const MANIFEST_PATH = path.join(SRC_DIR, "app", "core", "storageManifest.ts");

const EXCLUDED_DIRS = new Set(["node_modules", "dist", "coverage", ".hermes"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const STORAGE_KEY_LITERAL_RE = /(["'`])((?:hexium_|hx_sv_)[A-Za-z0-9_<-]*[A-Za-z0-9_>]|(?:hexium_|hx_sv_))\1/g;
const SAVE_KEYS_ENTRY_RE = /^\s*([A-Za-z0-9_]+):\s*(["'`])((?:hexium_|hx_sv_)[A-Za-z0-9_<-]*[A-Za-z0-9_>]|(?:hexium_|hx_sv_))\2\s*,?\s*$/;
const SAVE_KEYS_OBJECT_RE = /^\s*([A-Za-z0-9_]+):\s*\{\s*$/;
const STORAGE_AREA_BLOCK_RE = /\{[\s\S]*?key:\s*SAVE_KEYS\.([A-Za-z0-9_.]+)[\s\S]*?status:\s*(["'`])(canonical|legacy|duplicate|reserved|pattern)\2[\s\S]*?\}/g;
const IGNORE_UNUSED_STATUSES = new Set(["legacy", "reserved", "pattern"]);
const KNOWN_FALSE_POSITIVE_KEYS = new Set([
  // Telegram bot handle fallback, not storage.
  "hexium_bot",
  // World boss/game content id, not storage.
  "hexium_prime",
]);

function main() {
  try {
    const manifestText = readRequiredFile(MANIFEST_PATH);
    const manifest = parseManifest(manifestText);
    const sourceFiles = collectSourceFiles(SRC_DIR);
    const sourceKeys = collectSourceKeys(sourceFiles);
    const comparison = compareKeys(sourceKeys.keys, manifest);

    printReport({ sourceFiles, sourceKeys, manifest, comparison });

    if (comparison.missingFromManifest.length > 0) {
      process.exitCode = EXIT_MISSING_SOURCE_KEYS;
      return;
    }

    process.exitCode = EXIT_PASS;
  } catch (error) {
    if (error instanceof RequiredFileReadError) {
      console.error("HEXIUM Storage Manifest Audit failed: required file cannot be read.");
      console.error(`- ${error.filePath}`);
      console.error(`- ${error.message}`);
      process.exitCode = EXIT_REQUIRED_FILE_READ_ERROR;
      return;
    }

    console.error("HEXIUM Storage Manifest Audit failed: internal script error.");
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = EXIT_INTERNAL_ERROR;
  }
}

class RequiredFileReadError extends Error {
  constructor(filePath, cause) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.filePath = filePath;
  }
}

function readRequiredFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new RequiredFileReadError(filePath, error);
  }
}

function parseManifest(manifestText) {
  const saveKeyByPath = extractSaveKeys(manifestText);
  const statusByKey = extractStorageAreaStatuses(manifestText, saveKeyByPath);
  const allLiteralKeys = extractStorageLiterals(manifestText);
  const documentedKeys = new Map();

  for (const [keyPath, key] of saveKeyByPath.entries()) {
    documentedKeys.set(key, {
      key,
      keyPath,
      status: statusByKey.get(key) ?? "canonical",
    });
  }

  for (const key of allLiteralKeys) {
    if (!documentedKeys.has(key)) {
      documentedKeys.set(key, {
        key,
        keyPath: null,
        status: statusByKey.get(key) ?? inferStatusFromKey(key),
      });
    }
  }

  const duplicateKeys = findDuplicateManifestKeys([...saveKeyByPath.values()], statusByKey);
  const patternKeys = [...documentedKeys.values()]
    .filter((entry) => entry.status === "pattern" || entry.key.includes("<"))
    .map((entry) => entry.key);

  return {
    saveKeyByPath,
    statusByKey,
    documentedKeys,
    duplicateKeys,
    patternKeys,
  };
}

function extractSaveKeys(manifestText) {
  const lines = manifestText.split(/\r?\n/);
  const saveKeys = new Map();
  const stack = [];
  let inSaveKeys = false;
  let saveKeysDepth = 0;

  for (const line of lines) {
    if (!inSaveKeys && line.includes("export const SAVE_KEYS")) {
      inSaveKeys = true;
      saveKeysDepth = braceDelta(line);
      continue;
    }

    if (!inSaveKeys) continue;

    const entryMatch = line.match(SAVE_KEYS_ENTRY_RE);
    if (entryMatch) {
      const [, propertyName, , key] = entryMatch;
      saveKeys.set([...stack, propertyName].join("."), key);
      saveKeysDepth += braceDelta(line);
      if (saveKeysDepth <= 0) break;
      continue;
    }

    const objectMatch = line.match(SAVE_KEYS_OBJECT_RE);
    if (objectMatch) {
      stack.push(objectMatch[1]);
      saveKeysDepth += braceDelta(line);
      continue;
    }

    const closeCount = countChar(line, "}");
    for (let i = 0; i < closeCount && stack.length > 0; i += 1) {
      stack.pop();
    }

    saveKeysDepth += braceDelta(line);
    if (saveKeysDepth <= 0) break;
  }

  return saveKeys;
}

function extractStorageAreaStatuses(manifestText, saveKeyByPath) {
  const statusByKey = new Map();
  let match;

  while ((match = STORAGE_AREA_BLOCK_RE.exec(manifestText)) !== null) {
    const [, keyPath, , status] = match;
    const resolvedKey = saveKeyByPath.get(keyPath);
    if (resolvedKey) statusByKey.set(resolvedKey, status);
  }

  return statusByKey;
}

function extractStorageLiterals(text) {
  const keys = new Set();
  let match;

  STORAGE_KEY_LITERAL_RE.lastIndex = 0;
  while ((match = STORAGE_KEY_LITERAL_RE.exec(text)) !== null) {
    keys.add(match[2]);
  }

  return keys;
}

function inferStatusFromKey(key) {
  return key.includes("<") ? "pattern" : "canonical";
}

function findDuplicateManifestKeys(keys, statusByKey) {
  const counts = new Map();

  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({
      key,
      count,
      intentionallyMarked: statusByKey.get(key) === "duplicate",
    }));
}

function collectSourceFiles(startDir) {
  const files = [];
  walk(startDir, files);
  return files;
}

function walk(currentPath, files) {
  let entries;
  try {
    entries = fs.readdirSync(currentPath, { withFileTypes: true });
  } catch (error) {
    throw new RequiredFileReadError(currentPath, error);
  }

  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (!entry.isFile()) continue;
    if (path.resolve(fullPath) === path.resolve(MANIFEST_PATH)) continue;
    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;

    files.push(fullPath);
  }
}

function collectSourceKeys(sourceFiles) {
  const keys = new Map();

  for (const filePath of sourceFiles) {
    let text;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      throw new RequiredFileReadError(filePath, error);
    }

    const lineStarts = computeLineStarts(text);
    let match;
    STORAGE_KEY_LITERAL_RE.lastIndex = 0;

    while ((match = STORAGE_KEY_LITERAL_RE.exec(text)) !== null) {
      const key = match[2];
      if (KNOWN_FALSE_POSITIVE_KEYS.has(key)) continue;

      const line = findLineNumber(lineStarts, match.index);
      const location = `${toProjectRelative(filePath)}:${line}`;

      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(location);
    }
  }

  return { keys };
}

function compareKeys(sourceKeys, manifest) {
  const documentedExactKeys = new Set(manifest.documentedKeys.keys());
  const patternKeys = manifest.patternKeys;
  const sourceKeyNames = new Set(sourceKeys.keys());

  const missingFromManifest = [...sourceKeyNames]
    .filter((key) => !isKeyDocumented(key, documentedExactKeys, patternKeys))
    .sort()
    .map((key) => ({ key, locations: sourceKeys.get(key) ?? [] }));

  const unusedManifestKeys = [...manifest.documentedKeys.values()]
    .filter((entry) => !IGNORE_UNUSED_STATUSES.has(entry.status))
    .filter((entry) => !entry.key.includes("<"))
    .filter((entry) => !isConcreteGeneratedKey(entry.key, sourceKeyNames, patternKeys))
    .filter((entry) => !sourceKeyNames.has(entry.key))
    .sort((a, b) => a.key.localeCompare(b.key));

  const duplicateIssues = manifest.duplicateKeys.filter((entry) => !entry.intentionallyMarked);

  return {
    missingFromManifest,
    unusedManifestKeys,
    duplicateKeys: manifest.duplicateKeys,
    duplicateIssues,
  };
}

function isConcreteGeneratedKey(key, sourceKeyNames, patternKeys) {
  if (sourceKeyNames.has(key)) return false;

  for (const pattern of patternKeys) {
    const prefix = pattern.split("<")[0];
    if (prefix && key.startsWith(prefix) && sourceKeyNames.has(prefix)) return true;
  }

  return false;
}

function isKeyDocumented(key, documentedExactKeys, patternKeys) {
  if (documentedExactKeys.has(key)) return true;

  for (const pattern of patternKeys) {
    const prefix = pattern.split("<")[0];
    if (prefix && key.startsWith(prefix)) return true;
  }

  return false;
}

function printReport({ sourceFiles, sourceKeys, manifest, comparison }) {
  const sourceKeyNames = [...sourceKeys.keys.keys()].sort();
  const manifestKeyNames = [...manifest.documentedKeys.keys()].sort();

  console.log("HEXIUM Storage Manifest Audit");
  console.log("");
  console.log(`Scanned files: ${sourceFiles.length}`);
  console.log(`Source keys found: ${sourceKeyNames.length}`);
  console.log(`Manifest keys found: ${manifestKeyNames.length}`);
  console.log("");

  printKeyList("Source keys missing from manifest", comparison.missingFromManifest, (entry) => {
    const locations = entry.locations.slice(0, 8).map((location) => `    - ${location}`).join("\n");
    const more = entry.locations.length > 8 ? `\n    - ... ${entry.locations.length - 8} more` : "";
    return `  - ${entry.key}\n${locations}${more}`;
  });

  printKeyList("Unused manifest keys", comparison.unusedManifestKeys, (entry) => {
    return `  - ${entry.key} (${entry.status})`;
  });

  printKeyList("Duplicate manifest keys", comparison.duplicateKeys, (entry) => {
    const marker = entry.intentionallyMarked ? "allowed: marked duplicate" : "ERROR: not marked duplicate";
    return `  - ${entry.key} x${entry.count} (${marker})`;
  });

  if (comparison.missingFromManifest.length === 0) {
    console.log("PASS: all source storage keys are documented in storageManifest.ts.");
  } else {
    console.log("FAIL: source storage keys are missing from storageManifest.ts.");
  }

  if (comparison.duplicateIssues.length > 0) {
    console.log("");
    console.log("Warning: duplicate manifest keys without status 'duplicate' were found.");
  }
}

function printKeyList(title, entries, formatEntry) {
  console.log(`${title}: ${entries.length}`);
  if (entries.length > 0) {
    for (const entry of entries) console.log(formatEntry(entry));
  }
  console.log("");
}

function braceDelta(line) {
  return countChar(line, "{") - countChar(line, "}");
}

function countChar(text, char) {
  let count = 0;
  for (const current of text) {
    if (current === char) count += 1;
  }
  return count;
}

function computeLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function findLineNumber(lineStarts, index) {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return high + 1;
}

function toProjectRelative(filePath) {
  return path.relative(PROJECT_ROOT, filePath).split(path.sep).join("/");
}

main();
