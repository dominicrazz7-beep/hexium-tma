/* ═══════════════════════════════════════════════════════
   ReactorModulesScreen — Slot-based module system
   ═══════════════════════════════════════════════════════ */
import { useMemo, useState, useCallback, useEffect } from "react";

import type { ReactorModulesScreenProps } from "./ReactorModules.types";
import type { ModuleId, ModuleRarity, EquippedModules } from "../../game/reactorModules/reactorModulesData";

import {
  ALL_MODULES,
  MODULE_RARITY_COLORS,
  getModuleById,
  getUnlockedModules,
} from "../../game/reactorModules/reactorModulesData";

import {
  generateDailyCombo,
  isDailyComboActive,
  isModuleEquipped,
  formatEffect,
  calculateComboBonus,
  equipModule,
  unequipModule,
} from "../../game/reactorModules/reactorModulesLogic";

import "./ReactorModules.css";

const DAILY_COMBO = generateDailyCombo();
const MODULES_STORAGE_KEY = "hexium_reactor_modules_v1";
const EMPTY_EQUIPPED: EquippedModules = { slot1: null, slot2: null, slot3: null };

function loadEquipped(): EquippedModules {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return EMPTY_EQUIPPED;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_EQUIPPED, ...parsed };
  } catch {
    return EMPTY_EQUIPPED;
  }
}

function saveEquipped(eq: EquippedModules) {
  try {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(eq));
  } catch { /* quota */ }
}

type Tab = "modules" | "slots" | "combo";

