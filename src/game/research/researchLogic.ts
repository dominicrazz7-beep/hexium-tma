/* ═══════════════ HEXIUM · Research Center — logic (pure, no React) ═══════════════ */

import { RESEARCH_BY_ID, RESEARCH_ITEMS, type ResearchEffectType, type ResearchDef } from "./researchData";
import { RESEARCH_BALANCE } from "./researchBalance";

export type ResearchTierCompleted = 0 | 1 | 2 | 3;

export type ResearchState = {
  completed: Record<string, ResearchTierCompleted>;
  activeId: string | null;
  startedAt: number;
  endsAt: number;
};

const DEFAULT_STATE: ResearchState = {
  completed: {},
  activeId: null,
  startedAt: 0,
  endsAt: 0,
};

export function loadResearchState(): ResearchState {
  try {
    const raw = localStorage.getItem(RESEARCH_BALANCE.storageKey);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ResearchState>;
    return {
      completed: typeof parsed.completed === "object" && parsed.completed ? parsed.completed as Record<string, ResearchTierCompleted> : {},
      activeId: typeof parsed.activeId === "string" ? parsed.activeId : null,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : 0,
      endsAt: typeof parsed.endsAt === "number" ? parsed.endsAt : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveResearchState(state: ResearchState): void {
  try {
    localStorage.setItem(RESEARCH_BALANCE.storageKey, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function getCompletedTier(state: ResearchState, id: string): number {
  return state.completed[id] ?? 0;
}

export function getNextTier(state: ResearchState, id: string): number {
  return Math.min(3, getCompletedTier(state, id) + 1);
}

export function isResearchDone(state: ResearchState, id: string): boolean {
  return getCompletedTier(state, id) >= 3;
}

export function isResearchActive(state: ResearchState): boolean {
  if (!state.activeId) return false;
  return Date.now() < state.endsAt;
}

export function getActiveResearch(state: ResearchState): { def: ResearchDef; endsAt: number } | null {
  if (!state.activeId || Date.now() >= state.endsAt) return null;
  const def = RESEARCH_BY_ID[state.activeId];
  return def ? { def, endsAt: state.endsAt } : null;
}

export function getRemainingMs(state: ResearchState): number {
  if (!state.activeId) return 0;
  return Math.max(0, state.endsAt - Date.now());
}

export function canStartResearch(
  state: ResearchState,
  id: string,
  hex: number,
  shards: number,
): { ok: boolean; reason?: string } {
  if (isResearchActive(state)) return { ok: false, reason: "Research already in progress" };
  const def = RESEARCH_BY_ID[id];
  if (!def) return { ok: false, reason: "Unknown research" };
  const tier = getNextTier(state, id);
  if (tier > 3) return { ok: false, reason: "Already maxed" };
  const cost = def.tiers[tier - 1];
  if (hex < cost.costHex) return { ok: false, reason: "Not enough HEX" };
  if (shards < cost.costShards) return { ok: false, reason: "Not enough Shards" };
  return { ok: true };
}

export function startResearch(state: ResearchState, id: string): ResearchState {
  const def = RESEARCH_BY_ID[id];
  if (!def) return state;
  const tier = getNextTier(state, id);
  if (tier > 3) return state;
  const cost = def.tiers[tier - 1];
  const now = Date.now();
  return {
    ...state,
    activeId: id,
    startedAt: now,
    endsAt: now + cost.durationMinutes * 60 * 1000,
  };
}

export function collectResearch(state: ResearchState, id: string): ResearchState {
  if (state.activeId !== id) return state;
  if (Date.now() < state.endsAt) return state;
  const tier = getNextTier(state, id);
  if (tier > 3) return state;
  return {
    ...state,
    completed: { ...state.completed, [id]: tier as 1 | 2 | 3 },
    activeId: null,
    startedAt: 0,
    endsAt: 0,
  };
}

export type ResearchEffects = Partial<Record<ResearchEffectType, number>>;

export function calculateAllEffects(state: ResearchState): ResearchEffects {
  const effects: ResearchEffects = {};
  for (const [id, tier] of Object.entries(state.completed)) {
    const def = RESEARCH_BY_ID[id];
    if (!def || tier <= 0) continue;
    const value = def.tiers[tier - 1].effectValue;
    const prev = effects[def.effectType] ?? 1;
    effects[def.effectType] = prev * value;
  }
  return effects;
}

export function getTotalCompleted(state: ResearchState): number {
  return Object.values(state.completed).reduce<number>((sum, t) => sum + t, 0);
}

export function getTotalPossible(): number {
  return RESEARCH_ITEMS.length * 3;
}
