// ============================================================
// HEXIUM CLICKER · Telegram User Manager
// ============================================================
// Creates and manages the HexiumTelegramUser from Telegram SDK
// or falls back to guest mode for browser development.
// ============================================================

import type {
  TelegramUser,
  HexiumTelegramUser,
  TelegramPlatform,
} from "./telegramTypes";
import { telegramWebApp } from "./telegramWebApp";
import { telegramAuth } from "./telegramAuth";

// --- Constants ---

const STORAGE_KEY = "hexium_tg_user";

const GUEST_USER: HexiumTelegramUser = {
  telegramId: 0,
  firstName: "Guest",
  lastName: "",
  username: "guest",
  languageCode: "en",
  photoUrl: "",
  isPremium: false,
  platform: "unknown",
  joinedAt: Date.now(),
};

// --- Create HexiumTelegramUser from TelegramUser ---

function fromTelegramUser(tgUser: TelegramUser, platform: TelegramPlatform): HexiumTelegramUser {
  return {
    telegramId: tgUser.id,
    firstName: tgUser.first_name ?? "Player",
    lastName: tgUser.last_name ?? "",
    username: tgUser.username ?? "",
    languageCode: tgUser.language_code ?? "en",
    photoUrl: tgUser.photo_url ?? "",
    isPremium: tgUser.is_premium ?? false,
    platform,
    joinedAt: Date.now(),
  };
}

// --- Detect user from WebApp ---

function detectUser(): HexiumTelegramUser {
  // Try initDataUnsafe first (most reliable)
  const initDataUnsafe = telegramWebApp.getInitDataUnsafe();
  if (initDataUnsafe?.user) {
    const hUser = fromTelegramUser(initDataUnsafe.user, telegramWebApp.getPlatform());
    saveToLocalStorage(hUser);
    console.log("[TG User] Detected from initDataUnsafe:", hUser.firstName, hUser.telegramId);
    return hUser;
  }

  // Try parsing initData string
  const initData = telegramWebApp.getInitData();
  if (initData) {
    const tgUser = telegramAuth.extractUser(initData);
    if (tgUser) {
      const hUser = fromTelegramUser(tgUser, telegramWebApp.getPlatform());
      saveToLocalStorage(hUser);
      console.log("[TG User] Detected from initData:", hUser.firstName, hUser.telegramId);
      return hUser;
    }
  }

  // Try cached user from localStorage
  const cached = loadFromLocalStorage();
  if (cached) {
    console.log("[TG User] Loaded from cache:", cached.firstName, cached.telegramId);
    return cached;
  }

  // Guest mode
  console.warn("[TG User] No Telegram user found — using guest mode");
  return { ...GUEST_USER, joinedAt: Date.now() };
}

// --- Local storage persistence ---

function saveToLocalStorage(user: HexiumTelegramUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    console.warn("[TG User] Failed to save to localStorage");
  }
}

function loadFromLocalStorage(): HexiumTelegramUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HexiumTelegramUser;
  } catch {
    return null;
  }
}

function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// --- Helpers ---

function getDisplayName(user: HexiumTelegramUser): string {
  if (user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.firstName;
}

function getProfileLink(user: HexiumTelegramUser): string {
  if (user.username) {
    return `https://t.me/${user.username}`;
  }
  return "";
}

function isGuest(user: HexiumTelegramUser): boolean {
  return user.telegramId === 0;
}

function isTelegramPremium(user: HexiumTelegramUser): boolean {
  return user.isPremium;
}

// --- Export ---

export const telegramUser = {
  detectUser,
  fromTelegramUser,
  getDisplayName,
  getProfileLink,
  isGuest,
  isTelegramPremium,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  GUEST_USER,
};
