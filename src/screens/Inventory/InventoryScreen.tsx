import type { InventoryProps } from "./Inventory.types";
import "./Inventory.css";

export function InventoryScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: InventoryProps) {
  return (
    <section className="inv-screen">
      <div className="inv-bg-grid" />
      <header className="inv-hud">
        <div>
          <p className="inv-kicker">HEXIUM · INVENTORY</p>
          <h1>Inventory</h1>
        </div>
        <div className="inv-resources">
          <span className="inv-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="inv-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="inv-content">
        <div className="inv-placeholder-orb">🎒</div>
        <h2>Inventory</h2>
        <p>Підключи модуль <b>Inventory</b> для повного функціоналу.</p>
        <div className="inv-neon-line" />
      </main>
    </section>
  );
}

export default InventoryScreen;