export function ReactorModulesScreen({
  hex,
  shards,
  premium,
  reactorLevel,
  equipped: _equippedProp,
  onNavigate,
  onEquipModule: _onEquipModule,
  onUnequipModule: _onUnequipModule,
  onPurchaseModule,
}: ReactorModulesScreenProps) {
  const [equipped, setEquipped] = useState<EquippedModules>(loadEquipped);
  const [activeTab, setActiveTab] = useState<Tab>("slots");
  const [filterRarity, setFilterRarity] = useState<ModuleRarity | "all">("all");
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [showSlotSelect, setShowSlotSelect] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState<ModuleId | null>(null);

  /* ── Persist equipped to localStorage ──────────────── */
  useEffect(() => {
    saveEquipped(equipped);
  }, [equipped]);

  const handleEquip = useCallback((moduleId: ModuleId, slotIndex: 0 | 1 | 2) => {
    setEquipped((prev) => {
      const next = equipModule(prev, moduleId, slotIndex);
      _onEquipModule(moduleId, slotIndex);
      return next;
    });
  }, [_onEquipModule]);

  const handleUnequip = useCallback((slotIndex: 0 | 1 | 2) => {
    setEquipped((prev) => {
      const next = unequipModule(prev, slotIndex);
      _onUnequipModule(slotIndex);
      return next;
    });
  }, [_onUnequipModule]);

  const unlockedModules = useMemo(() => getUnlockedModules(reactorLevel), [reactorLevel]);

  const filteredModules = useMemo(() => {
    if (filterRarity === "all") return ALL_MODULES;
    return ALL_MODULES.filter((m) => m.rarity === filterRarity);
  }, [filterRarity]);

  const comboActive = isDailyComboActive(DAILY_COMBO);
  const comboBonus = calculateComboBonus(DAILY_COMBO, equipped);

  const canAfford = (module: (typeof ALL_MODULES)[0]) => {
    switch (module.cost.currency) {
      case "hex": return hex >= module.cost.amount;
      case "shards": return shards >= module.cost.amount;
      case "premium": return premium >= module.cost.amount;
    }
  };

  const handleEquipClick = (moduleId: ModuleId) => {
    setSelectedModule(moduleId);
    setShowSlotSelect(true);
  };

  const handleSlotSelect = (slotIndex: 0 | 1 | 2) => {
    if (selectedModule) {
      handleEquip(selectedModule, slotIndex);
    }
    setShowSlotSelect(false);
    setSelectedModule(null);
  };

  const handlePurchase = (moduleId: ModuleId) => {
    onPurchaseModule(moduleId);
    setPurchaseModal(null);
  };

  return (
    <section className="rm-screen">
      <div className="rm-bg-grid" />

      <header className="rm-hud">
        <div>
          <p className="rm-kicker">HEXIUM · REACTOR MODULES</p>
          <h1>Modules</h1>
        </div>
        <div className="rm-resources">
          <span className="rm-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="rm-pill"><b>⬡</b> {shards.toLocaleString()}</span>
          <span className="rm-pill rm-pill-premium"><b>★</b> {premium.toLocaleString()}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="rm-tabs">
        <button
          className={`rm-tab ${activeTab === "slots" ? "active" : ""}`}
          onClick={() => setActiveTab("slots")}
        >
          ⚙️ Slots
        </button>
        <button
          className={`rm-tab ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          📦 Modules
        </button>
        <button
          className={`rm-tab ${activeTab === "combo" ? "active" : ""}`}
          onClick={() => setActiveTab("combo")}
        >
          🎯 Daily Combo
        </button>
      </div>

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div className="rm-content">
          <div className="rm-slots-grid">
            {[0, 1, 2].map((slotIdx) => {
              const slotKey = `slot${slotIdx + 1}` as keyof typeof equipped;
              const moduleId = equipped[slotKey];
              const module = moduleId ? getModuleById(moduleId) : null;

              return (
                <div key={slotIdx} className={`rm-slot ${module ? "equipped" : "empty"}`}>
                  <div className="rm-slot-header">
                    <span className="rm-slot-id">SLOT {slotIdx + 1}</span>
                    {module && (
                      <button
                        className="rm-slot-remove"
                        onClick={() => handleUnequip(slotIdx as 0 | 1 | 2)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {module ? (
                    <div className="rm-slot-module">
                      <div
                        className="rm-slot-icon"
                        style={{ borderColor: MODULE_RARITY_COLORS[module.rarity] }}
                      >
                        {module.icon}
                      </div>
                      <div className="rm-slot-info">
                        <span className="rm-slot-name" style={{ color: MODULE_RARITY_COLORS[module.rarity] }}>
                          {module.name}
                        </span>
                        <span className="rm-slot-rarity">{module.rarity.toUpperCase()}</span>
                        <div className="rm-slot-effects">
                          {module.effects.map((effect, i) => (
                            <span key={i} className="rm-slot-effect">{formatEffect(effect)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rm-slot-empty">
                      <span className="rm-slot-empty-icon">+</span>
                      <span className="rm-slot-empty-text">Empty Slot</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Effects */}
          <div className="rm-total-effects">
            <h3>Combined Effects</h3>
            <div className="rm-effects-list">
              {(() => {
                const effects: string[] = [];
                const modules = [equipped.slot1, equipped.slot2, equipped.slot3]
                  .filter(Boolean)
                  .map((id) => getModuleById(id!))
                  .filter(Boolean);

                const tapBonus = modules.reduce((sum, m) => sum + (m!.effects.find(e => e.type === "tap_power")?.value ?? 0), 0);
                const autoHex = modules.reduce((sum, m) => sum + (m!.effects.find(e => e.type === "auto_hex")?.value ?? 0), 0);
                const hexMulti = modules.reduce((sum, m) => sum + (m!.effects.find(e => e.type === "hex_multiplier")?.value ?? 0), 0);
                const critChance = modules.reduce((sum, m) => sum + (m!.effects.find(e => e.type === "crit_chance")?.value ?? 0), 0);

                if (tapBonus > 0) effects.push(`+${tapBonus} Tap Power`);
                if (autoHex > 0) effects.push(`+${autoHex} HEX/sec`);
                if (hexMulti > 0) effects.push(`+${hexMulti}% HEX Multi`);
                if (critChance > 0) effects.push(`+${critChance}% Crit Chance`);

                if (effects.length === 0) effects.push("No modules equipped");
                return effects.map((e, i) => <span key={i} className="rm-effect-tag">{e}</span>);
              })()}
            </div>
          </div>

          {/* Combo Bonus */}
          {comboActive && comboBonus.hexMultiplierBonus > 0 && (
            <div className="rm-combo-bonus">
              <span className="rm-combo-icon">🎯</span>
              <span className="rm-combo-text">
                DAILY COMBO ACTIVE! +{comboBonus.hexMultiplierBonus}% HEX Multi
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div className="rm-content">
          {/* Rarity Filter */}
          <div className="rm-filters">
            {(["all", "common", "rare", "epic", "legendary", "quantum"] as const).map((rarity) => (
              <button
                key={rarity}
                className={`rm-filter ${filterRarity === rarity ? "active" : ""}`}
                onClick={() => setFilterRarity(rarity)}
                style={rarity !== "all" ? { borderColor: MODULE_RARITY_COLORS[rarity] } : undefined}
              >
                {rarity === "all" ? "ALL" : rarity.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Module Grid */}
          <div className="rm-module-grid">
            {filteredModules.map((module) => {
              const isOwned = unlockedModules.includes(module);
              const isEquippedMod = isModuleEquipped(equipped, module.id);
              const affordable = canAfford(module);
              const isLocked = reactorLevel < module.unlockLevel;

              return (
                <div
                  key={module.id}
                  className={`rm-module-card ${isEquippedMod ? "equipped" : ""} ${isLocked ? "locked" : ""}`}
                  style={{ borderColor: MODULE_RARITY_COLORS[module.rarity] }}
                >
                  <div className="rm-module-header">
                    <span className="rm-module-icon" style={{ color: MODULE_RARITY_COLORS[module.rarity] }}>
                      {module.icon}
                    </span>
                    <span className="rm-module-rarity" style={{ color: MODULE_RARITY_COLORS[module.rarity] }}>
                      {module.rarity.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="rm-module-name">{module.name}</h3>
                  <p className="rm-module-desc">{module.description}</p>

                  <div className="rm-module-effects">
                    {module.effects.map((effect, i) => (
                      <span key={i} className="rm-module-effect">{formatEffect(effect)}</span>
                    ))}
                  </div>

                  <div className="rm-module-footer">
                    <span className="rm-module-cost">
                      {module.cost.currency === "hex" && `⬡ ${module.cost.amount.toLocaleString()}`}
                      {module.cost.currency === "shards" && `◆ ${module.cost.amount}`}
                      {module.cost.currency === "premium" && `★ ${module.cost.amount}`}
                    </span>

                    {isLocked ? (
                      <span className="rm-module-lock">LVL {module.unlockLevel}+</span>
                    ) : isEquippedMod ? (
                      <span className="rm-module-equipped">EQUIPPED</span>
                    ) : (
                      <button
                        className="rm-module-action"
                        onClick={() => handleEquipClick(module.id)}
                        disabled={!affordable}
                      >
                        {affordable ? "EQUIP" : "NEED FUNDS"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Combo Tab */}
      {activeTab === "combo" && (
        <div className="rm-content">
          <div className="rm-combo-header">
            <h2>🎯 Daily Combo</h2>
            <p className="rm-combo-date">{DAILY_COMBO.date}</p>
          </div>

          {comboActive ? (
            <>
              <div className="rm-combo-modules">
                {DAILY_COMBO.modules.map((moduleId, idx) => {
                  const module = getModuleById(moduleId);
                  if (!module) return null;
                  const isEquippedMod = isModuleEquipped(equipped, moduleId);

                  return (
                    <div key={idx} className={`rm-combo-card ${isEquippedMod ? "match" : ""}`}>
                      <div
                        className="rm-combo-card-icon"
                        style={{ borderColor: MODULE_RARITY_COLORS[module.rarity] }}
                      >
                        {module.icon}
                      </div>
                      <span className="rm-combo-card-name" style={{ color: MODULE_RARITY_COLORS[module.rarity] }}>
                        {module.name}
                      </span>
                      <span className="rm-combo-card-rarity">{module.rarity.toUpperCase()}</span>
                      {isEquippedMod && <span className="rm-combo-card-check">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="rm-combo-bonus-display">
                <span className="rm-combo-bonus-label">COMBO BONUS</span>
                <span className="rm-combo-bonus-value">
                  +{DAILY_COMBO.bonus.value}% {DAILY_COMBO.bonus.type === "hex_multiplier" ? "HEX Multi" : "Tap Power"}
                </span>
                <span className="rm-combo-match">
                  {comboBonus.hexMultiplierBonus > 0 || comboBonus.tapPowerBonus > 0
                    ? "ACTIVE!"
                    : "Equip 2+ combo modules to activate"}
                </span>
              </div>

              <div className="rm-combo-hint">
                <p>Equip 2 modules → 1x bonus</p>
                <p>Equip 3 modules → 1.5x bonus</p>
              </div>
            </>
          ) : (
            <div className="rm-combo-expired">
              <span className="rm-combo-expired-icon">⏰</span>
              <h3>No Combo Today</h3>
              <p>Check back tomorrow for a new combo!</p>
            </div>
          )}
        </div>
      )}

      {/* Slot Select Modal */}
      {showSlotSelect && selectedModule && (
        <div className="rm-modal-overlay" onClick={() => setShowSlotSelect(false)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Slot</h3>
            <p>Choose where to equip this module:</p>
            <div className="rm-modal-slots">
              {[0, 1, 2].map((slotIdx) => {
                const slotKey = `slot${slotIdx + 1}` as keyof typeof equipped;
                const currentModule = equipped[slotKey] ? getModuleById(equipped[slotKey]!) : null;

                return (
                  <button
                    key={slotIdx}
                    className="rm-modal-slot"
                    onClick={() => handleSlotSelect(slotIdx as 0 | 1 | 2)}
                  >
                    <span className="rm-modal-slot-id">Slot {slotIdx + 1}</span>
                    {currentModule && (
                      <span className="rm-modal-slot-current">
                        {currentModule.icon} {currentModule.name}
                      </span>
                    )}
                    <span className="rm-modal-slot-arrow">→</span>
                  </button>
                );
              })}
            </div>
            <button className="rm-modal-cancel" onClick={() => setShowSlotSelect(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button className="rm-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default ReactorModulesScreen;
