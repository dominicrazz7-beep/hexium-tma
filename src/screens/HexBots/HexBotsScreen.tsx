/* ═══════════════════════════════════════════════════════
   HEX-BOTS Hangar — v7 design integrated into the real project
   VISUAL PASS: premium 3D hangar (featured bot, platform, light
   beam, robotic manipulators, depth, rarity frames, quantum look).
   Logic UNCHANGED: unlock (shards), upgrade (hex), deploy toggle,
   live + offline HEX/sec accrual. Mirrors MainReactor patterns.
   ═══════════════════════════════════════════════════════ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HexBotsProps, FleetState, BotToast } from "./HexBots.types";
import {
  BOT_ROSTER,
  BOT_BY_ID,
  DEV_UNLOCK_ALL_BOTS,
  getBotStage,
  initialFleet,
} from "../../game/bots/botsData";
import { RARITY_RC } from "../../game/bots/botsBalance";
import {
  botRate,
  upgradeCost,
  isMaxed,
  totalRate,
  ownedCount,
  activeCount,
  collectionStars,
  featuredBot,
  unlockBot,
  upgradeBot,
  mergeBot,
  toggleBot,
  collectOffline,
  normalizeFleet,
} from "../../game/bots/botsLogic";
import "./HexBots.css";

const FLEET_STORAGE_KEY = "hexium_bots_state_v1";
const FLEET_STORAGE_KEY_V2 = "hexium_bots_evolution_v2";

function loadFleet(): FleetState {
  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY_V2) || localStorage.getItem(FLEET_STORAGE_KEY);
    if (!raw) return initialFleet();
    const parsed = JSON.parse(raw) as Partial<FleetState>;
    const base = initialFleet();
    const bots = { ...base.bots };
    if (parsed.bots) {
      for (const id of Object.keys(bots)) {
        if (parsed.bots[id]) bots[id] = { ...bots[id], ...parsed.bots[id] };
      }
    }
    const fleet = normalizeFleet({ bots, lastSeen: parsed.lastSeen ?? Date.now() });
    if (DEV_UNLOCK_ALL_BOTS) {
      for (const id of Object.keys(fleet.bots)) {
        fleet.bots[id].owned = true;
        fleet.bots[id].active = true;
        if (fleet.bots[id].lvl < 3) fleet.bots[id].lvl = 3;
      }
    }
    return fleet;
  } catch {
    return initialFleet();
  }
}

function saveFleet(f: FleetState) {
  try {
    localStorage.setItem(FLEET_STORAGE_KEY_V2, JSON.stringify(f));
    localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(f));
  } catch {
    /* quota — ignore */
  }
}

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "K";
  return Math.floor(n).toLocaleString();
}

/** Top-tier rarities get the extra "quantum/legendary" hangar treatment. */
function isApex(rarity: string): boolean {
  return rarity === "legendary" || rarity === "epic";
}

function starsText(stars = 1): string {
  return "★".repeat(stars) + "☆".repeat(Math.max(0, 5 - stars));
}

let toastId = 0;

