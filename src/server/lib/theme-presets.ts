import type { Theme } from "../../generated/prisma/client";

export type ThemePresetId = "classic" | "dark" | "warm" | "minimal";

export type ThemeColors = Pick<
  Theme,
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "textColor"
  | "accentColor"
  | "fontFamily"
>;

export const THEME_PRESET_IDS = [
  "classic",
  "dark",
  "warm",
  "minimal",
] as const satisfies readonly ThemePresetId[];

export const THEME_PRESETS: Record<ThemePresetId, ThemeColors> = {
  classic: {
    primaryColor: "#10b981",
    secondaryColor: "#64748b",
    backgroundColor: "#f8fafc",
    textColor: "#0f172a",
    accentColor: "#dc2626",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  dark: {
    primaryColor: "#a78bfa",
    secondaryColor: "#94a3b8",
    backgroundColor: "#0f172a",
    textColor: "#f1f5f9",
    accentColor: "#f472b6",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  warm: {
    primaryColor: "#d97706",
    secondaryColor: "#78716c",
    backgroundColor: "#fffbeb",
    textColor: "#292524",
    accentColor: "#b45309",
    fontFamily: "'Merriweather', Georgia, serif",
  },
  minimal: {
    primaryColor: "#18181b",
    secondaryColor: "#71717a",
    backgroundColor: "#ffffff",
    textColor: "#18181b",
    accentColor: "#3b82f6",
    fontFamily: "'Helvetica Neue', system-ui, sans-serif",
  },
};

export function isThemePresetId(value: string): value is ThemePresetId {
  return THEME_PRESET_IDS.includes(value as ThemePresetId);
}
