/* ═══════════════════════════════════════════════════════
   EXPEDITIONS — Balance V2 (Tier Specialization)
   SHORT = best Module Fragments/hour, less HEX
   MEDIUM = best Research/hour, medium HEX
   LONG = best HEX/hour, artifact chance, rare rewards
   ═══════════════════════════════════════════════════════ */
import type { ExpeditionDef } from "./expeditionsData";

export const EXPEDITIONS_BALANCE = {
  MAX_ACTIVE: 2,
  HISTORY_LIMIT: 15,
  COOLDOWN_SAME_EXPEDITION_MS: 5 * 60 * 1000,
} as const;

export const EXPEDITION_DEFS: ExpeditionDef[] = [
  /* ════════════════════════════════════════════════════
     SHORT — Module Fragment specialists
     Fast turns, best Module Frag/hour, modest HEX
     ════════════════════════════════════════════════════ */
  {
    id: "supply_drop",
    name: "Supply Drop",
    icon: "📦",
    description: "Intercept a supply drop. Best source of module fragments.",
    tier: "short",
    durationMs: 10 * 60 * 1000,
    requiredLevel: 1,
    rewards: [
      { type: "hex", amount: 150, chance: 1 },
      { type: "module_fragment", amount: 4, chance: 0.7 },
      { type: "bot_fragment", amount: 1, chance: 0.2 },
    ],
  },
  {
    id: "scrap_run",
    name: "Scrap Run",
    icon: "⛏",
    description: "Quick salvage. Module fragments + bot scraps.",
    tier: "short",
    durationMs: 15 * 60 * 1000,
    requiredLevel: 1,
    rewards: [
      { type: "hex", amount: 180, chance: 1 },
      { type: "module_fragment", amount: 5, chance: 0.6 },
      { type: "bot_fragment", amount: 2, chance: 0.3 },
    ],
  },
  {
    id: "signal_scan",
    name: "Signal Scan",
    icon: "📡",
    description: "Scan for signals. Mix of modules and research.",
    tier: "short",
    durationMs: 20 * 60 * 1000,
    requiredLevel: 3,
    rewards: [
      { type: "hex", amount: 200, chance: 1 },
      { type: "module_fragment", amount: 6, chance: 0.5 },
      { type: "research_points", amount: 20, chance: 0.3 },
    ],
  },
  /* ── Release 1: Short expeditions ─────────────────── */
  {
    id: "salvage_mission",
    name: "Salvage Mission",
    icon: "🔧",
    description: "Quick salvage. Best module fragment rate.",
    tier: "short",
    durationMs: 8 * 60 * 1000,
    requiredLevel: 1,
    rewards: [
      { type: "hex", amount: 120, chance: 1 },
      { type: "module_fragment", amount: 3, chance: 0.7 },
      { type: "bot_fragment", amount: 1, chance: 0.15 },
    ],
  },
  {
    id: "data_sweep",
    name: "Data Sweep",
    icon: "📊",
    description: "Fast data extraction. Research focused.",
    tier: "short",
    durationMs: 12 * 60 * 1000,
    requiredLevel: 2,
    rewards: [
      { type: "hex", amount: 150, chance: 1 },
      { type: "research_points", amount: 15, chance: 0.5 },
      { type: "module_fragment", amount: 2, chance: 0.3 },
    ],
  },
  {
    id: "fragment_cache",
    name: "Fragment Cache",
    icon: "🧩",
    description: "Hunt for bot fragments.",
    tier: "short",
    durationMs: 18 * 60 * 1000,
    requiredLevel: 4,
    rewards: [
      { type: "hex", amount: 180, chance: 1 },
      { type: "bot_fragment", amount: 3, chance: 0.6 },
      { type: "module_fragment", amount: 2, chance: 0.25 },
    ],
  },
  {
    id: "quick_strike",
    name: "Quick Strike",
    icon: "⚡",
    description: "Fastest expedition. Module fragments.",
    tier: "short",
    durationMs: 5 * 60 * 1000,
    requiredLevel: 1,
    rewards: [
      { type: "hex", amount: 80, chance: 1 },
      { type: "module_fragment", amount: 2, chance: 0.6 },
    ],
  },

  /* ════════════════════════════════════════════════════
     MEDIUM — Research specialists
     Balanced turns, best Research/hour, medium HEX
     ════════════════════════════════════════════════════ */
  {
    id: "data_mining",
    name: "Data Mining",
    icon: "📊",
    description: "Deep data extraction. Best research yield per hour.",
    tier: "medium",
    durationMs: 1 * 60 * 60 * 1000,
    requiredLevel: 5,
    rewards: [
      { type: "hex", amount: 600, chance: 1 },
      { type: "research_points", amount: 50, chance: 0.7 },
      { type: "module_fragment", amount: 2, chance: 0.25 },
    ],
  },
  {
    id: "fragment_hunt",
    name: "Fragment Hunt",
    icon: "🧩",
    description: "Hunt for fragments. Research + bot fragments.",
    tier: "medium",
    durationMs: 1.5 * 60 * 60 * 1000,
    requiredLevel: 8,
    rewards: [
      { type: "hex", amount: 800, chance: 1 },
      { type: "research_points", amount: 60, chance: 0.6 },
      { type: "bot_fragment", amount: 4, chance: 0.4 },
    ],
  },
  {
    id: "patrol_sector",
    name: "Sector Patrol",
    icon: "🛰",
    description: "Patrol the sector. Steady research income.",
    tier: "medium",
    durationMs: 2 * 60 * 60 * 1000,
    requiredLevel: 10,
    rewards: [
      { type: "hex", amount: 1000, chance: 1 },
      { type: "research_points", amount: 90, chance: 0.5 },
      { type: "bot_fragment", amount: 3, chance: 0.3 },
    ],
  },
  /* ── Release 2: Medium expeditions ─────────────────── */
  {
    id: "deep_scan",
    name: "Deep Scan",
    icon: "🔍",
    description: "Deep data extraction. High research yield.",
    tier: "medium",
    durationMs: 1 * 60 * 60 * 1000,
    requiredLevel: 6,
    rewards: [
      { type: "hex", amount: 700, chance: 1 },
      { type: "research_points", amount: 50, chance: 0.7 },
      { type: "module_fragment", amount: 3, chance: 0.35 },
    ],
  },
  {
    id: "void_recon",
    name: "Void Recon",
    icon: "🌌",
    description: "Void reconnaissance. Bot fragment focused.",
    tier: "medium",
    durationMs: 1.5 * 60 * 60 * 1000,
    requiredLevel: 9,
    rewards: [
      { type: "hex", amount: 900, chance: 1 },
      { type: "bot_fragment", amount: 6, chance: 0.55 },
      { type: "module_fragment", amount: 3, chance: 0.3 },
    ],
  },
  {
    id: "quantum_survey",
    name: "Quantum Survey",
    icon: "🌀",
    description: "Quantum survey. Mixed high rewards.",
    tier: "medium",
    durationMs: 2 * 60 * 60 * 1000,
    requiredLevel: 12,
    rewards: [
      { type: "hex", amount: 1200, chance: 1 },
      { type: "research_points", amount: 70, chance: 0.6 },
      { type: "bot_fragment", amount: 5, chance: 0.45 },
      { type: "module_fragment", amount: 4, chance: 0.35 },
    ],
  },
  {
    id: "core_analysis",
    name: "Core Analysis",
    icon: "⚛️",
    description: "Core analysis. Research + module fragments.",
    tier: "medium",
    durationMs: 2.5 * 60 * 60 * 1000,
    requiredLevel: 14,
    rewards: [
      { type: "hex", amount: 1400, chance: 1 },
      { type: "research_points", amount: 80, chance: 0.65 },
      { type: "module_fragment", amount: 5, chance: 0.4 },
    ],
  },

  /* ════════════════════════════════════════════════════
     LONG — HEX specialists + rare drops
     Slow turns, best HEX/hour, artifact chance
     ════════════════════════════════════════════════════ */
  {
    id: "void_expedition",
    name: "Void Expedition",
    icon: "🌌",
    description: "Deep void exploration. High HEX + rare drops.",
    tier: "long",
    durationMs: 3 * 60 * 60 * 1000,
    requiredLevel: 15,
    rewards: [
      { type: "hex", amount: 6000, chance: 1 },
      { type: "research_points", amount: 40, chance: 0.4 },
      { type: "bot_fragment", amount: 6, chance: 0.35 },
      { type: "module_fragment", amount: 3, chance: 0.3 },
    ],
  },
  {
    id: "quantum_anomaly",
    name: "Quantum Anomaly",
    icon: "🌀",
    description: "Investigate anomaly. Massive HEX + module drops.",
    tier: "long",
    durationMs: 6 * 60 * 60 * 1000,
    requiredLevel: 20,
    rewards: [
      { type: "hex", amount: 14000, chance: 1 },
      { type: "module_fragment", amount: 5, chance: 0.4 },
      { type: "research_points", amount: 60, chance: 0.35 },
      { type: "bot_fragment", amount: 4, chance: 0.3 },
    ],
  },
  {
    id: "dark_matter_run",
    name: "Dark Matter Run",
    icon: "🌑",
    description: "The ultimate expedition. Maximum HEX + all rare drops.",
    tier: "long",
    durationMs: 8 * 60 * 60 * 1000,
    requiredLevel: 25,
    rewards: [
      { type: "hex", amount: 20000, chance: 1 },
      { type: "research_points", amount: 80, chance: 0.45 },
      { type: "bot_fragment", amount: 8, chance: 0.4 },
      { type: "module_fragment", amount: 6, chance: 0.35 },
    ],
  },
  /* ── Release 3: Long expeditions ──────────────────── */
  {
    id: "singularity_dive",
    name: "Singularity Dive",
    icon: "🌌",
    description: "Deep singularity exploration. HEX + artifact shards.",
    tier: "long",
    durationMs: 4 * 60 * 60 * 1000,
    requiredLevel: 18,
    rewards: [
      { type: "hex", amount: 8000, chance: 1 },
      { type: "research_points", amount: 60, chance: 0.5 },
      { type: "bot_fragment", amount: 8, chance: 0.4 },
      { type: "module_fragment", amount: 5, chance: 0.4 },
    ],
  },
  {
    id: "omega_expedition",
    name: "Omega Expedition",
    icon: "🌟",
    description: "Omega-level expedition. HEX + all rare drops.",
    tier: "long",
    durationMs: 7 * 60 * 60 * 1000,
    requiredLevel: 22,
    rewards: [
      { type: "hex", amount: 18000, chance: 1 },
      { type: "research_points", amount: 100, chance: 0.6 },
      { type: "bot_fragment", amount: 12, chance: 0.5 },
      { type: "module_fragment", amount: 8, chance: 0.45 },
    ],
  },
  {
    id: "reality_rift",
    name: "Reality Rift",
    icon: "🔮",
    description: "Reality rift expedition. Maximum rewards.",
    tier: "long",
    durationMs: 10 * 60 * 60 * 1000,
    requiredLevel: 30,
    rewards: [
      { type: "hex", amount: 25000, chance: 1 },
      { type: "research_points", amount: 150, chance: 0.7 },
      { type: "bot_fragment", amount: 15, chance: 0.55 },
      { type: "module_fragment", amount: 10, chance: 0.5 },
    ],
  },
];

export const EXPEDITION_BY_ID: Record<string, ExpeditionDef> = Object.fromEntries(
  EXPEDITION_DEFS.map((e) => [e.id, e]),
);

export function formatDuration(ms: number): string {
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
