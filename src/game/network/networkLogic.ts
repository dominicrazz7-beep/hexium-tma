/* Network — game logic (pure, no React) */

import {
  SECTORS, LEADER_SEED, SIM_NAMES, REFERRAL_REWARD_PCT, REFERRAL_MILESTONES,
  networkInitialState,
  type NetworkState, type NetworkSector, type SectorStatus,
  type LeaderEntry, type Referral, type ActivityEvent,
} from "./networkData";
import { NETWORK_BALANCE, fmt } from "./networkBalance";

const KEY = NETWORK_BALANCE.STORAGE_KEY;

/* ── persistence ── */
export function loadNetwork(): NetworkState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return ensureCode({ ...networkInitialState });
    const parsed = JSON.parse(raw) as Partial<NetworkState>;
    return ensureCode({
      referralCode: parsed.referralCode || "",
      referrals: Array.isArray(parsed.referrals) ? parsed.referrals : [],
      connectedSectors: Array.isArray(parsed.connectedSectors) ? parsed.connectedSectors : [],
      lastSeen: parsed.lastSeen || 0,
    });
  } catch {
    return ensureCode({ ...networkInitialState });
  }
}

export function saveNetwork(state: NetworkState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, lastSeen: Date.now() }));
  } catch {
    /* ignore quota / private mode */
  }
}

function ensureCode(state: NetworkState): NetworkState {
  if (!state.referralCode) state.referralCode = generateCode();
  return state;
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "HX-" + s;
}

/* ── online-node simulation ──
 * Returns a fresh snapshot of every sector with a jittered online-node count and
 * derived hashrate. Pure: caller passes the current tick seed (Date.now()).
 */
export type SectorSnapshot = NetworkSector & { nodesOnline: number; hashrate: number };

export function simulateSectors(seed: number, connected: string[]): SectorSnapshot[] {
  return SECTORS.map((s, i) => {
    // smooth pseudo-random wobble per sector using sine of seed
    const phase = Math.sin(seed / 4000 + i * 1.7);
    const jitter = 1 + phase * NETWORK_BALANCE.NODE_JITTER;
    const nodesOnline = Math.max(0, Math.round(s.baseNodes * jitter));
    const boosted = connected.includes(s.id);
    const hashrate = s.baseHashrate * jitter * (boosted ? 1 + s.boost / 100 : 1);
    const status: SectorStatus = s.status;
    return { ...s, nodesOnline, hashrate, status };
  });
}

export function totalNodes(snaps: SectorSnapshot[]): number {
  return snaps.reduce((a, s) => a + (s.status === "offline" ? 0 : s.nodesOnline), 0);
}

export function globalHashrate(snaps: SectorSnapshot[]): number {
  // PH/s — sum sector TH/s + flat baseline, converted to PH
  const th = snaps.reduce((a, s) => a + (s.status === "offline" ? 0 : s.hashrate), 0);
  return NETWORK_BALANCE.GLOBAL_BASE_PH + th / 1000;
}

/* ── player rank (cosmetic, derived from hex) ── */
export function networkRank(hex: number): number {
  if (hex >= 1e9) return 3;
  if (hex >= 1e8) return 7;
  if (hex >= 1e7) return Math.max(4, NETWORK_BALANCE.RANK_BASE - 6);
  if (hex >= 1e6) return NETWORK_BALANCE.RANK_BASE - 3;
  return NETWORK_BALANCE.RANK_BASE;
}

/* ── leaderboard with YOU spliced in by hex ── */
export function buildLeaderboard(hex: number, lvl: number): LeaderEntry[] {
  const rank = networkRank(hex);
  const seeded: LeaderEntry[] = LEADER_SEED.map((e, i) => ({ ...e, rank: i + 1 }));
  const neighbours: LeaderEntry[] = [
    { rank: Math.max(rank - 1, 1), name: "plasma_dev", hex: Math.max(hex * 1.7, hex + 5e4), lvl: lvl + 2 },
    { rank, name: "YOU", hex, lvl, you: true },
    { rank: rank + 1, name: "crypto_kid", hex: Math.max(0, Math.floor(hex * 0.62)), lvl: Math.max(1, lvl - 1) },
  ];
  // if player is genuinely top-5, don't duplicate the seed rows below them
  const top = seeded.filter((e) => e.rank < Math.max(rank - 1, 1));
  return [...top, ...neighbours];
}

/* ── referrals (simulated, no backend) ── */
export function addSimReferral(state: NetworkState): NetworkState {
  const name = SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)].trim();
  const ref: Referral = {
    id: "ref_" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    name,
    lvl: 1 + Math.floor(Math.random() * 22),
    joinedAt: Date.now(),
    bonusPct: REFERRAL_REWARD_PCT,
  };
  return { ...state, referrals: [ref, ...state.referrals].slice(0, 50) };
}

export function referralBonusPct(state: NetworkState): number {
  return state.referrals.reduce((a, r) => a + r.bonusPct, 0);
}

export function nextMilestone(count: number) {
  return REFERRAL_MILESTONES.find((m) => count < m.count) ?? REFERRAL_MILESTONES[REFERRAL_MILESTONES.length - 1];
}

/* ── sector connect toggle (small personal hashrate boost) ── */
export function toggleSector(state: NetworkState, sectorId: string): NetworkState {
  const has = state.connectedSectors.includes(sectorId);
  const connectedSectors = has
    ? state.connectedSectors.filter((id) => id !== sectorId)
    : [...state.connectedSectors, sectorId];
  return { ...state, connectedSectors };
}

export function connectedBoostPct(state: NetworkState): number {
  return SECTORS.filter((s) => state.connectedSectors.includes(s.id)).reduce((a, s) => a + s.boost, 0);
}

/* ── activity feed event generator (online-node simulation flavour) ── */
export function makeActivityEvent(seed: number): ActivityEvent {
  const sector = SECTORS[seed % SECTORS.length];
  const name = SIM_NAMES[seed % SIM_NAMES.length].trim();
  const kinds: ActivityEvent["kind"][] = ["join", "mine", "sync", "boost"];
  const kind = kinds[seed % kinds.length];
  const text =
    kind === "join" ? `${name} joined the grid`
    : kind === "mine" ? `${name} mined +${fmt(500 + (seed % 9000))} HEX`
    : kind === "sync" ? `node hx-${(seed % 0xffff).toString(16).padStart(4, "0")} synced`
    : `${name} boosted ${sector.code}`;
  return {
    id: "ev_" + seed.toString(36),
    kind,
    text,
    sector: sector.code,
    at: Date.now(),
  };
}
