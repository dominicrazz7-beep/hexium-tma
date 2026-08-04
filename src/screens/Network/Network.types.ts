import type { HexiumAction, PlayerCoreState } from "../../app/core/hexiumTypes";

export type NetworkProps = {
  hex?: number;
  shards?: number;
  player?: PlayerCoreState;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: (action: HexiumAction) => void;
  onStateChange?: (state: unknown) => void;
};

export type NetworkToast = {
  id: number;
  text: string;
  tone: "ok" | "info";
};
