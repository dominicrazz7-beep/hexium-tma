// ============================================================
// HEXIUM CLICKER · Telegram Integration · Barrel Export
// ============================================================

export { telegramWebApp } from "./telegramWebApp";
export { telegramAuth } from "./telegramAuth";
export { telegramUser } from "./telegramUser";
export { telegramHaptics } from "./telegramHaptics";
export { telegramDeepLinks } from "./telegramDeepLinks";
export { telegramCloudStorage } from "./telegramCloudStorage";

export type {
  // Telegram SDK types
  TelegramUser,
  TelegramChat,
  TelegramThemeParams,
  TelegramInitData,
  TelegramPlatform,
  TelegramWebAppInstance,
  TelegramHapticFeedback,
  TelegramCloudStorage,
  TelegramPopupParams,
  TelegramPopupButton,

  // Haptic types
  HapticImpactStyle,
  HapticNotificationType,

  // Hexium types
  HexiumTelegramUser,
  DeepLinkParams,
  CloudProfileData,
  TelegramSystemStatus,
} from "./telegramTypes";
