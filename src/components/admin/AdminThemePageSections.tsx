import { ExternalLink } from 'lucide-react';
import { THEME_PRESET_OPTIONS } from '../../lib/theme-presets';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import formStyles from './admin-form.module.scss';
import styles from './AdminThemePage.module.scss';
import { ThemeColorEditor } from './theme/ThemeColorEditor';
import { ThemeFontSelector } from './theme/ThemeFontSelector';
import { ThemeMenuPreview } from './theme/ThemeMenuPreview';
import { ThemePresetGallery } from './theme/ThemePresetGallery';
import type { AdminThemePageViewModel } from './useAdminThemePage';

function AdminThemePageHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Apariencia</h1>
      <p className={styles.description}>
        Personaliza colores y tipografía del menú público. Los cambios se reflejan al instante en la
        vista previa.
      </p>
    </header>
  );
}

export function AdminThemePageLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-live="polite">
      <AdminThemePageHeader />
      <div className={styles.skeleton}>
        <div className={styles.skeletonCard} />
        <div className={[styles.skeletonCard, styles.skeletonPreview].join(' ')} />
      </div>
    </div>
  );
}

interface AdminThemePageErrorProps {
  loadError: string;
  onRetry: () => void;
}

export function AdminThemePageError({ loadError, onRetry }: AdminThemePageErrorProps) {
  return (
    <div className={styles.page}>
      <AdminThemePageHeader />
      <div className={styles.errorState}>
        <p className={styles.errorMessage}>
          {loadError || 'No se pudo cargar la apariencia del restaurante.'}
        </p>
        <button type="button" className={formStyles.secondaryButton} onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

interface AdminThemePageReadyProps {
  viewModel: AdminThemePageViewModel;
}

export function AdminThemePageReady({ viewModel }: AdminThemePageReadyProps) {
  const {
    form,
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
    restaurantName,
    updateField,
    handleDiscard,
    handleSubmit,
    handlePresetSelect,
    handleConfirmPreset,
    dispatch,
  } = viewModel;

  if (!form) {
    return null;
  }

  const pendingPresetLabel = pendingPreset
    ? THEME_PRESET_OPTIONS.find((preset) => preset.id === pendingPreset)?.name
    : null;

  const isBusy = saving || applyingPreset;

  return (
    <div className={styles.page}>
      <AdminThemePageHeader />

      {!isOwner ? (
        <p className={styles.readOnlyNotice}>
          Solo el dueño puede editar la apariencia. Puedes ver la configuración actual y la vista
          previa.
        </p>
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

      <div className={styles.workspace}>
        <form className={styles.controls} onSubmit={handleSubmit} noValidate>
          <section className={styles.card} aria-labelledby="theme-presets-title">
            <h2 id="theme-presets-title" className={styles.cardTitle}>
              Estilos predefinidos
            </h2>
            <p className={styles.cardDescription}>
              Elige un punto de partida. Puedes ajustar los colores manualmente después.
            </p>
            <ThemePresetGallery
              activePreset={activePreset}
              disabled={!isOwner || isBusy}
              onSelect={handlePresetSelect}
            />
          </section>

          <section className={styles.card} aria-labelledby="theme-custom-title">
            <h2 id="theme-custom-title" className={styles.cardTitle}>
              Personalización avanzada
            </h2>
            <p className={styles.cardDescription}>
              Ajusta cada color y la tipografía del menú público.
            </p>
            <div className={styles.cardBody}>
              <ThemeColorEditor
                form={form}
                fieldErrors={fieldErrors}
                readOnly={!isOwner}
                onUpdateField={updateField}
              />
              <ThemeFontSelector
                form={form}
                fieldErrors={fieldErrors}
                readOnly={!isOwner}
                onUpdateField={(value) => updateField('fontFamily', value)}
              />
            </div>
          </section>

          {isOwner ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={formStyles.secondaryButton}
                disabled={!isDirty || isBusy}
                onClick={handleDiscard}
              >
                Descartar
              </button>
              <button className={formStyles.submit} type="submit" disabled={!isDirty || isBusy}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          ) : null}
        </form>

        <aside className={styles.previewAside} aria-label="Vista previa del menú">
          <ThemeMenuPreview theme={form} restaurantName={restaurantName} />
          {previewMenuHref ? (
            <div className={styles.previewLinkRow}>
              <a className={styles.previewLink} href={previewMenuHref} target="_blank" rel="noreferrer">
                Ver menú publicado
                <ExternalLink size={14} strokeWidth={2.25} aria-hidden />
              </a>
            </div>
          ) : (
            <p className={styles.previewHint}>
              Publica un menú para obtener el enlace público con esta apariencia.
            </p>
          )}
        </aside>
      </div>

      <AdminConfirmDialog
        open={presetDialogOpen}
        title="Aplicar preset"
        description={
          pendingPresetLabel
            ? `Tienes cambios sin guardar. Si aplicas «${pendingPresetLabel}», se perderán y se reemplazará toda la apariencia.`
            : 'Tienes cambios sin guardar. Si aplicas un preset, se perderán tus ajustes manuales.'
        }
        confirmLabel="Aplicar preset"
        loading={applyingPreset}
        onCancel={() => dispatch({ type: 'CLOSE_PRESET_DIALOG' })}
        onConfirm={handleConfirmPreset}
      />
    </div>
  );
}
