import { Hono } from "hono";
import { ValidationError } from "../lib/errors";
import { ok } from "../lib/response";
import { requireAuth } from "../middleware/auth";
import { loadThemeMember, requireRole } from "../middleware/rbac";
import {
  applyThemePresetSchema,
  updateThemeSchema,
} from "../schemas/theme";
import {
  applyThemePreset,
  getThemeForMember,
  updateTheme,
} from "../services/theme";
import type { AppEnv } from "../types";

export const themeRoutes = new Hono<AppEnv>();

themeRoutes.use("*", requireAuth);

themeRoutes.get("/:restaurantId", loadThemeMember, async (c) => {
  const theme = await getThemeForMember(
    c.get("userId")!,
    c.req.param("restaurantId"),
  );
  return ok(c, theme);
});

themeRoutes.patch(
  "/:restaurantId",
  loadThemeMember,
  requireRole("OWNER"),
  async (c) => {
    const body = await c.req.json();
    const parsed = updateThemeSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const theme = await updateTheme(c.req.param("restaurantId"), parsed.data);
    return ok(c, theme);
  },
);

themeRoutes.post(
  "/:restaurantId/apply-preset",
  loadThemeMember,
  requireRole("OWNER"),
  async (c) => {
    const body = await c.req.json();
    const parsed = applyThemePresetSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const theme = await applyThemePreset(
      c.req.param("restaurantId"),
      parsed.data.preset,
    );
    return ok(c, theme);
  },
);
