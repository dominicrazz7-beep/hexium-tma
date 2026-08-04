export type HexiumScreen =
  | "main_reactor"
  | "hex_bots"
  | "shop"
  | "cases"
  | "network"
  | "profile"
  | "tasks"
  | "friends"
  | "leaderboard"
  | "achievements"
  | "daily_rewards"
  | "news_center"
  | "events"
  | "battle_pass"
  | "settings"
  | "research_center"
  | "quantum_lab"
  | "expeditions"
  | "corporation"
  | "world_bosses"
  | "corporation_wars"
  | "quantum_sectors"
  | "inventory"
  | "mail_center"
  | "notification_center"
  | "reactor_modules"
  | "black_market"
  | "reactor_pets"
  | "secret_blueprints"
  | "artifacts"
  | "ascension";

export type GameCurrency = {
  hex: number;
  shards: number;
  premium: number;
  quantumCores: number;
  researchPoints: number;
  corporationCredits: number;
  warCredits: number;
};

export type QuantumResources = {
  quantumDust: number;
  voidCrystal: number;
  singularityCore: number;
  darkMatter: number;
  omegaFragment: number;
};

export type GameReward =
  | { type: "hex"; amount: number }
  | { type: "shards"; amount: number }
  | { type: "premium"; amount: number }
  | { type: "quantum_cores"; amount: number }
  | { type: "research_points"; amount: number }
  | { type: "corporation_credits"; amount: number }
  | { type: "war_credits"; amount: number }
  | { type: "case"; caseType: "basic" | "advanced" | "premium" | "exotic" | "quantum"; amount: number }
  | { type: "boost"; boostId: string; amount: number }
  | { type: "bot_fragment"; botId: string; amount: number }
  | { type: "quantum_resource"; resourceId: keyof QuantumResources; amount: number }
  | { type: "frame"; frameId: string }
  | { type: "title"; titleId: string }
  | { type: "badge"; badgeId: string }
  | { type: "skin"; skinId: string };

export type InventoryItem = {
  id: string;
  name: string;
  type: "case" | "boost" | "bot_fragment" | "quantum_resource" | "currency" | "frame" | "title" | "skin" | "badge";
  tab: "all" | "cases" | "boosts" | "bot_fragments" | "quantum" | "cosmetics" | "resources";
  rarity: "common" | "rare" | "epic" | "legendary" | "quantum" | "omega";
  amount: number;
  usable: boolean;
  equippable: boolean;
  source: string;
  description: string;
};

export type MailItem = {
  id: string;
  title: string;
  sender: string;
  status: "unread" | "read" | "claimed" | "archived" | "expired";
  message: string;
  createdAt: number;
  rewards: GameReward[];
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  category: "reward" | "event" | "system" | "social" | "combat";
  priority: "low" | "normal" | "high" | "critical";
  read: boolean;
  createdAt: number;
  actionScreen?: HexiumScreen;
};

export type PlayerCoreState = {
  id: string;
  username: string;
  level: number;
  xp: number;
  totalHexMined: number;
  totalTaps: number;
  hashrate: number;
  energy: number;
  maxEnergy: number;
  temperature: number;
  maxTemperature: number;
};

export type HexiumGameState = {
  version: string;
  currentScreen: HexiumScreen;
  player: PlayerCoreState;
  currencies: GameCurrency;
  quantumResources: QuantumResources;
  inventory: InventoryItem[];
  mail: MailItem[];
  notifications: NotificationItem[];
  unlockedScreens: HexiumScreen[];
  lastSavedAt: number;
};

export type HexiumAction =
  | { type: "NAVIGATE"; screen: HexiumScreen }
  | { type: "ADD_REWARD"; reward: GameReward; source?: string }
  | { type: "ADD_REWARDS"; rewards: GameReward[]; source?: string }
  | { type: "ADD_MAIL"; mail: MailItem }
  | { type: "CLAIM_MAIL"; mailId: string }
  | { type: "ADD_NOTIFICATION"; notification: NotificationItem }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MINE_TAP"; amount: number; critical?: boolean }
  | { type: "ADD_CURRENCY"; currency: keyof GameCurrency; amount: number }
  | { type: "SET_PLAYER_IDENTITY"; id: string; username: string }
  | { type: "RESTORE_ENERGY" }
  | { type: "RESET_HEAT" }
  | { type: "LOAD_STATE"; state: HexiumGameState }
  | { type: "RESET_STATE" };
