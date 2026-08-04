# HEXIUM MVP · Phase 3D · Shop / Ads / Case Economy

## Що зроблено

- Додано корисні покупки за HEX у Shop:
  - Mini 2× Mining за HEX
  - Overclock Core за HEX
  - Energy Refill за HEX
  - Quick Cooldown за HEX
- Перебалансовано HEX ↔ SHARDS обмін, щоб не було арбітражу.
- Перебалансовано HEX packs за SHARDS, щоб SHARDS не перескакували занадто багато прогресії.
- Додано Reward Ads у Shop:
  - Energy Recharge: 5 разів/день
  - Cooling Burst: 5 разів/день
  - HEX Bonus +1000 HEX: 5 разів/день
  - 2× Ad Boost на 15 хвилин: 3 рази/день
  - cooldown 5 хвилин для кожного типу реклами
- Додано localStorage для ad limits/cooldowns:
  - hexium_reward_ads_mvp_v1
- Cases тепер мають змішану оплату:
  - Common Crate за HEX
  - Rare Crate за HEX
  - Epic/Legendary/Quantum за SHARDS
- Зменшено занадто великі нагороди в cases:
  - Quantum більше не дає мільйони HEX
  - SHARDS-дропи та dupe compensation знижено
- Прибрано QC/RP з верхнього HUD для MVP, щоб гравець не бачив незрозумілі валюти.

## Що не зроблено навмисно

- Не підключав реальний Telegram Ads SDK, бо це треба робити після деплою/налаштування рекламного провайдера.
- Не чіпав Reactor / Bots / Tasks / Daily Rewards / Friends.
- Не повертав Research / Quantum / Corporation / Mail / Inventory / Notifications.

## Build

`npm run build` пройшов успішно.
