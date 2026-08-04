// ============================================================
// HEXIUM CLICKER · Analytics System · Event Builders
// ============================================================
// 40+ type-safe event builder functions.
// Each returns partial event data for analyticsService.track().
// ============================================================

// --- Types for builder return ---

interface EventData {
  name: string;
  category: string;
  source: string;
  data: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════
// SESSION EVENTS (5)
// ════════════════════════════════════════════════════════════

export function sessionStart(entrySource: string, deepLink?: string, referralCode?: string): EventData {
  return { name: "session_start", category: "session", source: "core", data: { entrySource, deepLink, referralCode } };
}

export function sessionEnd(duration: number, eventCount: number, screensVisited: string[]): EventData {
  return { name: "session_end", category: "session", source: "core", data: { duration, eventCount, screensVisited } };
}

export function sessionResume(pauseDuration: number): EventData {
  return { name: "session_resume", category: "session", source: "core", data: { pauseDuration } };
}

export function sessionHeartbeat(uptime: number, memoryUsage?: number): EventData {
  return { name: "session_heartbeat", category: "session", source: "core", data: { uptime, memoryUsage } };
}

export function firstOpen(referralCode?: string, platform?: string): EventData {
  return { name: "first_open", category: "session", source: "core", data: { referralCode, platform } };
}

// ════════════════════════════════════════════════════════════
// GAMEPLAY EVENTS (8)
// ════════════════════════════════════════════════════════════

export function tapClick(tapValue: number, comboCount?: number, isCritical?: boolean): EventData {
  return { name: "tap_click", category: "gameplay", source: "clicker", data: { tapValue, comboCount, isCritical } };
}

export function autoClick(autoValue: number, generators: number): EventData {
  return { name: "auto_click", category: "gameplay", source: "clicker", data: { autoValue, generators } };
}

export function generatorBuy(generatorId: string, level: number, cost: number, currency?: string): EventData {
  return { name: "generator_buy", category: "gameplay", source: "shop", data: { generatorId, level, cost, currency } };
}

export function generatorUpgrade(generatorId: string, fromLevel: number, toLevel: number, cost: number): EventData {
  return { name: "generator_upgrade", category: "gameplay", source: "shop", data: { generatorId, fromLevel, toLevel, cost } };
}

export function prestigeReset(prestigeLevel: number, quantumEarned: number, totalHexium?: number, playTime?: number): EventData {
  return { name: "prestige_reset", category: "gameplay", source: "prestige", data: { prestigeLevel, quantumEarned, totalHexium, playTime } };
}

export function questComplete(questId: string, questType: string, reward?: string, timeToComplete?: number): EventData {
  return { name: "quest_complete", category: "gameplay", source: "quests", data: { questId, questType, reward, timeToComplete } };
}

export function dailyLogin(day: number, streak: number, reward?: string): EventData {
  return { name: "daily_login", category: "gameplay", source: "daily", data: { day, streak, reward } };
}

export function tutorialStep(step: number, totalSteps: number, skipped?: boolean): EventData {
  return { name: "tutorial_step", category: "gameplay", source: "tutorial", data: { step, totalSteps, skipped } };
}

// ════════════════════════════════════════════════════════════
// PROGRESSION EVENTS (6)
// ════════════════════════════════════════════════════════════

export function levelUp(fromLevel: number, toLevel: number, totalXp?: number): EventData {
  return { name: "level_up", category: "progression", source: "core", data: { fromLevel, toLevel, totalXp } };
}

export function xpEarned(amount: number, source: string): EventData {
  return { name: "xp_earned", category: "progression", source: "core", data: { amount, source } };
}

export function achievementUnlock(achievementId: string, achievementName: string, category?: string): EventData {
  return { name: "achievement_unlock", category: "progression", source: "achievements", data: { achievementId, achievementName, category } };
}

export function milestoneReached(milestoneId: string, value: number): EventData {
  return { name: "milestone_reached", category: "progression", source: "core", data: { milestoneId, value } };
}

export function bpLevelUp(bpLevel: number, season: number, isPremium?: boolean, reward?: string): EventData {
  return { name: "bp_level_up", category: "progression", source: "battle_pass", data: { bpLevel, season, isPremium, reward } };
}

export function bpRewardClaim(bpLevel: number, rewardId: string, isPremium: boolean): EventData {
  return { name: "bp_reward_claim", category: "progression", source: "battle_pass", data: { bpLevel, rewardId, isPremium } };
}

// ════════════════════════════════════════════════════════════
// ECONOMY EVENTS (5)
// ════════════════════════════════════════════════════════════

export function currencyEarn(currency: string, amount: number, source: string, balance?: number): EventData {
  return { name: "currency_earn", category: "economy", source: "economy", data: { currency, amount, source, balance } };
}

export function currencySpend(currency: string, amount: number, target: string, balance?: number): EventData {
  return { name: "currency_spend", category: "economy", source: "economy", data: { currency, amount, target, balance } };
}

export function caseOpen(caseId: string, caseName: string, itemReceived?: string, rarity?: string): EventData {
  return { name: "case_open", category: "economy", source: "cases", data: { caseId, caseName, itemReceived, rarity } };
}

export function itemReceived(itemId: string, source: string, rarity?: string, quantity?: number): EventData {
  return { name: "item_received", category: "economy", source: "economy", data: { itemId, source, rarity, quantity } };
}

export function resourceConvert(fromCurrency: string, toCurrency: string, fromAmount: number, toAmount: number): EventData {
  return { name: "resource_convert", category: "economy", source: "economy", data: { fromCurrency, toCurrency, fromAmount, toAmount } };
}

// ════════════════════════════════════════════════════════════
// MONETIZATION EVENTS (6)
// ════════════════════════════════════════════════════════════

export function starsPurchaseStart(productId: string, starsAmount: number, productCategory?: string): EventData {
  return { name: "stars_purchase_start", category: "monetization", source: "stars", data: { productId, starsAmount, productCategory } };
}

export function starsPurchaseSuccess(productId: string, starsAmount: number, invoiceId: string, productCategory?: string): EventData {
  return { name: "stars_purchase_success", category: "monetization", source: "stars", data: { productId, starsAmount, invoiceId, productCategory } };
}

export function starsPurchaseFail(productId: string, error: string, starsAmount?: number): EventData {
  return { name: "stars_purchase_fail", category: "monetization", source: "stars", data: { productId, error, starsAmount } };
}

export function vipActivated(duration: number, starsSpent: number, tier?: string): EventData {
  return { name: "vip_activated", category: "monetization", source: "stars", data: { duration, starsSpent, tier } };
}

export function offerShown(offerId: string, offerType: string, price?: number): EventData {
  return { name: "offer_shown", category: "monetization", source: "offers", data: { offerId, offerType, price } };
}

export function offerPurchased(offerId: string, starsAmount: number, offerType?: string): EventData {
  return { name: "offer_purchased", category: "monetization", source: "offers", data: { offerId, starsAmount, offerType } };
}

// ════════════════════════════════════════════════════════════
// SOCIAL EVENTS (7)
// ════════════════════════════════════════════════════════════

export function referralCreated(referralCode: string, referralTier?: string): EventData {
  return { name: "referral_created", category: "social", source: "referral", data: { referralCode, referralTier } };
}

export function referralRewarded(referralCount: number, rewardType: string, rewardAmount?: number): EventData {
  return { name: "referral_rewarded", category: "social", source: "referral", data: { referralCount, rewardType, rewardAmount } };
}

export function shareCompleted(contentType: string, method: string, usedFallback?: boolean, source?: string): EventData {
  return { name: "share_completed", category: "social", source: "share", data: { contentType, method, usedFallback, source } };
}

export function shareFailed(contentType: string, error: string, method?: string): EventData {
  return { name: "share_failed", category: "social", source: "share", data: { contentType, error, method } };
}

export function inviteSent(method: string, source?: string): EventData {
  return { name: "invite_sent", category: "social", source: "share", data: { method, source } };
}

export function corpJoined(corpId: string, corpName?: string, memberCount?: number): EventData {
  return { name: "corp_joined", category: "social", source: "corporation", data: { corpId, corpName, memberCount } };
}

export function bossFight(bossId: string, damage: number, rank?: number, reward?: string): EventData {
  return { name: "boss_fight", category: "social", source: "world_boss", data: { bossId, damage, rank, reward } };
}

// ════════════════════════════════════════════════════════════
// UI EVENTS (4)
// ════════════════════════════════════════════════════════════

export function screenView(screenName: string, fromScreen?: string): EventData {
  return { name: "screen_view", category: "ui", source: "navigation", data: { screenName, fromScreen } };
}

export function screenExit(screenName: string, duration: number, action?: string): EventData {
  return { name: "screen_exit", category: "ui", source: "navigation", data: { screenName, duration, action } };
}

export function buttonClick(buttonId: string, screen: string, context?: string): EventData {
  return { name: "button_click", category: "ui", source: "ui", data: { buttonId, screen, context } };
}

export function modalShown(modalId: string, screen?: string, trigger?: string): EventData {
  return { name: "modal_shown", category: "ui", source: "ui", data: { modalId, screen, trigger } };
}

// ════════════════════════════════════════════════════════════
// PERFORMANCE EVENTS (4)
// ════════════════════════════════════════════════════════════

export function appLoad(loadTimeMs: number, bundleSize?: number): EventData {
  return { name: "app_load", category: "performance", source: "core", data: { loadTimeMs, bundleSize } };
}

export function fpsDrop(fps: number, screen: string, duration?: number): EventData {
  return { name: "fps_drop", category: "performance", source: "renderer", data: { fps, screen, duration } };
}

export function memoryWarning(usedMb: number, limitMb: number): EventData {
  return { name: "memory_warning", category: "performance", source: "core", data: { usedMb, limitMb } };
}

export function errorCaught(errorType: string, message: string, stack?: string, screen?: string): EventData {
  return { name: "error_caught", category: "performance", source: "core", data: { errorType, message, stack, screen } };
}

// ════════════════════════════════════════════════════════════
// CLOUD EVENTS (3)
// ════════════════════════════════════════════════════════════

export function cloudSaveSuccess(saveSlot: number, sizeBytes: number, duration?: number): EventData {
  return { name: "cloud_save_success", category: "cloud", source: "cloud_save", data: { saveSlot, sizeBytes, duration } };
}

export function cloudSaveFail(error: string, saveSlot?: number): EventData {
  return { name: "cloud_save_fail", category: "cloud", source: "cloud_save", data: { error, saveSlot } };
}

export function cloudLoadSuccess(saveSlot: number, version: number, duration?: number, migrated?: boolean): EventData {
  return { name: "cloud_load_success", category: "cloud", source: "cloud_save", data: { saveSlot, version, duration, migrated } };
}

// ════════════════════════════════════════════════════════════
// ENGAGEMENT EVENTS (3)
// ════════════════════════════════════════════════════════════

export function retentionDay(day: number, totalSessions?: number): EventData {
  return { name: "retention_day", category: "engagement", source: "core", data: { day, totalSessions } };
}

export function streakMilestone(streakDays: number, reward?: string): EventData {
  return { name: "streak_milestone", category: "engagement", source: "core", data: { streakDays, reward } };
}

export function idleReturn(idleDuration: number, offlineEarnings?: number): EventData {
  return { name: "idle_return", category: "engagement", source: "core", data: { idleDuration, offlineEarnings } };
}
