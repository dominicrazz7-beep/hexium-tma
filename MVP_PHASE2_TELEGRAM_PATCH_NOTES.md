# HEXIUM MVP Phase 2 · Telegram Connection Patch

## Changed

- Enabled `telegramBridge.initialize()` in `src/app/App.tsx`.
- Added Telegram identity sync into central `HexiumGameState.player`.
- Replaced hardcoded default player `HEX-924581 / DZI` with `guest / Guest`.
- Added reducer action `SET_PLAYER_IDENTITY`.
- Moved bot username in `telegramBridge.ts` to `import.meta.env.VITE_BOT_USERNAME`.
- Added `.env.example` with Telegram WebApp variables.
- Added `base: "/"` to `vite.config.ts`.

## Not changed

- No UI style changes.
- No new big systems.
- No Shop/Stars payment logic yet.
- No Reward Ads yet.

## Next phase

Phase 3 should connect MVP placeholder systems:

- Tasks
- Daily Rewards
- Friends / referralService
- Reward Ads
- Telegram Stars in Shop
