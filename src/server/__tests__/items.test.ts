import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { prisma } from "../lib/prisma";
import {
  resetTestDb,
  seedAuthUser,
  seedTestData,
  signInWith,
} from "../../test/helpers";

describe.sequential("Items API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  async function getStarterCategoryId(menuId: string): Promise<string> {
    const category = await prisma.category.findFirstOrThrow({
      where: { menuId, name: "Starters" },
    });
    return category.id;
  }

  async function getSoupItemId(categoryId: string): Promise<string> {
    const item = await prisma.menuItem.findFirstOrThrow({
      where: { categoryId, name: "Soup" },
    });
    return item.id;
  }

  it("GET /api/items returns 401 without session", async () => {
    const res = await app.request("/api/items?categoryId=abc");

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/items returns 400 without categoryId or menuId", async () => {
    const { ownerCookie } = await seedTestData();

    const res = await app.request("/api/items", {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("categoryId or menuId");
  });

  it("GET /api/items lists items by category ordered by order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const soupId = await getSoupItemId(categoryId);

    await prisma.menuItem.create({
      data: {
        categoryId,
        name: "Salad",
        price: 7.5,
        order: 1,
      },
    });

    const res = await app.request(`/api/items?categoryId=${categoryId}`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.data[0]).toMatchObject({
      id: soupId,
      categoryId,
      name: "Soup",
      price: "5.99",
      order: 0,
    });
    expect(json.data[1].name).toBe("Salad");
  });

  it("GET /api/items lists items by menuId", async () => {
    const { menuId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/items?menuId=${menuId}`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Soup");
  });

  it("GET /api/items returns 404 for non-member", async () => {
    const { menuId } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/items?categoryId=${categoryId}`, {
      headers: { Cookie: otherCookie },
    });

    expect(res.status).toBe(404);
  });

  it("POST /api/items creates item with next order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    const res = await app.request("/api/items", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId,
        name: "Bruschetta",
        price: 8.5,
        allergens: ["gluten"],
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({
      categoryId,
      name: "Bruschetta",
      price: "8.50",
      order: 1,
      isAvailable: true,
      isFeatured: false,
      allergens: ["gluten"],
    });
  });

  it("POST /api/items allows staff to create", async () => {
    const { menuId, staffCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    const res = await app.request("/api/items", {
      method: "POST",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId,
        name: "Carpaccio",
        price: 12,
        isFeatured: true,
      }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.isFeatured).toBe(true);
  });

  it("POST /api/items rejects invalid price decimals", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);

    const res = await app.request("/api/items", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId,
        name: "Bad Price",
        price: 9.999,
      }),
    });

    expect(res.status).toBe(400);
  });

  it("PATCH /api/items/:id updates fields", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const itemId = await getSoupItemId(categoryId);

    const res = await app.request(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Tomato Soup",
        price: 6.25,
        isAvailable: false,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      id: itemId,
      name: "Tomato Soup",
      price: "6.25",
      isAvailable: false,
    });
  });

  it("PATCH /api/items/:id returns 404 for non-member", async () => {
    const { menuId } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const itemId = await getSoupItemId(categoryId);
    await seedAuthUser("other@test.com", "Other", "password123");
    const otherCookie = await signInWith("other@test.com");

    const res = await app.request(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: {
        Cookie: otherCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Hacked" }),
    });

    expect(res.status).toBe(404);
  });

  it("DELETE /api/items/:id removes item", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const itemId = await getSoupItemId(categoryId);

    const res = await app.request(`/api/items/${itemId}`, {
      method: "DELETE",
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: { deleted: true } });

    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    expect(item).toBeNull();
  });

  it("DELETE /api/items/:id allows staff", async () => {
    const { menuId, staffCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const item = await prisma.menuItem.create({
      data: { categoryId, name: "Temp", price: 3, order: 5 },
    });

    const res = await app.request(`/api/items/${item.id}`, {
      method: "DELETE",
      headers: { Cookie: staffCookie },
    });

    expect(res.status).toBe(200);
  });

  it("PATCH /api/items/reorder updates batch order", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const soupId = await getSoupItemId(categoryId);
    const salad = await prisma.menuItem.create({
      data: { categoryId, name: "Salad", price: 7, order: 1 },
    });

    const res = await app.request("/api/items/reorder", {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId,
        items: [
          { id: salad.id, order: 0 },
          { id: soupId, order: 1 },
        ],
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([
      expect.objectContaining({ id: salad.id, order: 0 }),
      expect.objectContaining({ id: soupId, order: 1 }),
    ]);
  });

  it("PATCH /api/items/reorder rejects items from another category", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const startersId = await getStarterCategoryId(menuId);
    const soupId = await getSoupItemId(startersId);
    const desserts = await prisma.category.create({
      data: { menuId, name: "Desserts", order: 1 },
    });
    const cake = await prisma.menuItem.create({
      data: { categoryId: desserts.id, name: "Cake", price: 5, order: 0 },
    });

    const res = await app.request("/api/items/reorder", {
      method: "PATCH",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: startersId,
        items: [
          { id: soupId, order: 0 },
          { id: cake.id, order: 1 },
        ],
      }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /api/items/bulk-pricing applies percentage to menu scope", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const itemId = await getSoupItemId(categoryId);

    const res = await app.request("/api/items/bulk-pricing", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "menu",
        menuId,
        mode: "percentage",
        value: 10,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.updatedCount).toBe(1);

    const item = await prisma.menuItem.findUniqueOrThrow({ where: { id: itemId } });
    expect(item.price.toFixed(2)).toBe("6.59");
  });

  it("POST /api/items/bulk-pricing applies fixed adjustment to category scope", async () => {
    const { menuId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    const itemId = await getSoupItemId(categoryId);

    const res = await app.request("/api/items/bulk-pricing", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "category",
        categoryId,
        mode: "fixed",
        value: 1.5,
      }),
    });

    expect(res.status).toBe(200);

    const item = await prisma.menuItem.findUniqueOrThrow({ where: { id: itemId } });
    expect(item.price.toFixed(2)).toBe("7.49");
  });

  it("POST /api/items/bulk-pricing applies to entire restaurant", async () => {
    const { menuId, restaurantId, ownerCookie } = await seedTestData();
    const categoryId = await getStarterCategoryId(menuId);
    await prisma.menuItem.create({
      data: { categoryId, name: "Salad", price: 10, order: 1 },
    });

    const res = await app.request("/api/items/bulk-pricing", {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "restaurant",
        restaurantId,
        mode: "fixed",
        value: -1,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.updatedCount).toBe(2);

    const items = await prisma.menuItem.findMany({
      where: { category: { menu: { restaurantId } } },
      orderBy: { name: "asc" },
    });
    expect(items.map((item) => item.price.toFixed(2))).toEqual(["9.00", "4.99"]);
  });
});
