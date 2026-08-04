import { useMemo, useState } from "react";
import type { GameReward } from "../../app/core/hexiumTypes";
import { telegramBridge } from "../../app/bridges/telegramBridge";
import type { FriendsProps } from "./Friends.types";
import "./Friends.css";

const FRIENDS_STORAGE_KEY = "hexium_friends_mvp_v1";

const FIRST_SHARE_REWARD: GameReward = { type: "hex", amount: 150 };
const REFERRAL_JOIN_REWARD: GameReward = { type: "hex", amount: 500 };

type FriendsState = {
  copiedInvite: boolean;
  firstShareClaimed: boolean;
  copiedCount: number;
  lastCopiedAt?: number;
};

const DEFAULT_STATE: FriendsState = {
  copiedInvite: false,
  firstShareClaimed: false,
  copiedCount: 0,
};

function loadFriendsState(): FriendsState {
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<FriendsState>;
    return {
      copiedInvite: Boolean(parsed.copiedInvite),
      firstShareClaimed: Boolean(parsed.firstShareClaimed),
      copiedCount: Math.max(0, Number(parsed.copiedCount) || 0),
      lastCopiedAt: typeof parsed.lastCopiedAt === "number" ? parsed.lastCopiedAt : undefined,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveFriendsState(state: FriendsState): void {
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

function makeStableGuestCode(playerId: string): string {
  const raw = playerId && playerId !== "guest" ? playerId : "guest";
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `G${Math.abs(hash).toString().slice(0, 6).padStart(6, "0")}`;
}

function getReferralCode(playerId: string): string {
  const tgUserId = telegramBridge.getUserId();
  if (tgUserId > 0) return String(tgUserId);
  if (playerId.startsWith("tg_")) return playerId.replace("tg_", "");
  return makeStableGuestCode(playerId);
}

function getInviteLink(referralCode: string): string {
  const tgLink = telegramBridge.getInviteLink();
  if (tgLink) return tgLink;
  const botUsername = import.meta.env.VITE_BOT_USERNAME ?? "hexium_bot";
  return `https://t.me/${botUsername}?start=ref_${encodeURIComponent(referralCode)}`;
}

function rewardLabel(reward: GameReward): string {
  if (reward.type === "hex") return `+${reward.amount.toLocaleString()} HEX`;
  if (reward.type === "shards") return `+${reward.amount.toLocaleString()} SHARDS`;
  if (reward.type === "case") return `+${reward.amount} ${reward.caseType.toUpperCase()} CASE`;
  return reward.type.toUpperCase();
}

export function FriendsScreen({
  hex = 0,
  shards = 0,
  playerId = "guest",
  username = "Guest",
  onNavigate,
  dispatch,
}: FriendsProps) {
  const [state, setState] = useState<FriendsState>(() => loadFriendsState());
  const [toast, setToast] = useState("");

  const referralCode = useMemo(() => getReferralCode(playerId), [playerId]);
  const inviteLink = useMemo(() => getInviteLink(referralCode), [referralCode]);
  const canClaimShareReward = state.copiedInvite && !state.firstShareClaimed;

  function updateState(next: FriendsState): void {
    setState(next);
    saveFriendsState(next);
  }

  async function copyInvite(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(inviteLink);
      setToast("Invite link copied");
    } catch {
      setToast("Copy failed. Link is visible below.");
    }

    updateState({
      ...state,
      copiedInvite: true,
      copiedCount: state.copiedCount + 1,
      lastCopiedAt: Date.now(),
    });
  }

  function openFallbackShare(): void {
    const text = encodeURIComponent("Join HEXIUM CLICKER! ☢️ Mine HEX with me!");
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setToast("Share link opened");
  }

  function shareInvite(): void {
    try {
      if (telegramBridge.getUserId() > 0) {
        telegramBridge.shareInvite();
        setToast("Telegram share opened");
      } else {
        openFallbackShare();
      }
    } catch {
      openFallbackShare();
    }

    updateState({
      ...state,
      copiedInvite: true,
      copiedCount: state.copiedCount + 1,
      lastCopiedAt: Date.now(),
    });
  }

  function claimFirstShareReward(): void {
    if (!dispatch || !canClaimShareReward) return;
    dispatch({ type: "ADD_REWARD", reward: FIRST_SHARE_REWARD, source: "friends:first_share" });
    updateState({ ...state, firstShareClaimed: true });
    setToast(`${rewardLabel(FIRST_SHARE_REWARD)} claimed`);
  }

  return (
    <section className="fr-screen">
      <div className="fr-bg-grid" />
      <header className="fr-hud">
        <div>
          <p className="fr-kicker">HEXIUM · FRIENDS</p>
          <h1>Friends</h1>
        </div>
        <div className="fr-resources">
          <span className="fr-pill"><b>HEX</b> {hex.toLocaleString()}</span>
          <span className="fr-pill"><b>SHARDS</b> {shards.toLocaleString()}</span>
        </div>
      </header>

      <main className="fr-layout">
        <section className="fr-card fr-invite-card">
          <div className="fr-orb">👥</div>
          <div>
            <p className="fr-section-label">INVITE NETWORK</p>
            <h2>Bring miners to HEXIUM</h2>
            <p className="fr-muted">
              Запрошуй друзів у Telegram. Для MVP тут працює invite link, copy/share і перша нагорода за поширення.
            </p>
          </div>
        </section>

        <section className="fr-card fr-code-card">
          <div className="fr-row fr-row-spread">
            <div>
              <p className="fr-section-label">YOUR CODE</p>
              <strong className="fr-code">{referralCode}</strong>
            </div>
            <div className="fr-mini-stat">
              <span>PLAYER</span>
              <b>{username}</b>
            </div>
          </div>

          <label className="fr-link-label" htmlFor="fr-invite-link">Invite link</label>
          <input id="fr-invite-link" className="fr-link-input" value={inviteLink} readOnly />

          <div className="fr-actions">
            <button className="fr-button fr-button-primary" onClick={copyInvite}>COPY LINK</button>
            <button className="fr-button fr-button-secondary" onClick={shareInvite}>SHARE</button>
          </div>
        </section>

        <section className="fr-grid-2">
          <article className="fr-card fr-reward-card">
            <p className="fr-section-label">FIRST SHARE BONUS</p>
            <h3>{rewardLabel(FIRST_SHARE_REWARD)}</h3>
            <p className="fr-muted">Скопіюй або пошир invite link, потім забери стартовий social bonus.</p>
            <button
              className="fr-button fr-button-primary"
              disabled={!canClaimShareReward}
              onClick={claimFirstShareReward}
            >
              {state.firstShareClaimed ? "CLAIMED" : canClaimShareReward ? "CLAIM" : "COPY LINK FIRST"}
            </button>
          </article>

          <article className="fr-card fr-reward-card">
            <p className="fr-section-label">FRIEND JOIN REWARD</p>
            <h3>{rewardLabel(REFERRAL_JOIN_REWARD)}</h3>
            <p className="fr-muted">Нагорода за реального друга буде повністю активна після серверної перевірки Telegram referrals.</p>
            <button className="fr-button fr-button-ghost" onClick={() => onNavigate?.("tasks")}>OPEN TASKS</button>
          </article>
        </section>

        <section className="fr-card fr-stats-card">
          <div className="fr-stat"><span>Copied / shared</span><b>{state.copiedCount}</b></div>
          <div className="fr-stat"><span>Referrals</span><b>0</b></div>
          <div className="fr-stat"><span>Status</span><b>{state.firstShareClaimed ? "READY" : "START"}</b></div>
        </section>

        {toast && <div className="fr-toast" onAnimationEnd={() => setToast("")}>{toast}</div>}
      </main>
    </section>
  );
}

export default FriendsScreen;
