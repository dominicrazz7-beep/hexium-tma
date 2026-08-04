/* ═══════════════════════════════════════════════════════
   EXPEDITIONS — Data & Types
   3 tiers: Short, Medium, Long
   ═══════════════════════════════════════════════════════ */

export type ExpeditionTier = "short" | "medium" | "long";

export type ExpeditionRewardType = "hex" | "module_fragment" | "bot_fragment" | "research_points";

export type ExpeditionReward = {
  type: ExpeditionRewardType;
  amount: number;
  chance: number;
};

export type ExpeditionDef = {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: ExpeditionTier;
  durationMs: number;
  requiredLevel: number;
  rewards: ExpeditionReward[];
};

export type ActiveExpedition = {
  defId: string;
  startedAt: number;
  completesAt: number;
};

export type ExpeditionHistoryRecord = {
  uid: number;
  defId: string;
  name: string;
  icon: string;
  tier: ExpeditionTier;
  rewards: string;
  at: number;
};

export type ExpeditionsState = {
  active: ActiveExpedition[];
  history: ExpeditionHistoryRecord[];
};
