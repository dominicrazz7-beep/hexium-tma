# HEXIUM MVP Phase 2b · totalHexMined Sync Fix

Applied on top of Phase 2 (Telegram Connection Patch). No other files touched.

## Problem

Two independent counters tracked lifetime HEX mined:

- `reactor.totalHexMined` — local state inside `MainReactorScreen`,
  persisted separately to `localStorage["hexium_reactor_state_v1"]`.
- `state.player.totalHexMined` — global state, persisted in the main save
  (`hexium_clicker_save_v1`), updated by the `MINE_TAP` and `ADD_CURRENCY`
  reducer actions.

Both were incremented from the same taps/auto-miner ticks but through two
separate code paths with no synchronization. Reactor Level and Tier
(`getReactorLevel()`) were computed from the **local** copy, while
`ProfileScreen` reads the **global** copy. The two values drift apart over
time (e.g. on first load before the reactor screen has ever mounted, or
from rounding differences in the auto-miner tick), causing Reactor Level
on the Reactor screen to disagree with the Reactor Level shown on Profile.

## Fix

`state.player.totalHexMined` / `state.player.totalTaps` (global reducer
state) is now the single source of truth for anything level/stat-facing.
The reactor's local copies still exist and still increment (needed
internally by `performTap` / `tickReactor` for energy/heat timing), but
are no longer read for level calculation or stat display.

### Changed files

- `src/screens/MainReactor/MainReactor.types.ts`
  - `MainReactorScreenProps` gains two required props:
    `totalHexMined: number`, `totalTaps: number`.

- `src/screens/MainReactor/MainReactorScreen.tsx`
  - Component now destructures `totalHexMined` / `totalTaps` from props.
  - `reactorLevel` is computed as `getReactorLevel(totalHexMined)` (global
    value) instead of `getReactorLevel(reactor.totalHexMined)` (local
    value).
  - Stats row ("Тапи" / "Намайнено") now renders `totalTaps` /
    `totalHexMined` (global props) instead of `reactor.totalTaps` /
    `reactor.totalHexMined` (local state).

- `src/app/router/ScreenRouter.tsx`
  - `<MainReactorScreen>` now receives
    `totalHexMined={gameState.player.totalHexMined}` and
    `totalTaps={gameState.player.totalTaps}`.

## Not changed

- `reactor.totalHexMined` / `reactor.totalTaps` (local state) are still
  written to on every tap/tick — removing them would require touching
  `performTap` / `tickReactor` internals, which are unrelated to the
  display bug and were left untouched per scope.
- No other screens, reducers, or economy files were modified.

## Verification

- Manually traced every prop/type/usage site touched by this change;
  all three edits are internally consistent (`PlayerCoreState.totalHexMined`
  and `.totalTaps` are both `number`, matching the new prop types).
- Could not run a full `tsc --noEmit` / `vite build` in this environment —
  network access for `npm install` was unavailable, so `node_modules`
  could not be populated to run a complete type-check. Recommend running
  `npm install && npm run build` locally before shipping to confirm no
  other part of the codebase was relying on the old local-state read.

## Next

- Reactor Level/Tier and lifetime stats will now always agree between the
  Reactor screen and Profile screen, since both read `state.player`.
- Consider, in a later pass, removing `totalHexMined`/`totalTaps` from
  `ReactorLocalState` entirely and re-deriving any reactor-internal needs
  (none currently exist) — out of scope for this fix.
