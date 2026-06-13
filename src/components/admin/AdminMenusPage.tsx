import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { PenLine } from 'lucide-react';
import {
  listCategories,
  listItems,
  listMenus,
  type Category,
  type Menu,
  type MenuItem,
} from '../../lib/admin-api';
import { useAdmin } from './AdminContext';
import formStyles from './admin-form.module.scss';
import { AdminMenuEditor } from './menus/AdminMenuEditor';
import { AdminMenuSidebar } from './menus/AdminMenuSidebar';
import styles from './AdminMenusPage.module.scss';

type PageStatus = 'loading' | 'error' | 'ready';

type AdminMenusPageState = {
  status: PageStatus;
  loadError: string;
  menus: Menu[];
  selectedMenuId: string | null;
  categories: Category[];
  items: MenuItem[];
  menuDataLoading: boolean;
  bannerError: string;
  successMessage: string;
  dangerMessage: string;
};

type AdminMenusPageAction =
  | { type: 'load_menus_start' }
  | { type: 'load_menus_error'; message: string }
  | { type: 'load_menus_success'; menus: Menu[]; selectedMenuId: string | null }
  | { type: 'load_menu_data_start' }
  | { type: 'load_menu_data_error'; message: string }
  | { type: 'load_menu_data_success'; categories: Category[]; items: MenuItem[] }
  | { type: 'select_menu'; menuId: string }
  | { type: 'menu_created'; menu: Menu }
  | { type: 'menu_updated'; menu: Menu }
  | { type: 'menu_deleted'; remaining: Menu[]; nextId: string | null }
  | { type: 'set_categories'; categories: Category[] }
  | { type: 'set_items'; items: MenuItem[] }
  | { type: 'show_error'; message: string }
  | { type: 'show_success'; message: string };

const initialAdminMenusPageState: AdminMenusPageState = {
  status: 'loading',
  loadError: '',
  menus: [],
  selectedMenuId: null,
  categories: [],
  items: [],
  menuDataLoading: false,
  bannerError: '',
  successMessage: '',
  dangerMessage: '',
};

function adminMenusPageReducer(
  state: AdminMenusPageState,
  action: AdminMenusPageAction,
): AdminMenusPageState {
  switch (action.type) {
    case 'load_menus_start':
      return { ...state, status: 'loading', loadError: '' };
    case 'load_menus_error':
      return { ...state, loadError: action.message, status: 'error' };
    case 'load_menus_success':
      return {
        ...state,
        menus: action.menus,
        status: 'ready',
        selectedMenuId: action.selectedMenuId,
      };
    case 'load_menu_data_start':
      return { ...state, menuDataLoading: true };
    case 'load_menu_data_error':
      return { ...state, bannerError: action.message, menuDataLoading: false };
    case 'load_menu_data_success':
      return {
        ...state,
        categories: action.categories,
        items: action.items,
        menuDataLoading: false,
      };
    case 'select_menu':
      return {
        ...state,
        selectedMenuId: action.menuId,
        bannerError: '',
        successMessage: '',
        dangerMessage: '',
      };
    case 'menu_created':
      return {
        ...state,
        menus: [...state.menus, action.menu],
        selectedMenuId: action.menu.id,
        successMessage: 'Menú creado correctamente.',
        dangerMessage: '',
      };
    case 'menu_updated':
      return {
        ...state,
        menus: state.menus.map((currentMenu) =>
          currentMenu.id === action.menu.id ? action.menu : currentMenu,
        ),
      };
    case 'menu_deleted':
      return {
        ...state,
        menus: action.remaining,
        selectedMenuId: action.nextId,
        categories: [],
        items: [],
        successMessage: '',
        dangerMessage: 'Menú eliminado.',
      };
    case 'set_categories':
      return { ...state, categories: action.categories };
    case 'set_items':
      return { ...state, items: action.items };
    case 'show_error':
      return { ...state, bannerError: action.message, successMessage: '', dangerMessage: '' };
    case 'show_success':
      return { ...state, successMessage: action.message, bannerError: '', dangerMessage: '' };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function getMenuIdFromUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('menu');
}

function setMenuIdInUrl(menuId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);

  if (menuId) {
    url.searchParams.set('menu', menuId);
  } else {
    url.searchParams.delete('menu');
  }

  window.history.replaceState({}, '', url);
}

