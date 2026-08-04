// ============================================================
// HEXIUM CLICKER · Referral System · Service (Orchestrator)
// ============================================================
// High-level API that ties together logic, storage, rewards.
// Screens and bridges call THIS, not individual modules.
// ============================================================

import type {
  ReferralState,
  ReferralStats,
  ReferralValidation,
  PassiveIncomeSnapshot,
  ReferralEvent,
  ReferralReward,
  ReferralInvite,
} from "./referralTypes";
import {
  getTierByCount,
  getNextTier,
  getAvailableMilestones,
  getAllMilestones,
  REFERRED_WELCOME_BONUS,
} from "./referralData";
import {
  validateReferral,
  isDuplicateReferral,
  addReferral,
  setReferredBy,
  refreshReferralActivity,
  calculatePassiveIncome,
  accumulatePassiveIncome,
  claimRewards,
  claimMilestone,
  checkTierUpgrade,
  getRecentReferrals,
  getClaimableMilestones,
} from "./referralLogic";
import { referralStorage } from "./referralStorage";
import {
  createNewReferralReward,
  createPassiveClaimReward,
  createWelcomeBonusReward,
  createTierUnlockRewards,
  createMilestoneRewards,
  summarizeRewards,
  type ReferralGameReward,
} from "./referralRewards";

// ============================================================
// STATE
// ============================================================

let state: ReferralState | null = null;
let myTelegramId: number = 0;
let botUsername: string = "hexium_bot";

// Event listeners
type EventListener = (event: ReferralEvent) => void;
const listeners: EventListener[] = [];

// ============================================================
// INIT
// ============================================================

/** Initialize the referral system */
async function initialize(
  telegramId: number,
  bot?: string
): Promise<ReferralState> {
  myTelegramId = telegramId;
  if (bot) botUsername = bot;

  state = await referralStorage.load(myTelegramId);

  // Refresh activity status on init
  state = refreshReferralActivity(state);
  referralStorage.save(state);

  console.log("[Referral] Initialized:", {
    code: state.myReferralCode,
    referrals: state.totalReferrals,
    tier: state.currentTier,
    referredBy: state.referredBy,
  });

  return state;
}

/** Check if initialized */
function isInitialized(): boolean {
  return state !== null;
}

function getState(): ReferralState {
  if (!state) throw new Error("[Referral] Not initialized — call initialize() first");
  return state;
}

// ============================================================
// REFERRAL FLOW
// ============================================================

/** Process incoming referral code (I was referred by someone) */
function processIncomingReferral(referrerCode: string): {
  validation: ReferralValidation;
  welcomeReward: ReferralGameReward | null;
} {
  const s = getState();
  const validation = validateReferral(s, myTelegramId, referrerCode);

  if (!validation.valid || !validation.referrerId) {
    return { validation, welcomeReward: null };
  }

  // Set referrer
  state = setReferredBy(s, validation.referrerId, referrerCode);
  referralStorage.save(state);

  // Create welcome bonus for the referred player (me)
  const welcomeReward = createWelcomeBonusReward(REFERRED_WELCOME_BONUS);

  emit({
    type: "referral:new",
    data: { referrerId: validation.referrerId, direction: "incoming" },
    timestamp: Date.now(),
  });

  console.log("[Referral] I was referred by:", validation.referrerId);
  return { validation, welcomeReward };
}

