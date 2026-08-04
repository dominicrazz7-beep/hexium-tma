/* ═══════════════════════════════════════════════════════
   CorporationScreen — Coming Soon
   ═══════════════════════════════════════════════════════ */
import type { CorporationProps } from "./Corporation.types";
import "./Corporation.css";

export function CorporationScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: CorporationProps) {
  return (
    <section className="corp-screen">
      <div className="corp-bg-grid" />
      <header className="corp-hud">
        <div>
          <p className="corp-kicker">HEXIUM · CORPORATION</p>
          <h1>Corporation</h1>
          <p className="corp-sub">Join a corporation for shared bonuses</p>
        </div>
        <div className="corp-resources">
          <span className="corp-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="corp-pill"><b>◆</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="corp-content">
        <div className="corp-empty">
          <span className="corp-empty-icon">👑</span>
          <h2>Coming Soon</h2>
          <p>Corporation system is under development. Join a corporation to earn shared HEX, Research, and Expedition bonuses.</p>
          <div className="corp-neon-line" />
        </div>
      </main>

      <button className="corp-back-btn" onClick={() => onNavigate?.("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default CorporationScreen;
