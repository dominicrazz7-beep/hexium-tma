/* ═══════════════════════════════════════════════════════
   WORLD BOSSES — Data & Types
   Daily boss with tap damage system
   ═══════════════════════════════════════════════════════ */

export type BossRewardType = "hex" | "research_points" | "module_fragment" | "artifact_shard";

export type BossReward = {
  type: BossRewardType;
  amount: number;
  minDamagePercent: number;
};

export type BossDef = {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxHp: number;
  durationMs: number;
  rewards: BossReward[];
};

export type WorldBossState = {
  bossId: string;
  currentHp: number;
  totalDamage: number;
  attackCount: number;
  claimed: boolean;
  startedAt: number;
  endsAt: number;
};

export const BOSS_DEFS: BossDef[] = [
  {
    id: "quantum_titan",
    name: "Quantum Titan",
    icon: "🤖",
    description: "Ancient quantum entity. Massive HP, massive rewards.",
    maxHp: 500_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 10_000, minDamagePercent: 1 },
      { type: "hex", amount: 20_000, minDamagePercent: 5 },
      { type: "research_points", amount: 100, minDamagePercent: 5 },
      { type: "module_fragment", amount: 5, minDamagePercent: 5 },
      { type: "hex", amount: 35_000, minDamagePercent: 15 },
      { type: "research_points", amount: 250, minDamagePercent: 15 },
      { type: "module_fragment", amount: 15, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 5, minDamagePercent: 15 },
      { type: "hex", amount: 50_000, minDamagePercent: 25 },
      { type: "research_points", amount: 500, minDamagePercent: 25 },
      { type: "module_fragment", amount: 25, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 15, minDamagePercent: 25 },
    ],
  },
  {
    id: "plasma_sentinel",
    name: "Plasma Sentinel",
    icon: "⚡",
    description: "Energy guardian. Glowing cyan core, rotating rings.",
    maxHp: 400_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 8_000, minDamagePercent: 1 },
      { type: "hex", amount: 15_000, minDamagePercent: 5 },
      { type: "research_points", amount: 80, minDamagePercent: 5 },
      { type: "module_fragment", amount: 4, minDamagePercent: 5 },
      { type: "hex", amount: 25_000, minDamagePercent: 15 },
      { type: "research_points", amount: 180, minDamagePercent: 15 },
      { type: "module_fragment", amount: 12, minDamagePercent: 15 },
      { type: "hex", amount: 40_000, minDamagePercent: 25 },
      { type: "research_points", amount: 350, minDamagePercent: 25 },
      { type: "module_fragment", amount: 20, minDamagePercent: 25 },
    ],
  },
  {
    id: "void_walker",
    name: "Void Walker",
    icon: "🌀",
    description: "Dimensional traveler. Dark purple portal, shadow particles.",
    maxHp: 500_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 10_000, minDamagePercent: 1 },
      { type: "hex", amount: 18_000, minDamagePercent: 5 },
      { type: "research_points", amount: 90, minDamagePercent: 5 },
      { type: "module_fragment", amount: 5, minDamagePercent: 5 },
      { type: "hex", amount: 30_000, minDamagePercent: 15 },
      { type: "research_points", amount: 220, minDamagePercent: 15 },
      { type: "module_fragment", amount: 14, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 3, minDamagePercent: 15 },
      { type: "hex", amount: 45_000, minDamagePercent: 25 },
      { type: "research_points", amount: 420, minDamagePercent: 25 },
      { type: "module_fragment", amount: 22, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 10, minDamagePercent: 25 },
    ],
  },
  /* ── Release 2: Epic bosses ────────────────────────── */
  {
    id: "cryo_wraith",
    name: "Cryo Wraith",
    icon: "❄️",
    description: "Frozen entity. Ice blue aura, frost crystals.",
    maxHp: 700_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 15_000, minDamagePercent: 1 },
      { type: "hex", amount: 25_000, minDamagePercent: 5 },
      { type: "research_points", amount: 120, minDamagePercent: 5 },
      { type: "module_fragment", amount: 8, minDamagePercent: 5 },
      { type: "hex", amount: 40_000, minDamagePercent: 15 },
      { type: "research_points", amount: 300, minDamagePercent: 15 },
      { type: "module_fragment", amount: 20, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 8, minDamagePercent: 15 },
      { type: "hex", amount: 60_000, minDamagePercent: 25 },
      { type: "research_points", amount: 600, minDamagePercent: 25 },
      { type: "module_fragment", amount: 30, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 15, minDamagePercent: 25 },
    ],
  },
  {
    id: "quantum_hydra",
    name: "Quantum Hydra",
    icon: "🐉",
    description: "Multi-headed beast. Quantum entanglement lines.",
    maxHp: 800_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 18_000, minDamagePercent: 1 },
      { type: "hex", amount: 30_000, minDamagePercent: 5 },
      { type: "research_points", amount: 150, minDamagePercent: 5 },
      { type: "module_fragment", amount: 10, minDamagePercent: 5 },
      { type: "hex", amount: 50_000, minDamagePercent: 15 },
      { type: "research_points", amount: 350, minDamagePercent: 15 },
      { type: "module_fragment", amount: 25, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 10, minDamagePercent: 15 },
      { type: "hex", amount: 75_000, minDamagePercent: 25 },
      { type: "research_points", amount: 700, minDamagePercent: 25 },
      { type: "module_fragment", amount: 35, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 20, minDamagePercent: 25 },
    ],
  },
  {
    id: "dark_matter_giant",
    name: "Dark Matter Giant",
    icon: "🌑",
    description: "Cosmic horror. Black hole core, gravitational lensing.",
    maxHp: 900_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 20_000, minDamagePercent: 1 },
      { type: "hex", amount: 35_000, minDamagePercent: 5 },
      { type: "research_points", amount: 180, minDamagePercent: 5 },
      { type: "module_fragment", amount: 12, minDamagePercent: 5 },
      { type: "hex", amount: 60_000, minDamagePercent: 15 },
      { type: "research_points", amount: 400, minDamagePercent: 15 },
      { type: "module_fragment", amount: 30, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 12, minDamagePercent: 15 },
      { type: "hex", amount: 90_000, minDamagePercent: 25 },
      { type: "research_points", amount: 800, minDamagePercent: 25 },
      { type: "module_fragment", amount: 40, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 25, minDamagePercent: 25 },
    ],
  },
  /* ── Release 3: Legendary + Mythic bosses ──────────── */
  {
    id: "singularity_knight",
    name: "Singularity Knight",
    icon: "⚔️",
    description: "Armored warrior. Metallic armor, energy blade.",
    maxHp: 400_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 20_000, minDamagePercent: 1 },
      { type: "hex", amount: 40_000, minDamagePercent: 5 },
      { type: "research_points", amount: 200, minDamagePercent: 5 },
      { type: "module_fragment", amount: 15, minDamagePercent: 5 },
      { type: "hex", amount: 70_000, minDamagePercent: 15 },
      { type: "research_points", amount: 500, minDamagePercent: 15 },
      { type: "module_fragment", amount: 35, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 15, minDamagePercent: 15 },
      { type: "hex", amount: 100_000, minDamagePercent: 25 },
      { type: "research_points", amount: 800, minDamagePercent: 25 },
      { type: "module_fragment", amount: 50, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 30, minDamagePercent: 25 },
    ],
  },
  {
    id: "chrono_devourer",
    name: "Chrono Devourer",
    icon: "⏳",
    description: "Time entity. Clock fragments, time distortion.",
    maxHp: 500_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 25_000, minDamagePercent: 1 },
      { type: "hex", amount: 50_000, minDamagePercent: 5 },
      { type: "research_points", amount: 250, minDamagePercent: 5 },
      { type: "module_fragment", amount: 18, minDamagePercent: 5 },
      { type: "hex", amount: 80_000, minDamagePercent: 15 },
      { type: "research_points", amount: 600, minDamagePercent: 15 },
      { type: "module_fragment", amount: 40, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 18, minDamagePercent: 15 },
      { type: "hex", amount: 120_000, minDamagePercent: 25 },
      { type: "research_points", amount: 1000, minDamagePercent: 25 },
      { type: "module_fragment", amount: 60, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 35, minDamagePercent: 25 },
    ],
  },
  {
    id: "omega_titan",
    name: "Omega Titan",
    icon: "🌟",
    description: "Ultimate form. Prismatic halo, divine rays.",
    maxHp: 600_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 30_000, minDamagePercent: 1 },
      { type: "hex", amount: 60_000, minDamagePercent: 5 },
      { type: "research_points", amount: 300, minDamagePercent: 5 },
      { type: "module_fragment", amount: 20, minDamagePercent: 5 },
      { type: "hex", amount: 100_000, minDamagePercent: 15 },
      { type: "research_points", amount: 700, minDamagePercent: 15 },
      { type: "module_fragment", amount: 45, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 20, minDamagePercent: 15 },
      { type: "hex", amount: 150_000, minDamagePercent: 25 },
      { type: "research_points", amount: 1200, minDamagePercent: 25 },
      { type: "module_fragment", amount: 70, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 40, minDamagePercent: 25 },
    ],
  },
  {
    id: "void_god",
    name: "Void God",
    icon: "👁",
    description: "Cosmic deity. Reality裂缝, dark matter tendrils.",
    maxHp: 800_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 40_000, minDamagePercent: 1 },
      { type: "hex", amount: 80_000, minDamagePercent: 5 },
      { type: "research_points", amount: 400, minDamagePercent: 5 },
      { type: "module_fragment", amount: 25, minDamagePercent: 5 },
      { type: "hex", amount: 120_000, minDamagePercent: 15 },
      { type: "research_points", amount: 800, minDamagePercent: 15 },
      { type: "module_fragment", amount: 50, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 25, minDamagePercent: 15 },
      { type: "hex", amount: 180_000, minDamagePercent: 25 },
      { type: "research_points", amount: 1500, minDamagePercent: 25 },
      { type: "module_fragment", amount: 80, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 50, minDamagePercent: 25 },
    ],
  },
  {
    id: "hexium_prime",
    name: "HEXIUM Prime",
    icon: "💎",
    description: "The original. All visual elements combined.",
    maxHp: 1_000_000,
    durationMs: 24 * 60 * 60 * 1000,
    rewards: [
      { type: "hex", amount: 50_000, minDamagePercent: 1 },
      { type: "hex", amount: 100_000, minDamagePercent: 5 },
      { type: "research_points", amount: 500, minDamagePercent: 5 },
      { type: "module_fragment", amount: 30, minDamagePercent: 5 },
      { type: "hex", amount: 150_000, minDamagePercent: 15 },
      { type: "research_points", amount: 1000, minDamagePercent: 15 },
      { type: "module_fragment", amount: 60, minDamagePercent: 15 },
      { type: "artifact_shard", amount: 30, minDamagePercent: 15 },
      { type: "hex", amount: 200_000, minDamagePercent: 25 },
      { type: "research_points", amount: 2000, minDamagePercent: 25 },
      { type: "module_fragment", amount: 100, minDamagePercent: 25 },
      { type: "artifact_shard", amount: 60, minDamagePercent: 25 },
    ],
  },
];

export const BOSS_BY_ID: Record<string, BossDef> = Object.fromEntries(
  BOSS_DEFS.map((b) => [b.id, b]),
);

export function getDailyBossSeed(now: number): number {
  return Math.floor(now / (24 * 60 * 60 * 1000));
}

export function getDailyBoss(now: number): BossDef {
  const seed = getDailyBossSeed(now);
  return BOSS_DEFS[seed % BOSS_DEFS.length];
}
