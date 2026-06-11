import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/auth";
import { loadItemMember, requireRole } from "../middleware/rbac";
import {
  bulkPricingSchema,
  createItemSchema,
  reorderItemsSchema,
  updateItemSchema,
} from "../schemas/item";
import {
  bulkUpdatePricing,
  createItem,
  deleteItem,
  listItems,
  reorderItems,
  updateItem,
} from "../services/item";
import type { AppEnv } from "../types";

export const itemRoutes = new Hono<AppEnv>();

itemRoutes.use("*", requireAuth);

itemRoutes.get("/", async (c) => {
  const categoryId = c.req.query("categoryId");
  const menuId = c.req.query("menuId");

  const items = await listItems(c.get("userId")!, { categoryId, menuId });
  return ok(c, items);
});

itemRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const item = await createItem(c.get("userId")!, parsed.data);
  return ok(c, item, 201);
});

itemRoutes.post("/bulk-pricing", async (c) => {
  const body = await c.req.json();
  const parsed = bulkPricingSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const result = await bulkUpdatePricing(c.get("userId")!, parsed.data);
  return ok(c, result);
});

itemRoutes.patch("/reorder", async (c) => {
  const body = await c.req.json();
  const parsed = reorderItemsSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const items = await reorderItems(c.get("userId")!, parsed.data);
  return ok(c, items);
});

itemRoutes.patch(
  "/:id",
  loadItemMember,
  requireRole("OWNER", "STAFF"),
  async (c) => {
    const body = await c.req.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const item = await updateItem(
      c.req.param("id"),
      c.get("restaurantId")!,
      parsed.data,
    );
    return ok(c, item);
  },
);

itemRoutes.delete(
  "/:id",
  loadItemMember,
  requireRole("OWNER", "STAFF"),
  async (c) => {
    await deleteItem(c.req.param("id"));
    return ok(c, { deleted: true });
  },
);
