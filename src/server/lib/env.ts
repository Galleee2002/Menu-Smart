const DEFAULT_DEV_ORIGIN = "http://localhost:4321";

export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? DEFAULT_DEV_ORIGIN;

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
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
export function getDirectDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL_UNPOOLED;
}
