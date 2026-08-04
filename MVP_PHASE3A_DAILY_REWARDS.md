# HEXIUM MVP · Phase 3A Daily Rewards

## Base
Built on top of MVP build-fixed branch.

## Changes
- Replaced placeholder DailyRewards screen with working MVP 7-day calendar.
- Added 24h claim cooldown using localStorage key `hexium_daily_rewards_mvp_v1`.
- Added direct reward dispatch via `ADD_REWARD`.
- Connected `dispatch` from ScreenRouter to DailyRewardsScreen.
- Kept MVP scope: no Inventory UI, no Mail, no Notifications, no Router expansion.
- Kept one small build fix in referralService: `referredBy` is treated as number.

## Reward track
- Day 1: 100 HEX
- Day 2: 250 HEX
- Day 3: 1 Basic Case
- Day 4: 500 HEX
- Day 5: 5 SHARDS
- Day 6: 750 HEX
- Day 7: 1 Advanced Case + 1000 HEX

## Verification
`npm run build` passed successfully before packaging.
