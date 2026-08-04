/* ═══════════════════════════════════════════════════════════
   useGlobalEconomy — drives the unified economy from ONE place.

   Mounted once (in ScreenRouter, which is always rendered) so passive
   income accrues on EVERY screen, not only the Reactor / Bots screens.

   Responsibilities:
     1. Grant unified offline income once on load.
     2. Tick total HEX/sec into global currency every second.
     3. Expose the live breakdown for the Economy HUD.
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import type { HexiumAction } from "../../app/core/hexiumTypes";

import {
  computeEconomy,
  computeOffline,
  writeLastSeen,
  ECONOMY_TICK_MS,
  type EconomyBreakdown,
} from "../../game/economy/economyEngine";

export type OfflineReport = { hex: number; seconds: number } | null;

const EMPTY: EconomyBreakdown = {
  reactor: 0, bots: 0, network: 0, booster: 0, total: 0, base: 0,
  networkPct: 0, boosterMult: 1, activeBoosterIds: [],
  shares: { reactor: 0, bots: 0, network: 0, booster: 0 },
};

export function useGlobalEconomy(dispatch: React.Dispatch<HexiumAction>) {
  const [breakdown, setBreakdown] = useState<EconomyBreakdown>(EMPTY);
  const [offline, setOffline] = useState<OfflineReport>(null);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  const lastTickRef = useRef<number>(Date.now());

  /* ── 1. Unified offline income (once) ── */
  useEffect(() => {
    const now = Date.now();
    const { hex, seconds } = computeOffline(now);
    if (hex > 0 && seconds > 5) {
      dispatchRef.current({ type: "ADD_CURRENCY", currency: "hex", amount: hex });
      setOffline({ hex, seconds });
    }
    writeLastSeen(now);
    lastTickRef.current = now;
    setBreakdown(computeEconomy(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 2. Passive accrual tick ── */
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      const dt = Math.max(0, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      const b = computeEconomy(now);
      setBreakdown(b);

      if (b.total > 0 && dt > 0) {
        dispatchRef.current({ type: "ADD_CURRENCY", currency: "hex", amount: b.total * dt });
      }
      writeLastSeen(now);
    }, ECONOMY_TICK_MS);
    return () => clearInterval(iv);
  }, []);

  /* ── 3. Keep clock fresh when tab is hidden/closed ── */
  useEffect(() => {
    const onHide = () => writeLastSeen(Date.now());
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, []);

  const dismissOffline = () => setOffline(null);
  return { breakdown, offline, dismissOffline };
}
