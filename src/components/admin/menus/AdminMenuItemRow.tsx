import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useReducer, useRef } from 'react';
import {
  deleteItem,
  updateItem,
  type Category,
  type MenuItem,
} from '../../../lib/admin-api';
import { formatMenuPrice } from '../../../lib/currency';
import {
  buildItemPatch,
  toItemFormState,
  type ItemFormState,
} from './admin-menu-item-form.utils';
import styles from './AdminMenuItemRow.module.scss';
import { AdminConfirmDialog } from '../AdminConfirmDialog';
import sharedStyles from './admin-menus-shared.module.scss';
import { AdminMenuItemForm } from './AdminMenuItemForm';

interface AdminMenuItemRowProps {
  item: MenuItem;
  categories: Category[];
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUpdated: (item: MenuItem) => void;
  onDeleted: (itemId: string) => void;
  onReordered: (items: MenuItem[]) => void;
  onReorder: (direction: 'up' | 'down') => Promise<MenuItem[] | null>;
  onError: (message: string) => void;
}

type ItemRowState = {
  editing: boolean;
  form: ItemFormState;
  original: ItemFormState;
  saving: boolean;
  reordering: boolean;
  deleteOpen: boolean;
  deleting: boolean;
};

type ItemRowAction =
  | { type: 'reset_for_item'; item: MenuItem }
  | { type: 'start_editing' }
  | { type: 'cancel_editing' }
  | { type: 'set_form'; form: ItemFormState }
  | { type: 'save_start' }
  | { type: 'save_success'; item: MenuItem }
  | { type: 'save_end' }
  | { type: 'reorder_start' }
  | { type: 'reorder_end' }
  | { type: 'open_delete' }
  | { type: 'close_delete' }
  | { type: 'delete_start' }
  | { type: 'delete_end' };

function createItemRowState(item: MenuItem): ItemRowState {
  const formState = toItemFormState(item);

  return {
    editing: false,
    form: formState,
    original: formState,
    saving: false,
    reordering: false,
    deleteOpen: false,
    deleting: false,
  };
}

function itemRowReducer(state: ItemRowState, action: ItemRowAction): ItemRowState {
  switch (action.type) {
    case 'reset_for_item': {
      const next = createItemRowState(action.item);
      return { ...next, editing: state.editing };
    }
    case 'start_editing':
      return { ...state, editing: true };
    case 'cancel_editing':
      return { ...state, editing: false, form: state.original };
    case 'set_form':
      return { ...state, form: action.form };
    case 'save_start':
      return { ...state, saving: true };
    case 'save_success': {
      const nextForm = toItemFormState(action.item);
      return {
        ...state,
        form: nextForm,
        original: nextForm,
        editing: false,
        saving: false,
      };
    }
    case 'save_end':
      return { ...state, saving: false };
    case 'reorder_start':
      return { ...state, reordering: true };
    case 'reorder_end':
      return { ...state, reordering: false };
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

export function AdminMenuItemRow({
  item,
  categories,
  canEdit,
  isFirst,
  isLast,
  onUpdated,
  onDeleted,
  onReordered,
  onReorder,
  onError,
}: AdminMenuItemRowProps) {
  const [state, dispatch] = useReducer(itemRowReducer, item, createItemRowState);
  const itemIdRef = useRef(item.id);

  if (item.id !== itemIdRef.current) {
    itemIdRef.current = item.id;
    dispatch({ type: 'reset_for_item', item });
  }

  const handleSave = async () => {
    const patch = buildItemPatch(state.form, state.original);

    if (!patch) {
      dispatch({ type: 'cancel_editing' });
      return;
    }

    dispatch({ type: 'save_start' });

    const result = await updateItem(item.id, patch);

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'save_end' });
      return;
    }

    dispatch({ type: 'save_success', item: result.data });
    onUpdated(result.data);
  };

  const handleDelete = async () => {
    dispatch({ type: 'delete_start' });

    const result = await deleteItem(item.id);

    if (!result.ok) {
      onError(result.message);
      dispatch({ type: 'close_delete' });
      return;
    }

    dispatch({ type: 'close_delete' });
    onDeleted(item.id);
  };

  const handleReorder = async (direction: 'up' | 'down') => {
    dispatch({ type: 'reorder_start' });

    const result = await onReorder(direction);

    if (result) {
      onReordered(result);
    }

    dispatch({ type: 'reorder_end' });
  };

  if (state.editing) {
    return (
      <div className={styles.rowEditing}>
        <AdminMenuItemForm
          form={state.form}
          original={state.original}
          categories={categories}
          canEdit={canEdit}
          saving={state.saving}
          submitLabel="Guardar producto"
          onChange={(form) => dispatch({ type: 'set_form', form })}
          onSubmit={() => void handleSave()}
          onCancel={() => dispatch({ type: 'cancel_editing' })}
        />
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <div className={sharedStyles.menuLine}>
        <div className={sharedStyles.menuLineContent}>
          <div className={sharedStyles.menuLineMeta}>
            <p className={sharedStyles.menuLineName}>{item.name}</p>
            {item.isFeatured ? (
              <span className={sharedStyles.badgeFeatured}>Destacado</span>
            ) : null}
            {!item.isAvailable ? (
              <span className={sharedStyles.badgeUnavailable}>No disponible</span>
            ) : null}
          </div>
          {item.description ? (
            <p className={sharedStyles.menuLineDescription}>{item.description}</p>
          ) : null}
          {item.allergens.length > 0 ? (
            <div className={sharedStyles.allergenChips}>
              {item.allergens.map((allergen) => (
                <span key={allergen} className={sharedStyles.allergenChip}>
                  {allergen}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <span className={sharedStyles.price}>{formatMenuPrice(item.price)}</span>
      </div>

      {canEdit ? (
        <div className={sharedStyles.rowActions}>
          <button
            type="button"
            className={sharedStyles.iconButton}
            aria-label="Subir producto"
            disabled={isFirst || state.reordering}
            onClick={() => void handleReorder('up')}
          >
            <ChevronUp size={16} strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            className={sharedStyles.iconButton}
            aria-label="Bajar producto"
            disabled={isLast || state.reordering}
            onClick={() => void handleReorder('down')}
          >
            <ChevronDown size={16} strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            className={sharedStyles.iconButton}
            aria-label="Editar producto"
            onClick={() => dispatch({ type: 'start_editing' })}
          >
            <Pencil size={14} strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            className={sharedStyles.iconButtonDanger}
            aria-label="Eliminar producto"
            onClick={() => dispatch({ type: 'open_delete' })}
          >
            <Trash2 size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      ) : null}

      <AdminConfirmDialog
        open={state.deleteOpen}
        title="Eliminar producto"
        description={`Se eliminará "${item.name}" de la carta.`}
        confirmLabel="Eliminar"
        loading={state.deleting}
        onCancel={() => dispatch({ type: 'close_delete' })}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
