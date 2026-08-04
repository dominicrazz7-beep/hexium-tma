/* ═══════════════════════════════════════════════════════
   ReactorPetsScreen — Companion bots with passive bonuses
   ═══════════════════════════════════════════════════════ */
import { useState } from "react";
import "./ReactorPets.css";

type ReactorPetsScreenProps = {
  hex: number;
  shards: number;
  onNavigate: (screen: string) => void;
};

type PetRarity = "common" | "rare" | "epic" | "legendary" | "quantum";

type Pet = {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: PetRarity;
  bonus: string;
  bonusValue: number;
  level: number;
  maxLevel: number;
  cost: number;
  owned: boolean;
  equipped: boolean;
};

const RARITY_COLORS: Record<PetRarity, string> = {
  common: "#8ea7c7",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  quantum: "#00f0ff",
};

const INITIAL_PETS: Pet[] = [
  { id: "mini_drone", name: "Mini Drone", icon: "🛰️", description: "Small reconnaissance drone. Watches over your reactor.", rarity: "common", bonus: "HEX/sec", bonusValue: 0.5, level: 1, maxLevel: 10, cost: 500, owned: true, equipped: false },
  { id: "nano_bot", name: "Nano Bot", icon: "🤖", description: "Microscopic helper. Optimizes energy flow.", rarity: "common", bonus: "Energy Regen", bonusValue: 1, level: 1, maxLevel: 10, cost: 750, owned: true, equipped: false },
  { id: "quantum_fox", name: "Quantum Fox", icon: "🦊", description: "Mystical creature from the quantum realm. Lucky charm.", rarity: "rare", bonus: "Crit Chance", bonusValue: 3, level: 1, maxLevel: 15, cost: 2000, owned: false, equipped: false },
  { id: "core_spirit", name: "Core Spirit", icon: "👻", description: "Ethereal being born from reactor energy.", rarity: "rare", bonus: "Tap Power", bonusValue: 2, level: 1, maxLevel: 15, cost: 2500, owned: false, equipped: false },
  { id: "void_cat", name: "Void Cat", icon: "🐱", description: "Mysterious feline from the void. Reduces heat.", rarity: "epic", bonus: "Heat Reduction", bonusValue: 10, level: 1, maxLevel: 20, cost: 5000, owned: false, equipped: false },
  { id: "plasma_hawk", name: "Plasma Hawk", icon: "🦅", description: "Majestic bird of plasma. Boosts HEX income.", rarity: "epic", bonus: "HEX Multi", bonusValue: 15, level: 1, maxLevel: 20, cost: 7500, owned: false, equipped: false },
  { id: "dark_wolf", name: "Dark Wolf", icon: "🐺", description: "Guardian of the dark energy core.", rarity: "legendary", bonus: "All Stats", bonusValue: 5, level: 1, maxLevel: 25, cost: 15000, owned: false, equipped: false },
  { id: "omega_phoenix", name: "Omega Phoenix", icon: "🔥", description: "Reborn from reactor explosions. Ultimate companion.", rarity: "quantum", bonus: "HEX Multi + Tap", bonusValue: 30, level: 1, maxLevel: 30, cost: 50000, owned: false, equipped: false },
];

