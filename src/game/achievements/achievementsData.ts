/* ═══════════════ HEXIUM · Achievements — data / types ═══════════════ */

export type AchievementCategory = "mining" | "reactor" | "bots" | "cases" | "general";

export type Achievement = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  category: AchievementCategory;
  progress: (s: AchievementInput) => number;
  rewardHex?: number;
  rewardShards?: number;
};

export type AchievementInput = {
  hex: number;
  shards: number;
  totalHexMined: number;
  totalTaps: number;
  hashrate: number;
  reactorLevel: number;
  botsOwned: number;
  casesOpened: number;
  skinsOwned: number;
  dailyStreak: number;
  totalPlayMinutes: number;
  turboUsed: number;
  overheatCount: number;
  researchTiers: number;
  upgradesTotal: number;
};

const c = (n: number) => Math.min(1, Math.max(0, n));

export const ACHIEVEMENTS: Achievement[] = [
  /* ── MINING (10) ── */
  { id: "first_strike", icon: "⛏", name: "First Strike", desc: "Mine your first HEX", category: "mining", progress: (s) => c(s.totalTaps / 1), rewardHex: 50 },
  { id: "tap_frenzy", icon: "👆", name: "Tap Frenzy", desc: "1,000 total taps", category: "mining", progress: (s) => c(s.totalTaps / 1000), rewardHex: 200 },
  { id: "tap_master", icon: "💪", name: "Tap Master", desc: "10,000 total taps", category: "mining", progress: (s) => c(s.totalTaps / 10000), rewardHex: 500 },
  { id: "tap_legend", icon: "🏅", name: "Tap Legend", desc: "100,000 total taps", category: "mining", progress: (s) => c(s.totalTaps / 100000), rewardHex: 2000 },
  { id: "hex_hoarder", icon: "💠", name: "HEX Hoarder", desc: "Hold 100K HEX", category: "mining", progress: (s) => c(s.hex / 100_000), rewardHex: 300 },
  { id: "hex_millionaire", icon: "💎", name: "HEX Millionaire", desc: "Mine 1M HEX lifetime", category: "mining", progress: (s) => c(s.totalHexMined / 1_000_000), rewardHex: 1000 },
  { id: "hex_tycoon", icon: "🏦", name: "HEX Tycoon", desc: "Mine 10M HEX lifetime", category: "mining", progress: (s) => c(s.totalHexMined / 10_000_000), rewardHex: 3000 },
  { id: "hashrate_1k", icon: "📊", name: "Hashrate 1K", desc: "Reach 1,000 HEX/s", category: "mining", progress: (s) => c(s.hashrate / 1000), rewardShards: 5 },
  { id: "hashrate_10k", icon: "📈", name: "Hashrate 10K", desc: "Reach 10,000 HEX/s", category: "mining", progress: (s) => c(s.hashrate / 10000), rewardShards: 15 },
  { id: "hashrate_100k", icon: "🚀", name: "Hashrate 100K", desc: "Reach 100,000 HEX/s", category: "mining", progress: (s) => c(s.hashrate / 100000), rewardShards: 30 },

  /* ── REACTOR (10) ── */
  { id: "first_upgrade", icon: "🔧", name: "First Upgrade", desc: "Purchase your first reactor upgrade", category: "reactor", progress: (s) => c(s.upgradesTotal / 1), rewardHex: 100 },
  { id: "upgrade_10", icon: "⚙️", name: "Upgrade Enthusiast", desc: "Purchase 10 reactor upgrades", category: "reactor", progress: (s) => c(s.upgradesTotal / 10), rewardHex: 300 },
  { id: "upgrade_50", icon: "🔩", name: "Upgrade Master", desc: "Purchase 50 reactor upgrades", category: "reactor", progress: (s) => c(s.upgradesTotal / 50), rewardHex: 1000, rewardShards: 10 },
  { id: "reactor_mk2", icon: "⚡", name: "MK-II Reactor", desc: "Reach reactor LVL 10", category: "reactor", progress: (s) => c(s.reactorLevel / 10), rewardHex: 200 },
  { id: "reactor_mk3", icon: "🔥", name: "MK-III Reactor", desc: "Reach reactor LVL 20", category: "reactor", progress: (s) => c(s.reactorLevel / 20), rewardHex: 500, rewardShards: 5 },
  { id: "reactor_mk4", icon: "🌟", name: "MK-IV Reactor", desc: "Reach reactor LVL 30", category: "reactor", progress: (s) => c(s.reactorLevel / 30), rewardHex: 1500, rewardShards: 15 },
  { id: "reactor_mk5", icon: "👑", name: "MK-V Reactor", desc: "Reach reactor LVL 40", category: "reactor", progress: (s) => c(s.reactorLevel / 40), rewardHex: 3000, rewardShards: 25 },
  { id: "reactor_mk6", icon: "💎", name: "MK-VI Godcore", desc: "Reach reactor LVL 50", category: "reactor", progress: (s) => c(s.reactorLevel / 50), rewardHex: 5000, rewardShards: 50 },
  { id: "turbo_5", icon: "🚀", name: "Turbo Rookie", desc: "Activate turbo 5 times", category: "reactor", progress: (s) => c(s.turboUsed / 5), rewardHex: 150 },
  { id: "turbo_50", icon: "💨", name: "Turbo Veteran", desc: "Activate turbo 50 times", category: "reactor", progress: (s) => c(s.turboUsed / 50), rewardHex: 500, rewardShards: 5 },

  /* ── BOTS (10) ── */
  { id: "first_bot", icon: "🤖", name: "First Bot", desc: "Unlock your first HEX-Bot", category: "bots", progress: (s) => c(s.botsOwned / 1), rewardHex: 200 },
  { id: "bot_3", icon: "🤖", name: "Bot Commander", desc: "Own 3 HEX-Bots", category: "bots", progress: (s) => c(s.botsOwned / 3), rewardHex: 500, rewardShards: 5 },
  { id: "bot_6", icon: "🤖", name: "Bot Fleet", desc: "Own 6 HEX-Bots", category: "bots", progress: (s) => c(s.botsOwned / 6), rewardHex: 1000, rewardShards: 10 },
  { id: "bot_9", icon: "🤖", name: "Full Arsenal", desc: "Own all 9 HEX-Bots", category: "bots", progress: (s) => c(s.botsOwned / 9), rewardHex: 3000, rewardShards: 25 },
  { id: "bot_merge_1", icon: "🧬", name: "First Evolution", desc: "Merge a bot for the first time", category: "bots", progress: (s) => c(s.botsOwned > 0 ? 1 : 0), rewardHex: 300 },
  { id: "bot_rare", icon: "🔷", name: "Rare Collection", desc: "Own a Rare-tier bot", category: "bots", progress: (s) => c(s.botsOwned >= 2 ? 1 : 0), rewardShards: 5 },
  { id: "bot_epic", icon: "🟣", name: "Epic Collection", desc: "Own an Epic-tier bot", category: "bots", progress: (s) => c(s.botsOwned >= 4 ? 1 : 0), rewardShards: 10 },
  { id: "bot_legendary", icon: "👑", name: "Legendary Collection", desc: "Own a Legendary-tier bot", category: "bots", progress: (s) => c(s.botsOwned >= 6 ? 1 : 0), rewardShards: 20 },
  { id: "bot_rate_5", icon: "⚡", name: "Fleet Output 5/s", desc: "Bot fleet producing 5+ HEX/s", category: "bots", progress: (s) => c(s.hashrate > 0 && s.botsOwned > 0 ? Math.min(1, s.botsOwned / 3) : 0), rewardHex: 400 },
  { id: "bot_rate_20", icon: "⚡", name: "Fleet Output 20/s", desc: "Bot fleet producing 20+ HEX/s", category: "bots", progress: (s) => c(s.botsOwned >= 6 ? 1 : 0), rewardShards: 15 },

  /* ── CASES (10) ── */
  { id: "first_case", icon: "📦", name: "First Case", desc: "Open your first supply drop", category: "cases", progress: (s) => c(s.casesOpened / 1), rewardHex: 100 },
  { id: "case_5", icon: "📦", name: "Case Cracker", desc: "Open 5 supply drops", category: "cases", progress: (s) => c(s.casesOpened / 5), rewardHex: 300 },
  { id: "case_25", icon: "📦", name: "Case Veteran", desc: "Open 25 supply drops", category: "cases", progress: (s) => c(s.casesOpened / 25), rewardHex: 800, rewardShards: 5 },
  { id: "case_100", icon: "📦", name: "Case Hoarder", desc: "Open 100 supply drops", category: "cases", progress: (s) => c(s.casesOpened / 100), rewardHex: 2000, rewardShards: 15 },
  { id: "case_500", icon: "📦", name: "Case Legend", desc: "Open 500 supply drops", category: "cases", progress: (s) => c(s.casesOpened / 500), rewardHex: 5000, rewardShards: 30 },
  { id: "shard_10", icon: "◈", name: "Shard Collector", desc: "Accumulate 10 Shards", category: "cases", progress: (s) => c(s.shards / 10), rewardHex: 200 },
  { id: "shard_50", icon: "◈", name: "Shard Hunter", desc: "Accumulate 50 Shards", category: "cases", progress: (s) => c(s.shards / 50), rewardHex: 500 },
  { id: "shard_200", icon: "◈", name: "Shard Master", desc: "Accumulate 200 Shards", category: "cases", progress: (s) => c(s.shards / 200), rewardHex: 1500, rewardShards: 20 },
  { id: "shard_1000", icon: "◈", name: "Shard Emperor", desc: "Accumulate 1,000 Shards", category: "cases", progress: (s) => c(s.shards / 1000), rewardHex: 5000, rewardShards: 50 },
  { id: "case_streak_3", icon: "🎁", name: "Lucky Streak", desc: "Open 3 cases in one session", category: "cases", progress: (s) => c(s.casesOpened >= 3 ? 1 : 0), rewardHex: 200 },

  /* ── GENERAL (10) ── */
  { id: "play_5min", icon: "⏱️", name: "Getting Started", desc: "Play for 5 minutes", category: "general", progress: (s) => c(s.totalPlayMinutes / 5), rewardHex: 100 },
  { id: "play_30min", icon: "⏱️", name: "Dedicated Player", desc: "Play for 30 minutes", category: "general", progress: (s) => c(s.totalPlayMinutes / 30), rewardHex: 300 },
  { id: "play_2h", icon: "⏱️", name: "Power User", desc: "Play for 2 hours", category: "general", progress: (s) => c(s.totalPlayMinutes / 120), rewardHex: 1000, rewardShards: 10 },
  { id: "play_10h", icon: "⏱️", name: "No-Lifer", desc: "Play for 10 hours", category: "general", progress: (s) => c(s.totalPlayMinutes / 600), rewardHex: 3000, rewardShards: 25 },
  { id: "daily_3", icon: "📅", name: "Daily Devotee", desc: "3-day daily reward streak", category: "general", progress: (s) => c(s.dailyStreak / 3), rewardHex: 200 },
  { id: "daily_7", icon: "📅", name: "Weekly Warrior", desc: "7-day daily reward streak", category: "general", progress: (s) => c(s.dailyStreak / 7), rewardHex: 500, rewardShards: 5 },
  { id: "daily_30", icon: "📅", name: "Monthly Master", desc: "30-day daily reward streak", category: "general", progress: (s) => c(s.dailyStreak / 30), rewardHex: 2000, rewardShards: 20 },
  { id: "research_1", icon: "🔬", name: "Researcher", desc: "Complete 1 research tier", category: "general", progress: (s) => c(s.researchTiers / 1), rewardHex: 200 },
  { id: "research_12", icon: "🔬", name: "Scholar", desc: "Complete 12 research tiers", category: "general", progress: (s) => c(s.researchTiers / 12), rewardHex: 1000, rewardShards: 10 },
  { id: "research_36", icon: "🔬", name: "Master Scientist", desc: "Complete all 36 research tiers", category: "general", progress: (s) => c(s.researchTiers / 36), rewardHex: 5000, rewardShards: 50 },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: "mining", label: "Mining", icon: "⛏" },
  { id: "reactor", label: "Reactor", icon: "⚡" },
  { id: "bots", label: "Bots", icon: "🤖" },
  { id: "cases", label: "Cases", icon: "📦" },
  { id: "general", label: "General", icon: "🏆" },
];
