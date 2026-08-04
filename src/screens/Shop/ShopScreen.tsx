/* ═══════════════════════════════════════════════════════
   SHOP — v7 "Black Market" integrated into the real project.
   Premium screen: special offer, boosters, HEX/Shard packs,
   energy/cooldown utilities, skins. Real currency spend via
   the App reducer, local purchase history, toasts.
   Mirrors the proven HexBots integration pattern.
   ═══════════════════════════════════════════════════════ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ShopProps, ShopState, ShopToast } from "./Shop.types";
import {
  SHOP_ITEMS,
  CATEGORY_SECTIONS,
  ITEM_BY_ID,
  initialShopState,
  type ShopItem,
} from "../../game/shop/shopData";
import { RARITY_RC } from "../../game/shop/shopBalance";
import {
  purchase,
  equipSkin,
  pruneBoosters,
  activeBoosters,
  fmtShort,
  fmtTimeLeft,
  type Balances,
} from "../../game/shop/shopLogic";
import "./Shop.css";

const SHOP_STORAGE_KEY = "hexium_shop_state_v1";
const ADS_STORAGE_KEY = "hexium_reward_ads_mvp_v1";
const AD_COOLDOWN_MS = 5 * 60 * 1000;

type AdRewardId = "energy" | "cooldown" | "hex" | "boost";
type AdRewardDef = {
  id: AdRewardId;
  title: string;
  sub: string;
  icon: string;
  dailyLimit: number;
  action: "restore_energy" | "reset_heat" | "grant_hex" | "grant_booster";
  amount?: number;
  boosterId?: string;
};
type AdState = { day: string; views: Record<string, number>; cooldowns: Record<string, number> };

const AD_REWARDS: AdRewardDef[] = [
  { id: "energy", title: "Energy Recharge", sub: "Restore reactor energy", icon: "🔋", dailyLimit: 5, action: "restore_energy" },
  { id: "cooldown", title: "Cooling Burst", sub: "Cool reactor instantly", icon: "❄️", dailyLimit: 5, action: "reset_heat" },
  { id: "hex", title: "HEX Bonus", sub: "+1,000 HEX", icon: "💰", dailyLimit: 5, action: "grant_hex", amount: 1_000 },
  { id: "boost", title: "2× Ad Boost", sub: "2× output · 15 min", icon: "📺", dailyLimit: 3, action: "grant_booster", boosterId: "boost_ad_mining_2x" },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function initialAdState(): AdState {
  return { day: todayKey(), views: {}, cooldowns: {} };
}

function normalizeAdState(state: Partial<AdState> | null | undefined): AdState {
  const day = todayKey();
  if (!state || state.day !== day) return initialAdState();
  return { day, views: state.views ?? {}, cooldowns: state.cooldowns ?? {} };
}

function loadAdState(): AdState {
  try {
    return normalizeAdState(JSON.parse(localStorage.getItem(ADS_STORAGE_KEY) || "null"));
  } catch {
    return initialAdState();
  }
}

function saveAdState(state: AdState) {
  try { localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function loadShop(): ShopState {
  try {
    const raw = localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) return initialShopState();
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    return { ...initialShopState(), ...parsed };
  } catch {
    return initialShopState();
  }
}

function saveShop(s: ShopState) {
  try {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota — ignore */
  }
}

let toastId = 0;

