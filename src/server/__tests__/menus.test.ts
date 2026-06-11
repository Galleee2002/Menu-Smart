import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { prisma } from "../lib/prisma";
import {
  resetTestDb,
  seedAuthUser,
  seedTestData,
  signInWith,
} from "../../test/helpers";

describe.sequential("Menus API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("GET /api/menus returns 401 without session", async () => {
    const res = await app.request("/api/menus");

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/menus returns empty array when user has no restaurant", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");
    const cookie = await signInWith("owner@test.com");

    const res = await app.request("/api/menus", {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("GET /api/menus lists menus for the user's restaurant", async () => {
    const { menuId, ownerCookie } = await seedTestData();

    const res = await app.request("/api/menus", {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]).toMatchObject({
      id: menuId,
      name: "Main Menu",
      slug: "main",
      isPublished: true,
    });
  });

  it("GET /api/menus filters by restaurantId query param", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/menus?restaurantId=${restaurantId}`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].restaurantId).toBe(restaurantId);
  });

  it("GET /api/menus returns empty array for non-member restaurantId", async () => {
    const { ownerCookie } = await seedTestData();
    await seedAuthUser("other@test.com", "Other", "password123");
    const other = await prisma.user.findUniqueOrThrow({
      where: { email: "other@test.com" },
    });
    const otherRestaurant = await prisma.restaurant.create({
      data: {
        name: "Other Restaurant",
        slug: "other-restaurant",
        members: {
          create: { userId: other.id, role: "OWNER" },
        },
      },
    });

    const res = await app.request(
      `/api/menus?restaurantId=${otherRestaurant.id}`,
      {
        headers: { Cookie: ownerCookie },
      },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: [] });
  });

  it("POST /api/menus creates menu with generated slug", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request("/api/menus", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Carta de Vinos" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({
      name: "Carta de Vinos",
      slug: "carta-de-vinos",
      isPublished: false,
      restaurantId,
    });
  });

  it("POST /api/menus allows staff to create menus", async () => {
    const { staffCookie } = await seedTestData();

    const res = await app.request("/api/menus", {
      method: "POST",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Lunch Menu" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("Lunch Menu");
  });

  it("POST /api/menus returns 404 when user has no restaurant", async () => {
    await seedAuthUser("owner@test.com", "Owner", "password123");
    const cookie = await signInWith("owner@test.com");

    const res = await app.request("/api/menus", {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "New Menu" }),
    });

    expect(res.status).toBe(404);
  });

  it("POST /api/menus returns 409 when slug is taken in restaurant", async () => {
    const { ownerCookie } = await seedTestData();

    const res = await app.request("/api/menus", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Duplicate", slug: "main" }),
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Slug already taken" },
    });
  });

  it("PATCH /api/menus/:id allows owner and staff to update", async () => {
    const { menuId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Updated Menu",
        isPublished: false,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      name: "Updated Menu",
      isPublished: false,
    });
  });

  it("PATCH /api/menus/:id returns 404 for non-member", async () => {
    const { menuId } = await seedTestData();
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: {
        Cookie: otherCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Hacked" }),
    });

    expect(res.status).toBe(404);
  });

  it("DELETE /api/menus/:id allows owner and cascades categories/items", async () => {
    const { menuId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/menus/${menuId}`, {
      method: "DELETE",
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: { deleted: true } });

    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    expect(menu).toBeNull();

    const categories = await prisma.category.count({ where: { menuId } });
    expect(categories).toBe(0);
  });

  it("DELETE /api/menus/:id returns 403 for staff", async () => {
    const { menuId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/menus/${menuId}`, {
      method: "DELETE",
      headers: { Cookie: staffCookie },
    });

    expect(res.status).toBe(403);
  });
});
