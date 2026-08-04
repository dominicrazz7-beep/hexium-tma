/* ═══════════════════════════════════════════════════════
   BATTLE PASS — data layer (tiers, rewards, state shape)
   30-tier season with free + premium tracks.
   ═══════════════════════════════════════════════════════ */
import type { GameReward } from "../../app/core/hexiumTypes";

export type TrackType = "free" | "premium";

export type BattlePassReward = {
  track: TrackType;
  reward: GameReward;
  label: string;
  icon: string;
};

export type BattlePassTier = {
  tier: number;
  xpRequired: number;
  free?: BattlePassReward;
  premium?: BattlePassReward;
};

export type BattlePassState = {
  seasonId: string;
  xp: number;
  premiumOwned: boolean;
  claimedFree: Record<number, boolean>;
  claimedPremium: Record<number, boolean>;
};

export function initialBattlePassState(): BattlePassState {
  return {
    seasonId: "season_1",
    xp: 0,
    premiumOwned: false,
    claimedFree: {},
    claimedPremium: {},
  };
}

/* ── Season 1: 30 tiers ── */
export const SEASON_ID = "season_1";
export const TOTAL_TIERS = 30;

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  /* Tiers 1-5: Early game */
  { tier: 1, xpRequired: 0, free: { track: "free", reward: { type: "hex", amount: 500 }, label: "500 HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 5 }, label: "5 ◈", icon: "🔹" } },
  { tier: 2, xpRequired: 200, free: { track: "free", reward: { type: "hex", amount: 800 }, label: "800 HEX", icon: "💰" } },
  { tier: 3, xpRequired: 500, free: { track: "free", reward: { type: "hex", amount: 1200 }, label: "1.2K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 8 }, label: "8 ◈", icon: "🔹" } },
  { tier: 4, xpRequired: 900, free: { track: "free", reward: { type: "hex", amount: 1500 }, label: "1.5K HEX", icon: "💰" } },
  { tier: 5, xpRequired: 1400, free: { track: "free", reward: { type: "case", caseType: "basic", amount: 1 }, label: "Basic Case", icon: "📦" }, premium: { track: "premium", reward: { type: "shards", amount: 12 }, label: "12 ◈", icon: "🔹" } },

  /* Tiers 6-10: Building */
  { tier: 6, xpRequired: 2000, free: { track: "free", reward: { type: "hex", amount: 2000 }, label: "2K HEX", icon: "💰" } },
  { tier: 7, xpRequired: 2700, free: { track: "free", reward: { type: "hex", amount: 2500 }, label: "2.5K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 15 }, label: "15 ◈", icon: "🔹" } },
  { tier: 8, xpRequired: 3500, free: { track: "free", reward: { type: "hex", amount: 3000 }, label: "3K HEX", icon: "💰" } },
  { tier: 9, xpRequired: 4400, free: { track: "free", reward: { type: "hex", amount: 3500 }, label: "3.5K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 18 }, label: "18 ◈", icon: "🔹" } },
  { tier: 10, xpRequired: 5500, free: { track: "free", reward: { type: "case", caseType: "basic", amount: 2 }, label: "2× Basic Case", icon: "📦" }, premium: { track: "premium", reward: { type: "shards", amount: 22 }, label: "22 ◈", icon: "🔹" } },

  /* Tiers 11-15: Mid-game */
  { tier: 11, xpRequired: 6800, free: { track: "free", reward: { type: "hex", amount: 5000 }, label: "5K HEX", icon: "💰" } },
  { tier: 12, xpRequired: 8200, free: { track: "free", reward: { type: "hex", amount: 6000 }, label: "6K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 25 }, label: "25 ◈", icon: "🔷" } },
  { tier: 13, xpRequired: 9800, free: { track: "free", reward: { type: "hex", amount: 7000 }, label: "7K HEX", icon: "💰" } },
  { tier: 14, xpRequired: 11500, free: { track: "free", reward: { type: "hex", amount: 8000 }, label: "8K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 30 }, label: "30 ◈", icon: "🔷" } },
  { tier: 15, xpRequired: 13500, free: { track: "free", reward: { type: "case", caseType: "advanced", amount: 1 }, label: "Advanced Case", icon: "🎁" }, premium: { track: "premium", reward: { type: "shards", amount: 35 }, label: "35 ◈", icon: "🔷" } },

  /* Tiers 16-20: Ramp-up */
  { tier: 16, xpRequired: 15800, free: { track: "free", reward: { type: "hex", amount: 10000 }, label: "10K HEX", icon: "💰" } },
  { tier: 17, xpRequired: 18300, free: { track: "free", reward: { type: "hex", amount: 12000 }, label: "12K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 40 }, label: "40 ◈", icon: "💠" } },
  { tier: 18, xpRequired: 21000, free: { track: "free", reward: { type: "hex", amount: 14000 }, label: "14K HEX", icon: "💰" } },
  { tier: 19, xpRequired: 24000, free: { track: "free", reward: { type: "hex", amount: 16000 }, label: "16K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 50 }, label: "50 ◈", icon: "💠" } },
  { tier: 20, xpRequired: 27500, free: { track: "free", reward: { type: "case", caseType: "advanced", amount: 2 }, label: "2× Advanced Case", icon: "🎁" }, premium: { track: "premium", reward: { type: "shards", amount: 60 }, label: "60 ◈", icon: "💠" } },

  /* Tiers 21-25: High-tier */
  { tier: 21, xpRequired: 31500, free: { track: "free", reward: { type: "hex", amount: 20000 }, label: "20K HEX", icon: "💰" } },
  { tier: 22, xpRequired: 36000, free: { track: "free", reward: { type: "hex", amount: 25000 }, label: "25K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 70 }, label: "70 ◈", icon: "💠" } },
  { tier: 23, xpRequired: 41000, free: { track: "free", reward: { type: "hex", amount: 30000 }, label: "30K HEX", icon: "💰" } },
  { tier: 24, xpRequired: 46500, free: { track: "free", reward: { type: "hex", amount: 35000 }, label: "35K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 80 }, label: "80 ◈", icon: "💠" } },
  { tier: 25, xpRequired: 52500, free: { track: "free", reward: { type: "case", caseType: "premium", amount: 1 }, label: "Premium Case", icon: "💼" }, premium: { track: "premium", reward: { type: "shards", amount: 100 }, label: "100 ◈", icon: "🔱" } },

  /* Tiers 26-30: End-game */
  { tier: 26, xpRequired: 59000, free: { track: "free", reward: { type: "hex", amount: 40000 }, label: "40K HEX", icon: "💰" } },
  { tier: 27, xpRequired: 66000, free: { track: "free", reward: { type: "hex", amount: 50000 }, label: "50K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 120 }, label: "120 ◈", icon: "🔱" } },
  { tier: 28, xpRequired: 74000, free: { track: "free", reward: { type: "hex", amount: 60000 }, label: "60K HEX", icon: "💰" } },
  { tier: 29, xpRequired: 83000, free: { track: "free", reward: { type: "hex", amount: 75000 }, label: "75K HEX", icon: "💰" }, premium: { track: "premium", reward: { type: "shards", amount: 150 }, label: "150 ◈", icon: "🔱" } },
  { tier: 30, xpRequired: 93000, free: { track: "free", reward: { type: "case", caseType: "premium", amount: 2 }, label: "2× Premium Case", icon: "💼" }, premium: { track: "premium", reward: { type: "shards", amount: 200 }, label: "200 ◈", icon: "🔱" } },
];

export const TIER_BY_NUMBER: Record<number, BattlePassTier> = Object.fromEntries(
  BATTLE_PASS_TIERS.map((t) => [t.tier, t]),
);
