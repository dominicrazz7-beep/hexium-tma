// ============================================================
// HEXIUM CLICKER · Share System · Telegram Adapter
// ============================================================
// Adapts Telegram WebApp methods for sharing.
// Decoupled — does NOT import telegramBridge directly.
// Uses adapter pattern: set capabilities at init.
// ============================================================

import type { TelegramShareAdapter } from "./shareTypes";
import { getTelegramShareUrl } from "./shareData";

// ============================================================
// ADAPTER STATE
// ============================================================

let adapter: TelegramShareAdapter | null = null;

// ============================================================
// BUILT-IN ADAPTER (Telegram WebApp)
// ============================================================

/**
 * Create default Telegram WebApp adapter.
 * Uses window.Telegram.WebApp if available.
 */
export function createTelegramWebAppAdapter(): TelegramShareAdapter {
  return {
    isAvailable(): boolean {
      return (
        typeof window !== "undefined" &&
        !!(window as any).Telegram?.WebApp
      );
    },

    async shareInline(text: string): Promise<boolean> {
      try {
        const webapp = (window as any).Telegram?.WebApp;
        if (!webapp?.switchInlineQuery) return false;

        // switchInlineQuery sends user to inline mode with text
        webapp.switchInlineQuery(text, ["users", "groups", "channels"]);
        return true;
      } catch (err) {
        console.error("[Share Telegram] switchInlineQuery failed:", err);
        return false;
      }
    },

    async shareUrl(url: string, text: string): Promise<boolean> {
      try {
        const webapp = (window as any).Telegram?.WebApp;
        if (!webapp?.openTelegramLink) return false;

        // Open Telegram share dialog
        const shareUrl = getTelegramShareUrl(url, text);
        webapp.openTelegramLink(shareUrl);
        return true;
      } catch (err) {
        console.error("[Share Telegram] shareUrl failed:", err);
        return false;
      }
    },

    async shareDirect(url: string): Promise<boolean> {
      try {
        const webapp = (window as any).Telegram?.WebApp;
        if (!webapp?.openTelegramLink) return false;

        webapp.openTelegramLink(url);
        return true;
      } catch (err) {
        console.error("[Share Telegram] shareDirect failed:", err);
        return false;
      }
    },
  };
}

// ============================================================
// ADAPTER MANAGEMENT
// ============================================================

/** Set custom adapter */
export function setTelegramShareAdapter(custom: TelegramShareAdapter): void {
  adapter = custom;
}

/** Get current adapter */
export function getTelegramShareAdapter(): TelegramShareAdapter | null {
  return adapter;
}

/** Initialize with default WebApp adapter */
export function initDefaultAdapter(): void {
  adapter = createTelegramWebAppAdapter();
}

/** Check if Telegram sharing is available */
export function isTelegramShareAvailable(): boolean {
  return adapter !== null && adapter.isAvailable();
}

// ============================================================
// HIGH-LEVEL SHARE METHODS
// ============================================================

/**
 * Share via Telegram (best available method).
 * Tries: shareUrl → shareInline → shareDirect
 */
export async function telegramShare(
  url: string,
  text: string
): Promise<{ success: boolean; method: string }> {
  if (!adapter || !adapter.isAvailable()) {
    return { success: false, method: "none" };
  }

  // Method 1: Share URL (opens share dialog)
  try {
    const result = await adapter.shareUrl(url, text);
    if (result) return { success: true, method: "share_url" };
  } catch {}

  // Method 2: Inline query
  try {
    const shortText = text.length > 256 ? text.slice(0, 253) + "..." : text;
    const result = await adapter.shareInline(shortText);
    if (result) return { success: true, method: "inline" };
  } catch {}

  // Method 3: Direct link
  try {
    const result = await adapter.shareDirect(url);
    if (result) return { success: true, method: "direct" };
  } catch {}

  return { success: false, method: "none" };
}

// ============================================================
// CLIPBOARD FALLBACK
// ============================================================

/**
 * Copy text to clipboard.
 * Uses navigator.clipboard with execCommand fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  // Method 2: execCommand fallback
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const result = document.execCommand("copy");
    document.body.removeChild(textarea);
    return result;
  } catch {
    return false;
  }
}

// ============================================================
// NATIVE WEB SHARE API
// ============================================================

/** Check if Web Share API is available */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/** Share via native Web Share API */
export async function nativeShare(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (!isNativeShareAvailable()) return false;

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (err) {
    // AbortError = user cancelled (that's OK, still "handled")
    if (err instanceof Error && err.name === "AbortError") return true;
    console.error("[Share] Native share failed:", err);
    return false;
  }
}

// ============================================================
// METHOD AVAILABILITY DETECTION
// ============================================================

import type { MethodAvailability } from "./shareLogic";

/** Detect which share methods are available */
export function detectMethodAvailability(): MethodAvailability {
  return {
    telegram_share: isTelegramShareAvailable(),
    telegram_inline: isTelegramShareAvailable(), // same adapter
    clipboard: typeof navigator !== "undefined" && !!(navigator.clipboard?.writeText || document?.execCommand),
    native_share: isNativeShareAvailable(),
    direct_link: true, // always available (just shows URL)
  };
}
