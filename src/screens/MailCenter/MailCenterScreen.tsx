import type { MailCenterProps } from "./MailCenter.types";
import "./MailCenter.css";

export function MailCenterScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: MailCenterProps) {
  return (
    <section className="mc-screen">
      <div className="mc-bg-grid" />
      <header className="mc-hud">
        <div>
          <p className="mc-kicker">HEXIUM · MAIL CENTER</p>
          <h1>Mail Center</h1>
        </div>
        <div className="mc-resources">
          <span className="mc-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="mc-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="mc-content">
        <div className="mc-placeholder-orb">📬</div>
        <h2>Mail Center</h2>
        <p>Підключи модуль <b>MailCenter</b> для повного функціоналу.</p>
        <div className="mc-neon-line" />
      </main>
    </section>
  );
}

export default MailCenterScreen;
