import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { resetTestDb, seedAuthUser } from "../../test/helpers";

describe.sequential("Better Auth rate limit", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("rate limits sign-in after 5 attempts in 10 seconds", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");

    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await app.request("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "owner@test.com",
          password: "wrong-password",
        }),
      });
      statuses.push(res.status);
    }

    expect(statuses).toContain(429);
  });
});
