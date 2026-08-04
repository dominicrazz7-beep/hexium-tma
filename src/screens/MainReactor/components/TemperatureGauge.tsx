/* ═══════════════════════════════════════════════════════
   TemperatureGauge — Reactor heat indicator
   ═══════════════════════════════════════════════════════ */
import "./TemperatureGauge.css";

type TemperatureGaugeProps = {
  temperature: number;
  maxTemperature: number;
  percent: number;
  colorClass: string;
  isOverheated: boolean;
};

export default function TemperatureGauge({
  temperature,
  maxTemperature,
  percent,
  colorClass,
  isOverheated,
}: TemperatureGaugeProps) {
  return (
    <div className="mr-temp-container">
      <div className="mr-temp-label">
        <span className="mr-temp-icon">🌡️</span>
        <span className="mr-temp-text">
          {Math.floor(temperature)}/{maxTemperature}
        </span>
        {isOverheated && <span className="mr-temp-warn">OVERHEAT!</span>}
      </div>
      <div className="mr-temp-track">
        <div
          className={`mr-temp-fill ${colorClass} ${isOverheated ? "mr-temp-overheat-fill" : ""}`}
          style={{ width: `${percent}%` }}
        />
        {/* Danger zone marker at 80% */}
        <div className="mr-temp-danger-marker" />
      </div>
    </div>
  );
}
