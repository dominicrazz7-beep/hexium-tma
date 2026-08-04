/* ═══════════════════════════════════════════════════════
   ReactorCore — Tappable reactor, fully TIER-driven.
   Every Reactor Tier (MK-I … MK-VI) swaps its armor/form,
   orbit drones and ambient effect so the evolution between
   tiers is immediately visible.
   Layers: Chamber · Tier armor stack · Orbit drones ·
   State ring · Energy rings · Bloom · Core (nucleus, hex,
   plasma, sparks) · Tier effect · Tier badge · overlays.
   ═══════════════════════════════════════════════════════ */
import { useCallback, useMemo, useRef } from "react";
import type { ReactorVisualState, Spark } from "../MainReactor.types";
import type { HeatState, ReactorTier } from "../../../game/reactor/reactorBalance";
import { HEAT_STATE_LABELS } from "../../../game/reactor/reactorBalance";
import "./ReactorCore.css";

type ReactorCoreProps = {
  visualState: ReactorVisualState;
  heatState: HeatState;
  tempPercent: number;
  onTap: (e: React.MouseEvent | React.TouchEvent) => void;
  disabled: boolean;
  turboTimeLeft: number;
  reactorLevel: number;
  /** Active reactor tier (drives every visual). */
  tier: ReactorTier;
  /** Energy spark particles (spawned on tap). */
  sparks: Spark[];
};

/* ── Quantum Chamber (reactor stands inside a room) ───── */
function Chamber() {
  return (
    <div className="mr-chamber">
      <div className="mr-chamber-wall l" />
      <div className="mr-chamber-wall r" />
      <div className="mr-chamber-beam" />
      <div className="mr-chamber-floor" />
      <div className="mr-chamber-strut l" />
      <div className="mr-chamber-strut r" />
      <div className="mr-chamber-platform" />
    </div>
  );
}

/* Build a ring of hex polygons (used for crown / plating). */
function hexRing(n: number, rad: number, sz: number, fill: string, stroke: string, sw = 0.5) {
  const polys = [];
  for (let i = 0; i < n; i++) {
    const ang = (i * (360 / n) * Math.PI) / 180;
    const cx = 50 + rad * Math.cos(ang);
    const cy = 50 + rad * Math.sin(ang);
    const pts: string[] = [];
    for (let j = 0; j < 6; j++) {
      const t = ((j * 60 - 90) * Math.PI) / 180;
      pts.push(`${(cx + sz * Math.cos(t)).toFixed(2)},${(cy + sz * Math.sin(t)).toFixed(2)}`);
    }
    polys.push(
      <polygon key={i} points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth={sw} />,
    );
  }
  return polys;
}

