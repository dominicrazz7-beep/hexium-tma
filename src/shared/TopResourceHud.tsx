import type { GameCurrency } from "../app/core/hexiumTypes";
import "./TopResourceHud.css";

type TopResourceHudProps = {
  currencies: GameCurrency;
};

function fmt(v: number) {
  return new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(v);
}

export default function TopResourceHud({ currencies }: TopResourceHudProps) {
  return (
    <header className="hx-topbar">
      <div>
        <span className="hx-eyebrow">HEXIUM CLICKER</span>
        <h1 className="hx-title">v0.2.0-beta.1</h1>
      </div>
      <div className="hx-wallet">
        <span className="hx-wallet-item"><b>HEX</b> {fmt(currencies.hex)}</span>
        <span className="hx-wallet-item"><b>SHARDS</b> {fmt(currencies.shards)}</span>
      </div>
    </header>
  );
}
