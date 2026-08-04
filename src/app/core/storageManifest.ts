/*
 * HEXIUM Storage Manifest — Pass 1A
 *
 * Declarative source of truth for known storage keys confirmed by the
 * read-only Storage/localStorage Risk Map. This file intentionally has no
 * runtime side effects and is not wired into existing read/write paths yet.
 *
 * Important boundaries:
 * - Bot v2 (`hexium_bots_evolution_v2`) is the future canonical bot fleet key.
 * - Bot v1 (`hexium_bots_state_v1`) remains legacy compatibility and must not
 *   be removed until all readers migrate through a dedicated bot storage helper.
 * - Hard reset is currently localStorage-only; Telegram CloudStorage keys are
 *   documented here but are not cleared by the existing hard reset path.
 * - Cloud Save Manager owns the `hx_sv_*` Telegram CloudStorage namespace.
 * - `hexium_profile` is legacy Telegram CloudStorage profile storage.
 * - Corrupt save quarantine is a future strategy only; no quarantine behavior is
 *   implemented or enabled by this manifest.
 */

export type StorageResetPolicy =
  | "hard-reset"
  | "local-only-hard-reset"
  | "manual-only"
  | "preserve"
  | "not-reset-by-local-hard-reset";

export type CloudOwnership =
  | "local-only"
  | "cloud-save-manager"
  | "telegram-cloud-legacy"
  | "excluded-sensitive"
  | "undecided"
  | "pattern-only";

export type StorageRisk = "low" | "medium" | "medium-high" | "high" | "unknown";

export type StorageKeyStatus = "canonical" | "legacy" | "duplicate" | "reserved" | "pattern";

export type StorageArea = {
  readonly key: string;
  readonly owner: string;
  readonly purpose: string;
  readonly resetPolicy: StorageResetPolicy;
  readonly cloudOwnership: CloudOwnership;
  readonly risk: StorageRisk;
  readonly status: StorageKeyStatus;
};

export const SAVE_KEYS = {
  core: {
    main: "hexium_clicker_save_v1",
  },

  gameplay: {
    reactor: "hexium_reactor_state_v1",
    reactorModules: "hexium_reactor_modules_v1",
    artifacts: "hexium_artifacts_v1",
    ascension: "hexium_ascension_v1",
    botsLegacy: "hexium_bots_state_v1",
    botsEvolution: "hexium_bots_evolution_v2",
    shop: "hexium_shop_state_v1",
    cases: "hexium_cases_state_v1",
    tasks: "hexium_tasks_mvp_v2",
    tasksLegacyMvpV1: "hexium_tasks_mvp_v1",
    dailyRewards: "hexium_daily_rewards_mvp_v1",
    friends: "hexium_friends_mvp_v1",
    blackMarket: "hexium_black_market_v1",
    expeditions: "hexium_expeditions_v1",
    worldBoss: "hexium_world_boss_v1",
    achievements: "hexium_achievements_state_v1",
    battlePass: "hexium_battlepass_state_v1",
    research: "hexium_research_state_v1",
    network: "hexium_network_state_v1",
    profile: "hexium_profile_state_v1",
    economy: "hexium_economy_state_v1",
    referralLegacy: "hexium_referral_v1",
  },

  monetization: {
    rewardAds: "hexium_reward_ads_mvp_v1",
    purchaseHistory: "hexium_purchase_history",
    purchaseCounts: "hexium_purchase_counts",
  },

  telegram: {
    userCache: "hexium_tg_user",
    legacyCloudProfile: "hexium_profile",
    legacyCloudChunkPattern: "hexium_chunk_",
    referralCloudKey: "hexium_ref",
  },

  analytics: {
    queue: "hexium_analytics_queue",
    session: "hexium_analytics_session",
    state: "hexium_analytics_state",
    identity: "hexium_analytics_identity",
    deviceId: "hexium_device_id",
  },

  share: {
    history: "hexium_share_history",
    cooldowns: "hexium_share_cooldowns",
    stats: "hexium_share_stats",
  },

  cloudSave: {
    localSlotPattern: "hexium_save_<slot>",
    localAuto: "hexium_save_auto",
    localManual1: "hexium_save_manual_1",
    localManual2: "hexium_save_manual_2",
    localManual3: "hexium_save_manual_3",
    localBackup: "hexium_save_backup",
    syncMeta: "hexium_sync_meta",
    deviceId: "hexium_device_id",
    telegramCloudSlotPattern: "hx_sv_<slot>",
    telegramCloudChunkCountPattern: "hx_sv_<slot>_n",
    telegramCloudChunkPattern: "hx_sv_<slot>_<index>",
  },
} as const;

