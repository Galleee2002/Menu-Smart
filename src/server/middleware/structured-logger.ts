import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types";

export const structuredLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  const start = Date.now();

  await next();

  const logEntry = {
    timestamp: new Date().toISOString(),
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - start,
  };

  console.log(JSON.stringify(logEntry));
};
