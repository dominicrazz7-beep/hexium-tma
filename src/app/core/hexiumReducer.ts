import type { HexiumAction, HexiumGameState } from "./hexiumTypes";
import { initialHexiumState } from "./initialState";
import { applyReward, applyRewards } from "./rewardSystem";

export function hexiumReducer(state: HexiumGameState, action: HexiumAction): HexiumGameState {
  if (action.type === "NAVIGATE") {
    if (!state.unlockedScreens.includes(action.screen)) return state;
    return { ...state, currentScreen: action.screen };
  }

  if (action.type === "ADD_REWARD") {
    return applyReward(state, action.reward, action.source);
  }

  if (action.type === "ADD_REWARDS") {
    return applyRewards(state, action.rewards, action.source);
  }

  if (action.type === "ADD_MAIL") {
    return { ...state, mail: [action.mail, ...state.mail] };
  }

  if (action.type === "CLAIM_MAIL") {
    const mail = state.mail.find(item => item.id === action.mailId);
    if (!mail || mail.status === "claimed" || mail.rewards.length === 0) return state;

    return applyRewards(
      {
        ...state,
        mail: state.mail.map(item =>
          item.id === action.mailId ? { ...item, status: "claimed" } : item,
        ),
      },
      mail.rewards,
      `mail:${mail.id}`,
    );
  }

  if (action.type === "ADD_NOTIFICATION") {
    return { ...state, notifications: [action.notification, ...state.notifications] };
  }

  if (action.type === "MARK_NOTIFICATION_READ") {
    return {
      ...state,
      notifications: state.notifications.map(item =>
        item.id === action.notificationId ? { ...item, read: true } : item,
      ),
    };
  }

  if (action.type === "MINE_TAP") {
    return {
      ...state,
      currencies: { ...state.currencies, hex: state.currencies.hex + action.amount },
      player: {
        ...state.player,
        totalHexMined: state.player.totalHexMined + action.amount,
        totalTaps: state.player.totalTaps + 1,
      },
    };
  }

  if (action.type === "ADD_CURRENCY") {
    const current = state.currencies[action.currency] ?? 0;
    const next = Math.max(0, current + action.amount);
    const currencies = { ...state.currencies, [action.currency]: next };
    // Mirror lifetime HEX mined when HEX is granted (e.g. auto-miner)
    if (action.currency === "hex" && action.amount > 0) {
      return {
        ...state,
        currencies,
        player: { ...state.player, totalHexMined: state.player.totalHexMined + action.amount },
      };
    }
    return { ...state, currencies };
  }

  if (action.type === "SET_PLAYER_IDENTITY") {
    return {
      ...state,
      player: {
        ...state.player,
        id: action.id,
        username: action.username,
      },
    };
  }

  if (action.type === "RESTORE_ENERGY") {
    return { ...state, player: { ...state.player, energy: state.player.maxEnergy } };
  }

  if (action.type === "RESET_HEAT") {
    return { ...state, player: { ...state.player, temperature: 0 } };
  }

  if (action.type === "LOAD_STATE") return action.state;
  if (action.type === "RESET_STATE") return initialHexiumState;

  return state;
}
