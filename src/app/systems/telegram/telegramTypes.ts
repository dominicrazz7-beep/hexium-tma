// ============================================================
// HEXIUM CLICKER · Telegram Integration System · Types
// ============================================================

// --- Telegram WebApp SDK Types ---

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
  is_bot?: boolean;
  added_to_attachment_menu?: boolean;
}

export interface TelegramChat {
  id: number;
  type: "group" | "supergroup" | "channel";
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color: string;
  accent_text_color: string;
  section_bg_color: string;
  section_header_text_color: string;
  subtitle_text_color: string;
  destructive_text_color: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export type TelegramPlatform =
  | "android"
  | "ios"
  | "macos"
  | "tdesktop"
  | "web"
  | "weba"
  | "webk"
  | "unknown";

export type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type HapticNotificationType = "error" | "success" | "warning";

// --- WebApp API shape (window.Telegram.WebApp) ---

export interface TelegramHapticFeedback {
  impactOccurred(style: HapticImpactStyle): void;
  notificationOccurred(type: HapticNotificationType): void;
  selectionChanged(): void;
}

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: string | null, success?: boolean) => void): void;
  getItem(key: string, callback: (error: string | null, value?: string) => void): void;
  getItems(keys: string[], callback: (error: string | null, values?: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (error: string | null, success?: boolean) => void): void;
  removeItems(keys: string[], callback?: (error: string | null, success?: boolean) => void): void;
  getKeys(callback: (error: string | null, keys?: string[]) => void): void;
}

export interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

export interface TelegramPopupButton {
  id?: string;
  type?: "default" | "ok" | "close" | "cancel" | "destructive";
  text?: string;
}

export interface TelegramWebAppInstance {
  initData: string;
  initDataUnsafe: TelegramInitData;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;

  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast?: (version: string) => boolean;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  showPopup(params: TelegramPopupParams, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: "paid" | "cancelled" | "failed" | "pending") => void): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (shared: boolean) => void): void;
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
}

// --- Internal Hexium types ---

export interface HexiumTelegramUser {
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
  photoUrl: string;
  isPremium: boolean;
  platform: TelegramPlatform;
  joinedAt: number;
}

export interface DeepLinkParams {
  action: "referral" | "event" | "screen" | "gift" | "none";
  referralCode?: string;
  eventId?: string;
  screen?: string;
  giftId?: string;
  raw: string;
}

export interface CloudProfileData {
  version: string;
  lastSavedAt: number;
  checksum: string;
  compressedState: string;
}

export interface TelegramSystemStatus {
  initialized: boolean;
  platform: TelegramPlatform;
  user: HexiumTelegramUser | null;
  deepLink: DeepLinkParams;
  cloudAvailable: boolean;
  hapticAvailable: boolean;
  version: string;
  isWebView: boolean;
}

// --- Global window augmentation ---

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInstance;
    };
  }
}
