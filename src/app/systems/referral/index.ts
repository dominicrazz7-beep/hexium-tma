// ============================================================
// HEXIUM CLICKER · Referral System · Barrel Export
// ============================================================

export { referralService } from "./referralService";
export { referralStorage } from "./referralStorage";

export type {
  // Core types
  ReferralTierId,
  ReferralTier,
  ReferralRecord,
  ReferralState,
  ReferralRewardType,
  ReferralReward,
  ReferralMilestone,
  ReferralInvite,

  // Computed
  PassiveIncomeSnapshot,
  ReferralStats,
  ReferralValidation,

  // Events
  ReferralEventType,
  ReferralEvent,
} from "./referralTypes";

export {
  // Data helpers
  REFERRAL_TIERS,
  REFERRAL_MILESTONES,
  getTierById,
  getTierByCount,
  getNextTier,
  getAvailableMilestones,
  getAllMilestones,
  createEmptyReferralState,
  REFERRAL_ACTIVE_DAYS,
  MAX_PASSIVE_HOURS,
  REFERRED_WELCOME_BONUS,
} from "./referralData";

export type { ReferralGameReward } from "./referralRewards";

// Cloud Save: referralService.getStateForSave() / restoreFromSave()
// Cleanup:    referralService.destroy()
