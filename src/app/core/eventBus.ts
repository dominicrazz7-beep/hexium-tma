import type { GameReward, HexiumScreen } from "./hexiumTypes";

export type HexiumEvent =
  | { type: "task_completed"; taskId: string; rewards: GameReward[] }
  | { type: "achievement_unlocked"; achievementId: string; rewards: GameReward[] }
  | { type: "expedition_finished"; expeditionId: string; rewards: GameReward[] }
  | { type: "boss_defeated"; bossId: string; rewards: GameReward[] }
  | { type: "mail_received"; mailId: string }
  | { type: "screen_opened"; screen: HexiumScreen };

type Listener = (event: HexiumEvent) => void;

export class HexiumEventBus {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  emit(event: HexiumEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const hexiumEventBus = new HexiumEventBus();
