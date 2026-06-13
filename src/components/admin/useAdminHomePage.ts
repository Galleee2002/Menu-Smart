import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getTheme,
  listCategories,
  listItems,
  listMembers,
  listMenus,
  type Menu,
  type MenuItem,
  type Member,
  type Theme,
} from '../../lib/admin-api';
import { useAdmin } from './AdminContext';
import {
  buildHomeChecklist,
  buildHomeDashboardStats,
  buildPublishedMenus,
  readDismissedHomeChecklistIds,
  writeDismissedHomeChecklistIds,
  type HomeChecklistItem,
  type HomeDashboardStats,
  type HomePageStatus,
  type HomePublishedMenu,
} from './admin-home-page.state';

type HomeDashboardData = {
  menus: Menu[];
  stats: HomeDashboardStats;
  publishedMenus: HomePublishedMenu[];
  theme: Theme | null;
  members: Member[] | null;
};

async function fetchHomeDashboardData(
  restaurantId: string,
  restaurantSlug: string,
  restaurantUpdatedAt: string,
  isOwner: boolean,
): Promise<HomeDashboardData> {
  const menusResult = await listMenus(restaurantId);

  if (!menusResult.ok) {
    throw new Error(menusResult.message);
  }

  const menus = menusResult.data;

  const [categoryResults, itemResults] = await Promise.all([
    Promise.all(menus.map((menu) => listCategories(menu.id))),
    Promise.all(menus.map((menu) => listItems({ menuId: menu.id }))),
  ]);

  const categoryCount = categoryResults.reduce(
    (total, result) => total + (result.ok ? result.data.length : 0),
    0,
  );

  const items = itemResults.flatMap((result) => (result.ok ? result.data : [])) as MenuItem[];

  let theme: Theme | null = null;
  let members: Member[] | null = null;

  if (isOwner) {
    const [themeResult, membersResult] = await Promise.all([
      getTheme(restaurantId),
      listMembers(restaurantId),
    ]);

    theme = themeResult.ok ? themeResult.data : null;
    members = membersResult.ok ? membersResult.data : null;
  }

  return {
    menus,
    stats: buildHomeDashboardStats(menus, categoryCount, items, restaurantUpdatedAt),
    publishedMenus: buildPublishedMenus(restaurantSlug, menus),
    theme,
    members,
  };
}

export function useAdminHomePage() {
  const { user, restaurant, role } = useAdmin();
  const isOwner = role === 'OWNER';

  const [status, setStatus] = useState<HomePageStatus>('loading');
  const [loadError, setLoadError] = useState('');
  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [copiedMenuId, setCopiedMenuId] = useState<string | null>(null);
  const [dismissedChecklistIds, setDismissedChecklistIds] = useState<string[]>(() =>
    readDismissedHomeChecklistIds(restaurant.id),
  );

  const loadDashboard = useCallback(async () => {
    setStatus('loading');
    setLoadError('');

    try {
      const next = await fetchHomeDashboardData(
        restaurant.id,
        restaurant.slug,
        restaurant.updatedAt,
        isOwner,
      );
      setData(next);
      setStatus('ready');
    } catch (error) {
      setData(null);
      setStatus('error');
      setLoadError(
        error instanceof Error ? error.message : 'No se pudo cargar el resumen. Inténtalo de nuevo.',
      );
    }
  }, [isOwner, restaurant.id, restaurant.slug, restaurant.updatedAt]);

  useEffect(() => {
    let cancelled = false;

    setStatus('loading');
    setLoadError('');

    fetchHomeDashboardData(
      restaurant.id,
      restaurant.slug,
      restaurant.updatedAt,
      isOwner,
    )
      .then((next) => {
        if (cancelled) {
          return;
        }

        setData(next);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setData(null);
        setStatus('error');
        setLoadError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el resumen. Inténtalo de nuevo.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isOwner, restaurant.id, restaurant.slug, restaurant.updatedAt]);

  const checklist = useMemo(() => {
    if (!data) {
      return [];
    }

    return buildHomeChecklist({
      restaurant,
      menus: data.menus,
      itemCount: data.stats.itemCount,
      theme: data.theme,
      members: data.members,
      isOwner,
    });
  }, [data, isOwner, restaurant]);

  useEffect(() => {
    setDismissedChecklistIds(readDismissedHomeChecklistIds(restaurant.id));
  }, [restaurant.id]);

  const isChecklistItemComplete = useCallback(
    (item: HomeChecklistItem) => item.done || dismissedChecklistIds.includes(item.id),
    [dismissedChecklistIds],
  );

  const pendingChecklistCount = checklist.filter((item) => !isChecklistItemComplete(item)).length;

  const markChecklistItemDone = useCallback(
    (itemId: string) => {
      setDismissedChecklistIds((current) => {
        if (current.includes(itemId)) {
          return current;
        }

        const next = [...current, itemId];
        writeDismissedHomeChecklistIds(restaurant.id, next);
        return next;
      });
    },
    [restaurant.id],
  );

  const copyPublishedUrl = useCallback(async (menu: HomePublishedMenu) => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${menu.href}`
        : menu.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedMenuId(menu.id);
      window.setTimeout(() => setCopiedMenuId(null), 2000);
    } catch {
      setCopiedMenuId(null);
    }
  }, []);

  return {
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
  };
}
