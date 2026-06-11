import { prisma } from "./prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function generateUniqueRestaurantSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = slugify(base);
  if (!slug) {
    slug = "restaurant";
  }

  let candidate = slug;
  let counter = 2;

  while (true) {
    const existing = await prisma.restaurant.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    candidate = `${slug}-${counter}`;
    counter += 1;
  }
}
