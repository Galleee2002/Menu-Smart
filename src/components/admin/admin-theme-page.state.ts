import type { Theme } from '../../lib/admin-api';
import type { ThemeColors } from '../../lib/theme-presets';

export type ThemeFormState = ThemeColors;

export type ThemeFieldKey = keyof ThemeFormState;

export type FieldErrors = Partial<Record<ThemeFieldKey, string>>;

export type PageStatus = 'loading' | 'error' | 'ready';

export type ThemePageState = {
  status: PageStatus;
  loadError: string;
  form: ThemeFormState | null;
  original: ThemeFormState | null;
  fieldErrors: FieldErrors;
  bannerError: string;
  successMessage: string;
  saving: boolean;
  applyingPreset: boolean;
  presetDialogOpen: boolean;
  pendingPreset: string | null;
  previewMenuHref: string | null;
};

export type ThemePageAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; theme: Theme; previewMenuHref: string | null }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'UPDATE_FIELD'; key: ThemeFieldKey; value: string }
  | { type: 'SET_FIELD_ERRORS'; errors: FieldErrors }
  | { type: 'RESET_FORM' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; theme: Theme }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'PRESET_START' }
  | { type: 'PRESET_SUCCESS'; theme: Theme }
  | { type: 'PRESET_ERROR'; message: string }
  | { type: 'OPEN_PRESET_DIALOG'; preset: string }
  | { type: 'CLOSE_PRESET_DIALOG' }
  | { type: 'SET_BANNER_ERROR'; message: string };

export const initialThemePageState: ThemePageState = {
  status: 'loading',
  loadError: '',
  form: null,
  original: null,
  fieldErrors: {},
  bannerError: '',
  successMessage: '',
  saving: false,
  applyingPreset: false,
  presetDialogOpen: false,
  pendingPreset: null,
  previewMenuHref: null,
};

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value.trim());
}

export function toThemeFormState(theme: Theme): ThemeFormState {
  return {
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    accentColor: theme.accentColor,
    fontFamily: theme.fontFamily,
  };
}

export function buildThemePatch(
  form: ThemeFormState,
  original: ThemeFormState,
): Partial<ThemeFormState> | null {
  const patch: Partial<ThemeFormState> = {};

  for (const key of Object.keys(form) as ThemeFieldKey[]) {
    if (form[key] !== original[key]) {
      patch[key] = form[key];
    }
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function validateThemeForm(form: ThemeFormState): FieldErrors {
  const errors: FieldErrors = {};

  const colorFields: ThemeFieldKey[] = [
    'primaryColor',
    'secondaryColor',
    'backgroundColor',
    'textColor',
    'accentColor',
  ];

  for (const key of colorFields) {
    if (!isValidHexColor(form[key])) {
      errors[key] = 'Usa un color hexadecimal válido (#RGB o #RRGGBB).';
    }
  }

  const fontFamily = form.fontFamily.trim();

  if (fontFamily.length < 1 || fontFamily.length > 200) {
    errors.fontFamily = 'La tipografía debe tener entre 1 y 200 caracteres.';
  }

  return errors;
}

export function themePageReducer(state: ThemePageState, action: ThemePageAction): ThemePageState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', loadError: '' };
    case 'LOAD_SUCCESS': {
      const form = toThemeFormState(action.theme);
      return {
        ...state,
        status: 'ready',
        form,
        original: form,
        previewMenuHref: action.previewMenuHref,
      };
    }
    case 'LOAD_ERROR':
      return { ...state, status: 'error', loadError: action.message };
    case 'UPDATE_FIELD':
      return {
        ...state,
        form: state.form ? { ...state.form, [action.key]: action.value } : state.form,
        fieldErrors: { ...state.fieldErrors, [action.key]: undefined },
        bannerError: '',
        successMessage: '',
      };
    case 'SET_FIELD_ERRORS':
      return { ...state, fieldErrors: action.errors };
    case 'RESET_FORM':
      return {
        ...state,
        form: state.original ? { ...state.original } : state.form,
        fieldErrors: {},
        bannerError: '',
        successMessage: '',
      };
    case 'SAVE_START':
      return { ...state, saving: true, bannerError: '', successMessage: '', fieldErrors: {} };
    case 'SAVE_SUCCESS': {
      const form = toThemeFormState(action.theme);
      return {
        ...state,
        saving: false,
        form,
        original: form,
        successMessage: 'Apariencia guardada correctamente.',
      };
    }
    case 'SAVE_ERROR':
      return { ...state, saving: false, bannerError: action.message };
    case 'PRESET_START':
      return {
        ...state,
        applyingPreset: true,
        presetDialogOpen: false,
        pendingPreset: null,
        bannerError: '',
        successMessage: '',
      };
    case 'PRESET_SUCCESS': {
      const form = toThemeFormState(action.theme);
      return {
        ...state,
        applyingPreset: false,
        form,
        original: form,
        successMessage: 'Preset aplicado correctamente.',
      };
    }
    case 'PRESET_ERROR':
      return { ...state, applyingPreset: false, bannerError: action.message };
    case 'OPEN_PRESET_DIALOG':
      return { ...state, presetDialogOpen: true, pendingPreset: action.preset };
    case 'CLOSE_PRESET_DIALOG':
      return { ...state, presetDialogOpen: false, pendingPreset: null };
    case 'SET_BANNER_ERROR':
      return { ...state, bannerError: action.message };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
