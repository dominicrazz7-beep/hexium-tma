# HEXIUM MVP Phase 1 Patch

This patch keeps the full v3 codebase intact, but locks the active launch scope to MVP screens only.

Changed files:

- `src/app/core/initialState.ts`
  - `unlockedScreens` now contains only MVP screens.

- `src/app/router/screensRegistry.ts`
  - active registry now lists only MVP screens.

- `src/shared/BottomNavigation.tsx`
  - bottom nav now exposes only MVP screens.

- `src/shared/StatusGrid.tsx`
  - removed Mail / Alerts / Inventory cards because those systems are deferred.

- `src/app/App.tsx`
  - removed unused unread mail / alerts / inventory counters from StatusGrid props.

- `package.json` and `package-lock.json`
  - removed unused `framer-motion` and `zustand`.

MVP screens left active:

- Main Reactor
- HEX-BOTS
- Shop
- Cases
- Tasks
- Daily Rewards
- Friends
- Profile

Deferred screens were not deleted. They remain in the project for future updates.
