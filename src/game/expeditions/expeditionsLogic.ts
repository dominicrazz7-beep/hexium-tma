/* ═══════════════════════════════════════════════════════
   EXPEDITIONS — Pure Logic
   Start, check completion, collect rewards.
   ═══════════════════════════════════════════════════════ */
import type {
  ExpeditionsState,
  ActiveExpedition,
  ExpeditionHistoryRecord,
  ExpeditionReward,
} from "./expeditionsData";
import {
  EXPEDITION_DEFS,
  EXPEDITION_BY_ID,
} from "./expeditionsBalance";
import {
  EXPEDITIONS_BALANCE,
} from "./expeditionsBalance";

export type StartResult =
  | { ok: false; reason: "slots_full" | "cooldown" | "level_too_low" | "not_found" }
  | { ok: true; state: ExpeditionsState };

export type CollectResult =
  | { ok: false; reason: "not_ready" | "not_found" }
  | { ok: true; rewards: ExpeditionReward[]; state: ExpeditionsState };

export function emptyState(): ExpeditionsState {
  return { active: [], history: [] };
}

export function getAvailableExpeditions(
  state: ExpeditionsState,
  reactorLevel: number,
  now: number,
) {
  return EXPEDITION_DEFS.filter((def) => {
    if (reactorLevel < def.requiredLevel) return false;
    if (state.active.some((a) => a.defId === def.id)) {
      const active = state.active.find((a) => a.defId === def.id);
      if (active && active.completesAt > now) return false;
    }
    return true;
  });
}

export function startExpedition(
  state: ExpeditionsState,
  defId: string,
  reactorLevel: number,
  now: number,
  extraSlots: number = 0,
  speedBonus: number = 0,
): StartResult {
  if (state.active.length >= EXPEDITIONS_BALANCE.MAX_ACTIVE + extraSlots) {
    return { ok: false, reason: "slots_full" };
  }

  const def = EXPEDITION_BY_ID[defId];
  if (!def) return { ok: false, reason: "not_found" };
  if (reactorLevel < def.requiredLevel) return { ok: false, reason: "level_too_low" };

  const existing = state.active.find((a) => a.defId === defId);
  if (existing && existing.completesAt > now) {
    return { ok: false, reason: "cooldown" };
  }

  const active: ActiveExpedition = {
    defId,
    startedAt: now,
    completesAt: now + Math.floor(def.durationMs / (1 + speedBonus / 100)),
  };

  const nextActive = state.active.filter((a) => a.defId !== defId);
  nextActive.push(active);

  return {
    ok: true,
    state: { ...state, active: nextActive },
  };
}

export function checkCompleted(
  state: ExpeditionsState,
  now: number,
): ActiveExpedition[] {
  return state.active.filter((a) => a.completesAt <= now);
}

export function collectExpedition(
  state: ExpeditionsState,
  defId: string,
  now: number,
  researchYieldBonus: number = 0,
): CollectResult {
  const active = state.active.find((a) => a.defId === defId);
  if (!active) return { ok: false, reason: "not_found" };
  if (active.completesAt > now) return { ok: false, reason: "not_ready" };

  const def = EXPEDITION_BY_ID[defId];
  if (!def) return { ok: false, reason: "not_found" };

  const granted: ExpeditionReward[] = [];
  for (const reward of def.rewards) {
    if (Math.random() < reward.chance) {
      const amount = reward.type === "research_points"
        ? Math.floor(reward.amount * (1 + researchYieldBonus / 100))
        : reward.amount;
      granted.push({ ...reward, amount });
    }
  }

  if (granted.length === 0) {
    granted.push({ type: "hex", amount: Math.floor(def.rewards[0].amount * 0.5), chance: 1 });
  }

  const rewardLabel = granted
    .map((r) => {
      switch (r.type) {
        case "hex": return `${r.amount} HEX`;
        case "research_points": return `${r.amount} Research`;
        case "bot_fragment": return `${r.amount} Bot Frag`;
        case "module_fragment": return `${r.amount} Module Frag`;
      }
    })
    .join(", ");

  const record: ExpeditionHistoryRecord = {
    uid: now + Math.floor(Math.random() * 1000),
    defId,
    name: def.name,
    icon: def.icon,
    tier: def.tier,
    rewards: rewardLabel,
    at: now,
  };

  const nextState: ExpeditionsState = {
    active: state.active.filter((a) => a.defId !== defId),
    history: [record, ...state.history].slice(0, EXPEDITIONS_BALANCE.HISTORY_LIMIT),
  };

  return { ok: true, rewards: granted, state: nextState };
}

export function getTimeRemaining(completesAt: number, now: number): string {
  const ms = Math.max(0, completesAt - now);
  if (ms <= 0) return "READY";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatRewardType(type: string): string {
  switch (type) {
    case "hex": return "HEX";
    case "research_points": return "Research";
    case "bot_fragment": return "Bot Frag";
    case "module_fragment": return "Module Frag";
    default: return type;
  }
}
