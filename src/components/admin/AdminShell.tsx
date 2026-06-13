import {
  ChevronDown,
  ExternalLink,
  Loader2,
  LogOut,
  Menu,
  User,
  Utensils,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { getSession, signOut } from '../../lib/auth-api';
import { listRestaurants, listMenus, type Restaurant, type RestaurantRole } from '../../lib/admin-api';
import { ADMIN_NAV_ITEMS, isNavItemActive } from './admin-nav';
import { getAdminPage } from './admin-pages';
import { AdminProvider, type AdminContextValue } from './AdminContext';
import { AdminOnboarding } from './AdminOnboarding';
import styles from './AdminShell.module.scss';

type BootstrapState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'onboarding'; user: AdminContextValue['user'] }
  | {
      status: 'ready';
      user: AdminContextValue['user'];
      restaurant: Restaurant;
      role: RestaurantRole;
      previewHref: string | null;
    };

type ShellUiState = {
  sidebarOpen: boolean;
  userMenuOpen: boolean;
  loggingOut: boolean;
};

type ShellUiAction =
  | { type: 'toggle_sidebar' }
  | { type: 'close_sidebar' }
  | { type: 'toggle_user_menu' }
  | { type: 'close_user_menu' }
  | { type: 'logout_start' }
  | { type: 'logout_end' };

const initialShellUiState: ShellUiState = {
  sidebarOpen: false,
  userMenuOpen: false,
  loggingOut: false,
};

