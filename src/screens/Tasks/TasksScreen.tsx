import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameReward } from "../../app/core/hexiumTypes";
import type { TasksProps } from "./Tasks.types";
import "./Tasks.css";

const TASKS_STORAGE_KEY = "hexium_tasks_mvp_v2";
const REACTOR_STORAGE_KEY = "hexium_reactor_state_v1";
const BOTS_STORAGE_KEY = "hexium_bots_state_v1";
const CASES_STORAGE_KEY = "hexium_cases_state_v1";
const SHOP_STORAGE_KEY = "hexium_shop_state_v1";

type TaskKind = "taps" | "reactor_upgrade" | "bot_unlock" | "case_open" | "playtime" | "hex_earned" | "shards_earned" | "research_start" | "bot_deploy" | "daily_claim";

type TaskCategory = "daily" | "progression";

type TaskDef = {
  id: string;
  title: string;
  description: string;
  kind: TaskKind;
  target: number;
  reward: GameReward;
  category: TaskCategory;
  cta?: string;
};

type TasksState = {
  dailyCompleted: Record<string, boolean>;
  progressionCompleted: Record<string, boolean>;
  playSeconds: number;
  lastPlayTickAt: number;
  lastDailyReset: string;
};

type LiveProgress = {
  reactorUpgrades: number;
  botsUnlocked: number;
  casesOpened: number;
  totalHexMined: number;
  shardsEarned: number;
  botsDeployed: number;
  dailyClaims: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const DAILY_TASKS: TaskDef[] = [
  { id: "d-tap-100", title: "Tap 100 Times", description: "Mine HEX with manual taps.", kind: "taps", target: 100, reward: { type: "hex", amount: 150 }, category: "daily", cta: "MINE" },
  { id: "d-tap-500", title: "Tap 500 Times", description: "Push the reactor hard.", kind: "taps", target: 500, reward: { type: "hex", amount: 500 }, category: "daily", cta: "MINE" },
  { id: "d-tap-1000", title: "Tap 1,000 Times", description: "Massive mining session.", kind: "taps", target: 1000, reward: { type: "hex", amount: 800 }, category: "daily", cta: "MINE" },
  { id: "d-upgrade-1", title: "Buy 1 Upgrade", description: "Purchase any reactor upgrade.", kind: "reactor_upgrade", target: 1, reward: { type: "hex", amount: 200 }, category: "daily", cta: "UPGRADE" },
  { id: "d-upgrade-3", title: "Buy 3 Upgrades", description: "Invest in your reactor.", kind: "reactor_upgrade", target: 3, reward: { type: "hex", amount: 400 }, category: "daily", cta: "UPGRADE" },
  { id: "d-case-1", title: "Open 1 Case", description: "Try your luck in Supply Drops.", kind: "case_open", target: 1, reward: { type: "hex", amount: 250 }, category: "daily", cta: "CASES" },
  { id: "d-case-3", title: "Open 3 Cases", description: "Crate hunting spree.", kind: "case_open", target: 3, reward: { type: "shards", amount: 5 }, category: "daily", cta: "CASES" },
  { id: "d-bot-deploy", title: "Deploy a Bot", description: "Activate a HEX-Bot for passive income.", kind: "bot_deploy", target: 1, reward: { type: "hex", amount: 200 }, category: "daily", cta: "BOTS" },
  { id: "d-bot-deploy-3", title: "Deploy 3 Bots", description: "Maximize your fleet output.", kind: "bot_deploy", target: 3, reward: { type: "shards", amount: 4 }, category: "daily", cta: "BOTS" },
  { id: "d-hex-5k", title: "Earn 5,000 HEX", description: "Accumulate HEX from any source.", kind: "hex_earned", target: 5000, reward: { type: "hex", amount: 300 }, category: "daily" },
  { id: "d-hex-20k", title: "Earn 20,000 HEX", description: "Serious mining output.", kind: "hex_earned", target: 20000, reward: { type: "hex", amount: 600 }, category: "daily" },
  { id: "d-hex-50k", title: "Earn 50,000 HEX", description: "Industrial-grade production.", kind: "hex_earned", target: 50000, reward: { type: "shards", amount: 8 }, category: "daily" },
  { id: "d-play-5", title: "Play 5 Minutes", description: "Stay active in the reactor.", kind: "playtime", target: 300, reward: { type: "hex", amount: 100 }, category: "daily" },
  { id: "d-play-15", title: "Play 15 Minutes", description: "Extended session.", kind: "playtime", target: 900, reward: { type: "hex", amount: 250 }, category: "daily" },
  { id: "d-play-30", title: "Play 30 Minutes", description: "Dedicated operator.", kind: "playtime", target: 1800, reward: { type: "hex", amount: 500 }, category: "daily" },
  { id: "d-research", title: "Start Research", description: "Begin a research project.", kind: "research_start", target: 1, reward: { type: "hex", amount: 300 }, category: "daily", cta: "RESEARCH" },
  { id: "d-upgrade-5", title: "Buy 5 Upgrades", description: "Heavy investment day.", kind: "reactor_upgrade", target: 5, reward: { type: "shards", amount: 6 }, category: "daily", cta: "UPGRADE" },
  { id: "d-bot-unlock", title: "Unlock a Bot", description: "Add a new bot to your fleet.", kind: "bot_unlock", target: 1, reward: { type: "shards", amount: 5 }, category: "daily", cta: "BOTS" },
  { id: "d-case-5", title: "Open 5 Cases", description: "Case opening marathon.", kind: "case_open", target: 5, reward: { type: "shards", amount: 10 }, category: "daily", cta: "CASES" },
  { id: "d-hex-100k", title: "Earn 100,000 HEX", description: "Mega mining session.", kind: "hex_earned", target: 100000, reward: { type: "shards", amount: 12 }, category: "daily" },
  { id: "d-tap-2000", title: "Tap 2,000 Times", description: "Finger of steel.", kind: "taps", target: 2000, reward: { type: "shards", amount: 8 }, category: "daily", cta: "MINE" },
  { id: "d-bot-deploy-5", title: "Deploy 5 Bots", description: "Full fleet activation.", kind: "bot_deploy", target: 5, reward: { type: "shards", amount: 8 }, category: "daily", cta: "BOTS" },
  { id: "d-play-60", title: "Play 1 Hour", description: "Marathon session.", kind: "playtime", target: 3600, reward: { type: "shards", amount: 10 }, category: "daily" },
  { id: "d-upgrade-10", title: "Buy 10 Upgrades", description: "Reactor overhaul.", kind: "reactor_upgrade", target: 10, reward: { type: "shards", amount: 12 }, category: "daily", cta: "UPGRADE" },
  { id: "d-hex-200k", title: "Earn 200,000 HEX", description: "Top-tier production.", kind: "hex_earned", target: 200000, reward: { type: "shards", amount: 15 }, category: "daily" },
];

const PROGRESSION_TASKS: TaskDef[] = [
  { id: "p-tap-1k", title: "Tap 1,000 Times", description: "Lifetime tap milestone.", kind: "taps", target: 1000, reward: { type: "hex", amount: 500 }, category: "progression", cta: "MINE" },
  { id: "p-tap-10k", title: "Tap 10,000 Times", description: "Dedicated tapper.", kind: "taps", target: 10000, reward: { type: "hex", amount: 2000 }, category: "progression", cta: "MINE" },
  { id: "p-tap-50k", title: "Tap 50,000 Times", description: "Tap legend.", kind: "taps", target: 50000, reward: { type: "shards", amount: 20 }, category: "progression", cta: "MINE" },
  { id: "p-tap-100k", title: "Tap 100,000 Times", description: "Ultimate tapper.", kind: "taps", target: 100000, reward: { type: "shards", amount: 40 }, category: "progression", cta: "MINE" },
  { id: "p-hex-100k", title: "Mine 100K HEX", description: "Lifetime HEX milestone.", kind: "hex_earned", target: 100000, reward: { type: "hex", amount: 1000 }, category: "progression" },
  { id: "p-hex-1m", title: "Mine 1M HEX", description: "HEX millionaire.", kind: "hex_earned", target: 1000000, reward: { type: "hex", amount: 5000 }, category: "progression" },
  { id: "p-hex-10m", title: "Mine 10M HEX", description: "HEX tycoon.", kind: "hex_earned", target: 10000000, reward: { type: "shards", amount: 50 }, category: "progression" },
  { id: "p-hex-100m", title: "Mine 100M HEX", description: "Industrial magnate.", kind: "hex_earned", target: 100000000, reward: { type: "shards", amount: 100 }, category: "progression" },
  { id: "p-upgrade-10", title: "Buy 10 Upgrades", description: "Reactor enthusiast.", kind: "reactor_upgrade", target: 10, reward: { type: "hex", amount: 500 }, category: "progression", cta: "UPGRADE" },
  { id: "p-upgrade-50", title: "Buy 50 Upgrades", description: "Reactor master.", kind: "reactor_upgrade", target: 50, reward: { type: "shards", amount: 25 }, category: "progression", cta: "UPGRADE" },
  { id: "p-upgrade-100", title: "Buy 100 Upgrades", description: "Upgrade legend.", kind: "reactor_upgrade", target: 100, reward: { type: "shards", amount: 50 }, category: "progression", cta: "UPGRADE" },
  { id: "p-bot-1", title: "Unlock 1 Bot", description: "First bot acquired.", kind: "bot_unlock", target: 1, reward: { type: "shards", amount: 5 }, category: "progression", cta: "BOTS" },
  { id: "p-bot-3", title: "Unlock 3 Bots", description: "Growing fleet.", kind: "bot_unlock", target: 3, reward: { type: "shards", amount: 15 }, category: "progression", cta: "BOTS" },
  { id: "p-bot-6", title: "Unlock 6 Bots", description: "Bot commander.", kind: "bot_unlock", target: 6, reward: { type: "shards", amount: 30 }, category: "progression", cta: "BOTS" },
  { id: "p-bot-9", title: "Unlock All Bots", description: "Full roster.", kind: "bot_unlock", target: 9, reward: { type: "shards", amount: 60 }, category: "progression", cta: "BOTS" },
  { id: "p-case-10", title: "Open 10 Cases", description: "Case opener.", kind: "case_open", target: 10, reward: { type: "hex", amount: 1000 }, category: "progression", cta: "CASES" },
  { id: "p-case-50", title: "Open 50 Cases", description: "Case veteran.", kind: "case_open", target: 50, reward: { type: "shards", amount: 20 }, category: "progression", cta: "CASES" },
  { id: "p-case-100", title: "Open 100 Cases", description: "Case legend.", kind: "case_open", target: 100, reward: { type: "shards", amount: 40 }, category: "progression", cta: "CASES" },
  { id: "p-case-500", title: "Open 500 Cases", description: "Case hoarder.", kind: "case_open", target: 500, reward: { type: "shards", amount: 80 }, category: "progression", cta: "CASES" },
  { id: "p-play-2h", title: "Play 2 Hours", description: "Power user.", kind: "playtime", target: 7200, reward: { type: "hex", amount: 2000 }, category: "progression" },
  { id: "p-play-10h", title: "Play 10 Hours", description: "Dedicated operator.", kind: "playtime", target: 36000, reward: { type: "shards", amount: 30 }, category: "progression" },
  { id: "p-play-50h", title: "Play 50 Hours", description: "No-lifer.", kind: "playtime", target: 180000, reward: { type: "shards", amount: 80 }, category: "progression" },
  { id: "p-hex-1b", title: "Mine 1B HEX", description: "HEX god.", kind: "hex_earned", target: 1000000000, reward: { type: "shards", amount: 200 }, category: "progression" },
  { id: "p-research-5", title: "Complete 5 Research", description: "Research pioneer.", kind: "research_start", target: 5, reward: { type: "shards", amount: 15 }, category: "progression", cta: "RESEARCH" },
  { id: "p-research-20", title: "Complete 20 Research", description: "Master scientist.", kind: "research_start", target: 20, reward: { type: "shards", amount: 40 }, category: "progression", cta: "RESEARCH" },
];

const ALL_TASKS = [...DAILY_TASKS, ...PROGRESSION_TASKS];
const PLAYTIME_TARGET_SECONDS = 10 * 60;

const DEFAULT_STATE: TasksState = {
  dailyCompleted: {},
  progressionCompleted: {},
  playSeconds: 0,
  lastPlayTickAt: Date.now(),
  lastDailyReset: todayKey(),
};

function loadTasksState(): TasksState {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, lastPlayTickAt: Date.now() };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const dailyCompleted = typeof parsed.dailyCompleted === "object" && parsed.dailyCompleted
      ? parsed.dailyCompleted as Record<string, boolean>
      : typeof parsed.completed === "object" && parsed.completed
        ? parsed.completed as Record<string, boolean>
        : {};
    const state: TasksState = {
      dailyCompleted,
      progressionCompleted: typeof parsed.progressionCompleted === "object" && parsed.progressionCompleted
        ? parsed.progressionCompleted as Record<string, boolean>
        : {},
      playSeconds: Math.max(0, Number(parsed.playSeconds) || 0),
      lastPlayTickAt: typeof parsed.lastPlayTickAt === "number" ? parsed.lastPlayTickAt : Date.now(),
      lastDailyReset: typeof parsed.lastDailyReset === "string" ? String(parsed.lastDailyReset) : todayKey(),
    };
    if (state.lastDailyReset !== todayKey()) {
      state.dailyCompleted = {};
      state.lastDailyReset = todayKey();
    }
    return state;
  } catch {
    return { ...DEFAULT_STATE, lastPlayTickAt: Date.now() };
  }
}

