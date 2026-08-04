import type { PlayerCoreState, HexiumAction } from "../../app/core/hexiumTypes";

export type ProfileProps = {
  hex?: number;
  shards?: number;
  player?: PlayerCoreState;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
