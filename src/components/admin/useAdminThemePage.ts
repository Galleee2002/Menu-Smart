import { useCallback, useEffect, useMemo, useReducer, type FormEvent } from 'react';
import {
  applyThemePreset,
  getTheme,
  listMenus,
  updateTheme,
  type ThemePresetId,
} from '../../lib/admin-api';
import { detectThemePreset, isThemePresetId } from '../../lib/theme-presets';
import { useAdmin } from './AdminContext';
import {
  buildThemePatch,
  initialThemePageState,
  themePageReducer,
  validateThemeForm,
  type ThemeFieldKey,
} from './admin-theme-page.state';

export type AdminThemePageViewModel = ReturnType<typeof useAdminThemePage>;

export function useAdminThemePage() {
  const { restaurant, role, refresh } = useAdmin();
  const isOwner = role === 'OWNER';

  const [state, dispatch] = useReducer(themePageReducer, initialThemePageState);
  const {
    status,
    loadError,
    form,
    original,
    fieldErrors,
    bannerError,
    successMessage,
    saving,
    applyingPreset,
    presetDialogOpen,
    pendingPreset,
    previewMenuHref,
  } = state;

  const loadTheme = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });

    const [themeResult, menusResult] = await Promise.all([
      getTheme(restaurant.id),
      listMenus(),
    ]);

    if (!themeResult.ok) {
      dispatch({ type: 'LOAD_ERROR', message: themeResult.message });
      return;
    }

    const publishedMenu = menusResult.ok
      ? menusResult.data.find((menu) => menu.isPublished)
      : undefined;

    const previewMenuHref = publishedMenu
      ? `/menu/${restaurant.slug}/${publishedMenu.slug}`
      : null;

    dispatch({
      type: 'LOAD_SUCCESS',
      theme: themeResult.data,
      previewMenuHref,
    });
  }, [restaurant.id, restaurant.slug]);

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  const isDirty = useMemo(() => {
    if (!form || !original) {
      return false;
    }

    return buildThemePatch(form, original) !== null;
  }, [form, original]);

  const activePreset = useMemo(() => {
    if (!form) {
      return null;
    }

    return detectThemePreset(form);
  }, [form]);

  const updateField = (key: ThemeFieldKey, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', key, value });
  };

  const handleDiscard = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOwner || !form || !original) {
      return;
    }

    const errors = validateThemeForm(form);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_FIELD_ERRORS', errors });
      return;
    }

    const patch = buildThemePatch(form, original);

    if (!patch) {
      return;
    }

    dispatch({ type: 'SAVE_START' });

    const result = await updateTheme(restaurant.id, patch);

    if (!result.ok) {
      dispatch({ type: 'SAVE_ERROR', message: result.message });
      return;
    }

    dispatch({ type: 'SAVE_SUCCESS', theme: result.data });
    await refresh();
  };

  const applyPreset = async (presetId: ThemePresetId) => {
    dispatch({ type: 'PRESET_START' });

    const result = await applyThemePreset(restaurant.id, presetId);

    if (!result.ok) {
      dispatch({ type: 'PRESET_ERROR', message: result.message });
      return;
    }

    dispatch({ type: 'PRESET_SUCCESS', theme: result.data });
    await refresh();
  };

  const handlePresetSelect = (presetId: string) => {
    if (!isOwner || applyingPreset || saving) {
      return;
    }

    if (!isThemePresetId(presetId)) {
      return;
    }

    if (activePreset === presetId) {
      return;
    }

    if (isDirty) {
      dispatch({ type: 'OPEN_PRESET_DIALOG', preset: presetId });
      return;
    }

    void applyPreset(presetId);
  };

  const handleConfirmPreset = () => {
    if (!pendingPreset || !isThemePresetId(pendingPreset)) {
      dispatch({ type: 'CLOSE_PRESET_DIALOG' });
      return;
    }

    void applyPreset(pendingPreset);
  };

  return {
    status,
    loadError,
    form,
    original,
    fieldErrors,
    bannerError,
    successMessage,
    saving,
    applyingPreset,
    presetDialogOpen,
    pendingPreset,
    previewMenuHref,
    isOwner,
    isDirty,
    activePreset,
    restaurantName: restaurant.name,
    loadTheme,
    updateField,
    handleDiscard,
    handleSubmit,
    handlePresetSelect,
    handleConfirmPreset,
    dispatch,
  };
}
