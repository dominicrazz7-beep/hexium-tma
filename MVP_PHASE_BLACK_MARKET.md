# HEXIUM MVP · Black Market

## Based on
MVP Phase 3D

## Що зроблено

- Повністю перебудовано Black Market з placeholder в повноцінну систему.
- Додано модуль гри `src/game/blackMarket/` (data, balance, logic).
- 6-годинний цикл оновлення товарів через seeded pseudo-random (mulberry32).
- 8 випадкових товарів на кожне вікно, з ваговим відбором по рідкісності.
- Товари зберігають стан в localStorage (`hexium_black_market_v1`).
- Покупки проходять через dispatch → reducer (валюти, кейси, фрагменти).
- Категорії фільтрів: Fragments, Cases, Modules, Data.
- Limited Deals з анімацією та зниженими цінами.
- Stock tracking — кожен товар має обмежену кількість.
- Toast-сповіщення при покупках.
- Історія покупок (останні 5).

## Категорії товарів

- **Fragments** — 5x/10x Random Bot Fragments, Legendary Fragment
- **Cases** — Common Crate, Advanced Case, Premium Case, Quantum Crate
- **Modules** — Cooling Matrix, Overclock Chip, Flux Capacitor
- **Data** — Research Data, Encrypted Research, HEX Data Shard, Shard Fragment

## Обмеження

- Кожне вікно (6h) генерує новий набір товарів з seed на основі часу.
- Limited Deals мають 1 одиницю в наявності та знижену ціну.
- Звичайні товари мають 2-5 одиниць залежно від рідкісності.

## Змінені файли

- `src/game/blackMarket/blackMarketData.ts` — каталог товарів, типи, генерація
- `src/game/blackMarket/blackMarketBalance.ts` — баланс-константи
- `src/game/blackMarket/blackMarketLogic.ts` — чиста логіка покупок
- `src/screens/BlackMarket/BlackMarketScreen.tsx` — екран
- `src/screens/BlackMarket/BlackMarket.css` — стилі
- `src/app/router/ScreenRouter.tsx` — додано dispatch до BlackMarketScreen

## Build
`npm run build` пройшов успішно.