/** Register a new referral (someone used MY invite) */
function registerNewReferral(
  referredUserId: number,
  referredUsername: string
): {
  success: boolean;
  rewards: ReferralGameReward[];
  tierUpgraded: boolean;
  newTierName: string;
} {
  const s = getState();

  // Prevent self-referral
  if (referredUserId === myTelegramId) {
    return { success: false, rewards: [], tierUpgraded: false, newTierName: "" };
  }

  // Prevent duplicate
  if (isDuplicateReferral(s, referredUserId)) {
    return { success: false, rewards: [], tierUpgraded: false, newTierName: "" };
  }

  const oldTierId = s.currentTier;
  state = addReferral(s, referredUserId, referredUsername);
  referralStorage.save(state);

  // Check tier upgrade
  const tierCheck = checkTierUpgrade(oldTierId, state.totalReferrals);
  const rewards: ReferralGameReward[] = [];

  // Referral bonus reward
  const tier = getTierByCount(state.totalReferrals);
  rewards.push(createNewReferralReward(tier.rewardPerReferral));

  // Tier unlock rewards
  if (tierCheck.upgraded) {
    rewards.push(...createTierUnlockRewards(tierCheck.rewards));

    emit({
      type: "referral:tier_up",
      data: { oldTier: oldTierId, newTier: tierCheck.newTier.id },
      timestamp: Date.now(),
    });
  }

  emit({
    type: "referral:new",
    data: { referredUserId, direction: "outgoing", tierUpgraded: tierCheck.upgraded },
    timestamp: Date.now(),
  });

  console.log("[Referral] New referral:", referredUsername, "| Total:", state.totalReferrals);

  return {
    success: true,
    rewards,
    tierUpgraded: tierCheck.upgraded,
    newTierName: tierCheck.upgraded ? tierCheck.newTier.name : "",
  };
}

// ============================================================
// PASSIVE INCOME
// ============================================================

/** Get current passive income snapshot */
function getPassiveIncome(): PassiveIncomeSnapshot {
  return calculatePassiveIncome(getState());
}

/** Claim all pending rewards (referral bonuses + passive) */
function claimAllRewards(): {
  claimed: number;
  reward: ReferralGameReward | null;
} {
  const { newState, claimed } = claimRewards(getState());
  state = newState;
  referralStorage.save(state);

  if (claimed <= 0) {
    return { claimed: 0, reward: null };
  }

  const reward = createPassiveClaimReward(claimed);

  emit({
    type: "referral:passive_claimed",
    data: { amount: claimed },
    timestamp: Date.now(),
  });

  console.log("[Referral] Claimed:", claimed, "HEX");
  return { claimed, reward };
}

/** Accumulate passive income (call periodically, e.g. every minute) */
function tickPassiveIncome(): void {
  state = accumulatePassiveIncome(getState());
  referralStorage.save(state);
}

// ============================================================
// MILESTONES
// ============================================================

/** Get claimable milestones */
function getClaimable() {
  return getClaimableMilestones(getState());
}

/** Claim a milestone by ID */
function claimMilestoneReward(milestoneId: string): {
  success: boolean;
  rewards: ReferralGameReward[];
} {
  const result = claimMilestone(getState(), milestoneId);
  if (!result) {
    return { success: false, rewards: [] };
  }

  state = result.newState;
  referralStorage.save(state);

  const gameRewards = createMilestoneRewards(result.rewards);

  emit({
    type: "referral:milestone_claimed",
    data: { milestoneId, rewards: result.rewards },
    timestamp: Date.now(),
  });

  console.log("[Referral] Milestone claimed:", milestoneId);
  return { success: true, rewards: gameRewards };
}

// ============================================================
// INVITE LINK
// ============================================================

/** Get invite link info */
function getInviteInfo(): ReferralInvite {
  const s = getState();
  const link = `https://t.me/${botUsername}?start=ref_${s.myReferralCode}`;
  return {
    inviteLink: link,
    inviteCode: s.myReferralCode,
    shareText: `Join HEXIUM CLICKER! ☢️ Mine HEX with me!\n${link}`,
  };
}

// ============================================================
// STATS (for UI)
// ============================================================

