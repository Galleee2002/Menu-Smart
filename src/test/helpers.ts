/**
 * Test DB helpers — stubs in Fase 0; full implementation in Fase 1.
 * @see docs/BACKEND-IMPLEMENTATION.md §14
 */

export type TestRole = "OWNER" | "STAFF";

/** Returns the test database URL (Neon branch or local Postgres). */
export function getTestDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL_TEST or DATABASE_URL is required for integration tests. See .env.example.",
    );
  }

  return url;
}

/** Truncate tables or migrate a clean test DB. Implemented in Fase 1. */
export async function resetTestDb(): Promise<void> {
  // Fase 1: truncate domain + auth tables in dependency order
}

/** Seed owner, staff, restaurant, and a published menu. Implemented in Fase 1. */
export async function seedTestData(): Promise<void> {
  // Fase 1: prisma seed for integration tests
}

/** Obtain a session cookie for app.request(). Implemented in Fase 1. */
export async function loginAs(_role: TestRole): Promise<string> {
  // Fase 1: sign-in via Better Auth and return cookie header value
  return "";
}
