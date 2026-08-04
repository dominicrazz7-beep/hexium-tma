/* ═══════════════════════════════════════════════════════
   SecretBlueprintsScreen — Collect fragments to unlock secrets
   ═══════════════════════════════════════════════════════ */
import { useState } from "react";
import "./SecretBlueprints.css";

type SecretBlueprintsScreenProps = {
  hex: number;
  shards: number;
  onNavigate: (screen: string) => void;
};

type Blueprint = {
  id: string;
  name: string;
  icon: string;
  description: string;
  reward: string;
  rewardIcon: string;
  required: number;
  collected: number;
  unlocked: boolean;
};

const INITIAL_BLUEPRINTS: Blueprint[] = [
  {
    id: "quantum_reactor",
    name: "Quantum Reactor Blueprint",
    icon: "⚛️",
    description: "Ancient blueprint for a quantum-powered reactor core.",
    reward: "Secret Reactor Skin",
    rewardIcon: "🎨",
    required: 25,
    collected: 12,
    unlocked: false,
  },
  {
    id: "void_extractor",
    name: "Void Extractor Blueprint",
    icon: "🌌",
    description: "Schematics for extracting energy from the void.",
    reward: "Void Module",
    rewardIcon: "🔮",
    required: 30,
    collected: 8,
    unlocked: false,
  },
  {
    id: "dark_core",
    name: "Dark Core Blueprint",
    icon: "🌑",
    description: "Plans for a dark matter energy core.",
    reward: "Dark Matter Core",
    rewardIcon: "💎",
    required: 40,
    collected: 5,
    unlocked: false,
  },
  {
    id: "temporal_engine",
    name: "Temporal Engine Blueprint",
    icon: "⏳",
    description: "Engineering schematics for time manipulation.",
    reward: "Temporal Module",
    rewardIcon: "⏰",
    required: 50,
    collected: 2,
    unlocked: false,
  },
];

export function SecretBlueprintsScreen({ hex, shards, onNavigate }: SecretBlueprintsScreenProps) {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(INITIAL_BLUEPRINTS);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  const totalCollected = blueprints.reduce((sum, b) => sum + b.collected, 0);
  const totalRequired = blueprints.reduce((sum, b) => sum + b.required, 0);

  const handleCollect = (bpId: string) => {
    setBlueprints(prev => prev.map(bp => {
      if (bp.id !== bpId || bp.unlocked || bp.collected >= bp.required) return bp;
      const newCollected = Math.min(bp.collected + 1, bp.required);
      return {
        ...bp,
        collected: newCollected,
        unlocked: newCollected >= bp.required,
      };
    }));
  };

  return (
    <section className="sb-screen">
      <div className="sb-bg-grid" />

      <header className="sb-hud">
        <div>
          <p className="sb-kicker">HEXIUM · SECRET BLUEPRINTS</p>
          <h1>Blueprints</h1>
          <p className="sb-stats">{totalCollected}/{totalRequired} Fragments</p>
        </div>
        <div className="sb-resources">
          <span className="sb-pill"><b>HEX</b> {hex.toLocaleString()}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="sb-progress">
        <div className="sb-progress-bar">
          <div
            className="sb-progress-fill"
            style={{ width: `${(totalCollected / totalRequired) * 100}%` }}
          />
        </div>
        <span className="sb-progress-text">
          {Math.round((totalCollected / totalRequired) * 100)}% Complete
        </span>
      </div>

      {/* Blueprints Grid */}
      <div className="sb-grid">
        {blueprints.map(bp => (
          <div
            key={bp.id}
            className={`sb-card ${bp.unlocked ? "unlocked" : ""}`}
            onClick={() => setSelectedBlueprint(bp)}
          >
            <div className="sb-card-icon">{bp.icon}</div>
            <h3 className="sb-card-name">{bp.name}</h3>
            <p className="sb-card-desc">{bp.description}</p>

            <div className="sb-card-progress">
              <div className="sb-card-bar">
                <div
                  className="sb-card-fill"
                  style={{ width: `${(bp.collected / bp.required) * 100}%` }}
                />
              </div>
              <span className="sb-card-count">
                {bp.collected}/{bp.required}
              </span>
            </div>

            {bp.unlocked && (
              <div className="sb-card-reward">
                <span className="sb-card-reward-icon">{bp.rewardIcon}</span>
                <span className="sb-card-reward-text">{bp.reward}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blueprint Detail Modal */}
      {selectedBlueprint && (
        <div className="sb-modal-overlay" onClick={() => setSelectedBlueprint(null)}>
          <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sb-modal-icon">{selectedBlueprint.icon}</div>
            <h2 className="sb-modal-name">{selectedBlueprint.name}</h2>
            <p className="sb-modal-desc">{selectedBlueprint.description}</p>

            <div className="sb-modal-progress">
              <div className="sb-modal-bar">
                <div
                  className="sb-modal-fill"
                  style={{ width: `${(selectedBlueprint.collected / selectedBlueprint.required) * 100}%` }}
                />
              </div>
              <span className="sb-modal-count">
                {selectedBlueprint.collected}/{selectedBlueprint.required} Fragments
              </span>
            </div>

            <div className="sb-modal-reward">
              <span className="sb-modal-reward-label">UNLOCK REWARD</span>
              <span className="sb-modal-reward-icon">{selectedBlueprint.rewardIcon}</span>
              <span className="sb-modal-reward-text">{selectedBlueprint.reward}</span>
            </div>

            {selectedBlueprint.unlocked ? (
              <div className="sb-modal-unlocked">
                <span className="sb-modal-unlocked-icon">✓</span>
                <span>BLUEPRINT UNLOCKED!</span>
              </div>
            ) : (
              <button
                className="sb-modal-btn"
                onClick={() => handleCollect(selectedBlueprint.id)}
              >
                +1 Fragment (Tap to Collect)
              </button>
            )}

            <button className="sb-modal-close" onClick={() => setSelectedBlueprint(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <button className="sb-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default SecretBlueprintsScreen;
