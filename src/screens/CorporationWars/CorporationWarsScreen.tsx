import type { CorporationWarsProps } from "./CorporationWars.types";
import "./CorporationWars.css";

export function CorporationWarsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: CorporationWarsProps) {
  return (
    <section className="cw-screen">
      <div className="cw-bg-grid" />
      <header className="cw-hud">
        <div>
          <p className="cw-kicker">HEXIUM · CORPORATION WARS</p>
          <h1>Corporation Wars</h1>
        </div>
        <div className="cw-resources">
          <span className="cw-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="cw-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="cw-content">
        <div className="cw-placeholder-orb">⚔</div>
        <h2>Corporation Wars</h2>
        <p>Підключи модуль <b>CorporationWars</b> для повного функціоналу.</p>
        <div className="cw-neon-line" />
      </main>
    </section>
  );
}

export default CorporationWarsScreen;
