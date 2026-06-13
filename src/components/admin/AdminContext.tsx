import { createContext, useContext, type ReactNode } from 'react';
import type { AuthUser } from '../../lib/auth-api';
import type { Restaurant, RestaurantRole } from '../../lib/admin-api';

export type AdminContextValue = {
  user: AuthUser;
  restaurant: Restaurant;
  role: RestaurantRole;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

interface AdminProviderProps {
  value: AdminContextValue;
  children: ReactNode;
}

export function AdminProvider({ value, children }: AdminProviderProps) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin debe usarse dentro de AdminProvider.');
  }

  return context;
}
