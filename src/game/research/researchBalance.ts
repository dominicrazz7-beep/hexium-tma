/* ═══════════════ HEXIUM · Research Center — balance ═══════════════ */

export const RESEARCH_BALANCE = {
  maxConcurrentResearch: 1,
  storageKey: "hexium_research_state_v1",
} as const;

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatCost(hex: number, shards: number): string {
  const parts: string[] = [];
  if (hex > 0) parts.push(`${hex.toLocaleString()} HEX`);
  if (shards > 0) parts.push(`${shards} SHARDS`);
  return parts.join(" + ");
}
