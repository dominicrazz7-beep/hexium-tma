/* ═══════════════════════════════════════════════════════
   HEX-BOTS — evolution logic
   ═══════════════════════════════════════════════════════ */

import { BOT_ROSTER, BOT_BY_ID, getBotStage, type BotDef, type FleetState, type BotState } from "./botsData";
import { BOTS_BALANCE, RARITY_BASE_UPGRADE } from "./botsBalance";

function safeState(st?: Partial<BotState>): BotState {
  return {
    owned: Boolean(st?.owned),
    active: Boolean(st?.active),
    lvl: Math.max(1, Math.floor(st?.lvl ?? 1)),
    stars: Math.max(1, Math.min(5, Math.floor(st?.stars ?? 1))) as 1 | 2 | 3 | 4 | 5,
    fragments: Math.max(0, Math.floor(st?.fragments ?? 0)),
    copies: Math.max(0, Math.floor(st?.copies ?? 0)),
  };
}

export function normalizeFleet(fleet: FleetState): FleetState {
  const bots: FleetState["bots"] = {};
  for (const def of BOT_ROSTER) {
    const saved = fleet.bots?.[def.id] ?? {};
    bots[def.id] = safeState({
      ...saved,
      owned: (saved as Partial<BotState>).owned ?? def.startsOwned,
      active: (saved as Partial<BotState>).active ?? def.startActive,
      lvl: (saved as Partial<BotState>).lvl ?? def.startLevel,
      stars: (saved as Partial<BotState>).stars ?? 1,
      fragments: (saved as Partial<BotState>).fragments ?? 0,
      copies: (saved as Partial<BotState>).copies ?? 0,
    });
  }
  // preserve old MVP IDs by converting owned legacy bots into fragments, not duplicated units
  const legacyToClass: Record<string, string> = { SCOUT: "scout", GPU: "coder", MINER: "drone", FORGE: "power_core", PRIME: "power_core", OMEGA: "data_hunter" };
  for (const [oldId, newId] of Object.entries(legacyToClass)) {
    const old = (fleet.bots as any)?.[oldId];
    if (old?.owned && bots[newId]) {
      bots[newId].owned = true;
      bots[newId].active = bots[newId].active || Boolean(old.active);
      bots[newId].lvl = Math.max(bots[newId].lvl, Math.min(20, Math.floor(old.lvl ?? 1)));
      bots[newId].fragments += 25;
    }
  }
  return { bots, lastSeen: fleet.lastSeen ?? Date.now() };
}

export function botRate(def: BotDef, lvl: number, stars = 1): number {
  const starMul = BOTS_BALANCE.starRateMultiplier[Math.max(0, Math.min(4, stars - 1))] ?? 1;
  const rate = Number((def.baseRate * starMul * Math.max(1, lvl)).toFixed(2));
  return Number.isFinite(rate) ? Math.max(0, rate) : 0;
}

export function upgradeCost(def: BotDef, lvl: number, stars = 1): number {
  const stage = getBotStage(def, stars);
  const base = RARITY_BASE_UPGRADE[stage.rarity];
  return Math.round(base * Math.pow(BOTS_BALANCE.upgradeGrowth, Math.max(0, lvl - 1)) * (1 + (stars - 1) * 0.35));
}

export function isMaxed(lvl: number): boolean {
  return lvl >= BOTS_BALANCE.maxLevel;
}

export function totalRate(fleet: FleetState): number {
  const nf = normalizeFleet(fleet);
  const rate = BOT_ROSTER.reduce((sum, def) => {
    const st = nf.bots[def.id];
    return st?.owned && st.active ? sum + botRate(def, st.lvl, st.stars) : sum;
  }, 0);
  return Number.isFinite(rate) ? Math.max(0, rate) : 0;
}

export function ownedCount(fleet: FleetState): number {
  const nf = normalizeFleet(fleet);
  return BOT_ROSTER.filter((d) => nf.bots[d.id]?.owned).length;
}

export function activeCount(fleet: FleetState): number {
  const nf = normalizeFleet(fleet);
  return BOT_ROSTER.filter((d) => nf.bots[d.id]?.owned && nf.bots[d.id]?.active).length;
}

