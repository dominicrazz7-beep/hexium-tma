/* ═══════════════════════════════════════════════════════════
   HEXIUM · UNIFIED ECONOMY ENGINE
   Single source of truth for global passive HEX/sec.

   Combines every income system into ONE total rate:
     • Reactor (Auto-Miner)        — flat HEX/sec
     • HEX-BOTS fleet              — flat HEX/sec
     • Network (sectors + referral)— % hashrate multiplier
     • Shop boosters               — output multiplier

   Pure module: no React. Reads each subsystem's own localStorage
   so it never desyncs from the screens that own that state.
   ═══════════════════════════════════════════════════════════ */

import { createInitialReactorState } from "../reactor/reactorData";
import { getAutoHexPerSec } from "../reactor/reactorLogic";

import { initialFleet, type FleetState } from "../bots/botsData";
import { totalRate as botsTotalRate } from "../bots/botsLogic";

import { loadNetwork, connectedBoostPct, referralBonusPct } from "../network/networkLogic";

import { ITEM_BY_ID, initialShopState, type ShopState } from "../shop/shopData";
import { activeBoosters } from "../shop/shopLogic";

import { type AscensionState, emptyState as emptyAscensionState, calculateBonuses } from "../ascension/ascensionLogic";
import { ASCENSION_BALANCE } from "../ascension/ascensionBalance";
import { calculateModuleEffects } from "../reactorModules/reactorModulesLogic";
import type { EquippedModules } from "../reactorModules/reactorModulesData";

/* ── storage keys (owned by each subsystem) ── */
const REACTOR_KEY = "hexium_reactor_state_v1";
const BOTS_KEY = "hexium_bots_state_v1";
const SHOP_KEY = "hexium_shop_state_v1";
const ASCENSION_KEY = ASCENSION_BALANCE.STORAGE_KEY;
/** Global economy meta — used for the unified offline-income clock. */
export const ECONOMY_KEY = "hexium_economy_state_v1";

/* ── tuning ── */
export const ECONOMY_TICK_MS = 1000;              // passive accrual cadence
export const OFFLINE_CAP_SECONDS = 8 * 3600;      // 8h unified offline cap

/* ── breakdown returned to the HUD ── */
export type EconomyBreakdown = {
  reactor: number;        // HEX/sec attributable to reactor auto-miner
  bots: number;           // HEX/sec attributable to the bot fleet
  network: number;        // HEX/sec added by network % bonus
  booster: number;        // HEX/sec added by active shop boosters
  total: number;          // grand total HEX/sec (sum of the four above)
  base: number;           // reactor + bots (pre-multiplier)
  networkPct: number;     // network bonus as a %
  boosterMult: number;    // combined booster multiplier (×)
  activeBoosterIds: string[];
  shares: {               // each source as a fraction of total (sums to ~1)
    reactor: number; bots: number; network: number; booster: number;
  };
};

/* ── safe localStorage loaders (merge onto defaults) ── */
function loadReactor() {
  try {
    const raw = localStorage.getItem(REACTOR_KEY);
    const fresh = createInitialReactorState();
    if (!raw) return fresh;
    const p = JSON.parse(raw);
    return { ...fresh, ...p, upgrades: { ...fresh.upgrades, ...(p.upgrades ?? {}) } };
  } catch {
    return createInitialReactorState();
  }
}

function loadFleet(): FleetState {
  try {
    const raw = localStorage.getItem(BOTS_KEY);
    if (!raw) return initialFleet();
    const p = JSON.parse(raw);
    const base = initialFleet();
    return { bots: { ...base.bots, ...(p.bots ?? {}) }, lastSeen: p.lastSeen ?? Date.now() };
  } catch {
    return initialFleet();
  }
}

function loadShop(): ShopState {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (!raw) return initialShopState();
    const p = JSON.parse(raw);
    return { ...initialShopState(), ...p };
  } catch {
    return initialShopState();
  }
}

function loadAscension(): AscensionState {
  try {
    const raw = localStorage.getItem(ASCENSION_KEY);
    if (!raw) return emptyAscensionState();
    return { ...emptyAscensionState(), ...JSON.parse(raw) };
  } catch {
    return emptyAscensionState();
  }
}

const EMPTY_EQUIPPED: EquippedModules = { slot1: null, slot2: null, slot3: null };

