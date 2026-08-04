/* ═══════════════ HEXIUM · Profile — logic (pure, no React) ═══════════════ */

import {
  PROFILE_STORAGE_KEY,
  BOTS_STORAGE_KEY,
  CASES_STORAGE_KEY,
  SHOP_STORAGE_KEY,
  DEFAULT_SETTINGS,
  initialProfileState,
  OPERATOR_GLYPHS,
  type ProfileState,
  type ProfileSettings,
  type PlayerSummary,
} from "./profileData";

import {
  loadAchievementState,
  saveAchievementState,
  evaluateAchievements as evalAchievements,
  achievementsDone,
  achievementsClaimed,
  claimAchievement,
  totalUnclaimedHex,
  totalUnclaimedShards,
  type AchievementState,
  type EvaluatedAchievement,
} from "../achievements/achievementsLogic";

import type { AchievementInput } from "../achievements/achievementsData";

import { RESEARCH_BALANCE } from "../research/researchBalance";

/* ── persistence ── */
export function loadProfile(): ProfileState {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return initialProfileState();
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return {
      glyphIndex: typeof parsed.glyphIndex === "number" ? parsed.glyphIndex : 0,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return initialProfileState();
  }
}

export function saveProfile(state: ProfileState): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function toggleSetting(state: ProfileState, key: keyof ProfileSettings): ProfileState {
  return { ...state, settings: { ...state.settings, [key]: !state.settings[key] } };
}

export function cycleGlyph(state: ProfileState): ProfileState {
  return { ...state, glyphIndex: (state.glyphIndex + 1) % OPERATOR_GLYPHS.length };
}

export function currentGlyph(state: ProfileState): string {
  return OPERATOR_GLYPHS[state.glyphIndex % OPERATOR_GLYPHS.length];
}

/* ── cross-module summary (reads other screens' localStorage) ── */
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Count owned bots from hexium_bots_state_v1. */
export function readBotsOwned(): number {
  const f = safeParse<{ bots?: Record<string, { owned?: boolean }> }>(BOTS_STORAGE_KEY, {});
  if (!f.bots) return 0;
  return Object.values(f.bots).filter((b) => b && b.owned).length;
}

/** Cases opened total from hexium_cases_state_v1. */
export function readCasesOpened(): number {
  const c = safeParse<{ totalOpened?: number }>(CASES_STORAGE_KEY, {});
  return typeof c.totalOpened === "number" ? c.totalOpened : 0;
}

/** Cosmetics info from hexium_shop_state_v1. */
export function readCosmetics(): { ownedSkins: string[]; equippedSkin: string | null } {
  const s = safeParse<{ ownedSkins?: string[]; equippedSkin?: string | null }>(SHOP_STORAGE_KEY, {});
  return {
    ownedSkins: Array.isArray(s.ownedSkins) ? s.ownedSkins : [],
    equippedSkin: s.equippedSkin ?? null,
  };
}

/** Read reactor upgrade count from hexium_reactor_state_v1. */
function readUpgradesTotal(): number {
  const r = safeParse<{ upgrades?: Record<string, number> }>("hexium_reactor_state_v1", {});
  if (!r.upgrades || typeof r.upgrades !== "object") return 0;
  return Object.values(r.upgrades).reduce<number>((sum, v) => sum + (Number(v) || 0), 0);
}

/** Read turbo use count. */
function readTurboUsed(): number {
  const r = safeParse<{ turboUsed?: number }>("hexium_reactor_state_v1", {});
  return typeof r.turboUsed === "number" ? r.turboUsed : 0;
}

/** Read overheat count. */
function readOverheatCount(): number {
  const r = safeParse<{ overheatCount?: number }>("hexium_reactor_state_v1", {});
  return typeof r.overheatCount === "number" ? r.overheatCount : 0;
}

/** Read research tiers completed. */
function readResearchTiers(): number {
  const rs = safeParse<{ completed?: Record<string, number> }>(RESEARCH_BALANCE.storageKey, {});
  if (!rs.completed || typeof rs.completed !== "object") return 0;
  return Object.values(rs.completed).reduce<number>((sum, v) => sum + (Number(v) || 0), 0);
}

/** Read daily streak. */
function readDailyStreak(): number {
  const d = safeParse<{ streakDay?: number }>("hexium_daily_rewards_mvp_v1", {});
  return typeof d.streakDay === "number" ? d.streakDay : 0;
}

/** Read total play minutes. */
function readTotalPlayMinutes(): number {
  const t = safeParse<{ playSeconds?: number }>("hexium_tasks_mvp_v1", {});
  return Math.floor((Number(t.playSeconds) || 0) / 60);
}

/** Build the full player summary used by stat grid. */
export function buildSummary(input: {
  hex: number;
  shards: number;
  totalHexMined: number;
  totalTaps: number;
  hashrate: number;
  reactorLevel: number;
}): PlayerSummary {
  const cosmetics = readCosmetics();
  return {
    ...input,
    botsOwned: readBotsOwned(),
    casesOpened: readCasesOpened(),
    skinsOwned: cosmetics.ownedSkins.length,
  };
}

/** Build the full achievement input from cross-module reads. */
export function buildAchievementInput(summary: PlayerSummary): AchievementInput {
  return {
    hex: summary.hex,
    shards: summary.shards,
    totalHexMined: summary.totalHexMined,
    totalTaps: summary.totalTaps,
    hashrate: summary.hashrate,
    reactorLevel: summary.reactorLevel,
    botsOwned: summary.botsOwned,
    casesOpened: summary.casesOpened,
    skinsOwned: summary.skinsOwned,
    dailyStreak: readDailyStreak(),
    totalPlayMinutes: readTotalPlayMinutes(),
    turboUsed: readTurboUsed(),
    overheatCount: readOverheatCount(),
    researchTiers: readResearchTiers(),
    upgradesTotal: readUpgradesTotal(),
  };
}

/* ── achievements (delegated to achievements module) ── */
export type { EvaluatedAchievement, AchievementState };

export function loadAchievements(): AchievementState {
  return loadAchievementState();
}

export function saveAchievements(state: AchievementState): void {
  saveAchievementState(state);
}

export function evaluateAchievements(summary: PlayerSummary, achvState?: AchievementState): EvaluatedAchievement[] {
  const input = buildAchievementInput(summary);
  const state = achvState ?? loadAchievementState();
  return evalAchievements(input, state);
}

export { achievementsDone, achievementsClaimed, claimAchievement, totalUnclaimedHex, totalUnclaimedShards };
