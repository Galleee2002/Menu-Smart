import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useReducer, useRef } from 'react';
import {
  createItem,
  deleteCategory,
  reorderItems,
  updateCategory,
  type Category,
  type MenuItem,
} from '../../../lib/admin-api';
import { AdminConfirmDialog } from '../AdminConfirmDialog';
import formStyles from '../admin-form.module.scss';
import sharedStyles from './admin-menus-shared.module.scss';
import { AdminMenuItemRow } from './AdminMenuItemRow';
import { AdminMenuItemForm } from './AdminMenuItemForm';
import {
  buildItemPayload,
  emptyItemFormState,
  type ItemFormState,
} from './admin-menu-item-form.utils';
import styles from './AdminCategoryBlock.module.scss';

interface AdminCategoryBlockProps {
  category: Category;
  items: MenuItem[];
  categories: Category[];
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCategoryUpdated: (category: Category) => void;
  onCategoryDeleted: (categoryId: string) => void;
  onCategoriesReordered: (categories: Category[]) => void;
  onReorderCategory: (direction: 'up' | 'down') => Promise<Category[] | null>;
  onItemCreated: (item: MenuItem) => void;
  onItemUpdated: (item: MenuItem) => void;
  onItemDeleted: (itemId: string) => void;
  onItemsReordered: (categoryId: string, items: MenuItem[]) => void;
  onError: (message: string) => void;
}

type CategoryBlockState = {
  nameDraft: string | null;
  savingName: boolean;
  reorderingCategory: boolean;
  showAddItem: boolean;
  newItemForm: ItemFormState;
  creatingItem: boolean;
  deleteOpen: boolean;
  deleting: boolean;
};

type CategoryBlockAction =
  | { type: 'reset_name_draft' }
  | { type: 'set_name_draft'; value: string }
  | { type: 'save_name_start' }
  | { type: 'save_name_success'; name: string }
  | { type: 'save_name_end' }
  | { type: 'reorder_category_start' }
  | { type: 'reorder_category_end' }
  | { type: 'show_add_item' }
  | { type: 'hide_add_item'; categoryId: string }
  | { type: 'set_new_item_form'; form: ItemFormState }
  | { type: 'create_item_start' }
  | { type: 'create_item_success'; categoryId: string }
  | { type: 'create_item_end' }
  | { type: 'open_delete' }
  | { type: 'close_delete' }
  | { type: 'delete_start' }
  | { type: 'delete_end' };

function createInitialState(categoryId: string): CategoryBlockState {
  return {
    nameDraft: null,
    savingName: false,
    reorderingCategory: false,
    showAddItem: false,
    newItemForm: emptyItemFormState(categoryId),
    creatingItem: false,
    deleteOpen: false,
    deleting: false,
  };
}

