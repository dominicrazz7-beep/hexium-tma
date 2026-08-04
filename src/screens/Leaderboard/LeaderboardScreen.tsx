import type { LeaderboardProps } from "./Leaderboard.types";
import "./Leaderboard.css";

export function LeaderboardScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: LeaderboardProps) {
  return (
    <section className="lb-screen">
      <div className="lb-bg-grid" />
      <header className="lb-hud">
        <div>
          <p className="lb-kicker">HEXIUM · LEADERBOARD</p>
          <h1>Leaderboard</h1>
        </div>
        <div className="lb-resources">
          <span className="lb-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="lb-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="lb-content">
        <div className="lb-placeholder-orb">🏆</div>
        <h2>Leaderboard</h2>
        <p>Підключи модуль <b>Leaderboard</b> для повного функціоналу.</p>
        <div className="lb-neon-line" />
      </main>
    </section>
  );
}

export default LeaderboardScreen;
