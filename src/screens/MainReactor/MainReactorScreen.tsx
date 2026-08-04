/* ═══════════════════════════════════════════════════════
   MainReactorScreen — Clicker core orchestrator
   Manages: tap → HEX, energy, temperature, turbo, upgrades
   ═══════════════════════════════════════════════════════ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  REACTOR_BALANCE,
  getUpgradeCost,
  getUpgradeValue,
  getReactorLevel,
  getReactorTier,
  getTierProgress,
  getHeatState,
} from "../../game/reactor/reactorBalance";
import { createInitialReactorState } from "../../game/reactor/reactorData";
import {
  performTap,
  tickReactor,
  activateTurbo,
  isTurboAvailable,
  purchaseUpgrade,
  getTempPercent,
  getTempColorClass,
  getEnergyPercent,
  getAutoHexPerSec,
  getCurrentTapPower,
  type ModuleEffects,
  EMPTY_MODULE_EFFECTS,
} from "../../game/reactor/reactorLogic";

import type {
  MainReactorScreenProps,
  FloatingReward,
  ReactorVisualState,
  UpgradeDisplayItem,
  UpgradeKey,
  Spark,
} from "./MainReactor.types";

import ReactorCore from "./components/ReactorCore";
import EnergyBar from "./components/EnergyBar";
import TemperatureGauge from "./components/TemperatureGauge";
import UpgradePanel from "./components/UpgradePanel";
import FloatingRewards from "./components/FloatingRewards";

import { calculateModuleEffects, calculateComboBonus, generateDailyCombo } from "../../game/reactorModules/reactorModulesLogic";
import type { EquippedModules } from "../../game/reactorModules/reactorModulesData";
import { type ArtifactsState, emptyState as emptyArtifactsState, calculateEffects as calcArtifactEffects, applyArtifactEffects, getCollectionBonus } from "../../game/artifacts/artifactsLogic";
import { type AscensionState, emptyState as emptyAscensionState, calculateBonuses as calcAscBonuses } from "../../game/ascension/ascensionLogic";
import { ASCENSION_BALANCE } from "../../game/ascension/ascensionBalance";

import "./MainReactor.css";

/* ── Persistence key for reactor-local state ───────── */
const REACTOR_STORAGE_KEY = "hexium_reactor_state_v1";
const MODULES_STORAGE_KEY = "hexium_reactor_modules_v1";
const ARTIFACTS_STORAGE_KEY = "hexium_artifacts_v1";
const ASCENSION_STORAGE_KEY = ASCENSION_BALANCE.STORAGE_KEY;

function loadReactorState() {
  try {
    const raw = localStorage.getItem(REACTOR_STORAGE_KEY);
    if (!raw) {
      const ascRaw = localStorage.getItem(ASCENSION_STORAGE_KEY);
      const ascState = ascRaw ? { ...emptyAscensionState(), ...JSON.parse(ascRaw) } : undefined;
      return createInitialReactorState(ascState);
    }
    const parsed = JSON.parse(raw);
    const ascRaw = localStorage.getItem(ASCENSION_STORAGE_KEY);
    const ascState = ascRaw ? { ...emptyAscensionState(), ...JSON.parse(ascRaw) } : undefined;
    const fresh = createInitialReactorState(ascState);
    return {
      ...fresh,
      ...parsed,
      upgrades: { ...fresh.upgrades, ...(parsed.upgrades ?? {}) },
    };
  } catch {
    return createInitialReactorState();
  }
}

function saveReactorState(s: ReturnType<typeof createInitialReactorState>) {
  try {
    localStorage.setItem(REACTOR_STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded — ignore */ }
}

const EMPTY_EQUIPPED: EquippedModules = { slot1: null, slot2: null, slot3: null };

function loadEquippedModules(): EquippedModules {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return EMPTY_EQUIPPED;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_EQUIPPED, ...parsed };
  } catch {
    return EMPTY_EQUIPPED;
  }
}

