// ============================================================
// HEXIUM CLICKER · Referral System · Data & Balance
// ============================================================
// All referral tiers, milestones, and balance constants.
// Adjust numbers here to rebalance without touching logic.
// ============================================================

import type {
  ReferralTier,
  ReferralTierId,
  ReferralMilestone,
  ReferralState,
} from "./referralTypes";

// ============================================================
// TIERS
// ============================================================

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    id: "bronze",
    name: "Bronze Recruiter",
    icon: "🥉",
    minReferrals: 0,
    bonusMultiplier: 1.0,
    rewardPerReferral: 100,
    passiveIncomePerRef: 5,
    unlockRewards: [],
  },
  {
    id: "silver",
    name: "Silver Recruiter",
    icon: "🥈",
    minReferrals: 5,
    bonusMultiplier: 1.2,
    rewardPerReferral: 200,
    passiveIncomePerRef: 10,
    unlockRewards: [
      { id: "silver_unlock_hex", type: "hex", amount: 500, label: "+500 HEX", icon: "💎" },
      { id: "silver_unlock_energy", type: "energy", amount: 50, label: "+50 Energy", icon: "⚡" },
    ],
  },
  {
    id: "gold",
    name: "Gold Recruiter",
    icon: "🥇",
    minReferrals: 15,
    bonusMultiplier: 1.5,
    rewardPerReferral: 500,
    passiveIncomePerRef: 20,
    unlockRewards: [
      { id: "gold_unlock_hex", type: "hex", amount: 2000, label: "+2000 HEX", icon: "💎" },
      { id: "gold_unlock_case", type: "case", amount: 1, label: "Rare Case ×1", icon: "📦" },
    ],
  },
  {
    id: "platinum",
    name: "Platinum Recruiter",
    icon: "💠",
    minReferrals: 50,
    bonusMultiplier: 2.0,
    rewardPerReferral: 1000,
    passiveIncomePerRef: 40,
    unlockRewards: [
      { id: "plat_unlock_hex", type: "hex", amount: 10000, label: "+10K HEX", icon: "💎" },
      { id: "plat_unlock_boost", type: "boost", amount: 1, label: "2× Boost 24h", icon: "🚀" },
      { id: "plat_unlock_case", type: "case", amount: 3, label: "Epic Case ×3", icon: "📦" },
    ],
  },
  {
    id: "diamond",
    name: "Diamond Recruiter",
    icon: "💎",
    minReferrals: 150,
    bonusMultiplier: 3.0,
    rewardPerReferral: 2500,
    passiveIncomePerRef: 80,
    unlockRewards: [
      { id: "diamond_unlock_hex", type: "hex", amount: 50000, label: "+50K HEX", icon: "💎" },
      { id: "diamond_unlock_cosmetic", type: "cosmetic", amount: 1, label: "Diamond Frame", icon: "🖼️" },
      { id: "diamond_unlock_case", type: "case", amount: 5, label: "Legendary Case ×5", icon: "📦" },
    ],
  },
  {
    id: "quantum",
    name: "Quantum Recruiter",
    icon: "☢️",
    minReferrals: 500,
    bonusMultiplier: 5.0,
    rewardPerReferral: 5000,
    passiveIncomePerRef: 150,
    unlockRewards: [
      { id: "quantum_unlock_hex", type: "hex", amount: 200000, label: "+200K HEX", icon: "💎" },
      { id: "quantum_unlock_premium", type: "premium_currency", amount: 100, label: "+100 Stars", icon: "⭐" },
      { id: "quantum_unlock_cosmetic", type: "cosmetic", amount: 1, label: "Quantum Aura", icon: "✨" },
      { id: "quantum_unlock_case", type: "case", amount: 10, label: "Quantum Case ×10", icon: "📦" },
    ],
  },
];

