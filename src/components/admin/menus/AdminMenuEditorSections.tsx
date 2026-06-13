import { Percent, Trash2 } from 'lucide-react';
import type { Menu } from '../../../lib/admin-api';
import { AdminConfirmDialog } from '../AdminConfirmDialog';
import { AdminToggle } from '../AdminToggle';
import formStyles from '../admin-form.module.scss';
import { AdminBulkPricingDialog } from './AdminBulkPricingDialog';
import { AdminCategoryBlock } from './AdminCategoryBlock';
import styles from './AdminMenuEditor.module.scss';
import type { AdminMenuEditorViewModel } from './useAdminMenuEditor';

interface AdminMenuEditorToolbarProps {
  menuName: string;
  canEdit: boolean;
  onOpenBulkPricing: () => void;
}

function AdminMenuEditorToolbar({ menuName, canEdit, onOpenBulkPricing }: AdminMenuEditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <h2 className={styles.editorTitle}>{menuName}</h2>
      {canEdit ? (
        <button
          type="button"
          className={formStyles.secondaryButton}
          onClick={onOpenBulkPricing}
        >
          <Percent size={14} strokeWidth={2.25} aria-hidden />
          Ajuste de precios
        </button>
      ) : null}
    </div>
  );
}

interface AdminMenuEditorSettingsFormProps {
  viewModel: AdminMenuEditorViewModel;
}

function AdminMenuEditorSettingsForm({ viewModel }: AdminMenuEditorSettingsFormProps) {
  const {
    form,
    fieldErrors,
    saving,
    isDirty,
    previewHref,
    canEdit,
    updateField,
    handleGenerateSlug,
    handleSubmit,
  } = viewModel;

  return (
    <form className={styles.menuForm} onSubmit={handleSubmit} noValidate>
      <section className={styles.card} aria-labelledby="menu-settings-title">
        <h3 id="menu-settings-title" className={styles.cardTitle}>
          Configuración del menú
        </h3>
        <div className={styles.cardBody}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="menu-name">
              Nombre
            </label>
            <input
              id="menu-name"
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
            <label className={formStyles.label} htmlFor="menu-slug">
              Slug
            </label>
            <div className={styles.slugRow}>
              <input
                id="menu-slug"
                className={formStyles.input}
                type="text"
                value={form.slug}
                readOnly={!canEdit}
                disabled={saving}
                spellCheck={false}
                onChange={(event) => updateField('slug', event.target.value)}
              />
              {canEdit ? (
                <button
                  type="button"
                  className={formStyles.secondaryButton}
                  onClick={handleGenerateSlug}
                >
                  Generar
                </button>
              ) : null}
            </div>
            <p className={formStyles.hint}>
              URL: <code className={styles.code}>{previewHref}</code>
            </p>
            {fieldErrors.slug ? (
              <p className={formStyles.error} role="alert">
                {fieldErrors.slug}
              </p>
            ) : null}
          </div>

          {canEdit ? (
            <AdminToggle
              id="menu-is-published"
              checked={form.isPublished}
              disabled={saving}
              label="Publicado"
              description={
                form.isPublished
                  ? 'Visible en la carta pública.'
                  : 'Solo visible en el panel de administración.'
              }
              onChange={(checked) => updateField('isPublished', checked)}
            />
          ) : (
            <span className={form.isPublished ? styles.badgePublished : styles.badgeDraft}>
              {form.isPublished ? 'Publicado' : 'Borrador'}
            </span>
          )}
        </div>

        {canEdit ? (
          <div className={styles.formActions}>
            <button className={formStyles.submit} type="submit" disabled={!isDirty || saving}>
              {saving ? 'Guardando…' : 'Guardar menú'}
            </button>
          </div>
        ) : null}
      </section>
    </form>
  );
}

interface AdminMenuEditorCategoriesSectionProps {
  viewModel: AdminMenuEditorViewModel;
}

