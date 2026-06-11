import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../index";
import { prisma } from "../lib/prisma";
import { DEFAULT_THEME } from "../lib/theme-defaults";
import {
  resetTestDb,
  seedAuthUser,
  seedTestData,
} from "../../test/helpers";

describe.sequential("Members API", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  it("GET /api/restaurants/:id/members returns 401 without session", async () => {
    const { restaurantId } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: { message: "Unauthorized" },
    });
  });

  it("GET /api/restaurants/:id/members returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      headers: { Cookie: staffCookie },
    });

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.message).toBe("Forbidden");
  });

  it("GET /api/restaurants/:id/members lists members for owner", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      headers: { Cookie: ownerCookie },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "owner@test.com",
          role: "OWNER",
        }),
        expect.objectContaining({
          email: "staff@test.com",
          role: "STAFF",
        }),
      ]),
    );
    for (const member of json.data) {
      expect(member).toHaveProperty("userId");
      expect(member).toHaveProperty("name");
      expect(member).toHaveProperty("createdAt");
      expect(member).toHaveProperty("updatedAt");
    }
  });

  it("POST invites an existing user as staff", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();
    await seedAuthUser("newstaff@test.com", "New Staff", "password123");

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "newstaff@test.com" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toMatchObject({
      email: "newstaff@test.com",
      name: "New Staff",
      role: "STAFF",
    });
  });

  it("POST returns 404 when user email does not exist", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "missing@test.com" }),
    });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.message).toBe("User not found");
  });

  it("POST returns 409 when user is already a member of this restaurant", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "staff@test.com" }),
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.message).toBe(
      "User is already a member of this restaurant",
    );
  });

  it("POST returns 409 when user already belongs to another restaurant", async () => {
    await seedAuthUser("otherowner@test.com", "Other Owner", "password123");
    const otherOwner = await prisma.user.findUniqueOrThrow({
      where: { email: "otherowner@test.com" },
    });

    await prisma.restaurant.create({
      data: {
        name: "Other Restaurant",
        slug: "other-restaurant",
        members: {
          create: { userId: otherOwner.id, role: "OWNER" },
        },
        theme: { create: DEFAULT_THEME },
      },
    });

    const { restaurantId, ownerCookie } = await seedTestData();

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      method: "POST",
      headers: {
        Cookie: ownerCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "otherowner@test.com" }),
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.message).toBe("User already belongs to a restaurant");
  });

  it("POST returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();
    await seedAuthUser("newstaff@test.com", "New Staff", "password123");

    const res = await app.request(`/api/restaurants/${restaurantId}/members`, {
      method: "POST",
      headers: {
        Cookie: staffCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "newstaff@test.com" }),
    });

    expect(res.status).toBe(403);
  });

  it("PATCH updates staff member role", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();
    const staff = await prisma.user.findUniqueOrThrow({
      where: { email: "staff@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${staff.id}`,
      {
        method: "PATCH",
        headers: {
          Cookie: ownerCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "STAFF" }),
      },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({
      userId: staff.id,
      email: "staff@test.com",
      role: "STAFF",
    });
  });

  it("PATCH returns 400 when trying to change owner role", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: "owner@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${owner.id}`,
      {
        method: "PATCH",
        headers: {
          Cookie: ownerCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "STAFF" }),
      },
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toBe("Cannot change role of restaurant owner");
  });

  it("PATCH returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();
    const staff = await prisma.user.findUniqueOrThrow({
      where: { email: "staff@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${staff.id}`,
      {
        method: "PATCH",
        headers: {
          Cookie: staffCookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "STAFF" }),
      },
    );

    expect(res.status).toBe(403);
  });

  it("DELETE removes staff member", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();
    const staff = await prisma.user.findUniqueOrThrow({
      where: { email: "staff@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${staff.id}`,
      {
        method: "DELETE",
        headers: { Cookie: ownerCookie },
      },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual({ deleted: true });

    const membership = await prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: { userId: staff.id, restaurantId },
      },
    });
    expect(membership).toBeNull();
  });

  it("DELETE returns 400 when trying to remove owner", async () => {
    const { restaurantId, ownerCookie } = await seedTestData();
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: "owner@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${owner.id}`,
      {
        method: "DELETE",
        headers: { Cookie: ownerCookie },
      },
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toBe("Cannot remove restaurant owner");
  });

  it("DELETE returns 403 for staff", async () => {
    const { restaurantId, staffCookie } = await seedTestData();
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: "owner@test.com" },
    });

    const res = await app.request(
      `/api/restaurants/${restaurantId}/members/${owner.id}`,
      {
        method: "DELETE",
        headers: { Cookie: staffCookie },
      },
    );

    expect(res.status).toBe(403);
  });
});
