import { useCallback, useEffect, useMemo, useState } from "react";
import type { ResearchCenterProps } from "./ResearchCenter.types";
import { BRANCH_META, RESEARCH_ITEMS, RESEARCH_BY_ID, type ResearchBranch } from "../../game/research/researchData";
import { formatDuration, formatCost } from "../../game/research/researchBalance";
import {
  loadResearchState,
  saveResearchState,
  getCompletedTier,
  getNextTier,
  isResearchDone,
  isResearchActive,
  getActiveResearch,
  getRemainingMs,
  canStartResearch,
  startResearch,
  collectResearch,
  getTotalCompleted,
  getTotalPossible,
} from "../../game/research/researchLogic";
import "./ResearchCenter.css";

export function ResearchCenterScreen({
  hex = 0,
  shards = 0,
  dispatch,
  onNavigate,
}: ResearchCenterProps) {
  const [state, setState] = useState(loadResearchState);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<ResearchBranch | "all">("all");

  useEffect(() => { saveResearchState(state); }, [state]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const active = useMemo(() => getActiveResearch(state), [state]);
  const remaining = useMemo(() => getRemainingMs(state), [state, now]);
  const totalDone = useMemo(() => getTotalCompleted(state), [state]);

  const activeJustFinished = active === null && state.activeId !== null && now >= state.endsAt;

  const filteredItems = useMemo(() => {
    if (selectedBranch === "all") return RESEARCH_ITEMS;
    return RESEARCH_ITEMS.filter((r) => r.branch === selectedBranch);
  }, [selectedBranch]);

  const branches: ResearchBranch[] = ["energy", "heat", "mining", "advanced"];

  const pushToast = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleStart = useCallback((id: string) => {
    const check = canStartResearch(state, id, hex, shards);
    if (!check.ok) { pushToast(check.reason!); return; }
    const def = RESEARCH_BY_ID[id];
    const tier = getNextTier(state, id);
    const cost = def!.tiers[tier - 1];
    setState(startResearch(state, id));
    if (dispatch) {
      dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: -cost.costHex });
      dispatch({ type: "ADD_CURRENCY", currency: "shards", amount: -cost.costShards });
    }
    pushToast(`Research started: ${def!.name} T${tier}`);
  }, [state, hex, shards, dispatch, pushToast]);

  const handleCollect = useCallback((id: string) => {
    if (now < state.endsAt) return;
    setState(collectResearch(state, id));
    pushToast(`Research complete!`);
  }, [state, now, pushToast]);

  function formatRemaining(ms: number): string {
    const s = Math.ceil(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  return (
    <section className="rc-screen">
      <div className="rc-bg-grid" />
      <header className="rc-hud">
        <div>
          <p className="rc-kicker">HEXIUM · RESEARCH CENTER</p>
          <h1>Research Center</h1>
          <span className="rc-sub">Unlock permanent reactor upgrades across 4 research branches.</span>
        </div>
        <div className="rc-resources">
          <span className="rc-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="rc-pill shards"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      {active && (
        <div className="rc-active-bar">
          <span className="rc-active-icon">{active.def.icon}</span>
          <div className="rc-active-info">
            <span className="rc-active-name">{active.def.name} — Tier {getNextTier(state, active.def.id)}</span>
            <span className="rc-active-timer">Completes in {formatRemaining(remaining)}</span>
          </div>
          <div className="rc-active-progress">
            <div className="rc-active-fill" style={{ width: `${Math.min(100, (1 - remaining / ((active.endsAt - state.startedAt) || 1)) * 100)}%` }} />
          </div>
        </div>
      )}

      {activeJustFinished && state.activeId && (
        <button className="rc-collect-bar" onClick={() => handleCollect(state.activeId!)}>
          ✅ {RESEARCH_BY_ID[state.activeId]?.name} Complete — Tap to Collect
        </button>
      )}

      <div className="rc-progress-summary">
        <span>{totalDone} / {getTotalPossible()} tiers researched</span>
      </div>

      <nav className="rc-branches">
        <button
          className={`rc-branch-btn${selectedBranch === "all" ? " active" : ""}`}
          onClick={() => setSelectedBranch("all")}
        >All</button>
        {branches.map((b) => {
          const meta = BRANCH_META[b];
          return (
            <button
              key={b}
              className={`rc-branch-btn${selectedBranch === b ? " active" : ""}`}
              style={{ ["--ba" as string]: meta.accent }}
              onClick={() => setSelectedBranch(b)}
            >
              <span className="rc-branch-icon">{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </nav>

      <div className="rc-grid">
        {filteredItems.map((def) => {
          const tier = getCompletedTier(state, def.id);
          const nextTier = getNextTier(state, def.id);
          const done = isResearchDone(state, def.id);
          const branchMeta = BRANCH_META[def.branch];
          const isActive = state.activeId === def.id && isResearchActive(state);
          const canFinish = state.activeId === def.id && !isResearchActive(state) && state.endsAt > 0;

          return (
            <div
              key={def.id}
              className={`rc-card${done ? " done" : ""}${isActive ? " active" : ""}`}
              style={{ ["--ba" as string]: branchMeta.accent }}
            >
              <div className="rc-card-head">
                <span className="rc-card-icon">{def.icon}</span>
                <div className="rc-card-titles">
                  <span className="rc-card-name">{def.name}</span>
                  <span className="rc-card-branch" style={{ color: branchMeta.accent }}>{branchMeta.label}</span>
                </div>
                <span className={`rc-card-tier tier-${tier}`}>{tier}/3</span>
              </div>

              <p className="rc-card-desc">{def.description}</p>

              <div className="rc-card-tiers">
                {def.tiers.map((t, i) => (
                  <div key={i} className={`rc-tier-pip${i < tier ? " filled" : ""}${i + 1 === nextTier && !done ? " next" : ""}`}>
                    <span className="rc-tier-num">T{i + 1}</span>
                    <span className="rc-tier-effect">{t.description}</span>
                  </div>
                ))}
              </div>

              {done ? (
                <div className="rc-card-status completed">✓ RESEARCHED</div>
              ) : isActive ? (
                <div className="rc-card-status researching">
                  Researching... {formatRemaining(remaining)}
                </div>
              ) : canFinish ? (
                <button className="rc-card-btn collect" onClick={() => handleCollect(def.id)}>
                  COLLECT
                </button>
              ) : (
                <button
                  className="rc-card-btn"
                  disabled={!canStartResearch(state, def.id, hex, shards).ok}
                  onClick={() => handleStart(def.id)}
                >
                  {formatCost(def.tiers[nextTier - 1].costHex, def.tiers[nextTier - 1].costShards)}
                  <span className="rc-card-time">{formatDuration(def.tiers[nextTier - 1].durationMinutes)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {toast && <div className="rc-toast">{toast}</div>}
    </section>
  );
}

export default ResearchCenterScreen;