export function HexBotsScreen({
  hex = 0,
  shards = 0,
  onNavigate,
  dispatch,
}: HexBotsProps) {
  const [fleet, setFleet] = useState<FleetState>(loadFleet);
  const [toasts, setToasts] = useState<BotToast[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const fleetRef = useRef(fleet);
  fleetRef.current = fleet;

  /* Persist on change */
  useEffect(() => {
    saveFleet(fleet);
  }, [fleet]);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  /* Refresh the fleet clock on mount. Bot HEX/sec (live + offline) is now
     granted globally by the unified economy engine (useGlobalEconomy), so this
     screen no longer dispatches income itself — preventing double-counting. */
  useEffect(() => {
    const { fleet: refreshed } = collectOffline(fleetRef.current, Date.now());
    setFleet(refreshed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Derived ── */
  const rate = useMemo(() => totalRate(fleet), [fleet]);
  const owned = ownedCount(fleet);
  const active = activeCount(fleet);
  const feat = selectedBotId ? BOT_BY_ID[selectedBotId]! : featuredBot(fleet);
  const featSt = fleet.bots[feat.id];
  const featStage = getBotStage(feat, featSt?.stars ?? 1);
  const featRc = RARITY_RC[featStage.rarity];
  const featRate = botRate(feat, featSt?.lvl ?? 1, featSt?.stars ?? 1);
  const apex = isApex(featStage.rarity);
  const albumStars = collectionStars(fleet);

  /* ── Actions ── */
  const handleUnlock = useCallback(
    (id: string) => {
      const res = unlockBot(fleetRef.current, id);
      if (!res.ok) {
        pushToast("Need more fragments", "warn");
        return;
      }
      setFleet(res.fleet);
      if (res.spentShards && dispatch) {
        dispatch({ type: "ADD_CURRENCY", currency: "shards", amount: -res.spentShards });
      }
      pushToast(`${BOT_BY_ID[id]?.name} unlocked`, "ok");
    },
    [shards, dispatch, pushToast],
  );

  const handleUpgrade = useCallback(
    (id: string) => {
      const res = upgradeBot(fleetRef.current, id, hex);
      if (!res.ok) {
        pushToast("Not enough HEX", "warn");
        return;
      }
      setFleet(res.fleet);
      if (res.spentHex && dispatch) {
        dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: -res.spentHex });
      }
      pushToast(`${BOT_BY_ID[id]?.name} → LVL ${res.fleet.bots[id].lvl}`, "ok");
    },
    [hex, dispatch, pushToast],
  );

  const handleToggle = useCallback((id: string) => {
    setFleet((f) => toggleBot(f, id));
  }, []);

  const handleMerge = useCallback((id: string) => {
    const res = mergeBot(fleetRef.current, id);
    if (!res.ok) {
      pushToast("Need 3 copies to evolve", "warn");
      return;
    }
    setFleet(res.fleet);
    pushToast(`${BOT_BY_ID[id]?.name} evolved`, "ok");
  }, [pushToast]);

  return (
    <section className="hb-screen" style={{ ["--sa" as any]: featRc }}>
      <div className="hb-bg-grid" />
      <div className="hb-bg-glow" style={{ ["--rc" as any]: featRc }} />

      {/* ── Header ── */}
      <header className="hb-head">
        <div className="hb-head-row">
          <button className="hb-back" onClick={() => onNavigate?.("main_reactor")} aria-label="Back">
            ‹
          </button>
          <p className="hb-kicker">HEXIUM · ROBOTICS DIVISION</p>
          <div className="hb-resources">
            <span className="hb-pill"><b>HEX</b> {fmt(hex)}</span>
            <span className="hb-pill alt"><b>◈</b> {fmt(shards)}</span>
          </div>
        </div>
        <h1 className="hb-title">HEX-BOTS Hangar</h1>
        <p className="hb-sub">{active} classes deployed · {rate.toFixed(1)} HEX/sec output · {albumStars}/30 album stars</p>
      </header>

      {/* ════════ 3D HANGAR BAY (featured bot) ════════ */}
      <div
        className={`hb-hangar rarity-${featStage.rarity}${apex ? " apex" : ""}`}
        style={{ ["--rc" as any]: featRc }}
      >
        {/* scene depth */}
        <div className="hb-scene-wall left" />
        <div className="hb-scene-wall right" />
        <div className="hb-scene-ceil" />
        <div className="hb-scene-floor" />
        <div className="hb-scene-grid" />
        <div className="hb-scene-haze" />

        {/* overhead light projector + beam */}
        <div className="hb-projector" />
        <div className="hb-beam" />
        <div className="hb-beam-dust">
          <span /><span /><span /><span /><span /><span />
        </div>

        {/* robotic manipulator arms */}
        <div className="hb-arm left">
          <span className="hb-arm-base" />
          <span className="hb-arm-seg s1" />
          <span className="hb-arm-joint j1" />
          <span className="hb-arm-seg s2" />
          <span className="hb-arm-claw" />
        </div>
        <div className="hb-arm right">
          <span className="hb-arm-base" />
          <span className="hb-arm-seg s1" />
          <span className="hb-arm-joint j1" />
          <span className="hb-arm-seg s2" />
          <span className="hb-arm-claw" />
        </div>

        {/* platform / docking pad */}
        <div className="hb-platform">
          <span className="hb-platform-glow" />
          <span className="hb-platform-ring r1" />
          <span className="hb-platform-ring r2" />
          <span className="hb-platform-core" />
        </div>
        <span className="hb-strut left" />
        <span className="hb-strut right" />

        {/* featured bot */}
        <div className="hb-featbot">
          {apex && <span className="hb-apex-aura" />}
          <span className="hb-featbot-halo r1" />
          <span className="hb-featbot-halo r2" />
          <span className="hb-featbot-shadow" />
        {feat.image ? (
           <img
             src={feat.image}
             alt={featStage.name}
             className="hb-featbot-image"
           />
         ) : (
           <span className="hb-featbot-icon">{featStage.icon}</span>
         )}
          {apex && (
            <span className="hb-spark-field">
              <span /><span /><span /><span /><span /><span />
            </span>
          )}
        </div>

        {/* holographic readouts */}
        <div className="hb-holo tl">
          <span className="hb-holo-l">OUTPUT</span>
          <span className="hb-holo-v">+{featRate.toFixed(1)}/s</span>
        </div>
        <div className="hb-holo tr">
          <span className="hb-holo-l">UNIT LVL</span>
          <span className="hb-holo-v">{starsText(featSt?.stars ?? 1)}</span>
        </div>
        <div className="hb-holo bl">
          <span className="hb-holo-l">STATUS</span>
          <span className="hb-holo-v">{featSt?.active ? "ONLINE" : "DOCKED"}</span>
        </div>

        {/* featured nameplate */}
        <div className="hb-feat-plate">
          <span className={`hb-feat-rarity hb-tag-${featStage.rarity}`}>{featStage.rarity}</span>
          <div className="hb-feat-txt">
            <div className="hb-feat-name">{featStage.name}</div>
            <div className="hb-feat-role">{feat.role} · {feat.bonusLabel}</div>
          </div>
          <div className="hb-feat-rate">+{featRate.toFixed(1)}<small>/s</small></div>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="hb-chips">
        <div className="hb-chip">
          <span className="hb-chip-ic">🛰</span>
          <span className="hb-chip-tx"><b>{active}/{owned}</b><small>DEPLOYED</small></span>
        </div>
        <div className="hb-chip accent">
          <span className="hb-chip-ic">⚡</span>
          <span className="hb-chip-tx"><b>{rate.toFixed(1)}/s</b><small>HANGAR RATE</small></span>
        </div>
        <div className="hb-chip">
          <span className="hb-chip-ic">🤖</span>
          <span className="hb-chip-tx"><b>{albumStars}/30</b><small>BOT INDEX</small></span>
        </div>
      </div>

      {/* ── Roster ── */}
      <div className="hb-sec-label">⬢ Evolution Roster <span className="hb-sec-count">{albumStars}/30 ★</span></div>
      <div className="hb-bot-grid">
        {BOT_ROSTER.map((b) => {
          const st = fleet.bots[b.id];
          const stage = getBotStage(b, st?.stars ?? 1);
          const rc = RARITY_RC[stage.rarity];
          const maxed = isMaxed(st.lvl);
          const cost = upgradeCost(b, st.lvl, st.stars);
          const cardApex = isApex(stage.rarity);
          const canUnlock = !st.owned && st.fragments >= b.unlockFragments;
          const canMergeBot = st.owned && st.stars < 5 && st.copies >= 3;
          return (
            <div
              key={b.id}
              className={`hb-bot-card rarity-${stage.rarity}${st.owned ? "" : " locked"}${cardApex ? " apex" : ""}${st.owned && st.active ? " online" : ""}`}
              style={{ ["--rc" as any]: rc }}
              onClick={() => st.owned && setSelectedBotId(b.id)}
            >
              <span className="hb-card-frame" />
              <span className="hb-card-corner tl" />
              <span className="hb-card-corner tr" />
              <span className="hb-card-corner bl" />
              <span className="hb-card-corner br" />

              <div className="hb-bot-top">
                <div className="hb-bot-av">
                  <span className="hb-bot-av-ring" />
                  <span className="hb-bot-av-icon">{stage.icon}</span>
                  {st.owned && st.active && <span className="hb-bot-on" />}
                </div>
                <div className="hb-bot-meta">
                  <div className="hb-bot-name">{stage.name}</div>
                  <div className="hb-bot-role">{b.bonusLabel}</div>
                  <span className={`hb-rarity-tag hb-tag-${stage.rarity}`}>{starsText(st.stars)} · {stage.rarity}</span>
                </div>
                {st.owned && (
                  <button
                    className={`hb-switch${st.active ? " on" : ""}`}
                    onClick={() => handleToggle(b.id)}
                    aria-label="Toggle deploy"
                  >
                    <span className="hb-switch-knob" />
                  </button>
                )}
              </div>

              {/* mini level pips */}
              {st.owned && (
                <div className="hb-bot-pips">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`hb-pip${i < st.stars ? " fill" : ""}`} />
                  ))}
                </div>
              )}

              <div className="hb-bot-foot">
                {st.owned ? (
                  <span className="hb-bot-rate">
                    <b>+{botRate(b, st.lvl, st.stars).toFixed(1)}</b>/s · LVL {st.lvl} · Copies {st.copies}/3
                  </span>
                ) : (
                  <span className="hb-bot-lock">🧩 {st.fragments}/{b.unlockFragments} fragments</span>
                )}
                {st.owned ? (
                  <div className="hb-actions">
                    <button
                      className="hb-btn sm"
                      disabled={maxed || hex < cost}
                      onClick={() => handleUpgrade(b.id)}
                    >
                      {maxed ? "MAX" : `▲ ${fmt(cost)}`}
                    </button>
                    <button
                      className="hb-btn sm buy"
                      disabled={!canMergeBot}
                      onClick={() => handleMerge(b.id)}
                    >
                      EVOLVE
                    </button>
                  </div>
                ) : (
                  <button
                    className="hb-btn sm buy"
                    disabled={!canUnlock}
                    onClick={() => handleUnlock(b.id)}
                  >
                    CREATE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toasts ── */}
      <div className="hb-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`hb-toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HexBotsScreen;
