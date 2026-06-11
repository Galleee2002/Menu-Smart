import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { isAppError } from "./lib/errors";
import { getAllowedOrigins } from "./lib/env";
import { fail, ok } from "./lib/response";
import { sessionMiddleware } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import { restaurantRoutes } from "./routes/restaurants";
import type { AppEnv } from "./types";

export type { AppEnv } from "./types";

export const app = new Hono<AppEnv>().basePath("/api");

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }),
);

app.onError((err, c) => {
  console.error(err);

  if (isAppError(err)) {
    return fail(c, err.message, err.status);
  }

  const message =
    err instanceof Error ? err.message : "Internal Server Error";
  return fail(c, message, 500);
});

app.notFound((c) => fail(c, "Not Found", 404));

app.use("*", sessionMiddleware);
app.route("/auth", authRoutes);
app.route("/restaurants", restaurantRoutes);

app.get("/health", (c) => ok(c, { status: "ok" }));

export default app;
