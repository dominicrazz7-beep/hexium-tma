/* Network — balance constants + formatting */

export const NETWORK_BALANCE = {
  STORAGE_KEY: "hexium_network_state_v1",
  /* online-node simulation */
  SIM_TICK_MS: 1600,           // how often online counts / hashrate refresh
  NODE_JITTER: 0.012,          // ±1.2% wobble on each sector's node count per tick
  ACTIVITY_LIMIT: 6,           // rows kept in the live activity feed
  /* hashrate model */
  HASHRATE_PER_NODE: 0.05,     // TH/s contributed per online node (display only)
  GLOBAL_BASE_PH: 2.41,        // PH/s baseline shown in the hero readout
  /* player rank model (cosmetic, derived from hex) */
  RANK_BASE: 14,
} as const;

/* Compact number formatter: 1.2K / 3.4M / 5.1B */
export function fmt(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2).replace(/\.0+$/, "") + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return Math.round(n).toString();
}

/* Thousands separators for whole counts (online nodes etc.) */
export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/* Hashrate readout with adaptive unit (TH/s ↔ PH/s). */
export function fmtHashrate(thps: number): string {
  if (thps >= 1000) return (thps / 1000).toFixed(2) + " PH/s";
  return thps.toFixed(1) + " TH/s";
}
