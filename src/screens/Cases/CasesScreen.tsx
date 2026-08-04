/* ═══════════════════════════════════════════════════════
   CASES — v7 "Supply Drops" integrated into the real project.
   Featured hero crate, 5 crate tiers with live odds bars, a
   CS:GO-style opening reel animation, and rewards that grant
   real HEX / SHARDS / bot unlocks / boosters / skins.
   Real currency spend via the App reducer; cross-module
   grants written to the bots / shop localStorage modules.
   Mirrors the proven Shop / HEX-BOTS integration pattern.
   ═══════════════════════════════════════════════════════ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CasesProps, CasesState, CasesToast } from "./Cases.types";
import {
  CASE_DEFS,
  CASE_BY_ID,
  FEATURED_CASE_ID,
  RARITY_NAME,
  initialCasesState,
  type CaseDef,
  type RewardDef,
} from "../../game/cases/casesData";
import {
  RARITY_RC,
  REEL_LENGTH,
  REEL_WIN_INDEX,
  REEL_SPIN_MS,
  fmtShort,
} from "../../game/cases/casesBalance";
import {
  openCase,
  buildReel,
  type OwnedSets,
  type Grant,
} from "../../game/cases/casesLogic";
import "./Cases.css";

const CASES_STORAGE_KEY = "hexium_cases_state_v1";
const BOTS_STORAGE_KEY = "hexium_bots_state_v1";
const BOTS_STORAGE_KEY_V2 = "hexium_bots_evolution_v2";
const SHOP_STORAGE_KEY = "hexium_shop_state_v1";

/* ── Persistence ── */
function loadCases(): CasesState {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (!raw) return initialCasesState();
    return { ...initialCasesState(), ...(JSON.parse(raw) as Partial<CasesState>) };
  } catch {
    return initialCasesState();
  }
}
function saveCases(s: CasesState) {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

/** Read what the player owns from the bots + shop modules (for dupe protection). */
function readOwned(): OwnedSets {
  const owned: OwnedSets = { bots: [], skins: [] };
  try {
    const f = JSON.parse(localStorage.getItem(BOTS_STORAGE_KEY_V2) || localStorage.getItem(BOTS_STORAGE_KEY) || "{}");
    if (f?.bots) owned.bots = Object.keys(f.bots).filter((id) => f.bots[id]?.owned);
  } catch {
    /* ignore */
  }
  try {
    const sh = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || "{}");
    if (Array.isArray(sh?.ownedSkins)) owned.skins = sh.ownedSkins;
  } catch {
    /* ignore */
  }
  return owned;
}

/** Apply a bot/skin/booster grant to its owning module's localStorage. */
function applyCrossModuleGrant(g: Grant) {
  if (g.kind === "bot_fragment" || g.kind === "bot_copy") {
    try {
      const f = JSON.parse(localStorage.getItem(BOTS_STORAGE_KEY_V2) || localStorage.getItem(BOTS_STORAGE_KEY) || "{}");
      f.bots = f.bots || {};
      const cur = f.bots[g.botId] || { owned: false, active: false, lvl: 1, stars: 1, fragments: 0, copies: 0 };
      f.bots[g.botId] = g.kind === "bot_fragment"
        ? { ...cur, fragments: Math.max(0, (cur.fragments || 0) + g.amount) }
        : { ...cur, copies: Math.max(0, (cur.copies || 0) + g.amount) };
      localStorage.setItem(BOTS_STORAGE_KEY_V2, JSON.stringify(f));
      localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(f));
    } catch {
      /* ignore */
    }
  } else if (g.kind === "skin") {
    try {
      const sh = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || "{}");
      sh.ownedSkins = Array.isArray(sh.ownedSkins) ? sh.ownedSkins : [];
      if (!sh.ownedSkins.includes(g.skinId)) sh.ownedSkins.push(g.skinId);
      localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(sh));
    } catch {
      /* ignore */
    }
  } else if (g.kind === "booster") {
    try {
      const sh = JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY) || "{}");
      sh.boosters = Array.isArray(sh.boosters) ? sh.boosters : [];
      sh.boosters = sh.boosters.filter((b: any) => b.id !== g.boosterId);
      sh.boosters.push({ id: g.boosterId, expiresAt: g.expiresAt });
      localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(sh));
    } catch {
      /* ignore */
    }
  }
}

type Phase = "idle" | "spinning" | "revealed";
let toastId = 0;

