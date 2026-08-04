import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileProps } from "./Profile.types";
import "./Profile.css";

import { getReactorLevel, getReactorTier, getTierProgress } from "../../game/reactor/reactorBalance";
import { ITEM_BY_ID } from "../../game/shop/shopData";
import { SETTING_TOGGLES, type ProfileSettings } from "../../game/profile/profileData";
import { fmtNum, fmtHashrate, operatorNumber } from "../../game/profile/profileBalance";
import {
  loadProfile,
  saveProfile,
  toggleSetting,
  cycleGlyph,
  currentGlyph,
  buildSummary,
  readCosmetics,
  evaluateAchievements,
  achievementsDone,
  loadAchievements,
  saveAchievements,
  claimAchievement,
} from "../../game/profile/profileLogic";
import type { EvaluatedAchievement } from "../../game/profile/profileLogic";

export function ProfileScreen({ hex = 0, shards = 0, player, onNavigate, dispatch }: ProfileProps) {
  const [profile, setProfile] = useState(loadProfile);
  const [achvState, setAchvState] = useState(loadAchievements);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => saveProfile(profile), [profile]);
  useEffect(() => saveAchievements(achvState), [achvState]);

  const compact = profile.settings.compactNumbers;

  const totalHexMined = player?.totalHexMined ?? hex;
  const totalTaps = player?.totalTaps ?? 0;
  const hashrate = player?.hashrate ?? 0;
  const operatorId = operatorNumber(player?.id || player?.username || "operator");

  const reactorLevel = useMemo(() => getReactorLevel(totalHexMined), [totalHexMined]);
  const tier = useMemo(() => getReactorTier(reactorLevel), [reactorLevel]);
  const tierProg = useMemo(() => getTierProgress(reactorLevel), [reactorLevel]);
  const progPct = Math.round(tierProg.ratio * 100);

  const summary = useMemo(
    () => buildSummary({ hex, shards, totalHexMined, totalTaps, hashrate, reactorLevel }),
    [hex, shards, totalHexMined, totalTaps, hashrate, reactorLevel],
  );
  const achievements = useMemo(() => evaluateAchievements(summary, achvState), [summary, achvState]);
  const doneCount = achievementsDone(achievements);

  const cosmetics = useMemo(() => readCosmetics(), [hex, shards]);
  const equippedItem = cosmetics.equippedSkin ? ITEM_BY_ID[cosmetics.equippedSkin] : null;

  const glyph = currentGlyph(profile);

  const accentStyle = { ["--tc" as string]: tier.accent, ["--tc2" as string]: tier.accent2 } as React.CSSProperties;

  const stats: { label: string; value: string; icon: string; accent?: boolean }[] = [
    { label: "TOTAL HEX", value: fmtNum(hex, compact), icon: "💎", accent: true },
    { label: "SHARDS", value: fmtNum(shards, compact), icon: "◈" },
    { label: "MINED", value: fmtNum(totalHexMined, compact), icon: "⛏" },
    { label: "TAPS", value: fmtNum(totalTaps, compact), icon: "👆" },
    { label: "HEX-BOTS", value: String(summary.botsOwned), icon: "🤖" },
    { label: "CASES OPENED", value: String(summary.casesOpened), icon: "📦" },
  ];

  const handleClaimAchv = useCallback((a: EvaluatedAchievement) => {
    if (!a.done || a.claimed) return;
    setAchvState((s) => claimAchievement(s, a.id));
    if (dispatch) {
      if (a.rewardHex > 0) dispatch({ type: "ADD_CURRENCY", currency: "hex", amount: a.rewardHex });
      if (a.rewardShards > 0) dispatch({ type: "ADD_CURRENCY", currency: "shards", amount: a.rewardShards });
    }
    setToast(`${a.name} claimed! +${a.rewardHex > 0 ? `${a.rewardHex} HEX` : ""}${a.rewardShards > 0 ? ` +${a.rewardShards} SHARDS` : ""}`);
    window.setTimeout(() => setToast(null), 2200);
  }, [dispatch]);

  const unclaimed = achievements.filter((a) => a.done && !a.claimed);

  function handleToggle(key: keyof ProfileSettings) {
    setProfile((p) => toggleSetting(p, key));
  }

  return (
    <section className="pf-screen" style={accentStyle}>
      <div className="pf-bg-grid" />

      <header className="pf-hud">
        <div>
          <p className="pf-kicker">HEXIUM · OPERATOR FILE</p>
          <h1>Profile</h1>
          <p className="pf-sub">
            Operator <b>{operatorId}</b> · {doneCount}/{achievements.length} achievements
            {unclaimed.length > 0 && <span className="pf-unclaimed-badge"> {unclaimed.length} unclaimed</span>}
          </p>
        </div>
        <div className="pf-resources">
          <span className="pf-pill">
            <b>HEX</b> {fmtNum(hex, compact)}
          </span>
          <span className="pf-pill alt">
            <b>◈</b> {fmtNum(shards, compact)}
          </span>
        </div>
      </header>

      <main className="pf-content">
        {/* ── OPERATOR HERO ── */}
        <div className="pf-hero">
          <button className="pf-av" onClick={() => setProfile((p) => cycleGlyph(p))} title="Change operator glyph">
            <span className="pf-ring" />
            <span className="pf-ring r2" />
            <span className="pf-glyph">{glyph}</span>
          </button>
          <div className="pf-id">
            <div className="pf-name-row">
              <span className="pf-name">Operator {operatorId}</span>
              <span className="pf-mk-badge">{tier.mk}</span>
            </div>
            <div className="pf-rank">⬢ {tier.fullName}</div>
            <div className="pf-lvlbar">
              <div className="pf-lvlfill" style={{ width: `${progPct}%` }} />
            </div>
            <div className="pf-lvltxt">
              Reactor LVL {reactorLevel} ·{" "}
              {tierProg.nextTier ? `${progPct}% to ${tierProg.nextTier.mk}` : "MAX TIER"} ·{" "}
              {fmtHashrate(hashrate)}
            </div>
          </div>
        </div>

        {/* ── PLAYER SUMMARY STAT GRID ── */}
        <div className="pf-sec-label">⬢ Operator Summary</div>
        <div className="pf-stat-grid">
          {stats.map((s) => (
            <div className={`pf-statcard${s.accent ? " accent" : ""}`} key={s.label}>
              <span className="pf-statcard-ic">{s.icon}</span>
              <div>
                <div className="pf-statcard-v">{s.value}</div>
                <div className="pf-statcard-l">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── PROGRESSION OVERVIEW ── */}
        <div className="pf-sec-label">⬢ Progression</div>
        <div className="pf-progression">
          <div className="pf-prog-row">
            <span className="pf-prog-label">Reactor Tier</span>
            <span className="pf-prog-value" style={{ color: `rgb(${tier.accent})` }}>{tier.mk} — {tier.fullName}</span>
          </div>
          <div className="pf-prog-bar-wrap">
            <div className="pf-prog-bar">
              <div className="pf-prog-fill" style={{ width: `${progPct}%`, background: `linear-gradient(90deg, rgb(${tier.accent}), rgb(${tier.accent2}))` }} />
            </div>
            <span className="pf-prog-pct">{tierProg.nextTier ? `${progPct}% to ${tierProg.nextTier.mk}` : "MAX"}</span>
          </div>
          <div className="pf-prog-row">
            <span className="pf-prog-label">Lifetime Mined</span>
            <span className="pf-prog-value">{fmtNum(totalHexMined, compact)} HEX</span>
          </div>
          <div className="pf-prog-row">
            <span className="pf-prog-label">Fleet Output</span>
            <span className="pf-prog-value">{fmtHashrate(hashrate)}</span>
          </div>
          <div className="pf-prog-milestones">
            {[10, 20, 30, 40, 50].map((lvl) => (
              <div key={lvl} className={`pf-milestone${reactorLevel >= lvl ? " reached" : ""}`}>
                <span className="pf-milestone-dot" />
                <span className="pf-milestone-lvl">LVL {lvl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COSMETICS / EQUIPPED SKIN ── */}
        <div className="pf-sec-label">⬢ Cosmetics</div>
        <div className="pf-cosmetic">
          <div className="pf-cos-main">
            <span className="pf-cos-ic">{equippedItem ? equippedItem.icon : "⬡"}</span>
            <div className="pf-cos-id">
              <div className="pf-cos-name">{equippedItem ? equippedItem.name : "Default Reactor Skin"}</div>
              <div className="pf-cos-sub">
                {equippedItem ? `Equipped · ${equippedItem.rarity}` : "No cosmetic equipped"}
              </div>
            </div>
            <span className="pf-cos-tag">{cosmetics.ownedSkins.length} owned</span>
          </div>
          <button className="pf-cos-btn" onClick={() => onNavigate?.("shop")}>
            Open Black Market →
          </button>
        </div>

        {/* ── ACHIEVEMENTS ── */}
        <div className="pf-sec-label">
          ⬢ Achievements <span className="pf-sec-count">{doneCount}/{achievements.length}</span>
        </div>
        <div className="pf-achv-grid">
          {achievements.map((a) => (
            <div
              className={`pf-achv${a.done ? " done" : ""}${a.done && !a.claimed ? " claimable" : ""}`}
              key={a.id}
              title={`${a.desc}${a.rewardHex > 0 ? ` (+${a.rewardHex} HEX)` : ""}${a.rewardShards > 0 ? ` (+${a.rewardShards} SHARDS)` : ""}`}
              onClick={() => handleClaimAchv(a)}
            >
              <span className="pf-achv-ic">{a.icon}</span>
              <span className="pf-achv-name">{a.name}</span>
              {a.claimed ? (
                <span className="pf-achv-chk">✓</span>
              ) : a.done ? (
                <span className="pf-achv-reward">CLAIM</span>
              ) : (
                <span className="pf-achv-prog">
                  <span className="pf-achv-progfill" style={{ width: `${Math.round(a.ratio * 100)}%` }} />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── SETTINGS ── */}
        <div className="pf-sec-label">⬢ Settings</div>
        <div className="pf-settings">
          {SETTING_TOGGLES.map((t) => {
            const on = profile.settings[t.key];
            return (
              <button
                className="pf-toggle"
                key={t.key}
                onClick={() => handleToggle(t.key)}
                aria-pressed={on}
              >
                <span className="pf-toggle-txt">
                  <span className="pf-toggle-label">{t.label}</span>
                  <span className="pf-toggle-hint">{t.hint}</span>
                </span>
                <span className={`pf-switch${on ? " on" : ""}`}>
                  <span className="pf-switch-knob" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="pf-foot-note">Operator file · settings saved locally · v7 build</div>
      </main>

      {toast && <div className="pf-toast">{toast}</div>}
    </section>
  );
}

export default ProfileScreen;
