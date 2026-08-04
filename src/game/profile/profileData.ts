/* ═══════════════ HEXIUM · Profile — data / types ═══════════════ */
/* "Operator File" — aggregates cross-module player stats, achievements,
   cosmetics and local settings. Pure data, no React. */

/* ── localStorage keys (this module + cross-module reads) ── */
export const PROFILE_STORAGE_KEY = "hexium_profile_state_v1";
export const BOTS_STORAGE_KEY = "hexium_bots_state_v1";
export const CASES_STORAGE_KEY = "hexium_cases_state_v1";
export const SHOP_STORAGE_KEY = "hexium_shop_state_v1";

/* ── Operator avatar glyphs (cosmetic, cycled in settings) ── */
export const OPERATOR_GLYPHS = ["⬡", "⬢", "❖", "✦", "⌬", "◈"] as const;
export type OperatorGlyph = (typeof OPERATOR_GLYPHS)[number];

/* ── Settings (local, no economy impact) ── */
export type ProfileSettings = {
  haptics: boolean;
  soundFx: boolean;
  reducedMotion: boolean;
  pushNotifications: boolean;
  compactNumbers: boolean;
};

export const DEFAULT_SETTINGS: ProfileSettings = {
  haptics: true,
  soundFx: true,
  reducedMotion: false,
  pushNotifications: true,
  compactNumbers: false,
};

export type SettingToggle = { key: keyof ProfileSettings; label: string; hint: string };

export const SETTING_TOGGLES: SettingToggle[] = [
  { key: "haptics", label: "Haptics", hint: "Vibration feedback on tap" },
  { key: "soundFx", label: "Sound FX", hint: "Reactor & UI sounds" },
  { key: "reducedMotion", label: "Reduced Motion", hint: "Dampen heavy animations" },
  { key: "pushNotifications", label: "Push Notifications", hint: "Idle & event alerts" },
  { key: "compactNumbers", label: "Compact Numbers", hint: "Show 1.2M instead of 1,200,000" },
];

/* ── Persisted profile state ── */
export type ProfileState = {
  glyphIndex: number;
  settings: ProfileSettings;
};

export function initialProfileState(): ProfileState {
  return { glyphIndex: 0, settings: { ...DEFAULT_SETTINGS } };
}

/* ── Player summary (re-exported for cross-module use) ── */
export type PlayerSummary = {
  hex: number;
  shards: number;
  totalHexMined: number;
  totalTaps: number;
  hashrate: number;
  reactorLevel: number;
  botsOwned: number;
  casesOpened: number;
  skinsOwned: number;
};
