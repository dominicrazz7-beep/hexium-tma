/* ═══════════════════════════════════════════════════════════
   EconomyHud — global income overlay.
   Shows unified Total HEX/sec + where it comes from
   (Reactor % · Bots % · Network % · Booster %).
   Floating, collapsible, present on every screen.
   ═══════════════════════════════════════════════════════════ */

import { useState } from "react";
import { createPortal } from "react-dom";
import type { EconomyBreakdown } from "../../game/economy/economyEngine";
import type { OfflineReport } from "./useGlobalEconomy";
import "./EconomyHud.css";

function fmt(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "K";
  if (a >= 100) return Math.round(n).toString();
  return n.toFixed(1);
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function dur(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}год ${m}хв`;
  if (m > 0) return `${m}хв`;
  return `${Math.floor(seconds)}с`;
}

type Source = { key: string; label: string; icon: string; value: number; share: number; cls: string };

export default function EconomyHud({
  breakdown,
  offline,
  onDismissOffline,
}: {
  breakdown: EconomyBreakdown;
  offline: OfflineReport;
  onDismissOffline: () => void;
}) {
  const [open, setOpen] = useState(false);

  const sources: Source[] = [
    { key: "reactor", label: "Reactor", icon: "⚛", value: breakdown.reactor, share: breakdown.shares.reactor, cls: "eh-reactor" },
    { key: "bots", label: "HEX-Bots", icon: "🤖", value: breakdown.bots, share: breakdown.shares.bots, cls: "eh-bots" },
    { key: "network", label: "Network", icon: "🌐", value: breakdown.network, share: breakdown.shares.network, cls: "eh-network" },
    { key: "booster", label: "Boosters", icon: "⚡", value: breakdown.booster, share: breakdown.shares.booster, cls: "eh-booster" },
  ];

  const overlay = (
    <>
      {/* Offline income banner */}
      {offline && offline.hex > 0 && (
        <div className="eh-offline" role="status">
          <div className="eh-offline-ic">🛰</div>
          <div className="eh-offline-tx">
            <b>+{fmt(offline.hex)} HEX</b>
            <span>зібрано офлайн · {dur(offline.seconds)}</span>
          </div>
          <button className="eh-offline-x" onClick={onDismissOffline} aria-label="dismiss">✕</button>
        </div>
      )}

      <div className={`eh-wrap ${open ? "open" : ""}`}>
        {/* Collapsed chip */}
        <button className="eh-chip" onClick={() => setOpen((v) => !v)}>
          <span className="eh-chip-pulse" />
          <span className="eh-chip-ic">⚡</span>
          <span className="eh-chip-val">{fmt(breakdown.total)}<small>/s</small></span>
          <span className="eh-chip-caret">{open ? "▾" : "▸"}</span>
        </button>

        {/* Expanded panel */}
        {open && (
          <div className="eh-panel">
            <div className="eh-panel-head">
              <span className="eh-panel-kicker">UNIFIED ECONOMY</span>
              <span className="eh-panel-total">{fmt(breakdown.total)} <small>HEX/s</small></span>
            </div>

            {/* Composite share bar */}
            <div className="eh-bar">
              {sources.map((s) =>
                s.share > 0.001 ? (
                  <span key={s.key} className={`eh-bar-seg ${s.cls}`} style={{ width: pct(s.share) }} />
                ) : null,
              )}
            </div>

            {/* Source rows */}
            <div className="eh-rows">
              {sources.map((s) => (
                <div key={s.key} className="eh-row">
                  <span className={`eh-dot ${s.cls}`} />
                  <span className="eh-row-ic">{s.icon}</span>
                  <span className="eh-row-label">{s.label}</span>
                  <span className="eh-row-pct">{pct(s.share)}</span>
                  <span className="eh-row-val">{fmt(s.value)}/s</span>
                </div>
              ))}
            </div>

            {/* Multiplier footer */}
            <div className="eh-foot">
              <span className={`eh-tag ${breakdown.networkPct > 0 ? "on" : ""}`}>🌐 +{breakdown.networkPct.toFixed(0)}%</span>
              <span className={`eh-tag ${breakdown.boosterMult > 1 ? "on" : ""}`}>⚡ ×{breakdown.boosterMult.toFixed(breakdown.boosterMult % 1 ? 1 : 0)}</span>
              <span className="eh-foot-base">base {fmt(breakdown.base)}/s</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (typeof document === "undefined") return overlay;

  return createPortal(overlay, document.body);
}
