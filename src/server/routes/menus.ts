import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/auth";
import { loadMenuMember, requireRole } from "../middleware/rbac";
import { createMenuSchema, updateMenuSchema } from "../schemas/menu";
import { createMenu, deleteMenu, listMenus, updateMenu } from "../services/menu";
import type { AppEnv } from "../types";

export const menuRoutes = new Hono<AppEnv>();

menuRoutes.use("*", requireAuth);

menuRoutes.get("/", async (c) => {
  const restaurantId = c.req.query("restaurantId");
  const menus = await listMenus(c.get("userId")!, restaurantId);
  return ok(c, menus);
});

menuRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createMenuSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const menu = await createMenu(c.get("userId")!, parsed.data);
  return ok(c, menu, 201);
});

menuRoutes.patch(
  "/:id",
  loadMenuMember,
  requireRole("OWNER", "STAFF"),
  async (c) => {
    const body = await c.req.json();
    const parsed = updateMenuSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const menu = await updateMenu(
      c.req.param("id"),
      c.get("restaurantId")!,
      parsed.data,
    );
    return ok(c, menu);
  },
);

menuRoutes.delete(
  "/:id",
  loadMenuMember,
  requireRole("OWNER"),
  async (c) => {
    await deleteMenu(c.req.param("id"));
    return ok(c, { deleted: true });
  },
);