export const STORAGE_AREAS: readonly StorageArea[] = [
  {
    key: SAVE_KEYS.core.main,
    owner: "src/app/core/initialState.ts, src/app/core/storage.ts",
    purpose: "Main reducer save: player, currencies, inventory, mail, notifications, unlocked screens, and lastSavedAt.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },

  {
    key: SAVE_KEYS.gameplay.reactor,
    owner: "src/screens/MainReactor/MainReactorScreen.tsx",
    purpose: "Reactor-local state including upgrades, tap state, heat, energy, turbo, and total reactor progress.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.reactorModules,
    owner: "src/screens/ReactorModules/ReactorModulesScreen.tsx",
    purpose: "Equipped reactor modules.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.artifacts,
    owner: "src/screens/Artifacts/ArtifactsScreen.tsx, src/screens/Expeditions/ExpeditionsScreen.tsx",
    purpose: "Owned and equipped artifacts.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.ascension,
    owner: "src/game/ascension/ascensionBalance.ts, src/screens/Ascension/AscensionScreen.tsx",
    purpose: "Ascension count, essence, upgrades, and total essence earned.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.botsEvolution,
    owner: "src/screens/HexBots/HexBotsScreen.tsx, src/screens/Cases/CasesScreen.tsx",
    purpose: "Future canonical HEX-BOTS fleet/evolution state. Currently dual-written with v1 for compatibility.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "high",
    status: "duplicate",
  },
  {
    key: SAVE_KEYS.gameplay.botsLegacy,
    owner: "src/screens/HexBots/HexBotsScreen.tsx, src/screens/Cases/CasesScreen.tsx, task/profile/economy readers",
    purpose: "Legacy HEX-BOTS fleet state retained for compatibility while readers migrate to v2.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "high",
    status: "legacy",
  },
  {
    key: SAVE_KEYS.gameplay.shop,
    owner: "src/screens/Shop/ShopScreen.tsx, src/screens/Cases/CasesScreen.tsx",
    purpose: "Shop purchases, skins, equipped cosmetics, and active boosters.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium-high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.cases,
    owner: "src/screens/Cases/CasesScreen.tsx",
    purpose: "Case state, openings, and case-related progression totals.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.tasks,
    owner: "src/screens/Tasks/TasksScreen.tsx",
    purpose: "Daily and progression task completion plus playtime tracking.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.tasksLegacyMvpV1,
    owner: "historical project notes",
    purpose: "Legacy MVP tasks key referenced in notes; current code uses v2.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "legacy",
  },
  {
    key: SAVE_KEYS.gameplay.dailyRewards,
    owner: "src/screens/DailyRewards/DailyRewardsScreen.tsx",
    purpose: "Daily reward streak, last claim timestamp, and best streak.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.friends,
    owner: "src/screens/Friends/FriendsScreen.tsx",
    purpose: "Invite/share reward state and local friend referral UI counters.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.blackMarket,
    owner: "src/screens/BlackMarket/BlackMarketScreen.tsx",
    purpose: "Black Market refresh window, stock purchases, and local history.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.expeditions,
    owner: "src/screens/Expeditions/ExpeditionsScreen.tsx",
    purpose: "Active expeditions and expedition history.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.worldBoss,
    owner: "src/screens/WorldBosses/WorldBossesScreen.tsx",
    purpose: "World boss state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.achievements,
    owner: "src/game/achievements/achievementsBalance.ts, src/game/achievements/achievementsLogic.ts",
    purpose: "Achievement unlock/progression state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.battlePass,
    owner: "src/game/battlePass/battlePassBalance.ts, src/game/battlePass/battlePassLogic.ts",
    purpose: "Battle pass progression and premium state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.research,
    owner: "src/game/research/researchBalance.ts, src/game/research/researchLogic.ts",
    purpose: "Research progression and active research state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.network,
    owner: "src/game/network/networkBalance.ts, src/game/network/networkLogic.ts",
    purpose: "Network/referral state and connected sectors.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.profile,
    owner: "src/game/profile/profileData.ts, src/game/profile/profileLogic.ts",
    purpose: "Local profile settings and cosmetic glyph selection.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.economy,
    owner: "src/game/economy/economyEngine.ts",
    purpose: "Economy metadata, including unified offline-income clock / lastSeen.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "medium-high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.gameplay.referralLegacy,
    owner: "src/app/core/storage.ts explicit reset fallback",
    purpose: "Legacy referral key retained in hard-reset fallback list.",
    resetPolicy: "hard-reset",
    cloudOwnership: "undecided",
    risk: "unknown",
    status: "legacy",
  },

  {
    key: SAVE_KEYS.monetization.rewardAds,
    owner: "src/screens/Shop/ShopScreen.tsx",
    purpose: "Reward-ad daily limits and cooldowns.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.monetization.purchaseHistory,
    owner: "src/app/systems/stars/starsData.ts, src/app/systems/stars/starsPayments.ts",
    purpose: "Local Telegram Stars purchase history records.",
    resetPolicy: "hard-reset",
    cloudOwnership: "excluded-sensitive",
    risk: "high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.monetization.purchaseCounts,
    owner: "src/app/systems/stars/starsData.ts, src/app/systems/stars/starsPayments.ts",
    purpose: "Local product purchase counters rebuilt from purchase history on load.",
    resetPolicy: "hard-reset",
    cloudOwnership: "excluded-sensitive",
    risk: "medium-high",
    status: "canonical",
  },

  {
    key: SAVE_KEYS.telegram.userCache,
    owner: "src/app/systems/telegram/telegramUser.ts",
    purpose: "Cached Telegram or guest user profile data for local fallback.",
    resetPolicy: "hard-reset",
    cloudOwnership: "excluded-sensitive",
    risk: "medium-high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.telegram.legacyCloudProfile,
    owner: "src/app/systems/telegram/telegramCloudStorage.ts",
    purpose: "Legacy Telegram CloudStorage profile/game state root key.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "telegram-cloud-legacy",
    risk: "high",
    status: "legacy",
  },
  {
    key: SAVE_KEYS.telegram.legacyCloudChunkPattern,
    owner: "src/app/systems/telegram/telegramCloudStorage.ts",
    purpose: "Generated Telegram CloudStorage chunk prefix for legacy profile storage.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "telegram-cloud-legacy",
    risk: "medium-high",
    status: "pattern",
  },
  {
    key: SAVE_KEYS.telegram.referralCloudKey,
    owner: "src/app/systems/referral/referralStorage.ts",
    purpose: "Referral Telegram/cloud storage key constant.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "undecided",
    risk: "unknown",
    status: "reserved",
  },

  {
    key: SAVE_KEYS.analytics.queue,
    owner: "src/app/systems/analytics/analyticsQueue.ts, src/app/systems/analytics/analyticsData.ts",
    purpose: "Offline analytics event queue.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.analytics.session,
    owner: "src/app/systems/analytics/analyticsStorage.ts, src/app/systems/analytics/analyticsData.ts",
    purpose: "Current analytics session metadata.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.analytics.state,
    owner: "src/app/systems/analytics/analyticsStorage.ts, src/app/systems/analytics/analyticsData.ts",
    purpose: "Aggregate analytics save state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.analytics.identity,
    owner: "src/app/systems/analytics/analyticsStorage.ts, src/app/systems/analytics/analyticsData.ts",
    purpose: "Hashed analytics identity.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.analytics.deviceId,
    owner: "src/app/systems/analytics/analyticsData.ts, src/app/systems/cloudSave/cloudSaveData.ts",
    purpose: "Shared local device identifier used by analytics and Cloud Save Manager.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium-high",
    status: "duplicate",
  },

  {
    key: SAVE_KEYS.share.history,
    owner: "src/app/systems/share/shareData.ts, src/app/systems/share/shareService.ts",
    purpose: "Local share attempt history.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.share.cooldowns,
    owner: "src/app/systems/share/shareData.ts, src/app/systems/share/shareService.ts",
    purpose: "Share cooldown and daily share limit state.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "medium",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.share.stats,
    owner: "src/app/systems/share/shareData.ts",
    purpose: "Reserved/local share statistics key defined by share data constants.",
    resetPolicy: "hard-reset",
    cloudOwnership: "local-only",
    risk: "unknown",
    status: "reserved",
  },

  {
    key: SAVE_KEYS.cloudSave.localSlotPattern,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Pattern for local Cloud Save Manager slot envelopes.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "pattern",
  },
  {
    key: SAVE_KEYS.cloudSave.localAuto,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Cloud Save Manager local auto-save slot envelope.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.cloudSave.localManual1,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Cloud Save Manager local manual slot 1 envelope.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.cloudSave.localManual2,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Cloud Save Manager local manual slot 2 envelope.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.cloudSave.localManual3,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Cloud Save Manager local manual slot 3 envelope.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.cloudSave.localBackup,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Cloud Save Manager local backup slot envelope.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "medium-high",
    status: "canonical",
  },
  {
    key: SAVE_KEYS.cloudSave.syncMeta,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts",
    purpose: "Reserved Cloud Save Manager local sync metadata key.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "unknown",
    status: "reserved",
  },
  {
    key: SAVE_KEYS.cloudSave.deviceId,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/analytics/analyticsData.ts",
    purpose: "Shared local device identifier used for Cloud Save envelope device binding.",
    resetPolicy: "hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "medium-high",
    status: "duplicate",
  },
  {
    key: SAVE_KEYS.cloudSave.telegramCloudSlotPattern,
    owner: "src/app/systems/cloudSave/cloudSaveData.ts, src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Telegram CloudStorage slot key pattern owned by Cloud Save Manager.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "high",
    status: "pattern",
  },
  {
    key: SAVE_KEYS.cloudSave.telegramCloudChunkCountPattern,
    owner: "src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Telegram CloudStorage chunk-count header pattern for Cloud Save Manager saves.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "medium-high",
    status: "pattern",
  },
  {
    key: SAVE_KEYS.cloudSave.telegramCloudChunkPattern,
    owner: "src/app/systems/cloudSave/cloudSaveStorage.ts",
    purpose: "Telegram CloudStorage chunk data pattern for Cloud Save Manager saves.",
    resetPolicy: "not-reset-by-local-hard-reset",
    cloudOwnership: "cloud-save-manager",
    risk: "medium-high",
    status: "pattern",
  },
] as const;

export const HARD_RESET_LOCAL_STORAGE_PREFIXES = ["hexium"] as const;

export const FUTURE_CORRUPT_SAVE_QUARANTINE = {
  enabled: false,
  keyPattern: "hexium_corrupt_<originalKey>_<timestamp>",
  note: "Future strategy only. No current save loader is changed by this manifest.",
} as const;
