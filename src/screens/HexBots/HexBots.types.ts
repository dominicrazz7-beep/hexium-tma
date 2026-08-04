/* ═══════════════════════════════════════════════════════
   HexBots — TypeScript Types
   ═══════════════════════════════════════════════════════ */
import type { FleetState, BotState } from "../../game/bots/botsData";

export type { FleetState, BotState };

export type HexBotsProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<any>;
  onStateChange?: (state: unknown) => void;
};

/** Toast feedback shown after an action. */
export type BotToast = { id: number; text: string; tone: "ok" | "warn" };
