import { useEffect, useMemo, useRef, useState } from "react";
import type { NetworkProps, NetworkToast } from "./Network.types";
import {
  loadNetwork, saveNetwork, simulateSectors, totalNodes, globalHashrate,
  networkRank, buildLeaderboard, addSimReferral, referralBonusPct, nextMilestone,
  toggleSector, connectedBoostPct, makeActivityEvent,
  type SectorSnapshot,
} from "../../game/network/networkLogic";
import type { NetworkState, ActivityEvent } from "../../game/network/networkData";
import { NETWORK_BALANCE, fmt, fmtInt, fmtHashrate } from "../../game/network/networkBalance";
import "./Network.css";

const STATUS_LABEL: Record<string, string> = { online: "ONLINE", syncing: "SYNCING", offline: "OFFLINE" };

export function NetworkScreen({ hex = 0, shards = 0, player }: NetworkProps) {
  const reactorLvl = player?.level ?? 0;
  const playerHashrate = player?.hashrate ?? 0;

  const [net, setNet] = useState<NetworkState>(() => loadNetwork());
  const [tick, setTick] = useState<number>(() => Date.now());
  const [feed, setFeed] = useState<ActivityEvent[]>(() =>
    Array.from({ length: NETWORK_BALANCE.ACTIVITY_LIMIT }, (_, i) => makeActivityEvent(Date.now() - i * 1700 + i)),
  );
  const [toasts, setToasts] = useState<NetworkToast[]>([]);
  const toastId = useRef(1);

  // persist whenever referrals / sectors change
  useEffect(() => { saveNetwork(net); }, [net]);

  // live online-node simulation
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setTick(now);
      setFeed((prev) => [makeActivityEvent(now + Math.floor(Math.random() * 9999)), ...prev].slice(0, NETWORK_BALANCE.ACTIVITY_LIMIT));
    }, NETWORK_BALANCE.SIM_TICK_MS);
    return () => clearInterval(iv);
  }, []);

  const sectors: SectorSnapshot[] = useMemo(() => simulateSectors(tick, net.connectedSectors), [tick, net.connectedSectors]);
  const nodesOnline = useMemo(() => totalNodes(sectors), [sectors]);
  const globalPH = useMemo(() => globalHashrate(sectors), [sectors]);
  const leaders = useMemo(() => buildLeaderboard(hex, reactorLvl), [hex, reactorLvl]);

  const refCount = net.referrals.length;
  const refBonus = referralBonusPct(net);
  const sectorBonus = connectedBoostPct(net);
  const totalBonus = refBonus + sectorBonus;
  const rank = networkRank(hex);
  const milestone = nextMilestone(refCount);
  const milestonePct = Math.min(100, (refCount / milestone.count) * 100);

  function pushToast(text: string, tone: NetworkToast["tone"] = "ok") {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }

  function onInvite() {
    setNet((s) => addSimReferral(s));
    pushToast(`+1 referral · +${2}% hashrate`, "ok");
  }

  function onCopy() {
    const code = net.referralCode;
    try {
      navigator.clipboard?.writeText(`hexium.app/i/${code}`);
    } catch { /* ignore */ }
    pushToast(`Invite link copied · ${code}`, "info");
  }

  function onConnect(id: string, code: string, connected: boolean) {
    setNet((s) => toggleSector(s, id));
    pushToast(connected ? `Disconnected ${code}` : `Connected to ${code}`, connected ? "info" : "ok");
  }

  return (
    <section className="nw-screen">
      <div className="nw-bg-grid" />

      <header className="nw-hud">
        <div>
          <p className="nw-kicker">HEXIUM · DISTRIBUTED GRID</p>
          <h1>Network</h1>
          <p className="nw-sub">Global mining mesh · <b>{fmtInt(nodesOnline)}</b> nodes online</p>
        </div>
        <div className="nw-resources">
          <span className="nw-pill"><b>HEX</b> {fmt(hex)}</span>
          <span className="nw-pill alt"><b>◈</b> {fmt(shards)}</span>
        </div>
      </header>

      <main className="nw-content">
        {/* ── HERO ORBIT ── */}
        <div className="nw-net-hero">
          <div className="nw-net-grid-bg" />
          <div className="nw-net-orbit">
            <div className="nw-net-core">⬢</div>
            {[1, 2, 3, 4, 5, 6].map((n) => <span key={n} className={`nw-net-node n${n}`} />)}
          </div>
          <div className="nw-live-tag"><span className="nw-live-dot" /> LIVE</div>
          <div className="nw-net-read">
            <div className="nw-net-read-v">{fmtHashrate(globalPH * 1000)}</div>
            <div className="nw-net-read-l">GLOBAL HASHRATE</div>
          </div>
        </div>

        {/* ── PLAYER NETWORK STATS ── */}
        <div className="nw-stat-grid">
          {statCard("🔌", "YOUR HASHRATE", `${(playerHashrate || 0.4).toFixed(1)} H/s`)}
          {statCard("🏆", "NETWORK RANK", `#${rank}`)}
          {statCard("👥", "ACTIVE MINERS", fmtInt(nodesOnline))}
          {statCard("⚡", "GRID BONUS", `+${totalBonus}%`)}
          {statCard("🔗", "REFERRALS", `${refCount} · +${refBonus}%`)}
          {statCard("🛰", "SECTORS", `${net.connectedSectors.length}/${sectors.length}`)}
        </div>

        {/* ── NETWORK SECTORS ── */}
        <div className="nw-sec-label">🛰 Network Sectors</div>
        <div className="nw-sector-grid">
          {sectors.map((s) => {
            const connected = net.connectedSectors.includes(s.id);
            return (
              <div key={s.id} className={`nw-sector${connected ? " on" : ""}`}>
                <div className="nw-sector-top">
                  <span className="nw-sector-glyph">{s.region}</span>
                  <span className="nw-sector-code">{s.code}</span>
                  <span className={`nw-sector-status ${s.status}`}>
                    <span className="nw-sdot" />{STATUS_LABEL[s.status]}
                  </span>
                </div>
                <div className="nw-sector-name">{s.name}</div>
                <div className="nw-sector-stats">
                  <div><b>{fmtInt(s.nodesOnline)}</b><span>NODES</span></div>
                  <div><b>{s.hashrate.toFixed(0)}</b><span>TH/s</span></div>
                  <div><b>+{s.boost}%</b><span>BOOST</span></div>
                </div>
                <button
                  className={`nw-sector-btn${connected ? " on" : ""}`}
                  disabled={s.status === "offline"}
                  onClick={() => onConnect(s.id, s.code, connected)}
                >
                  {connected ? "✓ CONNECTED" : "CONNECT"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── REFERRAL / SOCIAL ── */}
        <div className="nw-sec-label">🔗 Referral Network</div>
        <div className="nw-ref-card">
          <div className="nw-ref-codebar">
            <div>
              <div className="nw-ref-code-l">YOUR INVITE CODE</div>
              <div className="nw-ref-code">{net.referralCode}</div>
            </div>
            <button className="nw-ref-copy" onClick={onCopy}>📋 COPY LINK</button>
          </div>
          <div className="nw-ref-milestone">
            <div className="nw-ref-mile-row">
              <span>Next: <b>{milestone.label}</b> ({milestone.count})</span>
              <span className="nw-ref-mile-rw">{milestone.reward}</span>
            </div>
            <div className="nw-ref-bar"><div className="nw-ref-fill" style={{ width: `${milestonePct}%` }} /></div>
            <div className="nw-ref-mile-foot">{refCount} / {milestone.count} invites · +{refBonus}% hashrate active</div>
          </div>
          <button className="nw-ref-invite" onClick={onInvite}>＋ INVITE A MINER (simulate)</button>
          {refCount > 0 && (
            <div className="nw-ref-list">
              {net.referrals.slice(0, 5).map((r) => (
                <div key={r.id} className="nw-ref-item">
                  <span className="nw-ref-av">{r.name.charAt(0).toUpperCase()}</span>
                  <span className="nw-ref-name">{r.name}</span>
                  <span className="nw-ref-lvl">LVL {r.lvl}</span>
                  <span className="nw-ref-bonus">+{r.bonusPct}%</span>
                </div>
              ))}
              {refCount > 5 && <div className="nw-ref-more">+{refCount - 5} more miners in your network</div>}
            </div>
          )}
        </div>

        {/* ── LEADERBOARD ── */}
        <div className="nw-sec-label">⬢ Global Leaderboard</div>
        <div className="nw-lead">
          {leaders.map((l) => (
            <div key={`${l.rank}-${l.name}`} className={`nw-lead-row${l.you ? " you" : ""}`}>
              <span className={`nw-lead-rank${l.rank <= 3 ? " top" : ""}`}>#{l.rank}</span>
              <span className="nw-lead-name">{l.name}</span>
              <span className="nw-lead-lvl">LVL {l.lvl}</span>
              <span className="nw-lead-hex">{fmt(l.hex)} HEX</span>
            </div>
          ))}
        </div>

        {/* ── LIVE ACTIVITY (online node simulation) ── */}
        <div className="nw-sec-label">📡 Live Grid Activity</div>
        <div className="nw-feed">
          {feed.map((e) => (
            <div key={e.id} className={`nw-feed-row k-${e.kind}`}>
              <span className="nw-feed-dot" />
              <span className="nw-feed-text">{e.text}</span>
              <span className="nw-feed-sector">{e.sector}</span>
            </div>
          ))}
        </div>
        <div className="nw-foot-note">Distributed grid · {fmtInt(nodesOnline)} nodes · sim refresh {(NETWORK_BALANCE.SIM_TICK_MS / 1000).toFixed(1)}s</div>
      </main>

      {/* ── TOASTS ── */}
      <div className="nw-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`nw-toast ${t.tone}`}>{t.text}</div>
        ))}
      </div>
    </section>
  );
}

function statCard(icon: string, label: string, value: string) {
  return (
    <div className="nw-statcard" key={label}>
      <span className="nw-statcard-ic">{icon}</span>
      <div>
        <div className="nw-statcard-v">{value}</div>
        <div className="nw-statcard-l">{label}</div>
      </div>
    </div>
  );
}

export default NetworkScreen;
