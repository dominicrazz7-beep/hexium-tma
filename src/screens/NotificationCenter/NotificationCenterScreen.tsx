import type { NotificationCenterProps } from "./NotificationCenter.types";
import "./NotificationCenter.css";

export function NotificationCenterScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: NotificationCenterProps) {
  return (
    <section className="ntc-screen">
      <div className="ntc-bg-grid" />
      <header className="ntc-hud">
        <div>
          <p className="ntc-kicker">HEXIUM · NOTIFICATION CENTER</p>
          <h1>Notification Center</h1>
        </div>
        <div className="ntc-resources">
          <span className="ntc-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="ntc-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="ntc-content">
        <div className="ntc-placeholder-orb">🔔</div>
        <h2>Notification Center</h2>
        <p>Підключи модуль <b>NotificationCenter</b> для повного функціоналу.</p>
        <div className="ntc-neon-line" />
      </main>
    </section>
  );
}

export default NotificationCenterScreen;
