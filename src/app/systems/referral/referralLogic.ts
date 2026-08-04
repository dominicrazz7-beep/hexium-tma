// ============================================================
// HEXIUM CLICKER · Referral System · Core Logic
// ============================================================
// Pure functions: validation, tracking, tier calculation,
// passive income computation. No side effects, no storage.
// ============================================================

import type {
  ReferralState,
  ReferralRecord,
  ReferralValidation,
  PassiveIncomeSnapshot,
  ReferralTier,
  ReferralTierId,
  ReferralReward,
} from "./referralTypes";
import {
  getTierByCount,
  getNextTier,
  getAvailableMilestones,
  REFERRAL_ACTIVE_DAYS,
  MAX_PASSIVE_HOURS,
  MIN_CLAIM_INTERVAL_MS,
} from "./referralData";

// ============================================================
// VALIDATION
// ============================================================

/** Validate a referral code before accepting */
export function validateReferral(
  state: ReferralState,
  myTelegramId: number,
  referrerCode: string
): ReferralValidation {
  const empty: ReferralValidation = {
    valid: false,
    reason: "",
    referrerCode: null,
    referrerId: null,
  };

  // No code
  if (!referrerCode || !referrerCode.trim()) {
    return { ...empty, reason: "empty_code" };
  }

  const code = referrerCode.trim();
  const referrerId = parseInt(code, 10);

  // Invalid format
  if (isNaN(referrerId) || referrerId <= 0) {
    return { ...empty, reason: "invalid_format" };
  }

  // Self-referral
  if (referrerId === myTelegramId) {
    return { ...empty, reason: "self_referral" };
  }

  // Already referred by someone
  if (state.referredBy !== null) {
    return { ...empty, reason: "already_referred" };
  }

  // Already referred by this specific person (edge case)
  if (state.referredBy === referrerId) {
    return { ...empty, reason: "duplicate_referral" };
  }

  return {
    valid: true,
    reason: "ok",
    referrerCode: code,
    referrerId,
  };
}

/** Check if a user is already in the referrals list */
export function isDuplicateReferral(
  state: ReferralState,
  referredUserId: number
): boolean {
  return state.referrals.some((r) => r.referredUserId === referredUserId);
}

// ============================================================
// TRACKING
// ============================================================

/** Add a new referral to state (returns new state, doesn't mutate) */
export function addReferral(
  state: ReferralState,
  referredUserId: number,
  referredUsername: string
): ReferralState {
  // Prevent duplicates
  if (isDuplicateReferral(state, referredUserId)) {
    return state;
  }

  const now = Date.now();

  const newRecord: ReferralRecord = {
    referredUserId,
    referredUsername,
    referredAt: now,
    isActive: true,
    totalEarned: 0,
    lastActiveAt: now,
  };

  const newReferrals = [...state.referrals, newRecord];
  const newTotal = state.totalReferrals + 1;
  const newActive = countActiveReferrals(newReferrals);

  // Check tier upgrade
  const newTier = getTierByCount(newTotal);
  const tierReward = newTier.rewardPerReferral;

  // Tier unlock tracking
  const tierUnlockedAt = { ...state.tierUnlockedAt };
  if (newTier.id !== state.currentTier && tierUnlockedAt[newTier.id] === 0) {
    tierUnlockedAt[newTier.id] = now;
  }

  return {
    ...state,
    referrals: newReferrals,
    totalReferrals: newTotal,
    activeReferrals: newActive,
    currentTier: newTier.id,
    tierUnlockedAt,
    pendingRewards: state.pendingRewards + tierReward,
    updatedAt: now,
  };
}

/** Set who referred this player */
export function setReferredBy(
  state: ReferralState,
  referrerId: number,
  referrerCode: string
): ReferralState {
  if (state.referredBy !== null) return state;
  return {
    ...state,
    referredBy: referrerId,
    referredByCode: referrerCode,
    updatedAt: Date.now(),
  };
}

/** Update referral activity status */
export function refreshReferralActivity(state: ReferralState): ReferralState {
  const now = Date.now();
  const cutoff = now - REFERRAL_ACTIVE_DAYS * 24 * 60 * 60 * 1000;

  const updatedReferrals = state.referrals.map((r) => ({
    ...r,
    isActive: r.lastActiveAt > cutoff,
  }));

  const newActive = updatedReferrals.filter((r) => r.isActive).length;

  return {
    ...state,
    referrals: updatedReferrals,
    activeReferrals: newActive,
    updatedAt: now,
  };
}

/** Mark a specific referral as active (they played recently) */
export function markReferralActive(
  state: ReferralState,
  referredUserId: number
): ReferralState {
  const now = Date.now();
  const updatedReferrals = state.referrals.map((r) =>
    r.referredUserId === referredUserId
      ? { ...r, isActive: true, lastActiveAt: now }
      : r
  );

  return {
    ...state,
    referrals: updatedReferrals,
    activeReferrals: updatedReferrals.filter((r) => r.isActive).length,
    updatedAt: now,
  };
}

