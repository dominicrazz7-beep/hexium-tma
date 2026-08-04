import type { HexiumGameState, HexiumScreen } from "../core/hexiumTypes";
import type { ModuleBridgeApi } from "../bridges/moduleBridge";

/* ── Unified economy (global passive income + HUD) ── */
import { useGlobalEconomy } from "../../shared/EconomyHud/useGlobalEconomy";
import EconomyHud from "../../shared/EconomyHud/EconomyHud";

/* ── Screen imports (all 31) ── */
import MainReactorScreen from "../../screens/MainReactor/MainReactorScreen";
import HexBotsScreen from "../../screens/HexBots/HexBotsScreen";
import ShopScreen from "../../screens/Shop/ShopScreen";
import CasesScreen from "../../screens/Cases/CasesScreen";
import NetworkScreen from "../../screens/Network/NetworkScreen";
import ProfileScreen from "../../screens/Profile/ProfileScreen";
import TasksScreen from "../../screens/Tasks/TasksScreen";
import FriendsScreen from "../../screens/Friends/FriendsScreen";
import LeaderboardScreen from "../../screens/Leaderboard/LeaderboardScreen";
import AchievementsScreen from "../../screens/Achievements/AchievementsScreen";
import DailyRewardsScreen from "../../screens/DailyRewards/DailyRewardsScreen";
import NewsCenterScreen from "../../screens/NewsCenter/NewsCenterScreen";
import EventsScreen from "../../screens/Events/EventsScreen";
import BattlePassScreen from "../../screens/BattlePass/BattlePassScreen";
import SettingsScreen from "../../screens/Settings/SettingsScreen";
import ResearchCenterScreen from "../../screens/ResearchCenter/ResearchCenterScreen";
import QuantumLabScreen from "../../screens/QuantumLab/QuantumLabScreen";
import ExpeditionsScreen from "../../screens/Expeditions/ExpeditionsScreen";
import CorporationScreen from "../../screens/Corporation/CorporationScreen";
import WorldBossesScreen from "../../screens/WorldBosses/WorldBossesScreen";
import CorporationWarsScreen from "../../screens/CorporationWars/CorporationWarsScreen";
import QuantumSectorsScreen from "../../screens/QuantumSectors/QuantumSectorsScreen";
import InventoryScreen from "../../screens/Inventory/InventoryScreen";
import MailCenterScreen from "../../screens/MailCenter/MailCenterScreen";
import NotificationCenterScreen from "../../screens/NotificationCenter/NotificationCenterScreen";
import ReactorModulesScreen from "../../screens/ReactorModules/ReactorModulesScreen";
import BlackMarketScreen from "../../screens/BlackMarket/BlackMarketScreen";
import ReactorPetsScreen from "../../screens/ReactorPets/ReactorPetsScreen";
import SecretBlueprintsScreen from "../../screens/SecretBlueprints/SecretBlueprintsScreen";
import ArtifactsScreen from "../../screens/Artifacts/ArtifactsScreen";
import AscensionScreen from "../../screens/Ascension/AscensionScreen";

import { calculateModuleEffects } from "../../game/reactorModules/reactorModulesLogic";
import type { EquippedModules } from "../../game/reactorModules/reactorModulesData";
import { calculateEffects as calcArtifactEffects, applyArtifactEffects, getCollectionBonus, type ArtifactsState, emptyState as emptyArtifactsState } from "../../game/artifacts/artifactsLogic";
import { createInitialReactorState } from "../../game/reactor/reactorData";
import { getCurrentTapPower } from "../../game/reactor/reactorLogic";
import { getReactorLevel } from "../../game/reactor/reactorBalance";
import type { ModuleEffects } from "../../game/reactor/reactorLogic";
import { calculateBonuses as calcAscBonuses } from "../../game/ascension/ascensionLogic";
import { ASCENSION_BALANCE } from "../../game/ascension/ascensionBalance";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}

const EMPTY_MODS: EquippedModules = { slot1: null, slot2: null, slot3: null };

function getWorldBossEffects(): { tapPower: number; moduleEffects: { tapPowerBonus: number; hexMultiplierBonus: number; critChanceBonus: number }; artifactEffects: { tapPower: number; hexMultiplier: number; critChance: number; modulePower: number } } {
  const equipped = loadJson<EquippedModules>("hexium_reactor_modules_v1", EMPTY_MODS);
  const mods = calculateModuleEffects(equipped);

  const artState = loadJson<ArtifactsState>("hexium_artifacts_v1", emptyArtifactsState());
  const artEffects = calcArtifactEffects(artState);
  const collBonus = getCollectionBonus(artState);
  const allArt = {
    hexMultiplier: artEffects.hexMultiplier + collBonus.hexMultiplier,
    tapPower: artEffects.tapPower + collBonus.tapPower,
    critChance: artEffects.critChance + collBonus.critChance,
    critMultiplier: artEffects.critMultiplier + collBonus.critMultiplier,
    autoHex: artEffects.autoHex + collBonus.autoHex,
    energyRegen: artEffects.energyRegen + collBonus.energyRegen,
    modulePower: artEffects.modulePower + collBonus.modulePower,
  };
  const combined = applyArtifactEffects(mods, allArt);

  const reactorState = loadJson<ReturnType<typeof createInitialReactorState>>("hexium_reactor_state_v1", createInitialReactorState());
  const tapPower = getCurrentTapPower(reactorState, combined);

  const ascState = loadJson<any>(ASCENSION_BALANCE.STORAGE_KEY, { count: 0, essence: 0, upgrades: [], totalEssenceEarned: 0 });
  const ascBonuses = calcAscBonuses(ascState);
  const finalTapPower = tapPower + (ascBonuses.tapPower ?? 0);

  return {
    tapPower: finalTapPower,
    moduleEffects: { tapPowerBonus: combined.tapPowerBonus, hexMultiplierBonus: combined.hexMultiplierBonus, critChanceBonus: combined.critChanceBonus },
    artifactEffects: { tapPower: allArt.tapPower, hexMultiplier: allArt.hexMultiplier, critChance: allArt.critChance, modulePower: allArt.modulePower },
  };
}

