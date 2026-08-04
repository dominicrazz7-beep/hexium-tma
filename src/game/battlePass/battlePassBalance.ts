/* ═══════════════════════════════════════════════════════
   BATTLE PASS — balance constants
   ═══════════════════════════════════════════════════════ */

export const BATTLEPASS_BALANCE = {
  storageKey: "hexium_battlepass_state_v1",
  premiumCostShards: 500,
  xpPerTap: 1,
  xpPerUpgrade: 15,
  xpPerCaseOpen: 25,
  xpPerBotUnlock: 40,
  xpPerResearchTier: 30,
} as const;

export function fmtShort(n: number): string {
  if (!isFinite(n)) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 10e6 ? 0 : 1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 10e3 ? 0 : 1) + "K";
  return Math.floor(n).toLocaleString();
}
