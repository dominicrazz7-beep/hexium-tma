/* ═══════════════════════════════════════════════════════
   Shop — TypeScript types
   ═══════════════════════════════════════════════════════ */
import type { ShopState } from "../../game/shop/shopData";

export type { ShopState };

export type ShopProps = {
  hex?: number;
  shards?: number;
  onNavigate?: (screen: string, payload?: string) => void;
  dispatch?: React.Dispatch<any>;
  onStateChange?: (state: unknown) => void;
};

/** Toast feedback shown after a purchase. */
export type ShopToast = { id: number; text: string; tone: "ok" | "warn" };
