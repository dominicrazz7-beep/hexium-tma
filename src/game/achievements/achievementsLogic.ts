/* ═══════════════ HEXIUM · Achievements — logic (pure, no React) ═══════════════ */

import { ACHIEVEMENTS, type Achievement, type AchievementInput } from "./achievementsData";
import { ACHIEVEMENTS_BALANCE } from "./achievementsBalance";

export type AchievementState = {
  claimed: Record<string, boolean>;
};

const DEFAULT_STATE: AchievementState = { claimed: {} };

export function loadAchievementState(): AchievementState {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_BALANCE.storageKey);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AchievementState>;
    return {
      claimed: typeof parsed.claimed === "object" && parsed.claimed ? parsed.claimed as Record<string, boolean> : {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveAchievementState(state: AchievementState): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_BALANCE.storageKey, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export type EvaluatedAchievement = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  category: Achievement["category"];
  ratio: number;
  done: boolean;
  claimed: boolean;
  rewardHex: number;
  rewardShards: number;
};

export function evaluateAchievements(input: AchievementInput, state: AchievementState): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const ratio = a.progress(input);
    return {
      id: a.id,
      icon: a.icon,
      name: a.name,
      desc: a.desc,
      category: a.category,
      ratio,
      done: ratio >= 1,
      claimed: Boolean(state.claimed[a.id]),
      rewardHex: a.rewardHex ?? 0,
      rewardShards: a.rewardShards ?? 0,
    };
  });
}

export function achievementsDone(list: EvaluatedAchievement[]): number {
  return list.filter((a) => a.done).length;
}

export function achievementsClaimed(list: EvaluatedAchievement[]): number {
  return list.filter((a) => a.claimed).length;
}

export function getUnclaimedRewards(list: EvaluatedAchievement[]): EvaluatedAchievement[] {
  return list.filter((a) => a.done && !a.claimed);
}

export function claimAchievement(state: AchievementState, id: string): AchievementState {
  return { ...state, claimed: { ...state.claimed, [id]: true } };
}

export function totalUnclaimedHex(list: EvaluatedAchievement[]): number {
  return getUnclaimedRewards(list).reduce((sum, a) => sum + a.rewardHex, 0);
}

export function totalUnclaimedShards(list: EvaluatedAchievement[]): number {
  return getUnclaimedRewards(list).reduce((sum, a) => sum + a.rewardShards, 0);
}
