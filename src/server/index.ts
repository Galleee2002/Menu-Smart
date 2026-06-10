import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { isAppError } from "./lib/errors";
import { getAllowedOrigins } from "./lib/env";
import { fail, ok } from "./lib/response";

export const app = new Hono().basePath("/api");

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

app.get("/health", (c) => ok(c, { status: "ok" }));

export default app;
