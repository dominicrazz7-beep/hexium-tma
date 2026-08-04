/* ═══════════════ HEXIUM · Profile — balance / formatters ═══════════════ */

export const PROFILE_BALANCE = {
  /** how many achievements per row (3-col grid) */
  ACHV_COLUMNS: 3,
} as const;

/** Compact number: 1.2M / 12.3K / 980 */
export function fmtCompact(n: number): string {
  const v = Math.floor(n);
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}

/** Full grouped number: 1,200,000 */
export function fmtFull(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

/** Pick formatter based on the compactNumbers setting */
export function fmtNum(n: number, compact: boolean): string {
  return compact ? fmtCompact(n) : fmtFull(n);
}

/** Format hashrate like the network screen (H/s → PH/s) */
export function fmtHashrate(hs: number): string {
  if (hs >= 1_000_000_000) return (hs / 1_000_000_000).toFixed(2) + " PH/s";
  if (hs >= 1_000_000) return (hs / 1_000_000).toFixed(2) + " TH/s";
  if (hs >= 1_000) return (hs / 1_000).toFixed(2) + " GH/s";
  return hs.toFixed(1) + " H/s";
}

/** Deterministic operator number from a stable id string. */
export function operatorNumber(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return "#" + (1000 + (h % 9000)).toString();
}
