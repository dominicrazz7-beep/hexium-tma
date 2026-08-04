# HEXIUM CLICKER · FULL BUILD v2

**216 files · 16789 lines · React + TypeScript**

## Architecture

```
src/
├── app/
│   ├── core/           # State, reducer, rewards, events, storage
│   ├── router/         # ScreenRouter + screensRegistry
│   ├── bridges/        # moduleBridge (v1) + telegramBridge (v2)
│   ├── systems/        # FOUNDATION v2 — 6 backend systems
│   │   ├── telegram/   # Telegram WebApp SDK integration
│   │   ├── referral/   # Invite codes, tiers, passive income
│   │   ├── cloudSave/  # Slots, sync, conflict resolution
│   │   ├── stars/      # Telegram Stars monetization
│   │   ├── share/      # Share templates, deep links, adapters
│   │   └── analytics/  # Events, queue, offline pipeline
│   ├── App.tsx         # Root component + lifecycle
│   └── App.css         # App shell styles
├── shared/             # TopResourceHud, SidebarNav, BottomNav, StatusGrid
├── screens/            # 25 screen components (placeholder shells)
│   ├── MainReactor/
│   ├── HexBots/
│   ├── Shop/
│   └── ... (25 total)
├── game/               # 25 game logic modules (data/balance/logic)
│   ├── reactor/
│   ├── bots/
│   ├── shop/
│   └── ... (25 total)
└── main.tsx            # Entry point
```

## Stats

| Category | Files | Lines |
|----------|------:|------:|
| Core + Shell | 21 | 1439 |
| Screens (25) | 75 | 4000 |
| Game Logic (25) | 75 | 300 |
| Foundation v2 Systems (6) | 45 | 11050 |
| **TOTAL** | **216** | **16789** |

## Foundation v2 Systems

| System | Files | Lines | Key |
|--------|------:|------:|-----|
| Telegram | 8+1 bridge | ~1720 | telegramBridge facade |
| Referral | 7 | ~1630 | 6 tiers, 8 milestones |
| Cloud Save | 8 | ~1920 | Slots, chunked sync |
| Stars | 7 | ~2025 | Monetization layer |
| Share | 7 | ~2030 | Templates, deep links |
| Analytics | 7 | ~1985 | 51 events, offline queue |

## CSS Prefixes (no conflicts)

```
hx-   Shell/App          mr-   MainReactor
hb-   HexBots            sh-   Shop
cs-   Cases              nw-   Network
pf-   Profile            tk-   Tasks
fr-   Friends            lb-   Leaderboard
ach-  Achievements       dr-   DailyRewards
nc-   NewsCenter         ev-   Events
bp-   BattlePass         st-   Settings
rc-   ResearchCenter     ql-   QuantumLab
ex-   Expeditions        corp- Corporation
wb-   WorldBosses        cw-   CorporationWars
qs-   QuantumSectors     inv-  Inventory
mc-   MailCenter         ntc-  NotificationCenter
tut-  Tutorial           ofr-  Offers
spl-  Splash
```

## Integration Ready

Foundation v2 systems are fully wired but imports are commented out.
To activate, uncomment the lifecycle block in App.tsx and imports in ScreenRouter.tsx.

Init order: Telegram → Analytics → Referral → CloudSave → Stars → Share
Destroy order: reverse.

## localStorage Keys (19 unique, 0 conflicts)

```
hexium_analytics_*   Analytics (4 keys)
hexium_device_id     Shared: Analytics + CloudSave
hexium_purchase_*    Stars (2 keys)
hexium_referral_v1   Referral
hexium_ref           Referral
hexium_share_*       Share (3 keys)
hexium_save_*        CloudSave (2 keys)
hexium_sync_meta     CloudSave
hx_sv_*              CloudSave
hexium_tg_*          Telegram (2 keys)
hexium_bot           Telegram
hexium_chunk_*       Telegram Cloud
hexium_profile       Telegram
```