// ─────────────── FOUNDATION v2 IMPORTS ───────────────
// Telegram Integration (bridge pattern — screens use telegramBridge only)
// import { telegramBridge } from "../bridges/telegramBridge";

// Systems — initialized in App.tsx lifecycle
// import { referralService } from "../systems/referral";
// import { cloudSaveService } from "../systems/cloudSave";
// import { starsService } from "../systems/stars";
// import { shareService } from "../systems/share";
// import { analyticsService } from "../systems/analytics";
// ──────────────────────────────────────────────────────

type ScreenRouterProps = {
  screen: HexiumScreen;
  gameState: HexiumGameState;
  bridge: ModuleBridgeApi;
};

export default function ScreenRouter({ screen, gameState, bridge }: ScreenRouterProps) {
  const nav = (s: string, payload?: string) => bridge.navigate(s as HexiumScreen);
  const { hex, shards, premium, quantumCores, researchPoints, corporationCredits, warCredits } = gameState.currencies;

  /* Unified economy engine — drives global passive HEX/sec on every screen. */
  const { breakdown, offline, dismissOffline } = useGlobalEconomy(bridge.dispatch);

  const screenEl = (() => {
  switch (screen) {
    /* ─── MAIN ─── */
    case "main_reactor":
      return <MainReactorScreen hex={hex} shards={shards} totalHexMined={gameState.player.totalHexMined} totalTaps={gameState.player.totalTaps} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "hex_bots":
      return <HexBotsScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "shop":
      return <ShopScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "cases":
      return <CasesScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "network":
      return <NetworkScreen hex={hex} shards={shards} player={gameState.player} onNavigate={nav} />;
    case "profile":
      return <ProfileScreen hex={hex} shards={shards} player={gameState.player} onNavigate={nav} dispatch={bridge.dispatch} />;

    /* ─── PROGRESS ─── */
    case "tasks":
      return <TasksScreen hex={hex} shards={shards} totalTaps={gameState.player.totalTaps} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "daily_rewards":
      return <DailyRewardsScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "achievements":
      return <AchievementsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "battle_pass":
      return <BattlePassScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;

    /* ─── SOCIAL ─── */
    case "friends":
      return <FriendsScreen hex={hex} shards={shards} playerId={gameState.player.id} username={gameState.player.username} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "leaderboard":
      return <LeaderboardScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "corporation":
      return <CorporationScreen hex={hex} shards={shards} onNavigate={nav} />;

    /* ─── ENDGAME ─── */
    case "research_center":
      return <ResearchCenterScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "quantum_lab":
      return <QuantumLabScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "expeditions": {
      const expReactorState = loadJson<ReturnType<typeof createInitialReactorState>>("hexium_reactor_state_v1", createInitialReactorState());
      const expReactorLevel = getReactorLevel(expReactorState.totalHexMined);
      return <ExpeditionsScreen hex={hex} shards={shards} reactorLevel={expReactorLevel} onNavigate={nav} dispatch={bridge.dispatch} />;
    }
    case "world_bosses": {
      const wbFx = getWorldBossEffects();
      const wbReactorState = loadJson<ReturnType<typeof createInitialReactorState>>("hexium_reactor_state_v1", createInitialReactorState());
      const wbReactorLevel = getReactorLevel(wbReactorState.totalHexMined);
      return <WorldBossesScreen hex={hex} shards={shards} tapPower={wbFx.tapPower} moduleEffects={wbFx.moduleEffects} artifactEffects={wbFx.artifactEffects} onNavigate={nav} dispatch={bridge.dispatch} />;
    }
    case "corporation_wars":
      return <CorporationWarsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "quantum_sectors":
      return <QuantumSectorsScreen hex={hex} shards={shards} onNavigate={nav} />;

    /* ─── SYSTEM ─── */
    case "inventory":
      return <InventoryScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "mail_center":
      return <MailCenterScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "notification_center":
      return <NotificationCenterScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "news_center":
      return <NewsCenterScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "events":
      return <EventsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "settings":
      return <SettingsScreen hex={hex} shards={shards} onNavigate={nav} />;

    /* ─── NEW FEATURES ─── */
    case "reactor_modules":
      return (
        <ReactorModulesScreen
          hex={hex}
          shards={shards}
          premium={gameState.currencies.premium}
          reactorLevel={Math.floor(gameState.player.totalHexMined / 100)}
          equipped={{ slot1: null, slot2: null, slot3: null }}
          onNavigate={nav}
          onEquipModule={() => {}}
          onUnequipModule={() => {}}
          onPurchaseModule={() => {}}
        />
      );
    case "black_market":
      return <BlackMarketScreen hex={hex} shards={shards} onNavigate={nav} dispatch={bridge.dispatch} />;
    case "reactor_pets":
      return <ReactorPetsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "secret_blueprints":
      return <SecretBlueprintsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "artifacts":
      return <ArtifactsScreen hex={hex} shards={shards} onNavigate={nav} />;
    case "ascension":
      return <AscensionScreen hex={hex} shards={shards} reactorLevel={Math.floor(gameState.player.totalHexMined / 100)} totalHexMined={gameState.player.totalHexMined} onNavigate={nav} dispatch={bridge.dispatch} />;

    default:
      return null;
  }
  })();

  return (
    <>
      {screenEl}
      <EconomyHud breakdown={breakdown} offline={offline} onDismissOffline={dismissOffline} />
    </>
  );
}
