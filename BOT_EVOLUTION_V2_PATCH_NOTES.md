# HEXIUM CLICKER · Bot Evolution V2 Patch

## What changed

- Removed the old duplicated bot progression feeling.
- Rebuilt HEX-BOTS into 6 clear bot classes:
  - Coder
  - Drone
  - Cooler
  - Scout
  - Power Core
  - Data Hunter
- Each bot class now has 5 star stages instead of many visually repetitive bot ranks.
- Cases now drop bot fragments and bot copies instead of direct bot unlocks.
- HEX-BOTS screen now shows:
  - Bot Index progress: 0/30 stars
  - 5-star evolution pips
  - fragments required to create locked bots
  - copies required to evolve owned bots
- Added legacy migration from old bot IDs into the new bot classes.
- Updated bot economy balance:
  - max level increased to 20
  - upgrade growth reduced to 1.38
  - offline income cap increased to 12 hours
  - star-based output multipliers added

## New bot progression

3 copies of the same bot class evolve it by 1 star.

Example:

3x Coder copies = Coder ★★

## Case reward rework

Cases can now reward:

- HEX
- SHARDS
- bot fragments
- bot copies
- skins
- boosters

## Files changed

- src/game/bots/botsData.ts
- src/game/bots/botsBalance.ts
- src/game/bots/botsLogic.ts
- src/game/cases/casesData.ts
- src/game/cases/casesLogic.ts
- src/screens/HexBots/HexBotsScreen.tsx
- src/screens/Cases/CasesScreen.tsx

## Build status

npm run build passed successfully.
