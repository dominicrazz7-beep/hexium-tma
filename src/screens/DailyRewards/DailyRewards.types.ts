import type { HexiumAction } from "../../app/core/hexiumTypes";

export type DailyRewardKind =
  | { type: "hex"; amount: number }
  | { type: "shards"; amount: number }
  | { type: "case"; caseType: "basic" | "advanced"; amount: number };

export type DailyRewardsProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
