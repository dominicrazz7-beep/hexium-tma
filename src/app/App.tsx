// ═══════════════════════════════════════════════════════════
// FOUNDATION v2 LIFECYCLE (uncomment when integrating)
// ═══════════════════════════════════════════════════════════
//
import { telegramBridge } from "./bridges/telegramBridge";
// import { referralService } from "./systems/referral";
// import { cloudSaveService } from "./systems/cloudSave";
// import { starsService } from "./systems/stars";
// import { shareService } from "./systems/share";
// import { analyticsService } from "./systems/analytics";
//
// INIT ORDER (in useEffect):
//   1. await telegramBridge.initialize()
//   2. const tgUser = telegramBridge.getUser()
//   3. await analyticsService.initialize({ playerId: tgUser.id, platform: "telegram" })
//   4. await referralService.initialize({ telegramId: tgUser.id, bot: BOT_USERNAME })
//   5. await cloudSaveService.initialize({ playerId: tgUser.id })
//   6. await starsService.initialize({ telegramId: tgUser.id })
//   7. await shareService.initialize({ telegramId: tgUser.id, referralCode: referralService.getInviteInfo().code })
//
// DESTROY ORDER (in cleanup):
//   shareService.destroy()
//   starsService.destroy()
//   cloudSaveService.destroy()
//   referralService.destroy()
//   analyticsService.destroy()
//   telegramBridge.destroy()
// ═══════════════════════════════════════════════════════════

import { useEffect, useMemo, useReducer } from "react";

import { hexiumReducer } from "./core/hexiumReducer";
import { loadHexiumState, saveHexiumState, hardResetHexium } from "./core/storage";
import { createModuleBridge } from "./bridges/moduleBridge";
import { hexiumEventBus } from "./core/eventBus";

import TopResourceHud from "../shared/TopResourceHud";
import BottomNavigation from "../shared/BottomNavigation";
import StatusGrid from "../shared/StatusGrid";
import ScreenRouter from "./router/ScreenRouter";

import "./App.css";

export default function HexiumApp() {
  const [state, dispatch] = useReducer(hexiumReducer, undefined, loadHexiumState);
  const bridge = useMemo(() => createModuleBridge(dispatch), [dispatch]);

  /* ── Telegram init ── */
  useEffect(() => {
    let cancelled = false;

    async function initTelegram() {
      try {
        await telegramBridge.initialize();
        if (cancelled) return;

        const tgUser = telegramBridge.getUser();
        if (!tgUser || telegramBridge.isGuest()) return;

        const username =
          tgUser.username ||
          [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ") ||
          `Player ${tgUser.telegramId}`;

        dispatch({
          type: "SET_PLAYER_IDENTITY",
          id: `tg_${tgUser.telegramId}`,
          username,
        });
      } catch (error) {
        console.warn("[HEXIUM] Telegram init failed, browser mode active", error);
      }
    }

    initTelegram();

    return () => {
      cancelled = true;
      telegramBridge.destroy();
    };
  }, []);

  /* ── Auto-save ── */
  useEffect(() => {
    saveHexiumState(state);
  }, [state]);

  /* ── Event bus ── */
  useEffect(() => {
    const unsub = hexiumEventBus.subscribe((event) => {
      if (
        event.type === "task_completed" ||
        event.type === "boss_defeated" ||
        event.type === "expedition_finished" ||
        event.type === "achievement_unlocked"
      ) {
        bridge.grantRewards(event.rewards, event.type);
        bridge.notify(
          event.type.replace(/_/g, " ").toUpperCase(),
          `Rewards: ${event.rewards.length} items`,
        );
      }
    });
    return unsub;
  }, [bridge]);

  return (
    <div className="hx-app-shell">
      <TopResourceHud currencies={state.currencies} />

      <main className="hx-main-layout">
        <div className="hx-content">
          <StatusGrid player={state.player} />

          <div className="hx-screen-area">
            <ScreenRouter screen={state.currentScreen} gameState={state} bridge={bridge} />
          </div>

          {/* DEV / DEBUG controls — only rendered in development builds. */}
          {import.meta.env.DEV && (
            <div className="hx-dev-actions">
              <button onClick={() => dispatch({ type: "MINE_TAP", amount: 10 })}>⛏ MINE +10</button>
              <button onClick={() => bridge.grantRewards([{ type: "hex", amount: 2500 }, { type: "case", caseType: "basic", amount: 1 }], "dev-test")}>🎁 TEST REWARD</button>
              <button onClick={() => dispatch({ type: "CLAIM_MAIL", mailId: "welcome-gift" })}>📬 CLAIM MAIL</button>
              <button onClick={() => { dispatch({ type: "RESET_STATE" }); hardResetHexium(); }}>🗑 RESET</button>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation
        currentScreen={state.currentScreen}
        onNavigate={(screen) => bridge.navigate(screen)}
      />
    </div>
  );
}
