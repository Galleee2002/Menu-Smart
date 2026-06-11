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
