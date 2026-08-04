// ============================================================
// HEXIUM CLICKER · Telegram Haptic Feedback
// ============================================================
// Provides haptic feedback through Telegram WebApp API.
// Falls back silently when not available.
// ============================================================

import type { HapticImpactStyle, HapticNotificationType } from "./telegramTypes";
import { telegramWebApp } from "./telegramWebApp";

// --- State ---

let hapticEnabled = true;

// --- Core ---

function getHapticFeedback() {
  const wa = telegramWebApp.getWebApp();
  return wa?.HapticFeedback ?? null;
}

function isHapticAvailable(): boolean {
  return getHapticFeedback() !== null;
}

// --- Impact ---

function impact(style: HapticImpactStyle): void {
  if (!hapticEnabled) return;
  const hf = getHapticFeedback();
  if (hf) {
    try {
      hf.impactOccurred(style);
    } catch {
      // Some platforms don't support all styles
    }
  }
}

// --- Notification ---

function notification(type: HapticNotificationType): void {
  if (!hapticEnabled) return;
  const hf = getHapticFeedback();
  if (hf) {
    try {
      hf.notificationOccurred(type);
    } catch {
      // fallback
    }
  }
}

// --- Selection ---

function selection(): void {
  if (!hapticEnabled) return;
  const hf = getHapticFeedback();
  if (hf) {
    try {
      hf.selectionChanged();
    } catch {
      // fallback
    }
  }
}

// --- Game-specific presets ---

/** Mine tap — medium impact */
function tapMine(): void {
  impact("medium");
}

/** Case open — heavy impact */
function caseOpen(): void {
  impact("heavy");
}

/** Boss hit — rigid impact */
function bossHit(): void {
  impact("rigid");
}

/** Successful reward / claim */
function rewardClaim(): void {
  notification("success");
}

/** Level up — heavy + success */
function levelUp(): void {
  impact("heavy");
  setTimeout(() => notification("success"), 100);
}

/** Error action */
function errorAction(): void {
  notification("error");
}

/** Warning */
function warning(): void {
  notification("warning");
}

/** Navigation — selection changed */
function navigate(): void {
  selection();
}

/** Button press — light impact */
function buttonPress(): void {
  impact("light");
}

/** Purchase complete — success */
function purchaseComplete(): void {
  notification("success");
}

/** Soft touch (toggles, sliders) */
function softTouch(): void {
  impact("soft");
}

// --- Enable / Disable ---

function setEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
}

function isEnabled(): boolean {
  return hapticEnabled;
}

// --- Export ---

export const telegramHaptics = {
  // Core
  impact,
  notification,
  selection,
  isHapticAvailable,

  // Game presets
  tapMine,
  caseOpen,
  bossHit,
  rewardClaim,
  levelUp,
  errorAction,
  warning,
  navigate,
  buttonPress,
  purchaseComplete,
  softTouch,

  // Settings
  setEnabled,
  isEnabled,
};
