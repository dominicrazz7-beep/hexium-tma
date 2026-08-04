import type { HexiumAction } from "../../app/core/hexiumTypes";

export type BattlePassProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
