import { useMemo, useState } from "react";
import type { DailyRewardKind, DailyRewardsProps } from "./DailyRewards.types";
import "./DailyRewards.css";

const DAILY_REWARDS_KEY = "hexium_daily_rewards_mvp_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

type DailyRewardState = {
  streakDay: number;
  lastClaimedAt: number | null;
  bestStreak: number;
};

type RewardDay = {
  day: number;
  title: string;
  rewards: DailyRewardKind[];
};

const DEFAULT_STATE: DailyRewardState = {
  streakDay: 1,
  lastClaimedAt: null,
  bestStreak: 0,
};

const REWARD_TRACK: RewardDay[] = [
  { day: 1, title: "Ignition Gift", rewards: [{ type: "hex", amount: 100 }] },
  { day: 2, title: "Core Charge", rewards: [{ type: "hex", amount: 250 }] },
  { day: 3, title: "Basic Case", rewards: [{ type: "case", caseType: "basic", amount: 1 }] },
  { day: 4, title: "Mining Cache", rewards: [{ type: "hex", amount: 500 }] },
  { day: 5, title: "Shard Signal", rewards: [{ type: "shards", amount: 5 }] },
  { day: 6, title: "Reactor Surge", rewards: [{ type: "hex", amount: 750 }] },
  {
    day: 7,
    title: "Weekly Vault",
    rewards: [
      { type: "case", caseType: "advanced", amount: 1 },
      { type: "hex", amount: 1000 },
    ],
  },
];

function loadDailyState(): DailyRewardState {
  try {
    const raw = localStorage.getItem(DAILY_REWARDS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DailyRewardState>;
    return {
      streakDay: Math.min(7, Math.max(1, Number(parsed.streakDay) || 1)),
      lastClaimedAt: typeof parsed.lastClaimedAt === "number" ? parsed.lastClaimedAt : null,
      bestStreak: Math.max(0, Number(parsed.bestStreak) || 0),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveDailyState(state: DailyRewardState) {
  try {
    localStorage.setItem(DAILY_REWARDS_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

function formatReward(reward: DailyRewardKind): string {
  if (reward.type === "hex") return `+${reward.amount.toLocaleString()} HEX`;
  if (reward.type === "shards") return `+${reward.amount.toLocaleString()} SHARDS`;
  return `+${reward.amount} ${reward.caseType.toUpperCase()} CASE`;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function toGameReward(reward: DailyRewardKind) {
  if (reward.type === "case") {
    return { type: "case" as const, caseType: reward.caseType, amount: reward.amount };
  }
  return reward;
}

export function DailyRewardsScreen({
  hex = 0,
  shards = 0,
  dispatch,
}: DailyRewardsProps) {
  const [daily, setDaily] = useState<DailyRewardState>(loadDailyState);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  const nextClaimAt = daily.lastClaimedAt ? daily.lastClaimedAt + DAY_MS : 0;
  const canClaim = !daily.lastClaimedAt || now >= nextClaimAt;
  const currentReward = REWARD_TRACK[daily.streakDay - 1] ?? REWARD_TRACK[0];

  const totalTrackValue = useMemo(
    () => REWARD_TRACK.flatMap((item) => item.rewards).map(formatReward).join(" · "),
    [],
  );

  const claim = () => {
    if (!canClaim || !dispatch) return;

    for (const reward of currentReward.rewards) {
      dispatch({ type: "ADD_REWARD", reward: toGameReward(reward), source: "daily_rewards" });
    }

    const nextDay = daily.streakDay >= 7 ? 1 : daily.streakDay + 1;
    const nextState: DailyRewardState = {
      streakDay: nextDay,
      lastClaimedAt: Date.now(),
      bestStreak: Math.max(daily.bestStreak, daily.streakDay),
    };

    saveDailyState(nextState);
    setDaily(nextState);
    setNow(Date.now());
    setToast(`Claimed: ${currentReward.rewards.map(formatReward).join(" + ")}`);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <section className="dr-screen">
      <div className="dr-bg-grid" />
      <header className="dr-hud">
        <div>
          <p className="dr-kicker">HEXIUM · DAILY REWARDS</p>
          <h1>Daily Rewards</h1>
          <span className="dr-subtitle">7-day claim calendar for the MVP reactor loop.</span>
        </div>
        <div className="dr-resources">
          <span className="dr-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="dr-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="dr-content">
        <section className="dr-banner">
          <div>
            <p className="dr-kicker">CURRENT STREAK</p>
            <h2>Day {daily.streakDay} / 7</h2>
            <p>Best streak: {daily.bestStreak} days</p>
          </div>
          <button className="dr-claim" type="button" onClick={claim} disabled={!canClaim || !dispatch}>
            {canClaim ? "CLAIM TODAY" : `NEXT IN ${formatTime(nextClaimAt - now)}`}
          </button>
        </section>

        <section className="dr-track" aria-label="Daily reward track">
          {REWARD_TRACK.map((rewardDay) => {
            const isCurrent = rewardDay.day === daily.streakDay;
            const isPast = daily.lastClaimedAt !== null && rewardDay.day < daily.streakDay;
            return (
              <article
                key={rewardDay.day}
                className={`dr-card ${isCurrent ? "is-current" : ""} ${isPast ? "is-past" : ""}`}
              >
                <div className="dr-day">DAY {rewardDay.day}</div>
                <h3>{rewardDay.title}</h3>
                <div className="dr-card-rewards">
                  {rewardDay.rewards.map((reward, index) => (
                    <span key={`${rewardDay.day}-${index}`}>{formatReward(reward)}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <p className="dr-footer-note">Full weekly loop: {totalTrackValue}</p>
      </main>

      {toast && <div className="dr-toast">{toast}</div>}
    </section>
  );
}

export default DailyRewardsScreen;