function AdminMenuEditorCategoriesSection({ viewModel }: AdminMenuEditorCategoriesSectionProps) {
  const {
    sortedCategories,
    canEdit,
    newCategoryName,
    creatingCategory,
    categories,
    items,
    getItemsForCategory,
    handleCreateCategory,
    handleReorderCategory,
    onCategoriesChange,
    onItemsChange,
    onError,
    dispatch,
  } = viewModel;

  return (
    <section className={styles.categoriesSection} aria-labelledby="menu-categories-title">
      <div className={styles.categoriesHeader}>
        <h3 id="menu-categories-title" className={styles.cardTitle}>
          Secciones de la carta
        </h3>
      </div>

      {sortedCategories.length === 0 ? (
        <p className={styles.emptyCategories}>
          Añade la primera sección (entrantes, principales, postres…).
        </p>
      ) : (
        <div className={styles.categoryList}>
          {sortedCategories.map((category, index) => (
            <AdminCategoryBlock
              key={category.id}
              category={category}
              items={getItemsForCategory(category.id)}
              categories={sortedCategories}
              canEdit={canEdit}
              isFirst={index === 0}
              isLast={index === sortedCategories.length - 1}
              onCategoryUpdated={(updated) =>
                onCategoriesChange(
                  categories.map((current) =>
                    current.id === updated.id ? updated : current,
                  ),
                )
              }
              onCategoryDeleted={(categoryId) => {
                onCategoriesChange(categories.filter((current) => current.id !== categoryId));
                onItemsChange(items.filter((item) => item.categoryId !== categoryId));
              }}
              onCategoriesReordered={onCategoriesChange}
              onReorderCategory={(direction) => handleReorderCategory(category.id, direction)}
              onItemCreated={(item) => onItemsChange([...items, item])}
              onItemUpdated={(item) =>
                onItemsChange(
                  items.map((current) => (current.id === item.id ? item : current)),
                )
              }
              onItemDeleted={(itemId) =>
                onItemsChange(items.filter((item) => item.id !== itemId))
              }
              onItemsReordered={(categoryId, nextItems) => {
                const otherItems = items.filter((item) => item.categoryId !== categoryId);
                onItemsChange([...otherItems, ...nextItems]);
              }}
              onError={onError}
            />
          ))}
        </div>
      )}

      {canEdit ? (
        <form className={styles.addCategoryForm} onSubmit={handleCreateCategory} noValidate>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="new-category-name">
              Nueva sección
            </label>
            <input
              id="new-category-name"
              className={formStyles.input}
              type="text"
              value={newCategoryName}
              placeholder="Ej. Entrantes"
              disabled={creatingCategory}
              onChange={(event) =>
                dispatch({ type: 'SET_NEW_CATEGORY_NAME', payload: event.target.value })
              }
            />
          </div>
          <button className={formStyles.submit} type="submit" disabled={creatingCategory}>
            {creatingCategory ? 'Creando…' : 'Añadir sección'}
          </button>
        </form>
      ) : null}
    </section>
  );
}

interface AdminMenuEditorDangerSectionProps {
  viewModel: AdminMenuEditorViewModel;
}

function AdminMenuEditorDangerSection({ viewModel }: AdminMenuEditorDangerSectionProps) {
  const { isOwner, deleting, dispatch } = viewModel;

  if (!isOwner) {
    return null;
  }

  return (
    <section className={styles.dangerCard} aria-labelledby="menu-danger-title">
      <h3 id="menu-danger-title" className={styles.dangerTitle}>
        Eliminar menú
      </h3>
      <p className={styles.dangerDescription}>
        Se borrarán todas las secciones y productos de esta carta.
      </p>
      <button
        type="button"
        className={styles.dangerButton}
        onClick={() => dispatch({ type: 'SET_DELETE_OPEN', payload: true })}
        disabled={deleting}
      >
        <Trash2 size={14} strokeWidth={2.25} aria-hidden />
        Eliminar menú
      </button>
    </section>
  );
}

interface AdminMenuEditorDialogsProps {
  menu: Menu;
  viewModel: AdminMenuEditorViewModel;
}

function AdminMenuEditorDialogs({ menu, viewModel }: AdminMenuEditorDialogsProps) {
  const { deleteOpen, deleting, bulkOpen, bulkLoading, dispatch, handleDeleteMenu, handleBulkPricing } =
    viewModel;

  return (
    <>
      <AdminConfirmDialog
        open={deleteOpen}
        title="Eliminar menú"
        description="Se borrarán categorías, productos y configuración de esta carta. No podrás recuperar estos datos."
        confirmLabel="Eliminar definitivamente"
        confirmValue="ELIMINAR"
        loading={deleting}
        onCancel={() => dispatch({ type: 'SET_DELETE_OPEN', payload: false })}
        onConfirm={() => void handleDeleteMenu()}
      />

      <AdminBulkPricingDialog
        open={bulkOpen}
        menuName={menu.name}
        loading={bulkLoading}
        onCancel={() => dispatch({ type: 'SET_BULK_OPEN', payload: false })}
        onConfirm={(mode, value) => void handleBulkPricing(mode, value)}
      />
    </>
  );
}

interface AdminMenuEditorContentProps {
  menu: Menu;
  viewModel: AdminMenuEditorViewModel;
}

export function AdminMenuEditorContent({ menu, viewModel }: AdminMenuEditorContentProps) {
  return (
    <div className={styles.editor}>
      <AdminMenuEditorToolbar
        menuName={menu.name}
        canEdit={viewModel.canEdit}
        onOpenBulkPricing={() => viewModel.dispatch({ type: 'SET_BULK_OPEN', payload: true })}
      />
      <AdminMenuEditorSettingsForm viewModel={viewModel} />
      <AdminMenuEditorCategoriesSection viewModel={viewModel} />
      <AdminMenuEditorDangerSection viewModel={viewModel} />
      <AdminMenuEditorDialogs menu={menu} viewModel={viewModel} />
    </div>
  );
}
