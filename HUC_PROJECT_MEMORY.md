HUC PROJECT MEMORY
Project: HEXIUM
Version: v1.0
Last updated: 2026-06-27

PURPOSE

This file stores project-specific memory for HEXIUM only.

Do not apply this memory to unrelated projects.
Do not use HEXIUM style, economy, naming, architecture, UI patterns, or mechanics in other games, websites, bots, or apps unless the user explicitly asks.

PROJECT IDENTITY

Project name:
HEXIUM / HEXIUM CLICKER

Project type:
Telegram WebApp game

Primary genre:
Futuristic idle clicker / mining simulator / reactor management game

Target platform:
Telegram WebApp, mobile-first, portrait 9:16

Main purpose:
A premium-feeling cyber sci-fi clicker game where the player mines HEXIUM, manages a reactor, upgrades systems, unlocks bots, opens cases, progresses through networks, and improves production over time.

CURRENT MAIN PROJECT PATH

F:.AI HexiumGames\HEXIUM_MAIN_PROJECT_STABLE_01\HEXIUM_MAIN_PROJECT

IMPORTANT:
This is the current main HEXIUM project unless the user says otherwise.

TECH STACK

Known stack:

* React
* TypeScript
* Vite
* Zustand or similar state management
* Telegram WebApp integration
* Browser/mobile UI
* Local development on localhost, usually Vite on port 5173

Available HUC tools:

* Filesystem MCP
* Git MCP
* Context7 MCP
* Playwright MCP
* Firecrawl MCP
* Sequential Thinking MCP

VISUAL STYLE

HEXIUM visual identity:

* Dark premium cyber sci-fi
* Black glossy metal
* Neon purple
* Electric blue
* Toxic cyan holograms
* Subtle gold accents
* Hexagonal panels
* Glowing borders
* Clean readable UI
* Premium mobile game feeling

Do not make HEXIUM:

* generic website
* toy/cartoon game
* casino-looking interface
* flat cheap UI
* unreadable neon chaos

UI priorities:

* mobile-first 9:16
* readable text
* clear hierarchy
* clean panels
* touch-friendly controls
* no important content hidden behind bottom navigation
* avoid unnecessary scroll in Telegram WebApp layout

CORE GAME CONCEPTS

Main resources:

* HEX
* SHARDS
* Hashrate

Main systems:

* Main reactor
* Mining/tapping
* Energy
* Temperature/overheat
* Turbo/boosts
* HEX-BOTS
* Shop
* Cases
* Tasks
* Daily rewards
* Network/sectors
* Profile/stats/achievements
* Battle pass
* News/settings
* Research center
* Quantum lab
* Corporation

Known bot names:

* GPU CODER
* COOLER BOT
* MINER DRONE
* POWER CORE
* DATA SCOUT
* SHARD HUNTER

Important cases direction:

* Basic: green
* Advanced: blue
* Premium: purple
* Exotic: yellow

ARCHITECTURE RULES

Before changing HEXIUM:

1. Inspect relevant files first.
2. Check Git status if available.
3. Prefer small safe edits.
4. Do not rewrite large systems without approval.
5. Do not modify unrelated files.
6. Preserve existing architecture unless redesign is requested.
7. Reuse existing components and systems before creating new ones.
8. Do not introduce new dependencies without clear benefit.
9. Report all changed files after edits.

HIGH-RISK AREAS

Treat these as risky and require analysis before editing:

* routing
* economy logic
* save system
* cloud save
* localStorage logic
* Telegram integration
* payment/Stars systems
* ads/monetization
* bots balance
* cases balance
* shop balance
* research balance
* battle pass rewards
* core reactor formulas

ECONOMY RULES

Before changing economy numbers:

1. Produce an audit first.
2. Identify current progression.
3. Check early, mid, and late game impact.
4. Watch for runaway passive income.
5. Watch for too-fast energy recovery.
6. Watch for overpowered ads or rewards.
7. Watch for paywall pressure.
8. Explain expected impact before applying balance changes.

Known economy direction:

* Starting bots should not generate passive income too early unless explicitly designed.
* Missions should feel rewarding.
* Ads can restore energy, cooling, boosts, or other helpful rewards, but should not break balance.
* Daily rewards should be meaningful but not destroy progression.

UI/UX KNOWN ISSUES TO WATCH

From previous Playwright checks:

* large empty space above the main game panel
* mobile app layout visible inside desktop viewport
* right-side floating value may appear detached on wide screens
* bottom navigation may overlap lower reactor area
* page scrollbar may appear despite app-like layout

These need verification before patching.

GIT RULES

The current HEXIUM folder uses Git.

Known initial backup:
Message:
HEXIUM STABLE 01 - Initial backup

Before major edits:

* check git status
* recommend backup commit if changes are risky
* avoid mixing unrelated changes
* keep commits meaningful

PLAYWRIGHT RULES

Use Playwright for:

* localhost UI checks
* screenshots
* visible layout issues
* scroll behavior
* bottom navigation overlap
* console warnings/errors
* mobile viewport checks

Do not use Playwright when:

* the task is conceptual
* the app is not running
* the user says not to use tools

CONTEXT7 RULES

Use Context7 when:

* current React, Vite, TypeScript, Zustand, Framer Motion, Tailwind, Phaser, PixiJS, or other library documentation may be needed.

Do not use Context7 when:

* existing project code is enough
* the user asks for a short explanation
* the answer does not require current docs

HEXIUM WORKFLOW

For audits:

1. Inspect structure.
2. Identify stack.
3. Check Git status.
4. Review configs.
5. Review src.
6. Identify systems.
7. Review UI/UX.
8. Review economy.
9. Review storage/save risks.
10. Review Telegram WebApp risks.
11. Provide prioritized report.
12. Do not modify files.

For code changes:

1. Confirm task.
2. Inspect affected files.
3. Check Git status.
4. Make short plan.
5. Ask approval if risky.
6. Edit minimal relevant files.
7. Verify with build, inspection, logs, or Playwright.
8. Report changed files and remaining risks.

CURRENT STRATEGIC GOAL

Make HEXIUM stable, playable, visually polished, mobile-friendly, and safe to continue developing with multiple AI tools.

Do not chase random rewrites.
Prefer controlled improvements:

* audit
* fix
* verify
* commit
* continue

OPEN QUESTIONS

These should be confirmed when relevant:

* final rank system for bots and items
* final economy curve
* final monetization plan
* final screen list for MVP
* final Telegram WebApp launch requirements
* whether to create private GitHub backup repository
* whether to define release milestones

END OF HUC_PROJECT_MEMORY.md
