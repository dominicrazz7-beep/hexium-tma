# HEXIUM CLICKER — Agent Guide

## Project

HEXIUM Clicker — Telegram Mini App (idle/clicker game) built with React + TypeScript + Vite.

## Tech Stack

- React 18, TypeScript, Vite
- No backend — all state in localStorage
- CSS modules (no Tailwind, no styled-components)
- No external state manager (useReducer + localStorage)

## Architecture

```
src/
├── app/
│   ├── core/           # State, reducer, rewards, types, storage
│   ├── router/         # ScreenRouter + screensRegistry
│   ├── bridges/        # moduleBridge + telegramBridge
│   └── systems/        # Foundation v2 (commented out, future)
├── game/               # Pure logic modules (data/balance/logic per feature)
│   ├── reactor/        # Core reactor engine
│   ├── bots/           # HEX-BOTS system
│   ├── shop/           # Shop items + boosters
│   ├── cases/          # Loot crates
│   ├── blackMarket/    # Rotating shop (6h refresh)
│   ├── reactorModules/ # Slot system (3 modules)
│   └── economy/        # Unified passive income
├── screens/            # Screen components (one per feature)
├── shared/             # Reusable UI (Hud, Nav, StatusGrid)
└── main.tsx
```

## Key Rules

### Game Logic Pattern
Every game feature follows: `data.ts` → `balance.ts` → `logic.ts`
- `data.ts` — types, constants, item definitions
- `balance.ts` — tuning knobs, multipliers, limits
- `logic.ts` — pure functions (no React, no DOM)

### Screen Pattern
Every screen follows:
- `FeatureScreen.tsx` — component with props: `hex`, `shards`, `onNavigate`, `dispatch`
- `Feature.css` — styles with unique prefix (e.g., `bm-`, `rm-`, `ex-`)
- `Feature.types.ts` — screen-specific types (optional)

### Persistence
- Each subsystem owns its own `localStorage` key (e.g., `hexium_reactor_state_v1`)
- Subsystems read/write independently — NOT through the global reducer
- Cross-module grants: screen writes directly to other module's localStorage
- Main reducer handles: currencies (`ADD_CURRENCY`), rewards (`ADD_REWARD`), navigation

### Economy Flow
- `economyEngine.ts` reads ALL subsystem localStorage independently
- `useGlobalEconomy.ts` ticks once per second, dispatches `ADD_CURRENCY`
- Passive income = reactor + bots + network + boosters

### CSS Prefixes (no conflicts)
```
hx-   Shell/App          mr-   MainReactor
hb-   HexBots            sh-   Shop
cs-   Cases              bm-   BlackMarket
rm-   ReactorModules     rp-   ReactorPets
ex-   Expeditions        wb-   WorldBosses
af-   Artifacts          sb-   SecretBlueprints
```

### Build & Verify
After any change:
```bash
npm run build   # Must pass — tsc + vite build
```

### TypeScript
- Strict mode
- Discriminated unions for reward/action types
- No `any` in game logic (allowed in screen prop passthrough only)

### Imports
- Always import from game logic, never duplicate logic in screens
- Screens are thin — logic lives in `src/game/`

## Don'ts

- Don't add `framer-motion` or `zustand` — removed in Phase 1
- Don't add backend/server calls — MVP is fully client-side
- Don't unlock non-MVP screens without explicit instruction
- Don't break localStorage key compatibility with existing saves
- Don't add comments unless explicitly asked
