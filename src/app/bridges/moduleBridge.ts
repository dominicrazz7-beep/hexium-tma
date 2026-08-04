import type { GameReward, HexiumAction, HexiumScreen } from "../core/hexiumTypes";

export type ModuleBridgeApi = {
  navigate: (screen: HexiumScreen) => void;
  grantReward: (reward: GameReward, source?: string) => void;
  grantRewards: (rewards: GameReward[], source?: string) => void;
  notify: (title: string, description: string, actionScreen?: HexiumScreen) => void;
  dispatch: React.Dispatch<HexiumAction>;
};

export function createModuleBridge(dispatch: React.Dispatch<HexiumAction>): ModuleBridgeApi {
  return {
    dispatch,
    navigate: screen => dispatch({ type: "NAVIGATE", screen }),
    grantReward: (reward, source) => dispatch({ type: "ADD_REWARD", reward, source }),
    grantRewards: (rewards, source) => dispatch({ type: "ADD_REWARDS", rewards, source }),
    notify: (title, description, actionScreen) =>
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          description,
          category: "system",
          priority: "normal",
          read: false,
          createdAt: Date.now(),
          actionScreen,
        },
      }),
  };
}
