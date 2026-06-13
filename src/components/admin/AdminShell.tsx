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
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getSession, signOut } from '../../lib/auth-api';
import { listRestaurants, listMenus, type Restaurant, type RestaurantRole } from '../../lib/admin-api';
import { ADMIN_NAV_ITEMS, isNavItemActive } from './admin-nav';
import { AdminProvider, type AdminContextValue } from './AdminContext';
import { AdminOnboarding } from './AdminOnboarding';
import { AdminSection } from './AdminSection';
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

interface AdminShellProps {
  sectionTitle?: string;
  sectionDescription?: string;
  children?: ReactNode;
}

export function AdminShell({ sectionTitle, sectionDescription, children }: AdminShellProps) {
  const [bootstrap, setBootstrap] = useState<BootstrapState>({ status: 'loading' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pathname, setPathname] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadBootstrap = useCallback(async (): Promise<BootstrapState> => {
    const session = await getSession();

    if (!session) {
      return { status: 'unauthenticated' };
    }

    const restaurantsResult = await listRestaurants();

    if (!restaurantsResult.ok) {
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
    setPathname(window.location.pathname);

    const handlePopState = () => {
      setPathname(window.location.pathname);
      setSidebarOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setLoggingOut(true);
    const result = await signOut();

    if (result.ok) {
      window.location.replace('/login');
      return;
    }

    setLoggingOut(false);
  };

  const visibleNavItems = useMemo(() => {
    if (bootstrap.status !== 'ready') {
      return [];
    }

    return ADMIN_NAV_ITEMS.filter(
      (item) => !item.ownerOnly || bootstrap.role === 'OWNER',
    );
  }, [bootstrap]);

  if (bootstrap.status === 'loading') {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Loader2 className={styles.spinner} size={28} strokeWidth={2.25} aria-hidden />
        <span className={styles.loadingText}>Cargando panel…</span>
      </div>
    );
  }

  if (bootstrap.status === 'onboarding') {
    return <AdminOnboarding onComplete={refresh} />;
  }

  const contextValue: AdminContextValue = {
    user: bootstrap.user,
    restaurant: bootstrap.restaurant,
    role: bootstrap.role,
    refresh,
  };

  const previewHref = bootstrap.status === 'ready' ? bootstrap.previewHref : null;

  return (
    <AdminProvider value={contextValue}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? (
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
                aria-expanded={userMenuOpen}
                aria-controls="admin-user-menu"
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <span className={styles.userMenuAvatar} aria-hidden>
                  <User size={16} strokeWidth={2.25} />
                </span>
                <ChevronDown
                  className={[styles.userMenuChevron, userMenuOpen ? styles.userMenuChevronOpen : ''].join(' ')}
                  size={16}
                  strokeWidth={2.25}
                  aria-hidden
                />
              </button>

              {userMenuOpen ? (
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
                    disabled={loggingOut}
                  >
                    <LogOut size={16} strokeWidth={2.25} aria-hidden />
                    {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
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
            className={[styles.sidebar, sidebarOpen ? styles.sidebarOpen : ''].join(' ')}
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
                        onClick={() => setSidebarOpen(false)}
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
                      onClick={() => setSidebarOpen(false)}
                    >
                      <ExternalLink size={18} strokeWidth={2.25} aria-hidden />
                      <span>Vista previa</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
          </aside>

          {sidebarOpen ? (
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Cerrar menú"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          <main className={styles.main}>
            {children ??
              (sectionTitle ? (
                <AdminSection title={sectionTitle} description={sectionDescription} />
              ) : null)}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
