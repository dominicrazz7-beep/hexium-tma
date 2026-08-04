import type { HexiumScreen } from "../app/core/hexiumTypes";
import { screensRegistry, type ScreenMeta } from "../app/router/screensRegistry";
import "./SidebarNav.css";

type SidebarNavProps = {
  currentScreen: HexiumScreen;
  unlockedScreens: HexiumScreen[];
  unreadMail: number;
  unreadAlerts: number;
  onNavigate: (screen: HexiumScreen) => void;
};

const GROUP_LABELS: Record<string, string> = {
  main: "CORE",
  progress: "PROGRESS",
  social: "SOCIAL",
  endgame: "ENDGAME",
  system: "SYSTEM",
};

export default function SidebarNav({ currentScreen, unlockedScreens, unreadMail, unreadAlerts, onNavigate }: SidebarNavProps) {
  const groups = groupScreens(screensRegistry, unlockedScreens);

  return (
    <aside className="hx-sidebar">
      {groups.map(([group, screens]) => (
        <div key={group} className="hx-nav-group">
          <span className="hx-nav-group-label">{GROUP_LABELS[group] ?? group}</span>
          {screens.map((screen) => (
            <button key={screen.id} className={`hx-nav-btn${currentScreen === screen.id ? " active" : ""}`} onClick={() => onNavigate(screen.id)}>
              <span className="hx-nav-icon">{screen.icon}</span>
              <span className="hx-nav-label">{screen.label}</span>
              {screen.id === "mail_center" && unreadMail > 0 && <span className="hx-badge">{unreadMail}</span>}
              {screen.id === "notification_center" && unreadAlerts > 0 && <span className="hx-badge hx-badge-alert">{unreadAlerts}</span>}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

function groupScreens(registry: ScreenMeta[], unlocked: HexiumScreen[]): [string, ScreenMeta[]][] {
  const map = new Map<string, ScreenMeta[]>();
  for (const screen of registry) {
    if (!unlocked.includes(screen.id)) continue;
    const group = map.get(screen.group) ?? [];
    group.push(screen);
    map.set(screen.group, group);
  }
  return Array.from(map.entries());
}
