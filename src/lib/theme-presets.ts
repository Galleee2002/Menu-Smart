import { DEFAULT_THEME } from './theme-defaults';

export type ThemePresetId = 'classic' | 'dark' | 'warm' | 'minimal';

export type ThemeColors = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
};

export const THEME_PRESET_IDS = ['classic', 'dark', 'warm', 'minimal'] as const satisfies readonly ThemePresetId[];

export const THEME_PRESETS: Record<ThemePresetId, ThemeColors> = {
  classic: { ...DEFAULT_THEME },
  dark: {
    primaryColor: '#a78bfa',
    secondaryColor: '#94a3b8',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    accentColor: '#f472b6',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  warm: {
    primaryColor: '#d97706',
    secondaryColor: '#78716c',
    backgroundColor: '#fffbeb',
    textColor: '#292524',
    accentColor: '#b45309',
    fontFamily: "'Merriweather', Georgia, serif",
  },
  minimal: {
    primaryColor: '#18181b',
    secondaryColor: '#71717a',
    backgroundColor: '#ffffff',
    textColor: '#18181b',
    accentColor: '#3b82f6',
    fontFamily: "'Helvetica Neue', system-ui, sans-serif",
  },
};

export type ThemePresetOption = {
  id: ThemePresetId;
  name: string;
  description: string;
};

export const THEME_PRESET_OPTIONS: ThemePresetOption[] = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Verde fresco y fondo claro, ideal para cafés y restaurantes.',
  },
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Fondo profundo con acentos violeta, perfecto para bares nocturnos.',
  },
  {
    id: 'warm',
    name: 'Cálido',
    description: 'Tonos ámbar y tipografía serif, cocina casera y panaderías.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Blanco y negro con acento azul, look limpio y contemporáneo.',
  },
];

export const THEME_FONT_OPTIONS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter — Sans-serif moderna' },
  { value: "'Merriweather', Georgia, serif", label: 'Merriweather — Serif cálida' },
  { value: "'Helvetica Neue', system-ui, sans-serif", label: 'Helvetica — Sans-serif neutra' },
  { value: "'Poppins', Inter, system-ui, sans-serif", label: 'Poppins — Sans-serif redondeada' },
] as const;

function normalizeHex(color: string): string {
  return color.trim().toLowerCase();
}

function colorsMatch(a: ThemeColors, b: ThemeColors): boolean {
  return (
    normalizeHex(a.primaryColor) === normalizeHex(b.primaryColor) &&
    normalizeHex(a.secondaryColor) === normalizeHex(b.secondaryColor) &&
    normalizeHex(a.backgroundColor) === normalizeHex(b.backgroundColor) &&
    normalizeHex(a.textColor) === normalizeHex(b.textColor) &&
    normalizeHex(a.accentColor) === normalizeHex(b.accentColor) &&
    a.fontFamily === b.fontFamily
  );
}

export function detectThemePreset(theme: ThemeColors): ThemePresetId | null {
  for (const id of THEME_PRESET_IDS) {
    if (colorsMatch(theme, THEME_PRESETS[id])) {
      return id;
    }
  }

  return null;
}

export function isThemePresetId(value: string): value is ThemePresetId {
  return THEME_PRESET_IDS.includes(value as ThemePresetId);
}
