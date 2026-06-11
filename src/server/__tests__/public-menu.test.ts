import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { DEFAULT_THEME } from "../lib/theme-defaults";
import { prisma } from "../lib/prisma";
import { resetTestDb, seedTestData } from "../../test/helpers";

describe.sequential("Public menu API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("GET /api/public/menu/:restaurantSlug/:menuSlug returns published menu without auth", async () => {
    await seedTestData();

    const res = await app.request(
      "/api/public/menu/test-restaurant/main",
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300",
    );

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      restaurant: {
        name: "Test Restaurant",
        slug: "test-restaurant",
        description: "A test restaurant",
      },
      menu: {
        name: "Main Menu",
        slug: "main",
      },
      theme: {
        primaryColor: DEFAULT_THEME.primaryColor,
        secondaryColor: DEFAULT_THEME.secondaryColor,
        backgroundColor: DEFAULT_THEME.backgroundColor,
        textColor: DEFAULT_THEME.textColor,
        accentColor: DEFAULT_THEME.accentColor,
        fontFamily: DEFAULT_THEME.fontFamily,
      },
      categories: [
        {
          name: "Starters",
          order: 0,
          items: [
            {
              name: "Soup",
              price: "5.99",
              isAvailable: true,
              isFeatured: false,
              order: 0,
            },
          ],
        },
      ],
    });

    expect(json.data.restaurant).not.toHaveProperty("id");
    expect(json.data.restaurant).not.toHaveProperty("isActive");
    expect(json.data.menu).not.toHaveProperty("id");
    expect(json.data.menu).not.toHaveProperty("isPublished");
    expect(json.data.theme).not.toHaveProperty("id");
    expect(json.data.theme).not.toHaveProperty("restaurantId");
    expect(json.data.categories[0].items[0]).not.toHaveProperty("categoryId");
  });

  it("GET returns 404 for unknown restaurant slug", async () => {
    const res = await app.request("/api/public/menu/unknown/main");

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Not Found" },
    });
  });

  it("GET returns 404 for unknown menu slug", async () => {
    await seedTestData();

    const res = await app.request(
      "/api/public/menu/test-restaurant/unknown",
    );

    expect(res.status).toBe(404);
  });

  it("GET returns 404 when menu is not published", async () => {
    const { menuId } = await seedTestData();

    await prisma.menu.update({
      where: { id: menuId },
      data: { isPublished: false },
    });

    const res = await app.request(
      "/api/public/menu/test-restaurant/main",
    );

    expect(res.status).toBe(404);
  });

  it("GET returns 404 when restaurant is inactive", async () => {
    const { restaurantId } = await seedTestData();

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive: false },
    });

    const res = await app.request(
      "/api/public/menu/test-restaurant/main",
    );

    expect(res.status).toBe(404);
  });

  it("GET excludes unavailable items and empty categories", async () => {
    const { menuId } = await seedTestData();

    const category = await prisma.category.findFirstOrThrow({
      where: { menuId },
    });

    await prisma.menuItem.create({
      data: {
        categoryId: category.id,
        name: "Hidden Dish",
        price: 9.99,
        isAvailable: false,
        order: 1,
      },
    });

    await prisma.category.create({
      data: {
        menuId,
        name: "Empty Category",
        order: 1,
        items: {
          create: {
            name: "Sold Out",
            price: 3.5,
            isAvailable: false,
            order: 0,
          },
        },
      },
    });

    const res = await app.request(
      "/api/public/menu/test-restaurant/main",
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.categories).toHaveLength(1);
    expect(json.data.categories[0].items).toHaveLength(1);
    expect(json.data.categories[0].items[0].name).toBe("Soup");
  });

  it("GET returns categories and items ordered by order field", async () => {
    const { menuId } = await seedTestData();

    await prisma.category.create({
      data: {
        menuId,
        name: "Desserts",
        order: 2,
        items: {
          create: [
            { name: "Cake", price: 4.5, order: 1 },
            { name: "Ice Cream", price: 3.0, order: 0 },
          ],
        },
      },
    });

    const res = await app.request(
      "/api/public/menu/test-restaurant/main",
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.categories.map((c: { name: string }) => c.name)).toEqual([
      "Starters",
      "Desserts",
    ]);

    const desserts = json.data.categories.find(
      (c: { name: string }) => c.name === "Desserts",
    );
    expect(desserts.items.map((i: { name: string }) => i.name)).toEqual([
      "Ice Cream",
      "Cake",
    ]);
  });
});
