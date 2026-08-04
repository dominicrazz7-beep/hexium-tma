// ============================================================
// HEXIUM CLICKER · Share System · Barrel Export
// ============================================================

export { shareService } from "./shareService";

export type {
  // Content types
  ShareContentType,
  ShareMethod,

  // Payloads & Results
  SharePayload,
  ShareResult,
  ShareContext,

  // Templates
  ShareTemplate,

  // Cooldowns & Stats
  ShareCooldownState,
  ShareStats,
  ShareRecord,

  // Telegram adapter
  TelegramShareAdapter,

  // Events
  ShareEventType,
  ShareEvent,
  ShareAnalyticsEventType,
  ShareAnalyticsEvent,
} from "./shareTypes";

export {
  // Constants
  SHARE_SYSTEM_VERSION,
  CLOUD_SAVE_SHARE_KEY,

  // Config
  setBotUsername,
  getBotUsername,
  setAppShortName,
  getAppShortName,
  getDeepLinkBase,
  getAppLinkBase,
} from "./shareData";

export {
  // Templates
  getTemplate,
  getAllTemplates,
  buildShareText,
  buildShareUrl,
  fillTemplate,
  registerTemplate,
} from "./shareTemplates";

export {
  // Logic
  validateShare,
  isOnCooldown,
  getCooldownRemaining,
  isDailyLimitReached,
  buildShareStats,
  type ShareValidation,
} from "./shareLogic";

export {
  // Telegram adapter
  createTelegramWebAppAdapter,
  isTelegramShareAvailable,
  telegramShare,
  copyToClipboard,
  nativeShare,
  detectMethodAvailability,
} from "./shareTelegramAdapter";
