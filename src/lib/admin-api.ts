export type RestaurantRole = 'OWNER' | 'STAFF';

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: RestaurantRole;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { message: string } };

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function parseApiResponse<T>(res: Response): Promise<ApiResult<T>> {
  try {
    const body: unknown = await res.json();

    if (typeof body === 'object' && body !== null && 'success' in body) {
      if (body.success === true && 'data' in body) {
        return { ok: true, data: (body as ApiSuccess<T>).data };
      }

      if (body.success === false && 'error' in body) {
        const error = (body as ApiFailure).error;
        return {
          ok: false,
          message: typeof error?.message === 'string' ? error.message : 'Error desconocido.',
        };
      }
    }
  } catch {
    // Fall through.
  }

  if (res.status === 401) {
    return { ok: false, message: 'Sesión expirada. Inicia sesión de nuevo.' };
  }

  return { ok: false, message: 'No se pudo completar la operación. Inténtalo de nuevo.' };
}

export async function listRestaurants(): Promise<ApiResult<Restaurant[]>> {
  const res = await fetch('/api/restaurants', { credentials: 'include' });
  return parseApiResponse<Restaurant[]>(res);
}

export type CreateRestaurantInput = {
  name: string;
  description?: string;
  slug?: string;
};

export async function createRestaurant(
  input: CreateRestaurantInput,
): Promise<ApiResult<Restaurant>> {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Restaurant>(res);
}

export type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listMenus(restaurantId: string): Promise<ApiResult<Menu[]>> {
  const params = new URLSearchParams({ restaurantId });
  const res = await fetch(`/api/menus?${params.toString()}`, {
    credentials: 'include',
  });

  return parseApiResponse<Menu[]>(res);
}
