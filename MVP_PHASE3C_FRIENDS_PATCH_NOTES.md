# HEXIUM MVP · Phase 3C Friends / Referrals

Base: HEXIUM_MAIN_PROJECT_MASTER_v3_MVP_Phase3B_Tasks

## Scope
MVP Friends screen only. No backend, no non-MVP systems.

## Changed files
- `src/screens/Friends/FriendsScreen.tsx`
- `src/screens/Friends/Friends.types.ts`
- `src/screens/Friends/Friends.css`
- `src/app/router/ScreenRouter.tsx`

## Added
- Working invite screen instead of placeholder.
- Referral code generated from Telegram user id when available.
- Guest fallback referral code for browser testing.
- Invite link using `VITE_BOT_USERNAME` / Telegram bridge.
- Copy invite link button.
- Telegram share button / fallback share URL.
- One-time first-share bonus: `+150 HEX` through `ADD_REWARD`.
- Local progress stored in `hexium_friends_mvp_v1`.
- UI stats for copied/shared count and MVP referral status.

## Not added yet
- Real server-side referral join verification.
- Real friend list from backend.
- Passive referral income.

Those require backend / cloud validation and are intentionally postponed.

## Build
`npm run build` passed successfully.