// ============================================================
// TIER CALCULATION
// ============================================================

/** Get current tier info */
export function getCurrentTier(state: ReferralState): ReferralTier {
  return getTierByCount(state.totalReferrals);
}

/** Get next tier info + how many referrals needed */
export function getNextTierInfo(state: ReferralState): {
  tier: ReferralTier | null;
  referralsNeeded: number;
} {
  const current = getCurrentTier(state);
  const next = getNextTier(current.id);
  if (!next) return { tier: null, referralsNeeded: 0 };
  return {
    tier: next,
    referralsNeeded: Math.max(0, next.minReferrals - state.totalReferrals),
  };
}

/** Check if tier upgraded after adding referral */
export function checkTierUpgrade(
  oldTierId: ReferralTierId,
  newReferralCount: number
): { upgraded: boolean; newTier: ReferralTier; rewards: ReferralReward[] } {
  const newTier = getTierByCount(newReferralCount);
  const upgraded = newTier.id !== oldTierId;
  return {
    upgraded,
    newTier,
    rewards: upgraded ? newTier.unlockRewards : [],
  };
}

// ============================================================
// PASSIVE INCOME
// ============================================================

/** Calculate passive income snapshot */
export function calculatePassiveIncome(state: ReferralState): PassiveIncomeSnapshot {
  const tier = getCurrentTier(state);
  const now = Date.now();
  const elapsedMs = Math.max(0, now - state.lastPassiveCalcAt);
  const elapsedHours = Math.min(elapsedMs / (1000 * 60 * 60), MAX_PASSIVE_HOURS);

  const incomePerHour = state.activeReferrals * tier.passiveIncomePerRef;
  const totalPerHour = incomePerHour * tier.bonusMultiplier;
  const accumulated = Math.floor(totalPerHour * elapsedHours);

  return {
    activeReferrals: state.activeReferrals,
    incomePerHour,
    tierMultiplier: tier.bonusMultiplier,
    totalPerHour,
    accumulated,
    hoursElapsed: elapsedHours,
  };
}

/** Apply passive income to state (accumulate) */
export function accumulatePassiveIncome(state: ReferralState): ReferralState {
  const snapshot = calculatePassiveIncome(state);
  if (snapshot.accumulated <= 0) return state;

  return {
    ...state,
    passiveAccumulated: state.passiveAccumulated + snapshot.accumulated,
    lastPassiveCalcAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Claim all pending rewards (referral bonuses + passive income) */
export function claimRewards(state: ReferralState): {
  newState: ReferralState;
  claimed: number;
} {
  const now = Date.now();

  // Check minimum claim interval
  if (now - state.lastClaimedAt < MIN_CLAIM_INTERVAL_MS) {
    return { newState: state, claimed: 0 };
  }

  // Accumulate any pending passive first
  const withPassive = accumulatePassiveIncome(state);
  const total = withPassive.pendingRewards + withPassive.passiveAccumulated;

  if (total <= 0) {
    return { newState: withPassive, claimed: 0 };
  }

  const newState: ReferralState = {
    ...withPassive,
    pendingRewards: 0,
    passiveAccumulated: 0,
    totalEarned: withPassive.totalEarned + total,
    lastClaimedAt: now,
    updatedAt: now,
  };

  return { newState, claimed: total };
}

// ============================================================
// MILESTONES
// ============================================================

/** Get claimable milestones */
export function getClaimableMilestones(state: ReferralState) {
  return getAvailableMilestones(state.totalReferrals, state.claimedMilestones);
}

/** Claim a specific milestone */
export function claimMilestone(
  state: ReferralState,
  milestoneId: string
): { newState: ReferralState; rewards: ReferralReward[] } | null {
  const available = getClaimableMilestones(state);
  const milestone = available.find((m) => m.id === milestoneId);

  if (!milestone) return null;

  const hexReward = milestone.rewards
    .filter((r) => r.type === "hex")
    .reduce((sum, r) => sum + r.amount, 0);

  const newState: ReferralState = {
    ...state,
    claimedMilestones: [...state.claimedMilestones, milestoneId],
    pendingRewards: state.pendingRewards + hexReward,
    updatedAt: Date.now(),
  };

  return { newState, rewards: milestone.rewards };
}

// ============================================================
// HELPERS
// ============================================================

function countActiveReferrals(referrals: ReferralRecord[]): number {
  const cutoff = Date.now() - REFERRAL_ACTIVE_DAYS * 24 * 60 * 60 * 1000;
  return referrals.filter((r) => r.lastActiveAt > cutoff).length;
}

/** Get top N referrals by earnings */
export function getTopReferrals(state: ReferralState, limit: number = 10): ReferralRecord[] {
  return [...state.referrals]
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, limit);
}

/** Get recent referrals */
export function getRecentReferrals(state: ReferralState, limit: number = 5): ReferralRecord[] {
  return [...state.referrals]
    .sort((a, b) => b.referredAt - a.referredAt)
    .slice(0, limit);
}
