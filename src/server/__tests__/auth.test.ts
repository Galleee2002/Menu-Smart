import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { requireAuth, sessionMiddleware } from "../middleware/auth";
import { ok } from "../lib/response";
import type { AppEnv } from "../types";
import { loginAs, resetTestDb } from "../../test/helpers";

const testApp = new Hono<AppEnv>()
  .basePath("/api")
  .use("*", sessionMiddleware)
  .get("/protected", requireAuth, (c) => ok(c, { userId: c.get("userId") }));

describe.sequential("Better Auth", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("POST /api/auth/sign-up/email returns 200 with Set-Cookie", async () => {
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Owner",
        email: "owner@test.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/better-auth/);
  });

  it("POST /api/auth/sign-in/email returns 200 with session cookie", async () => {
    await loginAs("OWNER");

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@test.com",
        password: "password123",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/better-auth/);
  });

  it("GET /api/auth/get-session returns authenticated user with cookie", async () => {
    const cookie = await loginAs("OWNER");

    const res = await app.request("/api/auth/get-session", {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.user).toMatchObject({
      email: "owner@test.com",
      name: "Owner",
    });
  });

  it("POST /api/auth/sign-out invalidates session", async () => {
    const cookie = await loginAs("OWNER");

    const signOutRes = await app.request("/api/auth/sign-out", {
      method: "POST",
      headers: { Cookie: cookie },
    });

    expect(signOutRes.status).toBe(200);

    const sessionRes = await app.request("/api/auth/get-session", {
      headers: { Cookie: cookie },
    });

    const json = await sessionRes.json();
    expect(json).toBeNull();
  });

  it("requireAuth returns 401 without session cookie", async () => {
    const res = await testApp.request("/api/protected");

    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("requireAuth allows access with valid session", async () => {
    const cookie = await loginAs("OWNER");

    const res = await testApp.request("/api/protected", {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.userId).toBeTruthy();
  });

});
