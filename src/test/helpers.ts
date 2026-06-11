/**
 * Test DB helpers for integration tests.
 * @see docs/BACKEND-IMPLEMENTATION.md §14
 */

import { hashPassword } from "better-auth/crypto";
import { app } from "../server";
import { prisma } from "../server/lib/prisma";
import { DEFAULT_THEME } from "../server/lib/theme-defaults";

export type TestRole = "OWNER" | "STAFF";

const TEST_PASSWORD = "password123";

const ROLE_CREDENTIALS: Record<TestRole, { email: string; name: string }> = {
  OWNER: { email: "owner@test.com", name: "Owner" },
  STAFF: { email: "staff@test.com", name: "Staff" },
};

/** Returns the test database URL (Neon branch or local Postgres). */
export function getTestDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL_TEST or DATABASE_URL is required for integration tests.",
    );
  }

  return url;
}

/** Truncate domain and auth tables for a clean test DB. */
export async function resetTestDb(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "MenuItem",
      "Category",
      "Menu",
      "Theme",
      "UserRestaurant",
      "Restaurant",
      "verification",
      "session",
      "account",
      "user"
    RESTART IDENTITY CASCADE
  `);
}

export type SeedTestDataResult = {
  restaurantId: string;
  menuId: string;
  ownerCookie: string;
  staffCookie: string;
};

/** Seed owner, staff, restaurant, and a published menu. */
export async function seedTestData(): Promise<SeedTestDataResult> {
  await seedAuthUser("owner@test.com", "Owner", TEST_PASSWORD);
  await seedAuthUser("staff@test.com", "Staff", TEST_PASSWORD);

  const owner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@test.com" },
  });
  const staff = await prisma.user.findUniqueOrThrow({
    where: { email: "staff@test.com" },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Test Restaurant",
      slug: "test-restaurant",
      description: "A test restaurant",
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: staff.id, role: "STAFF" },
        ],
      },
      theme: {
        create: DEFAULT_THEME,
      },
      menus: {
        create: {
          name: "Main Menu",
          slug: "main",
          isPublished: true,
          categories: {
            create: {
              name: "Starters",
              order: 0,
              items: {
                create: {
                  name: "Soup",
                  price: 5.99,
                  order: 0,
                },
              },
            },
          },
        },
      },
    },
    include: { menus: true },
  });

  const ownerCookie = await signInWith("owner@test.com");
  const staffCookie = await signInWith("staff@test.com");

  return {
    restaurantId: restaurant.id,
    menuId: restaurant.menus[0]!.id,
    ownerCookie,
    staffCookie,
  };
}

/** Create a credential user directly in the DB (bypasses sign-up rate limits in tests). */
export async function seedAuthUser(
  email: string,
  name: string,
  password: string,
): Promise<void> {
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: false,
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    },
  });
}

function extractSessionCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) {
    throw new Error("Expected Set-Cookie header in auth response");
  }

  return setCookieHeader.split(";")[0] ?? setCookieHeader;
}

/** Sign in with email/password and return the session cookie value. */
export async function signInWith(
  email: string,
  password: string = TEST_PASSWORD,
): Promise<string> {
  const res = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to sign in ${email}: ${res.status} ${body}`);
  }

  return extractSessionCookie(res.headers.get("set-cookie"));
}

/** Sign up (or sign in) via Better Auth and return the session cookie value. */
export async function loginAs(role: TestRole): Promise<string> {
  const { email, name } = ROLE_CREDENTIALS[role];

  const signUpRes = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password: TEST_PASSWORD }),
  });

  if (signUpRes.ok) {
    return extractSessionCookie(signUpRes.headers.get("set-cookie"));
  }

  const signInRes = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });

  if (!signInRes.ok) {
    const body = await signInRes.text();
    throw new Error(`Failed to login as ${role}: ${signInRes.status} ${body}`);
  }

  return extractSessionCookie(signInRes.headers.get("set-cookie"));
}
