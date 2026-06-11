import type { MiddlewareHandler } from "hono";
import { auth } from "../lib/auth";
import type { AppEnv } from "../types";
import { fail } from "../lib/response";

export const sessionMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    c.set("userId", null);
    c.set("restaurantId", null);
    c.set("restaurantRole", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  c.set("userId", session.user.id);
  c.set("restaurantId", null);
  c.set("restaurantRole", null);
  await next();
};

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.get("userId")) {
    return fail(c, "Unauthorized", 401);
  }

  await next();
};