function shellUiReducer(state: ShellUiState, action: ShellUiAction): ShellUiState {
  switch (action.type) {
    case 'toggle_sidebar':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'close_sidebar':
      return state.sidebarOpen ? { ...state, sidebarOpen: false } : state;
    case 'toggle_user_menu':
      return { ...state, userMenuOpen: !state.userMenuOpen };
    case 'close_user_menu':
      return state.userMenuOpen ? { ...state, userMenuOpen: false } : state;
    case 'logout_start':
      return { ...state, userMenuOpen: false, loggingOut: true };
    case 'logout_end':
      return { ...state, loggingOut: false };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function subscribeToPathname(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);

  return () => {
    window.removeEventListener('popstate', onStoreChange);
  };
}

function getPathnameSnapshot() {
  return window.location.pathname;
}

export function AdminShell() {
  const [bootstrap, setBootstrap] = useState<BootstrapState>({ status: 'loading' });
  const [ui, dispatchUi] = useReducer(shellUiReducer, initialShellUiState);
  const pathname = useSyncExternalStore(subscribeToPathname, getPathnameSnapshot, () => '');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadBootstrap = useCallback(async (): Promise<BootstrapState> => {
    const session = await getSession();

    if (!session) {
      return { status: 'unauthenticated' };
    }

    const restaurantsResult = await listRestaurants();

    if (restaurantsResult.ok === false) {
      throw new Error(restaurantsResult.message);
    }

    const restaurant = restaurantsResult.data[0];

    if (!restaurant) {
      return { status: 'onboarding', user: session.user };
    }

    const role = restaurant.role ?? 'STAFF';

    const menusResult = await listMenus(restaurant.id);
    const publishedMenu = menusResult.ok
      ? menusResult.data.find((menu) => menu.isPublished)
      : undefined;

    const previewHref = publishedMenu
      ? `/menu/${restaurant.slug}/${publishedMenu.slug}`
      : null;

    return {
      status: 'ready',
      user: session.user,
      restaurant,
      role,
      previewHref,
    };
  }, []);

  const refresh = useCallback(async () => {
    const next = await loadBootstrap();
    setBootstrap(next);
  }, [loadBootstrap]);

  useEffect(() => {
    let cancelled = false;

    loadBootstrap()
      .then((next) => {
        if (cancelled) {
          return;
        }

        if (next.status === 'unauthenticated') {
          window.location.replace('/login');
          return;
        }

        setBootstrap(next);
      })
      .catch(() => {
        if (!cancelled) {
          window.location.replace('/login');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadBootstrap]);

  useEffect(() => {
    dispatchUi({ type: 'close_sidebar' });
  }, [pathname]);

  useEffect(() => {
    if (!ui.userMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        dispatchUi({ type: 'close_user_menu' });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatchUi({ type: 'close_user_menu' });
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ui.userMenuOpen]);

  const handleLogout = async () => {
    dispatchUi({ type: 'logout_start' });
    const result = await signOut();

    if (result.ok) {
      window.location.replace('/login');
      return;
    }

    dispatchUi({ type: 'logout_end' });
  };

  const visibleNavItems = useMemo(() => {
    if (bootstrap.status !== 'ready') {
      return [];
    }

    return ADMIN_NAV_ITEMS.filter(
      (item) => !item.ownerOnly || bootstrap.role === 'OWNER',
    );
  }, [bootstrap]);

  const PageComponent = useMemo(() => getAdminPage(pathname), [pathname]);

  if (bootstrap.status === 'loading') {
    return (
      <output className={styles.loading} aria-live="polite">
        <Loader2 className={styles.spinner} size={28} strokeWidth={2.25} aria-hidden />
        <span className={styles.loadingText}>Cargando panel…</span>
      </output>
    );
  }

  if (bootstrap.status === 'onboarding') {
    return <AdminOnboarding onComplete={refresh} />;
  }

  if (bootstrap.status !== 'ready') {
    return null;
  }

  const contextValue: AdminContextValue = {
    user: bootstrap.user,
    restaurant: bootstrap.restaurant,
    role: bootstrap.role,
    refresh,
  };

  const previewHref = bootstrap.previewHref;

  return (
    <AdminProvider value={contextValue}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={ui.sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={ui.sidebarOpen}
              aria-controls="admin-sidebar"
              onClick={() => dispatchUi({ type: 'toggle_sidebar' })}
            >
              {ui.sidebarOpen ? (
                <X size={20} strokeWidth={2.25} aria-hidden />
              ) : (
                <Menu size={20} strokeWidth={2.25} aria-hidden />
              )}
            </button>

            <a className={styles.brand} href="/admin">
              <span className={styles.brandIcon} aria-hidden>
                <Utensils size={18} strokeWidth={2.25} />
              </span>
              <span className={styles.brandText}>SmartMenu</span>
            </a>
          </div>

          <div className={styles.headerEnd}>
            <div className={styles.headerMeta}>
              <span className={styles.restaurantName}>{bootstrap.restaurant.name}</span>
              <span className={styles.userBadge}>{bootstrap.role === 'OWNER' ? 'Owner' : 'Staff'}</span>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.userMenu} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userMenuTrigger}
                aria-label="Menú de cuenta"
                aria-haspopup="menu"
                aria-expanded={ui.userMenuOpen}
                aria-controls="admin-user-menu"
                onClick={() => dispatchUi({ type: 'toggle_user_menu' })}
              >
                <span className={styles.userMenuAvatar} aria-hidden>
                  <User size={16} strokeWidth={2.25} />
                </span>
                <ChevronDown
                  className={[styles.userMenuChevron, ui.userMenuOpen ? styles.userMenuChevronOpen : ''].join(' ')}
                  size={16}
                  strokeWidth={2.25}
                  aria-hidden
                />
              </button>

              {ui.userMenuOpen ? (
                <div
                  id="admin-user-menu"
                  className={styles.userMenuPanel}
                  role="menu"
                  aria-label="Cuenta"
                >
                  <p className={styles.userMenuEmail}>{bootstrap.user.email}</p>
                  <button
                    type="button"
                    className={styles.userMenuItem}
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={ui.loggingOut}
                  >
                    <LogOut size={16} strokeWidth={2.25} aria-hidden />
                    {ui.loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          </div>
        </header>

        <div className={styles.body}>
          <aside
            id="admin-sidebar"
            className={[styles.sidebar, ui.sidebarOpen ? styles.sidebarOpen : ''].join(' ')}
            aria-label="Administración"
          >
            <nav className={styles.nav}>
              <ul className={styles.navList}>
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, item);

                  return (
                    <li key={item.href}>
                      <a
                        className={[styles.navLink, active ? styles.navLinkActive : ''].join(' ')}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => dispatchUi({ type: 'close_sidebar' })}
                      >
                        <Icon size={18} strokeWidth={2.25} aria-hidden />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}

                <li className={styles.navDivider} aria-hidden />

                {previewHref ? (
                  <li>
                    <a
                      className={styles.navLink}
                      href={previewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => dispatchUi({ type: 'close_sidebar' })}
                    >
                      <ExternalLink size={18} strokeWidth={2.25} aria-hidden />
                      <span>Vista previa</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
          </aside>

          {ui.sidebarOpen ? (
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Cerrar menú"
              onClick={() => dispatchUi({ type: 'close_sidebar' })}
            />
          ) : null}

          <main className={styles.main}>
            {PageComponent ? <PageComponent /> : null}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
