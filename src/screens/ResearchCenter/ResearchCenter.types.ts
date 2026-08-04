import type { HexiumAction } from "../../app/core/hexiumTypes";

export type ResearchCenterProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
