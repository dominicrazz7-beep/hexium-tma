/* ═══════════════════════════════════════════════════════
   SHOP — pure logic: affordability, purchase, boosters
   No React. Screen wires deductions to the App reducer.
   ═══════════════════════════════════════════════════════ */
import {
  type ShopState,
  type ShopItem,
  type ShopCurrency,
  type ActiveBooster,
  type PurchaseRecord,
  ITEM_BY_ID,
} from "./shopData";
import { HISTORY_LIMIT } from "./shopBalance";

export type Balances = { hex: number; shards: number };

export type Deduction = { currency: ShopCurrency; amount: number };
export type Grant =
  | { kind: "currency"; currency: ShopCurrency; amount: number }
  | { kind: "effect"; effect: "reset_heat" | "restore_energy" }
  | { kind: "cosmetic"; skinId: string }
  | { kind: "booster"; boosterId: string };

export type PurchaseResult =
  | { ok: false; reason: "insufficient" | "owned" }
  | {
      ok: true;
      state: ShopState;
      deductions: Deduction[];
      grants: Grant[];
      toast: string;
    };

function canAfford(item: { cost: number; costCurrency: ShopCurrency }, bal: Balances): boolean {
  return bal[item.costCurrency] >= item.cost;
}

function record(state: ShopState, item: ShopItem): { state: ShopState; rec: PurchaseRecord } {
  const seq = state.purchaseSeq + 1;
  const rec: PurchaseRecord = {
    uid: seq,
    itemId: item.id,
    name: item.name,
    icon: item.icon,
    cost: item.cost,
    costCurrency: item.costCurrency,
    at: Date.now(),
  };
  return {
    state: { ...state, purchaseSeq: seq, history: [rec, ...state.history].slice(0, HISTORY_LIMIT) },
    rec,
  };
}

function addBooster(state: ShopState, boosterId: string, now: number): ShopState {
  const item = ITEM_BY_ID[boosterId];
  if (!item?.boosterMs) return state;
  const existing = state.boosters.find((b) => b.id === boosterId);
  const base = existing && existing.expiresAt > now ? existing.expiresAt : now;
  const next: ActiveBooster = { id: boosterId, expiresAt: base + item.boosterMs };
  const boosters = [...state.boosters.filter((b) => b.id !== boosterId), next];
  return { ...state, boosters };
}

export function purchase(state: ShopState, item: ShopItem, bal: Balances, now = Date.now()): PurchaseResult {
  if (item.cosmetic && state.ownedSkins.includes(item.id)) {
    return { ok: false, reason: "owned" };
  }
  if (!canAfford(item, bal)) return { ok: false, reason: "insufficient" };

  let next = state;
  const grants: Grant[] = [];

  if (item.category === "booster") {
    next = addBooster(next, item.id, now);
    grants.push({ kind: "booster", boosterId: item.id });
  } else if (item.grantCurrency && item.grantAmount) {
    grants.push({ kind: "currency", currency: item.grantCurrency, amount: item.grantAmount });
  } else if (item.effect) {
    grants.push({ kind: "effect", effect: item.effect });
    if (item.id === "util_coolant") grants.push({ kind: "effect", effect: "restore_energy" });
  } else if (item.cosmetic) {
    next = { ...next, ownedSkins: [...next.ownedSkins, item.id], equippedSkin: item.id };
    grants.push({ kind: "cosmetic", skinId: item.id });
  }

  const rec = record(next, item);
  next = rec.state;

  return {
    ok: true,
    state: next,
    deductions: [{ currency: item.costCurrency, amount: item.cost }],
    grants,
    toast: purchaseToast(item),
  };
}

export function equipSkin(state: ShopState, skinId: string): ShopState {
  if (!state.ownedSkins.includes(skinId)) return state;
  return { ...state, equippedSkin: state.equippedSkin === skinId ? null : skinId };
}

export function pruneBoosters(state: ShopState, now = Date.now()): ShopState {
  const live = state.boosters.filter((b) => b.expiresAt > now);
  if (live.length === state.boosters.length) return state;
  return { ...state, boosters: live };
}

export function activeBoosters(state: ShopState, now = Date.now()): ActiveBooster[] {
  return state.boosters.filter((b) => b.expiresAt > now).sort((a, b) => a.expiresAt - b.expiresAt);
}

function purchaseToast(item: ShopItem): string {
  switch (item.category) {
    case "booster":
      return `${item.name} activated`;
    case "hex_pack":
      return `+${fmtShort(item.grantAmount ?? 0)} HEX`;
    case "shard_pack":
      return `+${fmtShort(item.grantAmount ?? 0)} SHARDS`;
    case "utility":
      return `${item.name} applied`;
    case "cosmetic":
      return `${item.name} equipped`;
    default:
      return "Purchased";
  }
}

export function fmtShort(n: number): string {
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return Math.floor(n).toLocaleString();
}

export function fmtTimeLeft(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
