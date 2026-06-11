import type { RestaurantRole } from "../../generated/prisma/client";
import type { MiddlewareHandler } from "hono";
import { prisma } from "../lib/prisma";
import { fail } from "../lib/response";
import type { AppEnv } from "../types";

export const loadRestaurantMember: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    return fail(c, "Unauthorized", 401);
  }

  const restaurantId = c.req.param("id");
  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
  });

  if (!membership) {
    return fail(c, "Not Found", 404);
  }

  c.set("restaurantId", restaurantId);
  c.set("restaurantRole", membership.role);
  await next();
};

export function requireRole(...roles: RestaurantRole[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const role = c.get("restaurantRole");

    if (!role || !roles.includes(role)) {
      return fail(c, "Forbidden", 403);
    }

    await next();
  };
}

export const loadMenuMember: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    return fail(c, "Unauthorized", 401);
  }

  const menuId = c.req.param("id");
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { restaurantId: true },
  });

  if (!menu) {
    return fail(c, "Not Found", 404);
  }

  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId: menu.restaurantId },
    },
  });

  if (!membership) {
    return fail(c, "Not Found", 404);
  }

  c.set("restaurantId", menu.restaurantId);
  c.set("restaurantRole", membership.role);
  await next();
};

export const loadCategoryMember: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    return fail(c, "Unauthorized", 401);
  }

  const categoryId = c.req.param("id");
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      menu: { select: { restaurantId: true } },
    },
  });

  if (!category) {
    return fail(c, "Not Found", 404);
  }

  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: category.menu.restaurantId,
      },
    },
  });

  if (!membership) {
    return fail(c, "Not Found", 404);
  }

  c.set("restaurantId", category.menu.restaurantId);
  c.set("restaurantRole", membership.role);
  await next();
};
