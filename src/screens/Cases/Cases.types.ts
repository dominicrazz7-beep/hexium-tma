/* ═══════════════════════════════════════════════════════
   Cases — TypeScript types
   ═══════════════════════════════════════════════════════ */
import type { CasesState } from "../../game/cases/casesData";

export type { CasesState };

export type CasesProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<any>;
  onStateChange?: (state: unknown) => void;
};

/** Toast feedback shown after opening a crate. */
export type CasesToast = { id: number; text: string; tone: "ok" | "warn" };
