/* ═══════════════════════════════════════════════════════
   BATTLE PASS — pure game logic (no React)
   ═══════════════════════════════════════════════════════ */
import {
  SEASON_ID,
  TOTAL_TIERS,
  BATTLE_PASS_TIERS,
  initialBattlePassState,
  type BattlePassState,
  type BattlePassTier,
} from "./battlePassData";
import { BATTLEPASS_BALANCE } from "./battlePassBalance";

export type { BattlePassState };

export function loadBattlePassState(): BattlePassState {
  try {
    const raw = localStorage.getItem(BATTLEPASS_BALANCE.storageKey);
    if (!raw) return initialBattlePassState();
    const parsed = JSON.parse(raw) as Partial<BattlePassState>;
    const state: BattlePassState = {
      seasonId: typeof parsed.seasonId === "string" ? parsed.seasonId : SEASON_ID,
      xp: Math.max(0, Number(parsed.xp) || 0),
      premiumOwned: Boolean(parsed.premiumOwned),
      claimedFree: typeof parsed.claimedFree === "object" && parsed.claimedFree ? parsed.claimedFree as Record<number, boolean> : {},
      claimedPremium: typeof parsed.claimedPremium === "object" && parsed.claimedPremium ? parsed.claimedPremium as Record<number, boolean> : {},
    };
    if (state.seasonId !== SEASON_ID) return initialBattlePassState();
    return state;
  } catch {
    return initialBattlePassState();
  }
}

export function saveBattlePassState(state: BattlePassState): void {
  try {
    localStorage.setItem(BATTLEPASS_BALANCE.storageKey, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function addXP(state: BattlePassState, amount: number): BattlePassState {
  return { ...state, xp: state.xp + amount };
}

export function getCurrentTier(state: BattlePassState): number {
  let tier = 0;
  for (const t of BATTLE_PASS_TIERS) {
    if (state.xp >= t.xpRequired) tier = t.tier;
    else break;
  }
  return tier;
}

export function getXPForNextTier(state: BattlePassState): number {
  const current = getCurrentTier(state);
  if (current >= TOTAL_TIERS) return 0;
  const next = BATTLE_PASS_TIERS[current]; // 0-indexed, current tier is next target
  return next ? next.xpRequired - state.xp : 0;
}

export function getTierProgress(state: BattlePassState): { current: number; nextXP: number; ratio: number } {
  const current = getCurrentTier(state);
  if (current >= TOTAL_TIERS) return { current: TOTAL_TIERS, nextXP: 0, ratio: 1 };
  const nextTier = BATTLE_PASS_TIERS[current]; // next tier (0-indexed)
  if (!nextTier) return { current: TOTAL_TIERS, nextXP: 0, ratio: 1 };
  const prevRequired = current > 0 ? BATTLE_PASS_TIERS[current - 1].xpRequired : 0;
  const range = nextTier.xpRequired - prevRequired;
  const progress = state.xp - prevRequired;
  return {
    current,
    nextXP: nextTier.xpRequired - state.xp,
    ratio: range > 0 ? Math.min(1, progress / range) : 0,
  };
}

export function canClaimFree(state: BattlePassState, tier: number): boolean {
  const t = TIER_BY(tier);
  if (!t?.free) return false;
  if (state.xp < t.xpRequired) return false;
  return !state.claimedFree[tier];
}

export function canClaimPremium(state: BattlePassState, tier: number): boolean {
  const t = TIER_BY(tier);
  if (!t?.premium) return false;
  if (!state.premiumOwned) return false;
  if (state.xp < t.xpRequired) return false;
  return !state.claimedPremium[tier];
}

export function claimFree(state: BattlePassState, tier: number): BattlePassState {
  if (!canClaimFree(state, tier)) return state;
  return { ...state, claimedFree: { ...state.claimedFree, [tier]: true } };
}

export function claimPremium(state: BattlePassState, tier: number): BattlePassState {
  if (!canClaimPremium(state, tier)) return state;
  return { ...state, claimedPremium: { ...state.claimedPremium, [tier]: true } };
}

export function buyPremium(state: BattlePassState): BattlePassState {
  return { ...state, premiumOwned: true };
}

export function totalFreeClaimed(state: BattlePassState): number {
  return Object.values(state.claimedFree).filter(Boolean).length;
}

export function totalPremiumClaimed(state: BattlePassState): number {
  return Object.values(state.claimedPremium).filter(Boolean).length;
}

function TIER_BY(tier: number): BattlePassTier | undefined {
  return BATTLE_PASS_TIERS.find((t) => t.tier === tier);
}