export function ReactorPetsScreen({ hex, shards, onNavigate }: ReactorPetsScreenProps) {
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const ownedCount = pets.filter(p => p.owned).length;
  const equippedPet = pets.find(p => p.equipped);

  const canAfford = (pet: Pet) => hex >= pet.cost * pet.level;

  const handleEquip = (petId: string) => {
    setPets(prev => prev.map(p => ({
      ...p,
      equipped: p.id === petId ? !p.equipped : false,
    })));
    setSelectedPet(null);
  };

  const handleUpgrade = (petId: string) => {
    setPets(prev => prev.map(p => {
      if (p.id !== petId || !p.owned || p.level >= p.maxLevel) return p;
      return { ...p, level: p.level + 1 };
    }));
  };

  const handlePurchase = (petId: string) => {
    setPets(prev => prev.map(p => {
      if (p.id !== petId || p.owned) return p;
      return { ...p, owned: true };
    }));
  };

  const filteredPets = activeFilter === "all"
    ? pets
    : activeFilter === "owned"
      ? pets.filter(p => p.owned)
      : pets.filter(p => p.rarity === activeFilter);

  return (
    <section className="rp-screen">
      <div className="rp-bg-grid" />

      <header className="rp-hud">
        <div>
          <p className="rp-kicker">HEXIUM · REACTOR PETS</p>
          <h1>Pets</h1>
          <p className="rp-stats">{ownedCount}/{pets.length} Collected</p>
        </div>
        <div className="rp-resources">
          <span className="rp-pill"><b>HEX</b> {hex.toLocaleString()}</span>
        </div>
      </header>

      {/* Equipped Pet Display */}
      {equippedPet && (
        <div className="rp-equipped-card">
          <div className="rp-equipped-icon" style={{ borderColor: RARITY_COLORS[equippedPet.rarity] }}>
            {equippedPet.icon}
          </div>
          <div className="rp-equipped-info">
            <span className="rp-equipped-label">ACTIVE COMPANION</span>
            <span className="rp-equipped-name" style={{ color: RARITY_COLORS[equippedPet.rarity] }}>
              {equippedPet.name}
            </span>
            <span className="rp-equipped-bonus">+{equippedPet.bonusValue * equippedPet.level} {equippedPet.bonus}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rp-filters">
        {["all", "owned", "common", "rare", "epic", "legendary", "quantum"].map(filter => (
          <button
            key={filter}
            className={`rp-filter ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "owned" ? "📦 OWNED" : filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Pets Grid */}
      <div className="rp-pets-grid">
        {filteredPets.map(pet => (
          <div
            key={pet.id}
            className={`rp-pet-card ${pet.owned ? "owned" : "locked"} ${pet.equipped ? "equipped" : ""}`}
            style={{ borderColor: RARITY_COLORS[pet.rarity] }}
            onClick={() => setSelectedPet(pet)}
          >
            <div className="rp-pet-icon" style={{ color: RARITY_COLORS[pet.rarity] }}>
              {pet.icon}
            </div>
            <span className="rp-pet-name">{pet.name}</span>
            <span className="rp-pet-rarity" style={{ color: RARITY_COLORS[pet.rarity] }}>
              {pet.rarity.toUpperCase()}
            </span>
            <span className="rp-pet-bonus">+{pet.bonus}</span>
            {pet.equipped && <span className="rp-pet-active">ACTIVE</span>}
          </div>
        ))}
      </div>

      {/* Pet Detail Modal */}
      {selectedPet && (
        <div className="rp-modal-overlay" onClick={() => setSelectedPet(null)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-modal-icon" style={{ borderColor: RARITY_COLORS[selectedPet.rarity] }}>
              {selectedPet.icon}
            </div>
            <h2 className="rp-modal-name" style={{ color: RARITY_COLORS[selectedPet.rarity] }}>
              {selectedPet.name}
            </h2>
            <p className="rp-modal-desc">{selectedPet.description}</p>
            
            <div className="rp-modal-stats">
              <div className="rp-modal-stat">
                <span className="rp-modal-stat-label">Bonus</span>
                <span className="rp-modal-stat-value">+{selectedPet.bonusValue * selectedPet.level} {selectedPet.bonus}</span>
              </div>
              <div className="rp-modal-stat">
                <span className="rp-modal-stat-label">Level</span>
                <span className="rp-modal-stat-value">{selectedPet.level}/{selectedPet.maxLevel}</span>
              </div>
            </div>

            {selectedPet.owned ? (
              <div className="rp-modal-actions">
                <button
                  className={`rp-modal-btn ${selectedPet.equipped ? "unequip" : "equip"}`}
                  onClick={() => handleEquip(selectedPet.id)}
                >
                  {selectedPet.equipped ? "UNEQUIP" : "EQUIP"}
                </button>
                {selectedPet.level < selectedPet.maxLevel && (
                  <button
                    className="rp-modal-btn upgrade"
                    onClick={() => handleUpgrade(selectedPet.id)}
                    disabled={!canAfford(selectedPet)}
                  >
                    UPGRADE (⬡ {(selectedPet.cost * selectedPet.level).toLocaleString()})
                  </button>
                )}
              </div>
            ) : (
              <button
                className="rp-modal-btn purchase"
                onClick={() => handlePurchase(selectedPet.id)}
                disabled={!canAfford(selectedPet)}
              >
                {canAfford(selectedPet) ? `BUY (⬡ ${selectedPet.cost.toLocaleString()})` : "NEED FUNDS"}
              </button>
            )}
          </div>
        </div>
      )}

      <button className="rp-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default ReactorPetsScreen;
