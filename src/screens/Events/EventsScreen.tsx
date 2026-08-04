import type { EventsProps } from "./Events.types";
import "./Events.css";

export function EventsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: EventsProps) {
  return (
    <section className="ev-screen">
      <div className="ev-bg-grid" />
      <header className="ev-hud">
        <div>
          <p className="ev-kicker">HEXIUM · EVENTS</p>
          <h1>Events</h1>
        </div>
        <div className="ev-resources">
          <span className="ev-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="ev-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="ev-content">
        <div className="ev-placeholder-orb">🎪</div>
        <h2>Events</h2>
        <p>Підключи модуль <b>Events</b> для повного функціоналу.</p>
        <div className="ev-neon-line" />
      </main>
    </section>
  );
}

export default EventsScreen;