function loadModules(): EquippedModules {
  try {
    const raw = localStorage.getItem("hexium_reactor_modules_v1");
    if (!raw) return EMPTY_EQUIPPED;
    return { ...EMPTY_EQUIPPED, ...JSON.parse(raw) };
  } catch {
    return EMPTY_EQUIPPED;
  }
}

/** Combined booster multiplier = product of every active booster's mult. */
export function boosterMultiplier(shop: ShopState, now = Date.now()): { mult: number; ids: string[] } {
  const active = activeBoosters(shop, now);
  let mult = 1;
  const ids: string[] = [];
  for (const b of active) {
    const item = ITEM_BY_ID[b.id];
    const m = item?.boosterMult;
    if (m && m > 0) {
      mult *= m;
      ids.push(b.id);
    }
  }
  return { mult, ids };
}

/* ═══════════════════════════════════════════════════════════
   CORE FORMULA
     base    = reactor + bots
     ascMult = 1 + ascensionHexBonus / 100
     netMult = 1 + (sectorBonus% + referralBonus%) / 100
     total   = base × ascMult × netMult × boosterMult
   ═══════════════════════════════════════════════════════════ */
export function computeEconomy(now = Date.now()): EconomyBreakdown {
  const reactorMods = calculateModuleEffects(loadModules());
  const reactorRate = Math.max(0, getAutoHexPerSec(loadReactor(), reactorMods));
  const botsRate = Math.max(0, botsTotalRate(loadFleet()));

  const ascBonuses = calculateBonuses(loadAscension());
  const ascMult = 1 + ascBonuses.hexMultiplier / 100;

  const net = loadNetwork();
  const networkPct = connectedBoostPct(net) + referralBonusPct(net);
  const netMult = 1 + networkPct / 100;

  const { mult: boosterMult, ids: activeBoosterIds } = boosterMultiplier(loadShop(), now);

  const base = reactorRate + botsRate;
  const ascBonus = base * (ascMult - 1);
  const networkBonus = (base * ascMult) * (netMult - 1);
  const boosterBonus = (base * ascMult * netMult) * (boosterMult - 1);
  const total = base * ascMult * netMult * boosterMult;

  const safe = total > 0 ? total : 1;
  return {
    reactor: Number.isFinite(reactorRate) ? reactorRate : 0,
    bots: Number.isFinite(botsRate) ? botsRate : 0,
    network: Number.isFinite(networkBonus) ? networkBonus : 0,
    booster: Number.isFinite(boosterBonus) ? boosterBonus : 0,
    total: Number.isFinite(total) ? total : 0,
    base: Number.isFinite(base) ? base : 0,
    networkPct: Number.isFinite(networkPct) ? networkPct : 0,
    boosterMult: Number.isFinite(boosterMult) ? boosterMult : 1,
    activeBoosterIds,
    shares: {
      reactor: Number.isFinite(reactorRate / safe) ? reactorRate / safe : 0,
      bots: Number.isFinite(botsRate / safe) ? botsRate / safe : 0,
      network: Number.isFinite(networkBonus / safe) ? networkBonus / safe : 0,
      booster: Number.isFinite(boosterBonus / safe) ? boosterBonus / safe : 0,
    },
  };
}

/* ── unified offline clock ── */
export function readLastSeen(now = Date.now()): number {
  try {
    const raw = localStorage.getItem(ECONOMY_KEY);
    if (!raw) return now;
    const p = JSON.parse(raw);
    return typeof p.lastSeen === "number" ? p.lastSeen : now;
  } catch {
    return now;
  }
}

export function writeLastSeen(now = Date.now()): void {
  try {
    localStorage.setItem(ECONOMY_KEY, JSON.stringify({ lastSeen: now }));
  } catch { /* ignore */ }
}

/**
 * Unified offline income: current total rate × capped elapsed time.
 * Uses the *current* economy snapshot (expired boosters already pruned),
 * so it transparently covers reactor + bots + network + boosters.
 */
export function computeOffline(now = Date.now()): { hex: number; seconds: number; rate: number } {
  const last = readLastSeen(now);
  const elapsed = Math.max(0, (now - last) / 1000);
  const capped = Math.min(elapsed, OFFLINE_CAP_SECONDS);
  const rate = computeEconomy(now).total;
  return { hex: Math.floor(rate * capped), seconds: capped, rate };
}
