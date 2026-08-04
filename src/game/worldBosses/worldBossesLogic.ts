/* ═══════════════════════════════════════════════════════
   WORLD BOSSES — Pure Logic
   Attack, calculate damage, check rewards, persistence
   ═══════════════════════════════════════════════════════ */
import {
  type BossDef,
  type BossReward,
  type WorldBossState,
  getDailyBoss,
  BOSS_BY_ID,
} from "./worldBossesData";
import { WORLDBOSSES_BALANCE } from "./worldBossesBalance";
import { LUCK_TIERS, LUCK_TIER_TOTAL_WEIGHT } from "../reactor/reactorBalance";
import type { LuckTier } from "../reactor/reactorBalance";
import { guardNumber } from "../utils/numberGuards";

export type AttackResult =
  | { ok: false; reason: "dead" | "expired" | "cooldown" | "max_attacks" }
  | {
      ok: true;
      damage: number;
      isDead: boolean;
      state: WorldBossState;
    };

export type ClaimResult =
  | { ok: false; reason: "not_dead" | "already_claimed" | "no_rewards" }
  | { ok: true; rewards: BossReward[]; state: WorldBossState };

export function emptyState(): WorldBossState {
  return {
    bossId: "",
    currentHp: 0,
    totalDamage: 0,
    attackCount: 0,
    claimed: false,
    startedAt: 0,
    endsAt: 0,
  };
}

export function initState(now: number): WorldBossState {
  const boss = getDailyBoss(now);
  return {
    bossId: boss.id,
    currentHp: boss.maxHp,
    totalDamage: 0,
    attackCount: 0,
    claimed: false,
    startedAt: now,
    endsAt: now + boss.durationMs,
  };
}

export function ensureActiveBoss(state: WorldBossState, now: number): WorldBossState {
  const boss = getDailyBoss(now);
  if (state.bossId === boss.id && state.endsAt > now && state.currentHp > 0) {
    return state;
  }
  return initState(now);
}

export function getBossDef(state: WorldBossState): BossDef | null {
  return BOSS_BY_ID[state.bossId] ?? null;
}

export function getHpPercent(state: WorldBossState): number {
  const boss = BOSS_BY_ID[state.bossId];
  if (!boss || boss.maxHp <= 0) return 0;
  return Math.max(0, Math.min(100, (state.currentHp / boss.maxHp) * 100));
}

export function getDamagePercent(state: WorldBossState): number {
  const boss = BOSS_BY_ID[state.bossId];
  if (!boss || boss.maxHp <= 0) return 0;
  return guardNumber((state.totalDamage / boss.maxHp) * 100);
}

export function getTimeRemaining(state: WorldBossState, now: number): string {
  const ms = Math.max(0, state.endsAt - now);
  if (ms <= 0) return "ENDED";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export type AttackDamageResult = {
  damage: number;
  luckTier: LuckTier;
};

function pickLuckTier(): LuckTier {
  let r = Math.random() * LUCK_TIER_TOTAL_WEIGHT;
  for (const tier of LUCK_TIERS) {
    r -= tier.weight;
    if (r <= 0) return tier;
  }
  return LUCK_TIERS[0];
}

export function calculateAttackDamage(
  tapPower: number,
  moduleEffects: {
    tapPowerBonus: number;
    hexMultiplierBonus: number;
    critChanceBonus: number;
  },
  artifactEffects: {
    tapPower: number;
    hexMultiplier: number;
    critChance: number;
    modulePower: number;
  },
): AttackDamageResult {
  const moduleMult = 1 + guardNumber(artifactEffects.modulePower) / 100;
  const baseDamage = tapPower
    + guardNumber(moduleEffects.tapPowerBonus * moduleMult)
    + artifactEffects.tapPower;

  const tier = pickLuckTier();
  const damage = baseDamage * tier.multiplier;

  return {
    damage: Math.floor(guardNumber(damage)),
    luckTier: tier,
  };
}

export function performAttack(
  state: WorldBossState,
  damage: number,
  now: number,
): AttackResult {
  if (state.currentHp <= 0) return { ok: false, reason: "dead" };
  if (state.endsAt <= now) return { ok: false, reason: "expired" };
  if (state.attackCount >= WORLDBOSSES_BALANCE.MAX_ATTACKS_PER_BOSS) {
    return { ok: false, reason: "max_attacks" };
  }

  const actualDamage = Math.min(damage, state.currentHp);
  const newHp = Math.max(0, state.currentHp - actualDamage);
  const isDead = newHp <= 0;

  return {
    ok: true,
    damage: actualDamage,
    isDead,
    state: {
      ...state,
      currentHp: newHp,
      totalDamage: state.totalDamage + actualDamage,
      attackCount: state.attackCount + 1,
    },
  };
}

export function calculateRewards(state: WorldBossState): BossReward[] {
  const boss = BOSS_BY_ID[state.bossId];
  if (!boss) return [];

  const damagePercent = getDamagePercent(state);
  const rewards: BossReward[] = [];

  for (const reward of boss.rewards) {
    if (damagePercent >= reward.minDamagePercent) {
      rewards.push(reward);
    }
  }

  return rewards;
}

export function claimRewards(
  state: WorldBossState,
  now: number,
): ClaimResult {
  if (state.currentHp > 0) return { ok: false, reason: "not_dead" };
  if (state.claimed) return { ok: false, reason: "already_claimed" };

  const rewards = calculateRewards(state);
  if (rewards.length === 0) return { ok: false, reason: "no_rewards" };

  return {
    ok: true,
    rewards,
    state: { ...state, claimed: true },
  };
}
