import { Hono } from "hono";
import { ok } from "../lib/response";
import { publicRateLimit } from "../middleware/rate-limit";
import { getPublicMenu } from "../services/public-menu";
import type { AppEnv } from "../types";

const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.use("*", publicRateLimit);

publicRoutes.get("/menu/:restaurantSlug/:menuSlug", async (c) => {
  const data = await getPublicMenu(
    c.req.param("restaurantSlug"),
    c.req.param("menuSlug"),
  );

  c.header("Cache-Control", CACHE_CONTROL);
  return ok(c, data);
});
