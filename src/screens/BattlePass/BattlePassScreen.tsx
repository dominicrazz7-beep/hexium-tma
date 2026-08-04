import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BattlePassProps } from "./BattlePass.types";
import {
  BATTLE_PASS_TIERS,
  TOTAL_TIERS,
  type BattlePassReward,
} from "../../game/battlePass/battlePassData";
import {
  BATTLEPASS_BALANCE,
  fmtShort,
} from "../../game/battlePass/battlePassBalance";
import {
  loadBattlePassState,
  saveBattlePassState,
  addXP,
  getCurrentTier,
  getTierProgress,
  canClaimFree,
  canClaimPremium,
  claimFree,
  claimPremium,
  buyPremium,
  totalFreeClaimed,
  totalPremiumClaimed,
  type BattlePassState,
} from "../../game/battlePass/battlePassLogic";
import "./BattlePass.css";

function formatReward(r: BattlePassReward): string {
  const rew = r.reward;
  if (rew.type === "hex") return `+${fmtShort(rew.amount)} HEX`;
  if (rew.type === "shards") return `+${rew.amount} ◈`;
  if (rew.type === "case") return `+${rew.amount} ${rew.caseType.toUpperCase()} CASE`;
  return rew.type.toUpperCase();
}

export function BattlePassScreen({
  hex = 0,
  shards = 0,
  onNavigate,
  dispatch,
}: BattlePassProps) {
  const [state, setState] = useState<BattlePassState>(loadBattlePassState);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { saveBattlePassState(state); }, [state]);

  const tier = useMemo(() => getCurrentTier(state), [state]);
  const progress = useMemo(() => getTierProgress(state), [state]);
  const freeClaimed = useMemo(() => totalFreeClaimed(state), [state]);
  const premClaimed = useMemo(() => totalPremiumClaimed(state), [state]);

  const pushToast = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleClaimFree = useCallback((t: number) => {
    const rew = BATTLE_PASS_TIERS.find((x) => x.tier === t)?.free;
    if (!rew || !canClaimFree(stateRef.current, t)) return;
    setState(claimFree(stateRef.current, t));
    dispatch?.({ type: "ADD_REWARD", reward: rew.reward, source: "battle_pass" });
    pushToast(`Claimed: ${rew.label}`);
  }, [dispatch, pushToast]);

  const handleClaimPremium = useCallback((t: number) => {
    const rew = BATTLE_PASS_TIERS.find((x) => x.tier === t)?.premium;
    if (!rew || !canClaimPremium(stateRef.current, t)) return;
    setState(claimPremium(stateRef.current, t));
    dispatch?.({ type: "ADD_REWARD", reward: rew.reward, source: "battle_pass" });
    pushToast(`Claimed: ${rew.label}`);
  }, [dispatch, pushToast]);

  const handleBuyPremium = useCallback(() => {
    if (stateRef.current.premiumOwned) return;
    if (shards < BATTLEPASS_BALANCE.premiumCostShards) {
      pushToast("Not enough Shards");
      return;
    }
    dispatch?.({ type: "ADD_CURRENCY", currency: "shards", amount: -BATTLEPASS_BALANCE.premiumCostShards });
    setState(buyPremium(stateRef.current));
    pushToast("Premium Track unlocked!");
  }, [shards, dispatch, pushToast]);

  const pct = Math.round(progress.ratio * 100);
  const nextTierDef = tier < TOTAL_TIERS ? BATTLE_PASS_TIERS[tier] : null;

  return (
    <section className="bp-screen">
      <div className="bp-bg-grid" />

      <header className="bp-hud">
        <div>
          <p className="bp-kicker">HEXIUM · SEASON 1</p>
          <h1>Battle Pass</h1>
          <p className="bp-sub">Tier {tier}/{TOTAL_TIERS} · {freeClaimed} free · {premClaimed} premium claimed</p>
        </div>
        <div className="bp-resources">
          <span className="bp-pill"><b>HEX</b> {fmtShort(hex)}</span>
          <span className="bp-pill shards"><b>◈</b> {fmtShort(shards)}</span>
        </div>
      </header>

      {/* Season progress bar */}
      <div className="bp-season-bar">
        <div className="bp-season-head">
          <span className="bp-season-label">Season Progress</span>
          <span className="bp-season-xp">{fmtShort(state.xp)} XP{nextTierDef ? ` · ${progress.nextXP} to Tier ${tier + 1}` : " · MAX"}</span>
        </div>
        <div className="bp-season-track">
          <div className="bp-season-fill" style={{ width: `${tier >= TOTAL_TIERS ? 100 : pct}%` }} />
          {BATTLE_PASS_TIERS.filter((_, i) => i % 5 === 0 || i === TOTAL_TIERS - 1).map((t) => (
            <div
              key={t.tier}
              className={`bp-season-dot${state.xp >= t.xpRequired ? " reached" : ""}`}
              style={{ left: `${(t.tier / TOTAL_TIERS) * 100}%` }}
              title={`Tier ${t.tier}`}
            />
          ))}
        </div>
      </div>

      {/* Premium CTA */}
      {!state.premiumOwned && (
        <div className="bp-premium-cta">
          <div className="bp-premium-info">
            <span className="bp-premium-icon">👑</span>
            <div>
              <div className="bp-premium-title">Unlock Premium Track</div>
              <div className="bp-premium-sub">Exclusive rewards at every tier</div>
            </div>
          </div>
          <button className="bp-btn premium" onClick={handleBuyPremium} disabled={shards < BATTLEPASS_BALANCE.premiumCostShards}>
            {BATTLEPASS_BALANCE.premiumCostShards} ◈
          </button>
        </div>
      )}

      {/* Tier grid */}
      <div className="bp-tier-section">
        <div className="bp-sec-label">⬢ Tier Rewards</div>
        <div className="bp-tier-scroll" ref={scrollRef}>
          <div className="bp-tier-grid">
            {BATTLE_PASS_TIERS.map((t) => {
              const unlocked = state.xp >= t.xpRequired;
              const isCurrent = t.tier === tier + 1 && tier < TOTAL_TIERS;
              const freeCanClaim = canClaimFree(state, t.tier);
              const premCanClaim = canClaimPremium(state, t.tier);

              return (
                <div
                  key={t.tier}
                  className={`bp-tier${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""}`}
                >
                  <div className="bp-tier-num">{t.tier}</div>

                  {/* Free track */}
                  <div className={`bp-tier-slot free${unlocked && t.free ? " has-reward" : ""}${state.claimedFree[t.tier] ? " claimed" : ""}`}>
                    {t.free ? (
                      <>
                        <span className="bp-slot-icon">{t.free.icon}</span>
                        <span className="bp-slot-label">{t.free.label}</span>
                        {freeCanClaim && (
                          <button className="bp-claim-btn" onClick={() => handleClaimFree(t.tier)}>CLAIM</button>
                        )}
                        {state.claimedFree[t.tier] && <span className="bp-slot-check">✓</span>}
                      </>
                    ) : (
                      <span className="bp-slot-empty">—</span>
                    )}
                  </div>

                  {/* Premium track */}
                  <div className={`bp-tier-slot premium${unlocked && t.premium ? " has-reward" : ""}${state.claimedPremium[t.tier] ? " claimed" : ""}${!state.premiumOwned ? " locked" : ""}`}>
                    {t.premium ? (
                      <>
                        <span className="bp-slot-icon">{t.premium.icon}</span>
                        <span className="bp-slot-label">{t.premium.label}</span>
                        {premCanClaim && (
                          <button className="bp-claim-btn prem" onClick={() => handleClaimPremium(t.tier)}>CLAIM</button>
                        )}
                        {state.claimedPremium[t.tier] && <span className="bp-slot-check">✓</span>}
                        {!state.premiumOwned && <span className="bp-slot-lock">🔒</span>}
                      </>
                    ) : (
                      <span className="bp-slot-empty">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && <div className="bp-toast">{toast}</div>}
    </section>
  );
}

export default BattlePassScreen;
