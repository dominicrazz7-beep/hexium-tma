import type { HexiumScreen } from "../app/core/hexiumTypes";
import "./BottomNavigation.css";

const TABS: { id: HexiumScreen; icon: string; label: string }[] = [
  { id: "main_reactor", icon: "⛏", label: "Mine" },
  { id: "hex_bots", icon: "🤖", label: "Bots" },
  { id: "shop", icon: "🛒", label: "Shop" },
  { id: "cases", icon: "🎁", label: "Cases" },
  { id: "tasks", icon: "🎯", label: "Tasks" },
  { id: "battle_pass", icon: "🎖", label: "Pass" },
  { id: "daily_rewards", icon: "📅", label: "Daily" },
  { id: "profile", icon: "👤", label: "Profile" },
];

type BottomNavigationProps = {
  currentScreen: HexiumScreen;
  onNavigate: (screen: HexiumScreen) => void;
};

export default function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="hx-bottom-nav" aria-label="Quick navigation">
      {TABS.map((tab) => (
        <button key={tab.id} className={`hx-btab${currentScreen === tab.id ? " active" : ""}`} onClick={() => onNavigate(tab.id)}>
          <span className="hx-btab-icon">{tab.icon}</span>
          <span className="hx-btab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
