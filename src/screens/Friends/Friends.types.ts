import type { Dispatch } from "react";
import type { HexiumAction } from "../../app/core/hexiumTypes";

export type FriendsProps = {
  hex?: number;
  shards?: number;
  playerId?: string;
  username?: string;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: Dispatch<HexiumAction>;
  onStateChange?: (state: unknown) => void;
};
