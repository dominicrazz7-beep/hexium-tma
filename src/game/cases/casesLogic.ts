/* ═══════════════════════════════════════════════════════
   CASES — pure game logic.
   Rolls rarity tier → reward, applies dupe protection, and
   returns deductions + a grant descriptor for the screen to
   apply (currency via reducer; bot/skin/booster via their
   own localStorage modules).
   ═══════════════════════════════════════════════════════ */
import {
  REWARD_POOLS,
  RARITY_NAME,
  type CaseDef,
  type CasesState,
  type CaseHistoryRecord,
  type RewardDef,
  type Rarity,
} from "./casesData";
import { HISTORY_LIMIT } from "./casesBalance";

export type Balances = { hex: number; shards: number };

/** What the player currently owns (so we can do dupe protection). */
export type OwnedSets = { bots: string[]; skins: string[] };

/** A concrete grant the screen must apply. */
export type Grant =
  | { kind: "currency"; currency: "hex" | "shards"; amount: number }
  | { kind: "bot_fragment"; botId: string; amount: number }
  | { kind: "bot_copy"; botId: string; amount: number }
  | { kind: "skin"; skinId: string }
  | { kind: "booster"; boosterId: string; expiresAt: number };

export type OpenResult =
  | { ok: false; reason: "insufficient" }
  | {
      ok: true;
      caseId: string;
      reward: RewardDef;
      dupe: boolean;
      deductions: { currency: "hex" | "shards"; amount: number };
      grants: Grant[];
      record: CaseHistoryRecord;
      state: CasesState;
    };

/* ── Weighted random helpers ── */
function pickRarity(c: CaseDef, rnd: () => number): Rarity {
  const total = c.odds.reduce((s, o) => s + o.pct, 0);
  let r = rnd() * total;
  for (const o of c.odds) {
    if ((r -= o.pct) <= 0) return o.rarity;
  }
  return c.odds[c.odds.length - 1].rarity;
}

function pickReward(tier: Rarity, rnd: () => number): RewardDef {
  const pool = REWARD_POOLS[tier];
  const total = pool.reduce((s, x) => s + x.weight, 0);
  let r = rnd() * total;
  for (const x of pool) {
    if ((r -= x.weight) <= 0) return x;
  }
  return pool[pool.length - 1];
}

/** Roll a reward for a crate (rarity tier → reward, with dupe protection). */
export function rollReward(c: CaseDef, owned: OwnedSets, rnd: () => number = Math.random) {
  const tier = pickRarity(c, rnd);
  const reward = pickReward(tier, rnd);
  let dupe = false;
  if (reward.kind === "skin" && reward.refId && owned.skins.includes(reward.refId)) dupe = true;
  return { tier, reward, dupe };
}

/** Open a crate: validate balance, roll, build deductions + grants + history record. */
export function openCase(
  state: CasesState,
  c: CaseDef,
  bal: Balances,
  owned: OwnedSets,
  now: number = Date.now(),
  rnd: () => number = Math.random,
): OpenResult {
  const priceCurrency = c.priceCurrency ?? "shards";
  if (bal[priceCurrency] < c.price) return { ok: false, reason: "insufficient" };

  const { reward, dupe } = rollReward(c, owned, rnd);
  const grants: Grant[] = [];

  if (dupe) {
    // Duplicate bot/skin → compensate with shards.
    grants.push({ kind: "currency", currency: "shards", amount: reward.dupeShards ?? 100 });
  } else {
    switch (reward.kind) {
      case "hex":
        grants.push({ kind: "currency", currency: "hex", amount: reward.amount ?? 0 });
        break;
      case "shards":
        grants.push({ kind: "currency", currency: "shards", amount: reward.amount ?? 0 });
        break;
      case "bot_fragment":
        if (reward.refId) grants.push({ kind: "bot_fragment", botId: reward.refId, amount: reward.amount ?? 0 });
        break;
      case "bot_copy":
        if (reward.refId) grants.push({ kind: "bot_copy", botId: reward.refId, amount: reward.amount ?? 1 });
        break;
      case "skin":
        if (reward.refId) grants.push({ kind: "skin", skinId: reward.refId });
        break;
      case "booster":
        if (reward.refId)
          grants.push({ kind: "booster", boosterId: reward.refId, expiresAt: now + (reward.boosterMs ?? 0) });
        break;
    }
  }

  const record: CaseHistoryRecord = {
    uid: now + Math.floor(rnd() * 1000),
    caseId: c.id,
    caseName: c.name,
    rewardLabel: dupe ? `${reward.label} (dupe → +${reward.dupeShards ?? 100} ◈)` : reward.label,
    rewardIcon: reward.icon,
    rewardRarity: reward.rarity,
    dupe,
    at: now,
  };

  const nextState: CasesState = {
    totalOpened: state.totalOpened + 1,
    history: [record, ...state.history].slice(0, HISTORY_LIMIT),
  };

  return {
    ok: true,
    caseId: c.id,
    reward,
    dupe,
    deductions: { currency: priceCurrency, amount: c.price },
    grants,
    record,
    state: nextState,
  };
}

/** Build a CS:GO-style reel of filler tiles with the winning reward at winIndex. */
export function buildReel(
  c: CaseDef,
  winning: RewardDef,
  length: number,
  winIndex: number,
  rnd: () => number = Math.random,
): RewardDef[] {
  // Candidate rewards weighted by the crate's odds (so the reel "feels" right).
  const candidates: RewardDef[] = [];
  for (const o of c.odds) for (const rw of REWARD_POOLS[o.rarity]) candidates.push(rw);
  const tiles: RewardDef[] = [];
  for (let i = 0; i < length; i++) {
    if (i === winIndex) tiles.push(winning);
    else tiles.push(candidates[Math.floor(rnd() * candidates.length)]);
  }
  return tiles;
}

export { RARITY_NAME };
