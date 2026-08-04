import type { QuantumSectorsProps } from "./QuantumSectors.types";
import "./QuantumSectors.css";

export function QuantumSectorsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: QuantumSectorsProps) {
  return (
    <section className="qs-screen">
      <div className="qs-bg-grid" />
      <header className="qs-hud">
        <div>
          <p className="qs-kicker">HEXIUM · QUANTUM SECTORS</p>
          <h1>Quantum Sectors</h1>
        </div>
        <div className="qs-resources">
          <span className="qs-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="qs-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="qs-content">
        <div className="qs-placeholder-orb">🛰</div>
        <h2>Quantum Sectors</h2>
        <p>Підключи модуль <b>QuantumSectors</b> для повного функціоналу.</p>
        <div className="qs-neon-line" />
      </main>
    </section>
  );
}

export default QuantumSectorsScreen;
