import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/auth";
import { loadRestaurantMember, requireRole } from "../middleware/rbac";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "../schemas/restaurant";
import { memberRoutes } from "./members";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantForMember,
  listUserRestaurants,
  updateRestaurant,
} from "../services/restaurant";
import type { AppEnv } from "../types";

export const restaurantRoutes = new Hono<AppEnv>();

restaurantRoutes.use("*", requireAuth);

restaurantRoutes.get("/", async (c) => {
  const userId = c.get("userId")!;
  const restaurants = await listUserRestaurants(userId);
  return ok(c, restaurants);
});

restaurantRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createRestaurantSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const restaurant = await createRestaurant(c.get("userId")!, parsed.data);
  return ok(c, restaurant, 201);
});

restaurantRoutes.use(
  "/:id/members",
  loadRestaurantMember,
  requireRole("OWNER"),
);
restaurantRoutes.use(
  "/:id/members/*",
  loadRestaurantMember,
  requireRole("OWNER"),
);
restaurantRoutes.route("/:id/members", memberRoutes);

restaurantRoutes.get("/:id", loadRestaurantMember, async (c) => {
  const restaurant = await getRestaurantForMember(
    c.get("userId")!,
    c.req.param("id"),
  );
  return ok(c, restaurant);
});

restaurantRoutes.patch(
  "/:id",
  loadRestaurantMember,
  requireRole("OWNER"),
  async (c) => {
    const body = await c.req.json();
    const parsed = updateRestaurantSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const restaurant = await updateRestaurant(c.req.param("id"), parsed.data);
    return ok(c, restaurant);
  },
);

restaurantRoutes.delete(
  "/:id",
  loadRestaurantMember,
  requireRole("OWNER"),
  async (c) => {
    await deleteRestaurant(c.req.param("id"));
    return ok(c, { deleted: true });
  },
);
