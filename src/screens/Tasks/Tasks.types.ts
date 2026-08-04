import type { Dispatch } from "react";
import type { HexiumAction } from "../../app/core/hexiumTypes";

export type TasksProps = {
  hex?: number;
  shards?: number;
  totalTaps?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
