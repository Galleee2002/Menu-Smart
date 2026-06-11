import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { THEME_PRESETS } from "../lib/theme-presets";
import { DEFAULT_THEME } from "../lib/theme-defaults";
import {
  resetTestDb,
  seedAuthUser,
  seedTestData,
  signInWith,
} from "../../test/helpers";

describe.sequential("Themes API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("GET /api/themes/:restaurantId returns 401 without session", async () => {
    const res = await app.request("/api/themes/abc");

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/themes/:restaurantId returns 404 for non-member", async () => {
    const { restaurantId } = await seedTestData();
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/themes/${restaurantId}`, {
      headers: { Cookie: otherCookie },
    });

    expect(res.status).toBe(404);
  });

  it("GET /api/themes/:restaurantId returns theme for owner and staff", async () => {
    const { restaurantId, ownerCookie, staffCookie } = await seedTestData();

    for (const cookie of [ownerCookie, staffCookie]) {
      const res = await app.request(`/api/themes/${restaurantId}`, {
        headers: { Cookie: cookie },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toMatchObject({
        restaurantId,
        primaryColor: DEFAULT_THEME.primaryColor,
        secondaryColor: DEFAULT_THEME.secondaryColor,
        backgroundColor: DEFAULT_THEME.backgroundColor,
        textColor: DEFAULT_THEME.textColor,
        accentColor: DEFAULT_THEME.accentColor,
        fontFamily: DEFAULT_THEME.fontFamily,
      });
      expect(json.data.id).toBeTypeOf("string");
      expect(json.data.createdAt).toBeTypeOf("string");
      expect(json.data.updatedAt).toBeTypeOf("string");
    }
  });

  it("PATCH /api/themes/:restaurantId returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/themes/${restaurantId}`, {
      method: "PATCH",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ primaryColor: "#000000" }),
    });

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.message).toBe("Forbidden");
  });

  it("PATCH /api/themes/:restaurantId updates theme for owner", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/themes/${restaurantId}`, {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        primaryColor: "#ff0000",
        fontFamily: "'Roboto', sans-serif",
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      restaurantId,
      primaryColor: "#ff0000",
      fontFamily: "'Roboto', sans-serif",
      secondaryColor: DEFAULT_THEME.secondaryColor,
    });
  });

  it("PATCH /api/themes/:restaurantId returns 400 for invalid body", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/themes/${restaurantId}`, {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ primaryColor: "not-a-color" }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("Invalid hex color");
  });

  it("POST /api/themes/:restaurantId/apply-preset returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();

    const res = await app.request(
      `/api/themes/${restaurantId}/apply-preset`,
      {
        method: "POST",
        headers: {
          Cookie: staffCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preset: "dark" }),
      },
    );

    expect(res.status).toBe(403);
  });

  it("POST /api/themes/:restaurantId/apply-preset applies preset for owner", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(
      `/api/themes/${restaurantId}/apply-preset`,
      {
        method: "POST",
        headers: {
          Cookie: ownerCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preset: "warm" }),
      },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      restaurantId,
      ...THEME_PRESETS.warm,
    });
  });

  it("POST /api/themes/:restaurantId/apply-preset returns 400 for invalid preset", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(
      `/api/themes/${restaurantId}/apply-preset`,
      {
        method: "POST",
        headers: {
          Cookie: ownerCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preset: "unknown" }),
      },
    );

    expect(res.status).toBe(400);
  });
});