export function collectionStars(fleet: FleetState): number {
  const nf = normalizeFleet(fleet);
  return BOT_ROSTER.reduce((sum, d) => sum + (nf.bots[d.id]?.owned ? nf.bots[d.id].stars : 0), 0);
}

export function featuredBot(fleet: FleetState): BotDef {
  const nf = normalizeFleet(fleet);
  let best = BOT_ROSTER[0];
  let bestRate = -1;
  for (const def of BOT_ROSTER) {
    const st = nf.bots[def.id];
    if (st?.owned && st.active) {
      const r = botRate(def, st.lvl, st.stars);
      if (r > bestRate) { bestRate = r; best = def; }
    }
  }
  return best;
}

type FleetResult = { fleet: FleetState; ok: boolean; spentHex?: number; spentShards?: number; reason?: string };

export function addBotFragments(fleet: FleetState, id: string, amount: number): FleetState {
  const nf = normalizeFleet(fleet);
  const st = nf.bots[id];
  if (!st || !Number.isFinite(amount)) return nf;
  return { ...nf, bots: { ...nf.bots, [id]: { ...st, fragments: st.fragments + Math.max(0, Math.floor(amount)) } } };
}

/** Unlock with fragments. Kept name for screen compatibility. */
export function unlockBot(fleet: FleetState, id: string): FleetResult {
  const nf = normalizeFleet(fleet);
  const def = BOT_BY_ID[id];
  const st = nf.bots[id];
  if (!def || !st || st.owned) return { fleet: nf, ok: false };
  if (st.fragments < def.unlockFragments) return { fleet: nf, ok: false, reason: "fragments" };
  const next = { ...st, owned: true, active: true, fragments: st.fragments - def.unlockFragments };
  return { fleet: { ...nf, bots: { ...nf.bots, [id]: next } }, ok: true };
}

export function upgradeBot(fleet: FleetState, id: string, hex: number): FleetResult {
  const nf = normalizeFleet(fleet);
  const def = BOT_BY_ID[id];
  const st = nf.bots[id];
  if (!def || !st || !st.owned || isMaxed(st.lvl)) return { fleet: nf, ok: false };
  const cost = upgradeCost(def, st.lvl, st.stars);
  if (hex < cost) return { fleet: nf, ok: false, reason: "hex" };
  return { fleet: { ...nf, bots: { ...nf.bots, [id]: { ...st, lvl: st.lvl + 1 } } }, ok: true, spentHex: cost };
}

export function canMerge(st: BotState): boolean {
  return st.owned && st.stars < BOTS_BALANCE.maxStars && st.copies >= BOTS_BALANCE.mergeCopiesRequired;
}

export function mergeBot(fleet: FleetState, id: string): FleetResult {
  const nf = normalizeFleet(fleet);
  const st = nf.bots[id];
  if (!st || !canMerge(st)) return { fleet: nf, ok: false, reason: "copies" };
  const nextStars = Math.min(5, st.stars + 1) as 1 | 2 | 3 | 4 | 5;
  return { fleet: { ...nf, bots: { ...nf.bots, [id]: { ...st, stars: nextStars, copies: st.copies - BOTS_BALANCE.mergeCopiesRequired, lvl: 1 } } }, ok: true };
}

export function toggleBot(fleet: FleetState, id: string): FleetState {
  const nf = normalizeFleet(fleet);
  const st = nf.bots[id];
  if (!st || !st.owned) return nf;
  return { ...nf, bots: { ...nf.bots, [id]: { ...st, active: !st.active } } };
}

export function collectOffline(fleet: FleetState, now: number): { fleet: FleetState; hex: number } {
  const nf = normalizeFleet(fleet);
  const elapsed = Math.max(0, (now - (nf.lastSeen ?? now)) / 1000);
  const capped = Math.min(elapsed, BOTS_BALANCE.offlineCapSeconds);
  const rate = totalRate(nf);
  const hex = Math.floor(Number.isFinite(rate) ? rate * capped : 0);
  return { fleet: { ...nf, lastSeen: now }, hex };
}
