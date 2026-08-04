/* ═══════════════════════════════════════════════════════
   ArtifactsScreen — Collection Pass
   Encyclopedia, duplicates, rarity stats, collection bonus
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useMemo } from "react";

import type { Artifact, ArtifactRarity } from "../../game/artifacts/artifactsData";
import {
  ALL_ARTIFACTS,
  ARTIFACT_BY_ID,
  ARTIFACT_RARITY_COLORS,
  RARITY_ORDER,
  TOTAL_ARTIFACTS,
  COLLECTION_MILESTONES,
  formatArtifactBonus,
} from "../../game/artifacts/artifactsData";
import {
  type ArtifactsState,
  type ArtifactEffects,
  emptyState,
  isOwned,
  getOwnedCount,
  getUniqueCount,
  getRarityCount,
  getRarityTotal,
  isEquipped,
  getEquippedSlot,
  equipArtifact,
  unequipArtifact,
  calculateEffects,
  getCollectionBonus,
  getNextMilestone,
} from "../../game/artifacts/artifactsLogic";

import "./Artifacts.css";

const STORAGE_KEY = "hexium_artifacts_v1";

function loadState(): ArtifactsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ArtifactsState>;
    return {
      ...emptyState(),
      ...parsed,
      owned: parsed.owned ?? {},
      equipped: (parsed.equipped ?? [null, null, null]) as [string | null, string | null, string | null],
    };
  } catch {
    return emptyState();
  }
}

function saveState(s: ArtifactsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

type Tab = "equipped" | "encyclopedia" | "milestones";

type Toast = { id: number; text: string; tone: "ok" | "warn" };

let toastId = 0;

type ArtifactsScreenProps = {
  hex: number;
  shards: number;
  onNavigate: (screen: string) => void;
};

export function ArtifactsScreen({ hex, shards, onNavigate }: ArtifactsScreenProps) {
  const [state, setState] = useState<ArtifactsState>(() => loadState());
  const [activeTab, setActiveTab] = useState<Tab>("equipped");
  const [filterRarity, setFilterRarity] = useState<ArtifactRarity | "all">("all");
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const effects: ArtifactEffects = useMemo(() => calculateEffects(state), [state]);
  const collectionBonus: ArtifactEffects = useMemo(() => getCollectionBonus(state), [state]);
  const nextMilestone = useMemo(() => getNextMilestone(state), [state]);
  const uniqueCount = useMemo(() => getUniqueCount(state), [state]);
  const totalDuplicates = useMemo(
    () => Object.values(state.owned).reduce((s, c) => s + c, 0),
    [state.owned],
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const handleEquip = useCallback((artifactId: string, slot: 0 | 1 | 2) => {
    setState((prev) => equipArtifact(prev, artifactId, slot));
    setSelectedArtifact(null);
    pushToast("Artifact equipped!", "ok");
  }, [pushToast]);

  const handleUnequip = useCallback((slot: 0 | 1 | 2) => {
    setState((prev) => unequipArtifact(prev, slot));
    pushToast("Artifact unequipped", "ok");
  }, [pushToast]);

  const filteredArtifacts = useMemo(() => {
    if (filterRarity === "all") return ALL_ARTIFACTS;
    return ALL_ARTIFACTS.filter((a) => a.rarity === filterRarity);
  }, [filterRarity]);

  return (
    <section className="af-screen">
      <div className="af-bg-grid" />

      <header className="af-hud">
        <div>
          <p className="af-kicker">HEXIUM · ARTIFACTS</p>
          <h1>Artifacts</h1>
          <p className="af-stats">{uniqueCount}/{TOTAL_ARTIFACTS} Discovered · {totalDuplicates} Total</p>
        </div>
        <div className="af-resources">
          <span className="af-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="af-pill"><b>⬡</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      {/* Collection Progress Bar */}
      <div className="af-collection-bar-wrap">
        <div className="af-collection-bar">
          <div className="af-collection-fill" style={{ width: `${(uniqueCount / TOTAL_ARTIFACTS) * 100}%` }} />
        </div>
        <div className="af-rarity-counts">
          {RARITY_ORDER.map((rarity) => (
            <span key={rarity} className="af-rarity-count" style={{ color: ARTIFACT_RARITY_COLORS[rarity] }}>
              {getRarityCount(state, rarity)}/{getRarityTotal(rarity)}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="af-tabs">
        <button className={`af-tab ${activeTab === "equipped" ? "active" : ""}`} onClick={() => setActiveTab("equipped")}>
          ⚙️ Equipped
        </button>
        <button className={`af-tab ${activeTab === "encyclopedia" ? "active" : ""}`} onClick={() => setActiveTab("encyclopedia")}>
          📖 Encyclopedia
        </button>
        <button className={`af-tab ${activeTab === "milestones" ? "active" : ""}`} onClick={() => setActiveTab("milestones")}>
          🏆 Milestones
        </button>
      </div>

      {/* ═══ EQUIPPED TAB ═══ */}
      {activeTab === "equipped" && (
        <div className="af-content">
          <div className="af-slots-grid">
            {[0, 1, 2].map((slotIdx) => {
              const artifactId = state.equipped[slotIdx];
              const artifact = artifactId ? ARTIFACT_BY_ID[artifactId] : null;

              return (
                <div key={slotIdx} className={`af-slot ${artifact ? "equipped" : "empty"}`}>
                  <div className="af-slot-header">
                    <span className="af-slot-id">SLOT {slotIdx + 1}</span>
                    {artifact && (
                      <button className="af-slot-remove" onClick={() => handleUnequip(slotIdx as 0 | 1 | 2)}>✕</button>
                    )}
                  </div>
                  {artifact ? (
                    <div className="af-slot-artifact">
                      <div className="af-slot-icon" style={{ borderColor: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                        {artifact.icon}
                      </div>
                      <div className="af-slot-info">
                        <span className="af-slot-name" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                          {artifact.name}
                        </span>
                        <span className="af-slot-rarity">{artifact.rarity.toUpperCase()}</span>
                        <span className="af-slot-bonus">{formatArtifactBonus(artifact.bonusType, artifact.bonusValue)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="af-slot-empty">
                      <span className="af-slot-empty-icon">+</span>
                      <span className="af-slot-empty-text">Empty Slot</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="af-total-effects">
            <h3>Combined Effects</h3>
            <div className="af-effects-list">
              {effects.hexMultiplier > 0 && <span className="af-effect-tag">+{effects.hexMultiplier}% HEX/sec</span>}
              {effects.tapPower > 0 && <span className="af-effect-tag">+{effects.tapPower} Tap Power</span>}
              {effects.critChance > 0 && <span className="af-effect-tag">+{effects.critChance}% Crit Chance</span>}
              {effects.critMultiplier > 0 && <span className="af-effect-tag">+{effects.critMultiplier}% Crit Multi</span>}
              {effects.autoHex > 0 && <span className="af-effect-tag">+{effects.autoHex}% Auto HEX</span>}
              {effects.energyRegen > 0 && <span className="af-effect-tag">+{effects.energyRegen} Energy Regen</span>}
              {effects.modulePower > 0 && <span className="af-effect-tag">+{effects.modulePower}% Module Power</span>}
              {Object.values(effects).every((v) => v === 0) && (
                <span className="af-effect-empty">No artifacts equipped</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ENCYCLOPEDIA TAB ═══ */}
      {activeTab === "encyclopedia" && (
        <div className="af-content">
          <div className="af-filters">
            {(["all", ...RARITY_ORDER] as const).map((rarity) => (
              <button
                key={rarity}
                className={`af-filter ${filterRarity === rarity ? "active" : ""}`}
                onClick={() => setFilterRarity(rarity)}
                style={rarity !== "all" ? { borderColor: ARTIFACT_RARITY_COLORS[rarity] } : undefined}
              >
                {rarity === "all" ? "ALL" : rarity.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="af-grid">
            {filteredArtifacts.map((artifact) => {
              const owned = isOwned(state, artifact.id);
              const equipped = isEquipped(state, artifact.id);
              const slotIdx = getEquippedSlot(state, artifact.id);
              const count = getOwnedCount(state, artifact.id);

              return (
                <div
                  key={artifact.id}
                  className={`af-card ${owned ? "owned" : "locked"} ${equipped ? "equipped" : ""}`}
                  style={{ borderColor: ARTIFACT_RARITY_COLORS[artifact.rarity] }}
                  onClick={() => setSelectedArtifact(artifact)}
                >
                  <div className="af-card-header">
                    <span className="af-card-icon" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                      {owned ? artifact.icon : "❓"}
                    </span>
                    <span className="af-card-rarity" style={{ color: ARTIFACT_RARITY_COLORS[artifact.rarity] }}>
                      {artifact.rarity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="af-card-name">{owned ? artifact.name : "???"}</h3>
                  <span className="af-card-bonus">
                    {owned ? formatArtifactBonus(artifact.bonusType, artifact.bonusValue) : "Unknown"}
                  </span>
                  {owned && count > 1 && (
                    <span className="af-card-dupes">×{count} copies</span>
                  )}
                  {equipped && <span className="af-card-equipped">EQUIPPED · Slot {slotIdx! + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ MILESTONES TAB ═══ */}
      {activeTab === "milestones" && (
        <div className="af-content">
          {/* Next milestone */}
          {nextMilestone && (
            <div className="af-milestone-next">
              <span className="af-milestone-next-label">NEXT MILESTONE</span>
              <span className="af-milestone-next-title">{nextMilestone.milestone.label}</span>
              <span className="af-milestone-next-remaining">{nextMilestone.remaining} more to discover</span>
              <div className="af-milestone-progress">
                <div
                  className="af-milestone-progress-fill"
                  style={{
                    width: `${((uniqueCount) / nextMilestone.milestone.required) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* All milestones */}
          <div className="af-milestones-list">
            {COLLECTION_MILESTONES.map((milestone) => {
              const reached = uniqueCount >= milestone.required;
              return (
                <div key={milestone.required} className={`af-milestone-card ${reached ? "reached" : ""}`}>
                  <div className="af-milestone-header">
                    <span className="af-milestone-count">{milestone.required}/{TOTAL_ARTIFACTS}</span>
                    {reached && <span className="af-milestone-check">✓</span>}
                  </div>
                  <span className="af-milestone-label">{milestone.label}</span>
                  <div className="af-milestone-effects">
                    {milestone.effects.map((effect, i) => (
                      <span key={i} className="af-milestone-effect">
                        {formatArtifactBonus(effect.type, effect.value)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collection Bonus Summary */}
          {(collectionBonus.hexMultiplier > 0 || collectionBonus.tapPower > 0 || collectionBonus.critChance > 0) && (
            <div className="af-collection-bonus">
              <h3>Collection Bonus (Passive)</h3>
              <div className="af-effects-list">
                {collectionBonus.hexMultiplier > 0 && <span className="af-effect-tag af-effect-bonus">+{collectionBonus.hexMultiplier}% HEX/sec</span>}
                {collectionBonus.tapPower > 0 && <span className="af-effect-tag af-effect-bonus">+{collectionBonus.tapPower} Tap Power</span>}
                {collectionBonus.critChance > 0 && <span className="af-effect-tag af-effect-bonus">+{collectionBonus.critChance}% Crit Chance</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ ARTIFACT MODAL ═══ */}
      {selectedArtifact && (
        <div className="af-modal-overlay" onClick={() => setSelectedArtifact(null)}>
          <div className="af-modal" onClick={(e) => e.stopPropagation()}>
            <div className="af-modal-icon" style={{ borderColor: ARTIFACT_RARITY_COLORS[selectedArtifact.rarity] }}>
              {isOwned(state, selectedArtifact.id) ? selectedArtifact.icon : "❓"}
            </div>
            <h2 className="af-modal-name" style={{ color: ARTIFACT_RARITY_COLORS[selectedArtifact.rarity] }}>
              {isOwned(state, selectedArtifact.id) ? selectedArtifact.name : "???"}
            </h2>
            <p className="af-modal-desc">
              {isOwned(state, selectedArtifact.id) ? selectedArtifact.description : "Not yet discovered."}
            </p>
            <span className="af-modal-rarity" style={{ color: ARTIFACT_RARITY_COLORS[selectedArtifact.rarity] }}>
              {selectedArtifact.rarity.toUpperCase()}
            </span>

            {isOwned(state, selectedArtifact.id) && (
              <>
                <div className="af-modal-bonus">
                  {formatArtifactBonus(selectedArtifact.bonusType, selectedArtifact.bonusValue)}
                </div>

                <div className="af-modal-dupes">
                  Owned: {getOwnedCount(state, selectedArtifact.id)} {getOwnedCount(state, selectedArtifact.id) === 1 ? "copy" : "copies"}
                </div>

                <div className="af-modal-actions">
                  {[0, 1, 2].map((slot) => {
                    const currentInSlot = state.equipped[slot];
                    const isThisEquipped = currentInSlot === selectedArtifact.id;
                    const slotArtifact = currentInSlot ? ARTIFACT_BY_ID[currentInSlot] : null;

                    return (
                      <button
                        key={slot}
                        className={`af-modal-slot-btn ${isThisEquipped ? "active" : ""}`}
                        onClick={() => {
                          if (isThisEquipped) {
                            handleUnequip(slot as 0 | 1 | 2);
                          } else {
                            handleEquip(selectedArtifact.id, slot as 0 | 1 | 2);
                          }
                        }}
                      >
                        Slot {slot + 1}
                        {isThisEquipped ? " ✓" : slotArtifact ? ` (${slotArtifact.name})` : " (Empty)"}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {!isOwned(state, selectedArtifact.id) && (
              <div className="af-modal-source">Source: {selectedArtifact.dropSource.replace("_", " ")}</div>
            )}

            <button className="af-modal-close" onClick={() => setSelectedArtifact(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="af-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`af-toast ${t.tone}`}>{t.text}</div>
        ))}
      </div>

      <button className="af-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default ArtifactsScreen;
