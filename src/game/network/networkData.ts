/* Network — data / initial state
 * "Distributed Grid" — global mining mesh. No backend: leaderboard + sectors +
 * referrals are simulated client-side and persisted to localStorage for testing.
 */

export type SectorStatus = "online" | "syncing" | "offline";

export type NetworkSector = {
  id: string;
  code: string;          // short region code e.g. "EU-W"
  name: string;          // human label
  region: string;        // flag-ish glyph
  baseNodes: number;     // nominal online nodes (sim fluctuates around this)
  baseHashrate: number;  // TH/s nominal
  status: SectorStatus;
  boost: number;         // hashrate % bonus granted when player connects
};

export type LeaderEntry = {
  rank: number;
  name: string;
  hex: number;
  lvl: number;
  you?: boolean;
};

export type Referral = {
  id: string;
  name: string;
  lvl: number;
  joinedAt: number;
  bonusPct: number;      // hashrate bonus this referral contributes
};

export type ActivityEvent = {
  id: string;
  kind: "join" | "mine" | "sync" | "boost";
  text: string;
  sector: string;
  at: number;
};

export type NetworkState = {
  referralCode: string;
  referrals: Referral[];
  connectedSectors: string[];
  lastSeen: number;
};

/* 6 global network sectors (regions) shown as the node mesh / sector grid. */
export const SECTORS: NetworkSector[] = [
  { id: "eu_w",  code: "EU-W",  name: "Europe West",      region: "🛰", baseNodes: 12840, baseHashrate: 642, status: "online",  boost: 4 },
  { id: "na_e",  code: "NA-E",  name: "North America East", region: "📡", baseNodes: 15120, baseHashrate: 781, status: "online",  boost: 5 },
  { id: "as_p",  code: "AS-P",  name: "Asia Pacific",     region: "🌐", baseNodes: 18460, baseHashrate: 902, status: "online",  boost: 6 },
  { id: "sa_c",  code: "SA-C",  name: "South America",    region: "🔗", baseNodes:  6230, baseHashrate: 318, status: "syncing", boost: 3 },
  { id: "af_n",  code: "AF-N",  name: "Africa North",     region: "📶", baseNodes:  4110, baseHashrate: 196, status: "syncing", boost: 3 },
  { id: "oc_s",  code: "OC-S",  name: "Oceania South",    region: "🛜", baseNodes:  2980, baseHashrate: 141, status: "online",  boost: 2 },
];

/* Top of the global leaderboard (player rows are spliced in by logic). */
export const LEADER_SEED: Omit<LeaderEntry, "rank">[] = [
  { name: "Quantum_Lord", hex: 8.4e9, lvl: 58 },
  { name: "NeonMiner",    hex: 5.1e9, lvl: 51 },
  { name: "hexwhale",     hex: 3.9e9, lvl: 47 },
  { name: "0xPlasma",     hex: 2.2e9, lvl: 43 },
  { name: "CoreBreaker",  hex: 1.4e9, lvl: 39 },
];

/* Names used by the online-node + referral simulation. */
export const SIM_NAMES = [
  "neon_dev", "hexcat", "0xVold", "miner_ai", "plasma_kid", "qbit", "shard_hunter",
  "voidrunner", "cryo_node", "lumen", "byte_forge", " on_chain", "darkpool", "nova_hx",
];

/* Referral milestone rewards (cosmetic copy, simulated). */
export const REFERRAL_REWARD_PCT = 2;        // each accepted invite = +2% hashrate
export const REFERRAL_MILESTONES = [
  { count: 1,  label: "First Link",   reward: "+2% hashrate" },
  { count: 5,  label: "Connector",    reward: "+10% · 5,000 HEX" },
  { count: 10, label: "Hub Operator", reward: "+20% · Rare Bot" },
  { count: 25, label: "Grid Architect", reward: "+50% · Quantum Vault" },
];

export const networkInitialState: NetworkState = {
  referralCode: "",
  referrals: [],
  connectedSectors: [],
  lastSeen: 0,
};
