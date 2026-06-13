import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import formStyles from './admin-form.module.scss';
import {
  formatRelativeUpdate,
  getGreetingName,
  HOME_QUICK_LINKS,
  type HomeChecklistItem,
  type HomePublishedMenu,
  type HomeQuickLink,
} from './admin-home-page.state';
import styles from './AdminHomePage.module.scss';
import { useAdminHomePage } from './useAdminHomePage';

function AdminHomePageLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-live="polite">
      <header className={styles.header}>
        <h1 className={styles.title}>Inicio</h1>
        <p className={styles.description}>Cargando resumen de tu restaurante…</p>
      </header>
      <div className={styles.skeleton}>
        <div className={styles.skeletonPanel} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    </div>
  );
}

function PublishedMenuRow({
  menu,
  copied,
  onCopy,
}: {
  menu: HomePublishedMenu;
  copied: boolean;
  onCopy: (menu: HomePublishedMenu) => void;
}) {
  const publicUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${menu.href}` : menu.href;

  return (
    <article className={styles.publishedItem}>
      <div className={styles.publishedItemHeader}>
        <p className={styles.publishedMenuName}>{menu.name}</p>
      </div>
      <div className={styles.urlRow}>
        <p className={styles.urlText}>{publicUrl}</p>
        <div className={styles.statusActions}>
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => void onCopy(menu)}
            aria-label={`Copiar URL de ${menu.name}`}
          >
            {copied ? (
              <Check size={14} strokeWidth={2.25} aria-hidden />
            ) : (
              <Copy size={14} strokeWidth={2.25} aria-hidden />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <a
            className={formStyles.secondaryButton}
            href={menu.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} strokeWidth={2.25} aria-hidden />
            Ver menú
          </a>
        </div>
      </div>
    </article>
  );
}

function getQuickLinkIconClass(link: HomeQuickLink): string {
  const toneClass = {
    restaurant: styles.quickLinkIconRestaurant,
    menus: styles.quickLinkIconMenus,
    theme: styles.quickLinkIconTheme,
    members: styles.quickLinkIconMembers,
  }[link.iconTone];

  return [styles.quickLinkIcon, toneClass].join(' ');
}

const CHECKLIST_COMPLETE_ANIMATION_MS = 450;

function PendingChecklistItem({
  item,
  onMarkDone,
}: {
  item: HomeChecklistItem;
  onMarkDone: (itemId: string) => void;
}) {
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!isCompleting) {
      return;
    }

    const timer = window.setTimeout(() => {
      onMarkDone(item.id);
    }, CHECKLIST_COMPLETE_ANIMATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isCompleting, item.id, onMarkDone]);

  const handleMarkDone = () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);
  };

  return (
    <li
      className={[
        styles.checklistItem,
        isCompleting ? styles.checklistItemCompleting : '',
      ].join(' ')}
    >
      <div
        className={[
          styles.checklistLink,
          isCompleting ? styles.checklistDone : '',
        ].join(' ')}
      >
        <button
          type="button"
          className={styles.checklistToggle}
          onClick={handleMarkDone}
          disabled={isCompleting}
          aria-label={`Marcar "${item.label}" como hecho`}
        >
          <span
            className={[
              styles.checklistIconWrap,
              isCompleting ? styles.checklistIconWrapDone : '',
            ].join(' ')}
          >
            <Circle
              className={[
                styles.checklistIcon,
                styles.checklistIconPending,
                isCompleting ? styles.checklistIconExit : '',
              ].join(' ')}
              size={18}
              strokeWidth={2.25}
              aria-hidden
            />
            <CheckCircle2
              className={[
                styles.checklistIcon,
                styles.checklistIconDone,
                styles.checklistIconDoneHidden,
                isCompleting ? styles.checklistIconEnter : '',
              ].join(' ')}
              size={18}
              strokeWidth={2.25}
              aria-hidden
            />
          </span>
        </button>
        <a className={styles.checklistLabelLink} href={item.href}>
          <span
            className={[
              styles.checklistLabel,
              isCompleting ? styles.checklistLabelDone : '',
            ].join(' ')}
          >
            {item.label}
          </span>
        </a>
      </div>
    </li>
  );
}

export function AdminHomePage() {
  const {
    user,
    restaurant,
    role,
    isOwner,
    status,
    loadError,
    data,
    checklist,
    pendingChecklistCount,
    isChecklistItemComplete,
    markChecklistItemDone,
    copiedMenuId,
    loadDashboard,
    copyPublishedUrl,
  } = useAdminHomePage();

  if (status === 'loading') {
    return <AdminHomePageLoading />;
  }

  if (status === 'error' || !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Inicio</h1>
          <p className={styles.description}>Resumen de tu restaurante y accesos rápidos.</p>
        </header>
        <div className={styles.errorState}>
          <p className={styles.errorMessage} role="alert">
            {loadError || 'No se pudo cargar el resumen.'}
          </p>
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => void loadDashboard()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { stats, publishedMenus } = data;
  const visibleQuickLinks = HOME_QUICK_LINKS.filter((link) => !link.ownerOnly || isOwner);
  const hasPublishedMenus = publishedMenus.length > 0;
  const canShowPublicMenu = restaurant.isActive && hasPublishedMenus;

  let statusPanelClass = styles.statusPanelWarning;
  let statusTitle = 'Tu menú aún no está publicado';
  let statusText =
    'Crea productos y activa la publicación en Menús para que tus clientes puedan ver la carta.';

  if (!restaurant.isActive) {
    statusPanelClass = styles.statusPanelDanger;
    statusTitle = 'Restaurante inactivo';
    statusText =
      'El menú público no se mostrará mientras el negocio esté desactivado. Puedes reactivarlo en Restaurante.';
  } else if (canShowPublicMenu) {
    statusPanelClass = styles.statusPanelSuccess;
    statusTitle =
      publishedMenus.length === 1
        ? 'Tu menú está publicado'
        : `${publishedMenus.length} menús publicados`;
    statusText = 'Comparte la URL con tus clientes o ábrela para revisar cómo se ve la carta.';
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hola, {getGreetingName(user.name)}</h1>
        <p className={styles.description}>
          Resumen de <strong>{restaurant.name}</strong> y accesos rápidos para gestionar tu carta.
        </p>
        <div className={styles.metaRow}>
          <span
            className={[
              styles.badge,
              restaurant.isActive ? styles.badgeActive : styles.badgeInactive,
            ].join(' ')}
          >
            {restaurant.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <span className={[styles.badge, styles.badgeRole].join(' ')}>
            {role === 'OWNER' ? 'Owner' : 'Staff'}
          </span>
          {stats.lastUpdatedAt ? (
            <span className={[styles.badge, styles.badgeRole].join(' ')}>
              Actualizado {formatRelativeUpdate(stats.lastUpdatedAt)}
            </span>
          ) : null}
        </div>
      </header>

      <section
        className={[styles.statusPanel, statusPanelClass].join(' ')}
        aria-labelledby="home-status-title"
      >
        <div className={styles.statusHeading}>
          <h2 id="home-status-title" className={styles.statusTitle}>
            {statusTitle}
          </h2>
          <p className={styles.statusText}>{statusText}</p>
        </div>

        {canShowPublicMenu ? (
          <div className={styles.publishedList}>
            {publishedMenus.map((menu) => (
              <PublishedMenuRow
                key={menu.id}
                menu={menu}
                copied={copiedMenuId === menu.id}
                onCopy={copyPublishedUrl}
              />
            ))}
          </div>
        ) : (
          <div className={styles.statusActions}>
            <a className={formStyles.secondaryButton} href="/admin/menus">
              <BookOpen size={14} strokeWidth={2.25} aria-hidden />
              Ir a menús
            </a>
            {!restaurant.isActive ? (
              <a className={formStyles.secondaryButton} href="/admin/restaurant">
                <AlertTriangle size={14} strokeWidth={2.25} aria-hidden />
                Revisar restaurante
              </a>
            ) : null}
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="home-stats-title">
        <h2 id="home-stats-title" className={styles.sectionTitle}>
          Resumen operativo
        </h2>
        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <p className={styles.statValue}>{stats.menuCount}</p>
            <p className={styles.statLabel}>Menús</p>
            <p className={styles.statHint}>
              {stats.publishedMenuCount} publicado{stats.publishedMenuCount === 1 ? '' : 's'}
            </p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statValue}>{stats.categoryCount}</p>
            <p className={styles.statLabel}>Categorías</p>
            <p className={styles.statHint}>En todos tus menús</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statValue}>{stats.itemCount}</p>
            <p className={styles.statLabel}>Productos</p>
            <p className={styles.statHint}>
              {stats.featuredItemCount} destacado{stats.featuredItemCount === 1 ? '' : 's'}
            </p>
          </article>
          <article className={styles.statCard}>
            <p
              className={[
                styles.statValue,
                stats.unavailableItemCount > 0 ? styles.statValueWarning : '',
              ].join(' ')}
            >
              {stats.unavailableItemCount}
            </p>
            <p className={styles.statLabel}>No disponibles</p>
            <p className={styles.statHint}>
              {stats.unavailableItemCount > 0
                ? 'Revisa disponibilidad en Menús'
                : 'Todos visibles en carta'}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="home-quick-links-title">
        <h2 id="home-quick-links-title" className={styles.sectionTitle}>
          Accesos rápidos
        </h2>
        <div className={styles.quickLinks}>
          {visibleQuickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a key={link.href} className={styles.quickLink} href={link.href}>
                <span className={getQuickLinkIconClass(link)} aria-hidden>
                  <Icon size={18} strokeWidth={2.25} />
                </span>
                <span className={styles.quickLinkBody}>
                  <span className={styles.quickLinkLabel}>{link.label}</span>
                  <span className={styles.quickLinkDescription}>{link.description}</span>
                </span>
                <ArrowUpRight size={16} strokeWidth={2.25} aria-hidden />
              </a>
            );
          })}
        </div>
      </section>

      {pendingChecklistCount > 0 ? (
        <section className={styles.section} aria-labelledby="home-checklist-title">
          <h2 id="home-checklist-title" className={styles.sectionTitle}>
            Próximos pasos
          </h2>
          <p className={styles.sectionHint}>
            {pendingChecklistCount} pendiente{pendingChecklistCount === 1 ? '' : 's'}
          </p>
          <ul className={styles.checklist}>
            {checklist.map((item) => {
              if (isChecklistItemComplete(item)) {
                return null;
              }

              return (
                <PendingChecklistItem
                  key={item.id}
                  item={item}
                  onMarkDone={markChecklistItemDone}
                />
              );
            })}
          </ul>
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="home-checklist-done-title">
          <h2 id="home-checklist-done-title" className={styles.sectionTitle}>
            Configuración completa
          </h2>
          <ul className={styles.checklist}>
            {checklist.map((item) => (
              <li key={item.id} className={styles.checklistItem}>
                <div className={[styles.checklistLink, styles.checklistDone].join(' ')}>
                  <span className={[styles.checklistIconWrap, styles.checklistIconWrapDone].join(' ')}>
                    <CheckCircle2
                      className={[styles.checklistIcon, styles.checklistIconDone].join(' ')}
                      size={18}
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </span>
                  <span className={[styles.checklistLabel, styles.checklistLabelDone].join(' ')}>
                    {item.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
