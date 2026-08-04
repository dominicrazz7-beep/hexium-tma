/* ═══════════════════════════════════════════════════════
   ExpeditionsScreen — Send bots on missions, collect rewards
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback } from "react";

import type { ExpeditionsProps } from "./Expeditions.types";
import type { ExpeditionsState, ExpeditionTier, ActiveExpedition } from "../../game/expeditions/expeditionsData";

import {
  EXPEDITION_DEFS,
  EXPEDITION_BY_ID,
  formatDuration,
} from "../../game/expeditions/expeditionsBalance";

import {
  emptyState,
  getAvailableExpeditions,
  startExpedition,
  collectExpedition,
  getTimeRemaining,
  formatRewardType,
} from "../../game/expeditions/expeditionsLogic";

import {
  type ArtifactsState,
  emptyState as emptyArtifactsState,
  addOwned,
  rollArtifactDrop,
} from "../../game/artifacts/artifactsLogic";
import { ARTIFACT_BY_ID } from "../../game/artifacts/artifactsData";

import { type AscensionState, emptyState as emptyAscensionState, calculateBonuses } from "../../game/ascension/ascensionLogic";
import { ASCENSION_BALANCE } from "../../game/ascension/ascensionBalance";

import "./Expeditions.css";

const STORAGE_KEY = "hexium_expeditions_v1";
const ARTIFACTS_STORAGE_KEY = "hexium_artifacts_v1";

function loadState(): ExpeditionsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ExpeditionsState>;
    return { ...emptyState(), ...parsed, active: parsed.active ?? [], history: parsed.history ?? [] };
  } catch {
    return emptyState();
  }
}

function saveState(s: ExpeditionsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

function loadArtifacts(): ArtifactsState {
  try {
    const raw = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
    if (!raw) return emptyArtifactsState();
    const parsed = JSON.parse(raw);
    return {
      ...emptyArtifactsState(),
      ...parsed,
      owned: parsed.owned ?? {},
      equipped: (parsed.equipped ?? [null, null, null]) as [string | null, string | null, string | null],
    };
  } catch {
    return emptyArtifactsState();
  }
}

function saveArtifacts(s: ArtifactsState) {
  try {
    localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

function loadAscension(): AscensionState {
  try {
    const raw = localStorage.getItem(ASCENSION_BALANCE.STORAGE_KEY);
    if (!raw) return emptyAscensionState();
    return { ...emptyAscensionState(), ...JSON.parse(raw) };
  } catch {
    return emptyAscensionState();
  }
}

type Tab = "available" | "active" | "history";

type Toast = { id: number; text: string; tone: "ok" | "warn" };

let toastId = 0;

const TIER_LABELS: Record<ExpeditionTier, string> = {
  short: "SHORT",
  medium: "MEDIUM",
  long: "LONG",
};

const TIER_COLORS: Record<ExpeditionTier, string> = {
  short: "#4fe08a",
  medium: "#3b82f6",
  long: "#a855f7",
};

export function ExpeditionsScreen({
  hex,
  shards,
  reactorLevel,
  onNavigate,
  dispatch,
}: ExpeditionsProps) {
  const [state, setState] = useState<ExpeditionsState>(() => loadState());
  const [artifacts, setArtifacts] = useState<ArtifactsState>(() => loadArtifacts());
  const [ascension] = useState<AscensionState>(() => loadAscension());
  const [activeTab, setActiveTab] = useState<Tab>("available");
  const [now, setNow] = useState(Date.now());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const ascBonuses = calculateBonuses(ascension);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveArtifacts(artifacts);
  }, [artifacts]);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const available = getAvailableExpeditions(state, reactorLevel, now);
  const completed = state.active.filter((a) => a.completesAt <= now);

  const handleStart = useCallback((defId: string) => {
    const result = startExpedition(state, defId, reactorLevel, now, ascBonuses.expeditionSlot, ascBonuses.expeditionSpeed);
    if (!result.ok) {
      const msg = result.reason === "slots_full"
        ? "All expedition slots full"
        : result.reason === "level_too_low"
          ? "Reactor level too low"
          : "On cooldown";
      pushToast(msg, "warn");
      return;
    }
    setState(result.state);
    pushToast("Expedition started!", "ok");
  }, [state, reactorLevel, now, pushToast]);

  const handleCollect = useCallback((defId: string) => {
    const result = collectExpedition(state, defId, now, ascBonuses.researchYield);
    if (!result.ok) return;

    for (const reward of result.rewards) {
      if (reward.type === "hex") {
        dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: reward.amount });
      } else if (reward.type === "research_points") {
        dispatch({ type: "ADD_CURRENCY", currency: "researchPoints", amount: reward.amount });
      } else if (reward.type === "bot_fragment") {
        dispatch({ type: "ADD_REWARD", reward: { type: "bot_fragment", botId: "random", amount: reward.amount }, source: "expedition" });
      } else if (reward.type === "module_fragment") {
        dispatch({ type: "ADD_CURRENCY", currency: "premium", amount: reward.amount });
      }
    }

    // Roll for artifact drop (long expeditions have higher chance)
    const def = EXPEDITION_BY_ID[defId];
    if (def) {
      const artifactChance = def.tier === "long" ? 0.15 : def.tier === "medium" ? 0.05 : 0.02;
      if (Math.random() < artifactChance) {
        const artifact = rollArtifactDrop("expedition");
        if (artifact) {
          setArtifacts((prev) => addOwned(prev, artifact.id));
          pushToast(`Artifact dropped: ${artifact.icon} ${artifact.name}!`, "ok");
        }
      }
    }

    setState(result.state);
    pushToast(`Rewards collected!`, "ok");
  }, [state, now, dispatch, pushToast]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "available", label: "Available", icon: "🗺" },
    { id: "active", label: "Active", icon: "⏳" },
    { id: "history", label: "History", icon: "📜" },
  ];

  return (
    <section className="ex-screen">
      <div className="ex-bg-grid" />

      <header className="ex-hud">
        <div>
          <p className="ex-kicker">HEXIUM · EXPEDITIONS</p>
          <h1>Expeditions</h1>
          <p className="ex-sub">
            Slots: {state.active.length}/{2 + ascBonuses.expeditionSlot} · LVL {reactorLevel}
          </p>
        </div>
        <div className="ex-resources">
          <span className="ex-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="ex-pill"><b>◆</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="ex-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ex-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="ex-tab-icon">{tab.icon}</span>
            {tab.label}
            {tab.id === "active" && state.active.length > 0 && (
              <span className="ex-tab-badge">{state.active.length}</span>
            )}
            {tab.id === "active" && completed.length > 0 && (
              <span className="ex-tab-badge ex-tab-ready">{completed.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Available Tab */}
      {activeTab === "available" && (
        <div className="ex-content">
          {available.length === 0 ? (
            <div className="ex-empty">
              <span className="ex-empty-icon">🔒</span>
              <p>No expeditions available. Level up your reactor!</p>
            </div>
          ) : (
            <div className="ex-grid">
              {available.map((def) => {
                const isActive = state.active.some((a) => a.defId === def.id);
                return (
                  <div key={def.id} className={`ex-card ${isActive ? "active" : ""}`}>
                    <div className="ex-card-header">
                      <span className="ex-card-icon" style={{ color: TIER_COLORS[def.tier] }}>
                        {def.icon}
                      </span>
                      <span className="ex-card-tier" style={{ color: TIER_COLORS[def.tier] }}>
                        {TIER_LABELS[def.tier]}
                      </span>
                    </div>
                    <h3 className="ex-card-name">{def.name}</h3>
                    <p className="ex-card-desc">{def.description}</p>
                    <div className="ex-card-meta">
                      <span className="ex-card-time">⏱ {formatDuration(def.durationMs)}</span>
                      <span className="ex-card-level">LVL {def.requiredLevel}+</span>
                    </div>
                    <div className="ex-card-rewards">
                      {def.rewards.map((r, i) => (
                        <span key={i} className="ex-card-reward">
                          {formatRewardType(r.type)}: {r.amount} ({Math.round(r.chance * 100)}%)
                        </span>
                      ))}
                    </div>
                    <button
                      className="ex-btn"
                      onClick={() => handleStart(def.id)}
                      disabled={isActive || state.active.length >= 2}
                    >
                      {isActive ? "IN PROGRESS" : state.active.length >= 2 ? "SLOTS FULL" : "START"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Tab */}
      {activeTab === "active" && (
        <div className="ex-content">
          {state.active.length === 0 ? (
            <div className="ex-empty">
              <span className="ex-empty-icon">⏳</span>
              <p>No active expeditions. Start one!</p>
            </div>
          ) : (
            <div className="ex-active-list">
              {state.active.map((exp) => {
                const def = EXPEDITION_BY_ID[exp.defId];
                if (!def) return null;
                const isReady = exp.completesAt <= now;
                const progress = Math.min(1, (now - exp.startedAt) / (exp.completesAt - exp.startedAt));

                return (
                  <div key={exp.defId} className={`ex-active-card ${isReady ? "ready" : ""}`}>
                    <div className="ex-active-left">
                      <span className="ex-active-icon" style={{ color: TIER_COLORS[def.tier] }}>
                        {def.icon}
                      </span>
                      <div className="ex-active-info">
                        <span className="ex-active-name">{def.name}</span>
                        <span className="ex-active-time" style={{ color: isReady ? "#4fe08a" : "#8ea7c7" }}>
                          {isReady ? "✅ READY" : `⏱ ${getTimeRemaining(exp.completesAt, now)}`}
                        </span>
                      </div>
                    </div>
                    {!isReady && (
                      <div className="ex-progress-bar">
                        <div className="ex-progress-fill" style={{ width: `${progress * 100}%`, backgroundColor: TIER_COLORS[def.tier] }} />
                      </div>
                    )}
                    <button
                      className={`ex-btn ${isReady ? "collect" : ""}`}
                      onClick={() => handleCollect(exp.defId)}
                      disabled={!isReady}
                    >
                      {isReady ? "CLAIM REWARDS" : "IN PROGRESS"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="ex-content">
          {state.history.length === 0 ? (
            <div className="ex-empty">
              <span className="ex-empty-icon">📜</span>
              <p>No expedition history yet.</p>
            </div>
          ) : (
            <div className="ex-history">
              {state.history.map((h) => (
                <div key={h.uid} className="ex-history-row">
                  <span className="ex-history-icon">{h.icon}</span>
                  <div className="ex-history-info">
                    <span className="ex-history-name">{h.name}</span>
                    <span className="ex-history-rewards">{h.rewards}</span>
                  </div>
                  <span className="ex-history-tier" style={{ color: TIER_COLORS[h.tier] }}>
                    {TIER_LABELS[h.tier]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toasts */}
      <div className="ex-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`ex-toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>

      <button className="ex-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default ExpeditionsScreen;
