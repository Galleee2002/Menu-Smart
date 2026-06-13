import { createElement, type ComponentType } from 'react';
import { AdminHomePage } from './AdminHomePage';
import { AdminMenusPage } from './AdminMenusPage';
import { AdminPlaceholderPage } from './AdminPlaceholderPage';
import { AdminRestaurantPage } from './AdminRestaurantPage';

function createPlaceholderPage(title: string, description?: string): ComponentType {
  return function PlaceholderPage() {
    return createElement(AdminPlaceholderPage, { title, description });
  };
}

const ADMIN_PAGES: Record<string, ComponentType> = {
  '/admin': AdminHomePage,
  '/admin/restaurant': AdminRestaurantPage,
  '/admin/menus': AdminMenusPage,
  '/admin/theme': createPlaceholderPage(
    'Apariencia',
    'Personaliza colores, tipografía y estilo visual del menú público.',
  ),
  '/admin/members': createPlaceholderPage(
    'Equipo',
    'Invita empleados y administra los roles de tu restaurante.',
  ),
};

export function getAdminPage(pathname: string): ComponentType | null {
  return ADMIN_PAGES[pathname] ?? null;
}
