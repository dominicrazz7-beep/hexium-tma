import type { AchievementsProps } from "./Achievements.types";
import "./Achievements.css";

export function AchievementsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: AchievementsProps) {
  return (
    <section className="ach-screen">
      <div className="ach-bg-grid" />
      <header className="ach-hud">
        <div>
          <p className="ach-kicker">HEXIUM · ACHIEVEMENTS</p>
          <h1>Achievements</h1>
        </div>
        <div className="ach-resources">
          <span className="ach-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="ach-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="ach-content">
        <div className="ach-placeholder-orb">🎖</div>
        <h2>Achievements</h2>
        <p>Підключи модуль <b>Achievements</b> для повного функціоналу.</p>
        <div className="ach-neon-line" />
      </main>
    </section>
  );
}

export default AchievementsScreen;
