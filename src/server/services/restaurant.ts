import type { Restaurant, RestaurantRole } from "../../generated/prisma/client";
import { ConflictError, NotFoundError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { generateUniqueRestaurantSlug } from "../lib/slugify";
import { DEFAULT_THEME } from "../lib/theme-defaults";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "../schemas/restaurant";

export type RestaurantDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: RestaurantRole;
};

function toRestaurantDto(
  restaurant: Restaurant,
  role?: RestaurantRole,
): RestaurantDto {
  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    isActive: restaurant.isActive,
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
    ...(role !== undefined ? { role } : {}),
  };
}

export async function listUserRestaurants(
  userId: string,
): Promise<RestaurantDto[]> {
  const memberships = await prisma.userRestaurant.findMany({
    where: { userId },
    include: { restaurant: true },
  });

  return memberships.map((membership) =>
    toRestaurantDto(membership.restaurant, membership.role),
  );
}

export async function createRestaurant(
  userId: string,
  input: CreateRestaurantInput,
): Promise<RestaurantDto> {
  const existingMembership = await prisma.userRestaurant.findFirst({
    where: { userId },
  });

  if (existingMembership) {
    throw new ConflictError("User already belongs to a restaurant");
  }

  const slug = input.slug ?? (await generateUniqueRestaurantSlug(input.name));

  if (input.slug) {
    const slugTaken = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugTaken) {
      throw new ConflictError("Slug already taken");
    }
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
      theme: {
        create: DEFAULT_THEME,
      },
    },
  });

  return toRestaurantDto(restaurant, "OWNER");
}

export async function getRestaurantForMember(
  userId: string,
  restaurantId: string,
): Promise<RestaurantDto> {
  const membership = await prisma.userRestaurant.findUnique({
    where: {
      userId_restaurantId: { userId, restaurantId },
    },
    include: { restaurant: true },
  });

  if (!membership) {
    throw new NotFoundError();
  }

  return toRestaurantDto(membership.restaurant, membership.role);
}

export async function updateRestaurant(
  restaurantId: string,
  input: UpdateRestaurantInput,
): Promise<RestaurantDto> {
  if (input.slug) {
    const slugTaken = await prisma.restaurant.findFirst({
      where: {
        slug: input.slug,
        NOT: { id: restaurantId },
      },
      select: { id: true },
    });

    if (slugTaken) {
      throw new ConflictError("Slug already taken");
    }
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return toRestaurantDto(restaurant, "OWNER");
}

export async function deleteRestaurant(restaurantId: string): Promise<void> {
  await prisma.restaurant.delete({
    where: { id: restaurantId },
  });
}
