/* ═══════════════════════════════════════════════════════
   Main Reactor — Data / Initial State
   Local reactor state (NOT global HexiumGameState).
   ═══════════════════════════════════════════════════════ */
import { REACTOR_BALANCE, REACTOR_LEVEL_THRESHOLDS } from "./reactorBalance";
import { type AscensionState, emptyState as emptyAscensionState, calculateBonuses } from "../ascension/ascensionLogic";

/** Reactor-local state managed inside MainReactorScreen. */
export type ReactorLocalState = {
  /* Energy */
  energy: number;
  maxEnergy: number;

  /* Temperature / Overheat */
  temperature: number;
  maxTemperature: number;
  isOverheated: boolean;
  overheatTimer: number;         // seconds remaining

  /* Turbo */
  turboActive: boolean;
  turboTimeLeft: number;         // seconds remaining
  turboCooldown: number;         // seconds until available

  /* Upgrades — level per key */
  upgrades: Record<string, number>;

  /* Stats */
  totalHexMined: number;
  totalTaps: number;
  sessionTaps: number;
};

export function createInitialReactorState(ascState?: AscensionState): ReactorLocalState {
  const asc = ascState ? calculateBonuses(ascState) : null;
  const headStartLevel = asc?.headStartLevel ?? 0;
  const headStartHex = headStartLevel > 0 ? REACTOR_LEVEL_THRESHOLDS[headStartLevel] ?? 0 : 0;

  return {
    energy: REACTOR_BALANCE.BASE_MAX_ENERGY + (asc?.maxEnergy ?? 0),
    maxEnergy: REACTOR_BALANCE.BASE_MAX_ENERGY + (asc?.maxEnergy ?? 0),

    temperature: 0,
    maxTemperature: REACTOR_BALANCE.BASE_MAX_TEMPERATURE + (asc?.maxTemperature ?? 0),
    isOverheated: false,
    overheatTimer: 0,

    turboActive: false,
    turboTimeLeft: 0,
    turboCooldown: 0,

    upgrades: {
      tapPower: 0,
      autoMiner: 0,
      energyCapacity: 0,
      heatSink: 0,
    },

    totalHexMined: headStartHex,
    totalTaps: 0,
    sessionTaps: 0,
  };
}
