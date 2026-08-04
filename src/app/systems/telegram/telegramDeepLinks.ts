// ============================================================
// HEXIUM CLICKER · Telegram Deep Links
// ============================================================
// Parses start_param from Telegram bot link into
// structured DeepLinkParams for routing.
// ============================================================
// Link format: https://t.me/hexium_bot?start={action}_{value}
//
// Examples:
//   ?start=ref_12345       → referral from user 12345
//   ?start=event_summer2025 → open event screen
//   ?start=screen_shop     → open specific screen
//   ?start=gift_abc123     → claim gift code
// ============================================================

import type { DeepLinkParams } from "./telegramTypes";
import { telegramWebApp } from "./telegramWebApp";
import { telegramAuth } from "./telegramAuth";

// --- Parse start_param ---

function parseStartParam(startParam: string | null | undefined): DeepLinkParams {
  const empty: DeepLinkParams = {
    action: "none",
    raw: startParam ?? "",
  };

  if (!startParam || !startParam.trim()) return empty;

  const raw = startParam.trim();

  // Referral: ref_{userId}
  if (raw.startsWith("ref_")) {
    const code = raw.substring(4);
    if (code) {
      return { action: "referral", referralCode: code, raw };
    }
  }

  // Event: event_{eventId}
  if (raw.startsWith("event_")) {
    const eventId = raw.substring(6);
    if (eventId) {
      return { action: "event", eventId, raw };
    }
  }

  // Screen: screen_{screenId}
  if (raw.startsWith("screen_")) {
    const screen = raw.substring(7);
    if (screen) {
      return { action: "screen", screen, raw };
    }
  }

  // Gift: gift_{giftId}
  if (raw.startsWith("gift_")) {
    const giftId = raw.substring(5);
    if (giftId) {
      return { action: "gift", giftId, raw };
    }
  }

  // Unknown format — could be a plain referral code
  // Treat numeric-only values as referral codes (legacy format)
  if (/^\d+$/.test(raw)) {
    return { action: "referral", referralCode: raw, raw };
  }

  return { action: "none", raw };
}

// --- Get deep link from current WebApp context ---

function getDeepLink(): DeepLinkParams {
  // Try initDataUnsafe.start_param first
  const initDataUnsafe = telegramWebApp.getInitDataUnsafe();
  if (initDataUnsafe?.start_param) {
    return parseStartParam(initDataUnsafe.start_param);
  }

  // Try parsing from initData string
  const initData = telegramWebApp.getInitData();
  if (initData) {
    const startParam = telegramAuth.extractStartParam(initData);
    if (startParam) {
      return parseStartParam(startParam);
    }
  }

  return parseStartParam(null);
}

// --- Generate invite link ---

function generateInviteLink(botUsername: string, userId: number): string {
  return `https://t.me/${botUsername}?start=ref_${userId}`;
}

// --- Generate event link ---

function generateEventLink(botUsername: string, eventId: string): string {
  return `https://t.me/${botUsername}?start=event_${eventId}`;
}

// --- Generate screen link ---

function generateScreenLink(botUsername: string, screen: string): string {
  return `https://t.me/${botUsername}?start=screen_${screen}`;
}

// --- Generate gift link ---

function generateGiftLink(botUsername: string, giftId: string): string {
  return `https://t.me/${botUsername}?start=gift_${giftId}`;
}

// --- Share invite link via Telegram ---

function shareInviteLink(botUsername: string, userId: number): void {
  const link = generateInviteLink(botUsername, userId);
  const text = encodeURIComponent("Join HEXIUM CLICKER! ☢️ Mine HEX with me!");
  telegramWebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`);
}

// --- Export ---

export const telegramDeepLinks = {
  parseStartParam,
  getDeepLink,
  generateInviteLink,
  generateEventLink,
  generateScreenLink,
  generateGiftLink,
  shareInviteLink,
};
