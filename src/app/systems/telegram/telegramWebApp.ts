// ============================================================
// HEXIUM CLICKER · Telegram WebApp SDK Wrapper
// ============================================================
// Wraps window.Telegram.WebApp with safe fallbacks for
// non-Telegram environments (browser dev, desktop).
// ============================================================

import type {
  TelegramWebAppInstance,
  TelegramThemeParams,
  TelegramPlatform,
  TelegramPopupParams,
} from "./telegramTypes";

// --- Constants ---

const HEXIUM_BG = "#050713";
const HEXIUM_HEADER = "#050713";

// --- Helpers ---

function getWebApp(): TelegramWebAppInstance | null {
  return window.Telegram?.WebApp ?? null;
}

function isAvailable(): boolean {
  return getWebApp() !== null;
}

function isVersionAtLeast(version: string): boolean {
  const wa = getWebApp();
  if (!wa || typeof wa.isVersionAtLeast !== "function") return false;
  return wa.isVersionAtLeast(version);
}

// --- Initialization ---

function ready(): void {
  const wa = getWebApp();
  if (!wa) {
    console.warn("[TG] Telegram WebApp not available — running in browser mode");
    return;
  }
  wa.ready();
  console.log("[TG] WebApp ready · platform:", wa.platform, "· version:", wa.version);
}

function expand(): void {
  const wa = getWebApp();
  if (!wa) return;
  if (!wa.isExpanded) {
    wa.expand();
  }
}

function close(): void {
  const wa = getWebApp();
  if (!wa) return;
  wa.close();
}

// --- Closing confirmation ---

function enableClosingConfirmation(): void {
  const wa = getWebApp();
  if (!wa || !isVersionAtLeast("6.2")) return;
  wa.enableClosingConfirmation();
}

function disableClosingConfirmation(): void {
  const wa = getWebApp();
  if (!wa || !isVersionAtLeast("6.2")) return;
  wa.disableClosingConfirmation();
}

// --- Theme ---

function setHeaderColor(color: string = HEXIUM_HEADER): void {
  const wa = getWebApp();
  if (!wa || !isVersionAtLeast("6.1")) return;
  wa.setHeaderColor(color);
}

function setBackgroundColor(color: string = HEXIUM_BG): void {
  const wa = getWebApp();
  if (!wa || !isVersionAtLeast("6.1")) return;
  wa.setBackgroundColor(color);
}

function getThemeParams(): TelegramThemeParams {
  const wa = getWebApp();
  if (wa) return wa.themeParams;
  return {
    bg_color: HEXIUM_BG,
    text_color: "#e0e6ff",
    hint_color: "#7a8bbf",
    link_color: "#00f0ff",
    button_color: "#c026ff",
    button_text_color: "#ffffff",
    secondary_bg_color: "#0d1129",
    header_bg_color: HEXIUM_HEADER,
    accent_text_color: "#00f0ff",
    section_bg_color: "#111638",
    section_header_text_color: "#7a8bbf",
    subtitle_text_color: "#7a8bbf",
    destructive_text_color: "#ff4444",
  };
}

function applyHexiumTheme(): void {
  setHeaderColor(HEXIUM_HEADER);
  setBackgroundColor(HEXIUM_BG);
}

// --- Platform ---

function getPlatform(): TelegramPlatform {
  const wa = getWebApp();
  if (!wa) return "unknown";
  const p = wa.platform?.toLowerCase() ?? "unknown";
  const known: TelegramPlatform[] = ["android", "ios", "macos", "tdesktop", "web", "weba", "webk"];
  return known.includes(p as TelegramPlatform) ? (p as TelegramPlatform) : "unknown";
}

function getVersion(): string {
  return getWebApp()?.version ?? "0.0";
}

function isWebView(): boolean {
  const p = getPlatform();
  return p === "android" || p === "ios";
}

function getViewportHeight(): number {
  return getWebApp()?.viewportStableHeight ?? window.innerHeight;
}

// --- Popups ---

function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.showAlert(message, () => resolve());
    } else {
      window.alert(message);
      resolve();
    }
  });
}

function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.showConfirm(message, (confirmed) => resolve(confirmed));
    } else {
      resolve(window.confirm(message));
    }
  });
}

function showPopup(params: TelegramPopupParams): Promise<string> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.showPopup(params, (buttonId) => resolve(buttonId));
    } else {
      window.alert(params.message);
      resolve("ok");
    }
  });
}

// --- Links ---

function openLink(url: string, tryInstantView: boolean = false): void {
  const wa = getWebApp();
  if (wa) {
    wa.openLink(url, { try_instant_view: tryInstantView });
  } else {
    window.open(url, "_blank");
  }
}

function openTelegramLink(url: string): void {
  const wa = getWebApp();
  if (wa) {
    wa.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

// --- Invoice (for payments) ---

function openInvoice(url: string): Promise<"paid" | "cancelled" | "failed" | "pending"> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.openInvoice(url, (status) => resolve(status));
    } else {
      console.warn("[TG] openInvoice not available in browser mode");
      resolve("failed");
    }
  });
}

// --- Data ---

function sendData(data: string): void {
  const wa = getWebApp();
  if (!wa) {
    console.warn("[TG] sendData not available in browser mode");
    return;
  }
  wa.sendData(data);
}

function getInitData(): string {
  return getWebApp()?.initData ?? "";
}

function getInitDataUnsafe() {
  return getWebApp()?.initDataUnsafe ?? null;
}

// --- Events ---

function onEvent(eventType: string, callback: () => void): void {
  getWebApp()?.onEvent(eventType, callback);
}

function offEvent(eventType: string, callback: () => void): void {
  getWebApp()?.offEvent(eventType, callback);
}

// --- Permissions ---

function requestWriteAccess(): Promise<boolean> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.requestWriteAccess((granted) => resolve(granted));
    } else {
      resolve(false);
    }
  });
}

function requestContact(): Promise<boolean> {
  return new Promise((resolve) => {
    const wa = getWebApp();
    if (wa) {
      wa.requestContact((shared) => resolve(shared));
    } else {
      resolve(false);
    }
  });
}

// --- Full init sequence ---

function initialize(): void {
  ready();
  expand();
  enableClosingConfirmation();
  applyHexiumTheme();
}

// --- Export ---

export const telegramWebApp = {
  // State
  isAvailable,
  getWebApp,
  isVersionAtLeast,

  // Init
  ready,
  expand,
  close,
  initialize,

  // Closing
  enableClosingConfirmation,
  disableClosingConfirmation,

  // Theme
  setHeaderColor,
  setBackgroundColor,
  getThemeParams,
  applyHexiumTheme,

  // Platform
  getPlatform,
  getVersion,
  isWebView,
  getViewportHeight,

  // Popups
  showAlert,
  showConfirm,
  showPopup,

  // Links
  openLink,
  openTelegramLink,

  // Invoice
  openInvoice,

  // Data
  sendData,
  getInitData,
  getInitDataUnsafe,

  // Events
  onEvent,
  offEvent,

  // Permissions
  requestWriteAccess,
  requestContact,
};