export function ShopScreen({ hex = 0, shards = 0, onNavigate, dispatch }: ShopProps) {
  const [shop, setShop] = useState<ShopState>(loadShop);
  const [toasts, setToasts] = useState<ShopToast[]>([]);
  const [now, setNow] = useState(Date.now());
  const [ads, setAds] = useState<AdState>(loadAdState);
  const shopRef = useRef(shop);
  shopRef.current = shop;

  /* Persist on change */
  useEffect(() => {
    saveShop(shop);
  }, [shop]);

  useEffect(() => {
    saveAdState(ads);
  }, [ads]);

  /* Tick every second for booster countdowns + prune expired */
  useEffect(() => {
    const iv = setInterval(() => {
      setNow(Date.now());
      setShop((s) => pruneBoosters(s, Date.now()));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const bal: Balances = { hex, shards };

  /* Apply grants/deductions from a purchase result to the reducer + local state */
  const applyResult = useCallback(
    (res: ReturnType<typeof purchase>) => {
      if (!res.ok) {
        pushToast(
          res.reason === "owned"
            ? "Already owned"
            : "Not enough balance",
          "warn",
        );
        return;
      }
      for (const d of res.deductions) {
        dispatch?.({ type: "ADD_CURRENCY", currency: d.currency, amount: -d.amount });
      }
      for (const g of res.grants) {
        if (g.kind === "currency") {
          dispatch?.({ type: "ADD_CURRENCY", currency: g.currency, amount: g.amount });
        } else if (g.kind === "effect") {
          dispatch?.({ type: g.effect === "reset_heat" ? "RESET_HEAT" : "RESTORE_ENERGY" });
        }
      }
      setShop(res.state);
      pushToast(res.toast, "ok");
    },
    [dispatch, pushToast],
  );

  const buyItem = useCallback(
    (item: ShopItem) => applyResult(purchase(shopRef.current, item, { hex, shards })),
    [applyResult, hex, shards],
  );

  const onEquip = useCallback((skinId: string) => {
    setShop((s) => equipSkin(s, skinId));
  }, []);

  const watchAd = useCallback((ad: AdRewardDef) => {
    const current = normalizeAdState(ads);
    const used = current.views[ad.id] ?? 0;
    const cooldownUntil = current.cooldowns[ad.id] ?? 0;
    if (used >= ad.dailyLimit) {
      pushToast("Daily ad limit reached", "warn");
      return;
    }
    if (cooldownUntil > Date.now()) {
      pushToast(`Next ad in ${fmtTimeLeft(cooldownUntil - Date.now())}`, "warn");
      return;
    }

    // Telegram ad SDK can be wired here later. For MVP/dev builds this grants after click.
    if (ad.action === "restore_energy") {
      dispatch?.({ type: "RESTORE_ENERGY" });
    } else if (ad.action === "reset_heat") {
      dispatch?.({ type: "RESET_HEAT" });
    } else if (ad.action === "grant_hex") {
      dispatch?.({ type: "ADD_CURRENCY", currency: "hex", amount: ad.amount ?? 0 });
    } else if (ad.action === "grant_booster" && ad.boosterId) {
      applyResult(purchase(shopRef.current, ITEM_BY_ID[ad.boosterId], { hex, shards }));
    }

    const next: AdState = {
      ...current,
      views: { ...current.views, [ad.id]: used + 1 },
      cooldowns: { ...current.cooldowns, [ad.id]: Date.now() + AD_COOLDOWN_MS },
    };
    setAds(next);
    pushToast(`${ad.title} activated`, "ok");
  }, [ads, applyResult, dispatch, hex, shards, pushToast]);


  /* ── Derived ── */
  const boosters = useMemo(() => activeBoosters(shop, now), [shop, now]);
  const byCat = useMemo(() => {
    const map: Record<string, ShopItem[]> = {};
    for (const it of SHOP_ITEMS) {
      if (it.hidden) continue;
      (map[it.category] ??= []).push(it);
    }
    return map;
  }, []);

  const canAfford = (it: { cost: number; costCurrency: "hex" | "shards" }) => bal[it.costCurrency] >= it.cost;
  const curIcon = (c: "hex" | "shards") => (c === "hex" ? "HEX" : "◈");

  return (
    <section className="sh-screen">
      <div className="sh-bg-grid" />
      <div className="sh-bg-glow" />

      {/* Header */}
      <header className="sh-head">
        <div className="sh-head-row">
          <button className="sh-back" onClick={() => onNavigate?.("main_reactor")} aria-label="Back">
            ‹
          </button>
          <div className="sh-resources">
            <span className="sh-pill"><b>HEX</b> {fmtShort(hex)}</span>
            <span className="sh-pill"><b>◈</b> {fmtShort(shards)}</span>
          </div>
        </div>
        <p className="sh-kicker">HEXIUM · BLACK MARKET</p>
        <h1 className="sh-title">Shop</h1>
        <p className="sh-sub">Premium gear, packs & cosmetics</p>
      </header>

      {/* Active boosters strip */}
      {boosters.length > 0 && (
        <div className="sh-boosters">
          {boosters.map((b) => {
            const it = ITEM_BY_ID[b.id];
            return (
              <div key={b.id} className="sh-boost-chip" style={{ ["--rc" as any]: RARITY_RC[it.rarity] }}>
                <span className="sh-boost-ic">{it.icon}</span>
                <span className="sh-boost-name">{it.boosterMult}× {it.name.replace(/\s?(Boost|Surge|Module|Core)$/, "")}</span>
                <span className="sh-boost-time">{fmtTimeLeft(b.expiresAt - now)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Reward ads */}
      <div className="sh-section sh-ad-section">
        <div className="sh-sec-label">⬢ Watch Ad Rewards</div>
        <div className="sh-ad-grid">
          {AD_REWARDS.map((ad) => {
            const used = ads.views[ad.id] ?? 0;
            const cooldownUntil = ads.cooldowns[ad.id] ?? 0;
            const cooling = cooldownUntil > now;
            const exhausted = used >= ad.dailyLimit;
            return (
              <div key={ad.id} className="sh-ad-card">
                <div className="sh-ad-top">
                  <span className="sh-ad-ic">{ad.icon}</span>
                  <span className="sh-ad-limit">{used}/{ad.dailyLimit}</span>
                </div>
                <div className="sh-ad-name">{ad.title}</div>
                <div className="sh-ad-sub">{ad.sub}</div>
                <button className="sh-btn buy full" disabled={cooling || exhausted} onClick={() => watchAd(ad)}>
                  {exhausted ? "DONE TODAY" : cooling ? fmtTimeLeft(cooldownUntil - now) : "WATCH AD"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="sh-ad-note">Cooldown: 5 min per reward type. Limits reset daily.</div>
      </div>

      {/* Category sections */}
      {CATEGORY_SECTIONS.map((sec) => {
        const items = byCat[sec.id] ?? [];
        if (!items.length) return null;
        return (
          <div key={sec.id} className="sh-section">
            <div className="sh-sec-label">{sec.label}</div>
            <div className="sh-grid">
              {items.map((it) => {
                const rc = RARITY_RC[it.rarity];
                const owned = it.cosmetic && shop.ownedSkins.includes(it.id);
                const equipped = it.cosmetic && shop.equippedSkin === it.id;
                const afford = canAfford(it);
                return (
                  <div key={it.id} className={`sh-card rar-${it.rarity}`} style={{ ["--rc" as any]: rc }}>
                    {it.tag && <span className="sh-badge">{it.tag}</span>}
                    <div className="sh-ic">{it.icon}</div>
                    <div className="sh-name">{it.name}</div>
                    <div className="sh-card-sub">{it.sub}</div>
                    {owned ? (
                      <button
                        className={`sh-btn full${equipped ? " equipped" : ""}`}
                        onClick={() => onEquip(it.id)}
                      >
                        {equipped ? "✓ EQUIPPED" : "EQUIP"}
                      </button>
                    ) : (
                      <button
                        className="sh-btn buy full"
                        disabled={!afford}
                        onClick={() => buyItem(it)}
                      >
                        {fmtShort(it.cost)} {curIcon(it.costCurrency)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Purchase history */}
      <div className="sh-section">
        <div className="sh-sec-label">⬢ Purchase History</div>
        {shop.history.length === 0 ? (
          <div className="sh-empty">No purchases yet — grab a booster to get started.</div>
        ) : (
          <div className="sh-history">
            {shop.history.slice(0, 8).map((h) => (
              <div key={h.uid} className="sh-hist-row">
                <span className="sh-hist-ic">{h.icon}</span>
                <span className="sh-hist-name">{h.name}</span>
                <span className="sh-hist-cost">
                  −{fmtShort(h.cost)} {h.costCurrency === "hex" ? "HEX" : "◈"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="sh-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`sh-toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShopScreen;
