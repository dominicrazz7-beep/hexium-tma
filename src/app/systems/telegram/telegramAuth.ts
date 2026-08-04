// ============================================================
// HEXIUM CLICKER · Telegram InitData Auth
// ============================================================
// Parses and validates Telegram WebApp initData.
// NOTE: Real HMAC-SHA-256 validation MUST happen server-side.
// Client-side only parses + extracts user safely.
// ============================================================

import type { TelegramInitData, TelegramUser } from "./telegramTypes";

// --- Parse initData query string ---

function parseInitData(initDataString: string): TelegramInitData | null {
  if (!initDataString) return null;

  try {
    const params = new URLSearchParams(initDataString);
    const data: Record<string, unknown> = {};

    for (const [key, value] of params.entries()) {
      if (key === "user" || key === "receiver" || key === "chat") {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      } else if (key === "auth_date" || key === "can_send_after") {
        data[key] = parseInt(value, 10);
      } else {
        data[key] = value;
      }
    }

    return data as unknown as TelegramInitData;
  } catch (err) {
    console.error("[TG Auth] Failed to parse initData:", err);
    return null;
  }
}

// --- Extract user from initData ---

function extractUser(initDataString: string): TelegramUser | null {
  const parsed = parseInitData(initDataString);
  return parsed?.user ?? null;
}

// --- Extract start_param ---

function extractStartParam(initDataString: string): string | null {
  const parsed = parseInitData(initDataString);
  return parsed?.start_param ?? null;
}

// --- Check auth freshness ---

function isAuthFresh(initDataString: string, maxAgeSeconds: number = 86400): boolean {
  const parsed = parseInitData(initDataString);
  if (!parsed?.auth_date) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - parsed.auth_date < maxAgeSeconds;
}

// --- Client-side hash format check (NOT validation) ---
// Real HMAC-SHA-256 validation requires BOT_TOKEN → must happen server-side

function hasValidHashFormat(initDataString: string): boolean {
  const parsed = parseInitData(initDataString);
  if (!parsed?.hash) return false;
  // Telegram hash is always 64-char hex (SHA-256)
  return /^[a-f0-9]{64}$/.test(parsed.hash);
}

// --- Build data-check-string (for server-side validation reference) ---
// Server should:
//   1. Parse initData params (excluding hash)
//   2. Sort alphabetically
//   3. Join with \n
//   4. HMAC-SHA-256 with secret_key = HMAC-SHA-256(BOT_TOKEN, "WebAppData")
//   5. Compare with hash

function buildDataCheckString(initDataString: string): string {
  const params = new URLSearchParams(initDataString);
  const entries: [string, string][] = [];

  for (const [key, value] of params.entries()) {
    if (key !== "hash") {
      entries.push([key, value]);
    }
  }

  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("\n");
}

// --- Quick validate (client-side checks only) ---

interface ClientValidation {
  hasUser: boolean;
  hasHash: boolean;
  hashFormatValid: boolean;
  isFresh: boolean;
  user: TelegramUser | null;
  startParam: string | null;
}

function clientValidate(initDataString: string): ClientValidation {
  const user = extractUser(initDataString);
  return {
    hasUser: user !== null,
    hasHash: initDataString.includes("hash="),
    hashFormatValid: hasValidHashFormat(initDataString),
    isFresh: isAuthFresh(initDataString),
    user,
    startParam: extractStartParam(initDataString),
  };
}

// --- Export ---

export const telegramAuth = {
  parseInitData,
  extractUser,
  extractStartParam,
  isAuthFresh,
  hasValidHashFormat,
  buildDataCheckString,
  clientValidate,
};
