/* ═══════════════════════════════════════════════════════
   MainReactor — TypeScript Types
   ═══════════════════════════════════════════════════════ */
import type { ReactorLocalState } from "../../game/reactor/reactorData";
import type { UpgradeKey } from "../../game/reactor/reactorBalance";

export type { ReactorLocalState, UpgradeKey };

/** Props for the MainReactorScreen top-level component. */
export type MainReactorScreenProps = {
  hex: number;
  shards: number;
  /** Lifetime HEX mined — single source of truth, read from global state.player. */
  totalHexMined: number;
  /** Lifetime tap count — single source of truth, read from global state.player. */
  totalTaps: number;
  onNavigate: (screen: string, payload?: string) => void;
  dispatch: React.Dispatch<any>;
};

/** Floating reward particle for visual feedback. */
export type FloatingReward = {
  id: number;
  amount: number;
  x: number;
  y: number;
  isCritical: boolean;
  isTurbo: boolean;
  luckTierName: string;
  luckLabel: string;
  cssClass: string;
};

/** Upgrade item for display in UpgradePanel. */
export type UpgradeDisplayItem = {
  key: UpgradeKey;
  label: string;
  icon: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  currentValue: number;
  nextValue: number;
  canAfford: boolean;
};

/** Reactor visual state for ReactorCore animations. */
export type ReactorVisualState =
  | "idle"
  | "active"
  | "turbo"
  | "overheat"
  | "cooldown";

/** Energy spark particle spawned on tap (3 variants). */
export type Spark =
  | { id: number; kind: "dot"; x: number; y: number; delay: number; color: "cyan" | "purple" }
  | { id: number; kind: "arc"; x: number; y: number; rot: number; color: "" | "purple" }
  | { id: number; kind: "line"; x: number; y: number; dx: number; dy: number; color: "cyan" | "purple" };
