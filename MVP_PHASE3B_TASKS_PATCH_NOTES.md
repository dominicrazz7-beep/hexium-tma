# HEXIUM MVP Phase 3B · Tasks MVP

## Base
Built on `HEXIUM_MAIN_PROJECT_MASTER_v3_MVP_Phase3A_DailyRewards`.

## Added
- Replaced Tasks placeholder with 5 MVP tasks:
  - Tap 50 times → +100 HEX
  - Upgrade Reactor 1 time → +200 HEX
  - Unlock First Bot → +3 SHARDS
  - Open 1 Case → +300 HEX
  - Play 10 Minutes → +500 HEX
- Rewards are granted through `dispatch({ type: "ADD_REWARD", source: "tasks" })`.
- Task completion is saved in `localStorage` key `hexium_tasks_mvp_v1`.
- Rewards can be claimed only once.
- Progress reads existing module state safely:
  - Reactor upgrades from `hexium_reactor_state_v1`
  - Bots unlocked from `hexium_bots_state_v1`
  - Cases opened from `hexium_cases_state_v1`
  - Taps from global `gameState.player.totalTaps`

## Changed files
- `src/screens/Tasks/Tasks.types.ts`
- `src/screens/Tasks/TasksScreen.tsx`
- `src/screens/Tasks/Tasks.css`
- `src/app/router/ScreenRouter.tsx`

## Not touched
- Reactor
- Bots
- Shop
- Cases
- Telegram Bridge
- Daily Rewards
- MVP navigation scope
- Inventory / Mail / Notifications

## Verification
`npm run build` passed successfully.
