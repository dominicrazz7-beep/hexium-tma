/* ═══════════════════════════════════════════════════════
   FloatingRewards — Animated +HEX particles on tap
   ═══════════════════════════════════════════════════════ */
import type { FloatingReward } from "../MainReactor.types";
import "./FloatingRewards.css";

type FloatingRewardsProps = {
  rewards: FloatingReward[];
};

export default function FloatingRewards({ rewards }: FloatingRewardsProps) {
  return (
    <div className="mr-floating-layer" aria-hidden="true">
      {rewards.map((r) => {
        const classes = [
          "mr-float-num",
          r.cssClass,
          r.isTurbo ? "mr-float-turbo" : "",
        ].filter(Boolean).join(" ");

        return (
          <span
            key={r.id}
            className={classes}
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
            }}
          >
            {r.luckLabel && (
              <span className="mr-float-tier-label">{r.luckLabel}</span>
            )}
            +{r.amount.toLocaleString()}
          </span>
        );
      })}
    </div>
  );
}