// ============================================================
// MILESTONES
// ============================================================

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    id: "first_friend",
    requiredReferrals: 1,
    title: "First Friend",
    description: "Invite your first friend to HEXIUM",
    icon: "👋",
    rewards: [
      { id: "ms_1_hex", type: "hex", amount: 50, label: "+50 HEX", icon: "💎" },
    ],
  },
  {
    id: "squad_3",
    requiredReferrals: 3,
    title: "Small Squad",
    description: "Build a squad of 3 players",
    icon: "👥",
    rewards: [
      { id: "ms_3_hex", type: "hex", amount: 200, label: "+200 HEX", icon: "💎" },
      { id: "ms_3_energy", type: "energy", amount: 30, label: "+30 Energy", icon: "⚡" },
    ],
  },
  {
    id: "team_10",
    requiredReferrals: 10,
    title: "Team Leader",
    description: "Lead a team of 10 miners",
    icon: "⛏️",
    rewards: [
      { id: "ms_10_hex", type: "hex", amount: 1000, label: "+1K HEX", icon: "💎" },
      { id: "ms_10_case", type: "case", amount: 1, label: "Rare Case ×1", icon: "📦" },
    ],
  },
  {
    id: "army_25",
    requiredReferrals: 25,
    title: "Army Builder",
    description: "Command an army of 25 miners",
    icon: "⚔️",
    rewards: [
      { id: "ms_25_hex", type: "hex", amount: 3000, label: "+3K HEX", icon: "💎" },
      { id: "ms_25_boost", type: "boost", amount: 1, label: "2× Boost 12h", icon: "🚀" },
    ],
  },
  {
    id: "legion_50",
    requiredReferrals: 50,
    title: "Legion Commander",
    description: "Build a legion of 50 players",
    icon: "🏛️",
    rewards: [
      { id: "ms_50_hex", type: "hex", amount: 10000, label: "+10K HEX", icon: "💎" },
      { id: "ms_50_case", type: "case", amount: 3, label: "Epic Case ×3", icon: "📦" },
      { id: "ms_50_cosmetic", type: "cosmetic", amount: 1, label: "Legion Badge", icon: "🎖️" },
    ],
  },
  {
    id: "empire_100",
    requiredReferrals: 100,
    title: "Empire Founder",
    description: "100 miners under your banner",
    icon: "👑",
    rewards: [
      { id: "ms_100_hex", type: "hex", amount: 50000, label: "+50K HEX", icon: "💎" },
      { id: "ms_100_premium", type: "premium_currency", amount: 50, label: "+50 Stars", icon: "⭐" },
      { id: "ms_100_cosmetic", type: "cosmetic", amount: 1, label: "Emperor Crown", icon: "👑" },
    ],
  },
  {
    id: "network_250",
    requiredReferrals: 250,
    title: "Network Master",
    description: "A network of 250 quantum miners",
    icon: "🌐",
    rewards: [
      { id: "ms_250_hex", type: "hex", amount: 150000, label: "+150K HEX", icon: "💎" },
      { id: "ms_250_case", type: "case", amount: 5, label: "Legendary Case ×5", icon: "📦" },
    ],
  },
  {
    id: "singularity_500",
    requiredReferrals: 500,
    title: "Singularity",
    description: "500 players — you ARE the network",
    icon: "☢️",
    rewards: [
      { id: "ms_500_hex", type: "hex", amount: 500000, label: "+500K HEX", icon: "💎" },
      { id: "ms_500_premium", type: "premium_currency", amount: 200, label: "+200 Stars", icon: "⭐" },
      { id: "ms_500_cosmetic", type: "cosmetic", amount: 1, label: "Quantum Singularity", icon: "☢️" },
    ],
  },
];

// ============================================================
// CONSTANTS
// ============================================================

/** Days without activity before referral becomes inactive */
export const REFERRAL_ACTIVE_DAYS = 7;

/** Max passive income accumulation (hours) — prevents AFK farming */
export const MAX_PASSIVE_HOURS = 24;

/** Minimum time between passive claims (ms) */
export const MIN_CLAIM_INTERVAL_MS = 60 * 1000; // 1 minute

/** Referral welcome bonus for the REFERRED player (not referrer) */
export const REFERRED_WELCOME_BONUS = 50;

/** State schema version */
export const REFERRAL_STATE_VERSION = 1;

// ============================================================
// HELPERS
// ============================================================

/** Get tier by ID */
export function getTierById(tierId: ReferralTierId): ReferralTier {
  return REFERRAL_TIERS.find((t) => t.id === tierId) ?? REFERRAL_TIERS[0];
}

/** Get tier by referral count */
export function getTierByCount(count: number): ReferralTier {
  let result = REFERRAL_TIERS[0];
  for (const tier of REFERRAL_TIERS) {
    if (count >= tier.minReferrals) {
      result = tier;
    }
  }
  return result;
}

/** Get next tier (or null if max) */
export function getNextTier(currentTierId: ReferralTierId): ReferralTier | null {
  const idx = REFERRAL_TIERS.findIndex((t) => t.id === currentTierId);
  if (idx < 0 || idx >= REFERRAL_TIERS.length - 1) return null;
  return REFERRAL_TIERS[idx + 1];
}

/** Get available (unclaimed) milestones */
export function getAvailableMilestones(
  totalReferrals: number,
  claimedIds: string[]
): ReferralMilestone[] {
  return REFERRAL_MILESTONES.filter(
    (m) => totalReferrals >= m.requiredReferrals && !claimedIds.includes(m.id)
  );
}

/** Get all reachable milestones (including future) */
export function getAllMilestones(): ReferralMilestone[] {
  return [...REFERRAL_MILESTONES];
}

/** Create empty referral state */
export function createEmptyReferralState(myTelegramId: number): ReferralState {
  const now = Date.now();
  return {
    myReferralCode: String(myTelegramId),
    referredBy: null,
    referredByCode: null,
    referrals: [],
    totalReferrals: 0,
    activeReferrals: 0,
    currentTier: "bronze",
    tierUnlockedAt: { bronze: now, silver: 0, gold: 0, platinum: 0, diamond: 0, quantum: 0 },
    totalEarned: 0,
    pendingRewards: 0,
    lastClaimedAt: 0,
    claimedMilestones: [],
    passiveAccumulated: 0,
    lastPassiveCalcAt: now,
    version: REFERRAL_STATE_VERSION,
    updatedAt: now,
  };
}