/** Get full stats for Friends/Referral screen */
function getStats(): ReferralStats {
  const s = getState();
  const currentTier = getTierByCount(s.totalReferrals);
  const nextTier = getNextTier(currentTier.id);
  const passive = calculatePassiveIncome(s);
  const invite = getInviteInfo();

  return {
    totalReferrals: s.totalReferrals,
    activeReferrals: s.activeReferrals,
    currentTier,
    nextTier,
    referralsToNextTier: nextTier
      ? Math.max(0, nextTier.minReferrals - s.totalReferrals)
      : 0,
    totalEarned: s.totalEarned,
    pendingRewards: s.pendingRewards + s.passiveAccumulated,
    passivePerHour: passive.totalPerHour,
    inviteLink: invite.inviteLink,
    recentReferrals: getRecentReferrals(s),
    availableMilestones: getAvailableMilestones(s.totalReferrals, s.claimedMilestones),
    claimedMilestones: s.claimedMilestones,
  };
}

// ============================================================
// SYNC
// ============================================================

/** Force sync with cloud */
async function syncWithCloud(): Promise<void> {
  state = await referralStorage.forceSync(myTelegramId);
  state = refreshReferralActivity(state);
  referralStorage.save(state);
  console.log("[Referral] Synced with cloud");
}

// ============================================================
// CLOUD SAVE INTERFACE
// ============================================================

/** Export referral state for cloud save (minimal — no PII) */
function getStateForSave(): Record<string, unknown> {
  if (!state) return {};
  return {
    totalReferrals: state.totalReferrals,
    activeReferrals: state.activeReferrals,
    currentTier: state.currentTier,
    totalEarned: state.totalEarned,
    claimedMilestones: state.claimedMilestones,
    referredBy: state.referredBy,
    lastClaimedAt: state.lastClaimedAt,
  };
}

/** Restore referral state from cloud save */
function restoreFromSave(data: Record<string, unknown>): void {
  if (!state || !data) return;
  if (typeof data.totalReferrals === "number") state.totalReferrals = data.totalReferrals;
  if (typeof data.activeReferrals === "number") state.activeReferrals = data.activeReferrals;
  if (typeof data.currentTier === "string") state.currentTier = data.currentTier as any;
  if (typeof data.totalEarned === "number") state.totalEarned = data.totalEarned;
  if (Array.isArray(data.claimedMilestones)) state.claimedMilestones = data.claimedMilestones;
  if (typeof data.referredBy === "number") state.referredBy = data.referredBy;
  if (typeof data.lastClaimedAt === "number") state.lastClaimedAt = data.lastClaimedAt;

  referralStorage.save(state);
  console.log("[Referral] Restored from cloud save");
}

// ============================================================
// EVENTS
// ============================================================

function on(listener: EventListener): void {
  listeners.push(listener);
}

function off(listener: EventListener): void {
  const idx = listeners.indexOf(listener);
  if (idx >= 0) listeners.splice(idx, 1);
}

function emit(event: ReferralEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("[Referral] Event listener error:", err);
    }
  }
}

// ============================================================
// RESET (for testing)
// ============================================================

// ============================================================
// CLEANUP
// ============================================================

function destroy(): void {
  listeners.length = 0;
  state = null;
  myTelegramId = 0;
  botUsername = "";
  console.log("[Referral] Destroyed");
}

async function reset(): Promise<void> {
  referralStorage.clearLocal();
  await referralStorage.clearCloud();
  state = null;
  console.log("[Referral] Reset complete");
}

// ============================================================
// EXPORT
// ============================================================

export const referralService = {
  // Init
  initialize,
  isInitialized,
  getState,

  // Referral flow
  processIncomingReferral,
  registerNewReferral,

  // Passive income
  getPassiveIncome,
  claimAllRewards,
  tickPassiveIncome,

  // Milestones
  getClaimable,
  claimMilestoneReward,

  // Invite
  getInviteInfo,

  // Stats
  getStats,

  // Sync
  syncWithCloud,

  // Events
  on,
  off,

  // Cloud Save
  getStateForSave,
  restoreFromSave,

  // Cleanup
  destroy,

  // Debug
  reset,
};
