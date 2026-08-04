// ============================================================
// HEXIUM CLICKER · Telegram Bridge
// ============================================================
// Unified API for screens to interact with Telegram.
// Screens import ONLY this bridge — never raw SDK calls.
// ============================================================

import type {
  HexiumTelegramUser,
  DeepLinkParams,
  TelegramPlatform,
  HapticImpactStyle,
  HapticNotificationType,
  TelegramSystemStatus,
  CloudProfileData,
} from "../systems/telegram/telegramTypes";
import { telegramWebApp } from "../systems/telegram/telegramWebApp";
import { telegramAuth } from "../systems/telegram/telegramAuth";
import { telegramUser } from "../systems/telegram/telegramUser";
import { telegramHaptics } from "../systems/telegram/telegramHaptics";
import { telegramDeepLinks } from "../systems/telegram/telegramDeepLinks";
import { telegramCloudStorage } from "../systems/telegram/telegramCloudStorage";

// --- Config ---

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME ?? "hexium_bot";

// --- State ---

let currentUser: HexiumTelegramUser | null = null;
let currentDeepLink: DeepLinkParams | null = null;
let initialized = false;

// --- Initialize ---

async function initialize(): Promise<TelegramSystemStatus> {
  if (initialized) {
    return getStatus();
  }

  // 1. Init WebApp SDK
  telegramWebApp.initialize();

  // 2. Detect user
  currentUser = telegramUser.detectUser();

  // 3. Parse deep link
  currentDeepLink = telegramDeepLinks.getDeepLink();
  if (currentDeepLink.action !== "none") {
    console.log("[TG Bridge] Deep link:", currentDeepLink.action, currentDeepLink.raw);
  }

  // 4. Client-side auth check
  const initData = telegramWebApp.getInitData();
  if (initData) {
    const validation = telegramAuth.clientValidate(initData);
    if (!validation.isFresh) {
      console.warn("[TG Bridge] Auth data may be stale");
    }
  }

  initialized = true;

  const status = getStatus();
  console.log("[TG Bridge] Initialized:", {
    platform: status.platform,
    user: currentUser?.firstName,
    deepLink: currentDeepLink.action,
    cloud: status.cloudAvailable,
    haptic: status.hapticAvailable,
  });

  return status;
}

// --- Status ---

function getStatus(): TelegramSystemStatus {
  return {
    initialized,
    platform: telegramWebApp.getPlatform(),
    user: currentUser,
    deepLink: currentDeepLink ?? { action: "none", raw: "" },
    cloudAvailable: telegramCloudStorage.isAvailable(),
    hapticAvailable: telegramHaptics.isHapticAvailable(),
    version: telegramWebApp.getVersion(),
    isWebView: telegramWebApp.isWebView(),
  };
}

function isInitialized(): boolean {
  return initialized;
}

// --- User ---

function getUser(): HexiumTelegramUser | null {
  return currentUser;
}

function getUserId(): number {
  return currentUser?.telegramId ?? 0;
}

function getDisplayName(): string {
  return currentUser ? telegramUser.getDisplayName(currentUser) : "Guest";
}

function isGuest(): boolean {
  return currentUser ? telegramUser.isGuest(currentUser) : true;
}

function isPremium(): boolean {
  return currentUser?.isPremium ?? false;
}

function getLanguageCode(): string {
  return currentUser?.languageCode ?? "en";
}

// --- Platform ---

function getPlatform(): TelegramPlatform {
  return telegramWebApp.getPlatform();
}

function isWebView(): boolean {
  return telegramWebApp.isWebView();
}

function isMobile(): boolean {
  const p = getPlatform();
  return p === "android" || p === "ios";
}

function isDesktop(): boolean {
  const p = getPlatform();
  return p === "tdesktop" || p === "macos";
}

// --- Haptics ---

function haptic(style: HapticImpactStyle): void {
  telegramHaptics.impact(style);
}

function hapticNotify(type: HapticNotificationType): void {
  telegramHaptics.notification(type);
}

function hapticTap(): void {
  telegramHaptics.tapMine();
}

function hapticSuccess(): void {
  telegramHaptics.rewardClaim();
}

function hapticError(): void {
  telegramHaptics.errorAction();
}

function hapticNavigate(): void {
  telegramHaptics.navigate();
}

function hapticCaseOpen(): void {
  telegramHaptics.caseOpen();
}

function hapticBossHit(): void {
  telegramHaptics.bossHit();
}

function hapticLevelUp(): void {
  telegramHaptics.levelUp();
}

function setHapticEnabled(enabled: boolean): void {
  telegramHaptics.setEnabled(enabled);
}

// --- Deep Links ---

function getDeepLink(): DeepLinkParams {
  return currentDeepLink ?? { action: "none", raw: "" };
}

function getInviteLink(): string {
  const userId = getUserId();
  if (!userId) return "";
  return telegramDeepLinks.generateInviteLink(BOT_USERNAME, userId);
}

function shareInvite(): void {
  const userId = getUserId();
  if (!userId) return;
  telegramDeepLinks.shareInviteLink(BOT_USERNAME, userId);
}

// --- Cloud Storage ---

async function saveToCloud(profileData: CloudProfileData): Promise<boolean> {
  if (!telegramCloudStorage.isAvailable()) return false;
  return telegramCloudStorage.saveProfile(profileData);
}

async function loadFromCloud(): Promise<CloudProfileData | null> {
  if (!telegramCloudStorage.isAvailable()) return null;
  return telegramCloudStorage.loadProfile();
}

async function deleteCloudData(): Promise<boolean> {
  if (!telegramCloudStorage.isAvailable()) return false;
  return telegramCloudStorage.deleteProfile();
}

// --- Popups ---

function showAlert(message: string): Promise<void> {
  return telegramWebApp.showAlert(message);
}

function showConfirm(message: string): Promise<boolean> {
  return telegramWebApp.showConfirm(message);
}

// --- Links ---

function openLink(url: string): void {
  telegramWebApp.openLink(url);
}

function openTelegramLink(url: string): void {
  telegramWebApp.openTelegramLink(url);
}

// --- Invoice (payments) ---

function openInvoice(url: string): Promise<"paid" | "cancelled" | "failed" | "pending"> {
  return telegramWebApp.openInvoice(url);
}

// --- App lifecycle ---

function closeApp(): void {
  telegramWebApp.close();
}

function getViewportHeight(): number {
  return telegramWebApp.getViewportHeight();
}

// --- Export ---


// ── Cleanup ──────────────────────────────────────────────
function destroy(): void {
  currentUser = null;
  currentDeepLink = null;
  initialized = false;
}

export const telegramBridge = {
  // Init
  initialize,
  isInitialized,
  getStatus,

  // User
  getUser,
  getUserId,
  getDisplayName,
  isGuest,
  isPremium,
  getLanguageCode,

  // Platform
  getPlatform,
  isWebView,
  isMobile,
  isDesktop,

  // Haptics
  haptic,
  hapticNotify,
  hapticTap,
  hapticSuccess,
  hapticError,
  hapticNavigate,
  hapticCaseOpen,
  hapticBossHit,
  hapticLevelUp,
  setHapticEnabled,

  // Deep links
  getDeepLink,
  getInviteLink,
  shareInvite,

  // Cloud
  saveToCloud,
  loadFromCloud,
  deleteCloudData,

  // Popups
  showAlert,
  showConfirm,

  // Links
  openLink,
  openTelegramLink,

  // Payments
  openInvoice,

  // App
  closeApp,
  getViewportHeight,

  // Cleanup
  destroy,
};
