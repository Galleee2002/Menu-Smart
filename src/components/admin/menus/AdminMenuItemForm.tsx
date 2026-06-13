import { useMemo, useState, type FormEvent } from 'react';
import type { Category } from '../../../lib/admin-api';
import { AdminToggle } from '../AdminToggle';
import formStyles from '../admin-form.module.scss';
import {
  buildItemPatch,
  parseAllergensForPreview,
  validateItemForm,
  type ItemFormState,
} from './admin-menu-item-form.utils';
import sharedStyles from './admin-menus-shared.module.scss';
import styles from './AdminMenuItemForm.module.scss';

interface AdminMenuItemFormProps {
  form: ItemFormState;
  original?: ItemFormState;
  categories: Category[];
  canEdit: boolean;
  saving?: boolean;
  submitLabel: string;
  onChange: (form: ItemFormState) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function AdminMenuItemForm({
  form,
  original,
  categories,
  canEdit,
  saving = false,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: AdminMenuItemFormProps) {
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ItemFormState, string>>
  >({});

  const isDirty = useMemo(() => {
    if (!original) {
      return form.name.trim().length > 0 || form.price.trim().length > 0;
    }

    return buildItemPatch(form, original) !== null;
  }, [form, original]);

  const allergenPreview = parseAllergensForPreview(form.allergens);

  const updateField = <K extends keyof ItemFormState>(key: K, value: ItemFormState[K]) => {
    onChange({ ...form, [key]: value });
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const errors = validateItemForm(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="item-name">
            Nombre
          </label>
          <input
            id="item-name"
            className={formStyles.input}
            type="text"
            value={form.name}
            readOnly={!canEdit}
            disabled={saving}
            onChange={(event) => updateField('name', event.target.value)}
          />
          {fieldErrors.name ? (
            <p className={formStyles.error} role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="item-price">
            Precio (€)
          </label>
          <input
            id="item-price"
            className={formStyles.input}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            readOnly={!canEdit}
            disabled={saving}
            onChange={(event) => updateField('price', event.target.value)}
          />
          {fieldErrors.price ? (
            <p className={formStyles.error} role="alert">
              {fieldErrors.price}
            </p>
          ) : null}
        </div>
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="item-description">
          Descripción
        </label>
        <textarea
          id="item-description"
          className={formStyles.textarea}
          value={form.description}
          readOnly={!canEdit}
          disabled={saving}
          placeholder="Ingredientes, notas…"
          onChange={(event) => updateField('description', event.target.value)}
        />
        <p className={formStyles.hint}>{form.description.length}/1000</p>
        {fieldErrors.description ? (
          <p className={formStyles.error} role="alert">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="item-category">
          Categoría
        </label>
        <select
          id="item-category"
          className={formStyles.input}
          value={form.categoryId}
          disabled={!canEdit || saving}
          onChange={(event) => updateField('categoryId', event.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId ? (
          <p className={formStyles.error} role="alert">
            {fieldErrors.categoryId}
          </p>
        ) : null}
      </div>

      <div className={formStyles.field}>
        <label className={formStyles.label} htmlFor="item-allergens">
          Alérgenos
        </label>
        <input
          id="item-allergens"
          className={formStyles.input}
          type="text"
          value={form.allergens}
          readOnly={!canEdit}
          disabled={saving}
          placeholder="gluten, lactosa, frutos secos"
          onChange={(event) => updateField('allergens', event.target.value)}
        />
        <p className={formStyles.hint}>Separa con comas. Máx. 50 caracteres por alérgeno.</p>
        {allergenPreview.length > 0 ? (
          <div className={sharedStyles.allergenChips}>
            {allergenPreview.map((allergen) => (
              <span key={allergen} className={sharedStyles.allergenChip}>
                {allergen}
              </span>
            ))}
          </div>
        ) : null}
        {fieldErrors.allergens ? (
          <p className={formStyles.error} role="alert">
            {fieldErrors.allergens}
          </p>
        ) : null}
      </div>

      <div className={styles.toggles}>
        <AdminToggle
          id={`item-available-${form.categoryId}`}
          checked={form.isAvailable}
          disabled={!canEdit || saving}
          label="Disponible en carta"
          description={
            form.isAvailable
              ? 'Los clientes pueden ver y pedir este plato.'
              : 'Oculto para los clientes.'
          }
          onChange={(checked) => updateField('isAvailable', checked)}
        />
        <AdminToggle
          id={`item-featured-${form.categoryId}`}
          checked={form.isFeatured}
          disabled={!canEdit || saving}
          label="Destacado"
          description="Aparece resaltado en la carta pública."
          onChange={(checked) => updateField('isFeatured', checked)}
        />
      </div>

      {canEdit ? (
        <div className={styles.actions}>
          {onCancel ? (
            <button
              type="button"
              className={formStyles.secondaryButton}
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </button>
          ) : null}
          <button className={formStyles.submit} type="submit" disabled={!isDirty || saving}>
            {saving ? 'Guardando…' : submitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
