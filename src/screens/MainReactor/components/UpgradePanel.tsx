/* ═══════════════════════════════════════════════════════
   UpgradePanel — List of purchasable reactor upgrades
   ═══════════════════════════════════════════════════════ */
import type { UpgradeDisplayItem, UpgradeKey } from "../MainReactor.types";
import "./UpgradePanel.css";

type UpgradePanelProps = {
  upgrades: UpgradeDisplayItem[];
  onPurchase: (key: UpgradeKey) => void;
};

export default function UpgradePanel({ upgrades, onPurchase }: UpgradePanelProps) {
  return (
    <section className="mr-upgrades">
      <h3 className="mr-upgrades-title">
        <span className="mr-upgrades-icon">⬆️</span> Апгрейди
      </h3>
      <div className="mr-upgrades-list">
        {upgrades.map((upg) => {
          const isMaxed = upg.level >= upg.maxLevel;
          return (
            <button
              key={upg.key}
              className={`mr-upgrade-card ${
                isMaxed
                  ? "mr-upgrade-maxed"
                  : upg.canAfford
                    ? "mr-upgrade-available"
                    : "mr-upgrade-locked"
              }`}
              onClick={() => !isMaxed && upg.canAfford && onPurchase(upg.key)}
              disabled={isMaxed || !upg.canAfford}
            >
              <div className="mr-upgrade-header">
                <span className="mr-upgrade-emoji">{upg.icon}</span>
                <div className="mr-upgrade-info">
                  <span className="mr-upgrade-name">{upg.label}</span>
                  <span className="mr-upgrade-desc">{upg.description}</span>
                </div>
                <span className="mr-upgrade-level">
                  {isMaxed ? "MAX" : `${upg.level}/${upg.maxLevel}`}
                </span>
              </div>
              <div className="mr-upgrade-footer">
                {!isMaxed && (
                  <>
                    <span className="mr-upgrade-value">
                      {upg.currentValue.toFixed(1)} → {upg.nextValue.toFixed(1)}
                    </span>
                    <span className="mr-upgrade-cost">
                      ⛏ {upg.cost.toLocaleString()} HEX
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
