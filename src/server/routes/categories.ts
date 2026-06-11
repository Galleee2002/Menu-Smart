import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/auth";
import { loadCategoryMember, requireRole } from "../middleware/rbac";
import {
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "../schemas/category";
import {
  createCategory,
  deleteCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from "../services/category";
import type { AppEnv } from "../types";

export const categoryRoutes = new Hono<AppEnv>();

categoryRoutes.use("*", requireAuth);

categoryRoutes.get("/", async (c) => {
  const menuId = c.req.query("menuId");
  if (!menuId) {
    throw new ValidationError("menuId query parameter is required");
  }

  const categories = await listCategories(c.get("userId")!, menuId);
  return ok(c, categories);
});

categoryRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => issue.message).join(", "),
    );
  }

  const category = await createCategory(c.get("userId")!, parsed.data);
  return ok(c, category, 201);
});

categoryRoutes.patch(
  "/reorder",
  async (c) => {
    const body = await c.req.json();
    const parsed = reorderCategoriesSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const categories = await reorderCategories(c.get("userId")!, parsed.data);
    return ok(c, categories);
  },
);

categoryRoutes.patch(
  "/:id",
  loadCategoryMember,
  requireRole("OWNER", "STAFF"),
  async (c) => {
    const body = await c.req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const category = await updateCategory(
      c.req.param("id"),
      c.get("restaurantId")!,
      parsed.data,
    );
    return ok(c, category);
  },
);

categoryRoutes.delete(
  "/:id",
  loadCategoryMember,
  requireRole("OWNER", "STAFF"),
  async (c) => {
    await deleteCategory(c.req.param("id"));
    return ok(c, { deleted: true });
  },
);
