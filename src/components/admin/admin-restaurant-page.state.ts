import type { Restaurant } from '../../lib/admin-api';
import { isValidSlug } from '../../lib/slugify';

export type FormState = {
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
};

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export type PageStatus = 'loading' | 'error' | 'ready';

export type RestaurantPageState = {
  status: PageStatus;
  loadError: string;
  restaurant: Restaurant | null;
  form: FormState | null;
  original: FormState | null;
  fieldErrors: FieldErrors;
  bannerError: string;
  successMessage: string;
  saving: boolean;
  deleting: boolean;
  deleteDialogOpen: boolean;
  copied: boolean;
};

export type RestaurantPageAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; restaurant: Restaurant }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'UPDATE_FIELD'; key: keyof FormState; value: FormState[keyof FormState] }
  | { type: 'SET_FIELD_ERRORS'; errors: FieldErrors }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; restaurant: Restaurant }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'SAVE_ERROR_SLUG' }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_ERROR'; message: string }
  | { type: 'DELETE_SUCCESS' }
  | { type: 'OPEN_DELETE_DIALOG' }
  | { type: 'CLOSE_DELETE_DIALOG' }
  | { type: 'COPY_SUCCESS' }
  | { type: 'COPY_RESET' }
  | { type: 'SET_BANNER_ERROR'; message: string };

export const initialRestaurantPageState: RestaurantPageState = {
  status: 'loading',
  loadError: '',
  restaurant: null,
  form: null,
  original: null,
  fieldErrors: {},
  bannerError: '',
  successMessage: '',
  saving: false,
  deleting: false,
  deleteDialogOpen: false,
  copied: false,
};

function toFormState(restaurant: Restaurant): FormState {
  return {
    name: restaurant.name,
    description: restaurant.description ?? '',
    slug: restaurant.slug,
    isActive: restaurant.isActive,
  };
}

export function formatRestaurantDate(value: string): string {
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function buildRestaurantPatch(
  form: FormState,
  original: FormState,
): Record<string, string | boolean> | null {
  const patch: Record<string, string | boolean> = {};

  const trimmedName = form.name.trim();
  const trimmedDescription = form.description.trim();
  const trimmedSlug = form.slug.trim();

  if (trimmedName !== original.name) {
    patch.name = trimmedName;
  }

  if (trimmedDescription !== original.description) {
    patch.description = trimmedDescription;
  }

  if (trimmedSlug !== original.slug) {
    patch.slug = trimmedSlug;
  }

  if (form.isActive !== original.isActive) {
    patch.isActive = form.isActive;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function validateRestaurantForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = form.name.trim();
  const trimmedDescription = form.description.trim();
  const trimmedSlug = form.slug.trim();

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = 'El nombre debe tener entre 2 y 100 caracteres.';
  }

  if (trimmedDescription.length > 500) {
    errors.description = 'La descripción no puede superar 500 caracteres.';
  }

  if (!isValidSlug(trimmedSlug)) {
    errors.slug = 'Solo letras minúsculas, números y guiones.';
  }

  return errors;
}

export function restaurantPageReducer(
  state: RestaurantPageState,
  action: RestaurantPageAction,
): RestaurantPageState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', loadError: '' };
    case 'LOAD_SUCCESS': {
      const form = toFormState(action.restaurant);
      return { ...state, status: 'ready', restaurant: action.restaurant, form, original: form };
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
    case 'SAVE_START':
      return { ...state, saving: true, bannerError: '', successMessage: '', fieldErrors: {} };
    case 'SAVE_SUCCESS': {
      const form = toFormState(action.restaurant);
      return {
        ...state,
        saving: false,
        restaurant: action.restaurant,
        form,
        original: form,
        successMessage: 'Cambios guardados correctamente.',
      };
    }
    case 'SAVE_ERROR':
      return { ...state, saving: false, bannerError: action.message };
    case 'SAVE_ERROR_SLUG':
      return { ...state, saving: false, fieldErrors: { slug: 'Este slug ya está en uso.' } };
    case 'DELETE_START':
      return { ...state, deleting: true, bannerError: '' };
    case 'DELETE_ERROR':
      return { ...state, deleting: false, deleteDialogOpen: false, bannerError: action.message };
    case 'DELETE_SUCCESS':
      return { ...state, deleteDialogOpen: false };
    case 'OPEN_DELETE_DIALOG':
      return { ...state, deleteDialogOpen: true };
    case 'CLOSE_DELETE_DIALOG':
      return { ...state, deleteDialogOpen: false };
    case 'COPY_SUCCESS':
      return { ...state, copied: true };
    case 'COPY_RESET':
      return { ...state, copied: false };
    case 'SET_BANNER_ERROR':
      return { ...state, bannerError: action.message };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
