const DEFAULT_DEV_ORIGIN = "http://localhost:4321";

export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? DEFAULT_DEV_ORIGIN;

  return raw.split(",").flatMap((origin) => {
    const trimmed = origin.trim();
    return trimmed ? [trimmed] : [];
  });
}

/** Neon pooler URL for runtime queries (must include `?sslmode=require` or stronger). */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  return url;
}

/** Direct Neon connection for migrations and Prisma CLI (no pooler). */
function getDirectDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED;
}

/** Better Auth session signing secret (min 32 characters). */
export function getBetterAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required");
  }

  if (secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
  }

  return secret;
}

/** Public base URL of the app (e.g. http://localhost:4321). */
export function getBetterAuthUrl(): string {
  const url = process.env.BETTER_AUTH_URL;

  if (!url) {
    throw new Error("BETTER_AUTH_URL is required");
  }

  return url;
}
