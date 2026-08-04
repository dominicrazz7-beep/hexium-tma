import type { PlayerCoreState } from "../app/core/hexiumTypes";
import "./StatusGrid.css";

type StatusGridProps = {
  player: PlayerCoreState;
};

export default function StatusGrid({ player }: StatusGridProps) {
  return (
    <div className="hx-status-grid">
      <div className="hx-status-card"><b>PLAYER</b><span>{player.username} · LVL {player.level}</span></div>
      <div className="hx-status-card"><b>ENERGY</b><span>{player.energy}/{player.maxEnergy}</span></div>
      <div className="hx-status-card"><b>TOTAL HEX</b><span>{Math.floor(player.totalHexMined).toLocaleString()}</span></div>
      <div className="hx-status-card"><b>HASHRATE</b><span>{player.hashrate} H/s</span></div>
    </div>
  );
}