function loadArtifactsState(): ArtifactsState {
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

function loadAscensionState(): AscensionState {
  try {
    const raw = localStorage.getItem(ASCENSION_STORAGE_KEY);
    if (!raw) return emptyAscensionState();
    return { ...emptyAscensionState(), ...JSON.parse(raw) };
  } catch {
    return emptyAscensionState();
  }
}

/* ── Floating reward / spark counters ──────────────── */
let floatId = 0;
let sparkId = 0;

/* ══════════════════════════════════════════════════════ */
export function MainReactorScreen({
  hex,
  shards,
  totalHexMined,
  totalTaps,
  onNavigate,
  dispatch,
}: MainReactorScreenProps) {
  /* ── Reactor-local state ─────────────────────────── */
  const [reactor, setReactor] = useState(loadReactorState);
  const [floats, setFloats] = useState<FloatingReward[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [equippedModules, setEquippedModules] = useState<EquippedModules>(loadEquippedModules);
  const [artifactsState, setArtifactsState] = useState<ArtifactsState>(loadArtifactsState);
  const [ascensionState, setAscensionState] = useState<AscensionState>(loadAscensionState);
  const rafRef = useRef(0);
  const lastTickRef = useRef(performance.now());
  const reactorRef = useRef(reactor);
  reactorRef.current = reactor;
  const modulesRef = useRef(equippedModules);
  modulesRef.current = equippedModules;
  const artifactsRef = useRef(artifactsState);
  artifactsRef.current = artifactsState;
  const ascensionRef = useRef(ascensionState);
  ascensionRef.current = ascensionState;

  /* ── Ascension bonuses ──── */
  const ascBonuses = useMemo(() => calcAscBonuses(ascensionState), [ascensionState]);

  /* ── Combined effects: modules + combo + artifacts + collection bonus + ascension ──── */
  const baseModuleEffects = useMemo(() => calculateModuleEffects(equippedModules), [equippedModules]);
  const comboBonus = useMemo(() => {
    const combo = generateDailyCombo();
    return calculateComboBonus(combo, equippedModules);
  }, [equippedModules]);
  const moduleEffects: ModuleEffects = useMemo(() => ({
    tapPowerBonus: baseModuleEffects.tapPowerBonus + comboBonus.tapPowerBonus,
    autoHexBonus: baseModuleEffects.autoHexBonus + comboBonus.autoHexBonus,
    energyRegenBonus: baseModuleEffects.energyRegenBonus + comboBonus.energyRegenBonus,
    heatReduction: baseModuleEffects.heatReduction + comboBonus.heatReduction,
    maxEnergyBonus: baseModuleEffects.maxEnergyBonus + comboBonus.maxEnergyBonus,
    critChanceBonus: baseModuleEffects.critChanceBonus + comboBonus.critChanceBonus,
    critMultiplierBonus: baseModuleEffects.critMultiplierBonus + comboBonus.critMultiplierBonus,
    hexMultiplierBonus: baseModuleEffects.hexMultiplierBonus + comboBonus.hexMultiplierBonus,
  }), [baseModuleEffects, comboBonus]);
  const artifactEffects = useMemo(() => calcArtifactEffects(artifactsState), [artifactsState]);
  const collectionBonus = useMemo(() => getCollectionBonus(artifactsState), [artifactsState]);
  const allArtifactEffects: typeof artifactEffects = useMemo(() => ({
    hexMultiplier: artifactEffects.hexMultiplier + collectionBonus.hexMultiplier + (ascBonuses.collectionBoost > 0 ? Math.floor(artifactEffects.hexMultiplier * ascBonuses.collectionBoost / 100) : 0),
    tapPower: artifactEffects.tapPower + collectionBonus.tapPower,
    critChance: artifactEffects.critChance + collectionBonus.critChance,
    critMultiplier: artifactEffects.critMultiplier + collectionBonus.critMultiplier,
    autoHex: artifactEffects.autoHex + collectionBonus.autoHex,
    energyRegen: artifactEffects.energyRegen + collectionBonus.energyRegen,
    modulePower: artifactEffects.modulePower + collectionBonus.modulePower + ascBonuses.artifactPower,
  }), [artifactEffects, collectionBonus, ascBonuses]);
  const combinedEffects: ModuleEffects = useMemo(
    () => applyArtifactEffects(moduleEffects, allArtifactEffects),
    [moduleEffects, allArtifactEffects],
  );
  const modsRef = useRef(combinedEffects);
  modsRef.current = combinedEffects;

  /* ── Listen for localStorage changes (from Modules/Artifacts/Ascension screens) ── */
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key === MODULES_STORAGE_KEY) {
        setEquippedModules(loadEquippedModules());
      }
      if (e.key === ARTIFACTS_STORAGE_KEY) {
        setArtifactsState(loadArtifactsState());
      }
      if (e.key === ASCENSION_STORAGE_KEY) {
        setAscensionState(loadAscensionState());
      }
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  /* ── Periodically re-read modules + artifacts (for same-tab updates) ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setEquippedModules(loadEquippedModules());
      setArtifactsState(loadArtifactsState());
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  /* ── Persist on every reactor change ─────────────── */
  useEffect(() => {
    saveReactorState(reactor);
  }, [reactor]);

  /* ── Game loop (requestAnimationFrame) ───────────── */
  useEffect(() => {
    function loop(now: number) {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      // Pass module + ascension effects to reactor tick for auto-miner, energy regen, heat
      const { state } = tickReactor(reactorRef.current, delta, modsRef.current, ascensionRef.current);
      reactorRef.current = state;
      setReactor(state);

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dispatch]);

  /* ── Derived values ──────────────────────────────── */
  const tempPct = getTempPercent(reactor);
  const tempColor = getTempColorClass(tempPct);
  const energyPct = getEnergyPercent(reactor);
  const autoHexSec = getAutoHexPerSec(reactor, combinedEffects);
  const tapPower = getCurrentTapPower(reactor, combinedEffects, ascensionState);
  const reactorLevel = getReactorLevel(totalHexMined);
  const turboReady = isTurboAvailable(reactor);

  /* ── Reactor Tier + progress + heat state (evolution system) ── */
  const tier = getReactorTier(reactorLevel);
  const tierProgress = getTierProgress(reactorLevel);
  const heatState = getHeatState(tempPct, reactor.isOverheated);

  const visualState: ReactorVisualState = reactor.isOverheated
    ? "overheat"
    : reactor.turboActive
      ? "turbo"
      : reactor.sessionTaps > 0
        ? "active"
        : "idle";

  const isTapDisabled = reactor.energy <= 0 || reactor.isOverheated;

  /* ── Energy sparks on tap (3 variants) ───────────── */
  const spawnSparks = useCallback((isTurbo: boolean) => {
    const n = isTurbo ? 6 : 4;
    const fresh: Spark[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      if (r < 0.4) {
        fresh.push({
          id: ++sparkId,
          kind: "dot",
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          delay: i * 40,
          color: Math.random() > 0.5 ? "cyan" : "purple",
        });
      } else if (r < 0.7) {
        fresh.push({
          id: ++sparkId,
          kind: "arc",
          x: 15 + Math.random() * 50,
          y: 15 + Math.random() * 50,
          rot: Math.random() * 360,
          color: Math.random() > 0.6 ? "purple" : "",
        });
      } else {
        fresh.push({
          id: ++sparkId,
          kind: "line",
          x: 30 + Math.random() * 40,
          y: 30 + Math.random() * 40,
          dx: (Math.random() - 0.5) * 40,
          dy: (Math.random() - 0.5) * 40,
          color: Math.random() > 0.5 ? "purple" : "cyan",
        });
      }
    }
    setSparks((prev) => prev.slice(-12).concat(fresh));
    const ids = fresh.map((s) => s.id);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !ids.includes(s.id)));
    }, 450);
  }, []);

  /* ── Tap handler ─────────────────────────────────── */
  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const result = performTap(reactorRef.current, modsRef.current, ascensionRef.current);
      if (!result) return;

      reactorRef.current = result.state;
      setReactor(result.state);

      // Grant HEX to global state
      dispatch({ type: "MINE_TAP", amount: result.hexGained });

      // Energy sparks burst
      spawnSparks(result.isTurbo);

      // Haptic feedback — stronger for higher tiers
      try {
        if (window.navigator?.vibrate) {
          window.navigator.vibrate(result.luckTier.vibratePattern);
        }
      } catch { /* not available */ }

      // Floating number at tap position
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.();
      let x = 0;
      let y = 0;
      if ("touches" in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ("clientX" in e) {
        x = (e as React.MouseEvent).clientX;
        y = (e as React.MouseEvent).clientY;
      } else if (rect) {
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 3;
      }
      // Random spread
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 30;

      const newFloat: FloatingReward = {
        id: ++floatId,
        amount: result.hexGained,
        x,
        y,
        isCritical: result.isCritical,
        isTurbo: result.isTurbo,
        luckTierName: result.luckTier.name,
        luckLabel: result.luckTier.label,
        cssClass: result.luckTier.cssClass,
      };

      setFloats((prev) => [...prev.slice(-15), newFloat]);

      // Auto-remove after animation
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== newFloat.id));
      }, 950);
    },
    [dispatch, spawnSparks],
  );

  /* ── Turbo handler ───────────────────────────────── */
  const handleTurbo = useCallback(() => {
    const result = activateTurbo(reactorRef.current);
    if (!result) return;
    reactorRef.current = result;
    setReactor(result);
  }, []);

  /* ── Upgrade handler ─────────────────────────────── */
  const handleUpgrade = useCallback(
    (key: UpgradeKey) => {
      const result = purchaseUpgrade(reactorRef.current, key, hex);
      if (!result) return;
      reactorRef.current = result.state;
      setReactor(result.state);
      // Deduct HEX from global state
      dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: -result.cost });
    },
    [hex, dispatch],
  );

  /* ── Build upgrade display items ─────────────────── */
  const upgradeItems: UpgradeDisplayItem[] = useMemo(() => {
    const keys: UpgradeKey[] = ["tapPower", "autoMiner", "energyCapacity", "heatSink"];
    return keys.map((key) => {
      const cfg = REACTOR_BALANCE.UPGRADES[key];
      const level = reactor.upgrades[key] ?? 0;
      const cost = getUpgradeCost(key, level);
      return {
        key,
        label: cfg.label,
        icon: cfg.icon,
        description: cfg.description,
        level,
        maxLevel: cfg.maxLevel,
        cost,
        currentValue: getUpgradeValue(key, level),
        nextValue: getUpgradeValue(key, level + 1),
        canAfford: hex >= cost && level < cfg.maxLevel,
      };
    });
  }, [reactor.upgrades, hex]);

  /* ── Render ──────────────────────────────────────── */
  return (
    <section
      className={`mr-screen mr-tier-${tier.id}`}
      style={{ "--sa": tier.accent, "--tc": tier.accent, "--tc2": tier.accent2 } as React.CSSProperties}
    >
      {/* Sector background evolution (distinct per tier) */}
      <div className={`mr-sector-bg mr-sector-tier${tier.id}`} />
      <div className="mr-sector-haze" />

      {/* Background effects */}
      <div className="mr-bg-grid" />
      <div className={`mr-bg-glow ${visualState}`} />

      {/* Sector header */}
      <div className="mr-sector-header">
        <div className="mr-sector-left">
          <span className="mr-sector-id">SECTOR {String(reactorLevel + 1).padStart(2, "0")}</span>
          <span className="mr-sector-name">{tier.sectorName}</span>
        </div>
        <div className="mr-sector-right">
          <span className="mr-sector-status"><span className="mr-status-dot" />ONLINE</span>
        </div>
      </div>

      {/* Top HUD */}
      <header className="mr-hud">
        <div className="mr-hud-left">
          <p className="mr-kicker">HEXIUM · MAIN REACTOR</p>
          <h1 className="mr-title">
            <span className="mr-tier-mk">{tier.mk}</span> {tier.name}
          </h1>
          {/* Tier progress: makes level-to-level advance visible */}
          <div className="mr-tier-prog">
            <span className="mr-tier-lvl">LVL {reactorLevel}</span>
            <span className="mr-tier-bar">
              <span className="mr-tier-fill" style={{ width: `${Math.round(tierProgress.ratio * 100)}%` }} />
            </span>
            <span className="mr-tier-next">
              {tierProgress.nextTier
                ? `${tierProgress.inTier}/${tierProgress.span} → ${tierProgress.nextTier.mk}`
                : "MAX TIER"}
            </span>
          </div>
        </div>
        <div className="mr-resources">
          <span className="mr-pill">
            <b>HEX</b> {Math.floor(hex).toLocaleString()}
          </span>
          <span className="mr-pill">
            <b>⬢</b> {shards.toLocaleString()} SHARDS
          </span>
          <span className="mr-pill">
            <b>⛏</b> {tapPower}/tap
          </span>
          {autoHexSec > 0 && (
            <span className="mr-pill mr-pill-auto">
              <b>🤖</b> {autoHexSec.toFixed(1)}/s
            </span>
          )}
          {(combinedEffects.hexMultiplierBonus > 0 || combinedEffects.critChanceBonus > 0) && (
            <span className="mr-pill mr-pill-modules">
              <b>⚙</b> {combinedEffects.hexMultiplierBonus > 0 && `+${combinedEffects.hexMultiplierBonus}% HEX`}
              {combinedEffects.hexMultiplierBonus > 0 && combinedEffects.critChanceBonus > 0 && " "}
              {combinedEffects.critChanceBonus > 0 && `+${combinedEffects.critChanceBonus}% Crit`}
            </span>
          )}
        </div>
      </header>

      {/* Gauges: Energy + Temperature */}
      <div className="mr-gauges">
        <EnergyBar
          energy={reactor.energy}
          maxEnergy={reactor.maxEnergy}
          percent={energyPct}
        />
        <TemperatureGauge
          temperature={reactor.temperature}
          maxTemperature={reactor.maxTemperature}
          percent={tempPct}
          colorClass={tempColor}
          isOverheated={reactor.isOverheated}
        />
      </div>

      {/* Reactor Core (tappable) */}
      <ReactorCore
        visualState={visualState}
        heatState={heatState}
        tempPercent={tempPct}
        onTap={handleTap}
        disabled={isTapDisabled}
        turboTimeLeft={reactor.turboTimeLeft}
        reactorLevel={reactorLevel}
        tier={tier}
        sparks={sparks}
      />

      {/* Turbo button */}
      <div className="mr-turbo-row">
        <button
          className={`mr-turbo-btn ${turboReady ? "mr-turbo-ready" : ""}`}
          onClick={handleTurbo}
          disabled={!turboReady}
        >
          🚀 {reactor.turboActive
            ? `TURBO ${reactor.turboTimeLeft.toFixed(0)}s`
            : reactor.turboCooldown > 0
              ? `Cooldown ${Math.ceil(reactor.turboCooldown)}s`
              : "ACTIVATE TURBO"}
        </button>
      </div>

      {/* Stats row */}
      <div className="mr-stats-row">
        <div className="mr-stat">
          <span className="mr-stat-label">Тапи</span>
          <span className="mr-stat-value">{totalTaps.toLocaleString()}</span>
        </div>
        <div className="mr-stat">
          <span className="mr-stat-label">Намайнено</span>
          <span className="mr-stat-value">{Math.floor(totalHexMined).toLocaleString()} HEX</span>
        </div>
        <div className="mr-stat">
          <span className="mr-stat-label">HEX/сек</span>
          <span className="mr-stat-value">{autoHexSec.toFixed(1)}</span>
        </div>
      </div>

      {/* Upgrades */}
      <UpgradePanel upgrades={upgradeItems} onPurchase={handleUpgrade} />

      {/* Quick Access Navigation */}
      <div className="mr-quick-nav">
        <button className="mr-quick-btn" onClick={() => onNavigate("expeditions")}>
          <span className="mr-quick-icon">🚀</span>
          <span className="mr-quick-label">Expeditions</span>
        </button>
        <button className="mr-quick-btn" onClick={() => onNavigate("world_bosses")}>
          <span className="mr-quick-icon">🌍</span>
          <span className="mr-quick-label">World Boss</span>
        </button>
        <button className="mr-quick-btn" onClick={() => onNavigate("corporation")}>
          <span className="mr-quick-icon">👑</span>
          <span className="mr-quick-label">Corporation</span>
        </button>
        {reactorLevel >= 15 && (
          <button className="mr-quick-btn" onClick={() => onNavigate("ascension")}>
            <span className="mr-quick-icon">⚡</span>
            <span className="mr-quick-label">Ascension</span>
          </button>
        )}
      </div>

      {/* Floating reward particles */}
      <FloatingRewards rewards={floats} />
    </section>
  );
}

export default MainReactorScreen;
