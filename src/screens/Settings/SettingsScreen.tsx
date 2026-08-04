import type { SettingsProps } from "./Settings.types";
import "./Settings.css";

export function SettingsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: SettingsProps) {
  return (
    <section className="st-screen">
      <div className="st-bg-grid" />
      <header className="st-hud">
        <div>
          <p className="st-kicker">HEXIUM · SETTINGS</p>
          <h1>Settings</h1>
        </div>
        <div className="st-resources">
          <span className="st-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="st-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="st-content">
        <div className="st-placeholder-orb">⚙</div>
        <h2>Settings</h2>
        <p>Підключи модуль <b>Settings</b> для повного функціоналу.</p>
        <div className="st-neon-line" />
      </main>
    </section>
  );
}

export default SettingsScreen;
