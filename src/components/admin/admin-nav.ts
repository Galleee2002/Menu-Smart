import {
  BookOpen,
  LayoutDashboard,
  Palette,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  exact?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/restaurant', label: 'Restaurante', icon: Store },
  { href: '/admin/menus', label: 'Menús', icon: BookOpen },
  { href: '/admin/theme', label: 'Apariencia', icon: Palette, ownerOnly: true },
  { href: '/admin/members', label: 'Equipo', icon: Users, ownerOnly: true },
];

export function isNavItemActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
