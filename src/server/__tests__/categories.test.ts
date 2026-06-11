import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { prisma } from "../lib/prisma";
import {
  resetTestDb,
  seedAuthUser,
  seedTestData,
  signInWith,
} from "../../test/helpers";

describe.sequential("Categories API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  async function getStarterCategoryId(menuId: string): Promise<string> {
    const category = await prisma.category.findFirstOrThrow({
      where: { menuId, name: "Starters" },
    });
    return category.id;
  }

  it("GET /api/categories returns 401 without session", async () => {
    const res = await app.request("/api/categories?menuId=abc");

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/categories returns 400 without menuId", async () => {
    const { ownerCookie } = await seedTestData();

    const res = await app.request("/api/categories", {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("menuId");
  });

  it("GET /api/categories lists categories ordered by order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    await prisma.category.create({
      data: { menuId, name: "Desserts", order: 1 },
    });

    const res = await app.request(`/api/categories?menuId=${menuId}`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.data[0]).toMatchObject({
      id: categoryId,
      menuId,
      name: "Starters",
      order: 0,
    });
    expect(json.data[1].name).toBe("Desserts");
  });

  it("GET /api/categories returns 404 for non-member", async () => {
    const { menuId } = await seedTestData();
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/categories?menuId=${menuId}`, {
      headers: { Cookie: otherCookie },
    });

    expect(res.status).toBe(404);
  });

  it("POST /api/categories creates category with next order", async () => {
    const { menuId, ownerCookie } = await seedTestData();

    const res = await app.request("/api/categories", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menuId, name: "Mains" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({
      menuId,
      name: "Mains",
      order: 1,
    });
  });

  it("POST /api/categories allows staff to create", async () => {
    const { menuId, staffCookie } = await seedTestData();

    const res = await app.request("/api/categories", {
      method: "POST",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menuId, name: "Drinks", order: 5 }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("Drinks");
    expect(json.data.order).toBe(5);
  });

  it("PATCH /api/categories/:id updates name and order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    const res = await app.request(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Appetizers", order: 2 }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      id: categoryId,
      name: "Appetizers",
      order: 2,
    });
  });

  it("PATCH /api/categories/:id returns 404 for non-member", async () => {
    const { menuId } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: {
        Cookie: otherCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Hacked" }),
    });

    expect(res.status).toBe(404);
  });

  it("DELETE /api/categories/:id cascades items", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    const res = await app.request(`/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: { deleted: true } });

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    expect(category).toBeNull();

    const items = await prisma.menuItem.count({ where: { categoryId } });
    expect(items).toBe(0);
  });

  it("DELETE /api/categories/:id allows staff", async () => {
    const { menuId, staffCookie } = await seedTestData();
    const category = await prisma.category.create({
      data: { menuId, name: "Temp", order: 9 },
    });

    const res = await app.request(`/api/categories/${category.id}`, {
      method: "DELETE",
      headers: { Cookie: staffCookie },
    });

    expect(res.status).toBe(200);
  });

  it("PATCH /api/categories/reorder updates batch order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const startersId = await getStarterCategoryId(menuId);
    const desserts = await prisma.category.create({
      data: { menuId, name: "Desserts", order: 1 },
    });

    const res = await app.request("/api/categories/reorder", {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId,
        items: [
          { id: desserts.id, order: 0 },
          { id: startersId, order: 1 },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([
      expect.objectContaining({ id: desserts.id, order: 0 }),
      expect.objectContaining({ id: startersId, order: 1 }),
    ]);
  });

  it("PATCH /api/categories/reorder rejects categories from another menu", async () => {
    const { menuId, ownerCookie, restaurantId } = await seedTestData();
    const startersId = await getStarterCategoryId(menuId);
    const otherMenu = await prisma.menu.create({
      data: {
        restaurantId,
        name: "Other Menu",
        slug: "other",
      },
    });
    const foreignCategory = await prisma.category.create({
      data: { menuId: otherMenu.id, name: "Foreign", order: 0 },
    });

    const res = await app.request("/api/categories/reorder", {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId,
        items: [
          { id: startersId, order: 0 },
          { id: foreignCategory.id, order: 1 },
        ],
      }),
    });

    expect(res.status).toBe(400);
  });
});
