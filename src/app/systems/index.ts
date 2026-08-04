// ═══════════════════════════════════════════════════════════
// HEXIUM · FOUNDATION v2 · SYSTEMS BARREL
// ═══════════════════════════════════════════════════════════

// Telegram Integration (low-level — prefer telegramBridge)
export * from "./telegram";

// Referral System — invite codes, tiers, passive income
export { referralService } from "./referral";
export type { ReferralGameReward } from "./referral";

// Cloud Save — slots, sync, conflict resolution
export { cloudSaveService } from "./cloudSave";

// Telegram Stars — monetization, payments, products
export { starsService } from "./stars";

// Share System — templates, deep links, adapters
export { shareService } from "./share";

// Analytics — events, queue, transport
export { analyticsService } from "./analytics";