export function CasesScreen({ hex = 0, shards = 0, onNavigate, dispatch }: CasesProps) {
  const [cases, setCases] = useState<CasesState>(loadCases);
  const [toasts, setToasts] = useState<CasesToast[]>([]);

  /* Opening modal state */
  const [openId, setOpenId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [reel, setReel] = useState<RewardDef[]>([]);
  const [reward, setReward] = useState<RewardDef | null>(null);
  const [dupe, setDupe] = useState(false);
  const [offset, setOffset] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);
  const casesRef = useRef(cases);
  casesRef.current = cases;
  const pendingGrantsRef = useRef<Grant[]>([]);
  const pendingStateRef = useRef<CasesState | null>(null);
  const pendingDupeRef = useRef(false);
  const pendingRewardRef = useRef<RewardDef | null>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => saveCases(cases), [cases]);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const balances = { hex, shards };
  const featured = CASE_BY_ID[FEATURED_CASE_ID];
  const canPayCase = (c: CaseDef) => ((c.priceCurrency ?? "shards") === "hex" ? hex : shards) >= c.price;
  const casePriceLabel = (c: CaseDef) => `${fmtShort(c.price)} ${(c.priceCurrency ?? "shards") === "hex" ? "HEX" : "◈"}`;

  const applyGrants = useCallback(() => {
    for (const g of pendingGrantsRef.current) {
      if (g.kind === "currency") dispatch?.({ type: "ADD_CURRENCY", currency: g.currency, amount: g.amount });
      else applyCrossModuleGrant(g);
    }
    if (pendingStateRef.current) setCases(pendingStateRef.current);
    setPhase("revealed");
    const r = pendingRewardRef.current;
    const d = pendingDupeRef.current;
    pushToast(d ? `Duplicate → +${(r?.dupeShards ?? 100)} ◈` : `Won: ${r?.label ?? "reward"}`, "ok");
    pendingGrantsRef.current = [];
    pendingStateRef.current = null;
  }, [dispatch, pushToast]);

  /* ── Open a crate: validate → roll → animate reel → reveal ── */
  const startOpen = useCallback(
    (c: CaseDef) => {
      if (phase === "spinning") return;
      const priceCurrency = c.priceCurrency ?? "shards";
      if ((priceCurrency === "hex" ? hex : shards) < c.price) {
        pushToast(`Not enough ${priceCurrency === "hex" ? "HEX" : "SHARDS"}`, "warn");
        return;
      }
      const owned = readOwned();
      const res = openCase(casesRef.current, c, { hex, shards }, owned);
      if (!res.ok) {
        pushToast(`Not enough ${(c.priceCurrency ?? "shards") === "hex" ? "HEX" : "SHARDS"}`, "warn");
        return;
      }

      // Deduct cost immediately.
      dispatch?.({ type: "ADD_CURRENCY", currency: res.deductions.currency, amount: -res.deductions.amount });

      // Build the reel landing on the won reward.
      const tiles = buildReel(c, res.reward, REEL_LENGTH, REEL_WIN_INDEX);
      setReel(tiles);
      setReward(res.reward);
      setDupe(res.dupe);
      setOpenId(c.id);
      setPhase("spinning");
      setOffset(0);
      pendingGrantsRef.current = res.grants;
      pendingStateRef.current = res.state;
      pendingDupeRef.current = res.dupe;
      pendingRewardRef.current = res.reward;

      // Next frame: measure + animate to the winning tile.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = reelRef.current;
          const tile = 96;
          const containerW = el?.parentElement?.clientWidth ?? 340;
          const jitter = (Math.random() - 0.5) * 40;
          const target = REEL_WIN_INDEX * tile - containerW / 2 + tile / 2 + jitter;
          setOffset(-target);
        });
      });

      // After the spin completes: grant rewards + reveal.
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      spinTimerRef.current = window.setTimeout(() => {
        spinTimerRef.current = null;
        applyGrants();
      }, REEL_SPIN_MS + 120);
    },
    [phase, hex, shards, dispatch, pushToast, applyGrants],
  );

  const closeModal = useCallback(() => {
    if (spinTimerRef.current) { clearTimeout(spinTimerRef.current); spinTimerRef.current = null; }
    pendingGrantsRef.current = [];
    pendingStateRef.current = null;
    setOpenId(null);
    setPhase("idle");
    setReward(null);
    setReel([]);
  }, []);

  const openingCase = openId ? CASE_BY_ID[openId] : null;
  const totalOpened = cases.totalOpened;

  const cardCol = (rar: RewardDef["rarity"]) => ({ ["--rc" as any]: RARITY_RC[rar] });

  return (
    <section className="cs-screen">
      <div className="cs-bg-grid" />
      <div className="cs-bg-glow" />

      {/* Header */}
      <header className="cs-head">
        <div className="cs-head-row">
          <button className="cs-back" onClick={() => onNavigate?.("main_reactor")} aria-label="Back">
            ‹
          </button>
          <div className="cs-resources">
            <span className="cs-pill"><b>HEX</b> {fmtShort(hex)}</span>
            <span className="cs-pill"><b>◈</b> {fmtShort(shards)}</span>
          </div>
        </div>
        <p className="cs-kicker">HEXIUM · SUPPLY DROPS</p>
        <h1 className="cs-title">Cases</h1>
        <p className="cs-sub">Open crates for HEX, bot fragments, copies, boosts & skins</p>
      </header>

      {/* Featured crate hero */}
      <div className="cs-hero" style={cardCol(featured.rarity)}>
        <div className="cs-hero-beam" />
        <div className="cs-hero-glow" />
        <span className="cs-spark s1" /><span className="cs-spark s2" /><span className="cs-spark s3" /><span className="cs-spark s4" />
        <div className="cs-hero-tag">⭐ FEATURED VAULT</div>
        <div className="cs-hero-box">{featured.icon}</div>
        <div className="cs-hero-pedestal" />
        <div className="cs-hero-title">{featured.name}</div>
        <button
          className="cs-btn open lg"
          disabled={!canPayCase(featured) || phase === "spinning"}
          onClick={() => startOpen(featured)}
        >
          OPEN · {casePriceLabel(featured)}
        </button>
      </div>

      {/* All crates */}
      <div className="cs-sec-label">⬢ All Crates</div>
      <div className="cs-grid">
        {CASE_DEFS.map((c) => (
          <div key={c.id} className={`cs-card rar-${c.rarity}`} style={cardCol(c.rarity)}>
            <div className="cs-card-ic">{c.icon}</div>
            <div className="cs-card-name">{c.name}</div>
            <div className="cs-card-blurb">{c.blurb}</div>
            <div className="cs-odds">
              {c.odds.map((o, i) => (
                <div key={i} className="cs-odd">
                  <span className={`cs-odd-l rar-${o.rarity}`}>{RARITY_NAME[o.rarity]}</span>
                  <div className="cs-odd-bar">
                    <div className="cs-odd-fill" style={{ width: `${o.pct}%`, ["--rc" as any]: RARITY_RC[o.rarity] }} />
                  </div>
                  <span className="cs-odd-p">{o.pct}%</span>
                </div>
              ))}
            </div>
            <button
              className="cs-btn open full"
              disabled={!canPayCase(c) || phase === "spinning"}
              onClick={() => startOpen(c)}
            >
              OPEN · {casePriceLabel(c)}
            </button>
          </div>
        ))}
      </div>

      {/* Reward history */}
      <div className="cs-sec-label">⬢ Reward History {totalOpened > 0 && <span className="cs-count">· {totalOpened} opened</span>}</div>
      {cases.history.length === 0 ? (
        <div className="cs-empty">No crates opened yet — try the Common Crate to start.</div>
      ) : (
        <div className="cs-history">
          {cases.history.slice(0, 10).map((h) => (
            <div key={h.uid} className="cs-hist-row" style={{ ["--rc" as any]: RARITY_RC[h.rewardRarity] }}>
              <span className="cs-hist-ic">{h.rewardIcon}</span>
              <span className="cs-hist-name">{h.rewardLabel}</span>
              <span className="cs-hist-case">{h.caseName}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Opening modal ── */}
      {openingCase && (
        <div className="cs-modal" style={cardCol(reward ? reward.rarity : openingCase.rarity)}>
          <div className="cs-modal-card">
            {phase !== "revealed" && (
              <>
                <div className="cs-modal-kicker">OPENING · {openingCase.name}</div>
                <div className="cs-reel-window">
                  <div className="cs-reel-marker" />
                  <div
                    ref={reelRef}
                    className="cs-reel"
                    style={{
                      transform: `translateX(${offset}px)`,
                      transition: phase === "spinning" ? `transform ${REEL_SPIN_MS}ms cubic-bezier(.12,.62,.16,1)` : "none",
                    }}
                  >
                    {reel.map((t, i) => (
                      <div key={i} className={`cs-tile rar-${t.rarity}`} style={cardCol(t.rarity)}>
                        <span className="cs-tile-ic">{t.icon}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cs-spin-hint">Decrypting supply drop…</div>
                <button className="cs-btn ghost cs-skip" onClick={() => { if (spinTimerRef.current) { clearTimeout(spinTimerRef.current); spinTimerRef.current = null; } applyGrants(); }}>SKIP ▸</button>
              </>
            )}

            {phase === "revealed" && reward && (
              <div className="cs-reveal">
                <div className="cs-reveal-burst" />
                <div className={`cs-reveal-rarity rar-${reward.rarity}`} style={cardCol(reward.rarity)}>
                  {RARITY_NAME[reward.rarity].toUpperCase()}
                </div>
                <div className="cs-reveal-ic" style={cardCol(reward.rarity)}>{reward.icon}</div>
                <div className="cs-reveal-label">{reward.label}</div>
                {dupe ? (
                  <div className="cs-reveal-sub">Duplicate — compensated with +{reward.dupeShards ?? 100} ◈</div>
                ) : (
                  <div className="cs-reveal-sub">
                    {reward.kind === "bot_fragment"
                      ? "Fragments added — create it in HEX-BOTS"
                      : reward.kind === "bot_copy"
                        ? "Copy added — evolve it in HEX-BOTS"
                        : reward.kind === "skin"
                        ? "Skin added — equip it in Shop"
                        : reward.kind === "booster"
                          ? "Booster activated"
                          : "Added to your balance"}
                  </div>
                )}
                <div className="cs-reveal-actions">
                  <button className="cs-btn ghost" onClick={closeModal}>CLOSE</button>
                  <button
                    className="cs-btn open"
                    disabled={!canPayCase(openingCase)}
                    onClick={() => startOpen(openingCase)}
                  >
                    OPEN AGAIN · {casePriceLabel(openingCase)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="cs-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`cs-toast ${t.tone}`}>{t.text}</div>
        ))}
      </div>
    </section>
  );
}

export default CasesScreen;
