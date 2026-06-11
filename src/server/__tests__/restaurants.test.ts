import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { prisma } from "../lib/prisma";
import {
  loginAs,
  resetTestDb,
  seedAuthUser,
  seedTestData,
  signInWith,
} from "../../test/helpers";

describe.sequential("Restaurants API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("GET /api/restaurants returns 401 without session", async () => {
    const res = await app.request("/api/restaurants");

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/restaurants returns empty array when user has no restaurant", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");
    const cookie = await signInWith("owner@test.com");

    const res = await app.request("/api/restaurants", {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("POST /api/restaurants creates restaurant with owner role and default theme", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");
    const cookie = await signInWith("owner@test.com");

    const res = await app.request("/api/restaurants", {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "La Casa del Sabor",
        description: "Comida casera",
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      name: "La Casa del Sabor",
      slug: "la-casa-del-sabor",
      description: "Comida casera",
      isActive: true,
      role: "OWNER",
    });

    const theme = await prisma.theme.findUnique({
      where: { restaurantId: json.data.id },
    });
    expect(theme).not.toBeNull();
    expect(theme?.primaryColor).toBe("#10b981");
  });

  it("POST /api/restaurants returns 409 when user already has a restaurant", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");
    const cookie = await signInWith("owner@test.com");

    const first = await app.request("/api/restaurants", {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "First Restaurant" }),
    });
    expect(first.status).toBe(201);

    const second = await app.request("/api/restaurants", {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Second Restaurant" }),
    });

    expect(second.status).toBe(409);
    const json = await second.json();
    expect(json).toEqual({
      success: false,
      error: { message: "User already belongs to a restaurant" },
    });
  });

  it("GET /api/restaurants/:id returns restaurant for member", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      id: restaurantId,
      name: "Test Restaurant",
      slug: "test-restaurant",
      role: "OWNER",
    });
  });

  it("GET /api/restaurants/:id returns 404 for non-member", async () => {
    const { restaurantId } = await seedTestData();
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      headers: { Cookie: otherCookie },
    });

    expect(res.status).toBe(404);
  });

  it("PATCH /api/restaurants/:id allows owner to update fields", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Updated Restaurant",
        isActive: false,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      name: "Updated Restaurant",
      isActive: false,
    });
  });

  it("PATCH /api/restaurants/:id returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      method: "PATCH",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Hacked Name" }),
    });

    expect(res.status).toBe(403);
  });

  it("DELETE /api/restaurants/:id allows owner and cascades data", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      method: "DELETE",
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: { deleted: true } });

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    expect(restaurant).toBeNull();

    const menus = await prisma.menu.count({
      where: { restaurantId },
    });
    expect(menus).toBe(0);
  });

  it("DELETE /api/restaurants/:id returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}`, {
      method: "DELETE",
      headers: { Cookie: staffCookie },
    });

    expect(res.status).toBe(403);
  });
});
