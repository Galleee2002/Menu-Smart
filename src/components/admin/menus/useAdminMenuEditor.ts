import { useMemo, useReducer, useRef, type FormEvent } from 'react';
import {
  bulkPricing,
  createCategory,
  deleteMenu,
  reorderCategories,
  updateMenu,
  type Category,
  type Menu,
  type MenuItem,
} from '../../../lib/admin-api';
import { slugify } from '../../../lib/slugify';
import {
  buildMenuPatch,
  createInitialMenuEditorState,
  menuEditorReducer,
  toMenuFormState,
  validateMenuForm,
  type MenuFormState,
} from './admin-menu-editor.state';

interface UseAdminMenuEditorOptions {
  menu: Menu;
  restaurantSlug: string;
  categories: Category[];
  items: MenuItem[];
  canEdit: boolean;
  isOwner: boolean;
  onMenuUpdated: (menu: Menu) => void;
  onMenuDeleted: () => void;
  onCategoriesChange: (categories: Category[]) => void;
  onItemsChange: (items: MenuItem[]) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onRefreshPreview: () => Promise<void>;
  onReloadMenuData: () => Promise<void>;
}

export function useAdminMenuEditor({
  menu,
  restaurantSlug,
  categories,
  items,
  canEdit,
  isOwner,
  onMenuUpdated,
  onMenuDeleted,
  onCategoriesChange,
  onItemsChange,
  onSuccess,
  onError,
  onRefreshPreview,
  onReloadMenuData,
}: UseAdminMenuEditorOptions) {
  const [state, dispatch] = useReducer(menuEditorReducer, menu, createInitialMenuEditorState);

  const {
    form,
    original,
    fieldErrors,
    saving,
    newCategoryName,
    creatingCategory,
    deleteOpen,
    deleting,
    bulkOpen,
    bulkLoading,
  } = state;
  const prevMenuIdRef = useRef(menu.id);

  if (menu.id !== prevMenuIdRef.current) {
    prevMenuIdRef.current = menu.id;
    dispatch({ type: 'RESET_FOR_MENU', payload: toMenuFormState(menu) });
  }

  const sortedCategories = useMemo(
    () => categories.toSorted((a, b) => a.order - b.order),
    [categories],
  );

  const isDirty = useMemo(() => buildMenuPatch(form, original) !== null, [form, original]);

  const previewHref = `/menu/${restaurantSlug}/${form.slug.trim()}`;

  const updateField = <K extends keyof MenuFormState>(key: K, value: MenuFormState[K]) => {
    dispatch({ type: 'SET_FIELD', payload: { key, value } });
  };

  const handleGenerateSlug = () => {
    if (!canEdit) {
      return;
    }

    const generated = slugify(form.name.trim());

    if (generated) {
      updateField('slug', generated);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const errors = validateMenuForm(form);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SAVE_ERROR', payload: errors });
      return;
    }

    const patch = buildMenuPatch(form, original);

    if (!patch) {
      return;
    }

    dispatch({ type: 'SAVE_START' });

    const result = await updateMenu(menu.id, patch);

    if (!result.ok) {
      if (result.message === 'Slug already taken') {
        dispatch({ type: 'SAVE_ERROR', payload: { slug: 'Este slug ya está en uso.' } });
      } else {
        onError(result.message);
        dispatch({ type: 'SAVE_ABORT' });
      }

      return;
    }

    const nextForm = toMenuFormState(result.data);
    dispatch({ type: 'SAVE_SUCCESS', payload: nextForm });
    onMenuUpdated(result.data);
    onSuccess('Menú actualizado correctamente.');

    if ('isPublished' in patch) {
      await onRefreshPreview();
    }
  };

  const handleDeleteMenu = async () => {
    if (!isOwner) {
      return;
    }

    dispatch({ type: 'DELETE_START' });

    const result = await deleteMenu(menu.id);

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'DELETE_ERROR' });
      return;
    }

    dispatch({ type: 'DELETE_SUCCESS' });
    onMenuDeleted();
    await onRefreshPreview();
  };

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCategoryName.trim();

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      onError('El nombre de la categoría debe tener entre 1 y 100 caracteres.');
      return;
    }

    dispatch({ type: 'CREATE_CATEGORY_START' });

    const result = await createCategory({ menuId: menu.id, name: trimmedName });

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'CREATE_CATEGORY_ERROR' });
      return;
    }

    dispatch({ type: 'CREATE_CATEGORY_SUCCESS' });
    onCategoriesChange([...categories, result.data]);
    onSuccess('Categoría creada.');
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const index = sortedCategories.findIndex((category) => category.id === categoryId);

    if (index === -1) {
      return null;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedCategories.length) {
      return null;
    }

    const reordered = [...sortedCategories];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const result = await reorderCategories({
      menuId: menu.id,
      items: reordered.map((category, order) => ({ id: category.id, order })),
    });

    if (!result.ok) {
      onError(result.message);
      return null;
    }

    return result.data;
  };

  const handleBulkPricing = async (mode: 'percentage' | 'fixed', value: number) => {
    dispatch({ type: 'BULK_PRICING_START' });

    const result = await bulkPricing({
      scope: 'menu',
      mode,
      value,
      menuId: menu.id,
    });

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'BULK_PRICING_ERROR' });
      return;
    }

    dispatch({ type: 'BULK_PRICING_SUCCESS' });
    await onReloadMenuData();
    onSuccess(`Precios actualizados en ${result.data.updatedCount} productos.`);
  };

  const getItemsForCategory = (categoryId: string) =>
    items.filter((item) => item.categoryId === categoryId);

  return {
    form,
    fieldErrors,
    saving,
    newCategoryName,
    creatingCategory,
    deleteOpen,
    deleting,
    bulkOpen,
    bulkLoading,
    sortedCategories,
    isDirty,
    previewHref,
    canEdit,
    isOwner,
    categories,
    items,
    dispatch,
    updateField,
    handleGenerateSlug,
    handleSubmit,
    handleDeleteMenu,
    handleCreateCategory,
    handleReorderCategory,
    handleBulkPricing,
    getItemsForCategory,
    onCategoriesChange,
    onItemsChange,
    onError,
  };
}

export type AdminMenuEditorViewModel = ReturnType<typeof useAdminMenuEditor>;
