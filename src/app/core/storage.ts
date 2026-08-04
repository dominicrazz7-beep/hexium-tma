import type { HexiumGameState } from "./hexiumTypes";
import { HEXIUM_SAVE_KEY, initialHexiumState } from "./initialState";

export function saveHexiumState(state: HexiumGameState) {
  const payload: HexiumGameState = { ...state, lastSavedAt: Date.now() };
  localStorage.setItem(HEXIUM_SAVE_KEY, JSON.stringify(payload));
}

export function loadHexiumState(): HexiumGameState {
  try {
    const raw = localStorage.getItem(HEXIUM_SAVE_KEY);
    if (!raw) return initialHexiumState;

    const parsed = JSON.parse(raw) as Partial<HexiumGameState>;

    const mergedPlayer = {
      ...initialHexiumState.player,
      ...(parsed.player ?? {}),
    };

    // Phase 2 migration: old builds shipped with a hardcoded player
    // identity. Do not keep that identity for new Telegram users.
    if (mergedPlayer.id === "HEX-924581" || mergedPlayer.username === "DZI") {
      mergedPlayer.id = initialHexiumState.player.id;
      mergedPlayer.username = initialHexiumState.player.username;
    }

    return {
      ...initialHexiumState,
      ...parsed,
      // Deep merge nested objects to preserve new fields from updates
      player: mergedPlayer,
      currencies: {
        ...initialHexiumState.currencies,
        ...(parsed.currencies ?? {}),
      },
      quantumResources: {
        ...initialHexiumState.quantumResources,
        ...(parsed.quantumResources ?? {}),
      },
      // Merge unlockedScreens so new screens are always added to old saves
      unlockedScreens: [
        ...new Set([
          ...initialHexiumState.unlockedScreens,
          ...(parsed.unlockedScreens ?? []),
        ]),
      ],
    };
  } catch {
    return initialHexiumState;
  }
}

/**
 * Subsystem localStorage keys written by the individual game modules.
 * Kept here as an explicit fallback so a reset always wipes known data
 * even if the dynamic prefix sweep below ever changes.
 */
export const HEXIUM_SUBSYSTEM_KEYS = [
  HEXIUM_SAVE_KEY, // hexium_clicker_save_v1
  "hexium_reactor_state_v1",
  "hexium_bots_state_v1",
  "hexium_shop_state_v1",
  "hexium_cases_state_v1",
  "hexium_network_state_v1",
  "hexium_profile_state_v1",
  "hexium_economy_state_v1",
  "hexium_referral_v1",
] as const;

/**
 * Wipe ALL HEXIUM persistence. Removes the main save plus every subsystem
 * key (reactor / bots / shop / cases / network / profile / economy / referral)
 * and any other future `hexium_*` key, so the game starts as brand new.
 */
export function clearHexiumState() {
  try {
    // Dynamic sweep: catch every hexium_* key, including future modules.
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.toLowerCase().startsWith("hexium")) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    // Explicit fallback for the known keys.
    HEXIUM_SUBSYSTEM_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Full hard reset: clear all persistence and reload so every subsystem
 * (each holds its own React state) re-initialises from empty defaults.
 */
export function hardResetHexium() {
  clearHexiumState();
  if (typeof window !== "undefined") window.location.reload();
}
