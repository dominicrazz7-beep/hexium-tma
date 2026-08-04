/* ═══════════════════════════════════════════════════════
   EnergyBar — Energy progress bar with regen indicator
   ═══════════════════════════════════════════════════════ */
import "./EnergyBar.css";

type EnergyBarProps = {
  energy: number;
  maxEnergy: number;
  percent: number;
};

export default function EnergyBar({ energy, maxEnergy, percent }: EnergyBarProps) {
  const isLow = percent < 20;
  const isFull = percent >= 100;

  return (
    <div className="mr-energy-container">
      <div className="mr-energy-label">
        <span className="mr-energy-icon">⚡</span>
        <span className="mr-energy-text">
          {Math.floor(energy)}/{maxEnergy}
        </span>
        {isFull && <span className="mr-energy-full">MAX</span>}
      </div>
      <div className="mr-energy-track">
        <div
          className={`mr-energy-fill ${isLow ? "mr-energy-low" : ""} ${isFull ? "mr-energy-max" : ""}`}
          style={{ width: `${percent}%` }}
        />
        {/* Animated regen shimmer */}
        {!isFull && <div className="mr-energy-regen-shimmer" />}
      </div>
    </div>
  );
}
