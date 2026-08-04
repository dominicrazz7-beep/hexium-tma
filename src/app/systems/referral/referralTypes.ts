// ============================================================
// HEXIUM CLICKER · Referral System · Types
// ============================================================
// FOUNDATION v2 · Module 2/6
// Extends: telegramDeepLinks, telegramUser, telegramCloudStorage
// ============================================================

// --- Referral Tier ---

export type ReferralTierId =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "quantum";

export interface ReferralTier {
  id: ReferralTierId;
  name: string;
  icon: string;
  minReferrals: number;
  bonusMultiplier: number;         // passive income multiplier (1.0 = base)
  rewardPerReferral: number;       // HEX per new referral
  passiveIncomePerRef: number;     // HEX/hour per active referral
  unlockRewards: ReferralReward[]; // one-time tier unlock rewards
}

// --- Referral Record ---

export interface ReferralRecord {
  referredUserId: number;          // telegram ID of referred player
  referredUsername: string;         // display name
  referredAt: number;              // timestamp
  isActive: boolean;               // played in last 7 days
  totalEarned: number;             // total HEX earned from this referral
  lastActiveAt: number;            // last session timestamp
}

// --- Referral State (persisted) ---

export interface ReferralState {
  // Identity
  myReferralCode: string;          // my invite code (= my telegram ID)
  referredBy: number | null;       // who referred me (telegram ID)
  referredByCode: string | null;   // original start_param value

  // Tracking
  referrals: ReferralRecord[];     // list of my referrals
  totalReferrals: number;          // lifetime count
  activeReferrals: number;         // active in last 7 days

  // Tier
  currentTier: ReferralTierId;
  tierUnlockedAt: Record<ReferralTierId, number>; // timestamp per tier

  // Rewards
  totalEarned: number;             // total HEX earned from referrals
  pendingRewards: number;          // unclaimed HEX
  lastClaimedAt: number;           // last claim timestamp
  claimedMilestones: string[];     // milestone IDs already claimed

  // Passive income
  passiveAccumulated: number;      // HEX accumulated since last claim
  lastPassiveCalcAt: number;       // last passive income calculation

  // Meta
  version: number;                 // schema version for migration
  updatedAt: number;               // last state update
}

// --- Referral Reward ---

export type ReferralRewardType =
  | "hex"
  | "premium_currency"
  | "energy"
  | "boost"
  | "case"
  | "cosmetic";

export interface ReferralReward {
  id: string;
  type: ReferralRewardType;
  amount: number;
  label: string;
  icon: string;
}

// --- Milestone ---

export interface ReferralMilestone {
  id: string;
  requiredReferrals: number;
  title: string;
  description: string;
  rewards: ReferralReward[];
  icon: string;
}

// --- Passive Income Snapshot ---

export interface PassiveIncomeSnapshot {
  activeReferrals: number;
  incomePerHour: number;
  tierMultiplier: number;
  totalPerHour: number;
  accumulated: number;
  hoursElapsed: number;
}

// --- Referral Invite ---

export interface ReferralInvite {
  inviteLink: string;
  inviteCode: string;
  shareText: string;
}

// --- Referral Stats (for UI) ---

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  currentTier: ReferralTier;
  nextTier: ReferralTier | null;
  referralsToNextTier: number;
  totalEarned: number;
  pendingRewards: number;
  passivePerHour: number;
  inviteLink: string;
  recentReferrals: ReferralRecord[];
  availableMilestones: ReferralMilestone[];
  claimedMilestones: string[];
}

// --- Referral Event (for EventBus) ---

export type ReferralEventType =
  | "referral:new"
  | "referral:activated"
  | "referral:tier_up"
  | "referral:milestone_claimed"
  | "referral:passive_claimed"
  | "referral:reward_granted";

export interface ReferralEvent {
  type: ReferralEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

// --- Validation Result ---

export interface ReferralValidation {
  valid: boolean;
  reason: string;
  referrerCode: string | null;
  referrerId: number | null;
}
