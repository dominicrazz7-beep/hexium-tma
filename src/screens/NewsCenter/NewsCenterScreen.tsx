import type { NewsCenterProps } from "./NewsCenter.types";
import "./NewsCenter.css";

export function NewsCenterScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: NewsCenterProps) {
  return (
    <section className="nc-screen">
      <div className="nc-bg-grid" />
      <header className="nc-hud">
        <div>
          <p className="nc-kicker">HEXIUM · NEWS CENTER</p>
          <h1>News Center</h1>
        </div>
        <div className="nc-resources">
          <span className="nc-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="nc-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="nc-content">
        <div className="nc-placeholder-orb">📰</div>
        <h2>News Center</h2>
        <p>Підключи модуль <b>NewsCenter</b> для повного функціоналу.</p>
        <div className="nc-neon-line" />
      </main>
    </section>
  );
}

export default NewsCenterScreen;
