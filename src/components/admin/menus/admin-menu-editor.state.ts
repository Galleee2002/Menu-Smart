import type { Menu } from '../../../lib/admin-api';
import { isValidSlug } from '../../../lib/slugify';

export type MenuFormState = {
  name: string;
  slug: string;
  isPublished: boolean;
};

export type MenuFieldErrors = Partial<Record<keyof MenuFormState, string>>;

export type MenuEditorState = {
  form: MenuFormState;
  original: MenuFormState;
  fieldErrors: MenuFieldErrors;
  saving: boolean;
  newCategoryName: string;
  creatingCategory: boolean;
  deleteOpen: boolean;
  deleting: boolean;
  bulkOpen: boolean;
  bulkLoading: boolean;
};

export type MenuEditorAction =
  | { type: 'RESET_FOR_MENU'; payload: MenuFormState }
  | { type: 'SET_FIELD'; payload: { key: keyof MenuFormState; value: MenuFormState[keyof MenuFormState] } }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_ABORT' }
  | { type: 'SAVE_ERROR'; payload: MenuFieldErrors }
  | { type: 'SAVE_SUCCESS'; payload: MenuFormState }
  | { type: 'SET_NEW_CATEGORY_NAME'; payload: string }
  | { type: 'CREATE_CATEGORY_START' }
  | { type: 'CREATE_CATEGORY_ERROR' }
  | { type: 'CREATE_CATEGORY_SUCCESS' }
  | { type: 'SET_DELETE_OPEN'; payload: boolean }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_ERROR' }
  | { type: 'DELETE_SUCCESS' }
  | { type: 'SET_BULK_OPEN'; payload: boolean }
  | { type: 'BULK_PRICING_START' }
  | { type: 'BULK_PRICING_ERROR' }
  | { type: 'BULK_PRICING_SUCCESS' };

export function menuEditorReducer(state: MenuEditorState, action: MenuEditorAction): MenuEditorState {
  switch (action.type) {
    case 'RESET_FOR_MENU':
      return { ...state, form: action.payload, original: action.payload, fieldErrors: {} };
    case 'SET_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.payload.key]: action.payload.value },
        fieldErrors: { ...state.fieldErrors, [action.payload.key]: undefined },
      };
    case 'SAVE_START':
      return { ...state, saving: true };
    case 'SAVE_ABORT':
      return { ...state, saving: false };
    case 'SAVE_ERROR':
      return { ...state, saving: false, fieldErrors: action.payload };
    case 'SAVE_SUCCESS':
      return { ...state, saving: false, form: action.payload, original: action.payload };
    case 'SET_NEW_CATEGORY_NAME':
      return { ...state, newCategoryName: action.payload };
    case 'CREATE_CATEGORY_START':
      return { ...state, creatingCategory: true };
    case 'CREATE_CATEGORY_ERROR':
      return { ...state, creatingCategory: false };
    case 'CREATE_CATEGORY_SUCCESS':
      return { ...state, creatingCategory: false, newCategoryName: '' };
    case 'SET_DELETE_OPEN':
      return { ...state, deleteOpen: action.payload };
    case 'DELETE_START':
      return { ...state, deleting: true };
    case 'DELETE_ERROR':
      return { ...state, deleting: false, deleteOpen: false };
    case 'DELETE_SUCCESS':
      return { ...state, deleting: false, deleteOpen: false };
    case 'SET_BULK_OPEN':
      return { ...state, bulkOpen: action.payload };
    case 'BULK_PRICING_START':
      return { ...state, bulkLoading: true };
    case 'BULK_PRICING_ERROR':
      return { ...state, bulkLoading: false };
    case 'BULK_PRICING_SUCCESS':
      return { ...state, bulkLoading: false, bulkOpen: false };
    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}

export function toMenuFormState(menu: Menu): MenuFormState {
  return {
    name: menu.name,
    slug: menu.slug,
    isPublished: menu.isPublished,
  };
}

export function buildMenuPatch(
  form: MenuFormState,
  original: MenuFormState,
): Record<string, string | boolean> | null {
  const patch: Record<string, string | boolean> = {};
  const trimmedName = form.name.trim();
  const trimmedSlug = form.slug.trim();

  if (trimmedName !== original.name) {
    patch.name = trimmedName;
  }

  if (trimmedSlug !== original.slug) {
    patch.slug = trimmedSlug;
  }

  if (form.isPublished !== original.isPublished) {
    patch.isPublished = form.isPublished;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function validateMenuForm(form: MenuFormState): MenuFieldErrors {
  const errors: MenuFieldErrors = {};
  const trimmedName = form.name.trim();
  const trimmedSlug = form.slug.trim();

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = 'El nombre debe tener entre 2 y 100 caracteres.';
  }

  if (!isValidSlug(trimmedSlug)) {
    errors.slug = 'Solo letras minúsculas, números y guiones.';
  }

  return errors;
}

export function createInitialMenuEditorState(menu: Menu): MenuEditorState {
  const initialForm = toMenuFormState(menu);

  return {
    form: initialForm,
    original: initialForm,
    fieldErrors: {},
    saving: false,
    newCategoryName: '',
    creatingCategory: false,
    deleteOpen: false,
    deleting: false,
    bulkOpen: false,
    bulkLoading: false,
  };
}
