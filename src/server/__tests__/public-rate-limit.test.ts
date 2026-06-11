import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { resetRateLimitStore } from "../middleware/rate-limit";
import { resetTestDb, seedTestData } from "../../test/helpers";

describe.sequential("Public API rate limit", () => {
  beforeEach(async () => {
    await resetTestDb();
    resetRateLimitStore();
    process.env.PUBLIC_RATE_LIMIT_MAX = "3";
    process.env.PUBLIC_RATE_LIMIT_WINDOW_MS = "60000";
  });

  afterEach(() => {
    delete process.env.PUBLIC_RATE_LIMIT_MAX;
    delete process.env.PUBLIC_RATE_LIMIT_WINDOW_MS;
    resetRateLimitStore();
  });

  it("rate limits public menu after max requests per IP", async () => {
    await seedTestData();

    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await app.request(
        "/api/public/menu/test-restaurant/main",
        {
          headers: { "x-forwarded-for": "203.0.113.1" },
        },
      );
      statuses.push(res.status);
    }

    expect(statuses.filter((s) => s === 200).length).toBe(3);
    expect(statuses).toContain(429);

    const limited = await app.request(
      "/api/public/menu/test-restaurant/main",
      {
        headers: { "x-forwarded-for": "203.0.113.1" },
      },
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    const json = await limited.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Too Many Requests" },
    });
  });
});
