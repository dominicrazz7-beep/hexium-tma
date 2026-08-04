/* ═══════════════════════════════════════════════════════
   BlackMarketScreen — 6-hour rotating shop with
   limited deals, stock, and real currency purchases.
   ═══════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  type BmItem,
  type BmCategory,
  RARITY_COLORS,
  CATEGORY_DEFS,
  generateMarketSelection,
  currentWindowSeed,
} from "../../game/blackMarket/blackMarketData";
import {
  type BmWindowState,
  type BmPurchaseResult,
  emptyWindowState,
  getRefreshCountdown,
  getRemainingStock,
  canAffordItem,
  buyItem,
} from "../../game/blackMarket/blackMarketLogic";
import { REFRESH_INTERVAL_MS } from "../../game/blackMarket/blackMarketBalance";
import "./BlackMarket.css";

const BM_STORAGE_KEY = "hexium_black_market_v1";
const HISTORY_LIMIT = 20;

type BmHistoryEntry = {
  uid: number;
  itemId: string;
  name: string;
  icon: string;
  cost: number;
  currency: string;
  at: number;
};

type BmPersistState = BmWindowState & { history: BmHistoryEntry[] };

type Toast = { id: number; text: string; tone: "ok" | "warn" };

type BlackMarketScreenProps = {
  hex: number;
  shards: number;
  onNavigate: (screen: string) => void;
  dispatch?: (action: any) => void;
};

function loadState(): BmPersistState {
  try {
    const raw = localStorage.getItem(BM_STORAGE_KEY);
    if (!raw) return { ...emptyWindowState(), history: [] };
    const parsed = JSON.parse(raw) as Partial<BmPersistState>;
    return { ...emptyWindowState(), ...parsed, history: parsed.history ?? [] };
  } catch {
    return { ...emptyWindowState(), history: [] };
  }
}

function saveState(s: BmPersistState) {
  try {
    localStorage.setItem(BM_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

function refreshIfNeeded(state: BmPersistState, now: number): BmPersistState {
  const currentSeed = currentWindowSeed(now, REFRESH_INTERVAL_MS);
  if (state.seed === currentSeed) return state;
  return { ...emptyWindowState(), seed: currentSeed, history: state.history };
}

let toastId = 0;

export function BlackMarketScreen({ hex, shards, onNavigate, dispatch }: BlackMarketScreenProps) {
  const [state, setState] = useState<BmPersistState>(() => refreshIfNeeded(loadState(), Date.now()));
  const [activeFilter, setActiveFilter] = useState<BmCategory | "all">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [now, setNow] = useState(Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((prev) => refreshIfNeeded(prev, t));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const pushToast = useCallback((text: string, tone: "ok" | "warn") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }].slice(-3));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  const items = generateMarketSelection(state.seed);

  const handleBuy = useCallback(
    (item: BmItem) => {
      const current = stateRef.current;
      const result: BmPurchaseResult & { state?: BmWindowState } = buyItem(
        item,
        current,
        { hex, shards },
      );

      if (!result.ok) {
        pushToast(
          result.reason === "sold_out" ? "Sold out!" : "Not enough funds",
          "warn",
        );
        return;
      }

      for (const g of result.grants) {
        if (g.type === "hex") {
          dispatch?.({ type: "ADD_CURRENCY", currency: "hex", amount: g.amount });
        } else if (g.type === "shards") {
          dispatch?.({ type: "ADD_CURRENCY", currency: "shards", amount: g.amount });
        } else if (g.type === "case") {
          dispatch?.({
            type: "ADD_REWARD",
            reward: { type: "case", caseType: g.caseType as any, amount: g.amount },
            source: "black_market",
          });
        } else if (g.type === "bot_fragment") {
          dispatch?.({
            type: "ADD_REWARD",
            reward: { type: "bot_fragment", botId: g.botId, amount: g.amount },
            source: "black_market",
          });
        } else if (g.type === "research_points") {
          dispatch?.({ type: "ADD_CURRENCY", currency: "researchPoints", amount: g.amount });
        } else if (g.type === "premium") {
          dispatch?.({ type: "ADD_CURRENCY", currency: "premium", amount: g.amount });
        }
      }

      const rec: BmHistoryEntry = {
        uid: Date.now(),
        itemId: item.id,
        name: item.name,
        icon: item.icon,
        cost: item.price,
        currency: item.currency,
        at: Date.now(),
      };

      setState((prev) => ({
        ...result.state!,
        history: [rec, ...prev.history].slice(0, HISTORY_LIMIT),
      }));

      dispatch?.({
        type: "ADD_CURRENCY",
        currency: item.currency,
        amount: -item.price,
      });

      pushToast(result.toast, "ok");
    },
    [hex, shards, dispatch, pushToast],
  );

  const filteredItems =
    activeFilter === "all"
      ? items
      : items.filter((i) => i.category === activeFilter);

  const hasLimited = items.some((i) => i.isLimited && getRemainingStock(i, state) > 0);

  return (
    <section className="bm-screen">
      <div className="bm-bg-grid" />

      <header className="bm-hud">
        <div>
          <p className="bm-kicker">HEXIUM · BLACK MARKET</p>
          <h1>Black Market</h1>
          <p className="bm-refresh">Refreshes in {getRefreshCountdown(now)}</p>
        </div>
        <div className="bm-resources">
          <span className="bm-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="bm-pill"><b>⬡</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <div className="bm-categories">
        {CATEGORY_DEFS.map((cat) => (
          <button
            key={cat.id}
            className={`bm-category ${activeFilter === cat.id ? "active" : ""}`}
            onClick={() => setActiveFilter(cat.id)}
          >
            <span className="bm-category-icon">{cat.icon}</span>
            <span className="bm-category-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {hasLimited && (
        <div className="bm-limited-banner">
          <div className="bm-limited-glow" />
          <span className="bm-limited-badge">⚡ LIMITED DEAL</span>
          <span className="bm-limited-text">Exclusive offer — grab it before refresh!</span>
        </div>
      )}

      <div className="bm-items-grid">
        {filteredItems.map((item) => {
          const remaining = getRemainingStock(item, state);
          const soldOut = remaining <= 0;
          const affordable = canAffordItem(item, { hex, shards });

          return (
            <div
              key={item.id}
              className={`bm-item ${soldOut ? "purchased" : ""} ${item.isLimited ? "limited" : ""}`}
              style={{ borderColor: RARITY_COLORS[item.rarity] }}
            >
              {item.isLimited && <div className="bm-item-limited-glow" />}

              <div className="bm-item-header">
                <span className="bm-item-icon" style={{ color: RARITY_COLORS[item.rarity] }}>
                  {item.icon}
                </span>
                <span className="bm-item-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                  {item.rarity.toUpperCase()}
                </span>
              </div>

              <h3 className="bm-item-name">{item.name}</h3>
              <p className="bm-item-desc">{item.description}</p>

              <div className="bm-item-footer">
                <div className="bm-item-price">
                  {item.originalPrice && (
                    <span className="bm-item-original">{item.originalPrice.toLocaleString()}</span>
                  )}
                  <span className="bm-item-cost">
                    {item.currency === "hex" && `⬡ ${item.price.toLocaleString()}`}
                    {item.currency === "shards" && `◆ ${item.price}`}
                  </span>
                </div>

                {soldOut ? (
                  <span className="bm-item-sold">SOLD</span>
                ) : (
                  <button
                    className="bm-item-buy"
                    onClick={() => handleBuy(item)}
                    disabled={!affordable}
                  >
                    {affordable ? "BUY" : "NEED FUNDS"}
                  </button>
                )}
              </div>

              <div className="bm-item-stock">
                Stock: {remaining}/{item.baseStock}
              </div>
            </div>
          );
        })}
      </div>

      {state.history.length > 0 && (
        <div className="bm-history">
          <div className="bm-history-label">Recent Purchases</div>
          {state.history.slice(0, 5).map((h) => (
            <div key={h.uid} className="bm-history-row">
              <span className="bm-history-icon">{h.icon}</span>
              <span className="bm-history-name">{h.name}</span>
              <span className="bm-history-cost">
                −{h.cost.toLocaleString()} {h.currency === "hex" ? "HEX" : "◆"}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="bm-back-btn" onClick={() => onNavigate("main_reactor")}>
        ← Back to Reactor
      </button>

      <div className="bm-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`bm-toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </section>
  );
}

export default BlackMarketScreen;
