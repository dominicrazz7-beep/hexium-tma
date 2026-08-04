import type { HexiumScreen } from "../core/hexiumTypes";

export type ScreenMeta = {
  id: HexiumScreen;
  label: string;
  icon: string;
  group: "main" | "progress" | "social" | "endgame" | "system";
};

export const screensRegistry: ScreenMeta[] = [
  /* ── main ─── */
  { id: "main_reactor", label: "Mine", icon: "⛏", group: "main" },
  { id: "hex_bots", label: "Bots", icon: "🤖", group: "main" },
  { id: "reactor_modules", label: "Modules", icon: "⚙️", group: "main" },
  { id: "shop", label: "Shop", icon: "🛒", group: "main" },
  { id: "black_market", label: "Black Mkt", icon: "🖤", group: "main" },
  { id: "cases", label: "Cases", icon: "🎁", group: "main" },
  { id: "profile", label: "Profile", icon: "👤", group: "main" },
  { id: "network", label: "Network", icon: "🌐", group: "main" },
  { id: "settings", label: "Settings", icon: "⚙", group: "system" },
  /* ── progress ── */
  { id: "tasks", label: "Tasks", icon: "🎯", group: "progress" },
  { id: "daily_rewards", label: "Daily", icon: "📅", group: "progress" },
  { id: "achievements", label: "Achievements", icon: "🏆", group: "progress" },
  { id: "battle_pass", label: "Battle Pass", icon: "🎖", group: "progress" },
  /* ── social ─── */
  { id: "friends", label: "Friends", icon: "👥", group: "social" },
  { id: "leaderboard", label: "Leaderboard", icon: "📊", group: "social" },
  { id: "reactor_pets", label: "Pets", icon: "🐾", group: "social" },
  { id: "corporation", label: "Corporation", icon: "👑", group: "social" },
  /* ── endgame ── */
  { id: "secret_blueprints", label: "Blueprints", icon: "📐", group: "endgame" },
  { id: "artifacts", label: "Artifacts", icon: "💎", group: "endgame" },
  { id: "expeditions", label: "Expeditions", icon: "🚀", group: "endgame" },
  { id: "world_bosses", label: "World Boss", icon: "🌍", group: "endgame" },
  { id: "research_center", label: "Research", icon: "🔬", group: "endgame" },
  { id: "quantum_lab", label: "Quantum Lab", icon: "🔮", group: "endgame" },
  { id: "quantum_sectors", label: "Quantum Sectors", icon: "🌀", group: "endgame" },
  { id: "ascension", label: "Ascension", icon: "⚡", group: "endgame" },
  /* ── system ─── */
  { id: "inventory", label: "Inventory", icon: "📦", group: "system" },
  { id: "mail_center", label: "Mail", icon: "📧", group: "system" },
  { id: "notification_center", label: "Alerts", icon: "🔔", group: "system" },
  { id: "news_center", label: "News", icon: "📰", group: "system" },
  { id: "events", label: "Events", icon: "📅", group: "system" },
  { id: "corporation_wars", label: "Corp Wars", icon: "⚔", group: "system" },
];
