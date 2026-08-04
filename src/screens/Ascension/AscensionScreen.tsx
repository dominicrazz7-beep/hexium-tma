/* ═══════════════════════════════════════════════════════
   AscensionScreen — Prestige reset mechanic
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useMemo } from "react";

import type { AscensionScreenProps } from "./Ascension.types";
import type { AscensionState } from "../../game/ascension/ascensionLogic";

import {
  ALL_ASCENSION_UPGRADES,
  ASCENSION_BY_ID,
  ASCENSION_CATEGORIES,
} from "../../game/ascension/ascensionData";
import {
  emptyState,
  canAscend,
  calculateEssenceGain,
  isOwned,
  canAfford,
  purchaseUpgrade,
  calculateBonuses,
  performAscensionReset,
} from "../../game/ascension/ascensionLogic";
import { ASCENSION_BALANCE } from "../../game/ascension/ascensionBalance";

import "./Ascension.css";

const STORAGE_KEY = ASCENSION_BALANCE.STORAGE_KEY;

function loadState(): AscensionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function saveState(s: AscensionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

type Tab = "upgrades" | "status";

type Toast = { id: number; text: string; tone: "ok" | "warn" };

let toastId = 0;

export function AscensionScreen({
  hex,
  shards,
  reactorLevel,
  totalHexMined,
  onNavigate,
  dispatch,
}: AscensionScreenProps) {
  const [state, setState] = useState<AscensionState>(() => loadState());
  const [activeTab, setActiveTab] = useState<Tab>("upgrades");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const bonuses = useMemo(() => calculateBonuses(state), [state]);
  const canPerformAscension = canAscend(reactorLevel, totalHexMined);
  const essenceGain = calculateEssenceGain(state.count, reactorLevel);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const handlePurchase = useCallback((upgradeId: string) => {
    const result = purchaseUpgrade(state, upgradeId);
    if (!result) {
      pushToast("Cannot purchase", "warn");
      return;
    }
    setState(result);
    const upgrade = ASCENSION_BY_ID[upgradeId];
    pushToast(`${upgrade?.name} purchased!`, "ok");
  }, [state, pushToast]);

  const handleAscend = useCallback(() => {
    const essence = calculateEssenceGain(state.count, reactorLevel);
    setState((prev) => ({
      ...prev,
      count: prev.count + 1,
      essence: prev.essence + essence,
      totalEssenceEarned: prev.totalEssenceEarned + essence,
    }));

    performAscensionReset();
    dispatch({ type: "RESET_STATE" });
    setShowConfirm(false);
    pushToast(`Ascended! +${essence} Quantum Essence`, "ok");
  }, [state.count, reactorLevel, dispatch, pushToast]);

  const filteredUpgrades = useMemo(() => {
    if (activeCategory === "all") return ALL_ASCENSION_UPGRADES;
    return ALL_ASCENSION_UPGRADES.filter((u) => u.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="asc-screen">
      <div className="asc-bg-grid" />

      <header className="asc-hud">
        <div>
          <p className="asc-kicker">HEXIUM · ASCENSION</p>
          <h1>Ascension</h1>
          <p className="asc-stats">
            Ascensions: {state.count} · Essence: {state.essence}
          </p>
        </div>
        <div className="asc-resources">
          <span className="asc-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="asc-pill"><b>◆</b> {shards.toLocaleString()}</span>
          <span className="asc-pill asc-pill-essence"><b>💎</b> {state.essence}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="asc-tabs">
        <button className={`asc-tab ${activeTab === "upgrades" ? "active" : ""}`} onClick={() => setActiveTab("upgrades")}>
          🎯 Upgrades
        </button>
        <button className={`asc-tab ${activeTab === "status" ? "active" : ""}`} onClick={() => setActiveTab("status")}>
          📊 Status
        </button>
      </div>

      {/* ═══ UPGRADES TAB ═══ */}
      {activeTab === "upgrades" && (
        <div className="asc-content">
          {/* Category Filter */}
          <div className="asc-categories">
            <button
              className={`asc-category ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              ALL
            </button>
            {ASCENSION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`asc-category ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Upgrade Grid */}
          <div className="asc-upgrades-grid">
            {filteredUpgrades.map((upgrade) => {
              const owned = isOwned(state, upgrade.id);
              const affordable = canAfford(state, upgrade);
              const locked = upgrade.requires && !isOwned(state, upgrade.requires);

              return (
                <div
                  key={upgrade.id}
                  className={`asc-upgrade-card ${owned ? "owned" : ""} ${locked ? "locked" : ""}`}
                >
                  <div className="asc-upgrade-header">
                    <span className="asc-upgrade-icon">{upgrade.icon}</span>
                    {owned && <span className="asc-upgrade-check">✓</span>}
                  </div>
                  <h3 className="asc-upgrade-name">{upgrade.name}</h3>
                  <p className="asc-upgrade-desc">{upgrade.description}</p>
                  <div className="asc-upgrade-footer">
                    {owned ? (
                      <span className="asc-upgrade-owned">PURCHASED</span>
                    ) : locked ? (
                      <span className="asc-upgrade-locked">REQUIRES PREVIOUS</span>
                    ) : (
                      <button
                        className={`asc-upgrade-buy ${affordable ? "" : "disabled"}`}
                        onClick={() => handlePurchase(upgrade.id)}
                        disabled={!affordable}
                      >
                        💎 {upgrade.cost} Essence
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ STATUS TAB ═══ */}
      {activeTab === "status" && (
        <div className="asc-content">
          {/* Active Bonuses */}
          <div className="asc-bonuses-section">
            <h3>Active Bonuses</h3>
            <div className="asc-bonuses-list">
              {bonuses.hexMultiplier > 0 && <span className="asc-bonus-tag">+{bonuses.hexMultiplier}% HEX/sec</span>}
              {bonuses.headStartLevel > 0 && <span className="asc-bonus-tag">Start at LVL {bonuses.headStartLevel}</span>}
              {bonuses.tapPower > 0 && <span className="asc-bonus-tag">+{bonuses.tapPower} Tap Power</span>}
              {bonuses.maxEnergy > 0 && <span className="asc-bonus-tag">+{bonuses.maxEnergy} Max Energy</span>}
              {bonuses.maxTemperature > 0 && <span className="asc-bonus-tag">+{bonuses.maxTemperature} Max Temperature</span>}
              {bonuses.expeditionSpeed > 0 && <span className="asc-bonus-tag">+{bonuses.expeditionSpeed}% Expedition Speed</span>}
              {bonuses.expeditionSlot > 0 && <span className="asc-bonus-tag">+{bonuses.expeditionSlot} Expedition Slot</span>}
              {bonuses.researchYield > 0 && <span className="asc-bonus-tag">+{bonuses.researchYield}% Research Yield</span>}
              {bonuses.artifactSlot > 0 && <span className="asc-bonus-tag">+{bonuses.artifactSlot} Artifact Slot</span>}
              {bonuses.artifactPower > 0 && <span className="asc-bonus-tag">+{bonuses.artifactPower}% Artifact Power</span>}
              {bonuses.collectionBoost > 0 && <span className="asc-bonus-tag">+{bonuses.collectionBoost}% HEX per 5 Artifacts</span>}
              {bonuses.botStartStars > 0 && <span className="asc-bonus-tag">Bots start at {bonuses.botStartStars}★</span>}
              {bonuses.luckyBoost > 0 && <span className="asc-bonus-tag">+{bonuses.luckyBoost}% Lucky Tiers</span>}
              {bonuses.quantumCoreGen > 0 && <span className="asc-bonus-tag">+{bonuses.quantumCoreGen} Quantum Core/day</span>}
              {Object.values(bonuses).every((v) => v === 0) && (
                <span className="asc-bonus-empty">No bonuses yet. Purchase upgrades!</span>
              )}
            </div>
          </div>

          {/* Ascension Info */}
          <div className="asc-info-section">
            <h3>Ascension Info</h3>
            <div className="asc-info-grid">
              <div className="asc-info-card">
                <span className="asc-info-label">Total Ascensions</span>
                <span className="asc-info-value">{state.count}</span>
              </div>
              <div className="asc-info-card">
                <span className="asc-info-label">Total Essence Earned</span>
                <span className="asc-info-value">{state.totalEssenceEarned}</span>
              </div>
              <div className="asc-info-card">
                <span className="asc-info-label">Upgrades Purchased</span>
                <span className="asc-info-value">{state.upgrades.length}/{ALL_ASCENSION_UPGRADES.length}</span>
              </div>
            </div>
          </div>

          {/* Next Ascension Preview */}
          <div className="asc-preview-section">
            <h3>Next Ascension</h3>
            {canPerformAscension ? (
              <div className="asc-preview-ready">
                <span className="asc-preview-essence">+{essenceGain} Quantum Essence</span>
                <p className="asc-preview-note">
                  Reactor will reset to LVL 0. HEX will be removed.
                  Modules, artifacts, bots, corporation, and currencies persist.
                </p>
                <button className="asc-btn-ascend" onClick={() => setShowConfirm(true)}>
                  ⚡ ASCEND NOW
                </button>
              </div>
            ) : (
              <div className="asc-preview-locked">
                <p>Requires Reactor LVL {ASCENSION_BALANCE.MIN_REACTOR_LEVEL}+ and {ASCENSION_BALANCE.MIN_TOTAL_HEX.toLocaleString()} total HEX mined.</p>
                <p className="asc-preview-current">Current: LVL {reactorLevel} · {Math.floor(totalHexMined).toLocaleString()} HEX</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="asc-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="asc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚡ Ascend?</h2>
            <div className="asc-modal-warning">
              This will reset your reactor to LVL 0 and remove all HEX.
            </div>
            <div className="asc-modal-reward">
              You will gain <span className="asc-modal-essence">+{essenceGain} Quantum Essence</span>
            </div>
            <div className="asc-modal-persists">
              <span className="asc-modal-check">✓</span> Modules, Artifacts, Bots, Corporation, Currencies
            </div>
            <div className="asc-modal-actions">
              <button className="asc-modal-confirm" onClick={handleAscend}>
                ASCEND
              </button>
              <button className="asc-modal-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="asc-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`asc-toast ${t.tone}`}>{t.text}</div>
        ))}
      </div>

      <button className="asc-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default AscensionScreen;
