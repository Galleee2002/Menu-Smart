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

export async function getRestaurant(id: string): Promise<ApiResult<Restaurant>> {
  const res = await fetch(`/api/restaurants/${id}`, { credentials: 'include' });
  return parseApiResponse<Restaurant>(res);
}

export type UpdateRestaurantInput = {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
};

export async function updateRestaurant(
  id: string,
  input: UpdateRestaurantInput,
): Promise<ApiResult<Restaurant>> {
  const res = await fetch(`/api/restaurants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Restaurant>(res);
}

export async function deleteRestaurant(
  id: string,
): Promise<ApiResult<{ deleted: true }>> {
  const res = await fetch(`/api/restaurants/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return parseApiResponse<{ deleted: true }>(res);
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

export type CreateMenuInput = {
  name: string;
  slug?: string;
  restaurantId?: string;
  isPublished?: boolean;
};

export async function createMenu(input: CreateMenuInput): Promise<ApiResult<Menu>> {
  const res = await fetch('/api/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Menu>(res);
}

export type UpdateMenuInput = {
  name?: string;
  slug?: string;
  isPublished?: boolean;
};

export async function updateMenu(
  id: string,
  input: UpdateMenuInput,
): Promise<ApiResult<Menu>> {
  const res = await fetch(`/api/menus/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Menu>(res);
}

export async function deleteMenu(id: string): Promise<ApiResult<{ deleted: true }>> {
  const res = await fetch(`/api/menus/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return parseApiResponse<{ deleted: true }>(res);
}

export type Category = {
  id: string;
  menuId: string;
  name: string;
  order: number;
};

export type CreateCategoryInput = {
  menuId: string;
  name: string;
  order?: number;
};

export async function listCategories(menuId: string): Promise<ApiResult<Category[]>> {
  const params = new URLSearchParams({ menuId });
  const res = await fetch(`/api/categories?${params.toString()}`, {
    credentials: 'include',
  });

  return parseApiResponse<Category[]>(res);
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ApiResult<Category>> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Category>(res);
}

export type UpdateCategoryInput = {
  name?: string;
  order?: number;
};

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ApiResult<Category>> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Category>(res);
}

export async function deleteCategory(
  id: string,
): Promise<ApiResult<{ deleted: true }>> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return parseApiResponse<{ deleted: true }>(res);
}

export type ReorderCategoriesInput = {
  menuId: string;
  items: { id: string; order: number }[];
};

export async function reorderCategories(
  input: ReorderCategoriesInput,
): Promise<ApiResult<Category[]>> {
  const res = await fetch('/api/categories/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<Category[]>(res);
}

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  order: number;
};

export type CreateItemInput = {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  allergens?: string[];
  order?: number;
};

export type ListItemsParams =
  | { categoryId: string; menuId?: never }
  | { menuId: string; categoryId?: never };

export async function listItems(params: ListItemsParams): Promise<ApiResult<MenuItem[]>> {
  const searchParams = new URLSearchParams();

  if ('categoryId' in params && params.categoryId) {
    searchParams.set('categoryId', params.categoryId);
  } else if ('menuId' in params && params.menuId) {
    searchParams.set('menuId', params.menuId);
  }

  const res = await fetch(`/api/items?${searchParams.toString()}`, {
    credentials: 'include',
  });

  return parseApiResponse<MenuItem[]>(res);
}

export async function createItem(input: CreateItemInput): Promise<ApiResult<MenuItem>> {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<MenuItem>(res);
}

export type UpdateItemInput = {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  allergens?: string[];
  order?: number;
};

export async function updateItem(
  id: string,
  input: UpdateItemInput,
): Promise<ApiResult<MenuItem>> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<MenuItem>(res);
}

export async function deleteItem(id: string): Promise<ApiResult<{ deleted: true }>> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return parseApiResponse<{ deleted: true }>(res);
}

export type ReorderItemsInput = {
  categoryId: string;
  items: { id: string; order: number }[];
};

export async function reorderItems(
  input: ReorderItemsInput,
): Promise<ApiResult<MenuItem[]>> {
  const res = await fetch('/api/items/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<MenuItem[]>(res);
}

export type BulkPricingInput =
  | {
      scope: 'menu';
      mode: 'percentage' | 'fixed';
      value: number;
      menuId: string;
    }
  | {
      scope: 'category';
      mode: 'percentage' | 'fixed';
      value: number;
      categoryId: string;
    }
  | {
      scope: 'restaurant';
      mode: 'percentage' | 'fixed';
      value: number;
      restaurantId: string;
    };

export async function bulkPricing(
  input: BulkPricingInput,
): Promise<ApiResult<{ updatedCount: number }>> {
  const res = await fetch('/api/items/bulk-pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseApiResponse<{ updatedCount: number }>(res);
}
