import type { MiddlewareHandler } from "hono";
import { fail } from "../lib/response";
import type { AppEnv } from "../types";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return c.req.header("x-real-ip") ?? "unknown";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type RateLimitOptions = {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
};

export function createRateLimit(
  options: RateLimitOptions = {},
): MiddlewareHandler<AppEnv> {
  const keyPrefix = options.keyPrefix ?? "public";

  return async (c, next) => {
    const windowMs =
      options.windowMs ??
      parsePositiveInt(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS, 60_000);
    const max =
      options.max ??
      parsePositiveInt(process.env.PUBLIC_RATE_LIMIT_MAX, 100);

    const key = `${keyPrefix}:${getClientIp(c)}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return fail(c, "Too Many Requests", 429);
    }

    entry.count += 1;
    await next();
  };
}

export const publicRateLimit = createRateLimit({ keyPrefix: "public" });

/** Clears in-memory rate limit state (for tests). */
export function resetRateLimitStore(): void {
  store.clear();
}
