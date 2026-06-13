import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Palette,
  Store,
  Users,
} from 'lucide-react';
import type { Menu, MenuItem, Member, Restaurant, Theme } from '../../lib/admin-api';

export type HomePageStatus = 'loading' | 'error' | 'ready';

export type HomeDashboardStats = {
  menuCount: number;
  publishedMenuCount: number;
  categoryCount: number;
  itemCount: number;
  unavailableItemCount: number;
  featuredItemCount: number;
  lastUpdatedAt: string | null;
};

export type HomeChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  ownerOnly?: boolean;
};

const HOME_CHECKLIST_DISMISSED_STORAGE_PREFIX = 'menu-smart:admin-home-checklist-dismissed:';

export function getHomeChecklistDismissedStorageKey(restaurantId: string): string {
  return `${HOME_CHECKLIST_DISMISSED_STORAGE_PREFIX}${restaurantId}`;
}

export function readDismissedHomeChecklistIds(restaurantId: string): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getHomeChecklistDismissedStorageKey(restaurantId));
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

export function writeDismissedHomeChecklistIds(restaurantId: string, ids: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    getHomeChecklistDismissedStorageKey(restaurantId),
    JSON.stringify(ids),
  );
}

export type HomeQuickLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconTone: 'restaurant' | 'menus' | 'theme' | 'members';
  ownerOnly?: boolean;
};

export type HomePublishedMenu = {
  id: string;
  name: string;
  slug: string;
  href: string;
};

const DEFAULT_THEME_COLORS = {
  primaryColor: '#10b981',
  secondaryColor: '#64748b',
  backgroundColor: '#f8fafc',
  textColor: '#0f172a',
  accentColor: '#dc2626',
  fontFamily: "'Inter', system-ui, sans-serif",
} as const;

export function buildHomeDashboardStats(
  menus: Menu[],
  categoryCount: number,
  items: MenuItem[],
  restaurantUpdatedAt: string,
): HomeDashboardStats {
  const timestamps = [
    restaurantUpdatedAt,
    ...menus.map((menu) => menu.updatedAt),
  ];

  return {
    menuCount: menus.length,
    publishedMenuCount: menus.filter((menu) => menu.isPublished).length,
    categoryCount,
    itemCount: items.length,
    unavailableItemCount: items.filter((item) => !item.isAvailable).length,
    featuredItemCount: items.filter((item) => item.isFeatured).length,
    lastUpdatedAt: timestamps.sort((a, b) => b.localeCompare(a))[0] ?? null,
  };
}

export function isThemeCustomized(theme: Theme | null): boolean {
  if (!theme) {
    return false;
  }

  return (
    theme.primaryColor !== DEFAULT_THEME_COLORS.primaryColor ||
    theme.secondaryColor !== DEFAULT_THEME_COLORS.secondaryColor ||
    theme.backgroundColor !== DEFAULT_THEME_COLORS.backgroundColor ||
    theme.textColor !== DEFAULT_THEME_COLORS.textColor ||
    theme.accentColor !== DEFAULT_THEME_COLORS.accentColor ||
    theme.fontFamily !== DEFAULT_THEME_COLORS.fontFamily
  );
}

export function buildPublishedMenus(
  restaurantSlug: string,
  menus: Menu[],
): HomePublishedMenu[] {
  return menus
    .filter((menu) => menu.isPublished)
    .map((menu) => ({
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      href: `/menu/${restaurantSlug}/${menu.slug}`,
    }));
}

export function buildHomeChecklist(input: {
  restaurant: Restaurant;
  menus: Menu[];
  itemCount: number;
  theme: Theme | null;
  members: Member[] | null;
  isOwner: boolean;
}): HomeChecklistItem[] {
  const { restaurant, menus, itemCount, theme, members, isOwner } = input;

  const items: HomeChecklistItem[] = [
    {
      id: 'restaurant',
      label: 'Configura los datos del restaurante',
      done: restaurant.description.trim().length > 0,
      href: '/admin/restaurant',
    },
    {
      id: 'menu',
      label: 'Crea tu primer menú',
      done: menus.length > 0,
      href: '/admin/menus',
    },
    {
      id: 'products',
      label: 'Añade productos a la carta',
      done: itemCount > 0,
      href: '/admin/menus',
    },
    {
      id: 'publish',
      label: 'Publica al menos un menú',
      done: menus.some((menu) => menu.isPublished),
      href: '/admin/menus',
    },
  ];

  if (isOwner) {
    items.push(
      {
        id: 'theme',
        label: 'Personaliza la apariencia del menú',
        done: isThemeCustomized(theme),
        href: '/admin/theme',
        ownerOnly: true,
      },
      {
        id: 'team',
        label: 'Invita a alguien de tu equipo',
        done: (members?.length ?? 0) > 1,
        href: '/admin/members',
        ownerOnly: true,
      },
    );
  }

  return items;
}

export const HOME_QUICK_LINKS: HomeQuickLink[] = [
  {
    href: '/admin/restaurant',
    label: 'Restaurante',
    description: 'Nombre, descripción y estado del negocio',
    icon: Store,
    iconTone: 'restaurant',
  },
  {
    href: '/admin/menus',
    label: 'Menús',
    description: 'Cartas, categorías y productos',
    icon: BookOpen,
    iconTone: 'menus',
  },
  {
    href: '/admin/theme',
    label: 'Apariencia',
    description: 'Colores y tipografía del menú público',
    icon: Palette,
    iconTone: 'theme',
    ownerOnly: true,
  },
  {
    href: '/admin/members',
    label: 'Equipo',
    description: 'Roles y acceso del staff',
    icon: Users,
    iconTone: 'members',
    ownerOnly: true,
  },
];

export function getGreetingName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return 'equipo';
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function formatRelativeUpdate(value: string): string {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  }

  return date.toLocaleDateString('es-ES', { dateStyle: 'medium' });
}