function categoryBlockReducer(
  state: CategoryBlockState,
  action: CategoryBlockAction,
): CategoryBlockState {
  switch (action.type) {
    case 'reset_name_draft':
      return { ...state, nameDraft: null };
    case 'set_name_draft':
      return { ...state, nameDraft: action.value };
    case 'save_name_start':
      return { ...state, savingName: true };
    case 'save_name_success':
      return { ...state, nameDraft: action.name, savingName: false };
    case 'save_name_end':
      return { ...state, savingName: false };
    case 'reorder_category_start':
      return { ...state, reorderingCategory: true };
    case 'reorder_category_end':
      return { ...state, reorderingCategory: false };
    case 'show_add_item':
      return { ...state, showAddItem: true };
    case 'hide_add_item':
      return {
        ...state,
        showAddItem: false,
        newItemForm: emptyItemFormState(action.categoryId),
      };
    case 'set_new_item_form':
      return { ...state, newItemForm: action.form };
    case 'create_item_start':
      return { ...state, creatingItem: true };
    case 'create_item_success':
      return {
        ...state,
        creatingItem: false,
        showAddItem: false,
        newItemForm: emptyItemFormState(action.categoryId),
      };
    case 'create_item_end':
      return { ...state, creatingItem: false };
    case 'open_delete':
      return { ...state, deleteOpen: true };
    case 'close_delete':
      return { ...state, deleteOpen: false, deleting: false };
    case 'delete_start':
      return { ...state, deleting: true };
    case 'delete_end':
      return { ...state, deleting: false };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function AdminCategoryBlock({
  category,
  items,
  categories,
  canEdit,
  isFirst,
  isLast,
  onCategoryUpdated,
  onCategoryDeleted,
  onCategoriesReordered,
  onReorderCategory,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
  onItemsReordered,
  onError,
}: AdminCategoryBlockProps) {
  const [state, dispatch] = useReducer(categoryBlockReducer, category.id, createInitialState);
  const categoryIdRef = useRef(category.id);

  if (category.id !== categoryIdRef.current) {
    categoryIdRef.current = category.id;
    dispatch({ type: 'reset_name_draft' });
  }

  const name = state.nameDraft ?? category.name;
  const sortedItems = items.toSorted((a, b) => a.order - b.order);

  const handleSaveName = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      onError('El nombre de la categoría debe tener entre 1 y 100 caracteres.');
      dispatch({ type: 'reset_name_draft' });
      return;
    }

    if (trimmedName === category.name) {
      dispatch({ type: 'reset_name_draft' });
      return;
    }

    dispatch({ type: 'save_name_start' });

    const result = await updateCategory(category.id, { name: trimmedName });

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'reset_name_draft' });
      dispatch({ type: 'save_name_end' });
      return;
    }

    dispatch({ type: 'save_name_success', name: result.data.name });
    onCategoryUpdated(result.data);
  };

  const handleReorderCategory = async (direction: 'up' | 'down') => {
    dispatch({ type: 'reorder_category_start' });

    const result = await onReorderCategory(direction);

    if (result) {
      onCategoriesReordered(result);
    }

    dispatch({ type: 'reorder_category_end' });
  };

  const handleDeleteCategory = async () => {
    dispatch({ type: 'delete_start' });

    const result = await deleteCategory(category.id);

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'close_delete' });
      return;
    }

    dispatch({ type: 'close_delete' });
    onCategoryDeleted(category.id);
  };

  const handleCreateItem = async () => {
    dispatch({ type: 'create_item_start' });

    const payload = buildItemPayload(state.newItemForm);
    const result = await createItem(payload);

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'create_item_end' });
      return;
    }

    dispatch({ type: 'create_item_success', categoryId: category.id });
    onItemCreated(result.data);
  };

  const handleItemReorder = async (itemId: string, direction: 'up' | 'down') => {
    const index = sortedItems.findIndex((item) => item.id === itemId);

    if (index === -1) {
      return null;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedItems.length) {
      return null;
    }

    const reordered = [...sortedItems];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const payload = {
      categoryId: category.id,
      items: reordered.map((item, order) => ({ id: item.id, order })),
    };

    const result = await reorderItems(payload);

    if (!result.ok) {
      onError(result.message);
      return null;
    }

    return result.data;
  };

  return (
    <section className={styles.block} aria-labelledby={`category-${category.id}`}>
      <header className={styles.header}>
        <div className={styles.nameField}>
          <label className={styles.srOnly} htmlFor={`category-name-${category.id}`}>
            Nombre de categoría
          </label>
          <input
            id={`category-name-${category.id}`}
            className={styles.categoryName}
            type="text"
            value={name}
            aria-label="Nombre de categoría"
            readOnly={!canEdit}
            disabled={state.savingName}
            onChange={(event) => dispatch({ type: 'set_name_draft', value: event.target.value })}
            onBlur={() => void handleSaveName()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSaveName();
              }
            }}
          />
        </div>

        {canEdit ? (
          <div className={sharedStyles.rowActions}>
            <button
              type="button"
              className={sharedStyles.iconButton}
              aria-label="Subir categoría"
              disabled={isFirst || state.reorderingCategory}
              onClick={() => void handleReorderCategory('up')}
            >
              <ChevronUp size={16} strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              className={sharedStyles.iconButton}
              aria-label="Bajar categoría"
              disabled={isLast || state.reorderingCategory}
              onClick={() => void handleReorderCategory('down')}
            >
              <ChevronDown size={16} strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              className={sharedStyles.iconButtonDanger}
              aria-label="Eliminar categoría"
              onClick={() => dispatch({ type: 'open_delete' })}
            >
              <Trash2 size={14} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        ) : null}
      </header>

      <div className={styles.items}>
        {sortedItems.length === 0 ? (
          <p className={styles.emptyItems}>Sin productos en esta sección.</p>
        ) : (
          sortedItems.map((item, index) => (
            <AdminMenuItemRow
              key={item.id}
              item={item}
              categories={categories}
              canEdit={canEdit}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
              onUpdated={onItemUpdated}
              onDeleted={onItemDeleted}
              onReordered={(nextItems) => onItemsReordered(category.id, nextItems)}
              onReorder={(direction) => handleItemReorder(item.id, direction)}
              onError={onError}
            />
          ))
        )}
      </div>

      {canEdit ? (
        <div className={styles.footer}>
          {state.showAddItem ? (
            <AdminMenuItemForm
              form={state.newItemForm}
              categories={categories}
              canEdit={canEdit}
              saving={state.creatingItem}
              submitLabel="Añadir producto"
              onChange={(form) => dispatch({ type: 'set_new_item_form', form })}
              onSubmit={() => void handleCreateItem()}
              onCancel={() => dispatch({ type: 'hide_add_item', categoryId: category.id })}
            />
          ) : (
            <button
              type="button"
              className={formStyles.secondaryButton}
              onClick={() => dispatch({ type: 'show_add_item' })}
            >
              <Plus size={14} strokeWidth={2.25} aria-hidden />
              Añadir producto
            </button>
          )}
        </div>
      ) : null}

      <AdminConfirmDialog
        open={state.deleteOpen}
        title="Eliminar categoría"
        description={`Se eliminará "${category.name}" y todos sus productos.`}
        confirmLabel="Eliminar"
        loading={state.deleting}
        onCancel={() => dispatch({ type: 'close_delete' })}
        onConfirm={() => void handleDeleteCategory()}
      />
    </section>
  );
}