export function AdminMenusPage() {
  const { restaurant, role, refresh } = useAdmin();
  const canEdit = true;
  const isOwner = role === 'OWNER';

  const [state, dispatch] = useReducer(adminMenusPageReducer, initialAdminMenusPageState);
  const {
    status,
    loadError,
    menus,
    selectedMenuId,
    categories,
    items,
    menuDataLoading,
    bannerError,
    successMessage,
    dangerMessage,
  } = state;

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedMenuId) ?? null,
    [menus, selectedMenuId],
  );

  const loadMenus = useCallback(async () => {
    dispatch({ type: 'load_menus_start' });

    const result = await listMenus(restaurant.id);

    if (!result.ok) {
      dispatch({ type: 'load_menus_error', message: result.message });
      return;
    }

    const urlMenuId = getMenuIdFromUrl();
    const validUrlMenu = result.data.find((menu) => menu.id === urlMenuId);
    const nextSelectedId = validUrlMenu?.id ?? result.data[0]?.id ?? null;

    dispatch({
      type: 'load_menus_success',
      menus: result.data,
      selectedMenuId: nextSelectedId,
    });
    setMenuIdInUrl(nextSelectedId);
  }, [restaurant.id]);

  const loadMenuData = useCallback(async (menuId: string) => {
    dispatch({ type: 'load_menu_data_start' });

    const [categoriesResult, itemsResult] = await Promise.all([
      listCategories(menuId),
      listItems({ menuId }),
    ]);

    if (!categoriesResult.ok) {
      dispatch({ type: 'load_menu_data_error', message: categoriesResult.message });
      return;
    }

    if (!itemsResult.ok) {
      dispatch({ type: 'load_menu_data_error', message: itemsResult.message });
      return;
    }

    dispatch({
      type: 'load_menu_data_success',
      categories: categoriesResult.data,
      items: itemsResult.data,
    });
  }, []);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  useEffect(() => {
    if (!selectedMenuId || status !== 'ready') {
      return;
    }

    void loadMenuData(selectedMenuId);
  }, [selectedMenuId, status, loadMenuData]);

  const handleSelectMenu = (menuId: string) => {
    dispatch({ type: 'select_menu', menuId });
    setMenuIdInUrl(menuId);
  };

  const handleMenuCreated = (menu: Menu) => {
    dispatch({ type: 'menu_created', menu });
    setMenuIdInUrl(menu.id);
  };

  const handleMenuUpdated = (menu: Menu) => {
    dispatch({ type: 'menu_updated', menu });
  };

  const handleMenuDeleted = () => {
    if (!selectedMenuId) {
      return;
    }

    const remaining = menus.filter((menu) => menu.id !== selectedMenuId);
    const nextId = remaining[0]?.id ?? null;
    dispatch({ type: 'menu_deleted', remaining, nextId });
    setMenuIdInUrl(nextId);
  };

  const handleError = (message: string) => {
    dispatch({ type: 'show_error', message });
  };

  const handleSuccess = (message: string) => {
    dispatch({ type: 'show_success', message });
  };

  const handleCategoriesChange = useCallback((nextCategories: Category[]) => {
    dispatch({ type: 'set_categories', categories: nextCategories });
  }, []);

  const handleItemsChange = useCallback((nextItems: MenuItem[]) => {
    dispatch({ type: 'set_items', items: nextItems });
  }, []);

  if (status === 'loading') {
    return (
      <div className={styles.page} aria-busy="true" aria-live="polite">
        <header className={styles.header}>
          <h1 className={styles.title}>Menús</h1>
          <p className={styles.description}>Gestiona las cartas publicadas de tu restaurante.</p>
        </header>
        <div className={styles.skeleton}>
          <div className={styles.skeletonSidebar} />
          <div className={styles.skeletonEditor} />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Menús</h1>
          <p className={styles.description}>Gestiona las cartas publicadas de tu restaurante.</p>
        </header>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{loadError || 'No se pudieron cargar los menús.'}</p>
          <button
            type="button"
            className={formStyles.secondaryButton}
            onClick={() => void loadMenus()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Menús</h1>
        <p className={styles.description}>Gestiona las cartas publicadas de tu restaurante.</p>
      </header>

      {!isOwner ? (
        <p className={styles.readOnlyNotice}>
          Como staff puedes editar menús y productos, pero solo el owner puede eliminar menús.
        </p>
      ) : null}

      {dangerMessage ? (
        <p className={styles.bannerDanger} role="status">
          {dangerMessage}
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

      <div className={styles.layout}>
        <AdminMenuSidebar
          menus={menus}
          selectedMenuId={selectedMenuId}
          restaurantSlug={restaurant.slug}
          canEdit={canEdit}
          onSelect={handleSelectMenu}
          onCreated={handleMenuCreated}
          onError={handleError}
        />

        <div className={styles.main}>
          {selectedMenu && !menuDataLoading ? (
            <AdminMenuEditor
              menu={selectedMenu}
              restaurantSlug={restaurant.slug}
              categories={categories}
              items={items}
              canEdit={canEdit}
              isOwner={isOwner}
              onMenuUpdated={handleMenuUpdated}
              onMenuDeleted={handleMenuDeleted}
              onCategoriesChange={handleCategoriesChange}
              onItemsChange={handleItemsChange}
              onSuccess={handleSuccess}
              onError={handleError}
              onRefreshPreview={refresh}
              onReloadMenuData={() => loadMenuData(selectedMenu.id)}
            />
          ) : selectedMenu && menuDataLoading ? (
            <div className={styles.editorLoading} aria-busy="true" aria-live="polite">
              <div className={styles.skeletonEditor} />
            </div>
          ) : (
            <div className={styles.emptyEditor}>
              <span className={styles.emptyEditorIcon} aria-hidden>
                <PenLine size={22} strokeWidth={2} />
              </span>
              <p className={styles.emptyEditorTitle}>Elige una carta para editar</p>
              <p className={styles.emptyEditorDescription}>
                {menus.length === 0
                  ? 'Crea tu primera carta desde el panel izquierdo para empezar a añadir categorías y productos.'
                  : 'Selecciona una carta de la lista o crea una nueva para gestionar su contenido.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
