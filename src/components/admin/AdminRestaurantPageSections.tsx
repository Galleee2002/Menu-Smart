import { Check, Copy } from 'lucide-react';
import type { Restaurant } from '../../lib/admin-api';
import { DEFAULT_CURRENCY, getCurrencyLabel } from '../../lib/currency';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { AdminToggle } from './AdminToggle';
import formStyles from './admin-form.module.scss';
import { formatRestaurantDate, type FieldErrors, type FormState } from './admin-restaurant-page.state';
import styles from './AdminRestaurantPage.module.scss';
import type { AdminRestaurantPageViewModel } from './useAdminRestaurantPage';

function AdminRestaurantPageHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Restaurante</h1>
      <p className={styles.description}>Datos generales y configuración del negocio.</p>
    </header>
  );
}

export function AdminRestaurantPageLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-live="polite">
      <AdminRestaurantPageHeader />
      <div className={styles.skeleton}>
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    </div>
  );
}

interface AdminRestaurantPageErrorProps {
  loadError: string;
  onRetry: () => void;
}

export function AdminRestaurantPageError({ loadError, onRetry }: AdminRestaurantPageErrorProps) {
  return (
    <div className={styles.page}>
      <AdminRestaurantPageHeader />
      <div className={styles.errorState}>
        <p className={styles.errorMessage}>
          {loadError || 'No se pudieron cargar los datos del restaurante.'}
        </p>
        <button type="button" className={formStyles.secondaryButton} onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

interface AdminRestaurantIdentitySectionProps {
  form: FormState;
  fieldErrors: FieldErrors;
  isOwner: boolean;
  onUpdateField: AdminRestaurantPageViewModel['updateField'];
  onGenerateSlug: () => void;
}

function AdminRestaurantIdentitySection({
  form,
  fieldErrors,
  isOwner,
  onUpdateField,
  onGenerateSlug,
}: AdminRestaurantIdentitySectionProps) {
  return (
    <section className={styles.card} aria-labelledby="restaurant-identity-title">
      <h2 id="restaurant-identity-title" className={styles.cardTitle}>
        Identidad
      </h2>
      <div className={styles.cardBody}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="restaurant-name">
            Nombre
          </label>
          <input
            id="restaurant-name"
            className={formStyles.input}
            type="text"
            value={form.name}
            readOnly={!isOwner}
            onChange={(event) => onUpdateField('name', event.target.value)}
          />
          {fieldErrors.name ? (
            <p className={formStyles.error} role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="restaurant-description">
            Descripción
          </label>
          <textarea
            id="restaurant-description"
            className={formStyles.textarea}
            value={form.description}
            readOnly={!isOwner}
            placeholder="Breve descripción del local"
            onChange={(event) => onUpdateField('description', event.target.value)}
          />
          <p className={formStyles.hint}>{form.description.length}/500</p>
          {fieldErrors.description ? (
            <p className={formStyles.error} role="alert">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="restaurant-slug">
            Slug
          </label>
          <div className={styles.slugRow}>
            <input
              id="restaurant-slug"
              className={formStyles.input}
              type="text"
              value={form.slug}
              readOnly={!isOwner}
              spellCheck={false}
              onChange={(event) => onUpdateField('slug', event.target.value)}
            />
            {isOwner ? (
              <button
                type="button"
                className={formStyles.secondaryButton}
                onClick={onGenerateSlug}
              >
                Generar desde nombre
              </button>
            ) : null}
          </div>
          <p className={formStyles.hint}>Dirección única del menú público.</p>
          {fieldErrors.slug ? (
            <p className={formStyles.error} role="alert">
              {fieldErrors.slug}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface AdminRestaurantUrlSectionProps {
  publicUrl: string;
  slugChanged: boolean;
  copied: boolean;
  onCopyUrl: () => void;
}

function AdminRestaurantUrlSection({
  publicUrl,
  slugChanged,
  copied,
  onCopyUrl,
}: AdminRestaurantUrlSectionProps) {
  return (
    <section className={styles.card} aria-labelledby="restaurant-url-title">
      <h2 id="restaurant-url-title" className={styles.cardTitle}>
        Tu URL pública
      </h2>
      <div className={styles.urlPreview}>
        <div className={styles.urlBox}>
          <p className={styles.urlText}>{publicUrl}</p>
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => void onCopyUrl()}
            aria-label="Copiar URL pública"
          >
            {copied ? (
              <Check size={14} strokeWidth={2.25} aria-hidden />
            ) : (
              <Copy size={14} strokeWidth={2.25} aria-hidden />
            )}
          </button>
        </div>
        {slugChanged ? (
          <p className={styles.urlWarning}>
            Al guardar un slug nuevo, los enlaces anteriores dejarán de funcionar.
          </p>
        ) : null}
      </div>
    </section>
  );
}

interface AdminRestaurantStatusSectionProps {
  form: FormState;
  isOwner: boolean;
  saving: boolean;
  onUpdateField: AdminRestaurantPageViewModel['updateField'];
}

function AdminRestaurantStatusSection({
  form,
  isOwner,
  saving,
  onUpdateField,
}: AdminRestaurantStatusSectionProps) {
  return (
    <section className={styles.card} aria-labelledby="restaurant-status-title">
      <h2 id="restaurant-status-title" className={styles.cardTitle}>
        Estado y publicación
      </h2>
      <div className={styles.cardBody}>
        {isOwner ? (
          <AdminToggle
            id="restaurant-is-active"
            checked={form.isActive}
            disabled={saving}
            label="Menú público visible"
            description={
              form.isActive
                ? 'Los clientes pueden acceder al menú con la URL pública.'
                : 'El menú público está oculto para los clientes.'
            }
            onChange={(checked) => onUpdateField('isActive', checked)}
          />
        ) : (
          <span className={form.isActive ? styles.badgeActive : styles.badgeInactive}>
            {form.isActive ? 'Activo' : 'Inactivo'}
          </span>
        )}
      </div>
    </section>
  );
}

function AdminRestaurantRegionalSection() {
  return (
    <section className={styles.card} aria-labelledby="restaurant-regional-title">
      <h2 id="restaurant-regional-title" className={styles.cardTitle}>
        Regional
      </h2>
      <div className={styles.cardBody}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="restaurant-currency">
            Moneda
          </label>
          <input
            id="restaurant-currency"
            className={formStyles.input}
            type="text"
            value={getCurrencyLabel(DEFAULT_CURRENCY)}
            readOnly
            disabled
            aria-describedby="restaurant-currency-hint"
          />
          <p id="restaurant-currency-hint" className={formStyles.hint}>
            Próximamente podrás elegir la moneda del menú (EUR, USD, etc.) desde aquí.
            Por ahora todos los precios usan peso argentino (ARS) en el panel y en los ajustes
            masivos.
          </p>
        </div>
      </div>
    </section>
  );
}

interface AdminRestaurantMetaSectionProps {
  restaurant: Restaurant;
}

function AdminRestaurantMetaSection({ restaurant }: AdminRestaurantMetaSectionProps) {
  return (
    <section className={styles.card} aria-labelledby="restaurant-meta-title">
      <h2 id="restaurant-meta-title" className={styles.cardTitle}>
        Metadatos
      </h2>
      <dl className={styles.metaList}>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Creado</dt>
          <dd className={styles.metaValue}>{formatRestaurantDate(restaurant.createdAt)}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.metaLabel}>Última actualización</dt>
          <dd className={styles.metaValue}>{formatRestaurantDate(restaurant.updatedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

interface AdminRestaurantPageReadyProps {
  viewModel: AdminRestaurantPageViewModel;
  restaurant: Restaurant;
  form: FormState;
}

export function AdminRestaurantPageReady({ viewModel, restaurant, form }: AdminRestaurantPageReadyProps) {
  const {
    isOwner,
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
    updateField,
    handleGenerateSlug,
    handleCopyUrl,
    handleSubmit,
    handleDelete,
    dispatch,
  } = viewModel;

  return (
    <div className={styles.page}>
      <AdminRestaurantPageHeader />

      {!isOwner ? (
        <p className={styles.readOnlyNotice}>Solo el owner puede editar estos datos.</p>
      ) : null}

      {successMessage ? (
        <p className={styles.bannerSuccess} role="status">
          {successMessage}
        </p>
      ) : null}

      {bannerError ? (
        <p className={styles.bannerError} role="alert">
          {bannerError}
        </p>
      ) : null}

      <form className={styles.grid} onSubmit={handleSubmit} noValidate>
        <AdminRestaurantIdentitySection
          form={form}
          fieldErrors={fieldErrors}
          isOwner={isOwner}
          onUpdateField={updateField}
          onGenerateSlug={handleGenerateSlug}
        />
        <AdminRestaurantUrlSection
          publicUrl={publicUrl}
          slugChanged={slugChanged}
          copied={copied}
          onCopyUrl={handleCopyUrl}
        />
        <AdminRestaurantStatusSection
          form={form}
          isOwner={isOwner}
          saving={saving}
          onUpdateField={updateField}
        />
        <AdminRestaurantRegionalSection />
        <AdminRestaurantMetaSection restaurant={restaurant} />

        {isOwner ? (
          <div className={styles.actions}>
            <button className={formStyles.submit} type="submit" disabled={!isDirty || saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        ) : null}
      </form>

      {isOwner ? (
        <section className={styles.dangerCard} aria-labelledby="restaurant-danger-title">
          <h2 id="restaurant-danger-title" className={styles.dangerTitle}>
            Zona peligrosa
          </h2>
          <p className={styles.dangerDescription}>
            Eliminar el restaurante borra todos los datos asociados. Esta acción no se puede
            deshacer.
          </p>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => dispatch({ type: 'OPEN_DELETE_DIALOG' })}
            disabled={deleting}
          >
            Eliminar restaurante
          </button>
        </section>
      ) : null}

      <AdminConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar restaurante"
        description="Se borrarán menús, miembros y toda la configuración. No podrás recuperar estos datos."
        confirmLabel="Eliminar definitivamente"
        confirmValue="ELIMINAR"
        loading={deleting}
        onCancel={() => dispatch({ type: 'CLOSE_DELETE_DIALOG' })}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
