// ============================================================
// HEXIUM CLICKER · Referral System · Rewards
// ============================================================
// Handles reward granting, converts ReferralReward into
// GameReward format compatible with HEXIUM rewardSystem.
// ============================================================

import type { ReferralReward, ReferralRewardType } from "./referralTypes";

// --- GameReward bridge type ---
// Maps to HEXIUM's existing GameReward without importing it
// (to avoid circular dependency)

export interface ReferralGameReward {
  type: string;        // matches GameReward.type
  amount: number;
  source: string;      // "referral" | "referral_milestone" | "referral_tier" | "referral_passive"
  label: string;
}

// --- Convert ReferralReward → GameReward format ---

const REWARD_TYPE_MAP: Record<ReferralRewardType, string> = {
  hex: "hex",
  premium_currency: "premium_currency",
  energy: "energy",
  boost: "boost",
  case: "case",
  cosmetic: "cosmetic",
};

export function toGameReward(
  reward: ReferralReward,
  source: string = "referral"
): ReferralGameReward {
  return {
    type: REWARD_TYPE_MAP[reward.type] ?? reward.type,
    amount: reward.amount,
    source,
    label: reward.label,
  };
}

export function toGameRewards(
  rewards: ReferralReward[],
  source: string = "referral"
): ReferralGameReward[] {
  return rewards.map((r) => toGameReward(r, source));
}

// --- Create reward for new referral (instant bonus) ---

export function createNewReferralReward(hexAmount: number): ReferralGameReward {
  return {
    type: "hex",
    amount: hexAmount,
    source: "referral",
    label: `+${hexAmount} HEX (referral bonus)`,
  };
}

// --- Create reward for passive income claim ---

export function createPassiveClaimReward(hexAmount: number): ReferralGameReward {
  return {
    type: "hex",
    amount: hexAmount,
    source: "referral_passive",
    label: `+${hexAmount} HEX (passive referral income)`,
  };
}

// --- Create welcome bonus for referred player ---

export function createWelcomeBonusReward(hexAmount: number): ReferralGameReward {
  return {
    type: "hex",
    amount: hexAmount,
    source: "referral",
    label: `+${hexAmount} HEX (welcome bonus!)`,
  };
}

// --- Create tier unlock rewards ---

export function createTierUnlockRewards(
  rewards: ReferralReward[]
): ReferralGameReward[] {
  return toGameRewards(rewards, "referral_tier");
}

// --- Create milestone rewards ---

export function createMilestoneRewards(
  rewards: ReferralReward[]
): ReferralGameReward[] {
  return toGameRewards(rewards, "referral_milestone");
}

// --- Summarize rewards for notification ---

export function summarizeRewards(rewards: ReferralGameReward[]): string {
  if (rewards.length === 0) return "";
  if (rewards.length === 1) return rewards[0].label;
  return rewards.map((r) => r.label).join(", ");
}

// --- Calculate total HEX value of rewards ---

export function totalHexValue(rewards: ReferralGameReward[]): number {
  return rewards
    .filter((r) => r.type === "hex")
    .reduce((sum, r) => sum + r.amount, 0);
}
