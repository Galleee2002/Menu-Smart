import { useCallback, useEffect, useMemo, useReducer, type FormEvent } from 'react';
import {
  deleteRestaurant,
  getRestaurant,
  updateRestaurant,
} from '../../lib/admin-api';
import { slugify } from '../../lib/slugify';
import { useAdmin } from './AdminContext';
import {
  buildRestaurantPatch,
  initialRestaurantPageState,
  restaurantPageReducer,
  validateRestaurantForm,
  type FieldErrors,
  type FormState,
} from './admin-restaurant-page.state';

export function useAdminRestaurantPage() {
  const { restaurant: contextRestaurant, role, refresh } = useAdmin();
  const isOwner = role === 'OWNER';

  const [state, dispatch] = useReducer(restaurantPageReducer, initialRestaurantPageState);
  const {
    status,
    loadError,
    restaurant,
    form,
    original,
    fieldErrors,
    bannerError,
    successMessage,
    saving,
    deleting,
    deleteDialogOpen,
    copied,
  } = state;

  const loadRestaurant = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });

    const result = await getRestaurant(contextRestaurant.id);

    if (!result.ok) {
      dispatch({ type: 'LOAD_ERROR', message: result.message });
      return;
    }

    dispatch({ type: 'LOAD_SUCCESS', restaurant: result.data });
  }, [contextRestaurant.id]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  const isDirty = useMemo(() => {
    if (!form || !original) {
      return false;
    }

    return buildRestaurantPatch(form, original) !== null;
  }, [form, original]);

  const slugChanged = form && original ? form.slug.trim() !== original.slug : false;
  const publicUrl =
    form && typeof window !== 'undefined'
      ? `${window.location.origin}/menu/${form.slug.trim()}/`
      : `/menu/${form?.slug.trim() ?? ''}/`;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    dispatch({ type: 'UPDATE_FIELD', key, value });
  };

  const handleGenerateSlug = () => {
    if (!form || !isOwner) {
      return;
    }

    const generated = slugify(form.name.trim());

    if (generated) {
      updateField('slug', generated);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      dispatch({ type: 'COPY_SUCCESS' });
      window.setTimeout(() => dispatch({ type: 'COPY_RESET' }), 2000);
    } catch {
      dispatch({ type: 'SET_BANNER_ERROR', message: 'No se pudo copiar la URL.' });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form || !original || !restaurant || !isOwner) {
      return;
    }

    const errors = validateRestaurantForm(form);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_FIELD_ERRORS', errors });
      return;
    }

    const patch = buildRestaurantPatch(form, original);

    if (!patch) {
      return;
    }

    dispatch({ type: 'SAVE_START' });

    const result = await updateRestaurant(restaurant.id, patch);

    if (!result.ok) {
      if (result.message === 'Slug already taken') {
        dispatch({ type: 'SAVE_ERROR_SLUG' });
      } else {
        dispatch({ type: 'SAVE_ERROR', message: result.message });
      }

      return;
    }

    dispatch({ type: 'SAVE_SUCCESS', restaurant: result.data });
    await refresh();
  };

  const handleDelete = async () => {
    if (!restaurant || !isOwner) {
      return;
    }

    dispatch({ type: 'DELETE_START' });

    const result = await deleteRestaurant(restaurant.id);

    if (!result.ok) {
      dispatch({ type: 'DELETE_ERROR', message: result.message });
      return;
    }

    dispatch({ type: 'DELETE_SUCCESS' });
    await refresh();
  };

  return {
    isOwner,
    status,
    loadError,
    restaurant,
    form,
    fieldErrors,
    bannerError,
    successMessage,
    saving,
    deleting,
    deleteDialogOpen,
    copied,
    isDirty,
    slugChanged,
    publicUrl,
    loadRestaurant,
    updateField,
    handleGenerateSlug,
    handleCopyUrl,
    handleSubmit,
    handleDelete,
    dispatch,
  };
}

export type AdminRestaurantPageViewModel = ReturnType<typeof useAdminRestaurantPage>;
