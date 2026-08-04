/* ═══════════════════════════════════════════════════════
   BLACK MARKET — pure logic: purchase, stock tracking
   ═══════════════════════════════════════════════════════ */
import {
  type BmItem,
  type BmCurrency,
  generateMarketSelection,
  currentWindowSeed,
} from "./blackMarketData";
import { REFRESH_INTERVAL_MS } from "./blackMarketBalance";

export type Balances = { hex: number; shards: number };

export type BmPurchaseGrant =
  | { type: "hex"; amount: number }
  | { type: "shards"; amount: number }
  | { type: "case"; caseType: string; amount: number }
  | { type: "bot_fragment"; botId: string; amount: number }
  | { type: "research_points"; amount: number }
  | { type: "premium"; amount: number };

export type BmPurchaseResult =
  | { ok: false; reason: "insufficient" | "sold_out" | "no_refresh" }
  | {
      ok: true;
      grants: BmPurchaseGrant[];
      toast: string;
    };

export type BmWindowState = {
  seed: number;
  purchased: Record<string, number>;
  lastRefresh: number;
};

export function emptyWindowState(): BmWindowState {
  return { seed: 0, purchased: {}, lastRefresh: 0 };
}

export function getRefreshCountdown(now: number): string {
  const nextRefreshAt = (Math.floor(now / REFRESH_INTERVAL_MS) + 1) * REFRESH_INTERVAL_MS;
  const ms = nextRefreshAt - now;
  if (ms <= 0) return "Refreshing...";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export function getItemsForWindow(state: BmWindowState, now: number): BmItem[] {
  return generateMarketSelection(state.seed);
}

export function getRemainingStock(item: BmItem, state: BmWindowState): number {
  const bought = state.purchased[item.id] ?? 0;
  return Math.max(0, item.baseStock - bought);
}

export function canAffordItem(item: BmItem, bal: Balances): boolean {
  return bal[item.currency] >= item.price;
}

export function buyItem(
  item: BmItem,
  state: BmWindowState,
  bal: Balances,
): BmPurchaseResult & { state?: BmWindowState } {
  const remaining = getRemainingStock(item, state);
  if (remaining <= 0) return { ok: false, reason: "sold_out" };
  if (!canAffordItem(item, bal)) return { ok: false, reason: "insufficient" };

  const nextState: BmWindowState = {
    ...state,
    purchased: {
      ...state.purchased,
      [item.id]: (state.purchased[item.id] ?? 0) + 1,
    },
  };

  const grants: BmPurchaseGrant[] = [];

  switch (item.grant.type) {
    case "hex":
    case "shards":
    case "premium":
    case "research_points":
      grants.push({ type: item.grant.type, amount: item.grant.amount });
      break;
    case "case":
      grants.push({ type: "case", caseType: item.grant.caseType, amount: item.grant.amount });
      break;
    case "bot_fragment":
      grants.push({ type: "bot_fragment", botId: item.grant.botId, amount: item.grant.amount });
      break;
  }

  const toast = buildToast(item);

  return { ok: true, grants, toast, state: nextState };
}

function buildToast(item: BmItem): string {
  switch (item.grant.type) {
    case "hex":
      return `+${item.grant.amount.toLocaleString()} HEX`;
    case "shards":
      return `+${item.grant.amount} SHARDS`;
    case "case":
      return `+${item.grant.amount} ${item.grant.caseType} Case`;
    case "bot_fragment":
      return `+${item.grant.amount} Fragments`;
    case "research_points":
      return `+${item.grant.amount} Research Points`;
    case "premium":
      return `+${item.grant.amount} Premium Credits`;
    default:
      return "Purchased";
  }
}