function saveTasksState(state: TasksState): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function readJsonObject(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function readReactorUpgradeCount(): number {
  const reactor = readJsonObject(REACTOR_STORAGE_KEY);
  const upgrades = reactor?.upgrades;
  if (!upgrades || typeof upgrades !== "object") return 0;
  return Object.values(upgrades as Record<string, unknown>).reduce<number>((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function readBotsUnlockedCount(): number {
  const fleet = readJsonObject(BOTS_STORAGE_KEY);
  const bots = fleet?.bots;
  if (!bots || typeof bots !== "object") return 0;
  return Object.values(bots as Record<string, unknown>).filter((v) => Boolean(v && typeof v === "object" && (v as { owned?: unknown }).owned === true)).length;
}

function readBotsDeployedCount(): number {
  const fleet = readJsonObject(BOTS_STORAGE_KEY);
  const bots = fleet?.bots;
  if (!bots || typeof bots !== "object") return 0;
  return Object.values(bots as Record<string, unknown>).filter((v) => Boolean(v && typeof v === "object" && (v as { active?: unknown }).active === true)).length;
}

function readCasesOpenedCount(): number {
  const cases = readJsonObject(CASES_STORAGE_KEY);
  return Math.max(0, Number(cases?.totalOpened) || 0);
}

function readTotalHexMined(): number {
  const reactor = readJsonObject(REACTOR_STORAGE_KEY);
  return Math.max(0, Number(reactor?.totalHexMined) || 0);
}

function readShardsEarned(): number {
  const shop = readJsonObject(SHOP_STORAGE_KEY);
  return Math.max(0, Number(shop?.totalShardsEarned) || 0);
}

function readDailyClaims(): number {
  const shop = readJsonObject(SHOP_STORAGE_KEY);
  return Math.max(0, Number(shop?.dailyClaims) || 0);
}

function readLiveProgress(): LiveProgress {
  return {
    reactorUpgrades: readReactorUpgradeCount(),
    botsUnlocked: readBotsUnlockedCount(),
    casesOpened: readCasesOpenedCount(),
    totalHexMined: readTotalHexMined(),
    shardsEarned: readShardsEarned(),
    botsDeployed: readBotsDeployedCount(),
    dailyClaims: readDailyClaims(),
  };
}

function clampProgress(value: number, target: number): number {
  return Math.min(target, Math.max(0, Math.floor(value || 0)));
}

function formatReward(reward: GameReward): string {
  if (reward.type === "hex") return `+${reward.amount.toLocaleString()} HEX`;
  if (reward.type === "shards") return `+${reward.amount.toLocaleString()} SHARDS`;
  if (reward.type === "case") return `+${reward.amount} ${reward.caseType.toUpperCase()} CASE`;
  return reward.type.toUpperCase();
}

function formatProgress(task: TaskDef, value: number): string {
  if (task.kind === "playtime") {
    const totalSec = clampProgress(value, task.target);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const targetMin = Math.floor(task.target / 60);
    const targetSec = task.target % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")} / ${targetMin}:${String(targetSec).padStart(2, "0")}`;
  }
  return `${clampProgress(value, task.target).toLocaleString()} / ${task.target.toLocaleString()}`;
}

function getTaskProgress(task: TaskDef, totalTaps: number, live: LiveProgress, tasksState: TasksState): number {
  switch (task.kind) {
    case "taps": return totalTaps;
    case "reactor_upgrade": return live.reactorUpgrades;
    case "bot_unlock": return live.botsUnlocked;
    case "case_open": return live.casesOpened;
    case "hex_earned": return live.totalHexMined;
    case "shards_earned": return live.shardsEarned;
    case "bot_deploy": return live.botsDeployed;
    case "daily_claim": return live.dailyClaims;
    case "research_start": return live.reactorUpgrades > 0 ? Math.floor(live.reactorUpgrades / 5) : 0;
    case "playtime": return tasksState.playSeconds;
    default: return 0;
  }
}

export function TasksScreen({
  hex = 0,
  shards = 0,
  totalTaps = 0,
  onNavigate,
  dispatch,
}: TasksProps) {
  const [tasksState, setTasksState] = useState<TasksState>(loadTasksState);
  const [live, setLive] = useState<LiveProgress>(readLiveProgress);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"daily" | "progression">("daily");

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setLive(readLiveProgress());
      setTasksState((prev) => {
        const elapsed = Math.max(0, Math.floor((now - prev.lastPlayTickAt) / 1000));
        const needsReset = prev.lastDailyReset !== todayKey();
        const next: TasksState = {
          ...prev,
          playSeconds: prev.playSeconds + elapsed,
          lastPlayTickAt: now,
          dailyCompleted: needsReset ? {} : prev.dailyCompleted,
          lastDailyReset: todayKey(),
        };
        saveTasksState(next);
        return next;
      });
    };
    tick();
    const interval = window.setInterval(tick, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const visibleTasks = useMemo(() => {
    if (tab === "daily") return DAILY_TASKS;
    return PROGRESSION_TASKS;
  }, [tab]);

  const completedCount = useMemo(() => {
    const completed = tab === "daily" ? tasksState.dailyCompleted : tasksState.progressionCompleted;
    return visibleTasks.filter((t) => Boolean(completed[t.id])).length;
  }, [tasksState, visibleTasks, tab]);

  const totalCount = visibleTasks.length;

  const claimTask = useCallback((task: TaskDef) => {
    if (!dispatch) return;
    const completed = task.category === "daily" ? tasksState.dailyCompleted : tasksState.progressionCompleted;
    if (completed[task.id]) return;
    const progress = getTaskProgress(task, totalTaps, live, tasksState);
    if (progress < task.target) return;

    dispatch({ type: "ADD_REWARD", reward: task.reward, source: "tasks" });
    const next: TasksState = {
      ...tasksState,
      dailyCompleted: task.category === "daily" ? { ...tasksState.dailyCompleted, [task.id]: true } : tasksState.dailyCompleted,
      progressionCompleted: task.category === "progression" ? { ...tasksState.progressionCompleted, [task.id]: true } : tasksState.progressionCompleted,
      lastPlayTickAt: Date.now(),
    };
    saveTasksState(next);
    setTasksState(next);
    setToast(`Task complete: ${formatReward(task.reward)}`);
    window.setTimeout(() => setToast(null), 2200);
  }, [totalTaps, live, tasksState, dispatch]);

  return (
    <section className="tk-screen">
      <div className="tk-bg-grid" />
      <header className="tk-hud">
        <div>
          <p className="tk-kicker">HEXIUM · TASKS</p>
          <h1>Tasks</h1>
          <span className="tk-subtitle">Complete goals, earn rewards, push forward.</span>
        </div>
        <div className="tk-resources">
          <span className="tk-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="tk-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="tk-content">
        <section className="tk-banner">
          <div>
            <p className="tk-kicker">{tab === "daily" ? "DAILY MISSIONS" : "PROGRESSION"}</p>
            <h2>{completedCount} / {totalCount} claimed</h2>
            <p>{tab === "daily" ? "Resets daily at midnight. Stack rewards every day." : "One-time lifetime milestones. Permanent progress."}</p>
          </div>
          <div className="tk-badge">{tab === "daily" ? "DAILY" : "LIFE"}</div>
        </section>

        <div className="tk-tabs">
          <button className={`tk-tab${tab === "daily" ? " active" : ""}`} onClick={() => setTab("daily")}>
            Daily ({DAILY_TASKS.length})
          </button>
          <button className={`tk-tab${tab === "progression" ? " active" : ""}`} onClick={() => setTab("progression")}>
            Progression ({PROGRESSION_TASKS.length})
          </button>
        </div>

        <section className="tk-list" aria-label="Tasks list">
          {visibleTasks.map((task) => {
            const completed = task.category === "daily" ? tasksState.dailyCompleted : tasksState.progressionCompleted;
            const progress = getTaskProgress(task, totalTaps, live, tasksState);
            const clamped = clampProgress(progress, task.target);
            const ratio = Math.min(100, (clamped / task.target) * 100);
            const isDone = Boolean(completed[task.id]);
            const canClaim = !isDone && progress >= task.target && Boolean(dispatch);

            return (
              <article key={task.id} className={`tk-card ${isDone ? "is-claimed" : ""} ${canClaim ? "is-ready" : ""}`}>
                <div className="tk-card-top">
                  <div>
                    <span className="tk-card-tag">{task.category === "daily" ? "DAILY" : "MILESTONE"}</span>
                    <h3>{task.title}</h3>
                  </div>
                  <span className="tk-reward">{formatReward(task.reward)}</span>
                </div>

                <p>{task.description}</p>

                <div className="tk-progress-row">
                  <span>{formatProgress(task, clamped)}</span>
                  {task.cta && !isDone && progress < task.target && onNavigate && (
                    <button
                      className="tk-mini-btn"
                      type="button"
                      onClick={() => {
                        if (task.cta === "MINE" || task.cta === "UPGRADE") onNavigate("main_reactor");
                        if (task.cta === "BOTS") onNavigate("hex_bots");
                        if (task.cta === "CASES") onNavigate("cases");
                        if (task.cta === "RESEARCH") onNavigate("research_center");
                      }}
                    >
                      {task.cta}
                    </button>
                  )}
                </div>

                <div className="tk-progress-bar" aria-hidden="true">
                  <span style={{ width: `${ratio}%` }} />
                </div>

                <button className="tk-claim" type="button" onClick={() => claimTask(task)} disabled={!canClaim}>
                  {isDone ? "✓ CLAIMED" : canClaim ? "CLAIM" : "LOCKED"}
                </button>
              </article>
            );
          })}
        </section>
      </main>

      {toast && <div className="tk-toast">{toast}</div>}
    </section>
  );
}

export default TasksScreen;
