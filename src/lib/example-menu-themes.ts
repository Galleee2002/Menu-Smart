export type ExampleMenuThemeId = 'minimal-clean' | 'warm-natural' | 'bold-night';

export interface ExampleMenuTheme {
  id: ExampleMenuThemeId;
  name: string;
  description: string;
}

export const EXAMPLE_MENU_THEMES: ExampleMenuTheme[] = [
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Limpio, moderno y profesional',
  },
  {
    id: 'warm-natural',
    name: 'Warm & Natural',
    description: 'Cálido, gastronómico y elegante',
  },
  {
    id: 'bold-night',
    name: 'Bold Night',
    description: 'Oscuro, premium y distintivo',
  },
];

export const DEFAULT_EXAMPLE_THEME_ID: ExampleMenuThemeId = 'minimal-clean';

export const EXAMPLE_THEME_STORAGE_KEY = 'smartmenu-example-theme';

export function isExampleMenuThemeId(value: string | null): value is ExampleMenuThemeId {
  return value === 'minimal-clean' || value === 'warm-natural' || value === 'bold-night';
}
