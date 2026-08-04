import type { QuantumLabProps } from "./QuantumLab.types";
import "./QuantumLab.css";

export function QuantumLabScreen({
  hex = 0,
  shards = 0,
  onNavigate,
}: QuantumLabProps) {
  return (
    <section className="ql-screen">
      <div className="ql-bg-grid" />
      <header className="ql-hud">
        <div>
          <p className="ql-kicker">HEXIUM · QUANTUM LAB</p>
          <h1>Quantum Lab</h1>
        </div>
        <div className="ql-resources">
          <span className="ql-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="ql-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="ql-content">
        <div className="ql-placeholder-orb">☢</div>
        <h2>Quantum Lab</h2>
        <p>Підключи модуль <b>QuantumLab</b> для повного функціоналу.</p>
        <div className="ql-neon-line" />
      </main>
    </section>
  );
}

export default QuantumLabScreen;
