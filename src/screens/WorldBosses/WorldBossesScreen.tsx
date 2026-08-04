/* ═══════════════════════════════════════════════════════
   WorldBossesScreen — Premium Visual Pass V1
   Daily boss with tap damage
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useRef } from "react";

import type { WorldBossesProps } from "./WorldBosses.types";
import type { WorldBossState, BossDef } from "../../game/worldBosses/worldBossesData";
import type { LuckTier } from "../../game/reactor/reactorBalance";

import {
  emptyState,
  initState,
  ensureActiveBoss,
  getBossDef,
  getHpPercent,
  getDamagePercent,
  getTimeRemaining,
  calculateAttackDamage,
  performAttack,
  claimRewards,
} from "../../game/worldBosses/worldBossesLogic";

import { BOSS_BY_ID } from "../../game/worldBosses/worldBossesData";

import "./WorldBosses.css";

const STORAGE_KEY = "hexium_world_boss_v1";

function loadState(): WorldBossState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return JSON.parse(raw) as WorldBossState;
  } catch {
    return emptyState();
  }
}

function saveState(s: WorldBossState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota */ }
}

type Toast = { id: number; text: string; tone: "ok" | "warn" };

let toastId = 0;

function formatDamage(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.floor(n));
}

export function WorldBossesScreen({
  hex,
  shards,
  tapPower,
  moduleEffects,
  artifactEffects,
  onNavigate,
  dispatch,
}: WorldBossesProps) {
  const [state, setState] = useState<WorldBossState>(() => {
    const loaded = loadState();
    return ensureActiveBoss(loaded, Date.now());
  });
  const [now, setNow] = useState(Date.now());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastDamage, setLastDamage] = useState(0);
  const [lastTier, setLastTier] = useState<LuckTier | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [hpFlash, setHpFlash] = useState(false);
  const attackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const boss: BossDef | null = getBossDef(state);
  const hpPercent = getHpPercent(state);
  const damagePercent = getDamagePercent(state);
  const isDead = state.currentHp <= 0;
  const timeLeft = getTimeRemaining(state, now);
  const isLowHp = hpPercent > 0 && hpPercent < 25;

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
    };
  }, []);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const handleAttack = useCallback(() => {
    if (isDead || isAttacking) return;

    const { damage, luckTier } = calculateAttackDamage(tapPower, moduleEffects, artifactEffects);
    const result = performAttack(state, damage, Date.now());

    if (!result.ok) {
      pushToast(
        result.reason === "dead" ? "Boss already defeated!" :
        result.reason === "expired" ? "Boss event ended" :
        "Max attacks reached",
        "warn",
      );
      return;
    }

    setState(result.state);
    setLastDamage(result.damage);
    setLastTier(luckTier);
    setIsAttacking(true);
    setHpFlash(true);

    try {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(luckTier.vibratePattern);
      }
    } catch { /* not available */ }

    if (result.isDead) {
      pushToast("BOSS DEFEATED! Claim your rewards!", "ok");
    }

    setTimeout(() => {
      setIsAttacking(false);
      setLastDamage(0);
      setLastTier(null);
    }, 700);

    setTimeout(() => setHpFlash(false), 300);
  }, [state, isDead, isAttacking, tapPower, moduleEffects, artifactEffects, pushToast]);

  const handleClaim = useCallback(() => {
    const result = claimRewards(state, Date.now());
    if (!result.ok) {
      pushToast(
        result.reason === "not_dead" ? "Boss not defeated yet" :
        result.reason === "already_claimed" ? "Already claimed" :
        "No rewards available",
        "warn",
      );
      return;
    }

    for (const reward of result.rewards) {
      if (reward.type === "hex") {
        dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: reward.amount });
      } else if (reward.type === "research_points") {
        dispatch({ type: "ADD_CURRENCY", currency: "researchPoints", amount: reward.amount });
      } else if (reward.type === "module_fragment") {
        dispatch({ type: "ADD_CURRENCY", currency: "premium", amount: reward.amount });
      } else if (reward.type === "artifact_shard") {
        dispatch({ type: "ADD_CURRENCY", currency: "shards", amount: reward.amount });
      }
    }

    setState(result.state);
    pushToast("Rewards claimed!", "ok");
  }, [state, dispatch, pushToast]);

  const hpBarColor = isDead
    ? "#4fe08a"
    : hpPercent > 50
      ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
      : hpPercent > 20
        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
        : "linear-gradient(90deg, #ef4444, #f87171)";

  const segments = 20;

  return (
    <section className="wb-screen">
      <div className="wb-bg-grid" />

      <header className="wb-hud">
        <div>
          <p className="wb-kicker">HEXIUM · WORLD BOSS</p>
          <h1>World Boss</h1>
          <p className="wb-sub">{timeLeft !== "ENDED" ? `⏱ Ends in ${timeLeft}` : "Event Ended"}</p>
        </div>
        <div className="wb-resources">
          <span className="wb-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="wb-pill"><b>◆</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      {boss && (
        <>
          {/* Boss Card */}
          <div className={`wb-boss-card ${isDead ? "dead" : ""} ${isAttacking ? "attacking" : ""}`}>
            <div className="wb-boss-header">
              <div className="wb-boss-icon-wrap">
                {boss.icon}
                <span className="wb-boss-icon-badge">BOSS</span>
              </div>
              <div className="wb-boss-info">
                <h2 className="wb-boss-name">{boss.name}</h2>
                <p className="wb-boss-desc">{boss.description}</p>
                <div className="wb-boss-badges">
                  <span className="wb-badge wb-badge-threat">⚠ THREAT: HIGH</span>
                  <span className="wb-badge wb-badge-rarity">LEGENDARY</span>
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="wb-hp-section">
              <div className="wb-hp-label">
                <span style={{ color: isDead ? "#4fe08a" : isLowHp ? "#ff5050" : "#8ea7c7", fontWeight: isLowHp ? 700 : 400 }}>
                  {isDead ? "DEFEATED" : isLowHp ? "⚠ LOW HP" : "HP"}
                </span>
                <span style={{ color: isDead ? "#4fe08a" : "#c0d0e0", fontWeight: 700 }}>
                  {formatDamage(state.currentHp)} / {formatDamage(boss.maxHp)}
                </span>
              </div>
              <div className={`wb-hp-bar ${hpFlash ? "wb-hp-flash" : ""}`}>
                <div
                  className={`wb-hp-fill ${isLowHp && !isDead ? "wb-hp-low" : ""}`}
                  style={{
                    width: `${hpPercent}%`,
                    background: hpBarColor,
                  }}
                />
                <div className="wb-hp-segments">
                  {Array.from({ length: segments }).map((_, i) => (
                    <div key={i} className="wb-hp-segment" />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="wb-stats">
              <div className="wb-stat">
                <span className="wb-stat-label">Damage</span>
                <span className="wb-stat-value">{formatDamage(state.totalDamage)}</span>
              </div>
              <div className="wb-stat">
                <span className="wb-stat-label">Contribution</span>
                <span className="wb-stat-value">{damagePercent.toFixed(1)}%</span>
              </div>
              <div className="wb-stat">
                <span className="wb-stat-label">Attacks</span>
                <span className="wb-stat-value">{state.attackCount}</span>
              </div>
            </div>

            {/* Damage Popup */}
            {lastDamage > 0 && lastTier && (
              <div className={`wb-damage-popup ${lastTier.cssClass}`}>
                {lastTier.label && <span className="wb-damage-tier">{lastTier.label}</span>}
                <span className="wb-damage-value">-{formatDamage(lastDamage)}</span>
              </div>
            )}
          </div>

          {/* Attack Button */}
          {!isDead && timeLeft !== "ENDED" && (
            <button
              className={`wb-attack-btn ${isAttacking ? "cooldown" : ""}`}
              onClick={handleAttack}
              disabled={isAttacking}
            >
              {isAttacking ? "⚔ ATTACKING..." : "⚔ ATTACK"}
            </button>
          )}

          {/* Claim Button */}
          {isDead && !state.claimed && (
            <button className="wb-claim-btn" onClick={handleClaim}>
              🎁 CLAIM REWARDS
            </button>
          )}

          {isDead && state.claimed && (
            <div className="wb-claimed">
              <span className="wb-claimed-icon">✓</span>
              <span>Rewards Claimed</span>
            </div>
          )}

          {/* Rewards Table */}
          <div className="wb-rewards-section">
            <h3>Rewards by Damage</h3>
            <div className="wb-rewards-table">
              {boss.rewards.map((reward, i) => {
                const qualified = damagePercent >= reward.minDamagePercent;
                const rewardLabel = reward.type === "hex" ? `${reward.amount.toLocaleString()} HEX`
                  : reward.type === "research_points" ? `${reward.amount} Research`
                  : reward.type === "module_fragment" ? `${reward.amount} Module Frag`
                  : `${reward.amount} Artifact Shard`;

                return (
                  <div key={i} className={`wb-reward-row ${qualified ? "qualified" : ""}`}>
                    <span className="wb-reward-threshold">{`>${reward.minDamagePercent}%`}</span>
                    <span className="wb-reward-value">{rewardLabel}</span>
                    {qualified && <span className="wb-reward-check">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Toasts */}
      <div className="wb-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`wb-toast ${t.tone}`}>{t.text}</div>
        ))}
      </div>

      <button className="wb-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>
    </section>
  );
}

export default WorldBossesScreen;