/* ── Tier Armor — the reactor's form changes per tier ──── */
function TierArmor({ tier, visualState }: { tier: ReactorTier; visualState: ReactorVisualState }) {
  // Colour overridden during turbo / overheat for feedback
  const col =
    visualState === "overheat" ? "255,90,80" : visualState === "turbo" ? "200,90,255" : tier.accent;
  const col2 =
    visualState === "overheat" ? "255,140,90" : visualState === "turbo" ? "230,140,255" : tier.accent2;

  return (
    <div className={`mr-armor-stack armor-${tier.armor}`}>
      {/* Base 6 hex plates — present on every tier */}
      <svg className="mr-armor-plates" viewBox="0 0 100 100" fill="none">
        {hexRing(6, 32, 9, `rgba(${col},.12)`, `rgba(${col},.55)`, 0.8)}
      </svg>

      {/* MK-II+ : outer segmented refinery ring */}
      {tier.id >= 1 && (
        <svg className="mr-armor-ring" viewBox="0 0 100 100" fill="none">
          {Array.from({ length: 12 }).map((_, i) => {
            const a0 = (i * 30 - 88) * (Math.PI / 180);
            const a1 = (i * 30 - 62) * (Math.PI / 180);
            const r = 42;
            const x0 = 50 + r * Math.cos(a0), y0 = 50 + r * Math.sin(a0);
            const x1 = 50 + r * Math.cos(a1), y1 = 50 + r * Math.sin(a1);
            return (
              <path key={i} d={`M${x0.toFixed(1)} ${y0.toFixed(1)} A42 42 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
                stroke={`rgba(${col2},.5)`} strokeWidth="2.2" strokeLinecap="round" />
            );
          })}
        </svg>
      )}

      {/* MK-III+ : boss crown spikes */}
      {tier.id >= 2 && (
        <svg className="mr-armor-crown" viewBox="0 0 100 100" fill="none">
          {hexRing(tier.id >= 4 ? 14 : 10, 45, 3.2, `rgba(${col},.14)`, `rgba(${col},.6)`, 0.6)}
        </svg>
      )}

      {/* MK-IV+ : singularity accretion rings (rotating, dashed) */}
      {tier.id >= 3 && (
        <>
          <div className="mr-sing-ring r1" />
          <div className="mr-sing-ring r2" />
        </>
      )}

      {/* MK-V+ : hyperion solar corona rays */}
      {tier.id >= 4 && (
        <svg className="mr-armor-corona" viewBox="0 0 100 100" fill="none">
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * 15) * (Math.PI / 180);
            const r0 = 47, r1 = 50;
            return (
              <line key={i}
                x1={(50 + r0 * Math.cos(a)).toFixed(1)} y1={(50 + r0 * Math.sin(a)).toFixed(1)}
                x2={(50 + r1 * Math.cos(a)).toFixed(1)} y2={(50 + r1 * Math.sin(a)).toFixed(1)}
                stroke={`rgba(${col2},.7)`} strokeWidth="1.4" strokeLinecap="round" />
            );
          })}
        </svg>
      )}

      {/* MK-VI : godcore prismatic halo */}
      {tier.id >= 5 && <div className="mr-godcore-halo" />}
    </div>
  );
}

/* ── Orbit drones — count + roster grow per tier ──────── */
function TierOrbits({ tier }: { tier: ReactorTier }) {
  const drones = tier.drones.slice(0, tier.orbits);
  return (
    <div className="mr-orbit-field">
      {drones.map((d, i) => (
        <div key={i} className={`mr-orbitr mr-orbitr-${i}`} style={{ ["--oi" as any]: i }}>
          <div className="mr-odrone">
            <span className="mr-odrone-ico">{d.icon}</span>
            <span className="mr-odrone-tag">{d.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Ambient effect layer — unique per tier ───────────── */
function TierEffectLayer({ tier }: { tier: ReactorTier }) {
  const bits = useMemo(() => {
    const n = tier.effect === "spark" ? 0 : tier.effect === "divine" ? 16 : 10;
    return Array.from({ length: n }).map((_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      d: Math.random() * 4,
      s: 0.6 + Math.random() * 1.1,
    }));
  }, [tier.effect]);

  if (tier.effect === "spark") return null;
  return (
    <div className={`mr-effect mr-effect-${tier.effect}`}>
      {tier.effect === "vortex" && <div className="mr-vortex" />}
      {tier.effect === "solar" && (
        <>
          <div className="mr-solar-flare f1" />
          <div className="mr-solar-flare f2" />
        </>
      )}
      {tier.effect === "divine" && <div className="mr-divine-rays" />}
      {bits.map((b) => (
        <span key={b.id} className="mr-effect-bit"
          style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${b.d}s`, transform: `scale(${b.s})` }} />
      ))}
    </div>
  );
}

/* ── Inner hex lattice ────────────────────────────────── */
function InnerHexSVG({ tier }: { tier: ReactorTier }) {
  const c = tier.accent;
  return (
    <svg className="mr-inner-hex" viewBox="0 0 100 100" fill="none">
      <path d="M50 5L90 27v46L50 95 10 73V27L50 5z" stroke={`rgba(${c},0.45)`} strokeWidth="1" fill="none" />
      <path d="M50 22L74 36v28L50 78 26 64V36L50 22z" stroke={`rgba(${c},0.25)`} strokeWidth=".7" fill="none" />
      <path d="M50 38L60 44v12L50 62 40 56V44L50 38z" stroke={`rgba(${c},0.15)`} strokeWidth=".5" fill="none" />
    </svg>
  );
}

/* ── Plasma particles inside the core ─────────────────── */
function PlasmaParticles() {
  const dots = useMemo(() => {
    const a = [];
    for (let i = 0; i < 12; i++) {
      a.push({ id: i, x: 15 + Math.random() * 70, y: 15 + Math.random() * 70, d: Math.random() * 4 });
    }
    return a;
  }, []);
  return (
    <div className="mr-plasma">
      {dots.map((d) => (
        <div key={d.id} className="mr-plasma-dot" style={{ left: `${d.x}%`, top: `${d.y}%`, animationDelay: `${d.d}s` }} />
      ))}
    </div>
  );
}

/* ── Energy sparks (spawned on tap) ───────────────────── */
function EnergySparks({ sparks }: { sparks: Spark[] }) {
  return (
    <div className="mr-sparks">
      {sparks.map((s) => {
        if (s.kind === "dot") {
          return (
            <div key={s.id} className={`mr-spark-dot ${s.color}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}ms` }} />
          );
        }
        if (s.kind === "arc") {
          return (
            <div key={s.id} className={`mr-spark-arc ${s.color}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.rot}deg)` }} />
          );
        }
        return (
          <svg key={s.id} className="mr-spark"
            style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: "50px", height: "50px", overflow: "visible", opacity: 1 }}>
            <line className="mr-spark-line" x1="0" y1="0" x2={s.dx} y2={s.dy}
              stroke={s.color === "purple" ? "rgba(192,38,255,.7)" : "rgba(0,240,255,.7)"} strokeWidth="1.5" />
          </svg>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ReactorCore({
  visualState,
  heatState,
  tempPercent,
  onTap,
  disabled,
  turboTimeLeft,
  reactorLevel,
  tier,
  sparks,
}: ReactorCoreProps) {
  const coreRef = useRef<HTMLButtonElement>(null);

  const handleInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      const el = coreRef.current;
      if (el) {
        el.classList.remove("mr-core-pulse");
        void el.offsetWidth; // reflow
        el.classList.add("mr-core-pulse");
      }
      onTap(e);
    },
    [disabled, onTap],
  );

  // Glow intensity based on temperature
  const gi = Math.min(1, tempPercent / 100);
  const glowColor =
    visualState === "turbo"
      ? `rgba(192, 38, 255, ${0.2 + gi * 0.4})`
      : visualState === "overheat"
        ? `rgba(255, 60, 60, ${0.3 + gi * 0.35})`
        : `rgba(${tier.accent}, ${0.12 + gi * 0.35})`;

  const cssVars = {
    "--sa": tier.accent,
    "--tc": tier.accent,
    "--tc2": tier.accent2,
  } as React.CSSProperties;

  return (
    <div className={`mr-reactor-zone mr-tier-${tier.id} ${visualState}`} style={cssVars}>
      {/* Environment */}
      <Chamber />
      <TierArmor tier={tier} visualState={visualState} />
      <TierOrbits tier={tier} />

      {/* State ring (heat-driven) */}
      <div className={`mr-state-ring ${heatState}`}>
        <span className={`mr-state-label ${heatState}`}>{HEAT_STATE_LABELS[heatState]}</span>
      </div>

      {/* Energy rings */}
      <div className="mr-ring-container">
        <span className={`mr-ring mr-ring-1 ${visualState}`} />
        <span className={`mr-ring mr-ring-2 ${visualState}`} />
        <span className={`mr-ring mr-ring-3 ${visualState}`} />
      </div>

      {/* Bloom */}
      <div className={`mr-bloom ${visualState}`} />

      {/* Core button */}
      <button
        ref={coreRef}
        className={`mr-core ${visualState} ${disabled ? "mr-core-disabled" : ""} mr-form-${tier.id}`}
        onClick={handleInteraction}
        disabled={disabled}
        aria-label="Tap reactor to mine HEX"
        style={{
          boxShadow: `0 0 ${40 + gi * 80}px ${glowColor}, inset 0 0 ${20 + gi * 40}px ${glowColor}`,
        }}
      >
        <div className="mr-pulse-wave mr-pw1" />
        <div className="mr-pulse-wave mr-pw2" />
        <div className="mr-pulse-wave mr-pw3" />

        <InnerHexSVG tier={tier} />
        <PlasmaParticles />
        <TierEffectLayer tier={tier} />
        <div className="mr-nucleus" />
        <EnergySparks sparks={sparks} />

        <span className="mr-core-level">LVL {reactorLevel}</span>
      </button>

      {/* Tier badge */}
      {visualState !== "turbo" && visualState !== "overheat" && (
        <div className="mr-form-badge">
          <span className="mr-form-hex">⬢</span> {tier.fullName}
        </div>
      )}

      {/* Turbo overlay */}
      {visualState === "turbo" && turboTimeLeft > 0 && (
        <div className="mr-overlay">
          <span className="mr-badge mr-badge-turbo">🚀 TURBO ×5 — {turboTimeLeft.toFixed(1)}s</span>
        </div>
      )}

      {/* Overheat overlay */}
      {visualState === "overheat" && (
        <div className="mr-overlay">
          <span className="mr-badge mr-badge-oh">🔥 OVERHEAT</span>
          <div className="mr-badge-oh-sub">Охолодження...</div>
        </div>
      )}
    </div>
  );
}
